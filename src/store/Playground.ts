import { Edge, Node } from '@xyflow/react';
import { create } from 'zustand';
import { NodeChat } from '../../typings';


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
    setApiKey: (apiKey) => set({ apiKey })

}));