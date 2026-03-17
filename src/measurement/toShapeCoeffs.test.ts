import { describe, it, expect } from 'vitest'
import { measurementsToShapeCoeffs } from './toShapeCoeffs'
import type { NormalizedMeasurements } from './normalize'

describe('Feature 03: 측정값 → Shape Coefficient 변환', () => {
  const averageMeasurements: NormalizedMeasurements = {
    height: 0.5,
    chest: 0.5,
    waist: 0.5,
    hip: 0.5,
    shoulder: 0.5,
    armLength: 0.5,
    legLength: 0.5,
    weight: 0.5,
  }

  describe('Scenario: 평균값 입력', () => {
    it('반환값이 배열이다', () => {
      const coeffs = measurementsToShapeCoeffs(averageMeasurements)
      expect(Array.isArray(coeffs)).toBe(true)
    })

    it('shape coefficient 수가 morph target 수(8)와 동일하다', () => {
      const coeffs = measurementsToShapeCoeffs(averageMeasurements)
      expect(coeffs).toHaveLength(8)
    })

    it('평균값일 때 모든 coefficient가 0.5 근처이다', () => {
      const coeffs = measurementsToShapeCoeffs(averageMeasurements)
      for (const c of coeffs) {
        expect(c).toBeGreaterThanOrEqual(0)
        expect(c).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('Scenario: 극단값', () => {
    it('모든 값이 1.0일 때 coefficient가 0~1 범위 내이다', () => {
      const maxMeasurements: NormalizedMeasurements = {
        height: 1,
        chest: 1,
        waist: 1,
        hip: 1,
        shoulder: 1,
        armLength: 1,
        legLength: 1,
        weight: 1,
      }
      const coeffs = measurementsToShapeCoeffs(maxMeasurements)

      for (const c of coeffs) {
        expect(c).toBeGreaterThanOrEqual(0)
        expect(c).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('Scenario: 직접 매핑', () => {
    it('각 정규화된 측정값이 대응하는 morph target에 직접 매핑된다', () => {
      const custom: NormalizedMeasurements = {
        height: 0.8,
        chest: 0.3,
        waist: 0.6,
        hip: 0.4,
        shoulder: 0.7,
        armLength: 0.2,
        legLength: 0.9,
        weight: 0.5,
      }
      const coeffs = measurementsToShapeCoeffs(custom)

      expect(coeffs[0]).toBeCloseTo(0.8) // height
      expect(coeffs[1]).toBeCloseTo(0.3) // chest
      expect(coeffs[2]).toBeCloseTo(0.6) // waist
    })
  })
})
