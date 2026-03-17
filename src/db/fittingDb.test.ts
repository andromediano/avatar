import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { AvatarDB } from './dexieDb'
import { saveFitting, getFittings, deleteFitting, getUnsyncedFittings, markSynced } from './fittingDb'

describe('Feature 08: 피팅 히스토리 IndexedDB', () => {
  let testDb: AvatarDB

  beforeEach(async () => {
    testDb = new AvatarDB()
    await testDb.fittings.clear()
  })

  describe('Scenario: 피팅 기록 저장', () => {
    it('피팅 기록을 IndexedDB에 저장한다', async () => {
      const id = await saveFitting(testDb, {
        garmentId: 'gar_01',
        measurements: { height: 0.5, chest: 0.6 },
        garmentColor: '#3b82f6',
      })

      expect(id).toBeDefined()
      const record = await testDb.fittings.get(id)
      expect(record).toBeDefined()
      expect(record!.garmentId).toBe('gar_01')
      expect(record!.synced).toBe(false)
    })
  })

  describe('Scenario: 피팅 히스토리 조회', () => {
    it('최신순으로 정렬하여 반환한다', async () => {
      await saveFitting(testDb, {
        garmentId: 'gar_01',
        measurements: {},
        garmentColor: '#000',
      })
      // 약간의 시간 차이를 위해 timestamp를 직접 설정
      await saveFitting(testDb, {
        garmentId: 'gar_02',
        measurements: {},
        garmentColor: '#fff',
      })

      const list = await getFittings(testDb)

      expect(list).toHaveLength(2)
      // 최신이 먼저
      expect(list[0].timestamp).toBeGreaterThanOrEqual(list[1].timestamp)
    })
  })

  describe('Scenario: 피팅 기록 삭제', () => {
    it('ID로 기록을 삭제한다', async () => {
      const id = await saveFitting(testDb, {
        garmentId: 'gar_01',
        measurements: {},
        garmentColor: '#000',
      })

      await deleteFitting(testDb, id)

      const record = await testDb.fittings.get(id)
      expect(record).toBeUndefined()
    })
  })

  describe('Scenario: 미동기화 기록 조회', () => {
    it('synced=false인 기록만 반환한다', async () => {
      const id1 = await saveFitting(testDb, {
        garmentId: 'gar_01',
        measurements: {},
        garmentColor: '#000',
      })
      const id2 = await saveFitting(testDb, {
        garmentId: 'gar_02',
        measurements: {},
        garmentColor: '#fff',
      })

      await markSynced(testDb, id1)

      const unsynced = await getUnsyncedFittings(testDb)
      expect(unsynced).toHaveLength(1)
      expect(unsynced[0].id).toBe(id2)
    })
  })
})
