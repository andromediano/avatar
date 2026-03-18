import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SyncManager } from './syncManager'

describe('Feature 09: SyncManager', () => {
  let manager: SyncManager

  beforeEach(() => {
    manager = new SyncManager()
    vi.restoreAllMocks()
  })

  it('기본 상태는 online이다', () => {
    vi.stubGlobal('navigator', { onLine: true })
    expect(manager.isOnline()).toBe(true)
  })

  it('onOnline 콜백이 등록된다', () => {
    const callback = vi.fn()
    const cleanup = manager.onOnline(callback)

    expect(typeof cleanup).toBe('function')
    cleanup()
  })

  it('hasPendingSync가 false이면 동기화하지 않는다', async () => {
    const syncFn = vi.fn()
    const result = await manager.syncIfNeeded(false, syncFn)

    expect(result).toBe(false)
    expect(syncFn).not.toHaveBeenCalled()
  })

  it('hasPendingSync가 true이고 online이면 동기화한다', async () => {
    vi.stubGlobal('navigator', { onLine: true })
    const syncFn = vi.fn().mockResolvedValue(undefined)
    const result = await manager.syncIfNeeded(true, syncFn)

    expect(result).toBe(true)
    expect(syncFn).toHaveBeenCalled()
  })
})
