import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PageLoader from "../components/ui/PageLoader";

function PublicRoute() {

  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/admin/vehicles" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;