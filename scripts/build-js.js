const path = require('node:path');
const { root, copyAssets, copyVendor } = require('./build-assets.js');

async function buildJavaScript(output = path.join(root, 'dist')) {
  await copyAssets(output, ['runtimes/js', 'lessons/js']);
  await copyVendor(output, 'es-module-lexer', 'es-module-lexer/dist');
}

module.exports = { buildJavaScript };
if (require.main === module) {
  buildJavaScript().catch(error => { console.error(error.message); process.exitCode = 1; });
}
