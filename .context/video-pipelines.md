# Video Pipelines - Architecture & Implementation Guide

## Overview

The Video Pipelines feature is a visual node-based editor for creating video production workflows. Users can create, connect, and execute nodes to generate videos through a React Flow-based interface.

## Core Architecture

### 1. State Management - Modular Zustand Store

The pipeline state is managed by a **modular Zustand store** split across focused files:

#### Store Structure:
```
stores/pipeline/
├── types.ts          # TypeScript interfaces and types (83 lines)
├── getters.ts         # Computed state and derived values (104 lines)  
├── actions.ts         # Core pipeline actions (95 lines)
├── nodeActions.ts     # Node operations - connect/delete (125 lines)
├── historyActions.ts  # Undo/redo functionality (58 lines)
├── index.ts          # Main store composition (48 lines)
└── usePipelineStore.ts # Re-export for backward compatibility (3 lines)
```

#### Key Store Features:
- **Optimistic Updates** with automatic rollback on API failures
- **Undo/Redo History** with 50-entry limit and branching support
- **Layout Management** with dagre algorithm (LR/TB directions only)
- **Real-time State** syncing with toast notifications
- **Performance Optimized** with selective subscriptions

### 2. Component Architecture

#### Main Components:
```
app/video-pipelines/[uuid]/
├── page.tsx                    # Main route - loads pipeline, handles auth
├── components/
│   ├── PipelineLayout.tsx      # Layout wrapper with error boundaries
│   ├── PipelineEditor.tsx      # Main coordinator with keyboard shortcuts
│   ├── FlowCanvas.tsx          # React Flow visual editor
│   ├── EditorPanel.tsx         # Side panel for selected node details
│   └── nodes/                  # Individual node type components
│       ├── AssetNode.tsx
│       ├── GenerateTalkingHeadNode.tsx
│       ├── RenderCodeNode.tsx
│       ├── GenerateAnimationNode.tsx
│       ├── GenerateVoiceoverNode.tsx
│       ├── MixAudioNode.tsx
│       ├── MergeVideosNode.tsx
│       └── ComposeVideoNode.tsx
```

#### Component Patterns:
- **Zero Prop Drilling** - All components use direct store subscriptions
- **Destructured Store Access** - `const { prop1, prop2 } = usePipelineStore()`
- **Selective Subscriptions** - Components only re-render on relevant state changes

### 3. Node System

#### Node Types:
- **Asset Nodes** - Static media (images, videos, audio)
- **Generation Nodes** - AI-powered content creation (talking heads, animations, voiceovers)
- **Processing Nodes** - Media manipulation (mixing, merging, composing)
- **Render Nodes** - Code-to-visual conversion

#### Node Structure:
```typescript
interface Node {
  uuid: string;
  type: NodeType;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  inputs: Record<string, string | string[]>; // Multi-input support
  outputs: Record<string, any>;
  metadata: Record<string, any>;
  pipeline_uuid: string;
}
```

#### Connection System:
- **Multi-input Support** - Nodes can accept multiple connections per handle
- **Type Validation** - Only compatible handles can be connected
- **Visual Feedback** - Edge colors and styles reflect node status
- **Real-time Updates** - Connections sync immediately with backend

### 4. Layout & Visualization

#### React Flow Integration:
- **Dagre Layout** - Automatic hierarchical positioning
- **Custom Node Components** - Type-specific rendering and interactions
- **Edge Styling** - Dynamic colors and animations based on node status
- **Interactive Canvas** - Pan, zoom, select, drag functionality

#### Layout Features:
- **Auto-Layout** on pipeline load with position preservation
- **Manual Positioning** - Drag nodes with position saving
- **Layout Algorithms** - Currently supports Dagre (LR/TB directions)
- **Responsive Design** - Adapts to measured node dimensions

### 5. API Integration

#### Backend Endpoints:
```typescript
// Pipeline Management
GET    /v1/admin/video_production/pipelines/:uuid
POST   /v1/admin/video_production/pipelines

// Node Operations  
POST   /v1/admin/video_production/pipelines/:uuid/nodes/:nodeId/execute
POST   /v1/admin/video_production/pipelines/:uuid/nodes/:sourceId/connect/:targetId
DELETE /v1/admin/video_production/pipelines/:uuid/nodes/:nodeId

// Media Proxy (for HTML video elements with auth)
GET    /api/videos/:pipelineId/:nodeId?token=:jwt
```

#### Error Handling:
- **Optimistic Updates** - UI updates immediately, rolls back on failure
- **User-Friendly Messages** - Toast notifications with specific error details
- **Automatic Retry** - Some operations retry on network errors
- **Graceful Degradation** - UI remains functional during API issues

### 6. Authentication & Media

#### Video Proxy System:
Problem: HTML `<video>` elements cannot send Authorization headers
Solution: Proxy route with token query parameter

```typescript
// Frontend
const videoUrl = `/api/videos/${pipelineUuid}/${nodeUuid}?token=${jwt}`;

// Backend Proxy
app/api/videos/[pipelineId]/[nodeId]/route.ts
- Accepts JWT from query param or header
- Forwards to Rails: /v1/admin/video_production/pipelines/:id/nodes/:nodeId/output
- Returns 401 if invalid token
```

### 7. Performance Optimizations

#### Store Performance:
- **Selective Subscriptions** - Components only watch relevant state slices
- **Destructured Access** - Single store call instead of multiple individual calls
- **Computed Values** - Memoized getters for expensive calculations
- **State Normalization** - Efficient data structures for large pipelines

#### React Flow Performance:
- **Node Virtualization** - Only render visible nodes for large graphs
- **Edge Optimization** - Efficient edge rendering with dynamic styling
- **Layout Caching** - Preserve node positions between renders
- **React Compiler** - Automatic optimization (no manual memoization needed)

### 8. Testing Strategy

#### Current Test Coverage:
- **E2E Tests** - Full pipeline workflow with Puppeteer
- **API Tests** - Video pipeline endpoints with comprehensive mocking
- **Component Tests** - Individual node components and interactions

#### Missing Tests (Future):
- **Store Unit Tests** - Individual store action testing
- **Integration Tests** - Optimistic update rollback scenarios
- **Performance Tests** - Large pipeline handling

### 9. Keyboard Shortcuts & UX

#### Available Shortcuts:
- **Cmd/Ctrl + Z** - Undo last action
- **Cmd/Ctrl + Shift + Z / Cmd/Ctrl + Y** - Redo action
- **R** - Force relayout of nodes
- **Delete** - Delete selected nodes

#### UX Features:
- **Real-time Feedback** - Loading states, progress indicators
- **Toast Notifications** - Success/error messages with context
- **Visual Status** - Node colors reflect execution status
- **Responsive Design** - Works on different screen sizes

### 10. Development Guidelines

#### Adding New Node Types:
1. Create node component in `components/nodes/`
2. Register in `FlowCanvas.tsx` nodeTypes
3. Add type metadata in `lib/nodes/metadata.ts`
4. Add display helpers in `lib/nodes/display-helpers.ts`
5. Update TypeScript types in `lib/nodes/types.ts`

#### Extending Store Functionality:
1. Add action to appropriate module (`actions.ts`, `nodeActions.ts`, etc.)
2. Update `PipelineState` interface in `types.ts`
3. Export from `index.ts`
4. Use destructured access in components

#### Performance Considerations:
- Use `const { prop1, prop2 } = usePipelineStore()` instead of multiple calls
- Avoid heavy computations in render; use store getters
- Test with large pipelines (50+ nodes) for performance
- Monitor re-render frequency with React DevTools

### 11. Common Patterns

#### Store Usage Pattern:
```typescript
// Good - Single destructured call
const { nodes, pipeline, executeNode, connectNodes } = usePipelineStore();

// Bad - Multiple individual calls  
const nodes = usePipelineStore(state => state.nodes);
const pipeline = usePipelineStore(state => state.pipeline);
const executeNode = usePipelineStore(state => state.executeNode);
```

#### Error Handling Pattern:
```typescript
// Store actions include automatic error handling
try {
  await apiCall();
  toast.success('Operation completed');
} catch (error) {
  set({ previousState }); // Rollback optimistic update
  toast.error(`Failed: ${error.message}`);
}
```

#### Component Structure Pattern:
```typescript
export default function NodeComponent() {
  const { relevantState, relevantActions } = usePipelineStore();
  
  // Component logic
  
  return <div>Component JSX</div>;
}
```

## Future Improvements

### Planned Features:
- **Additional Layout Algorithms** - Force-directed, circular, grid layouts
- **Node Templates** - Reusable node configurations
- **Pipeline Templates** - Common workflow templates
- **Batch Operations** - Multi-node operations
- **Export/Import** - Pipeline configuration sharing

### Technical Debt:
- **Unit Test Coverage** - Add comprehensive store action tests
- **Type Safety** - Strengthen node input/output typing
- **Performance** - Optimize for 100+ node pipelines
- **Documentation** - Add inline code documentation

## Troubleshooting

### Common Issues:
1. **Layout not updating** - Check `hasInitialLayout` flag, try force relayout (R key)
2. **Connections not working** - Verify node types support the handle types
3. **Video not loading** - Check auth token in proxy URL, verify backend endpoint
4. **Store state not updating** - Ensure destructured store access, check for multiple subscriptions
5. **Performance issues** - Monitor for excessive re-renders, check store subscription patterns