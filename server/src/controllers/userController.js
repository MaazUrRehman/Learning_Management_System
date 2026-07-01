import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  changeUserRole,
  adminResetUserPassword,
  softDeleteUser,
} from "../services/userService.js";

// ─── Create User ──────────────────────────────────────────────────────────────
/**
 * POST /api/v1/users
 * Super Admin / Admin only. Generates temp credentials and emails the new user.
 */
export const createUserHandler = asyncHandler(async (req, res) => {
  const newUser = await createUser(req.body, req.user);

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User created successfully. Credentials sent via email."));
});

// ─── Get All Users ────────────────────────────────────────────────────────────
/**
 * GET /api/v1/users
 * Supports query params: role, status, page, limit, search
 */
export const getAllUsersHandler = asyncHandler(async (req, res) => {
  const { role, status, page, limit, search } = req.query;

  const result = await getAllUsers({ role, status, page, limit, search });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Users fetched successfully"));
});

// ─── Get Single User ──────────────────────────────────────────────────────────
/**
 * GET /api/v1/users/:userId
 */
export const getUserByIdHandler = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.userId);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

// ─── Update User Profile ──────────────────────────────────────────────────────
/**
 * PATCH /api/v1/users/:userId
 */
export const updateUserHandler = asyncHandler(async (req, res) => {
  const updatedUser = await updateUser(req.params.userId, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

// ─── Update User Status ───────────────────────────────────────────────────────
/**
 * PATCH /api/v1/users/:userId/status
 */
export const updateUserStatusHandler = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const updatedUser = await updateUserStatus(req.params.userId, status, req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, `User status updated to ${status}`));
});

// ─── Change User Role ─────────────────────────────────────────────────────────
/**
 * PATCH /api/v1/users/:userId/role
 * Super Admin only.
 */
export const changeUserRoleHandler = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const updatedUser = await changeUserRole(req.params.userId, role);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, `User role changed to ${role}`));
});

// ─── Admin Reset User Password ────────────────────────────────────────────────
/**
 * POST /api/v1/users/:userId/reset-password
 * Generates a new temp password and forces password change on next login.
 */
export const adminResetUserPasswordHandler = asyncHandler(async (req, res) => {
  await adminResetUserPassword(req.params.userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset successfully. New temporary credentials sent to user's email."
      )
    );
});

// ─── Soft Delete User ─────────────────────────────────────────────────────────
/**
 * DELETE /api/v1/users/:userId
 * Soft delete only — marks user as DELETED, never removes from DB.
 */
export const deleteUserHandler = asyncHandler(async (req, res) => {
  await softDeleteUser(req.params.userId, req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User has been deactivated successfully"));
});
