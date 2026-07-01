import { Router } from "express";
import {
  createAcademicSessionHandler,
  getAllAcademicSessionsHandler,
  getAcademicSessionByIdHandler,
  getCurrentAcademicSessionHandler,
  updateAcademicSessionHandler,
  deleteAcademicSessionHandler,
} from "../controllers/academicSessionController.js";
import { verifyJWT, authorizeRoles, enforcePaswordChangePolicy } from "../middlewares/authMiddleware.js";
import { ROLES } from "../constants/permissions.js";

const router = Router();
router.use(verifyJWT, enforcePaswordChangePolicy);

router.get("/current", getAllAcademicSessionsHandler && getCurrentAcademicSessionHandler); // GET current session
router.get("/current-session", getCurrentAcademicSessionHandler);
router.get("/", getAllAcademicSessionsHandler);
router.get("/:sessionId", getAcademicSessionByIdHandler);

router.post("/", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), createAcademicSessionHandler);
router.patch("/:sessionId", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateAcademicSessionHandler);
router.delete("/:sessionId", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteAcademicSessionHandler);

export default router;
