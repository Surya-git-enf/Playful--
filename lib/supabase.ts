import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zwpmbouyvjrziaxoexyl.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_aeQV-FyIFQOddKAjg7M7HQ_jOmWups9'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
