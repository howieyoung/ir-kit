// Long-form content loader — guide tabs + playbooks, per locale.
// English is bundled (canonical); other locales load on demand from
// content/guide.<locale>.js and content/playbooks.<locale>.js and fall back to
// English if a translation module is missing or fails to load.
// Translations must mirror the English structure exactly (same exports, same DOCS
// ids/order, same checkbox counts) — scripts/check-i18n.js enforces this in CI.
import { getLocale } from './i18n.js';
import * as guideEn from './content/guide.en.js';
import * as playbooksEn from './content/playbooks.en.js';

let cache = { locale: 'en', guide: guideEn, playbooks: playbooksEn };

export async function loadContent() {
  const loc = getLocale();
  if (cache.locale === loc) return;
  if (loc === 'en') { cache = { locale: 'en', guide: guideEn, playbooks: playbooksEn }; return; }
  const [guide, playbooks] = await Promise.all([
    import(`./content/guide.${loc}.js`).catch(() => guideEn),
    import(`./content/playbooks.${loc}.js`).catch(() => playbooksEn),
  ]);
  cache = { locale: loc, guide, playbooks };
}

export const guideContent = () => cache.guide;
export const playbookDocs = () => cache.playbooks.DOCS;
