import type { AvatarDB } from './dexieDb'

const MEASUREMENT_KEY = 'current'

export async function saveMeasurementLocal(
  db: AvatarDB,
  measurements: Record<string, number>,
): Promise<void> {
  const data = JSON.stringify(measurements)
  await db.measurements.put({
    id: MEASUREMENT_KEY,
    data,
    updatedAt: Date.now(),
  })
}

export async function loadMeasurementLocal(
  db: AvatarDB,
): Promise<Record<string, number> | null> {
  const record = await db.measurements.get(MEASUREMENT_KEY)
  if (!record) return null
  return JSON.parse(record.data)
}
