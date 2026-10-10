import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import I18nProvider from "./i18n/I18nProvider";
import { ToastProvider } from "./contexts/ToastContext";
import Toaster from "./components/ui/Toaster";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import ClaimsList from "./pages/ClaimsList";
import ClaimDetails from "./pages/ClaimDetails";
import AdjustersDirectory from "./pages/AdjustersDirectory";
import AdjusterDetails from "./pages/AdjusterDetails";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleGuard from "./routes/RoleGuard";
import LoadingState from "./components/ui/LoadingState";


const MapPage = lazy(() =>
  import("./pages/MapPage").then((module) => ({ default: module.default })),
);

function App() {
  return (
    <I18nProvider>
      <ToastProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              element={<RoleGuard allowedRoles={["ADMIN", "CLAIMS_OFFICER"]} />}
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/claims" element={<ClaimsList />} />
              <Route path="/claims/:claimId" element={<ClaimDetails />} />
              <Route path="/adjusters" element={<AdjustersDirectory />} />
              <Route path="/adjusters/:adjusterId" element={<AdjusterDetails />} />
              <Route
                path="/map"
                element={
                  <Suspense
                    fallback={<LoadingState message="Loading map..." />}
                  >
                    <MapPage />
                  </Suspense>
                }
              />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
              <Route path="/settings" element={<Outlet />}>
                <Route index element={<Settings />} />
                <Route path="users" element={<Users />} />
              </Route>
              <Route
                path="/users"
                element={<Navigate to="/settings/users" replace />}
              />
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </ToastProvider>
    </I18nProvider>
  );
}

export default App;
