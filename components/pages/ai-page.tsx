'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Trash2, Zap, MessageCircle } from 'lucide-react';

export function AIPage() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      text: 'Hello! 👋 I\'m your AI Learning Assistant. I can help you with homework, explain concepts, solve problems, and provide study tips. What would you like help with?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        type: 'user',
        text: inputValue,
      };

      setMessages([...messages, newMessage]);
      setInputValue('');
      setIsLoading(true);

      // Simulate AI response
      setTimeout(() => {
        const responses = [
          'Great question! Let me explain this concept...',
          'I can help you with that. Here\'s what you need to know...',
          'Interesting! This relates to several other topics in the curriculum...',
          'Let me break this down into simpler steps for you...',
        ];

        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: responses[Math.floor(Math.random() * responses.length)],
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    }
  };

  const suggestedQuestions = [
    'Explain photosynthesis to me',
    'How do I solve quadratic equations?',
    'What is the French Revolution about?',
    'Help me with my chemistry homework',
    'Explain relativity theory simply',
    'How do I write a good essay?',
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap size={24} className="text-yellow-500" />
              AI Assistant
            </h2>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
              <Plus size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600">Your personal learning companion powered by AI</p>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer">
            <p className="font-medium text-sm">Current Conversation</p>
            <p className="text-xs text-blue-600 mt-1">Just now</p>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg text-center text-sm text-gray-600">
            <p>No previous chats</p>
            <button className="mt-2 flex items-center justify-center gap-2 w-full px-2 py-1 bg-white rounded border border-gray-300 hover:bg-gray-50 transition">
              <Trash2 size={16} />
              Clear History
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Zap size={48} className="mx-auto text-yellow-500 mb-4 opacity-50" />
                <p className="text-gray-600 mb-6">Ask me anything about your studies!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Suggested Questions (when empty) */}
        {messages.length <= 1 && (
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Quick Questions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(q)}
                  className="text-left px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-sm font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Show message area in center */}
      {messages.length > 0 && (
        <div className="md:hidden fixed inset-0 bg-white z-40 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border-t border-gray-200 p-4 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
