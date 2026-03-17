import type { AvatarDB, StoredFitting } from './dexieDb'

interface SaveFittingParams {
  garmentId: string
  measurements: Record<string, number>
  garmentColor: string
  thumbnail?: string
}

export async function saveFitting(
  db: AvatarDB,
  params: SaveFittingParams,
): Promise<string> {
  const id = crypto.randomUUID()
  await db.fittings.add({
    id,
    garmentId: params.garmentId,
    measurements: JSON.stringify(params.measurements),
    garmentColor: params.garmentColor,
    thumbnail: params.thumbnail,
    timestamp: Date.now(),
    synced: false,
  })
  return id
}

export async function getFittings(db: AvatarDB): Promise<StoredFitting[]> {
  return db.fittings.orderBy('timestamp').reverse().toArray()
}

export async function deleteFitting(db: AvatarDB, id: string): Promise<void> {
  await db.fittings.delete(id)
}

export async function getUnsyncedFittings(
  db: AvatarDB,
): Promise<StoredFitting[]> {
  return db.fittings.filter((f) => !f.synced).toArray()
}

export async function markSynced(db: AvatarDB, id: string): Promise<void> {
  await db.fittings.update(id, { synced: true })
}
