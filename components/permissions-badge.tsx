'use client';

import { Globe, Users, Lock, Key } from 'lucide-react';

interface PermissionsBadgeProps {
  type: 'public' | 'private' | 'invite-only' | 'restricted';
  size?: 'sm' | 'md' | 'lg';
}

export function PermissionsBadge({ type, size = 'md' }: PermissionsBadgeProps) {
  const config = {
    public: {
      icon: Globe,
      label: 'Public',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    private: {
      icon: Lock,
      label: 'Private',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    'invite-only': {
      icon: Key,
      label: 'Invite Only',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-700 dark:text-purple-300',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    restricted: {
      icon: Users,
      label: 'Restricted',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
  };

  const current = config[type];
  const Icon = current.icon;
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };
  const iconSize = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full border ${current.bgColor} ${current.textColor} ${current.borderColor} font-medium`}
    >
      <Icon size={iconSize[size]} strokeWidth={2.5} />
      <span>{current.label}</span>
    </div>
  );
}
