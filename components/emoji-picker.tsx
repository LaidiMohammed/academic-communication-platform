'use client';

import { useState } from 'react';

const categories = [
  {
    name: 'Smileys',
    emojis: ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥴','😵','🤯','🥳','🥺','😢','😭','😤','😠','😡','🤬','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','🎃'],
  },
  {
    name: 'Gestures',
    emojis: ['👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✌️','🤞','🤟','🤘','👌','🤌','🤏','🫰','🫶','💪','🖐️','✋','👋','🤚','🖖','👆','👇','👈','👉','🖕','💅','👀','👁️'],
  },
  {
    name: 'Hearts',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','❤️‍🔥','❤️‍🩹'],
  },
  {
    name: 'Animals',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊'],
  },
  {
    name: 'Food',
    emojis: ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🍞','🥖','🥨','🧀','🥚','🍳','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🍵','🧃','🥤','🍶','🍺','🍻','🥂','🍷','🫗','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🥣','🍽️'],
  },
  {
    name: 'Travel',
    emojis: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🛺','🚲','🛴','🛹','🚏','🛣️','🛤️','⛽','🛳️','⛵','🚤','🛶','⚓','✈️','🛩️','🛫','🛬','🚁','🚀','🛸','🌍','🌎','🌏','🗺️','🏔️','⛰️','🌋','🏜️','🏝️','🏖️','🏗️','🏘️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛲','⛪'],
  },
];

export function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="absolute bottom-14 left-0 z-50 bg-card border border-border rounded-2xl shadow-xl overflow-hidden w-80 animate-expand-height">
      {/* Category tabs */}
      <div className="flex border-b border-border overflow-x-auto px-2 py-1 gap-1 shrink-0">
        {categories.map((cat, i) => (
          <button key={cat.name} onClick={() => setActiveCategory(i)}
            className={`text-lg w-8 h-8 flex items-center justify-center rounded-lg transition shrink-0 ${activeCategory === i ? 'bg-primary/20' : 'hover:bg-secondary'}`}
            title={cat.name}
          >
            {cat.emojis[0]}
          </button>
        ))}
      </div>
      {/* Emoji grid */}
      <div className="grid grid-cols-9 gap-0.5 p-2 max-h-56 overflow-y-auto">
        {categories[activeCategory].emojis.map((emoji, i) => (
          <button key={i} onClick={() => { onSelect(emoji); onClose(); }}
            className="w-8 h-8 flex items-center justify-center hover:bg-secondary rounded-lg text-xl transition"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
