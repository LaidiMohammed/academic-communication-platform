'use client';

import { useState } from 'react';
import {
  Plus,
  Settings,
  Users,
  Search,
  MessageCircle,
  MoreVertical,
  X,
  Share2,
  Bell,
} from 'lucide-react';
import { PermissionsBadge } from '@/components/permissions-badge';

export function GroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>('group-1');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    type: 'public',
    permissions: 'public',
  });

  const groups = [
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
  ];

  const messages = [
    {
      id: 1,
      sender: 'Alex',
      text: 'Has anyone solved problem 5?',
      time: '10:30',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    },
    {
      id: 2,
      sender: 'Jordan',
      text: 'Yes! The answer is 42',
      time: '10:35',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
    },
    {
      id: 3,
      sender: 'Sam',
      text: 'Can someone explain the steps?',
      time: '10:40',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam',
    },
  ];

  const handleCreateGroup = () => {
    if (formData.name.trim()) {
      console.log('Creating group:', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        bio: '',
        type: 'public',
        permissions: 'public',
      });
    }
  };

  const currentGroup = groups.find((g) => g.id === selectedGroup);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Groups List */}
      <div className="w-full md:w-96 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Groups</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition active:scale-95"
            >
              <Plus size={20} strokeWidth={2} />
            </button>
          </div>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search groups..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {groups.map((group, index) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`animate-slide-in-left stagger-${(index % 4) + 1} group rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-lg hover:scale-105 active:scale-95 ${
                selectedGroup === group.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="font-bold text-foreground mb-1 line-clamp-1">
                  {group.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {group.bio}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users size={14} strokeWidth={2} />
                    <span>{group.members} members</span>
                  </div>
                  <PermissionsBadge
                    type={
                      group.permissions as
                        | 'public'
                        | 'private'
                        | 'invite-only'
                        | 'restricted'
                    }
                    size="sm"
                  />
                </div>

                {!group.isMember && (
                  <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:shadow-md transition active:scale-95">
                    Join Group
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group Chat */}
      {selectedGroup && currentGroup && (
        <div className="hidden md:flex flex-1 flex-col animate-fade-scale">
          {/* Group Header */}
          <div className="bg-card border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 overflow-hidden">
                <img src={currentGroup.image} alt={currentGroup.name} />
              </div>
              <div>
                <p className="font-bold text-foreground">{currentGroup.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentGroup.members} members
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary">
                <Bell size={20} strokeWidth={2} />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary">
                <Users size={20} strokeWidth={2} />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary">
                <Settings size={20} strokeWidth={2} />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary">
                <MoreVertical size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Group Info Banner */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground font-medium mb-2">
                  {currentGroup.bio}
                </p>
                <div className="flex items-center gap-4">
                  <PermissionsBadge
                    type={
                      currentGroup.permissions as
                        | 'public'
                        | 'private'
                        | 'invite-only'
                        | 'restricted'
                    }
                    size="md"
                  />
                </div>
              </div>
              {currentGroup.isAdmin && (
                <button className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:shadow-md transition">
                  <Share2 size={14} strokeWidth={2} />
                  Invite
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`animate-slide-in-up stagger-${index + 1} flex gap-3 group`}
              >
                <img
                  src={msg.avatar}
                  alt={msg.sender}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />

                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="font-semibold text-sm text-foreground">
                      {msg.sender}
                    </p>
                    <p className="text-xs text-muted-foreground">{msg.time}</p>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-secondary text-foreground rounded-bl-none max-w-md">
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>

                <button className="p-2 rounded hover:bg-secondary transition text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="bg-card border-t border-border p-4 flex items-center gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            <button className="p-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition active:scale-95">
              <MessageCircle size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-scale">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full shadow-xl border border-border animate-expand-height">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-foreground">Create New Group</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-secondary rounded-lg transition"
              >
                <X size={20} strokeWidth={2} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-secondary text-foreground"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Group Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-secondary text-foreground"
                  placeholder="Describe your group"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Group Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-secondary text-foreground"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Permissions
                </label>
                <select
                  value={formData.permissions}
                  onChange={(e) =>
                    setFormData({ ...formData, permissions: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-secondary text-foreground"
                >
                  <option value="public">Public - Everyone can post</option>
                  <option value="private">Private - Members only</option>
                  <option value="invite-only">Invite-only - Admin approval</option>
                </select>
              </div>

              <div className="flex gap-2 pt-6 border-t border-border">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition font-semibold active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition font-semibold active:scale-95"
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
