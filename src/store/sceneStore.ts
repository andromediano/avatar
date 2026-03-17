import { create } from 'zustand'

export interface BodyMeasurements {
  height: number
  chest: number
  waist: number
  hip: number
  shoulder: number
  armLength: number
  legLength: number
  weight: number
}

export interface GarmentMeta {
  id: string
  name: string
  modelUrl: string
}

export type SimMode = 'baked' | 'realtime'

interface SceneState {
  bodyParams: BodyMeasurements
  currentGarment: GarmentMeta | null
  garmentColor: string
  simMode: SimMode

  updateBodyParams: (params: Partial<BodyMeasurements>) => void
  loadGarment: (garment: GarmentMeta) => void
  clearGarment: () => void
  setGarmentColor: (color: string) => void
  setSimMode: (mode: SimMode) => void
}

const DEFAULT_BODY_PARAMS: BodyMeasurements = {
  height: 0.5,
  chest: 0.5,
  waist: 0.5,
  hip: 0.5,
  shoulder: 0.5,
  armLength: 0.5,
  legLength: 0.5,
  weight: 0.5,
}

export const useSceneStore = create<SceneState>()((set) => ({
  bodyParams: { ...DEFAULT_BODY_PARAMS },
  currentGarment: null,
  garmentColor: '#3b82f6',
  simMode: 'baked',

  updateBodyParams: (params) =>
    set((state) => ({
      bodyParams: { ...state.bodyParams, ...params },
    })),

  loadGarment: (garment) => set({ currentGarment: garment }),

  clearGarment: () => set({ currentGarment: null }),

  setGarmentColor: (color) => set({ garmentColor: color }),

  setSimMode: (mode) => set({ simMode: mode }),
}))
