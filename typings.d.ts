import { ChatRequestOptions, UIMessage, UIDataTypes, UITools } from '@ai-sdk/react';

type NodeChat = {
    id: string
    createdAt: string
    nodeId: string
    messages: any[]
    source?: string
}