import { v4 as uuid } from 'uuid';
import { NodeChat } from '@/types/chat';
import { usePlaygroundStore } from "@/store/Playground";


export default function attachMessageToNode(nodeId: string, messages: any[]) {

    const store = usePlaygroundStore.getState()

    const chat = store.nodeChats.find(i => i.nodeId === nodeId)

    if (chat) {
        store.setNodeChats([...store.nodeChats.filter(i => i.nodeId !== nodeId), {
            ...chat,
            messages: messages
        }])

    } else {
        const newChat: NodeChat = {
            id: uuid(),
            nodeId: nodeId,
            messages: messages,
            createdAt: new Date().toISOString()
        }
        store.setNodeChats([...store.nodeChats, newChat])
    }
}