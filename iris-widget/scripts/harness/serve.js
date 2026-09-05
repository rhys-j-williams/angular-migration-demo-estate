#!/usr/bin/env node
/* eslint-disable */
/**
 * Static server that lays dist/iris-widget out the way retail-web's ingress does:
 *
 *   /                          -> scripts/harness/index.html
 *   /assets/widgets/<file>     -> dist/iris-widget/<file>
 *
 * Port 4205 (our allocation in PORTS.md, shared with `ng serve`; do not run both).
 * `node scripts/harness/serve.js` and open it, or let check-mount.js drive it.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.IRIS_HARNESS_PORT || 4205);
const dist = path.resolve(__dirname, '..', '..', 'dist', 'iris-widget');
const page = path.join(__dirname, 'index.html');

const types = { '.js': 'application/javascript', '.svg': 'image/svg+xml', '.html': 'text/html', '.json': 'application/json', '.css': 'text/css' };

function serve(res, file) {
  fs.readFile(file, (err, body) => {
    if (err) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found: ' + file);
      return;
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  });
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/' || url === '/index.html') return serve(res, page);
  if (url.startsWith('/assets/widgets/')) {
    const rel = path.normalize(url.slice('/assets/widgets/'.length));
    if (rel.startsWith('..')) {
      res.writeHead(400);
      return res.end();
    }
    return serve(res, path.join(dist, rel));
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[harness] http://localhost:${PORT}/  (dist: ${dist})`);
});

module.exports = server;
