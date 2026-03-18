import type { ApiMeasurements, ApiUserProfile } from './types'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export async function fetchProfile(): Promise<ApiUserProfile> {
  const res = await fetch(`${API_BASE}/users/profile`, { method: 'GET' })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function updateProfile(
  data: Partial<ApiUserProfile>,
): Promise<ApiUserProfile> {
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function saveMeasurements(
  data: Partial<ApiMeasurements>,
): Promise<void> {
  const res = await fetch(`${API_BASE}/users/measurements`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
}

export async function fetchMeasurements(): Promise<ApiMeasurements> {
  const res = await fetch(`${API_BASE}/users/measurements`, { method: 'GET' })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
