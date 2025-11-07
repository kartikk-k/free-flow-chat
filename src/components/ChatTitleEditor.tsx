"use client"

import { useState, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { updateChatMetadata } from '@/lib/db/indexeddb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatTitleEditorProps {
  chatId: string;
  initialTitle: string;
  onTitleUpdate?: (newTitle: string) => void;
}

export function ChatTitleEditor({ chatId, initialTitle, onTitleUpdate }: ChatTitleEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setTempTitle(initialTitle);
  }, [initialTitle]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setTempTitle(title);
  };

  const handleSave = async () => {
    if (!tempTitle.trim()) {
      setTempTitle(title);
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      await updateChatMetadata(chatId, { title: tempTitle.trim() });
      setTitle(tempTitle.trim());
      onTitleUpdate?.(tempTitle.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update title:', error);
      alert('Failed to update title. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempTitle(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-1.5 pl-2">
        <Input
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="h-6 text-sm border-none shadow-none focus-visible:ring-0 px-0"
          disabled={saving}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSave}
          disabled={saving}
          className="h-7 w-7 text-success hover:text-success-hover hover:bg-success-bg"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancel}
          disabled={saving}
          className="h-7 w-7 text-error hover:text-error-hover hover:bg-error-bg"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-sm font-medium text-foreground">{title}</span>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleStartEdit}
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
