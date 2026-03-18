import { useSceneStore, type BodyMeasurements } from '../store/sceneStore'
import { lookupSizeLabel } from '../measurement/sizeTable'
import { normalizeMeasurements } from '../measurement/normalize'
import type { Gender } from '../types/measurement'

export function useMeasurement() {
  const bodyParams = useSceneStore((s) => s.bodyParams)
  const updateBodyParams = useSceneStore((s) => s.updateBodyParams)

  function applySizeLabel(gender: Gender, sizeLabel: number) {
    const entry = lookupSizeLabel(gender, sizeLabel)
    if (!entry) return

    const normalized = normalizeMeasurements(
      {
        height: entry.height,
        chest: entry.chest,
        waist: entry.waist,
        hip: entry.hip,
        shoulder: entry.shoulder,
        armLength: entry.armLength,
        weight: entry.weight,
      },
      gender,
    )
    updateBodyParams(normalized as Partial<BodyMeasurements>)
  }

  return { bodyParams, updateBodyParams, applySizeLabel }
}
