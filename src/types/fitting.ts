export interface FittingRecord {
  id: string
  garmentId: string
  measurements: Record<string, number>
  garmentColor: string
  thumbnail?: string
  timestamp: number
  synced: boolean
}
