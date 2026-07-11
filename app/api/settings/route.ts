import { NextRequest, NextResponse } from 'next/server';
import { validateContentType, validateBodySize, getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 30, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { data } = await auth.supabase.from('profiles').select('settings').eq('id', auth.user.id).single();
  return NextResponse.json({ settings: data?.settings || {} });
}

export async function PATCH(req: NextRequest) {
  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;
  const sizeCheck = validateBodySize(req);
  if (sizeCheck) return sizeCheck;

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 20, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { settings } = await req.json();
  if (!settings) return NextResponse.json({ error: 'Missing settings' }, { status: 400 });

  const { error } = await auth.supabase.from('profiles').update({ settings }).eq('id', auth.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
