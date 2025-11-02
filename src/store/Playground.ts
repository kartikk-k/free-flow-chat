import { Edge, Node } from '@xyflow/react';
import { create } from 'zustand';
import { NodeChat } from '../../typings';
import { DEFAULT_MODELS } from '@/lib/models/config';
import type { ProviderId } from '@/lib/models/config';


interface PlaygroundStore {
    nodes: Node[];
    connectors: Edge[];

    setNodes: (nodes: Node[]) => void;
    setConnectors: (connectors: Edge[]) => void;

    nodeChats: NodeChat[]
    setNodeChats: (nodeChat: NodeChat[]) => void;

    selectedNodeId: string | null;
    setSelectedNodeId: (nodeId: string | null) => void;

    selectedNodeHistoricalNodeIds: string[] | null;
    setSelectedNodeHistoricalNodeIds: (nodeIds: string[] | null) => void;

    // API keys for different providers
    apiKeys: Record<ProviderId, string | null>;
    setApiKey: (provider: ProviderId, apiKey: string | null) => void;
    getApiKey: (provider: ProviderId) => string | null;

    fitViewNodeId: string | null;
    setFitViewNodeId: (nodeId: string | null) => void;

    reset: () => void;
}

export const usePlaygroundStore = create<PlaygroundStore>((set, get) => ({
    nodes: [],
    connectors: [],

    setNodes: (nodes) => set({ nodes }),
    setConnectors: (connectors) => set({ connectors }),

    nodeChats: [],
    setNodeChats: (nodeChats) => set({ nodeChats }),

    selectedNodeId: null,
    setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),

    selectedNodeHistoricalNodeIds: null,
    setSelectedNodeHistoricalNodeIds: (selectedNodeHistoricalNodeIds) => set({ selectedNodeHistoricalNodeIds }),

    apiKeys: {
        openai: null,
        anthropic: null,
        google: null,
    },
    setApiKey: (provider, apiKey) => set((state) => ({
        apiKeys: {
            ...state.apiKeys,
            [provider]: apiKey,
        },
    })),
    getApiKey: (provider) => {
        const state = get();
        return state.apiKeys[provider] || null;
    },

    fitViewNodeId: null,
    setFitViewNodeId: (fitViewNodeId) => set({ fitViewNodeId }),

    reset: () => {
        set({
            nodes: [],
            connectors: [],
            nodeChats: [],
            selectedNodeId: null,
            selectedNodeHistoricalNodeIds: null,
        })
    }

}));