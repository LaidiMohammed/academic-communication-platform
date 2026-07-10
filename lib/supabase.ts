import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (!anonClient) {
    anonClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  return anonClient;
}

export function createServiceClient(): SupabaseClient {
  if (!serviceClient) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
    serviceClient = createSupabaseClient(supabaseUrl, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return serviceClient;
}
