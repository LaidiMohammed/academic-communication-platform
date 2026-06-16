'use client';

import { useAuth } from '@/lib/auth-context';
import { Camera, Mail, School, Award } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white mb-8 relative">
        <div className="flex items-end gap-6">
          <div className="relative">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-24 h-24 rounded-full border-4 border-white"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-blue-600 hover:shadow-lg transition">
              <Camera size={16} />
            </button>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-blue-100">{user?.role === 'student' ? 'Student' : 'Teacher'}</p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Info */}
      {isEditing ? (
        <div className="bg-white rounded-xl shadow p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start gap-3">
              <Mail className="text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start gap-3">
              <School className="text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">School</p>
                <p className="text-lg font-semibold text-gray-900">{user?.school}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start gap-3">
              <Award className="text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-lg font-semibold text-gray-900">{user?.level}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.role === 'student' ? 'S' : 'T'}
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Section */}
      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Activity</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>Last login: Today at 10:30 AM</p>
          <p>Account created: 3 months ago</p>
          <p>Groups joined: 8</p>
          <p>Messages sent: 342</p>
        </div>
      </div>
    </div>
  );
}
