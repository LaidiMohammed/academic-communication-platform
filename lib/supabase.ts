import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

const CLIENT_OPTIONS = {
  db: { schema: 'public' as const },
  global: {
    headers: { 'x-connection-timeout': '30000' },
  },
};

export function createClient(): SupabaseClient {
  if (!anonClient) {
    const supabaseUrl = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      throw new Error(`NEXT_PUBLIC_SUPABASE_URL is required. Got: ${supabaseUrl}`);
    }
    if (!supabaseAnonKey) {
      throw new Error(`NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Got: ${supabaseAnonKey}`);
    }
    
    anonClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, CLIENT_OPTIONS);
  }
  return anonClient;
}

export function createServiceClient(): SupabaseClient {
  if (!serviceClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    
    serviceClient = createSupabaseClient(supabaseUrl, key, {
      ...CLIENT_OPTIONS,
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return serviceClient;
}
