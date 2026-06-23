import { isDraft, statusLabel } from "@/app/dashboard/mailshots/status";

describe("mailshot status helpers", () => {
  test("a mailshot with no audiences is a draft", () => {
    expect(isDraft({ sent_to_audiences: [] })).toBe(true);
    expect(statusLabel({ sent_to_audiences: [], sent_count: 0 })).toBe("Draft");
  });

  test("a sent mailshot shows the locally-formatted recipient count", () => {
    expect(isDraft({ sent_to_audiences: ["all_users"] })).toBe(false);
    expect(statusLabel({ sent_to_audiences: ["all_users"], sent_count: 1 })).toBe("Sent to 1 user");
    expect(statusLabel({ sent_to_audiences: ["all_users"], sent_count: 1234 })).toBe("Sent to 1,234 users");
  });
});
