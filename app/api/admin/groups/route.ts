import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, validateContentType } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

async function getAdminSupabase(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return null;
  const { data: profile } = await auth.supabase.from('profiles').select('role').eq('id', auth.user.id).single();
  if (profile?.role !== 'admin') return null;
  return auth.supabase;
}

export async function GET(req: NextRequest) {
  const supabase = await getAdminSupabase(req);
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // No rate limit on admin GET — admins need bulk access
  const { data: groups, error } = await supabase.from('groups').select('*, group_members(count)').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ groups });
}

export async function POST(req: NextRequest) {
  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;
  const supabase = await getAdminSupabase(req);
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthUser(req);
  if (!auth.error) {
    const { allowed } = await rateLimit(auth.user.id, 10, 60000, supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { name, description, image, type } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const { data, error } = await supabase.from('groups').insert({
    name: name.trim(), description: description || '', image: image || '',
    members_count: 0, tags: type === 'private' ? ['private'] : [],
  }).select('*').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ group: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await getAdminSupabase(req);
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const auth = await getAuthUser(req);
  if (!auth.error) {
    const { allowed } = await rateLimit(auth.user.id, 10, 60000, supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const { error } = await supabase.from('groups').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
