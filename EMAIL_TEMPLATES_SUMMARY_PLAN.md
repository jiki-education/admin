# Email Templates Summary Tab Implementation Plan

## Overview
Add a summary tab to the email templates page that groups templates by type and slug, showing implemented, unimplemented, and WIP locales for each template group.

## Backend API
✅ **Already Complete** - The backend API endpoint is implemented:
- `GET /v1/admin/email_templates/summary`
- Returns grouped templates with locale information
- Response format includes `email_templates` array and `locales` object

## Frontend Implementation Tasks

### Phase 1: Tab Infrastructure
1. **Add tab navigation component**
   - [x] Create `TabNavigation.tsx` component for switching between views
   - [x] Add "Templates" and "Summary" tabs
   - [x] Integrate into main email templates page

2. **Update main page structure**
   - [x] Modify `page.tsx` to support tabbed interface
   - [x] Add state management for active tab
   - [x] Conditionally render table view vs summary view

### Phase 2: Summary API Integration
3. **Create summary API function**
   - [x] Add `getEmailTemplatesSummary()` to `lib/api/email-templates.ts`
   - [x] Define TypeScript interfaces for summary response
   - [x] Handle API errors and loading states

4. **Define summary data types**
   - [x] Create interfaces in `types/index.ts`:
     - `EmailTemplateSummary`
     - `LocaleConfiguration`
     - `SummaryResponse`

### Phase 3: Summary View Components
5. **Create SummaryTable component**
   - [x] Display grouped templates by type and slug
   - [x] Show implemented/unimplemented/WIP locales for each group
   - [x] Add sorting and visual indicators

6. **Create locale status indicators**
   - [x] Badge/pill components for different locale states
   - [x] Color coding: green (implemented), red (unimplemented), yellow (WIP)
   - [x] Tooltip showing locale details

7. **Add filtering for summary view**
   - [x] Filter by template type
   - [x] Filter by locale status (all, missing, WIP)
   - [x] Search by template slug

### Phase 4: Integration & Testing
8. **Connect summary view to main page**
   - [x] Integrate SummaryTable with tab navigation
   - [x] Add loading states and error handling
   - [x] Ensure proper data refresh

9. **Add tests**
   - [ ] Unit tests for new components
   - [ ] E2E tests for tab functionality
   - [ ] API integration tests

10. **Final polish**
    - [ ] Responsive design for mobile
    - [ ] Accessibility improvements
    - [ ] Code review and cleanup

## Implementation Details

### Key Components to Create:
- ✅ `components/TabNavigation.tsx` - Tab switching UI
- ✅ `components/SummaryTable.tsx` - Main summary display
- ✅ `components/LocaleStatusBadge.tsx` - Locale status indicators
- ✅ `components/SummaryFilters.tsx` - Filtering for summary view

### Data Flow:
1. User clicks "Summary" tab
2. Load summary data from API
3. Group and display templates with locale status
4. Allow filtering and interaction

### API Response Format:
```json
{
  "email_templates": [
    {
      "type": "level_completion",
      "slug": "level-1", 
      "locales": ["en", "hu"]
    }
  ],
  "locales": {
    "supported": ["en", "hu"],
    "wip": ["fr"]
  }
}
```

## File Structure
```
app/dashboard/email-templates/
├── components/
│   ├── TabNavigation.tsx          # New
│   ├── SummaryTable.tsx           # New  
│   ├── LocaleStatusBadge.tsx      # New
│   ├── SummaryFilters.tsx         # New
│   └── [existing components...]
├── types/
│   └── summary.ts                 # New types
└── page.tsx                       # Modified
```

## Success Criteria
- [x] Two-tab interface: "Templates" and "Summary"
- [x] Summary view groups templates by type and slug
- [x] Each group shows implemented, unimplemented, and WIP locales
- [x] Visual indicators for locale status
- [x] Filtering functionality for summary view
- [x] Responsive design (basic mobile-first with Tailwind)
- [ ] All tests passing
- [x] Type safety maintained