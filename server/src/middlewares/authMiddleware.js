import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { ROLE_PERMISSIONS, USER_STATUS } from "../constants/permissions.js";
import { APP_STATUS } from "../constants/statusCodes.js";

/**
 * Middleware: Verify JWT access token from cookie or Authorization header.
 * Attaches the resolved user to req.user.
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "").trim();

  if (!token) {
    throw new ApiError(401, "Unauthorized — Access token is missing");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(401, `Invalid or expired access token: ${err.message}`);
  }

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken -passwordResetToken -passwordResetExpires"
  );

  if (!user) {
    throw new ApiError(401, "Invalid access token — User no longer exists");
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ApiError(403, "Account suspended — Contact administrator");
  }

  if (user.status === USER_STATUS.INACTIVE) {
    throw new ApiError(403, "Account is inactive — Contact administrator");
  }

  req.user = user;
  next();
});

/**
 * Middleware: Role-based authorization guard.
 * @param {...string} roles - Allowed role strings.
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized — User not resolved"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied — Role '${req.user.role}' is not permitted for this resource`
        )
      );
    }

    next();
  };
};

/**
 * Middleware: Permission-based authorization guard using the RBAC permission matrix.
 * Allows fine-grained permission checks beyond just role names.
 * @param {string} permission - The specific permission key to check.
 */
export const authorizePermissions = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized — User not resolved"));
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];

    if (!userPermissions.includes(permission)) {
      return next(
        new ApiError(
          403,
          `Forbidden — You do not have the '${permission}' permission`
        )
      );
    }

    next();
  };
};

/**
 * Middleware: Force Password Change guard.
 * Blocks access to all protected routes if the user has not
 * changed their temporary password from first login.
 *
 * Excluded routes: /auth/change-password, /auth/logout
 */
export const enforcePaswordChangePolicy = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized — User not resolved"));
  }

  if (req.user.forcePasswordChange === true) {
    return res.status(403).json({
      success: false,
      status: APP_STATUS.FORCE_PASSWORD_CHANGE,
      message:
        "You must change your temporary password before accessing the system.",
    });
  }

  next();
};
