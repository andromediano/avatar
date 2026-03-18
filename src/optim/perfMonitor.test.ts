import { describe, it, expect, beforeEach } from 'vitest'
import { PerfMonitor } from './perfMonitor'

describe('Feature 11: 성능 모니터링', () => {
  let monitor: PerfMonitor

  beforeEach(() => {
    monitor = new PerfMonitor()
  })

  describe('Scenario: 프레임 카운팅', () => {
    it('recordFrame으로 프레임을 기록한다', () => {
      monitor.recordFrame(16, 25, 50000)
      monitor.recordFrame(16, 25, 50000)

      const metrics = monitor.getMetrics()
      expect(metrics.frameCount).toBe(2)
    })
  })

  describe('Scenario: FPS 계산', () => {
    it('기록된 프레임 시간으로 평균 FPS를 계산한다', () => {
      // 60fps = 16.67ms per frame
      for (let i = 0; i < 60; i++) {
        monitor.recordFrame(16.67, 20, 30000)
      }

      const metrics = monitor.getMetrics()
      expect(metrics.avgFps).toBeGreaterThan(55)
      expect(metrics.avgFps).toBeLessThan(65)
    })
  })

  describe('Scenario: 드로우 콜 / 삼각형 추적', () => {
    it('최신 드로우 콜과 삼각형 수를 반환한다', () => {
      monitor.recordFrame(16, 30, 45000)

      const metrics = monitor.getMetrics()
      expect(metrics.drawCalls).toBe(30)
      expect(metrics.triangles).toBe(45000)
    })
  })

  describe('Scenario: 성능 저하 감지', () => {
    it('평균 FPS가 30 미만이면 isLowPerformance가 true이다', () => {
      // 20fps = 50ms per frame
      for (let i = 0; i < 20; i++) {
        monitor.recordFrame(50, 20, 30000)
      }

      const metrics = monitor.getMetrics()
      expect(metrics.isLowPerformance).toBe(true)
    })

    it('평균 FPS가 30 이상이면 isLowPerformance가 false이다', () => {
      for (let i = 0; i < 60; i++) {
        monitor.recordFrame(16, 20, 30000)
      }

      const metrics = monitor.getMetrics()
      expect(metrics.isLowPerformance).toBe(false)
    })
  })

  describe('Scenario: 리셋', () => {
    it('reset으로 메트릭을 초기화한다', () => {
      monitor.recordFrame(16, 20, 30000)
      monitor.reset()

      const metrics = monitor.getMetrics()
      expect(metrics.frameCount).toBe(0)
      expect(metrics.avgFps).toBe(0)
    })
  })
})
