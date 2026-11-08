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
    if (!pathname.startsWith('/tutorial/')) { res.writeHead(404).end(); return; }
    const file = path.resolve(root, pathname.slice('/tutorial/'.length) || 'index.html');
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const body = await fs.readFile(file);
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
        '.css': 'text/css', '.json': 'application/json', '.ttf': 'font/ttf' }[path.extname(file)] || 'text/plain';
      res.writeHead(200, { 'Content-Type': type });
      res.end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => host.listen(0, '127.0.0.1', resolve));
  address = `http://127.0.0.1:${host.address().port}/tutorial/`;
});
test.afterAll(async () => {
  await new Promise(resolve => host.close(resolve));
});

test('built site runs from a static subdirectory without APIs or CORS headers', async ({ page }) => {
  const runtimeRequests = [];
  page.on('request', request => {
    if (request.method() !== 'GET' || /\/(?:api|__run__)\//.test(request.url())) runtimeRequests.push(request.url());
  });
  await page.goto(address);
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
});
