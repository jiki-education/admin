import './setup';

describe('Email Templates - Basic', () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:3064";

  it('should load the home page', async () => {
    await page.goto(`${baseUrl}/`);
    const body = await page.$('body');
    expect(body).toBeTruthy();
  });

  it('should redirect to signin when accessing dashboard without auth', async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);
    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 2000));
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });

  it('should redirect to signin when accessing email templates page', async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);
    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 2000));
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });

  it('should redirect to signin when trying to access page content', async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);
    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 2000));
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });

  it('should redirect to signin when trying to access create button', async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);
    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 2000));
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });

  it('should redirect to signin instead of showing page breadcrumb', async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);
    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 2000));
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });

  it('should navigate to signin page when accessing email templates', async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });

  it('should display signin page title when redirected', async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('h1', { timeout: 5000 });
    const titleText = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : '';
    });
    expect(titleText).toContain('Sign In');
  });

  it('should have signin form when redirected from email templates', async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const form = await page.$('form');
    expect(form).toBeTruthy();
  });

  it('should show email input field on signin page', async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const emailInput = await page.$('input[type="email"]');
    expect(emailInput).toBeTruthy();
  });

  it('should redirect properly maintaining URL structure', async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost');
  });
});