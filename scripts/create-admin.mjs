import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivephohygbmxhcbypefi.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZXBob2h5Z2JteGhjYnlwZWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjY0ODIyNCwiZXhwIjoyMDk4MjI0MjI0fQ.txnGUtEpwsF4Syu7r4KKVo2VheV2qtjiSdTVQK4gPlw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  // Find the existing user by email
  const { data: users } = await supabase.auth.admin.listUsers();
  const existing = users?.users.find(u => u.email === 'hamada.laidi.14@gmail.com');

  if (!existing) {
    console.error('User not found. Run signup first.');
    return;
  }

  console.log('Found user:', existing.id);

  // Try direct SQL insert via REST API
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      id: existing.id,
      email: 'hamada.laidi.14@gmail.com',
      name: 'Hamda Laidi',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hamada.laidi.14@gmail.com',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('REST API error:', response.status, text);
    return;
  }

  console.log('Profile set to admin. You can now login with:');
  console.log('  Email: hamada.laidi.14@gmail.com');
  console.log('  Password: ldldld');

  // Verify
  const { data: check } = await supabase.from('profiles').select('*').eq('id', existing.id).single();
  console.log('Profile:', check);
}

main();
