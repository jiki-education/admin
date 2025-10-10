describe("Authentication", () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:3062";

  beforeEach(async () => {
    await page.goto(`${baseUrl}/auth/login`);
  });

  it("should load the login page", async () => {
    const title = await page.title();
    expect(title).toMatch(/Login - Jiki/);
    
    // Check for form elements
    const emailInput = await page.$('input[name="email"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(submitButton).toBeTruthy();
  });

  it("should allow typing in form fields", async () => {
    // Type in the email field
    await page.type('input[name="email"]', 'test@example.com');
    
    // Type in the password field  
    await page.type('input[name="password"]', 'password123');
    
    // Verify the values were entered
    const emailValue = await page.$eval('input[name="email"]', el => (el as HTMLInputElement).value);
    const passwordValue = await page.$eval('input[name="password"]', el => (el as HTMLInputElement).value);
    
    expect(emailValue).toBe('test@example.com');
    expect(passwordValue).toBe('password123');
  });
});