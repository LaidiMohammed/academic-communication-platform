'use client';

import { useState } from 'react';
import { Calendar, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode.react';

interface MembershipSectionProps {
  userId: string;
  userEmail: string;
  userName: string;
  membershipStatus: 'active' | 'inactive' | 'pending';
  monthlyAmount: number;
  billingCycle: {
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
}

export function MembershipSection({
  userId,
  userEmail,
  userName,
  membershipStatus,
  monthlyAmount,
  billingCycle,
}: MembershipSectionProps) {
  const [showQR, setShowQR] = useState(false);

  // Generate QR code data containing user and membership info
  const qrData = JSON.stringify({
    userId,
    name: userName,
    email: userEmail,
    membershipStatus,
    monthlyAmount,
    billingCycle,
    generatedAt: new Date().toISOString(),
  });

  return (
    <div className="space-y-6">
      {/* Membership Status Card */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {membershipStatus === 'active' ? (
              <CheckCircle className="text-accent" size={28} strokeWidth={2} />
            ) : (
              <AlertCircle className="text-destructive" size={28} strokeWidth={2} />
            )}
            <div>
              <h3 className="text-lg font-bold text-foreground">Membership Status</h3>
              <p className="text-sm text-muted-foreground">Premium Member</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-xs font-semibold ${
            membershipStatus === 'active'
              ? 'bg-accent text-white'
              : membershipStatus === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-destructive text-white'
          }`}>
            {membershipStatus === 'active' ? 'Active' : membershipStatus === 'pending' ? 'Pending' : 'Inactive'}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Monthly Amount */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={18} className="text-primary" strokeWidth={2} />
              <p className="text-sm text-muted-foreground">Monthly Amount</p>
            </div>
            <p className="text-2xl font-bold text-foreground">${monthlyAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Recurring billing</p>
          </div>

          {/* Billing Cycle */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-accent" strokeWidth={2} />
              <p className="text-sm text-muted-foreground">Next Billing</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{billingCycle.daysRemaining}</p>
            <p className="text-xs text-muted-foreground mt-1">days remaining</p>
          </div>
        </div>

        {/* Billing Details */}
        <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-2">Current Billing Period</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{billingCycle.startDate}</span>
            <span className="text-xs text-muted-foreground">to</span>
            <span className="text-sm font-medium text-foreground">{billingCycle.endDate}</span>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Your Member Code</h3>
            <p className="text-sm text-muted-foreground">Admins can scan this to verify your membership</p>
          </div>
          <button
            onClick={() => setShowQR(!showQR)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition-all font-medium text-sm"
          >
            {showQR ? 'Hide' : 'Show'} Code
          </button>
        </div>

        {showQR && (
          <div className="flex justify-center p-6 bg-background rounded-lg border border-border">
            <div className="p-4 bg-white rounded-lg shadow-lg">
              <QRCode
                value={qrData}
                size={200}
                level="H"
                includeMargin={true}
                renderAs="canvas"
              />
            </div>
          </div>
        )}

        {/* Quick Info */}
        <div className="mt-4 p-4 bg-secondary rounded-lg space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Member ID</span>
            <span className="font-mono font-medium text-foreground">{userId}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground text-right">{userEmail}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Payment Method</h3>
        <div className="p-4 bg-secondary rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <CreditCard size={20} className="text-primary" strokeWidth={2} />
            </div>
            <div>
              <p className="font-medium text-foreground">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 12/26</p>
            </div>
          </div>
          <button className="text-sm text-primary hover:text-primary/80 font-medium transition">
            Update
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition font-medium">
          Download Invoice
        </button>
        <button className="flex-1 px-4 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition font-medium">
          Cancel Membership
        </button>
      </div>
    </div>
  );
}
