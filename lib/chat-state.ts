import { useCallback, useRef } from 'react';

/**
 * Custom hook for optimized message handling with immutable append patterns
 * Prevents flickering by appending new messages instead of overwriting state
 */
export function useMessagesOptimized() {
  const messagesMapRef = useRef<Record<string, any[]>>({});

  const setMessagesMap = useCallback((
    updater: (prev: Record<string, any[]>) => Record<string, any[]>
  ) => {
    messagesMapRef.current = updater(messagesMapRef.current);
    // Return copy to trigger React re-render
    return { ...messagesMapRef.current };
  }, []);

  const appendMessages = useCallback((chatId: string, newMessages: any[]) => {
    // Immutable append: create new array with existing + new messages
    const existing = messagesMapRef.current[chatId] || [];
    const messageIds = new Set(existing.map((m: any) => m.id));
    
    // Filter out duplicates before appending
    const uniqueNew = newMessages.filter((m: any) => !messageIds.has(m.id));
    
    if (uniqueNew.length === 0) return existing;
    
    const updated = [...existing, ...uniqueNew];
    messagesMapRef.current[chatId] = updated;
    return updated;
  }, []);

  const replaceMessages = useCallback((chatId: string, messages: any[]) => {
    messagesMapRef.current[chatId] = messages;
    return messages;
  }, []);

  const getMessages = useCallback((chatId: string) => {
    return messagesMapRef.current[chatId] || [];
  }, []);

  return {
    messagesMapRef,
    setMessagesMap,
    appendMessages,
    replaceMessages,
    getMessages,
  };
}
