import { UIMessage, UIDataTypes, UITools } from '@ai-sdk/react';

type NodeChat = {
    id: string
    nodeId: string
    message: UIMessage<unknown, UIDataTypes, UITools> | null
    source?: string
}