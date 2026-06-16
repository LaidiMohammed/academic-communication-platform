'use client';

import { Bell, Lock, Eye, Smartphone, Globe } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    twoFactorAuth: false,
    profilePrivate: false,
    onlineStatus: true,
    language: 'English',
  });

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and security</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications')}
              className={`relative w-12 h-6 rounded-full transition ${
                settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  settings.emailNotifications ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Browser and mobile notifications</p>
            </div>
            <button
              onClick={() => handleToggle('pushNotifications')}
              className={`relative w-12 h-6 rounded-full transition ${
                settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  settings.pushNotifications ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Privacy & Security</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Extra security for your account</p>
            </div>
            <button
              onClick={() => handleToggle('twoFactorAuth')}
              className={`relative w-12 h-6 rounded-full transition ${
                settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  settings.twoFactorAuth ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Private Profile</p>
              <p className="text-sm text-gray-600">Only approved users can see your profile</p>
            </div>
            <button
              onClick={() => handleToggle('profilePrivate')}
              className={`relative w-12 h-6 rounded-full transition ${
                settings.profilePrivate ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  settings.profilePrivate ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <button className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition font-medium mt-4">
            Change Password
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Show Online Status</p>
              <p className="text-sm text-gray-600">Let others see when you&apos;re online</p>
            </div>
            <button
              onClick={() => handleToggle('onlineStatus')}
              className={`relative w-12 h-6 rounded-full transition ${
                settings.onlineStatus ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  settings.onlineStatus ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option>English</option>
              <option>Français</option>
              <option>العربية</option>
              <option>Español</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-red-700 mb-4">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">
          These actions are permanent and cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition font-medium">
            Export Data
          </button>
          <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
