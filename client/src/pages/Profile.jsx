import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaSignOutAlt,
  FaSpinner,
  FaCheck,
  FaLock,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });

  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Sync user data to state
  useEffect(() => {
    if (user) {
      let formattedDob = '';
      if (user.dateOfBirth) {
        try {
          formattedDob = new Date(user.dateOfBirth).toISOString().split('T')[0];
        } catch {
          formattedDob = '';
        }
      }

      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: formattedDob,
        gender: user.gender || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setLoggingOut(true);
    logout();
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  };

  // Format initials for avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent Member';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card shadow-card">
        {/* Avatar & Header */}
        <div className="flex flex-col items-center mb-8 border-b border-surface-100 dark:border-surface-800 pb-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-primary-400 text-white rounded-full flex items-center justify-center mb-3 shadow-md text-2xl font-bold">
            {initials}
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">{user?.name || 'User'}</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{user?.email}</p>
          <span className="inline-block mt-2 text-xs font-medium text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 px-2.5 py-1 rounded-full">
            Member since {memberSince}
          </span>
        </div>

        {/* Profile Form */}
        <form className="space-y-5" onSubmit={handleSave}>
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm" />
              <input
                id="profile-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input pl-10"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="profile-email"
                className="block text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                Email Address
              </label>
              <span className="inline-flex items-center gap-1 text-xs text-surface-400">
                <FaLock className="text-[10px]" /> Read-only
              </span>
            </div>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm" />
              <input
                id="profile-email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="input pl-10 bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 cursor-not-allowed border-surface-200 dark:border-surface-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profile-phone"
                className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
              >
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm" />
                <input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 555-0199"
                  className="input pl-10"
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-dob"
                className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
              >
                Date of Birth
              </label>
              <div className="relative">
                <FaCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm" />
                <input
                  id="profile-dob"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="input pl-10"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-gender"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
            >
              Gender
            </label>
            <select
              id="profile-gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input"
              disabled={saving}
            >
              <option value="">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaCheck className="text-sm" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-surface-200 dark:border-surface-700 flex items-center justify-center gap-2"
              disabled={loggingOut}
            >
              <FaSignOutAlt className="text-sm" />
              <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
