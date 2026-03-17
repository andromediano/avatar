import { describe, it, expect, beforeEach } from 'vitest'
import { useSceneStore } from './sceneStore'

describe('Zustand SceneStore', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState())
  })

  describe('Scenario: 체형 파라미터 업데이트', () => {
    it('updateBodyParams로 부분 업데이트가 가능하다', () => {
      useSceneStore.getState().updateBodyParams({ chest: 0.7, waist: 0.4 })

      const state = useSceneStore.getState()
      expect(state.bodyParams.chest).toBe(0.7)
      expect(state.bodyParams.waist).toBe(0.4)
      expect(state.bodyParams.height).toBe(0.5) // 기본값 유지
    })
  })

  describe('Scenario: 의류 선택', () => {
    it('loadGarment로 의류를 선택한다', () => {
      useSceneStore.getState().loadGarment({
        id: 'tshirt_01',
        name: '기본 티셔츠',
        modelUrl: '/models/garments/tshirt.glb',
      })

      const state = useSceneStore.getState()
      expect(state.currentGarment).toBeDefined()
      expect(state.currentGarment!.id).toBe('tshirt_01')
    })

    it('clearGarment로 의류를 해제한다', () => {
      useSceneStore.getState().loadGarment({
        id: 'tshirt_01',
        name: '기본 티셔츠',
        modelUrl: '/models/garments/tshirt.glb',
      })
      useSceneStore.getState().clearGarment()

      expect(useSceneStore.getState().currentGarment).toBeNull()
    })
  })

  describe('Scenario: 색상 변경', () => {
    it('setGarmentColor로 의류 색상을 변경한다', () => {
      useSceneStore.getState().setGarmentColor('#ef4444')

      expect(useSceneStore.getState().garmentColor).toBe('#ef4444')
    })
  })

  describe('Scenario: 시뮬레이션 모드', () => {
    it('기본 시뮬레이션 모드는 baked이다', () => {
      expect(useSceneStore.getState().simMode).toBe('baked')
    })

    it('setSimMode로 모드를 변경할 수 있다', () => {
      useSceneStore.getState().setSimMode('realtime')
      expect(useSceneStore.getState().simMode).toBe('realtime')
    })
  })
})
