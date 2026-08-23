import { Link } from 'react-router'

export function DashboardPage() {
  return (
    <main>
      <h1>Claims Dashboard</h1>
      <p>Dashboard Foundation</p>

      <Link to="/claims">فتح المطالبات</Link>
    </main>
  )
}