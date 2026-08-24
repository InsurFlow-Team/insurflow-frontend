import { NavLink, Outlet } from 'react-router'
import './DashboardLayout.css'

export function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark">IF</span>

          <div>
            <strong>InsurFlow</strong>
            <small>Claims Management</small>
          </div>
        </div>

        <nav className="dashboard-navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'dashboard-nav-link active'
                : 'dashboard-nav-link'
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/claims"
            className={({ isActive }) =>
              isActive
                ? 'dashboard-nav-link active'
                : 'dashboard-nav-link'
            }
          >
            Claims
          </NavLink>
        </nav>

        <div className="dashboard-sidebar-footer">
          Sprint 1
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h2>Claims Officer Portal</h2>
            <p>Review and manage submitted claims</p>
          </div>

          <div className="dashboard-user">
            <div className="dashboard-user-avatar">AO</div>

            <div>
              <strong>Claims Officer</strong>
              <span>Active</span>
            </div>
          </div>
        </header>

        <section className="dashboard-content">
          <Outlet />
        </section>
      </div>
    </div>
  )
}