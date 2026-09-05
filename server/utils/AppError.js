/**
 * Custom application error class.
 * Use this to throw operational errors with a specific HTTP status code.
 *
 * Usage:
 *   throw new AppError('User not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
