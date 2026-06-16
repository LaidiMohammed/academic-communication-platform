'use client';

import { useState } from 'react';
import { Plus, Settings, Users, Lock, Globe, Search, MessageCircle, MoreVertical } from 'lucide-react';

export function GroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    type: 'public',
    permissions: 'everyone',
  });

  const groups = [
    {
      id: 'group-1',
      name: 'Math Study Circle',
      bio: 'Advanced mathematics discussion group',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=math',
      members: 24,
      type: 'public',
      permissions: 'everyone',
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
      permissions: 'members',
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
      permissions: 'everyone',
      isMember: false,
      isAdmin: false,
    },
  ];

  const messages = [
    { id: 1, sender: 'Alex', text: 'Has anyone solved problem 5?', time: '10:30', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
    { id: 2, sender: 'Jordan', text: 'Yes! The answer is 42', time: '10:35', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan' },
    { id: 3, sender: 'Sam', text: 'Can someone explain the steps?', time: '10:40', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam' },
  ];

  const handleCreateGroup = () => {
    if (formData.name.trim()) {
      console.log('Creating group:', formData);
      setShowCreateModal(false);
      setFormData({ name: '', bio: '', type: 'public', permissions: 'everyone' });
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Groups List */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Groups</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Groups */}
        <div className="flex-1 overflow-y-auto">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                selectedGroup === group.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{group.name}</p>
                    {group.type === 'private' && <Lock size={14} className="text-gray-500" />}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{group.bio}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Users size={14} />
                    <span>{group.members} members</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group Chat */}
      {selectedGroup && (
        <div className="hidden md:flex flex-1 flex-col">
          {/* Group Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=math"
                alt="Group"
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-900">Math Study Circle</p>
                <p className="text-sm text-gray-500">24 members • 2 online</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-blue-600">
                <Users size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-blue-600">
                <Settings size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-blue-600">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Group Info */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 border-b border-gray-200">
            <p className="text-sm text-gray-700 mb-3">
              Advanced mathematics discussion group for grade 12 students
            </p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-blue-600" />
                <span>Public Group</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                <span>24 Members</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <img
                  src={msg.avatar}
                  alt={msg.sender}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />

                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-sm text-gray-900">{msg.sender}</p>
                    <p className="text-xs text-gray-500">{msg.time}</p>
                  </div>
                  <div className="mt-1 px-4 py-2 rounded-2xl bg-gray-200 text-gray-900 rounded-bl-none max-w-md">
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>

                <button className="p-2 rounded hover:bg-gray-100 transition text-gray-600 hover:text-blue-600 opacity-0 hover:opacity-100">
                  <MoreVertical size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 p-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition">
              <MessageCircle size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl animate-in fade-in scale-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Group</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Describe your group"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <select
                  value={formData.permissions}
                  onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="everyone">Everyone can post</option>
                  <option value="members">Members only</option>
                  <option value="admin">Admin only</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition font-medium"
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
