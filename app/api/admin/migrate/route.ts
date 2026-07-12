import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

export async function POST(req: NextRequest) {
  // Allow auth via service role key header for direct API calls
  const serviceKeyHeader = req.headers.get('x-service-key');
  if (serviceKeyHeader === process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Authenticated via service key — skip user-level auth
  } else {
    const auth = await getAuthUser(req);
    if (auth.error) return auth.error;
    const { data: admin } = await auth.supabase.from('profiles').select('role').eq('id', auth.user.id).single();
    if (admin?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!projectRef || !serviceKey) return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 });

  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '00014_students_tables.sql');
  if (!fs.existsSync(sqlPath)) return NextResponse.json({ error: 'Migration file not found' }, { status: 500 });
  const migrationSql = fs.readFileSync(sqlPath, 'utf8');

  const errors: string[] = [];

  // Try direct connection to Supabase PostgreSQL (service key as password)
  const directHost = `db.${projectRef}.supabase.co`;
  for (const port of [5432, 6543]) {
    try {
      const connectionString = `postgresql://postgres:${encodeURIComponent(serviceKey)}@${directHost}:${port}/postgres?sslmode=require`;
      const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
      const client = await pool.connect();
      await client.query(migrationSql);
      client.release();
      await pool.end();
      return NextResponse.json({ success: true, message: `Migration applied via direct connection port ${port}` });
    } catch (e: any) {
      errors.push(`direct-${port}: ${e.message?.slice(0, 100)}`);
    }
  }

  // Try pooler with just postgres username (JWT auth)
  for (const host of [`${projectRef}.pooler.supabase.com`, `aws-0-eu-west-1.pooler.supabase.com`, `aws-0-us-east-1.pooler.supabase.com`]) {
    for (const port of [5432, 6543]) {
      try {
        const connectionString = `postgresql://postgres:${encodeURIComponent(serviceKey)}@${host}:${port}/postgres`;
        const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
        const client = await pool.connect();
        await client.query(migrationSql);
        client.release();
        await pool.end();
        return NextResponse.json({ success: true, message: `Migration applied via ${host}:${port}` });
      } catch (e: any) {
        errors.push(`${host}:${port}: ${e.message?.slice(0, 100)}`);
      }
    }
  }

  return NextResponse.json({
    error: 'Could not connect to database',
    attempts: errors,
    note: 'Please run the SQL from supabase/migrations/00014_students_tables.sql in the Supabase SQL editor',
  }, { status: 500 });
}
