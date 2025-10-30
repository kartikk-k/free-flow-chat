import { v4 as uuid } from 'uuid';
import { NodeChat } from '../../../typings';
import { usePlaygroundStore } from "../Playground";


export default function addNewChatNode(nodeId?: string, source?: string) {

    const store = usePlaygroundStore.getState()

    let { x, y } = { x: 0, y: 0 }

    // if nodeId is provided, add the new node 200px right and 200px below the node
    if (nodeId) {
        const node = store.nodes.find(node => node.id === nodeId)
        if (node) {
            ({ x, y } = node.position)
        }

        if (!source) {
            x += 0
            y += (node?.measured?.height || 0) + 100
        } else {
            x += (node?.measured?.width || 0) + 100
            y += 0
        }
    }

    const id = uuid()

    const newNode = {
        id: id,
        position: { x, y },
        data: { label: 'Chat Node' },
        type: 'chatNode',
        dragHandle: '.drag-handle__ChatNode'
    }

    if (nodeId && source?.trim()) {
        const newChat: NodeChat = {
            id: uuid(),
            createdAt: new Date().toISOString(),
            messages: [],
            source: source,
            nodeId: id
        }
        store.setNodeChats([...store.nodeChats, newChat])
    }


    store.setNodes([...store.nodes, newNode])
    if (nodeId) {
        store.setConnectors([...store.connectors, { id: uuid(), source: nodeId, target: newNode.id, sourceHandle: source ? 'a3' : 'a4', targetHandle: source ? 'a2' : 'a1' }])
    }

    store.setFitViewNodeId(newNode.id)
}