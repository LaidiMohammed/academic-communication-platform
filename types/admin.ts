/**
 * Admin module types - QR Passport, Scanner, Payments, Reports
 */

export interface Student {
  id: string;
  name: string;
  email?: string;
  age?: number;
  status: 'active' | 'inactive' | 'pending_payment' | 'suspended';
  academic_level: string;
  remaining_sessions: Record<string, number>;
  date_of_birth?: string;
  created_at?: string;
}

export interface QRScanResult {
  studentId: string;
  name: string;
  timestamp: string;
}

export interface AttendanceRecord {
  id?: string;
  student_id: string;
  module_id: string;
  admin_id: string;
  scanned_at: string;
  previous_balance: number;
  new_balance: number;
}

export interface PaymentRecord {
  id?: string;
  student_id: string;
  module_id: string;
  amount: number;
  sessions_added: number;
  payment_date: string;
  admin_operator_id: string;
  previous_balance: number;
  new_balance: number;
  status: 'active' | 'failed' | 'pending';
}

export interface Report {
  id: string;
  admin_id: string;
  tier: string;
  modules: string[];
  student_count: number;
  generated_at: string;
  status: 'completed' | 'failed' | 'processing';
  file_url?: string;
}

export interface ReportStudentData {
  name: string;
  age: number | string;
  status: string;
  remainingByModule: Array<{
    module: string;
    sessions: number;
  }>;
}

export interface AdminAction {
  type: 'scan' | 'payment' | 'report' | 'status_change';
  studentId: string;
  adminId: string;
  timestamp: string;
  details: Record<string, any>;
}
