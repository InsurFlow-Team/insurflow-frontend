import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../types";

interface RoleGuardProps {
  allowedRoles: Role[];
}

function getDefaultRoute(role: Role) {
  if (role === "ADMIN") {
    return "/users";
  }

  if (role === "CLAIMS_OFFICER") {
    return "/dashboard";
  }

  return "/login";
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return <Outlet />;
}