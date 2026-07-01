import { z } from "zod";

// ─────────────────────────────────────────────
// Auth Validation Schemas
// ─────────────────────────────────────────────

/**
 * Login schema — accepts email / username / studentId / employeeId
 */
export const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Email, username, or ID is required" })
    .min(2, "Identifier must be at least 2 characters")
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

/**
 * Change password schema (first-login and voluntary change)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(6),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must contain uppercase, lowercase, number and special character"
      ),
    confirmNewPassword: z.string({ required_error: "Please confirm new password" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

/**
 * Forgot password schema — request password reset link via email
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
});

/**
 * Reset password schema — used with the reset token from email
 */
export const resetPasswordSchema = z
  .object({
    token: z.string({ required_error: "Reset token is required" }),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must contain uppercase, lowercase, number and special character"
      ),
    confirmNewPassword: z.string({ required_error: "Please confirm new password" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

// ─────────────────────────────────────────────
// User Management Validation Schemas
// ─────────────────────────────────────────────

/**
 * Create user schema — used by Super Admin / Admin to create new users
 */
export const createUserSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .min(2)
    .trim(),
  lastName: z
    .string({ required_error: "Last name is required" })
    .min(2)
    .trim(),
  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .toLowerCase()
    .trim(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  role: z.enum(["ADMIN", "ACCOUNTANT", "FACULTY", "PARENT", "STUDENT"], {
    required_error: "Role is required",
    invalid_type_error: "Invalid role. Super Admin can only be created via seed script.",
  }),
  phone: z.string().trim().optional(),
  address: z
    .object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      country: z.string().trim().optional(),
    })
    .optional(),
});

/**
 * Update user schema — partial updates (no role or password changes here)
 */
export const updateUserSchema = z.object({
  firstName: z.string().min(2).trim().optional(),
  lastName: z.string().min(2).trim().optional(),
  phone: z.string().trim().optional(),
  avatarUrl: z.string().url().optional(),
  address: z
    .object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      country: z.string().trim().optional(),
    })
    .optional(),
});

/**
 * Update user status schema — activate, deactivate, suspend
 */
export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be ACTIVE, INACTIVE, or SUSPENDED",
  }),
});

/**
 * Change user role schema — Super Admin only
 */
export const changeUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "ACCOUNTANT", "FACULTY", "PARENT", "STUDENT"], {
    required_error: "New role is required",
    invalid_type_error: "Invalid role. Super Admin cannot be assigned via API.",
  }),
});

export const createAcademicSessionSchema = z.object({
  name: z.string({ required_error: "Session name is required" }).min(3).trim(),
  startDate: z
    .string({ required_error: "Start date is required" })
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid start date"),
  endDate: z
    .string({ required_error: "End date is required" })
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid end date"),
  isCurrent: z.boolean().optional(),
});

export const updateAcademicSessionSchema = createAcademicSessionSchema.partial();

export const createClassSchema = z.object({
  name: z.string({ required_error: "Class name is required" }).min(1).trim(),
  code: z.string({ required_error: "Class code is required" }).min(1).trim(),
});

export const updateClassSchema = createClassSchema.partial();

export const createSectionSchema = z.object({
  name: z.string({ required_error: "Section name is required" }).min(1).trim(),
  classId: z.string({ required_error: "Class is required" }).min(1),
});

export const updateSectionSchema = createSectionSchema.partial();

export const createSubjectSchema = z.object({
  name: z.string({ required_error: "Subject name is required" }).min(1).trim(),
  code: z.string({ required_error: "Subject code is required" }).min(1).trim(),
  classId: z.string({ required_error: "Class is required" }).min(1),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const assignFacultySchema = z.object({
  facultyId: z.string({ required_error: "Faculty ID is required" }).min(1),
  subjectIds: z.array(z.string().min(1), {
    required_error: "Subject IDs are required",
  }),
});

export const updateSettingsSchema = z.object({
  academyName: z.string().trim().optional(),
  academyLogo: z.string().trim().optional(),
  address: z
    .object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      country: z.string().trim().optional(),
    })
    .optional(),
  contactInfo: z
    .object({
      phone: z.string().trim().optional(),
      email: z.string().trim().optional(),
    })
    .optional(),
  passwordPolicy: z.any().optional(),
  sessionTimeout: z.number().int().positive().optional(),
  loginAttempts: z.number().int().positive().optional(),
  theme: z.string().trim().optional(),
  colors: z.record(z.string()).optional(),
  logo: z.string().trim().optional(),
});

export const sendNotificationSchema = z.object({
  title: z.string({ required_error: "Title is required" }).min(3).trim(),
  message: z.string({ required_error: "Message is required" }).min(5).trim(),
  type: z.enum(["GENERAL", "ATTENDANCE", "FEE", "EXAM", "ASSIGNMENT"]).optional(),
  recipients: z.array(z.string().min(1)).optional(),
});

export const createAnnouncementSchema = z.object({
  title: z.string({ required_error: "Title is required" }).min(3).trim(),
  message: z.string({ required_error: "Message is required" }).min(5).trim(),
  targetRoles: z.array(
    z.enum(["ADMIN", "ACCOUNTANT", "FACULTY", "PARENT", "STUDENT"], {
      invalid_type_error: "Invalid target role",
      required_error: "Target roles are required",
    })
  ).min(1, "At least one target role is required"),
  expiryDate: z.string().optional(),
});

export const createChatRoomSchema = z.object({
  participantId: z.string({ required_error: "Participant ID is required" }).min(1),
});

export const sendChatMessageSchema = z.object({
  messageText: z.string({ required_error: "Message is required" }).min(1).trim(),
  attachments: z.array(z.string().url("Invalid attachment URL")).optional(),
});
