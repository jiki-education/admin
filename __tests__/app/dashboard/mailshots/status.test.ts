import { isDraft, statusLabel } from "@/app/dashboard/mailshots/status";

describe("mailshot status helpers", () => {
  test("a mailshot with no audiences is a draft", () => {
    expect(isDraft({ sent_to_audiences: [] })).toBe(true);
    expect(statusLabel({ sent_to_audiences: [] })).toBe("Draft");
  });

  test("a mailshot sent to one segment is not a draft", () => {
    expect(isDraft({ sent_to_audiences: ["all_users"] })).toBe(false);
    expect(statusLabel({ sent_to_audiences: ["all_users"] })).toBe("Sent (1 segment)");
  });

  test("pluralizes multiple segments", () => {
    expect(statusLabel({ sent_to_audiences: ["free_users", "premium_users"] })).toBe("Sent (2 segments)");
  });
});
