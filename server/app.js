import express from 'express';
import { configureCors } from './config/cors.js';
import rateLimiter from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/AppError.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import symptomRoutes from './routes/symptomRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Security: CORS configuration
app.use(configureCors());

// Security: Global Rate Limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/ai', aiRoutes);

// Handle unhandled routes (404)
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Centralized error handling middleware (must be last)
app.use(errorHandler);

export default app;
