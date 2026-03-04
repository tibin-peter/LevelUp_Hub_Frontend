import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Simple Loading Component inside the file to prevent "LoadingSpinner is not defined" errors
const LoadingSpinner = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9500]"></div>
  </div>
);

export default function RoleRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  if (loading) return <LoadingSpinner />;

  //  Not logged in?
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }



  // GENERAL ROLE CHECK
  // We check this LAST so the Mentor logic above takes priority
  if (!allowedRoles.includes(user.role)) {
    // If a student tries to enter /admin, etc.
    const baseRoutes = {
      admin: "/admin/dashboard",
      mentor: "/mentor/dashboard",
      student: "/dashboard",
    };
    return <Navigate to={baseRoutes[user.role] || "/login"} replace />;
  }

  return <Outlet />;
}
