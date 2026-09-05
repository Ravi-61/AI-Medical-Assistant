/**
 * Application-wide constants
 */

export const DISCLAIMER = 'This information is for educational and informational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns.';

export const AI_PROVIDERS = {
  GOOGLE: 'google',
  OPENAI: 'openai',
};

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
];

export const MAX_PROMPT_LENGTH = 10000; // characters
export const MAX_CHAT_MESSAGE_LENGTH = 4000; // characters
export const MAX_CONVERSATION_MESSAGES = 10;
export const MAX_CONVERSATION_BUDGET = 12000; // characters

// Phase 6: Symptom Analysis constants
export const MAX_SYMPTOMS_COUNT = 15;
export const MAX_SYMPTOM_LENGTH = 100; // characters per symptom
export const MAX_ADDITIONAL_CONTEXT_LENGTH = 1000; // characters
export const MAX_COMBINED_INPUT_LENGTH = 2500; // characters
export const URGENCY_LEVELS = ['emergency', 'urgent', 'routine', 'unclear'];

// Phase 7: Medical Report Explanation constants
export const MAX_REPORT_TEXT_LENGTH = 15000; // characters

// Phase 8: Medicine Information constants
export const MAX_MEDICINE_NAME_LENGTH = 150; // characters

// Phase 9: Health Recommendations constants
export const MAX_WELLNESS_GOALS_COUNT = 5;
export const MAX_WELLNESS_GOAL_LENGTH = 100; // characters per goal
export const MAX_WELLNESS_CONTEXT_LENGTH = 1000; // characters
export const MAX_COMBINED_WELLNESS_INPUT_LENGTH = 2500; // characters
export const WELLNESS_CATEGORIES = [
  'nutrition',
  'physical_activity',
  'sleep_hygiene',
  'stress_management',
  'preventive_habits',
];
