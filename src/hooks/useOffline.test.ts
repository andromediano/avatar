import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useOffline } from './useOffline'

describe('useOffline 훅', () => {
  it('navigator.onLine이 true이면 isOffline=false', () => {
    vi.stubGlobal('navigator', { onLine: true })
    const { result } = renderHook(() => useOffline())
    expect(result.current.isOffline).toBe(false)
  })

  it('navigator.onLine이 false이면 isOffline=true', () => {
    vi.stubGlobal('navigator', { onLine: false })
    const { result } = renderHook(() => useOffline())
    expect(result.current.isOffline).toBe(true)
  })
})
