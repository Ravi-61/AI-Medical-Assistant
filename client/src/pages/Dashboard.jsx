import { Link } from 'react-router-dom';
import {
  FaRobot,
  FaStethoscope,
  FaFileAlt,
  FaPills,
  FaArrowRight,
  FaShieldAlt,
  FaInfoCircle,
} from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const featureCards = [
  {
    title: 'AI Medical Chat',
    description: 'Ask health-related questions and receive intelligent, context-aware AI medical explanations.',
    path: '/chat',
    icon: FaRobot,
    color: 'text-primary-600 dark:text-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-950/60',
    border: 'border-primary-100 dark:border-surface-800 hover:border-primary-300 dark:hover:border-primary-600',
    badge: 'Interactive',
    badgeColor: 'bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300',
  },
  {
    title: 'Symptom Analysis',
    description: 'Identify potential condition categories based on symptoms with structured medical context.',
    path: '/symptoms',
    icon: FaStethoscope,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/60',
    border: 'border-teal-100 dark:border-surface-800 hover:border-teal-300 dark:hover:border-teal-600',
    badge: 'Triage',
    badgeColor: 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300',
  },
  {
    title: 'Medical Report Analysis',
    description: 'Extract and clarify complex medical terminology from laboratory and diagnostic reports.',
    path: '/reports',
    icon: FaFileAlt,
    color: 'text-secondary-600 dark:text-secondary-400',
    bg: 'bg-secondary-50 dark:bg-secondary-950/60',
    border: 'border-secondary-100 dark:border-surface-800 hover:border-secondary-300 dark:hover:border-secondary-600',
    badge: 'Diagnostics',
    badgeColor: 'bg-secondary-100 dark:bg-secondary-900/60 text-secondary-700 dark:text-secondary-300',
  },
  {
    title: 'Medicine Information',
    description: 'Search comprehensive details about medications, dosages, precautions, and contraindications.',
    path: '/medicine',
    icon: FaPills,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    border: 'border-rose-100 dark:border-surface-800 hover:border-rose-300 dark:hover:border-rose-600',
    badge: 'Reference',
    badgeColor: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300',
  },
  {
    title: 'Health Recommendations',
    description: 'Receive personalized preventative wellness, nutrition, and lifestyle recommendations.',
    path: '/health',
    icon: FiHeart,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    border: 'border-emerald-100 dark:border-surface-800 hover:border-emerald-300 dark:hover:border-emerald-600',
    badge: 'Wellness',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
  },
];

function Dashboard() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-teal-700 p-6 sm:p-8 text-white shadow-card">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium text-white mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Healthcare System Online
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {getGreeting()}, {displayName}! 👋
          </h1>
          <p className="text-primary-100 text-sm sm:text-base leading-relaxed">
            Welcome to your intelligent healthcare dashboard. Select a module below to start exploring AI-assisted medical insights, report interpretations, and health guidance.
          </p>
        </div>

        {/* Subtle decorative background circles */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-40 bottom-0 -mb-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Feature Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Clinical & Health Modules</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Select an AI healthcare tool to begin assistance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.path}
                to={card.path}
                className={`group flex flex-col justify-between bg-white dark:bg-surface-900 rounded-2xl p-6 border ${card.border} shadow-card dark:shadow-none hover:shadow-card-hover transition-all duration-200 transform hover:-translate-y-0.5`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}>
                      <Icon className={`text-xl ${card.color}`} />
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed mb-4">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-surface-400 dark:text-surface-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    Open module
                  </span>
                  <div className="w-7 h-7 rounded-full bg-surface-50 dark:bg-surface-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/60 flex items-center justify-center transition-colors">
                    <FaArrowRight className="text-xs text-surface-400 dark:text-surface-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Safety & Medical Disclaimer */}
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
          <FaShieldAlt className="text-sm" />
        </div>
        <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
          <p className="font-semibold text-amber-950 dark:text-amber-200 mb-0.5">Clinical Disclaimer</p>
          This AI Medical Assistant is designed for informational and educational purposes only. It is not intended to provide clinical diagnosis, replace a licensed healthcare practitioner's judgment, or substitute for in-person consultation. In any medical emergency, please call your local emergency services immediately.
        </div>
      </div>

      {/* Quick System Status & Helpful Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FaInfoCircle className="text-sm" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-1">Confidential & Secure</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
              Your session interactions are protected. Your personal healthcare information is processed securely.
            </p>
          </div>
        </div>

        <div className="card flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FiHeart className="text-sm" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-1">Profile & Preferences</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
              Keep your profile data updated to help contextualize medical recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
