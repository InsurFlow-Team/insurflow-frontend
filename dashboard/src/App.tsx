import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import Toaster from "./components/ui/Toaster";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import ClaimsList from "./pages/ClaimsList";
import ClaimDetails from "./pages/ClaimDetails";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleGuard from "./routes/RoleGuard";

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route
            element={
              <RoleGuard allowedRoles={["ADMIN", "CLAIMS_OFFICER"]} />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/claims" element={<ClaimsList />} />
            <Route
              path="/claims/:claimId"
              element={<ClaimDetails />}
            />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Settings + management are ADMIN-only */}
          <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
            <Route path="/settings" element={<Outlet />}>
              <Route index element={<Settings />} />
              <Route path="users" element={<Users />} />
            </Route>
            {/* Backward-compatible redirect for the old /users route */}
            <Route path="/users" element={<Navigate to="/settings/users" replace />} />
          </Route>

          {/* Access denied page for authenticated users without permission */}
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </ToastProvider>
  );
}

export default App;