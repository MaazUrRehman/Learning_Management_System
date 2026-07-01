/**
 * Wrapper middleware to handle async errors in route controllers without try-catch blocks.
 * @param {Function} requestHandler - The controller function to wrap.
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
