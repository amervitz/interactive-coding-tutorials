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
  const runtimeRequests = [];
  page.on('request', request => {
    if (/\/(?:api|__run__)\//.test(request.url())) runtimeRequests.push(request.url());
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/tutorials/index.html?lang=js');
  await expect(page.locator('#output-content')).toContainText('Module loaded: main.js');
  await expect(page.locator('#verify-btn')).toBeEnabled();
  await verify(page);
  await expect(page.locator('#lesson-content pre').first()).toContainText('<script type="module"');
  await expect(page.locator('#lesson-content pre script')).toHaveCount(0);
  await expect(page.locator('#verification-results .verify-item.pass').first()).toBeVisible();
  await expect(page.locator('.exercise .verify-item')).toHaveCount(0);

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
  expect(runtimeRequests).toEqual([]);
});

test('in-memory modules preserve live bindings and computed imports inside the sandbox', async ({ page }) => {
  await page.goto('/tutorials/index.html?lang=js');
  await expect(page.locator('#verify-btn')).toBeEnabled();
  await page.evaluate(() => {
    models.set('graph/a.js', monaco.editor.createModel(`
      import { readB } from './b.js';
      export let value = 1;
      export function increment() { value++; }
      export function readCycle() { return readB(); }
      console.log('a initialized');
    `, 'javascript', monaco.Uri.parse('inmemory:///graph/a.js')));
    models.set('graph/b.js', monaco.editor.createModel(`
      import { value } from './a.js';
      export function readB() { return value; }
    `, 'javascript', monaco.Uri.parse('inmemory:///graph/b.js')));
    models.get('main.js').setValue(`
      import { value, increment, readCycle } from './graph/a.js';
      console.log('before', value);
      increment();
      console.log('after', value, readCycle());
      console.log('metadata', import.meta.url.endsWith('/main.js'),
        import.meta.resolve('./graph/a.js').endsWith('/graph/a.js'));
      const button = document.createElement('button');
      button.textContent = 'Read dynamically';
      button.onclick = async () => {
        const name = './graph/' + 'a.js';
        console.log('dynamic', (await import(name)).value);
      };
      document.body.append(button);
      try { parent.document.body; console.error('Sandbox escaped'); }
      catch { console.log('Parent access blocked'); }
    `);
  });
  await run(page);
  await expect(page.locator('#output-content')).toContainText('before 1');
  await expect(page.locator('#output-content')).toContainText('after 2 2');
  await expect(page.locator('#output-content')).toContainText('metadata true true');
  await expect(page.locator('#output-content')).toContainText('Parent access blocked');
  await page.frameLocator('#preview-panel iframe').getByRole('button', { name: 'Read dynamically' }).click();
  await expect(page.locator('#output-content')).toContainText('dynamic 2');
  await expect(page.locator('#output-content .output-line').filter({ hasText: 'a initialized' })).toHaveCount(1);
  await expect(page.locator('#output-content .error')).toHaveCount(0);
  await run(page);
  await expect(page.locator('#output-content')).toContainText('before 1');
  await expect(page.locator('#output-content')).toContainText('after 2 2');
});

test('dynamic imports handle new URL variants and unused invalid modules stay lazy', async ({ page }) => {
  await page.goto('/tutorials/index.html?lang=js');
  await expect(page.locator('#verify-btn')).toBeEnabled();
  await page.evaluate(() => {
    models.set('value.js', monaco.editor.createModel('export const identity = {};', 'javascript', monaco.Uri.parse('inmemory:///value.js')));
    models.set('broken.js', monaco.editor.createModel('export const = ;', 'javascript', monaco.Uri.parse('inmemory:///broken.js')));
    models.get('main.js').setValue(`
      // import './comment-only.js';
      console.log("Literal import('./string-only.js')");
      const name = './value.js';
      const first = await import(name);
      const again = await import(name);
      const variant = await import(name + '?v=2');
      console.log('identity', first === again, first !== variant);
      try { await import('./broken.js'); }
      catch (error) { console.log('Syntax error caught', error instanceof SyntaxError); }
    `);
  });
  await run(page);
  await expect(page.locator('#output-content')).toContainText('identity true true');
  await expect(page.locator('#output-content')).toContainText('Syntax error caught true');
  await expect(page.locator('#output-content .error')).toHaveCount(0);
});

test('errors are visible, reruns are fresh, and reset restores deleted files', async ({ page }) => {
  await page.goto('/tutorials/index.html?lang=js');
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
  const lessonIndex = await request.get('/lessons/js/index.js');
  expect(lessonIndex.status()).toBe(200);
  expect(lessonIndex.headers()['content-type']).toContain('text/javascript');
  expect((await request.get('/lessons/js/named-exports/checks.js')).status()).toBe(200);
  expect((await request.get('/api/lessons')).status()).toBe(404);
  expect((await request.get('/vendor/__proto__/index.js')).status()).toBe(404);
  expect(await (await request.get('/lessons/js/index.json')).json()).toHaveLength(6);
  expect(await (await request.get('/lessons/js/named-exports/lesson.yaml')).text()).toContain('Named Exports');
  expect(await (await request.get('/lessons/js/named-exports/starter/utils.js')).text()).toContain('export const E');
  expect(await (await request.get('/lessons/js/re-exporting/starter/shapes/circle.js')).text()).toContain('export function area');
  expect((await request.get('/lessons/loader.js')).status()).toBe(200);
  expect((await request.get('/lessons/js/missing.js')).status()).toBe(404);
  expect((await request.get('/lessons/js/../server.js')).status()).toBe(404);
  expect((await request.get('/server.js')).status()).toBe(404);
  expect((await request.get('/package.json')).status()).toBe(404);
  expect((await request.get('/api/runs')).status()).toBe(404);
  expect((await request.post('/api/runs', { data: { files: { 'main.js': '' } } })).status()).toBe(405);
});

test('a lesson loading failure is shown in the console', async ({ page }) => {
  await page.route('**/lessons/js/named-exports/checks.js', route => route.abort());
  await page.goto('/tutorials/index.html?lang=js');
  await expect(page.locator('#output-content .error')).toContainText('Unable to start tutorial:');
  await expect(page.locator('#verify-btn')).toBeDisabled();
});

test('lesson metadata failures are shown in the console', async ({ page }) => {
  await page.route('**/lessons/js/named-exports/lesson.yaml', route => route.fulfill({
    status: 200, body: 'id: 2\ntitle: Named Exports\nfiles: [utils.js]'
  }));
  await page.goto('/tutorials/index.html?lang=js');
  await expect(page.locator('#output-content .error')).toContainText('starter file list including main.js');
  await expect(page.locator('#verify-btn')).toBeDisabled();
});

test('mobile layout exposes the console and lesson instructions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tutorials/index.html?lang=js');
  await expect(page.locator('#verify-btn')).toBeEnabled();
  await page.locator('#output-content').scrollIntoViewIfNeeded();
  await expect(page.locator('#output-content')).toBeInViewport();
  await page.locator('.exercise').scrollIntoViewIfNeeded();
  await expect(page.locator('.exercise')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
