'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Lock, Eye, Palette, Globe, Database, AlertTriangle,
  Camera, Mail, School, Award, Smartphone, Moon, Sun, Volume2,
  Vibrate, Shield, ChevronRight, Save, Download, Trash2, LogOut,
  Key, CircleDot, Clock
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'storage', label: 'Data & Storage', icon: Database },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('settings_activeTab') || 'profile');

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    school: user?.school || '',
    level: user?.level || '',
  });
  const [bio, setBio] = useState(() => localStorage.getItem('settings_bio') || 'Student passionate about learning');

  const [notifications, setNotifications] = useState<{
    messages: boolean; groups: boolean; sound: boolean; vibration: boolean; preview: boolean;
  }>(() => {
    const saved = localStorage.getItem('settings_notifications');
    return saved ? JSON.parse(saved) : {
      messages: true,
      groups: true,
      sound: true,
      vibration: false,
      preview: true,
    };
  });

  const [privacy, setPrivacy] = useState<{
    lastSeen: string; profilePhoto: string; onlineStatus: boolean; twoFactor: boolean;
  }>(() => {
    const saved = localStorage.getItem('settings_privacy');
    return saved ? JSON.parse(saved) : {
      lastSeen: 'everyone',
      profilePhoto: 'everyone',
      onlineStatus: true,
      twoFactor: false,
    };
  });

  const [fontSize, setFontSize] = useState(() => localStorage.getItem('settings_fontSize') || 'medium');

  const [language, setLanguage] = useState(() => localStorage.getItem('settings_language') || 'english');

  useEffect(() => {
    document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.documentElement.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('settings_fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => { localStorage.setItem('settings_language', language); }, [language]);
  useEffect(() => { localStorage.setItem('settings_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('settings_privacy', JSON.stringify(privacy)); }, [privacy]);
  useEffect(() => { localStorage.setItem('settings_bio', bio); }, [bio]);
  useEffect(() => { localStorage.setItem('settings_activeTab', activeTab); }, [activeTab]);

  const toggle = (section: string, key: string) => {
    if (section === 'notifications') setNotifications(prev => ({ ...prev, [key]: !(prev as any)[key] }));
    if (section === 'privacy' && key === 'onlineStatus') setPrivacy(prev => ({ ...prev, onlineStatus: !prev.onlineStatus }));
    if (section === 'privacy' && key === 'twoFactor') setPrivacy(prev => ({ ...prev, twoFactor: !prev.twoFactor }));
    if (section === 'appearance' && key === 'darkMode') toggleTheme();
  };

  const handleProfileSave = () => {
    updateProfile({ name: profile.name, school: profile.school, level: profile.level });
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
        checked ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-gray-600'
      }`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
        checked ? 'right-1' : 'left-1'
      }`} />
    </button>
  );

  const RadioGroup = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex gap-1 bg-secondary rounded-lg p-1">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            value === opt ? 'bg-blue-500 text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex gap-6 pb-8 min-h-full">
      {/* Tab Sidebar (sticky) */}
      <div className="w-56 flex-shrink-0 space-y-1 sticky top-0 self-start">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-500 text-primary-foreground shadow-lg shadow-blue-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-blue-500/10'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panel (scrollable) */}
      <div className="flex-1 bg-card border border-border rounded-2xl overflow-y-auto p-6 md:p-8 pb-16">
        <AnimatePresence mode="wait">
          {/* Profile */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Profile</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={profile.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-500/30 bg-white" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center ring-4 ring-blue-500/30">
                      <span className="text-3xl font-bold text-blue-400">{profile.name.charAt(0) || 'U'}</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="settingsAvatarUpload" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateProfile({ avatar: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button onClick={() => document.getElementById('settingsAvatarUpload')?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:bg-blue-400 transition cursor-pointer">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{profile.name || 'Your Name'}</p>
                  <p className="text-sm text-muted-foreground">{user?.role === 'student' ? 'Student' : 'Teacher'}</p>
                </div>
              </div>

              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Full Name</label>
                  <input type="text" value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-secondary border border-border text-foreground rounded-xl focus:outline-none focus:border-blue-400 transition placeholder:text-muted-foreground/70" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary border border-border text-foreground rounded-xl focus:outline-none focus:border-blue-400 transition placeholder:text-muted-foreground/70 resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Email</label>
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary border border-blue-500/10 rounded-xl text-muted-foreground">
                    <Mail size={16} className="text-blue-400" />
                    <span>{profile.email}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">School</label>
                    <input type="text" value={profile.school}
                      onChange={e => setProfile({ ...profile, school: e.target.value })}
                      className="w-full px-4 py-2.5 bg-secondary border border-border text-foreground rounded-xl focus:outline-none focus:border-blue-400 transition placeholder:text-muted-foreground/70" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Level</label>
                    <select value={profile.level} onChange={e => setProfile({ ...profile, level: e.target.value })}
                      className="w-full px-4 py-2.5 bg-secondary border border-border text-foreground rounded-xl focus:outline-none focus:border-blue-400 transition">
                      <option value="" className="bg-card">Select level</option>
                      {['CEM-1','CEM-2','CEM-3','Lycée-1','Lycée-2','Lycée-3'].map(l => (
                        <option key={l} value={l} className="bg-card">{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={handleProfileSave}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-400 text-foreground rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">Notifications</h2>
              <p className="text-muted-foreground mb-6">Customize your notification preferences</p>
              <div className="space-y-1 max-w-lg">
                {[
                  { key: 'messages', label: 'Message Notifications', desc: 'New messages from individuals', icon: Mail },
                  { key: 'groups', label: 'Group Notifications', desc: 'Activity in your groups', icon: Bell },
                  { key: 'sound', label: 'Sound', desc: 'Play a sound for notifications', icon: Volume2 },
                  { key: 'vibration', label: 'Vibration', desc: 'Vibrate on new notifications', icon: Vibrate },
                  { key: 'preview', label: 'Message Preview', desc: 'Show message preview in notifications', icon: Eye },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-secondary rounded-xl hover:bg-[#243447] transition">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-blue-400 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground/70">{item.desc}</p>
                        </div>
                      </div>
                      <ToggleSwitch checked={(notifications as any)[item.key]} onChange={() => toggle('notifications', item.key)} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Privacy & Security */}
          {activeTab === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">Privacy & Security</h2>
              <p className="text-muted-foreground mb-6">Control your privacy and account security</p>

              <div className="space-y-6 max-w-lg">
                <div className="bg-secondary rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><CircleDot size={16} className="text-blue-400" /> Who can see my info</h3>
                  <div>
                    <p className="text-sm text-foreground/80 mb-2">Last Seen & Online</p>
                    <RadioGroup options={['everyone', 'contacts', 'nobody']} value={privacy.lastSeen} onChange={v => setPrivacy(prev => ({ ...prev, lastSeen: v }))} />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/80 mb-2">Profile Photo</p>
                    <RadioGroup options={['everyone', 'contacts', 'nobody']} value={privacy.profilePhoto} onChange={v => setPrivacy(prev => ({ ...prev, profilePhoto: v }))} />
                  </div>
                </div>

                <div className="bg-secondary rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><Shield size={16} className="text-blue-400" /> Security</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">Show Online Status</p>
                      <p className="text-xs text-muted-foreground/70">Let others see when you&apos;re online</p>
                    </div>
                    <ToggleSwitch checked={privacy.onlineStatus} onChange={() => toggle('privacy', 'onlineStatus')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground/70">Extra security for your account</p>
                    </div>
                    <ToggleSwitch checked={privacy.twoFactor} onChange={() => toggle('privacy', 'twoFactor')} />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition text-sm font-medium">
                    <Key size={14} /> Change Password
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">Appearance</h2>
              <p className="text-muted-foreground mb-6">Customize the look and feel</p>
              <div className="space-y-4 max-w-lg">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-blue-400" />}
                    <div>
                      <p className="font-medium text-foreground text-sm">Dark Mode</p>
                      <p className="text-xs text-muted-foreground/70">{theme === 'dark' ? 'Dark theme active' : 'Light theme active'}</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={theme === 'dark'} onChange={() => toggle('appearance', 'darkMode')} />
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-sm font-medium text-foreground/80 mb-3 flex items-center gap-2"><Eye size={16} className="text-blue-400" /> Font Size</p>
                  <RadioGroup options={['small', 'medium', 'large']} value={fontSize} onChange={setFontSize} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Language */}
          {activeTab === 'language' && (
            <motion.div key="language" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">Language</h2>
              <p className="text-muted-foreground mb-6">Select your preferred language</p>
              <div className="space-y-1 max-w-lg">
                {[
                  { id: 'english', label: 'English', native: 'English' },
                  { id: 'french', label: 'French', native: 'Français' },
                  { id: 'arabic', label: 'Arabic', native: 'العربية' },
                  { id: 'spanish', label: 'Spanish', native: 'Español' },
                  { id: 'german', label: 'German', native: 'Deutsch' },
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition ${
                      language === lang.id ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-secondary hover:bg-[#243447] border border-transparent'
                    }`}
                  >
                    <div className="text-left">
                      <p className={`font-medium text-sm ${language === lang.id ? 'text-blue-400' : 'text-foreground'}`}>{lang.label}</p>
                      <p className="text-xs text-muted-foreground/70">{lang.native}</p>
                    </div>
                    {language === lang.id && <div className="w-2 h-2 bg-blue-400 rounded-full" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Data & Storage */}
          {activeTab === 'storage' && (
            <motion.div key="storage" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">Data & Storage</h2>
              <p className="text-muted-foreground mb-6">Manage your data and storage usage</p>
              <div className="space-y-4 max-w-lg">
                <div className="bg-secondary rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Cache Size</span>
                    <span className="text-sm text-foreground font-medium">24.5 MB</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-blue-500 rounded-full" />
                  </div>
                </div>
                <button className="flex items-center gap-2 w-full p-4 bg-secondary hover:bg-[#243447] rounded-xl transition text-left">
                  <Download size={18} className="text-blue-400" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Export My Data</p>
                    <p className="text-xs text-muted-foreground/70">Download your account data</p>
                  </div>
                </button>
                <button className="flex items-center gap-2 w-full p-4 bg-secondary hover:bg-[#243447] rounded-xl transition text-left">
                  <Trash2 size={18} className="text-yellow-400" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Clear Cache</p>
                    <p className="text-xs text-muted-foreground/70">Free up storage space</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Danger Zone */}
          {activeTab === 'danger' && (
            <motion.div key="danger" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h2 className="text-2xl font-bold text-red-400 mb-2">Danger Zone</h2>
              <p className="text-muted-foreground mb-6">Irreversible actions — proceed with caution</p>
              <div className="space-y-4 max-w-lg">
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                  <p className="font-semibold text-foreground mb-1">Log Out</p>
                  <p className="text-sm text-muted-foreground mb-3">Sign out of your account on this device</p>
                  <button onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition text-sm font-medium">
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                  <p className="font-semibold text-foreground mb-1">Delete Account</p>
                  <p className="text-sm text-muted-foreground mb-3">Permanently delete your account and all data</p>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-foreground rounded-lg hover:bg-red-400 transition text-sm font-medium shadow-lg hover:shadow-red-500/30">
                    <Trash2 size={14} /> Delete My Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
