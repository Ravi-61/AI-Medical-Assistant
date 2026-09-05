import { getAIService, buildPrompt, MEDICAL_SYSTEM_INSTRUCTIONS } from '../services/ai/index.js';
import {
  DISCLAIMER,
} from '../utils/constants.js';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

const CONFIDENCE_LEVELS = ['high', 'medium', 'low', 'unrecognized'];

/**
 * Validate the structured JSON output returned by the AI provider for medicine information.
 *
 * @param {any} data - Raw parsed JSON from AI
 * @returns {object} Validated medicine information object
 * @throws {AppError} If validation fails
 */
export const validateMedicineOutput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new AppError('AI service returned an invalid medicine response structure.', 502);
  }

  // 1. Validate identification & confidence
  if (typeof data.identified !== 'boolean') {
    throw new AppError('AI response identified field must be a boolean.', 502);
  }

  const confidence = typeof data.confidence === 'string' ? data.confidence.trim().toLowerCase() : '';
  if (!CONFIDENCE_LEVELS.includes(confidence)) {
    throw new AppError(`AI response confidence must be one of: ${CONFIDENCE_LEVELS.join(', ')}.`, 502);
  }

  // 2. Validate string fields
  const stringFields = ['name', 'genericName', 'drugClass', 'howItGenerallyWorks', 'disclaimer'];
  for (const field of stringFields) {
    if (typeof data[field] !== 'string' || data[field].trim().length === 0 || data[field].length > 2500) {
      throw new AppError(`AI medicine response ${field} is missing or invalid.`, 502);
    }
  }

  // 3. Validate array fields
  const arrayFields = [
    'generalUses',
    'commonSideEffects',
    'importantWarnings',
    'generalPrecautions',
    'interactionsToBeAwareOf',
    'whenToSeekMedicalHelp',
    'questionsForHealthcareProfessional',
  ];

  const validatedArrays = {};
  for (const field of arrayFields) {
    if (!Array.isArray(data[field]) || data[field].length > 15) {
      throw new AppError(`AI medicine response ${field} must be an array with at most 15 items.`, 502);
    }
    for (const item of data[field]) {
      if (typeof item !== 'string' || item.trim().length === 0 || item.length > 500) {
        throw new AppError(`AI medicine response item in ${field} is invalid.`, 502);
      }
    }
    validatedArrays[field] = data[field].map((item) => item.trim());
  }

  return {
    identified: data.identified,
    confidence,
    name: data.name.trim(),
    genericName: data.genericName.trim(),
    drugClass: data.drugClass.trim(),
    howItGenerallyWorks: data.howItGenerallyWorks.trim(),
    generalUses: validatedArrays.generalUses,
    commonSideEffects: validatedArrays.commonSideEffects,
    importantWarnings: validatedArrays.importantWarnings,
    generalPrecautions: validatedArrays.generalPrecautions,
    interactionsToBeAwareOf: validatedArrays.interactionsToBeAwareOf,
    whenToSeekMedicalHelp: validatedArrays.whenToSeekMedicalHelp,
    questionsForHealthcareProfessional: validatedArrays.questionsForHealthcareProfessional,
    disclaimer: data.disclaimer.trim(),
  };
};

/**
 * Medicine Information Controller.
 *
 * Provides general educational information regarding common medicines.
 * Strictly non-prescriptive, no dosage calculations, and flags uncertain/unknown medicines.
 *
 * POST /api/medicine/search
 */
export const getMedicineInfo = async (req, res, next) => {
  try {
    const { medicine } = req.body;
    const sanitizedMedicine = medicine.trim();

    // Feature instructions with strict medical safety against prescription/dosage
    const featureInstructions = [
      'You are an AI Medical Information Assistant providing educational information about medicines and pharmacology.',
      'You are NOT a doctor, pharmacist, or prescribing clinician.',
      'CRITICAL SAFETY RULES:',
      '- NEVER provide personalized dosage calculations, specific dosage amounts, or "take X mg" instructions.',
      '- NEVER provide personalized medication administration schedules.',
      '- NEVER advise the user to start, stop, increase, or decrease any prescription medicine.',
      '- NEVER claim this medicine is appropriate for the specific user\'s condition.',
      '- If the medicine name is unknown, ambiguous, misspelled beyond recognition, or fictional, set "identified": false, "confidence": "unrecognized", and advise verifying the spelling or consulting a pharmacist.',
      '- Do NOT fabricate or invent a drug that does not exist.',
      '',
      'You MUST return your response as a valid JSON object strictly matching this schema:',
      '{',
      '  "identified": true, // boolean: true if medicine is recognized, false if unknown or ambiguous',
      '  "confidence": "high | medium | low | unrecognized",',
      '  "name": "Standard brand or common trade name",',
      '  "genericName": "Active ingredient / generic chemical name",',
      '  "drugClass": "Pharmacological or therapeutic drug class",',
      '  "generalUses": [ "Educational list of conditions this medicine is commonly used for" ],',
      '  "howItGenerallyWorks": "Simple, accessible explanation of the mechanism of action in plain language",',
      '  "commonSideEffects": [ "Commonly recognized side effects" ],',
      '  "importantWarnings": [ "Key safety warnings and black-box warnings if applicable (e.g. liver toxicity with high acetaminophen)" ],',
      '  "generalPrecautions": [ "General precautions (e.g. pregnancy, kidney/liver considerations, alcohol)" ],',
      '  "interactionsToBeAwareOf": [ "Notable drug or substance interactions" ],',
      '  "whenToSeekMedicalHelp": [ "Red-flag symptoms of adverse reactions that require urgent medical attention" ],',
      '  "questionsForHealthcareProfessional": [ "Questions the patient can ask their doctor or pharmacist" ],',
      '  "disclaimer": "This information is educational only and does not constitute medical advice or a prescription. Always consult a licensed healthcare professional or pharmacist regarding your medications."',
      '}',
      '',
      'Return ONLY the JSON object, wrapped in a markdown code fence (```json ... ```) or plain JSON.',
    ].join('\n');

    const fullPrompt = buildPrompt(featureInstructions, `Medicine Query: "${sanitizedMedicine}"`);

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
      temperature: 0.2,
      maxOutputTokens: 2048,
    });

    let validatedMedicineInfo;
    try {
      validatedMedicineInfo = validateMedicineOutput(rawResult);
    } catch (valError) {
      return res.status(502).json({
        success: false,
        error: {
          code: 'AI_MALFORMED_RESPONSE',
          message: 'The AI assistant generated an invalid medicine information structure. Please try again.',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        medicine: validatedMedicineInfo,
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

    next(new AppError('Medicine information service encountered an unexpected error. Please try again later.', 500));
  }
};

