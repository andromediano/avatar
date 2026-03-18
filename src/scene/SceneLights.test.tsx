import { describe, it, expect } from 'vitest'
import { SceneLights, LIGHT_CONFIG } from './SceneLights'

describe('SceneLights 설정', () => {
  it('조명 설정값이 올바르다', () => {
    expect(LIGHT_CONFIG.ambient.intensity).toBe(0.6)
    expect(LIGHT_CONFIG.directional.intensity).toBe(1.2)
    expect(LIGHT_CONFIG.directional.position).toEqual([2, 4, 3])
    expect(LIGHT_CONFIG.hemisphere.intensity).toBe(0.4)
  })

  it('SceneLights 컴포넌트가 함수이다', () => {
    expect(typeof SceneLights).toBe('function')
  })
})
