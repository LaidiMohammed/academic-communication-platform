'use client';

import { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
}

export function Avatar({ src, name, className = 'w-10 h-10 rounded-full' }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  if (showFallback) {
    return (
      <div
        className={`${className} bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0`}
        title={name}
      >
        {name?.charAt(0)?.toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
