'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient, createServiceClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import {
  Send, Heart, Search, MoreVertical, Mic, Phone, Video, Info,
  Eye, Copy, Trash2, MessageCircle, Smile, Reply, Forward,
  Image as ImageIcon, FileText, MapPin, Vote, ChevronDown,
  X, Download, ExternalLink, CheckCheck, BellOff, Pin, Users,
} from 'lucide-react';
import { ChatInputWidget } from '@/components/chat-input-widget';
import { ChatDetailsPanel } from '@/components/chat-details-panel';
import { motion, AnimatePresence } from 'framer-motion';
import twemoji from 'twemoji';

function formatRelativeTime(dateStr: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

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
  type: 'text' | 'image' | 'file' | 'poll' | 'location' | 'voice';
  voice?: string;
  duration?: number;
  lat?: number;
  lng?: number;
}

function MapPreview({ lat, lng, onZoom }: { lat: number; lng: number; onZoom: () => void }) {
  const bbox = `${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}`;
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div onClick={onZoom} className="w-full h-28 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition border border-border relative mb-1">
      <iframe src={url} className="w-full h-full pointer-events-none" title="Map" loading="lazy" />
      <div className="absolute inset-0 bg-transparent" />
    </div>
  );
}

function MapFull({ lat, lng }: { lat: number; lng: number }) {
  const bbox = `${lng-0.02}%2C${lat-0.02}%2C${lng+0.02}%2C${lat+0.02}`;
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  return <iframe src={url} className="w-full h-full" title="Map" loading="lazy" />;
}

function VoiceBubble({ src, duration }: { src: string; duration: number }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toggle = () => {
    if (!audioRef.current) {
      const a = new Audio(src);
      a.onended = () => setPlaying(false);
      a.ontimeupdate = () => setProgress(a.currentTime / (a.duration || 1));
      a.play(); audioRef.current = a; setPlaying(true);
    } else if (audioRef.current.paused) { audioRef.current.play(); setPlaying(true); }
    else { audioRef.current.pause(); setPlaying(false); }
  };
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  return (
    <div className="flex items-center gap-2 mb-1 min-w-40">
      <button onClick={(e) => { e.stopPropagation(); toggle(); }} className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/30 transition shrink-0">
        {playing
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19"/></svg>}
      </button>
      <div className="flex-1 h-1.5 bg-background/20 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="flex flex-col items-end leading-tight">
        <span className="text-[10px] opacity-80 font-mono">{mins}:{secs.toString().padStart(2, '0')}</span>
        <span className="text-[8px] opacity-50">{playing ? 'Playing' : ''}</span>
      </div>
    </div>
  );
}

const CDN = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/';
const appleEmoji = (icon: string) => `${CDN}${icon}.png`;
const onerrorAttr = 'onerror="this.onerror=null;var s=this.src;this.src=s.includes(\'fe0f\')?s.replace(\'fe0f\',\'\'):s.replace(\'.png\',\'-fe0f.png\')"';

function parseEmoji(text: string, className = 'emoji-tw') {
  const html = twemoji.parse(text, { callback: (i) => appleEmoji(i), className });
  return html.replace(/<img /g, `<img ${onerrorAttr} `);
}

function EmojiText({ text, className }: { text: string; className?: string }) {
  const html = text ? parseEmoji(text, className) : '';
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [isChatMuted, setIsChatMuted] = useState(false);
  const [chatMode, setChatMode] = useState<'individual' | 'group'>('individual');
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [showForward, setShowForward] = useState<Message | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomLocation, setZoomLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [sending, setSending] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiTab, setEmojiTab] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ chatId: string; x: number; y: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserQuery, setAddUserQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const { user: currentUser } = useAuth();
  const supabase = createServiceClient();
  const addUserRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimeRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const emojiTabs = [
    { id: '😀', emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🙂','🤩','🤔','🤨','😐','😑','😶','😏','😮','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬'] },
    { id: '👋', emojis: ['👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤝','🙏','✌️','🤟','🤘','👌','🤏','✋','👆','👇','👈','👉','🤲','💅','👋','👂','👃','🧠','👁️','👅','👄','💋','👶','👦','👧','🧑','👩','👨','👴','👵','👲','🧕','👮','🕵️','💂','👷','🤶','🎅'] },
    { id: '🐱', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🐘','🦏','🐪','🐫','🦒','🐄','🐎','🐖','🐏','🐑','🐕','🐩','🐈','🐇','🐁','🐀','🦔','🐾','🐉'] },
    { id: '🍔', emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌽','🥕','🥔','🍠','🥐','🍞','🥖','🥨','🧀','🥚','🍳','🥞','🥓','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🌮','🌯','🥗','🥘','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','☕','🍵','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾'] },
    { id: '🚗', emojis: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚚','🚛','🚜','🏍️','🛵','🛺','🚲','🛴','🛹','⛽','🚢','✈️','🛩️','🛫','🛬','💺','🚁','🚀','🛸','🚏','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏯','🏰','💒','🗼','🗽','⛪','🕌','🕍','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🗾','🏔️','⛰️','🌋','🗻','🏖️','🏜️','🏝️','🏞️','🗺️'] },
    { id: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','💔','💕','💞','💗','💖','💘','💝','✨','🔥','⭐','🌟','💫','🎉','🎊','🎈','🎁','💯','✅','❌','❓','❗','🚀','💪','👀','🙈','🙉','🙊','💀','☠️','💥','🌈','⚡','🎶','🎵','🔔','💤','💨','💧','💦','☔','🌊','❄️','🔥','⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🎯','🎮','🎲','🧩','🎭','🎨','🎪','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🎻','🎬','🎿','🏂','🥇','🥈','🥉','🏅','🏆','🏁','🚩','🇩🇿','🇺🇸','🇬🇧','🇫🇷','🇪🇸','🇩🇪','🇮🇹','🇯🇵','🇨🇳','🇷🇺','🇧🇷','🇲🇦','🇹🇳','🇪🇬'] },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) setContextMenu(null);
      if (addUserRef.current && !addUserRef.current.contains(e.target as Node)) { setShowAddUser(false); setAddUserQuery(''); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    supabase.from('profiles').select('id, name, avatar').neq('id', currentUser.id).then(({ data }) => {
      if (data) setAvailableUsers(data);
    });
  }, [currentUser]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const [chats, setChats] = useState<any[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});

  useEffect(() => { scrollToBottom(); }, [messagesMap, selectedChat]);

  // Fetch chats from DB
  useEffect(() => {
    if (!currentUser) return;
    const fetchChats = async () => {
      const { data: participations } = await supabase
        .from('chat_participants')
        .select('chat_id, last_read_at, muted, pinned, chats(*)')
        .eq('user_id', currentUser.id);

      if (!participations) return;

      const chatList = await Promise.all(participations.map(async (p: any) => {
        const chat = p.chats;
        let avatar = chat.avatar;
        let name = chat.name;
        if (chat.type === 'individual') {
          const { data: others } = await supabase
            .from('chat_participants')
            .select('profiles!inner(name, avatar)')
            .eq('chat_id', chat.id)
            .neq('user_id', currentUser.id)
            .limit(1);
          if (others && others[0]) {
            const profile = (others[0] as any).profiles;
            name = profile.name;
            avatar = profile.avatar;
          }
        }
        return {
          id: chat.id,
          name,
          avatar,
          lastMessage: chat.last_message || '',
          time: formatRelativeTime(chat.last_message_at),
          unread: 0,
          online: false,
          typing: false,
          muted: p.muted || false,
          pinned: p.pinned || false,
          lastSeen: '',
          type: chat.type,
          members: chat.type === 'group' ? chat.members_count : undefined,
        };
      }));
      setChats(chatList);
    };
    fetchChats();
  }, [currentUser]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (!selectedChat || !currentUser) return;
    const fetchMessages = async () => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(name, avatar)')
        .eq('chat_id', selectedChat)
        .order('created_at', { ascending: true });

      if (!msgs) return;
      const mapped = msgs.map((m: any) => ({
        id: m.id,
        sender: m.sender?.name || 'Unknown',
        text: m.text,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: m.sender_id === currentUser.id,
        avatar: m.sender?.avatar || '',
        reactions: [],
        readBy: 0,
        type: m.type,
      }));
      setMessagesMap(prev => ({ ...prev, [selectedChat]: mapped }));
    };
    fetchMessages();

    // Real-time subscription for new messages
    const channel = supabase
      .channel(`messages:${selectedChat}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChat}` },
        async (payload) => {
          const newMsg = payload.new as any;
          const { data: sender } = await supabase
            .from('profiles')
            .select('name, avatar')
            .eq('id', newMsg.sender_id)
            .single();
          const msg: Message = {
            id: newMsg.id,
            sender: sender?.name || 'Unknown',
            text: newMsg.text,
            time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: newMsg.sender_id === currentUser.id,
            avatar: sender?.avatar || '',
            reactions: [],
            readBy: 0,
            type: newMsg.type,
          };
          setMessagesMap(prev => {
            const existing = prev[selectedChat] || [];
            if (existing.some(m => m.id === newMsg.id)) return prev;
            return { ...prev, [selectedChat]: [...existing, msg] };
          });
          setChats(prev => prev.map(c =>
            c.id === selectedChat
              ? { ...c, lastMessage: newMsg.text, time: 'now' }
              : c
          ));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedChat, currentUser]);

  // Handle URL group param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get('group');
    if (groupId) {
      setChatMode('group');
      setSelectedChat(groupId);
    }
  }, []);

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    setExpandedMessage(null);
    setReplyTo(null);
    setContextMenu(null);
  };

  const handleMuteChat = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    const newMuted = !chat.muted;
    setChats(chats.map(c => c.id === chatId ? { ...c, muted: newMuted } : c));
    setContextMenu(null);
    await supabase.from('chat_participants').update({ muted: newMuted }).eq('chat_id', chatId).eq('user_id', currentUser?.id);
  };

  const handlePinChat = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    const newPinned = !chat.pinned;
    setChats(chats.map(c => c.id === chatId ? { ...c, pinned: newPinned } : c));
    setContextMenu(null);
    await supabase.from('chat_participants').update({ pinned: newPinned }).eq('chat_id', chatId).eq('user_id', currentUser?.id);
  };

  const handleDeleteChat = async (chatId: string) => {
    setChats(chats.filter(c => c.id !== chatId));
    if (selectedChat === chatId) setSelectedChat(null);
    setContextMenu(null);
    await supabase.from('chat_participants').delete().eq('chat_id', chatId).eq('user_id', currentUser?.id);
  };

  const handleContextMenu = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({ chatId, x: rect.left + 20, y: rect.top + 6 });
  };

  const getNextId = (chatId: string) => {
    const msgs = messagesMap[chatId] || [];
    return msgs.length > 0 ? Math.max(...msgs.map(m => m.id)) + 1 : 1;
  };

  const addMessage = async (chatId: string, msg: Partial<Message>) => {
    const { data: inserted, error } = await supabase.from('messages').insert({
      chat_id: chatId, sender_id: currentUser?.id,
      text: msg.text || '',
      type: msg.type || 'text',
      file_url: (msg as any).file_url || '',
      reply_to: (msg as any).replyTo || null,
    }).select('id').single();
    if (error) { console.error('Send error:', error); return; }
    const newMsg: Message = {
      id: inserted.id, sender: 'You', text: msg.text || '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true, reactions: [], readBy: 0, type: msg.type || 'text',
    };
    const chatMessages = messagesMap[chatId] || [];
    setMessagesMap({ ...messagesMap, [chatId]: [...chatMessages, newMsg] });
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMessage: newMsg.text || (newMsg.type === 'image' ? '📷 Photo' : newMsg.type === 'file' ? '📎 File' : 'New message'), time: 'now' } : c));
  };

  const emojis = ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🙂','🤩','🤔','🤨','😐','😑','😶','😏','😮','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬','👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤝','🙏','✌️','🤟','🤘','👌','❤️','🧡','💛','💚','💙','💜','🖤','💔','💕','💞','💗','💖','💘','💝','✨','🔥','⭐','🌟','💫','🎉','🎊','🎈','🎁','💯','✅','❌','❓','❗','🚀','💪','👀','🙈','🙉','🙊','💀','☠️','👋','✋','👌','🤏','👆','👇','👈','👉','👊','👋','👏','🙌','👐','🤲','🙏','💅','👂','👃','🧠','👁️','👅','👄','💋','👶','👦','👧','🧑','👩','👨','👴','👵','🤶','🎅','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🐘','🦏','🐪','🐫','🦒','🐃','🐄','🐎','🐖','🐏','🐑','🐕','🐩','🐈','🐇','🐁','🐀','🐿️','🦔','🐾','🐉','🌵','🎄','🌲','🌳','🌴','🌱','🌿','☘️','🍀','🍃','🍂','🍁','🍄','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌎','🌍','🌏','⭐','🌟','✨','⚡','💥','🔥','🌈','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','💨','💧','💦','☔','🌊','🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌽','🥕','🥔','🍠','🥐','🍞','🥖','🥨','🧀','🥚','🍳','🥞','🥓','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🌮','🌯','🥗','🥘','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🍵','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🍾','🥄','🍴','🍽️','⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🏒','🏑','🥍','🏏','⛳','🏹','🎣','🥊','🥋','🎯','🎮','🎲','🧩','🎭','🎨','🎪','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🎻','🎬','🎿','🏂','🥇','🥈','🥉','🏅','🏆','🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚚','🚛','🚜','🏍️','🛵','🛺','🚲','🛴','🛹','🚏','⛽','🚢','✈️','🛩️','🛫','🛬','💺','🚁','🚀','🛸','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏯','🏰','💒','🗼','🗽','⛪','🕌','🕍','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🗾','🏔️','⛰️','🌋','🗻','🏖️','🏜️','🏝️','🏞️','🗺️','🇩🇿','🇺🇸','🇬🇧','🇫🇷','🇪🇸','🇩🇪','🇮🇹','🇯🇵','🇨🇳','🇷🇺','🇧🇷','🇮🇳','🇦🇪','🇸🇦','🇲🇦','🇹🇳','🇪🇬']; // cleaned, no ZWJ sequences

  const handleSendMessage = () => {
    const div = inputRef.current as HTMLElement | null;
    const text = div ? div.innerText.trim() : '';
    if (!text || !selectedChat) return;
    const newMsg: Message = {
      id: getNextId(selectedChat),
      sender: 'You',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      readBy: 0,
      type: 'text',
      replyTo: replyTo || undefined,
    };
    addMessage(selectedChat, newMsg);
    if (inputRef.current) (inputRef.current as HTMLElement).innerHTML = '';
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
      m.id === msgId ? { ...m, reactions: (m.reactions || []).includes(emoji) ? (m.reactions || []).filter(e => e !== emoji) : [...(m.reactions || []), emoji] } : m
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
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newMsg: Message = {
          id: getNextId(selectedChat!),
          sender: 'You',
          text: '📍 Location',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: true,
          type: 'location',
          image: '',
          lat: +latitude.toFixed(4),
          lng: +longitude.toFixed(4),
        };
        addMessage(selectedChat!, newMsg);
      },
      (err) => {
        alert(`Location error: ${err.message}. Using approximate position.`);
        const lat = +(36.7372 + (Math.random() - 0.5) * 0.02).toFixed(4);
        const lng = +(3.0862 + (Math.random() - 0.5) * 0.02).toFixed(4);
        const newMsg: Message = {
          id: getNextId(selectedChat!),
          sender: 'You',
          text: '📍 Location (approx)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: true,
          type: 'location',
          image: '',
          lat, lng,
        };
        addMessage(selectedChat!, newMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) { alert('Voice recording not supported in this browser'); return; }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', ''];
      const mimeType = types.find(t => !t || MediaRecorder.isTypeSupported(t)) || '';
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (!selectedChat) return;
        if (audioChunksRef.current.length === 0) return;
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const dur = recordingTimeRef.current;
        const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm';
        const newMsg: Message = {
          id: getNextId(selectedChat),
          sender: 'You',
          text: `🎤 ${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, '0')}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: true,
          type: 'voice',
          voice: url,
          duration: dur,
        };
        addMessage(selectedChat, newMsg);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimeRef.current = 0;
        setRecordingTime(0);
        setIsRecording(false);
      };
      mr.start(250);
      setIsRecording(true);
      recordingTimeRef.current = 0;
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => { recordingTimeRef.current += 1; setRecordingTime(recordingTimeRef.current); }, 1000);
    } catch { alert('Microphone access denied. Allow microphone to record voice.'); }
  };

  const stopRecording = (cancelled = false) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (cancelled) audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
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

  const filteredByMode = chats.filter(c => c.type === chatMode);
  const filteredChats = searchQuery
    ? filteredByMode.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredByMode;
  const currentChat = chats.find(c => c.id === selectedChat);
  const messages = selectedChat ? messagesMap[selectedChat] || [] : [];

  const reactionEmojis = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

  return (
    <div className="flex flex-1 min-h-0 bg-background overflow-hidden overflow-x-hidden">
      <style>{`.emoji-tw{display:inline;height:1.1em;width:1.1em;vertical-align:-0.15em;object-fit:contain;}.emoji-tw.inline{display:inline;height:1em;width:1em;vertical-align:0;}`}</style>
      {/* Chat List - hides on mobile when a chat is selected */}
      <div className={`${selectedChat ? 'hidden' : 'flex'} md:flex md:w-72 bg-card border-r border-border flex-col overflow-x-hidden max-w-full relative`}>
        <div className="p-3 border-b border-border relative">
          <h2 className="text-lg font-bold text-foreground mb-2">Messages</h2>
          <div className="flex gap-1 mb-2 bg-secondary rounded-lg p-0.5">
            <button onClick={() => { setChatMode('individual'); setSelectedChat(null); setExpandedMessage(null); }}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${chatMode === 'individual' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Individual</button>
            <button onClick={() => { setChatMode('group'); setSelectedChat(null); setExpandedMessage(null); }}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${chatMode === 'group' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Groups</button>
          </div>
          <div className="flex items-center gap-1.5 relative">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition" />
            </div>
            {chatMode === 'individual' && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => { setShowAddUser(!showAddUser); if (!showAddUser) { setAddUserQuery(''); } }}
                className={`w-8 h-8 rounded-lg border transition flex items-center justify-center text-lg font-bold ${
                  showAddUser
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
                }`}
              >
                <motion.span
                  animate={{ rotate: showAddUser ? 45 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >+</motion.span>
              </motion.button>
            )}
          </div>
          <AnimatePresence>
            {showAddUser && (
              <motion.div
                ref={addUserRef}
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute left-0 right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-2xl p-2 max-h-64 overflow-y-auto"
              >
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nom d'utilisateur..."
                    value={addUserQuery}
                    onChange={e => setAddUserQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition"
                  />
                </div>
                {addUserQuery && availableUsers.filter(u => u.name.toLowerCase().includes(addUserQuery.toLowerCase())).length === 0 && (
                  <button
                    onClick={() => {
                      const newId = `chat-new-${Date.now()}`;
                      setChats([{
                        id: newId, name: addUserQuery,
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(addUserQuery)}`,
                        lastMessage: '', time: 'now', unread: 0, online: true, typing: false,
                        muted: false, pinned: false, lastSeen: '', type: 'individual' as const
                      }, ...chats]);
                      setSelectedChat(newId);
                      setShowAddUser(false);
                      setAddUserQuery('');
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg text-foreground hover:bg-secondary transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">+</div>
                    <span>Ajouter « {addUserQuery} »</span>
                  </button>
                )}
                {addUserQuery && availableUsers
                  .filter(u => u.name.toLowerCase().includes(addUserQuery.toLowerCase()))
                  .map(user => (
                    <button
                      key={user.id}
                      onClick={async () => {
                        const existing = chats.find(c => c.name === user.name && c.type === 'individual');
                        if (existing) {
                          setSelectedChat(existing.id);
                        } else {
                          const { data: chatId } = await supabase.rpc('get_or_create_individual_chat', { other_user_id: user.id });
                          if (chatId) {
                            const newChat = {
                              id: chatId, name: user.name, avatar: user.avatar,
                              lastMessage: '', time: 'now', unread: 0, online: true, typing: false,
                              muted: false, pinned: false, lastSeen: '', type: 'individual' as const
                            };
                            setChats([newChat, ...chats]);
                            setSelectedChat(chatId);
                          }
                        }
                        setShowAddUser(false);
                        setAddUserQuery('');
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg text-foreground hover:bg-secondary transition"
                    >
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                      <span>{user.name}</span>
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex-1 overflow-y-auto relative">
          {filteredChats.map(chat => (
            <motion.div
              key={chat.id}
              onClick={() => handleChatSelect(chat.id)}
              onContextMenu={(e) => handleContextMenu(e, chat.id)}
              whileHover={{ x: 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`py-2.5 px-3 border-b border-border cursor-pointer transition-colors relative ${
                selectedChat === chat.id
                  ? 'bg-primary/10 border-l-2 border-l-primary'
                  : 'hover:bg-secondary/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Avatar with online dot */}
                <div className="relative flex-shrink-0">
                  <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full" />
                  {chat.type === 'individual' && (
                    <motion.div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                        chat.online ? 'bg-green-400' : 'bg-muted-foreground/40'
                      }`}
                      animate={chat.online ? { scale: [1, 1.25, 1] } : {}}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  {chat.type === 'group' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-card flex items-center justify-center">
                      <Users size={7} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      {chat.pinned && <Pin size={10} className="text-blue-400 shrink-0" />}
                      <p className="text-sm font-semibold text-foreground truncate">{chat.name}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/70 shrink-0 tabular-nums">{chat.time}</span>
                  </div>

                  {/* Typing or last message */}
                  <div className="flex items-center gap-1 mt-0.5 min-h-[16px]">
                    <AnimatePresence mode="wait" initial={false}>
                      {chat.typing ? (
                        <motion.div
                          key="typing"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-center gap-1.5"
                        >
                          <span className="text-xs font-medium text-blue-400">écrit...</span>
                          <span className="flex gap-[3px] items-center">
                            {[0, 0.18, 0.36].map((delay, i) => (
                              <motion.span
                                key={i}
                                className="w-1.5 h-1.5 bg-blue-400 rounded-full block"
                                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 0.72, delay, ease: 'easeInOut' }}
                              />
                            ))}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.p
                          key="msg"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="text-xs text-muted-foreground truncate flex-1"
                        >
                          {chat.lastMessage}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Online / last seen line */}
                  {chat.type === 'individual' && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {chat.online ? (
                        <span className="text-[10px] font-medium text-green-400">En ligne</span>
                      ) : chat.lastSeen ? (
                        <span className="text-[10px] text-muted-foreground/50">{chat.lastSeen}</span>
                      ) : null}
                    </div>
                  )}
                  {chat.type === 'group' && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{(chat as any).members} membres</p>
                  )}
                </div>

                {/* Right side badges */}
                <div className="flex flex-col items-center gap-1 shrink-0 ml-1">
                  {chat.muted && <BellOff size={11} className="text-muted-foreground/40" />}
                  {chat.unread > 0 && (
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="min-w-[18px] h-[18px] bg-blue-500 rounded-full flex items-center justify-center px-1"
                    >
                      <span className="text-[10px] font-bold text-white">{chat.unread > 9 ? '9+' : chat.unread}</span>
                    </motion.div>
                  )}
                  {chat.unread === 0 && chat.type === 'individual' && messagesMap[chat.id]?.some(m => m.isOwn && m.readBy && m.readBy > 0) && (
                    <CheckCheck size={12} className="text-blue-400" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}

        </div>
      </div>

      {/* Context Menu - outside panels */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={contextMenuRef}
            style={{ left: contextMenu.x, top: contextMenu.y, position: 'fixed', zIndex: 100 }}
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="bg-card border border-border rounded-xl shadow-2xl py-0.5 w-36 overflow-hidden"
          >
            {(() => {
              const chat = chats.find(c => c.id === contextMenu.chatId);
              if (!chat) return null;
              return (<>
                <button onClick={() => handleMuteChat(chat.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary transition">
                  <BellOff size={13} className={chat.muted ? 'text-blue-400' : 'text-muted-foreground'} />
                  <span>{chat.muted ? 'Activer les notifs' : 'Désactiver'}</span>
                </button>
                <button onClick={() => handlePinChat(chat.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary transition">
                  <Pin size={13} className={chat.pinned ? 'text-blue-400' : 'text-muted-foreground'} />
                  <span>{chat.pinned ? 'Désépingler' : 'Épingler'}</span>
                </button>
                <div className="h-px bg-border mx-2 my-0.5" />
                <button onClick={() => handleDeleteChat(chat.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition">
                  <Trash2 size={13} />
                  <span>Supprimer</span>
                </button>
              </>);
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window + Details Panel (side by side) */}
      {selectedChat && currentChat ? (
        <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col bg-card overflow-hidden relative min-w-0">
          {/* Header */}
          <div className="border-b border-border px-3 py-2.5 flex items-center justify-between shrink-0 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 -ml-1 rounded-lg hover:bg-secondary transition text-foreground">
                <ChevronDown size={18} className="rotate-90" />
              </button>
              <div className="relative">
                <img src={currentChat.avatar} alt={currentChat.name} className="w-10 h-10 rounded-full" />
                {currentChat.type === 'individual' && (
                  <motion.div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                      currentChat.online ? 'bg-green-400' : 'bg-muted-foreground/40'
                    }`}
                    animate={currentChat.online ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">{currentChat.name}</p>
                <AnimatePresence mode="wait" initial={false}>
                  {(currentChat as any).typing ? (
                    <motion.div
                      key="hdr-typing"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-1.5"
                    >
                      <span className="text-xs font-medium text-blue-400">écrit un message</span>
                      <span className="flex gap-[3px] items-center">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.span
                            key={i}
                            className="w-1 h-1 bg-blue-400 rounded-full block"
                            animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 0.7, delay, ease: 'easeInOut' }}
                          />
                        ))}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="hdr-status"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-xs leading-tight"
                    >
                      {currentChat.type === 'group' ? (
                        <span className="text-muted-foreground">{(currentChat as any).members} membres</span>
                      ) : currentChat.online ? (
                        <span className="text-green-400 font-medium">En ligne</span>
                      ) : (currentChat as any).lastSeen ? (
                        <span className="text-muted-foreground">{(currentChat as any).lastSeen}</span>
                      ) : (
                        <span className="text-muted-foreground/60">Hors ligne</span>
                      )}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-green-400"><Phone size={17} /></motion.button>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-blue-400"><Video size={17} /></motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                className={`p-1.5 rounded-lg transition text-foreground ${showDetailsPanel ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-secondary hover:text-primary'}`}>
                <Info size={17} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary"><MoreVertical size={17} /></motion.button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-2 flex flex-col">
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
                      <div className="relative group">
                        <img src={msg.image} alt="Shared" onClick={(e) => { e.stopPropagation(); setZoomImage(msg.image!); }}
                          className="rounded-lg max-w-full max-h-48 mb-1 cursor-pointer hover:opacity-90 transition" />
                        <button onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = msg.image!; a.download = 'image.png'; a.click(); }}
                          className="absolute top-1 right-1 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition">
                          <Download size={12} />
                        </button>
                      </div>
                    )}
                    {msg.type === 'location' && msg.lat != null && msg.lng != null && (
                      <MapPreview lat={msg.lat} lng={msg.lng} onZoom={() => setZoomLocation({ lat: msg.lat!, lng: msg.lng! })} />
                    )}
                    {msg.type === 'file' && msg.file && (
                      <div onClick={(e) => { e.stopPropagation(); setPreviewFile(msg.file!); }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-background/20 cursor-pointer hover:bg-background/30 transition mb-1 group">
                        <FileText size={20} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{msg.file.name}</p>
                          <p className="text-[10px] opacity-70">{msg.file.size}</p>
                        </div>
                        {msg.file.url && <Download size={14} className="opacity-0 group-hover:opacity-100 transition shrink-0" onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = msg.file!.url!; a.download = msg.file!.name; a.click(); }} />}
                      </div>
                    )}
                    {msg.type === 'voice' && msg.voice && <VoiceBubble src={msg.voice} duration={msg.duration || 0} />}
                    {msg.type === 'poll' && <Vote size={14} className="inline mr-1" />}
                    {msg.text && <EmojiText text={msg.text} className={msg.type !== 'text' ? 'text-xs' : ''} />}
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {msg.isOwn && msg.readBy != null && (
                        msg.readBy > 0
                          ? <div className="flex items-center gap-0.5" title={`Seen by ${msg.readBy}`}><CheckCheck size={10} className="text-accent" /><span className="text-[8px] text-accent">{msg.readBy}</span></div>
                          : <CheckCheck size={10} className="text-muted-foreground/50" />
                      )}
                      <p className={`text-[10px] ${msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                    </div>
                  </div>
                  {/* Reactions display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 -mb-1">
                      {[...new Set(msg.reactions)].map((r, i) => (
                        <span key={i} className="text-xs bg-background border border-border rounded-full px-1.5 py-0.5 shadow-sm inline-flex items-center"
                          dangerouslySetInnerHTML={{ __html: parseEmoji(r) }} />
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
                          className="w-7 h-7 flex items-center justify-center hover:bg-secondary rounded-full text-base transition"
                          dangerouslySetInnerHTML={{ __html: parseEmoji(r) }} />
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
                {hoveredMessage === msg.id && !expandedMessage && (
                  <div className="flex items-center">
                    <button onClick={() => handleReact(selectedChat!, msg.id, '❤️')}
                      className="p-1 rounded-full hover:bg-secondary transition text-foreground"
                      dangerouslySetInnerHTML={{ __html: parseEmoji('❤️', 'emoji-tw w-4 h-4') }} />
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
              <button onClick={() => {
                const imgInput = document.createElement('input');
                imgInput.type = 'file';
                imgInput.accept = 'image/*';
                imgInput.onchange = (e: any) => handleImagePicked(e);
                imgInput.click();
              }}
                className="p-2 rounded-xl hover:bg-secondary text-foreground hover:text-primary transition shrink-0">
                <ImageIcon size={18} />
              </button>
              <ChatInputWidget
                onSondage={() => setShowPollModal(true)}
                onLocation={handleLocationShared}
                onFile={() => fileInputRef.current?.click()}
                onGenerateImage={() => {}}
              />
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePicked} />
              <div className="relative" ref={emojiRef}>
                <button onClick={() => setShowEmoji(!showEmoji)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition text-foreground hover:text-primary shrink-0">
                  <Smile size={20} />
                </button>
                {showEmoji && (
                  <div className="absolute bottom-10 left-0 z-50 bg-card border border-border rounded-2xl shadow-2xl p-2 w-72 max-h-72 overflow-hidden">
                    <div className="flex gap-0.5 mb-1 pb-1 border-b border-border">
                      {emojiTabs.map((t, i) => (
                        <button key={i} onClick={() => setEmojiTab(i)}
                          className={`flex-1 text-center py-1 text-sm rounded-lg transition ${emojiTab === i ? 'bg-primary/10 scale-110' : 'hover:bg-secondary'}`}
                          dangerouslySetInnerHTML={{ __html: parseEmoji(t.id) }} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-0.5 max-h-52 overflow-y-auto">
                      {emojiTabs[emojiTab].emojis.map((emoji, i) => (
                        <button key={i} onClick={() => {
                          const div = inputRef.current;
                          if (!div) return;
                          div.focus();
                          const sel = window.getSelection();
                          if (!sel) return;
                          if (!sel.rangeCount) {
                            const range = document.createRange();
                            range.selectNodeContents(div);
                            range.collapse(false);
                            sel.addRange(range);
                          }
                          const range = sel.getRangeAt(0);
                          const img = parseEmoji(emoji);
                          const frag = range.createContextualFragment(img);
                          range.deleteContents();
                          range.insertNode(frag);
                          range.collapse(false);
                          sel.removeAllRanges();
                          sel.addRange(range);
                        }}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-secondary rounded-lg transition"
                          dangerouslySetInnerHTML={{ __html: parseEmoji(emoji) }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <div ref={inputRef as any} contentEditable
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(); } }}
                  data-placeholder="Message..."
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary transition empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 whitespace-pre-wrap break-words max-h-32 overflow-y-auto"
                />
              </div>
              <button onClick={() => { if (isRecording) { stopRecording(); } else { startRecording(); } }}
                className={`self-center p-2 rounded-xl transition shrink-0 -mb-1 ${isRecording ? 'bg-destructive text-white shadow-lg scale-110' : 'hover:bg-secondary text-foreground hover:text-accent'}`}>
                <Mic size={22} />
              </button>
              <motion.button onClick={handleSendMessage}
                whileTap={{ scale: 0.85 }}
                animate={sending ? { scale: [1, 1.3, 0.9, 1.15, 1], rotate: [0, -20, 10, -5, 0] } : {}}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:shadow-lg transition shrink-0 active:scale-90">
                <motion.div animate={sending ? { y: [0, -4, 0], rotate: [0, -15, 0] } : {}} transition={{ duration: 0.5 }}>
                  <Send size={18} />
                </motion.div>
              </motion.button>
            </div>
          </div>
          {isRecording && (
            <div className="absolute inset-x-0 bottom-0 z-40 bg-card border-t-2 border-primary/30 px-3 py-2 flex items-center gap-3 shadow-2xl">
              <button onClick={() => stopRecording(true)}
                className="flex flex-col items-center gap-0.5 px-1.5 py-0.5 rounded-xl hover:bg-destructive/10 text-destructive transition">
                <Trash2 size={16} />
                <span className="text-[9px] font-medium">Cancel</span>
              </button>
              <div className="flex items-center gap-2 flex-1 bg-secondary rounded-lg px-2 py-1.5">
                <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <Mic size={14} className="text-destructive" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    <span className="text-[10px] font-semibold text-foreground">Recording</span>
                    <span className="font-mono text-[11px] font-bold text-foreground ml-auto">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="h-[3px] bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-destructive rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (recordingTime / 60) * 100)}%` }} />
                  </div>
                </div>
              </div>
              <button onClick={() => stopRecording()}
                className="flex flex-col items-center gap-0.5 px-2.5 py-0.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition shadow-lg">
                <Send size={16} />
                <span className="text-[9px] font-medium">Send</span>
              </button>
            </div>
          )}
        </div>

        {/* Details Panel (inline, compresses chat) */}
        {showDetailsPanel && (
          <ChatDetailsPanel isOpen={true} onClose={() => setShowDetailsPanel(false)}
          chatName={currentChat!.name} chatAvatar={currentChat!.avatar} online={'online' in currentChat! ? Boolean(currentChat!.online) : false}
          isMuted={isChatMuted} onMute={() => setIsChatMuted(!isChatMuted)}
          onChangeNickname={() => {}} onBlock={() => {}} onDelete={() => { setSelectedChat(null); setShowDetailsPanel(false); }}
          messages={messages} />
        )}
      </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-card border-l border-border">
          <div className="text-center">
            <MessageCircle size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Select a chat to start messaging</p>
          </div>
        </div>
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

      {/* Map Zoom Modal */}
      <AnimatePresence>
        {zoomLocation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomLocation(null)}>
            <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg h-80 rounded-2xl overflow-hidden shadow-2xl border border-border relative">
              <MapFull lat={zoomLocation.lat} lng={zoomLocation.lng} />
              <button onClick={() => setZoomLocation(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition">
                <X size={18} />
              </button>
            </motion.div>
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
