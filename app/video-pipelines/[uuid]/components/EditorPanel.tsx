/**
 * Editor Panel Component
 *
 * Displays details for the selected node and provides actions.
 * Uses Zustand store for centralized state management.
 */

"use client";

import { useTransition } from "react";
import { isMergeVideosNode, isRenderCodeNode } from "@/lib/nodes/types";
import NodeDetailsHeader from "./editor-panel/NodeDetailsHeader";
import MergeVideosNodeDetails from "./editor-panel/MergeVideosNodeDetails";
import RenderCodeNodeDetails from "./editor-panel/RenderCodeNodeDetails";
import NoNodeSelected from "./editor-panel/NoNodeSelected";
import GenericNodeDetails from "./editor-panel/GenericNodeDetails";
import NodeTitleEditor from "./editor-panel/NodeTitleEditor";
import { usePipelineStore } from "@/stores/usePipelineStore";

export default function EditorPanel() {
  // Store subscriptions
  const { 
    pipeline, 
    nodes, 
    selectedNodeId, 
    deleteNodes, 
    updateNode,
    forceRelayout 
  } = usePipelineStore();
  
  // Find the selected node reactively
  const selectedNode = selectedNodeId ? nodes.find(node => node.uuid === selectedNodeId) || null : null;
  const [isDeleting, startDeletion] = useTransition();

  if (!selectedNode) {
    return <NoNodeSelected />;
  }

  const handleDelete = () => {
    if (selectedNode && pipeline && window.confirm(`Are you sure you want to delete node "${selectedNode.uuid}"?`)) {
      startDeletion(async () => {
        await deleteNodes(pipeline.uuid, [selectedNode.uuid]);
      });
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header - Fixed */}
      <NodeDetailsHeader node={selectedNode} />

      {/* Body - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Type-Specific Detail Views */}
        {isMergeVideosNode(selectedNode) ? (
          <MergeVideosNodeDetails
            node={selectedNode}
            pipelineUuid={pipeline?.uuid || ""}
            allNodes={nodes}
            onRefresh={forceRelayout}
          />
        ) : isRenderCodeNode(selectedNode) ? (
          <RenderCodeNodeDetails
            node={selectedNode}
            pipelineUuid={pipeline?.uuid || ""}
            onRefresh={forceRelayout}
          />
        ) : (
          <GenericNodeDetails node={selectedNode} />
        )}
      </div>

      {/* Footer - Fixed */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {isDeleting ? "Deleting..." : "Delete Node"}
        </button>
        
        {/* Node Title Editor */}
        <NodeTitleEditor 
          node={selectedNode} 
          pipelineUuid={pipeline?.uuid || ""} 
          onUpdate={updateNode}
        />
      </div>
    </div>
  );
}
