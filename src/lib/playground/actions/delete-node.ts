import { usePlaygroundStore } from "@/store/Playground";

export default function deleteNode(nodeId: string) {
    const store = usePlaygroundStore.getState()

    // Remove the node from nodes array
    const updatedNodes = store.nodes.filter(node => node.id !== nodeId)

    // Remove all connectors connected to this node
    const updatedConnectors = store.connectors.filter(
        connector => connector.source !== nodeId && connector.target !== nodeId
    )

    // Remove the chat associated with this node
    const updatedNodeChats = store.nodeChats.filter(chat => chat.nodeId !== nodeId)

    store.setNodes(updatedNodes)
    store.setConnectors(updatedConnectors)
    store.setNodeChats(updatedNodeChats)

    // Clear selection if the deleted node was selected
    if (store.selectedNodeId === nodeId) {
        store.setSelectedNodeId(null)
    }
}
