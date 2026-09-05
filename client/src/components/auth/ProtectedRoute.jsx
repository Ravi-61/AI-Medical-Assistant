import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaSpinner } from 'react-icons/fa';

/**
 * ProtectedRoute guards routes that require an authenticated user.
 * Displays a spinner while session is being verified.
 * Redirects to /login if unauthenticated, preserving destination location.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
        <FaSpinner className="text-4xl text-primary-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-surface-600">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
