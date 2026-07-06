import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import crypto from 'crypto';

const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY || '';

export async function POST(req: NextRequest) {
  try {
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

    const supabase = createServiceClient();
    const status = event.type === 'checkout.paid' ? 'completed' : 'failed';

    const { data: payment } = await supabase
      .from('payments')
      .update({
        status,
        paid_at: status === 'completed' ? new Date().toISOString() : null,
        invoice_id: checkout.invoice_id || null,
        payment_method: checkout.payment_method || null,
      })
      .eq('checkout_id', checkout.id)
      .select()
      .single();

    if (status === 'completed' && payment) {
      const now = new Date();
      const expiresAt = payment.is_yearly
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      await supabase.from('memberships').upsert({
        user_id: payment.user_id,
        plan: payment.plan_id === 'course' ? 'premium' : 'basic',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        auto_renew: false,
        payment_method: 'chargily',
      }, { onConflict: 'user_id' });

      await supabase.from('profiles').update({ role: 'student' }).eq('id', payment.user_id);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
