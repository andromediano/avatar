import type { ApiFittingRecord, ApiPagination } from './types'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

interface SaveFittingParams {
  garmentId: string
  measurements: Record<string, number>
  garmentColor: string
  screenshotUrl?: string
  fitScore?: number
}

interface FittingHistoryResponse {
  data: ApiFittingRecord[]
  pagination: ApiPagination
}

export async function saveFittingHistory(
  params: SaveFittingParams,
): Promise<{ id: string; createdAt: string }> {
  const res = await fetch(`${API_BASE}/fitting/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)

  return res.json()
}

export async function fetchFittingHistory(
  page = 1,
  limit = 20,
): Promise<FittingHistoryResponse> {
  const res = await fetch(
    `${API_BASE}/fitting/history?page=${page}&limit=${limit}`,
    { method: 'GET' },
  )
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)

  return res.json()
}
