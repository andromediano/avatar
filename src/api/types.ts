export interface ApiGarment {
  id: string
  name: string
  category: 'top' | 'bottom' | 'outer' | 'dress'
  brand?: string
  sizes: string[]
  modelUrl: string
  thumbnailUrl?: string
  tags: string[]
}

export interface ApiPagination {
  page: number
  limit: number
  total: number
}

export interface ApiGarmentListResponse {
  data: ApiGarment[]
  pagination: ApiPagination
}

export interface ApiUserProfile {
  id: string
  email: string
  nickname?: string
}

export interface ApiMeasurements {
  heightCm: number
  chestCm?: number
  waistCm?: number
  hipCm?: number
  shoulderCm?: number
  armLenCm?: number
  legLenCm?: number
}

export interface ApiFittingRecord {
  id: string
  garmentId: string
  fitScore?: number
  screenshotUrl?: string
  createdAt: string
}
