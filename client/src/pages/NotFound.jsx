import { Link } from 'react-router-dom';
import { FaHeartbeat, FaHome } from 'react-icons/fa';

function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FaHeartbeat className="text-3xl text-surface-400" />
        </div>
        <h1 className="text-6xl font-bold text-surface-300 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-surface-700 mb-2">Page Not Found</h2>
        <p className="text-sm text-surface-500 max-w-sm mx-auto mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          <FaHome />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
