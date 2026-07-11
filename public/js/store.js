// Data store with dual persistence:
//  - server mode: GET/PUT /api/<collection> (JSON files in /data — editable by humans and agents alike)
//  - static mode: localStorage (public demo hosting; data never leaves the visitor's browser)
import { seedFor } from './seed.js';
import { getLocale } from './i18n.js';

export const COLLECTIONS = ['company', 'captable', 'financials', 'crm', 'updates', 'checklists'];
const LS_PREFIX = 'irkit:';

export const store = {
  mode: 'static',
  data: {},
  listeners: new Set(),
  saveTimers: {},

  async init() {
    try {
      const r = await fetch('/api/health');
      if (r.ok) this.mode = 'server';
    } catch { this.mode = 'static'; }
    for (const name of COLLECTIONS) {
      this.data[name] = await this.loadCollection(name);
    }
  },

  async loadCollection(name) {
    if (this.mode === 'server') {
      try {
        const r = await fetch('/api/' + name);
        if (r.ok) return await r.json();
      } catch { /* fall through to seed */ }
      return structuredClone(seedFor(getLocale())[name]);
    }
    const raw = localStorage.getItem(LS_PREFIX + name);
    if (raw) { try { return JSON.parse(raw); } catch { /* re-seed */ } }
    return structuredClone(seedFor(getLocale())[name]);
  },

  get(name) { return this.data[name]; },

  // Mutate a collection through a function, then persist (debounced) and notify views.
  update(name, mutator) {
    mutator(this.data[name]);
    this.persist(name);
    this.emit();
  },

  persist(name) {
    clearTimeout(this.saveTimers[name]);
    setStatus('saving');
    this.saveTimers[name] = setTimeout(async () => {
      try {
        if (this.mode === 'server') {
          const r = await fetch('/api/' + name, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.data[name]),
          });
          if (!r.ok) throw new Error('save failed');
        } else {
          localStorage.setItem(LS_PREFIX + name, JSON.stringify(this.data[name]));
        }
        setStatus('saved');
      } catch (e) {
        setStatus('error');
        console.error('persist', name, e);
      }
    }, 400);
  },

  onChange(fn) { this.listeners.add(fn); },
  emit() { for (const fn of this.listeners) fn(); },

  exportAll() {
    const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const co = (this.data.company?.name || 'company').toLowerCase().replace(/\W+/g, '-');
    a.download = `irkit-${co}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  },

  async importAll(file) {
    const parsed = JSON.parse(await file.text());
    for (const name of COLLECTIONS) {
      if (parsed[name] !== undefined) {
        this.data[name] = parsed[name];
        this.persist(name);
      }
    }
    this.emit();
  },

  resetToSeed() {
    for (const name of COLLECTIONS) {
      this.data[name] = structuredClone(seedFor(getLocale())[name]);
      this.persist(name);
    }
    this.emit();
  },
};

function setStatus(state) {
  const el = document.getElementById('save-status');
  if (!el) return;
  el.className = 'save-status ' + state;
  el.textContent = state === 'saving' ? 'Saving…' : state === 'saved' ? 'All changes saved' : 'Save failed — check server';
}

export const uid = () => Math.random().toString(36).slice(2, 10);
