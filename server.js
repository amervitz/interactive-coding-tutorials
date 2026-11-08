const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const PORT = Number(process.env.PORT || 3000);
const runs = new Map();
const MIME_TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.ttf': 'font/ttf' };
const runnerHtml = '<!doctype html><html><head><meta charset="utf-8"><style>body{font:14px system-ui;color:#d4d4d4;background:#1e1e1e}button{padding:8px 16px;margin:8px;cursor:pointer}</style></head><body><script src="/runner.js"></script></body></html>';
function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}
const server = http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return send(res, 400, 'Invalid URL'); }
  if (req.method === 'POST' && pathname === '/api/runs') {
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 1024 * 1024) return send(res, 413, 'Files are too large');
      }
      const { files } = JSON.parse(body);
      if (!files || typeof files !== 'object' || Array.isArray(files) || typeof files['main.js'] !== 'string' ||
          Object.entries(files).some(([name, code]) => !/^(?:[\w-]+\/)*[\w.-]+\.js$/.test(name) || typeof code !== 'string')) {
        return send(res, 400, 'Expected JavaScript files including main.js');
      }
      const id = randomUUID();
      if (runs.size >= 100) runs.delete(runs.keys().next().value);
      runs.set(id, files);
      return send(res, 201, JSON.stringify({ url: `/runs/${id}/` }), 'application/json');
    } catch { return send(res, 400, 'Invalid run request'); }
  }
  if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, 'Method not allowed');
  const run = pathname.match(/^\/runs\/([^/]+)\/(.*)$/);
  if (run) {
    const files = runs.get(run[1]);
    if (!files) return send(res, 404, 'Run expired. Run the code again.');
    if (!run[2]) return send(res, 200, runnerHtml, MIME_TYPES['.html']);
    if (!Object.hasOwn(files, run[2])) return send(res, 404, 'Module not found');
    return send(res, 200, files[run[2]], MIME_TYPES['.js']);
  }
  let file;
  if (['/', '/index.html', '/app.js', '/runner.js'].includes(pathname)) {
    file = path.join(__dirname, pathname === '/' ? 'index.html' : pathname.slice(1));
  } else if (pathname.startsWith('/vendor/monaco/')) {
    const root = path.join(__dirname, 'node_modules', 'monaco-editor', 'min');
    file = path.resolve(root, pathname.slice('/vendor/monaco/'.length));
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
