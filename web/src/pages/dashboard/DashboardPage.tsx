import './DashboardPage.css'

const claimStatistics = [
  {
    label: 'Total Claims',
    value: 0,
    tone: 'primary',
  },
  {
    label: 'Draft Claims',
    value: 0,
    tone: 'muted',
  },
  {
    label: 'Submitted Claims',
    value: 0,
    tone: 'info',
  },
  {
    label: 'Pending Review',
    value: 0,
    tone: 'warning',
  },
]

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>
            Overview of the current insurance claims.
          </p>
        </div>

        <span className="page-heading-label">
          Sprint 1
        </span>
      </div>

      <div className="statistics-grid">
        {claimStatistics.map((statistic) => (
          <article
            className={`statistic-card ${statistic.tone}`}
            key={statistic.label}
          >
            <div className="statistic-card-indicator" />

            <span>{statistic.label}</span>
            <strong>{statistic.value}</strong>
          </article>
        ))}
      </div>
    </div>
  )
}