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
  Eye,
  Copy,
  Trash2,
  MessageCircle,
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
  const [chatMode, setChatMode] = useState<'individual' | 'group'>('individual');

  const [chats, setChats] = useState([
    { id: 'chat-1', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', lastMessage: 'See you at the meeting!', time: '2m', unread: 2, online: true, type: 'individual' },
    { id: 'chat-2', name: 'Prof. Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=smith', lastMessage: 'Check the assignment', time: '1h', unread: 0, online: false, type: 'individual' },
    { id: 'chat-3', name: 'Alex Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', lastMessage: 'Thanks for helping!', time: '3h', unread: 1, online: true, type: 'individual' },
    { id: 'chat-4', name: 'Jessica Lee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jessica', lastMessage: "Let's grab coffee!", time: '2h', unread: 3, online: true, type: 'individual' },
    { id: 'chat-5', name: 'Michael Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael', lastMessage: 'Project deadline is tomorrow', time: '30m', unread: 0, online: false, type: 'individual' },
    { id: 'group-1', name: 'Math Study Circle', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=math', lastMessage: 'Has anyone solved problem 5?', time: '10m', unread: 5, online: false, type: 'group', members: 24 },
    { id: 'group-2', name: 'Physics Lab Notes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=physics', lastMessage: 'The experiment results are in', time: '1h', unread: 0, online: false, type: 'group', members: 18 },
    { id: 'group-3', name: 'English Literature', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=english', lastMessage: 'New chapter discussion', time: '3h', unread: 2, online: false, type: 'group', members: 32 },
  ]);

  const initialMessages: Record<string, any[]> = {
    'chat-1': [
      { id: 1, sender: 'Sarah', text: 'Hey! How are you?', time: '10:30', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', reactions: [], readBy: 1 },
      { id: 2, sender: 'You', text: 'Hi! Doing great!', time: '10:31', isOwn: true, readBy: 1 },
      { id: 3, sender: 'Sarah', text: 'Want to work on the project?', time: '10:32', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', reactions: [], readBy: 0 },
      { id: 4, sender: 'You', text: "Sure! Let's start tomorrow.", time: '10:33', isOwn: true, readBy: 1 },
      { id: 5, sender: 'Sarah', text: 'Perfect! See you at the meeting!', time: '10:35', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', reactions: [], readBy: 2 },
    ],
    'group-1': [
      { id: 1, sender: 'Alex', text: 'Has anyone solved problem 5?', time: '10:30', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
      { id: 2, sender: 'Jordan', text: 'Yes! The answer is 42', time: '10:35', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan' },
      { id: 3, sender: 'Sam', text: 'Can someone explain the steps?', time: '10:40', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam' },
      { id: 4, sender: 'You', text: 'I can help with that!', time: '10:45', isOwn: true },
    ],
  };

  const [messagesMap, setMessagesMap] = useState<Record<string, any[]>>(initialMessages);

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
    if (messageText.trim() && selectedChat) {
      const chatMessages = messagesMap[selectedChat] || [];
      const newMsg = {
        id: chatMessages.length + 1,
        sender: 'You',
        text: messageText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        readBy: 0,
      };
      setMessagesMap({ ...messagesMap, [selectedChat]: [...chatMessages, newMsg] });
      setMessageText('');
    }
  };

  const filteredChats = chats.filter(
    (chat) => chat.type === chatMode
  );

  const currentChat = chats.find((c) => c.id === selectedChat);
  const messages = selectedChat ? messagesMap[selectedChat] || [] : [];

  return (
    <div className="flex flex-1 min-h-0 bg-background">
      {/* Chat List - Sidebar */}
      <div className="w-full md:w-72 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-border">
          <h2 className="text-lg font-bold text-foreground mb-2">Messages</h2>
          <div className="flex gap-1 mb-2 bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setChatMode('individual')}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${chatMode === 'individual' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Individual
            </button>
            <button
              onClick={() => setChatMode('group')}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${chatMode === 'group' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Groups
            </button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition"
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
                className={`py-2.5 px-3 border-b border-border cursor-pointer transition-all ${
                  selectedChat === chat.id
                    ? 'bg-primary/10 border-l-2 border-l-primary'
                    : 'hover:bg-secondary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-shrink-0">
                    <img src={chat.avatar} alt={chat.name} className="w-9 h-9 rounded-full" />
                    {chat.type === 'individual' && chat.online && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-1">
                      <p className="text-sm font-semibold text-foreground truncate">{chat.name}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{chat.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                    {chat.type === 'group' && (
                      <p className="text-[10px] text-muted-foreground">{chat.members} members</p>
                    )}
                  </div>
                  {chat.unread > 0 && (
                    <div className="flex-shrink-0 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{chat.unread}</span>
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

      {/* Chat Window */}
      {selectedChat && currentChat ? (
        <div className="hidden md:flex flex-1 flex-col bg-card overflow-hidden animate-fade-scale">
          {/* Chat Header */}
          <div className="border-b border-border px-3 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <img src={currentChat.avatar} alt={currentChat.name} className="w-9 h-9 rounded-full" />
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{currentChat.name}</p>
                <p className="text-xs text-muted-foreground leading-tight">
                  {currentChat.type === 'group' ? `${currentChat.members} members` : currentChat.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary">
                <Phone size={18} strokeWidth={2} />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary">
                <Video size={18} strokeWidth={2} />
              </button>
              <button 
                onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                className={`p-1.5 rounded-lg transition text-foreground ${showDetailsPanel ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary hover:text-primary'}`}
              >
                <Info size={18} strokeWidth={2} />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary">
                <MoreVertical size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 flex flex-col">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.isOwn ? 'justify-end' : 'justify-start'} group`}
                onMouseEnter={() => setHoveredMessage(msg.id)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                {!msg.isOwn && (
                  <img src={msg.avatar} alt={msg.sender} className="w-7 h-7 rounded-full flex-shrink-0 self-end" />
                )}
                <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <div
                    onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                    className={`px-3 py-1.5 rounded-2xl break-words cursor-pointer text-sm ${
                      msg.isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary text-foreground rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-0.5 ${msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </p>
                  </div>

                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {msg.reactions.map((reaction, idx) => (
                        <div key={idx} className="text-xs bg-secondary rounded-full w-5 h-5 flex items-center justify-center">
                          {reaction}
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedMessage === msg.id && (
                    <div className="mt-1.5 p-2 bg-background border border-border rounded-lg text-xs w-44 animate-fade-scale">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Eye size={12} className="text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">
                          Read by {msg.readBy} {msg.readBy === 1 ? 'person' : 'people'}
                        </span>
                      </div>
                      <div className="flex gap-1.5 pt-1.5 border-t border-border">
                        <button className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition">
                          <Heart size={12} /> React
                        </button>
                        <button className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition">
                          <Copy size={12} /> Copy
                        </button>
                        {msg.isOwn && (
                          <button className="flex items-center gap-0.5 text-destructive hover:text-destructive/80 transition">
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {hoveredMessage === msg.id && !expandedMessage && (
                  <div className="flex items-center">
                    <button className="p-1 rounded-md hover:bg-secondary transition text-foreground">
                      <Heart size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-border px-3 py-2 shrink-0">
            <div className="flex items-end gap-2">
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
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Message..."
                className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition"
              />
              <button className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-accent shrink-0">
                <Mic size={18} strokeWidth={2} />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition active:scale-95 shrink-0"
              >
                <Send size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-card border-l border-border">
          <div className="text-center">
            <MessageCircle size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Select a chat to start messaging</p>
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
