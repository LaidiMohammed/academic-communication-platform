'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold">B</span>
            </div>
            <span>Bendella</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#home" className="text-white/80 hover:text-white transition text-sm font-medium">
              Home
            </Link>
            <Link href="#features" className="text-white/80 hover:text-white transition text-sm font-medium">
              Features
            </Link>
            <Link href="#about" className="text-white/80 hover:text-white transition text-sm font-medium">
              About
            </Link>
            <Link href="#pricing" className="text-white/80 hover:text-white transition text-sm font-medium">
              Pricing
            </Link>
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2 text-white font-medium text-sm hover:text-white/80 transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-white text-blue-600 font-medium text-sm rounded-full hover:bg-white/90 transition"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-3">
            <Link href="#home" className="text-white/80 text-sm font-medium">
              Home
            </Link>
            <Link href="#features" className="text-white/80 text-sm font-medium">
              Features
            </Link>
            <Link href="#about" className="text-white/80 text-sm font-medium">
              About
            </Link>
            <Link href="#pricing" className="text-white/80 text-sm font-medium">
              Pricing
            </Link>
            <div className="flex gap-2 pt-2">
              <Link
                href="/login"
                className="flex-1 px-4 py-2 text-white font-medium text-sm text-center hover:text-white/80 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex-1 px-4 py-2 bg-white text-blue-600 font-medium text-sm text-center rounded-full hover:bg-white/90 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
