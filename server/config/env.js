import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve server/.env as primary source of truth, fallback to root .env
const serverEnvPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../.env');

let loadedEnvPath = null;

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
  loadedEnvPath = 'server/.env';
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
  loadedEnvPath = '.env (root)';
} else {
  // Default to process.cwd() lookup
  const result = dotenv.config();
  if (!result.error) {
    loadedEnvPath = 'process.cwd()/.env';
  }
}

/**
 * Centralized environment variable access.
 * Uses dynamic getters to ensure live access to process.env.
 */
const env = {
  get PORT() {
    return process.env.PORT || 5000;
  },
  get NODE_ENV() {
    return process.env.NODE_ENV || 'development';
  },
  get MONGODB_URI() {
    return process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_medical_assistant';
  },
  get JWT_SECRET() {
    return process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_production';
  },
  get JWT_EXPIRES_IN() {
    return process.env.JWT_EXPIRES_IN || '7d';
  },
  get CLIENT_URL() {
    return process.env.CLIENT_URL || 'http://localhost:5173';
  },
  get AI_PROVIDER() {
    return process.env.AI_PROVIDER || 'google';
  },
  get GOOGLE_AI_API_KEY() {
    return process.env.GOOGLE_AI_API_KEY;
  },
  get OPENAI_API_KEY() {
    return process.env.OPENAI_API_KEY;
  },
  get AI_MODEL() {
    return process.env.AI_MODEL || 'gemini-flash-lite-latest';
  },
  get MAX_FILE_SIZE() {
    return parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024;
  },
};

/**
 * Validate critical environment variables.
 * Logs safe diagnostics (never prints secret keys or tokens).
 */
export const validateEnv = () => {
  const warnings = [];

  if (!process.env.JWT_SECRET) {
    warnings.push('JWT_SECRET is not set in environment (using development fallback secret)');
  }

  if (env.AI_PROVIDER === 'google' && !env.GOOGLE_AI_API_KEY) {
    warnings.push('GOOGLE_AI_API_KEY is not set (required for AI features in Phase 4+)');
  }

  if (env.AI_PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY is not set (required for AI features in Phase 4+)');
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment variable warnings:');
    warnings.forEach((w) => console.warn(`   - ${w}`));
    console.warn('');
  }

  // Safe configuration status (never prints secret)
  console.log('📋 AI Configuration Status:');
  console.log(`   - Provider: ${env.AI_PROVIDER}`);
  console.log(`   - Model: ${env.AI_MODEL}`);
  console.log(`   - GOOGLE_AI_API_KEY: ${env.GOOGLE_AI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`   - Config source: ${loadedEnvPath || 'No .env file found'}\n`);
};

export default env;
