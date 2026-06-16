'use client';

import { useState } from 'react';
import {
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  Search,
  MoreVertical,
  Plus,
  Mic,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';

export function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>('chat-1');
  const [messageText, setMessageText] = useState('');
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);

  const chats = [
    {
      id: 'chat-1',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      lastMessage: 'See you at the meeting!',
      time: '2m',
      unread: 2,
      online: true,
    },
    {
      id: 'chat-2',
      name: 'Math Study Group',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=math',
      lastMessage: 'Who wants to solve the homework?',
      time: '5m',
      unread: 5,
      online: true,
    },
    {
      id: 'chat-3',
      name: 'Prof. Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=smith',
      lastMessage: 'Check the assignment',
      time: '1h',
      unread: 0,
      online: false,
    },
  ];

  const messages = [
    { id: 1, sender: 'Sarah', text: 'Hey! How are you?', time: '10:30', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
    { id: 2, sender: 'You', text: 'Hi! Doing great!', time: '10:31', isOwn: true },
    { id: 3, sender: 'Sarah', text: 'Want to work on the project?', time: '10:32', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
    { id: 4, sender: 'You', text: 'Sure! Let&apos;s start tomorrow.', time: '10:33', isOwn: true },
    { id: 5, sender: 'Sarah', text: 'Perfect! See you at the meeting! 🎉', time: '10:35', isOwn: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
  ];

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃'];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Chat List */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Chats */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                selectedChat === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
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
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-gray-900">{chat.name}</p>
                    <span className="text-xs text-gray-500 ml-2">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                </div>

                {chat.unread > 0 && (
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{chat.unread}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat && (
        <div className="hidden md:flex flex-1 flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
                alt="Sarah"
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-900">Sarah Johnson</p>
                <p className="text-sm text-gray-500">Active now</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-blue-600">
                <Phone size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-blue-600">
                <Video size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-blue-600">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!msg.isOwn && (
                  <img
                    src={msg.avatar}
                    alt={msg.sender}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                )}

                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words ${
                    msg.isOwn
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-600'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4 space-y-3">
            {/* Emoji Menu */}
            {showEmojiMenu && (
              <div className="grid grid-cols-6 gap-2 p-3 bg-gray-100 rounded-lg">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setMessageText(messageText + emoji);
                      setShowEmojiMenu(false);
                    }}
                    className="text-2xl hover:bg-white p-2 rounded transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-blue-600">
                <Paperclip size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-blue-600">
                <ImageIcon size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-blue-600">
                <Mic size={20} />
              </button>

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />

              <button
                onClick={() => setShowEmojiMenu(!showEmojiMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 hover:text-blue-600"
              >
                <Smile size={20} />
              </button>

              <button
                onClick={handleSendMessage}
                className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: No chat selected message */}
      {!selectedChat && (
        <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}

import { MessageSquare } from 'lucide-react';
