import api from './api';

/**
 * Chat Service.
 * Provides client-side methods to communicate with the backend AI Medical Chatbot endpoint.
 * Protected by JWT via the existing Axios interceptor in api.js.
 */
export const chatService = {
  /**
   * Send a message to the AI Medical Assistant.
   * @param {string} message - User query
   * @param {Array<{role: string, content: string}>} [conversation] - Optional session conversation history
   * @returns {Promise<{success: boolean, data: {message: string, provider: string, model: string, disclaimer: string}}>}
   */
  async sendMessage(message, conversation = []) {
    const payload = { message };
    if (Array.isArray(conversation) && conversation.length > 0) {
      payload.conversation = conversation;
    }
    const response = await api.post('/chat/message', payload);
    return response.data;
  },
};

export default chatService;
