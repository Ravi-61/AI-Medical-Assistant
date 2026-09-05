/**
 * AI Service — Barrel Export.
 *
 * Central entry point for the AI service layer.
 * Import from here instead of individual files.
 *
 * Usage:
 *   import { getAIService, buildPrompt, MEDICAL_SYSTEM_INSTRUCTIONS } from '../services/ai/index.js';
 */

export { default as getAIService, resetAIService } from './AIServiceFactory.js';
export { MEDICAL_SYSTEM_INSTRUCTIONS, buildPrompt } from './medicalSafety.js';
