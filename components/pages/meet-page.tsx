'use client';

import { useState } from 'react';
import { Plus, Calendar, Clock, Users, Video, Link as LinkIcon, MoreVertical, X } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MeetPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    description: '',
  });

  const meetings = [
    {
      id: '1',
      title: 'Mathematics Class',
      date: 'Today',
      time: '10:00 AM',
      duration: '60 min',
      members: 24,
      link: 'https://meet.google.com/abc-defg-hij',
      status: 'ongoing',
    },
    {
      id: '2',
      title: 'Physics Lab Discussion',
      date: 'Today',
      time: '2:00 PM',
      duration: '45 min',
      members: 15,
      link: 'https://meet.google.com/xyz-uvwx-yz',
      status: 'upcoming',
    },
    {
      id: '3',
      title: 'English Literature Seminar',
      date: 'Tomorrow',
      time: '9:00 AM',
      duration: '90 min',
      members: 32,
      link: 'https://meet.google.com/abc-xyz-123',
      status: 'upcoming',
    },
  ];

  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const date = new Date(2024, 0, 1 + i - 5);
    return {
      day: date.getDate(),
      month: date.getMonth(),
      hasMeeting: Math.random() > 0.7,
    };
  });

  const handleCreateMeeting = () => {
    if (formData.title.trim() && formData.date && formData.time) {
      console.log('Creating meeting:', formData);
      setShowCreateModal(false);
      setFormData({ title: '', date: '', time: '', duration: '60', description: '' });
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings & Planner</h1>
          <p className="text-gray-600 mt-1">Manage your schedule and join meetings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition font-medium"
        >
          <Plus size={20} />
          New Meeting
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">January 2024</h2>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-gray-100 rounded transition">
                <ChevronLeft size={20} />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded transition">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dateObj, i) => (
              <button
                key={i}
                className={`aspect-square rounded-lg text-sm font-medium transition flex items-center justify-center relative ${
                  dateObj.month === 0
                    ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    : 'text-gray-400'
                }`}
              >
                {dateObj.day}
                {dateObj.hasMeeting && dateObj.month === 0 && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Meetings</h2>
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          meeting.status === 'ongoing'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {meeting.status === 'ongoing' ? '🔴 Live' : 'Upcoming'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{meeting.description || 'Class discussion'}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded transition text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{meeting.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{meeting.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{meeting.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{meeting.members} members</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <a
                    href={meeting.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition font-medium text-sm"
                  >
                    <Video size={16} />
                    Join Meeting
                  </a>
                  <button className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                    <LinkIcon size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl animate-in fade-in scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Schedule Meeting</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="e.g., Math Class"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  min="15"
                  step="15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Add details about the meeting"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMeeting}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition font-medium"
                >
                  Create Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
