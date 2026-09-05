import multer from 'multer';
import AppError from '../utils/AppError.js';
import env from '../config/env.js';

/**
 * Multer upload middleware.
 * Uses memory storage (no disk persistence for security).
 * Restricts file types to PDF and TXT.
 */

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and TXT files are allowed', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
  },
});

export default upload;
