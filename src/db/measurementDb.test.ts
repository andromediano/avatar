import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { AvatarDB } from './dexieDb'
import { saveMeasurementLocal, loadMeasurementLocal } from './measurementDb'

describe('Feature 03: 치수 로컬 저장', () => {
  let testDb: AvatarDB

  beforeEach(async () => {
    testDb = new AvatarDB()
    await testDb.measurements.clear()
  })

  it('치수를 IndexedDB에 저장한다', async () => {
    await saveMeasurementLocal(testDb, {
      height: 0.6,
      chest: 0.7,
      waist: 0.4,
    })

    const record = await testDb.measurements.get('current')
    expect(record).toBeDefined()
    expect(record!.data).toBeDefined()
  })

  it('저장된 치수를 불러온다', async () => {
    await saveMeasurementLocal(testDb, {
      height: 0.6,
      chest: 0.7,
    })

    const loaded = await loadMeasurementLocal(testDb)
    expect(loaded).toBeDefined()
    expect(loaded!.height).toBe(0.6)
    expect(loaded!.chest).toBe(0.7)
  })

  it('저장된 치수가 없으면 null을 반환한다', async () => {
    const loaded = await loadMeasurementLocal(testDb)
    expect(loaded).toBeNull()
  })

  it('덮어쓰기가 가능하다', async () => {
    await saveMeasurementLocal(testDb, { height: 0.5 })
    await saveMeasurementLocal(testDb, { height: 0.9 })

    const loaded = await loadMeasurementLocal(testDb)
    expect(loaded!.height).toBe(0.9)
  })
})
