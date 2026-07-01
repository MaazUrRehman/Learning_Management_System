import { Router } from "express";
import {
  createClassHandler, getAllClassesHandler, getClassByIdHandler, updateClassHandler, deleteClassHandler,
  createSectionHandler, getAllSectionsHandler, getSectionsByClassHandler, getSectionByIdHandler, updateSectionHandler, deleteSectionHandler,
} from "../controllers/classController.js";
import { verifyJWT, authorizeRoles, enforcePaswordChangePolicy } from "../middlewares/authMiddleware.js";
import { ROLES } from "../constants/permissions.js";

const router = Router();
router.use(verifyJWT, enforcePaswordChangePolicy);

// ─── Class Routes ─────────────────────────────────────────────────────────────
router.get("/", getAllClassesHandler);
router.get("/:classId", getClassByIdHandler);
router.get("/:classId/sections", getSectionsByClassHandler);
router.post("/", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), createClassHandler);
router.patch("/:classId", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateClassHandler);
router.delete("/:classId", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteClassHandler);

// ─── Section Routes ───────────────────────────────────────────────────────────
router.get("/sections/all", getAllSectionsHandler);
router.get("/sections/:sectionId", getSectionByIdHandler);
router.post("/sections", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), createSectionHandler);
router.patch("/sections/:sectionId", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateSectionHandler);
router.delete("/sections/:sectionId", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteSectionHandler);

export default router;
