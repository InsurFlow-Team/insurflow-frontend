import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import ClaimsList from "./pages/ClaimsList";
import ClaimDetails from "./pages/ClaimDetails";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleGuard from "./routes/RoleGuard";

function App() {
  return (
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
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;