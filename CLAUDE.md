# Instructions for coding assistants

This file provides guidance to AI agents when working with the Jiki Admin application.

## What is Jiki Admin?

The Jiki Admin application is a standalone Next.js application for managing the Jiki learning platform. It is completely independent from the main front-end application (located at `../front-end/app`) and runs on its own server (port 3062).

**Purpose**: Administrative dashboard for platform management, user administration, content moderation, and system monitoring.

**Architecture**: Standalone Next.js 15 app with no dependencies on the front-end monorepo packages.

## Quick Start

### Development

```bash
./bin/dev         # Runs on http://localhost:3062
./bin/dev-claude  # Runs on http://localhost:3063 (alternative port)
```

### Testing

```bash
# Unit Tests
pnpm test               # Run unit tests
pnpm test:watch         # Run unit tests in watch mode
pnpm test:coverage      # Run unit tests with coverage report
pnpm test:ci            # Run unit tests for CI (coverage + no watch)

# E2E Tests
pnpm test:e2e           # Run E2E tests (on port 3064)
pnpm test:e2e:watch     # Watch mode
pnpm test:e2e:headful   # Run with visible browser
```

### Code Quality

```bash
npx tsc --noEmit  # Type checking
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check formatting
```

## Core Technology Stack

- **Framework**: Next.js 15 with App Router, TypeScript
- **UI Library**: React 19 with React Compiler (automatic optimization)
- **Styling**: Tailwind CSS v4
- **Testing**: Jest + React Testing Library for unit tests, Puppeteer for E2E tests
- **Package Manager**: pnpm

**Note**: React Compiler is enabled, so manual memoization (`useMemo`, `useCallback`, `memo()`) is generally not needed.

## Project Structure

```
admin/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard route
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles & Tailwind
├── tests/
│   └── e2e/              # E2E tests with Puppeteer
├── scripts/
│   └── run-e2e-tests.js  # Custom test runner
├── bin/
│   ├── dev               # Development script
│   └── dev-claude        # Claude dev script
└── [config files]        # ESLint, Prettier, TypeScript, etc.
```

## Development Guidelines

### Code Style

This project follows the same coding standards as `front-end/app`:

- **Function declarations** over arrow functions for top-level exports
- **TypeScript strict mode** enabled
- **Consistent formatting** via Prettier (printWidth: 120)
- **Type-safe imports** using `import type` for types
- **Interface over type** for object shapes
- **Path alias**: `@/*` maps to project root

### Component Patterns

- **Server Components by default** - Use `"use client"` only when necessary
- **File organization**: Imports → Types → Component → Helpers
- **Semantic HTML** and accessibility attributes
- **Mobile-first responsive design** with Tailwind

### Testing

- **Comprehensive test coverage** - Both unit and E2E tests
- **Unit tests**: 57 tests using Jest + React Testing Library
- **E2E tests**: 47 tests using Puppeteer (located in `tests/e2e/`)
- Custom test runner starts dev server automatically
- API client functions have full test coverage
- Use descriptive test names and clear assertions

## Architecture Principles

- **Standalone app** - No dependencies on front-end monorepo packages
- **Simple structure** - No complex state management (yet)
- **Type safety everywhere** - Full TypeScript with strict mode
- **Performance by default** - React Compiler, code splitting, lazy loading

## Important Rules

1. **Match existing patterns** - Look at similar features before implementing new ones
2. **Never work directly on main** - Always create feature branches
3. **Commit regularly** - Save progress frequently with clear commit messages
4. **Keep it simple** - This is an admin tool, not a user-facing product. Prioritize functionality over fancy UI
5. **Document as you go** - Update this file and README.md when adding new features
6. **Use existing TailAdmin components** - Always check `/components/ui/` for available components (Modal, Button, etc.) before creating custom implementations

## Common Tasks

### Adding a new route

1. Create `app/[route-name]/page.tsx`
2. Add E2E test in `tests/e2e/[route-name].test.ts`
3. Run `pnpm test:e2e` to verify

### Adding dependencies

```bash
pnpm add [package-name]      # Runtime dependency
pnpm add -D [package-name]   # Dev dependency
```

### Debugging

- Check Next.js dev server output for errors
- Use `console.log` or browser DevTools for debugging
- E2E test failures show browser screenshots in terminal
- Set `HEADLESS=false` to see browser during tests

## Backend Integration Status

### ✅ Completed Integrations (Phase 1)

**User Management:**

- **DELETE /v1/admin/users/:id** - ✅ Fully integrated
  - API function: `deleteUser` in `lib/api/users.ts`
  - UI integration: `app/dashboard/users/page.tsx`
  - Comprehensive unit tests included

**Level Management:**

- **POST /v1/admin/levels** - ✅ Fully integrated
  - API function: `createLevel` in `lib/api/levels.ts`
  - UI integration: `app/dashboard/levels/new/page.tsx`
  - Auto-position assignment, full validation
  - Comprehensive unit tests included

**Concept Management:**

- **GET /v1/admin/concepts** - ✅ Fully integrated (list with pagination/filtering)
- **GET /v1/admin/concepts/:id** - ✅ Fully integrated (single concept)
- **POST /v1/admin/concepts** - ✅ Fully integrated (create concept)
- **PATCH /v1/admin/concepts/:id** - ✅ Fully integrated (update concept)
- **DELETE /v1/admin/concepts/:id** - ✅ Fully integrated (delete concept)
  - API functions: Complete CRUD in `lib/api/concepts.ts`
  - UI integration: Full concept management at `/dashboard/concepts`
  - Features: Markdown editor, video provider integration, auto-slug generation
  - Comprehensive unit and E2E tests included

### ❌ Pending Backend Implementation

**Lesson Management:**

- **POST /v1/admin/levels/:levelId/lessons** - Backend missing
  - Frontend ready but blocked by missing backend endpoint
  - Requires backend team to implement following Level::Create pattern
  - Will complete Phase 2 integration once backend is available

### Integration Guidelines

- All API functions have comprehensive unit test coverage
- Error handling follows consistent patterns across endpoints
- Backend uses command pattern (User::Destroy, Level::Create)
- Frontend matches exact backend request/response formats
- See `BACKEND_INTEGRATION_PLAN.md` for detailed specifications

### Video Proxy Authentication

**Problem**: HTML video/audio elements cannot send custom Authorization headers, but video endpoints require authentication.

**Solution**: The `/api/videos/[pipelineId]/[nodeId]` proxy route supports both header and query parameter authentication:

1. **Server-side Route** (`app/api/videos/[pipelineId]/[nodeId]/route.ts`):
   - Accepts JWT token from `Authorization: Bearer <token>` header OR `?token=<token>` query parameter
   - Removes hardcoded `user_id=2` and uses proper Rails API authentication
   - Forwards authenticated requests to Rails backend: `/v1/admin/video_production/pipelines/${pipelineId}/nodes/${nodeId}/output`
   - Returns 401 if no valid token provided

2. **Frontend Component** (`NodeOutputPreview.tsx`):
   - Constructs video URLs with auth token: `/api/videos/${pipelineUuid}/${nodeUuid}?token=${jwt}`
   - Uses `getToken()` from auth storage to include current user's JWT
   - Only renders video/audio elements when user is authenticated

**Usage**: This pattern should be used for any media endpoints that need to be consumed by HTML elements (video, audio, img) while maintaining authentication.

## Deployment

Deployment configuration is not yet set up. When adding deployment:

1. Update this section with deployment instructions
2. Add environment variable documentation
3. Document any build steps or requirements

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
