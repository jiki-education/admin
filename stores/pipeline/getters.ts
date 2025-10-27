import type { Node as ReactFlowNode, Edge } from "@xyflow/react";
import type { Node } from "@/lib/nodes/types";
import type { PipelineState } from './types';
import { getLayoutedNodes } from "@/lib/layout";
import { getOutputHandleColorValue } from "@/lib/nodes/display-helpers";
import { hasInputHandle } from "@/lib/nodes/metadata";

/**
 * Computed state getters for the pipeline store
 * These functions derive values from the core state
 */
export const createGetters = (get: () => PipelineState) => ({
  getSelectedNode: (): Node | null => {
    const { nodes, selectedNodeId } = get();
    return selectedNodeId ? nodes.find(node => node.uuid === selectedNodeId) || null : null;
  },
  
  getProgressPercentage: (): number => {
    const { pipeline } = get();
    const progress = pipeline?.metadata?.progress;
    if (!progress || progress.total === 0) {
      return 0;
    }
    return Math.round((progress.completed / progress.total) * 100);
  },
  
  getReactFlowNodes: (): ReactFlowNode[] => {
    const { nodes, selectedNodeId } = get();
    const { executeNode } = get();
    
    return nodes.map((node) => ({
      id: node.uuid,
      type: node.type,
      position: { x: 0, y: 0 }, // Will be set by layout or preserved position
      data: {
        node,
        onExecute: () => executeNode(node.pipeline_uuid, node.uuid)
      },
      selected: node.uuid === selectedNodeId
    }));
  },
  
  getEdges: (): Edge[] => {
    const { nodes } = get();
    const edgesList: Edge[] = [];

    nodes.forEach((node) => {
      Object.entries(node.inputs).forEach(([inputKey, sources]) => {
        // Only create edges for input handles that actually exist for this node type
        if (!hasInputHandle(node.type, inputKey)) {
          return;
        }

        // Normalize inputs: handle both string (single input) and string[] (multi input)
        const sourceArray = Array.isArray(sources) ? sources : sources != null ? [sources] : [];

        sourceArray.forEach((sourceId, index) => {
          // Find the source node to get its output color
          const sourceNode = nodes.find((n) => n.uuid === sourceId);
          const edgeColor = sourceNode != null ? getOutputHandleColorValue(sourceNode) : "#9ca3af";

          // Determine if line should be dashed (pending/in_progress/failed) or solid (completed)
          // Check the SOURCE node's status since the edge represents its output
          const isDashed = sourceNode != null ? sourceNode.status !== "completed" : true;

          edgesList.push({
            id: `${sourceId}-${node.uuid}-${inputKey}-${index}`,
            source: sourceId,
            target: node.uuid,
            targetHandle: inputKey,
            animated: node.status === "in_progress",
            style: {
              stroke: edgeColor,
              strokeWidth: 2,
              strokeDasharray: isDashed ? "5,5" : "0"
            }
          });
        });
      });
    });

    return edgesList;
  },
  
  getLayoutedNodes: (): ReactFlowNode[] => {
    const { nodePositions, hasInitialLayout, layoutConfig } = get();
    const reactFlowNodes = get().getReactFlowNodes();
    const edges = get().getEdges();
    
    // If we already have positions for all nodes, use them
    const allNodesHavePositions = reactFlowNodes.every((node) => nodePositions[node.id] != null);

    if (allNodesHavePositions && hasInitialLayout) {
      // Preserve existing positions
      return reactFlowNodes.map((node) => ({
        ...node,
        position: nodePositions[node.id] ?? { x: 0, y: 0 }
      }));
    }

    // Calculate node dimensions from measured heights (if available) or use config
    const haveMeasuredDimensions = reactFlowNodes.some((n) => n.measured?.height != null && n.measured.height !== 0);
    const maxHeight = haveMeasuredDimensions
      ? Math.max(
          ...reactFlowNodes.map((n) =>
            n.measured?.height != null && n.measured.height !== 0 ? n.measured.height : layoutConfig.nodeHeight
          ),
          layoutConfig.nodeHeight
        )
      : layoutConfig.nodeHeight;

    const maxWidth = haveMeasuredDimensions
      ? Math.max(
          ...reactFlowNodes.map((n) => (n.measured?.width != null && n.measured.width !== 0 ? n.measured.width : layoutConfig.nodeWidth)),
          layoutConfig.nodeWidth
        )
      : layoutConfig.nodeWidth;

    // Apply layout algorithm
    const layouted = getLayoutedNodes(reactFlowNodes, edges, {
      direction: layoutConfig.direction,
      nodeWidth: maxWidth,
      nodeHeight: maxHeight,
      rankSep: layoutConfig.rankSep,
      nodeSep: layoutConfig.nodeSep
    });

    // This will be handled by the store to save positions
    return layouted;
  }
});