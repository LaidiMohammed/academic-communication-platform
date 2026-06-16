'use client';

import { useState } from 'react';
import {
  Plus,
  MessageCircle,
  MapPin,
  FileText,
  Wand2,
  X,
} from 'lucide-react';

interface ChatInputWidgetProps {
  onSondage?: () => void;
  onLocation?: () => void;
  onFile?: () => void;
  onGenerateImage?: () => void;
}

export function ChatInputWidget({
  onSondage,
  onLocation,
  onFile,
  onGenerateImage,
}: ChatInputWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    {
      icon: MessageCircle,
      label: 'Sondage',
      description: 'Create a poll',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      action: onSondage,
    },
    {
      icon: MapPin,
      label: 'Localisation',
      description: 'Share location',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      action: onLocation,
    },
    {
      icon: FileText,
      label: 'Fichier',
      description: 'Upload file',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      action: onFile,
    },
    {
      icon: Wand2,
      label: 'Génère Image',
      description: 'Generate image',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      action: onGenerateImage,
    },
  ];

  return (
    <div className="relative">
      {/* Plus Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
          isOpen
            ? 'bg-red-500 text-white scale-110'
            : 'bg-primary text-primary-foreground hover:scale-105 active:scale-95'
        }`}
      >
        {isOpen ? (
          <X size={20} strokeWidth={2.5} />
        ) : (
          <Plus size={20} strokeWidth={2.5} />
        )}
      </button>

      {/* Options Panel */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 animate-expand-height">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-3 space-y-2 min-w-56">
            {options.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    option.action?.();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-102 active:scale-98 ${option.bgColor} group`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-slate-800 ${option.color} group-hover:shadow-md transition-all`}
                  >
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">
                      {option.label}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
