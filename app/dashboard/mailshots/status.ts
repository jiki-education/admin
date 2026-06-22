import type { Mailshot } from "./types";

/**
 * A mailshot is a draft until it has been sent to at least one audience segment.
 * Status is derived entirely from `sent_to_audiences`.
 */
export function isDraft(mailshot: Pick<Mailshot, "sent_to_audiences">): boolean {
  return mailshot.sent_to_audiences.length === 0;
}

export function statusLabel(mailshot: Pick<Mailshot, "sent_to_audiences">): string {
  const count = mailshot.sent_to_audiences.length;
  if (count === 0) {
    return "Draft";
  }
  return `Sent (${count} ${count === 1 ? "segment" : "segments"})`;
}
