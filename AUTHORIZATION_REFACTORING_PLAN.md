# Authorization Refactoring Plan

## Current State Analysis

### Existing Authentication Infrastructure

The app currently has a solid authentication foundation:

- **Auth Store**: Zustand store (`stores/authStore.ts`) managing authentication state
- **Auth Hooks**: Well-designed hooks in `lib/auth/hooks.ts`:
  - `useRequireAuth()` - Main auth hook with redirect logic
  - `useRedirectIfAuthenticated()` - For login/signup pages  
  - `useAuth()` - Auth state without redirects
- **Auth Provider**: Top-level provider (`components/auth/AuthProvider.tsx`) that initializes auth checking
- **Auth Service**: API integration (`lib/auth/service.ts`) for login/logout/signup

### Current Problems

1. **Inconsistent Usage**: Different pages implement auth checking differently:
   - Some use direct store access (`useAuthStore`)
   - Some use the proper `useRequireAuth` hook
   - Inconsistent redirect URLs (some go to `/signin`, others to `/auth/login`)

2. **Repeated Boilerplate**: Every protected page duplicates:
   ```tsx
   const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
   const router = useRouter();
   
   useEffect(() => {
     if (!hasCheckedAuth) {
       void checkAuth();
     }
   }, [hasCheckedAuth, checkAuth]);

   useEffect(() => {
     if (hasCheckedAuth && !isAuthenticated) {
       router.push("/signin");
     }
   }, [isAuthenticated, hasCheckedAuth, router]);

   if (!hasCheckedAuth) {
     return <div>Loading...</div>;
   }

   if (!isAuthenticated) {
     return null;
   }
   ```

3. **Layout Not Protected**: The dashboard layout (`app/dashboard/layout.tsx`) doesn't enforce authentication, relying on individual pages.

## Proposed Solution: Use Existing Authorization Hook

### 1. Use the Existing Hook Directly

The existing `useRequireAuth` hook in `lib/auth/hooks.ts` already provides everything we need:
- Automatic redirect handling
- Loading state management
- Authentication checking
- Flexible configuration options

### 2. Update Dashboard Layout

Protect the entire dashboard at the layout level:

```tsx
"use client";
import { useRequireAuth } from "@/lib/auth/hooks";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import Backdrop from "@/layout/Backdrop";
import { useSidebar } from "@/context/SidebarContext";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, isReady } = useRequireAuth({
    redirectTo: "/",  // Consistent redirect to home page
  });
  const { getSidebarWidth } = useSidebar();
  const sidebarWidth = getSidebarWidth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isReady) {
    return null; // Will redirect via useRequireAuth
  }

  return (
    <div className="h-screen overflow-hidden">
      <AppSidebar />
      <div 
        className="relative flex flex-col h-full overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out"
        style={{
          marginLeft: `${sidebarWidth}px`
        }}
      >
        <AppHeader />
        <main className="flex-grow p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
      <Backdrop />
    </div>
  );
}
```

### 3. Simplify Individual Pages

Dashboard pages become much simpler:

```tsx
"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
// Remove all auth imports and logic

export default function Dashboard() {
  // No auth logic needed - handled by layout
  
  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" />
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">
          Welcome to Jiki Admin
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administrative dashboard for platform management, user administration, content moderation, and system monitoring.
        </p>
      </div>
    </div>
  );
}
```

## Implementation Steps

### Phase 1: ~~Create the Unified Hook~~ (SKIPPED - Using existing hook)
~~1. Create `hooks/useRequireAuth.ts` with simplified interface~~
~~2. Test the hook in isolation~~

### Phase 2: Protect the Layout
1. Update `app/dashboard/layout.tsx` to use the auth hook
2. Test that all dashboard routes are protected
3. Verify loading states and redirects work correctly

### Phase 3: Cleanup Individual Pages
1. Remove auth logic from all dashboard pages:
   - `app/dashboard/page.tsx`
   - `app/dashboard/users/page.tsx`
   - `app/dashboard/levels/page.tsx`
   - `app/dashboard/levels/new/page.tsx`
   - `app/dashboard/levels/[id]/page.tsx`
   - `app/dashboard/levels/[id]/lessons/new/page.tsx`
   - `app/dashboard/levels/[id]/lessons/[lessonId]/edit/page.tsx`
   - `app/dashboard/email-templates/page.tsx`
   - `app/dashboard/email-templates/edit/[id]/page.tsx`
   - `app/dashboard/video-pipelines/page.tsx`
   - `app/dashboard/video-pipelines/new/page.tsx`
   - `app/dashboard/video-pipelines/[uuid]/page.tsx`

### Phase 4: Handle Special Cases
1. **Home Page**: Update to use `useRedirectIfAuthenticated` consistently
2. **Auth Pages**: Ensure they redirect properly when already authenticated
3. **API Routes**: Verify that the video proxy route auth still works

### Phase 5: Testing & Validation
1. Test authentication flow end-to-end
2. Test page refresh scenarios
3. Test direct URL access
4. Update E2E tests if needed

## Benefits of This Approach

1. **Single Source of Truth**: All auth logic centralized in layout
2. **Consistent Behavior**: Same loading states and redirects everywhere
3. **Reduced Boilerplate**: ~30 lines of auth code removed from each page
4. **Better UX**: Consistent loading states across the app
5. **Maintainable**: Auth changes only need to be made in one place
6. **Type Safe**: Leverages existing well-tested auth infrastructure

## Files to Modify

### New Files
~~- `hooks/useRequireAuth.ts` - Simplified auth hook~~ (SKIPPED - Using existing hook)

### Modified Files
- `app/dashboard/layout.tsx` - Add auth protection
- 11 dashboard page components - Remove auth logic
- `app/page.tsx` - Ensure consistent redirect behavior

### No Changes Needed
- `stores/authStore.ts` - Keep existing store
- `lib/auth/hooks.ts` - Keep existing hooks (we'll use them directly)
- `lib/auth/service.ts` - Keep existing API integration
- `components/auth/AuthProvider.tsx` - Keep existing provider

## Testing Strategy

1. **Unit Tests**: ~~Test the new `useRequireAuth` hook~~ (Using existing well-tested hook)
2. **Integration Tests**: Test layout-level protection
3. **E2E Tests**: Verify complete auth flows work
4. **Manual Testing**: Test all dashboard routes and edge cases

This refactoring maintains all existing functionality while significantly simplifying the codebase and providing a more maintainable architecture.