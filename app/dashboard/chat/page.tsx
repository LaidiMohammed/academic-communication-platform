import { Suspense } from 'react';
import { ChatPage } from '@/components/pages/chat-page';

export default function ChatPageRoute() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading chat...</p></div>}>
      <ChatPage />
    </Suspense>
  );
}
