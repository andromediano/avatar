import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'

describe('useAuth 훅', () => {
  it('초기 상태는 비로그인이다', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('login으로 상태가 변경된다', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.login({ id: 'u1', email: 'test@test.com' })
    })

    expect(result.current.isLoggedIn).toBe(true)
    expect(result.current.user?.email).toBe('test@test.com')
  })

  it('logout으로 비로그인 상태가 된다', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.login({ id: 'u1', email: 'test@test.com' })
    })
    act(() => {
      result.current.logout()
    })

    expect(result.current.isLoggedIn).toBe(false)
  })
})
