import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';

/* Statut réel de l'élève, lu depuis Supabase (table students).
   L'admin modifie cette même table : le changement est donc immédiatement
   visible ici, sans rechargement manuel. */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { data: row } = await auth.supabase
    .from('students')
    .select('status, remaining_sessions, name, level')
    .eq('id', auth.user.id)
    .maybeSingle();

  const remaining: Record<string, number> = row?.remaining_sessions || {};
  const sessions = Object.values(remaining).reduce((total, value) => total + Number(value || 0), 0);

  return NextResponse.json({
    status: row?.status || 'active',
    remaining_sessions: remaining,
    sessions,
    name: row?.name || '',
    level: row?.level || '',
  });
}
