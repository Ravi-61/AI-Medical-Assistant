import express from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { sendMessage } from '../controllers/chatController.js';
import {
  MAX_CHAT_MESSAGE_LENGTH,
  MAX_CONVERSATION_MESSAGES,
} from '../utils/constants.js';

const router = express.Router();

/**
 * @route   POST /api/chat/message
 * @desc    Send message to AI Medical Chatbot (Phase 5)
 * @access  Protected (JWT)
 */
router.post(
  '/message',
  authMiddleware,
  aiRateLimiter,
  [
    body('message')
      .exists({ checkFalsy: true })
      .withMessage('Message is required.')
      .isString()
      .withMessage('Message must be a string.')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Message cannot be empty.')
      .isLength({ max: MAX_CHAT_MESSAGE_LENGTH })
      .withMessage(`Message exceeds maximum length of ${MAX_CHAT_MESSAGE_LENGTH} characters.`),
    body('conversation')
      .optional()
      .isArray({ max: MAX_CONVERSATION_MESSAGES })
      .withMessage(`Conversation cannot exceed ${MAX_CONVERSATION_MESSAGES} previous messages.`),
    body('conversation.*.role')
      .optional()
      .isIn(['user', 'assistant'])
      .withMessage('Conversation message role must be "user" or "assistant".'),
    body('conversation.*.content')
      .optional()
      .isString()
      .withMessage('Conversation message content must be a string.')
      .trim()
      .isLength({ min: 1, max: MAX_CHAT_MESSAGE_LENGTH })
      .withMessage(`Conversation message content must be between 1 and ${MAX_CHAT_MESSAGE_LENGTH} characters.`),
  ],
  validate,
  sendMessage
);

export default router;

