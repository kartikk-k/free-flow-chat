"use client"

import ChatNode from '@/components/ChatNode';
import handleConnectionEnd from '@/helpers/playground/handle-connection-end';
import { usePlaygroundStore } from '@/store/Playground';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Connection, Controls, EdgeChange, NodeChange, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react';
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


function PlaygroundContent() {

    const { nodes, setNodes, connectors, setConnectors } = usePlaygroundStore();
    const { screenToFlowPosition } = useReactFlow();

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

    const onConnectEnd = useCallback(
        (event: MouseEvent | TouchEvent, connectionState: any) => {
            handleConnectionEnd({
                event,
                connectionState,
                screenToFlowPosition,
                nodes,
                setNodes,
                connectors,
                setConnectors,
            });
        },
        [nodes, setNodes, connectors, setConnectors, screenToFlowPosition]
    )

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                nodeTypes={nodeTypes}
                edges={connectors}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnectEnd={onConnectEnd}
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

function Playground() {
    return (
        <ReactFlowProvider>
            <PlaygroundContent />
        </ReactFlowProvider>
    );
}

export default Playground;