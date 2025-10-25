import { Edge, Node } from '@xyflow/react';
import { create } from 'zustand';


interface PlaygroundStore {
    nodes: Node[];
    connectors: Edge[];

    setNodes: (nodes: Node[]) => void;
    setConnectors: (connectors: Edge[]) => void;
}

export const usePlaygroundStore = create<PlaygroundStore>((set) => ({
    nodes: [],
    connectors: [],

    setNodes: (nodes) => set({ nodes }),
    setConnectors: (connectors) => set({ connectors }),
}));