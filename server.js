#!/usr/bin/env node
// IR Kit server — zero dependencies, Node 18+.
// Serves the web app from /public and persists collections as JSON files in /data.
// Usage: node server.js   (PORT and HOST env vars optional; defaults 2330 / 127.0.0.1)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
// Default port 2330 — a small tribute to TSMC's ticker. Override with PORT=….
const PORT = parseInt(process.env.PORT || '2330', 10);
// Bind to localhost by default: IR data is sensitive. Set HOST=0.0.0.0 to expose (e.g. in a container).
const HOST = process.env.HOST || '127.0.0.1';

const COLLECTIONS = ['company', 'captable', 'financials', 'crm', 'updates', 'checklists'];
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
};

// Defense-in-depth headers on every response. CSP: everything self-hosted (ESM, css,
// data-URI favicon); style attributes need 'unsafe-inline'; no page may frame us.
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'",
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', ...SECURITY_HEADERS });
  res.end(body);
}

// Anti DNS-rebinding: when bound to loopback (the default), only honor requests whose
// Host header is a loopback name on our actual port. A malicious website that rebinds
// its domain to 127.0.0.1 sends its own domain in Host — and gets a 403 instead of the
// founder's cap table. Skipped when HOST is set non-loopback (container behind a proxy;
// that deployment's protection is the authenticating proxy per SECURITY.md).
const LOOPBACK_BIND = ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(HOST);
let boundPort = PORT; // updated from server.address() once listening (supports PORT=0)
function isAllowedHost(host) {
  const m = String(host || '').match(/^(\[[^\]]+\]|[^:]+?)(?::(\d+))?$/);
  if (!m) return false;
  const name = m[1].toLowerCase();
  const okName = name === '127.0.0.1' || name === 'localhost' || name === '[::1]';
  return okName && (m[2] === undefined || Number(m[2]) === boundPort);
}

function handleApi(req, res, name) {
  if (!COLLECTIONS.includes(name)) return send(res, 404, JSON.stringify({ error: 'unknown collection' }));
  const file = path.join(DATA_DIR, name + '.json');
  if (req.method === 'GET') {
    fs.readFile(file, 'utf8', (err, txt) => {
      if (err) return send(res, 404, JSON.stringify({ error: 'not found' }));
      send(res, 200, txt);
    });
    return;
  }
  if (req.method === 'PUT') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 5e6) req.destroy(); });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body); // validate before writing
        // Write atomically: temp file then rename, so a crash never corrupts data.
        const tmp = file + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(parsed, null, 2));
        fs.renameSync(tmp, file);
        send(res, 200, JSON.stringify({ ok: true }));
      } catch (e) {
        send(res, 400, JSON.stringify({ error: 'invalid JSON: ' + e.message }));
      }
    });
    return;
  }
  send(res, 405, JSON.stringify({ error: 'method not allowed' }));
}

function handleStatic(req, res, urlPath) {
  let rel;
  try { rel = decodeURIComponent(urlPath); } catch { return send(res, 400, 'bad request', 'text/plain'); }
  if (rel.includes('\0')) return send(res, 400, 'bad request', 'text/plain');
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  // Strict prefix: PUBLIC_DIR + separator, so a sibling like <root>/public-evil can't match.
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, 'forbidden', 'text/plain');
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'not found', 'text/plain');
    send(res, 200, buf, MIME[path.extname(file)] || 'application/octet-stream');
  });
}

const server = http.createServer((req, res) => {
  try {
    if (LOOPBACK_BIND && !isAllowedHost(req.headers.host)) {
      return send(res, 403, JSON.stringify({ error: 'forbidden host' }));
    }
    // Parse against a fixed base so a malformed Host header can never throw here.
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname === '/api/health') return send(res, 200, JSON.stringify({ ok: true, mode: 'server' }));
    const apiMatch = url.pathname.match(/^\/api\/([a-z]+)$/);
    if (apiMatch) return handleApi(req, res, apiMatch[1]);
    handleStatic(req, res, url.pathname);
  } catch {
    // One malformed request must never take the server down.
    try { send(res, 400, JSON.stringify({ error: 'bad request' })); } catch { /* socket gone */ }
  }
});

server.listen(PORT, HOST, () => {
  boundPort = server.address().port;
  console.log(`IR Kit running at http://${HOST}:${boundPort} (data: ${DATA_DIR})`);
});
