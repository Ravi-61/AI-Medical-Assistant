import path from 'path';
import { PDFParse } from 'pdf-parse';
import { getAIService, buildPrompt, MEDICAL_SYSTEM_INSTRUCTIONS } from '../services/ai/index.js';
import {
  DISCLAIMER,
  MAX_REPORT_TEXT_LENGTH,
} from '../utils/constants.js';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

/**
 * Validate the structured JSON output returned by the AI provider for medical reports.
 * Ensures all required report explanation fields are present and properly typed.
 *
 * @param {any} data - Raw parsed JSON from AI
 * @returns {object} Validated explanation object
 * @throws {AppError} If validation fails
 */
export const validateReportOutput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new AppError('AI service returned an invalid report explanation structure.', 502);
  }

  // 1. Validate overview
  if (typeof data.overview !== 'string' || data.overview.trim().length === 0 || data.overview.length > 3000) {
    throw new AppError('AI response overview is missing, invalid, or exceeds length limit.', 502);
  }

  // 2. Validate keyFindings
  if (!Array.isArray(data.keyFindings)) {
    throw new AppError('AI response keyFindings must be an array.', 502);
  }
  for (const finding of data.keyFindings) {
    if (!finding || typeof finding !== 'object') {
      throw new AppError('Invalid keyFinding item.', 502);
    }
    if (typeof finding.item !== 'string' || finding.item.trim().length === 0 || finding.item.length > 200) {
      throw new AppError('Key finding item name is missing or invalid.', 502);
    }
    if (typeof finding.value !== 'string' || finding.value.trim().length === 0 || finding.value.length > 200) {
      throw new AppError('Key finding value is missing or invalid.', 502);
    }
    if (typeof finding.referenceRange !== 'string' || finding.referenceRange.length > 200) {
      throw new AppError('Key finding referenceRange is invalid.', 502);
    }
    if (typeof finding.explanation !== 'string' || finding.explanation.trim().length === 0 || finding.explanation.length > 1500) {
      throw new AppError('Key finding explanation is missing or invalid.', 502);
    }
  }

  // 3. Validate medicalTerms
  if (!Array.isArray(data.medicalTerms)) {
    throw new AppError('AI response medicalTerms must be an array.', 502);
  }
  for (const term of data.medicalTerms) {
    if (!term || typeof term !== 'object') {
      throw new AppError('Invalid medicalTerm item.', 502);
    }
    if (typeof term.term !== 'string' || term.term.trim().length === 0 || term.term.length > 200) {
      throw new AppError('Medical term is missing or invalid.', 502);
    }
    if (typeof term.meaning !== 'string' || term.meaning.trim().length === 0 || term.meaning.length > 1500) {
      throw new AppError('Medical term meaning is missing or invalid.', 502);
    }
  }

  // 4. Validate questionsForDoctor
  if (!Array.isArray(data.questionsForDoctor)) {
    throw new AppError('AI response questionsForDoctor must be an array.', 502);
  }
  for (const q of data.questionsForDoctor) {
    if (typeof q !== 'string' || q.trim().length === 0 || q.length > 500) {
      throw new AppError('Doctor question must be a valid string.', 502);
    }
  }

  // 5. Validate generalGuidance
  if (!Array.isArray(data.generalGuidance)) {
    throw new AppError('AI response generalGuidance must be an array.', 502);
  }
  for (const g of data.generalGuidance) {
    if (typeof g !== 'string' || g.trim().length === 0 || g.length > 800) {
      throw new AppError('General guidance item must be a valid string.', 502);
    }
  }

  // 6. Validate importantNotes
  if (!Array.isArray(data.importantNotes)) {
    throw new AppError('AI response importantNotes must be an array.', 502);
  }
  for (const n of data.importantNotes) {
    if (typeof n !== 'string' || n.trim().length === 0 || n.length > 800) {
      throw new AppError('Important note item must be a valid string.', 502);
    }
  }

  // 7. Validate disclaimer
  if (typeof data.disclaimer !== 'string' || data.disclaimer.trim().length === 0 || data.disclaimer.length > 1500) {
    throw new AppError('AI response disclaimer is missing or invalid.', 502);
  }

  return {
    overview: data.overview.trim(),
    keyFindings: data.keyFindings.map((f) => ({
      item: f.item.trim(),
      value: f.value.trim(),
      referenceRange: f.referenceRange.trim(),
      explanation: f.explanation.trim(),
    })),
    medicalTerms: data.medicalTerms.map((t) => ({
      term: t.term.trim(),
      meaning: t.meaning.trim(),
    })),
    questionsForDoctor: data.questionsForDoctor.map((q) => q.trim()),
    generalGuidance: data.generalGuidance.map((g) => g.trim()),
    importantNotes: data.importantNotes.map((n) => n.trim()),
    disclaimer: data.disclaimer.trim(),
  };
};

/**
 * Medical Report Analysis Controller.
 *
 * Extracts text from uploaded PDF or TXT reports in memory and generates an
 * educational, non-diagnostic explanation using the AI service.
 *
 * POST /api/reports/analyze
 */
export const analyzeReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Medical report file is required. Please upload a PDF or TXT file.',
      });
    }

    const { buffer, originalname, mimetype, size } = req.file;

    if (!buffer || size === 0) {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file is empty. Please upload a valid document.',
      });
    }

    const ext = path.extname(originalname || '').toLowerCase();
    if (ext !== '.pdf' && ext !== '.txt') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF (.pdf) and Text (.txt) files are supported.',
      });
    }

    let extractedText = '';
    let fileData = null;

    if (ext === '.pdf') {
      // Validate PDF signature
      const header = buffer.slice(0, 5).toString('ascii');
      if (header !== '%PDF-') {
        return res.status(400).json({
          success: false,
          message: 'Invalid or malformed PDF file format.',
        });
      }

      // Prepare in-memory base64 representation for multimodal document analysis
      fileData = {
        mimeType: 'application/pdf',
        data: buffer.toString('base64'),
      };

      // Extract digital text & table structure via pdf-parse
      let parser = null;
      try {
        parser = new PDFParse({ data: buffer });
        await parser.load();
        const textResult = await parser.getText();
        let rawText = typeof textResult === 'string' ? textResult : (textResult?.text || '');

        // Remove synthetic page markers like "-- 1 of 1 --"
        rawText = rawText.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '').trim();

        // Also extract tabular contents if available to ensure table cells are not lost
        try {
          const tableResult = await parser.getTable();
          if (tableResult?.pages) {
            const tableRows = [];
            for (const page of tableResult.pages) {
              if (Array.isArray(page.tables)) {
                for (const table of page.tables) {
                  if (Array.isArray(table)) {
                    for (const row of table) {
                      if (Array.isArray(row) && row.length > 0) {
                        const rowStr = row.map((c) => String(c || '').trim()).filter(Boolean).join(' | ');
                        if (rowStr) tableRows.push(rowStr);
                      }
                    }
                  }
                }
              }
            }
            if (tableRows.length > 0) {
              rawText += '\n\nExtracted Report Tables:\n' + tableRows.join('\n');
            }
          }
        } catch {
          // Table extraction is an enhancement; proceed if not present
        }

        extractedText = rawText.trim();
      } catch (pdfErr) {
        // If digital text extraction fails, multimodal inlineData still provides full document visibility
        extractedText = '';
      } finally {
        if (parser && typeof parser.destroy === 'function') {
          await parser.destroy().catch(() => {});
        }
      }
    } else {
      // TXT file
      // Check for binary null bytes
      if (buffer.slice(0, 512).includes(0x00)) {
        return res.status(400).json({
          success: false,
          message: 'Uploaded text file contains binary data or is malformed.',
        });
      }
      extractedText = buffer.toString('utf-8');
    }

    // Release raw memory buffer immediately (security & memory safety)
    req.file.buffer = null;

    const trimmedText = extractedText.trim();
    if (!trimmedText && !fileData) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded report contains no readable content.',
      });
    }

    if (trimmedText.length > MAX_REPORT_TEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Extracted text length (${trimmedText.length} characters) exceeds the maximum allowed limit of ${MAX_REPORT_TEXT_LENGTH} characters.`,
      });
    }

    // Construct feature instructions with strict medical safety and thorough extraction rules
    const featureInstructions = [
      'You are an AI Medical Information Assistant helping a patient understand their medical report for educational purposes only.',
      'You are NOT a doctor. You do NOT diagnose medical conditions or diseases.',
      'Do NOT provide definitive diagnostic conclusions or second opinions.',
      'CRITICAL RULES:',
      '- Carefully examine the entire medical report document or text provided.',
      '- Inspect all laboratory panels, test names, measurements, Complete Blood Counts (CBC), metabolic panels, lipid panels, urinalysis, imaging findings, or other clinical tests.',
      '- For every test or measurement present, extract the exact observed value, reference range (if stated), and an accessible, plain-language educational explanation.',
      '- Do NOT claim the report is blank, missing, or incomplete when test results, measurements, or findings are visible in the document.',
      '- NEVER invent laboratory values, measurements, or findings not present in the report.',
      '- If a reference range is not explicitly stated in the report, set referenceRange to "Not provided in report".',
      '- Never infer or speculate on missing numbers.',
      '- If a section of the report is unreadable or ambiguous, note that in importantNotes.',
      '- Do not claim the report confirms or rules out a disease.',
      '- Recommend the user discuss all findings with their prescribing or attending healthcare professional.',
      '',
      'You MUST return your response as a valid JSON object strictly matching this schema:',
      '{',
      '  "overview": "Clear, accessible summary of what kind of report this is and what it broadly covers",',
      '  "keyFindings": [',
      '    {',
      '      "item": "Test name, panel, or measurement name",',
      '      "value": "Exact value from report",',
      '      "referenceRange": "Reference range if present in report, or \'Not provided in report\'",',
      '      "explanation": "Simple, accessible explanation of what this test/measurement generally indicates"',
      '    }',
      '  ],',
      '  "medicalTerms": [',
      '    {',
      '      "term": "Medical term or abbreviation from the report",',
      '      "meaning": "Plain-language definition for the patient"',
      '    }',
      '  ],',
      '  "questionsForDoctor": [',
      '    "Constructive question the patient can bring to their healthcare provider"',
      '  ],',
      '  "generalGuidance": [',
      '    "General, non-prescriptive wellness or preparation consideration"',
      '  ],',
      '  "importantNotes": [',
      '    "Important observation or note about the report content (e.g. lab findings must be evaluated together with clinical symptoms)"',
      '  ],',
      '  "disclaimer": "This explanation is educational and does not constitute medical advice or diagnosis. Consult a qualified doctor to interpret your medical reports."',
      '}',
      '',
      'Return ONLY the JSON object, wrapped in a markdown code fence (```json ... ```) or plain JSON.',
    ].join('\n');

    const contentPrompt = trimmedText
      ? `Extracted Medical Report Content:\n${trimmedText}`
      : 'The medical report document is attached. Please read and analyze all visible test results, panels, and values directly from the document.';

    const fullPrompt = buildPrompt(featureInstructions, contentPrompt);

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

    // Call structured generation with multimodal document attached if PDF
    let rawResult;
    try {
      rawResult = await aiService.generateStructuredResponse(fullPrompt, {
        systemInstruction: MEDICAL_SYSTEM_INSTRUCTIONS,
        temperature: 0.2,
        maxOutputTokens: 2048,
        ...(fileData && { fileData }),
      });
    } finally {
      // Immediately release base64 buffer from memory
      fileData = null;
    }

    let validatedExplanation;
    try {
      validatedExplanation = validateReportOutput(rawResult);
    } catch (valError) {
      return res.status(502).json({
        success: false,
        error: {
          code: 'AI_MALFORMED_RESPONSE',
          message: 'The AI assistant generated an invalid or incomplete report explanation structure. Please try again.',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        explanation: validatedExplanation,
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

    next(new AppError('Medical report explanation service encountered an unexpected error. Please try again later.', 500));
  }
};

