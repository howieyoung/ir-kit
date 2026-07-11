// Generates the GitHub tutorials from the in-app Guide content — one per locale:
//   docs/TUTORIAL.md            (English, canonical)
//   docs/i18n/TUTORIAL.<loc>.md (zh-TW, ja, ko, es, fr)
// Single source: public/js/content/guide.<locale>.js. Edit there, then:
//   npm run build-tutorial
// CI fails if these files are stale.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as en from '../public/js/content/guide.en.js';
import * as zhTW from '../public/js/content/guide.zh-TW.js';
import * as ja from '../public/js/content/guide.ja.js';
import * as ko from '../public/js/content/guide.ko.js';
import * as es from '../public/js/content/guide.es.js';
import * as fr from '../public/js/content/guide.fr.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const META = {
  en: { mod: en, file: 'docs/TUTORIAL.md', title: 'IR Kit tutorial',
    intro: 'The same guide that lives in the app (**Get started** in the sidebar), for reading on GitHub.',
    labels: ['the agent track', 'the human track', 'if SAFEs and dilution are new to you', ''] },
  'zh-TW': { mod: zhTW, file: 'docs/i18n/TUTORIAL.zh-TW.md', title: 'IR Kit 教學',
    intro: '與 app 內建指南（側欄的「開始使用」）相同的內容，GitHub 閱讀版。',
    labels: ['Agent 路線', '手動路線', '不熟 SAFE 與稀釋先讀這篇', ''] },
  ja: { mod: ja, file: 'docs/i18n/TUTORIAL.ja.md', title: 'IR Kit チュートリアル',
    intro: 'アプリ内ガイド（サイドバーの「はじめに」）と同じ内容の GitHub 閲覧版。',
    labels: ['エージェント編', '手動編', 'SAFEと希薄化が初めての方へ', ''] },
  ko: { mod: ko, file: 'docs/i18n/TUTORIAL.ko.md', title: 'IR Kit 튜토리얼',
    intro: '앱 내 가이드(사이드바의 "시작하기")와 같은 내용의 GitHub 열람판.',
    labels: ['에이전트 트랙', '수동 트랙', 'SAFE와 희석이 처음이라면', ''] },
  es: { mod: es, file: 'docs/i18n/TUTORIAL.es.md', title: 'Tutorial de IR Kit',
    intro: 'La misma guía que vive en la app (**Empezar** en la barra lateral), en versión GitHub.',
    labels: ['la vía del agente', 'la vía manual', 'si los SAFEs y la dilución son nuevos para ti', ''] },
  fr: { mod: fr, file: 'docs/i18n/TUTORIAL.fr.md', title: 'Tutoriel IR Kit',
    intro: 'Le même guide que dans l\'app (**Démarrer** dans la barre latérale), en version GitHub.',
    labels: ['la voie de l\'agent', 'la voie manuelle', 'si les SAFE et la dilution sont nouveaux pour vous', ''] },
};
const LANG_NAMES = { en: 'English', 'zh-TW': '繁體中文', ja: '日本語', ko: '한국어', es: 'Español', fr: 'Français' };

// Approximates GitHub's heading→anchor slugging: lowercase, strip punctuation, EACH
// whitespace becomes a hyphen (no collapsing — "A — B" yields a double hyphen).
const slug = (h) => h.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s/g, '-');
const h1 = (md) => md.split('\n')[0].replace(/^#\s*/, '');

for (const [loc, m] of Object.entries(META)) {
  const inI18n = loc !== 'en';
  const langBar = Object.keys(META).map((l) => {
    if (l === loc) return `**${LANG_NAMES[l]}**`;
    const target = l === 'en' ? (inI18n ? '../TUTORIAL.md' : 'TUTORIAL.md')
      : (inI18n ? `TUTORIAL.${l}.md` : `i18n/TUTORIAL.${l}.md`);
    return `[${LANG_NAMES[l]}](${target})`;
  }).join(' · ');

  const sections = [m.mod.GUIDE_AGENT, m.mod.GUIDE_HUMAN, m.mod.CAPTABLE_101, m.mod.GLOSSARY];
  const index = sections.map((md, i) => {
    const title = h1(md);
    const label = m.labels[i];
    return `- [${title}](#${slug(title)})${label ? ` — ${label}` : ''}`;
  }).join('\n');

  const out = `<!-- GENERATED from public/js/content/guide.${loc}.js — edit there, then \`npm run build-tutorial\` -->
# ${m.title}

${langBar}

${m.intro}

${index}

---

${sections.join('\n\n---\n\n')}
`;
  const file = path.join(ROOT, m.file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
  console.log('wrote', m.file);
}
