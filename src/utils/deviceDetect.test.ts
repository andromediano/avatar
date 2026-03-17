import { describe, it, expect, vi, afterEach } from 'vitest'
import { isMobile, recommendSimMode } from './deviceDetect'

describe('디바이스 감지', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('isMobile', () => {
    it('터치 디바이스면 true를 반환한다', () => {
      vi.stubGlobal('ontouchstart', vi.fn())
      vi.stubGlobal('navigator', { maxTouchPoints: 2, userAgent: '' })
      expect(isMobile()).toBe(true)
    })

    it('터치 미지원이면 false를 반환한다', () => {
      vi.stubGlobal('navigator', { maxTouchPoints: 0, userAgent: '' })
      // ontouchstart가 없는 환경
      const g = globalThis as Record<string, unknown>
      delete g.ontouchstart
      expect(isMobile()).toBe(false)
    })
  })

  describe('recommendSimMode', () => {
    it('모바일이면 baked를 반환한다', () => {
      vi.stubGlobal('ontouchstart', vi.fn())
      vi.stubGlobal('navigator', { maxTouchPoints: 2, userAgent: '' })
      expect(recommendSimMode()).toBe('baked')
    })

    it('데스크톱이면 realtime을 반환한다', () => {
      vi.stubGlobal('navigator', { maxTouchPoints: 0, userAgent: '' })
      const g = globalThis as Record<string, unknown>
      delete g.ontouchstart
      expect(recommendSimMode()).toBe('realtime')
    })
  })
})
