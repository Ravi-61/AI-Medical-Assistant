import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHeartbeat,
  FaThLarge,
  FaRobot,
  FaStethoscope,
  FaFileAlt,
  FaPills,
  FaUserCog,
  FaSignOutAlt,
  FaSun,
  FaMoon,
} from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: FaThLarge, label: 'Dashboard' },
  { to: '/chat', icon: FaRobot, label: 'AI Medical Chat' },
  { to: '/symptoms', icon: FaStethoscope, label: 'Symptom Analysis' },
  { to: '/reports', icon: FaFileAlt, label: 'Medical Report' },
  { to: '/medicine', icon: FaPills, label: 'Medicine Information' },
  { to: '/health', icon: FiHeart, label: 'Health Recommendations' },
  { to: '/profile', icon: FaUserCog, label: 'Profile' },
];

/**
 * Sidebar navigation component for the authenticated application layout.
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const truncatedEmail =
    user?.email && user.email.length > 24
      ? user.email.slice(0, 22) + '…'
      : user?.email || '';

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-surface-100 dark:border-surface-800">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FaHeartbeat className="text-white text-base" />
          </div>
          <div className="min-w-0">
            <span className="block font-bold text-sm text-surface-900 dark:text-surface-50 leading-tight truncate">
              AI Medical
            </span>
            <span className="block text-[11px] text-surface-400 dark:text-surface-500 leading-tight">
              Assistant
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`
              }
            >
              <item.icon className="text-base flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-surface-100 dark:border-surface-800 px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 bg-gradient-to-tr from-primary-600 to-primary-400 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-surface-400 dark:text-surface-500 truncate leading-tight">
                  {truncatedEmail}
                </p>
              </div>
            </div>

            {/* Quick theme toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800 transition-colors shrink-0"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <FaSun className="text-amber-400 text-sm" /> : <FaMoon className="text-surface-600 text-xs" />}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl px-3 py-2 transition-colors"
            aria-label="Sign out"
          >
            <FaSignOutAlt className="text-xs" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
