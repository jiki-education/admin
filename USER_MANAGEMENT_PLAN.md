# User Management Implementation Plan

## Overview
Implementation of a comprehensive user management page for the Jiki Admin dashboard, following the established patterns from the email-templates feature.

**Backend Endpoint**: `GET /v1/admin/users` (paginated, filterable)
**Filters**: email, name
**Response**: Serialized, paginated response similar to email-templates

## Phase 1: Foundation & Types (Day 1)

### 1.1 Create Type Definitions
- [x] Create `app/dashboard/users/types/index.ts`
- [x] Define interfaces based on actual backend response:
  ```typescript
  interface User {
    id: number;
    name: string;
    email: string;
    locale: string; // "en" | "hu"
    admin: boolean;
  }
  
  interface UserFilters {
    name?: string;
    email?: string;
    page?: number;
    per?: number; // pagination limit
  }
  
  interface UsersResponse {
    results: User[];
    meta: {
      current_page: number;
      total_count: number;
      total_pages: number;
    };
  }
  ```

### 1.2 Create API Service
- [x] Create `lib/api/users.ts`
- [x] Implement `getUsers(filters?: UserFilters): Promise<UsersResponse>` function
- [x] Follow existing pagination pattern from email-templates
- [x] Query params: `name`, `email`, `page`, `per`
- [x] Endpoint: `GET /admin/users`

### 1.3 Setup Route Structure
- [x] Create `app/dashboard/users/page.tsx` (main page)
- [x] Add navigation link in dashboard layout (if applicable)

**Estimated Time**: 2-3 hours

## Phase 2: Core UI Components (Day 1-2)

### 2.1 User Filters Component
- [x] Create `app/dashboard/users/components/UserFilters.tsx`
- [x] Implement filters for:
  - [x] Email (text input with search)
  - [x] Name (text input with search)
  - [ ] Admin status toggle (admin: true/false)
  - [x] Locale dropdown ("en" | "hu")
- [x] Follow existing filter patterns from `TemplateFilters.tsx`
- [x] Include "Clear Filters" functionality

### 2.2 User Table Component
- [x] Create `app/dashboard/users/components/UserTable.tsx`
- [x] Display columns:
  - [x] ID
  - [x] Name
  - [x] Email 
  - [x] Locale (with badges: EN/HU)
  - [x] Admin (boolean badge)
  - [x] Actions (Delete button)
- [x] Implement loading states
- [x] Implement empty states
- [x] Follow table styling from `EmailTemplateTable.tsx`

### 2.3 Pagination Component
- [x] Create `app/dashboard/users/components/UserPagination.tsx`
- [x] Implement page navigation
- [x] Show current page / total pages
- [ ] Items per page selector (optional)

**Estimated Time**: 4-6 hours

## Phase 3: Main Page Implementation (Day 2)

### 3.1 Users Page Component
- [x] Implement main `app/dashboard/users/page.tsx`
- [x] Follow architecture pattern from email-templates:
  - [x] Authentication checks
  - [x] State management (users, filters, loading, error)
  - [x] useEffect hooks for data loading
  - [x] Filter change handlers
  - [x] Error handling and display

### 3.2 Integration & Testing
- [x] Connect all components
- [x] Test filtering functionality
- [x] Test pagination
- [x] Test loading and error states
- [x] Verify responsive design

**Estimated Time**: 3-4 hours

## Phase 4: User Details & Actions (Day 3)

### 4.1 User Detail View (Optional)
- [ ] Create `app/dashboard/users/[id]/page.tsx`
- [ ] Display detailed user information
- [ ] Show user activity/history if available
- [ ] Add breadcrumb navigation

### 4.2 User Action Modals (If Required)
- [x] Create delete confirmation modal with email verification
- [ ] Create user status change modal
- [ ] Create user role change modal (if applicable)
- [x] Follow modal patterns from email-templates
- [x] Implement optimistic updates

### 4.3 Bulk Actions (Optional Enhancement)
- [ ] Add checkbox selection to table
- [ ] Implement bulk status changes
- [ ] Add bulk export functionality

### 4.4 Delete User Functionality (✅ COMPLETED)
- [x] Add delete button to user table rows
- [x] Create delete confirmation modal with email verification
- [x] Implement user safety verification (must type exact email)
- [x] Add proper loading states during deletion
- [x] Handle delete errors and user feedback
- [x] Auto-refresh user list after successful deletion
- [x] Document missing backend endpoint in TODO.md

**Estimated Time**: 4-6 hours

## Phase 5: Advanced Features & Polish (Day 4)

### 5.1 Advanced Filtering
- [ ] Date range filters (created_at, last_sign_in_at)
- [ ] Advanced search with multiple criteria
- [ ] Saved filter presets

### 5.2 Export Functionality
- [ ] CSV export of filtered users
- [ ] PDF export for reports
- [ ] Follow admin security patterns

### 5.3 Performance Optimizations
- [ ] Implement debounced search
- [ ] Add loading skeletons
- [ ] Optimize re-renders with React.memo

### 5.4 Accessibility & Polish
- [ ] Add proper ARIA labels
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [x] Loading indicators and feedback

**Estimated Time**: 4-5 hours

## Phase 6: Testing & Documentation (Day 4-5)

### 6.1 E2E Testing
- [ ] Create `tests/e2e/users.test.ts`
- [ ] Test user listing and filtering
- [ ] Test pagination functionality
- [ ] Test error scenarios
- [ ] Follow existing test patterns

### 6.2 Error Handling & Edge Cases
- [x] Network error handling
- [x] Empty state improvements
- [ ] Rate limiting handling
- [x] Invalid filter handling

### 6.3 Documentation
- [ ] Update CLAUDE.md with user management patterns
- [ ] Add inline code documentation
- [ ] Create user guide if needed

**Estimated Time**: 3-4 hours

## Technical Requirements

### Dependencies
- No new dependencies required (use existing stack)
- Reuse existing components from `@/components/ui/`
- Follow Tailwind CSS patterns

### API Integration
- Use existing `api` service from `@/lib/api`
- Follow authentication patterns from email-templates
- Handle pagination metadata properly

### Performance Considerations
- Implement proper loading states
- Use React.memo for table rows if needed
- Debounce search inputs (300ms)
- Consider virtualization for large user lists

### Security & Permissions
- Ensure admin authentication is required
- Follow existing permission patterns
- Sanitize user inputs
- Respect data privacy guidelines

## Success Criteria

1. **Functionality**: All filtering and pagination works correctly
2. **Performance**: Page loads within 2 seconds, smooth interactions
3. **Accessibility**: Keyboard navigation and screen reader support
4. **Responsive**: Works on mobile and desktop
5. **Consistency**: Matches existing admin design patterns
6. **Testing**: E2E tests pass, edge cases handled
7. **Code Quality**: TypeScript strict mode, proper error handling

## File Structure

```
app/dashboard/users/
├── page.tsx                    # Main users page
├── [id]/
│   └── page.tsx               # User detail page (optional)
├── types/
│   └── index.ts               # TypeScript definitions
├── components/
│   ├── UserFilters.tsx        # Filter component
│   ├── UserTable.tsx          # Table component
│   ├── UserPagination.tsx     # Pagination component
│   └── DeleteUserModal.tsx    # Delete confirmation modal (✅ completed)
└── lib/api/
    └── users.ts               # API service

tests/e2e/
└── users.test.ts              # E2E tests
```

## Notes

- Follow the established patterns from email-templates exactly
- Prioritize core functionality over advanced features
- Ensure all components are properly typed with TypeScript
- Test thoroughly with different user counts and edge cases
- Consider future enhancements like user creation/editing