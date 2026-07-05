// The operations layer — every mutation an agent (or future UI/MCP surface) should use.
// Each op enforces the cross-collection invariants so they live in code, not prose.
import fs from 'node:fs';
import path from 'node:path';
import { load, save, uid, WORKSPACE } from './store.js';
import { latestMetrics, derive, updateCadence, capTotals, safeImpliedPct, modelRound } from '../public/js/metrics.js';
import { updateTemplate } from '../public/js/update-template.js';

const YM = /^\d{4}-(0[1-9]|1[0-2])$/;

export function status() {
  const company = load('company');
  const captable = load('captable');
  const crm = load('crm');
  const updates = load('updates');
  const m = latestMetrics(load('financials'));
  const cad = updateCadence(company, updates.archive);
  const { shares } = capTotals(captable);
  const founder = captable.stakeholders.find((s) => s.type === 'Founder');
  const safeTotal = captable.safes.reduce((t, s) => t + (safeImpliedPct(s) || 0), 0);
  const closed = crm.commitments.filter((c) => ['Signed', 'Wired'].includes(c.stage)).reduce((s, c) => s + (c.ticket || 0), 0);
  const weighted = crm.commitments.filter((c) => c.stage !== 'Passed').reduce((s, c) => s + (c.ticket || 0) * (c.probability || 0), 0);
  return {
    company: { name: company.name, sample: !!company.sample },
    financials: m ? {
      month: m.month, revenue: m.revenue, momPct: round4(m.mom), arrRunRate: m.arrRunRate,
      netPnl: m.pnl, burn3moAvg: Math.round(m.burn3), cash: Math.round(m.cash),
      runwayMonths: m.runway === Infinity ? null : round1(m.runway), cashFlowPositive: m.runway === Infinity,
      zeroCashMonth: m.zeroCash, traffic: m.traffic, pagesPerDay: m.pages,
      platforms: m.platforms, paying: m.paying, headcount: m.headcount,
    } : null,
    cadence: { updateDay: cad.day, nextDue: iso(cad.due), daysUntilDue: cad.days, overdue: cad.overdue, lastSent: cad.lastSent, streakMonths: cad.streak },
    round: { target: company.roundTarget || 0, signedWired: closed, weightedPipeline: Math.round(weighted), gap: Math.max((company.roundTarget || 0) - closed, 0), pctClosed: company.roundTarget ? round4(closed / company.roundTarget) : null },
    capTable: { totalShares: shares, founderPct: founder && shares ? round4(founder.shares / shares) : null, safeCount: captable.safes.filter((s) => s.principal).length, safePrincipal: captable.safes.reduce((t, s) => t + (s.principal || 0), 0), safeImpliedTotalPct: round4(safeTotal), safeGuardrailOk: safeTotal <= 0.15 },
  };
}

export function closeMonth(month, fields) {
  if (!YM.test(month)) throw new Error(`month "${month}" must be YYYY-MM`);
  const fin = load('financials');
  if (fin.months.some((m) => m.month === month)) throw new Error(`${month} already exists — edit data/financials.json directly to amend, then run ir check`);
  const row = { month, saas: null, ads: null, payroll: null, infra: null, other: null, inflow: 0, headcount: null, traffic: null, pages: null, platforms: null, paying: null };
  for (const k of Object.keys(row)) if (k !== 'month' && fields[k] !== undefined) row[k] = Number(fields[k]);
  fin.months.push(row);
  fin.months.sort((a, b) => a.month.localeCompare(b.month));
  save('financials', fin);

  const d = derive(fin).filter((m) => m.pnl !== null);
  const cur = d.find((m) => m.month === month);
  const prev = d[d.indexOf(cur) - 1];
  const flags = [];
  const jump = (label, a, b) => {
    if (prev && a !== null && b) {
      const chg = (a - b) / Math.abs(b);
      if (Math.abs(chg) > 0.2) flags.push(`${label} moved ${(chg * 100).toFixed(0)}% MoM — explain this in the update`);
    }
  };
  jump('revenue', cur?.revenue, prev?.revenue);
  jump('costs', cur?.costs, prev?.costs);
  if (cur && cur.cash < 0) flags.push('cash is NEGATIVE — data error or emergency; check opening cash and inflows');
  const m = latestMetrics(fin);
  if (m && m.runway !== Infinity && m.runway < 6) flags.push(`runway is ${m.runway.toFixed(1)} months — below the 6-month line`);
  return { month, revenue: cur?.revenue ?? null, netPnl: cur?.pnl ?? null, cash: cur ? Math.round(cur.cash) : null, flags };
}

const STAGE_MAP = { Target: 'Contacted', Verbal: 'Verbal', 'SAFE sent': 'SAFE sent', Signed: 'Signed', Wired: 'Wired' };
const PROB = { Contacted: 0.1, Meeting: 0.1, Verbal: 0.5, 'SAFE sent': 0.75, Signed: 0.9, Wired: 1 };

export function addSafe({ investor, principal, cap, discount, date, status = 'Signed', email = '', contact = '', type = 'Fund', segment = 'All investors' }) {
  if (!investor) throw new Error('investor name required');
  if (!principal || principal <= 0) throw new Error('--principal must be a positive number');
  if (!cap && !discount) throw new Error('a SAFE needs --cap and/or --discount, otherwise conversion is undefined');
  if (discount && (discount <= 0 || discount >= 1)) throw new Error('--discount is a fraction: 0.2 = 20%');

  const captable = load('captable');
  captable.safes.push({ id: uid(), investor, date: date || iso(new Date()), principal, cap: cap || null, discount: discount || null, status, notes: '' });
  save('captable', captable);

  const crm = load('crm');
  const stage = STAGE_MAP[status] || 'Contacted';
  let c = crm.commitments.find((x) => norm(x.investor) === norm(investor));
  if (!c) { c = { id: uid(), investor, source: '', ticket: principal, stage, probability: PROB[stage], nextAction: '', owner: '', lastTouch: iso(new Date()) }; crm.commitments.push(c); }
  else { c.ticket = principal; c.stage = stage; c.probability = PROB[stage]; c.lastTouch = iso(new Date()); }

  const signed = ['Signed', 'Wired'].includes(status);
  if (signed) {
    if (!crm.investors.some((x) => norm(x.name) === norm(investor)))
      crm.investors.push({ id: uid(), name: investor, type, contact, email, instrument: 'SAFE', amount: principal, cap: cap || null, date: date || iso(new Date()), segment, lastUpdate: '', notes: '' });
    if (!crm.distribution.some((x) => norm(x.name).includes(norm(investor))))
      crm.distribution.push({ id: uid(), name: contact ? `${investor} — ${contact}` : investor, email, segment, active: true, lastSent: '', notes: '' });
  }
  save('crm', crm);

  const safeTotal = captable.safes.reduce((t, s) => t + (safeImpliedPct(s) || 0), 0);
  const company = load('company');
  const closed = crm.commitments.filter((x) => ['Signed', 'Wired'].includes(x.stage)).reduce((s, x) => s + (x.ticket || 0), 0);
  return {
    investor, principal, impliedPct: round4(cap ? principal / cap : null),
    totalSafeImpliedPct: round4(safeTotal), guardrailOk: safeTotal <= 0.15,
    crmStage: stage, addedToDistribution: signed,
    round: { signedWired: closed, target: company.roundTarget || 0 },
    reminder: signed ? 'same-day ritual: countersign + send executed doc + thank-you note' : null,
  };
}

export function draftUpdate(month) {
  const fin = load('financials');
  const m = latestMetrics(fin);
  const dir = path.join(WORKSPACE, 'updates', 'drafts');
  fs.mkdirSync(dir, { recursive: true });
  if (!m || (month && m.month !== month)) {
    const target = month || iso(new Date()).slice(0, 7);
    const file = path.join(dir, `BLOCKED-${target}.md`);
    fs.writeFileSync(file, `# Blocked: ${target} is not closed\n\nClose the month first (\`ir close-month ${target} --saas ... \`), then re-run \`ir update draft\`.\nNever draft an investor update from invented numbers.\n`);
    return { blocked: true, file };
  }
  const body = updateTemplate(load('company'), m, load('crm'));
  const file = path.join(dir, `${m.month}.md`);
  fs.writeFileSync(file, body + '\n');
  return { blocked: false, month: m.month, file };
}

export function markSent({ subject, month }) {
  const updates = load('updates');
  const m = latestMetrics(load('financials'));
  const ym = month || (m ? m.month : iso(new Date()).slice(0, 7));
  const draftFile = path.join(WORKSPACE, 'updates', 'drafts', `${ym}.md`);
  const body = fs.existsSync(draftFile) ? fs.readFileSync(draftFile, 'utf8') : '';
  updates.archive.push({ id: uid(), month: ym, subject: subject || `Update — ${ym}`, body, sentAt: iso(new Date()) });
  save('updates', updates);
  const cad = updateCadence(load('company'), updates.archive);
  return { archived: ym, streakMonths: cad.streak, nextDue: iso(cad.due) };
}

export function modelPricedRound({ pre, newMoney, pool = 0.1 }) {
  const m = modelRound(load('captable'), { preMoney: pre, newMoney, poolTarget: pool });
  if (!m) throw new Error('cap table has no issued shares');
  return {
    postMoney: m.post, newInvestorPct: round4(m.nPct), safePreRoundPct: round4(m.S),
    poolTopUpPct: round4(m.dp), pricePerShare: Number(m.pps.toFixed(6)), totalShares: Math.round(m.T),
    proForma: m.rows.map((r) => ({ stakeholder: r.name, shares: Math.round(r.shares), pct: round4(r.pct) })),
  };
}

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const norm = (s) => String(s || '').toLowerCase().trim();
const round4 = (x) => (x === null || x === undefined || isNaN(x) ? null : Math.round(x * 1e4) / 1e4);
const round1 = (x) => Math.round(x * 10) / 10;
