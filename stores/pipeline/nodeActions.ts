import toast from "react-hot-toast";
import type { PipelineState } from "./types";
import {
  connectNodes as apiConnectNodes,
  deleteNode as apiDeleteNode,
  createNode as apiCreateNode
} from "@/lib/api/video-pipelines";
import type { Node } from "@/lib/nodes/types";
import { toEditorNode } from "@/lib/nodes/types";

/**
 * Node-specific actions
 * Handles node connections, deletions, and related operations
 */
export const createNodeActions = (
  set: (partial: Partial<PipelineState> | ((state: PipelineState) => Partial<PipelineState>)) => void,
  get: () => PipelineState
) => ({
  connectNodes: async (
    pipelineUuid: string,
    sourceId: string,
    targetId: string,
    targetHandle: string
  ): Promise<void> => {
    const { nodes } = get();
    const sourceNode = nodes.find((n) => n.uuid === sourceId);
    const targetNode = nodes.find((n) => n.uuid === targetId);
    const connectionDesc = `Connect ${sourceNode?.title || sourceId} → ${targetNode?.title || targetId}`;

    // Save to history before connection
    get().saveToHistory("connect", connectionDesc);

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

    toast.loading("Connecting nodes...", { id: `connect-${sourceId}-${targetId}` });

    // For now, work locally without backend API calls
    console.log("Working locally without backend API for connections");

    // Force layout recalculation for the new connection
    set((state) => ({
      hasInitialLayout: false // This will trigger layout recalculation
    }));

    toast.success(connectionDesc, {
      id: `connect-${sourceId}-${targetId}`,
      duration: 2000
    });

    set({ isSaving: false });
  },

  deleteNodes: async (pipelineUuid: string, nodeIds: string[]): Promise<void> => {
    const { nodes, nodePositions, selectedNodeId } = get();
    const nodeNames = nodeIds.map((id) => nodes.find((n) => n.uuid === id)?.title || id).join(", ");
    const deleteDesc = `Delete ${nodeIds.length === 1 ? "node" : "nodes"}: ${nodeNames}`;

    // Save to history before deletion
    get().saveToHistory("delete", deleteDesc);

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
      const newSelectedNodeId =
        selectedNodeId != null && selectedNodeId !== "" && nodeIds.includes(selectedNodeId) ? null : selectedNodeId;

      return {
        nodes: updatedNodes,
        nodePositions: updatedPositions,
        selectedNodeId: newSelectedNodeId,
        isSaving: true
      };
    });

    toast.loading("Deleting nodes...", { id: `delete-${nodeIds.join("-")}` });

    // For now, work locally without backend API calls
    console.log("Working locally without backend API for deletion");

    // Force layout recalculation after deletion
    set((state) => ({
      hasInitialLayout: false // This will trigger layout recalculation
    }));

    toast.success(deleteDesc, {
      id: `delete-${nodeIds.join("-")}`,
      duration: 2000
    });

    set({ isSaving: false });
  },

  createNode: async (
    pipelineUuid: string,
    nodeData: {
      uuid: string;
      type: string;
      title: string;
      inputs: Record<string, unknown>;
      config: Record<string, unknown>;
      asset?: Record<string, unknown>;
      position?: { x: number; y: number };
    }
  ): Promise<void> => {
    console.log("Store createNode called", { pipelineUuid, nodeData });

    const { nodes } = get();
    const createDesc = `Create node: ${nodeData.title}`;

    // Save to history before creation
    get().saveToHistory("connect", createDesc);

    // OPTIMISTIC UPDATE: Add node to UI immediately
    const previousNodes = nodes;
    const previousPositions = get().nodePositions;

    // Create the new node with default values for server-provided fields
    const newNode: Node = {
      uuid: nodeData.uuid,
      pipeline_uuid: pipelineUuid,
      title: nodeData.title,
      type: nodeData.type as any, // Type assertion needed for discriminated union
      inputs: nodeData.inputs,
      config: nodeData.config,
      asset: nodeData.asset,
      status: "pending" as const,
      metadata: {},
      output: {},
      is_valid: true,
      validation_errors: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Node;

    console.log("Adding node to state. Current nodes:", get().nodes.length);
    console.log("New node to add:", newNode);

    // Immediately update the state with the new node
    set((state) => ({
      nodes: [...state.nodes, newNode],
      nodePositions: nodeData.position
        ? {
            ...state.nodePositions,
            [nodeData.uuid]: nodeData.position
          }
        : state.nodePositions,
      selectedNodeId: nodeData.uuid,
      isSaving: true,
      layoutKey: state.layoutKey + 1, // Force re-render
      hasInitialLayout: false // Force layout recalculation to include new node
    }));

    console.log("Node added to store immediately. New count:", get().nodes.length);

    // Use setTimeout to update positions after the layout calculation is complete
    setTimeout(() => {
      const currentState = get();
      const layoutedNodes = currentState.getLayoutedNodes();
      const newNodeLayout = layoutedNodes.find((node) => node.id === nodeData.uuid);

      if (newNodeLayout && !currentState.nodePositions[nodeData.uuid]) {
        // Save the calculated position for the new node
        set((state) => ({
          nodePositions: {
            ...state.nodePositions,
            [nodeData.uuid]: newNodeLayout.position
          },
          hasInitialLayout: true
        }));
      }
    }, 0);

    toast.loading("Creating node...", { id: `create-${nodeData.uuid}` });

    // For now, work locally without backend API calls
    console.log("Working locally without backend API");

    toast.success(createDesc, {
      id: `create-${nodeData.uuid}`,
      duration: 2000
    });

    set({ isSaving: false });
  }
});
