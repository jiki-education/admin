import './setup';

describe('Users - Basic', () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:3064";

  it('should load the home page', async () => {
    await page.goto(`${baseUrl}/`);
    const body = await page.$('body');
    expect(body).toBeTruthy();
  });

  it('should redirect to signin when accessing users without auth', async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 2000));
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });

  it('should load the users page', async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    await page.waitForSelector('body', { timeout: 5000 });
    const body = await page.$('body');
    expect(body).toBeTruthy();
  });

  it('should navigate to signin page when accessing users', async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });

  it('should display signin page title when redirected from users', async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('h1', { timeout: 5000 });
    const titleText = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : '';
    });
    expect(titleText).toContain('Sign In');
  });

  it('should have signin form when redirected from users', async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const form = await page.$('form');
    expect(form).toBeTruthy();
  });
});