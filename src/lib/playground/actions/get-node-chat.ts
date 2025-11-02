import { usePlaygroundStore } from "@/store/Playground";


export default function getNodeChat(nodeId: string) {

    const store = usePlaygroundStore.getState()

    const chat = store.nodeChats.find(i => i.nodeId === nodeId)

    if (chat) return chat
    else return null
}