const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');

async function build() {
  // Only replace this project's generated output directory.
  if (path.dirname(output) !== root || path.basename(output) !== 'dist') {
    throw new Error('Invalid build output directory');
  }
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  for (const name of ['index.html', 'app.js', 'module-files.js', 'styles.css', 'runner.html', 'runner.js', 'preview.css', 'lessons']) {
    await fs.cp(path.join(root, name), path.join(output, name), { recursive: true });
  }
  const vendors = {
    monaco: 'monaco-editor/min',
    yaml: 'yaml/browser',
    'markdown-it': 'markdown-it/dist/browser',
    'es-module-lexer': 'es-module-lexer/dist',
  };
  for (const [name, source] of Object.entries(vendors)) {
    await fs.cp(path.join(root, 'node_modules', source), path.join(output, 'vendor', name), { recursive: true });
    // Retain dependency license notices in the published artifact.
    const packageRoot = source.split('/')[0];
    const entries = await fs.readdir(path.join(root, 'node_modules', packageRoot));
    for (const entry of entries.filter(entry => /^(?:license|notice)(?:\.|$)/i.test(entry))) {
      await fs.copyFile(path.join(root, 'node_modules', packageRoot, entry), path.join(output, 'vendor', name, entry));
    }
  }
  console.log('Static site built in dist/');
}

build().catch(error => { console.error(error.message); process.exitCode = 1; });
