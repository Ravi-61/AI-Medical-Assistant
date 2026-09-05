import api from './api';

/**
 * Report Service.
 * Provides client-side methods to upload medical reports for educational explanation.
 * Sends multipart/form-data via the authenticated Axios client.
 */
export const reportService = {
  /**
   * Upload and analyze a medical report (PDF or TXT).
   * @param {File} file - The report file object
   * @returns {Promise<{success: boolean, data: {explanation: object, provider: string, model: string, disclaimer: string}}>}
   */
  async analyzeReport(file) {
    const formData = new FormData();
    formData.append('report', file);

    const response = await api.post('/reports/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

export default reportService;
