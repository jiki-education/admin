import toast from 'react-hot-toast';
import type { PipelineState } from './types';
import { connectNodes as apiConnectNodes, deleteNode as apiDeleteNode } from '@/lib/api/video-pipelines';
import type { Node } from "@/lib/nodes/types";

/**
 * Node-specific actions
 * Handles node connections, deletions, and related operations
 */
export const createNodeActions = (set: (partial: Partial<PipelineState> | ((state: PipelineState) => Partial<PipelineState>)) => void, get: () => PipelineState) => ({
  connectNodes: async (pipelineUuid: string, sourceId: string, targetId: string, targetHandle: string): Promise<void> => {
    const { nodes } = get();
    const sourceNode = nodes.find(n => n.uuid === sourceId);
    const targetNode = nodes.find(n => n.uuid === targetId);
    const connectionDesc = `Connect ${sourceNode?.title || sourceId} → ${targetNode?.title || targetId}`;
    
    // Save to history before connection
    get().saveToHistory('connect', connectionDesc);
    
    // OPTIMISTIC UPDATE: Update UI immediately
    const previousNodes = nodes;

    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.uuid === targetId) {
          // Get current array (or empty array if doesn't exist)
          const currentValue = (node.inputs as Record<string, string[]>)[targetHandle] ?? [];

          // Check if already connected
          if (currentValue.includes(sourceId)) {
            return node; // Already connected, no change
          }

          // Append to array
          const newValue = [...currentValue, sourceId];

          // Update the target node's inputs (preserving discriminated union)
          return {
            ...node,
            inputs: {
              ...node.inputs,
              [targetHandle]: newValue
            }
          } as Node;
        }
        return node;
      }),
      isSaving: true
    }));

    toast.loading('Connecting nodes...', { id: `connect-${sourceId}-${targetId}` });

    // Call Rails API to persist connection
    try {
      await apiConnectNodes(pipelineUuid, sourceId, targetId, targetHandle);
      toast.success(connectionDesc, { 
        id: `connect-${sourceId}-${targetId}`,
        duration: 2000 
      });
    } catch (error) {
      // ROLLBACK: Restore previous state on error
      const errorMessage = error instanceof Error ? error.message : "Failed to connect nodes";
      toast.error(`Failed to connect nodes: ${errorMessage}`, { 
        id: `connect-${sourceId}-${targetId}`,
        duration: 4000 
      });
      set({ nodes: previousNodes });
    } finally {
      set({ isSaving: false });
    }
  },
  
  deleteNodes: async (pipelineUuid: string, nodeIds: string[]): Promise<void> => {
    const { nodes, nodePositions, selectedNodeId } = get();
    const nodeNames = nodeIds.map(id => nodes.find(n => n.uuid === id)?.title || id).join(', ');
    const deleteDesc = `Delete ${nodeIds.length === 1 ? 'node' : 'nodes'}: ${nodeNames}`;
    
    // Save to history before deletion
    get().saveToHistory('delete', deleteDesc);
    
    // OPTIMISTIC UPDATE: Remove nodes from UI immediately
    const previousNodes = nodes;
    const previousPositions = nodePositions;

    set((state) => {
      // Remove deleted nodes
      let updatedNodes = state.nodes.filter((node) => !nodeIds.includes(node.uuid));

      // Clean up references in remaining nodes' inputs
      updatedNodes = updatedNodes.map((node) => {
        const cleanedInputs = { ...node.inputs } as Record<string, string[]>;
        let modified = false;

        Object.entries(cleanedInputs).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            const filtered = value.filter((uuid) => !nodeIds.includes(uuid));
            if (filtered.length !== value.length) {
              cleanedInputs[key] = filtered;
              modified = true;
            }
          }
        });

        return modified ? ({ ...node, inputs: cleanedInputs } as Node) : node;
      });

      // Remove positions for deleted nodes
      const updatedPositions = { ...state.nodePositions };
      nodeIds.forEach((uuid) => delete updatedPositions[uuid]);

      // Deselect if deleted node was selected
      const newSelectedNodeId = selectedNodeId != null && selectedNodeId !== "" && nodeIds.includes(selectedNodeId) 
        ? null 
        : selectedNodeId;

      return {
        nodes: updatedNodes,
        nodePositions: updatedPositions,
        selectedNodeId: newSelectedNodeId,
        isSaving: true
      };
    });

    toast.loading('Deleting nodes...', { id: `delete-${nodeIds.join('-')}` });

    // Call Rails API to persist deletion
    try {
      for (const nodeUuid of nodeIds) {
        await apiDeleteNode(pipelineUuid, nodeUuid);
      }
      toast.success(deleteDesc, { 
        id: `delete-${nodeIds.join('-')}`,
        duration: 2000 
      });
    } catch (error) {
      // ROLLBACK: Restore previous state on error
      const errorMessage = error instanceof Error ? error.message : "Failed to delete node";
      toast.error(`Failed to delete nodes: ${errorMessage}`, { 
        id: `delete-${nodeIds.join('-')}`,
        duration: 4000 
      });
      set({ 
        nodes: previousNodes,
        nodePositions: previousPositions,
        selectedNodeId: nodeIds.includes(selectedNodeId || "") ? selectedNodeId : selectedNodeId
      });
    } finally {
      set({ isSaving: false });
    }
  },
});