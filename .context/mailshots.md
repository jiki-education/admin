# Mailshots (bulk email) — admin UI spec

Build a "Mailshots" section for authoring, previewing, testing and sending bulk
marketing emails. The API is implemented in the Rails app (`../api`); this
document is the authoritative contract + UI guidance.

## What a mailshot is

A markdown-authored bulk email sent to a named audience segment. The API renders
the markdown into the shared MJML email layout (header/footer/unsubscribe). The
backend guarantees **no user ever receives the same mailshot twice** (unique
index per user+mailshot), so the UI never needs to dedup — it only warns.

## API contract

Base: `/admin/mailshots`. Session-cookie auth (same as `/admin/users`).
All request bodies are **wrapped in the `mailshot` key** except `send` (raw).

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/admin/mailshots` | query: `page`, `per` | `{ results: Mailshot[], meta }` |
| GET | `/admin/mailshots/:id` | — | `{ mailshot }` |
| POST | `/admin/mailshots` | `{ mailshot: { slug, subject, body_markdown } }` | `201 { mailshot }` |
| PATCH | `/admin/mailshots/:id` | `{ mailshot: { slug?, subject?, body_markdown? } }` | `{ mailshot }` |
| DELETE | `/admin/mailshots/:id` | — | `204` (drafts only) |
| POST | `/admin/mailshots/:id/preview` | `{ mailshot: { subject, body_markdown } }` | `{ html }` |
| POST | `/admin/mailshots/:id/test` | — | `{ success: true }` |
| POST | `/admin/mailshots/:id/send` | `{ segment }` | `{ mailshot, audience_count }` |

`meta` = `{ current_page, total_count, total_pages }`.

### Mailshot shape
```ts
interface Mailshot {
  id: number;
  slug: string;
  subject: string;
  body_markdown: string;
  email_communication_preferences_key: string; // "newsletters"
  sent_to_audiences: Segment[];                 // e.g. ["premium_users"]
  sent_count: number;                           // recipients recorded so far
  created_at: string;                           // iso8601
  updated_at: string;                           // iso8601
}
type Segment = "all_users" | "premium_users" | "free_users" | "admin_users";
```
The list endpoint omits `body_markdown` and `email_communication_preferences_key`.

### Errors
Standard envelope `{ error: { type, message, ...extra } }`:
- Validation (422): `{ error: { type: "validation_error", message, errors: { subject: ["can't be blank"], ... } } }` — `errors` is field → messages.
- Unknown segment (422, from `send`): `type: "unknown_segment"`, plus `segment`.
- Empty body (422, from `send`): `type: "mailshot_body_blank"` — body is required to send, but not to create/save a draft.
- Delete an already-sent mailshot (422): `type: "mailshot_already_sent"`.
- Not found (404): `type: "mailshot_not_found"`.

## Endpoint semantics (important)

- **preview**: markdown injected into the full MJML layout, rendered server-side,
  **not persisted**. Sends the *current editor content* in the body, so it reflects
  unsaved edits. Render the returned `html` in an `<iframe srcDoc={html}>`. Do NOT
  client-render markdown — only the server reproduces the real email.
- **test**: sends to the **currently-authenticated admin**, works on drafts,
  creates **no** record → never affects `sent_to_audiences` / `sent_count`. Bypasses
  the admin's own opt-out so it always arrives.
- **send**: appends the segment to `sent_to_audiences` **synchronously** and returns
  the refreshed `mailshot`, so update the badge straight from the response (no
  refetch needed). `audience_count` is the **segment size** targeted; overlapping
  recipients are deduped in the background, so actual net-new sends may be fewer —
  label it "~N users (already-emailed users are skipped automatically)".
  Re-sending an already-sent segment is a backend no-op → `audience_count: 0`.

## UI structure (mirror `dashboard/users` + `dashboard/email-templates`)

```
app/dashboard/mailshots/
├── page.tsx                 # list: table, pagination, "New" button
├── new/page.tsx            # create draft → redirect to /[id]/edit
├── [id]/edit/page.tsx      # full-page MailshotForm
├── types/index.ts          # Mailshot, MailshotFilters, MailshotResponse, Segment
└── components/
    ├── MailshotTable.tsx        # slug, subject, status badge, sent_count, actions
    ├── MailshotPagination.tsx
    ├── MailshotForm.tsx         # slug + subject inputs + markdown editor + ServerPreview
    ├── ServerPreview.tsx        # debounced POST /preview → <iframe srcDoc={html}>
    ├── SegmentSelector.tsx      # dropdown of the 4 segments
    └── SendConfirmModal.tsx     # shows segment + warns from sent_to_audiences
```
Plus `lib/api/mailshots.ts`: `getMailshots, getMailshot, createMailshot,
updateMailshot, deleteMailshot, previewMailshot, testMailshot, sendMailshot`.

### Behaviour
- **Editing**: reuse `components/ui/markdown-editor/` for the textarea, but wire the
  preview pane to `ServerPreview` (POST `/preview`, ~500ms debounce) instead of local
  `marked`. The iframe shows the exact email.
- **Status badge**: derive from `sent_to_audiences` — empty → "Draft", else
  "Sent (n segments)".
- **Send**: `SegmentSelector` + a Send button → `SendConfirmModal`. The modal shows
  the chosen segment and, if it's already in `sent_to_audiences`, warns. On confirm,
  POST `/send`, then `toast.success(\`Queued for ~\${audience_count} users\`)` and
  update the row from the returned `mailshot`.
- **Test**: "Send test to me" button, always available (incl. drafts) → POST `/test`
  → toast. Copy can reassure it never counts as a real send.
- **Delete**: only offer when `sent_to_audiences` is empty; on 422
  `mailshot_already_sent`, show the message.
- **Create flow**: create-draft → redirect to `/[id]/edit` (so preview always has an
  `:id`).
