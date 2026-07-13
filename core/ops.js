// The operations layer — every mutation an agent (or future UI/MCP surface) should use.
// Each op enforces the cross-collection invariants so they live in code, not prose.
import fs from 'node:fs';
import path from 'node:path';
import { load, save, uid, WORKSPACE } from './store.js';
import { latestMetrics, derive, updateCadence, capTotals, safeImpliedPct, modelRound } from '../public/js/metrics.js';
import { updateTemplate } from '../public/js/update-template.js';
import { fmt } from '../public/js/ui.js';

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
  const row = { month, saas: null, ads: null, fde: null, otherRev: null, payroll: null, infra: null, other: null, inflow: 0, headcount: null, traffic: null, pages: null, platforms: null, paying: null };
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

// Sourced prospect — a name you found and want to nurture, NOT yet contacted.
// Lands as an INACTIVE distribution row (segment 'Prospect nurture') so it can't
// receive updates until the founder actually reaches out, plus a 'Contacted'
// commitment with probability 0.1 and NO ticket (so weighted pipeline isn't
// inflated by unqualified names). Rows this verb creates are tagged sourced:true;
// dedupe touches ONLY those, so re-running updates a prospect in place while a
// name that collides with the founder's real investor/deal/recipient is left
// untouched (and reported back, not duplicated). Stays inside ir-check invariants.
export function addProspect({ name, fit, source, email = '', type = 'Fund', ticket } = {}) {
  if (!name) throw new Error('prospect name required');
  if (!fit) throw new Error('--fit required: one line on why they fit');
  if (!source) throw new Error('--source required: where you found them / thesis URL');

  const crm = load('crm');
  const notes = `${fit} · via ${source}`;
  const today = iso(new Date());

  // Never corrupt or duplicate someone already tracked as REAL data (anything not sourced by us).
  const knownAsReal =
    crm.investors.some((r) => sameEntity(r.name, name)) ||
    crm.commitments.some((c) => !c.sourced && sameEntity(c.investor, name)) ||
    crm.distribution.some((r) => !r.sourced && sameEntity(r.name, name));
  if (knownAsReal) {
    return {
      name, fit, source, updated: false, alreadyKnown: true, addedToDistribution: false,
      note: 'already in your CRM as a real investor/recipient — not added as a prospect',
      prospectCount: crm.distribution.filter((r) => r.sourced).length,
    };
  }

  // Dedupe only against prior prospect adds (sourced rows) so re-running updates in place.
  let updated = false;
  const dist = crm.distribution.find((r) => r.sourced && sameEntity(r.name, name));
  if (dist) { dist.notes = notes; dist.type = type; if (email) dist.email = email; updated = true; }
  else crm.distribution.push({ id: uid(), name, email: email || '', segment: 'Prospect nurture', type, active: false, sourced: true, lastSent: '', notes });

  const nextAction = `Outreach — ${fit}`;
  const com = crm.commitments.find((c) => c.sourced && sameEntity(c.investor, name));
  if (com) { com.source = source; com.nextAction = nextAction; if (ticket !== undefined) com.ticket = ticket ?? null; updated = true; }
  else crm.commitments.push({ id: uid(), investor: name, source, ticket: ticket ?? null, stage: 'Contacted', probability: 0.1, nextAction, owner: '', lastTouch: today, sourced: true });

  save('crm', crm);

  const prospectCount = crm.distribution.filter((r) => r.sourced).length;
  return { name, fit, source, email, type, updated, addedToDistribution: true, pipelineStage: 'Contacted', prospectCount };
}

export function listProspects() {
  const crm = load('crm');
  const prospects = crm.distribution
    .filter((r) => r.sourced || r.segment === 'Prospect nurture')
    .map((r) => {
      const com = crm.commitments.find((c) => sameEntity(c.investor, r.name));
      const notes = r.notes || '';
      const via = notes.lastIndexOf(' · via ');
      const fit = via >= 0 ? notes.slice(0, via) : notes;
      const source = via >= 0 ? notes.slice(via + ' · via '.length) : (com ? com.source : '');
      return { name: r.name, email: r.email || '', type: r.type || '', fit, source, stage: com ? com.stage : 'Contacted', active: !!r.active };
    });
  return { prospects };
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

// ---------- exports: real-data artifacts for board packs, one-pagers, diligence ----------
// Markdown/CSV substance only — styling into pptx/docx/PDF is the founder's (or their agent's) job.

function exportDir() {
  const dir = path.join(WORKSPACE, 'exports');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
const csvEsc = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

export function exportCaptableCsv() {
  const captable = load('captable');
  const { shares } = capTotals(captable);
  const rows = [['kind', 'name', 'type_or_status', 'security', 'shares', 'pct_fully_diluted', 'principal_usd', 'post_money_cap_usd', 'discount', 'implied_pct', 'date', 'notes']];
  for (const s of captable.stakeholders) {
    rows.push(['stakeholder', s.name, s.type, s.security, s.shares ?? '', shares && s.shares ? (s.shares / shares).toFixed(4) : '', '', '', '', '', '', s.notes ?? '']);
  }
  for (const s of captable.safes) {
    if (!s.investor) continue;
    const imp = safeImpliedPct(s);
    rows.push(['safe', s.investor, s.status ?? '', 'SAFE', '', '', s.principal ?? '', s.cap ?? '', s.discount ?? '', imp !== null ? imp.toFixed(4) : '', s.date ?? '', s.notes ?? '']);
  }
  const file = path.join(exportDir(), `captable-${iso(new Date())}.csv`);
  fs.writeFileSync(file, rows.map((r) => r.map(csvEsc).join(',')).join('\n') + '\n');
  return { file, stakeholders: captable.stakeholders.length, safes: captable.safes.filter((s) => s.investor).length };
}

export function exportBoardPack() {
  const company = load('company');
  const crm = load('crm');
  const captable = load('captable');
  const fin = load('financials');
  const m = latestMetrics(fin);
  if (!m) throw new Error('no closed months — close at least one month before exporting a board pack');
  const d = derive(fin).filter((x) => x.pnl !== null);
  const last3 = d.slice(-3);
  const { shares } = capTotals(captable);
  const safeTotal = captable.safes.reduce((t, s) => t + (safeImpliedPct(s) || 0), 0);
  const closed = crm.commitments.filter((c) => ['Signed', 'Wired'].includes(c.stage)).reduce((s, c) => s + (c.ticket || 0), 0);
  const target = company.roundTarget || 0;
  const runwayLine = m.runway === Infinity ? 'cash-flow positive' : `${m.runway.toFixed(1)} months (zero-cash ${fmt.month(m.zeroCash)})`;
  const withRound = m.burn3 < 0 ? (m.cash + Math.max(target - closed, 0)) / -m.burn3 : Infinity;

  const md = `# ${company.name} — board / investor-council pack — ${iso(new Date())}

> Pre-read: send 72 hours before the meeting. ≥50% of meeting time on discuss/decide items, not status narration.

## 1. CEO letter (write this — one page, prose)
- State of the company in 3 sentences:
- What I said last quarter vs. what happened:
- The 1–2 decisions I need this group's help making:
- What keeps me up at night:

## 2. Metrics — last ${last3.length} closed months
| Month | Revenue | Costs | Net P&L | Cash | Headcount |
|---|---|---|---|---|---|
${last3.map((x) => `| ${fmt.month(x.month)} | ${fmt.usd(x.revenue)} | ${fmt.usd(x.costs)} | ${fmt.usd(x.pnl)} | ${fmt.usd(x.cash)} | ${x.headcount ?? '—'} |`).join('\n')}

Traction (${fmt.month(m.month)}): traffic ${fmt.num(m.traffic, true)}${m.trafficYoY !== null ? ` (+${fmt.pct(m.trafficYoY, 0)} YoY)` : ''} · pages/day ${fmt.num(m.pages, true)} · platforms ${m.paying ?? '—'}/${m.platforms ?? '—'} paying/total

## 3. Financial position
- Cash: ${fmt.usd(m.cash)} · net burn (3-mo avg): ${m.burn3 >= 0 ? 'CF positive' : fmt.usd(-m.burn3) + '/mo'} · runway: ${runwayLine}
- Round: ${company.roundInstrument || '—'} — ${fmt.usd(closed)} of ${fmt.usd(target)} signed/wired
- With remaining round closed: runway ${withRound === Infinity ? 'CF positive' : withRound.toFixed(1) + ' months'}

## 4. Cap table snapshot
| Holder | Shares | % FD |
|---|---|---|
${captable.stakeholders.map((s) => `| ${s.name} | ${fmt.num(s.shares)} | ${shares && s.shares ? fmt.pct(s.shares / shares) : '—'} |`).join('\n')}

SAFEs outstanding: ${captable.safes.filter((s) => s.principal).length} totalling ${fmt.usd(captable.safes.reduce((t, s) => t + (s.principal || 0), 0))} · implied ownership ${fmt.pct(safeTotal)} ${safeTotal > 0.15 ? '— OVER the 15% guardrail' : '(within 15% guardrail)'}

## 5. Decisions & asks (write this)
1.

## 6. Consents & resolutions needed (draft exact wording in advance)
-

---
Generated by IR Kit from data/ actuals on ${iso(new Date())} — numbers trace to financials.json; narrative sections are yours to write.
`;
  const file = path.join(exportDir(), `board-pack-${iso(new Date())}.md`);
  fs.writeFileSync(file, md);
  return { file, months: last3.length };
}

export function exportTearsheet() {
  const company = load('company');
  const crm = load('crm');
  const m = latestMetrics(load('financials'));
  if (!m) throw new Error('no closed months — close at least one month first');
  const closed = crm.commitments.filter((c) => ['Signed', 'Wired'].includes(c.stage)).reduce((s, c) => s + (c.ticket || 0), 0);
  const md = `# ${company.name}

${company.tagline || ''}

| | ${fmt.month(m.month)} |
|---|---|
| Revenue (month) | ${fmt.usd(m.revenue)}${m.mom !== null ? ` (${(m.mom >= 0 ? '+' : '') + fmt.pct(m.mom)} MoM)` : ''} |
| ARR run-rate | ${fmt.usd(m.arrRunRate)} |
| Monthly traffic | ${fmt.num(m.traffic, true)}${m.trafficYoY !== null ? ` (+${fmt.pct(m.trafficYoY, 0)} YoY)` : ''} |
| Platforms (paying/total) | ${m.paying ?? '—'} / ${m.platforms ?? '—'} |
| Team | ${m.headcount ?? '—'} |

**Raising:** ${company.roundInstrument || '—'} · ${fmt.usd(closed)} of ${fmt.usd(company.roundTarget || 0)} committed

**Contact:** ${company.founder || ''} · ${company.email || ''}

*Generated ${iso(new Date())} from live actuals via IR Kit.*
`;
  const file = path.join(exportDir(), `tearsheet-${iso(new Date())}.md`);
  fs.writeFileSync(file, md);
  return { file, month: m.month };
}

// ---------- ir start: the one-command guided setup ----------
// Idempotent state machine. An agent (or human) can run it at any moment; it scaffolds
// whatever is missing, detects where the founder is in the journey, and prints the
// exact next action — so "ir start" is the only thing a new user ever needs to know.
import { scaffoldWorkspace, inboxFiles, dataRoomFileCount, INBOX } from './workspace.js';

export function start() {
  const scaffold = scaffoldWorkspace();
  const company = load('company');
  const inbox = inboxFiles();
  const sorted = dataRoomFileCount();
  const fin = load('financials');
  const captable = load('captable');
  const sample = company.sample === true;
  const monthsClosed = (fin.months || []).length;
  const safes = (captable.safes || []).filter((s) => s.principal).length;

  let stage, next;
  if (sample && !inbox.length && !sorted) {
    stage = 'collect';
    next = [
      `Ask the founder to drop EVERY financial/fundraising/company document into the inbox: ${INBOX}`,
      '(SAFEs, bank statements, cap table, incorporation docs, decks — unorganized is fine)',
      'Alternative if their docs are scattered: offer `ir scan <folders>` on folders they appoint.',
      'When files are in the inbox, run: ir sort',
      'If the founder has no documents to provide, stop here — the dashboard keeps the sample data until real data exists.',
    ];
  } else if (inbox.length) {
    stage = 'sort';
    next = [
      `${inbox.length} file(s) waiting in the inbox — run: ir sort`,
      'Files it can\'t classify by name stay in the inbox: ask the founder\'s permission before opening them to classify by content, then move them into the right data-room folder yourself.',
      'ir sort is safe to re-run any time new files land in the inbox.',
    ];
  } else if (sample && sorted) {
    stage = 'extract';
    next = [
      `${sorted} document(s) organized in the data room — extract per the AGENTS.md onboarding contract:`,
      'executed SAFEs → ir safe add · bank statements/P&L → ir close-month (fully-supported months only) · incorporation/cap docs → stakeholders (then ir check)',
      'Every number needs a file+page citation in ir-workspace/onboarding/INVENTORY.md; ambiguity → OPEN-QUESTIONS.md, never guessed.',
      'Then: ir check (must pass) → ir status → walk the founder through the dashboard against the citations.',
      'Only after the founder confirms the numbers: set sample=false in data/company.json.',
    ];
  } else {
    stage = 'live';
    next = [
      'Setup is complete — this is live data. The rhythm from here:',
      'monthly: ir close-month → ir update draft → founder reviews & sends → ir update mark-sent',
      'any new SAFE: ir safe add · new documents: drop in the inbox → ir sort · health: ir check',
    ];
  }
  return {
    stage,
    workspace: { scaffolded: !scaffold.existed, filesCreated: scaffold.created, inboxPath: INBOX },
    state: { sampleData: sample, inboxFiles: inbox.length, dataRoomFiles: sorted, monthsClosed, safes },
    next,
  };
}

// ---------- ir sort: repeatable inbox → data-room classification ----------
// Filename-based (same categories as ir scan). MOVES files within the workspace —
// the inbox holds copies the founder staged, so moving keeps the inbox as the "to do"
// pile and the data room as the organized result. Unclassifiable files stay put for
// the agent+founder to handle by content, with consent.
const CATEGORY_DEST = {
  'SAFE / convertible': 'tier1/safes',
  'cap table': 'tier1/cap-table',
  'incorporation / legal': 'tier1/incorporation',
  '409A / valuation': 'tier2/valuations',
  'bank / statements': 'tier1/bank-statements',
  'bookkeeping / P&L': 'tier1/financials',
  'term sheets': 'tier2/term-sheets',
  'board / governance': 'tier2/board',
  'investor materials': 'tier1/investor-materials',
  'tax': 'tier2/tax',
};

export function sortInbox() {
  scaffoldWorkspace();
  const files = inboxFiles();
  const moved = [];
  const unclassified = [];
  for (const full of files) {
    const name = path.basename(full);
    const testName = name.replace(/[._-]+/g, ' ');
    const cat = DOC_CATEGORIES.find(([, re]) => re.test(testName));
    if (!cat) { unclassified.push(name); continue; }
    const destDir = path.join(WORKSPACE, 'data-room', CATEGORY_DEST[cat[0]]);
    fs.mkdirSync(destDir, { recursive: true });
    let dest = path.join(destDir, name);
    let n = 1;
    while (fs.existsSync(dest)) {
      const ext = path.extname(name);
      dest = path.join(destDir, `${path.basename(name, ext)}-${n++}${ext}`);
    }
    try { fs.renameSync(full, dest); } catch { fs.copyFileSync(full, dest); fs.unlinkSync(full); }
    moved.push({ file: name, category: cat[0], to: path.relative(WORKSPACE, dest) });
  }
  const dir = path.join(WORKSPACE, 'onboarding');
  fs.mkdirSync(dir, { recursive: true });
  const log = path.join(dir, 'SORT-LOG.md');
  const stamp = iso(new Date());
  const lines = [`\n## ${stamp} — ${moved.length} filed, ${unclassified.length} left in inbox`];
  for (const m of moved) lines.push(`- ${m.file} → ${m.to} (${m.category})`);
  for (const u of unclassified) lines.push(`- STILL IN INBOX (classify by content, with consent): ${u}`);
  fs.appendFileSync(log, lines.join('\n') + '\n');
  return { moved, unclassified, log, inboxRemaining: unclassified.length };
}

// Onboarding scanner — finds candidate financial/investment documents by FILENAME AND
// METADATA ONLY (contents are never read). Consent-first: caller passes appointed
// folders explicitly; nothing is copied or modified. Output is a checklist inventory
// the founder + agent review together (see prompts/onboard.md).
// Filenames are normalized before matching (._- become spaces) so "Acme_SAFE_signed.pdf"
// matches \bsafe\b — underscores are word characters in JS regex and would defeat \b.
const DOC_CATEGORIES = [
  ['SAFE / convertible', /\bsafe\b|convertible|\bkiss\b/i],
  ['cap table', /cap ?table|capitali[sz]ation/i],
  ['incorporation / legal', /incorporat|certificate|bylaws|articles of|operating agreement|stock purchase|ip assign|founder agreement/i],
  ['409A / valuation', /409a|valuation/i],
  ['bank / statements', /\bbank\b|statement/i],
  ['bookkeeping / P&L', /p&l|pnl|profit (and |& )?loss|income statement|balance sheet|ledger|bookkeep|\bburn\b|runway/i],
  ['term sheets', /term ?sheet/i],
  ['board / governance', /board (pack|deck|meeting|minutes)|\bminutes\b|\bconsent\b|resolution/i],
  ['investor materials', /investor|pitch ?deck|one ?pager|\bmemo\b|data ?room/i],
  ['tax', /\btax\b|\bk ?1\b|1099|\bw ?9\b/i],
];
const DOC_EXTS = new Set(['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.csv', '.numbers', '.pages', '.pptx', '.key', '.md', '.txt']);
const SKIP_DIRS = new Set(['node_modules', 'Library', 'Applications', 'System', '.git', '.Trash']);

export function scanDocuments(folders, { maxDepth = 8, maxVisited = 50000, maxMatches = 1000 } = {}) {
  if (!folders.length) throw new Error('appoint at least one folder: ir scan <folder> [...] — consent first, see prompts/onboard.md');
  const roots = folders.map((f) => path.resolve(f.replace(/^~(?=$|\/)/, process.env.HOME || '~')));
  for (const r of roots) if (!fs.existsSync(r)) throw new Error(`folder not found: ${r}`);

  let visited = 0;
  const matches = [];
  const walk = (dir, depth) => {
    if (depth > maxDepth || visited > maxVisited || matches.length >= maxMatches) return;
    if (dir === WORKSPACE || dir === path.dirname(WORKSPACE)) return; // never rescan ourselves
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full, depth + 1); continue; }
      visited++;
      if (!DOC_EXTS.has(path.extname(e.name).toLowerCase())) continue;
      const testName = e.name.replace(/[._-]+/g, ' ');
      const cat = DOC_CATEGORIES.find(([, re]) => re.test(testName));
      if (!cat) continue;
      let st;
      try { st = fs.statSync(full); } catch { continue; }
      matches.push({ path: full, category: cat[0], sizeKb: Math.round(st.size / 1024), modified: iso(st.mtime) });
      if (matches.length >= maxMatches) return;
    }
  };
  for (const r of roots) walk(r, 0);

  const dir = path.join(WORKSPACE, 'onboarding');
  fs.mkdirSync(dir, { recursive: true });
  const byCat = {};
  for (const m of matches) (byCat[m.category] ||= []).push(m);
  const lines = [
    '# Document scan — candidates for the data room',
    `Scanned ${roots.join(', ')} on ${iso(new Date())} · filenames and metadata only, no contents read.`,
    'Tick what belongs in your IR system; your agent copies approved files into ir-workspace/data-room/ (originals untouched).',
    '',
  ];
  for (const [cat, items] of Object.entries(byCat)) {
    lines.push(`## ${cat}`);
    for (const m of items.sort((a, b) => b.modified.localeCompare(a.modified)))
      lines.push(`- [ ] ${m.path} (${m.sizeKb} KB, ${m.modified})`);
    lines.push('');
  }
  if (!matches.length) lines.push('No candidates matched. Try other folders, or organize documents manually per the data-room checklist.');
  const file = path.join(dir, 'candidates.md');
  fs.writeFileSync(file, lines.join('\n') + '\n');
  return {
    folders: roots, filesVisited: visited, matched: matches.length,
    byCategory: Object.fromEntries(Object.entries(byCat).map(([k, v]) => [k, v.length])),
    inventory: file, contentsRead: false,
  };
}

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const norm = (s) => String(s || '').toLowerCase().trim();
// Same investor? Exact match, or the same base before a " — Contact" / " - Contact" suffix
// (distribution rows are stored as "Fund — Partner"), so we recognize a lead already on the
// list without over-matching on shared substrings.
const nameBase = (s) => norm(s).split(/\s[—-]\s/)[0].trim();
const sameEntity = (a, b) => {
  const na = norm(a), nb = norm(b);
  return na === nb || nameBase(a) === nameBase(b) || nameBase(a) === nb || na === nameBase(b);
};
const round4 = (x) => (x === null || x === undefined || isNaN(x) ? null : Math.round(x * 1e4) / 1e4);
const round1 = (x) => Math.round(x * 10) / 10;
