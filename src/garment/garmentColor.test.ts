import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { applyGarmentColor, COLOR_PRESETS } from './garmentColor'

describe('Feature 05: 의류 색상 변경', () => {
  function createMeshWithMaterial(): THREE.Mesh {
    return new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
    )
  }

  describe('Scenario: 프리셋 색상 적용', () => {
    it('HEX 문자열로 material color를 변경한다', () => {
      const mesh = createMeshWithMaterial()
      applyGarmentColor([mesh], '#ef4444')

      const mat = mesh.material as THREE.MeshStandardMaterial
      expect(mat.color.getHexString()).toBe('ef4444')
    })
  })

  describe('Scenario: 복수 메시에 적용', () => {
    it('모든 메시의 색상이 변경된다', () => {
      const meshes = [createMeshWithMaterial(), createMeshWithMaterial()]
      applyGarmentColor(meshes, '#22c55e')

      for (const mesh of meshes) {
        const mat = mesh.material as THREE.MeshStandardMaterial
        expect(mat.color.getHexString()).toBe('22c55e')
      }
    })
  })

  describe('Scenario: 색상 프리셋 목록', () => {
    it('7개의 프리셋이 정의되어 있다', () => {
      expect(COLOR_PRESETS).toHaveLength(7)
      expect(COLOR_PRESETS).toContain('#3b82f6')
      expect(COLOR_PRESETS).toContain('#ef4444')
      expect(COLOR_PRESETS).toContain('#111111')
      expect(COLOR_PRESETS).toContain('#ffffff')
    })
  })

  describe('Scenario: material 배열 처리', () => {
    it('material이 배열인 메시도 처리한다', () => {
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), [
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
      ])

      applyGarmentColor([mesh], '#f59e0b')

      for (const mat of mesh.material as THREE.MeshStandardMaterial[]) {
        expect(mat.color.getHexString()).toBe('f59e0b')
      }
    })
  })
})
