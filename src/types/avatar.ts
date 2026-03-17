import type * as THREE from 'three'

export interface AvatarHandle {
  model: THREE.Group
  skeleton: THREE.Skeleton
  morphMeshes: THREE.SkinnedMesh[]
  setBodyParam: (name: string, value: number) => void
  getBodyParam: (name: string) => number
  setAllParams: (params: Record<string, number>) => void
  resetAll: () => void
}
