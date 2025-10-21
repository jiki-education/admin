# Video Pipeline Editor Migration Plan

## Overview
This plan outlines the step-by-step process to copy the video pipeline editor from `../video-production/app/pipelines/[id]` to this admin codebase at `app/video-pipelines/[uuid]`. The goal is to create a clean, full-screen pipeline editor that integrates with the admin's API conventions.

## Current State Analysis

### Source Codebase (`../video-production`)
- **Main Page**: `app/pipelines/[id]/page.tsx` - Server component that fetches pipeline data
- **Layout Component**: `app/pipelines/[id]/components/PipelineLayout.tsx` - Client wrapper
- **Editor Components**:
  - `PipelineEditor.tsx` - Main editor logic with state management
  - `FlowCanvas.tsx` - React Flow canvas
  - `EditorPanel.tsx` - Right sidebar panel
  - `PipelineHeader.tsx` - Top navigation bar
- **Node Components**: 8 different node types in `components/nodes/`
- **Shared Components**: Common node UI components in `components/nodes/shared/`
- **API Client**: `lib/api-client.ts` - Custom fetch-based API calls
- **Types**: `lib/types.ts` - Domain types
- **Dependencies**: React Flow, Dagre layout, @dnd-kit for drag & drop

### Target Codebase (`admin`)
- **API Service**: `lib/api/video-pipelines.ts` - Axios-based API with error handling
- **Types**: Updated comprehensive type definitions
- **Tech Stack**: Next.js 15, React 19, Tailwind v4, TypeScript

## Migration Strategy

### Phase 1: Dependency Setup
1. **Install Required Dependencies**
   ```bash
   pnpm add @xyflow/react dagre @dnd-kit/core @dnd-kit/modifiers @dnd-kit/sortable @dnd-kit/utilities
   pnpm add -D @types/dagre
   ```

2. **Copy Supporting Libraries**
   - Copy `lib/layout.ts` for Dagre auto-layout functionality
   - Copy `lib/nodes/` directory for node type definitions and helpers
   - Adapt imports to use admin's API conventions

### Phase 2: Directory Structure Setup
Create the following directory structure in admin:
```
app/video-pipelines/[uuid]/
├── page.tsx                           # Main page (server component)
├── components/
│   ├── PipelineLayout.tsx            # Client wrapper
│   ├── PipelineEditor.tsx            # Main editor with state management
│   ├── PipelineHeader.tsx            # Top navigation
│   ├── FlowCanvas.tsx                # React Flow canvas
│   ├── EditorPanel.tsx               # Right sidebar
│   └── nodes/
│       ├── AssetNode.tsx
│       ├── GenerateTalkingHeadNode.tsx
│       ├── GenerateAnimationNode.tsx
│       ├── GenerateVoiceoverNode.tsx
│       ├── RenderCodeNode.tsx
│       ├── MixAudioNode.tsx
│       ├── MergeVideosNode.tsx
│       ├── ComposeVideoNode.tsx
│       └── shared/
│           ├── NodeHeader.tsx
│           ├── NodeInputHandles.tsx
│           ├── NodeOutputHandle.tsx
│           ├── NodeOutputPreview.tsx
│           ├── StatusBadge.tsx
│           └── getNodeStatusStyle.ts
```

### Phase 3: File Copy and Adaptation

#### Step 3.1: Copy Core Files
```bash
# Create directory structure
mkdir -p app/video-pipelines/[uuid]/components/nodes/shared
mkdir -p app/video-pipelines/[uuid]/components/editor-panel

# Copy main page and components
cp ../video-production/app/pipelines/[id]/page.tsx app/video-pipelines/[uuid]/
cp ../video-production/app/pipelines/[id]/components/*.tsx app/video-pipelines/[uuid]/components/

# Copy all node components
cp ../video-production/app/pipelines/[id]/components/nodes/*.tsx app/video-pipelines/[uuid]/components/nodes/
cp ../video-production/app/pipelines/[id]/components/nodes/shared/*.tsx app/video-pipelines/[uuid]/components/nodes/shared/
cp ../video-production/app/pipelines/[id]/components/nodes/shared/*.ts app/video-pipelines/[uuid]/components/nodes/shared/

# Copy editor panel components if they exist
cp ../video-production/app/pipelines/[id]/components/editor-panel/*.tsx app/video-pipelines/[uuid]/components/editor-panel/
```

#### Step 3.2: Copy Supporting Libraries
```bash
# Copy layout utilities
cp ../video-production/lib/layout.ts lib/

# Copy node-related libraries
mkdir -p lib/nodes
cp ../video-production/lib/nodes/*.ts lib/nodes/
```

### Phase 4: API Integration Adaptation

#### Step 4.1: Update Main Page (`page.tsx`)
- **Import Changes**: Replace `@/lib/api-client` with `@/lib/api/video-pipelines`
- **API Calls**: Replace `getPipeline(uuid)` with admin's `getPipeline(uuid)` function
- **Type Conversion**: Use admin's type definitions instead of video-production types
- **Error Handling**: Leverage admin's error handling patterns

**Key Changes:**
```typescript
// BEFORE (video-production)
import { getPipeline, toDomainNode } from "@/lib/api-client";
const data = await getPipeline(uuid);
nodes = data.nodes.map(toDomainNode);

// AFTER (admin)
import { getPipeline } from "@/lib/api/video-pipelines";
const { pipeline } = await getPipeline(uuid);
// Use admin's type system directly
```

#### Step 4.2: Update PipelineEditor Component
- **API Imports**: Replace all `@/lib/api-client` imports with admin's API functions
- **Function Calls**: Update `connectNodes`, `deleteNode` calls to use admin's API
- **Type Definitions**: Use admin's comprehensive type definitions
- **Error Handling**: Implement admin's error handling patterns

**Key Changes:**
```typescript
// BEFORE
import { connectNodes, deleteNode } from "@/lib/api-client";

// AFTER  
import { connectNodes, deleteNode } from "@/lib/api/video-pipelines";
// Note: These functions need to be implemented in admin's API
```

### Phase 5: API Function Implementation

#### Step 5.1: Implement Missing API Functions
Add these functions to `lib/api/video-pipelines.ts`:

```typescript
/**
 * Connect two nodes by updating target node's inputs
 */
export async function connectNodes(
  pipelineUuid: string,
  sourceNodeUuid: string,
  targetNodeUuid: string,
  inputKey: string
): Promise<void>

/**
 * Delete a node from a pipeline
 */
export async function deleteNode(
  pipelineUuid: string, 
  nodeUuid: string
): Promise<void>

/**
 * Create a new node in a pipeline
 */
export async function createNode(
  pipelineUuid: string,
  nodeData: CreateNodeData
): Promise<VideoProductionNode>

/**
 * Update a node's configuration
 */
export async function updateNode(
  pipelineUuid: string,
  nodeUuid: string,
  updates: Partial<VideoProductionNode>
): Promise<VideoProductionNode>

/**
 * Reorder inputs array for a node
 */
export async function reorderNodeInputs(
  pipelineUuid: string,
  nodeUuid: string,
  inputKey: string,
  newOrder: string[]
): Promise<void>
```

#### Step 5.2: Update Type Mappings
Create type adapters to bridge video-production types with admin types:

```typescript
// In lib/video-pipelines-adapter.ts
export function toVideoProductionNode(adminNode: VideoProductionNode): Node {
  // Convert admin types to video-production compatible types
}

export function toAdminNode(vpNode: Node): VideoProductionNode {
  // Convert video-production types to admin types
}
```

### Phase 6: UI and Layout Adjustments

#### Step 6.1: Remove Dashboard Integration
- Remove any dashboard-specific navigation or layout components
- Ensure the pipeline editor is full-screen
- Update header to be standalone (no dashboard breadcrumbs)

#### Step 6.2: Tailwind Compatibility
- Verify all Tailwind classes work with admin's Tailwind v4 setup
- Update any incompatible classes
- Ensure responsive design works correctly

#### Step 6.3: Route Integration
- Update `app/video-pipelines/[uuid]/page.tsx` to use admin's route parameter pattern
- Ensure proper URL structure (`/video-pipelines/{uuid}` instead of `/pipelines/{id}`)

### Phase 7: Node Components Update

#### Step 7.1: Import Path Updates
Update all import paths in node components:
```typescript
// BEFORE
import type { Node } from "@/lib/nodes/types";
import { api-client functions } from "@/lib/api-client";

// AFTER  
import type { VideoProductionNode } from "@/lib/api/video-pipelines";
import { api functions } from "@/lib/api/video-pipelines";
```

#### Step 7.2: Type Definition Updates
- Replace video-production `Node` type with admin's `VideoProductionNode`
- Update all node-specific interfaces to extend admin's base types
- Ensure proper type safety throughout

### Phase 8: Testing and Validation

#### Step 8.1: Type Checking
```bash
npx tsc --noEmit
```

#### Step 8.2: Lint and Format
```bash
pnpm lint
pnpm format
```

#### Step 8.3: Build Verification
```bash
pnpm build
```

#### Step 8.4: Runtime Testing
1. Start development server: `./bin/dev-claude`
2. Navigate to `/video-pipelines/{test-uuid}`
3. Verify pipeline loads correctly
4. Test node interactions, connections, deletions
5. Verify API calls work with admin's backend

### Phase 9: Integration Points

#### Step 9.1: Navigation Integration
- Add navigation from admin dashboard to pipeline editor
- Ensure proper back navigation
- Update any breadcrumb or header links

#### Step 9.2: Authentication Integration
- Ensure pipeline editor respects admin's authentication
- Update API calls to include proper auth headers
- Handle authentication errors appropriately

#### Step 9.3: Error Handling
- Implement admin's error handling patterns
- Add proper error boundaries
- Show appropriate error messages using admin's UI components

## Implementation Checklist

### Dependencies
- [ ] Install @xyflow/react, dagre, @dnd-kit packages
- [ ] Install @types/dagre

### File Structure
- [ ] Create app/video-pipelines/[uuid]/ directory
- [ ] Copy all component files from video-production
- [ ] Copy supporting library files

### API Integration
- [ ] Update main page.tsx API calls
- [ ] Update PipelineEditor API calls  
- [ ] Implement missing API functions in video-pipelines.ts
- [ ] Create type adapters if needed

### Type System
- [ ] Update all import paths
- [ ] Replace video-production types with admin types
- [ ] Ensure type safety throughout

### UI/UX
- [ ] Remove dashboard-specific elements
- [ ] Ensure full-screen layout
- [ ] Verify Tailwind compatibility
- [ ] Update route parameters (id -> uuid)

### Testing
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Runtime testing complete
- [ ] All node types render correctly
- [ ] API interactions work properly

### Final Integration
- [ ] Add navigation from dashboard
- [ ] Implement error boundaries
- [ ] Verify authentication integration
- [ ] Test complete user workflows

## Risk Mitigation

### Potential Issues
1. **Type Compatibility**: Admin types may not be 100% compatible with video-production types
   - **Solution**: Create type adapters/converters as needed

2. **API Differences**: Admin's axios-based API vs video-production's fetch-based API
   - **Solution**: Implement missing API functions using admin's patterns

3. **Dependency Conflicts**: React Flow and related packages may conflict
   - **Solution**: Use exact versions that work, test thoroughly

4. **Tailwind Version Differences**: v4 vs older version compatibility
   - **Solution**: Audit and update all Tailwind classes

### Rollback Plan
If migration fails:
1. Keep original video-production codebase intact
2. Remove app/video-pipelines/[uuid] directory
3. Uninstall added dependencies
4. Revert any lib/ changes

## Success Criteria
- [ ] Pipeline editor loads at `/video-pipelines/{uuid}`
- [ ] All 8 node types render correctly
- [ ] Nodes can be connected and disconnected
- [ ] Nodes can be deleted
- [ ] Editor panel shows node details
- [ ] API calls integrate with admin's backend
- [ ] Full-screen layout without dashboard interference
- [ ] Type safety maintained throughout
- [ ] Build and lint checks pass