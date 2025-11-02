import { Edge, Node } from '@xyflow/react';


export type NodeChat = {
  id: string
  createdAt: string
  nodeId: string
  messages: any[]
  source?: string
}

/**
 * Complete playground state that gets saved to IndexedDB
 */
export type PlaygroundState = {
  nodes: Node[];
  connectors: Edge[];
  nodeChats: NodeChat[];
}