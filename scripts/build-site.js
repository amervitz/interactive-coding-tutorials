const fs = require('node:fs/promises');
const path = require('node:path');
const { root, copyAssets, copyVendor } = require('./build-assets.js');
const { buildJavaScript } = require('./build-js.js');
const { buildCSharp } = require('./build-csharp.js');

async function buildSite() {
  const output = path.join(root, 'dist');
  if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Invalid build output directory');
  await fs.rm(output, { recursive: true, force: true });
  await copyAssets(output, ['index.html', 'tutorials', 'app.js', 'lessons/loader.js', 'styles.css']);
  await buildJavaScript(output);
  await buildCSharp(output);
  for (const [name, source] of Object.entries({ monaco: 'monaco-editor/min', yaml: 'yaml/browser', 'markdown-it': 'markdown-it/dist/browser' })) {
    await copyVendor(output, name, source);
  }
  console.log('Static site built in dist/');
}

buildSite().catch(error => { console.error(error.message); process.exitCode = 1; });
