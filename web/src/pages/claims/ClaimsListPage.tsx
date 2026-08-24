import { Link } from 'react-router'

export function ClaimsListPage() {
  return (
    <main>
      <h1>Claims List</h1>

      <Link to="/claims/CLM-0001">
        فتح المطالبة CLM-0001
      </Link>
    </main>
  )
}