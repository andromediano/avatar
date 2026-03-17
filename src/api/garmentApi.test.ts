import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchGarments, fetchGarmentById, searchGarments } from './garmentApi'
import type { ApiGarmentListResponse, ApiGarment } from './types'

const mockGarment: ApiGarment = {
  id: 'gar_01',
  name: '기본 티셔츠',
  category: 'top',
  sizes: ['S', 'M', 'L'],
  modelUrl: 'https://cdn.example.com/tshirt.glb',
  tags: ['캐주얼'],
}

const mockListResponse: ApiGarmentListResponse = {
  data: [mockGarment],
  pagination: { page: 1, limit: 20, total: 1 },
}

describe('Feature 04: 의류 카탈로그 API', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('Scenario: 의류 목록 조회', () => {
    it('GET /api/garments를 호출하여 목록을 반환한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockListResponse),
        }),
      )

      const result = await fetchGarments()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/garments'),
        expect.any(Object),
      )
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe('gar_01')
    })
  })

  describe('Scenario: 카테고리 필터', () => {
    it('category 파라미터를 쿼리에 포함한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockListResponse),
        }),
      )

      await fetchGarments({ category: 'top', page: 1 })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=top'),
        expect.any(Object),
      )
    })
  })

  describe('Scenario: 의류 상세 조회', () => {
    it('GET /api/garments/:id를 호출한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockGarment),
        }),
      )

      const result = await fetchGarmentById('gar_01')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/garments/gar_01'),
        expect.any(Object),
      )
      expect(result.id).toBe('gar_01')
    })
  })

  describe('Scenario: 검색', () => {
    it('GET /api/garments/search?q=를 호출한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockListResponse),
        }),
      )

      await searchGarments('오버핏 티셔츠')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          '/api/garments/search?q=' + encodeURIComponent('오버핏 티셔츠'),
        ),
        expect.any(Object),
      )
    })
  })

  describe('Scenario: API 에러 처리', () => {
    it('HTTP 에러 시 에러를 throw한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        }),
      )

      await expect(fetchGarments()).rejects.toThrow()
    })
  })
})
