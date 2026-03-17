import type { NormalizedMeasurements } from './normalize'
import { BODY_PARAMS } from '../avatar/bodyParams'

/**
 * 정규화된 측정값(0~1)을 morph target shape coefficient로 변환한다.
 * 현재는 직접 매핑(1:1). 향후 PCA/ML 회귀로 교체 가능.
 *
 * @returns BODY_PARAMS 순서에 대응하는 coefficient 배열 (length: 8)
 */
export function measurementsToShapeCoeffs(
  normalized: NormalizedMeasurements,
): number[] {
  return BODY_PARAMS.map((param) => {
    const value = normalized[param as keyof NormalizedMeasurements] ?? 0.5
    return Math.min(1, Math.max(0, value))
  })
}
