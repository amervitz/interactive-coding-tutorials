const { test, expect } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

let host;
let address;
test.beforeAll(async () => {
  const root = path.resolve(__dirname, '../dist');
  // A plain file host: no vendor mapping, application routes, or run storage.
  host = http.createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.startsWith('/tutorials/')) { res.writeHead(404).end(); return; }
    const file = path.resolve(root, pathname.slice('/tutorials/'.length) || 'index.html');
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const body = await fs.readFile(file);
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
        '.css': 'text/css', '.json': 'application/json', '.ttf': 'font/ttf', '.wasm': 'application/wasm' }[path.extname(file)] || 'text/plain';
      res.writeHead(200, { 'Content-Type': type });
      res.end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => host.listen(0, '127.0.0.1', resolve));
  address = `http://127.0.0.1:${host.address().port}/tutorials/`;
});

test('C# runs under a static subdirectory with no backend or special headers', async ({ page }) => {
  test.setTimeout(120000);
  const requests = [];
  page.on('request', request => requests.push(request));
  await page.goto(address);
  await page.getByRole('link', { name: /C# Fundamentals/ }).click();
  await expect(page.locator('#output-content')).toContainText('Hello, browser!', { timeout: 90000 });
  await expect(page.locator('#output-content .error')).toHaveCount(0);
  await page.locator('.lesson-item').nth(9).click();
  await page.locator('#run-btn').click();
  await expect(page.locator('#runtime-status')).toContainText('Finished', { timeout: 90000 });
  await expect(page.locator('#compilation-content')).toContainText('Project: Tutorial.csproj');
  await expect(page.locator('#compilation-content .error')).toHaveCount(0);
  await expect(page.locator('#output-content')).toContainText('Passing: Ada, Linus');
  await expect(page.locator('#output-content')).toContainText('Demo mode');
  expect(requests.every(request => request.method() === 'GET' && request.url().startsWith(address))).toBe(true);
  await page.getByRole('link', { name: '← Tutorials' }).click();
  await expect(page.getByRole('heading', { name: 'Choose a tutorial' })).toBeVisible();
  await expect(page).toHaveURL(address + 'index.html');
});
test.afterAll(async () => {
  await new Promise(resolve => host.close(resolve));
});

test('built site runs from a static subdirectory without APIs or CORS headers', async ({ page }) => {
  const runtimeRequests = [];
  page.on('request', request => {
    if (request.method() !== 'GET' || /\/(?:api|__run__)\//.test(request.url())) runtimeRequests.push(request.url());
  });
  await page.goto(address + 'tutorials/index.html?lang=js');
  await expect(page.locator('#output-content')).toContainText('Module loaded: main.js');
  await expect(page.locator('#verify-btn')).toBeEnabled();

  await page.locator('.lesson-item').nth(3).click();
  await page.locator('#run-btn').click();
  await expect(page.locator('#output-content')).toContainText('Circle area (r=3):');

  await page.locator('.lesson-item').nth(4).click();
  await page.locator('#run-btn').click();
  await expect(page.locator('#verify-btn')).toBeEnabled();
  await expect(page.locator('#output-content')).not.toContainText('heavy-module.js loaded');
  await page.frameLocator('#preview-panel iframe').getByRole('button', { name: 'Load Heavy Module' }).click();
  await expect(page.locator('#output-content')).toContainText('Heavy computation result:');
  await expect(page.locator('#output-content .error')).toHaveCount(0);
  expect(runtimeRequests).toEqual([]);
  await page.getByRole('link', { name: '← Tutorials' }).click();
  await expect(page.getByRole('heading', { name: 'Choose a tutorial' })).toBeVisible();
  await expect(page).toHaveURL(address + 'index.html');
});
