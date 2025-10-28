"use client"

import { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { usePlaygroundStore } from '@/store/Playground';
import { getApiKey, saveApiKey, removeApiKey } from '@/lib/storage';
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
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { apiKey, setApiKey } = usePlaygroundStore();

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setApiKeyInput(storedKey);
    }
  }, [setApiKey]);

  const handleSave = () => {
    if (!apiKeyInput.trim()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return;
    }

    const success = saveApiKey(apiKeyInput);
    if (success) {
      setApiKey(apiKeyInput);
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        setOpen(false);
      }, 1000);
      window.location.reload();
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleRemove = () => {
    removeApiKey();
    setApiKey(null);
    setApiKeyInput('');
    setSaveStatus('success');
    setTimeout(() => {
      setSaveStatus('idle');
      setOpen(false);
    }, 1000);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      setSaveStatus('idle');
      setShowApiKey(false);
      // Reset input to current API key
      setApiKeyInput(apiKey || '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg shadow-none bg-black/10 border-none"
          title="API Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><title>key-2</title><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><line x1="8.296" y1="9.704" x2="15.25" y2="2.75"></line><line x1="14" y1="4" x2="16" y2="6"></line><line x1="12" y1="6" x2="14" y2="8"></line><circle cx="6" cy="12" r="3.25"></circle></g></svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle className="text-white font-medium text-base">OpenAI API Key</DialogTitle>
          <DialogDescription className="text-white/70 text-[13px] -mt-1">
            Enter your OpenAI API key to use the chat functionality. Your key is stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="api-key" className='text-xs text-white'>API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="pr-10 bg-white/20 border-2 border-white/20 focus-visible:border-white/60 font-mono text-white/80 font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {saveStatus === 'success' && (
              <p className="flex items-center gap-1.5 text-sm text-green-500">
                <Check className="h-4 w-4" />
                API key saved successfully
              </p>
            )}
            {saveStatus === 'error' && (
              <p className="flex items-center gap-1.5 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                Please enter a valid API key
              </p>
            )}
          </div>

          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-xs text-white/80 leading-relaxed">
              <strong className="text-white">Note:</strong> Your API key is stored locally in your browser and is only sent directly to OpenAI's servers. It is never sent to any other server or stored on our servers.
            </p>
          </div>

          <div className="text-xs text-white/80 space-y-1 mt-0">
            <p>Don't have an API key?</p>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-medium"
            >
              Get one from OpenAI →
            </a>
          </div>
        </div>

        <DialogFooter className="gap-1 mt-2">
          {apiKey && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={saveStatus !== 'idle'}
              className='bg-red-500/20 text-red-300 hover:brightness-120 border-none shadow-none text-[13px] h-8'
            >
              Remove Key
            </Button>
          )}
          <Button
            type="submit"
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className='bg-white/20 text-white text-[13px] h-8 shadow-none'
          >
            {saveStatus === 'success' ? 'Saved!' : 'Save Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
