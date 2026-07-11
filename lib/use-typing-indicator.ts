'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

const TYPING_TIMEOUT = 3000;
const TYPING_HEARTBEAT = 2000;

interface TypingUser {
  userId: string;
  name: string;
}

export function useTypingIndicator(chatId: string | null, currentUserId: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Broadcast typing status
  const broadcastTyping = useCallback(() => {
    if (!channelRef.current || !chatId) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId, timestamp: Date.now() },
    });
  }, [chatId, currentUserId]);

  // Start typing heartbeat
  const startTyping = useCallback(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    broadcastTyping();
    heartbeatRef.current = setInterval(broadcastTyping, TYPING_HEARTBEAT);
  }, [broadcastTyping]);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (channelRef.current && chatId) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing_stop',
        payload: { userId: currentUserId },
      });
    }
  }, [chatId, currentUserId]);

  useEffect(() => {
    if (!chatId) return;

    const supabase = createClient();
    const channel = supabase.channel(`chat:${chatId}:typing`);

    channel.on('broadcast', { event: 'typing' }, (payload: any) => {
      const { userId, timestamp } = payload;
      if (userId === currentUserId) return;

      // Clear existing timer for this user
      if (typingTimersRef.current.has(userId)) {
        clearTimeout(typingTimersRef.current.get(userId)!);
      }

      setTypingUsers(prev => {
        if (prev.find(u => u.userId === userId)) return prev;
        return [...prev, { userId, name: '' }];
      });

      // Auto-remove after timeout
      const timer = setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u.userId !== userId));
        typingTimersRef.current.delete(userId);
      }, TYPING_TIMEOUT);
      typingTimersRef.current.set(userId, timer);
    });

    channel.on('broadcast', { event: 'typing_stop' }, (payload: any) => {
      const { userId } = payload;
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
      if (typingTimersRef.current.has(userId)) {
        clearTimeout(typingTimersRef.current.get(userId)!);
        typingTimersRef.current.delete(userId);
      }
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      stopTyping();
      channel.unsubscribe();
      typingTimersRef.current.forEach(timer => clearTimeout(timer));
      typingTimersRef.current.clear();
    };
  }, [chatId, currentUserId, stopTyping]);

  return { typingUsers, startTyping, stopTyping };
}
