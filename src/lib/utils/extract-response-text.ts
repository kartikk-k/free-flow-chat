import { UIMessage } from '@ai-sdk/react';

/**
 * Extracts all assistant response text from messages
 * @param messages - Array of UI messages
 * @returns Combined text from all assistant messages
 */
export function extractResponseText(
  messages: any[]
): string {
  const textParts: string[] = [];

  for (const message of messages) {
    if (message.role === 'assistant' && message.parts) {
      for (const part of message.parts) {
        if (part.type === 'text' && typeof part.text === 'string') {
          textParts.push(part.text);
        } else if (part.type === 'reasoning' && typeof part.text === 'string') {
          textParts.push(part.text);
        }
      }
    }
  }

  return textParts.join('\n\n').trim();
}
