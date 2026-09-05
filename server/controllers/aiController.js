import { getAIService, buildPrompt, MEDICAL_SYSTEM_INSTRUCTIONS } from '../services/ai/index.js';
import { DISCLAIMER } from '../utils/constants.js';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

/**
 * AI Test Controller.
 *
 * Provides a minimal protected endpoint to verify the AI service layer.
 * This is NOT a production medical feature — it exists only for integration testing.
 *
 * POST /api/ai/test
 */
export const testAI = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    // Build prompt with medical safety instructions
    const featureInstructions = `The user is testing the AI Medical Assistant service. 
Respond to their health-related question in a helpful, educational manner.
Keep your response concise (2-4 paragraphs).`;

    const fullPrompt = buildPrompt(featureInstructions, prompt);

    // Get the AI service (may throw AppError if not configured)
    let aiService;
    try {
      aiService = getAIService();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: 'AI_CONFIG_ERROR',
            message: error.message,
          },
        });
      }
      throw error;
    }

    // Call the AI provider
    const text = await aiService.generateResponse(fullPrompt, {
      systemInstruction: MEDICAL_SYSTEM_INSTRUCTIONS,
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

    // Return standardized response
    res.status(200).json({
      success: true,
      data: {
        text,
        provider: env.AI_PROVIDER,
        model: env.AI_MODEL,
        disclaimer: DISCLAIMER,
      },
    });
  } catch (error) {
    // Map known AI errors to safe responses
    if (error instanceof AppError) {
      const codeMap = {
        503: 'AI_PROVIDER_ERROR',
        429: 'AI_RATE_LIMIT',
        422: 'AI_SAFETY_BLOCK',
        502: 'AI_EMPTY_RESPONSE',
      };

      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: codeMap[error.statusCode] || 'AI_ERROR',
          message: error.message,
        },
      });
    }

    // Unexpected errors → pass to centralized error handler (never expose raw details)
    next(new AppError('AI service encountered an unexpected error. Please try again later.', 500));
  }
};
