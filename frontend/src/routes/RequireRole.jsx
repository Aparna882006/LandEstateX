/**
 * RequireRole.jsx
 * -----------------------------------------------------------------------
 * Wraps children with a role check, on top of your existing
 * ProtectedRoute.jsx (which only checks "logged in"). Use inside
 * ProtectedRoute, or standalone if ProtectedRoute already ran.
 *
 * ASSUMES useAuth() returns `{ user }` where `user.role` is a string.
 * Adjust the field name if yours differs.
 * -----------------------------------------------------------------------
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * @param {{ role: string | string[], children: React.ReactNode, redirectTo?: string }} props
 */
export default function RequireRole({ role, children, redirectTo = "/" }) {
  const { user } = useAuth();
  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!user) {
    // ProtectedRoute should already have caught this, but guard anyway.
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
