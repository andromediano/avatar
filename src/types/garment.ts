import type * as THREE from 'three'

export interface GarmentMeta {
  id: string
  name: string
  category?: 'top' | 'bottom' | 'outer' | 'dress'
  brand?: string
  sizes?: string[]
  modelUrl: string
  thumbnailUrl?: string
  tags?: string[]
}

export interface GarmentHandle {
  model: THREE.Group
  meshes: THREE.SkinnedMesh[]
  dispose: () => void
}
