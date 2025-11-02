import { addEdge, type ReactFlowStore } from '@xyflow/react';

interface HandleConnectionEndParams {
    event: MouseEvent | TouchEvent;
    connectionState: any;
    screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number };
    store: ReactFlowStore;
    nodes: any[];
    setNodes: (nodes: any[]) => void;
    connectors: any[];
    setConnectors: (connectors: any[]) => void;
}

export default function handleConnectionEnd({
    event,
    connectionState,
    screenToFlowPosition,
    store,
    nodes,
    setNodes,
    connectors,
    setConnectors,
}: HandleConnectionEndParams) {
    console.log('onConnectEnd triggered', { event, connectionState });

    // Check if connection is from the bottom handle (a4)
    const sourceHandleId = connectionState?.fromHandle?.id;
    console.log('Source handle ID:', sourceHandleId);

    // Only create new node if:
    // 1. No target node was connected
    // 2. Connection is from bottom handle (a4)
    if (!connectionState || !connectionState.toNode) {
        if (sourceHandleId !== 'a4') {
            console.log('Connection not from bottom handle (a4), ignoring');
            return;
        }

        console.log('No target node found and connection from bottom handle, creating new node');

        // Get the parent node to calculate width offset
        // @ts-ignore
        const { nodeLookup } = store.getState();
        const parentNode = connectionState?.fromNode ? nodeLookup.get(connectionState.fromNode.id) : null;

        console.log('Parent node:', parentNode);

        // Get the exact screen coordinates where the connection was dropped
        const isTouchEvent = 'touches' in event;
        let clientX = isTouchEvent ? event.touches[0].clientX : event.clientX;
        let clientY = isTouchEvent ? event.touches[0].clientY : event.clientY;

        console.log('Screen coordinates (before adjustment):', { clientX, clientY });

        // Subtract half of the parent node's width from clientX
        if (parentNode?.measured?.width) {
            const halfWidth = parentNode.measured.width / 4 ;
            clientX -= halfWidth;
            console.log('Parent node width:', parentNode.measured.width, 'Half width:', halfWidth);
        }

        console.log('Screen coordinates (after adjustment):', { clientX, clientY });

        // Convert screen coordinates to flow coordinates (accounts for zoom and pan)
        const position = screenToFlowPosition({
            x: clientX,
            y: clientY,
        });

        console.log('Flow position (final):', position);

        // Create new node
        const newNode = {
            id: `n${Date.now()}`,
            position,
            data: { label: `Node ${nodes.length + 1}` },
            type: 'chatNode',
            dragHandle: '.drag-handle__ChatNode',
        };

        console.log('New node created:', newNode);
        setNodes([...nodes, newNode]);

        // If there's a source node in connectionState, create an edge
        if (connectionState?.fromNode) {
            console.log('Creating edge from source to new node:', connectionState.fromNode.id, '->', newNode.id);
            const newEdge = {
                id: `${connectionState.fromNode.id}-${newNode.id}`,
                source: connectionState.fromNode.id,
                sourceHandle: sourceHandleId,
                target: newNode.id,
            };
            // @ts-ignore
            setConnectors(addEdge(newEdge, connectors));
        }
    } else {
        console.log('Connection made to existing node:', connectionState.toNode.id);
    }
}