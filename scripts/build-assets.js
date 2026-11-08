const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

async function copyAssets(output, names) {
  await fs.mkdir(output, { recursive: true });
  for (const name of names) {
    await fs.cp(path.join(root, name), path.join(output, name), {
      recursive: true,
      // Editors can generate .NET intermediates when opening lesson projects.
      filter: source => !['bin', 'obj'].includes(path.basename(source)),
    });
  }
}

async function copyVendor(output, name, source) {
  await fs.cp(path.join(root, 'node_modules', source), path.join(output, 'vendor', name), { recursive: true });
  const packageRoot = source.split('/')[0];
  const entries = await fs.readdir(path.join(root, 'node_modules', packageRoot));
  for (const entry of entries.filter(entry => /^(?:license|notice)(?:\.|$)/i.test(entry))) {
    await fs.copyFile(path.join(root, 'node_modules', packageRoot, entry), path.join(output, 'vendor', name, entry));
  }
}

module.exports = { root, copyAssets, copyVendor };
