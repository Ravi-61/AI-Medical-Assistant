import api from './api';

/**
 * Symptom Service.
 * Provides client-side methods to communicate with the backend Symptom Analysis endpoint.
 * Protected by JWT via the existing Axios interceptor in api.js.
 */
export const symptomService = {
  /**
   * Send symptoms for educational assessment.
   * @param {string[]} symptoms - Array of symptom strings
   * @param {string} [additionalContext] - Optional context string
   * @returns {Promise<{success: boolean, data: {analysis: object, provider: string, model: string, disclaimer: string}}>}
   */
  async analyzeSymptoms(symptoms, additionalContext = '') {
    const payload = { symptoms };
    if (additionalContext && additionalContext.trim()) {
      payload.additionalContext = additionalContext.trim();
    }
    const response = await api.post('/symptoms/analyze', payload);
    return response.data;
  },
};

export default symptomService;
