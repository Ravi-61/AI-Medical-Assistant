import { useState } from 'react';
import {
  FaPills,
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaQuestionCircle,
  FaInfoCircle,
  FaExclamationCircle,
  FaShieldAlt,
  FaListUl,
  FaUserMd,
  FaExchangeAlt,
} from 'react-icons/fa';
import medicineService from '../services/medicineService';

const SAMPLE_MEDICINES = [
  'Paracetamol',
  'Amoxicillin',
  'Ibuprofen',
  'Metformin',
  'Lisinopril',
  'Cetirizine',
];

export default function MedicineInfo() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSearch = async (medicineToSearch) => {
    const searchTerm = (medicineToSearch || query).trim();
    if (!searchTerm) {
      setError('Please enter a medicine name to search.');
      return;
    }

    if (searchTerm.length > 150) {
      setError('Medicine name must be 150 characters or less.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await medicineService.searchMedicine(searchTerm);
      if (response && response.success && response.data) {
        setResult(response.data);
      } else {
        setError('Unexpected response format received from the server.');
      }
    } catch (err) {
      const serverMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Unable to retrieve medicine information. Please check your connection or try again later.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSelectSample = (sample) => {
    setQuery(sample);
    handleSearch(sample);
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setError(null);
  };

  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <FaCheckCircle className="text-xs" /> High Confidence
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <FaInfoCircle className="text-xs" /> Moderate Confidence
          </span>
        );
      case 'low':
      case 'unrecognized':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <FaExclamationTriangle className="text-xs" /> Uncertain / Unrecognized
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="card p-6 bg-gradient-to-r from-teal-900/5 via-teal-800/10 to-transparent dark:from-teal-950/40 dark:via-teal-900/20 dark:to-transparent border border-teal-100 dark:border-teal-900/40">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FaPills className="text-2xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">Medicine Information</h1>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1 max-w-2xl">
              Search any medicine to view general educational pharmacology information including drug class,
              recognized uses, safety precautions, potential side effects, and questions for your doctor or pharmacist.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-lg px-3 py-1.5 w-fit">
              <FaShieldAlt className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Educational Only:</strong> Does not provide prescriptions, personal dosage instructions, or recommendations to modify medication.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Card */}
      <div className="card p-6 shadow-sm border border-surface-200 dark:border-surface-800">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="medicine-search-input" className="block text-sm font-semibold text-surface-800 dark:text-surface-200 mb-1.5">
              Medicine or Active Ingredient Name
            </label>
            <div className="relative flex items-center">
              <FaSearch className="absolute left-3.5 text-surface-400 pointer-events-none" />
              <input
                id="medicine-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                maxLength={150}
                placeholder="Enter medicine name (e.g., Paracetamol, Amoxicillin, Metformin)..."
                className="input pl-10 pr-24 py-2.5 text-sm w-full"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-primary absolute right-1.5 px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <FaSearch className="text-xs" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex justify-between items-center text-xs text-surface-500 dark:text-surface-400 mt-1.5">
              <span>Supports brand names, generics, and pharmacological classes</span>
              <span>{query.length} / 150</span>
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="pt-2 border-t border-surface-100 dark:border-surface-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Suggested Examples:</span>
            {SAMPLE_MEDICINES.map((med) => (
              <button
                key={med}
                type="button"
                onClick={() => handleSelectSample(med)}
                disabled={loading}
                className="px-2.5 py-1 text-xs bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 rounded-md transition-colors font-medium cursor-pointer"
              >
                {med}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm animate-fadeIn"
        >
          <FaExclamationCircle className="text-rose-600 mt-0.5 shrink-0 text-lg" />
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-rose-900">Information Lookup Notice</h4>
            <p className="mt-0.5 text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="card p-8 text-center space-y-4 shadow-sm border border-surface-200 animate-pulse">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
            <FaSpinner className="animate-spin text-xl" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-surface-800">Retrieving Pharmacology Information...</h3>
            <p className="text-xs text-surface-500 max-w-md mx-auto">
              Analyzing educational pharmacology databases, drug class details, safety precautions, and interactions.
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {!loading && result && result.medicine && (
        <div className="space-y-6 animate-fadeIn">
          {/* Unrecognized / Ambiguous Banner */}
          {(!result.medicine.identified || result.medicine.confidence === 'unrecognized') && (
            <div className="card p-5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 rounded-xl shadow-sm text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-2xl text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-amber-950 dark:text-amber-100">Medicine Could Not Be Confidently Identified</h3>
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                    The requested medicine name <strong>&quot;{query}&quot;</strong> could not be verified against recognized pharmaceutical databases or may be ambiguous / misspelled.
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 pt-1">
                    <strong>Crucial Patient Safety Notice:</strong> Never consume unknown, unlabeled, or unverified medications. Always verify the exact spelling from the original prescription packaging or consult a licensed pharmacist or physician.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Identified Medicine Card */}
          {result.medicine.identified && (
            <div className="card overflow-hidden shadow-sm border border-surface-200 dark:border-surface-800">
              {/* Header bar */}
              <div className="p-6 bg-gradient-to-r from-teal-50 to-white dark:from-teal-950/40 dark:to-surface-900 border-b border-surface-200 dark:border-surface-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-extrabold text-surface-900 dark:text-surface-50">{result.medicine.name}</h2>
                      {getConfidenceBadge(result.medicine.confidence)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-surface-600 dark:text-surface-400">
                      <span><strong>Active Ingredient:</strong> {result.medicine.genericName}</span>
                      <span className="text-surface-300 dark:text-surface-600">•</span>
                      <span><strong>Drug Class:</strong> <span className="inline-block px-2 py-0.5 bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 rounded text-xs font-semibold">{result.medicine.drugClass}</span></span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs font-medium text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 px-3 py-1.5 rounded-lg border border-surface-300 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                  >
                    New Search
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* How it works */}
                {result.medicine.howItGenerallyWorks && (
                  <div>
                    <h3 className="text-sm font-bold text-surface-800 dark:text-surface-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FaInfoCircle className="text-teal-600 dark:text-teal-400" /> How It Generally Works
                    </h3>
                    <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed bg-surface-50 dark:bg-surface-800/60 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                      {result.medicine.howItGenerallyWorks}
                    </p>
                  </div>
                )}

                {/* Grid: General Uses & Common Side Effects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Uses */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-surface-800 dark:text-surface-200 uppercase tracking-wider flex items-center gap-2">
                      <FaListUl className="text-teal-600 dark:text-teal-400" /> Common Educational Uses
                    </h3>
                    <ul className="space-y-2">
                      {result.medicine.generalUses?.map((use, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 p-2.5 rounded-lg border border-surface-100 dark:border-surface-700 shadow-2xs">
                          <FaCheckCircle className="text-emerald-500 mt-1 shrink-0 text-xs" />
                          <span>{use}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Side Effects */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-surface-800 dark:text-surface-200 uppercase tracking-wider flex items-center gap-2">
                      <FaExclamationTriangle className="text-amber-500 dark:text-amber-400" /> Recognized Side Effects
                    </h3>
                    <ul className="space-y-2">
                      {result.medicine.commonSideEffects?.map((effect, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 p-2.5 rounded-lg border border-surface-100 dark:border-surface-700 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                          <span>{effect}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Warnings & Precautions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Important Warnings */}
                  <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <FaExclamationCircle className="text-rose-600 dark:text-rose-400" /> Important Safety Warnings
                    </h4>
                    <ul className="space-y-1.5">
                      {result.medicine.importantWarnings?.map((warning, idx) => (
                        <li key={idx} className="text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* General Precautions */}
                  <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <FaShieldAlt className="text-amber-600 dark:text-amber-400" /> General Precautions
                    </h4>
                    <ul className="space-y-1.5">
                      {result.medicine.generalPrecautions?.map((prec, idx) => (
                        <li key={idx} className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{prec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Interactions & Red Flags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Notable Interactions */}
                  <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-surface-800 dark:text-surface-200 flex items-center gap-1.5">
                      <FaExchangeAlt className="text-teal-600 dark:text-teal-400" /> Known Interactions to Note
                    </h4>
                    <ul className="space-y-1.5">
                      {result.medicine.interactionsToBeAwareOf?.map((item, idx) => (
                        <li key={idx} className="text-xs text-surface-700 dark:text-surface-300 flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Red-Flag Urgent Symptoms */}
                  <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 dark:text-red-200 flex items-center gap-1.5">
                      <FaExclamationTriangle className="text-red-600 dark:text-red-400" /> When to Seek Immediate Medical Attention
                    </h4>
                    <ul className="space-y-1.5">
                      {result.medicine.whenToSeekMedicalHelp?.map((flag, idx) => (
                        <li key={idx} className="text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Questions for Healthcare Professional */}
                {result.medicine.questionsForHealthcareProfessional?.length > 0 && (
                  <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center gap-2 mb-2">
                      <FaQuestionCircle className="text-teal-600 dark:text-teal-400 text-sm" /> Questions for Your Doctor or Pharmacist
                    </h4>
                    <ul className="space-y-1.5">
                      {result.medicine.questionsForHealthcareProfessional.map((q, idx) => (
                        <li key={idx} className="text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
                          <FaUserMd className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0 text-xs" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Persistent Educational Disclaimer */}
          <div className="p-4 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 text-xs leading-relaxed space-y-1">
            <div className="flex items-center gap-2 font-semibold text-surface-800 dark:text-surface-200">
              <FaShieldAlt className="text-teal-700 dark:text-teal-400" />
              <span>Medical Safety & Pharmacology Disclaimer</span>
            </div>
            <p>
              {result.disclaimer ||
                'This information is provided for educational and informational purposes only and does not constitute medical advice, diagnosis, or personalized dosage prescriptions. Always consult a licensed healthcare professional or registered pharmacist regarding medications, adjustments, or safety questions.'}
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
