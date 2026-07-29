import type { HealthResponse } from '../types/api'

type HealthStatusCardProps = {
  health: HealthResponse | null
  isLoading: boolean
  errorMessage: string | null
}

export function HealthStatusCard({
  health,
  isLoading,
  errorMessage,
}: HealthStatusCardProps) {
  return (
    <article className="status-card">
      <div className="status-header">
        <h2>API health</h2>
        <span className={`pill ${health ? 'pill-online' : 'pill-pending'}`}>
          {health ? 'Online' : 'Pending'}
        </span>
      </div>

      {isLoading ? <p>Checking backend connection...</p> : null}
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      {health ? (
        <dl className="status-list">
          <div>
            <dt>Status</dt>
            <dd>{health.status}</dd>
          </div>
          <div>
            <dt>Service</dt>
            <dd>{health.service}</dd>
          </div>
          <div>
            <dt>Checked at</dt>
            <dd>{new Date(health.timestamp).toLocaleString()}</dd>
          </div>
        </dl>
      ) : null}
    </article>
  )
}
