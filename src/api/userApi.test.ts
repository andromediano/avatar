import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchProfile, updateProfile, saveMeasurements, fetchMeasurements } from './userApi'

describe('Feature 10: User API', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('프로필 조회', () => {
    it('GET /api/users/profile을 호출한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: 'u1', email: 'a@b.com' }),
        }),
      )

      const result = await fetchProfile()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/profile'),
        expect.any(Object),
      )
      expect(result.email).toBe('a@b.com')
    })
  })

  describe('프로필 수정', () => {
    it('POST /api/users/profile을 호출한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: 'u1', nickname: '테스터' }),
        }),
      )

      await updateProfile({ nickname: '테스터' })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/profile'),
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  describe('치수 저장', () => {
    it('PUT /api/users/measurements를 호출한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }),
      )

      await saveMeasurements({ heightCm: 175, chestCm: 95 })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/measurements'),
        expect.objectContaining({ method: 'PUT' }),
      )
    })
  })

  describe('치수 조회', () => {
    it('GET /api/users/measurements를 호출한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ heightCm: 175 }),
        }),
      )

      const result = await fetchMeasurements()
      expect(result.heightCm).toBe(175)
    })
  })
})
