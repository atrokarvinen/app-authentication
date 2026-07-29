import { useEffect, useState } from 'react'
import { HealthStatusCard } from './components/HealthStatusCard'
import { getHealthStatus } from './api/health'
import type { HealthResponse } from './types/api'
import './App.css'

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadHealthStatus() {
      try {
        const response = await getHealthStatus()
        if (isMounted) {
          setHealth(response)
          setErrorMessage(null)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unknown server error'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadHealthStatus()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Full-stack starter</p>
        <h1>React on the front, Express on the back.</h1>
        <p className="summary">
          This workspace starts with a Vite client, a TypeScript Express API,
          shared npm workspace scripts, and formatting and linting already
          wired.
        </p>
        <div className="command-grid">
          <code>npm run dev</code>
          <code>npm run build</code>
          <code>npm run lint</code>
        </div>
      </section>

      <section className="status-grid">
        <HealthStatusCard
          health={health}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />

        <article className="info-card">
          <h2>Project structure</h2>
          <ul>
            <li>Client code is split into api, components, and types.</li>
            <li>
              Server code is split into config, routes, and app bootstrap.
            </li>
            <li>
              Vite proxies /api requests to the local Express server in dev.
            </li>
          </ul>
        </article>
      </section>
    </main>
  )
}

export default App
