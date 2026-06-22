import {
  getMailshots,
  getMailshot,
  createMailshot,
  updateMailshot,
  deleteMailshot,
  previewMailshot,
  testMailshot,
  sendMailshot
} from "@/lib/api/mailshots";
import { api } from "@/lib/api/client";
import type { Mailshot } from "@/app/dashboard/mailshots/types";

jest.mock("@/lib/api/client", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}));

const mockApi = api as jest.Mocked<typeof api>;

const mailshot: Mailshot = {
  id: 7,
  slug: "launch",
  subject: "We launched!",
  body_markdown: "# Hi",
  email_communication_preferences_key: "newsletter",
  sent_to_audiences: [],
  sent_count: 0,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z"
};

function ok(data: unknown) {
  return { data, status: 200, headers: {} as any };
}

describe("Mailshots API client", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getMailshots passes filters as query params and returns the envelope", async () => {
    const response = { results: [mailshot], meta: { current_page: 1, total_count: 1, total_pages: 1 } };
    mockApi.get.mockResolvedValue(ok(response));

    const result = await getMailshots({ status: "draft", page: 2, per: 25 });

    expect(mockApi.get).toHaveBeenCalledWith("/admin/mailshots", {
      params: { status: "draft", page: "2", per: "25" }
    });
    expect(result).toEqual(response);
  });

  test("getMailshot unwraps the mailshot key", async () => {
    mockApi.get.mockResolvedValue(ok({ mailshot }));
    expect(await getMailshot(7)).toEqual(mailshot);
    expect(mockApi.get).toHaveBeenCalledWith("/admin/mailshots/7");
  });

  test("createMailshot wraps the body in { mailshot }", async () => {
    mockApi.post.mockResolvedValue(ok({ mailshot }));
    const input = { slug: "launch", subject: "We launched!", body_markdown: "# Hi" };

    const result = await createMailshot(input);

    expect(mockApi.post).toHaveBeenCalledWith("/admin/mailshots", { mailshot: input });
    expect(result).toEqual(mailshot);
  });

  test("updateMailshot wraps the body in { mailshot }", async () => {
    mockApi.patch.mockResolvedValue(ok({ mailshot }));
    const input = { slug: "launch", subject: "Edited", body_markdown: "# Hi" };

    await updateMailshot(7, input);

    expect(mockApi.patch).toHaveBeenCalledWith("/admin/mailshots/7", { mailshot: input });
  });

  test("deleteMailshot hits the resource path", async () => {
    mockApi.delete.mockResolvedValue(ok(""));
    await deleteMailshot(7);
    expect(mockApi.delete).toHaveBeenCalledWith("/admin/mailshots/7");
  });

  test("previewMailshot wraps body and returns html", async () => {
    mockApi.post.mockResolvedValue(ok({ html: "<html></html>" }));

    const html = await previewMailshot(7, { body_markdown: "# Hi", subject: "S" });

    expect(mockApi.post).toHaveBeenCalledWith("/admin/mailshots/7/preview", {
      mailshot: { body_markdown: "# Hi", subject: "S" }
    });
    expect(html).toBe("<html></html>");
  });

  test("testMailshot returns success boolean", async () => {
    mockApi.post.mockResolvedValue(ok({ success: true }));
    expect(await testMailshot(7)).toBe(true);
    expect(mockApi.post).toHaveBeenCalledWith("/admin/mailshots/7/test");
  });

  test("sendMailshot sends a raw segment param and returns the refreshed mailshot", async () => {
    const refreshed = { ...mailshot, sent_to_audiences: ["all_users" as const] };
    mockApi.post.mockResolvedValue(ok({ mailshot: refreshed, audience_count: 42 }));

    const result = await sendMailshot(7, "all_users");

    expect(mockApi.post).toHaveBeenCalledWith("/admin/mailshots/7/send", { segment: "all_users" });
    expect(result).toEqual({ mailshot: refreshed, audience_count: 42 });
  });
});
