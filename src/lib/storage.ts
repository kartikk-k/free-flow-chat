/**
 * LocalStorage helper functions for managing API keys and application state
 */

const STORAGE_KEYS = {
  OPENAI_API_KEY: 'pod-ai:openai-api-key',
  EXA_API_KEY: 'pod-ai:exa-api-key',
} as const;

/**
 * Safely get an item from localStorage
 * Returns null if localStorage is not available or key doesn't exist
 */
export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Safely set an item in localStorage
 * Returns boolean indicating success
 */
export function setStorageItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * Returns boolean indicating success
 */
export function removeStorageItem(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
}

/**
 * Get the OpenAI API key from localStorage
 */
export function getApiKey(): string | null {
  return getStorageItem(STORAGE_KEYS.OPENAI_API_KEY);
}

/**
 * Save the OpenAI API key to localStorage
 */
export function saveApiKey(apiKey: string): boolean {
  if (!apiKey || apiKey.trim() === '') {
    return removeApiKey();
  }
  return setStorageItem(STORAGE_KEYS.OPENAI_API_KEY, apiKey.trim());
}

/**
 * Remove the OpenAI API key from localStorage
 */
export function removeApiKey(): boolean {
  return removeStorageItem(STORAGE_KEYS.OPENAI_API_KEY);
}

/**
 * Get the Exa API key from localStorage
 */
export function getExaApiKey(): string | null {
  return getStorageItem(STORAGE_KEYS.EXA_API_KEY);
}

/**
 * Save the Exa API key to localStorage
 */
export function saveExaApiKey(apiKey: string): boolean {
  if (!apiKey || apiKey.trim() === '') {
    return removeExaApiKey();
  }
  return setStorageItem(STORAGE_KEYS.EXA_API_KEY, apiKey.trim());
}

/**
 * Remove the Exa API key from localStorage
 */
export function removeExaApiKey(): boolean {
  return removeStorageItem(STORAGE_KEYS.EXA_API_KEY);
}
