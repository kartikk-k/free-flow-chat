"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Playground from '@/components/playground';
import { getChat, saveChat, chatExists } from '@/lib/db/indexeddb';
import { type PlaygroundState } from '@/types/chat';
import { PlaygroundStateSerializer } from '@/lib/playground';
import { usePlaygroundStore } from '@/store/Playground';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatTitleEditor } from '@/components/ChatTitleEditor';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [chatNotFound, setChatNotFound] = useState(false);
  const [chatTitle, setChatTitle] = useState('Untitled Chat');

  const { setNodes, setConnectors, setNodeChats } = usePlaygroundStore();

  // Load chat data on mount
  useEffect(() => {
    loadChatData();
  }, [chatId]);

  const loadChatData = async () => {
    try {
      setLoading(true);

      // Check if this is a new chat or existing one
      const exists = await chatExists(chatId);

      if (exists) {
        // Load existing chat
        const chatRecord = await getChat(chatId);

        if (chatRecord) {
          // Parse and validate the data
          const state = PlaygroundStateSerializer.parse(chatRecord.data);

          if (PlaygroundStateSerializer.validate(state)) {
            // Restore the state
            setNodes(state.nodes);
            setConnectors(state.connectors);
            setNodeChats(state.nodeChats);
            setChatTitle(chatRecord.metadata.title);
          } else {
            console.error('Invalid chat data structure');
            setChatNotFound(true);
          }
        }
      } else {
        // New chat - initialize with default metadata
        const now = new Date().toISOString();
        await saveChat({
          id: chatId,
          data: PlaygroundStateSerializer.stringify({
            nodes: [],
            connectors: [],
            nodeChats: [],
          }),
          metadata: {
            id: chatId,
            title: 'Untitled Chat',
            createdAt: now,
            updatedAt: now,
          },
        });
        setChatTitle('Untitled Chat');
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      setChatNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to save current state
  const saveCurrentState = async () => {
    try {
      const state = usePlaygroundStore.getState();
      const playgroundState: PlaygroundState = {
        nodes: state.nodes,
        connectors: state.connectors,
        nodeChats: state.nodeChats,
      };

      const existingChat = await getChat(chatId);

      if (existingChat) {
        await saveChat({
          id: chatId,
          data: PlaygroundStateSerializer.stringify(playgroundState),
          metadata: {
            ...existingChat.metadata,
            updatedAt: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error('Failed to save chat:', error);
    }
  };

  // Immediate save - save to IndexedDB when state changes
  useEffect(() => {
    if (loading || chatNotFound) return;

    saveCurrentState();
  }, [
    usePlaygroundStore().nodes,
    usePlaygroundStore().connectors,
    usePlaygroundStore().nodeChats,
    chatId,
    loading,
    chatNotFound,
  ]);

  // Interval-based auto-save - backup save every 2 minutes
  useEffect(() => {
    if (loading || chatNotFound) return;

    const intervalId = setInterval(() => {
      saveCurrentState();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(intervalId);
  }, [chatId, loading, chatNotFound]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (chatNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Chat Not Found</h1>
        <p className="text-neutral-600">The chat you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/chats')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Chats
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Header with back button and title */}
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/chats')}
          className="bg-black/10 gap-2 shadow-none w-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>arrow-left</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><line x1="2.75" y1="9" x2="15.25" y2="9"></line><polyline points="7 13.25 2.75 9 7 4.75"></polyline></g></svg>
          {/* All Chats */}
        </Button>
        <ChatTitleEditor
          chatId={chatId}
          initialTitle={chatTitle}
          onTitleUpdate={setChatTitle}
        />
      </div>

      {/* Playground */}
      <Playground />
    </div>
  );
}
