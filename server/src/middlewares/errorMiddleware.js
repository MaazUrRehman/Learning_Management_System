import { ApiError } from "../utils/ApiError.js";
import logger from "../config/logger.js";

/**
 * Express global error handling interceptor middleware.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Compile other native errors into ApiError instances
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, err.errors, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
  };

  logger.error(`[API ERROR] Path: ${req.path} - Msg: ${error.message}`);
  
  return res.status(error.statusCode).json(response);
};

export { errorHandler };
