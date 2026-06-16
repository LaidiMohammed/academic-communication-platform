'use client';

const emojis = [
  '😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗',
  '😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢','🫣','🤫','🤔','🤐','🤨','😐','😑',
  '😶','🫥','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢',
  '🤮','🥴','😵','🤯','🥳','🥺','😢','😭','😤','😠','😡','🤬','😈','👿','💀','☠️',
  '💩','🤡','👹','👺','👻','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀',
  '😿','😾','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓',
  '💗','💖','💘','💝','💟','👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤲',
  '🤝','🙏','✌️','🤞','🤟','🤘','👌','🤌','🤏','🫰','🫵','🫶','💪','🦵','🦶','👀',
  '👋','🤚','🖐️','✋','🖖','🫲','🫱','👆','👇','👈','👉','🖕','👎','👍',
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="absolute bottom-16 left-0 z-50 bg-card border border-border rounded-xl shadow-xl p-2 w-72 animate-expand-height">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-xs font-semibold text-foreground">Emojis</span>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
      <div className="grid grid-cols-9 gap-0.5 max-h-48 overflow-y-auto">
        {emojis.map((emoji, i) => (
          <button
            key={i}
            onClick={() => { onSelect(emoji); onClose(); }}
            className="w-7 h-7 flex items-center justify-center hover:bg-secondary rounded-md text-lg transition"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
