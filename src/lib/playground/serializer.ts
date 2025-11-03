import { PlaygroundState } from "@/types/chat";

/**
 * Utility functions for serializing and deserializing playground state
 */
export const PlaygroundStateSerializer = {
    /**
     * Convert playground state to JSON string for storage
     */
    stringify(state: PlaygroundState): string {
      return JSON.stringify(state);
    },

    /**
     * Parse JSON string back to playground state
     */
    parse(data: string): PlaygroundState {
      return JSON.parse(data) as PlaygroundState;
    },

    /**
     * Validate that the parsed data has the correct structure
     */
    validate(state: any): state is PlaygroundState {
      return (
        typeof state === 'object' &&
        state !== null &&
        Array.isArray(state.nodes) &&
        Array.isArray(state.connectors) &&
        Array.isArray(state.nodeChats)
      );
    },
  };
