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

if (failed) {
  console.error('\ni18n parity FAILED — every UI string key must exist (non-empty) in all locales: ' + REQUIRED.join(', '));
  process.exit(1);
}
console.log(`✓ i18n parity ok — ${base.length} keys × ${locales.length} locales`);
