import { useState } from 'react';
import {
  FaStethoscope,
  FaPlus,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaShieldAlt,
  FaHeartbeat,
  FaNotesMedical,
  FaQuestionCircle,
  FaRedo,
  FaTrashAlt,
} from 'react-icons/fa';
import symptomService from '../services/symptomService';

const COMMON_SYMPTOM_SUGGESTIONS = [
  'Headache',
  'Fever',
  'Fatigue',
  'Cough',
  'Sore Throat',
  'Nausea',
  'Body Aches',
  'Dizziness',
];

const MAX_SYMPTOMS = 15;
const MAX_CONTEXT_LENGTH = 1000;

function SymptomAnalysis() {
  const [symptoms, setSymptoms] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAddSymptom = (symptomToAdd) => {
    const term = (symptomToAdd || currentInput).trim();
    if (!term) return;

    if (symptoms.length >= MAX_SYMPTOMS) {
      setErrorMessage(`Maximum limit of ${MAX_SYMPTOMS} symptoms reached.`);
      return;
    }

    if (term.length > 100) {
      setErrorMessage('Each symptom must be 100 characters or less.');
      return;
    }

    // Check duplicate (case-insensitive)
    const isDuplicate = symptoms.some((s) => s.toLowerCase() === term.toLowerCase());
    if (isDuplicate) {
      setErrorMessage(`"${term}" has already been added.`);
      return;
    }

    setErrorMessage(null);
    setSymptoms((prev) => [...prev, term]);
    setCurrentInput('');
  };

  const handleRemoveSymptom = (indexToRemove) => {
    setSymptoms((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAll = () => {
    setSymptoms([]);
    setCurrentInput('');
    setAdditionalContext('');
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSymptom();
    }
  };

  const handleAnalyze = async () => {
    if (symptoms.length === 0 || isLoading) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await symptomService.analyzeSymptoms(symptoms, additionalContext);

      if (response?.success && response?.data?.analysis) {
        setAnalysisResult(response.data);
      } else {
        throw new Error('Unexpected response format from symptom analysis service.');
      }
    } catch (err) {
      console.error('Symptom analysis error:', err);

      let userFriendlyError = 'Unable to complete symptom analysis right now. Please try again.';

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 401) {
          userFriendlyError = 'Your session has expired. Please log in again to continue.';
        } else if (status === 429) {
          userFriendlyError = 'You have reached the request limit. Please wait a moment and try again.';
        } else if (status === 503) {
          userFriendlyError =
            data?.error?.message ||
            'The AI analysis service is temporarily unavailable. Please try again shortly.';
        } else if (status === 502) {
          userFriendlyError =
            data?.error?.message ||
            'The AI assistant produced an unexpected response. Please try submitting again.';
        } else if (data?.error?.message) {
          userFriendlyError = data.error.message;
        } else if (data?.message) {
          userFriendlyError = data.message;
        }
      } else if (err.message && !err.message.includes('object')) {
        userFriendlyError = err.message;
      }

      setErrorMessage(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyBadge = (level) => {
    switch (level) {
      case 'emergency':
        return {
          bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300',
          dot: 'bg-red-500',
          label: 'Immediate Medical Attention Recommended',
          border: 'border-l-red-500',
        };
      case 'urgent':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300',
          dot: 'bg-amber-500',
          label: 'Prompt Medical Attention Advised',
          border: 'border-l-amber-500',
        };
      case 'routine':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300',
          dot: 'bg-emerald-500',
          label: 'Routine Medical Follow-up',
          border: 'border-l-emerald-500',
        };
      default:
        return {
          bg: 'bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300',
          dot: 'bg-surface-400',
          label: 'Unclear / Evaluation Needed',
          border: 'border-l-surface-400',
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Symptom Analysis</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60">
              Educational Only
            </span>
          </div>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Enter your symptoms to receive general educational health guidance. This tool does not provide a medical diagnosis.
          </p>
        </div>

        {symptoms.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={isLoading}
            className="btn-ghost text-xs text-surface-500 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start md:self-auto"
            aria-label="Clear all symptoms"
          >
            <FaTrashAlt className="text-xs" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Input Card */}
      <div className="card shadow-card dark:shadow-none border border-surface-200 dark:border-surface-800">
        <div className="space-y-4">
          {/* Symptom text entry */}
          <div>
            <label htmlFor="symptom-input" className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5 uppercase tracking-wider">
              Add Symptoms ({symptoms.length}/{MAX_SYMPTOMS})
            </label>
            <div className="flex items-center gap-2">
              <input
                id="symptom-input"
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a symptom (e.g. Headache, Dry Cough, Dizziness)..."
                disabled={isLoading || symptoms.length >= MAX_SYMPTOMS}
                className="input flex-1"
                maxLength={100}
              />
              <button
                type="button"
                onClick={() => handleAddSymptom()}
                disabled={!currentInput.trim() || isLoading || symptoms.length >= MAX_SYMPTOMS}
                className="btn-primary shrink-0"
                aria-label="Add symptom"
              >
                <FaPlus className="text-xs" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>

          {/* Quick-add suggestions */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-surface-400 dark:text-surface-500 mb-1.5">
              <span>Quick add common symptoms (for convenience only, not a diagnostic checklist):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SYMPTOM_SUGGESTIONS.map((suggestion) => {
                const isSelected = symptoms.some((s) => s.toLowerCase() === suggestion.toLowerCase());
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddSymptom(suggestion)}
                    disabled={isSelected || isLoading || symptoms.length >= MAX_SYMPTOMS}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 border ${
                      isSelected
                        ? 'bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 border-surface-200 dark:border-surface-700 cursor-not-allowed'
                        : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-surface-700'
                    }`}
                  >
                    + {suggestion}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Symptoms Chips */}
          {symptoms.length > 0 && (
            <div className="pt-2 border-t border-surface-100 dark:border-surface-800">
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 mb-2">Selected Symptoms:</p>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/70 text-primary-800 dark:text-primary-300 text-xs font-medium border border-primary-200 dark:border-primary-800/60 shadow-sm"
                  >
                    <span>{symptom}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSymptom(idx)}
                      disabled={isLoading}
                      className="hover:text-red-600 dark:hover:text-red-400 focus:outline-none ml-1"
                      aria-label={`Remove ${symptom}`}
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Context */}
          <div>
            <label htmlFor="context-input" className="block text-xs font-semibold text-surface-700 mb-1.5 uppercase tracking-wider">
              Additional Information (Optional)
            </label>
            <textarea
              id="context-input"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Describe when symptoms started, how severe they feel, or other non-identifying context..."
              disabled={isLoading}
              rows={3}
              maxLength={MAX_CONTEXT_LENGTH}
              className="input resize-none leading-relaxed"
            />
            <div className="text-right text-[11px] text-surface-400 mt-1">
              {additionalContext.length}/{MAX_CONTEXT_LENGTH}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <FaExclamationTriangle className="shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
              <button onClick={() => setErrorMessage(null)} className="font-bold hover:text-red-900 ml-2" aria-label="Dismiss error">
                ×
              </button>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={symptoms.length === 0 || isLoading}
              className="btn-secondary w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Analyzing Symptoms with AI...</span>
                </>
              ) : (
                <>
                  <FaStethoscope />
                  <span>Analyze Symptoms</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Area */}
      {analysisResult ? (
        <div className="space-y-6">
          {/* Header of results */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <FaNotesMedical className="text-primary-600" />
              <span>Assessment Results</span>
            </h2>
            <button
              onClick={handleClearAll}
              className="btn-outline text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5"
            >
              <FaRedo className="text-xs" />
              <span>New Analysis</span>
            </button>
          </div>

          {/* Urgency Guidance Card */}
          {(() => {
            const badge = getUrgencyBadge(analysisResult.analysis.urgency.level);
            return (
              <div className={`card border-l-4 ${badge.border} ${badge.bg} p-5 shadow-sm`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`}></span>
                    <span className="font-bold text-sm sm:text-base">{badge.label}</span>
                  </div>
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-75 font-mono">
                    Urgency: {analysisResult.analysis.urgency.level}
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed mb-3">
                  {analysisResult.analysis.urgency.explanation}
                </p>
                <div className="text-[11px] opacity-80 flex items-center gap-1">
                  <FaShieldAlt className="shrink-0" />
                  <span>
                    This urgency category is an AI-generated educational assessment based strictly on entered text. It does not replace professional medical judgment.
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Summary Card */}
          <div className="card">
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-50 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-primary-700 dark:text-primary-400">
              <FaHeartbeat className="text-primary-600 dark:text-primary-400" />
              <span>Summary</span>
            </h3>
            <p className="text-sm text-surface-800 dark:text-surface-200 leading-relaxed">
              {analysisResult.analysis.summary}
            </p>
          </div>

          {/* Possible Considerations */}
          <div className="card">
            <div className="mb-4">
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-50">Possible Considerations</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                General health categories or conditions that can potentially correlate with the entered symptoms. These are possibilities for discussion with a doctor, NOT a diagnosis.
              </p>
            </div>

            <div className="space-y-3">
              {analysisResult.analysis.possibleConsiderations.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-xs font-bold flex items-center justify-center shrink-0 border border-primary-200/50 dark:border-primary-800/50">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-surface-900 dark:text-surface-50">{item.name}</h4>
                  </div>
                  <p className="text-xs text-surface-700 dark:text-surface-300 leading-relaxed mb-2">
                    {item.explanation}
                  </p>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700 text-xs text-surface-600 dark:text-surface-400">
                    <strong className="text-surface-800 dark:text-surface-200 font-semibold">Why it may relate: </strong>
                    <span>{item.whyItMayRelate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Signs */}
          {analysisResult.analysis.warningSigns?.length > 0 && (
            <div className="card border-l-4 border-l-red-400 dark:border-l-red-500 bg-red-50/40 dark:bg-red-950/30">
              <h3 className="text-sm font-bold text-red-900 dark:text-red-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FaExclamationTriangle className="text-red-500 dark:text-red-400" />
                <span>Warning Signs to Watch For</span>
              </h3>
              <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                Seek immediate medical or emergency evaluation if you experience any of the following:
              </p>
              <ul className="space-y-1.5">
                {analysisResult.analysis.warningSigns.map((sign, idx) => (
                  <li key={idx} className="text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Questions & General Guidance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Additional Questions */}
            <div className="card">
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-50 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-secondary-700 dark:text-secondary-400">
                <FaQuestionCircle className="text-secondary-600 dark:text-secondary-400" />
                <span>Questions for Your Doctor</span>
              </h3>
              <p className="text-xs text-surface-500 dark:text-surface-400 mb-3">
                Consider these details when speaking with a healthcare professional:
              </p>
              <ul className="space-y-2">
                {analysisResult.analysis.additionalQuestions.map((q, idx) => (
                  <li key={idx} className="text-xs text-surface-700 dark:text-surface-300 flex items-start gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-100 dark:border-surface-700">
                    <span className="text-secondary-600 dark:text-secondary-400 font-bold">?</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* General Guidance */}
            <div className="card">
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-50 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-primary-700 dark:text-primary-400">
                <FaInfoCircle className="text-primary-600 dark:text-primary-400" />
                <span>General Self-Care Considerations</span>
              </h3>
              <p className="text-xs text-surface-500 dark:text-surface-400 mb-3">
                General non-prescriptive wellness advice:
              </p>
              <ul className="space-y-2">
                {analysisResult.analysis.generalGuidance.map((tip, idx) => (
                  <li key={idx} className="text-xs text-surface-700 dark:text-surface-300 flex items-start gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-100 dark:border-surface-700">
                    <span className="text-primary-600 dark:text-primary-400 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Model info metadata */}
          <div className="text-[11px] text-surface-400 dark:text-surface-500 text-right font-mono">
            Provider: {analysisResult.provider} • Model: {analysisResult.model}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="card text-center p-8 sm:p-12 border border-surface-200 dark:border-surface-800">
          <div className="w-16 h-16 bg-gradient-to-tr from-secondary-100 to-primary-100 dark:from-secondary-950/60 dark:to-primary-950/60 text-secondary-600 dark:text-secondary-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm border border-secondary-200/50 dark:border-secondary-800/50">
            <FaStethoscope className="text-secondary-600 dark:text-secondary-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-surface-50 mb-2">
            Understand Your Symptoms
          </h2>
          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 max-w-lg mx-auto leading-relaxed mb-6">
            Add the symptoms you are experiencing to receive structured educational information, possible health considerations, and general guidance.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-xs font-medium border border-surface-200 dark:border-surface-700">
            <FaShieldAlt className="text-secondary-600" />
            <span>Strictly educational • Not a medical diagnosis • No database storage</span>
          </div>
        </div>
      )}

      {/* Persistent Disclaimer */}
      <div className="p-4 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 flex items-start gap-3 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
        <FaInfoCircle className="text-primary-600 dark:text-primary-400 shrink-0 text-base mt-0.5" />
        <div>
          <strong className="text-surface-800 dark:text-surface-200">Important Medical Disclaimer:</strong> This tool provides general educational information only. It does not diagnose medical conditions or replace evaluation, diagnosis, or treatment from a licensed healthcare professional. If you are experiencing severe, worsening, or life-threatening symptoms, contact local emergency services immediately.
        </div>
      </div>
    </div>
  );
}

export default SymptomAnalysis;

