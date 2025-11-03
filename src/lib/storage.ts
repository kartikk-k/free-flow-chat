/**
 * LocalStorage helper functions for managing API keys and application state
 * Extended to support multiple providers
 */

export type ProviderId = 'openai' | 'anthropic' | 'google';

const STORAGE_KEYS = {
  OPENAI_API_KEY: 'pod-ai:openai-api-key',
  ANTHROPIC_API_KEY: 'pod-ai:anthropic-api-key',
  GOOGLE_API_KEY: 'pod-ai:google-api-key',
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
 * Get API key for a specific provider
 */
export function getApiKey(provider: ProviderId): string | null {
  const keyMap: Record<ProviderId, string> = {
    openai: STORAGE_KEYS.OPENAI_API_KEY,
    anthropic: STORAGE_KEYS.ANTHROPIC_API_KEY,
    google: STORAGE_KEYS.GOOGLE_API_KEY,
  };
  return getStorageItem(keyMap[provider]);
}

/**
 * Save API key for a specific provider
 */
export function saveApiKey(provider: ProviderId, apiKey: string): boolean {
  const keyMap: Record<ProviderId, string> = {
    openai: STORAGE_KEYS.OPENAI_API_KEY,
    anthropic: STORAGE_KEYS.ANTHROPIC_API_KEY,
    google: STORAGE_KEYS.GOOGLE_API_KEY,
  };

  if (!apiKey || apiKey.trim() === '') {
    return removeApiKey(provider);
  }
  return setStorageItem(keyMap[provider], apiKey.trim());
}

/**
 * Remove API key for a specific provider
 */
export function removeApiKey(provider: ProviderId): boolean {
  const keyMap: Record<ProviderId, string> = {
    openai: STORAGE_KEYS.OPENAI_API_KEY,
    anthropic: STORAGE_KEYS.ANTHROPIC_API_KEY,
    google: STORAGE_KEYS.GOOGLE_API_KEY,
  };
  return removeStorageItem(keyMap[provider]);
}

/**
 * Get all API keys
 */
export function getAllApiKeys(): Record<ProviderId, string | null> {
  return {
    openai: getApiKey('openai'),
    anthropic: getApiKey('anthropic'),
    google: getApiKey('google'),
  };
}

// Legacy functions for backward compatibility
export function getApiKey_legacy(): string | null {
  return getApiKey('openai');
}

export function saveApiKey_legacy(apiKey: string): boolean {
  return saveApiKey('openai', apiKey);
}

export function removeApiKey_legacy(): boolean {
  return removeApiKey('openai');
}
