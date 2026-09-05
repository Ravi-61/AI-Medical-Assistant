import api from './api';

export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password, phone, dateOfBirth, gender }
   * @returns {Promise<Object>} API response data with token and user
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Log in an existing user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} API response data with token and user
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get current authenticated user profile
   * @returns {Promise<Object>} API response data with user
   */
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} profileData - { name, phone, dateOfBirth, gender }
   * @returns {Promise<Object>} API response data with updated user
   */
  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

export default authService;
