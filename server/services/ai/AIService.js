/**
 * Base AI Service — Abstract interface.
 * All AI provider implementations must extend this class
 * and implement the abstract methods.
 */
class AIService {
  constructor(apiKey, model) {
    if (new.target === AIService) {
      throw new Error('AIService is abstract and cannot be instantiated directly.');
    }
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Generate a text response from a prompt.
   * @param {string} prompt - The prompt to send to the AI
   * @param {object} options - Additional options (temperature, maxTokens, etc.)
   * @returns {Promise<string>} The AI-generated text response
   */
  async generateResponse(prompt, options = {}) {
    throw new Error('generateResponse() must be implemented by subclass');
  }

  /**
   * Generate a structured (JSON) response from a prompt.
   * @param {string} prompt - The prompt to send to the AI
   * @param {object} options - Additional options
   * @returns {Promise<object>} The AI-generated parsed JSON response
   */
  async generateStructuredResponse(prompt, options = {}) {
    throw new Error('generateStructuredResponse() must be implemented by subclass');
  }
}

export default AIService;
