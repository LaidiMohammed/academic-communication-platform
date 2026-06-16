'use client';

import { Users, Zap, Shield, Globe } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Users,
      title: 'Collaborate Seamlessly',
      description: 'Connect with classmates, teachers, and study groups in real-time',
    },
    {
      icon: Zap,
      title: 'AI-Powered Learning',
      description: 'Get instant help from our intelligent AI assistant 24/7',
    },
    {
      icon: Globe,
      title: 'Organize Meetings',
      description: 'Schedule and join virtual classes with integrated Google Meet',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security',
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">EduConnect</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A modern school collaboration platform designed to revolutionize how students and teachers connect, learn, and grow together.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          We believe education should be accessible, engaging, and collaborative. EduConnect brings together all the tools you need to succeed in school—from real-time messaging and group collaboration to virtual meetings and personalized AI tutoring. We&apos;re committed to creating a platform that empowers students to learn better and teachers to teach more effectively.
        </p>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose EduConnect?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
        <p className="text-lg mb-6 opacity-90">Have questions or feedback? We&apos;d love to hear from you!</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:support@educonnect.edu"
            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition"
          >
            Email Us
          </a>
          <a
            href="#"
            className="px-6 py-2 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
          >
            Visit Website
          </a>
        </div>
      </div>

      {/* Team */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Built by Educators</h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          EduConnect was created by a team of educators, developers, and designers who believe in the power of technology to transform education.
        </p>
      </div>
    </div>
  );
}
