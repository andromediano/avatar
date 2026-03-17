import * as THREE from 'three'

export const BODY_PARAMS = [
  'height',
  'chest',
  'waist',
  'hip',
  'shoulder',
  'armLength',
  'legLength',
  'weight',
] as const

export type BodyParamName = (typeof BODY_PARAMS)[number]

export interface BodyParamController {
  setBodyParam: (name: string, value: number) => void
  getBodyParam: (name: string) => number
  setAllParams: (params: Record<string, number>) => void
  resetAll: () => void
}

export function createBodyParamController(
  morphMeshes: THREE.SkinnedMesh[],
): BodyParamController {
  function setBodyParam(name: string, value: number) {
    const clamped = THREE.MathUtils.clamp(value, 0, 1)
    for (const mesh of morphMeshes) {
      const idx = mesh.morphTargetDictionary?.[name]
      if (idx !== undefined && mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[idx] = clamped
      }
    }
  }

  function getBodyParam(name: string): number {
    for (const mesh of morphMeshes) {
      const idx = mesh.morphTargetDictionary?.[name]
      if (idx !== undefined && mesh.morphTargetInfluences) {
        return mesh.morphTargetInfluences[idx]
      }
    }
    return 0
  }

  function setAllParams(params: Record<string, number>) {
    for (const [name, value] of Object.entries(params)) {
      setBodyParam(name, value)
    }
  }

  function resetAll() {
    for (const mesh of morphMeshes) {
      if (mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences.fill(0)
      }
    }
  }

  return { setBodyParam, getBodyParam, setAllParams, resetAll }
}
