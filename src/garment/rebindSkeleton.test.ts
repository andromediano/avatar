import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { rebindToAvatarSkeleton } from './rebindSkeleton'

function createBone(name: string): THREE.Bone {
  const bone = new THREE.Bone()
  bone.name = name
  return bone
}

function createSkinnedMeshWithBones(
  boneNames: string[],
  skinIndices: number[],
): THREE.SkinnedMesh {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3),
  )
  geometry.setAttribute(
    'skinIndex',
    new THREE.Uint16BufferAttribute(skinIndices, 4),
  )
  geometry.setAttribute(
    'skinWeight',
    new THREE.Float32BufferAttribute(
      new Array(skinIndices.length).fill(0.25),
      4,
    ),
  )

  const bones = boneNames.map(createBone)
  const skeleton = new THREE.Skeleton(bones)
  const mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshBasicMaterial())
  mesh.bind(skeleton)

  return mesh
}

describe('Feature 05: 스켈레톤 리바인딩', () => {
  describe('Scenario: 본 이름 기준 매칭', () => {
    it('동일 이름의 본이 올바르게 리매핑된다', () => {
      // Avatar: Hips(0), Spine(1), Head(2)
      const avatarBones = ['Hips', 'Spine', 'Head'].map(createBone)
      const avatarSkeleton = new THREE.Skeleton(avatarBones)

      // Garment: Spine(0), Head(1) — 순서 다름
      const garmentMesh = createSkinnedMeshWithBones(
        ['Spine', 'Head'],
        [0, 0, 0, 0, 1, 1, 1, 1], // vertex 0 → Spine(0), vertex 1 → Head(1)
      )

      const result = rebindToAvatarSkeleton(garmentMesh, avatarSkeleton)

      // Spine → avatar index 1, Head → avatar index 2
      const skinIndex = garmentMesh.geometry.getAttribute('skinIndex')
      expect(skinIndex.getX(0)).toBe(1) // Spine → 1
      expect(skinIndex.getX(1)).toBe(2) // Head → 2
      expect(result.matchedCount).toBe(2)
      expect(result.unmatchedBones).toHaveLength(0)
    })
  })

  describe('Scenario: 매칭 실패 본 보고', () => {
    it('아바타에 없는 본 이름이 unmatchedBones에 포함된다', () => {
      const avatarBones = ['Hips', 'Spine'].map(createBone)
      const avatarSkeleton = new THREE.Skeleton(avatarBones)

      const garmentMesh = createSkinnedMeshWithBones(
        ['Spine', 'CustomBone'],
        [0, 0, 0, 0, 1, 1, 1, 1],
      )

      const result = rebindToAvatarSkeleton(garmentMesh, avatarSkeleton)

      expect(result.matchedCount).toBe(1) // Spine만 매칭
      expect(result.unmatchedBones).toContain('CustomBone')
    })
  })

  describe('Scenario: 스켈레톤 교체', () => {
    it('garmentMesh.skeleton이 avatarSkeleton으로 교체된다', () => {
      const avatarBones = ['Hips', 'Spine'].map(createBone)
      const avatarSkeleton = new THREE.Skeleton(avatarBones)

      const garmentMesh = createSkinnedMeshWithBones(
        ['Hips', 'Spine'],
        [0, 0, 0, 0, 1, 1, 1, 1],
      )

      rebindToAvatarSkeleton(garmentMesh, avatarSkeleton)

      expect(garmentMesh.skeleton).toBe(avatarSkeleton)
    })
  })
})
