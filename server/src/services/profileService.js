import { User } from "../models/User.js";
import { AdminProfile } from "../models/AdminProfile.js";
import { AccountantProfile } from "../models/AccountantProfile.js";
import { FacultyProfile } from "../models/FacultyProfile.js";
import { ParentProfile } from "../models/ParentProfile.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { ApiError } from "../utils/ApiError.js";
import { generateTempPassword } from "./authService.js";
import { ROLES } from "../constants/permissions.js";
import logger from "../config/logger.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const modelMap = {
  ADMIN: AdminProfile,
  ACCOUNTANT: AccountantProfile,
  FACULTY: FacultyProfile,
  PARENT: ParentProfile,
  STUDENT: StudentProfile,
};

// ─── Generate Credentials ─────────────────────────────────────────────────────
/**
 * Generates a secure temporary password, hashes it, saves to user, returns plain once.
 */
export const generateUserCredentials = async (userId) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === ROLES.SUPER_ADMIN) throw new ApiError(403, "Cannot generate credentials for Super Admin");

  const plainPassword = generateTempPassword();
  user.password = plainPassword; // pre-save hook will hash it
  user.forcePasswordChange = true;
  user.refreshToken = undefined; // invalidate existing sessions
  await user.save();

  logger.info(`Credentials generated for user ${user.email}`);

  return { email: user.email, temporaryPassword: plainPassword };
};

// ─── Generic Profile Helpers ──────────────────────────────────────────────────

const getProfileModel = (role) => {
  const model = modelMap[role?.toUpperCase()];
  if (!model) throw new ApiError(400, `No profile model found for role: ${role}`);
  return model;
};

// ─── Admin Profile ─────────────────────────────────────────────────────────────

export const listAdminProfiles = async () => {
  return await AdminProfile.find()
    .populate("userId", "firstName lastName email username phone status")
    .sort({ createdAt: -1 });
};

export const createAdminProfile = async (data) => {
  const user = await User.findById(data.userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role !== ROLES.ADMIN) throw new ApiError(400, "User must have ADMIN role");

  const existing = await AdminProfile.findOne({ userId: data.userId });
  if (existing) throw new ApiError(409, "Admin profile already exists for this user");

  const empExists = await AdminProfile.findOne({ employeeId: data.employeeId });
  if (empExists) throw new ApiError(409, "Employee ID already in use");

  return await AdminProfile.create(data);
};

export const updateAdminProfile = async (profileId, data) => {
  const profile = await AdminProfile.findById(profileId);
  if (!profile) throw new ApiError(404, "Admin profile not found");
  return await AdminProfile.findByIdAndUpdate(profileId, { $set: data }, { new: true, runValidators: true })
    .populate("userId", "firstName lastName email username phone status");
};

export const deleteAdminProfile = async (profileId) => {
  const profile = await AdminProfile.findById(profileId);
  if (!profile) throw new ApiError(404, "Admin profile not found");
  await AdminProfile.findByIdAndDelete(profileId);
};

// ─── Accountant Profile ────────────────────────────────────────────────────────

export const listAccountantProfiles = async () => {
  return await AccountantProfile.find()
    .populate("userId", "firstName lastName email username phone status")
    .sort({ createdAt: -1 });
};

export const createAccountantProfile = async (data) => {
  const user = await User.findById(data.userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role !== ROLES.ACCOUNTANT) throw new ApiError(400, "User must have ACCOUNTANT role");

  const existing = await AccountantProfile.findOne({ userId: data.userId });
  if (existing) throw new ApiError(409, "Accountant profile already exists for this user");

  const empExists = await AccountantProfile.findOne({ employeeId: data.employeeId });
  if (empExists) throw new ApiError(409, "Employee ID already in use");

  return await AccountantProfile.create(data);
};

export const updateAccountantProfile = async (profileId, data) => {
  const profile = await AccountantProfile.findById(profileId);
  if (!profile) throw new ApiError(404, "Accountant profile not found");
  return await AccountantProfile.findByIdAndUpdate(profileId, { $set: data }, { new: true, runValidators: true })
    .populate("userId", "firstName lastName email username phone status");
};

export const deleteAccountantProfile = async (profileId) => {
  const profile = await AccountantProfile.findById(profileId);
  if (!profile) throw new ApiError(404, "Accountant profile not found");
  await AccountantProfile.findByIdAndDelete(profileId);
};

// ─── Faculty Profile ───────────────────────────────────────────────────────────

export const listFacultyProfiles = async () => {
  return await FacultyProfile.find()
    .populate("userId", "firstName lastName email username phone status")
    .sort({ createdAt: -1 });
};

export const createFacultyProfile = async (data) => {
  const user = await User.findById(data.userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role !== ROLES.FACULTY) throw new ApiError(400, "User must have FACULTY role");

  const existing = await FacultyProfile.findOne({ userId: data.userId });
  if (existing) throw new ApiError(409, "Faculty profile already exists for this user");

  const empExists = await FacultyProfile.findOne({ employeeId: data.employeeId });
  if (empExists) throw new ApiError(409, "Employee ID already in use");

  return await FacultyProfile.create(data);
};

export const updateFacultyProfile = async (profileId, data) => {
  const profile = await FacultyProfile.findById(profileId);
  if (!profile) throw new ApiError(404, "Faculty profile not found");
  return await FacultyProfile.findByIdAndUpdate(profileId, { $set: data }, { new: true, runValidators: true })
    .populate("userId", "firstName lastName email username phone status");
};

export const deleteFacultyProfile = async (profileId) => {
  const profile = await FacultyProfile.findById(profileId);
  if (!profile) throw new ApiError(404, "Faculty profile not found");
  await FacultyProfile.findByIdAndDelete(profileId);
};

// ─── Parent Profile ────────────────────────────────────────────────────────────

export const listParentProfiles = async () => {
  return await ParentProfile.find()
    .populate("userId", "firstName lastName email username phone status")
    .sort({ createdAt: -1 });
};

export const createParentProfile = async (data) => {
  const user = await User.findById(data.userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role !== ROLES.PARENT) throw new ApiError(400, "User must have PARENT role");

  const existing = await ParentProfile.findOne({ userId: data.userId });
  if (existing) throw new ApiError(409, "Parent profile already exists for this user");

  return await ParentProfile.create(data);
};

export const updateParentProfile = async (profileId, data) => {
  const profile = await ParentProfile.findById(profileId);
  if (!profile) throw new ApiError(404, "Parent profile not found");
  return await ParentProfile.findByIdAndUpdate(profileId, { $set: data }, { new: true, runValidators: true })
    .populate("userId", "firstName lastName email username phone status");
};

export const deleteParentProfile = async (profileId) => {
  const profile = await ParentProfile.findById(profileId);
  if (!profile) throw new ApiError(404, "Parent profile not found");
  await ParentProfile.findByIdAndDelete(profileId);
};

// ─── Student Profile ───────────────────────────────────────────────────────────

export const listStudentProfiles = async () => {
  return await StudentProfile.find()
    .populate("userId", "firstName lastName email username phone status")
    .populate("parentId", "firstName lastName email")
    .populate("classId", "name code")
    .populate("sectionId", "name")
    .populate("academicSessionId", "name")
    .sort({ createdAt: -1 });
};

export const createStudentProfile = async (data) => {
  const user = await User.findById(data.userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role !== ROLES.STUDENT) throw new ApiError(400, "User must have STUDENT role");

  const existing = await StudentProfile.findOne({ userId: data.userId });
  if (existing) throw new ApiError(409, "Student profile already exists for this user");

  if (data.studentId) {
    const idExists = await StudentProfile.findOne({ studentId: data.studentId });
    if (idExists) throw new ApiError(409, "Student ID already in use");
  }
  if (data.admissionNumber) {
    const admExists = await StudentProfile.findOne({ admissionNumber: data.admissionNumber });
    if (admExists) throw new ApiError(409, "Admission number already in use");
  }

  return await StudentProfile.create(data);
};

export const updateStudentProfile = async (profileId, data) => {
  const profile = await StudentProfile.findById(profileId);
  if (!profile) throw new ApiError(404, "Student profile not found");
  return await StudentProfile.findByIdAndUpdate(profileId, { $set: data }, { new: true, runValidators: true })
    .populate("userId", "firstName lastName email username phone status")
    .populate("parentId", "firstName lastName email")
    .populate("classId", "name code")
    .populate("sectionId", "name")
    .populate("academicSessionId", "name");
};

export const deleteStudentProfile = async (profileId) => {
  const profile = await StudentProfile.findById(profileId);
  if (!profile) throw new ApiError(404, "Student profile not found");
  await StudentProfile.findByIdAndDelete(profileId);
};

// ─── Get users by role (for dropdowns) ────────────────────────────────────────
export const getUsersByRole = async (role) => {
  return await User.find({ role, status: { $ne: "DELETED" } })
    .select("firstName lastName email username")
    .sort({ firstName: 1 });
};
