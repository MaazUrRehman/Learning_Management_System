import crypto from "crypto";
import { User } from "../models/User.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { FacultyProfile } from "../models/FacultyProfile.js";
import { AccountantProfile } from "../models/AccountantProfile.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../config/logger.js";

/**
 * Generate a cryptographically secure temporary password.
 * Format: 3 uppercase + 3 lowercase + 2 digits + 2 special = 10 chars
 * @returns {string} plaintext temporary password
 */
export const generateTempPassword = () => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "@$!%*?&";

  const getRandom = (charset) =>
    charset[crypto.randomInt(0, charset.length)];

  const password = [
    getRandom(uppercase),
    getRandom(uppercase),
    getRandom(uppercase),
    getRandom(lowercase),
    getRandom(lowercase),
    getRandom(lowercase),
    getRandom(digits),
    getRandom(digits),
    getRandom(special),
    getRandom(special),
  ];

  // Shuffle the array to avoid predictable patterns
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
};

/**
 * Resolve user from a flexible identifier (email | username | studentId | employeeId).
 * Returns the User document or throws ApiError if not found.
 * @param {string} identifier - The login credential string.
 * @returns {Promise<import('../models/User.js').User>}
 */
export const resolveUserByIdentifier = async (identifier) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

  // 1. Try email match
  if (isEmail) {
    const user = await User.findOne({ email: identifier.toLowerCase() }).select("+password +refreshToken +forcePasswordChange");
    if (user) return user;
    throw new ApiError(404, "No account found with that email address");
  }

  // 2. Try username match
  const byUsername = await User.findOne({ username: identifier.toLowerCase() }).select("+password +refreshToken +forcePasswordChange");
  if (byUsername) return byUsername;

  // 3. Try Student admission number (Student ID)
  const studentProfile = await StudentProfile.findOne({ admissionNumber: identifier });
  if (studentProfile) {
    const user = await User.findById(studentProfile.userId).select("+password +refreshToken +forcePasswordChange");
    if (user) return user;
  }

  // 4. Try Faculty employeeId
  const facultyProfile = await FacultyProfile.findOne({ employeeId: identifier });
  if (facultyProfile) {
    const user = await User.findById(facultyProfile.userId).select("+password +refreshToken +forcePasswordChange");
    if (user) return user;
  }

  // 5. Try Accountant employeeId
  const accountantProfile = await AccountantProfile.findOne({ employeeId: identifier });
  if (accountantProfile) {
    const user = await User.findById(accountantProfile.userId).select("+password +refreshToken +forcePasswordChange");
    if (user) return user;
  }

  throw new ApiError(404, "No account found with the provided credentials");
};

/**
 * Generate Access and Refresh tokens and persist Refresh token in DB.
 * @param {string} userId - MongoDB user document ID.
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found for token generation");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/**
 * Generate a secure password reset token (SHA-256 hashed), store it and expiry on the user.
 * @param {object} user - The Mongoose user document.
 * @returns {string} Raw unhashed token to be sent via email.
 */
export const generatePasswordResetToken = async (user) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save({ validateBeforeSave: false });

  logger.debug(`Password reset token generated for user: ${user.email}`);

  return rawToken;
};

/**
 * Send user credentials via a simulated email log (extend with actual SMTP transporter).
 * In production, replace logger.info with nodemailer send call.
 * @param {string} email - Recipient email address.
 * @param {string} username - The generated username.
 * @param {string} tempPassword - The generated plaintext temporary password.
 */
export const sendCredentialsEmail = async (email, username, tempPassword) => {
  // TODO: Replace with actual SMTP/Nodemailer send in production
  logger.info(
    `[EMAIL CREDENTIALS] To: ${email} | Username: ${username} | Temp Password: ${tempPassword}`
  );
};

/**
 * Send a password reset link via email (extend with actual SMTP transporter).
 * @param {string} email - Recipient email address.
 * @param {string} resetUrl - Full reset URL with token.
 */
export const sendPasswordResetEmail = async (email, resetUrl) => {
  // TODO: Replace with actual SMTP/Nodemailer send in production
  logger.info(`[EMAIL RESET] To: ${email} | Reset URL: ${resetUrl}`);
};
