"use client";

import { useState } from "react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children' | 'onCopy'> {
  text: string;
  onCopy?: (text: string) => void;
  showText?: boolean;
  copiedText?: string;
  defaultText?: string;
}

/**
 * Reusable CopyButton component that copies text to clipboard
 * @param text - The text to copy
 * @param onCopy - Optional callback when copy succeeds
 * @param showText - Whether to show text label or just icon
 * @param copiedText - Text to show when copied (default: "Copied!")
 * @param defaultText - Default text to show (default: "Copy")
 */
export function CopyButton({
  text,
  onCopy,
  showText = false,
  copiedText = "Copied!",
  defaultText = "Copy",
  className,
  variant = "ghost",
  size = "icon",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text.trim()) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.(text);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        onCopy?.(text);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={cn("transition-all", className)}
      disabled={!text.trim() || props.disabled}
      {...props}
    >
      {copied ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 9 7 12 14 5" />
          </svg>
          {showText && <span>{copiedText}</span>}
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="4" width="10" height="10" rx="1" />
            <path d="M4 6h10v-2a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2z" />
          </svg>
          {showText && <span>{defaultText}</span>}
        </>
      )}
    </Button>
  );
}
