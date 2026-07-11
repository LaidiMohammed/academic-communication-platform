import { NextRequest, NextResponse } from 'next/server';
import { ChargilyClient } from '@chargily/chargily-pay';
import { validateContentType, validateBodySize, getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

const PRICE_IDS: Record<string, string> = {
  '2500': '01kww1wm5v56hwq687c7e72c70',
  '3000': '01kwwzswsmrr75hg6mmsak9wp4',
  '4000': '01kww1wm6e2q4ze6fped2xse10',
  '9000': '01kww1wm6t9d2y1phcwnxfheky',
  '100': '01kwyqqj7pbsrfkp766b548vmw',
};

const ALL_SUBJECTS: Record<string, string> = {
  mathematics: 'الرياضيات',
  physics: 'العلوم الفيزيائية',
  chemistry: 'الكيمياء',
  biology: 'علوم الطبيعة والحياة',
  english: 'الإنجليزية',
  french: 'اللغة الفرنسية',
  arabic: 'اللغة العربية',
  history: 'التاريخ والجغرافيا',
  islamic: 'التربية الإسلامية',
  civic: 'التربية المدنية',
};

function getSubjectPrice(levelId: string, subjectId: string): number {
  if (levelId === 'particulier') return 9000;
  if (['1am', '2am', '3am'].includes(levelId)) return 2500;
  if (levelId === '3as' && ['mathematics', 'physics', 'biology'].includes(subjectId)) return 4000;
  if (levelId === 'test') return 100;
  return 3000;
}

export async function POST(req: NextRequest) {
  try {
    const ctCheck = validateContentType(req);
    if (ctCheck) return ctCheck;
    const sizeCheck = validateBodySize(req);
    if (sizeCheck) return sizeCheck;

    const auth = await getAuthUser(req);
    if (auth.error) return auth.error;

    const { allowed } = await rateLimit(auth.user.id, 5, 60000, auth.supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY;
    if (!CHARGILY_SECRET_KEY) {
      return NextResponse.json({ error: 'Chargily Pay not configured' }, { status: 500 });
    }

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const { userId, planId, planTitle, isYearly, level, subjects } = await req.json();
    if (!userId || !planId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Verify user can only create checkout for themselves (unless admin)
    if (userId !== auth.user.id) {
      const { data: profile } = await auth.supabase.from('profiles').select('role').eq('id', auth.user.id).single();
      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const subjectsList: string[] = subjects || [];
    if (subjectsList.length < 1) {
      return NextResponse.json({ error: 'Must select at least one subject' }, { status: 400 });
    }

    const subjectLabels = subjectsList.map((id: string) => ALL_SUBJECTS[id] || id);
    const desc = `المستوى: ${level || ''}\nالمواد: ${subjectLabels.join('، ')}`;

    const priceGroups: Record<string, number> = {};
    subjectsList.forEach((sid) => {
      const sp = getSubjectPrice(planId, sid);
      const key = String(sp);
      priceGroups[key] = (priceGroups[key] || 0) + 1;
    });

    const items = Object.entries(priceGroups).map(([amount, qty]) => ({
      price: PRICE_IDS[amount],
      quantity: qty,
    }));

    const totalAmount = subjectsList.reduce((s, id) => s + getSubjectPrice(planId, id), 0);

    const client = new ChargilyClient({
      api_key: CHARGILY_SECRET_KEY,
      mode: 'live',
    });

    const checkout = await client.createCheckout({
      items,
      success_url: `${APP_URL}/dashboard/membership?success=true`,
      failure_url: `${APP_URL}/dashboard/membership?success=false`,
      webhook_endpoint: `${APP_URL}/api/payments/webhook`,
      locale: 'ar',
      description: desc,
      metadata: {
        user_id: userId,
        plan_id: planId,
        plan_title: planTitle || '',
        is_yearly: isYearly ? 'true' : 'false',
        level: level || '',
        subjects: JSON.stringify(subjectsList),
        subject_count: String(subjectsList.length),
      },
    });

    if (!checkout.checkout_url) {
      return NextResponse.json({ error: 'Failed to create checkout', details: checkout }, { status: 500 });
    }

    await auth.supabase.from('payments').insert({
      user_id: userId,
      plan_id: planId,
      plan_title: planTitle || '',
      amount: totalAmount,
      is_yearly: isYearly || false,
      checkout_id: checkout.id,
      status: 'pending',
      currency: 'dzd',
      level: level || '',
      subjects: subjectsList,
    });

    return NextResponse.json({ checkout_url: checkout.checkout_url, checkout_id: checkout.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
