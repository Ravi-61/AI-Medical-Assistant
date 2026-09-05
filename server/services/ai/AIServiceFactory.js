import GeminiService from './GeminiService.js';
import OpenAIService from './OpenAIService.js';
import env from '../../config/env.js';
import AppError from '../../utils/AppError.js';
import { AI_PROVIDERS } from '../../utils/constants.js';

/**
 * AI Service Factory.
 * Returns the appropriate AI service based on the AI_PROVIDER environment variable.
 * Uses a singleton pattern — the same instance is reused across the application.
 *
 * Usage:
 *   const aiService = getAIService();
 *   const response = await aiService.generateResponse(prompt);
 */

let aiServiceInstance = null;

/**
 * Get (or create) the singleton AI service instance.
 * Validates provider configuration before instantiation.
 * @returns {import('./AIService.js').default}
 * @throws {AppError} If provider or API key is misconfigured
 */
const getAIService = () => {
  // Return cached instance (singleton)
  if (aiServiceInstance) {
    return aiServiceInstance;
  }

  const provider = env.AI_PROVIDER;

  switch (provider) {
    case AI_PROVIDERS.GOOGLE: {
      if (!env.GOOGLE_AI_API_KEY) {
        throw new AppError(
          'Google AI API key is not configured. Set GOOGLE_AI_API_KEY in your server .env file.',
          503,
          'AI_CONFIG_ERROR'
        );
      }
      aiServiceInstance = new GeminiService(env.GOOGLE_AI_API_KEY, env.AI_MODEL);
      break;
    }

    case AI_PROVIDERS.OPENAI: {
      if (!env.OPENAI_API_KEY) {
        throw new AppError(
          'OpenAI API key is not configured. Set OPENAI_API_KEY in your server .env file.',
          503,
          'AI_CONFIG_ERROR'
        );
      }
      aiServiceInstance = new OpenAIService(env.OPENAI_API_KEY, env.AI_MODEL);
      break;
    }

    default:
      throw new AppError(
        `Unsupported AI provider: "${provider}". Supported providers: google, openai.`,
        503
      );
  }

  console.log(`🤖 AI Service initialized: ${provider} (${env.AI_MODEL})`);
  return aiServiceInstance;
};

/**
 * Reset the singleton instance.
 * Useful for testing or reconfiguration.
 */
export const resetAIService = () => {
  aiServiceInstance = null;
};

export default getAIService;
