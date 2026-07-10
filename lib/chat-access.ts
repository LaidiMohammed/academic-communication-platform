import type { SupabaseClient } from '@supabase/supabase-js';

export async function canAccessChat(
  supabase: SupabaseClient,
  userId: string,
  chatId: string,
): Promise<boolean> {
  const { data: participant } = await supabase
    .from('chat_participants')
    .select('chat_id')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .maybeSingle();

  if (participant) return true;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  return profile?.role === 'admin';
}
