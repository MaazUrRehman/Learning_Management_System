import { ApiError } from "../utils/ApiError.js";

/**
 * Generic Zod schema validation middleware factory.
 * Wraps any Zod schema and applies it to req.body.
 * @param {import('zod').ZodSchema} schema - Zod validation schema.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return next(new ApiError(422, "Validation failed", errors));
  }

  // Replace req.body with the validated/sanitized data
  req.body = result.data;
  next();
};
