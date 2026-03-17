import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('Feature 10: Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState(useAuthStore.getInitialState())
  })

  it('기본 상태는 비로그인이다', () => {
    const state = useAuthStore.getState()
    expect(state.isLoggedIn).toBe(false)
    expect(state.user).toBeNull()
  })

  it('login으로 로그인 상태가 된다', () => {
    useAuthStore.getState().login({
      id: 'user_01',
      email: 'test@example.com',
      nickname: '테스터',
    })

    const state = useAuthStore.getState()
    expect(state.isLoggedIn).toBe(true)
    expect(state.user!.email).toBe('test@example.com')
  })

  it('logout으로 비로그인 상태가 된다', () => {
    useAuthStore.getState().login({
      id: 'user_01',
      email: 'test@example.com',
    })
    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.isLoggedIn).toBe(false)
    expect(state.user).toBeNull()
  })
})
