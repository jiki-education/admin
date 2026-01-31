# Jiki Admin

Administrative dashboard for the Jiki learning platform.

## Overview

Jiki Admin is a standalone Next.js application for managing the Jiki platform. It provides tools for user administration, content moderation, system monitoring, and other administrative tasks.

**Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS v4

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
pnpm install
```

### Development

Start the development server:

```bash
./bin/dev
```

The app will be available at http://local.jiki.io:3062

For Claude Code development (alternative port):

```bash
./bin/dev-claude  # Runs on port 3063
```

## Testing

Run E2E tests:

```bash
pnpm test:e2e           # Run all E2E tests
pnpm test:e2e:watch     # Watch mode
pnpm test:e2e:headful   # Run with visible browser (for debugging)
```

## Code Quality

```bash
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check formatting without modifying files
npx tsc --noEmit  # Type checking
```

## Project Structure

```
admin/
├── app/              # Next.js app directory (routes & pages)
├── tests/e2e/        # End-to-end tests
├── scripts/          # Build and test scripts
├── bin/              # Development scripts
└── [config files]    # ESLint, Prettier, TypeScript configs
```

## Current Features

- **Dashboard**: Main admin dashboard with overview
- **E2E Testing**: Automated browser testing with Puppeteer

## For Contributors

See [AGENTS.md](./AGENTS.md) for detailed development guidelines and coding standards.

## License

UNLICENSED - Private project
