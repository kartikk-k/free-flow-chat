/**
 * IndexedDB utility for storing and retrieving chat sessions
 *
 * Database Structure:
 * - Database: pod-ai-chats
 * - Store: chats
 * - Schema: { id: string, data: string, metadata: object }
 */

const DB_NAME = 'pod-ai-chats';
const STORE_NAME = 'chats';
const DB_VERSION = 1;

export interface ChatMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRecord {
  id: string;
  data: string; // Stringified JSON of the entire playground state
  metadata: ChatMetadata;
}

/**
 * Initialize and return IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

        // Create indexes for faster querying
        objectStore.createIndex('createdAt', 'metadata.createdAt', { unique: false });
        objectStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false });
      }
    };
  });
}

/**
 * Save a chat to IndexedDB
 */
export async function saveChat(chatRecord: ChatRecord): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(chatRecord);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to save chat'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get a specific chat by ID
 */
export async function getChat(id: string): Promise<ChatRecord | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error('Failed to get chat'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all chats sorted by updated date (newest first)
 */
export async function getAllChats(): Promise<ChatRecord[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const chats = request.result as ChatRecord[];
      // Sort by updatedAt descending (newest first)
      chats.sort((a, b) =>
        new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
      );
      resolve(chats);
    };

    request.onerror = () => {
      reject(new Error('Failed to get all chats'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Delete a chat by ID
 */
export async function deleteChat(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete chat'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Update chat metadata (title, updatedAt)
 */
export async function updateChatMetadata(
  id: string,
  updates: Partial<Pick<ChatMetadata, 'title'>>
): Promise<void> {
  const chat = await getChat(id);

  if (!chat) {
    throw new Error('Chat not found');
  }

  chat.metadata = {
    ...chat.metadata,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveChat(chat);
}

/**
 * Check if a chat exists
 */
export async function chatExists(id: string): Promise<boolean> {
  const chat = await getChat(id);
  return chat !== null;
}
