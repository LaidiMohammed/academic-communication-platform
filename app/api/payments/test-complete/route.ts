import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, validateContentType } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

// This endpoint is for development/testing only
export async function POST(req: NextRequest) {
  try {
    const ctCheck = validateContentType(req);
    if (ctCheck) return ctCheck;

    const auth = await getAuthUser(req);
    if (auth.error) return auth.error;

    const { allowed } = await rateLimit(auth.user.id, 5, 60000, auth.supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const { userId, planId, planTitle, level, subjects, amount } = await req.json();
    if (!userId || !planId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subjectsList: string[] = subjects || [];
    const id = 'test-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    const now = new Date().toISOString();

    return NextResponse.json({
      success: true,
      paymentId: id,
      payment: {
        id,
        amount: amount || 0,
        status: 'completed',
        plan_title: planTitle || `${level} - ${subjectsList.length} matière(s)`,
        level: level || '',
        subjects: subjectsList,
        paid_at: now,
        created_at: now,
        currency: 'dzd',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
