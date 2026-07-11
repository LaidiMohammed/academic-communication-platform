import type { SupabaseClient } from '@supabase/supabase-js';

type AuditAction =
  | 'group.join'
  | 'group.create'
  | 'group.leave'
  | 'group.permissions_update'
  | 'message.delete'
  | 'chat.create'
  | 'meeting.create'
  | 'meeting.cancel'
  | 'payment.checkout'
  | 'payment.complete'
  | 'user.signup'
  | 'admin.student_update'
  | 'admin.scan'
  | 'admin.report_generate';

export async function logAudit(
  supabase: SupabaseClient,
  userId: string,
  action: AuditAction,
  metadata: Record<string, unknown> = {},
  ipAddress: string = '',
): Promise<void> {
  try {
    await supabase.from('audit_log').insert({
      user_id: userId,
      action,
      metadata,
      ip_address: ipAddress,
    });
  } catch {
    // Non-critical: audit failures should never block the main operation
  }
}
