import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-coral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cocoa-600 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
