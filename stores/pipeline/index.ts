import { create } from "zustand";
import type { PipelineState } from "./types";
import { initialState } from "./types";
import { createGetters } from "./getters";
import { createActions } from "./actions";
import { createNodeActions } from "./nodeActions";
import { createHistoryActions } from "./historyActions";

/**
 * Main pipeline store
 * Combines all the modular pieces into a cohesive store
 */
export const usePipelineStore = create<PipelineState>((set, get) => {
  const gettersBase = createGetters(get);

  return {
    ...initialState,

    // Computed state getters
    ...gettersBase,

    // All action modules
    ...createActions(set, get),
    ...createNodeActions(set, get),
    ...createHistoryActions(set, get)
  };
});

// Re-export types for convenience
export type { PipelineState, LayoutConfig, LayoutAlgorithm, LayoutDirection, HistoryEntry } from "./types";
