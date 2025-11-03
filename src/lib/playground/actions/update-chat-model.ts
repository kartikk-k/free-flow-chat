import { usePlaygroundStore } from "@/store/Playground";
import { NodeChat } from '@/types/chat';
import { v4 as uuid } from 'uuid';


export default function updateChatModel(nodeId: string, modelId: string) {

    const store = usePlaygroundStore.getState()
    const chat = store.nodeChats.find(i => i.nodeId === nodeId)

    if (chat) {
        // Update existing chat
        store.setNodeChats(
            store.nodeChats.map(c =>
                c.nodeId === nodeId
                    ? { ...c, model: modelId }
                    : c
            )
        );
    } else {
        // Create new chat with the selected model
        const newChat: NodeChat = {
            id: uuid(),
            nodeId: nodeId,
            messages: [],
            model: modelId,
            createdAt: new Date().toISOString(),
        };
        store.setNodeChats([...store.nodeChats, newChat]);
    }
}
