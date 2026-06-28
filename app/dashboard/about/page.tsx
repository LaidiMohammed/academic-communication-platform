'use client';

import { motion } from 'framer-motion';
import { Users, Zap, Shield, Globe, MapPin, Mail, Phone, Award, BookOpen, GraduationCap, Heart, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const stats = [
  { label: 'Active Students', value: '12,000+', icon: Users },
  { label: 'Study Groups', value: '850+', icon: BookOpen },
  { label: 'Courses Available', value: '340+', icon: GraduationCap },
  { label: 'Expert Teachers', value: '200+', icon: Award },
];

const features = [
  { icon: Users, title: 'Collaborate Seamlessly', description: 'Connect with classmates, teachers, and study groups in real-time across any device.' },
  { icon: Zap, title: 'AI-Powered Learning', description: 'Get instant help from our intelligent AI assistant trained on your curriculum 24/7.' },
  { icon: Globe, title: 'Organize Meetings', description: 'Schedule and join virtual classes with integrated video conferencing.' },
  { icon: Shield, title: 'Secure Platform', description: 'Your data is protected with enterprise-grade encryption and privacy controls.' },
];

const timeline = [
  { year: '2020', event: 'EduConnect founded by educators and engineers' },
  { year: '2021', event: 'Launched real-time chat and group collaboration' },
  { year: '2022', event: 'Integrated AI tutoring assistant' },
  { year: '2023', event: 'Reached 10,000 active students milestone' },
  { year: '2024', event: 'Added virtual classrooms and expanded globally' },
];

const team = [
  { name: 'Dr. Sarah Chen', role: 'CEO & Co-Founder', bio: 'Former professor with 15 years in edtech' },
  { name: 'Marcus Rivera', role: 'CTO & Co-Founder', bio: 'Full-stack architect, ex-Google engineer' },
  { name: 'Aisha Patel', role: 'Head of Education', bio: 'Curriculum designer, Ph.D. in Pedagogy' },
  { name: 'James O\'Brien', role: 'Lead Designer', bio: 'UX specialist focused on inclusive education' },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'mission' | 'story'>('mission');

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
          <Heart size={14} /> Empowering Education Since 2020
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          About{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">EduConnect</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          A modern school collaboration platform designed to revolutionize how students and teachers connect, learn, and grow together in the digital age.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#111827] border border-blue-500/20 rounded-xl p-5 text-center hover:border-blue-500/40 transition-all">
              <Icon className="mx-auto mb-2 text-blue-400" size={24} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          );
        })}
      </motion.div>

      {/* Mission / Story Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex gap-2 mb-6">
          {(['mission', 'story'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-[#1E293B] text-gray-400 hover:text-white border border-blue-500/10'
              }`}
            >
              {tab === 'mission' ? 'Our Mission' : 'Our Story'}
            </button>
          ))}
        </div>

        <div className="bg-[#111827] border border-blue-500/20 rounded-2xl p-8 md:p-12">
          {activeTab === 'mission' ? (
            <motion.div key="mission" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl">
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                We believe education should be accessible, engaging, and collaborative. EduConnect brings together all the tools you need to succeed in school — from real-time messaging and group collaboration to virtual meetings and personalized AI tutoring.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We&apos;re committed to creating a platform that empowers students to learn better and teachers to teach more effectively, breaking down barriers to quality education for every student, regardless of their background.
              </p>
            </motion.div>
          ) : (
            <motion.div key="story" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
              <div className="space-y-0 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-500/30">
                {timeline.map((item, i) => (
                  <div key={item.year} className="flex gap-6 pb-8 last:pb-0 relative">
                    <div className="relative z-10 flex-shrink-0 w-8 h-8 bg-[#111827] border-2 border-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    </div>
                    <div>
                      <span className="text-blue-400 font-bold text-sm">{item.year}</span>
                      <p className="text-gray-300 mt-1">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Features */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Choose EduConnect?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-[#111827] border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 hover:bg-blue-500/[0.03] transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Team */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Meet the Team</h2>
        <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
          Built by educators, engineers, and designers who believe in the power of technology to transform education.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-[#111827] border border-blue-500/20 rounded-xl p-6 text-center hover:border-blue-500/40 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {member.name.charAt(0)}
              </div>
              <h3 className="text-white font-bold">{member.name}</h3>
              <p className="text-blue-400 text-sm font-medium">{member.role}</p>
              <p className="text-gray-500 text-sm mt-2">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Map + Contact */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-[#111827] border border-blue-500/20 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Map */}
          <div className="h-[300px] lg:h-full min-h-[300px] bg-[#1E293B] relative">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=3.058%2C36.752%2C3.088%2C36.762&amp;layer=mapnik&amp;marker=36.757%2C3.073"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="EduConnect Location"
              className="grayscale opacity-80 hover:opacity-100 transition-opacity"
            />
            <div className="absolute top-4 left-4 bg-[#111827]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-500/20 flex items-center gap-2">
              <MapPin size={14} className="text-blue-400" />
              <span className="text-white text-sm font-medium">Algiers, Algeria</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-white mb-2">Get in Touch</h2>
            <p className="text-gray-400 mb-8">Have questions or feedback? We&apos;d love to hear from you.</p>

            <div className="space-y-5 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a href="mailto:support@educonnect.edu" className="text-white hover:text-blue-400 transition">support@educonnect.edu</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a href="tel:+213771234567" className="text-white hover:text-blue-400 transition">+213 (0) 771 23 45 67</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-white">42 Rue Didouche Mourad, Algiers 16000, Algeria</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:support@educonnect.edu"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-semibold shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                <Mail size={16} /> Email Us
              </a>
              <a
                href="#"
                className="flex items-center justify-center gap-2 px-6 py-2.5 border border-blue-500/20 text-gray-300 hover:text-white hover:bg-blue-500/10 rounded-lg font-semibold transition-all"
              >
                <ExternalLink size={16} /> Visit Website
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-blue-500/10 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} EduConnect. All rights reserved.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
