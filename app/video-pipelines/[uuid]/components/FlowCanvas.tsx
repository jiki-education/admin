/**
 * Flow Canvas Component
 *
 * Visual graph editor using React Flow.
 * Displays pipeline nodes and edges, handles interactions.
 * Uses Zustand store for centralized state management.
 */

"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type OnNodesDelete,
  type OnEdgesDelete,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeTypes,
  type NodeMouseHandler,
  type Node as ReactFlowNode,
  type Edge
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
    nodes: rawNodes,
    getLayoutedNodes,
    getEdges,
    setSelectedNode,
    connectNodes,
    disconnectNodes,
    deleteNodes,
    updateNodePositions,
    layoutKey,
    hasInitialLayout
  } = usePipelineStore();

  // Use React Flow's built-in state management for proper drag functionality
  const [flowNodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Sync store state with React Flow state
  useEffect(() => {
    const storeNodes = getLayoutedNodes();
    const storeEdges = getEdges();
    setNodes(storeNodes);
    setEdges(storeEdges);
  }, [rawNodes, layoutKey, hasInitialLayout, getLayoutedNodes, getEdges, setNodes, setEdges]);

  // Handle new connections with validation
  const handleConnect: OnConnect = useCallback(
    (connection) => {
      // Validate connection before processing
      if (!connection.source || !connection.target || !connection.targetHandle || connection.targetHandle === "") {
        return;
      }

      // Find target node
      const targetNode = flowNodes.find((n) => n.id === connection.target);
      if (!targetNode?.data.node) {
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
        connectNodes(pipeline.uuid, connection.source, connection.target, connection.targetHandle).catch((error) =>
          console.error(error)
        );
      }
    },
    [pipeline, connectNodes, flowNodes, edges]
  );

  // Handle node deletion
  const handleNodesDelete: OnNodesDelete = useCallback(
    (nodesToDelete) => {
      if (pipeline) {
        const nodeIds = nodesToDelete.map((node) => node.id);
        deleteNodes(pipeline.uuid, nodeIds).catch((error) => console.error(error));
      }
    },
    [pipeline, deleteNodes]
  );

  // Handle edge deletion
  const handleEdgesDelete: OnEdgesDelete = useCallback(
    (edgesToDelete) => {
      if (pipeline) {
        edgesToDelete.forEach((edge) => {
          // Use the edge object properties directly instead of parsing the ID
          const sourceId = edge.source;
          const targetId = edge.target;
          const inputKey = edge.targetHandle;
          
          // Verify nodes exist in local state
          const sourceNode = rawNodes.find(n => n.uuid === sourceId);
          const targetNode = rawNodes.find(n => n.uuid === targetId);
          
          if (!sourceNode || !targetNode) {
            console.error("Node not found in local state - cannot disconnect");
            return;
          }
          
          if (!inputKey) {
            console.error("No target handle specified - cannot disconnect");
            return;
          }
          
          disconnectNodes(pipeline.uuid, sourceId, targetId, inputKey).catch((error) => {
            console.error("Failed to disconnect edge:", error);
          });
        });
      }
    },
    [pipeline, disconnectNodes, rawNodes]
  );

  // Handle node click (select)
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  // Handle edge click (debug and select)
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      console.log("Edge clicked:", edge.id);
      // Manually select the edge by updating the edges state
      setEdges((edges) =>
        edges.map((e) => ({
          ...e,
          selected: e.id === edge.id
        }))
      );
    },
    [setEdges]
  );

  // Handle canvas click (deselect)
  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    // Also deselect all edges
    setEdges((edges) =>
      edges.map((e) => ({
        ...e,
        selected: false
      }))
    );
  }, [setSelectedNode, setEdges]);

  // Enhanced node change handler that combines React Flow's built-in handling with our custom logic
  const handleNodesChange: OnNodesChange<ReactFlowNode> = useCallback(
    (changes) => {
      // Always apply React Flow's internal changes first (essential for drag functionality)
      onNodesChange(changes);

      // Filter for position changes that are completed (dragging: false)
      const positionChanges = changes.filter(
        (change) => change.type === "position" && change.dragging === false && change.position
      );

      if (positionChanges.length > 0) {
        // Create new positions object
        const newPositions: Record<string, { x: number; y: number }> = {};
        positionChanges.forEach((change) => {
          if (change.type === "position" && change.position) {
            newPositions[change.id] = change.position;
          }
        });

        updateNodePositions(newPositions);
      }
    },
    [onNodesChange, updateNodePositions]
  );

  return (
    <div className="flex-1 bg-gray-50">
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnect={handleConnect}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={handleNodesDelete}
        onEdgesDelete={handleEdgesDelete}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodesDraggable
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
        connectOnClick={false}
        elementsSelectable={true}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#aaa" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
