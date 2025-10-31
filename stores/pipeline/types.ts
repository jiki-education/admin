import type { Node as ReactFlowNode, Edge } from "@xyflow/react";
import type { VideoProductionPipeline } from "@/lib/api/video-pipelines";
import type { Node } from "@/lib/nodes/types";

// Undo/Redo State Types
export interface HistoryEntry {
  type: "connect" | "delete" | "execute";
  timestamp: number;
  data: {
    nodes: Node[];
    nodePositions: Record<string, { x: number; y: number }>;
    selectedNodeId: string | null;
  };
  description: string;
}

// Layout configuration types
export type LayoutDirection = "LR" | "TB"; // Only LR and TB are supported by dagre
export type LayoutAlgorithm = "dagre" | "force" | "circular" | "grid";

export interface LayoutConfig {
  algorithm: LayoutAlgorithm;
  direction: LayoutDirection;
  nodeWidth: number;
  nodeHeight: number;
  rankSep: number;
  nodeSep: number;
  autoSpacing: boolean;
}

// Core state interface
export interface PipelineState {
  // Core Data
  pipeline: VideoProductionPipeline | null;
  nodes: Node[];
  selectedNodeId: string | null;

  // UI State
  loading: boolean;
  error: string | null;
  isSaving: boolean;
  isExecutingPipeline: boolean;
  nodePositions: Record<string, { x: number; y: number }>;
  hasInitialLayout: boolean;
  layoutKey: number; // Force re-renders when this changes

  // Layout State
  layoutConfig: LayoutConfig;

  // Undo/Redo State
  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Computed State Getters
  getSelectedNode: () => Node | null;
  getProgressPercentage: () => number;
  getReactFlowNodes: () => ReactFlowNode[];
  getEdges: () => Edge[];
  getLayoutedNodes: () => ReactFlowNode[];

  // Actions
  loadPipeline: (uuid: string) => Promise<void>;
  setSelectedNode: (nodeId: string | null) => void;
  executeNode: (pipelineUuid: string, nodeUuid: string) => Promise<void>;
  executePipeline: (pipelineUuid: string) => Promise<void>;
  updateNode: (pipelineUuid: string, nodeUuid: string, updates: Partial<Node>) => Promise<void>;
  connectNodes: (pipelineUuid: string, sourceId: string, targetId: string, targetHandle: string) => Promise<void>;
  disconnectNodes: (pipelineUuid: string, sourceId: string, targetId: string, targetHandle: string) => Promise<void>;
  deleteNodes: (pipelineUuid: string, nodeIds: string[]) => Promise<void>;
  createNode: (
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
  ) => Promise<void>;
  updateNodePositions: (positions: Record<string, { x: number; y: number }>) => void;
  forceRelayout: () => void;
  setLayoutConfig: (config: Partial<LayoutConfig>) => void;
  applyLayout: (algorithm: LayoutAlgorithm, direction?: LayoutDirection) => void;
  resetStore: () => void;

  // Undo/Redo Actions
  undo: () => void;
  redo: () => void;
  saveToHistory: (type: HistoryEntry["type"], description: string) => void;

  // Internal State Management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSaving: (saving: boolean) => void;
  setExecutingPipeline: (executing: boolean) => void;
}

// Initial state constant
export const initialState = {
  pipeline: null,
  nodes: [],
  selectedNodeId: null,
  loading: false,
  error: null,
  isSaving: false,
  isExecutingPipeline: false,
  nodePositions: {},
  hasInitialLayout: false,
  layoutKey: 0,
  layoutConfig: {
    algorithm: "dagre" as LayoutAlgorithm,
    direction: "LR" as LayoutDirection,
    nodeWidth: 280,
    nodeHeight: 240,
    rankSep: 150,
    nodeSep: 50,
    autoSpacing: true
  },
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false
};
