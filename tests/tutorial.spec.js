const { test, expect } = require('@playwright/test');

async function selectLesson(page, index) {
  await page.locator('.lesson-item').nth(index).click();
  await expect(page.locator('#progress-text')).toHaveText(`Lesson ${index + 1} of 6`);
}
async function run(page) {
  await page.locator('#run-btn').click();
  await expect(page.locator('#verify-btn')).toBeEnabled();
}
async function edit(page, filename, change) {
  await page.evaluate(({ filename, change }) => {
    const model = models.get(filename);
    // Test edits exercise the same Monaco models used by the editor.
    model.setValue(change.prefix + model.getValue().replaceAll(change.from || '__unused__', change.to || '') + change.suffix);
  }, { filename, change: { prefix: '', suffix: '', ...change } });
}
async function verify(page) {
  await page.locator('#verify-btn').click();
  await expect(page.locator('.verify-item.fail')).toHaveCount(0);
  await expect(page.locator('.verify-item.pass').first()).toBeVisible();
}

test('all six exercises run and verify, including delayed dynamic imports', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#output-content')).toContainText('Module loaded: main.js');
  await expect(page.locator('#verify-btn')).toBeEnabled();
  await verify(page);
  await expect(page.locator('#lesson-content pre').first()).toContainText('<script type="module"');

  await selectLesson(page, 1);
  await edit(page, 'main.js', { from: '// import { E }', to: 'import { E }' });
  await edit(page, 'main.js', { from: '// console.log("E =", E);', to: 'console.log("E =", E);' });
  await run(page);
  await verify(page);

  await selectLesson(page, 2);
  await edit(page, 'main.js', { from: '// import Calc', to: 'import Calc' });
  await edit(page, 'main.js', { from: '// console.log("Renamed import:', to: 'console.log("Renamed import:' });
  await run(page);
  await verify(page);

  await selectLesson(page, 3);
  await edit(page, 'main.js', { from: '// import { rectArea', to: 'import { rectArea' });
  await edit(page, 'main.js', { from: '// console.log("Rect', to: 'console.log("Rect' });
  await run(page);
  await verify(page);

  await selectLesson(page, 4);
  await edit(page, 'main.js', { suffix: '\nconst failBtn = document.createElement("button"); failBtn.textContent = "Test missing module"; document.body.append(failBtn); failBtn.onclick = async () => { try { await import("./non-existent.js"); } catch { console.log("Module not found"); } };' });
  await run(page);
  await expect(page.locator('#output-content')).not.toContainText('heavy-module.js loaded');
  await page.frameLocator('#preview-panel iframe').getByRole('button', { name: 'Load Heavy Module' }).click();
  await expect(page.locator('#output-content')).toContainText('Heavy computation result:');
  await page.frameLocator('#preview-panel iframe').getByRole('button', { name: 'Test missing module' }).click();
  await expect(page.locator('#output-content')).toContainText('Module not found');
  await verify(page);

  await selectLesson(page, 5);
  await edit(page, 'logger.js', { from: 'error: 3', to: 'error: 3, fatal: 4' });
  await edit(page, 'logger.js', { from: '  getLogs:', to: "  fatal: (msg) => { if (currentLevel <= levels.fatal) logs.push(format('fatal', msg)); },\n  getLogs:" });
  await edit(page, 'main.js', { from: 'console.log("\\nAll logs:");', to: 'log.fatal("Fatal example");\nconsole.log("\\nAll logs:");' });
  await run(page);
  await verify(page);
  await expect(page.locator('#next-btn')).toBeDisabled();
  expect(errors).toEqual([]);
});

test('errors are visible, reruns are fresh, and reset restores deleted files', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#verify-btn')).toBeEnabled();
  await edit(page, 'main.js', { suffix: '\nthrow new Error("Example failure");' });
  await run(page);
  await expect(page.locator('#output-content .error')).toContainText('Example failure');
  await page.locator('#verify-btn').click();
  await expect(page.locator('#next-btn')).toBeDisabled();
  await page.locator('#reset-btn').click();
  await run(page);
  await verify(page);
  await selectLesson(page, 1);
  await page.locator('.close[data-file="utils.js"]').click();
  await run(page);
  await expect(page.locator('#output-content .error')).not.toHaveCount(0);
  await page.locator('#reset-btn').click();
  await expect(page.locator('.tab')).toHaveCount(2);
  await run(page);
  await expect(page.locator('#output-content')).toContainText('Area (r=5):');
  await expect(page.locator('#output-content .error')).toHaveCount(0);
});

test('server handles query strings and limits public files', async ({ request }) => {
  expect((await request.get('/?lesson=1')).status()).toBe(200);
  expect((await request.get('/server.js')).status()).toBe(404);
  expect((await request.get('/package.json')).status()).toBe(404);
  expect((await request.post('/api/runs', { data: { files: { '../bad.js': '' } } })).status()).toBe(400);
});

test('mobile layout exposes the console and lesson instructions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#verify-btn')).toBeEnabled();
  await page.locator('#output-content').scrollIntoViewIfNeeded();
  await expect(page.locator('#output-content')).toBeInViewport();
  await page.locator('.exercise').scrollIntoViewIfNeeded();
  await expect(page.locator('.exercise')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
