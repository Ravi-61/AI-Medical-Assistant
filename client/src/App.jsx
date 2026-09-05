import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatBot from './pages/ChatBot';
import SymptomAnalysis from './pages/SymptomAnalysis';
import ReportAnalysis from './pages/ReportAnalysis';
import MedicineInfo from './pages/MedicineInfo';
import HealthRecommendations from './pages/HealthRecommendations';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function ThemedToaster() {
  const { isDark } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: isDark
          ? {
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
              borderRadius: '12px',
              border: '1px solid #334155',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              padding: '12px 16px',
            }
          : {
              background: '#fff',
              color: '#1e293b',
              fontSize: '14px',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
              padding: '12px 16px',
            },
        success: {
          iconTheme: { primary: '#14b8a6', secondary: isDark ? '#1e293b' : '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: isDark ? '#1e293b' : '#fff' },
        },
      }}
    />
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ThemedToaster />

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ChatBot />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/symptoms"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SymptomAnalysis />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ReportAnalysis />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/medicine"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MedicineInfo />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/health"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <HealthRecommendations />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
