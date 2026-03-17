import { describe, it, expect } from 'vitest'
import {
  lookupSizeLabel,
  MALE_SIZE_TABLE,
  FEMALE_SIZE_TABLE,
} from './sizeTable'

describe('Feature 03: 사이즈 테이블 조회', () => {
  describe('Scenario: 남성 사이즈 라벨로 치수 조회', () => {
    it('남성 100(L) 사이즈의 표준 치수를 반환한다', () => {
      const result = lookupSizeLabel('M', 100)

      expect(result).toBeDefined()
      expect(result!.height).toBe(175)
      expect(result!.chest).toBe(99.5)
      expect(result!.waist).toBe(85.5)
      expect(result!.hip).toBe(98)
    })
  })

  describe('Scenario: 존재하지 않는 사이즈', () => {
    it('지원하지 않는 사이즈는 null을 반환한다', () => {
      const result = lookupSizeLabel('M', 999)

      expect(result).toBeNull()
    })
  })

  describe('Scenario: 남성 사이즈 테이블 완전성', () => {
    it('85, 90, 95, 100, 105, 110 사이즈가 모두 존재한다', () => {
      expect(MALE_SIZE_TABLE).toHaveProperty('85')
      expect(MALE_SIZE_TABLE).toHaveProperty('90')
      expect(MALE_SIZE_TABLE).toHaveProperty('95')
      expect(MALE_SIZE_TABLE).toHaveProperty('100')
      expect(MALE_SIZE_TABLE).toHaveProperty('105')
      expect(MALE_SIZE_TABLE).toHaveProperty('110')
    })
  })

  describe('Scenario: 여성 사이즈 테이블', () => {
    it('여성 90 사이즈를 조회할 수 있다', () => {
      const result = lookupSizeLabel('F', 90)

      expect(result).toBeDefined()
      expect(result!.chest).toBeDefined()
      expect(result!.waist).toBeDefined()
    })

    it('80, 85, 90, 95, 100 사이즈가 모두 존재한다', () => {
      expect(FEMALE_SIZE_TABLE).toHaveProperty('80')
      expect(FEMALE_SIZE_TABLE).toHaveProperty('85')
      expect(FEMALE_SIZE_TABLE).toHaveProperty('90')
      expect(FEMALE_SIZE_TABLE).toHaveProperty('95')
      expect(FEMALE_SIZE_TABLE).toHaveProperty('100')
    })
  })
})
