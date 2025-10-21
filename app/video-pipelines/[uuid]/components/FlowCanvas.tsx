/**
 * Flow Canvas Component
 *
 * Visual graph editor using React Flow.
 * Displays pipeline nodes and edges, handles interactions.
 * Now uses controlled state from parent (PipelineEditor).
 */

"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node as ReactFlowNode,
  type Edge,
  type OnConnect,
  type OnNodesDelete,
  type NodeTypes,
  type NodeMouseHandler
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { Node } from "@/lib/nodes/types";
import type { NodeType } from "@/lib/nodes/types";
import { getMaxConnections, hasInputHandle } from "@/lib/nodes/metadata";

// Import custom node components
import AssetNode from "./nodes/AssetNode";
import GenerateTalkingHeadNode from "./nodes/GenerateTalkingHeadNode";
import RenderCodeNode from "./nodes/RenderCodeNode";
import GenerateAnimationNode from "./nodes/GenerateAnimationNode";
import GenerateVoiceoverNode from "./nodes/GenerateVoiceoverNode";
import MixAudioNode from "./nodes/MixAudioNode";
import MergeVideosNode from "./nodes/MergeVideosNode";
import ComposeVideoNode from "./nodes/ComposeVideoNode";

interface FlowCanvasProps {
  nodes: ReactFlowNode[]; // Pre-computed and layouted nodes
  edges: Edge[]; // Pre-computed edges
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onConnect: (sourceId: string, targetId: string, targetHandle: string) => Promise<void>;
  onNodesDelete: (nodeIds: string[]) => Promise<void>;
}

// Register custom node types
const nodeTypes: NodeTypes = {
  asset: AssetNode,
  "generate-talking-head": GenerateTalkingHeadNode,
  "render-code": RenderCodeNode,
  "generate-animation": GenerateAnimationNode,
  "generate-voiceover": GenerateVoiceoverNode,
  "mix-audio": MixAudioNode,
  "merge-videos": MergeVideosNode,
  "compose-video": ComposeVideoNode
};

export default function FlowCanvas({
  nodes,
  edges,
  selectedNodeId: _selectedNodeId,
  onNodeSelect,
  onConnect,
  onNodesDelete
}: FlowCanvasProps) {

  // Handle new connections with validation
  const handleConnect: OnConnect = useCallback(
    (connection) => {
      // Validate connection before processing
      if (!connection.source || !connection.target || !connection.targetHandle || connection.targetHandle === "") {
        return;
      }

      // Find target node
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!targetNode?.data?.node) {
        return;
      }

      // Get node data
      const nodeData = targetNode.data as { node: Node };
      const node = nodeData.node;

      // Check if the input handle exists for this node type
      if (!hasInputHandle(node.type as NodeType, connection.targetHandle)) {
        return;
      }

      // Get max allowed connections for this input
      const maxConnections = getMaxConnections(node.type as NodeType, connection.targetHandle);

      // Check connection limits (unless unlimited)
      if (maxConnections !== -1) {
        const existingConnections = edges.filter(
          (e) => e.target === connection.target && e.targetHandle === connection.targetHandle
        );

        if (existingConnections.length >= maxConnections) {
          return;
        }
      }

      // Connection is valid, proceed
      void onConnect(connection.source, connection.target, connection.targetHandle);
    },
    [onConnect, nodes, edges]
  );

  // Handle node deletion
  const handleNodesDelete: OnNodesDelete = useCallback(
    (nodesToDelete) => {
      const nodeIds = nodesToDelete.map((node) => node.id);
      void onNodesDelete(nodeIds);
    },
    [onNodesDelete]
  );

  // Handle node click (select)
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  // Handle canvas click (deselect)
  const handlePaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  return (
    <div className="flex-1 bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnect={handleConnect}
        onNodesDelete={handleNodesDelete}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "default",
          animated: false
        }}
        deleteKeyCode={["Backspace", "Delete"]}
        selectNodesOnDrag={false}
        connectOnClick={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#aaa" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
