"use client"

import ChatNode from '@/components/ChatNode';
import { ApiKeyDialog } from '@/components/ApiKeyDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import handleConnectionEnd from '@/helpers/playground/handle-connection-end';
import { getHistoricalNodeIds } from '@/helpers/playground/get-historical-node-ids';
import { usePlaygroundStore } from '@/store/Playground';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Connection, Controls, EdgeChange, NodeChange, ReactFlow, ReactFlowProvider, SelectionMode, useReactFlow, useStoreApi, Panel } from '@xyflow/react';
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

    const { nodes, setNodes, connectors, setConnectors, setSelectedNodeId, selectedNodeId, setSelectedNodeHistoricalNodeIds, nodeChats, apiKey, fitViewNodeId, setFitViewNodeId } = usePlaygroundStore();
    const { screenToFlowPosition, fitView } = useReactFlow();
    const store = useStoreApi();

    useEffect(() => {
        if (nodes.length) return;
        setNodes(initialNodes);
    }, [nodes, setNodes])

    useEffect(() => {
        if (fitViewNodeId) {
            const node = nodes.find(node => node.id === fitViewNodeId);

            if (node) {
                fitView({
                    nodes: [node],
                    maxZoom: 0.8,
                    duration: 600,
                })
            }
        }
    }, [fitViewNodeId,])


    // update selected node when selection changes
    useEffect(() => {
        const unsubscribe = store.subscribe((state) => {
            const selectedNodes = Array.from(state.nodeLookup.values()).filter((node: any) => node.selected);
            if (selectedNodes.length === 1) {
                setSelectedNodeId(selectedNodes[0].id);
            } else {
                setSelectedNodeId(null);
            }
        });

        return () => unsubscribe();
    }, [])

    useEffect(() => {
        if (!selectedNodeId) {
            setSelectedNodeHistoricalNodeIds([]);
        } else {
            // Recursively find all source nodes connected to the selected node
            const historicalNodeIds = getHistoricalNodeIds(selectedNodeId, connectors);
            console.log('historicalNodeIds', historicalNodeIds);
            setSelectedNodeHistoricalNodeIds(historicalNodeIds);
        }
    }, [selectedNodeId, connectors, setSelectedNodeHistoricalNodeIds])

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes(applyNodeChanges(changes, nodes)),
        [nodes, setNodes, nodeChats, apiKey],
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
                // @ts-ignore
                store,
                nodes,
                setNodes,
                connectors,
                setConnectors,
            });
        },
        [nodes, setNodes, connectors, setConnectors, screenToFlowPosition, store]
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

                panOnDrag={false}
                panOnScroll={true}
                nodesDraggable={true}

                selectionOnDrag
                selectionMode={SelectionMode.Partial}

                fitView
            >
                <Background variant={BackgroundVariant.Dots} />
                {/* <Controls /> */}
                <Panel position="top-right" className="m-2 flex items-center gap-2">
                    <ThemeToggle />
                    <ApiKeyDialog />
                </Panel>
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