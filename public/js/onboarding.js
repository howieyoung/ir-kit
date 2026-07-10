// The manual-track coach. A live "Your setup" checklist and small teaching callouts
// that turn the dashboard into an onboarding guide for founders new to investor relations.
// It holds NO state of its own: every step is derived by comparing the live store against
// the bundled sample (seed), so a step lights up the moment real data replaces the sample.
import { el } from './ui.js';
import { store } from './store.js';
import { seed } from './seed.js';

const j = (v) => JSON.stringify(v ?? null);

// Has a collection diverged from the bundled sample? (i.e. the founder entered real data)
function changed(name, pick) {
  return j(pick(store.get(name) || {})) !== j(pick(seed[name] || {}));
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
    { key: 'profile', label: 'Make it yours', done: profileDone, href: '#/settings', cta: 'Open Settings',
      detail: profileDone ? 'Company profile set' : 'Company name, founder, email, and your round target' },
    { key: 'financials', label: 'Enter your financials', done: finDone, href: '#/financials', cta: 'Add months',
      detail: finDone ? `${months.length} month${months.length === 1 ? '' : 's'} of actuals` : 'Opening cash + one row per month — the source of every dashboard number' },
    { key: 'captable', label: 'Enter your cap table', done: capDone, href: '#/captable', cta: 'Add holders',
      detail: capDone ? `${holders.length} holders · ${signedSafes.length} SAFE${signedSafes.length === 1 ? '' : 's'}` : 'Founder shares, option pool, every signed SAFE — from the docs, not memory' },
    { key: 'crm', label: 'Set up your investors', done: crmDone, href: '#/crm', cta: 'Open CRM',
      detail: crmDone ? `${realDist.length} on the update list` : 'Current investors + everyone who should receive your updates' },
    { key: 'update', label: 'Send your first update', done: updateDone, href: '#/updates', cta: 'Compose',
      detail: updateDone ? 'First update archived — the streak is live 🔥' : 'The composer pre-fills your real metrics; you write the story' },
    { key: 'live', label: 'Go live', done: liveDone, href: '#/settings', cta: 'Settings',
      detail: liveDone ? 'Sample flag off — this is your company' : 'Once the numbers are real, switch off the sample flag' },
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
    el('h2', {}, allDone ? 'You’re all set up 🎉' : 'Your setup'),
    el('span', { class: 'setup-count' }, `${done} / ${total}`)));
  box.append(el('div', { class: 'progress' }, el('div', { style: `width:${Math.round((done / total) * 100)}%` })));

  if (allDone) {
    box.append(el('p', { class: 'muted', style: 'margin:12px 0 0' },
      'Every step is done. From here it’s the monthly rhythm — close the month, check the dashboard, send the update. ',
      el('a', { href: '#/dashboard' }, 'Go to the dashboard →')));
    return box;
  }

  const list = el('div', { class: 'setup-steps' });
  for (const s of steps) {
    list.append(el('a', { class: 'setup-step' + (s.done ? ' done' : ''), href: s.href },
      el('span', { class: 'setup-mark' }, s.done ? '✓' : '○'),
      el('span', { class: 'setup-text' },
        el('span', { class: 'setup-label' }, s.label),
        el('span', { class: 'setup-detail' }, s.detail)),
      s.done ? el('span', { class: 'setup-done-tag' }, 'done') : el('span', { class: 'setup-cta' }, s.cta + ' →')));
  }
  box.append(list);
  box.append(el('p', { class: 'muted', style: 'margin:12px 2px 0;font-size:12px' },
    'Prefer to hand this off? A coding agent can populate it all from your real documents — see ',
    el('a', { href: '#/guide' }, 'Use it with your agent'), '.'));
  return box;
}

// Compact one-line nudge for the Dashboard: the next thing to do. Null once setup is complete.
export function renderSetupNudge() {
  const steps = onboardingSteps();
  const next = steps.find((s) => !s.done);
  if (!next) return null;
  const done = steps.filter((s) => s.done).length;
  return el('a', { class: 'setup-nudge', href: next.href },
    el('span', { class: 'setup-nudge-badge' }, `Setup ${done}/${steps.length}`),
    el('span', { class: 'setup-nudge-body' }, el('b', {}, `Next: ${next.label}`), ' — ', next.detail),
    el('span', { class: 'setup-nudge-cta' }, next.cta + ' →'));
}

// A short teaching callout for a data page, shown while the founder is still on sample data.
const COACH = {
  financials: 'This is the single source of truth — every number an investor sees derives from here. Enter opening cash, then one row per month. Missing a value? Leave it blank; never guess.',
  captable: 'Your cap table is who owns what, counted in shares. Enter founder shares, the option pool, and every signed SAFE from the executed PDFs. New to SAFEs and dilution? Read Cap table 101 first.',
  crm: 'Your current investors and everyone who should receive updates. Looking for new investors to add? Your agent can source fitted ones and draft the outreach — see the agent guide.',
  updates: 'The monthly update is the single habit that most raises your odds of closing the next round. The composer fills your real metrics automatically — you just write the story.',
};

export function pageCoach(pageKey) {
  const company = store.get('company') || {};
  if (!company.sample) return null; // teaching mode only while the sample data is still loaded
  const text = COACH[pageKey];
  if (!text) return null;
  return el('div', { class: 'callout coach' },
    el('span', { class: 'coach-tag' }, 'New to this?'),
    el('span', { class: 'coach-body' }, text, ' ',
      el('a', { href: '#/guide' }, 'Open the Get started guide →')));
}
