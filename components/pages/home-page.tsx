'use client';

import { useAuth } from '@/lib/auth-context';
import { Calendar, Users, BookOpen, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function HomePage() {
  const { user } = useAuth();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const quickStats = [
    { icon: MessageSquare, label: 'New Messages', value: '12', color: 'from-blue-500 to-blue-600' },
    { icon: Users, label: 'Groups', value: '8', color: 'from-purple-500 to-purple-600' },
    { icon: Calendar, label: 'Upcoming Meetings', value: '3', color: 'from-cyan-500 to-cyan-600' },
    { icon: BookOpen, label: 'New Lessons', value: '5', color: 'from-orange-500 to-orange-600' },
  ];

  const recentActivities = [
    { type: 'message', user: 'Sarah Johnson', action: 'sent a message in English Class', time: '5 minutes ago' },
    { type: 'group', user: 'Physics Group', action: 'posted new study notes', time: '15 minutes ago' },
    { type: 'meeting', user: 'Math Lecture', action: 'meeting started', time: '1 hour ago' },
    { type: 'lesson', user: 'Mr. Smith', action: 'shared new chemistry lesson', time: '2 hours ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">
          {greeting}, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">Welcome back to EduConnect. Let&apos;s make today productive!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-4`}>
                <Icon size={24} />
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/chat"
              className="block px-4 py-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition font-medium"
            >
              📧 Go to Chat
            </Link>
            <Link
              href="/dashboard/groups"
              className="block px-4 py-3 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition font-medium"
            >
              👥 Browse Groups
            </Link>
            <Link
              href="/dashboard/meet"
              className="block px-4 py-3 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition font-medium"
            >
              🎥 Join Meeting
            </Link>
            <Link
              href="/dashboard/lessons"
              className="block px-4 py-3 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition font-medium"
            >
              📚 View Lessons
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
