# Pipeline Zustand Store Refactoring Plan

## Overview

This document outlines the refactoring plan for migrating the video pipeline page (`video-pipelines/[uuid]/page.tsx`) and its components from scattered React state management to a centralized Zustand store.

## Current State Analysis

### video-pipelines/[uuid]/page.tsx:17-20

**Basic State Management:**

- `pipeline`, `nodes`, `loading`, `error` - local React state
- Simple data fetching and display logic
- Manual prop passing to child components

### PipelineEditor.tsx:29-36

**Complex State Management:**

- Local state: `nodes`, `selectedNodeId`, `isSaving`, `nodePositions`
- Complex operations: node execution, connection, deletion
- Optimistic updates with rollback logic
- Heavy prop drilling between FlowCanvas and EditorPanel
- No centralized state management

### Current Issues

- **Prop drilling** - State passed through multiple component layers
- **Scattered state** - Related state managed in different components
- **Inconsistent error handling** - Different error patterns across components
- **Complex callback chains** - Deep callback passing for state updates
- **Performance** - Unnecessary re-renders due to prop changes

## Refactoring Plan

### 1. Create Zustand Store Structure

```typescript
// stores/usePipelineStore.ts
interface PipelineState {
  // Core Data
  pipeline: VideoProductionPipeline | null;
  nodes: Node[];
  selectedNodeId: string | null;

  // UI State
  loading: boolean;
  error: string | null;
  isSaving: boolean;
  nodePositions: Record<string, { x: number; y: number }>;
  hasInitialLayout: boolean;

  // Computed State Getters
  getSelectedNode: () => Node | null;
  getReactFlowNodes: () => ReactFlowNode[];
  getEdges: () => Edge[];
  getProgressPercentage: () => number;

  // Actions
  loadPipeline: (uuid: string) => Promise<void>;
  setSelectedNode: (nodeId: string | null) => void;
  executeNode: (pipelineUuid: string, nodeUuid: string) => Promise<void>;
  connectNodes: (pipelineUuid: string, sourceId: string, targetId: string, targetHandle: string) => Promise<void>;
  deleteNodes: (pipelineUuid: string, nodeIds: string[]) => Promise<void>;
  updateNodePositions: (positions: Record<string, { x: number; y: number }>) => void;
  forceRelayout: () => void;
  resetStore: () => void;

  // Internal State Management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSaving: (saving: boolean) => void;
}
```

### 2. Refactoring Phases

#### Phase 1: Store Creation & Basic Integration

- Create `stores/usePipelineStore.ts` with Zustand store
- Replace all local state in `page.tsx` with store calls
- Move `loadPipeline` logic into store action
- Implement error handling and loading states in store

**Files to modify:**

- Create: `stores/usePipelineStore.ts`
- Modify: `app/dashboard/video-pipelines/[uuid]/page.tsx`

#### Phase 2: Editor State Migration

- Move all `PipelineEditor` state to Zustand store
- Implement optimistic updates as store actions with rollback
- Centralize all API calls (executeNode, connectNodes, deleteNodes) in store
- Remove state props from PipelineEditor

**Files to modify:**

- Modify: `app/video-pipelines/[uuid]/components/PipelineEditor.tsx`

#### Phase 3: Component Simplification

- `FlowCanvas` becomes purely presentational, gets data from store
- `EditorPanel` gets data directly from store
- Remove all callback prop passing
- Implement selective store subscriptions for performance

**Files to modify:**

- Modify: `app/video-pipelines/[uuid]/components/FlowCanvas.tsx`
- Modify: `app/video-pipelines/[uuid]/components/EditorPanel.tsx`

#### Phase 4: Advanced Features

- Implement computed state for React Flow nodes/edges
- Add layout management to store
- Integrate toast notifications with store actions
- Add undo/redo capabilities (optional)

### 3. Store Features

#### Optimistic Updates

```typescript
// Example: Connect nodes with rollback
connectNodes: (pipelineUuid, sourceId, targetId, targetHandle) => {
  const previousNodes = get().nodes;

  // Optimistic update
  set((state) => ({
    nodes: updateNodeConnections(state.nodes, sourceId, targetId, targetHandle),
    isSaving: true
  }));

  // API call with rollback on error
  try {
    await connectNodes(pipelineUuid, sourceId, targetId, targetHandle);
  } catch (error) {
    set({ nodes: previousNodes, error: error.message });
    toast.error(`Failed to connect nodes: ${error.message}`);
  } finally {
    set({ isSaving: false });
  }
};
```

#### Computed Values

- React Flow nodes/edges derived from store data
- Progress calculations computed from node status
- Layout positions managed in store
- Selected node derived from selectedNodeId

#### Error Handling

- Centralized error state management
- Toast notifications integrated with store actions
- Consistent error recovery patterns
- Automatic error clearing on successful operations

### 4. Component Transformations

#### Before: page.tsx

```typescript
// Heavy local state management
const [pipeline, setPipeline] = useState<VideoProductionPipeline | null>(null);
const [nodes, setNodes] = useState<VideoProductionNode[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const loadPipeline = useCallback(async () => {
  // Complex loading logic
}, [resolvedParams.uuid]);
```

#### After: page.tsx

```typescript
// Clean store integration
const { pipeline, nodes, loading, error, loadPipeline } = usePipelineStore();

useEffect(() => {
  if (resolvedParams.uuid) {
    loadPipeline(resolvedParams.uuid);
  }
}, [resolvedParams.uuid, loadPipeline]);
```

#### Before: PipelineEditor.tsx

```typescript
// Complex prop management
interface PipelineEditorProps {
  pipeline: VideoProductionPipeline;
  nodes: Node[];
  onRefresh: () => void;
  onRelayout: () => void;
}

// Heavy callback chains
const handleConnect = useCallback(
  async (sourceId, targetId, targetHandle) => {
    // Complex optimistic update logic
  },
  [pipeline.uuid, nodes]
);
```

#### After: PipelineEditor.tsx

```typescript
// Simplified with store
export default function PipelineEditor() {
  const { nodes, selectedNodeId, isSaving, connectNodes, deleteNodes, executeNode } = usePipelineStore();

  // Direct store actions, no prop drilling
}
```

### 5. Benefits

#### ✅ Performance Improvements

- **Selective subscriptions** - Components only re-render on relevant state changes
- **Reduced prop drilling** - Less prop passing reduces render cascades
- **Computed values** - Memoized derived state prevents unnecessary calculations
- **Destructured subscriptions** - Use `const { prop1, prop2 } = usePipelineStore()` instead of multiple individual subscriptions to reduce function calls and improve readability

#### ✅ Developer Experience

- **Single source of truth** - All pipeline state in one place
- **Type safety** - Full TypeScript integration with Zustand
- **Debugging** - Easier to track state changes with Zustand devtools
- **Testing** - Store logic can be tested independently

#### ✅ Code Quality

- **Simplified components** - Less local state management complexity
- **Consistent patterns** - Unified approach to state updates and error handling
- **Better separation of concerns** - UI components focus on presentation
- **Reduced coupling** - Components depend on store, not on each other

#### ✅ Maintainability

- **Centralized business logic** - All pipeline operations in store actions
- **Easier feature additions** - New features integrate cleanly with existing store
- **Consistent error handling** - Unified error patterns across all operations
- **Code reuse** - Store actions can be used across multiple components

### 6. Implementation Checklist

#### Store Setup

- [x] Create `stores/usePipelineStore.ts`
- [x] Implement basic state structure
- [x] Add loadPipeline action
- [x] Add error handling and loading states

#### Page Integration

- [x] Replace local state in `page.tsx` with store
- [x] Remove prop passing to PipelineEditor
- [x] Test basic pipeline loading

#### Editor Migration

- [x] Move PipelineEditor state to store
- [x] Implement optimistic update actions
- [x] Remove state props from component
- [x] Test node operations (execute, connect, delete)

#### Component Simplification

- [x] Update FlowCanvas to use store directly
- [x] Update EditorPanel to use store directly
- [x] Remove all callback props
- [x] Test component interactions

#### Advanced Features

- [x] Add computed state getters
- [x] Implement layout management
- [x] Add toast notifications
- [x] Performance optimization with selective subscriptions
- [x] Add undo/redo capabilities
- [x] Add keyboard shortcuts
- [x] Add enhanced UI controls

#### Testing & Validation

- [ ] Unit tests for store actions
- [ ] Integration tests for optimistic updates
- [x] E2E tests for full pipeline workflow
- [ ] Performance testing for large pipelines

### 7. Migration Strategy

1. **Incremental migration** - Implement store alongside existing state, gradually migrate components
2. **Feature flags** - Use environment variables to toggle between old and new implementations during development
3. **Backward compatibility** - Ensure API contracts remain the same during transition
4. **Testing at each phase** - Validate functionality after each migration step

### 8. Risk Mitigation

- **Gradual rollout** - Migrate one component at a time
- **Comprehensive testing** - Ensure no regression in functionality
- **Rollback plan** - Keep old implementation until new one is fully validated
- **Performance monitoring** - Track performance metrics during migration

## Conclusion

This refactoring will transform the pipeline page from a complex, tightly-coupled component hierarchy into a clean, maintainable architecture with centralized state management. The migration provides immediate benefits in terms of code organization and developer experience, while setting up the foundation for future enhancements and better performance.
