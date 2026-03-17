import { describe, it, expect, vi, afterEach } from 'vitest'
import * as THREE from 'three'
import { playBakedClothAnimation } from './bakedCloth'

function createMockMeshWithMorphFrames(frameCount: number): THREE.SkinnedMesh {
  const geometry = new THREE.BufferGeometry()
  const mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshBasicMaterial())
  const skeleton = new THREE.Skeleton([])
  mesh.bind(skeleton)

  mesh.morphTargetDictionary = {}
  mesh.morphTargetInfluences = []

  for (let i = 0; i < frameCount; i++) {
    mesh.morphTargetDictionary[`frame_${i}`] = i
    mesh.morphTargetInfluences.push(0)
  }

  return mesh
}

describe('Feature 06: Pre-Baked Cloth Animation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Scenario: morph target이 없는 메시', () => {
    it('에러를 throw한다', () => {
      const geometry = new THREE.BufferGeometry()
      const mesh = new THREE.SkinnedMesh(
        geometry,
        new THREE.MeshBasicMaterial(),
      )
      const skeleton = new THREE.Skeleton([])
      mesh.bind(skeleton)

      expect(() => playBakedClothAnimation(mesh)).toThrow(
        'morph target이 없는 메시입니다',
      )
    })
  })

  describe('Scenario: 프리베이크 애니메이션 재생', () => {
    it('tick 호출 시 현재 프레임만 활성화된다', () => {
      const mesh = createMockMeshWithMorphFrames(3)
      const anim = playBakedClothAnimation(mesh, 30)

      // 첫 tick 실행
      anim.tick()
      expect(mesh.morphTargetInfluences![0]).toBe(1.0)
      expect(mesh.morphTargetInfluences![1]).toBe(0)
      expect(mesh.morphTargetInfluences![2]).toBe(0)

      // 두 번째 tick
      anim.tick()
      expect(mesh.morphTargetInfluences![0]).toBe(0)
      expect(mesh.morphTargetInfluences![1]).toBe(1.0)
      expect(mesh.morphTargetInfluences![2]).toBe(0)

      anim.stop()
    })

    it('프레임이 루프한다', () => {
      const mesh = createMockMeshWithMorphFrames(2)
      const anim = playBakedClothAnimation(mesh, 30)

      anim.tick() // frame 0
      anim.tick() // frame 1
      anim.tick() // frame 0 (루프)

      expect(mesh.morphTargetInfluences![0]).toBe(1.0)
      expect(mesh.morphTargetInfluences![1]).toBe(0)

      anim.stop()
    })
  })

  describe('Scenario: 애니메이션 정지', () => {
    it('stop 후 자동 타이머가 해제된다', () => {
      vi.useFakeTimers()
      const mesh = createMockMeshWithMorphFrames(3)
      const anim = playBakedClothAnimation(mesh, 30)

      anim.start()
      anim.stop()

      // stop 후 시간이 흘러도 프레임이 변하지 않는다
      const currentFrame0 = mesh.morphTargetInfluences![0]
      vi.advanceTimersByTime(1000)
      expect(mesh.morphTargetInfluences![0]).toBe(currentFrame0)

      vi.useRealTimers()
    })
  })
})
