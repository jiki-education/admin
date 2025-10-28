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

        {/* Advanced Controls Toolbar */}
        <div className="absolute top-4 left-4 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center space-x-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo (Cmd/Ctrl + Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo (Cmd/Ctrl + Shift + Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
              />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          <button
            onClick={forceRelayout}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Auto-layout (R)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Keyboard shortcuts help */}
        {!nodeAdderOpen && (
          <div className="absolute bottom-4 left-4 z-40 bg-black bg-opacity-70 text-white text-xs p-3 rounded-lg max-w-xs">
            <div className="font-semibold mb-2">Keyboard Shortcuts:</div>
            <div className="space-y-1">
              <div>
                <kbd className="bg-gray-700 px-1 rounded">⌘/Ctrl Z</kbd> Undo
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">⌘/Ctrl ⇧ Z</kbd> Redo
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">R</kbd> Auto-layout
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">P</kbd> Add nodes
              </div>
              <div>
                <kbd className="bg-gray-700 px-1 rounded">Del</kbd> Delete selected
              </div>
            </div>
          </div>
        )}

        {/* Flow Canvas */}
        <FlowCanvas />

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
