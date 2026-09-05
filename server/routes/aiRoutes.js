import { Router } from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { testAI } from '../controllers/aiController.js';
import { MAX_PROMPT_LENGTH } from '../utils/constants.js';

const router = Router();

/**
 * POST /api/ai/test
 *
 * Test endpoint to verify the AI service layer.
 * Protected by JWT authentication and AI-specific rate limiting.
 * Validates prompt input before forwarding to the AI service.
 *
 * Request body:
 *   { prompt: string }
 *
 * Response:
 *   { success: true, data: { text, provider, model, disclaimer } }
 */
router.post(
  '/test',
  authMiddleware,
  aiRateLimiter,
  [
    body('prompt')
      .exists({ checkFalsy: true })
      .withMessage('Prompt is required.')
      .isString()
      .withMessage('Prompt must be a string.')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Prompt cannot be empty.')
      .isLength({ max: MAX_PROMPT_LENGTH })
      .withMessage(`Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters.`),
  ],
  validate,
  testAI
);

export default router;
