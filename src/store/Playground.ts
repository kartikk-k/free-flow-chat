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
}

export const usePlaygroundStore = create<PlaygroundStore>((set) => ({
    nodes: [],
    connectors: [],

    setNodes: (nodes) => set({ nodes }),
    setConnectors: (connectors) => set({ connectors }),

    nodeChats: [],
    setNodeChats: (nodeChats) => set({ nodeChats })

}));