import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getDashboardData,
  listUsers,
  getUserById,
  createSuperAdminUser,
  updateSuperAdminUser,
  updateSuperAdminUserStatus,
  changeSuperAdminUserRole,
  resetSuperAdminUserPassword,
  deleteSuperAdminUser,
  listAcademicSessions,
  createAcademicSession,
  updateAcademicSession,
  activateAcademicSession,
  archiveAcademicSession,
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  listSections,
  createSection,
  updateSection,
  deleteSection,
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  assignFacultyToWorkload,
  getSettings,
  updateSettings,
  sendNotification,
  createAnnouncement,
  listChatRoomsForUser,
  createDirectChatRoom,
  listChatMessages,
  sendChatMessage,
  getAuditLogs,
} from "../services/superAdminService.js";
import { getCurrentUser } from "./authController.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const dashboard = await getDashboardData();
  return res.status(200).json(new ApiResponse(200, dashboard, "Dashboard stats fetched successfully"));
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await listUsers(req.query);
  return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

export const getUserDetail = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.userId);
  return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

export const createUserHandler = asyncHandler(async (req, res) => {
  const user = await createSuperAdminUser(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, user, "User created successfully"));
});

export const updateUserHandler = asyncHandler(async (req, res) => {
  const user = await updateSuperAdminUser(req.params.userId, req.body);
  return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

export const updateUserStatusHandler = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const user = await updateSuperAdminUserStatus(req.params.userId, status, req.user);
  return res.status(200).json(new ApiResponse(200, user, `User status updated to ${status}`));
});

export const changeUserRoleHandler = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await changeSuperAdminUserRole(req.params.userId, role);
  return res.status(200).json(new ApiResponse(200, user, `User role changed to ${role}`));
});

export const resetUserPasswordHandler = asyncHandler(async (req, res) => {
  await resetSuperAdminUserPassword(req.params.userId);
  return res.status(200).json(new ApiResponse(200, {}, "User password reset successfully"));
});

export const deleteUserHandler = asyncHandler(async (req, res) => {
  await deleteSuperAdminUser(req.params.userId, req.user);
  return res.status(200).json(new ApiResponse(200, {}, "User soft deleted successfully"));
});

export const getAcademicSessions = asyncHandler(async (req, res) => {
  const sessions = await listAcademicSessions();
  return res.status(200).json(new ApiResponse(200, sessions, "Academic sessions fetched successfully"));
});

export const createAcademicSessionHandler = asyncHandler(async (req, res) => {
  const session = await createAcademicSession(req.body);
  return res.status(201).json(new ApiResponse(201, session, "Academic session created successfully"));
});

export const updateAcademicSessionHandler = asyncHandler(async (req, res) => {
  const session = await updateAcademicSession(req.params.sessionId, req.body);
  return res.status(200).json(new ApiResponse(200, session, "Academic session updated successfully"));
});

export const activateAcademicSessionHandler = asyncHandler(async (req, res) => {
  const session = await activateAcademicSession(req.params.sessionId);
  return res.status(200).json(new ApiResponse(200, session, "Academic session activated successfully"));
});

export const archiveAcademicSessionHandler = asyncHandler(async (req, res) => {
  const session = await archiveAcademicSession(req.params.sessionId);
  return res.status(200).json(new ApiResponse(200, session, "Academic session archived successfully"));
});

export const getClasses = asyncHandler(async (req, res) => {
  const classes = await listClasses();
  return res.status(200).json(new ApiResponse(200, classes, "Classes fetched successfully"));
});

export const createClassHandler = asyncHandler(async (req, res) => {
  const cls = await createClass(req.body);
  return res.status(201).json(new ApiResponse(201, cls, "Class created successfully"));
});

export const updateClassHandler = asyncHandler(async (req, res) => {
  const cls = await updateClass(req.params.classId, req.body);
  return res.status(200).json(new ApiResponse(200, cls, "Class updated successfully"));
});

export const deleteClassHandler = asyncHandler(async (req, res) => {
  await deleteClass(req.params.classId);
  return res.status(200).json(new ApiResponse(200, {}, "Class deleted successfully"));
});

export const getSections = asyncHandler(async (req, res) => {
  const sections = await listSections();
  return res.status(200).json(new ApiResponse(200, sections, "Sections fetched successfully"));
});

export const createSectionHandler = asyncHandler(async (req, res) => {
  const section = await createSection(req.body);
  return res.status(201).json(new ApiResponse(201, section, "Section created successfully"));
});

export const updateSectionHandler = asyncHandler(async (req, res) => {
  const section = await updateSection(req.params.sectionId, req.body);
  return res.status(200).json(new ApiResponse(200, section, "Section updated successfully"));
});

export const deleteSectionHandler = asyncHandler(async (req, res) => {
  await deleteSection(req.params.sectionId);
  return res.status(200).json(new ApiResponse(200, {}, "Section deleted successfully"));
});

export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await listSubjects(req.query.classId);
  return res.status(200).json(new ApiResponse(200, subjects, "Subjects fetched successfully"));
});

export const createSubjectHandler = asyncHandler(async (req, res) => {
  const subject = await createSubject(req.body);
  return res.status(201).json(new ApiResponse(201, subject, "Subject created successfully"));
});

export const updateSubjectHandler = asyncHandler(async (req, res) => {
  const subject = await updateSubject(req.params.subjectId, req.body);
  return res.status(200).json(new ApiResponse(200, subject, "Subject updated successfully"));
});

export const deleteSubjectHandler = asyncHandler(async (req, res) => {
  await deleteSubject(req.params.subjectId);
  return res.status(200).json(new ApiResponse(200, {}, "Subject deleted successfully"));
});

export const assignFacultyHandler = asyncHandler(async (req, res) => {
  const assignment = await assignFacultyToWorkload(req.body);
  return res.status(200).json(new ApiResponse(200, assignment, "Faculty assignment processed successfully"));
});

export const getSettingsHandler = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  return res.status(200).json(new ApiResponse(200, settings, "Settings fetched successfully"));
});

export const updateSettingsHandler = asyncHandler(async (req, res) => {
  const settings = await updateSettings(req.body);
  return res.status(200).json(new ApiResponse(200, settings, "Settings updated successfully"));
});

export const sendNotificationHandler = asyncHandler(async (req, res) => {
  const notification = await sendNotification(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, notification, "Notification sent successfully"));
});

export const createAnnouncementHandler = asyncHandler(async (req, res) => {
  const announcement = await createAnnouncement(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, announcement, "Announcement created successfully"));
});

export const getChatRoomsHandler = asyncHandler(async (req, res) => {
  const rooms = await listChatRoomsForUser(req.user._id);
  return res.status(200).json(new ApiResponse(200, rooms, "Chat rooms fetched successfully"));
});

export const createChatRoomHandler = asyncHandler(async (req, res) => {
  const room = await createDirectChatRoom(req.user._id, req.body.participantId);
  return res.status(201).json(new ApiResponse(201, room, "Chat room created successfully"));
});

export const getChatMessagesHandler = asyncHandler(async (req, res) => {
  const messages = await listChatMessages(req.params.roomId);
  return res.status(200).json(new ApiResponse(200, messages, "Chat messages fetched successfully"));
});

export const sendMessageHandler = asyncHandler(async (req, res) => {
  const message = await sendChatMessage(req.params.roomId, req.user._id, req.body.messageText, req.body.attachments || []);
  return res.status(201).json(new ApiResponse(201, message, "Message sent successfully"));
});

export const getAuditLogsHandler = asyncHandler(async (req, res) => {
  const logs = await getAuditLogs(req.query);
  return res.status(200).json(new ApiResponse(200, logs, "Audit logs fetched successfully"));
});

export const getProfileHandler = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Profile fetched successfully"));
});

export const updateProfileHandler = asyncHandler(async (req, res) => {
  const user = await updateSuperAdminUser(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});
