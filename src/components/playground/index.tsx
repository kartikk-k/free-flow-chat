"use client"

import ChatNode from '@/components/ChatNode';
import { usePlaygroundStore } from '@/store/Playground';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Connection, Controls, EdgeChange, NodeChange, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect } from 'react';

const initialNodes = [
    { id: 'n1', position: { x: 0, y: 200 }, data: { label: 'Node 3' }, type: 'chatNode', dragHandle: '.drag-handle__ChatNode' },
    // { id: 'n2', position: { x: 200, y: 600 }, data: { label: 'Node 4' }, type: 'chatNode', dragHandle: '.drag-handle__ChatNode' },
];
// const initialEdges = [{ id: 'n3-n4', source: 'n3', target: 'n4' }];


const nodeTypes = {
    chatNode: ChatNode,
};


function Playground() {

    const { nodes, setNodes, connectors, setConnectors } = usePlaygroundStore();

    useEffect(() => {
        if (nodes.length) return;
        setNodes(initialNodes);
    }, [nodes, setNodes])

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes(applyNodeChanges(changes, nodes)),
        [nodes, setNodes],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setConnectors(applyEdgeChanges(changes, connectors)),
        [connectors, setConnectors],
    );

    const onConnect = useCallback(
        (params: Connection) => setConnectors(addEdge(params, connectors)),
        [connectors, setConnectors],
    );

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                nodeTypes={nodeTypes}
                edges={connectors}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodesDraggable={true}
                panOnDrag={false}
                panOnScroll={true}
                fitView
            >
                <Background variant={BackgroundVariant.Dots} />
                <Controls />
            </ReactFlow>
        </div>
    );
}

export default Playground;