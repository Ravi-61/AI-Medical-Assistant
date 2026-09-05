import { getAIService, buildPrompt, MEDICAL_SYSTEM_INSTRUCTIONS } from '../services/ai/index.js';
import {
  DISCLAIMER,
  MAX_WELLNESS_GOALS_COUNT,
  MAX_WELLNESS_GOAL_LENGTH,
  MAX_WELLNESS_CONTEXT_LENGTH,
  MAX_COMBINED_WELLNESS_INPUT_LENGTH,
  WELLNESS_CATEGORIES,
} from '../utils/constants.js';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

/**
 * Health check controller.
 * Returns API operational status.
 */
export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Medical Assistant API is running',
  });
};

/**
 * Validate the structured JSON output returned by the AI provider for wellness recommendations.
 *
 * @param {any} data - Raw parsed JSON from AI
 * @returns {object} Validated health recommendations object
 * @throws {AppError} If validation fails
 */
export const validateRecommendationsOutput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new AppError('AI service returned an invalid recommendations response structure.', 502);
  }

  // 1. Validate summary string
  if (typeof data.summary !== 'string' || data.summary.trim().length === 0 || data.summary.length > 2500) {
    throw new AppError('AI recommendations response summary is missing or invalid.', 502);
  }

  // 2. Validate focusAreas array
  if (!Array.isArray(data.focusAreas) || data.focusAreas.length === 0 || data.focusAreas.length > 8) {
    throw new AppError('AI recommendations focusAreas must be an array with 1 to 8 areas.', 502);
  }

  const validatedFocusAreas = [];
  for (const area of data.focusAreas) {
    if (!area || typeof area !== 'object' || Array.isArray(area)) {
      throw new AppError('Invalid focus area item structure in recommendations.', 502);
    }
    const cat = typeof area.category === 'string' ? area.category.trim().toLowerCase() : '';
    if (!WELLNESS_CATEGORIES.includes(cat)) {
      throw new AppError(`Focus area category must be one of: ${WELLNESS_CATEGORIES.join(', ')}.`, 502);
    }
    if (typeof area.title !== 'string' || area.title.trim().length === 0 || area.title.length > 200) {
      throw new AppError('Focus area title is invalid.', 502);
    }
    if (typeof area.precautions !== 'string' || area.precautions.length > 1000) {
      throw new AppError('Focus area precautions is invalid.', 502);
    }
    if (!Array.isArray(area.actionableAdvice) || area.actionableAdvice.length === 0 || area.actionableAdvice.length > 10) {
      throw new AppError('Focus area actionableAdvice must have 1 to 10 suggestions.', 502);
    }
    for (const advice of area.actionableAdvice) {
      if (typeof advice !== 'string' || advice.trim().length === 0 || advice.length > 500) {
        throw new AppError('Focus area actionable advice item is invalid.', 502);
      }
    }

    validatedFocusAreas.push({
      category: cat,
      title: area.title.trim(),
      actionableAdvice: area.actionableAdvice.map((a) => a.trim()),
      precautions: area.precautions.trim(),
    });
  }

  // 3. Validate array fields
  const arrayFields = ['habitsToCultivate', 'habitsToAvoid', 'whenToSeekProfessionalGuidance'];
  const validatedArrays = {};

  for (const field of arrayFields) {
    if (!Array.isArray(data[field]) || data[field].length === 0 || data[field].length > 15) {
      throw new AppError(`AI recommendations ${field} must be an array with 1 to 15 items.`, 502);
    }
    for (const item of data[field]) {
      if (typeof item !== 'string' || item.trim().length === 0 || item.length > 500) {
        throw new AppError(`AI recommendations item in ${field} is invalid.`, 502);
      }
    }
    validatedArrays[field] = data[field].map((item) => item.trim());
  }

  // 4. Validate disclaimer
  if (typeof data.disclaimer !== 'string' || data.disclaimer.trim().length === 0 || data.disclaimer.length > 1500) {
    throw new AppError('AI recommendations disclaimer is missing or invalid.', 502);
  }

  return {
    summary: data.summary.trim(),
    focusAreas: validatedFocusAreas,
    habitsToCultivate: validatedArrays.habitsToCultivate,
    habitsToAvoid: validatedArrays.habitsToAvoid,
    whenToSeekProfessionalGuidance: validatedArrays.whenToSeekProfessionalGuidance,
    disclaimer: data.disclaimer.trim(),
  };
};

/**
 * Health Recommendations Controller.
 *
 * Generates structured, educational lifestyle and wellness recommendations.
 * Strictly non-diagnostic, non-prescriptive, no extreme dieting or dangerous workouts.
 *
 * POST /api/health/recommendations
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const { goals, ageGroup, activityLevel, dietaryPreferences, additionalContext } = req.body;

    // Sanitize and validate inputs
    const sanitizedGoals = Array.isArray(goals)
      ? goals.map((g) => (typeof g === 'string' ? g.trim() : '')).filter(Boolean)
      : [];

    if (sanitizedGoals.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one wellness goal is required.',
        },
      });
    }

    if (sanitizedGoals.length > MAX_WELLNESS_GOALS_COUNT) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `You can provide at most ${MAX_WELLNESS_GOALS_COUNT} wellness goals.`,
        },
      });
    }

    for (const goal of sanitizedGoals) {
      if (goal.length > MAX_WELLNESS_GOAL_LENGTH) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Each wellness goal must not exceed ${MAX_WELLNESS_GOAL_LENGTH} characters.`,
          },
        });
      }
    }

    const sanitizedContext = typeof additionalContext === 'string' ? additionalContext.trim() : '';
    if (sanitizedContext.length > MAX_WELLNESS_CONTEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Additional context must not exceed ${MAX_WELLNESS_CONTEXT_LENGTH} characters.`,
        },
      });
    }

    const combinedLength = sanitizedGoals.join(' ').length + sanitizedContext.length;
    if (combinedLength > MAX_COMBINED_WELLNESS_INPUT_LENGTH) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Combined input length exceeds maximum allowed limit of ${MAX_COMBINED_WELLNESS_INPUT_LENGTH} characters.`,
        },
      });
    }

    // Prepare feature prompt
    const featureInstructions = [
      'You are an AI Health and Wellness Educational Assistant.',
      'Provide evidence-informed, general lifestyle, nutrition, physical activity, and stress wellness recommendations.',
      'CRITICAL MEDICAL SAFETY BOUNDARIES:',
      '- NEVER provide a medical diagnosis.',
      '- NEVER prescribe any medication, supplement, or herbal cure.',
      '- NEVER suggest modifying, decreasing, or discontinuing prescription medications.',
      '- NEVER recommend extreme or crash diets, severe calorie restriction (<1200 kcal/day), or dangerous prolonged fasting.',
      '- NEVER recommend dangerous, unmonitored, or high-intensity workouts for individuals with cardiovascular or joint issues.',
      '- NEVER design an individualized medical treatment plan for chronic disease.',
      '- Keep recommendations realistic, moderate, gradual, and accessible.',
      '- Always advise consulting a licensed physician or registered dietitian before starting new exercise regimens or diets.',
      '',
      'You MUST return your response as a valid JSON object strictly matching this schema:',
      '{',
      '  "summary": "A compassionate, encouraging 2-3 sentence overview of supportive wellness guidance.",',
      '  "focusAreas": [',
      '    {',
      '      "category": "nutrition | physical_activity | sleep_hygiene | stress_management | preventive_habits",',
      '      "title": "Clear, informative title for this pillar",',
      '      "actionableAdvice": [ "Specific, practical, safe micro-habit or suggestion" ],',
      '      "precautions": "Safety notes (e.g. increase hydration, start gently, consult doctor if experiencing pain)"',
      '    }',
      '  ],',
      '  "habitsToCultivate": [ "Supportive daily behaviors that build long-term wellness" ],',
      '  "habitsToAvoid": [ "Counterproductive habits to limit or moderate" ],',
      '  "whenToSeekProfessionalGuidance": [ "Specific circumstances or symptoms requiring clinical assessment by a doctor or dietitian" ],',
      '  "disclaimer": "This wellness information is for general educational purposes only. It is not medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider before making major dietary or physical activity changes."',
      '}',
      '',
      'Allowed category enum values for focusAreas: nutrition, physical_activity, sleep_hygiene, stress_management, preventive_habits.',
      'Return ONLY the JSON object, wrapped in a markdown code fence (```json ... ```) or plain JSON.',
    ].join('\n');

    const userProfileText = [
      `Wellness Goals: ${sanitizedGoals.join(', ')}`,
      ageGroup ? `Age Group: ${ageGroup}` : null,
      activityLevel ? `Current Activity Level: ${activityLevel}` : null,
      dietaryPreferences ? `Dietary Preferences: ${dietaryPreferences}` : null,
      sanitizedContext ? `Additional Context: ${sanitizedContext}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const fullPrompt = buildPrompt(featureInstructions, userProfileText);

    // Get singleton AI service
    let aiService;
    try {
      aiService = getAIService();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: 'AI_CONFIG_ERROR',
            message: error.message,
          },
        });
      }
      throw error;
    }

    // Call structured response generation
    const rawResult = await aiService.generateStructuredResponse(fullPrompt, {
      systemInstruction: MEDICAL_SYSTEM_INSTRUCTIONS,
      temperature: 0.3,
      maxOutputTokens: 2500,
    });

    let validatedRecommendations;
    try {
      validatedRecommendations = validateRecommendationsOutput(rawResult);
    } catch (valError) {
      return res.status(502).json({
        success: false,
        error: {
          code: 'AI_MALFORMED_RESPONSE',
          message: 'The AI assistant generated an invalid recommendations structure. Please try again.',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        recommendations: validatedRecommendations,
        provider: env.AI_PROVIDER,
        model: env.AI_MODEL,
        disclaimer: DISCLAIMER,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      const codeMap = {
        503: 'AI_PROVIDER_ERROR',
        429: 'AI_RATE_LIMIT',
        422: 'AI_SAFETY_BLOCK',
        502: 'AI_EMPTY_RESPONSE',
      };

      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: codeMap[error.statusCode] || 'AI_ERROR',
          message: error.message,
        },
      });
    }

    next(new AppError('Health recommendations service encountered an unexpected error. Please try again later.', 500));
  }
};
