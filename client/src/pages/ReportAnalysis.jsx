import { useState, useRef } from 'react';
import {
  FaFileAlt,
  FaFilePdf,
  FaCloudUploadAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaShieldAlt,
  FaQuestionCircle,
  FaBookMedical,
  FaRedo,
  FaTrashAlt,
  FaClipboardList,
} from 'react-icons/fa';
import reportService from '../services/reportService';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.txt'];

function ReportAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      setErrorMessage('Unsupported file format. Please upload a PDF (.pdf) or Text (.txt) file.');
      return;
    }

    if (file.size === 0) {
      setErrorMessage('The selected file is empty. Please select a valid document.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setAnalysisResult(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAll = () => {
    handleRemoveFile();
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || isLoading) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await reportService.analyzeReport(selectedFile);

      if (response?.success && response?.data?.explanation) {
        setAnalysisResult(response.data);
      } else {
        throw new Error('Unexpected response format from report analysis service.');
      }
    } catch (err) {
      console.error('Report analysis error:', err);

      let userFriendlyError = 'Unable to analyze the medical report. Please try again.';

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
            'The AI assistant produced an unexpected response structure. Please try submitting again.';
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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-surface-900">Medical Report Explanation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              Educational Only
            </span>
          </div>
          <p className="text-sm text-surface-500 mt-1">
            Upload your laboratory or diagnostic report (PDF or TXT) for an educational, plain-language breakdown.
          </p>
        </div>

        {selectedFile && (
          <button
            onClick={handleClearAll}
            disabled={isLoading}
            className="btn-ghost text-xs text-surface-500 hover:text-red-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start md:self-auto"
            aria-label="Clear uploaded file"
          >
            <FaTrashAlt className="text-xs" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Upload & Controls Card */}
      <div className="card shadow-card border border-surface-200">
        <div className="space-y-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            onChange={handleFileChange}
            className="hidden"
            id="report-file-input"
            disabled={isLoading}
          />

          {/* Upload Dropzone */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-150 ${
                isDragging
                  ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/60'
                  : 'border-surface-300 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-surface-50 dark:hover:bg-surface-800/50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm border border-primary-100 dark:border-primary-800/50">
                <FaCloudUploadAlt />
              </div>
              <p className="text-sm font-semibold text-surface-800 dark:text-surface-200 mb-1">
                Drag & drop your report here, or <span className="text-primary-600 dark:text-primary-400 underline">browse</span>
              </p>
              <p className="text-xs text-surface-400 dark:text-surface-500">
                Supports PDF (.pdf) and Text (.txt) files • Maximum size: 10MB
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-surface-400 dark:text-surface-500">
                <FaShieldAlt className="text-emerald-600 dark:text-emerald-400" />
                <span>Files are processed in-memory and never stored on disk or in a database.</span>
              </div>
            </div>
          ) : (
            /* Selected File Preview */
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center text-lg shrink-0 border border-amber-200/50 dark:border-amber-800/50">
                  {selectedFile.name.toLowerCase().endsWith('.pdf') ? <FaFilePdf /> : <FaFileAlt />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-surface-900 dark:text-surface-50 truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {formatFileSize(selectedFile.size)} • Ready for analysis
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={isLoading}
                className="btn-ghost text-xs text-surface-400 hover:text-red-600 p-2 rounded-lg"
                title="Remove selected file"
                aria-label="Remove file"
              >
                <FaTrashAlt />
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <FaExclamationTriangle className="shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
              <button
                onClick={() => setErrorMessage(null)}
                className="font-bold hover:text-red-900 ml-2"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Analyze Button */}
          <div>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
              className="btn-primary w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Processing & Explaining Document with AI...</span>
                </>
              ) : (
                <>
                  <FaClipboardList />
                  <span>Analyze Medical Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {analysisResult ? (
        <div className="space-y-6">
          {/* Header of Results */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <FaBookMedical className="text-primary-600" />
              <span>Report Explanation Results</span>
            </h2>
            <button
              onClick={handleClearAll}
              className="btn-outline text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5"
            >
              <FaRedo className="text-xs" />
              <span>Analyze Another Report</span>
            </button>
          </div>

          {/* Overview Card */}
          <div className="card">
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-primary-700">
              <FaInfoCircle className="text-primary-600" />
              <span>Report Overview</span>
            </h3>
            <p className="text-sm text-surface-800 leading-relaxed">
              {analysisResult.explanation.overview}
            </p>
          </div>

          {/* Key Findings */}
          {analysisResult.explanation.keyFindings?.length > 0 && (
            <div className="card">
              <div className="mb-4">
                <h3 className="text-base font-bold text-surface-900">Key Measurements & Findings</h3>
                <p className="text-xs text-surface-500">
                  Individual tests, reported values, reference ranges, and educational explanations.
                </p>
              </div>

              <div className="space-y-3">
                {analysisResult.explanation.keyFindings.map((finding, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <h4 className="text-sm font-bold text-surface-900 dark:text-surface-50">{finding.item}</h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950/80 text-primary-800 dark:text-primary-300 font-mono font-semibold">
                          Value: {finding.value}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 font-mono text-[11px]">
                          Ref: {finding.referenceRange}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-surface-700 dark:text-surface-300 leading-relaxed">
                      {finding.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Terms Glossary */}
          {analysisResult.explanation.medicalTerms?.length > 0 && (
            <div className="card">
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-50 mb-1">Medical Terms Glossary</h3>
              <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
                Plain-language explanations of medical terminology used in the document.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysisResult.explanation.medicalTerms.map((term, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
                    <p className="text-xs font-bold text-primary-700 dark:text-primary-300 mb-1">{term.term}</p>
                    <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">{term.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions to Discuss & Important Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Questions to Discuss */}
            {analysisResult.explanation.questionsForDoctor?.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-bold text-surface-900 dark:text-surface-50 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-secondary-700 dark:text-secondary-400">
                  <FaQuestionCircle className="text-secondary-600 dark:text-secondary-400" />
                  <span>Questions for Your Doctor</span>
                </h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-3">
                  Suggested topics to bring up during your consultation:
                </p>
                <ul className="space-y-2">
                  {analysisResult.explanation.questionsForDoctor.map((q, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-surface-700 dark:text-surface-300 flex items-start gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-100 dark:border-surface-700"
                    >
                      <span className="text-secondary-600 dark:text-secondary-400 font-bold">?</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Important Notes & General Guidance */}
            <div className="card space-y-4">
              {analysisResult.explanation.importantNotes?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-surface-50 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <FaExclamationTriangle className="text-amber-500 dark:text-amber-400" />
                    <span>Important Notes</span>
                  </h3>
                  <ul className="space-y-1.5">
                    {analysisResult.explanation.importantNotes.map((note, idx) => (
                      <li key={idx} className="text-xs text-surface-700 dark:text-surface-300 flex items-start gap-2">
                        <span className="text-amber-500 dark:text-amber-400 font-bold">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.explanation.generalGuidance?.length > 0 && (
                <div className="pt-3 border-t border-surface-100 dark:border-surface-800">
                  <h3 className="text-sm font-bold text-surface-900 dark:text-surface-50 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-primary-700 dark:text-primary-400">
                    <FaInfoCircle className="text-primary-600 dark:text-primary-400" />
                    <span>General Guidance</span>
                  </h3>
                  <ul className="space-y-1.5">
                    {analysisResult.explanation.generalGuidance.map((tip, idx) => (
                      <li key={idx} className="text-xs text-surface-700 dark:text-surface-300 flex items-start gap-2">
                        <span className="text-primary-600 dark:text-primary-400 font-bold">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-100 to-primary-100 dark:from-amber-950/60 dark:to-primary-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm border border-amber-200/50 dark:border-amber-800/50">
            <FaFileAlt className="text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-surface-50 mb-2">
            Understand Your Medical Reports
          </h2>
          <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 max-w-lg mx-auto leading-relaxed mb-6">
            Upload blood work, lipid panels, urinalysis, or general diagnostic reports to receive educational explanations of medical terminology, reference ranges, and key findings.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-xs font-medium border border-surface-200 dark:border-surface-700">
            <FaShieldAlt className="text-emerald-600" />
            <span>Strictly educational • Never stored on disk or database • Non-diagnostic</span>
          </div>
        </div>
      )}

      {/* Persistent Disclaimer */}
      <div className="p-4 rounded-xl bg-surface-100 border border-surface-200 flex items-start gap-3 text-xs text-surface-600 leading-relaxed">
        <FaInfoCircle className="text-primary-600 shrink-0 text-base mt-0.5" />
        <div>
          <strong className="text-surface-800">Important Medical Disclaimer:</strong> This tool provides general educational explanations of medical report terminology and does not constitute medical advice, interpretation, or diagnosis. Laboratory and clinical findings must always be correlated with your clinical symptoms and medical history by a licensed physician.
        </div>
      </div>
    </div>
  );
}

export default ReportAnalysis;

