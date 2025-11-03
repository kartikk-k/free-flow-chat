"use client"

import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  MODEL_CONFIGS,
  getModelConfig,
  getProviderFromModelId,
  type ProviderId,
} from '@/lib/models/config';
import { cn } from '@/lib/utils';

/**
 * Provider SVG Icons
 */
function ProviderIcon({ provider, className }: { provider: ProviderId; className?: string }) {
  switch (provider) {
    case 'openai':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cn('size-5', className)} viewBox="0 0 24 24" fill="rgb(0, 0, 0)" stroke="none" stroke-width="1px" opacity="1" filter="none">
          <path fill="currentColor" d="M20.562 10.188c.25-.688.313-1.376.25-2.063c-.062-.687-.312-1.375-.625-2c-.562-.937-1.375-1.687-2.312-2.125c-1-.437-2.063-.562-3.125-.312c-.5-.5-1.063-.938-1.688-1.25S11.687 2 11 2a5.17 5.17 0 0 0-3 .938c-.875.624-1.5 1.5-1.813 2.5c-.75.187-1.375.5-2 .875c-.562.437-1 1-1.375 1.562c-.562.938-.75 2-.625 3.063a5.44 5.44 0 0 0 1.25 2.874a4.7 4.7 0 0 0-.25 2.063c.063.688.313 1.375.625 2c.563.938 1.375 1.688 2.313 2.125c1 .438 2.062.563 3.125.313c.5.5 1.062.937 1.687 1.25S12.312 22 13 22a5.17 5.17 0 0 0 3-.937c.875-.625 1.5-1.5 1.812-2.5a4.54 4.54 0 0 0 1.938-.875c.562-.438 1.062-.938 1.375-1.563c.562-.937.75-2 .625-3.062c-.125-1.063-.5-2.063-1.188-2.876m-7.5 10.5c-1 0-1.75-.313-2.437-.875c0 0 .062-.063.125-.063l4-2.312a.5.5 0 0 0 .25-.25a.57.57 0 0 0 .062-.313V11.25l1.688 1v4.625a3.685 3.685 0 0 1-3.688 3.813M5 17.25c-.438-.75-.625-1.625-.438-2.5c0 0 .063.063.125.063l4 2.312a.56.56 0 0 0 .313.063c.125 0 .25 0 .312-.063l4.875-2.812v1.937l-4.062 2.375A3.7 3.7 0 0 1 7.312 19c-1-.25-1.812-.875-2.312-1.75M3.937 8.563a3.8 3.8 0 0 1 1.938-1.626v4.751c0 .124 0 .25.062.312a.5.5 0 0 0 .25.25l4.875 2.813l-1.687 1l-4-2.313a3.7 3.7 0 0 1-1.75-2.25c-.25-.937-.188-2.062.312-2.937M17.75 11.75l-4.875-2.812l1.687-1l4 2.312c.625.375 1.125.875 1.438 1.5s.5 1.313.437 2.063a3.7 3.7 0 0 1-.75 1.937c-.437.563-1 1-1.687 1.25v-4.75c0-.125 0-.25-.063-.312c0 0-.062-.126-.187-.188m1.687-2.5s-.062-.062-.125-.062l-4-2.313c-.125-.062-.187-.062-.312-.062s-.25 0-.313.062L9.812 9.688V7.75l4.063-2.375c.625-.375 1.312-.5 2.062-.5c.688 0 1.375.25 2 .688c.563.437 1.063 1 1.313 1.625s.312 1.375.187 2.062m-10.5 3.5l-1.687-1V7.063c0-.688.187-1.438.562-2C8.187 4.438 8.75 4 9.375 3.688a3.37 3.37 0 0 1 2.062-.313c.688.063 1.375.375 1.938.813c0 0-.063.062-.125.062l-4 2.313a.5.5 0 0 0-.25.25c-.063.125-.063.187-.063.312zm.875-2L12 9.5l2.187 1.25v2.5L12 14.5l-2.188-1.25z"></path>
        </svg>
      );
    case 'anthropic':
      // Claude/Anthropic official logo
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cn('size-5', className)} viewBox="0 0 24 24" fill="rgb(0, 0, 0)" stroke="none" stroke-width="1px" opacity="1" filter="none">
          <path fill="currentColor" d="M16.765 5h-3.308l5.923 15h3.23zM7.226 5L1.38 20h3.308l1.307-3.154h6.154l1.23 3.077h3.309L10.688 5zm-.308 9.077l2-5.308l2.077 5.308z"></path>
        </svg>
      );
    case 'google':
      // Google Gemini official logo
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cn('size-5', className)} viewBox="0 0 24 24" fill="rgb(0, 0, 0)" stroke="none" stroke-width="1px" opacity="1" filter="none">
          <path fill="currentColor" d="M24 12.024c-6.437.388-11.59 5.539-11.977 11.976h-.047C11.588 17.563 6.436 12.412 0 12.024v-.047C6.437 11.588 11.588 6.437 11.976 0h.047c.388 6.437 5.54 11.588 11.977 11.977z"></path>
        </svg>
      );
    default:
      return null;
  }
}

interface ModelSwitcherProps {
  /**
   * Currently selected model ID
   */
  currentModelId: string;

  /**
   * Callback when model changes
   */
  onModelChange: (modelId: string) => void;

  /**
   * Optional className for styling
   */
  className?: string;

  /**
   * Show model description in the trigger button
   */
  showDescription?: boolean;

  /**
   * Compact mode (smaller button)
   */
  compact?: boolean;
}

/**
 * Scalable Model Switcher Component
 * 
 * Features:
 * - Supports multiple providers (OpenAI, Anthropic, Google)
 * - Easy to extend with new providers/models
 * - Clean, reusable interface
 * - Grouped by provider in context menu
 */
export function ModelSwitcher({
  currentModelId,
  onModelChange,
  className,
  showDescription = false,
  compact = false,
}: ModelSwitcherProps) {
  const currentModel = getModelConfig(currentModelId);
  const displayName = currentModel?.name || currentModelId;
  const provider = getProviderFromModelId(currentModelId) || 'openai';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'px-2 h-9 pr-3 rounded-lg border border-black/15 flex items-center gap-1',
            'hover:bg-neutral-100 transition-colors',
            compact && 'h-8 px-2 text-sm',
            className
          )}
        >
          <ProviderIcon provider={provider} />
          <span className="font-medium">{displayName}</span>
          {showDescription && currentModel?.description && (
            <span className="text-xs text-neutral-500 ml-1">
              {currentModel.description}
            </span>
          )}
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[240px]" side='right' align='start'>
        <DropdownMenuRadioGroup
          value={currentModelId}
          onValueChange={(value) => {
            if (value) {
              onModelChange(value);
            }
          }}
        >
          {/* Render models grouped by provider */}
          {(['openai', 'anthropic', 'google'] as ProviderId[]).map(
            (provider, index) => {
              const models = MODEL_CONFIGS[provider];
              if (!models || models.length === 0) return null;

              return (
                <div key={provider}>
                  {index > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="flex items-center gap-1.5">
                    <ProviderIcon provider={provider as ProviderId} className="size-4" />
                    <span>
                      {provider === 'openai'
                        ? 'OpenAI'
                        : provider === 'anthropic'
                          ? 'Anthropic'
                          : 'Google'}
                    </span>
                  </DropdownMenuLabel>
                  {models.map((model) => (
                    <DropdownMenuRadioItem
                      key={model.id}
                      value={model.id}
                      className="pl-6"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{model.name}</span>
                        {model.description && (
                          <span className="text-xs text-white/70 font-medium mt-0.5">
                            {model.description}
                          </span>
                        )}
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </div>
              );
            }
          )}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

