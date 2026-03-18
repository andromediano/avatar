import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSceneStore } from '../store/sceneStore'
import { useMeasurement } from './useMeasurement'

describe('useMeasurement 훅', () => {
  beforeEach(() => {
    useSceneStore.setState(useSceneStore.getInitialState())
  })
  it('초기 bodyParams가 기본값(0.5)이다', () => {
    const { result } = renderHook(() => useMeasurement())

    expect(result.current.bodyParams.height).toBe(0.5)
    expect(result.current.bodyParams.chest).toBe(0.5)
  })

  it('updateBodyParams로 부분 업데이트가 된다', () => {
    const { result } = renderHook(() => useMeasurement())

    act(() => {
      result.current.updateBodyParams({ chest: 0.8 })
    })

    expect(result.current.bodyParams.chest).toBe(0.8)
    expect(result.current.bodyParams.height).toBe(0.5) // 유지
  })

  it('applySizeLabel로 사이즈 테이블 치수가 적용된다', () => {
    const { result } = renderHook(() => useMeasurement())

    act(() => {
      result.current.applySizeLabel('M', 100)
    })

    // 100(L) 사이즈 적용 후 height가 0.5가 아닌 다른 값
    expect(result.current.bodyParams.height).not.toBe(0.5)
  })

  it('존재하지 않는 사이즈는 무시한다', () => {
    const { result } = renderHook(() => useMeasurement())

    act(() => {
      result.current.applySizeLabel('M', 999)
    })

    expect(result.current.bodyParams.height).toBe(0.5)
  })
})
