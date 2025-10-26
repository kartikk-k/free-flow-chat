import { Edge } from '@xyflow/react';

/**
 * Recursively finds all source nodes connected to a target node
 * @param targetNodeId - The ID of the target node
 * @param connectors - All edges/connectors in the flow
 * @returns Array of all connected node IDs (including the target node itself)
 */
export function getHistoricalNodeIds(
    targetNodeId: string,
    connectors: Edge[]
): string[] {
    const visitedNodes = new Set<string>();

    function findSourceNodes(nodeId: string): void {
        // Avoid infinite loops
        if (visitedNodes.has(nodeId)) {
            return;
        }

        // Mark this node as visited
        visitedNodes.add(nodeId);

        // Find all edges that have this node as target
        const incomingEdges = connectors.filter(
            connector => connector.target === nodeId
        );

        console.log(`Node ${nodeId} has ${incomingEdges.length} incoming edges`);

        // Recursively process all source nodes
        for (const edge of incomingEdges) {
            findSourceNodes(edge.source);
        }
    }

    // Start the recursion from the target node
    findSourceNodes(targetNodeId);

    console.log('All historical nodes:', Array.from(visitedNodes));

    return Array.from(visitedNodes);
}
