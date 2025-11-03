"use client"

import { useState, useEffect, startTransition } from 'react';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { usePlaygroundStore } from '@/store/Playground';
import { saveApiKey, removeApiKey, getAllApiKeys } from '@/lib/storage';
import { PROVIDER_METADATA, type ProviderId } from '@/lib/models/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ApiKeyDialog() {
  const [open, setOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<ProviderId>('openai');
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<ProviderId, string>>({
    openai: '',
    anthropic: '',
    google: '',
  });
  const [showApiKeys, setShowApiKeys] = useState<Record<ProviderId, boolean>>({
    openai: false,
    anthropic: false,
    google: false,
  });
  const [saveStatus, setSaveStatus] = useState<Record<ProviderId, 'idle' | 'success' | 'error'>>({
    openai: 'idle',
    anthropic: 'idle',
    google: 'idle',
  });
  
  const { apiKeys, setApiKey } = usePlaygroundStore();

  // Load API keys from localStorage on mount
  useEffect(() => {
    const allKeys = getAllApiKeys();
    const store = usePlaygroundStore.getState();
    
    Object.entries(allKeys).forEach(([provider, key]) => {
      if (key) {
        store.setApiKey(provider as ProviderId, key);
        setApiKeyInputs(prev => ({
          ...prev,
          [provider]: key || '',
        }));
      }
    });
  }, []);

  const handleSave = (provider: ProviderId) => {
    const apiKey = apiKeyInputs[provider]?.trim() || '';
    
    if (!apiKey) {
      setSaveStatus(prev => ({ ...prev, [provider]: 'error' }));
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [provider]: 'idle' })), 2000);
      return;
    }

    const success = saveApiKey(provider, apiKey);
    if (success) {
      setApiKey(provider, apiKey);
      setSaveStatus(prev => ({ ...prev, [provider]: 'success' }));
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [provider]: 'idle' }));
      }, 1000);
    } else {
      setSaveStatus(prev => ({ ...prev, [provider]: 'error' }));
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [provider]: 'idle' })), 2000);
    }
  };

  const handleRemove = (provider: ProviderId) => {
    removeApiKey(provider);
    setApiKey(provider, null);
    setApiKeyInputs(prev => ({ ...prev, [provider]: '' }));
    setSaveStatus(prev => ({ ...prev, [provider]: 'success' }));
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, [provider]: 'idle' }));
    }, 1000);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      Object.keys(saveStatus).forEach(provider => {
        setSaveStatus(prev => ({ ...prev, [provider]: 'idle' }));
      });
      Object.keys(showApiKeys).forEach(provider => {
        setShowApiKeys(prev => ({ ...prev, [provider]: false }));
      });
      // Reset inputs to current API keys
      Object.entries(apiKeys).forEach(([provider, key]) => {
        setApiKeyInputs(prev => ({
          ...prev,
          [provider]: key || '',
        }));
      });
    }
  };

  // Check if any API key is missing
  const hasAnyKey = Object.values(apiKeys).some(key => key?.trim());
  
  useEffect(() => {
    if (!hasAnyKey) {
      // Use startTransition to defer state update and avoid synchronous setState in effect
      startTransition(() => {
        setOpen(true);
      });
    }
  }, [hasAnyKey]);

  const providerMetadata = PROVIDER_METADATA[activeProvider];
  const currentInput = apiKeyInputs[activeProvider];
  const currentStatus = saveStatus[activeProvider];
  const showKey = showApiKeys[activeProvider];
  const hasKey = !!apiKeys[activeProvider]?.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg shadow-none bg-black/10 border-none"
          title="API Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>key-2</title><g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor"><line x1="8.296" y1="9.704" x2="15.25" y2="2.75"></line><line x1="14" y1="4" x2="16" y2="6"></line><line x1="12" y1="6" x2="14" y2="8"></line><circle cx="6" cy="12" r="3.25"></circle></g></svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-medium text-base">API Keys</DialogTitle>
          <DialogDescription className="text-white/70 text-[13px] -mt-1">
            Add API keys for different providers. Your keys are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        {/* Provider Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          {(['openai', 'anthropic', 'google'] as ProviderId[]).map((provider) => {
            const metadata = PROVIDER_METADATA[provider];
            const isActive = activeProvider === provider;
            const hasProviderKey = !!apiKeys[provider]?.trim();
            
            return (
              <button
                key={provider}
                onClick={() => setActiveProvider(provider)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                  }
                  ${hasProviderKey ? 'border border-white/20' : ''}
                `}
              >
                {metadata.name}
                {hasProviderKey && (
                  <span className="ml-2 text-xs">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Current Provider Form */}
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="api-key" className='text-xs text-white'>
              {providerMetadata.apiKeyName}
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="sk-... or api-..."
                value={currentInput}
                onChange={(e) => setApiKeyInputs(prev => ({
                  ...prev,
                  [activeProvider]: e.target.value,
                }))}
                className="pr-10 bg-white/20 border-2 border-white/20 focus-visible:border-white/60 font-mono text-white/80 font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave(activeProvider);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowApiKeys(prev => ({
                  ...prev,
                  [activeProvider]: !prev[activeProvider],
                }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {currentStatus === 'success' && (
              <p className="flex items-center gap-1.5 text-sm text-green-500">
                <Check className="h-4 w-4" />
                API key saved successfully
              </p>
            )}
            {currentStatus === 'error' && (
              <p className="flex items-center gap-1.5 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                Please enter a valid API key
              </p>
            )}
          </div>

          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-xs text-white/80 leading-relaxed">
              <strong className="text-white">Note:</strong> Your API key is stored locally in your browser and is only sent directly to {providerMetadata.name}&apos;s servers. It is never sent to any other server or stored on our servers.
            </p>
          </div>

          <div className="text-xs text-white/80 space-y-1 mt-0">
            <p>Don&apos;t have an API key?</p>
            <a
              href={providerMetadata.apiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-medium"
            >
              Get one from {providerMetadata.name} →
            </a>
          </div>
        </div>

        <DialogFooter className="gap-1 mt-2">
          {hasKey && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleRemove(activeProvider)}
              disabled={currentStatus !== 'idle'}
              className='bg-red-500/20 text-red-300 hover:brightness-120 border-none shadow-none text-[13px] h-8'
            >
              Remove Key
            </Button>
          )}
          <Button
            type="submit"
            onClick={() => handleSave(activeProvider)}
            disabled={currentStatus !== 'idle'}
            className='bg-white/20 text-white text-[13px] h-8 shadow-none'
          >
            {currentStatus === 'success' ? 'Saved!' : 'Save Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
