'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createServiceClient } from '@/lib/supabase';
import { Plus, Calendar, Clock, Users, Video, Link as LinkIcon, MoreVertical, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  members: number;
  link: string;
  status: 'ongoing' | 'upcoming';
}

export function MeetPage() {
  const { user } = useAuth();
  const supabase = createServiceClient();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    description: '',
    link: '',
  });

  useEffect(() => {
    if (!user) return;
    const fetchMeetings = async () => {
      setLoading(true);
      const { data: dbMeetings } = await supabase
        .from('meetings')
        .select('*, meeting_participants!inner(user_id)')
        .order('date', { ascending: true })
        .limit(50);

      const mapped: Meeting[] = (dbMeetings || []).map((m: any) => {
        const dateObj = new Date(m.date + 'T' + (m.time || '00:00'));
        const isToday = new Date().toDateString() === dateObj.toDateString();
        const isPast = dateObj < new Date();
        return {
          id: m.id,
          title: m.title,
          description: m.description || '',
          date: isToday ? 'Today' : m.date,
          time: m.time || '',
          duration: m.duration || '60 min',
          members: m.meeting_participants?.length || 1,
          link: m.link || '',
          status: isToday && !isPast ? 'ongoing' : 'upcoming',
        };
      });
      setMeetings(mapped);
      setLoading(false);
    };
    fetchMeetings();
  }, [user]);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const calendarDays = (() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevDays = new Date(calYear, calMonth, 0).getDate();
    const cells: any[] = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, month: calMonth - 1, current: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasMeet = meetings.some(m => m.date === dateStr);
      const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
      cells.push({ day: d, month: calMonth, current: true, hasMeeting: hasMeet, isToday });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) cells.push({ day: d, month: calMonth + 1, current: false });
    return cells;
  })();

  const prevMonth = () => { if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); } else { setCalMonth(calMonth - 1); } };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); } else { setCalMonth(calMonth + 1); } };

  const handleCreateMeeting = async () => {
    if (!formData.title.trim() || !formData.date || !formData.time || !user) return;

    const { data: newMeeting, error } = await supabase.from('meetings').insert({
      title: formData.title.trim(),
      description: formData.description.trim() || 'Class discussion',
      date: formData.date,
      time: formData.time,
      duration: `${formData.duration} min`,
      link: formData.link.trim() || `https://meet.google.com/new-${Date.now()}`,
      meet_by: user.id,
    }).select('id').single();

    if (error || !newMeeting) { console.error('Create meeting error:', error?.message); return; }

    await supabase.from('meeting_participants').insert({
      meeting_id: newMeeting.id, user_id: user.id,
    });

    const newMeet: Meeting = {
      id: newMeeting.id,
      title: formData.title.trim(),
      description: formData.description.trim() || 'Class discussion',
      date: formData.date,
      time: formData.time,
      duration: `${formData.duration} min`,
      members: 1,
      link: formData.link.trim() || `https://meet.google.com/new-${Date.now()}`,
      status: 'upcoming',
    };
    setMeetings(prev => [newMeet, ...prev]);
    setShowCreateModal(false);
    setFormData({ title: '', date: '', time: '', duration: '60', description: '', link: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-yellow-400 text-sm font-semibold">Loading meetings...</p>
        </div>
      </div>
    );
  }

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
            <h2 className="text-lg font-bold text-white">{monthNames[calMonth]} {calYear}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-1 hover:bg-blue-500/20 text-gray-400 rounded transition">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="p-1 hover:bg-blue-500/20 text-gray-400 rounded transition">
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
                  dateObj.isToday
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : dateObj.current
                      ? 'bg-blue-500/10 text-white hover:bg-blue-500/20'
                      : 'text-gray-600'
                }`}
              >
                {dateObj.day}
                {dateObj.hasMeeting && dateObj.current && (
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
