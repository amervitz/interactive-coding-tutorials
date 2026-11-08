const { test, expect } = require('@playwright/test');

test('shared tutorial page defaults to JavaScript and hides compiler-only controls', async ({ page }) => {
  await page.goto('/tutorials/index.html');
  await expect(page.locator('#output-content')).toContainText('Module loaded: main.js');
  await expect(page).toHaveTitle('JavaScript Modules Tutorial');
  await expect(page.locator('#tutorial-title')).toHaveText('JavaScript Modules Tutorial');
  await expect(page.locator('.lesson-item')).toHaveCount(6);
  await expect(page.locator('#preview-panel')).toBeVisible();
  await expect(page.locator('#compilation-output-tab')).toBeHidden();
  await expect(page.locator('#stop-btn')).toBeHidden();
  await expect(page.locator('#runtime-status')).toBeHidden();
  await expect(page.locator('#verify-btn')).toBeEnabled();
});

test('unknown language selections show an error without importing runtimes or lessons', async ({ page }) => {
  const imports = [];
  page.on('request', request => {
    if (/\/(?:runtimes|lessons)\//.test(request.url())) imports.push(request.url());
  });
  for (const language of ['unknown', '__proto__']) {
    await page.goto(`/tutorials/index.html?lang=${language}`);
    await expect(page.locator('#tutorial-title')).toHaveText('Tutorial unavailable');
    await expect(page.locator('#output-content .error')).toContainText(`Unsupported tutorial language: ${language}`);
    await expect(page.locator('#run-btn')).toBeDisabled();
    await expect(page.locator('#reset-btn')).toBeDisabled();
    await expect(page.locator('#verify-btn')).toBeDisabled();
  }
  expect(imports).toEqual([]);
});
