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

export type Gender = 'M' | 'F'

export type InputMode = 'slider' | 'size' | 'photo'
