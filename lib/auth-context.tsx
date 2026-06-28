'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  school: string;
  level: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, school: string, level: string, role: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('schoolApp_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const adminEmails = ['hamda.laidi.14@gmail.com', 'hamada.laidi.14@gmail.com'];
    const isAdmin = adminEmails.includes(cleanEmail);
    localStorage.removeItem('schoolApp_user');
    const mockUser: User = {
      id: isAdmin ? 'admin-001' : Math.random().toString(),
      email: cleanEmail,
      name: isAdmin ? 'Hamda Laidi' : email.split('@')[0],
      school: 'Central High School',
      level: 'Grade 12',
      role: isAdmin ? 'admin' : 'student',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
    };
    setUser(mockUser);
    setIsLoggedIn(true);
    localStorage.setItem('schoolApp_user', JSON.stringify(mockUser));
  };

  const signup = async (email: string, password: string, name: string, school: string, level: string, role: string) => {
    const newUser: User = {
      id: Math.random().toString(),
      email,
      name,
      school,
      level,
      role: role as 'student' | 'teacher' | 'admin',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('schoolApp_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('schoolApp_user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('schoolApp_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
