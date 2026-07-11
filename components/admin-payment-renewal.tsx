'use client';

import { useState } from 'react';
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentInfo {
  id: string;
  name: string;
  email?: string;
}

interface AdminPaymentRenewalProps {
  student?: StudentInfo;
  modules: string[];
  onPaymentSuccess?: (studentId: string, moduleId: string) => void;
}

export function AdminPaymentRenewal({
  student,
  modules = [],
  onPaymentSuccess,
}: AdminPaymentRenewalProps) {
  const [selectedModule, setSelectedModule] = useState<string>(modules[0] || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePayMonth = async () => {
    if (!student || !selectedModule) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(window as any).__auth_token}`,
        },
        body: JSON.stringify({
          studentId: student.id,
          moduleId: selectedModule,
          amount: 0, // Amount calculated server-side
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Payment failed' });
        return;
      }

      setMessage({ type: 'success', text: data.message || 'Payment processed successfully' });
      onPaymentSuccess?.(student.id, selectedModule);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!student) {
    return (
      <div className="p-4 bg-card border border-border rounded-2xl text-center">
        <p className="text-sm text-muted-foreground">No student selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-2xl">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        <CreditCard size={20} />
        Payment Renewal
      </h3>

      {/* Student Info */}
      <div className="p-3 bg-secondary/50 border border-border rounded-lg">
        <p className="text-xs font-semibold text-muted-foreground mb-1">Student</p>
        <p className="text-sm font-bold text-foreground">{student.name}</p>
        {student.email && (
          <p className="text-xs text-muted-foreground">{student.email}</p>
        )}
      </div>

      {/* Module Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">Module</label>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          disabled={isProcessing}
          className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary transition disabled:opacity-50"
        >
          {modules.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Payment Info */}
      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Payment Details</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="text-muted-foreground">Sessions Added:</span>
            <span className="font-bold text-foreground ml-2">4</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Status After:</span>
            <span className="font-bold text-green-500 ml-2">Active</span>
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handlePayMonth}
        disabled={isProcessing || !selectedModule}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={18} />
            Pay Month (Add 4 Sessions)
          </>
        )}
      </button>

      {/* Message Display */}
      {message && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/30 text-green-600'
            : 'bg-destructive/10 border border-destructive/30 text-destructive'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <AlertCircle size={16} className="shrink-0" />
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}
