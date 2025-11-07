import addNewChatNode from "./add-new-chat-node";
import addNewWebpageNode from "./add-new-webpage-node";
import attachMessageToNode from "./attach-message-to-node";
import deleteNode from "./delete-node";
import { getHistoricalNodeIds } from "./get-historical-node-ids";
import getNodeChat from "./get-node-chat";
import handleConnectionEnd from "./handle-connection-end";

// Export individual functions
export { addNewChatNode, addNewWebpageNode, attachMessageToNode, deleteNode, getHistoricalNodeIds, getNodeChat, handleConnectionEnd };

// Export as a namespace object
export const PlaygroundActions = {
    addNewChatNode,
    addNewWebpageNode,
    attachMessageToNode,
    deleteNode,
    getNodeChat,
    handleConnectionEnd,
    getHistoricalNodeIds,
};