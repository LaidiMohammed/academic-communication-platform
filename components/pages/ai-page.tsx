'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Zap, MessageCircle, History, PanelRightClose, Star, ImagePlus, Camera, X, Trash2, Edit3, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  images?: string[];
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationFull extends Conversation {
  messages: ChatMessage[];
}

let cachedToken: string | null = null;

async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  cachedToken = session?.access_token || null;
  return cachedToken;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export function AIPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cachedToken = null;
    getToken();
  }, [user]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    setLoadingConvs(true);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/ai/conversations', { headers });
      const data = await res.json();
      if (data.data) setConversations(data.data);
    } catch {
      // Silent
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/ai/conversations/${convId}`, { headers });
      const data = await res.json();
      if (data.data) {
        setMessages(data.data.messages || []);
        setActiveConversationId(data.data.id);
      }
    } catch {
      // Silent
    }
  };

  const createConversation = async () => {
    if (!user) return;
    setMessages([]);
    setActiveConversationId(null);
  };

  const startNewChat = async () => {
    if (!user) return;
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'New Chat' }),
      });
      const data = await res.json();
      if (data.data) {
        setConversations(prev => [data.data, ...prev]);
        setActiveConversationId(data.data.id);
        setMessages([]);
      }
    } catch {
      // Silent
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const headers = await authHeaders();
      await fetch(`/api/ai/conversations/${id}`, { method: 'DELETE', headers });
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch {
      // Silent
    }
  };

  const renameConversation = async (id: string) => {
    if (!editValue.trim()) { setEditingTitle(null); return; }
    try {
      const headers = await authHeaders();
      await fetch(`/api/ai/conversations/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ title: editValue.trim() }),
      });
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editValue.trim() } : c));
      setEditingTitle(null);
    } catch {
      // Silent
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setPendingImages(prev => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePendingImage = (idx: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const ensureConversation = async (): Promise<string | null> => {
    if (!user) return null;
    if (activeConversationId) return activeConversationId;
    const headers = await authHeaders();
    const res = await fetch('/api/ai/conversations', {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: 'New Chat' }),
    });
    const data = await res.json();
    if (data.data) {
      setConversations(prev => [data.data, ...prev]);
      setActiveConversationId(data.data.id);
      return data.data.id;
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && pendingImages.length === 0) return;
    if (!user) return;

    const convId = await ensureConversation();
    if (!convId) return;

    const userMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      role: 'user',
      text: inputValue,
      images: pendingImages.length > 0 ? [...pendingImages] : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setPendingImages([]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        text: m.text,
        images: m.images,
      }));
      history.push({
        role: 'user',
        text: userMsg.text,
        images: userMsg.images,
      });

      const headers = await authHeaders();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: history,
          conversationId: convId,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');

      const botMsg: ChatMessage = {
        id: 'temp-' + (Date.now() + 1),
        role: 'assistant',
        text: data.reply,
      };
      setMessages(prev => [...prev, botMsg]);
      loadConversations();
    } catch (err: any) {
      const botMsg: ChatMessage = {
        id: 'temp-' + (Date.now() + 1),
        role: 'assistant',
        text: `Error: ${err.message}. Please check your connection and try again.`,
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^[a-z]*\n/, '').trim();
        const lang = part.slice(3).split('\n')[0].trim();
        return (
          <div key={i} className="relative my-2 group">
            {lang && <div className="text-[10px] px-3 py-1 bg-blue-500/20 text-blue-300 rounded-t-lg border-b border-blue-500/20 font-mono">{lang}</div>}
            <pre className="bg-black/40 rounded-lg p-3 overflow-x-auto text-sm font-mono leading-relaxed border border-blue-500/10">
              <code>{code}</code>
            </pre>
            <button onClick={() => copyCode(code)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs">
              Copy
            </button>
          </div>
        );
      }
      if (part.trim()) {
        const lines = part.split('\n').filter(l => l.trim());
        return lines.map((line, j) => {
          if (line.startsWith('## ')) return <h2 key={`${i}-${j}`} className="text-lg font-bold text-blue-300 mt-4 mb-2">{line.slice(3)}</h2>;
          if (line.startsWith('### ')) return <h3 key={`${i}-${j}`} className="text-base font-bold text-blue-200 mt-3 mb-1">{line.slice(4)}</h3>;
          if (line.startsWith('- **')) {
            const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
            if (match) return <p key={`${i}-${j}`} className="text-sm my-1"><strong className="text-blue-200">{match[1]}:</strong><span className="text-gray-300"> {match[2]}</span></p>;
          }
          if (line.startsWith('- ')) return <p key={`${i}-${j}`} className="text-sm my-1 text-gray-300">• {line.slice(2)}</p>;
          if (line.match(/^\d+\.\s/)) return <p key={`${i}-${j}`} className="text-sm my-1 text-gray-300">{line}</p>;
          return <p key={`${i}-${j}`} className="text-sm leading-relaxed my-1 text-gray-200">{line}</p>;
        });
      }
      return null;
    });
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-blue-400 animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Please log in to use AI Assistant</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full min-h-0 bg-background">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed md:relative inset-y-0 left-0 z-50 md:z-auto w-72 bg-card border-r border-border flex flex-col shrink-0">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Zap size={20} className="text-blue-400" />
                  AI Assistant
                </h2>
                <button onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-blue-500/10 transition text-gray-400 hover:text-blue-400">
                  <PanelRightClose size={16} />
                </button>
              </div>
              <button onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition text-sm font-semibold">
                <Plus size={15} /> New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-2 mb-2">Conversations</p>
              {loadingConvs ? (
                <div className="flex justify-center py-4"><Loader2 size={16} className="text-blue-400 animate-spin" /></div>
              ) : conversations.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <motion.div key={conv.id} whileHover={{ x: 4 }}
                    className={`px-3 py-2 rounded-lg cursor-pointer transition group ${activeConversationId === conv.id ? 'bg-blue-500/15' : 'hover:bg-blue-500/10'}`}>
                    {editingTitle === conv.id ? (
                      <div className="flex gap-1">
                        <input value={editValue} onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && renameConversation(conv.id)}
                          className="flex-1 text-xs px-1.5 py-0.5 rounded bg-[#1E293B] border border-blue-500/30 text-white focus:outline-none"
                          autoFocus onBlur={() => renameConversation(conv.id)} />
                        <button onMouseDown={() => renameConversation(conv.id)} className="p-0.5 text-blue-400"><Check size={12} /></button>
                      </div>
                    ) : (
                      <div onClick={() => loadMessages(conv.id)} className="flex items-center gap-2">
                        <MessageCircle size={13} className="text-gray-500 group-hover:text-blue-400 transition shrink-0" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition truncate flex-1">{conv.title}</span>
                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <button onClick={(e) => { e.stopPropagation(); setEditingTitle(conv.id); setEditValue(conv.title); }}
                            className="p-0.5 rounded hover:bg-blue-500/20 text-gray-400 hover:text-blue-300"><Edit3 size={11} /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                            className="p-0.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"><Trash2 size={11} /></button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-border">
              <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl text-center">
                <Star size={16} className="text-blue-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-blue-300">Upgrade to Premium</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Unlock 15+ advanced features</p>
              </motion.div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background/80 backdrop-blur-sm shrink-0 sticky top-0 z-10">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-blue-500/10 transition text-gray-400 hover:text-blue-400">
                <History size={16} />
              </button>
            )}
            <Zap size={18} className="text-blue-400" />
            <h1 className="text-sm font-bold text-foreground">AI Learning Assistant</h1>
            <span className="text-[10px] text-muted-foreground bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 hidden sm:inline">Powered by Groq</span>
          </div>

          <div className="px-3 md:px-4 py-4">
            {messages.length === 0 && !activeConversationId ? (
              <div className="h-full flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Zap size={48} className="mx-auto text-blue-400/50 mb-4" />
                  <p className="text-gray-400 text-sm mb-3">Start a new conversation or pick one from history</p>
                  <button onClick={startNewChat}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition text-sm font-semibold shadow-lg">
                    <Plus size={16} className="inline mr-1" /> New Chat
                  </button>
                </div>
              </div>
            ) : messages.length === 0 && activeConversationId ? (
              <div className="h-full flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <MessageCircle size={36} className="mx-auto text-blue-400/40 mb-3" />
                  <p className="text-gray-400 text-sm">Send a message to start the conversation</p>
                </div>
              </div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-4">
                {messages.map((msg) => (
                  <motion.div key={msg.id} variants={item}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-lg px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white rounded-2xl rounded-br-none shadow-lg shadow-blue-500/20'
                        : 'bg-[#1E293B] border border-blue-500/10 text-gray-200 rounded-2xl rounded-bl-none'
                    }`}>
                      {msg.images && msg.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {msg.images.map((img, i) => (
                            <img key={i} src={img} alt={`Image ${i + 1}`} className="max-w-[200px] max-h-[200px] rounded-lg object-contain border border-blue-500/20" />
                          ))}
                        </div>
                      )}
                      <div className="text-sm leading-relaxed">{formatContent(msg.text)}</div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-[#1E293B] border border-blue-500/10 px-4 py-3 rounded-2xl rounded-bl-none">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                            className="w-2 h-2 bg-blue-400 rounded-full" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </div>
        </div>

        {messages.length <= 1 && activeConversationId && (
          <div className="px-3 md:px-4 pb-2 shrink-0">
            <p className="text-xs font-semibold text-gray-400 mb-2">Quick Questions</p>
            <div className="flex flex-wrap gap-2">
              {['Explain photosynthesis', 'Solve x²-4=0', 'French Revolution summary', 'Help with essay'].map((q, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                  onClick={() => setInputValue(q)}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition text-xs font-medium">
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {pendingImages.length > 0 && (
          <div className="px-3 md:px-4 pb-2 shrink-0">
            <div className="flex gap-2 overflow-x-auto py-1">
              {pendingImages.map((img, i) => (
                <div key={i} className="relative shrink-0">
                  <img src={img} alt={`Preview ${i}`} className="h-16 w-16 rounded-lg object-cover border border-blue-500/30" />
                  <button onClick={() => removePendingImage(i)}
                    className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-500 text-white hover:bg-red-400 transition">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-3 md:px-4 pb-3 pt-1 shrink-0">
          <div className="flex gap-2">
            <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            <motion.button onClick={() => fileInputRef.current?.click()} disabled={isLoading}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-[#1E293B] border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition disabled:opacity-50">
              <ImagePlus size={18} />
            </motion.button>
            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageUpload} className="hidden" />
            <motion.button onClick={() => cameraInputRef.current?.click()} disabled={isLoading}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-[#1E293B] border border-green-500/30 text-green-400 hover:bg-green-500/20 transition disabled:opacity-50">
              <Camera size={18} />
            </motion.button>
            <input type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything, or upload an image of an equation..." disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-[#1E293B] border border-blue-500/30 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition" />
            <motion.button onClick={handleSendMessage} disabled={isLoading}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-400 transition shadow-lg hover:shadow-blue-500/30 disabled:opacity-50">
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
