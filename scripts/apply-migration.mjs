import { Pool } from 'pg';
import fs from 'fs';

function loadEnv() {
  const env = {};
  const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL
  ?.replace('https://', '').replace('.supabase.co', '');
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const sql = fs.readFileSync('supabase/migrations/00014_students_tables.sql', 'utf8');

const hosts = [
  `db.${url}.supabase.co:5432`,
  `db.${url}.supabase.co:6543`,
  `${url}.pooler.supabase.com:5432`,
  `${url}.pooler.supabase.com:6543`,
];

async function tryConnect(host) {
  const cs = `postgresql://postgres:${encodeURIComponent(key)}@${host}/postgres?sslmode=require&connect_timeout=5`;
  const pool = new Pool({ connectionString: cs, max: 1, connectionTimeoutMillis: 5000 });
  const c = await pool.connect();
  await c.query(sql);
  c.release();
  await pool.end();
}

(async () => {
  for (const h of hosts) {
    try {
      await tryConnect(h);
      console.log('SUCCESS with:', h);
      process.exit(0);
    } catch (e) {
      console.log('FAIL', h, ':', e.message?.slice(0, 120));
    }
  }
  console.log('\nAll connection attempts failed.');
  console.log('\nTo apply manually, go to:');
  console.log('  https://supabase.com/dashboard/project/' + url + '/sql/new');
  console.log('And paste the contents of: supabase/migrations/00014_students_tables.sql');
  process.exit(1);
})();
