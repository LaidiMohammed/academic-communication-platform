import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY;
const CHARGILY_API_URL = process.env.CHARGILY_MODE === 'live'
  ? 'https://pay.chargily.com/api/v2'
  : 'https://pay.chargily.net/test/api/v2';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const PRICE_IDS: Record<string, string> = {
  all_levels: '01kww1wm5v56hwq687c7e72c70',
  '1as_2as': '01kww1wm65c6td1evjaatjqb6d',
  math_phys_sci: '01kww1wm6e2q4ze6fped2xse10',
  particulier: '01kww1wm6t9d2y1phcwnxfheky',
};

export async function POST(req: NextRequest) {
  try {
    if (!CHARGILY_SECRET_KEY) {
      return NextResponse.json({ error: 'Chargily Pay not configured' }, { status: 500 });
    }

    const { userId, planId, planTitle, isYearly } = await req.json();
    if (!userId || !planId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const priceId = PRICE_IDS[planId];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const checkoutRes = await fetch(`${CHARGILY_API_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHARGILY_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price: priceId, quantity: 1 }],
        success_url: `${APP_URL}/dashboard/membership?success=true`,
        failure_url: `${APP_URL}/dashboard/membership?success=false`,
        locale: 'ar',
        metadata: {
          user_id: userId,
          plan_id: planId,
          plan_title: planTitle,
          is_yearly: isYearly ? 'true' : 'false',
        },
      }),
    });
    const checkout = await checkoutRes.json();

    if (!checkout.checkout_url) {
      return NextResponse.json({ error: 'Failed to create checkout', details: checkout }, { status: 500 });
    }

    const supabase = createServiceClient();
    await supabase.from('payments').insert({
      user_id: userId,
      plan_id: planId,
      plan_title: planTitle,
      amount: 0,
      is_yearly: isYearly || false,
      checkout_id: checkout.id,
      status: 'pending',
      currency: 'dzd',
    });

    return NextResponse.json({ checkout_url: checkout.checkout_url, checkout_id: checkout.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
