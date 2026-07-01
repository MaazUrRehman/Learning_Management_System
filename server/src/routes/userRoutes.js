import { Router } from "express";
import {
  createUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  updateUserStatusHandler,
  changeUserRoleHandler,
  adminResetUserPasswordHandler,
  deleteUserHandler,
} from "../controllers/userController.js";
import {
  verifyJWT,
  authorizeRoles,
  enforcePaswordChangePolicy,
} from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  changeUserRoleSchema,
} from "../utils/validationSchemas.js";
import { ROLES } from "../constants/permissions.js";

const router = Router();

// All user management routes require authentication and a resolved password
router.use(verifyJWT, enforcePaswordChangePolicy);

// ─── Create User ──────────────────────────────────────────────────────────────
// Super Admin can create any role. Admin can create: ACCOUNTANT, FACULTY, PARENT, STUDENT.
router.post(
  "/",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(createUserSchema),
  createUserHandler
);

// ─── Get All Users (Paginated) ────────────────────────────────────────────────
router.get(
  "/",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.FACULTY),
  getAllUsersHandler
);

// ─── Get Single User ──────────────────────────────────────────────────────────
router.get(
  "/:userId",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.FACULTY),
  getUserByIdHandler
);

// ─── Update User Profile ──────────────────────────────────────────────────────
router.patch(
  "/:userId",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(updateUserSchema),
  updateUserHandler
);

// ─── Update User Status (Activate / Deactivate / Suspend) ────────────────────
router.patch(
  "/:userId/status",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(updateUserStatusSchema),
  updateUserStatusHandler
);

// ─── Change User Role ─────────────────────────────────────────────────────────
// Only Super Admin can change roles — prevents privilege escalation
router.patch(
  "/:userId/role",
  authorizeRoles(ROLES.SUPER_ADMIN),
  validate(changeUserRoleSchema),
  changeUserRoleHandler
);

// ─── Admin Reset User Password ────────────────────────────────────────────────
router.post(
  "/:userId/reset-password",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  adminResetUserPasswordHandler
);

// ─── Soft Delete User ─────────────────────────────────────────────────────────
router.delete(
  "/:userId",
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  deleteUserHandler
);

export default router;
