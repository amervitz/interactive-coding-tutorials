export class JavaScriptRunner {
  constructor(preview) {
    this.preview = preview;
    this.frame = null;
    this.cancel = null;
    this.version = 0;
  }

  async run(files, log) {
    this.stop();
    const version = this.version;
    const { analyzeFiles } = await import('./module-files.js');
    const sources = await analyzeFiles(files);
    if (version !== this.version) return;
    const frame = document.createElement('iframe');
    frame.title = 'Lesson code preview';
    frame.setAttribute('sandbox', 'allow-scripts');
    this.preview.appendChild(frame);
    this.frame = frame;
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        window.removeEventListener('message', onMessage);
      };
      const onMessage = event => {
        if (event.source !== frame.contentWindow || !event.data) return;
        if (event.data.type === 'ready') frame.contentWindow.postMessage({ type: 'run', files: sources }, '*');
        if (event.data.type === 'log') log(event.data.text, event.data.level);
        if (event.data.type === 'done') {
          clearTimeout(timer);
          // Buttons and delayed imports can keep logging until the next run.
          resolve();
        }
      };
      this.cancel = () => { cleanup(); resolve(); this.cancel = null; };
      window.addEventListener('message', onMessage);
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Code did not finish within 10 seconds. Check for unresolved promises.'));
      }, 10000);
      frame.src = new URL('./sandbox.html', import.meta.url).href;
    });
  }

  stop() {
    this.version++;
    this.cancel?.();
    this.frame?.remove();
    this.frame = null;
  }
}
