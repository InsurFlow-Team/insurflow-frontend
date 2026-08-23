import { Link } from 'react-router'

export function LoginPage() {
  return (
    <main>
      <h1>InsurFlow Login</h1>
      <p>Claims Officer Web Dashboard</p>

      <Link to="/dashboard">دخول تجريبي</Link>
    </main>
  )
}