'use client';

import { useState } from 'react';
import { BookOpen, FileText, Play, Download, Search, Filter } from 'lucide-react';

export function LessonsPage() {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('all');

  const subjects = [
    { id: 'math', name: 'Mathematics', color: 'from-blue-500 to-blue-600', icon: '📐' },
    { id: 'english', name: 'English', color: 'from-green-500 to-green-600', icon: '📚' },
    { id: 'physics', name: 'Physics', color: 'from-purple-500 to-purple-600', icon: '⚛️' },
    { id: 'chemistry', name: 'Chemistry', color: 'from-orange-500 to-orange-600', icon: '🧪' },
    { id: 'history', name: 'History', color: 'from-amber-500 to-amber-600', icon: '🏛️' },
    { id: 'biology', name: 'Biology', color: 'from-emerald-500 to-emerald-600', icon: '🦠' },
  ];

  const lessons = [
    {
      id: '1',
      subject: 'Mathematics',
      title: 'Algebra Fundamentals',
      level: 'CEM-1',
      type: 'lesson',
      resources: 12,
      link: 'drive.google.com/folder/...',
    },
    {
      id: '2',
      subject: 'Physics',
      title: 'Forces and Motion',
      level: 'Lycée-1',
      type: 'test',
      resources: 8,
      link: 'drive.google.com/folder/...',
    },
    {
      id: '3',
      subject: 'English',
      title: 'Shakespeare Literature',
      level: 'Lycée-2',
      type: 'lesson',
      resources: 15,
      link: 'drive.google.com/folder/...',
    },
    {
      id: '4',
      subject: 'Chemistry',
      title: 'Periodic Table & Elements',
      level: 'CEM-2',
      type: 'exam',
      resources: 10,
      link: 'drive.google.com/folder/...',
    },
    {
      id: '5',
      subject: 'Mathematics',
      title: 'Calculus Introduction',
      level: 'Lycée-1',
      type: 'lesson',
      resources: 20,
      link: 'drive.google.com/folder/...',
    },
    {
      id: '6',
      subject: 'Biology',
      title: 'Human Anatomy',
      level: 'Lycée-3',
      type: 'test',
      resources: 18,
      link: 'drive.google.com/folder/...',
    },
  ];

  const filteredLessons = selectedLevel === 'all' 
    ? lessons 
    : lessons.filter(l => l.level === selectedLevel);

  const levels = ['all', 'CEM-1', 'CEM-2', 'CEM-3', 'Lycée-1', 'Lycée-2', 'Lycée-3'];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lessons & Resources</h1>
        <p className="text-gray-600 mt-1">Access all your lessons, exams, and study materials</p>
      </div>

      {/* Subjects Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by Subject</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              className={`p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br ${subject.color}`}
            >
              <div className="text-4xl mb-2">{subject.icon}</div>
              <p className="font-semibold">{subject.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search lessons..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={20} className="text-gray-600" />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level === 'all' ? 'All Levels' : level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => {
          const subject = subjects.find(s => s.name === lesson.subject);
          return (
            <div
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson.id)}
              className={`bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer transform hover:scale-102 p-6 border-2 ${
                selectedLesson === lesson.id ? 'border-blue-600' : 'border-transparent'
              }`}
            >
              {/* Subject Header */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${subject?.color} text-white text-lg mb-4`}
              >
                {subject?.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{lesson.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{lesson.subject}</p>

              {/* Level Badge */}
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
                {lesson.level}
              </div>

              {/* Type Badges */}
              <div className="flex gap-2 mb-4">
                {lesson.type === 'lesson' && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Lesson</span>
                )}
                {lesson.type === 'test' && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Test</span>
                )}
                {lesson.type === 'exam' && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Exam</span>
                )}
              </div>

              {/* Stats */}
              <div className="text-sm text-gray-600 mb-4">
                <p>{lesson.resources} resources</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <a
                  href={`https://${lesson.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition font-medium text-sm"
                >
                  <Play size={16} />
                  Open
                </a>
                <button className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                  <Download size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
