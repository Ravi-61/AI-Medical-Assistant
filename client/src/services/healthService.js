import api from './api';

/**
 * Health Recommendations Service.
 * Communicates with the backend Health Recommendations endpoint.
 * Protected by JWT via Axios interceptor in api.js.
 */
export const healthService = {
  /**
   * Request evidence-based wellness recommendations.
   * @param {object} payload
   * @param {string[]} payload.goals - Array of wellness goals
   * @param {string} [payload.ageGroup] - Age group selection
   * @param {string} [payload.activityLevel] - Current physical activity level
   * @param {string} [payload.dietaryPreferences] - Dietary preferences/patterns
   * @param {string} [payload.additionalContext] - Additional lifestyle context
   * @returns {Promise<{success: boolean, data: {recommendations: object, provider: string, model: string, disclaimer: string}}>}
   */
  async getRecommendations(payload) {
    const response = await api.post('/health/recommendations', payload);
    return response.data;
  },
};

export default healthService;
