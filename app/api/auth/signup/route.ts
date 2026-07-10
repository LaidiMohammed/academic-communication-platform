import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

function verificationHtml(code: string): string {
  return `<div style="font-family:Arial;max-width:480px;margin:0 auto;padding:32px 24px;background:#0F172A;border-radius:16px;text-align:center"><h1 style="color:#60A5FA;font-size:24px">Bendella School</h1><div style="background:#1E293B;border-radius:12px;padding:24px;margin-top:16px"><p style="color:#F1F5F9;font-size:14px">Your verification code</p><div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#60A5FA;padding:16px;background:#0F172A;border-radius:8px;margin:16px 0">${code}</div><p style="color:#94A3B8;font-size:14px;margin:0">Enter this code in the signup form to verify your account.</p></div></div>`;
}

async function sendViaNodemailer(email: string, code: string): Promise<void> {
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Bendella School - رمز التحقق',
    html: verificationHtml(code),
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { allowed, remaining } = rateLimit(ip, 5, 60000);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429, headers: { 'X-RateLimit-Remaining': '0' } });
    }

    const { email, password, data } = await req.json();
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const { data: user, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: false,
      user_metadata: { ...data, verification_code: code },
    });

    if (error) {
      const msg = error.message;
      if (msg.includes('already registered')) return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;

    try {
      if (resendKey) {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        const { error: emailErr } = await resend.emails.send({
          from: 'Bendella School <noreply@bendella-school.com>',
          to: email,
          subject: 'Bendella School - رمز التحقق',
          html: verificationHtml(code),
        });
        if (emailErr) throw new Error(emailErr.message);
      } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await sendViaNodemailer(email, code);
      } else {
        throw new Error('No email provider configured');
      }
    } catch (emailErr: any) {
      await supabase.auth.admin.deleteUser(user.user.id);
      await supabase.from('profiles').delete().eq('id', user.user.id);
      return NextResponse.json({ error: 'Failed to send verification email: ' + emailErr.message }, { status: 500 });
    }

    return NextResponse.json({ user: user.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
