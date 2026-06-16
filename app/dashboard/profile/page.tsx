'use client';

import { useAuth } from '@/lib/auth-context';
import { Camera, Mail, School, Award, Zap } from 'lucide-react';
import { useState } from 'react';
import { MembershipSection } from '@/components/membership-section';
import { QRScanner } from '@/components/qr-scanner';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    school: user?.school || '',
    level: user?.level || '',
  });

  const handleSave = () => {
    updateProfile({
      name: formData.name,
      school: formData.school,
      level: formData.level,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-primary-foreground relative">
        <div className="flex items-end gap-6">
          <div className="relative">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-24 h-24 rounded-full border-4 border-primary-foreground shadow-lg"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-primary-foreground rounded-full text-primary hover:shadow-lg transition">
              <Camera size={16} />
            </button>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-primary-foreground/80">{user?.role === 'student' ? 'Student' : 'Teacher'}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-primary-foreground text-primary rounded-lg font-semibold hover:shadow-lg transition"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowQRScanner(true)}
                className="px-4 py-2 bg-primary-foreground/20 text-primary-foreground rounded-lg font-semibold hover:bg-primary-foreground/30 transition flex items-center gap-2"
              >
                <Zap size={18} strokeWidth={2} />
                Scan Code
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          onScanned={(data) => {
            console.log('Scanned member:', data);
          }}
        />
      )}

      {/* Profile Info */}
      {isEditing ? (
        <div className="bg-card border border-border rounded-2xl p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-secondary focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">School</label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-secondary focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-secondary focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              <option value="CEM-1">CEM 1</option>
              <option value="CEM-2">CEM 2</option>
              <option value="CEM-3">CEM 3</option>
              <option value="Lycée-1">Lycée 1</option>
              <option value="Lycée-2">Lycée 2</option>
              <option value="Lycée-3">Lycée 3</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg transition font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Mail className="text-primary mt-1" size={20} strokeWidth={2} />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-semibold text-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-3">
              <School className="text-primary mt-1" size={20} strokeWidth={2} />
              <div>
                <p className="text-sm text-muted-foreground">School</p>
                <p className="text-lg font-semibold text-foreground">{user?.school}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Award className="text-primary mt-1" size={20} strokeWidth={2} />
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-lg font-semibold text-foreground">{user?.level}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                {user?.role === 'student' ? 'S' : 'T'}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="text-lg font-semibold text-foreground capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Membership Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Membership & Billing</h2>
        <MembershipSection
          userId={user?.id || 'user123'}
          userEmail={user?.email || ''}
          userName={user?.name || ''}
          membershipStatus="active"
          monthlyAmount={9.99}
          billingCycle={{
            startDate: 'Dec 16, 2025',
            endDate: 'Jan 16, 2026',
            daysRemaining: 31,
          }}
        />
      </div>

      {/* Activity Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Account Activity</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Last login: Today at 10:30 AM</p>
          <p>Account created: 3 months ago</p>
          <p>Groups joined: 8</p>
          <p>Messages sent: 342</p>
        </div>
      </div>
    </div>
  );
}
