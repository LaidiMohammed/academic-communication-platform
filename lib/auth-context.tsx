'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, school: string, level: string, role: string) => Promise<{ needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAccessToken(): string | null {
  const params = new URLSearchParams(window.location.hash.replace('#', ''));
  const hashToken = params.get('access_token');
  if (hashToken) return hashToken;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('sb-') && key.endsWith('-auth-token')) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '{}');
        return item.access_token || null;
      } catch {}
    }
  }
  return null;
}

async function fetchProfileApi(): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new Error('No access token');
  const res = await fetch('/api/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    try { const j = JSON.parse(text); throw new Error(j.error || 'Profile fetch failed'); }
    catch { throw new Error(text); }
  }
  return res.json();
}

async function updateProfileApi(updates: any): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new Error('No access token');
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const text = await res.text();
    try { const j = JSON.parse(text); throw new Error(j.error || 'Profile update failed'); }
    catch { throw new Error(text); }
  }
  return res.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser: SupabaseUser) => {
    try {
      const data = await fetchProfileApi();
      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        school: data.school || '',
        level: data.level || '',
        avatar: data.avatar || '',
        role: data.role || 'student',
      });
    } catch (err) {
      console.error('Profile fetch error via API, falling back to metadata:', err);
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: (authUser.user_metadata?.name as string) || authUser.email?.split('@')[0] || 'User',
        school: '',
        level: '',
        avatar: '',
        role: (authUser.user_metadata?.role as string) as 'student' | 'teacher' | 'admin' || 'student',
      });
    }
    setIsLoggedIn(true);
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session?.user) {
      await fetchProfile(data.session.user);
    }
  };

  const signup = async (email: string, password: string, name: string, school: string, level: string, role: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, school, level, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    if (data.session?.user) {
      await fetchProfile(data.session.user);
      return { needsEmailConfirmation: false };
    }
    return { needsEmailConfirmation: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const data = await updateProfileApi(updates);
    setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, signup, logout, updateProfile }}>
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
