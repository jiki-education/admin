describe("Dashboard E2E", () => {
  beforeEach(async () => {
    await page.goto("http://localhost:3062/dashboard");
    await page.waitForSelector("h1");
  });

  it("should load the dashboard page", async () => {
    const heading = await page.$eval("h1", (el) => el.textContent);
    expect(heading).toBe("Dashboard");
  });

  it("should display the welcome message", async () => {
    const welcomeHeading = await page.$eval("h2", (el) => el.textContent);
    expect(welcomeHeading).toContain("Welcome to the Admin Dashboard");
  });

  it("should have the correct page title", async () => {
    const title = await page.title();
    expect(title).toBe("Jiki Admin");
  });
});
