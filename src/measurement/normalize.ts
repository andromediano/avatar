/**
 * Size Korea 기반 신체 측정 통계 및 정규화.
 * 원시 cm/kg 값을 0~1 범위의 morph target 값으로 변환한다.
 */

export interface RawMeasurements {
  height?: number
  chest?: number
  waist?: number
  hip?: number
  shoulder?: number
  armLength?: number
  legLength?: number
  weight?: number
}

export interface NormalizedMeasurements {
  height: number
  chest: number
  waist: number
  hip: number
  shoulder: number
  armLength: number
  legLength: number
  weight: number
}

interface StatEntry {
  mean: number
  std: number
}

type BodyStats = Record<keyof NormalizedMeasurements, StatEntry>

/** Size Korea 제8차 조사 기반 — 남성 20~39세 */
export const MALE_STATS: BodyStats = {
  height: { mean: 174.2, std: 5.7 },
  chest: { mean: 97.3, std: 7.1 },
  waist: { mean: 83.5, std: 9.2 },
  hip: { mean: 97.1, std: 5.8 },
  shoulder: { mean: 44.2, std: 2.4 },
  armLength: { mean: 59.1, std: 2.9 },
  legLength: { mean: 78.5, std: 4.0 },
  weight: { mean: 74.1, std: 12.3 },
}

/** Size Korea 제8차 조사 기반 — 여성 20~39세 */
export const FEMALE_STATS: BodyStats = {
  height: { mean: 161.5, std: 5.3 },
  chest: { mean: 87.2, std: 6.8 },
  waist: { mean: 71.8, std: 8.1 },
  hip: { mean: 94.5, std: 5.6 },
  shoulder: { mean: 38.8, std: 2.1 },
  armLength: { mean: 53.0, std: 2.5 },
  legLength: { mean: 72.0, std: 3.8 },
  weight: { mean: 57.8, std: 9.5 },
}

/**
 * 원시 측정값(cm/kg)을 0~1 범위로 정규화한다.
 * 평균 = 0.5, ±3σ = 0.0~1.0 범위.
 * 누락 항목은 평균(0.5)으로 대체된다.
 */
export function normalizeMeasurements(
  raw: RawMeasurements,
  gender: 'M' | 'F',
): NormalizedMeasurements {
  const stats = gender === 'M' ? MALE_STATS : FEMALE_STATS
  const keys = Object.keys(stats) as (keyof NormalizedMeasurements)[]

  const result = {} as NormalizedMeasurements

  for (const key of keys) {
    const value = raw[key]
    const { mean, std } = stats[key]

    if (value === undefined) {
      result[key] = 0.5
    } else {
      // z-score를 0~1 범위로 변환 (±3σ → 0~1)
      const z = (value - mean) / std
      result[key] = clamp(z / 6 + 0.5, 0, 1)
    }
  }

  return result
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
