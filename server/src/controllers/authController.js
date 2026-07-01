import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APP_STATUS } from "../constants/statusCodes.js";
import {
  resolveUserByIdentifier,
  generateAccessAndRefreshTokens,
  generatePasswordResetToken,
  sendPasswordResetEmail,
} from "../services/authService.js";
import { USER_STATUS } from "../constants/permissions.js";

// ─── Shared Cookie Configuration ────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

const ACCESS_COOKIE_OPTIONS = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const REFRESH_COOKIE_OPTIONS = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─── Login ───────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/login
 * Accepts identifier (email | username | studentId | employeeId) + password.
 * Enforces forcePasswordChange guard before issuing full tokens.
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  // Resolve user from flexible identifier
  const user = await resolveUserByIdentifier(identifier);

  // Verify password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials — incorrect password");
  }

  // Block suspended / inactive accounts
  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ApiError(403, "Account suspended — contact administrator");
  }
  if (user.status === USER_STATUS.INACTIVE) {
    throw new ApiError(403, "Account is inactive — contact administrator");
  }

  // If user must change password — issue a restricted one-time token only
  if (user.forcePasswordChange) {
    const restrictedToken = user.generateAccessToken(); // short-lived
    return res
      .status(403)
      .cookie("accessToken", restrictedToken, ACCESS_COOKIE_OPTIONS)
      .json({
        success: false,
        status: APP_STATUS.FORCE_PASSWORD_CHANGE,
        message:
          "You must change your temporary password before continuing.",
        data: {
          user: {
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            forcePasswordChange: true,
          },
          accessToken: restrictedToken,
        },
      });
  }

  // Generate full tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "Login successful"
      )
    );
});

// ─── Logout ──────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/logout
 */
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─── Refresh Access Token ─────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/refresh-token
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, `Invalid or expired refresh token: ${err.message}`);
  }

  const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new ApiError(401, "Refresh token is invalid — user not found");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or already used");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS)
    .cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS)
    .json(
      new ApiResponse(200, { accessToken }, "Access token refreshed successfully")
    );
});

// ─── Change Password (First Login & Voluntary) ───────────────────────────────
/**
 * POST /api/v1/auth/change-password
 * Works for both first-login forced change and voluntary password changes.
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify current password
  const isCurrentPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // Prevent reusing same password
  const isSamePassword = await user.isPasswordCorrect(newPassword);
  if (isSamePassword) {
    throw new ApiError(400, "New password cannot be the same as current password");
  }

  user.password = newPassword;
  user.forcePasswordChange = false; // Clear the forced change flag
  await user.save();

  // Issue a fresh session after password update
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "Password changed successfully. You are now logged in."
      )
    );
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/forgot-password
 * Sends a password reset link to the user's registered email.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Respond with success to prevent user enumeration attacks
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If an account with that email exists, a reset link has been sent."
        )
      );
  }

  const rawToken = await generatePasswordResetToken(user);

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "If an account with that email exists, a reset link has been sent."
      )
    );
});

// ─── Reset Password ───────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/reset-password
 * Validates the token from the email link and updates the password.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  // Hash the incoming raw token and compare with DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Password reset token is invalid or has expired");
  }

  user.password = newPassword;
  user.forcePasswordChange = false;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined; // Invalidate all sessions
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password has been reset successfully. Please log in with your new password."
      )
    );
});

// ─── Get Current User ─────────────────────────────────────────────────────────
/**
 * GET /api/v1/auth/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});
