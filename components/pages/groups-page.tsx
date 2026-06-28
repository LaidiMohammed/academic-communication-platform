'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Plus, Users, Search, MessageCircle, X,
  MessageSquare, Camera, UserPlus, Pin, Settings, Shield,
  Clock, TrendingUp, UserCheck,
} from 'lucide-react';
import { PermissionsBadge } from '@/components/permissions-badge';

type PermissionLevel = 'all' | 'admins_only';

interface GroupPermissions {
  sendMessages: PermissionLevel;
  sendMedia: PermissionLevel;
  addMembers: PermissionLevel;
  pinMessages: PermissionLevel;
  changeInfo: PermissionLevel;
}

interface Group {
  id: string;
  name: string;
  bio: string;
  image: string;
  members: number;
  type: 'public' | 'private';
  permissions: GroupPermissions;
  isMember: boolean;
  isAdmin: boolean;
  createdAt: string;
  activity: string;
}

type SortMode = 'recent' | 'popular' | 'my';

const defaultPermissions: GroupPermissions = {
  sendMessages: 'all',
  sendMedia: 'all',
  addMembers: 'all',
  pinMessages: 'admins_only',
  changeInfo: 'admins_only',
};

const permissionLabels: Record<keyof GroupPermissions, { label: string; icon: any }> = {
  sendMessages: { label: 'Send Messages', icon: MessageSquare },
  sendMedia: { label: 'Send Media', icon: Camera },
  addMembers: { label: 'Add Members', icon: UserPlus },
  pinMessages: { label: 'Pin Messages', icon: Pin },
  changeInfo: { label: 'Change Group Info', icon: Settings },
};

export function GroupsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canCreate = user?.role === 'teacher' || user?.role === 'admin';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermsModal, setShowPermsModal] = useState<Group | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('groups_page_data');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'group-1', name: 'Math Study Circle', bio: 'Advanced mathematics discussion group', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=math', members: 24, type: 'public', permissions: { ...defaultPermissions, pinMessages: 'all' }, isMember: true, isAdmin: true, createdAt: '2024-01-15', activity: '2m ago' },
      { id: 'group-2', name: 'Physics Lab Notes', bio: 'Share physics lab experiments and notes', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=physics', members: 18, type: 'private', permissions: { ...defaultPermissions, sendMessages: 'admins_only' }, isMember: true, isAdmin: false, createdAt: '2024-03-20', activity: '1h ago' },
      { id: 'group-3', name: 'English Literature', bio: 'Discuss books and literature', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=english', members: 32, type: 'public', permissions: defaultPermissions, isMember: false, isAdmin: false, createdAt: '2024-06-01', activity: '3h ago' },
      { id: 'group-4', name: 'Chemistry Lab', bio: 'Experiment results and Q&A', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chemistry', members: 15, type: 'private', permissions: { ...defaultPermissions, addMembers: 'admins_only' }, isMember: false, isAdmin: false, createdAt: '2024-08-10', activity: '1d ago' },
    ];
  });

  useEffect(() => { localStorage.setItem('groups_page_data', JSON.stringify(groups)); }, [groups]);

  const [formData, setFormData] = useState({
    name: '', bio: '', type: 'public' as 'public' | 'private', image: '',
  });

  const [editPerms, setEditPerms] = useState<GroupPermissions>(defaultPermissions);

  const filteredGroups = useMemo(() => {
    let sorted = [...groups];
    if (sortMode === 'popular') sorted.sort((a, b) => b.members - a.members);
    else if (sortMode === 'my') sorted = sorted.filter(g => g.isMember);
    else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted;
  }, [groups, sortMode]);

  const handleCreateGroup = () => {
    if (!formData.name.trim()) return;
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: formData.name,
      bio: formData.bio || 'New group',
      image: formData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
      members: 1,
      type: formData.type,
      permissions: { ...editPerms },
      isMember: true,
      isAdmin: true,
      createdAt: new Date().toISOString().slice(0, 10),
      activity: 'just now',
    };
    setGroups([newGroup, ...groups]);
    setShowCreateModal(false);
    setFormData({ name: '', bio: '', type: 'public', image: '' });
    setEditPerms(defaultPermissions);
  };

  const openPermsModal = (group: Group) => {
    setEditPerms({ ...group.permissions });
    setShowPermsModal(group);
  };

  const savePerms = () => {
    if (!showPermsModal) return;
    setGroups(groups.map(g => g.id === showPermsModal.id ? { ...g, permissions: { ...editPerms } } : g));
    setShowPermsModal(null);
  };

  const togglePerm = (key: keyof GroupPermissions) => {
    setEditPerms(prev => ({ ...prev, [key]: prev[key] === 'all' ? 'admins_only' : 'all' }));
  };

  const permsType = (p: GroupPermissions): 'public' | 'private' | 'invite-only' | 'restricted' => {
    if (p.sendMessages === 'all' && p.addMembers === 'all') return 'public';
    if (p.sendMessages === 'admins_only') return 'restricted';
    if (p.addMembers === 'admins_only') return 'invite-only';
    return 'private';
  };

  return (
    <div className="min-h-full bg-background p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Groups</h1>
        {canCreate ? (
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition active:scale-95 text-sm font-semibold">
            <Plus size={18} strokeWidth={2} />
            Create Group
          </button>
        ) : (
          <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg">Students join via invite</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search groups..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition" />
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          {([{ k: 'recent', l: 'Recent', i: Clock }, { k: 'popular', l: 'Popular', i: TrendingUp }, { k: 'my', l: 'My Groups', i: UserCheck }] as const).map(({ k, l, i: Icon }) => (
            <button key={k} onClick={() => setSortMode(k)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition ${sortMode === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon size={14} /> {l}
            </button>
          ))}
        </div>
      </div>

      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGroups.map((group) => (
            <div key={group.id}
              className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                {group.isAdmin && (
                  <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield size={10} /> Admin
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground mb-1 line-clamp-1">{group.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{group.bio}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users size={14} strokeWidth={2} />
                    <span>{group.members} members</span>
                  </div>
                  <PermissionsBadge type={permsType(group.permissions)} size="sm" />
                </div>

                {/* Permission toggles preview */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(Object.keys(permissionLabels) as (keyof GroupPermissions)[]).map(key => {
                    const Icon = permissionLabels[key].icon;
                    const level = group.permissions[key];
                    return (
                      <div key={key} title={`${permissionLabels[key].label}: ${level === 'all' ? 'Everyone' : 'Admins only'}`}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium border ${level === 'all' ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'}`}>
                        <Icon size={9} strokeWidth={2.5} />
                        <span>{level === 'all' ? 'All' : 'Admin'}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-muted-foreground/60 mb-3">Activity: {group.activity}</div>

                <div className="flex gap-2">
                  {group.isAdmin && (
                    <button onClick={() => openPermsModal(group)}
                      className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition text-xs font-semibold active:scale-95">
                      <Shield size={13} /> Permissions
                    </button>
                  )}
                  {!group.isMember && (
                    <button className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:shadow-md transition active:scale-95">
                      Join
                    </button>
                  )}
                  <button onClick={() => router.push(`/dashboard/chat?group=${group.id}`)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition text-xs font-semibold active:scale-95">
                    <MessageCircle size={14} strokeWidth={2} />
                    Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Users size={48} strokeWidth={1.5} className="mb-4" />
          <p className="text-lg font-medium mb-1">No groups yet</p>
          <p className="text-sm mb-4">{canCreate ? 'Create your first group to get started' : 'Ask a teacher to invite you to a group'}</p>
          {canCreate && (
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:shadow-lg transition active:scale-95">
            <Plus size={18} strokeWidth={2} />
            Create Group
          </button>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Create New Group</h3>
              <button onClick={() => { setShowCreateModal(false); setEditPerms(defaultPermissions); }} className="p-1 hover:bg-secondary rounded-lg transition">
                <X size={20} strokeWidth={2} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('groupAvatarUpload')?.click()}>
                {formData.image ? (
                  <img src={formData.image} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-secondary bg-white" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-secondary border-4 border-border flex items-center justify-center overflow-hidden">
                    {formData.name ? (
                      <span className="text-3xl font-bold text-foreground">{formData.name.charAt(0)}</span>
                    ) : (
                      <Camera size={24} className="text-muted-foreground" />
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Camera size={20} className="text-white" />
                </div>
                <input 
                  type="file" 
                  id="groupAvatarUpload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Group Name</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-secondary text-foreground"
                  placeholder="Enter group name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Group Bio</label>
                <textarea value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-secondary text-foreground"
                  placeholder="Describe your group" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Group Type</label>
                <select value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'public' | 'private' })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-secondary text-foreground">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Shield size={15} /> Group Permissions
                </h4>
                <div className="space-y-2">
                  {(Object.keys(permissionLabels) as (keyof GroupPermissions)[]).map(key => {
                    const { label, icon: Icon } = permissionLabels[key];
                    return (
                      <div key={key} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-secondary/50 transition">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Icon size={15} className="text-muted-foreground" />
                          <span>{label}</span>
                        </div>
                        <button onClick={() => togglePerm(key)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition ${editPerms[key] === 'all' ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'}`}>
                          {editPerms[key] === 'all' ? 'Everyone' : 'Admins only'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <button onClick={() => { setShowCreateModal(false); setEditPerms(defaultPermissions); }}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition font-semibold text-sm active:scale-95">
                  Cancel
                </button>
                <button onClick={handleCreateGroup}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition font-semibold text-sm active:scale-95">
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Edit Modal */}
      {showPermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield size={18} /> Permissions — {showPermsModal.name}
              </h3>
              <button onClick={() => setShowPermsModal(null)} className="p-1 hover:bg-secondary rounded-lg transition">
                <X size={20} strokeWidth={2} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2">
              {(Object.keys(permissionLabels) as (keyof GroupPermissions)[]).map(key => {
                const { label, icon: Icon } = permissionLabels[key];
                return (
                  <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition">
                    <div className="flex items-center gap-2.5 text-sm text-foreground">
                      <Icon size={16} className="text-muted-foreground" />
                      <span>{label}</span>
                    </div>
                    <button onClick={() => togglePerm(key)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${editPerms[key] === 'all' ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'}`}>
                      {editPerms[key] === 'all' ? 'Everyone' : 'Admins only'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 pt-6 border-t border-border mt-6">
              <button onClick={() => setShowPermsModal(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition font-semibold text-sm active:scale-95">
                Cancel
              </button>
              <button onClick={savePerms}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition font-semibold text-sm active:scale-95">
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
