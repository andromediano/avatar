import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  BODY_PARAMS,
  createBodyParamController,
  type BodyParamController,
} from './bodyParams'

function createMockSkinnedMesh(morphNames: string[]): THREE.SkinnedMesh {
  const geometry = new THREE.BufferGeometry()
  const material = new THREE.MeshBasicMaterial()
  const skeleton = new THREE.Skeleton([])
  const mesh = new THREE.SkinnedMesh(geometry, material)
  mesh.bind(skeleton)

  mesh.morphTargetDictionary = {}
  mesh.morphTargetInfluences = []

  morphNames.forEach((name, idx) => {
    mesh.morphTargetDictionary![name] = idx
    mesh.morphTargetInfluences!.push(0)
  })

  return mesh
}

describe('Feature 02: 아바타 체형 파라미터', () => {
  describe('BODY_PARAMS 상수', () => {
    it('8개의 체형 파라미터가 정의되어 있다', () => {
      expect(BODY_PARAMS).toHaveLength(8)
      expect(BODY_PARAMS).toContain('height')
      expect(BODY_PARAMS).toContain('chest')
      expect(BODY_PARAMS).toContain('waist')
      expect(BODY_PARAMS).toContain('hip')
      expect(BODY_PARAMS).toContain('shoulder')
      expect(BODY_PARAMS).toContain('armLength')
      expect(BODY_PARAMS).toContain('legLength')
      expect(BODY_PARAMS).toContain('weight')
    })
  })

  describe('Scenario: 체형 파라미터 실시간 조절', () => {
    let controller: BodyParamController
    let mesh: THREE.SkinnedMesh

    it('setBodyParam으로 morph target이 적용된다', () => {
      mesh = createMockSkinnedMesh(['height', 'chest', 'waist'])
      controller = createBodyParamController([mesh])

      controller.setBodyParam('chest', 0.7)

      expect(mesh.morphTargetInfluences![1]).toBeCloseTo(0.7)
    })

    it('복수 메시에 동시에 적용된다', () => {
      const mesh1 = createMockSkinnedMesh(['height', 'chest'])
      const mesh2 = createMockSkinnedMesh(['height', 'chest'])
      controller = createBodyParamController([mesh1, mesh2])

      controller.setBodyParam('height', 0.8)

      expect(mesh1.morphTargetInfluences![0]).toBeCloseTo(0.8)
      expect(mesh2.morphTargetInfluences![0]).toBeCloseTo(0.8)
    })
  })

  describe('Scenario: 값 클램핑', () => {
    it('1.0 초과 값은 1.0으로 클램핑된다', () => {
      const mesh = createMockSkinnedMesh(['waist'])
      const controller = createBodyParamController([mesh])

      controller.setBodyParam('waist', 1.5)

      expect(mesh.morphTargetInfluences![0]).toBeCloseTo(1.0)
    })

    it('0.0 미만 값은 0.0으로 클램핑된다', () => {
      const mesh = createMockSkinnedMesh(['hip'])
      const controller = createBodyParamController([mesh])

      controller.setBodyParam('hip', -0.3)

      expect(mesh.morphTargetInfluences![0]).toBeCloseTo(0.0)
    })
  })

  describe('Scenario: 존재하지 않는 파라미터', () => {
    it('에러 없이 무시된다', () => {
      const mesh = createMockSkinnedMesh(['height'])
      const controller = createBodyParamController([mesh])

      expect(() => {
        controller.setBodyParam('unknownParam', 0.5)
      }).not.toThrow()

      expect(mesh.morphTargetInfluences![0]).toBeCloseTo(0)
    })
  })

  describe('Scenario: 전체 파라미터 일괄 설정', () => {
    it('setAllParams로 복수 파라미터를 한번에 설정한다', () => {
      const mesh = createMockSkinnedMesh([
        'height',
        'chest',
        'waist',
        'hip',
        'weight',
      ])
      const controller = createBodyParamController([mesh])

      controller.setAllParams({
        height: 0.8,
        chest: 0.6,
        waist: 0.4,
        hip: 0.5,
        weight: 0.7,
      })

      expect(mesh.morphTargetInfluences![0]).toBeCloseTo(0.8) // height
      expect(mesh.morphTargetInfluences![1]).toBeCloseTo(0.6) // chest
      expect(mesh.morphTargetInfluences![2]).toBeCloseTo(0.4) // waist
      expect(mesh.morphTargetInfluences![3]).toBeCloseTo(0.5) // hip
      expect(mesh.morphTargetInfluences![4]).toBeCloseTo(0.7) // weight
    })
  })

  describe('Scenario: 현재 값 조회', () => {
    it('getBodyParam으로 현재 morph target 값을 조회한다', () => {
      const mesh = createMockSkinnedMesh(['chest'])
      const controller = createBodyParamController([mesh])

      controller.setBodyParam('chest', 0.65)

      expect(controller.getBodyParam('chest')).toBeCloseTo(0.65)
    })

    it('존재하지 않는 파라미터는 0을 반환한다', () => {
      const mesh = createMockSkinnedMesh(['chest'])
      const controller = createBodyParamController([mesh])

      expect(controller.getBodyParam('unknown')).toBe(0)
    })
  })

  describe('Scenario: 리셋', () => {
    it('resetAll로 모든 파라미터를 0으로 리셋한다', () => {
      const mesh = createMockSkinnedMesh(['height', 'chest', 'waist'])
      const controller = createBodyParamController([mesh])

      controller.setAllParams({ height: 0.8, chest: 0.6, waist: 0.4 })
      controller.resetAll()

      expect(mesh.morphTargetInfluences![0]).toBeCloseTo(0)
      expect(mesh.morphTargetInfluences![1]).toBeCloseTo(0)
      expect(mesh.morphTargetInfluences![2]).toBeCloseTo(0)
    })
  })
})
