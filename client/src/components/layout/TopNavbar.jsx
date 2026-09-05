import { useLocation, Link } from 'react-router-dom';
import { FaBars, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/chat': 'AI Medical Chat',
  '/symptoms': 'Symptom Analysis',
  '/reports': 'Medical Report',
  '/medicine': 'Medicine Information',
  '/health': 'Health Recommendations',
  '/profile': 'Profile',
};

/**
 * Top navigation bar for the authenticated application layout.
 * @param {{ onMenuToggle: () => void }} props
 */
function TopNavbar({ onMenuToggle }) {
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const pageTitle = pageTitles[location.pathname] || 'AI Medical Assistant';

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="topnavbar">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <FaBars className="text-base" />
        </button>

        {/* Page title */}
        <h1 className="text-lg font-semibold text-surface-900 dark:text-surface-50 leading-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          type="button"
          className="flex items-center justify-center w-9 h-9 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800 transition-all duration-150"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <FaSun className="text-amber-400 text-base transition-transform duration-200 hover:rotate-45" />
          ) : (
            <FaMoon className="text-surface-600 text-sm transition-transform duration-200 hover:-rotate-12" />
          )}
        </button>

        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 text-sm text-surface-600 hover:text-primary-600 dark:text-surface-300 dark:hover:text-primary-400 transition-colors rounded-xl px-2.5 py-1.5 hover:bg-surface-50 dark:hover:bg-surface-800/60"
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-primary-400 text-white rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold">
            {initials}
          </div>
          <span className="font-medium hidden sm:inline">{user?.name || 'User'}</span>
        </Link>
      </div>
    </header>
  );
}

export default TopNavbar;
