import { ChatRequestOptions, UIMessage, UIDataTypes, UITools } from '@ai-sdk/react';

type NodeChat = {
    id: string
    createdAt: string
    nodeId: string
    messages: any[]
    source?: string
    modelId?: string // Model ID for this chat node (e.g., 'gpt-4', 'claude-3-5-sonnet-20241022')
}