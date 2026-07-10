// Locale engine. UI chrome goes through t(); keys live in i18n-messages.js and MUST
// exist in ALL locales (scripts/check-i18n.js enforces parity in CI — see CONTRIBUTING.md).
// Long-form content (playbooks, guide bodies) is English-first for now and falls back
// gracefully; translations are welcome via the same message files.
import { MESSAGES } from './i18n-messages.js';

export const LOCALES = { en: 'English', 'zh-TW': '繁體中文', ja: '日本語', ko: '한국어', es: 'Español', fr: 'Français' };
const KEY = 'irkit:locale';

function detect() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && MESSAGES[saved]) return saved;
    const nav = navigator.language || 'en';
    if (nav.toLowerCase().startsWith('zh')) return 'zh-TW';
    const short = nav.slice(0, 2);
    return MESSAGES[short] ? short : 'en';
  } catch { return 'en'; }
}

let current = detect();
try { document.documentElement.lang = current; } catch { /* non-browser */ }

export const getLocale = () => current;

export function setLocale(l) {
  if (!MESSAGES[l]) return;
  current = l;
  try { localStorage.setItem(KEY, l); document.documentElement.lang = l; } catch { /* non-browser */ }
}

export function t(key, vars) {
  let s = MESSAGES[current]?.[key] ?? MESSAGES.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}
