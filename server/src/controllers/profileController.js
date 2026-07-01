import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  generateUserCredentials,
  getUsersByRole,
  listAdminProfiles,
  createAdminProfile,
  updateAdminProfile,
  deleteAdminProfile,
  listAccountantProfiles,
  createAccountantProfile,
  updateAccountantProfile,
  deleteAccountantProfile,
  listFacultyProfiles,
  createFacultyProfile,
  updateFacultyProfile,
  deleteFacultyProfile,
  listParentProfiles,
  createParentProfile,
  updateParentProfile,
  deleteParentProfile,
  listStudentProfiles,
  createStudentProfile,
  updateStudentProfile,
  deleteStudentProfile,
} from "../services/profileService.js";

// ─── Generate Credentials ─────────────────────────────────────────────────────
export const generateCredentialsHandler = asyncHandler(async (req, res) => {
  const result = await generateUserCredentials(req.params.userId);
  return res.status(200).json(new ApiResponse(200, result, "Credentials generated successfully"));
});

// ─── Users by role (dropdown) ─────────────────────────────────────────────────
export const getUsersByRoleHandler = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const users = await getUsersByRole(role.toUpperCase());
  return res.status(200).json(new ApiResponse(200, users, `${role} users fetched`));
});

// ─── Admin Profiles ───────────────────────────────────────────────────────────
export const getAdminProfilesHandler = asyncHandler(async (req, res) => {
  const profiles = await listAdminProfiles();
  return res.status(200).json(new ApiResponse(200, profiles, "Admin profiles fetched"));
});

export const createAdminProfileHandler = asyncHandler(async (req, res) => {
  const profile = await createAdminProfile(req.body);
  return res.status(201).json(new ApiResponse(201, profile, "Admin profile created"));
});

export const updateAdminProfileHandler = asyncHandler(async (req, res) => {
  const profile = await updateAdminProfile(req.params.profileId, req.body);
  return res.status(200).json(new ApiResponse(200, profile, "Admin profile updated"));
});

export const deleteAdminProfileHandler = asyncHandler(async (req, res) => {
  await deleteAdminProfile(req.params.profileId);
  return res.status(200).json(new ApiResponse(200, {}, "Admin profile deleted"));
});

// ─── Accountant Profiles ──────────────────────────────────────────────────────
export const getAccountantProfilesHandler = asyncHandler(async (req, res) => {
  const profiles = await listAccountantProfiles();
  return res.status(200).json(new ApiResponse(200, profiles, "Accountant profiles fetched"));
});

export const createAccountantProfileHandler = asyncHandler(async (req, res) => {
  const profile = await createAccountantProfile(req.body);
  return res.status(201).json(new ApiResponse(201, profile, "Accountant profile created"));
});

export const updateAccountantProfileHandler = asyncHandler(async (req, res) => {
  const profile = await updateAccountantProfile(req.params.profileId, req.body);
  return res.status(200).json(new ApiResponse(200, profile, "Accountant profile updated"));
});

export const deleteAccountantProfileHandler = asyncHandler(async (req, res) => {
  await deleteAccountantProfile(req.params.profileId);
  return res.status(200).json(new ApiResponse(200, {}, "Accountant profile deleted"));
});

// ─── Faculty Profiles ─────────────────────────────────────────────────────────
export const getFacultyProfilesHandler = asyncHandler(async (req, res) => {
  const profiles = await listFacultyProfiles();
  return res.status(200).json(new ApiResponse(200, profiles, "Faculty profiles fetched"));
});

export const createFacultyProfileHandler = asyncHandler(async (req, res) => {
  const profile = await createFacultyProfile(req.body);
  return res.status(201).json(new ApiResponse(201, profile, "Faculty profile created"));
});

export const updateFacultyProfileHandler = asyncHandler(async (req, res) => {
  const profile = await updateFacultyProfile(req.params.profileId, req.body);
  return res.status(200).json(new ApiResponse(200, profile, "Faculty profile updated"));
});

export const deleteFacultyProfileHandler = asyncHandler(async (req, res) => {
  await deleteFacultyProfile(req.params.profileId);
  return res.status(200).json(new ApiResponse(200, {}, "Faculty profile deleted"));
});

// ─── Parent Profiles ──────────────────────────────────────────────────────────
export const getParentProfilesHandler = asyncHandler(async (req, res) => {
  const profiles = await listParentProfiles();
  return res.status(200).json(new ApiResponse(200, profiles, "Parent profiles fetched"));
});

export const createParentProfileHandler = asyncHandler(async (req, res) => {
  const profile = await createParentProfile(req.body);
  return res.status(201).json(new ApiResponse(201, profile, "Parent profile created"));
});

export const updateParentProfileHandler = asyncHandler(async (req, res) => {
  const profile = await updateParentProfile(req.params.profileId, req.body);
  return res.status(200).json(new ApiResponse(200, profile, "Parent profile updated"));
});

export const deleteParentProfileHandler = asyncHandler(async (req, res) => {
  await deleteParentProfile(req.params.profileId);
  return res.status(200).json(new ApiResponse(200, {}, "Parent profile deleted"));
});

// ─── Student Profiles ─────────────────────────────────────────────────────────
export const getStudentProfilesHandler = asyncHandler(async (req, res) => {
  const profiles = await listStudentProfiles();
  return res.status(200).json(new ApiResponse(200, profiles, "Student profiles fetched"));
});

export const createStudentProfileHandler = asyncHandler(async (req, res) => {
  const profile = await createStudentProfile(req.body);
  return res.status(201).json(new ApiResponse(201, profile, "Student profile created"));
});

export const updateStudentProfileHandler = asyncHandler(async (req, res) => {
  const profile = await updateStudentProfile(req.params.profileId, req.body);
  return res.status(200).json(new ApiResponse(200, profile, "Student profile updated"));
});

export const deleteStudentProfileHandler = asyncHandler(async (req, res) => {
  await deleteStudentProfile(req.params.profileId);
  return res.status(200).json(new ApiResponse(200, {}, "Student profile deleted"));
});
