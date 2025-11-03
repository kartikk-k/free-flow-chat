/**
 * Model Configuration System
 * 
 * Defines available AI models across different providers.
 * This is a centralized configuration that makes it easy to:
 * - Add new models
 * - Add new providers
 * - Maintain model metadata (name, description, etc.)
 */

export type ProviderId = 'openai' | 'anthropic' | 'google';

export interface ModelConfig {
  id: string;
  provider: ProviderId;
  name: string;
  description?: string;
  requiresApiKey?: boolean;
}

/**
 * Available models organized by provider
 * Easy to extend with new models or providers
 */
export const MODEL_CONFIGS: Record<ProviderId, ModelConfig[]> = {
  openai: [
    {
      id: 'gpt-4',
      provider: 'openai',
      name: 'GPT-4',
      description: 'Most capable model, best for complex tasks',
      requiresApiKey: true,
    },
    {
      id: 'gpt-4.1',
      provider: 'openai',
      name: 'GPT-4 Turbo',
      description: 'Smartest non-reasoning model',
      requiresApiKey: true,
    },
    {
      id: 'gpt-4o',
      provider: 'openai',
      name: 'GPT-4o',
      description: 'Optimized GPT-4 model',
      requiresApiKey: true,
    },
    {
      id: 'gpt-4o-mini',
      provider: 'openai',
      name: 'GPT-4o Mini',
      description: 'Fast and affordable GPT-4 variant',
      requiresApiKey: true,
    },
    {
      id: 'gpt-5',
      provider: 'openai',
      name: 'GPT-5',
      description: 'The best model for coding and agentic tasks across domains',
      requiresApiKey: true,
    },
  ],
  anthropic: [
    {
      id: 'claude-sonnet-4-20250514',
      provider: 'anthropic',
      name: 'Claude Sonnet 4',
      description: 'Most capable Claude model',
      requiresApiKey: true,
    },
    {
      id: 'claude-opus-4-20250514',
      provider: 'anthropic',
      name: 'Claude Opus 4',
      description: 'Most powerful Claude model',
      requiresApiKey: true,
    },
    {
      id: 'claude-3-5-haiku-20241022',
      provider: 'anthropic',
      name: 'Claude 3.5 Haiku',
      description: 'Balanced performance and speed',
      requiresApiKey: true,
    },
    {
      id: 'claude-3-haiku-20240307',
      provider: 'anthropic',
      name: 'Claude 3 Haiku',
      description: 'Fastest Claude model',
      requiresApiKey: true,
    },
  ],
  google: [
    {
      id: 'gemini-2.5-flash',
      provider: 'google',
      name: 'Gemini 2.5 Flash',
      description: 'Fastest Gemini model',
      requiresApiKey: true,
    },
    {
      id: 'gemini-2.5-pro',
      provider: 'google',
      name: 'Gemini 2.5 Pro',
      description: 'Most capable Gemini model',
      requiresApiKey: true,
    },
    {
      id: 'gemini-2.5-flash-lite',
      provider: 'google',
      name: 'Gemini 2.5 Flash Lite',
      description: 'Fast Gemini model for low-resource environments',
      requiresApiKey: true,
    },
    {
      id: 'gemini-2.0-flash',
      provider: 'google',
      name: 'Gemini 2.0 Flash',
      description: 'Second generation workhorse model',
      requiresApiKey: true,
    }
  ],
};

/**
 * Normalize model configs to ensure IDs have no trailing/leading whitespace
 */
function normalizeModelConfigs(): ModelConfig[] {
  return Object.values(MODEL_CONFIGS).flat().map(model => ({
    ...model,
    id: model.id.trim(), // Ensure no whitespace in IDs
  }));
}

/**
 * Get all available models flattened into a single array
 * Uses normalized configs to prevent whitespace issues
 */
export function getAllModels(): ModelConfig[] {
  return normalizeModelConfigs();
}

/**
 * Get model config by ID
 * Trims whitespace and does exact match to prevent issues with trailing spaces
 */
export function getModelConfig(modelId: string): ModelConfig | undefined {
  const trimmedId = modelId.trim();
  return getAllModels().find((model) => model.id === trimmedId || model.id.trim() === trimmedId);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: ProviderId): ModelConfig[] {
  return MODEL_CONFIGS[provider] || [];
}

/**
 * Get provider from model ID
 * Handles trimmed/normalized model IDs
 */
export function getProviderFromModelId(modelId: string): ProviderId | null {
  const trimmedId = modelId.trim();
  const model = getModelConfig(trimmedId);
  return model?.provider || null;
}

/**
 * Default model for each provider
 */
export const DEFAULT_MODELS: Record<ProviderId, string> = {
  openai: 'gpt-4',
  anthropic: 'claude-sonnet-4-20250514',
  google: 'gemini-2.5-pro',
};

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: ProviderId): string {
  return DEFAULT_MODELS[provider];
}

/**
 * Get the best default model based on available API keys
 * Returns the first available provider's default model, or OpenAI as fallback
 */
export function getBestDefaultModel(apiKeys: Record<ProviderId, string | null>): string {
  // Check in order of preference
  if (apiKeys.openai) return DEFAULT_MODELS.openai;
  if (apiKeys.google) return DEFAULT_MODELS.google;
  if (apiKeys.anthropic) return DEFAULT_MODELS.anthropic;
  
  // Fallback to OpenAI if no keys are available
  return DEFAULT_MODELS.openai;
}

/**
 * Provider metadata
 */
export interface ProviderMetadata {
  id: ProviderId;
  name: string;
  apiKeyName: string;
  apiKeyUrl: string;
}

export const PROVIDER_METADATA: Record<ProviderId, ProviderMetadata> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    apiKeyName: 'OpenAI API Key',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    apiKeyName: 'Anthropic API Key',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
  },
  google: {
    id: 'google',
    name: 'Google',
    apiKeyName: 'Google API Key',
    apiKeyUrl: 'https://makersuite.google.com/app/apikey',
  },
};

