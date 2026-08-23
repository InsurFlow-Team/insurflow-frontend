import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { ClaimsListPage } from '../pages/claims/ClaimsListPage'
import { ClaimDetailsPage } from '../pages/claims/ClaimDetailsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<LoginPage />} />

        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/claims"
            element={<ClaimsListPage />}
          />

          <Route
            path="/claims/:claimId"
            element={<ClaimDetailsPage />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}