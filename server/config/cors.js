import cors from 'cors';
import env from './env.js';

/**
 * CORS configuration.
 * Only allows requests from the configured CLIENT_URL.
 */
const corsOptions = {
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const configureCors = () => cors(corsOptions);

export default corsOptions;
