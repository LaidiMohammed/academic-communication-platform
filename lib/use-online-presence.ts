'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface OnlineUser {
  userId: string;
  onlineAt: number;
}

export function useOnlinePresence(userId: string | null) {
  const [onlineUsers, setOnlineUsers] = useState<Map<string, number>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const isOnline = (targetUserId: string) => {
    const ts = onlineUsers.get(targetUserId);
    if (!ts) return false;
    // Consider online if presence was updated within the last 30 seconds
    return Date.now() - ts < 30000;
  };

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const newOnline = new Map<string, number>();
      for (const [key, presences] of Object.entries(state)) {
        (presences as any[]).forEach((p: any) => {
          newOnline.set(key, p.online_at || Date.now());
        });
      }
      setOnlineUsers(newOnline);
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      setOnlineUsers(prev => {
        const next = new Map(prev);
        (newPresences as any[]).forEach((p: any) => {
          next.set(key, p.online_at || Date.now());
        });
        return next;
      });
    });

    channel.on('presence', { event: 'leave' }, ({ key }) => {
      setOnlineUsers(prev => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: Date.now(),
        });
      }
    });

    channelRef.current = channel;

    // Heartbeat: re-track presence every 15 seconds
    const heartbeat = setInterval(() => {
      if (channelRef.current) {
        channelRef.current.track({
          user_id: userId,
          online_at: Date.now(),
        }).catch(() => {});
      }
    }, 15000);

    return () => {
      clearInterval(heartbeat);
      channel.untrack();
      channel.unsubscribe();
    };
  }, [userId]);

  return { onlineUsers, isOnline };
}
