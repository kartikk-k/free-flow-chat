"use client"

import { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { usePlaygroundStore } from '@/store/Playground';
import { getApiKey, saveApiKey, removeApiKey, getExaApiKey, saveExaApiKey, removeExaApiKey } from '@/lib/storage';
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
  const [exaApiKeyInput, setExaApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showExaApiKey, setShowExaApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { apiKey, setApiKey, exaApiKey, setExaApiKey } = usePlaygroundStore();

  // Load API keys from localStorage on mount
  useEffect(() => {
    const storedKey = getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setApiKeyInput(storedKey);
    }

    const storedExaKey = getExaApiKey();
    if (storedExaKey) {
      setExaApiKey(storedExaKey);
      setExaApiKeyInput(storedExaKey);
    }
  }, [setApiKey, setExaApiKey]);

  const handleSave = () => {
    if (!apiKeyInput.trim()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return;
    }

    const openAiSuccess = saveApiKey(apiKeyInput);
    const exaSuccess = exaApiKeyInput.trim() ? saveExaApiKey(exaApiKeyInput) : true;

    if (openAiSuccess && exaSuccess) {
      setApiKey(apiKeyInput);
      if (exaApiKeyInput.trim()) {
        setExaApiKey(exaApiKeyInput);
      }
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
    removeExaApiKey();
    setApiKey(null);
    setExaApiKey(null);
    setApiKeyInput('');
    setExaApiKeyInput('');
    setSaveStatus('success');
    window.location.reload();
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
      setShowExaApiKey(false);
      // Reset inputs to current API keys
      setApiKeyInput(apiKey || '');
      setExaApiKeyInput(exaApiKey || '');
    }
  };

  useEffect(() => {
    if(!apiKey?.trim()){
      setOpen(true);
    }else{
      setOpen(false);
    }
  }, [apiKey])

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
          <DialogTitle className="text-white font-medium text-base">API Keys</DialogTitle>
          <DialogDescription className="text-white/70 text-[13px] -mt-1">
            Enter your API keys to use the chat functionality. Your keys are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="api-key" className='text-xs text-white'>OpenAI API Key (Required)</Label>
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="exa-api-key" className='text-xs text-white'>Exa API Key (Optional - for web search)</Label>
            <div className="relative">
              <Input
                id="exa-api-key"
                type={showExaApiKey ? "text" : "password"}
                placeholder="Enter Exa API key..."
                value={exaApiKeyInput}
                onChange={(e) => setExaApiKeyInput(e.target.value)}
                className="pr-10 bg-white/20 border-2 border-white/20 focus-visible:border-white/60 font-mono text-white/80 font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowExaApiKey(!showExaApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                {showExaApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {saveStatus === 'success' && (
            <p className="flex items-center gap-1.5 text-sm text-green-500">
              <Check className="h-4 w-4" />
              API keys saved successfully
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="flex items-center gap-1.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              Please enter a valid OpenAI API key
            </p>
          )}

          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-xs text-white/80 leading-relaxed">
              <strong className="text-white">Note:</strong> Your API keys are stored locally in your browser and sent only to their respective services. They are never sent to our servers.
            </p>
          </div>

          <div className="text-xs text-white/80 space-y-2 mt-0">
            <div>
              <p>Don't have an OpenAI API key?</p>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline font-medium"
              >
                Get one from OpenAI →
              </a>
            </div>
            <div>
              <p>Don't have an Exa API key?</p>
              <a
                href="https://dashboard.exa.ai/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline font-medium"
              >
                Get one from Exa →
              </a>
            </div>
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
