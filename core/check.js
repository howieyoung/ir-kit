// `ir check` — the verification loop. Validates schema shape, value sanity, and
// cross-collection invariants. Errors = data an investor-facing number could be wrong about.
// Warnings = hygiene issues worth fixing. Agents: run this after ANY direct JSON edit.
import { loadAll } from './store.js';
import { capTotals, safeImpliedPct } from '../public/js/metrics.js';

const STAGES = ['Contacted', 'Meeting', 'Verbal', 'SAFE sent', 'Signed', 'Wired', 'Passed'];
const SEGMENTS = ['Board/Major', 'All investors', 'Prospect nurture'];
const YM = /^\d{4}-(0[1-9]|1[0-2])$/;

export function check() {
  const errors = [];
  const warnings = [];
  const E = (code, where, msg) => errors.push({ code, where, msg });
  const W = (code, where, msg) => warnings.push({ code, where, msg });

  let d;
  try {
    d = loadAll();
  } catch (e) {
    E('parse', 'data/', 'unreadable JSON: ' + e.message);
    return { ok: false, errors, warnings };
  }
  const { company, captable, financials, crm, updates } = d;

  // company
  if (!company?.name) W('company.name', 'company.json', 'company name is empty');
  if (company?.updateDay && (company.updateDay < 1 || company.updateDay > 28))
    E('company.updateDay', 'company.json', 'updateDay must be 1–28');

  // financials
  const months = financials?.months || [];
  const seen = new Set();
  months.forEach((m, i) => {
    const at = `financials.months[${i}]`;
    if (!YM.test(m.month || '')) E('fin.month-format', at, `month "${m.month}" is not YYYY-MM`);
    if (seen.has(m.month)) E('fin.month-dup', at, `duplicate month ${m.month}`);
    seen.add(m.month);
    for (const k of ['saas', 'ads', 'fde', 'otherRev', 'payroll', 'infra', 'other', 'inflow']) {
      if (m[k] !== null && m[k] !== undefined && typeof m[k] !== 'number')
        E('fin.not-number', `${at}.${k}`, `${k} must be a number or null`);
      if (typeof m[k] === 'number' && m[k] < 0 && k !== 'inflow')
        W('fin.negative', `${at}.${k}`, `${k} is negative — is that intended?`);
    }
  });
  const sorted = [...months].map((m) => m.month).sort();
  for (let i = 1; i < sorted.length; i++) {
    const [y, mo] = sorted[i - 1].split('-').map(Number);
    const next = `${mo === 12 ? y + 1 : y}-${String(mo === 12 ? 1 : mo + 1).padStart(2, '0')}`;
    if (YM.test(sorted[i]) && sorted[i] !== next && YM.test(sorted[i - 1]))
      W('fin.month-gap', 'financials.months', `gap between ${sorted[i - 1]} and ${sorted[i]}`);
  }

  // cap table
  const stakeholders = captable?.stakeholders || [];
  const { shares } = capTotals(captable || { stakeholders: [], safes: [] });
  if (!shares) E('cap.no-shares', 'captable.stakeholders', 'no issued shares — cap table math is undefined');
  stakeholders.forEach((s, i) => {
    if (s.shares !== null && s.shares !== undefined && (typeof s.shares !== 'number' || s.shares < 0))
      E('cap.shares', `captable.stakeholders[${i}]`, `"${s.name}": shares must be a non-negative number`);
  });
  if (!stakeholders.some((s) => s.type === 'Founder')) W('cap.no-founder', 'captable.stakeholders', 'no Founder row — dilution walk has no subject');
  if (!stakeholders.some((s) => s.type === 'Pool')) W('cap.no-pool', 'captable.stakeholders', 'no unallocated Pool row — round modeler will top up from zero');

  const safes = captable?.safes || [];
  let safeTotal = 0;
  safes.forEach((s, i) => {
    const at = `captable.safes[${i}]`;
    if (s.principal && !(s.cap || s.discount))
      W('safe.no-terms', at, `"${s.investor}": principal with neither cap nor discount — conversion is undefined`);
    if (s.discount && (s.discount <= 0 || s.discount >= 1))
      E('safe.discount', at, `"${s.investor}": discount must be a fraction (0.2 = 20%)`);
    safeTotal += safeImpliedPct(s) || 0;
  });
  if (safeTotal > 0.15)
    W('safe.guardrail', 'captable.safes', `total implied SAFE ownership ${(safeTotal * 100).toFixed(1)}% exceeds the 15% pre-priced-round guardrail`);

  // crm + reconciliation
  const commitments = crm?.commitments || [];
  commitments.forEach((c, i) => {
    const at = `crm.commitments[${i}]`;
    if (c.stage && !STAGES.includes(c.stage)) E('crm.stage', at, `"${c.investor}": unknown stage "${c.stage}"`);
    if (c.probability !== null && c.probability !== undefined && (c.probability < 0 || c.probability > 1))
      E('crm.probability', at, `"${c.investor}": probability must be 0–1`);
    if (['Signed', 'Wired'].includes(c.stage)) {
      const match = safes.some((s) => norm(s.investor).includes(norm(c.investor)) || norm(c.investor).includes(norm(s.investor)));
      if (!match) E('recon.commitment-without-safe', at, `"${c.investor}" is ${c.stage} but has no SAFE ledger entry — cap table and CRM disagree`);
    }
  });
  safes.filter((s) => ['Signed', 'Wired'].includes(s.status) && s.investor).forEach((s) => {
    const onList = (crm?.distribution || []).some((r) => norm(r.name).includes(norm(s.investor)));
    if (!onList) W('recon.safe-not-on-distribution', 'crm.distribution', `"${s.investor}" signed a SAFE but isn't on the update distribution list`);
  });
  (crm?.distribution || []).forEach((r, i) => {
    if (r.segment && !SEGMENTS.includes(r.segment))
      E('crm.segment', `crm.distribution[${i}]`, `"${r.name}": unknown segment "${r.segment}"`);
  });

  // updates
  (updates?.archive || []).forEach((u, i) => {
    if (u.sentAt && !/^\d{4}-\d{2}-\d{2}$/.test(u.sentAt))
      E('updates.sentAt', `updates.archive[${i}]`, `sentAt "${u.sentAt}" is not YYYY-MM-DD`);
  });

  return { ok: errors.length === 0, errors, warnings };
}

const norm = (s) => String(s || '').toLowerCase().trim();
