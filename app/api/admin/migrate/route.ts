import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const REGIONS = ['eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-central-2', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'sa-east-1', 'ca-central-1'];

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

  for (const region of REGIONS) {
    const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(serviceKey)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    try {
      const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
      const client = await pool.connect();
      await client.query(migrationSql);
      client.release();
      await pool.end();
      return NextResponse.json({ success: true, message: `Migration applied successfully via ${region}`, region });
    } catch (e: any) {
      errors.push(`${region}: ${e.message?.slice(0, 100)}`);
    }
  }

  // Fallback: try direct connection without region prefix
  try {
    const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(serviceKey)}@${projectRef}.pooler.supabase.com:6543/postgres`;
    const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
    const client = await pool.connect();
    await client.query(migrationSql);
    client.release();
    await pool.end();
    return NextResponse.json({ success: true, message: 'Migration applied via direct pooler' });
  } catch (e: any) {
    errors.push(`direct: ${e.message?.slice(0, 100)}`);
  }

  return NextResponse.json({
    error: 'Could not connect to database with any region',
    attempts: errors,
    note: 'Please run the SQL from supabase/migrations/00014_students_tables.sql in the Supabase SQL editor',
  }, { status: 500 });
}
