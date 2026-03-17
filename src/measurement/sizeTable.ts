/**
 * KS K 0051 사이즈 테이블 + Size Korea 평균 기반 표준 치수.
 */

export interface SizeEntry {
  height: number
  weight: number
  chest: number
  waist: number
  hip: number
  shoulder: number
  armLength: number
  inseam: number
}

type SizeTable = Record<number, SizeEntry>

/** 남성 상의 사이즈 테이블 */
export const MALE_SIZE_TABLE: SizeTable = {
  85: {
    height: 165,
    weight: 58,
    chest: 84.5,
    waist: 70.5,
    hip: 89,
    shoulder: 40,
    armLength: 55,
    inseam: 74,
  },
  90: {
    height: 170,
    weight: 64,
    chest: 89.5,
    waist: 75.5,
    hip: 92,
    shoulder: 42,
    armLength: 57,
    inseam: 76,
  },
  95: {
    height: 172,
    weight: 70,
    chest: 94.5,
    waist: 80.5,
    hip: 95,
    shoulder: 43,
    armLength: 58,
    inseam: 77,
  },
  100: {
    height: 175,
    weight: 76,
    chest: 99.5,
    waist: 85.5,
    hip: 98,
    shoulder: 45,
    armLength: 59,
    inseam: 79,
  },
  105: {
    height: 177,
    weight: 82,
    chest: 104.5,
    waist: 90.5,
    hip: 101,
    shoulder: 46,
    armLength: 60,
    inseam: 80,
  },
  110: {
    height: 178,
    weight: 88,
    chest: 109.5,
    waist: 95.5,
    hip: 104,
    shoulder: 47,
    armLength: 61,
    inseam: 80,
  },
}

/** 여성 상의 사이즈 테이블 */
export const FEMALE_SIZE_TABLE: SizeTable = {
  80: {
    height: 155,
    weight: 48,
    chest: 79.5,
    waist: 63.5,
    hip: 88,
    shoulder: 36,
    armLength: 51,
    inseam: 70,
  },
  85: {
    height: 160,
    weight: 53,
    chest: 84.5,
    waist: 68.5,
    hip: 91,
    shoulder: 37.5,
    armLength: 52,
    inseam: 72,
  },
  90: {
    height: 162,
    weight: 58,
    chest: 89.5,
    waist: 73.5,
    hip: 94,
    shoulder: 39,
    armLength: 53,
    inseam: 73,
  },
  95: {
    height: 163,
    weight: 63,
    chest: 94.5,
    waist: 78.5,
    hip: 97,
    shoulder: 40,
    armLength: 54,
    inseam: 74,
  },
  100: {
    height: 164,
    weight: 68,
    chest: 99.5,
    waist: 83.5,
    hip: 100,
    shoulder: 41,
    armLength: 55,
    inseam: 74,
  },
}

/**
 * 사이즈 라벨로 표준 치수를 조회한다.
 * @returns 치수 정보 또는 존재하지 않는 사이즈면 null
 */
export function lookupSizeLabel(
  gender: 'M' | 'F',
  sizeLabel: number,
): SizeEntry | null {
  const table = gender === 'M' ? MALE_SIZE_TABLE : FEMALE_SIZE_TABLE
  return table[sizeLabel] ?? null
}
