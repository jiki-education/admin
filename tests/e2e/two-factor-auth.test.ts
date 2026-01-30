import "./setup";

describe("Two-Factor Authentication Pages", () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:3064";

  describe("verify-2fa page", () => {
    it("redirects to signin when accessed without 2FA pending state", async () => {
      await page.goto(`${baseUrl}/verify-2fa`, { waitUntil: "networkidle0" });

      // Should redirect to signin since there's no 2FA pending state
      const url = page.url();
      expect(url).toContain("/signin");
    });
  });

  describe("setup-2fa page", () => {
    it("redirects to signin when accessed without 2FA setup state", async () => {
      await page.goto(`${baseUrl}/setup-2fa`, { waitUntil: "networkidle0" });

      // Should redirect to signin since there's no 2FA setup state
      const url = page.url();
      expect(url).toContain("/signin");
    });
  });

  describe("signin page with 2FA flow", () => {
    it("loads signin page successfully", async () => {
      await page.goto(`${baseUrl}/signin`, { waitUntil: "networkidle0" });

      // Check signin form is present
      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');
      const submitButton = await page.$('button[type="submit"]');

      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(submitButton).toBeTruthy();
    });
  });
});
