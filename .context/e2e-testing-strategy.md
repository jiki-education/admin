# E2E Testing Strategy for Jiki Admin

## Core Principles

1. **One test at a time** - Never write multiple tests without verifying each one passes
2. **Start minimal** - Begin with the simplest possible test that can pass
3. **Build incrementally** - Add one assertion at a time
4. **Verify immediately** - Run the test after every change
5. **Real user flows** - Test actual user journeys, not component details

## Step-by-Step Process

### Phase 1: Foundation Test

Start with the absolute minimum:

```javascript
describe("Basic App Functionality", () => {
  it("should load the home page", async () => {
    await page.goto(`${baseUrl}/`);
    const body = await page.$("body");
    expect(body).toBeTruthy();
  });
});
```

**Verify this passes before proceeding.**

### Phase 2: Authentication Flow

Add one auth test:

```javascript
it("should redirect to signin when not authenticated", async () => {
  await page.goto(`${baseUrl}/dashboard`);
  await page.waitForNavigation();
  expect(page.url()).toContain("/signin");
});
```

**Verify this passes before proceeding.**

### Phase 3: Basic Navigation

Add simple navigation:

```javascript
it("should navigate to dashboard after mock login", async () => {
  await page.goto(`${baseUrl}/signin`);
  await page.click('button:has-text("Mock Login")');
  await page.waitForNavigation();
  expect(page.url()).toContain("/dashboard");
});
```

**Verify this passes before proceeding.**

## Testing Rules

### DO:

- Start with page loads and basic navigation
- Use simple selectors first (`button`, `h1`, `body`)
- Test one user action per test
- Use real delays when needed: `await new Promise(r => setTimeout(r, 500))`
- Verify the test passes immediately after writing it
- Keep tests independent of each other

### DON'T:

- Write multiple complex tests at once
- Test implementation details
- Use complex selectors until simple ones work
- Assume elements exist without checking
- Write tests for features that don't exist yet
- Use deprecated Puppeteer APIs like `waitForTimeout()`

## File Structure

```
tests/e2e/
├── 01-basic.test.ts           # Foundation tests
├── 02-auth.test.ts            # Authentication flows
├── 03-navigation.test.ts      # Basic navigation
├── 04-[feature].test.ts       # One file per major feature
└── helpers/
    ├── auth.ts                # Login helper
    ├── navigation.ts          # Navigation helpers
    └── wait.ts                # Wait utilities
```

## Test Template

```typescript
import "./setup";

describe("Feature Name", () => {
  const baseUrl = process.env.TEST_URL || "http://local.jiki.io:3082";

  beforeEach(async () => {
    await page.goto(`${baseUrl}/`);
  });

  it("should do one specific thing", async () => {
    // 1. Navigate to page
    // 2. Perform one action
    // 3. Check one result
    // 4. That's it
  });
});
```

## Debugging Process

1. If test fails, check if page loads at all
2. Check browser console for errors: `page.on('console', console.log)`
3. Take screenshots on failure: `await page.screenshot({path: 'debug.png'})`
4. Use `page.evaluate(() => document.body.innerHTML)` to see actual content
5. Simplify the test until it passes, then build back up

## Success Metrics

- Each test file has maximum 5 tests
- Each test has maximum 3 assertions
- All tests pass consistently
- Tests run in under 30 seconds total
- No flaky tests (tests that sometimes fail)

## Implementation Order

1. ✅ Basic page loads (auth.test.ts - home page loading)
2. ✅ Authentication flow (email-templates.test.ts - redirect to signin)
3. ✅ Main navigation (navigation.test.ts - all main pages)
4. ✅ One feature at a time:
   - ✅ email-templates (email-templates.test.ts - 11 comprehensive tests)
   - ⚠️ users (navigation.test.ts - basic page load only)
   - ⚠️ levels (navigation.test.ts - basic page load only)
5. ❌ Form submissions (not implemented)
6. ❌ Error handling (basic error cases in email-templates only)

Remember: **Quality over quantity. One working test is infinitely better than 100 broken tests.**
