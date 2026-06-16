'use client';

import { useState, useEffect } from 'react';
import {
  Send,
  Heart,
  Search,
  MoreVertical,
  Mic,
  Phone,
  Video,
  Info,
} from 'lucide-react';
import { ChatInputWidget } from '@/components/chat-input-widget';
import { ChatDetailsPanel } from '@/components/chat-details-panel';

export function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [isChatMuted, setIsChatMuted] = useState(false);

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
      name: 'Prof. Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=smith',
      lastMessage: 'Check the assignment',
      time: '1h',
      unread: 0,
      online: false,
      type: 'individual',
    },
    {
      id: 'chat-3',
      name: 'Alex Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      lastMessage: 'Thanks for helping!',
      time: '3h',
      unread: 1,
      online: true,
      type: 'individual',
    },
    {
      id: 'chat-4',
      name: 'Jessica Lee',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jessica',
      lastMessage: 'Let&apos;s grab coffee!',
      time: '2h',
      unread: 3,
      online: true,
      type: 'individual',
    },
    {
      id: 'chat-5',
      name: 'Michael Brown',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
      lastMessage: 'Project deadline is tomorrow',
      time: '30m',
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
      reactions: [],
      readBy: 1,
    },
    { 
      id: 2, 
      sender: 'You', 
      text: 'Hi! Doing great!', 
      time: '10:31', 
      isOwn: true,
      readBy: 1,
    },
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
    { 
      id: 4, 
      sender: 'You', 
      text: "Sure! Let's start tomorrow.", 
      time: '10:33', 
      isOwn: true,
      readBy: 1,
    },
    {
      id: 5,
      sender: 'Sarah',
      text: 'Perfect! See you at the meeting!',
      time: '10:35',
      isOwn: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      reactions: [],
      readBy: 2,
    },
  ];

  // Reset selected chat and expanded message when mode changes
  useEffect(() => {
    setSelectedChat(null);
    setExpandedMessage(null);
  }, [chatMode]);

  // Reset expanded message when chat changes
  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    setExpandedMessage(null);
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText('');
    }
  };

  const filteredChats = chats.filter(
    (chat) => chat.type === 'individual'
  );

  const currentChat = chats.find((c) => c.id === selectedChat);

  return (
    <div className="flex h-full bg-background">
      {/* Chat List - Sidebar */}
      <div className="w-full md:w-80 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Messages</h2>
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

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
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
            ))
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p>No chats</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window - Full Width */}
      {selectedChat && currentChat ? (
        <div className="hidden md:flex flex-1 flex-col bg-card overflow-hidden border-l border-border animate-fade-scale">
          {/* Chat Header */}
          <div className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
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
              <button 
                onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                className={`p-2 rounded-lg transition text-foreground ${showDetailsPanel ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary hover:text-primary'}`}
              >
                <Info size={20} strokeWidth={2} />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary">
                <MoreVertical size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
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

                <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'} max-w-sm`}>
                  {/* Message Bubble */}
                  <div
                    onClick={() => {
                      setExpandedMessage(expandedMessage === msg.id ? null : msg.id);
                    }}
                    className={`px-4 py-2 rounded-2xl break-words cursor-pointer transition-all hover:shadow-md ${
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
                    <div className="mt-2 p-3 bg-background border border-border rounded-lg text-xs space-y-2 w-48 animate-fade-scale">
                      <div className="flex items-center gap-2">
                        <Eye size={14} className="text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          Read by {msg.readBy} {msg.readBy === 1 ? 'person' : 'people'}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-border flex-wrap">
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition whitespace-nowrap">
                          <Heart size={14} strokeWidth={2} />
                          React
                        </button>
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition whitespace-nowrap">
                          <Copy size={14} strokeWidth={2} />
                          Copy
                        </button>
                        {msg.isOwn && (
                          <button className="flex items-center gap-1 text-destructive hover:text-destructive/80 transition whitespace-nowrap">
                            <Trash2 size={14} strokeWidth={2} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Actions */}
                {hoveredMessage === msg.id && !expandedMessage && (
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
          <div className="bg-card border-t border-border p-4 sticky bottom-0">
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

              <button className="p-2 rounded-lg hover:bg-secondary transition text-foreground hover:text-accent flex-shrink-0">
                <Mic size={20} strokeWidth={2} />
              </button>

              <button
                onClick={handleSendMessage}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition active:scale-95 flex-shrink-0"
              >
                <Send size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-card rounded-lg border border-border">
          <div className="text-center">
            <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        </div>
      )}

      {/* Chat Details Panel */}
      {selectedChat && currentChat && (
        <ChatDetailsPanel
          isOpen={showDetailsPanel}
          onClose={() => setShowDetailsPanel(false)}
          chatName={currentChat.name}
          chatAvatar={currentChat.avatar}
          online={currentChat.online}
          isMuted={isChatMuted}
          onMute={() => setIsChatMuted(!isChatMuted)}
          onChangeNickname={() => console.log('Change nickname')}
          onBlock={() => console.log('Block user')}
          onDelete={() => {
            setSelectedChat(null);
            setShowDetailsPanel(false);
          }}
        />
      )}
    </div>
  );
}
