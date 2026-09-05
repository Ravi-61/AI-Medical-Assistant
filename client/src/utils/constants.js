/**
 * Application-wide constants
 */

export const APP_NAME = 'AI Medical Assistant';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CHAT: '/chat',
  SYMPTOMS: '/symptoms',
  REPORTS: '/reports',
  MEDICINE: '/medicine',
  HEALTH: '/health',
  PROFILE: '/profile',
};

export const DISCLAIMER_TEXT =
  'This system is for educational and informational purposes only. It does not diagnose medical conditions, prescribe medication, or replace professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
];
