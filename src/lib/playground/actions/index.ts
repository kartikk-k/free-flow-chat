import addNewChatNode from "./add-new-chat-node";
import attachMessageToNode from "./attach-message-to-node";
import deleteNode from "./delete-node";
import { getHistoricalNodeIds } from "./get-historical-node-ids";
import getNodeChat from "./get-node-chat";
import handleConnectionEnd from "./handle-connection-end";
import updateChatModel from "./update-chat-model";

// Export individual functions
export { addNewChatNode, attachMessageToNode, deleteNode, getHistoricalNodeIds, getNodeChat, handleConnectionEnd, updateChatModel };

// Export as a namespace object
export const PlaygroundActions = {
    addNewChatNode,
    attachMessageToNode,
    deleteNode,
    getNodeChat,
    handleConnectionEnd,
    getHistoricalNodeIds,
    updateChatModel,
};