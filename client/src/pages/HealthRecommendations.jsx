import { useState } from 'react';
import {
  FaHeartbeat,
  FaAppleAlt,
  FaRunning,
  FaMoon,
  FaSpa,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaPlus,
  FaTimes,
  FaUserMd,
  FaLightbulb,
} from 'react-icons/fa';
import healthService from '../services/healthService';

const PRESET_GOALS = [
  'Cardiovascular health & stamina',
  'Improve sleep quality & routine',
  'Balanced wholesome nutrition',
  'Stress management & calm',
  'Sustainable daily energy',
  'Joint mobility & posture',
];

const AGE_GROUPS = [
  'Young Adult (18-30)',
  'Adult (31-50)',
  'Mature Adult (51-65)',
  'Senior (65+)',
];

const ACTIVITY_LEVELS = [
  'Sedentary (mostly desk/sitting)',
  'Lightly Active (light walking 1-3 days/wk)',
  'Moderately Active (exercise 3-5 days/wk)',
  'Very Active (heavy exercise 6-7 days/wk)',
];

const DIETARY_PREFERENCES = [
  'No specific diet',
  'Mediterranean style',
  'Vegetarian',
  'Plant-based / Vegan',
  'Low sodium / Heart friendly',
  'Diabetic / Low glycemic',
];

export default function HealthRecommendations() {
  const [goals, setGoals] = useState(['Cardiovascular health & stamina']);
  const [customGoal, setCustomGoal] = useState('');
  const [ageGroup, setAgeGroup] = useState('Adult (31-50)');
  const [activityLevel, setActivityLevel] = useState('Lightly Active (light walking 1-3 days/wk)');
  const [dietaryPreferences, setDietaryPreferences] = useState('No specific diet');
  const [additionalContext, setAdditionalContext] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const toggleGoal = (goal) => {
    if (goals.includes(goal)) {
      if (goals.length > 1) {
        setGoals(goals.filter((g) => g !== goal));
      }
    } else {
      if (goals.length < 5) {
        setGoals([...goals, goal]);
      }
    }
  };

  const addCustomGoal = (e) => {
    e.preventDefault();
    const trimmed = customGoal.trim();
    if (!trimmed) return;
    if (trimmed.length > 100) {
      setError('Each goal must be 100 characters or less.');
      return;
    }
    if (goals.length >= 5) {
      setError('You can select or add a maximum of 5 wellness goals.');
      return;
    }
    if (!goals.includes(trimmed)) {
      setGoals([...goals, trimmed]);
      setCustomGoal('');
      setError(null);
    }
  };

  const removeGoal = (goalToRemove) => {
    if (goals.length <= 1) {
      setError('At least one wellness goal is required.');
      return;
    }
    setGoals(goals.filter((g) => g !== goalToRemove));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (goals.length === 0) {
      setError('Please select or specify at least one wellness goal.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        goals,
        ageGroup,
        activityLevel,
        dietaryPreferences,
        additionalContext: additionalContext.trim() || undefined,
      };

      const response = await healthService.getRecommendations(payload);
      if (response && response.success && response.data) {
        setResult(response.data);
      } else {
        setError('Unexpected response format received from the server.');
      }
    } catch (err) {
      const serverMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to generate health recommendations. Please try again later.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'nutrition':
        return <FaAppleAlt className="text-emerald-600" />;
      case 'physical_activity':
        return <FaRunning className="text-blue-600" />;
      case 'sleep_hygiene':
        return <FaMoon className="text-indigo-600" />;
      case 'stress_management':
        return <FaSpa className="text-purple-600" />;
      case 'preventive_habits':
      default:
        return <FaShieldAlt className="text-teal-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="card p-6 bg-gradient-to-r from-emerald-900/5 via-teal-800/10 to-transparent dark:from-emerald-950/40 dark:via-teal-900/20 dark:to-transparent border border-emerald-100 dark:border-emerald-900/40">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FaHeartbeat className="text-2xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">Health & Wellness Recommendations</h1>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1 max-w-2xl">
              Receive evidence-informed, general lifestyle guidance tailored to your personal wellness goals,
              including physical activity, nutrition habits, sleep hygiene, and stress resilience.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 rounded-lg px-3 py-1.5 w-fit">
              <FaShieldAlt className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>General Wellness Focus:</strong> No extreme diets, no prescription advice, no disease diagnosis. Always consult your doctor before major lifestyle changes.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card (displayed when no result or when editing) */}
      {!result && (
        <div className="card p-6 shadow-sm border border-surface-200 dark:border-surface-800 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Selection */}
            <div>
              <label className="block text-sm font-semibold text-surface-800 dark:text-surface-200 mb-1.5">
                Primary Wellness Goals (Select 1 to 5)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_GOALS.map((goal) => {
                  const isSelected = goals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      {isSelected && <FaCheckCircle className="text-[10px]" />}
                      {goal}
                    </button>
                  );
                })}
              </div>

              {/* Custom Goal Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  maxLength={100}
                  placeholder="Or type a custom goal (e.g. Lower daily sodium intake)..."
                  className="input py-2 text-xs flex-1"
                  disabled={goals.length >= 5}
                />
                <button
                  type="button"
                  onClick={addCustomGoal}
                  disabled={!customGoal.trim() || goals.length >= 5}
                  className="btn-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <FaPlus className="text-[10px]" /> Add Goal
                </button>
              </div>

              {/* Active Goals Chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {goals.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                  >
                    <span>{g}</span>
                    <button
                      type="button"
                      onClick={() => removeGoal(g)}
                      className="text-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-200 cursor-pointer"
                      title="Remove goal"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Profile Context Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-surface-100 dark:border-surface-800">
              <div>
                <label htmlFor="age-group-select" className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                  Age Bracket
                </label>
                <select
                  id="age-group-select"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="input py-2 text-xs"
                >
                  {AGE_GROUPS.map((ag) => (
                    <option key={ag} value={ag}>
                      {ag}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="activity-level-select" className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                  Current Activity Level
                </label>
                <select
                  id="activity-level-select"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="input py-2 text-xs"
                >
                  {ACTIVITY_LEVELS.map((al) => (
                    <option key={al} value={al}>
                      {al}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="diet-pref-select" className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                  Dietary Pattern
                </label>
                <select
                  id="diet-pref-select"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                  className="input py-2 text-xs"
                >
                  {DIETARY_PREFERENCES.map((dp) => (
                    <option key={dp} value={dp}>
                      {dp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Context */}
            <div>
              <label htmlFor="health-context-textarea" className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                Additional Health & Lifestyle Context (Optional)
              </label>
              <textarea
                id="health-context-textarea"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Mention any relevant lifestyle context (e.g. shift worker, desk-bound job, recovering from mild sprain)..."
                className="input py-2 text-xs w-full resize-none"
              />
              <div className="text-right text-[11px] text-surface-400 dark:text-surface-500 mt-1">
                {additionalContext.length} / 1000 characters
              </div>
            </div>

            {/* Error banner if present */}
            {error && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm animate-fadeIn"
              >
                <FaExclamationTriangle className="text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1 text-xs">
                  <h4 className="font-semibold text-rose-900">Notice</h4>
                  <p className="mt-0.5 text-rose-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || goals.length === 0}
                className="btn-primary px-6 py-2.5 text-sm font-semibold flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    <span>Generating Guidance...</span>
                  </>
                ) : (
                  <>
                    <FaHeartbeat className="text-sm" />
                    <span>Generate Health Recommendations</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="card p-8 text-center space-y-4 shadow-sm border border-surface-200 animate-pulse">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <FaSpinner className="animate-spin text-xl" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-surface-800">Synthesizing Lifestyle Recommendations...</h3>
            <p className="text-xs text-surface-500 max-w-md mx-auto">
              Analyzing wellness goals, sleep hygiene, nutrition pillars, and preventive safety principles.
            </p>
          </div>
        </div>
      )}

      {/* Results View */}
      {!loading && result && result.recommendations && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Card with Reset button */}
          <div className="card p-6 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/40 dark:to-surface-900 border border-surface-200 dark:border-surface-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Holistic Wellness Plan</span>
              <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-50 mt-0.5">Your Personalized Lifestyle Guidance</h2>
              <div className="mt-1 flex flex-wrap gap-2">
                {goals.map((g) => (
                  <span key={g} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    {g}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 px-3.5 py-1.5 rounded-lg border border-surface-300 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              Update Preferences
            </button>
          </div>

          {/* Overview Summary */}
          <div className="card p-6 bg-surface-50/50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-700 dark:text-surface-300 flex items-center gap-2 mb-2">
              <FaLightbulb className="text-amber-500" /> Executive Wellness Overview
            </h3>
            <p className="text-sm text-surface-800 dark:text-surface-200 leading-relaxed">
              {result.recommendations.summary}
            </p>
          </div>

          {/* Focus Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.recommendations.focusAreas?.map((area, idx) => (
              <div key={idx} className="card p-6 border border-surface-200 dark:border-surface-800 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-sm">
                      {getCategoryIcon(area.category)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                        {area.category.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-surface-900 dark:text-surface-50 leading-tight">{area.title}</h4>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {area.actionableAdvice?.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-xs text-surface-700 dark:text-surface-300 flex items-start gap-2 bg-surface-50/60 dark:bg-surface-800/60 p-2 rounded-lg">
                        <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0 text-xs" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {area.precautions && (
                  <div className="pt-3 border-t border-surface-100 dark:border-surface-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                    <FaShieldAlt className="text-amber-600 mt-0.5 shrink-0 text-xs" />
                    <span><strong>Precaution:</strong> {area.precautions}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Habits to Cultivate vs Avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cultivate */}
            <div className="card p-5 bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <FaCheckCircle className="text-emerald-600 dark:text-emerald-400" /> Supportive Habits to Cultivate
              </h4>
              <ul className="space-y-2">
                {result.recommendations.habitsToCultivate?.map((habit, idx) => (
                  <li key={idx} className="text-xs text-emerald-950 dark:text-emerald-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <span>{habit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avoid */}
            <div className="card p-5 bg-amber-50/40 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <FaTimesCircle className="text-amber-600 dark:text-amber-400" /> Counterproductive Habits to Limit
              </h4>
              <ul className="space-y-2">
                {result.recommendations.habitsToAvoid?.map((habit, idx) => (
                  <li key={idx} className="text-xs text-amber-950 dark:text-amber-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                    <span>{habit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* When to Seek Professional Guidance */}
          {result.recommendations.whenToSeekProfessionalGuidance?.length > 0 && (
            <div className="card p-5 bg-teal-50/40 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/50 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center gap-2">
                <FaUserMd className="text-teal-600 dark:text-teal-400" /> When to Seek Professional Clinical Guidance
              </h4>
              <ul className="space-y-1.5">
                {result.recommendations.whenToSeekProfessionalGuidance.map((trigger, idx) => (
                  <li key={idx} className="text-xs text-teal-950 dark:text-teal-300 flex items-start gap-2">
                    <FaExclamationTriangle className="text-teal-600 mt-0.5 shrink-0 text-xs" />
                    <span>{trigger}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Persistent Educational Disclaimer */}
          <div className="p-4 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 text-xs leading-relaxed space-y-1">
            <div className="flex items-center gap-2 font-semibold text-surface-800 dark:text-surface-200">
              <FaShieldAlt className="text-emerald-700 dark:text-emerald-400" />
              <span>Lifestyle & Wellness Educational Disclaimer</span>
            </div>
            <p>
              {result.disclaimer ||
                'This wellness information is for general educational and informational purposes only. It is not medical advice, diagnosis, or treatment. Always consult a qualified physician or registered dietitian before starting a new exercise regimen or significantly altering your dietary intake.'}
            </p>
            {result.model && (
              <div className="text-[11px] text-surface-400 dark:text-surface-500 pt-1">
                AI Service: {result.provider} ({result.model})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
