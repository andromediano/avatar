import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveFittingHistory, fetchFittingHistory } from './fittingApi'

describe('Feature 08: 피팅 히스토리 API', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('Scenario: 피팅 기록 저장', () => {
    it('POST /api/fitting/history를 호출한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'fit_01',
              createdAt: '2026-03-18T00:00:00Z',
            }),
        }),
      )

      const result = await saveFittingHistory({
        garmentId: 'gar_01',
        measurements: { height: 0.5, chest: 0.6 },
        garmentColor: '#3b82f6',
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/fitting/history'),
        expect.objectContaining({ method: 'POST' }),
      )
      expect(result.id).toBe('fit_01')
    })
  })

  describe('Scenario: 피팅 히스토리 조회', () => {
    it('GET /api/fitting/history를 호출한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [{ id: 'fit_01', garmentId: 'gar_01' }],
              pagination: { page: 1, limit: 20, total: 1 },
            }),
        }),
      )

      const result = await fetchFittingHistory()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/fitting/history'),
        expect.any(Object),
      )
      expect(result.data).toHaveLength(1)
    })
  })
})
