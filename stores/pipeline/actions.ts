import toast from "react-hot-toast";
import type { PipelineState, LayoutConfig, LayoutAlgorithm, LayoutDirection } from "./types";
import { getPipeline, executeNode as apiExecuteNode, updateNode as apiUpdateNode } from "@/lib/api/video-pipelines";
import type { Node } from "@/lib/nodes/types";

/**
 * Core pipeline actions
 * Handles pipeline loading, execution, and basic state management
 */
export const createActions = (
  set: (partial: Partial<PipelineState> | ((state: PipelineState) => Partial<PipelineState>)) => void,
  get: () => PipelineState
) => ({
  loadPipeline: async (uuid: string): Promise<void> => {
    try {
      set({ loading: true, error: null });
      const response = await getPipeline(uuid);

      set((state) => {
        // Merge server nodes with local nodes to preserve locally created nodes
        const serverNodeIds = new Set((response.nodes as Node[]).map((n) => n.uuid));
        const localOnlyNodes = state.nodes.filter((n) => !serverNodeIds.has(n.uuid));
        const mergedNodes = [...(response.nodes as Node[]), ...localOnlyNodes];

        console.log(
          "Merging nodes - server:",
          (response.nodes as Node[]).length,
          "local only:",
          localOnlyNodes.length,
          "merged:",
          mergedNodes.length
        );

        return {
          pipeline: response.pipeline,
          nodes: mergedNodes,
          nodePositions: state.nodePositions, // Keep current positions
          hasInitialLayout: false, // Force relayout
          loading: false
        };
      });
    } catch (err) {
      console.error("Failed to load pipeline:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load pipeline";
      set({
        error: errorMessage,
        loading: false
      });
    }
  },

  updateNode: async (pipelineUuid: string, nodeUuid: string, updates: Partial<Node>): Promise<void> => {
    const { nodes } = get();
    const node = nodes.find((n) => n.uuid === nodeUuid);
    const nodeTitle = node?.title || nodeUuid;

    // Save to history before update
    get().saveToHistory("execute", `Update node: ${nodeTitle}`);

    // OPTIMISTIC UPDATE: Update UI immediately
    const previousNodes = nodes;

    set((state) => ({
      nodes: state.nodes.map((n) => (n.uuid === nodeUuid ? ({ ...n, ...updates } as Node) : n)),
      isSaving: true
    }));

    toast.loading(`Updating node: ${nodeTitle}...`, { id: `update-${nodeUuid}` });

    try {
      // Call API to persist changes
      await apiUpdateNode(pipelineUuid, nodeUuid, updates);

      // Refresh the pipeline to get updated data
      const response = await getPipeline(pipelineUuid);
      set({
        pipeline: response.pipeline,
        nodes: response.nodes as Node[]
      });

      toast.success(`Successfully updated: ${nodeTitle}`, {
        id: `update-${nodeUuid}`,
        duration: 3000
      });
    } catch (error) {
      // ROLLBACK: Restore previous state on error
      const errorMessage = error instanceof Error ? error.message : "Failed to update node";
      toast.error(`Failed to update node: ${errorMessage}`, {
        id: `update-${nodeUuid}`,
        duration: 5000
      });
      set({ nodes: previousNodes });
    } finally {
      set({ isSaving: false });
    }
  },

  executeNode: async (pipelineUuid: string, nodeUuid: string): Promise<void> => {
    const { nodes } = get();
    const node = nodes.find((n) => n.uuid === nodeUuid);
    const nodeTitle = node?.title || nodeUuid;

    // Save to history before execution
    get().saveToHistory("execute", `Execute node: ${nodeTitle}`);

    set({ isSaving: true });
    toast.loading(`Executing node: ${nodeTitle}...`, { id: `execute-${nodeUuid}` });

    try {
      // Execute the node
      await apiExecuteNode(pipelineUuid, nodeUuid);

      // Refresh the pipeline to get updated node status
      const response = await getPipeline(pipelineUuid);
      set({
        pipeline: response.pipeline,
        nodes: response.nodes as Node[]
      });

      toast.success(`Successfully executed: ${nodeTitle}`, {
        id: `execute-${nodeUuid}`,
        duration: 3000
      });
    } catch (error) {
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : "Failed to execute node";
      toast.error(`Failed to execute node: ${errorMessage}`, {
        id: `execute-${nodeUuid}`,
        duration: 5000
      });
    } finally {
      set({ isSaving: false });
    }
  },

  setSelectedNode: (nodeId: string | null): void => {
    set({ selectedNodeId: nodeId });
  },

  updateNodePositions: (positions: Record<string, { x: number; y: number }>): void => {
    const { nodePositions } = get();
    const newPositions = { ...nodePositions, ...positions };
    set({ nodePositions: newPositions });
  },

  forceRelayout: (): void => {
    set({ hasInitialLayout: false, nodePositions: {} });
    toast.success("Layout refreshed", { duration: 1500 });
  },

  setLayoutConfig: (config: Partial<LayoutConfig>): void => {
    set((state) => ({
      layoutConfig: { ...state.layoutConfig, ...config },
      hasInitialLayout: false,
      nodePositions: {}
    }));
    toast.success("Layout settings updated", { duration: 1500 });
  },

  applyLayout: (algorithm: LayoutAlgorithm, direction?: LayoutDirection): void => {
    const currentConfig = get().layoutConfig;
    set({
      layoutConfig: {
        ...currentConfig,
        algorithm,
        ...(direction && { direction })
      },
      hasInitialLayout: false,
      nodePositions: {}
    });

    const directionText = direction ? ` (${direction})` : "";
    toast.success(`Applied ${algorithm} layout${directionText}`, { duration: 2000 });
  },

  resetStore: (): void => {
    set((state) => ({
      pipeline: null,
      nodes: [],
      selectedNodeId: null,
      loading: false,
      error: null,
      isSaving: false,
      nodePositions: {},
      hasInitialLayout: false,
      layoutKey: state.layoutKey + 1, // Force refresh
      layoutConfig: state.layoutConfig, // Keep layout preferences
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false
    }));
  },

  // Internal State Management
  setLoading: (loading: boolean): void => {
    set({ loading });
  },

  setError: (error: string | null): void => {
    set({ error });
  },

  setSaving: (saving: boolean): void => {
    set({ isSaving: saving });
  }
});
