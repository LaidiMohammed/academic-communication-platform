import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

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

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (auth.error) return auth.error;

    const { allowed } = await rateLimit(auth.user.id, 20, 60000, auth.supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const paymentId = req.nextUrl.searchParams.get('paymentId');
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });

    const isTest = paymentId.startsWith('test-');

    let payment: any;
    let profile: any;

    if (isTest) {
      payment = {
        id: paymentId,
        amount: Number(req.nextUrl.searchParams.get('amount')) || 0,
        status: 'completed',
        plan_title: req.nextUrl.searchParams.get('planTitle') || '',
        level: req.nextUrl.searchParams.get('level') || '',
        subjects: JSON.parse(req.nextUrl.searchParams.get('subjects') || '[]'),
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        checkout_id: 'test',
        invoice_id: null,
        payment_method: 'test',
        currency: 'dzd',
        user_id: auth.user.id,
      };
      profile = { name: req.nextUrl.searchParams.get('studentName') || 'Test Student', email: 'test@example.com', school: 'Bendella School' };
    } else {
      const { data: p, error: pErr } = await auth.supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();
      if (pErr || !p) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      if (p.status !== 'completed') return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
      // Verify ownership: only the payer or an admin can view the receipt
      if (p.user_id !== auth.user.id) {
        const { data: profileCheck } = await auth.supabase.from('profiles').select('role').eq('id', auth.user.id).single();
        if (profileCheck?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      payment = p;
      const { data: pr } = await auth.supabase
        .from('profiles')
        .select('name, email, school, level')
        .eq('id', payment.user_id)
        .single();
      profile = pr;
    }

    const subjectLabels: { id: string; ar: string }[] = (payment.subjects || []).map((id: string) => ({
      id,
      ar: ALL_SUBJECTS[id] || id,
    }));

    const paidAt = payment.paid_at ? new Date(payment.paid_at) : null;
    const receiptNumber = `REC-${payment.id.slice(0, 8).toUpperCase()}`;

    return NextResponse.json({
      receiptNumber,
      paymentId: payment.id,
      checkoutId: payment.checkout_id,
      invoiceId: payment.invoice_id,
      paymentMethod: payment.payment_method || 'chargily',
      amount: payment.amount,
      currency: payment.currency || 'dzd',
      planTitle: payment.plan_title,
      level: payment.level || '',
      subjects: subjectLabels,
      status: payment.status,
      paidAt: paidAt?.toISOString() || null,
      createdAt: payment.created_at,
      student: {
        name: profile?.name || '—',
        email: profile?.email || '—',
        school: profile?.school || 'Bendella School',
      },
      school: {
        name: 'مدرسة بن دلة',
        nameLatin: 'Bendella School',
        address: 'روي بيلير، وهران 31000',
        addressLatin: 'Rue Belair, Oran 31000, Algeria',
        phone: '0661 45 77 97',
        email: 'contact@bendella-school.dz',
        website: 'www.bendella-school.dz',
        motto: '"Knowledge is the Foundation of Success"',
        since: '2024',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
