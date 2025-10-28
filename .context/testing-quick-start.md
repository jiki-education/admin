# 🧪 Testing Quick Start Guide

## 🚀 Getting Started

```bash
# Install all dependencies (includes testing libraries)
pnpm install

# Verify everything works
pnpm test
```

## 📋 Available Test Commands

### Unit Tests (New!)

```bash
pnpm test               # Run all unit tests once
pnpm test:watch         # Run tests in watch mode (auto-rerun on changes)
pnpm test:coverage      # Run tests with coverage report
pnpm test:ci            # Run tests for CI (no watch, with coverage)
```

### E2E Tests (Existing)

```bash
pnpm test:e2e           # Run E2E tests
pnpm test:e2e:watch     # E2E in watch mode
pnpm test:e2e:headful   # E2E with visible browser
```

### Run Specific Tests

```bash
pnpm test slug          # Run tests matching "slug"
pnpm test LevelForm     # Run tests matching "LevelForm"
pnpm test --verbose     # Run with detailed output
```

## 🎯 What Tests Are Available

### **10 Unit Tests for Add Lessons & Levels Feature:**

1. **Slug Generation** (`lib/utils/slug.test.ts`)
2. **Level Form** (`components/LevelForm.test.tsx`)
3. **Lesson Form** (`components/LessonForm.test.tsx`)
4. **New Level Page** (`app/dashboard/levels/new/page.test.tsx`)
5. **New Lesson Page** (`app/dashboard/levels/[id]/lessons/new/page.test.tsx`)
6. **API Client** (`lib/api/levels.test.ts`)
7. **Error Handling** (`components/form-error-handling.test.tsx`)
8. **Navigation Buttons** (`components/navigation-buttons.test.tsx`)
9. **JSON Validation** (`components/json-editor-validation.test.tsx`)

## 🛠️ Development Workflow

### **Recommended Workflow:**

```bash
# Start development server
pnpm dev

# In another terminal, run tests in watch mode
pnpm test:watch
```

### **Before Committing:**

```bash
# Run all tests
pnpm test

# Check types
npx tsc --noEmit

# Check linting
pnpm lint

# Format code
pnpm format
```

## 🔧 Test Configuration

- **Jest Config**: `jest.config.js`
- **Test Setup**: `jest.setup.js`
- **Environment**: jsdom (browser-like)
- **Framework**: React Testing Library

## 💡 Tips

- **Watch Mode**: Best for development - tests auto-run when you save files
- **Coverage**: Shows which code is tested - aim for high coverage on critical features
- **Specific Tests**: Use pattern matching to run only the tests you're working on
- **CI Mode**: Use for automated testing (no watch, exits after completion)

## 🚨 Troubleshooting

### Tests Not Running?

```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm test
```

### Import Errors?

- Check that `@/` path alias is working
- Verify file extensions (.ts, .tsx)
- Make sure dependencies are installed

### Component Tests Failing?

- Check that mocks are set up correctly
- Verify React Testing Library queries
- Look for async operations that need `waitFor()`

## 📚 Learn More

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)

**Happy Testing! 🎉**
