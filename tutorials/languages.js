// Only the selected language's loaders are called. Listing a language here
// does not import its runner, lessons, compiler, or runtime dependencies.
export const languages = {
  js: {
    title: 'JavaScript Modules Tutorial',
    editorLanguage: 'javascript',
    runnerTarget: 'preview-panel',
    preview: true,
    compilation: false,
    stop: false,
    runtimeStatus: false,
    loadLessons: () => import('../lessons/js/index.js'),
    loadRunner: async () => (await import('../runtimes/js/runner.js')).JavaScriptRunner,
  },
  csharp: {
    title: 'C# Fundamentals',
    editorLanguage: 'csharp',
    runnerTarget: 'runtime-status',
    preview: false,
    compilation: true,
    stop: true,
    runtimeStatus: true,
    loadLessons: () => import('../lessons/csharp/index.js'),
    loadRunner: async () => (await import('../runtimes/csharp/runner.js')).CSharpRunner,
  },
};
