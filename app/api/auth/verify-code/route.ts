import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { allowed } = rateLimit(ip, 10, 60000);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { email, code } = await req.json();
    if (!email || !code || typeof email !== 'string' || typeof code !== 'string') {
      return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: users, error: lookupError } = await supabase.auth.admin.listUsers();
    if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });

    const user = users.users.find((u: any) => u.email === email);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const storedCode = user.user_metadata?.verification_code;
    if (!storedCode || storedCode !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    const meta = { ...user.user_metadata };
    delete meta.verification_code;

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: meta,
    });

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
