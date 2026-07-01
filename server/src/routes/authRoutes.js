import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from "../controllers/authController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../utils/validationSchemas.js";

const router = Router();

// ─── Public Routes (No Auth Required) ────────────────────────────────────────
// NOTE: There are NO public registration routes — this is a closed system.

router.post("/login", validate(loginSchema), loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

// ─── Protected Routes (JWT Required) ─────────────────────────────────────────
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, validate(changePasswordSchema), changePassword);
router.get("/me", verifyJWT, getCurrentUser);

export default router;
