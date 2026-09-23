import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PageLoader from "../components/ui/PageLoader";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    
    return <PageLoader />;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;