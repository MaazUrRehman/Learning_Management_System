import { Router } from "express";
import { verifyJWT, authorizeRoles, enforcePaswordChangePolicy } from "../middlewares/authMiddleware.js";
import { ROLES } from "../constants/permissions.js";
import {
  generateCredentialsHandler,
  getUsersByRoleHandler,
  getAdminProfilesHandler,
  createAdminProfileHandler,
  updateAdminProfileHandler,
  deleteAdminProfileHandler,
  getAccountantProfilesHandler,
  createAccountantProfileHandler,
  updateAccountantProfileHandler,
  deleteAccountantProfileHandler,
  getFacultyProfilesHandler,
  createFacultyProfileHandler,
  updateFacultyProfileHandler,
  deleteFacultyProfileHandler,
  getParentProfilesHandler,
  createParentProfileHandler,
  updateParentProfileHandler,
  deleteParentProfileHandler,
  getStudentProfilesHandler,
  createStudentProfileHandler,
  updateStudentProfileHandler,
  deleteStudentProfileHandler,
} from "../controllers/profileController.js";

const router = Router();

// Only Super Admin can access these routes
router.use(verifyJWT, enforcePaswordChangePolicy, authorizeRoles(ROLES.SUPER_ADMIN));

// Generate Credentials
router.post("/users/:userId/generate-credentials", generateCredentialsHandler);

// Users dropdown
router.get("/users/role/:role", getUsersByRoleHandler);

// Admins
router.get("/admins", getAdminProfilesHandler);
router.post("/admins", createAdminProfileHandler);
router.patch("/admins/:profileId", updateAdminProfileHandler);
router.delete("/admins/:profileId", deleteAdminProfileHandler);

// Accountants
router.get("/accountants", getAccountantProfilesHandler);
router.post("/accountants", createAccountantProfileHandler);
router.patch("/accountants/:profileId", updateAccountantProfileHandler);
router.delete("/accountants/:profileId", deleteAccountantProfileHandler);

// Faculty
router.get("/faculty", getFacultyProfilesHandler);
router.post("/faculty", createFacultyProfileHandler);
router.patch("/faculty/:profileId", updateFacultyProfileHandler);
router.delete("/faculty/:profileId", deleteFacultyProfileHandler);

// Parents
router.get("/parents", getParentProfilesHandler);
router.post("/parents", createParentProfileHandler);
router.patch("/parents/:profileId", updateParentProfileHandler);
router.delete("/parents/:profileId", deleteParentProfileHandler);

// Students
router.get("/students", getStudentProfilesHandler);
router.post("/students", createStudentProfileHandler);
router.patch("/students/:profileId", updateStudentProfileHandler);
router.delete("/students/:profileId", deleteStudentProfileHandler);

export default router;
