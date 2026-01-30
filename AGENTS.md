# Instructions for coding assistants

## ⚠️ CRITICAL: First Step for ANY Work

**Before starting ANY task, you MUST create a feature branch:**

```bash
# 1. Ensure you're on main and up-to-date
git checkout main && git pull

# 2. Create a new feature branch
git checkout -b feature-branch-name
```

---

This file provides guidance to AI agents when working with the Jiki Admin application.

## Context Files

The `.context/` directory contains detailed documentation for this codebase. **Read any files relevant to the task you are working on. Even if the file is only tangentially relevant, read it to be sure.**

You can read these files at **any point during your work** - even in the middle of implementing a plan if appropriate.

| File                       | When to Read                                                 |
| -------------------------- | ------------------------------------------------------------ |
| `code-standards.md`        | **Always read first** - coding style and file organization   |
| `commands.md`              | **Always read** - running dev server, tests, builds, linting |
| `testing-quick-start.md`   | Writing or editing tests                                     |
| `e2e-testing-strategy.md`  | Working on E2E tests with Puppeteer                          |
| `api.md`                   | Working with API client or backend integration               |
| `auth.md`                  | Authentication, login, protected routes                      |
| `levels-and-lessons.md`    | Level and lesson management features                         |
| `levels-frontend-guide.md` | Frontend implementation for levels                           |
| `package-management.md`    | Adding dependencies, pnpm usage                              |

## Quick Start

### Development

```bash
./bin/dev         # Runs on http://localhost:3062
./bin/dev-claude  # Runs on http://localhost:3072 (for parallel development)
```

### Build, TypeScript & Lint

```bash
npx tsc --noEmit   # Check TypeScript types
pnpm lint          # Run ESLint
pnpm format        # Format code with Prettier
pnpm format:check  # Check formatting without fixing
```

### Testing

```bash
# Unit Tests
pnpm test               # Run unit tests
pnpm test:watch         # Run in watch mode
pnpm test:coverage      # Run with coverage report

# E2E Tests
pnpm test:e2e           # Run E2E tests (Puppeteer)
pnpm test:e2e:headful   # Run with visible browser
```

## Project Structure Patterns

This is the admin dashboard for Jiki, a learn-to-code platform.

### Core Technology Stack

- **Framework**: Next.js 15 with App Router, TypeScript
- **UI Library**: React 19 with React Compiler (automatic optimization)
- **Styling**: Tailwind CSS v4
- **Testing**: Jest + React Testing Library (unit), Puppeteer (E2E)
- **Deployment**: Cloudflare Workers (Edge Runtime)
- **Package Manager**: pnpm

**Note**: React Compiler is enabled, so manual memoization (`useMemo`, `useCallback`, `memo()`) is generally not needed.

### Directory Structure

```
admin/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Protected admin routes
│   │   ├── users/          # User management
│   │   ├── levels/         # Level & lesson management
│   │   ├── concepts/       # Concept management
│   │   ├── projects/       # Project management
│   │   └── email-templates/# Email template management
│   ├── signin/             # Authentication pages
│   └── signup/
├── components/             # React components
│   ├── ui/                 # Reusable TailAdmin components
│   ├── auth/               # Authentication components
│   └── form/               # Form components
├── lib/                    # Business logic
│   ├── api/                # API client and endpoints
│   └── auth/               # Authentication utilities
├── stores/                 # Zustand state stores
├── types/                  # TypeScript type definitions
├── tests/
│   └── e2e/                # Puppeteer E2E tests
└── __tests__/              # Jest unit tests
```

### Component Organization

- **Feature-based folders** under `app/dashboard/[feature]/components/`
- **Shared UI** in `/components/ui/` (TailAdmin-based)
- **Single responsibility** - each component has one clear purpose

### State Management

- **Zustand** for global auth state (`/stores/authStore.ts`)
- **React Context** for theme and sidebar state
- **Local state** with useState for component-specific state

## Architecture Principles

- **Standalone app** - No dependencies on front-end monorepo packages
- **Feature isolation** - Each dashboard feature is self-contained
- **Type safety everywhere** - Full TypeScript with strict mode
- **Performance by default** - React Compiler, code splitting, lazy loading
- **Simple over clever** - This is an admin tool; prioritize functionality

## Development Guidelines

- **Match existing patterns** - Look at similar features before implementing new ones
- **Use semantic HTML** and accessibility attributes
- **Mobile-first responsive design** with Tailwind
- **Path alias** `@/*` maps to project root for clean imports
- **Commit regularly** to save progress (but never on main branch)
- **Use existing UI components** - Always check `/components/ui/` before creating custom implementations

### File Organization Within Components

Components follow a top-to-bottom flow:

1. Imports
2. Types/Interfaces
3. Main component (what it renders)
4. Sub-components (if any)
5. Event handlers
6. Helper functions

## Important Rules

1. **Documentation is current state** - All documentation in .context and AGENTS.md should reflect the current state of the codebase. Never use changelog format.

2. **Avoid code duplication in context files** - Reference file paths and describe functionality rather than copying code blocks.

3. **Continuous learning** - When you learn something important or make a mistake, immediately update the relevant .context file.

4. **Regular commits** - Git commit regularly to save progress (always on feature branches, never on main).

5. **Post-task documentation** - Before committing, check if any .context files need updating.

6. **Ask, don't guess** - Prefer asking questions over making assumptions.

7. **Keep files small** - Maximum ~100 lines per file. Extract components when files grow.

8. **Use TailAdmin components** - Check `/components/ui/` for Modal, Button, Table, etc. before creating custom ones.

## Common Tasks

### Adding a new dashboard feature

1. Create route at `app/dashboard/[feature]/page.tsx`
2. Add components in `app/dashboard/[feature]/components/`
3. Add types in `app/dashboard/[feature]/types/`
4. Add API functions in `lib/api/[feature].ts`
5. Add unit tests in `__tests__/`
6. Add E2E tests in `tests/e2e/[feature].test.ts`

### Adding a new API endpoint

1. Add function in `lib/api/[resource].ts`
2. Add unit tests for the API function
3. Integrate into UI components
4. Update relevant .context files if patterns change

### Adding dependencies

```bash
pnpm add [package-name]      # Runtime dependency
pnpm add -D [package-name]   # Dev dependency
```

## Deployment

The admin app deploys to Cloudflare Workers at `admin.jiki.io`.

- **Trigger**: Push to `main` branch
- **Process**: OpenNextJS builds the app, then Wrangler deploys to Cloudflare
- **Config**: See `wrangler.jsonc` for worker configuration

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
