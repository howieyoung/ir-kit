// The Get-started guide: human track, agent track, and a founder's glossary.
// docs/TUTORIAL.md is generated from these exports (npm run build-tutorial) — edit here, then regenerate.
import { el, tabs } from './ui.js';
import { markdown } from './playbooks.js';
import { guideContent } from './content.js';
import { renderSetupProgress } from './onboarding.js';
import { t } from './i18n.js';

export function renderGuide(root) {
  root.append(el('h1', {}, t('guide.title')));
  root.append(el('p', { class: 'page-sub' }, t('guide.sub')));
  root.append(renderSetupProgress());
  const c = guideContent();
  root.append(tabs([
    { label: t('guide.tab.agent'), render: () => doc(c.GUIDE_AGENT, 'guide-agent') },
    { label: t('guide.tab.human'), render: () => doc(c.GUIDE_HUMAN, 'guide-human') },
    { label: t('guide.tab.cap101'), render: () => doc(c.CAPTABLE_101, 'guide-cap101') },
    { label: t('guide.tab.glossary'), render: () => doc(c.GLOSSARY, 'guide-glossary') },
  ]));
}

function doc(md, id) {
  const box = el('div', { class: 'section doc' });
  box.append(...markdown(md, id));
  return box;
}

