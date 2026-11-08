const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const PORT = Number(process.env.PORT || 3000);
const MIME_TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.yaml': 'text/plain; charset=utf-8', '.ttf': 'font/ttf' };
const VENDOR_ROOTS = {
  monaco: path.join(__dirname, 'node_modules', 'monaco-editor', 'min'),
  'es-module-lexer': path.join(__dirname, 'node_modules', 'es-module-lexer', 'dist'),
  yaml: path.join(__dirname, 'node_modules', 'yaml', 'browser'),
  'markdown-it': path.join(__dirname, 'node_modules', 'markdown-it', 'dist', 'browser'),
};
function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return send(res, 400, 'Invalid URL'); }
  if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, 'Method not allowed');
  let file;
  if (['/', '/index.html', '/app.js', '/module-files.js', '/runner.js', '/runner.html', '/styles.css', '/preview.css'].includes(pathname)) {
    file = path.join(__dirname, pathname === '/' ? 'index.html' : pathname.slice(1));
  } else if (/^\/lessons\/(?:index\.(?:js|json)|loader\.js|[a-z0-9-]+\/(?:checks\.js|lesson\.yaml|instructions\.md|starter\/(?:[\w-]+\/)*[\w-][\w.-]*\.js))$/.test(pathname)) {
    file = path.join(__dirname, pathname.slice(1));
  } else if (pathname.startsWith('/vendor/')) {
    const [, , vendor, ...parts] = pathname.split('/');
    if (!Object.hasOwn(VENDOR_ROOTS, vendor)) return send(res, 404, 'Not found');
    const root = VENDOR_ROOTS[vendor];
    file = path.resolve(root, parts.join('/'));
    if (!file.startsWith(root + path.sep)) return send(res, 403, 'Forbidden');
  } else return send(res, 404, 'Not found');
  fs.readFile(file, (err, content) => {
    if (err) return send(res, err.code === 'ENOENT' ? 404 : 500, 'Unable to load asset');
    send(res, 200, req.method === 'HEAD' ? undefined : content, MIME_TYPES[path.extname(file)] || 'application/octet-stream');
  });
});
server.listen(PORT, () => console.log(`Tutorial running at http://localhost:${server.address().port}/`));
server.on('error', err => {
  console.error(err.code === 'EADDRINUSE' ? `Port ${PORT} is already in use. Set PORT to use another port.` : err.message);
  process.exitCode = 1;
});
