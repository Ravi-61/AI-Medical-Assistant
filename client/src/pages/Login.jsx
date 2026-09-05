import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHeartbeat, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaSun, FaMoon } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // If already authenticated, redirect
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error('Please enter your email address');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(trimmedEmail, password);
      toast.success(`Welcome back, ${loggedInUser.name || 'User'}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to log in. Please verify your credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center px-4 py-8 relative transition-colors duration-200">
      {/* Theme Toggle Top-Right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2.5 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <FaSun className="text-amber-400 text-base transition-transform duration-200 hover:rotate-45" />
          ) : (
            <FaMoon className="text-surface-600 text-sm transition-transform duration-200 hover:-rotate-12" />
          )}
        </button>
      </div>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
          <FaHeartbeat className="text-white text-lg" />
        </div>
        <span className="font-bold text-xl text-surface-900 dark:text-surface-50">
          AI Medical Assistant
        </span>
      </Link>

      {/* Login Card */}
      <div className="card w-full max-w-md shadow-card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Welcome back</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Sign in to your account to continue
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 text-sm" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input pl-10"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 text-sm" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-10 pr-10"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-sm" />
                ) : (
                  <FaEye className="text-sm" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-3 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <FaSpinner className="animate-spin text-sm" />}
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>

      <p className="text-xs text-surface-400 dark:text-surface-500 mt-6 text-center max-w-sm">
        🔒 Educational platform. We protect your credentials with industry standard bcrypt &amp; JWT encryption.
      </p>
    </div>
  );
}

export default Login;
