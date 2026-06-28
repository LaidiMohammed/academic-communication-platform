'use client';

import { useState } from 'react';
import { Plus, Calendar, Clock, Users, Video, Link as LinkIcon, MoreVertical, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MeetPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    description: '',
    link: '',
  });

  const [meetings, setMeetings] = useState([
    {
      id: '1',
      title: 'Mathematics Class',
      description: 'Weekly algebra and geometry session',
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
      description: 'Review lab results and prepare for exam',
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
      description: 'Deep dive into 20th century poetry',
      date: 'Tomorrow',
      time: '9:00 AM',
      duration: '90 min',
      members: 32,
      link: 'https://meet.google.com/abc-xyz-123',
      status: 'upcoming',
    },
  ]);

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
      const newMeeting = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time,
        duration: `${formData.duration} min`,
        members: 1,
        link: formData.link.trim() || `https://meet.google.com/new-${Date.now()}`,
        status: 'upcoming' as const,
      };
      setMeetings(prev => [newMeeting, ...prev]);
      setShowCreateModal(false);
      setFormData({ title: '', date: '', time: '', duration: '60', description: '', link: '' });
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Meetings & Planner</h1>
          <p className="text-gray-400 mt-1">Manage your schedule and join meetings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
        >
          <Plus size={20} />
          New Meeting
        </motion.button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1 bg-[#111827] border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">January 2024</h2>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-blue-500/20 text-gray-400 rounded transition">
                <ChevronLeft size={20} />
              </button>
              <button className="p-1 hover:bg-blue-500/20 text-gray-400 rounded transition">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dateObj, i) => (
              <button
                key={i}
                className={`aspect-square rounded-lg text-sm font-medium transition flex items-center justify-center relative ${
                  dateObj.month === 0
                    ? 'bg-blue-500/10 text-white hover:bg-blue-500/20'
                    : 'text-gray-600'
                }`}
              >
                {dateObj.day}
                {dateObj.hasMeeting && dateObj.month === 0 && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="lg:col-span-2 bg-[#111827] border border-blue-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Upcoming Meetings</h2>
          <div className="space-y-3">
            {meetings.map((meeting, idx) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-blue-500/10 rounded-xl p-4 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          meeting.status === 'ongoing'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {meeting.status === 'ongoing' ? 'Live' : 'Upcoming'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{meeting.description || 'Class discussion'}</p>
                  </div>
                  <button className="p-2 hover:bg-blue-500/10 rounded transition text-gray-400">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-400" />
                    <span>{meeting.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-400" />
                    <span>{meeting.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-400" />
                    <span>{meeting.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-blue-400" />
                    <span>{meeting.members} members</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <ExternalLink size={16} className="text-blue-400" />
                    <span className="text-xs text-gray-500 truncate">{meeting.link}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-blue-500/10">
                  <a
                    href={meeting.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all font-medium text-sm"
                  >
                    <Video size={16} />
                    Join Meeting
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(meeting.link)}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-blue-500/20 text-gray-400 rounded-lg hover:bg-blue-500/10 hover:text-blue-400 transition"
                    title="Copy link"
                  >
                    <LinkIcon size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#111827] border border-blue-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">Schedule Meeting</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-blue-500/10 rounded transition text-gray-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1E293B] border border-blue-500/20 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-blue-400 transition"
                    placeholder="e.g., Math Class"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 bg-[#1E293B] border border-blue-500/20 text-white rounded-lg focus:outline-none focus:border-blue-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-2 bg-[#1E293B] border border-blue-500/20 text-white rounded-lg focus:outline-none focus:border-blue-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1E293B] border border-blue-500/20 text-white rounded-lg focus:outline-none focus:border-blue-400 transition"
                    min="15"
                    step="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Google Meet Link</label>
                  <div className="relative">
                    <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-[#1E293B] border border-blue-500/20 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-blue-400 transition"
                      placeholder="https://meet.google.com/abc-defg-hij"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1E293B] border border-blue-500/20 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-blue-400 transition"
                    placeholder="Add details about the meeting"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-blue-500/20 text-gray-300 hover:bg-blue-500/10 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateMeeting}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
                  >
                    Create Meeting
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
