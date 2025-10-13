# Email Template Management Implementation Plan

## Overview

This plan outlines the implementation of a comprehensive email template management system for the Jiki Admin application. The system will allow administrators to create, edit, delete, and manage email templates with MJML and text formats.

## Phase 1: Foundation & Navigation

### Tasks:
- [ ] Add "Email Templates" navigation item to the sidebar under "System" section
- [ ] Create base route structure (`/dashboard/email-templates`)
- [ ] Set up API integration using existing auth patterns
- [ ] Create basic page layout following dashboard patterns

### Technical Details:
- Update `layout/AppSidebar.tsx` to include email templates menu item
- Create `/app/dashboard/email-templates/page.tsx`
- Follow existing authentication and layout patterns

## Phase 2: Index View with Filtering

### Tasks:
- [ ] Create templates index page with table layout
- [ ] Implement filtering by type, slug, and locale
- [ ] Add search functionality
- [ ] Include pagination if needed
- [ ] Display template metadata (ID, type, slug, locale)

### Components to Use:
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` from `/components/ui/table/index.tsx`
- `Select` component for filters
- `Button` component for actions
- `PageBreadcrumb` for navigation

### API Integration:
- `GET /v1/admin/email_templates` - List templates with filtering
- `GET /v1/admin/email_templates/types` - Available types for dropdown

## Phase 3: CRUD Operations

### Add New Template
- [ ] Create modal form for new template creation
- [ ] Form fields: type, slug, locale, subject, body_mjml, body_text
- [ ] Validation for required fields
- [ ] Success/error handling

### Edit Template
- [ ] Edit modal with pre-populated form
- [ ] Same form structure as create
- [ ] Handle updates and validation

### Delete Template
- [ ] Confirmation modal for deletion
- [ ] Proper error handling
- [ ] Table refresh after deletion

### Components to Use:
- `Modal` component for forms and confirmations
- `Select` for type and locale dropdowns
- `TextArea` for text content
- `Button` for actions

### API Integration:
- `GET /v1/admin/email_templates/:id` - Get single template
- `POST /v1/admin/email_templates` - Create new template
- `PATCH /v1/admin/email_templates/:id` - Update template
- `DELETE /v1/admin/email_templates/:id` - Delete template

## Phase 4: Advanced Features

### MJML Editor with Preview
- [ ] Install `mjml` package for validation and preview
- [ ] Create custom MJML editor component
- [ ] Add syntax highlighting (optional enhancement)
- [ ] Implement preview functionality that converts MJML to HTML
- [ ] Validate MJML before allowing save

### Text Editor
- [ ] Use existing `TextArea` component
- [ ] Simple plain text editor without special features
- [ ] Proper validation and error handling

### Enhanced Dropdowns
- [ ] Create searchable dropdown components for type and locale
- [ ] Fallback to regular `Select` if search functionality is complex
- [ ] Pre-populate options from API

### Dependencies to Install:
```bash
pnpm add mjml
pnpm add -D @types/mjml  # if available
```

## Technical Architecture

### File Structure:
```
app/dashboard/email-templates/
├── page.tsx                    # Index view with table and filtering
├── components/
│   ├── EmailTemplateTable.tsx  # Table component
│   ├── EmailTemplateForm.tsx   # Create/Edit form
│   ├── MJMLEditor.tsx          # MJML editor with preview
│   ├── DeleteConfirmModal.tsx  # Delete confirmation
│   └── TemplateFilters.tsx     # Filter components
└── types/
    └── index.ts                # TypeScript interfaces
```

### API Integration Pattern:
- Follow existing auth store patterns
- Use consistent error handling
- Implement loading states
- Cache template types for dropdown efficiency

### Data Types:
```typescript
interface EmailTemplate {
  id: number;
  type: string;
  slug: string;
  locale: string;
  subject: string;
  body_mjml: string;
  body_text: string;
}

interface EmailTemplateFilters {
  type?: string;
  slug?: string;
  locale?: string;
  search?: string;
}
```

## UI/UX Considerations

### Design Consistency:
- Use existing TailAdmin component library
- Follow current color scheme and spacing
- Maintain dark mode compatibility
- Responsive design for mobile/tablet

### User Experience:
- Clear validation messages
- Loading states during API calls
- Confirmation dialogs for destructive actions
- Auto-save draft functionality (optional enhancement)
- Keyboard shortcuts (optional enhancement)

### Accessibility:
- Proper ARIA labels
- Keyboard navigation
- Screen reader compatibility
- Focus management in modals

## Error Handling

### MJML Validation:
- Real-time validation as user types
- Clear error messages for invalid MJML
- Prevention of saving invalid templates

### API Error Handling:
- Network error recovery
- Validation error display
- Rate limiting handling
- Authentication error redirects

## Testing Strategy

### E2E Tests:
- [ ] Template list loading and filtering
- [ ] Create new template workflow
- [ ] Edit existing template workflow
- [ ] Delete template workflow
- [ ] MJML preview functionality
- [ ] Form validation scenarios

### Test Files:
```
tests/e2e/email-templates.test.ts
```

## Security Considerations

### Input Validation:
- Sanitize all user inputs
- Validate MJML content server-side
- Prevent XSS in preview functionality
- Validate file uploads if added later

### Authorization:
- Ensure admin-only access
- Proper JWT token validation
- Route protection

## Future Enhancements

### Phase 5 (Optional):
- [ ] Template preview with sample data
- [ ] Template versioning system
- [ ] Bulk operations (delete multiple)
- [ ] Template export/import functionality
- [ ] Email template testing (send test emails)
- [ ] Template analytics and usage tracking

## Success Criteria

1. ✅ Admin can view all email templates in a filterable table
2. ✅ Admin can create new templates with MJML and text content
3. ✅ Admin can edit existing templates
4. ✅ Admin can delete templates with confirmation
5. ✅ MJML editor provides real-time preview
6. ✅ All forms validate input properly
7. ✅ UI is consistent with existing TailAdmin design
8. ✅ All functionality works in both light and dark modes
9. ✅ E2E tests cover main workflows

## Dependencies

### Required Packages:
- `mjml` - For MJML validation and HTML conversion
- `@types/mjml` - TypeScript definitions (if available)

### Optional Enhancements:
- `monaco-editor` - For advanced code editing with syntax highlighting
- `react-syntax-highlighter` - For basic syntax highlighting

---

**Estimated Timeline:** 2-3 development days
**Priority:** High (Core admin functionality)
**Risk Level:** Medium (MJML integration complexity)