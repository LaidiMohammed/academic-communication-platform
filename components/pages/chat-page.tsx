'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send, Heart, Search, MoreVertical, Mic, Phone, Video, Info,
  Eye, Copy, Trash2, MessageCircle, Smile, Reply, Forward,
  Image as ImageIcon, FileText, MapPin, Vote, ChevronDown,
  X, Download, ExternalLink, CheckCheck,
} from 'lucide-react';
import { ChatInputWidget } from '@/components/chat-input-widget';
import { ChatDetailsPanel } from '@/components/chat-details-panel';
import { EmojiPicker } from '@/components/emoji-picker';
import { motion, AnimatePresence } from 'framer-motion';

interface ReplyTo {
  id: number;
  text: string;
  sender: string;
}

interface FileInfo {
  name: string;
  size: string;
  url?: string;
}

interface Message {
  id: number;
  sender: string;
  text?: string;
  time: string;
  isOwn: boolean;
  avatar?: string;
  reactions?: string[];
  readBy?: number;
  replyTo?: ReplyTo;
  image?: string;
  file?: FileInfo;
  type: 'text' | 'image' | 'file' | 'poll' | 'location';
}

export function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [isChatMuted, setIsChatMuted] = useState(false);
  const [chatMode, setChatMode] = useState<'individual' | 'group'>('individual');
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [showForward, setShowForward] = useState<Message | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [sending, setSending] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const [chats, setChats] = useState([
    { id: 'chat-1', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', lastMessage: 'See you at the meeting!', time: '2m', unread: 2, online: true, type: 'individual' },
    { id: 'chat-2', name: 'Prof. Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=smith', lastMessage: 'Check the assignment', time: '1h', unread: 0, online: false, type: 'individual' },
    { id: 'chat-3', name: 'Alex Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', lastMessage: 'Thanks for helping!', time: '3h', unread: 1, online: true, type: 'individual' },
    { id: 'chat-4', name: 'Jessica Lee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jessica', lastMessage: "Let's grab coffee!", time: '2h', unread: 3, online: true, type: 'individual' },
    { id: 'chat-5', name: 'Michael Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael', lastMessage: 'Project deadline is tomorrow', time: '30m', unread: 0, online: false, type: 'individual' },
    { id: 'group-1', name: 'Math Study Circle', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=math', lastMessage: 'Has anyone solved problem 5?', time: '10m', unread: 5, type: 'group', members: 24 },
    { id: 'group-2', name: 'Physics Lab Notes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=physics', lastMessage: 'The experiment results are in', time: '1h', unread: 0, type: 'group', members: 18 },
    { id: 'group-3', name: 'English Literature', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=english', lastMessage: 'New chapter discussion', time: '3h', unread: 2, type: 'group', members: 32 },
  ]);

  const initialMessages: Record<string, Message[]> = {
    'chat-1': [
      { id: 1, sender: 'Sarah', text: 'Hey! How are you?', time: '10:30', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', reactions: [], readBy: 1, type: 'text' },
      { id: 2, sender: 'You', text: 'Hi! Doing great!', time: '10:31', isOwn: true, readBy: 1, type: 'text' },
      { id: 3, sender: 'Sarah', text: 'Want to work on the project?', time: '10:32', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', reactions: [], readBy: 0, type: 'text' },
      { id: 4, sender: 'You', text: "Sure! Let's start tomorrow.", time: '10:33', isOwn: true, readBy: 1, type: 'text' },
      { id: 5, sender: 'Sarah', text: 'Perfect! See you at the meeting!', time: '10:35', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', reactions: ['❤️'], readBy: 2, type: 'text' },
    ],
    'group-1': [
      { id: 1, sender: 'Alex', text: 'Has anyone solved problem 5?', time: '10:30', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', type: 'text' },
      { id: 2, sender: 'Jordan', text: 'Yes! The answer is 42', time: '10:35', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan', type: 'text' },
      { id: 3, sender: 'Sam', text: 'Can someone explain the steps?', time: '10:40', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam', type: 'text' },
      { id: 4, sender: 'You', text: 'I can help with that!', time: '10:45', isOwn: true, type: 'text' },
    ],
  };

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(initialMessages);

  useEffect(() => { setSelectedChat(null); setExpandedMessage(null); }, [chatMode]);
  useEffect(() => { scrollToBottom(); }, [messagesMap, selectedChat]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    setExpandedMessage(null);
    setReplyTo(null);
  };

  const getNextId = (chatId: string) => {
    const msgs = messagesMap[chatId] || [];
    return msgs.length > 0 ? Math.max(...msgs.map(m => m.id)) + 1 : 1;
  };

  const addMessage = (chatId: string, msg: Message) => {
    const chatMessages = messagesMap[chatId] || [];
    setMessagesMap({ ...messagesMap, [chatId]: [...chatMessages, msg] });
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setChats(chats.map(c => c.id === chatId ? { ...c, lastMessage: msg.text || (msg.type === 'image' ? '📷 Photo' : msg.type === 'file' ? '📎 File' : 'New message'), time: 'now', unread: 0 } : c));
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;
    const newMsg: Message = {
      id: getNextId(selectedChat),
      sender: 'You',
      text: messageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      readBy: 0,
      type: 'text',
      replyTo: replyTo || undefined,
    };
    addMessage(selectedChat, newMsg);
    setMessageText('');
    setReplyTo(null);
    setSending(true);
    setTimeout(() => setSending(false), 300);
    inputRef.current?.focus();
  };

  const handleCopy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const handleReact = (chatId: string, msgId: number, emoji: string) => {
    const msgs = messagesMap[chatId]?.map(m =>
      m.id === msgId ? { ...m, reactions: [...(m.reactions || []), emoji] } : m
    );
    setMessagesMap({ ...messagesMap, [chatId]: msgs });
  };

  const handleDelete = (chatId: string, msgId: number) => {
    const msgs = messagesMap[chatId]?.filter(m => m.id !== msgId);
    setMessagesMap({ ...messagesMap, [chatId]: msgs });
    setExpandedMessage(null);
  };

  const handleForward = (msg: Message) => setShowForward(msg);

  const doForward = (targetChatId: string) => {
    if (!showForward) return;
    const fwd: Message = { ...showForward, id: getNextId(targetChatId), isOwn: true, sender: 'You', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    addMessage(targetChatId, fwd);
    setShowForward(null);
  };

  const handlePollCreated = () => {
    if (!selectedChat || !pollQuestion.trim()) return;
    const opts = pollOptions.filter(o => o.trim());
    const newMsg: Message = {
      id: getNextId(selectedChat),
      sender: 'You',
      text: `📊 ${pollQuestion}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      type: 'poll',
    };
    addMessage(selectedChat, newMsg);
    setShowPollModal(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const handleLocationShared = () => {
    if (!selectedChat) return;
    const newMsg: Message = {
      id: getNextId(selectedChat),
      sender: 'You',
      text: '📍 Live location shared',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      type: 'location',
    };
    addMessage(selectedChat, newMsg);
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedChat || !e.target.files?.[0]) return;
    const f = e.target.files[0];
    const size = f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`;
    const newMsg: Message = {
      id: getNextId(selectedChat),
      sender: 'You',
      text: `📎 ${f.name}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      type: 'file',
      file: { name: f.name, size, url: URL.createObjectURL(f) },
    };
    addMessage(selectedChat, newMsg);
    e.target.value = '';
  };

  const handleImagePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedChat || !e.target.files?.[0]) return;
    const f = e.target.files[0];
    const url = URL.createObjectURL(f);
    const newMsg: Message = {
      id: getNextId(selectedChat),
      sender: 'You',
      text: '📷 Photo',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      type: 'image',
      image: url,
    };
    addMessage(selectedChat, newMsg);
    e.target.value = '';
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const filteredChats = chats.filter(c => c.type === chatMode);
  const currentChat = chats.find(c => c.id === selectedChat);
  const messages = selectedChat ? messagesMap[selectedChat] || [] : [];

  const reactionEmojis = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

  return (
    <div className="flex flex-1 min-h-0 bg-background">
      {/* Chat List */}
      <div className="w-full md:w-72 bg-card border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <h2 className="text-lg font-bold text-foreground mb-2">Messages</h2>
          <div className="flex gap-1 mb-2 bg-secondary rounded-lg p-0.5">
            <button onClick={() => setChatMode('individual')}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${chatMode === 'individual' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Individual</button>
            <button onClick={() => setChatMode('group')}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${chatMode === 'group' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Groups</button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => (
            <div key={chat.id} onClick={() => handleChatSelect(chat.id)}
              className={`py-2.5 px-3 border-b border-border cursor-pointer transition-all ${selectedChat === chat.id ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-secondary'}`}>
              <div className="flex items-center gap-2.5">
                <div className="relative flex-shrink-0">
                  <img src={chat.avatar} alt={chat.name} className="w-9 h-9 rounded-full" />
                  {chat.type === 'individual' && chat.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent rounded-full border-2 border-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-1">
                    <p className="text-sm font-semibold text-foreground truncate">{chat.name}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                  {chat.type === 'group' && <p className="text-[10px] text-muted-foreground">{chat.members} members</p>}
                </div>
                {chat.unread > 0 && (
                  <div className="flex-shrink-0 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{chat.unread}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat && currentChat ? (
        <div className="hidden md:flex flex-1 flex-col bg-card overflow-hidden">
          {/* Header */}
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
              <button className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary"><Phone size={18} /></button>
              <button className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary"><Video size={18} /></button>
              <button onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                className={`p-1.5 rounded-lg transition text-foreground ${showDetailsPanel ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary hover:text-primary'}`}>
                <Info size={18} />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary"><MoreVertical size={18} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 flex flex-col">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.isOwn ? 'justify-end' : 'justify-start'} group`}
                onMouseEnter={() => setHoveredMessage(msg.id)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                {!msg.isOwn && <img src={msg.avatar} alt={msg.sender} className="w-7 h-7 rounded-full flex-shrink-0 self-end" />}
                <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  {/* Reply indicator */}
                  {msg.replyTo && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-t-lg text-xs ${msg.isOwn ? 'bg-primary/20 text-primary-foreground' : 'bg-secondary/80 text-foreground'} mb-0.5 max-w-full`}>
                      <Reply size={10} className="shrink-0" />
                      <span className="truncate opacity-70">{msg.replyTo.sender}: {msg.replyTo.text}</span>
                    </div>
                  )}
                  {/* Message bubble */}
                  <div onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                    className={`px-3 py-1.5 rounded-2xl break-words cursor-pointer text-sm transition-all hover:shadow-sm ${
                      msg.isOwn ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-foreground rounded-bl-none'
                    } ${expandedMessage === msg.id ? 'shadow-md' : ''}`}
                  >
                    {msg.type === 'image' && msg.image && (
                      <img src={msg.image} alt="Shared" onClick={(e) => { e.stopPropagation(); setZoomImage(msg.image!); }}
                        className="rounded-lg max-w-full max-h-48 mb-1 cursor-pointer hover:opacity-90 transition" />
                    )}
                    {msg.type === 'file' && msg.file && (
                      <div onClick={(e) => { e.stopPropagation(); setPreviewFile(msg.file!); }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-background/20 cursor-pointer hover:bg-background/30 transition mb-1">
                        <FileText size={20} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{msg.file.name}</p>
                          <p className="text-[10px] opacity-70">{msg.file.size}</p>
                        </div>
                      </div>
                    )}
                    {msg.type === 'poll' && <Vote size={14} className="inline mr-1" />}
                    {msg.type === 'location' && <MapPin size={14} className="inline mr-1" />}
                    {msg.text && <p className={msg.type !== 'text' ? 'text-xs' : ''}>{msg.text}</p>}
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {msg.isOwn && msg.readBy && msg.readBy > 0 && <CheckCheck size={10} className="text-accent" />}
                      <p className={`text-[10px] ${msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                    </div>
                  </div>
                  {/* Reactions display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 -mb-1">
                      {[...new Set(msg.reactions)].map((r, i) => (
                        <span key={i} className="text-xs bg-background border border-border rounded-full px-1.5 py-0.5 shadow-sm">{r}</span>
                      ))}
                    </div>
                  )}
                  {/* Expanded actions */}
                  {expandedMessage === msg.id && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className={`mt-1 p-1.5 bg-background border border-border rounded-xl text-xs flex flex-wrap gap-0.5 shadow-lg ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                      {/* Quick reactions */}
                      {reactionEmojis.map(r => (
                        <button key={r} onClick={() => handleReact(selectedChat!, msg.id, r)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-secondary rounded-full text-base transition">{r}</button>
                      ))}
                      <div className="w-px h-5 bg-border mx-0.5 self-center" />
                      <button onClick={() => handleCopy(msg.text || '')} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground">
                        <Copy size={12} /> Copy
                      </button>
                      <button onClick={() => { setReplyTo({ id: msg.id, text: msg.text || '', sender: msg.sender }); setExpandedMessage(null); inputRef.current?.focus(); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground">
                        <Reply size={12} /> Reply
                      </button>
                      <button onClick={() => handleForward(msg)} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground">
                        <Forward size={12} /> Forward
                      </button>
                      {msg.isOwn && (
                        <button onClick={() => handleDelete(selectedChat!, msg.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-destructive/10 transition text-destructive">
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
                {/* Hover quick react */}
                {hoveredMessage === msg.id && !expandedMessage && (
                  <div className="flex items-center">
                    <button onClick={() => handleReact(selectedChat!, msg.id, '❤️')}
                      className="p-1 rounded-full hover:bg-secondary transition text-foreground text-base">❤️</button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply preview */}
          {replyTo && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 border-t border-border shrink-0">
              <Reply size={12} className="text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary">Replying to {replyTo.sender}</p>
                <p className="text-xs text-muted-foreground truncate">{replyTo.text}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground p-0.5">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-border px-3 pt-2 pb-2 shrink-0">
            <div className="flex items-end gap-1.5">
              <div className="relative">
                <button onClick={() => setShowEmoji(!showEmoji)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary shrink-0">
                  <Smile size={22} />
                </button>
                {showEmoji && <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />}
              </div>
              <ChatInputWidget
                onSondage={() => setShowPollModal(true)}
                onLocation={handleLocationShared}
                onFile={() => fileInputRef.current?.click()}
                onGenerateImage={() => {
                  const imgInput = document.createElement('input');
                  imgInput.type = 'file';
                  imgInput.accept = 'image/*';
                  imgInput.onchange = (e: any) => handleImagePicked(e);
                  imgInput.click();
                }}
              />
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePicked} />
              <div className="flex-1 relative">
                <input ref={inputRef} type="text" value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Message..." autoFocus
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition" />
              </div>
              <button className="self-center p-2 rounded-xl hover:bg-secondary transition text-foreground hover:text-accent shrink-0 -mb-1">
                <Mic size={22} />
              </button>
              <motion.button onClick={handleSendMessage}
                whileTap={{ scale: 0.9 }}
                animate={sending ? { x: [0, 4, -4, 2, -2, 0] } : {}}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:shadow-md transition shrink-0">
                <motion.div animate={sending ? { rotate: [0, -15, 15, 0], y: [0, -2, 0] } : {}} transition={{ duration: 0.4 }}>
                  <Send size={18} />
                </motion.div>
              </motion.button>
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
        <ChatDetailsPanel isOpen={showDetailsPanel} onClose={() => setShowDetailsPanel(false)}
          chatName={currentChat.name} chatAvatar={currentChat.avatar} online={'online' in currentChat ? currentChat.online : false}
          isMuted={isChatMuted} onMute={() => setIsChatMuted(!isChatMuted)}
          onChangeNickname={() => {}} onBlock={() => {}} onDelete={() => { setSelectedChat(null); setShowDetailsPanel(false); }} />
      )}

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center"
            onClick={() => setZoomImage(null)}>
            <motion.img initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}
              src={zoomImage} alt="Zoom" className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl" />
            <button onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = zoomImage; a.download = 'image.png'; a.click(); }}
              className="absolute bottom-8 right-8 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition shadow-lg">
              <Download size={22} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setZoomImage(null); }}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewFile(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileText size={24} className="text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{previewFile.name}</p>
                  <p className="text-xs text-muted-foreground">{previewFile.size}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPreviewFile(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition text-sm">Close</button>
                <button onClick={() => { alert(`Downloading ${previewFile.name}...`); setPreviewFile(null); }}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition text-sm flex items-center justify-center gap-2">
                  <Download size={14} /> Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Poll Creation Modal */}
      <AnimatePresence>
        {showPollModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPollModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full border border-border shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-lg font-semibold text-foreground">Create Poll</h4>
                <button onClick={() => setShowPollModal(false)} className="p-1 rounded-lg hover:bg-secondary transition text-muted-foreground">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Question</label>
                  <input type="text" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Ask something..." autoFocus
                    className="w-full px-3 py-2 text-sm rounded-xl bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Options</label>
                  <div className="space-y-2">
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="text" value={opt} onChange={(e) => {
                          const newOpts = [...pollOptions];
                          newOpts[i] = e.target.value;
                          setPollOptions(newOpts);
                        }} placeholder={`Option ${i + 1}`}
                          className="flex-1 px-3 py-2 text-sm rounded-xl bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition" />
                        {pollOptions.length > 2 && (
                          <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                            className="text-muted-foreground hover:text-destructive transition p-1">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPollOptions([...pollOptions, ''])}
                    className="mt-2 text-xs text-primary hover:text-primary/80 transition font-medium">
                    + Add option
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                <button onClick={() => setShowPollModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border text-foreground hover:bg-secondary transition text-sm">Cancel</button>
                <button onClick={handlePollCreated}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition text-sm font-semibold">Send Poll</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forward Modal */}
      <AnimatePresence>
        {showForward && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForward(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-2xl">
              <h4 className="text-lg font-semibold text-foreground mb-4">Forward Message</h4>
              <p className="text-xs text-muted-foreground mb-3">Select a chat to forward to:</p>
              <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
                {chats.filter(c => c.id !== selectedChat).map(chat => (
                  <button key={chat.id} onClick={() => doForward(chat.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary transition text-sm text-foreground">
                    <img src={chat.avatar} alt={chat.name} className="w-8 h-8 rounded-full" />
                    <span className="truncate">{chat.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowForward(null)}
                className="w-full px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition text-sm">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
