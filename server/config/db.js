import mongoose from 'mongoose';
import env from './env.js';

/**
 * Connect to MongoDB.
 * Retries on failure with a delay.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Retry after 5 seconds
    console.log('   Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
