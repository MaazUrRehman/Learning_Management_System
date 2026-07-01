import { User } from "../models/User.js";
import { AcademicSession } from "../models/AcademicSession.js";
import { Class } from "../models/Class.js";
import { Section } from "../models/Section.js";
import { Subject } from "../models/Subject.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { FacultyProfile } from "../models/FacultyProfile.js";
import { ParentProfile } from "../models/ParentProfile.js";
import { AccountantProfile } from "../models/AccountantProfile.js";
import { ChatRoom } from "../models/ChatRoom.js";
import { Message } from "../models/Message.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES, USER_STATUS, ASSIGNABLE_ROLES } from "../constants/permissions.js";
import { generateTempPassword, sendCredentialsEmail } from "./authService.js";
import logger from "../config/logger.js";

export const getDashboardData = async () => {
  const [totalUsers, totalStudents, totalParents, totalFaculty, totalAccountants, totalClasses, totalSubjects, totalSessions] = await Promise.all([
    User.countDocuments({ status: { $ne: USER_STATUS.DELETED } }),
    StudentProfile.countDocuments(),
    ParentProfile.countDocuments(),
    FacultyProfile.countDocuments(),
    AccountantProfile.countDocuments(),
    Class.countDocuments(),
    Subject.countDocuments(),
    AcademicSession.countDocuments(),
  ]);

  const latestUser = await User.findOne({ status: { $ne: USER_STATUS.DELETED } })
    .sort({ createdAt: -1 })
    .select("firstName lastName email role createdAt");

  const latestLogin = await User.findOne({ status: { $ne: USER_STATUS.DELETED } })
    .sort({ updatedAt: -1 })
    .select("firstName lastName email role updatedAt");

  const latestStudent = await StudentProfile.findOne().sort({ createdAt: -1 }).populate("userId", "firstName lastName email");

  return {
    totalUsers,
    totalStudents,
    totalParents,
    totalFaculty,
    totalAccountants,
    totalClasses,
    totalSubjects,
    totalActiveSessions: totalSessions,
    recentActivity: {
      latestUser,
      latestLogin,
      latestStudent,
    },
  };
};

export const listUsers = async (query) => {
  const filter = { status: { $ne: USER_STATUS.DELETED } };
  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { firstName: { $regex: query.search, $options: "i" } },
      { lastName: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
      { username: { $regex: query.search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("firstName lastName email username role status createdAt updatedAt phone address")
    .sort({ createdAt: -1 });

  return users;
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -refreshToken -passwordResetToken -passwordResetExpires")
    .lean();

  if (!user) throw new ApiError(404, "User not found");

  let profile = null;
  if (user.role === ROLES.STUDENT) {
    profile = await StudentProfile.findOne({ userId: user._id })
      .populate("classId sectionId academicSessionId parentId", "name code firstName lastName email")
      .lean();
  } else if (user.role === ROLES.FACULTY) {
    profile = await FacultyProfile.findOne({ userId: user._id }).populate("subjectsTaught", "name code").lean();
  } else if (user.role === ROLES.PARENT) {
    profile = await ParentProfile.findOne({ userId: user._id }).populate("children", "firstName lastName email").lean();
  } else if (user.role === ROLES.ACCOUNTANT) {
    profile = await AccountantProfile.findOne({ userId: user._id }).lean();
  }

  return { ...user, profile };
};

const assertAssignableRole = (role) => {
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new ApiError(400, `Invalid role assignment. Allowed roles: ${ASSIGNABLE_ROLES.join(", ")}`);
  }
};

export const createSuperAdminUser = async (data, createdBy) => {
  if (data.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Super Admin cannot be created via API.");
  }

  assertAssignableRole(data.role);

  const existing = await User.findOne({ $or: [{ email: data.email }, { username: data.username }] });
  if (existing) {
    const duplicate = existing.email === data.email ? "email" : "username";
    throw new ApiError(409, `A user with this ${duplicate} already exists.`);
  }

  const tempPassword = data.password || generateTempPassword();

  const createdUser = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email.toLowerCase(),
    username: data.username.toLowerCase(),
    password: tempPassword,
    role: data.role,
    phone: data.phone || null,
    status: data.status || USER_STATUS.ACTIVE,
    address: data.address || {},
    forcePasswordChange: true,
    createdBy: createdBy._id,
  });

  // Profiles are now created via their dedicated profile endpoints


  await sendCredentialsEmail(createdUser.email, createdUser.username, tempPassword);

  logger.info(`Super Admin created user ${createdUser.email} (${createdUser.role})`);

  return getUserById(createdUser._id);
};

export const updateSuperAdminUser = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Super Admin user update is managed through protected profile routes.");
  }

  if (data.email) data.email = data.email.toLowerCase();
  if (data.username) data.username = data.username.toLowerCase();

  const updated = await User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true })
    .select("-password -refreshToken -passwordResetToken -passwordResetExpires");

  logger.info(`Super Admin updated user ${userId}`);
  return updated;
};

export const updateSuperAdminUserStatus = async (userId, status, performedBy) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === ROLES.SUPER_ADMIN) throw new ApiError(403, "Super Admin status cannot be modified.");

  user.status = status;
  await user.save({ validateBeforeSave: false });

  logger.info(`Super Admin set status ${status} for user ${userId}`);
  return await getUserById(userId);
};

export const changeSuperAdminUserRole = async (userId, role) => {
  assertAssignableRole(role);

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === ROLES.SUPER_ADMIN) throw new ApiError(403, "Cannot change Super Admin role.");

  user.role = role;
  await user.save({ validateBeforeSave: false });

  logger.info(`Super Admin changed role of user ${userId} to ${role}`);
  return await getUserById(userId);
};

export const resetSuperAdminUserPassword = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === ROLES.SUPER_ADMIN) throw new ApiError(403, "Cannot reset Super Admin password via API.");

  const tempPassword = generateTempPassword();
  user.password = tempPassword;
  user.forcePasswordChange = true;
  user.refreshToken = undefined;
  await user.save();

  await sendCredentialsEmail(user.email, user.username, tempPassword);
  logger.info(`Super Admin reset password for ${user.email}`);
};

export const deleteSuperAdminUser = async (userId, performedBy) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === ROLES.SUPER_ADMIN) throw new ApiError(403, "Cannot delete Super Admin.");
  if (user._id.equals(performedBy._id)) throw new ApiError(400, "You cannot delete your own account.");

  user.status = USER_STATUS.DELETED;
  user.deletedAt = new Date();
  user.deletedBy = performedBy._id;
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  logger.info(`Super Admin soft deleted user ${user._id}`);
};

export const listAcademicSessions = async () => {
  return await AcademicSession.find().sort({ startDate: -1 });
};

export const createAcademicSession = async (data) => {
  const existing = await AcademicSession.findOne({ name: data.name });
  if (existing) throw new ApiError(409, "Academic session with this name already exists.");

  if (data.isCurrent) {
    await AcademicSession.updateMany({ isCurrent: true }, { isCurrent: false });
  }

  return await AcademicSession.create(data);
};

export const updateAcademicSession = async (sessionId, data) => {
  const session = await AcademicSession.findById(sessionId);
  if (!session) throw new ApiError(404, "Academic session not found.");

  if (data.isCurrent && !session.isCurrent) {
    await AcademicSession.updateMany({ isCurrent: true }, { isCurrent: false });
  }

  return await AcademicSession.findByIdAndUpdate(sessionId, { $set: data }, { new: true, runValidators: true });
};

export const activateAcademicSession = async (sessionId) => {
  await AcademicSession.updateMany({ isCurrent: true }, { isCurrent: false });
  const session = await AcademicSession.findByIdAndUpdate(sessionId, { isCurrent: true }, { new: true });
  if (!session) throw new ApiError(404, "Academic session not found.");
  return session;
};

export const archiveAcademicSession = async (sessionId) => {
  const session = await AcademicSession.findById(sessionId);
  if (!session) throw new ApiError(404, "Academic session not found.");
  session.isCurrent = false;
  await session.save({ validateBeforeSave: false });
  return session;
};

export const listClasses = async () => {
  return await Class.find().sort({ name: 1 });
};

export const createClass = async (data) => {
  const existing = await Class.findOne({ $or: [{ name: data.name }, { code: data.code.toUpperCase() }] });
  if (existing) throw new ApiError(409, "Class with this name or code already exists.");
  data.code = data.code.toUpperCase();
  return await Class.create(data);
};

export const updateClass = async (classId, data) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new ApiError(404, "Class not found.");
  if (data.code) data.code = data.code.toUpperCase();
  return await Class.findByIdAndUpdate(classId, { $set: data }, { new: true, runValidators: true });
};

export const deleteClass = async (classId) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new ApiError(404, "Class not found.");
  const sectionCount = await Section.countDocuments({ classId });
  if (sectionCount > 0) throw new ApiError(400, "Cannot delete class while it has sections.");
  await Class.findByIdAndDelete(classId);
};

export const listSections = async () => {
  return await Section.find().populate("classId", "name code").sort({ name: 1 });
};

export const createSection = async (data) => {
  const existing = await Section.findOne({ name: data.name, classId: data.classId });
  if (existing) throw new ApiError(409, "Section already exists for this class.");
  return await Section.create(data);
};

export const updateSection = async (sectionId, data) => {
  const section = await Section.findById(sectionId);
  if (!section) throw new ApiError(404, "Section not found.");
  return await Section.findByIdAndUpdate(sectionId, { $set: data }, { new: true, runValidators: true });
};

export const deleteSection = async (sectionId) => {
  const section = await Section.findById(sectionId);
  if (!section) throw new ApiError(404, "Section not found.");
  await Section.findByIdAndDelete(sectionId);
};

export const listSubjects = async (classId) => {
  const filter = classId ? { classId } : {};
  return await Subject.find(filter).populate("classId", "name code").sort({ name: 1 });
};

export const createSubject = async (data) => {
  const existing = await Subject.findOne({ code: data.code.toUpperCase(), classId: data.classId });
  if (existing) throw new ApiError(409, "Subject code already exists for this class.");
  data.code = data.code.toUpperCase();
  return await Subject.create(data);
};

export const updateSubject = async (subjectId, data) => {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw new ApiError(404, "Subject not found.");
  if (data.code) data.code = data.code.toUpperCase();
  return await Subject.findByIdAndUpdate(subjectId, { $set: data }, { new: true, runValidators: true });
};

export const deleteSubject = async (subjectId) => {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw new ApiError(404, "Subject not found.");
  await Subject.findByIdAndDelete(subjectId);
};

export const assignFacultyToWorkload = async (data) => {
  if (!data.facultyId || !data.subjectIds || !Array.isArray(data.subjectIds)) {
    throw new ApiError(400, "facultyId and subjectIds are required.");
  }

  const faculty = await FacultyProfile.findOne({ userId: data.facultyId });
  if (!faculty) throw new ApiError(404, "Faculty profile not found.");

  faculty.subjectsTaught = data.subjectIds;
  await faculty.save({ validateBeforeSave: false });

  return faculty;
};

const settingsSelector = { academyName: 1, academyLogo: 1, address: 1, contactInfo: 1, passwordPolicy: 1, sessionTimeout: 1, loginAttempts: 1, theme: 1, colors: 1, logo: 1 };

export const getSettings = async () => {
  const settings = await User.findOne({ role: ROLES.SUPER_ADMIN }).select(settingsSelector).lean();
  return settings || {};
};

export const updateSettings = async (data) => {
  const updated = await User.findOneAndUpdate({ role: ROLES.SUPER_ADMIN }, { $set: data }, { new: true, runValidators: true }).select(settingsSelector);
  return updated;
};

export const sendNotification = async (data, sender) => {
  const Notification = (await import("../models/Notification.js")).Notification;
  const recipients = data.recipients && data.recipients.length ? data.recipients : await User.find({ status: { $ne: USER_STATUS.DELETED } }).select("_id");
  const recipientIds = Array.isArray(recipients) ? recipients.map((u) => u._id || u) : recipients;

  const notification = await Notification.create({
    recipients: recipientIds,
    title: data.title,
    message: data.message,
    type: data.type || "GENERAL",
  });

  logger.info(`Notification sent by ${sender.email}`);
  return notification;
};

export const createAnnouncement = async (data, sender) => {
  const Announcement = (await import("../models/Announcement.js")).Announcement;
  const announcement = await Announcement.create({
    title: data.title,
    message: data.message,
    targetRoles: data.targetRoles,
    expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    createdBy: sender._id,
  });

  logger.info(`Announcement created by ${sender.email}`);
  return announcement;
};

export const listChatRoomsForUser = async (userId) => {
  const rooms = await ChatRoom.find({ participants: userId })
    .populate("participants", "firstName lastName email role")
    .sort({ updatedAt: -1 })
    .lean();

  return rooms;
};

export const createDirectChatRoom = async (currentUserId, participantId) => {
  if (!participantId) {
    throw new ApiError(400, "Participant ID is required to create a chat room.");
  }

  const participantIds = [String(currentUserId), String(participantId)].sort();
  let room = await ChatRoom.findOne({
    type: "DIRECT",
    participants: { $all: participantIds, $size: 2 },
  });

  if (!room) {
    room = await ChatRoom.create({
      type: "DIRECT",
      participants: participantIds,
    });
  }

  return await room.populate("participants", "firstName lastName email role");
};

export const listChatMessages = async (roomId) => {
  const room = await ChatRoom.findById(roomId);
  if (!room) throw new ApiError(404, "Chat room not found.");

  const messages = await Message.find({ chatRoomId: roomId })
    .populate("senderId", "firstName lastName email role")
    .sort({ createdAt: 1 })
    .lean();

  return messages;
};

export const sendChatMessage = async (roomId, senderId, messageText, attachments = []) => {
  if (!messageText?.trim()) {
    throw new ApiError(400, "Message text is required.");
  }

  const room = await ChatRoom.findById(roomId);
  if (!room) throw new ApiError(404, "Chat room not found.");
  if (!room.participants.some((participant) => String(participant) === String(senderId))) {
    throw new ApiError(403, "You are not a participant in this chat room.");
  }

  const message = await Message.create({
    chatRoomId: room._id,
    senderId,
    messageText: messageText.trim(),
    attachments,
  });

  await ChatRoom.findByIdAndUpdate(roomId, { updatedAt: new Date() });

  return await message.populate("senderId", "firstName lastName email role");
};

export const getAuditLogs = async (query) => {
  const AuditLog = (await import("../models/AuditLog.js")).AuditLog;
  const filter = {};
  if (query.userId) filter.userId = query.userId;
  if (query.action) filter.action = query.action;
  if (query.startDate) filter.createdAt = { $gte: new Date(query.startDate) };
  if (query.endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(query.endDate) };

  return await AuditLog.find(filter).populate("userId", "firstName lastName email").sort({ createdAt: -1 }).limit(100);
};
