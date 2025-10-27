/**
 * Flow Canvas Component
 *
 * Visual graph editor using React Flow.
 * Displays pipeline nodes and edges, handles interactions.
 * Uses Zustand store for centralized state management.
 */

"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type OnConnect,
  type OnNodesDelete,
  type NodeTypes,
  type NodeMouseHandler
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { Node } from "@/lib/nodes/types";
import { getMaxConnections, hasInputHandle } from "@/lib/nodes/metadata";
import { usePipelineStore } from "@/stores/usePipelineStore";

// Import custom node components
import AssetNode from "./nodes/AssetNode";
import GenerateTalkingHeadNode from "./nodes/GenerateTalkingHeadNode";
import RenderCodeNode from "./nodes/RenderCodeNode";
import GenerateAnimationNode from "./nodes/GenerateAnimationNode";
import GenerateVoiceoverNode from "./nodes/GenerateVoiceoverNode";
import MixAudioNode from "./nodes/MixAudioNode";
import MergeVideosNode from "./nodes/MergeVideosNode";
import ComposeVideoNode from "./nodes/ComposeVideoNode";

// FlowCanvas now gets all data directly from the store

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

export default function FlowCanvas() {
  // Store subscriptions
  const { 
    pipeline, 
    getLayoutedNodes, 
    getEdges, 
    setSelectedNode, 
    connectNodes, 
    deleteNodes 
  } = usePipelineStore();

  // Get computed values from store
  const nodes = getLayoutedNodes();
  const edges = getEdges();

  // Handle new connections with validation
  const handleConnect: OnConnect = useCallback(
    (connection) => {
      // Validate connection before processing
      if (!connection.source || !connection.target || !connection.targetHandle || connection.targetHandle === "") {
        return;
      }

      // Find target node
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!targetNode || !targetNode.data.node) {
        return;
      }

      // Get node data
      const nodeData = targetNode.data as { node: Node };
      const node = nodeData.node;

      // Check if the input handle exists for this node type
      if (!hasInputHandle(node.type, connection.targetHandle)) {
        return;
      }

      // Get max allowed connections for this input
      const maxConnections = getMaxConnections(node.type, connection.targetHandle);

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
      if (pipeline) {
        void connectNodes(pipeline.uuid, connection.source, connection.target, connection.targetHandle);
      }
    },
    [pipeline, connectNodes, nodes, edges]
  );

  // Handle node deletion
  const handleNodesDelete: OnNodesDelete = useCallback(
    (nodesToDelete) => {
      if (pipeline) {
        const nodeIds = nodesToDelete.map((node) => node.id);
        void deleteNodes(pipeline.uuid, nodeIds);
      }
    },
    [pipeline, deleteNodes]
  );

  // Handle node click (select)
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      console.log("node", node)
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  // Handle canvas click (deselect)
  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

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
