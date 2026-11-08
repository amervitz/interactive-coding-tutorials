(() => {
  const post = (type, data = {}) => parent.postMessage({ type, ...data }, '*');
  const base = new URL('./__run__/', location.href);
  let files;
  const moduleUrls = new Map();
  const metadata = new Map();

  function resolve(specifier, parentUrl) {
    specifier = String(specifier);
    if (!/^(?:\.{1,2}\/|\/|[a-zA-Z][\w+.-]*:)/.test(specifier)) {
      throw new TypeError(`Unmapped module specifier: ${specifier}`);
    }
    return new URL(specifier, parentUrl).href;
  }

  function registerGraph(entryUrl) {
    const pending = new Map();
    function visit(url) {
      if (moduleUrls.has(url) || pending.has(url)) return;
      const resolved = new URL(url);
      if (resolved.origin !== base.origin || !resolved.pathname.startsWith(base.pathname)) return;
      const name = decodeURIComponent(resolved.pathname.slice(base.pathname.length));
      if (!Object.hasOwn(files, name)) throw new Error(`Module not found: ${name}`);
      const { source, imports } = files[name];
      // Collect the full static graph before creating blobs, including cycles.
      pending.set(url, source);
      const edits = [];
      for (const record of imports) {
        if (record.d === -1) {
          const dependency = resolve(record.n, url);
          visit(dependency);
          edits.push({ start: record.s - 1, end: record.e + 1, text: JSON.stringify(dependency) });
        } else if (record.d === -2) {
          edits.push({ start: record.s, end: record.e,
            text: `globalThis.__tutorialMeta(${JSON.stringify(url)})` });
        } else {
          // Keep the original argument expression and optional import options.
          edits.push({ start: record.ss, end: record.d,
            text: `((specifier, options) => globalThis.__tutorialImport(specifier, ${JSON.stringify(url)}, options))` });
        }
      }
      let code = source;
      for (const edit of edits.sort((a, b) => b.start - a.start)) {
        code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
      }
      pending.set(url, code + `\n//# sourceURL=${url}\n`);
    }
    visit(entryUrl);
    if (!pending.size) return;
    const imports = {};
    for (const [url, code] of pending) {
      const blob = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
      moduleUrls.set(url, blob);
      imports[url] = blob;
    }
    const map = document.createElement('script');
    map.type = 'importmap';
    map.textContent = JSON.stringify({ imports });
    document.head.appendChild(map);
  }

  // These helpers also cover imports made later by buttons or timers.
  globalThis.__tutorialImport = async (specifier, parentUrl, options) => {
    const url = resolve(specifier, parentUrl);
    registerGraph(url);
    return import(url, options);
  };
  globalThis.__tutorialMeta = url => {
    if (!metadata.has(url)) {
      metadata.set(url, Object.assign(Object.create(null), {
        url, resolve: specifier => resolve(specifier, url)
      }));
    }
    return metadata.get(url);
  };
  function format(value, seen = new WeakSet()) {
    if (value === null) return 'null';
    if (typeof value !== 'object') return String(value);
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    if (Array.isArray(value)) return `[${value.map(v => format(v, seen)).join(', ')}]`;
    return `{ ${Object.entries(value).map(([k, v]) => `${k}: ${format(v, seen)}`).join(', ')} }`;
  }
  for (const level of ['log', 'error', 'warn', 'info', 'debug']) {
    console[level] = (...args) => post('log', { text: args.map(v => format(v)).join(' '), level });
  }
  window.addEventListener('error', event => console.error(event.message));
  window.addEventListener('unhandledrejection', event => console.error(event.reason));
  window.addEventListener('message', async event => {
    if (event.source !== parent || event.data?.type !== 'run' || files) return;
    try {
      const candidate = event.data.files;
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) ||
          typeof candidate['main.js']?.source !== 'string' ||
          Object.entries(candidate).some(([name, file]) =>
            !/^(?:[\w-]+\/)*[\w-][\w.-]*\.js$/.test(name) ||
            !file || typeof file.source !== 'string' || !Array.isArray(file.imports))) {
        throw new Error('Expected JavaScript files including main.js');
      }
      if (Object.values(candidate).reduce((size, file) => size + new TextEncoder().encode(file.source).length, 0) > 1024 * 1024) {
        throw new Error('Files are too large');
      }
      files = candidate;
      await globalThis.__tutorialImport('./main.js', base.href);
    } catch (error) {
      console.error(error);
    } finally {
      post('done');
    }
  });
  window.addEventListener('load', () => post('ready'), { once: true });
})();
