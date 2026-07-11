'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export function useRealtimeConnection() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase.channel('system-status');
    channel
      .on('system', { event: 'disconnect' }, () => {
        setStatus('disconnected');
      })
      .on('system', { event: 'connect' }, () => {
        setStatus('connected');
      })
      .on('system', { event: 'error' }, () => {
        setStatus('error');
      });

    channel.subscribe((statusCode: string) => {
      if (statusCode === 'SUBSCRIBED') {
        setStatus('connected');
      } else if (statusCode === 'CHANNEL_ERROR') {
        setStatus('error');
      } else {
        setStatus('connecting');
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return status;
}
