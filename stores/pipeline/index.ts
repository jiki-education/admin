import { create } from 'zustand';
import type { PipelineState } from './types';
import { initialState } from './types';
import { createGetters } from './getters';
import { createActions } from './actions';
import { createNodeActions } from './nodeActions';
import { createHistoryActions } from './historyActions';

/**
 * Main pipeline store
 * Combines all the modular pieces into a cohesive store
 */
export const usePipelineStore = create<PipelineState>((set, get) => {
  // Create a special version of getLayoutedNodes that can update positions
  const gettersBase = createGetters(get);
  const getLayoutedNodesWithPositionUpdate = () => {
    const layouted = gettersBase.getLayoutedNodes();
    
    // Check if this is a new layout calculation (not using existing positions)
    const { nodePositions, hasInitialLayout } = get();
    const allNodesHavePositions = layouted.every((node) => nodePositions[node.id] != null);
    
    if (!allNodesHavePositions || !hasInitialLayout) {
      // Save positions for future renders
      const positions: Record<string, { x: number; y: number }> = {};
      layouted.forEach((node) => {
        positions[node.id] = node.position;
      });
      
      set({ 
        nodePositions: positions,
        hasInitialLayout: true 
      });
    }
    
    return layouted;
  };

  return {
    ...initialState,
    
    // Computed state getters
    ...gettersBase,
    getLayoutedNodes: getLayoutedNodesWithPositionUpdate,
    
    // All action modules
    ...createActions(set, get),
    ...createNodeActions(set, get),
    ...createHistoryActions(set, get),
  };
});

// Re-export types for convenience
export type { PipelineState, LayoutConfig, LayoutAlgorithm, LayoutDirection, HistoryEntry } from './types';