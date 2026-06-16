'use client';

import { useState } from 'react';
import {
  Send,
  Heart,
  Search,
  MoreVertical,
  Mic,
  Phone,
  Video,
  MessageCircle,
  Users,
  ChevronDown,
  Eye,
  Copy,
  Trash2,
} from 'lucide-react';
import { ChatInputWidget } from '@/components/chat-input-widget';

export function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>('chat-1');
  const [chatMode, setChatMode] = useState<'individual' | 'group'>('individual');
  const [messageText, setMessageText] = useState('');
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);

  const chats = [
    {
      id: 'chat-1',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      lastMessage: 'See you at the meeting!',
      time: '2m',
      unread: 2,
      online: true,
      type: 'individual',
    },
    {
      id: 'chat-2',
      name: 'Math Study Group',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=math',
      lastMessage: 'Who wants to solve the homework?',
      time: '5m',
      unread: 5,
      online: true,
      type: 'group',
    },
    {
      id: 'chat-3',
      name: 'Prof. Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=smith',
      lastMessage: 'Check the assignment',
      time: '1h',
      unread: 0,
      online: false,
      type: 'individual',
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'Sarah',
      text: 'Hey! How are you?',
      time: '10:30',
      isOwn: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      reactions: ['❤️'],
      readBy: 1,
    },
    { id: 2, sender: 'You', text: 'Hi! Doing great!', time: '10:31', isOwn: true },
    {
      id: 3,
      sender: 'Sarah',
      text: 'Want to work on the project?',
      time: '10:32',
      isOwn: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      reactions: [],
      readBy: 0,
    },
    { id: 4, sender: 'You', text: "Sure! Let's start tomorrow.", time: '10:33', isOwn: true, reactions: [] },
    {
      id: 5,
      sender: 'Sarah',
      text: 'Perfect! See you at the meeting!',
      time: '10:35',
      isOwn: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      reactions: ['🎉', '👍'],
      readBy: 2,
    },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText('');
    }
  };

  const currentChat = chats.find((c) => c.id === selectedChat);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Chat List */}
      <div className="w-full md:w-96 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Messages</h2>
            {/* Chat Mode Toggle */}
            <div className="flex items-center gap-2 bg-secondary rounded-full p-1">
              <button
                onClick={() => setChatMode('individual')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  chatMode === 'individual'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageCircle size={14} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setChatMode('group')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  chatMode === 'group'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
        </div>

        {/* Chats */}
        <div className="flex-1 overflow-y-auto">
          {chats
            .filter(
              (chat) =>
                (chatMode === 'individual' && chat.type === 'individual') ||
                (chatMode === 'group' && chat.type === 'group')
            )
            .map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-4 border-b border-border cursor-pointer transition-all animate-slide-in-left ${
                  selectedChat === chat.id
                    ? 'bg-primary/10 border-l-4 border-l-primary'
                    : 'hover:bg-secondary'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full"
                    />
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-card" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="font-semibold text-foreground">{chat.name}</p>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>

                  {chat.unread > 0 && (
                    <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-pulse-glow">
                      <span className="text-xs font-bold text-white">
                        {chat.unread}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat && currentChat && (
        <div className="hidden md:flex flex-1 flex-col animate-fade-scale">
          {/* Chat Header */}
          <div className="bg-card border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentChat.avatar}
                alt={currentChat.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold text-foreground">{currentChat.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentChat.online ? 'Active now' : 'Offline'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary">
                <Phone size={20} strokeWidth={2} />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary">
                <Video size={20} strokeWidth={2} />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary">
                <MoreVertical size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isOwn ? 'justify-end' : 'justify-start'} group animate-slide-in-up`}
                onMouseEnter={() => setHoveredMessage(msg.id)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                {!msg.isOwn && (
                  <img
                    src={msg.avatar}
                    alt={msg.sender}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                )}

                <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    onClick={() =>
                      setExpandedMessage(expandedMessage === msg.id ? null : msg.id)
                    }
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words cursor-pointer transition-all hover:shadow-md ${
                      msg.isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary text-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>

                  {/* Message Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {msg.reactions.map((reaction, idx) => (
                        <div
                          key={idx}
                          className="text-sm bg-secondary rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          {reaction}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedMessage === msg.id && (
                    <div className="mt-2 p-3 bg-card border border-border rounded-lg text-xs space-y-2 animate-expand-height">
                      <div className="flex items-center gap-2">
                        <Eye size={14} className="text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Read by {msg.readBy} {msg.readBy === 1 ? 'person' : 'people'}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition">
                          <Heart size={14} strokeWidth={2} />
                          React
                        </button>
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition">
                          <Copy size={14} strokeWidth={2} />
                          Copy
                        </button>
                        {msg.isOwn && (
                          <button className="flex items-center gap-1 text-destructive hover:text-destructive/80 transition">
                            <Trash2 size={14} strokeWidth={2} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Actions */}
                {hoveredMessage === msg.id && (
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded-md hover:bg-secondary transition text-foreground">
                      <Heart size={16} strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="bg-card border-t border-border p-4">
            <div className="flex items-end gap-3">
              <ChatInputWidget
                onSondage={() => console.log('Sondage')}
                onLocation={() => console.log('Location')}
                onFile={() => console.log('File')}
                onGenerateImage={() => console.log('Generate Image')}
              />

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
              />

              <button className="p-2 rounded-lg hover:bg-secondary transition text-foreground hover:text-accent">
                <Mic size={20} strokeWidth={2} />
              </button>

              <button
                onClick={handleSendMessage}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition active:scale-95"
              >
                <Send size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: No chat selected message */}
      {!selectedChat && (
        <div className="flex-1 hidden md:flex items-center justify-center bg-background">
          <div className="text-center">
            <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
