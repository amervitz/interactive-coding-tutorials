const { test, expect } = require('@playwright/test');

let files;
test.beforeEach(async ({ page }) => {
  files = {
    'index.json': '["example"]',
    'example/lesson.yaml': 'id: 1\ntitle: Example\nfiles:\n  - main.js\n',
    'example/instructions.md': '## Example\n',
    'example/starter/main.js': 'console.log("Hello");',
    'example/checks.js': 'export default [{ name: "Example", test: () => true }];',
  };
  await page.route('**/fixtures/**', route => {
    const name = new URL(route.request().url()).pathname.slice('/fixtures/'.length);
    return route.fulfill({ status: Object.hasOwn(files, name) ? 200 : 404,
      contentType: name.endsWith('.js') ? 'text/javascript' : 'text/plain', body: files[name] ?? 'Not found' });
  });
  await page.goto('/');
});

async function load(page) {
  return page.evaluate(async () => {
    const { loadLessons } = await import('/lessons/loader.js');
    const lessons = await loadLessons(new URL('/fixtures/', location.href));
    return lessons.map(({ verification, ...lesson }) => lesson);
  });
}

test('rejects unsafe or duplicate manifest entries', async ({ page }) => {
  for (const manifest of [['../outside'], ['example', 'example']]) {
    files['index.json'] = JSON.stringify(manifest);
    await expect(load(page)).rejects.toThrow('unique lesson folder names');
  }
});

test('renders fenced code literally and separates the Markdown exercise', async ({ page }) => {
  files['example/instructions.md'] = [
    '## Example', '', '```html', '<script type="module" src="main.js"></script>',
    '```', '', '### 🎯 Exercise: Explore', '', 'Use **modules**.', '', '> A helpful hint.',
    '', '<script>alert("raw HTML")</script>',
  ].join('\n');
  const [lesson] = await load(page);
  expect(lesson.content).toContain('<code class="language-html">&lt;script');
  expect(lesson.content).not.toContain('Exercise:');
  expect(lesson.exercise).toContain('<strong>modules</strong>');
  expect(lesson.exercise).toContain('<blockquote>');
  expect(lesson.exercise).not.toContain('<script>');
});

test('rejects missing entrypoints, unsafe starter paths, and malformed YAML', async ({ page }) => {
  for (const metadata of [
    'id: 1\ntitle: Example\nfiles: [utils.js]',
    'id: 1\ntitle: Example\nfiles: [main.js, ../outside.js]',
    'id: [invalid',
  ]) {
    files['example/lesson.yaml'] = metadata;
    await expect(load(page)).rejects.toThrow('Unable to load lesson "example"');
  }
});

test('identifies missing starter files and duplicate lesson IDs', async ({ page }) => {
  delete files['example/starter/main.js'];
  await expect(load(page)).rejects.toThrow('main.js');
  files['example/starter/main.js'] = '';
  for (const [name, body] of Object.entries(files)) {
    if (name.startsWith('example/')) files[name.replace('example/', 'another/')] = body;
  }
  files['index.json'] = '["example", "another"]';
  await expect(load(page)).rejects.toThrow('unique positive id');
});
