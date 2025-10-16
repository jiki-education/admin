# E2E Test Coverage Expansion Plan

## Current State Analysis

**Existing E2E Infrastructure:**
- ✅ Jest + Puppeteer setup working correctly
- ✅ Custom test runner with auto-discovery and warming
- ✅ TypeScript support configured
- ✅ Test environment configured (port 3064)
- ✅ Only 1 basic test: home page loads

**Available Routes Discovered:**
- `/` - Home page (tested)
- `/signin` - Sign in page
- `/signup` - Sign up page  
- `/dashboard` - Main dashboard
- `/dashboard/users` - User management
- `/dashboard/levels` - Level management
- `/dashboard/levels/[id]` - Level detail
- `/dashboard/levels/[id]/lessons/[lessonId]/edit` - Lesson editor
- `/dashboard/email-templates` - Email template management
- `/dashboard/email-templates/edit/[id]` - Email template editor

**Key Components Available:**
- SignInForm with mock login functionality
- SignupForm
- Dashboard components
- Form components (InputField, Button, etc.)

## Expansion Strategy: Small, Verifiable Steps

### Step 1: Basic Navigation Tests (PRIORITY: HIGH)
**Goal:** Verify all routes are accessible and load without errors

#### Step 1a: Static Routes Test (30 minutes)
- **File:** `tests/e2e/navigation.test.ts`
- **Test:** Visit each static route and verify page loads
- **Routes to test:** `/signin`, `/signup`, `/dashboard`, `/dashboard/users`, `/dashboard/levels`, `/dashboard/email-templates`
- **Verification:** After each route, run test to ensure it passes before moving to next

#### Step 1b: Add Route Discovery Validation (15 minutes)
- **Extend:** Existing test or create `tests/e2e/route-discovery.test.ts`
- **Test:** Verify auto-discovered routes match expected routes
- **Validation:** Test that route discovery finds all expected pages

### Step 2: Authentication Flow Tests (PRIORITY: HIGH)
**Goal:** Test signin/signup functionality

#### Step 2a: Mock Login Test (30 minutes)
- **File:** `tests/e2e/auth.test.ts` (expand existing)
- **Test:** 
  1. Navigate to `/signin`
  2. Click "Mock Login (Development)" button
  3. Verify redirect to `/dashboard`
  4. Verify dashboard page loads
- **Verification:** Run test immediately after writing

#### Step 2b: Sign In Form Validation (30 minutes)
- **File:** `tests/e2e/auth.test.ts` (expand)
- **Test:**
  1. Navigate to `/signin`
  2. Try submitting empty form - verify validation
  3. Fill form with test data
  4. Test form interactions (input focus, typing)
- **Verification:** Each test case individually

#### Step 2c: Navigation Between Auth Pages (15 minutes)
- **File:** `tests/e2e/auth.test.ts` (expand)
- **Test:**
  1. Navigate signin → signup link
  2. Navigate signup → signin link
  3. Test "Back to dashboard" link
- **Verification:** After each navigation test

### Step 3: Dashboard Basic Functionality (PRIORITY: MEDIUM)
**Goal:** Test dashboard loads and basic navigation works

#### Step 3a: Dashboard Page Load Test (20 minutes)
- **File:** `tests/e2e/dashboard.test.ts`
- **Test:**
  1. Navigate to `/dashboard`
  2. Verify page loads without errors
  3. Check for key UI elements (sidebar, header, content)
- **Verification:** Test immediately

#### Step 3b: Sidebar Navigation Test (30 minutes)
- **File:** `tests/e2e/dashboard.test.ts` (expand)
- **Test:**
  1. Access dashboard
  2. Click each sidebar link
  3. Verify each page loads correctly
- **Verification:** After each navigation link

### Step 4: Form Interaction Tests (PRIORITY: MEDIUM)
**Goal:** Test form components work correctly

#### Step 4a: Contact Form Basic Test (30 minutes)
- **File:** `tests/e2e/forms.test.ts`
- **Test:**
  1. Find a simple form in the app
  2. Test input interactions
  3. Test form validation
- **Verification:** Each form element individually

### Step 5: User Management Tests (PRIORITY: LOW)
**Goal:** Test user management functionality

#### Step 5a: User List Page Test (20 minutes)
- **File:** `tests/e2e/users.test.ts`
- **Test:**
  1. Navigate to `/dashboard/users`
  2. Verify page loads
  3. Check table/list renders
- **Verification:** Immediate

### Step 6: Level Management Tests (PRIORITY: LOW)
**Goal:** Test level management functionality

#### Step 6a: Level List Page Test (20 minutes)
- **File:** `tests/e2e/levels.test.ts`
- **Test:**
  1. Navigate to `/dashboard/levels`
  2. Verify page loads
  3. Check content renders
- **Verification:** Immediate

### Step 7: Email Template Tests (PRIORITY: LOW)
**Goal:** Test email template functionality

#### Step 7a: Template List Page Test (20 minutes)
- **File:** `tests/e2e/email-templates.test.ts`
- **Test:**
  1. Navigate to `/dashboard/email-templates`
  2. Verify page loads (handle potential MJML errors gracefully)
  3. Check basic functionality
- **Verification:** Immediate

## Implementation Guidelines

### Test File Structure
```typescript
// tests/e2e/[feature].test.ts
import './setup';

describe('[Feature] Functionality', () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:3064";

  beforeEach(async () => {
    // Reset page state if needed
  });

  it('should [specific behavior]', async () => {
    // Small, focused test
    // Immediate verification of behavior
  });
});
```

### Testing Principles

1. **One Thing Per Test**: Each test should verify one specific behavior
2. **Immediate Verification**: Run test after writing, before moving to next
3. **Incremental Building**: Build on previous working tests
4. **Error Handling**: Handle server errors gracefully in tests
5. **Clear Naming**: Test names should describe exact behavior being tested

### Verification Process

After each step:
1. Run the specific test: `pnpm test:e2e --testNamePattern="test name"`
2. Verify it passes before proceeding
3. Run full test suite: `pnpm test:e2e`
4. Fix any issues before moving to next step

### Error Handling Strategy

- **Server Errors**: Many pages show server errors during tests - handle gracefully
- **Dynamic Routes**: Use mock data or existing test data where possible
- **MJML Issues**: Email template pages may have issues - test basic navigation only initially
- **Form Submissions**: Focus on client-side behavior initially, add backend integration later

## Expected Timeline

- **Week 1**: Steps 1-2 (Navigation + Authentication) - 3-4 hours
- **Week 2**: Steps 3-4 (Dashboard + Forms) - 2-3 hours  
- **Week 3**: Steps 5-7 (Feature pages) - 2-3 hours

## Success Criteria

After completion:
- [ ] All major routes have basic navigation tests
- [ ] Authentication flow is fully tested
- [ ] Dashboard navigation works
- [ ] Form interactions are tested
- [ ] Feature pages have basic load tests
- [ ] Test suite runs reliably without flakiness
- [ ] All tests pass consistently

## Notes

- Focus on client-side behavior initially
- Handle server-side errors gracefully in tests
- Build incrementally - each step should leave tests in working state
- Use existing mock functionality where available
- Prioritize reliability over comprehensive coverage initially