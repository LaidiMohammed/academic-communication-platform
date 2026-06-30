import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    serviceClient = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return serviceClient;
}
