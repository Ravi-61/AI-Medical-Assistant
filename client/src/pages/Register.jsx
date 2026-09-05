import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHeartbeat,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaCalendar,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaCheckCircle,
  FaSun,
  FaMoon,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // If already authenticated, redirect
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword, phone, dateOfBirth, gender } =
      formData;

    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!password) {
      toast.error('Please enter a password');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
      };

      const newUser = await register(payload);
      toast.success(`Account created successfully! Welcome, ${newUser.name || 'User'}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please check the information provided.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordLongEnough = formData.password.length >= 8;
  const doPasswordsMatch =
    formData.password && formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center px-4 py-12 relative transition-colors duration-200">
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

      {/* Register Card */}
      <div className="card w-full max-w-lg shadow-card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Create your account</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Join AI Medical Assistant to access intelligent health features
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label
              htmlFor="register-name"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 text-sm" />
              <input
                id="register-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. Jane Doe"
                className="input pl-10"
                disabled={loading}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
            >
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 text-sm" />
              <input
                id="register-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jane.doe@example.com"
                className="input pl-10"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password and Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
              >
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 text-sm" />
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className="input pl-10 pr-9"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-xs" />
                  ) : (
                    <FaEye className="text-xs" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="register-confirm"
                className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
              >
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 text-sm" />
                <input
                  id="register-confirm"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="input pl-10 pr-9"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="text-xs" />
                  ) : (
                    <FaEye className="text-xs" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Validation Helpers */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-surface-500 dark:text-surface-400 pt-0.5">
            <span
              className={`flex items-center gap-1 ${
                isPasswordLongEnough ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-surface-400 dark:text-surface-500'
              }`}
            >
              <FaCheckCircle className="text-[10px]" /> At least 8 characters
            </span>
            <span
              className={`flex items-center gap-1 ${
                doPasswordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-surface-400 dark:text-surface-500'
              }`}
            >
              <FaCheckCircle className="text-[10px]" /> Passwords match
            </span>
          </div>

          {/* Optional Demographics */}
          <div className="pt-2 border-t border-surface-100 dark:border-surface-800">
            <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
              Optional Health Profile
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="register-phone"
                  className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 text-sm" />
                  <input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555-0199"
                    className="input pl-10"
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-dob"
                  className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
                >
                  Date of Birth
                </label>
                <div className="relative">
                  <FaCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 text-sm" />
                  <input
                    id="register-dob"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="register-gender"
                className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
              >
                Gender
              </label>
              <select
                id="register-gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="input"
                disabled={loading}
              >
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <FaSpinner className="animate-spin text-sm" />}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-xs text-surface-400 dark:text-surface-500 mt-6 text-center max-w-md">
        By registering, you acknowledge that this tool provides informational and educational content and is not a substitute for clinical judgment.
      </p>
    </div>
  );
}

export default Register;
