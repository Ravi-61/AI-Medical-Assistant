import api from './api';

/**
 * Medicine Information Service.
 * Provides client-side methods to communicate with the backend Medicine Search endpoint.
 * Protected by JWT via the existing Axios interceptor in api.js.
 */
export const medicineService = {
  /**
   * Search for educational medicine information.
   * @param {string} medicine - Name of the medicine to look up
   * @returns {Promise<{success: boolean, data: {medicine: object, provider: string, model: string, disclaimer: string}}>}
   */
  async searchMedicine(medicine) {
    const response = await api.post('/medicine/search', { medicine });
    return response.data;
  },
};

export default medicineService;
