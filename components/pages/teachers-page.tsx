'use client';

import { Mail, Star, User, MessageSquare, GraduationCap, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export function TeachersPage() {
  const teachers = [
    {
      id: '1',
      name: 'Dr. Sarah Smith',
      email: 'sarah.smith@school.edu',
      subjects: ['Mathematics', 'Advanced Calculus'],
      level: 'Lycée 1-3',
      rating: 4.8,
      reviews: 124,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-smith',
      bio: 'Expert in mathematics with 15 years of teaching experience',
      available: true,
    },
    {
      id: '2',
      name: 'Mr. James Johnson',
      email: 'james.johnson@school.edu',
      subjects: ['Physics', 'Laboratory Science'],
      level: 'CEM 2-3, Lycée 1-2',
      rating: 4.6,
      reviews: 98,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james-johnson',
      bio: 'Passionate physicist dedicated to hands-on learning',
      available: true,
    },
    {
      id: '3',
      name: 'Mrs. Emily Davis',
      email: 'emily.davis@school.edu',
      subjects: ['English Literature', 'Creative Writing'],
      level: 'Lycée 1-3',
      rating: 4.9,
      reviews: 156,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily-davis',
      bio: 'Inspiring teacher who makes literature come alive',
      available: false,
    },
    {
      id: '4',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@school.edu',
      subjects: ['Chemistry', 'Organic Chemistry'],
      level: 'CEM 3, Lycée 1-3',
      rating: 4.7,
      reviews: 112,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael-chen',
      bio: 'Chemistry expert with innovative teaching methods',
      available: true,
    },
    {
      id: '5',
      name: 'Mr. Robert Wilson',
      email: 'robert.wilson@school.edu',
      subjects: ['History', 'Global Studies'],
      level: 'CEM 1-3, Lycée 1-3',
      rating: 4.5,
      reviews: 87,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert-wilson',
      bio: 'History teacher bringing past and present together',
      available: true,
    },
    {
      id: '6',
      name: 'Dr. Lisa Anderson',
      email: 'lisa.anderson@school.edu',
      subjects: ['Biology', 'Environmental Science'],
      level: 'Lycée 1-3',
      rating: 4.8,
      reviews: 134,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa-anderson',
      bio: 'Dedicated biologist passionate about environmental education',
      available: true,
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Teachers & Instructors</h1>
        <p className="text-gray-400 mt-1">Connect with our experienced teaching staff</p>
      </motion.div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher, idx) => (
          <motion.div
            key={teacher.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-[#111827] border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-all p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <img
                src={teacher.avatar}
                alt={teacher.name}
                className="w-16 h-16 rounded-full ring-2 ring-blue-500/30"
              />
              <div className="flex items-center gap-1">
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-white">{teacher.rating}</span>
                <span className="text-sm text-gray-500">({teacher.reviews})</span>
              </div>
            </div>

            {/* Info */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">{teacher.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{teacher.bio}</p>
            </div>

            {/* Status */}
            <div className="mb-4">
              {teacher.available ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  Busy
                </span>
              )}
            </div>

            {/* Subjects */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Subjects</p>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((subject, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Level */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Teaching Level</p>
              <p className="text-sm text-gray-400">{teacher.level}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-blue-500/10">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all font-medium text-sm">
                <MessageSquare size={16} />
                Message
              </button>
              <a
                href={`mailto:${teacher.email}`}
                className="flex items-center justify-center px-3 py-2 border border-blue-500/20 text-gray-400 rounded-lg hover:bg-blue-500/10 transition"
              >
                <Mail size={16} />
              </a>
            </div>

            {/* Email */}
            <div className="mt-4 p-3 bg-[#1E293B] border border-blue-500/10 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <a href={`mailto:${teacher.email}`} className="text-sm text-blue-400 hover:underline break-all">
                {teacher.email}
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
