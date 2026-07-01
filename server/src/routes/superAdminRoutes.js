import { Router } from "express";
import { verifyJWT, authorizeRoles, enforcePaswordChangePolicy } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { ROLES } from "../constants/permissions.js";
import {
  getDashboardStats,
  getUsers,
  getUserDetail,
  createUserHandler,
  updateUserHandler,
  updateUserStatusHandler,
  changeUserRoleHandler,
  resetUserPasswordHandler,
  deleteUserHandler,
  getAcademicSessions,
  createAcademicSessionHandler,
  updateAcademicSessionHandler,
  activateAcademicSessionHandler,
  archiveAcademicSessionHandler,
  getClasses,
  createClassHandler,
  updateClassHandler,
  deleteClassHandler,
  getSections,
  createSectionHandler,
  updateSectionHandler,
  deleteSectionHandler,
  getSubjects,
  createSubjectHandler,
  updateSubjectHandler,
  deleteSubjectHandler,
  assignFacultyHandler,
  getSettingsHandler,
  updateSettingsHandler,
  sendNotificationHandler,
  createAnnouncementHandler,
  getChatRoomsHandler,
  createChatRoomHandler,
  getChatMessagesHandler,
  sendMessageHandler,
  getAuditLogsHandler,
  getProfileHandler,
  updateProfileHandler,
} from "../controllers/superAdminController.js";
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  changeUserRoleSchema,
  createAcademicSessionSchema,
  updateAcademicSessionSchema,
  createClassSchema,
  updateClassSchema,
  createSectionSchema,
  updateSectionSchema,
  createSubjectSchema,
  updateSubjectSchema,
  assignFacultySchema,
  updateSettingsSchema,
  sendNotificationSchema,
  createAnnouncementSchema,
  createChatRoomSchema,
  sendChatMessageSchema,
} from "../utils/validationSchemas.js";

const router = Router();

router.get("/dashboard", verifyJWT, authorizeRoles(ROLES.SUPER_ADMIN), getDashboardStats);

router.use(verifyJWT, enforcePaswordChangePolicy, authorizeRoles(ROLES.SUPER_ADMIN));

// User management
router.get("/users", getUsers);
router.get("/users/:userId", getUserDetail);
router.post("/users", validate(createUserSchema), createUserHandler);
router.patch("/users/:userId", validate(updateUserSchema), updateUserHandler);
router.patch(
  "/users/:userId/status",
  validate(updateUserStatusSchema),
  updateUserStatusHandler
);
router.patch(
  "/users/:userId/role",
  validate(changeUserRoleSchema),
  changeUserRoleHandler
);
router.post("/users/:userId/reset-password", resetUserPasswordHandler);
router.delete("/users/:userId", deleteUserHandler);

// Academic sessions
router.get("/sessions", getAcademicSessions);
router.post("/sessions", validate(createAcademicSessionSchema), createAcademicSessionHandler);
router.patch(
  "/sessions/:sessionId",
  validate(updateAcademicSessionSchema),
  updateAcademicSessionHandler
);
router.patch("/sessions/:sessionId/activate", activateAcademicSessionHandler);
router.patch("/sessions/:sessionId/archive", archiveAcademicSessionHandler);

// Classes + sections
router.get("/classes", getClasses);
router.post("/classes", validate(createClassSchema), createClassHandler);
router.patch("/classes/:classId", validate(updateClassSchema), updateClassHandler);
router.delete("/classes/:classId", deleteClassHandler);

router.get("/sections", getSections);
router.post("/sections", validate(createSectionSchema), createSectionHandler);
router.patch("/sections/:sectionId", validate(updateSectionSchema), updateSectionHandler);
router.delete("/sections/:sectionId", deleteSectionHandler);

// Subjects
router.get("/subjects", getSubjects);
router.post("/subjects", validate(createSubjectSchema), createSubjectHandler);
router.patch("/subjects/:subjectId", validate(updateSubjectSchema), updateSubjectHandler);
router.delete("/subjects/:subjectId", deleteSubjectHandler);

// Faculty assignment
router.post("/faculty-assignment", validate(assignFacultySchema), assignFacultyHandler);

// Settings
router.get("/settings", getSettingsHandler);
router.patch("/settings", validate(updateSettingsSchema), updateSettingsHandler);

// Notifications
router.post("/notifications", validate(sendNotificationSchema), sendNotificationHandler);
router.post("/announcements", validate(createAnnouncementSchema), createAnnouncementHandler);

// Chat
router.get("/chat/rooms", getChatRoomsHandler);
router.post("/chat/rooms", validate(createChatRoomSchema), createChatRoomHandler);
router.get("/chat/rooms/:roomId/messages", getChatMessagesHandler);
router.post(
  "/chat/rooms/:roomId/messages",
  validate(sendChatMessageSchema),
  sendMessageHandler
);

// Audit logs
router.get("/audit-logs", getAuditLogsHandler);

// Profile
router.get("/profile", getProfileHandler);
router.patch("/profile", validate(updateUserSchema), updateProfileHandler);

export default router;
