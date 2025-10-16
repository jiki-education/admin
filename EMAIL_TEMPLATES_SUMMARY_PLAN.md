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
   - Create `TabNavigation.tsx` component for switching between views
   - Add "Templates" and "Summary" tabs
   - Integrate into main email templates page

2. **Update main page structure**
   - Modify `page.tsx` to support tabbed interface
   - Add state management for active tab
   - Conditionally render table view vs summary view

### Phase 2: Summary API Integration
3. **Create summary API function**
   - Add `getEmailTemplatesSummary()` to `lib/api/email-templates.ts`
   - Define TypeScript interfaces for summary response
   - Handle API errors and loading states

4. **Define summary data types**
   - Create interfaces in `types/index.ts`:
     - `EmailTemplateSummary`
     - `LocaleConfiguration`
     - `SummaryResponse`

### Phase 3: Summary View Components
5. **Create SummaryTable component**
   - Display grouped templates by type and slug
   - Show implemented/unimplemented/WIP locales for each group
   - Add sorting and visual indicators

6. **Create locale status indicators**
   - Badge/pill components for different locale states
   - Color coding: green (implemented), red (unimplemented), yellow (WIP)
   - Tooltip showing locale details

7. **Add filtering for summary view**
   - Filter by template type
   - Filter by locale status (all, missing, WIP)
   - Search by template slug

### Phase 4: Integration & Testing
8. **Connect summary view to main page**
   - Integrate SummaryTable with tab navigation
   - Add loading states and error handling
   - Ensure proper data refresh

9. **Add tests**
   - Unit tests for new components
   - E2E tests for tab functionality
   - API integration tests

10. **Final polish**
    - Responsive design for mobile
    - Accessibility improvements
    - Code review and cleanup

## Implementation Details

### Key Components to Create:
- `components/TabNavigation.tsx` - Tab switching UI
- `components/SummaryTable.tsx` - Main summary display
- `components/LocaleStatusBadge.tsx` - Locale status indicators
- `components/SummaryFilters.tsx` - Filtering for summary view

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
- [ ] Two-tab interface: "Templates" and "Summary"
- [ ] Summary view groups templates by type and slug
- [ ] Each group shows implemented, unimplemented, and WIP locales
- [ ] Visual indicators for locale status
- [ ] Filtering functionality for summary view
- [ ] Responsive design
- [ ] All tests passing
- [ ] Type safety maintained