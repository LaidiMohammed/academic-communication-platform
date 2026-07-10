'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Bell, BellOff, Pin, Image, Link2, Users,
  Shield, Lock, Trash2, UserX, Edit3, Volume2, VolumeX,
  ChevronRight, Camera, FileText,
  Download, ExternalLink,
} from 'lucide-react';

interface ChatDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  chatName: string;
  chatAvatar: string;
  online: boolean;
  onMute: () => void;
  onBlock: () => void;
  onDelete: () => void;
  onChangeNickname: () => void;
  isMuted?: boolean;
  messages?: { type: string; image?: string; file?: { name: string; size: string; url?: string }; text?: string }[];
  members?: { name: string; avatar: string; role: string; online: boolean }[];
}

type Tab = 'info' | 'media' | 'links' | 'files';

export function ChatDetailsPanel({
  isOpen, onClose, chatName, chatAvatar, online,
  onMute, onBlock, onDelete, onChangeNickname, isMuted = false, messages = [], members = [],
}: ChatDetailsPanelProps) {
  const [tab, setTab] = useState<Tab>('info');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState(chatName);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [pinned, setPinned] = useState(false);

  const images = useMemo(() => messages.filter(m => m.type === 'image'), [messages]);
  const files = useMemo(() => messages.filter(m => m.type === 'file'), [messages]);
  const links = useMemo(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const found: { url: string }[] = [];
    messages.forEach(m => {
      if (m.text) {
        const matches = m.text.match(urlRegex);
        if (matches) matches.forEach(url => found.push({ url }));
      }
    });
    return found.slice(0, 20);
  }, [messages]);

  const handleSaveNickname = () => { onChangeNickname(); setShowNicknameModal(false); };
  const handleDelete = () => { onDelete(); setShowDeleteConfirm(false); };
  const handleBlock = () => { onBlock(); setShowBlockConfirm(false); };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Info' },
    { id: 'media', label: 'Media' },
    { id: 'links', label: 'Links' },
    { id: 'files', label: 'Files' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="fixed inset-0 bg-black/50 z-30 md:hidden" />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 288, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex w-72 bg-card border-l border-border flex-col shadow-xl shrink-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-3 py-3 border-b border-border shrink-0">
          <h3 className="text-sm font-semibold text-foreground">Chat Info</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="flex border-b border-border shrink-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 text-xs font-medium transition border-b-2 ${
                tab === t.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'info' && (
            <div className="divide-y divide-border">
              <div className="text-center py-4 px-3">
                <div className="relative inline-block mb-2">
                  <img src={chatAvatar} alt={chatName} className="w-16 h-16 rounded-full" />
                  {online && <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-card" />}
                </div>
                <h4 className="text-base font-semibold text-foreground">{chatName}</h4>
                <p className="text-xs text-muted-foreground">{online ? 'Online' : 'Offline'}</p>
              </div>

              <div className="py-1">
                <button onClick={() => setShowNicknameModal(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition text-sm text-foreground">
                  <Edit3 size={16} strokeWidth={2} className="text-muted-foreground" />
                  <span>Set Nickname</span>
                </button>
                <button onClick={() => { setNotifications(!notifications); onMute(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition text-sm text-foreground">
                  {notifications ? <Bell size={16} strokeWidth={2} className="text-muted-foreground" /> : <BellOff size={16} strokeWidth={2} className="text-muted-foreground" />}
                  <span>{notifications ? 'Notifications On' : 'Notifications Off'}</span>
                </button>
                <button onClick={onMute}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition text-sm text-foreground">
                  {isMuted ? <VolumeX size={16} className="text-muted-foreground" /> : <Volume2 size={16} className="text-muted-foreground" />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
                <button onClick={() => setPinned(!pinned)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition text-sm text-foreground">
                  <Pin size={16} className={`${pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{pinned ? 'Pinned' : 'Pin'}</span>
                </button>
              </div>

              {members.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Users size={14} />
                    <span>{members.length} members</span>
                  </div>
                  {members.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground">
                      <img src={m.avatar} alt="" className="w-6 h-6 rounded-full" />
                      <span className="flex-1 truncate">{m.name}</span>
                      {m.online && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    </div>
                  ))}
                </div>
              )}

              <div className="py-1">
                <button onClick={() => setTab('media')}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary transition text-sm text-foreground">
                  <div className="flex items-center gap-3">
                    <Image size={16} className="text-muted-foreground" />
                    <span>Images</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{images.length} items</span>
                    <ChevronRight size={14} />
                  </div>
                </button>
                <button onClick={() => setTab('links')}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary transition text-sm text-foreground">
                  <div className="flex items-center gap-3">
                    <Link2 size={16} className="text-muted-foreground" />
                    <span>Shared Links</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{links.length} links</span>
                    <ChevronRight size={14} />
                  </div>
                </button>
              </div>

              <div className="py-1">
                <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground">
                  <Lock size={16} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">Privacy</p>
                    <p className="text-xs text-muted-foreground">Secured by Supabase</p>
                  </div>
                  <Shield size={16} className="text-accent" />
                </div>
              </div>

              <div className="py-1">
                <button onClick={() => setShowBlockConfirm(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-destructive/10 transition text-sm text-destructive">
                  <UserX size={16} strokeWidth={2} />
                  <span>Block User</span>
                </button>
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-destructive/10 transition text-sm text-destructive">
                  <Trash2 size={16} strokeWidth={2} />
                  <span>Delete Chat</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'media' && (
            <div className="p-3">
              <p className="text-xs text-muted-foreground mb-3">Shared Media ({images.length})</p>
              {images.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {images.map((m, i) => (
                    <div key={i} className="aspect-square bg-secondary rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition">
                      <img src={m.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Camera size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No images shared yet</p>
                </div>
              )}
            </div>
          )}

          {tab === 'links' && (
            <div className="p-3">
              <p className="text-xs text-muted-foreground mb-3">Shared Links ({links.length})</p>
              {links.length > 0 ? (
                <div className="space-y-2">
                  {links.map((link, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary transition cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Link2 size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                      <ExternalLink size={12} className="text-muted-foreground shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No links shared yet</p>
                </div>
              )}
            </div>
          )}

          {tab === 'files' && (
            <div className="p-3">
              <p className="text-xs text-muted-foreground mb-3">Shared Files ({files.length})</p>
              {files.length > 0 ? (
                <div className="space-y-2">
                  {files.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-foreground truncate">{m.file?.name || 'Unknown file'}</p>
                        <p className="text-[10px] text-muted-foreground">{m.file?.size || 'Unknown size'}</p>
                      </div>
                      <Download size={12} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No files shared yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showNicknameModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNicknameModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-2xl">
              <h4 className="text-lg font-semibold text-foreground mb-4">Change Nickname</h4>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary transition mb-4"
                placeholder="Enter nickname..." />
              <div className="flex gap-2">
                <button onClick={() => setShowNicknameModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition">Cancel</button>
                <button onClick={handleSaveNickname}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-2xl">
              <h4 className="text-lg font-semibold text-foreground mb-2">Delete Chat?</h4>
              <p className="text-sm text-muted-foreground mb-6">
                This will permanently delete the conversation with {chatName}. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition">Cancel</button>
                <button onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:shadow-lg transition">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBlockConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBlockConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-2xl">
              <h4 className="text-lg font-semibold text-foreground mb-2">Block {chatName}?</h4>
              <p className="text-sm text-muted-foreground mb-6">
                {chatName} won&apos;t be able to send you messages or see when you&apos;re online.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowBlockConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition">Cancel</button>
                <button onClick={handleBlock}
                  className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:shadow-lg transition">Block</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
