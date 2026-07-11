import { createServiceClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// In-memory fallback for pre-auth endpoints or when DB is unavailable
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  max: number = 10,
  windowMs: number = 60000,
  supabase?: SupabaseClient,
): Promise<RateLimitResult> {
  if (supabase) {
    try {
      return await dbRateLimit(supabase, key, max, windowMs);
    } catch {
      // Fall through to in-memory fallback
    }
  }
  return memoryRateLimit(key, max, windowMs);
}

async function dbRateLimit(
  supabase: SupabaseClient,
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs).toISOString();

  // Upsert: if row exists and not expired, increment; else reset
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('count, reset_at')
    .eq('key', key)
    .maybeSingle();

  if (existing && new Date(existing.reset_at) > now) {
    const newCount = existing.count + 1;
    if (newCount > max) {
      return { allowed: false, remaining: 0 };
    }
    await supabase
      .from('rate_limits')
      .update({ count: newCount, updated_at: now.toISOString() })
      .eq('key', key);
    return { allowed: true, remaining: max - newCount };
  }

  // No existing row or expired — reset
  await supabase
    .from('rate_limits')
    .upsert({ key, count: 1, reset_at: resetAt, updated_at: now.toISOString() }, { onConflict: 'key' });

  return { allowed: true, remaining: max - 1 };
}

function memoryRateLimit(ip: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(ip);
  if (!entry || entry.resetAt < now) {
    memoryStore.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  entry.count++;
  if (entry.count > max) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: max - entry.count };
}
