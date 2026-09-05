import { Link } from 'react-router-dom';
import {
  FaRobot,
  FaStethoscope,
  FaFileAlt,
  FaPills,
  FaHeartbeat,
  FaArrowRight,
  FaShieldAlt,
  FaSun,
  FaMoon,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const features = [
  {
    icon: FaRobot,
    title: 'AI Medical Chatbot',
    description: 'Ask health-related questions and get AI-powered informational responses in simple language.',
    color: 'text-primary-600 dark:text-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-950/60',
  },
  {
    icon: FaStethoscope,
    title: 'Symptom Analysis',
    description: 'Enter your symptoms and receive possible condition categories with general guidance.',
    color: 'text-secondary-600 dark:text-secondary-400',
    bg: 'bg-secondary-50 dark:bg-secondary-950/60',
  },
  {
    icon: FaFileAlt,
    title: 'Report Explanation',
    description: 'Upload medical reports and get simplified explanations of medical terminology and findings.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
  },
  {
    icon: FaPills,
    title: 'Medicine Information',
    description: 'Search for medicines to learn about common uses, precautions, and side effects.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/60',
  },
  {
    icon: FaHeartbeat,
    title: 'Health Recommendations',
    description: 'Get general wellness, diet, exercise, and preventive healthcare guidance.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
  },
];

function Landing() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
      {/* Navigation */}
      <nav className="bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FaHeartbeat className="text-white text-sm" />
              </div>
              <span className="font-bold text-lg text-surface-900 dark:text-surface-50">
                AI Medical Assistant
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                type="button"
                className="p-2 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800 transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <FaSun className="text-amber-400 text-base transition-transform duration-200 hover:rotate-45" />
                ) : (
                  <FaMoon className="text-surface-600 text-sm transition-transform duration-200 hover:-rotate-12" />
                )}
              </button>

              {user ? (
                <>
                  <Link to="/profile" className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400">
                    Hi, {user.name.split(' ')[0]}
                  </Link>
                  <Link to="/dashboard" className="btn-primary text-sm">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost text-sm">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-primary-100 dark:border-primary-800/60">
            <FaShieldAlt className="text-[10px]" />
            Educational Healthcare Support
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-surface-900 dark:text-surface-50 leading-tight mb-6">
            Intelligent{' '}
            <span className="text-primary-600 dark:text-primary-400">Healthcare</span>
            <br />
            Support System
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            An AI-powered healthcare assistant that helps you understand symptoms,
            medical reports, and medicines — all explained in simple, accessible language.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-base px-8 py-3">
                Go to Dashboard
                <FaArrowRight className="text-sm" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-3">
                  Get Started Free
                  <FaArrowRight className="text-sm" />
                </Link>
                <Link to="/login" className="btn-outline text-base px-8 py-3">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-surface-900 border-t border-surface-100 dark:border-surface-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-3">
              What You Can Do
            </h2>
            <p className="text-surface-500 dark:text-surface-400 max-w-xl mx-auto">
              Explore AI-powered healthcare tools designed to provide helpful
              information and educational guidance.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card group cursor-default">
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105`}>
                  <feature.icon className={`text-xl ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-12 bg-surface-50 dark:bg-surface-950 border-t border-surface-100 dark:border-surface-800 transition-colors duration-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-6">
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>Important:</strong> This system is for educational and informational
              purposes only. It does not diagnose medical conditions, prescribe medication,
              or replace professional medical advice. Always consult a qualified healthcare
              professional for diagnosis and treatment.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-surface-900 border-t border-surface-100 dark:border-surface-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center">
                <FaHeartbeat className="text-white text-[10px]" />
              </div>
              <span className="font-semibold text-sm text-surface-700 dark:text-surface-300">
                AI Medical Assistant
              </span>
            </div>
            <p className="text-xs text-surface-400 dark:text-surface-500">
              Educational mini-project — Not a substitute for professional medical advice
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
