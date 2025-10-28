import toast from "react-hot-toast";
import type { PipelineState, HistoryEntry } from "./types";

/**
 * History and undo/redo actions
 * Handles state history management for undo/redo functionality
 */
export const createHistoryActions = (
  set: (partial: Partial<PipelineState> | ((state: PipelineState) => Partial<PipelineState>)) => void,
  get: () => PipelineState
) => ({
  saveToHistory: (type: HistoryEntry["type"], description: string): void => {
    const { nodes, nodePositions, selectedNodeId, history, historyIndex } = get();

    // Create new history entry
    const newEntry: HistoryEntry = {
      type,
      timestamp: Date.now(),
      data: {
        nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
        nodePositions: { ...nodePositions },
        selectedNodeId
      },
      description
    };

    // Remove any history after current index (when branching from undo state)
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newEntry);

    // Limit history to last 50 entries
    const limitedHistory = updatedHistory.slice(-50);
    const newIndex = limitedHistory.length - 1;

    set({
      history: limitedHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false
    });
  },

  undo: (): void => {
    const { history, historyIndex } = get();

    if (historyIndex > 0) {
      const previousEntry = history[historyIndex - 1];
      const newIndex = historyIndex - 1;

      set({
        ...previousEntry.data,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true
      });

      toast.success(`Undid: ${previousEntry.description}`, { duration: 2000 });
    }
  },

  redo: (): void => {
    const { history, historyIndex } = get();

    if (historyIndex < history.length - 1) {
      const nextEntry = history[historyIndex + 1];
      const newIndex = historyIndex + 1;

      set({
        ...nextEntry.data,
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < history.length - 1
      });

      toast.success(`Redid: ${nextEntry.description}`, { duration: 2000 });
    }
  }
});
