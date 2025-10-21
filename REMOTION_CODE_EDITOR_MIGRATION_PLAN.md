# Remotion Code Editor Migration Plan

## Overview

This plan outlines the migration of the Remotion-based code screen generator from the `../video-production` repository into the Jiki Admin dashboard. The code editor will enable creation and preview of animated code tutorials directly within the admin interface.

## Current Remotion Implementation Analysis

### Source Structure (`../video-production`)

**Core Remotion Components:**
- `src/components/AnimatedCode.tsx` - Character-by-character typing animation with syntax highlighting
- `src/compositions/CodeScene.tsx` - Scene composition that orchestrates AnimatedCode sequences
- `src/Root.tsx` - Remotion composition registry
- `src/lib/types.ts` - TypeScript definitions for scenes and actions
- `src/lib/timing.ts` - Frame timing calculations for typing speeds
- `src/lib/audio.tsx` - Keypress sound effects

**Key Features:**
- Character-by-character typing animations
- Configurable typing speeds (slow: 10 chars/sec, normal: 15 chars/sec, fast: 25 chars/sec)
- Syntax highlighting with `react-syntax-highlighter`
- JSON-driven scene configuration
- Keypress sound effects
- Support for pause actions between code segments
- 1920x1080 @ 30fps output

**Scene Configuration Format:**
```json
{
  "title": "Scene Title",
  "theme": "dark",
  "backgroundColor": "#1e1e1e",
  "actions": [
    {
      "type": "type",
      "code": "let x = 42;",
      "speed": "normal",
      "language": "javascript"
    },
    {
      "type": "pause",
      "duration": 0.5
    }
  ]
}
```

### Current Dependencies
- `@remotion/bundler`, `@remotion/cli`, `@remotion/media-utils`, `@remotion/renderer`, `remotion`
- `react-syntax-highlighter` for code highlighting
- Next.js 15 with development server on port 3065

## Existing Admin Integration

The admin already has comprehensive video pipeline integration:

**Current Video Pipeline Features:**
- Visual pipeline editor with React Flow (`app/video-pipelines/[uuid]/`)
- Node-based workflow designer with drag-and-drop
- Real-time execution monitoring
- Various node types: Asset, Generate Talking Head, Generate Animation, Compose Video, etc.
- API integration with Rails backend (`lib/api/video-pipelines.ts`)

**Integration Points:**
- `/app/video-pipelines/[uuid]/page.tsx` - Pipeline editor page
- `/app/video-pipelines/[uuid]/components/PipelineEditor.tsx` - Main editor component
- `/lib/nodes/types.ts` - Node type definitions
- `/lib/api/video-pipelines.ts` - API client functions

## Migration Plan

### Phase 1: Core Remotion Integration (3-4 days)

**1.1 Add Remotion Dependencies**
```bash
pnpm add @remotion/bundler @remotion/cli @remotion/media-utils @remotion/renderer remotion react-syntax-highlighter
pnpm add -D @types/react-syntax-highlighter
```

**1.2 Create Remotion Infrastructure**
- `lib/remotion/` - Remotion-specific utilities and types
  - `lib/remotion/types.ts` - Migrate scene types from video-production
  - `lib/remotion/timing.ts` - Frame timing calculations
  - `lib/remotion/audio.tsx` - Keypress sound components
- `components/remotion/` - Remotion components
  - `components/remotion/AnimatedCode.tsx` - Typing animation component
  - `components/remotion/CodeScene.tsx` - Scene composition
  - `components/remotion/Root.tsx` - Composition registry
- `remotion.config.ts` - Remotion configuration file in admin root

**1.3 Create Scene Management**
- `lib/api/code-scenes.ts` - API client for scene CRUD operations
- `lib/types/code-scenes.ts` - TypeScript definitions for scenes
- Database schema will be handled by Rails backend (scenes table)

### Phase 2: Code Editor UI (2-3 days)

**2.1 Scene Management Pages**
- `app/dashboard/code-scenes/page.tsx` - Scene list view with table
- `app/dashboard/code-scenes/new/page.tsx` - Create new scene
- `app/dashboard/code-scenes/[id]/page.tsx` - Edit existing scene
- `app/dashboard/code-scenes/[id]/preview/page.tsx` - Remotion preview

**2.2 Editor Components**
- `app/dashboard/code-scenes/components/SceneEditor.tsx` - Main editor interface
- `app/dashboard/code-scenes/components/ActionEditor.tsx` - Individual action editing
- `app/dashboard/code-scenes/components/CodePreview.tsx` - Real-time code preview
- `app/dashboard/code-scenes/components/TimingControls.tsx` - Speed/timing controls

**2.3 Integration with Remotion Studio**
- `scripts/dev-remotion.js` - Custom script to launch Remotion Studio
- Update `package.json` with Remotion scripts:
  ```json
  {
    "scripts": {
      "dev:remotion": "remotion preview",
      "render:scene": "tsx scripts/render-scene.ts"
    }
  }
  ```

### Phase 3: Advanced Features (2-3 days)

**3.1 Remotion Preview Integration**
- Embed Remotion Player component directly in admin UI
- Real-time preview while editing scene configuration
- Frame-by-frame scrubbing and playback controls

**3.2 Render Management**
- `scripts/render-scene.ts` - Render individual scenes to MP4
- `lib/api/render-jobs.ts` - Background render job management
- Progress tracking and status updates for long renders

**3.3 Scene Library**
- Template scenes for common programming concepts
- Import/export scene configurations
- Scene categorization and search

### Phase 4: Pipeline Integration (1-2 days)

**4.1 Code Scene Node Type**
- Add "Generate Code Screen" node to video pipeline editor
- Node configuration UI for selecting/creating code scenes
- Integration with existing pipeline workflow

**4.2 Asset Management**
- Store rendered code screen videos as pipeline assets
- Link code scenes to video pipeline nodes
- Asset preview and management

## Technical Implementation Details

### File Structure
```
admin/
├── lib/
│   ├── remotion/
│   │   ├── types.ts          # Scene config types
│   │   ├── timing.ts         # Frame calculations
│   │   └── audio.tsx         # Sound effects
│   └── api/
│       └── code-scenes.ts    # Scene API client
├── components/
│   └── remotion/
│       ├── AnimatedCode.tsx  # Typing animation
│       ├── CodeScene.tsx     # Scene composition
│       └── Root.tsx          # Composition registry
├── app/
│   └── dashboard/
│       └── code-scenes/
│           ├── page.tsx      # Scene list
│           ├── new/page.tsx  # Create scene
│           ├── [id]/
│           │   ├── page.tsx  # Edit scene
│           │   └── preview/page.tsx # Preview
│           └── components/   # Editor components
├── scripts/
│   ├── render-scene.ts       # Render script
│   └── dev-remotion.js       # Development script
└── remotion.config.ts        # Remotion config
```

### Navigation Integration
Update `layout/AppSidebar.tsx` to include:
```tsx
{
  href: "/dashboard/code-scenes",
  label: "Code Scenes",
  icon: Code2
}
```

### API Endpoints (Backend Requirements)
- `GET /api/code-scenes` - List scenes
- `POST /api/code-scenes` - Create scene
- `GET /api/code-scenes/:id` - Get scene
- `PUT /api/code-scenes/:id` - Update scene
- `DELETE /api/code-scenes/:id` - Delete scene
- `POST /api/code-scenes/:id/render` - Trigger render

### Development Workflow

**During Development:**
1. Use Remotion Studio for composition development: `pnpm dev:remotion`
2. Admin dashboard for scene management: `pnpm dev` (port 3062)
3. Both can run simultaneously on different ports

**Scene Creation Workflow:**
1. Create scene in admin dashboard with JSON configuration
2. Preview in embedded Remotion Player
3. Render to MP4 for use in video pipelines
4. Integrate as nodes in pipeline editor

## Migration Steps

### Step 1: Prepare Dependencies
1. Add Remotion packages to `package.json`
2. Create `remotion.config.ts` in admin root
3. Update `next.config.ts` if needed for Remotion compatibility

### Step 2: Copy Core Components
1. Copy and adapt `AnimatedCode.tsx` from video-production
2. Copy and adapt `CodeScene.tsx` with admin-specific modifications
3. Create `Root.tsx` composition registry
4. Migrate type definitions and utilities

### Step 3: Create Scene Management
1. Implement scene CRUD API client
2. Create scene list and editor pages
3. Add navigation links to sidebar

### Step 4: Test Integration
1. Create test scene configurations
2. Verify Remotion preview functionality
3. Test scene editing and saving

### Step 5: Advanced Features
1. Add embedded Remotion Player
2. Implement render management
3. Integrate with video pipeline editor

## Benefits of Migration

1. **Unified Interface**: All video production tools in one admin dashboard
2. **Integrated Workflow**: Code scenes directly accessible from video pipelines
3. **Better UX**: No need to switch between separate applications
4. **Consistent Auth**: Same authentication system as rest of admin
5. **Shared Components**: Reuse existing admin UI components and patterns
6. **Simplified Deployment**: One less application to deploy and maintain

## Risks and Considerations

1. **Bundle Size**: Remotion adds significant dependencies
2. **Browser Performance**: Video rendering in browser can be resource-intensive
3. **API Dependencies**: Requires backend implementation for scene storage
4. **Development Complexity**: Managing two servers during development
5. **Testing**: E2E tests need to handle Remotion components

## Next Steps

1. Confirm backend API availability for scene storage
2. Review admin dashboard architecture for optimal integration points
3. Create proof-of-concept with basic scene editor
4. Implement Phase 1 (Core Remotion Integration)
5. Iterate through remaining phases based on user feedback

This migration will transform the admin from a simple CRUD interface into a comprehensive video production suite, enabling seamless creation of animated code tutorials directly within the platform management workflow.