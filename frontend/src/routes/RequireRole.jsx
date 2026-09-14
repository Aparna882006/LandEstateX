import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RequireRole({
  role,
  redirectTo = "/"
}) {
  const { user } = useAuth();

  const allowedRoles = Array.isArray(role) ? role : [role];

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User does not have required role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  // User has required role
  return <Outlet />;
}