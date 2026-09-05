import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // Listen for unauthorized 401 events dispatched by api interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Load user session on mount
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const data = await authService.getProfile();
        if (isMounted && data.success && data.data?.user) {
          setUser(data.data.user);
        }
      } catch (err) {
        console.error('Failed to restore session:', err?.response?.data?.message || err.message);
        if (isMounted) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login
  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.success && data.data?.token) {
      localStorage.setItem('token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      return data.data.user;
    }
    throw new Error(data.message || 'Login failed');
  };

  // Register
  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success && data.data?.token) {
      localStorage.setItem('token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      return data.data.user;
    }
    throw new Error(data.message || 'Registration failed');
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    const data = await authService.updateProfile(profileData);
    if (data.success && data.data?.user) {
      setUser(data.data.user);
      return data.data.user;
    }
    throw new Error(data.message || 'Profile update failed');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
