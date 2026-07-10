import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const supabase = createServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return supabase;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rateLimit(ip, 20, 60000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  const supabase = await verifyAdmin(req);
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: groups, error } = await supabase.from('groups').select('*, group_members(count)').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ groups });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rateLimit(ip, 10, 60000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  const supabase = await verifyAdmin(req);
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rateLimit(ip, 10, 60000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  const supabase = await verifyAdmin(req);
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const { error } = await supabase.from('groups').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}