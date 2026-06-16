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

const options = [
  { icon: MessageCircle, label: 'Poll', desc: 'Create a poll', color: 'text-blue-500', bg: 'from-blue-500/20 to-blue-600/10', iconBg: 'bg-blue-500/15' },
  { icon: MapPin, label: 'Location', desc: 'Share location', color: 'text-red-500', bg: 'from-red-500/20 to-red-600/10', iconBg: 'bg-red-500/15' },
  { icon: FileText, label: 'File', desc: 'Upload a file', color: 'text-amber-500', bg: 'from-amber-500/20 to-amber-600/10', iconBg: 'bg-amber-500/15' },
  { icon: Wand2, label: 'Image', desc: 'Generate with AI', color: 'text-purple-500', bg: 'from-purple-500/20 to-purple-600/10', iconBg: 'bg-purple-500/15' },
];

export function ChatInputWidget({ onSondage, onLocation, onFile, onGenerateImage }: ChatInputWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
          isOpen ? 'bg-red-500 text-white rotate-45 scale-110' : 'bg-primary text-primary-foreground hover:scale-105 active:scale-95'
        }`}>
        <Plus size={20} strokeWidth={2.5} />
      </button>
      {isOpen && (
        <div className="absolute bottom-16 left-0 animate-expand-height z-50">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-2 space-y-1 min-w-52 overflow-hidden">
            {options.map((opt, i) => {
              const Icon = opt.icon;
              const actions = [onSondage, onLocation, onFile, onGenerateImage];
              return (
                <button key={i} onClick={() => { actions[i]?.(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-secondary/80 hover:to-transparent transition text-left group">
                  <div className={`w-9 h-9 rounded-xl ${opt.iconBg} flex items-center justify-center group-hover:scale-110 transition`}>
                    <Icon size={18} className={opt.color} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                    <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
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
