// This module is loaded only by the C# tutorial. Each worker runs at most once.
import { dotnet } from './_framework/dotnet.js';

try {
  const runtime = await dotnet.withDiagnosticTracing(false).create();
  runtime.setModuleImports('tutorial', {
    write: (text, level) => postMessage({ type: 'log', text, level, channel: 'console' }),
    compilation: (text, level) => postMessage({ type: 'log', text, level, channel: 'compilation' })
  });
  const exports = await runtime.getAssemblyExports(runtime.getConfig().mainAssemblyName);
  self.onmessage = async ({ data }) => {
    if (data?.type !== 'run') return;
    self.onmessage = null;
    try {
      await exports.Compiler.Run(JSON.stringify(data.files));
      postMessage({ type: 'done' });
    } catch (error) {
      postMessage({ type: 'error', text: error.message });
    }
  };
  postMessage({ type: 'ready' });
} catch (error) {
  postMessage({ type: 'error', text: `Unable to load C#: ${error.message}` });
}
