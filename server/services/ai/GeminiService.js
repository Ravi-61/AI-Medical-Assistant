import { GoogleGenerativeAI } from '@google/generative-ai';
import AIService from './AIService.js';
import AppError from '../../utils/AppError.js';

/**
 * Google Gemini AI Service.
 * Implements the AIService interface using Google's Generative AI SDK.
 *
 * Handles:
 * - SDK initialization with API key validation
 * - Text generation via generateResponse()
 * - Structured (JSON) generation via generateStructuredResponse()
 * - Centralized error mapping (auth, rate-limit, network, provider)
 */
class GeminiService extends AIService {
  constructor(apiKey, model = 'gemini-1.5-flash') {
    super(apiKey, model);

    if (!apiKey) {
      throw new AppError(
        'Google AI API key is not configured. Set GOOGLE_AI_API_KEY in your environment.',
        503,
        'AI_CONFIG_ERROR'
      );
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.generativeModel = null; // Lazy — created on first request
  }

  /**
   * Get or create the generative model instance.
   * Uses the model name from environment config.
   * @param {string} [systemInstruction] - Optional system-level instruction
   * @returns {import('@google/generative-ai').GenerativeModel}
   */
  _getModel(systemInstruction) {
    const config = {
      model: this.model,
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    return this.client.getGenerativeModel(config);
  }

  /**
   * Map Gemini SDK errors to safe, application-level errors.
   * Never exposes API key, raw stack trace, or internal SDK details.
   * @param {Error} error
   * @throws {AppError}
   */
  _handleError(error) {
    const message = error?.message || '';
    const status = error?.status || error?.httpStatusCode;

    // Authentication / invalid API key
    if (
      status === 401 ||
      status === 403 ||
      message.includes('API_KEY_INVALID') ||
      message.includes('API key not valid') ||
      message.includes('PERMISSION_DENIED')
    ) {
      throw new AppError(
        'AI service authentication failed. Please verify your API key configuration.',
        503,
        'AI_AUTH_ERROR'
      );
    }

    // Rate limiting
    if (
      status === 429 ||
      message.includes('RESOURCE_EXHAUSTED') ||
      message.includes('quota')
    ) {
      throw new AppError(
        'AI service is temporarily rate-limited. Please try again later.',
        429,
        'AI_RATE_LIMIT'
      );
    }

    // Model not found / unsupported
    if (
      status === 404 ||
      message.includes('not found') ||
      message.includes('is not supported') ||
      message.includes('NOT_FOUND')
    ) {
      throw new AppError(
        `AI model "${this.model}" is not available or not supported. Check your AI_MODEL configuration.`,
        503,
        'AI_MODEL_ERROR'
      );
    }

    // Safety block
    if (
      message.includes('SAFETY') ||
      message.includes('blocked') ||
      message.includes('RECITATION')
    ) {
      throw new AppError(
        'The AI response was blocked due to safety filters. Please rephrase your request.',
        422,
        'AI_SAFETY_BLOCK'
      );
    }

    // Network / timeout
    if (
      message.includes('ECONNREFUSED') ||
      message.includes('ETIMEDOUT') ||
      message.includes('ENOTFOUND') ||
      message.includes('fetch failed') ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT'
    ) {
      throw new AppError(
        'Unable to reach the AI service. Please check your network connection and try again.',
        503,
        'AI_NETWORK_ERROR'
      );
    }

    // Generic provider error — never expose raw message
    throw new AppError(
      'AI service encountered an unexpected error. Please try again later.',
      503,
      'AI_PROVIDER_ERROR'
    );
  }

  /**
   * Extract text from a Gemini API response.
   * Handles empty, blocked, or malformed responses safely.
   * @param {object} result - The raw SDK response
   * @returns {string}
   */
  _extractText(result) {
    try {
      const response = result?.response;
      if (!response) {
        throw new AppError('AI service returned an empty response. Please try again.', 502);
      }

      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new AppError('AI service returned an empty response. Please try again.', 502);
      }

      return text.trim();
    } catch (error) {
      if (error instanceof AppError) throw error;
      this._handleError(error);
    }
  }

  /**
   * Generate a text response from a prompt.
   * Includes automatic retry with exponential backoff for transient rate limits (429)
   * or temporary model demand spikes (503).
   * @param {string} prompt - The prompt to send
   * @param {object} [options] - { systemInstruction, temperature, maxOutputTokens }
   * @returns {Promise<string>} Clean text response
   */
  async generateResponse(prompt, options = {}) {
    const maxRetries = 2;
    let attempt = 0;

    while (true) {
      try {
        const model = this._getModel(options.systemInstruction);

        const generationConfig = {};
        if (options.temperature != null) generationConfig.temperature = options.temperature;
        if (options.maxOutputTokens != null) generationConfig.maxOutputTokens = options.maxOutputTokens;

        const parts = [];
        if (options.fileData && options.fileData.data && options.fileData.mimeType) {
          parts.push({
            inlineData: {
              mimeType: options.fileData.mimeType,
              data: options.fileData.data,
            },
          });
        }
        parts.push({ text: prompt });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts }],
          ...(Object.keys(generationConfig).length > 0 && { generationConfig }),
        });

        return this._extractText(result);
      } catch (error) {
        if (error instanceof AppError) throw error;

        const status = error?.status || error?.httpStatusCode;
        const msg = (error?.message || '').toLowerCase();
        const isTransient =
          status === 429 ||
          status === 503 ||
          msg.includes('resource_exhausted') ||
          msg.includes('quota') ||
          msg.includes('high demand') ||
          msg.includes('rate-limited');

        if (isTransient && attempt < maxRetries) {
          attempt++;
          const delayMs = attempt * 2500;
          console.warn(`⚠️ Temporary AI rate limit / demand spike (attempt ${attempt}/${maxRetries}). Retrying in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        this._handleError(error);
      }
    }
  }

  /**
   * Generate a structured (JSON) response from a prompt.
   * Attempts to parse the AI response as JSON.
   * Falls back to wrapping raw text in { text } if JSON parsing fails.
   * @param {string} prompt - The prompt to send
   * @param {object} [options] - Same as generateResponse
   * @returns {Promise<object>} Parsed object
   */
  async generateStructuredResponse(prompt, options = {}) {
    const text = await this.generateResponse(prompt, options);

    try {
      // Try to extract JSON from the response (may be wrapped in markdown code fences)
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : text;
      return JSON.parse(jsonString);
    } catch {
      // If JSON parsing fails, return the raw text wrapped in an object
      return { text };
    }
  }
}

export default GeminiService;
