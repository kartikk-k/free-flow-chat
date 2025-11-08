import { Edge, Node } from '@xyflow/react';
import { create } from 'zustand';
import { NodeChat } from '@/types/chat';


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

    apiKey: string | null;
    setApiKey: (apiKey: string | null) => void;

    exaApiKey: string | null;
    setExaApiKey: (exaApiKey: string | null) => void;

    fitViewNodeId: string | null;
    setFitViewNodeId: (nodeId: string | null) => void;

    reset: () => void;
}

export const usePlaygroundStore = create<PlaygroundStore>((set) => ({
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

    apiKey: null,
    setApiKey: (apiKey) => set({ apiKey }),

    exaApiKey: null,
    setExaApiKey: (exaApiKey) => set({ exaApiKey }),

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