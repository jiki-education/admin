# Admin Dashboard TODO

## Missing Backend Endpoints

### User Management

#### DELETE /v1/admin/users/:id
**Priority**: High  
**Status**: Not implemented  
**Required for**: User deletion functionality  

**Description**: 
Currently, the user management interface includes a delete functionality with email confirmation modal, but the backend endpoint is not yet implemented.

**Frontend Implementation Status**: ✅ Complete
- Delete button in user table rows
- Email confirmation modal with user verification
- Loading states and error handling
- UI state management

**Backend Requirements**:
- `DELETE /v1/admin/users/:id` endpoint
- Proper authorization (admin-only access)
- Soft delete vs hard delete decision
- Related data cleanup (user_lessons, user_levels, etc.)
- Audit logging for user deletions

**Frontend Integration Points**:
- File: `lib/api/users.ts` 
- Function to implement: `deleteUser(id: number): Promise<void>`
- Current placeholder: Lines 99-105 in `app/dashboard/users/page.tsx`

**Security Considerations**:
- Ensure only admins can delete users
- Prevent self-deletion (admin deleting themselves)
- Consider data retention policies
- Log deletion actions for audit purposes

**Testing Required**:
- Unit tests for delete API function
- E2E tests for delete workflow
- Edge case testing (deleting current user, non-existent users)

---

## Implementation Checklist

When implementing the delete endpoint:

- [ ] Create backend endpoint `DELETE /v1/admin/users/:id`
- [ ] Add proper authorization middleware
- [ ] Implement soft delete or hard delete with data cleanup
- [ ] Add audit logging
- [ ] Create `deleteUser` function in `lib/api/users.ts`
- [ ] Replace placeholder code in `app/dashboard/users/page.tsx` (lines 99-105)
- [ ] Add error handling for delete failures
- [ ] Write unit tests for delete functionality
- [ ] Write E2E tests for user deletion workflow
- [ ] Test edge cases (self-deletion prevention, etc.)

## Notes

The delete functionality is fully implemented on the frontend with:
- Proper email confirmation for safety
- Loading states during deletion
- Error handling and user feedback
- Automatic data refresh after successful deletion

The UI follows the same patterns as the email-templates delete functionality for consistency.