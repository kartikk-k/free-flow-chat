import { Edge, Node } from '@xyflow/react';
import { NodeChat } from '../../typings';

/**
 * Complete playground state that gets saved to IndexedDB
 */
export interface PlaygroundState {
  nodes: Node[];
  connectors: Edge[];
  nodeChats: NodeChat[];
}

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
