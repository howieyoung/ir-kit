// The manual-track coach. A live "Your setup" checklist and small teaching callouts
// that turn the dashboard into an onboarding guide for founders new to investor relations.
// It holds NO state of its own: every step is derived by comparing the live store against
// the bundled sample (seed), so a step lights up the moment real data replaces the sample.
import { el } from './ui.js';
import { store } from './store.js';
import { seed, seedFor } from './seed.js';
import { LOCALES } from './i18n.js';
import { t } from './i18n.js';

const j = (v) => JSON.stringify(v ?? null);

// Has a collection diverged from the bundled sample? (i.e. the founder entered real data)
// The sample may have been seeded in ANY locale (seedFor at seed/reset time), so a step
// counts as "changed" only when the live data differs from EVERY locale's sample.
const SEED_VARIANTS = Object.keys(LOCALES).map((loc) => seedFor(loc));
function changed(name, pick) {
  const live = j(pick(store.get(name) || {}));
  return SEED_VARIANTS.every((v) => live !== j(pick(v[name] || {})));
}

// The setup journey, from download to IR master. Each step reports done/undone from real data.
export function onboardingSteps() {
  const company = store.get('company') || {};
  const fin = store.get('financials') || { months: [] };
  const cap = store.get('captable') || { stakeholders: [], safes: [] };
  const crm = store.get('crm') || { investors: [], distribution: [] };
  const updates = store.get('updates') || { archive: [] };

  const months = fin.months || [];
  const holders = cap.stakeholders || [];
  const safes = cap.safes || [];
  const signedSafes = safes.filter((s) => s.principal);
  const investors = crm.investors || [];
  const dist = crm.distribution || [];
  const realDist = dist.filter((r) => !r.sourced); // sourced prospects aren't "your investors" yet
  const archived = (updates.archive || []).length;

  // A step is done only when the founder has entered their OWN data: it must both
  // diverge from the bundled sample AND actually contain something — emptying the
  // sample is not "done". Sourced prospects don't count as setting up investors.
  const profileDone = !!(company.name && company.email) && changed('company', (c) => ({ name: c.name, founder: c.founder, email: c.email, roundTarget: c.roundTarget }));
  const finDone = months.length > 0 && changed('financials', (f) => f.months);
  const capDone = (holders.length > 0 || safes.length > 0) && changed('captable', (c) => ({ s: c.stakeholders, f: c.safes }));
  const crmDone = (investors.length > 0 || realDist.length > 0) && changed('crm', (c) => ({ i: c.investors, d: (c.distribution || []).filter((r) => !r.sourced) }));
  const updateDone = archived > ((seed.updates?.archive || []).length);
  const liveDone = company.sample !== true; // off, false, or absent (imported real data) all count as live

  return [
    { key: 'profile', label: t('setup.profile.label'), done: profileDone, href: '#/settings', cta: t('setup.profile.cta'),
      detail: profileDone ? t('setup.profile.done') : t('setup.profile.todo') },
    { key: 'financials', label: t('setup.financials.label'), done: finDone, href: '#/financials', cta: t('setup.financials.cta'),
      detail: finDone ? t('setup.financials.done', { n: months.length }) : t('setup.financials.todo') },
    { key: 'captable', label: t('setup.captable.label'), done: capDone, href: '#/captable', cta: t('setup.captable.cta'),
      detail: capDone ? t('setup.captable.done', { h: holders.length, s: signedSafes.length }) : t('setup.captable.todo') },
    { key: 'crm', label: t('setup.crm.label'), done: crmDone, href: '#/crm', cta: t('setup.crm.cta'),
      detail: crmDone ? t('setup.crm.done', { n: realDist.length }) : t('setup.crm.todo') },
    { key: 'update', label: t('setup.update.label'), done: updateDone, href: '#/updates', cta: t('setup.update.cta'),
      detail: updateDone ? t('setup.update.done') : t('setup.update.todo') },
    { key: 'live', label: t('setup.live.label'), done: liveDone, href: '#/settings', cta: t('setup.live.cta'),
      detail: liveDone ? t('setup.live.done') : t('setup.live.todo') },
  ];
}

// The full "Your setup" card — leads the Get started page.
export function renderSetupProgress() {
  const steps = onboardingSteps();
  const done = steps.filter((s) => s.done).length;
  const total = steps.length;
  const allDone = done === total;

  const box = el('div', { class: 'section setup-card' });
  box.append(el('div', { class: 'setup-head' },
    el('h2', {}, allDone ? t('setup.allDoneTitle') : t('setup.title')),
    el('span', { class: 'setup-count' }, `${done} / ${total}`)));
  box.append(el('div', { class: 'progress' }, el('div', { style: `width:${Math.round((done / total) * 100)}%` })));

  if (allDone) {
    box.append(el('p', { class: 'muted', style: 'margin:12px 0 0' },
      t('setup.allDoneBody'),
      el('a', { href: '#/dashboard' }, t('setup.goDashboard'))));
    return box;
  }

  const list = el('div', { class: 'setup-steps' });
  for (const s of steps) {
    list.append(el('a', { class: 'setup-step' + (s.done ? ' done' : ''), href: s.href },
      el('span', { class: 'setup-mark' }, s.done ? '✓' : '○'),
      el('span', { class: 'setup-text' },
        el('span', { class: 'setup-label' }, s.label),
        el('span', { class: 'setup-detail' }, s.detail)),
      s.done ? el('span', { class: 'setup-done-tag' }, t('setup.doneTag')) : el('span', { class: 'setup-cta' }, s.cta + ' →')));
  }
  box.append(list);
  box.append(el('p', { class: 'muted', style: 'margin:12px 2px 0;font-size:12px' },
    t('setup.handoff'),
    el('a', { href: '#/guide' }, t('setup.handoffLink')), '.'));
  return box;
}

// Compact one-line nudge for the Dashboard: the next thing to do. Null once setup is complete.
export function renderSetupNudge() {
  const steps = onboardingSteps();
  const next = steps.find((s) => !s.done);
  if (!next) return null;
  const done = steps.filter((s) => s.done).length;
  return el('a', { class: 'setup-nudge', href: next.href },
    el('span', { class: 'setup-nudge-badge' }, t('setup.nudgeBadge', { done, total: steps.length })),
    el('span', { class: 'setup-nudge-body' }, el('b', {}, t('setup.nudgeNext', { label: next.label })), ' — ', next.detail),
    el('span', { class: 'setup-nudge-cta' }, next.cta + ' →'));
}

// A short teaching callout for a data page, shown while the founder is still on sample data.
const COACH_KEYS = { financials: 'coach.financials', captable: 'coach.captable', crm: 'coach.crm', updates: 'coach.updates' };

export function pageCoach(pageKey) {
  const company = store.get('company') || {};
  if (!company.sample) return null; // teaching mode only while the sample data is still loaded
  const key = COACH_KEYS[pageKey];
  if (!key) return null;
  const text = t(key);
  return el('div', { class: 'callout coach' },
    el('span', { class: 'coach-tag' }, t('coach.tag')),
    el('span', { class: 'coach-body' }, text, ' ',
      el('a', { href: '#/guide' }, t('coach.link'))));
}
