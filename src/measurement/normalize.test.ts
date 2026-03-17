import { describe, it, expect } from 'vitest'
import {
  normalizeMeasurements,
  MALE_STATS,
  FEMALE_STATS,
  type RawMeasurements,
} from './normalize'

describe('Feature 03: 신체 치수 정규화', () => {
  describe('Scenario: 평균값 입력 시 모든 값이 0.5 근처', () => {
    it('남성 평균값이 0.5로 정규화된다', () => {
      const raw: RawMeasurements = {
        height: MALE_STATS.height.mean,
        chest: MALE_STATS.chest.mean,
        waist: MALE_STATS.waist.mean,
        hip: MALE_STATS.hip.mean,
        weight: MALE_STATS.weight.mean,
      }

      const result = normalizeMeasurements(raw, 'M')

      expect(result.height).toBeCloseTo(0.5, 1)
      expect(result.chest).toBeCloseTo(0.5, 1)
      expect(result.waist).toBeCloseTo(0.5, 1)
      expect(result.hip).toBeCloseTo(0.5, 1)
      expect(result.weight).toBeCloseTo(0.5, 1)
    })
  })

  describe('Scenario: 극단값 클램핑', () => {
    it('매우 큰 값은 1.0으로 클램핑된다', () => {
      const raw: RawMeasurements = {
        height: 250,
        chest: 200,
        waist: 200,
        hip: 200,
        weight: 200,
      }

      const result = normalizeMeasurements(raw, 'M')

      expect(result.height).toBeLessThanOrEqual(1.0)
      expect(result.chest).toBeLessThanOrEqual(1.0)
    })

    it('매우 작은 값은 0.0으로 클램핑된다', () => {
      const raw: RawMeasurements = {
        height: 100,
        chest: 50,
        waist: 40,
        hip: 50,
        weight: 20,
      }

      const result = normalizeMeasurements(raw, 'M')

      expect(result.height).toBeGreaterThanOrEqual(0.0)
      expect(result.chest).toBeGreaterThanOrEqual(0.0)
    })
  })

  describe('Scenario: 성별에 따른 다른 통계 사용', () => {
    it('여성 평균값이 0.5로 정규화된다', () => {
      const raw: RawMeasurements = {
        height: FEMALE_STATS.height.mean,
        chest: FEMALE_STATS.chest.mean,
        waist: FEMALE_STATS.waist.mean,
        hip: FEMALE_STATS.hip.mean,
        weight: FEMALE_STATS.weight.mean,
      }

      const result = normalizeMeasurements(raw, 'F')

      expect(result.height).toBeCloseTo(0.5, 1)
      expect(result.chest).toBeCloseTo(0.5, 1)
    })
  })

  describe('Scenario: 선택 항목 누락 시 평균 대체', () => {
    it('누락 항목은 0.5로 설정된다', () => {
      const raw: RawMeasurements = {
        height: MALE_STATS.height.mean,
      }

      const result = normalizeMeasurements(raw, 'M')

      expect(result.height).toBeCloseTo(0.5, 1)
      // 누락 항목은 평균으로 대체되므로 0.5
      expect(result.chest).toBeCloseTo(0.5, 1)
      expect(result.waist).toBeCloseTo(0.5, 1)
    })
  })
})
