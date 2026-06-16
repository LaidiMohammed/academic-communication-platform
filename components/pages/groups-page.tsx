'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Users,
  Search,
  MessageCircle,
  X,
} from 'lucide-react';
import { PermissionsBadge } from '@/components/permissions-badge';

export function GroupsPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    type: 'public',
    permissions: 'public',
  });

  const [groups, setGroups] = useState([
    {
      id: 'group-1',
      name: 'Math Study Circle',
      bio: 'Advanced mathematics discussion group',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=math',
      members: 24,
      type: 'public',
      permissions: 'public',
      isMember: true,
      isAdmin: true,
    },
    {
      id: 'group-2',
      name: 'Physics Lab Notes',
      bio: 'Share physics lab experiments and notes',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=physics',
      members: 18,
      type: 'private',
      permissions: 'private',
      isMember: true,
      isAdmin: false,
    },
    {
      id: 'group-3',
      name: 'English Literature',
      bio: 'Discuss books and literature',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=english',
      members: 32,
      type: 'public',
      permissions: 'public',
      isMember: false,
      isAdmin: false,
    },
    {
      id: 'group-4',
      name: 'Chemistry Lab',
      bio: 'Experiment results and Q&A',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chemistry',
      members: 15,
      type: 'private',
      permissions: 'invite-only',
      isMember: false,
      isAdmin: false,
    },
  ]);

  const handleCreateGroup = () => {
    if (formData.name.trim()) {
      const newGroup = {
        id: `group-${Date.now()}`,
        name: formData.name,
        bio: formData.bio || 'New group',
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        members: 1,
        type: formData.type,
        permissions: formData.permissions,
        isMember: true,
        isAdmin: true,
      };
      setGroups([newGroup, ...groups]);
      setShowCreateModal(false);
      setFormData({ name: '', bio: '', type: 'public', permissions: 'public' });
    }
  };

  return (
    <div className="min-h-full bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Groups</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition active:scale-95 text-sm font-semibold"
        >
          <Plus size={18} strokeWidth={2} />
          Create Group
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search groups..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition"
        />
      </div>

      {/* Groups Grid */}
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground mb-1 line-clamp-1">{group.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{group.bio}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users size={14} strokeWidth={2} />
                    <span>{group.members} members</span>
                  </div>
                  <PermissionsBadge type={group.permissions as 'public' | 'private' | 'invite-only' | 'restricted'} size="sm" />
                </div>
                <div className="flex gap-2">
                  {!group.isMember && (
                    <button className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:shadow-md transition active:scale-95">
                      Join
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/dashboard/chat')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition text-xs font-semibold active:scale-95"
                  >
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
          <p className="text-sm mb-4">Create your first group to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:shadow-lg transition active:scale-95"
          >
            <Plus size={18} strokeWidth={2} />
            Create Group
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Create New Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-secondary rounded-lg transition">
                <X size={20} strokeWidth={2} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-secondary text-foreground"
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Group Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-secondary text-foreground"
                  placeholder="Describe your group"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Group Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-secondary text-foreground"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Permissions</label>
                <select
                  value={formData.permissions}
                  onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-secondary text-foreground"
                >
                  <option value="public">Public - Everyone can post</option>
                  <option value="private">Private - Members only</option>
                  <option value="invite-only">Invite-only - Admin approval</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition font-semibold text-sm active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition font-semibold text-sm active:scale-95"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
