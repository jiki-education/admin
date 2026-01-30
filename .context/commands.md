# Commands Reference

## Development Server

```bash
./bin/dev         # Start dev server on http://localhost:3062
./bin/dev-claude  # Start dev server on http://localhost:3072 (alternative port)
```

Both scripts install dependencies automatically before starting.

## Code Quality

### TypeScript

```bash
npx tsc --noEmit  # Type check without emitting files
```

Run this before committing to catch type errors.

### ESLint

```bash
pnpm lint         # Run ESLint on the codebase
```

### Prettier

```bash
pnpm format       # Format all files
pnpm format:check # Check formatting without fixing (used in CI)
```

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
pnpm test               # Run all unit tests once
pnpm test:watch         # Run in watch mode (re-runs on file changes)
pnpm test:coverage      # Run with coverage report
pnpm test:ci            # Run for CI (no watch, with coverage)

# Run specific tests
pnpm test slug          # Run tests matching "slug"
pnpm test LevelForm     # Run tests matching "LevelForm"
```

Test files are in `__tests__/` directory, mirroring the source structure.

### E2E Tests (Puppeteer)

```bash
pnpm test:e2e           # Run all E2E tests
pnpm test:e2e:watch     # Run in watch mode
pnpm test:e2e:headful   # Run with visible browser (useful for debugging)
pnpm test:e2e:ci        # Run for CI (headless, strict mode)
```

E2E tests are in `tests/e2e/` directory. The test runner automatically starts the dev server.

## Build

```bash
pnpm build        # Production build with Next.js
pnpm start        # Start production server (after build)
```

## Deployment

```bash
pnpm deploy       # Build with OpenNextJS and deploy to Cloudflare Workers
```

Deployment is typically handled by GitHub Actions on push to `main`.

## Package Management

```bash
pnpm install              # Install all dependencies
pnpm add <package>        # Add runtime dependency
pnpm add -D <package>     # Add dev dependency
pnpm remove <package>     # Remove dependency
```

## Pre-Commit Checklist

Run these before committing:

```bash
npx tsc --noEmit    # Type check
pnpm lint           # Lint check
pnpm format:check   # Format check
pnpm test           # Unit tests
```

Or run the full CI suite locally:

```bash
npx tsc --noEmit && pnpm lint && pnpm format:check && pnpm test && pnpm test:e2e
```
