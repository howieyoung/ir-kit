#!/usr/bin/env node
// IR Kit server — zero dependencies, Node 18+.
// Serves the web app from /public and persists collections as JSON files in /data.
// Usage: node server.js   (PORT and HOST env vars optional; defaults 4820 / 127.0.0.1)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const PORT = parseInt(process.env.PORT || '4820', 10);
// Bind to localhost by default: IR data is sensitive. Set HOST=0.0.0.0 to expose (e.g. in a container).
const HOST = process.env.HOST || '127.0.0.1';

const COLLECTIONS = ['company', 'captable', 'financials', 'crm', 'updates', 'checklists'];
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
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
  let rel = decodeURIComponent(urlPath);
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, 'forbidden', 'text/plain');
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'not found', 'text/plain');
    send(res, 200, buf, MIME[path.extname(file)] || 'application/octet-stream');
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/health') return send(res, 200, JSON.stringify({ ok: true, mode: 'server' }));
  const apiMatch = url.pathname.match(/^\/api\/([a-z]+)$/);
  if (apiMatch) return handleApi(req, res, apiMatch[1]);
  handleStatic(req, res, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`IR Kit running at http://${HOST}:${PORT} (data: ${DATA_DIR})`);
});
