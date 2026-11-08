(() => {
  const post = (type, data = {}) => parent.postMessage({ type, ...data }, '*');
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
  import(new URL('main.js', location.href).href)
    .then(() => post('done'))
    .catch(error => { console.error(error); post('done'); });
})();
