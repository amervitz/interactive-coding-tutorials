export class CSharpRunner {
  constructor(status) {
    this.status = status;
    this.worker = null;
    this.pending = null;
  }

  prepare() {
    if (this.worker) return;
    this.status.textContent = 'Loading C# tools… The first download may take a moment.';
    const worker = new Worker(new URL('./publish/worker.js', import.meta.url), { type: 'module' });
    this.worker = worker;
    this.ready = new Promise((resolve, reject) => {
      this.rejectReady = reject;
      this.startupTimer = setTimeout(() => this.fail('C# tools did not load within 120 seconds. Try Run Code again.'), 120000);
      worker.onmessage = ({ data }) => {
        if (this.worker !== worker) return;
        if (data.type === 'ready') {
          clearTimeout(this.startupTimer);
          this.status.textContent = 'C# tools ready. Code runs in your browser.';
          resolve();
        } else if (data.type === 'log' && this.pending) {
          if (++this.pending.lines > 1000) this.fail('Output limit reached (1,000 entries).');
          else this.pending.log(data.text, data.level, data.channel);
        } else if (data.type === 'done') this.finish();
        else if (data.type === 'error') this.fail(data.text);
      };
      worker.onerror = event => {
        event.preventDefault();
        this.fail(event.message || 'Unable to load the C# worker. Check that the C# assets were built.');
      };
    });
    this.ready.catch(() => {});
  }

  async run(files, log) {
    this.prepare();
    const worker = this.worker;
    await this.ready;
    if (worker !== this.worker) return;
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject, log, lines: 0 };
      this.status.textContent = 'Compiling and running C#…';
      this.runTimer = setTimeout(() => this.fail('Execution exceeded 15 seconds and was stopped.'), 15000);
      worker.postMessage({ type: 'run', files });
    });
  }

  finish() {
    const pending = this.pending;
    this.pending = null;
    this.dispose();
    this.status.textContent = 'Finished. Each run starts with fresh program state.';
    pending?.resolve();
  }

  fail(message) {
    const pending = this.pending;
    this.pending = null;
    this.rejectReady?.(new Error(message));
    this.dispose();
    this.status.textContent = message;
    pending?.reject(new Error(message));
  }

  stop() {
    if (!this.worker) return;
    const pending = this.pending;
    this.pending = null;
    this.rejectReady?.(new Error('Execution stopped.'));
    this.dispose();
    this.status.textContent = 'Stopped. Run Code starts a fresh session.';
    pending?.resolve();
  }

  dispose() {
    clearTimeout(this.startupTimer);
    clearTimeout(this.runTimer);
    this.worker?.terminate();
    this.worker = null;
    this.rejectReady = null;
  }
}
