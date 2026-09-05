import AIService from './AIService.js';

/**
 * OpenAI Service.
 * Implements the AIService interface using OpenAI's API.
 * This is an alternative provider that can be swapped in via environment variables.
 *
 * Will be fully implemented as needed.
 */
class OpenAIService extends AIService {
  constructor(apiKey, model = 'gpt-3.5-turbo') {
    super(apiKey, model);
    // Future: Initialize OpenAI client here
  }

  async generateResponse(prompt, options = {}) {
    // Future: Implement actual OpenAI API call
    return '[OpenAI response — will be implemented when this provider is configured]';
  }

  async generateStructuredResponse(prompt, options = {}) {
    // Future: Implement actual OpenAI API call with JSON parsing
    return { message: 'OpenAI structured response — will be implemented when configured' };
  }
}

export default OpenAIService;
