import express from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { getHealth, getRecommendations } from '../controllers/healthController.js';
import {
  MAX_WELLNESS_GOALS_COUNT,
  MAX_WELLNESS_CONTEXT_LENGTH,
} from '../utils/constants.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Check health status of backend API (System Health)
 * @access  Public
 */
router.get('/', getHealth);

/**
 * @route   POST /api/health/recommendations
 * @desc    Generate personalized general wellness and lifestyle recommendations (Phase 9)
 * @access  Protected (JWT)
 */
router.post(
  '/recommendations',
  authMiddleware,
  aiRateLimiter,
  [
    body('goals')
      .exists({ checkFalsy: true })
      .withMessage('Goals array is required.')
      .isArray({ min: 1, max: MAX_WELLNESS_GOALS_COUNT })
      .withMessage(`You must provide between 1 and ${MAX_WELLNESS_GOALS_COUNT} wellness goals.`),
    body('goals.*')
      .isString()
      .withMessage('Each goal must be a string.')
      .trim()
      .notEmpty()
      .withMessage('Goal item cannot be empty.')
      .isLength({ max: 100 })
      .withMessage('Each goal cannot exceed 100 characters.'),
    body('additionalContext')
      .optional()
      .isString()
      .withMessage('Additional context must be a string.')
      .trim()
      .isLength({ max: MAX_WELLNESS_CONTEXT_LENGTH })
      .withMessage(`Additional context cannot exceed ${MAX_WELLNESS_CONTEXT_LENGTH} characters.`),
    body('ageGroup')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 }),
    body('activityLevel')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 }),
    body('dietaryPreferences')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 }),
  ],
  validate,
  getRecommendations
);

export default router;
