import { describe, it, expect, beforeEach } from 'vitest'
import { useUiStore } from './uiStore'

describe('UI Store', () => {
  beforeEach(() => {
    useUiStore.setState(useUiStore.getInitialState())
  })

  it('기본 inputMode는 slider이다', () => {
    expect(useUiStore.getState().inputMode).toBe('slider')
  })

  it('setInputMode로 모드를 변경한다', () => {
    useUiStore.getState().setInputMode('photo')
    expect(useUiStore.getState().inputMode).toBe('photo')
  })

  it('isPanelOpen 토글이 가능하다', () => {
    expect(useUiStore.getState().isSidePanelOpen).toBe(true)
    useUiStore.getState().toggleSidePanel()
    expect(useUiStore.getState().isSidePanelOpen).toBe(false)
  })
})
