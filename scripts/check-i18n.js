// Locale parity gate — every key in the canonical (en) dictionary must exist in every
// locale, and no locale may carry unknown keys. Runs in CI; exit 1 on any gap.
// This is what guarantees contributors (and their agents) ship full language coverage.
import { MESSAGES } from '../public/js/i18n-messages.js';

const base = Object.keys(MESSAGES.en).sort();
let failed = false;

for (const [locale, dict] of Object.entries(MESSAGES)) {
  if (locale === 'en') continue;
  const keys = new Set(Object.keys(dict));
  const missing = base.filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !base.includes(k));
  const empty = base.filter((k) => keys.has(k) && !String(dict[k]).trim());
  for (const k of missing) { console.error(`✗ ${locale}: missing key "${k}"`); failed = true; }
  for (const k of extra) { console.error(`✗ ${locale}: unknown key "${k}" (not in en)`); failed = true; }
  for (const k of empty) { console.error(`✗ ${locale}: empty translation for "${k}"`); failed = true; }
}

const locales = Object.keys(MESSAGES);
const REQUIRED = ['en', 'zh-TW', 'ja', 'ko', 'es', 'fr'];
for (const r of REQUIRED) if (!locales.includes(r)) { console.error(`✗ required locale "${r}" is missing entirely`); failed = true; }

// ---- long-form content parity (guide tabs + playbooks per locale) ----
// Structure must mirror English exactly: same exports, same DOCS ids/order, and the
// same number of checkboxes per playbook doc (checklist state is keyed docId:index).
const guideEn = await import('../public/js/content/guide.en.js');
const pbEn = await import('../public/js/content/playbooks.en.js');
const GUIDE_EXPORTS = ['GUIDE_AGENT', 'GUIDE_HUMAN', 'CAPTABLE_101', 'GLOSSARY'];
const boxes = (md) => (md.match(/^\s*- \[( |x)\]/gim) || []).length;

for (const loc of REQUIRED.filter((l) => l !== 'en')) {
  let g, p;
  try { g = await import(`../public/js/content/guide.${loc}.js`); }
  catch { console.error(`✗ content: missing public/js/content/guide.${loc}.js`); failed = true; }
  try { p = await import(`../public/js/content/playbooks.${loc}.js`); }
  catch { console.error(`✗ content: missing public/js/content/playbooks.${loc}.js`); failed = true; }
  if (g) for (const k of GUIDE_EXPORTS) {
    if (!g[k] || !String(g[k]).trim()) { console.error(`✗ content ${loc}: guide export "${k}" missing/empty`); failed = true; }
  }
  if (p) {
    const enIds = pbEn.DOCS.map((d) => d.id);
    const locIds = (p.DOCS || []).map((d) => d.id);
    if (JSON.stringify(enIds) !== JSON.stringify(locIds)) {
      console.error(`✗ content ${loc}: playbook DOCS ids/order differ from en (${locIds.join(',')} vs ${enIds.join(',')})`); failed = true;
    } else {
      for (const d of pbEn.DOCS) {
        const ld = p.DOCS.find((x) => x.id === d.id);
        if (!ld.md?.trim()) { console.error(`✗ content ${loc}: playbook "${d.id}" empty`); failed = true; }
        else if (boxes(ld.md) !== boxes(d.md)) {
          console.error(`✗ content ${loc}: playbook "${d.id}" has ${boxes(ld.md)} checkboxes, en has ${boxes(d.md)} — counts must match (checklist state is index-keyed)`); failed = true;
        }
      }
    }
  }
}

if (failed) {
  console.error('\ni18n parity FAILED — UI keys AND long-form content must be complete in all locales: ' + REQUIRED.join(', '));
  process.exit(1);
}
console.log(`✓ i18n parity ok — ${base.length} keys × ${locales.length} locales · guide + playbooks content complete in ${REQUIRED.length} locales`);
