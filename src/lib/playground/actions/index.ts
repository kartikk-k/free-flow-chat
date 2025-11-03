import addNewChatNode from "./add-new-chat-node";
import attachMessageToNode from "./attach-message-to-node";
import deleteNode from "./delete-node";
import { getHistoricalNodeIds } from "./get-historical-node-ids";
import getNodeChat from "./get-node-chat";
import handleConnectionEnd from "./handle-connection-end";

// Export individual functions
export { addNewChatNode, attachMessageToNode, deleteNode, getHistoricalNodeIds, getNodeChat, handleConnectionEnd };

// Export as a namespace object
export const PlaygroundActions = {
    addNewChatNode,
    attachMessageToNode,
    deleteNode,
    getNodeChat,
    handleConnectionEnd,
    getHistoricalNodeIds,
};