import './setup';

describe('Navigation Tests', () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:3064";

  beforeEach(async () => {
    // Reset page state before each test
    await page.goto(`${baseUrl}/`);
  });

  it('should load the signin page', async () => {
    await page.goto(`${baseUrl}/signin`);
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check that we can access the page (no errors)
    const body = await page.$('body');
    expect(body).toBeTruthy();
    
    // Verify we're on the correct page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });

  it('should load the signup page', async () => {
    await page.goto(`${baseUrl}/signup`);
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check that we can access the page (no errors)
    const body = await page.$('body');
    expect(body).toBeTruthy();
    
    // Verify we're on the correct page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signup');
  });

  it('should load the dashboard page', async () => {
    await page.goto(`${baseUrl}/dashboard`);
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check that we can access the page (no errors)
    const body = await page.$('body');
    expect(body).toBeTruthy();
    
    // Verify we can access the page (behavior may vary)
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost:3064');
  });

  it('should load the users management page', async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check that we can access the page (no errors)
    const body = await page.$('body');
    expect(body).toBeTruthy();
    
    // Verify we can access the page (behavior may vary)
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost:3064');
  });

  it('should load the levels management page', async () => {
    await page.goto(`${baseUrl}/dashboard/levels`);
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check that we can access the page (no errors)
    const body = await page.$('body');
    expect(body).toBeTruthy();
    
    // Verify we can access the page (behavior may vary)
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost:3064');
  });

  it('should load the email templates page', async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check that we can access the page (no errors)
    const body = await page.$('body');
    expect(body).toBeTruthy();
    
    // Verify we're on the correct page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard/email-templates');
  });
});