import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let instance: SupabaseClient | null = null

export function getSupabaseClient(
  url?: string,
  anonKey?: string,
): SupabaseClient {
  if (instance) return instance

  const supabaseUrl =
    url ?? import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:54321'
  const supabaseAnonKey =
    anonKey ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

  instance = createClient(supabaseUrl, supabaseAnonKey)
  return instance
}

/** 테스트용 리셋 */
export function resetSupabaseClient(): void {
  instance = null
}
