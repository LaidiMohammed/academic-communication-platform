import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import type { SupabaseClient, User } from '@supabase/supabase-js';

const MAX_JSON_BODY = 1_000_000; // 1MB for JSON routes
const VALID_CONTENT_TYPES = new Set([
  'application/json',
  'multipart/form-data',
  'application/x-www-form-urlencoded',
]);

export function validateBodySize(req: NextRequest, maxBytes: number = MAX_JSON_BODY): NextResponse | null {
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
  if (contentLength > maxBytes) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }
  return null;
}

export function validateContentType(req: NextRequest, expected: string = 'application/json'): NextResponse | null {
  const ct = req.headers.get('content-type') || '';
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
    if (!ct.startsWith(expected)) {
      return NextResponse.json({ error: `Content-Type must be ${expected}` }, { status: 415 });
    }
  }
  return null;
}

export function validateOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host && !originHost.endsWith('.vercel.app')) {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid origin header' }, { status: 400 });
    }
  }
  return null;
}

type AuthResult = {
  user: User;
  supabase: SupabaseClient;
  error: null;
} | {
  user: null;
  supabase: null;
  error: NextResponse;
}

export async function getAuthUser(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, supabase: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const supabase = createServiceClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.slice(7));

  if (authErr || !user) {
    return { user: null, supabase: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { user, supabase, error: null };
}

export async function withAuthRateLimit(
  req: NextRequest,
  handler: (user: User, supabase: SupabaseClient) => Promise<NextResponse>,
  max: number = 30,
  windowMs: number = 60000,
): Promise<NextResponse> {
  const originCheck = validateOrigin(req);
  if (originCheck) return originCheck;

  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;

  const sizeCheck = validateBodySize(req);
  if (sizeCheck) return sizeCheck;

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed, remaining } = await rateLimit(auth.user.id, max, windowMs, auth.supabase);
  if (!allowed) {
    const res = NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    res.headers.set('Retry-After', Math.ceil(windowMs / 1000).toString());
    res.headers.set('X-RateLimit-Remaining', '0');
    return res;
  }

  const response = await handler(auth.user, auth.supabase);
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  return response;
}
