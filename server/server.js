import app from './app.js';
import env, { validateEnv } from './config/env.js';
import connectDB from './config/db.js';

// Validate environment variables on startup
validateEnv();

// Initialize database connection
connectDB();

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown handling
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

export default server;
