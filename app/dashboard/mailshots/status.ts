import type { Mailshot } from "./types";

/**
 * A mailshot is a draft until it has been sent to at least one audience segment.
 * Status is derived entirely from `sent_to_audiences`.
 */
export function isDraft(mailshot: Pick<Mailshot, "sent_to_audiences">): boolean {
  return mailshot.sent_to_audiences.length === 0;
}

export function statusLabel(mailshot: Pick<Mailshot, "sent_to_audiences" | "sent_count">): string {
  if (isDraft(mailshot)) {
    return "Draft";
  }
  return `Sent to ${mailshot.sent_count.toLocaleString()} ${mailshot.sent_count === 1 ? "user" : "users"}`;
}
