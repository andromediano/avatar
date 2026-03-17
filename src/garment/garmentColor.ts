import * as THREE from 'three'

export const COLOR_PRESETS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#111111',
  '#ffffff',
] as const

/**
 * 의류 메시 목록에 색상을 적용한다.
 * MeshStandardMaterial의 color를 변경한다.
 */
export function applyGarmentColor(meshes: THREE.Mesh[], hex: string): void {
  const color = new THREE.Color(hex)

  for (const mesh of meshes) {
    if (Array.isArray(mesh.material)) {
      for (const mat of mesh.material) {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.color.copy(color)
        }
      }
    } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
      mesh.material.color.copy(color)
    }
  }
}
