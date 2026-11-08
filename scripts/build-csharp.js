const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const { root, copyAssets } = require('./build-assets.js');
async function buildCSharp(output = path.join(root, 'dist')) {
  // Clean only this project's fixed generated publish directory so fingerprinted
  // assets from previous builds do not accumulate in the distributed bundle.
  fs.rmSync(path.join(root, 'runtimes/csharp', 'bin', 'publish'), { recursive: true, force: true });
  const result = spawnSync('dotnet', ['publish', 'runtimes/csharp/CSharpRunner.csproj',
    '-c', 'Release', '-o', 'runtimes/csharp/bin/publish'], { cwd: root, stdio: 'inherit' });
  if (result.error) {
    throw new Error('C# build requires .NET 10 and the wasm-tools workload. See README.md. ' + result.error.message);
  }
  if (result.status !== 0) throw new Error('C# build failed. See the dotnet output above.');
  const destination = path.join(root, 'runtimes/csharp', 'publish');
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync(path.join(root, 'runtimes/csharp', 'bin', 'publish', 'wwwroot'), destination, { recursive: true });
  fs.copyFileSync(path.join(root, 'runtimes/csharp', 'worker.js'), path.join(destination, 'worker.js'));
  await copyAssets(output, ['runtimes/csharp/runner.js', 'lessons/csharp', 'runtimes/csharp/publish']);
}

module.exports = { buildCSharp };
if (require.main === module) {
  buildCSharp().catch(error => { console.error(error.message); process.exitCode = 1; });
}
