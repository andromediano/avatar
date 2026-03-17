import type { ApiGarment, ApiGarmentListResponse } from './types'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

interface FetchGarmentsParams {
  category?: string
  page?: number
  limit?: number
}

export async function fetchGarments(
  params?: FetchGarmentsParams,
): Promise<ApiGarmentListResponse> {
  const query = new URLSearchParams()
  if (params?.category) query.set('category', params.category)
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))

  const qs = query.toString()
  const url = `${API_BASE}/garments${qs ? `?${qs}` : ''}`

  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)

  return res.json()
}

export async function fetchGarmentById(id: string): Promise<ApiGarment> {
  const res = await fetch(`${API_BASE}/garments/${id}`, { method: 'GET' })
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)

  return res.json()
}

export async function searchGarments(
  query: string,
): Promise<ApiGarmentListResponse> {
  const url = `${API_BASE}/garments/search?q=${encodeURIComponent(query)}`
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)

  return res.json()
}
