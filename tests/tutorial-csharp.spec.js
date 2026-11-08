const { test, expect } = require('@playwright/test');

test.setTimeout(120000);

async function edit(page, filename, source) {
  await page.evaluate(({ filename, source }) => models.get(filename).setValue(source), { filename, source });
}

async function finished(page) {
  await expect(page.locator('#run-btn')).toBeEnabled({ timeout: 90000 });
  await expect(page.locator('#runtime-status')).toContainText('Finished', { timeout: 90000 });
}

test('catalog and JavaScript tutorial never request C# dependencies', async ({ page }) => {
  const csharpRequests = [];
  page.on('request', request => {
    if (/csharp|\.wasm(?:\?|$)|\.dll(?:\?|$)/.test(request.url())) csharpRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Choose a tutorial' })).toBeVisible();
  await expect(page.getByRole('link', { name: /C# Fundamentals/ })).toBeVisible();
  await page.getByRole('link', { name: /JavaScript Modules/ }).click();
  await expect(page.locator('#output-content')).toContainText('Module loaded: main.js');
  expect(csharpRequests).toEqual([]);
});

test('C# loads on opening, starts with one file, and verifies edited output', async ({ page }) => {
  const requests = [];
  page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('/');
  await page.getByRole('link', { name: /C# Fundamentals/ }).click();
  await expect(page.locator('#output-content')).toContainText('Hello, browser!', { timeout: 90000 });
  await finished(page);
  await expect(page).toHaveTitle('C# Fundamentals');
  await expect(page.locator('#stop-btn')).toBeVisible();
  await expect(page.locator('#runtime-status')).toBeVisible();
  await expect(page.locator('#preview-panel')).toBeHidden();
  await expect(page.getByRole('tab', { name: 'Console Output' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#compilation-content')).toBeHidden();
  await page.getByRole('tab', { name: 'Compilation', exact: true }).click();
  await expect(page.locator('#compilation-content')).toContainText('Compiling 1 C# source file(s)');
  await expect(page.locator('#compilation-content')).toContainText('Program.cs');
  await expect(page.locator('#compilation-content')).toContainText('Compilation succeeded: 0 error(s), 0 warning(s)');
  await expect(page.locator('#output-content')).toBeHidden();
  await page.locator('#clear-output').click();
  await expect(page.locator('#compilation-content')).toBeEmpty();
  await page.getByRole('tab', { name: 'Compilation', exact: true }).press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'Console Output' })).toBeFocused();
  await expect(page.locator('#output-content')).toContainText('Hello, browser!');
  expect(requests.some(request => /runtimes\/csharp\/publish\/.*\.wasm/.test(request.url))).toBe(true);
  expect(requests.every(request => request.method === 'GET')).toBe(true);
  expect(requests.every(request => new URL(request.url).origin === 'http://localhost:3001')).toBe(true);
  await expect(page.locator('.lesson-item')).toHaveCount(10);
  expect(await page.evaluate(() => models.get('Program.cs').getLanguageId())).toBe('csharp');
  await edit(page, 'Program.cs', 'using System;\nConsole.WriteLine("Hello, C#!");');
  await page.locator('#run-btn').click();
  await finished(page);
  await expect(page.locator('#output-content')).toContainText('Hello, C#!');
  await page.locator('#verify-btn').click();
  await expect(page.locator('.verify-item.pass')).toHaveCount(1);
});

test('compiler diagnostics, runtime errors, async programs, and clean reruns', async ({ page }) => {
  await page.goto('/tutorials/index.html?lang=csharp');
  await finished(page);
  await edit(page, 'Program.cs', 'using System;\nConsole.WriteLine(unknown);');
  await page.locator('#run-btn').click();
  await finished(page);
  await expect(page.locator('#compilation-content')).toContainText('Program.cs(2,19): error CS0103');
  await expect(page.locator('#compilation-content')).toContainText('Compilation failed: 1 error(s)');
  await expect(page.getByRole('tab', { name: 'Compilation', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#output-content')).toBeEmpty();
  await page.locator('#verify-btn').click();
  await expect(page.locator('.verify-item.fail')).toHaveCount(1);

  await edit(page, 'Program.cs', 'throw new System.InvalidOperationException("example failure");');
  await page.locator('#run-btn').click();
  await finished(page);
  await expect(page.locator('#output-content .error')).toContainText('InvalidOperationException: example failure');
  await expect(page.getByRole('tab', { name: 'Console Output' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#compilation-content')).toContainText('Compilation succeeded');
  await expect(page.locator('#compilation-content')).not.toContainText('CS0103');

  await edit(page, 'Program.cs', 'using System; using System.Threading.Tasks;\nawait Task.Delay(10); Console.WriteLine(Counter.Next());\nstatic class Counter { static int value; public static int Next() => ++value; }');
  for (let run = 0; run < 2; run++) {
    await page.locator('#run-btn').click();
    await finished(page);
    await expect(page.locator('#output-content .log')).toHaveText('1');
    await expect(page.locator('#output-content .error')).toHaveCount(0);
  }
});

test('compilation warnings stay in their tab and do not prevent verification', async ({ page }) => {
  await page.goto('/tutorials/index.html?lang=csharp');
  await finished(page);
  await edit(page, 'Program.cs', '#warning Example compiler warning\nSystem.Console.WriteLine("Hello, C#!");');
  await page.locator('#run-btn').click();
  await finished(page);
  await expect(page.locator('#output-content')).toHaveText('Hello, C#!');
  await expect(page.locator('#compilation-content .warn')).toContainText('warning CS1030');
  await expect(page.locator('#compilation-content')).toContainText('Compilation succeeded: 0 error(s), 1 warning(s)');
  await page.locator('#verify-btn').click();
  await expect(page.locator('.verify-item.pass')).toHaveCount(1);
  await page.getByRole('tab', { name: 'Compilation', exact: true }).click();
  await page.locator('#reset-btn').click();
  await expect(page.locator('#compilation-content')).toBeEmpty();
  await expect(page.locator('#output-content')).toBeVisible();
});

test('infinite loops can be stopped and rerun; automatic timeout also recovers', async ({ page }) => {
  await page.goto('/tutorials/index.html?lang=csharp');
  await finished(page);
  await edit(page, 'Program.cs', 'System.Console.WriteLine("loop started"); while (true) { }');
  await page.locator('#run-btn').click();
  await expect(page.locator('#output-content')).toContainText('loop started', { timeout: 90000 });
  await page.locator('#stop-btn').click();
  await expect(page.locator('#run-btn')).toBeEnabled();
  await expect(page.locator('#verify-btn')).toBeDisabled();
  await expect(page.locator('#output-content')).toContainText('Execution stopped.');

  await page.locator('#run-btn').click();
  await expect(page.locator('#output-content')).toContainText('Execution exceeded 15 seconds', { timeout: 30000 });
  await expect(page.locator('#run-btn')).toBeEnabled();
  await edit(page, 'Program.cs', 'System.Console.WriteLine("recovered");');
  await page.locator('#run-btn').click();
  await finished(page);
  await expect(page.locator('#output-content .log')).toHaveText('recovered');
});

test('missing runtime assets produce a recoverable loading error', async ({ page }) => {
  await page.route('**/runtimes/csharp/publish/worker.js', route => route.abort());
  await page.goto('/tutorials/index.html?lang=csharp');
  await expect(page.locator('#output-content .error')).toContainText('Unable to load', { timeout: 30000 });
  await expect(page.locator('#run-btn')).toBeEnabled();
  await page.unroute('**/runtimes/csharp/publish/worker.js');
  await page.locator('#run-btn').click();
  await finished(page);
  await expect(page.locator('#output-content')).toContainText('Hello, browser!');
});
