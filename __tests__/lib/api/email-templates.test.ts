import { translateEmailTemplate } from "@/lib/api/email-templates";
import { api } from "@/lib/api/client";
import type { TranslateEmailTemplateResponse } from "@/app/dashboard/email-templates/types";

// Mock the API client
jest.mock("@/lib/api/client", () => ({
  api: {
    post: jest.fn()
  }
}));

const mockApi = api as jest.Mocked<typeof api>;

describe("Email Templates API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("translateEmailTemplate", () => {
    test("sends correct API request and returns translation response", async () => {
      const templateId = 123;
      const mockResponse: TranslateEmailTemplateResponse = {
        email_template: {
          id: 123,
          type: "level_completion", 
          slug: "level-1",
          locale: "en",
          subject: "Congratulations!",
          body_mjml: "<mjml>...</mjml>",
          body_text: "Congratulations on completing the level!"
        },
        queued_locales: ["hu", "fr"]
      };

      mockApi.post.mockResolvedValue({
        data: mockResponse,
        status: 202,
        headers: {} as any
      });

      const result = await translateEmailTemplate(templateId);

      expect(mockApi.post).toHaveBeenCalledWith("/admin/email_templates/123/translate");
      expect(result).toEqual(mockResponse);
    });

    test("throws error when API request fails", async () => {
      const templateId = 123;
      const mockError = new Error("Not found");

      mockApi.post.mockRejectedValue(mockError);

      await expect(translateEmailTemplate(templateId)).rejects.toThrow("Not found");
      expect(mockApi.post).toHaveBeenCalledWith("/admin/email_templates/123/translate");
    });

    test("handles 422 error for non-English templates", async () => {
      const templateId = 456;
      const mockError = new Error("Source template must be in English (en)");

      mockApi.post.mockRejectedValue(mockError);

      await expect(translateEmailTemplate(templateId)).rejects.toThrow("Source template must be in English (en)");
      expect(mockApi.post).toHaveBeenCalledWith("/admin/email_templates/456/translate");
    });
  });
});