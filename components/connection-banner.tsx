'use client';

import { useRealtimeConnection } from '@/lib/use-realtime-connection';
import type { ConnectionStatus } from '@/lib/use-realtime-connection';

const STATUS_CONFIG: Record<ConnectionStatus, { bg: string; text: string; label: string }> = {
  connected: { bg: '', text: '', label: '' },
  connecting: { bg: 'bg-yellow-500', text: 'text-white', label: 'Connecting...' },
  disconnected: { bg: 'bg-orange-500', text: 'text-white', label: 'Waiting for network...' },
  error: { bg: 'bg-red-500', text: 'text-white', label: 'Connection error. Trying to reconnect...' },
};

export function ConnectionBanner() {
  const status = useRealtimeConnection();

  if (status === 'connected') return null;

  const config = STATUS_CONFIG[status];

  return (
    <div className={`${config.bg} ${config.text} text-center text-xs font-semibold py-1.5 px-4 animate-pulse`}>
      {config.label}
    </div>
  );
}
