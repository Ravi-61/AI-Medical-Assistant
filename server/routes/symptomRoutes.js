import express from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { analyzeSymptoms } from '../controllers/symptomController.js';
import {
  MAX_SYMPTOMS_COUNT,
  MAX_SYMPTOM_LENGTH,
  MAX_ADDITIONAL_CONTEXT_LENGTH,
  MAX_COMBINED_INPUT_LENGTH,
} from '../utils/constants.js';

const router = express.Router();

/**
 * @route   POST /api/symptoms/analyze
 * @desc    Analyze entered symptoms for educational assessment (Phase 6)
 * @access  Protected (JWT)
 */
router.post(
  '/analyze',
  authMiddleware,
  aiRateLimiter,
  [
    body('symptoms')
      .exists({ checkFalsy: true })
      .withMessage('Symptoms array is required.')
      .isArray({ min: 1, max: MAX_SYMPTOMS_COUNT })
      .withMessage(`Symptoms must be an array with 1 to ${MAX_SYMPTOMS_COUNT} items.`)
      .custom((symptoms) => {
        if (!Array.isArray(symptoms)) return false;
        // Check for empty or non-string items first
        for (const s of symptoms) {
          if (typeof s !== 'string' || s.trim().length === 0) {
            throw new Error('Symptoms cannot contain empty or non-string values.');
          }
        }
        // Check for duplicates
        const normalized = symptoms.map((s) => s.trim().toLowerCase());
        const uniqueSet = new Set(normalized);
        if (uniqueSet.size !== normalized.length) {
          throw new Error('Duplicate symptoms are not allowed.');
        }
        return true;
      }),
    body('symptoms.*')
      .isString()
      .withMessage('Each symptom must be a string.')
      .trim()
      .isLength({ min: 1, max: MAX_SYMPTOM_LENGTH })
      .withMessage(`Each symptom must be between 1 and ${MAX_SYMPTOM_LENGTH} characters.`),
    body('additionalContext')
      .optional()
      .isString()
      .withMessage('Additional context must be a string.')
      .trim()
      .isLength({ max: MAX_ADDITIONAL_CONTEXT_LENGTH })
      .withMessage(`Additional context cannot exceed ${MAX_ADDITIONAL_CONTEXT_LENGTH} characters.`),
    body().custom((value) => {
      const symptomsStr = Array.isArray(value?.symptoms) ? value.symptoms.join(' ') : '';
      const contextStr = typeof value?.additionalContext === 'string' ? value.additionalContext : '';
      const totalLen = symptomsStr.length + contextStr.length;
      if (totalLen > MAX_COMBINED_INPUT_LENGTH) {
        throw new Error(`Total input size exceeds limit of ${MAX_COMBINED_INPUT_LENGTH} characters.`);
      }
      return true;
    }),
  ],
  validate,
  analyzeSymptoms
);

export default router;

