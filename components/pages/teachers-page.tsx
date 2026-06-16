'use client';

import { Mail, Star, User, Calendar, MessageSquare } from 'lucide-react';

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teachers & Instructors</h1>
        <p className="text-gray-600 mt-1">Connect with our experienced teaching staff</p>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <img
                src={teacher.avatar}
                alt={teacher.name}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex items-center gap-1">
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-gray-900">{teacher.rating}</span>
                <span className="text-sm text-gray-600">({teacher.reviews})</span>
              </div>
            </div>

            {/* Info */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">{teacher.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{teacher.bio}</p>
            </div>

            {/* Status */}
            <div className="mb-4">
              {teacher.available ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  Busy
                </span>
              )}
            </div>

            {/* Subjects */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Subjects</p>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((subject, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Level */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Teaching Level</p>
              <p className="text-sm text-gray-600">{teacher.level}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition font-medium text-sm">
                <MessageSquare size={16} />
                Message
              </button>
              <a
                href={`mailto:${teacher.email}`}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <Mail size={16} />
              </a>
            </div>

            {/* Email */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Email</p>
              <a href={`mailto:${teacher.email}`} className="text-sm text-blue-600 hover:underline break-all">
                {teacher.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
