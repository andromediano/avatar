import Dexie, { type EntityTable } from 'dexie'

export interface StoredMeasurement {
  id: string
  data: string // 암호화된 JSON
  updatedAt: number
}

export interface StoredFitting {
  id: string
  garmentId: string
  measurements: string // JSON
  garmentColor: string
  thumbnail?: string
  timestamp: number
  synced: boolean
}

export interface StoredFavorite {
  garmentId: string
}

export class AvatarDB extends Dexie {
  measurements!: EntityTable<StoredMeasurement, 'id'>
  fittings!: EntityTable<StoredFitting, 'id'>
  favorites!: EntityTable<StoredFavorite, 'garmentId'>

  constructor() {
    super('AvatarDB')
    this.version(1).stores({
      measurements: 'id, updatedAt',
      fittings: 'id, garmentId, timestamp, synced',
      favorites: 'garmentId',
    })
  }
}

export const db = new AvatarDB()
