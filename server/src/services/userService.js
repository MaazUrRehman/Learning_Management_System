import crypto from "crypto";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES, ASSIGNABLE_ROLES, USER_STATUS } from "../constants/permissions.js";
import { generateTempPassword, sendCredentialsEmail } from "./authService.js";
import logger from "../config/logger.js";

/**
 * Create a new user (Admin / Faculty / Student / Parent / Accountant).
 * Only Super Admin and Admin can call this. Super Admin role cannot be created via API.
 * Generates a temporary password and sends credentials via email.
 *
 * @param {object} userData - Validated user creation payload.
 * @param {object} createdByUser - The authenticated user performing the action.
 * @returns {Promise<object>} Created user document (without sensitive fields).
 */
export const createUser = async (userData, createdByUser) => {
  const { email, username, role } = userData;

  // Hard block: SUPER_ADMIN cannot be created via API
  if (role === ROLES.SUPER_ADMIN) {
    throw new ApiError(
      403,
      "Super Admin cannot be created via API. Use the seed script."
    );
  }

  // Admin can only create lower-privilege roles (not other Admins — Super Admin only)
  if (
    createdByUser.role === ROLES.ADMIN &&
    role === ROLES.ADMIN
  ) {
    throw new ApiError(
      403,
      "Admins cannot create other Admins. Only Super Admin can create Admins."
    );
  }

  // Check uniqueness
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const field = existingUser.email === email ? "email" : "username";
    throw new ApiError(409, `A user with this ${field} already exists`);
  }

  // Generate temporary password
  const tempPassword = generateTempPassword();

  // Create user with forcePasswordChange = true
  const newUser = await User.create({
    ...userData,
    password: tempPassword,
    forcePasswordChange: true,
    status: USER_STATUS.ACTIVE,
    createdBy: createdByUser._id,
  });

  // Send credentials email
  await sendCredentialsEmail(newUser.email, newUser.username, tempPassword);

  logger.info(
    `User created: ${newUser.email} | Role: ${newUser.role} | By: ${createdByUser.email}`
  );

  // Return user without sensitive fields
  const userResponse = await User.findById(newUser._id).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires"
  );

  return userResponse;
};

/**
 * Fetch paginated list of users with optional role filter.
 * Excludes soft-deleted users automatically (handled by model middleware).
 *
 * @param {object} query - { role, status, page, limit, search }
 * @returns {Promise<object>} { users, totalCount, totalPages, currentPage }
 */
export const getAllUsers = async ({ role, status, page = 1, limit = 10, search }) => {
  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .select("-password -refreshToken -passwordResetToken -passwordResetExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return {
    users,
    totalCount,
    totalPages: Math.ceil(totalCount / Number(limit)),
    currentPage: Number(page),
  };
};

/**
 * Fetch a single user by their ID.
 * @param {string} userId - MongoDB ObjectId string.
 * @returns {Promise<object>} User document.
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

/**
 * Update basic profile fields of a user.
 * Role and password changes are handled by dedicated endpoints.
 *
 * @param {string} userId - Target user ID.
 * @param {object} updateData - Validated update payload.
 * @returns {Promise<object>} Updated user document.
 */
export const updateUser = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("-password -refreshToken -passwordResetToken -passwordResetExpires");

  logger.info(`User updated: ${userId}`);

  return updatedUser;
};

/**
 * Update user account status (ACTIVE | INACTIVE | SUSPENDED).
 * Soft delete is handled by a separate deleteUser function.
 *
 * @param {string} userId - Target user ID.
 * @param {string} newStatus - New status string.
 * @param {object} performedByUser - The authenticated admin user.
 * @returns {Promise<object>} Updated user document.
 */
export const updateUserStatus = async (userId, newStatus, performedByUser) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Super Admin status cannot be changed via API
  if (user.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Super Admin status cannot be managed via API");
  }

  // Admin cannot suspend/deactivate another Admin
  if (
    performedByUser.role === ROLES.ADMIN &&
    user.role === ROLES.ADMIN
  ) {
    throw new ApiError(403, "Admins cannot modify the status of other Admins");
  }

  user.status = newStatus;
  await user.save({ validateBeforeSave: false });

  logger.info(
    `User status updated: ${userId} → ${newStatus} by ${performedByUser.email}`
  );

  return await User.findById(userId).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires"
  );
};

/**
 * Change user role. Only Super Admin can perform this.
 * Cannot upgrade any user to SUPER_ADMIN.
 *
 * @param {string} userId - Target user ID.
 * @param {string} newRole - New role string (must be in ASSIGNABLE_ROLES).
 * @returns {Promise<object>} Updated user document.
 */
export const changeUserRole = async (userId, newRole) => {
  if (!ASSIGNABLE_ROLES.includes(newRole)) {
    throw new ApiError(
      400,
      `Invalid role. Assignable roles are: ${ASSIGNABLE_ROLES.join(", ")}`
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Super Admin role cannot be changed via API");
  }

  user.role = newRole;
  await user.save({ validateBeforeSave: false });

  logger.info(`User role changed: ${userId} → ${newRole}`);

  return await User.findById(userId).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires"
  );
};

/**
 * Admin-initiated password reset: generates a new temp password and emails it.
 * Sets forcePasswordChange = true so user must change on next login.
 *
 * @param {string} userId - Target user ID.
 * @returns {Promise<void>}
 */
export const adminResetUserPassword = async (userId) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Super Admin password cannot be reset via API");
  }

  const tempPassword = generateTempPassword();

  user.password = tempPassword;
  user.forcePasswordChange = true;
  user.refreshToken = undefined; // Invalidate all active sessions
  await user.save();

  await sendCredentialsEmail(user.email, user.username, tempPassword);

  logger.info(`Password reset by admin for user: ${user.email}`);
};

/**
 * Soft delete a user — sets status to DELETED and records who deleted them.
 * Records are never permanently removed.
 *
 * @param {string} userId - Target user ID.
 * @param {object} performedByUser - The authenticated admin user.
 * @returns {Promise<void>}
 */
export const softDeleteUser = async (userId, performedByUser) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(403, "Super Admin cannot be deleted via API");
  }

  if (user._id.toString() === performedByUser._id.toString()) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  user.status = USER_STATUS.DELETED;
  user.deletedAt = new Date();
  user.deletedBy = performedByUser._id;
  user.refreshToken = undefined; // Invalidate sessions immediately
  await user.save({ validateBeforeSave: false });

  logger.info(
    `User soft-deleted: ${userId} by ${performedByUser.email}`
  );
};
