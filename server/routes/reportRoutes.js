import express from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import upload from '../middleware/uploadMiddleware.js';
import { analyzeReport } from '../controllers/reportController.js';
import env from '../config/env.js';

const router = express.Router();

/**
 * Custom multer wrapper to handle upload errors with standardized 400 responses.
 */
const handleUpload = (req, res, next) => {
  upload.single('report')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size exceeds maximum limit of ${env.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(400).json({ success: false, message: err.message || 'File upload error.' });
    }
    next();
  });
};

/**
 * @route   POST /api/reports/analyze
 * @desc    Analyze uploaded medical report (Phase 7)
 * @access  Protected (JWT)
 */
router.post(
  '/analyze',
  authMiddleware,
  aiRateLimiter,
  handleUpload,
  analyzeReport
);

export default router;

