import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  createScene,
  DEFAULT_SCENE_CONFIG,
  type SceneConfig,
} from './initScene'

describe('Feature 01: 3D 씬 초기화', () => {
  describe('Scenario: 기본 씬 구성', () => {
    it('scene과 camera를 반환한다', () => {
      const { scene, camera } = createScene()

      expect(scene).toBeInstanceOf(THREE.Scene)
      expect(camera).toBeInstanceOf(THREE.PerspectiveCamera)
    })
  })

  describe('Scenario: 카메라 설정', () => {
    it('PerspectiveCamera가 fov 45, position [0, 1.2, 3]으로 설정된다', () => {
      const { camera } = createScene()

      expect(camera.fov).toBe(45)
      expect(camera.position.x).toBeCloseTo(0)
      expect(camera.position.y).toBeCloseTo(1.2)
      expect(camera.position.z).toBeCloseTo(3)
    })

    it('near=0.1, far=100으로 설정된다', () => {
      const { camera } = createScene()

      expect(camera.near).toBeCloseTo(0.1)
      expect(camera.far).toBe(100)
    })

    it('커스텀 config로 카메라를 설정할 수 있다', () => {
      const config: SceneConfig = {
        ...DEFAULT_SCENE_CONFIG,
        cameraFov: 60,
        cameraPosition: [1, 2, 5],
      }
      const { camera } = createScene(config)

      expect(camera.fov).toBe(60)
      expect(camera.position.x).toBeCloseTo(1)
      expect(camera.position.y).toBeCloseTo(2)
      expect(camera.position.z).toBeCloseTo(5)
    })
  })

  describe('Scenario: 기본 조명 구성', () => {
    it('AmbientLight(intensity: 0.6)가 씬에 추가된다', () => {
      const { scene } = createScene()

      const ambient = scene.children.find(
        (c) => c instanceof THREE.AmbientLight,
      ) as THREE.AmbientLight

      expect(ambient).toBeDefined()
      expect(ambient.intensity).toBeCloseTo(0.6)
    })

    it('DirectionalLight(intensity: 1.2, position: [2,4,3], castShadow)가 추가된다', () => {
      const { scene } = createScene()

      const dirLight = scene.children.find(
        (c) => c instanceof THREE.DirectionalLight,
      ) as THREE.DirectionalLight

      expect(dirLight).toBeDefined()
      expect(dirLight.intensity).toBeCloseTo(1.2)
      expect(dirLight.position.x).toBeCloseTo(2)
      expect(dirLight.position.y).toBeCloseTo(4)
      expect(dirLight.position.z).toBeCloseTo(3)
      expect(dirLight.castShadow).toBe(true)
    })

    it('HemisphereLight(intensity: 0.4)가 추가된다', () => {
      const { scene } = createScene()

      const hemi = scene.children.find(
        (c) => c instanceof THREE.HemisphereLight,
      ) as THREE.HemisphereLight

      expect(hemi).toBeDefined()
      expect(hemi.intensity).toBeCloseTo(0.4)
    })
  })

  describe('Scenario: 바닥 그리드', () => {
    it('GridHelper가 씬에 추가된다', () => {
      const { scene } = createScene()

      const grid = scene.children.find((c) => c instanceof THREE.GridHelper)
      expect(grid).toBeDefined()
    })
  })

  describe('Scenario: 배경색', () => {
    it('배경색이 0xf0f0f0으로 설정된다', () => {
      const { scene } = createScene()

      expect(scene.background).toBeInstanceOf(THREE.Color)
      const bg = scene.background as THREE.Color
      expect(bg.getHex()).toBe(0xf0f0f0)
    })

    it('커스텀 배경색을 설정할 수 있다', () => {
      const config: SceneConfig = {
        ...DEFAULT_SCENE_CONFIG,
        background: 0x000000,
      }
      const { scene } = createScene(config)

      const bg = scene.background as THREE.Color
      expect(bg.getHex()).toBe(0x000000)
    })
  })

  describe('Scenario: 씬 자식 요소 수', () => {
    it('4개 요소(AmbientLight, DirectionalLight, HemisphereLight, GridHelper)가 추가된다', () => {
      const { scene } = createScene()

      // DirectionalLight는 shadow camera target도 추가하므로 children이 더 많을 수 있음
      const lightCount = scene.children.filter(
        (c) => c instanceof THREE.Light,
      ).length
      const gridCount = scene.children.filter(
        (c) => c instanceof THREE.GridHelper,
      ).length

      expect(lightCount).toBe(3)
      expect(gridCount).toBe(1)
    })
  })
})
