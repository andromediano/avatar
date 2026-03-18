import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSupabaseClient } from './supabaseClient'

describe('Supabase 클라이언트', () => {
  beforeEach(() => {
    vi.stubGlobal('import', { meta: { env: {} } })
  })

  it('싱글톤 인스턴스를 반환한다', () => {
    const client1 = getSupabaseClient(
      'https://test.supabase.co',
      'test-anon-key',
    )
    const client2 = getSupabaseClient(
      'https://test.supabase.co',
      'test-anon-key',
    )

    expect(client1).toBe(client2)
  })

  it('클라이언트가 auth 속성을 가진다', () => {
    const client = getSupabaseClient(
      'https://test.supabase.co',
      'test-anon-key',
    )

    expect(client.auth).toBeDefined()
  })

  it('클라이언트가 from 메서드를 가진다', () => {
    const client = getSupabaseClient(
      'https://test.supabase.co',
      'test-anon-key',
    )

    expect(typeof client.from).toBe('function')
  })
})
