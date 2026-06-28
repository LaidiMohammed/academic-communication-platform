'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Trash2, Zap, MessageCircle, Sparkles, History, PanelRightClose, Star } from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function AIPage() {
  const [messages, setMessages] = useState([
    { id: '0', type: 'bot', text: 'Hello! 👋 I\'m your AI Learning Assistant. I can help you with homework, explain concepts, solve problems, and provide study tips. What would you like help with?' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMsg = { id: Date.now().toString(), type: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setTimeout(() => {
      const responses = [
        'Great question! Let me explain this concept...',
        'I can help you with that. Here\'s what you need to know...',
        'Interesting! This relates to several other topics in the curriculum...',
        'Let me break this down into simpler steps for you...',
      ];
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', text: responses[Math.floor(Math.random() * responses.length)] }]);
      setIsLoading(false);
    }, 1000);
  };

  const suggestedQuestions = [
    'Explain photosynthesis to me', 'How do I solve quadratic equations?',
    'What is the French Revolution about?', 'Help me with my chemistry homework',
    'Explain relativity theory simply', 'How do I write a good essay?',
  ];

  return (
    <div className="flex flex-1 h-full min-h-0 bg-background">
      {/* Sidebar - on mobile it overlays */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed md:relative inset-y-0 left-0 z-50 md:z-auto w-72 bg-card border-r border-border flex flex-col shrink-0">
            <div             className="p-4 border-b border-border">
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
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition text-sm font-semibold">
                <Plus size={15} /> New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-2 mb-2">History</p>
              {['Today', 'Yesterday', '3 days ago', '7 days ago', 'Last 30 days'].map((day) => (
                <motion.div key={day} whileHover={{ x: 4 }}
                  className="px-3 py-2 rounded-lg hover:bg-blue-500/10 cursor-pointer transition group">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={13} className="text-gray-500 group-hover:text-blue-400 transition" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition">{day}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 ml-5">How do I solve...?</p>
                </motion.div>
              ))}
            </div>
            <div             className="p-3 border-t border-border">
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-blue-500/10 transition text-gray-400 hover:text-blue-400">
              <History size={16} />
            </button>
          )}
          <Zap size={18} className="text-blue-400" />
          <h1 className="text-sm font-bold text-foreground">AI Learning Assistant</h1>
          <span className="text-[10px] text-muted-foreground bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 hidden sm:inline">Powered by OpenAI</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Zap size={48} className="mx-auto text-blue-400/50 mb-4" />
                <p className="text-gray-400 text-sm">Ask me anything about your studies!</p>
              </div>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => (
                <motion.div key={msg.id} variants={item}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-lg px-4 py-3 ${
                    msg.type === 'user'
                      ? 'bg-blue-500 text-white rounded-2xl rounded-br-none shadow-lg shadow-blue-500/20'
                      : 'bg-[#1E293B] border border-blue-500/10 text-gray-200 rounded-2xl rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
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

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="px-3 md:px-4 pb-2 shrink-0">
            <p className="text-xs font-semibold text-gray-400 mb-2">Quick Questions</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 4).map((q, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                  onClick={() => setInputValue(q)}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition text-xs font-medium">
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Circular Action Buttons */}
        <div className="flex justify-center gap-4 px-4 pb-2 shrink-0">
          {['Search for suppliers', 'Select materials', 'Calculation of the cost'].map((btn, i) => (
            <motion.button key={btn} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-500 text-white text-[8px] md:text-[10px] font-semibold shadow-lg hover:shadow-blue-400/40 transition-all leading-tight p-1">
              {btn}
            </motion.button>
          ))}
        </div>

        {/* Input */}
        <div className="px-3 md:px-4 pb-3 pt-1 shrink-0">
          <div className="flex gap-2">
            <input type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..." disabled={isLoading}
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
