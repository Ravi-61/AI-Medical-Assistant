import rateLimit from 'express-rate-limit';

/**
 * Rate limiter middleware.
 * Generous limits for local/normal user interactions (1000 requests per 15-minute window).
 * Skips the health check endpoint.
 */
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health' || req.path === '/health',
  message: {
    success: false,
    message: 'Too many requests. Please wait a moment and try again.',
  },
});

/**
 * Rate limiter for authentication endpoints.
 * Limits each IP to 100 requests per 15-minute window.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

/**
 * Rate limiter for AI endpoints.
 * Limits each IP to 200 requests per 15-minute window.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please wait a moment and try again.',
  },
});

export default rateLimiter;
