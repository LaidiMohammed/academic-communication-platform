'use client';

import { X, Image, Users, Settings, Volume2, VolumeX, Pin, Trash2, UserX, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

export function ChatDetailsPanel({
  isOpen,
  onClose,
  chatName,
  chatAvatar,
  online,
  onMute,
  onBlock,
  onDelete,
  onChangeNickname,
  isMuted = false,
}: ChatDetailsPanelProps) {
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState(chatName);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const handleSaveNickname = () => {
    onChangeNickname();
    setShowNicknameModal(false);
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleBlock = () => {
    onBlock();
    setShowBlockConfirm(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Panel */}
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={isOpen ? { x: 0, opacity: 1 } : { x: 400, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex fixed right-0 top-16 h-[calc(100vh-64px)] w-80 bg-card border-l border-border flex-col shadow-2xl z-40"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0">
          <h3 className="font-semibold text-foreground">Chat Details</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-6 p-4">
          {/* Contact Info */}
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <img
                src={chatAvatar}
                alt={chatName}
                className="w-20 h-20 rounded-full border-2 border-primary"
              />
              {online && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-accent rounded-full border-2 border-card" />
              )}
            </div>
            <h4 className="text-lg font-semibold text-foreground">{chatName}</h4>
            <p className="text-sm text-muted-foreground">
              {online ? 'Active now' : 'Offline'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={() => setShowNicknameModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground group"
            >
              <Edit3 size={18} strokeWidth={2} className="text-muted-foreground group-hover:text-primary transition" />
              <span>Change Nickname</span>
            </button>

            <button
              onClick={onMute}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground group"
            >
              {isMuted ? (
                <>
                  <VolumeX size={18} strokeWidth={2} className="text-muted-foreground group-hover:text-primary transition" />
                  <span>Unmute Chat</span>
                </>
              ) : (
                <>
                  <Volume2 size={18} strokeWidth={2} className="text-muted-foreground group-hover:text-primary transition" />
                  <span>Mute Chat</span>
                </>
              )}
            </button>

            <button
              onClick={() => {}}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground group"
            >
              <Pin size={18} strokeWidth={2} className="text-muted-foreground group-hover:text-primary transition" />
              <span>Pin Chat</span>
            </button>

            <button
              onClick={() => {}}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground group"
            >
              <Image size={18} strokeWidth={2} className="text-muted-foreground group-hover:text-primary transition" />
              <span>View Media</span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Danger Zone */}
          <div className="space-y-2">
            <button
              onClick={() => setShowBlockConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition text-destructive group"
            >
              <UserX size={18} strokeWidth={2} className="group-hover:scale-110 transition" />
              <span>Block User</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition text-destructive group"
            >
              <Trash2 size={18} strokeWidth={2} className="group-hover:scale-110 transition" />
              <span>Delete Discussion</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 md:hidden bg-card rounded-t-2xl border-t border-border z-40 max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card flex items-center justify-between p-4 border-b border-border rounded-t-2xl">
              <h3 className="font-semibold text-foreground">Chat Details</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 p-4 pb-8">
              {/* Contact Info */}
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={chatAvatar}
                    alt={chatName}
                    className="w-20 h-20 rounded-full border-2 border-primary"
                  />
                  {online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-accent rounded-full border-2 border-card" />
                  )}
                </div>
                <h4 className="text-lg font-semibold text-foreground">{chatName}</h4>
                <p className="text-sm text-muted-foreground">
                  {online ? 'Active now' : 'Offline'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowNicknameModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground group"
                >
                  <Edit3 size={18} strokeWidth={2} className="text-muted-foreground group-hover:text-primary transition" />
                  <span>Change Nickname</span>
                </button>

                <button
                  onClick={onMute}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground group"
                >
                  {isMuted ? (
                    <>
                      <VolumeX size={18} strokeWidth={2} className="text-muted-foreground group-hover:text-primary transition" />
                      <span>Unmute Chat</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={18} strokeWidth={2} className="text-muted-foreground group-hover:text-primary transition" />
                      <span>Mute Chat</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {}}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground group"
                >
                  <Pin size={18} strokeWidth={2} className="text-muted-foreground group-hover:text-primary transition" />
                  <span>Pin Chat</span>
                </button>

                <button
                  onClick={() => {}}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground group"
                >
                  <Image size={18} strokeWidth={2} className="text-muted-foreground group-hover:text-primary transition" />
                  <span>View Media</span>
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Danger Zone */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowBlockConfirm(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition text-destructive group"
                >
                  <UserX size={18} strokeWidth={2} className="group-hover:scale-110 transition" />
                  <span>Block User</span>
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition text-destructive group"
                >
                  <Trash2 size={18} strokeWidth={2} className="group-hover:scale-110 transition" />
                  <span>Delete Discussion</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nickname Modal */}
      <AnimatePresence>
        {showNicknameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNicknameModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-2xl"
            >
              <h4 className="text-lg font-semibold text-foreground mb-4">Change Nickname</h4>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary transition mb-4"
                placeholder="Enter nickname..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNicknameModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNickname}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:shadow-lg transition"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-2xl"
            >
              <h4 className="text-lg font-semibold text-foreground mb-2">Delete Discussion?</h4>
              <p className="text-muted-foreground mb-6">
                This will permanently delete the conversation with {chatName}. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:shadow-lg transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block Confirmation Modal */}
      <AnimatePresence>
        {showBlockConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBlockConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-2xl"
            >
              <h4 className="text-lg font-semibold text-foreground mb-2">Block {chatName}?</h4>
              <p className="text-muted-foreground mb-6">
                {chatName} won&apos;t be able to send you messages or see when you&apos;re online.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBlockConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlock}
                  className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:shadow-lg transition"
                >
                  Block
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
