/**
 * 온/오프라인 감지 및 데이터 동기화 매니저.
 * 오프라인에서 저장된 데이터를 온라인 복구 시 서버에 동기화한다.
 */
export class SyncManager {
  isOnline(): boolean {
    return navigator.onLine
  }

  onOnline(callback: () => void): () => void {
    window.addEventListener('online', callback)
    return () => window.removeEventListener('online', callback)
  }

  async syncIfNeeded(
    hasPendingSync: boolean,
    syncFn: () => Promise<void>,
  ): Promise<boolean> {
    if (!hasPendingSync || !this.isOnline()) return false

    await syncFn()
    return true
  }
}
