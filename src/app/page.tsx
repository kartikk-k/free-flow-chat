"use client"

import CNode from '@/components/CNode';
import ENode from '@/components/ENode';
import RNode from '@/components/RNode';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Connection, Controls, Edge, EdgeChange, Node, NodeChange, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useState } from 'react';


const nodeTypes = {
  customNode: CNode,
  rNode: RNode,
  eNode: ENode,
};

const initialNodes = [
  { id: 'n3', position: { x: 0, y: 200 }, data: { label: 'Node 3' }, type: 'customNode', dragHandle: '.drag-handle__cNode' },
  { id: 'n5', position: { x: 100, y: 600 }, data: { label: 'Node 5' }, type: 'rNode', dragHandle: '.drag-handle__rNode' },
  { id: 'n6', position: { x: 900, y: 400 }, data: { label: 'Node 6' }, type: 'eNode', dragHandle: '.drag-handle__eNode' },
  { id: 'n8', position: { x: 1400, y: 600 }, data: { label: 'Node 7' }, type: 'eNode', dragHandle: '.drag-handle__eNode' },
];

const initialEdges = [{ id: 'n3-n4', source: 'n3', target: 'n4' }];

export default function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // onNodeClick={e => handleNodeClick("n8", 0, [])}
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