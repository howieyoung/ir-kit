// Aggregates the per-locale dictionaries in public/js/i18n/ — one file per locale for
// reviewability. EVERY key in en.js must exist, non-empty, in every locale
// (CI: scripts/check-i18n.js). Terminology rule (see CONTRIBUTING.md): specialized
// finance acronyms keep the English term first + a local gloss in parentheses,
// e.g. zh-TW "ARR（年化營收）", ja "ARR（年換算収益）", es "ARR (ingresos anualizados)".
import { en } from './i18n/en.js';
import { zhTW } from './i18n/zh-TW.js';
import { ja } from './i18n/ja.js';
import { ko } from './i18n/ko.js';
import { es } from './i18n/es.js';
import { fr } from './i18n/fr.js';

export const MESSAGES = { en, 'zh-TW': zhTW, ja, ko, es, fr };
