/**
 * Pipeline Editor Client Component
 *
 * Main container that coordinates between FlowCanvas and EditorPanel.
 * Uses Zustand store for centralized state management with optimistic updates.
 * Includes keyboard shortcuts and advanced UI features.
 */

"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { ReactFlowProvider } from "@xyflow/react";
import FlowCanvas from "./FlowCanvas";
import EditorPanel from "./EditorPanel";
import SimpleNodeAdder from "./SimpleNodeAdder";
import { usePipelineStore } from "@/stores/pipeline";
import { generateDefaultNodeConfig } from "@/lib/nodes/defaults";
import type { NodeType } from "@/lib/nodes/types";
import { v4 as uuidv4 } from "uuid";

export default function PipelineEditor() {
  const [nodeAdderOpen, setNodeAdderOpen] = useState(false);

  // Store subscriptions
  const { isSaving, canUndo, canRedo, undo, redo, forceRelayout, nodes, createNode, pipeline } = usePipelineStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true") {
        return;
      }

      // Cmd/Ctrl + Z for undo
      if ((event.metaKey || event.ctrlKey) && event.key === "z" && !event.shiftKey && canUndo) {
        event.preventDefault();
        undo();
      }

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y for redo
      if (
        ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === "Z") ||
        ((event.metaKey || event.ctrlKey) && event.key === "y")
      ) {
        if (canRedo) {
          event.preventDefault();
          redo();
        }
      }

      // R for force relayout
      if (event.key === "r" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        forceRelayout();
      }

      // P for toggle node adder
      if (event.key === "p" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setNodeAdderOpen(!nodeAdderOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo, forceRelayout, nodeAdderOpen]);

  // Handle node addition from simple adder
  const handleAddNode = async (nodeType: NodeType, assetType?: "text" | "image" | "audio" | "video" | "json") => {
    if (!pipeline?.uuid) return;

    try {
      // Generate UUID for the new node
      const nodeUuid = uuidv4();

      // Generate default configuration
      const nodeConfig = generateDefaultNodeConfig(nodeType, nodes, assetType);

      // Add node at center of canvas (or random position)
      const position = { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 };

      // Create the node using the store action
      await createNode(pipeline.uuid, {
        uuid: nodeUuid,
        type: nodeType,
        title: nodeConfig.title,
        inputs: nodeConfig.inputs,
        config: nodeConfig.config,
        asset: nodeConfig.asset as Record<string, unknown> | undefined,
        position
      });

      // Close the node adder after adding
      setNodeAdderOpen(false);
    } catch (error) {
      console.error("Failed to create node from palette:", error);
    }
  };

  return (
    <ReactFlowProvider>
      <div className="flex-1 flex overflow-hidden relative">
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff"
            },
            success: {
              duration: 2000
            },
            error: {
              duration: 5000
            }
          }}
        />

        {/* Saving indicator */}
        {isSaving && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            Saving...
          </div>
        )}



        {/* Flow Canvas */}
        <FlowCanvas />

        {/* Add Node Button - positioned at bottom right of canvas, left of the editor panel */}
        <div className="absolute bottom-4 right-[25rem] z-40">
          <button
            onClick={() => setNodeAdderOpen(!nodeAdderOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors"
            title="Add Node (P)"
          >
            +
          </button>
        </div>

        {/* Editor Panel */}
        <EditorPanel />

        {/* Simple Node Adder */}
        <SimpleNodeAdder
          isOpen={nodeAdderOpen}
          onToggle={() => setNodeAdderOpen(!nodeAdderOpen)}
          onAddNode={handleAddNode}
        />
      </div>
    </ReactFlowProvider>
  );
}
