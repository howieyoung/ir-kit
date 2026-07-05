// Node-side data access — same JSON files, same seed fallback as the browser store.
// Override locations with IRKIT_DATA_DIR (collections) / IRKIT_ROOT (workspace parent).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seed } from '../public/js/seed.js';

const PKG_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = process.env.IRKIT_DATA_DIR
  ? path.resolve(process.env.IRKIT_DATA_DIR)
  : path.join(PKG_ROOT, 'data');
export const ROOT = process.env.IRKIT_ROOT ? path.resolve(process.env.IRKIT_ROOT) : path.dirname(DATA_DIR);
export const WORKSPACE = path.join(ROOT, 'ir-workspace');

export const COLLECTIONS = ['company', 'captable', 'financials', 'crm', 'updates', 'checklists'];

export function load(name) {
  const file = path.join(DATA_DIR, name + '.json');
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  return structuredClone(seed[name]);
}

export function save(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, name + '.json');
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

export function loadAll() {
  return Object.fromEntries(COLLECTIONS.map((n) => [n, load(n)]));
}

export const uid = () => Math.random().toString(36).slice(2, 10);
