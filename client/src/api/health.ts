import type { HealthResponse } from '../types/api'

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? ''

export const getHealthStatus = async (): Promise<HealthResponse> => {
  const response = await fetch(`${backendUrl}/api/health`)

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`)
  }

  return (await response.json()) as HealthResponse
}
