import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router'

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

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}