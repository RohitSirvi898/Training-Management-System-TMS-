import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 * Optionally restricts access to specific roles.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}> ... </Route>
 *   <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}> ... </Route>
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Still loading auth state from localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-surface-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // Not logged in — redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
