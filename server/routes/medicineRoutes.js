import express from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { getMedicineInfo } from '../controllers/medicineController.js';
import { MAX_MEDICINE_NAME_LENGTH } from '../utils/constants.js';

const router = express.Router();

/**
 * @route   POST /api/medicine/search
 * @desc    Search medicine information for educational purposes (Phase 8)
 * @access  Protected (JWT)
 */
router.post(
  '/search',
  authMiddleware,
  aiRateLimiter,
  [
    body('medicine')
      .exists({ checkFalsy: true })
      .withMessage('Medicine name is required.')
      .isString()
      .withMessage('Medicine name must be a string.')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Medicine name cannot be empty.')
      .isLength({ max: MAX_MEDICINE_NAME_LENGTH })
      .withMessage(`Medicine name cannot exceed ${MAX_MEDICINE_NAME_LENGTH} characters.`),
  ],
  validate,
  getMedicineInfo
);

export default router;

