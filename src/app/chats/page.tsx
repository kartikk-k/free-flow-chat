"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquare, Trash2, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getAllChats, deleteChat, type ChatRecord } from '@/lib/db/indexeddb';
import { Button } from '@/components/ui/button';

function ChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load all chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const allChats = await getAllChats();
      setChats(allChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChatId = uuidv4();
    router.push(`/chats/${newChatId}`);
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chats/${chatId}`);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation

    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      setDeleting(chatId);
      await deleteChat(chatId);
      await loadChats(); // Reload the list
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert('Failed to delete chat. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className='flex'>
          <div className="mb-8 flex-1">
            <h1 className="font-medium text-black">Your Chats</h1>
            <p className="text-black/60 text-[13px]">Manage and access your conversation history</p>
          </div>

          <div>
            <Button
              onClick={handleNewChat}
              className="text-sm bg bg-black px-3 pr-4 rounded-full"
              size="lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>msg-plus</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M14.75 12.25V17.25"></path> <path d="M16.2155 9.64111C16.2364 9.42991 16.25 9.2168 16.25 9C16.25 4.9961 13.004 1.75 9 1.75C4.996 1.75 1.75 4.9961 1.75 9C1.75 10.3188 2.10801 11.552 2.72301 12.6169C3.15301 13.4228 2.67 15.3291 1.75 16.25C3 16.3179 4.647 15.7529 5.383 15.2769C5.872 15.5591 6.647 15.9331 7.662 16.125C8.095 16.207 8.543 16.25 9 16.25C9.2167 16.25 9.4299 16.2363 9.6412 16.2156"></path> <path d="M17.25 14.75H12.25"></path></g></svg>
              Create New Chat
            </Button>
          </div>
        </div>


        {/* Chat List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-black/10 flex flex-col items-center justify-center">
            <div className='text-black/50'>
            <svg xmlns="http://www.w3.org/2000/svg" className='size-8' width="18" height="18" viewBox="0 0 18 18"><title>msg-content</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M9,1.75C4.996,1.75,1.75,4.996,1.75,9c0,1.319,.358,2.552,.973,3.617,.43,.806-.053,2.712-.973,3.633,1.25,.068,2.897-.497,3.633-.973,.489,.282,1.264,.656,2.279,.848,.433,.082,.881,.125,1.338,.125,4.004,0,7.25-3.246,7.25-7.25S13.004,1.75,9,1.75Z"></path><line x1="5.75" y1="7.25" x2="12.25" y2="7.25"></line><line x1="5.75" y1="10.75" x2="10.25" y2="10.75"></line></g></svg>
            </div>
            <h3 className="font-medium text-black mt-4">No chats yet</h3>
            <p className="text-black/50 text-sm">Create your first chat to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                className="group bg-white rounded-2xl border border-black/10 p-4 transition-shadow cursor-pointer hover:shadow-[inset_0px_-1px_1px_-0.5px_rgba(51,51,51,0.06),0px_0px_0px_1px_rgba(51,51,51,0.04),0px_1px_1px_0.5px_rgba(51,51,51,0.04),0px_3px_3px_-1.5px_rgba(51,51,51,0.02),0px_6px_6px_-3px_rgba(51,51,51,0.04),0px_12px_12px_-6px_rgba(51,51,51,0.04),0px_24px_24px_-12px_rgba(51,51,51,0.04),0px_48px_48px_-24px_rgba(51,51,51,0.04)]"
              >
                <div className="flex items-start text-sm justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-900 mb-1 truncate">
                      {chat.metadata.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <span>Updated {formatDate(chat.metadata.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    disabled={deleting === chat.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-red-500 hover:bg-transparent"
                  >
                    {deleting === chat.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>trash</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M13.6977 7.75L13.35 14.35C13.294 15.4201 12.416 16.25 11.353 16.25H6.64804C5.58404 16.25 4.70703 15.42 4.65103 14.35L4.30334 7.75"></path> <path d="M2.75 4.75H15.25"></path> <path d="M6.75 4.75V2.75C6.75 2.2 7.198 1.75 7.75 1.75H10.25C10.802 1.75 11.25 2.2 11.25 2.75V4.75"></path></g></svg>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatsPage