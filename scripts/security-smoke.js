// Zero-dependency security smoke test. Boots the real server on an ephemeral port with
// an isolated temp data dir, then asserts the hardening in server.js actually holds.
// Run: node scripts/security-smoke.js   (also runs in CI)
import { spawn } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Raw HTTP request so we control the Host header exactly — fetch()/undici treats Host as a
// forbidden header and rewrites it, which would silently defeat the DNS-rebinding test.
function rawGet(port, pathname, hostHeader) {
  return new Promise((resolve, reject) => {
    const sock = net.connect(port, '127.0.0.1', () => {
      sock.write(`GET ${pathname} HTTP/1.1\r\nHost: ${hostHeader}\r\nConnection: close\r\n\r\n`);
    });
    let buf = '';
    sock.on('data', (d) => { buf += d; });
    sock.on('end', () => {
      const m = buf.match(/^HTTP\/1\.\d (\d{3})/);
      resolve(m ? Number(m[1]) : 0);
    });
    sock.on('error', reject);
    setTimeout(() => { sock.destroy(); reject(new Error('rawGet timeout')); }, 3000);
  });
}

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'irkit-sec-'));
const results = [];
const ok = (name, cond, detail = '') => { results.push({ name, pass: !!cond, detail }); };

// PORT=0 → OS assigns a free port; server prints it. Isolated data dir → never touches real data.
const srv = spawn('node', ['server.js'], {
  cwd: ROOT,
  env: { ...process.env, PORT: '0', HOST: '127.0.0.1', IRKIT_DATA_DIR: path.join(tmp, 'data'), IRKIT_ROOT: tmp },
  stdio: ['ignore', 'pipe', 'inherit'],
});

const port = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('server did not start in 5s')), 5000);
  srv.stdout.on('data', (b) => {
    const m = String(b).match(/:(\d+) \(data:/);
    if (m) { clearTimeout(timer); resolve(Number(m[1])); }
  });
});
const base = `http://127.0.0.1:${port}`;

try {
  // 1. health works with a correct loopback Host
  const health = await fetch(`${base}/api/health`);
  ok('health 200 on loopback host', health.status === 200);

  // 2. security headers present on every response
  ok('X-Content-Type-Options: nosniff', health.headers.get('x-content-type-options') === 'nosniff');
  ok('X-Frame-Options: DENY', health.headers.get('x-frame-options') === 'DENY');
  ok('CSP frame-ancestors none', (health.headers.get('content-security-policy') || '').includes("frame-ancestors 'none'"));

  // 3. anti DNS-rebinding: foreign Host header is rejected (raw socket — see rawGet)
  ok('foreign Host → 403 (DNS-rebinding guard)', await rawGet(port, '/api/company', 'evil.example.com') === 403);

  // 4. wrong port in an otherwise-loopback Host is rejected
  ok('loopback name, wrong port → 403', await rawGet(port, '/api/company', '127.0.0.1:1') === 403);

  // 4b. correct loopback host via raw socket still works (guard isn't over-blocking)
  ok('correct loopback host → 200 (raw)', await rawGet(port, '/api/health', `127.0.0.1:${port}`) === 200);

  // 5. path traversal blocked (encoded and raw)
  for (const p of ['/../../etc/passwd', '/%2e%2e/%2e%2e/etc/passwd', '/..%2f..%2fserver.js']) {
    const r = await fetch(base + p);
    ok(`traversal blocked: ${p}`, r.status === 403 || r.status === 404);
  }

  // 6. malformed percent-encoding → 400, server stays up
  const bad = await fetch(`${base}/%zz`);
  ok('malformed %-encoding → 400 (no crash)', bad.status === 400);

  // 7. sibling-prefix bypass (public-evil) cannot escape the public dir
  const sibling = await fetch(`${base}/../public-evil/x`);
  ok('sibling-prefix escape blocked', sibling.status === 403 || sibling.status === 404);

  // 8. oversized PUT body is refused (>5MB cap in handleApi)
  let oversizeRejected = false;
  try {
    const r = await fetch(`${base}/api/company`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: 'x'.repeat(6_000_000) });
    oversizeRejected = !r.ok;
  } catch { oversizeRejected = true; } // destroyed socket also counts
  ok('oversized PUT refused', oversizeRejected);

  // 9. server still alive after all the abuse
  const alive = await fetch(`${base}/api/health`);
  ok('server still alive after malformed traffic', alive.status === 200);

  // 10. invalid JSON PUT → 400 (not a write)
  const badJson = await fetch(`${base}/api/company`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: '{not json' });
  ok('invalid JSON PUT → 400', badJson.status === 400);
} finally {
  srv.kill();
  fs.rmSync(tmp, { recursive: true, force: true });
}

const failed = results.filter((r) => !r.pass);
for (const r of results) console.log(`${r.pass ? '✓' : '✗'} ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
if (failed.length) { console.error(`\n✗ security smoke FAILED — ${failed.length}/${results.length}`); process.exit(1); }
console.log(`\n✓ security smoke ok — ${results.length} checks`);
