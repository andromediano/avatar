import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { createLOD } from './lod'

describe('Feature 11: LOD 유틸', () => {
  it('3단계 LOD를 생성한다', () => {
    const high = new THREE.Mesh(new THREE.BoxGeometry())
    const mid = new THREE.Mesh(new THREE.BoxGeometry())
    const low = new THREE.Mesh(new THREE.BoxGeometry())

    const lod = createLOD(high, mid, low)

    expect(lod).toBeInstanceOf(THREE.LOD)
    expect(lod.levels).toHaveLength(3)
  })

  it('거리가 올바르게 설정된다', () => {
    const high = new THREE.Mesh(new THREE.BoxGeometry())
    const mid = new THREE.Mesh(new THREE.BoxGeometry())
    const low = new THREE.Mesh(new THREE.BoxGeometry())

    const lod = createLOD(high, mid, low)

    expect(lod.levels[0].distance).toBe(0)
    expect(lod.levels[1].distance).toBe(3)
    expect(lod.levels[2].distance).toBe(6)
  })
})
