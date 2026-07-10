import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = rateLimit(ip, 10, 60000);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.text();
    const signature = req.headers.get('signature') || '';

    const computedSignature = crypto
      .createHmac('sha256', CHARGILY_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (computedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const event = JSON.parse(body);
    const checkout = event.data;

    if (!checkout?.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (event.type !== 'checkout.paid') {
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const supabase = createServiceClient();

    const { data: payment } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        paid_at: new Date().toISOString(),
        invoice_id: checkout.invoice_id || null,
        payment_method: checkout.payment_method || null,
      })
      .eq('checkout_id', checkout.id)
      .select()
      .single();

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const now = new Date();
    const expiresAt = payment.is_yearly
      ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    await supabase.from('memberships').upsert({
      user_id: payment.user_id,
      plan: 'premium',
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      auto_renew: false,
      payment_method: 'chargily',
      level: payment.level || '',
      subjects: payment.subjects || [],
      sessions_total: 4,
      sessions_used: 0,
    }, { onConflict: 'user_id' });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
