import { el, fmt, section, dataTable, tabs } from './ui.js';
import { store, uid } from './store.js';
import { capTotals, safeImpliedPct, modelRound, dilutionWalk, waterfall } from './metrics.js';
import { pageCoach } from './onboarding.js';

export function renderCapTable(root) {
  root.append(el('h1', {}, 'Cap Table'));
  root.append(el('p', { class: 'page-sub' }, 'Current ownership, SAFE ledger, priced-round conversion modeling, dilution scenarios, and exit waterfall. Planning tool — final conversion math comes from counsel and the instruments.'));
  const coach = pageCoach('captable'); if (coach) root.append(coach);
  root.append(tabs([
    { label: 'Current & SAFEs', render: renderLedger },
    { label: 'Round modeler', render: renderModeler },
    { label: 'Dilution scenarios', render: renderScenarios },
    { label: 'Exit waterfall', render: renderWaterfall },
  ]));
}

const save = () => store.persist('captable');

// ---------- tab 1: stakeholders + SAFE ledger ----------
function renderLedger() {
  const cap = store.get('captable');
  const wrap = el('div');
  const totals = () => capTotals(cap);

  wrap.append(section('Stakeholders (issued + reserved)', 'Fully-diluted basis, before SAFE conversion.',
    dataTable({
      columns: [
        { key: 'name', label: 'Stakeholder', type: 'text', width: 180 },
        { key: 'type', label: 'Type', type: 'select', options: ['Founder', 'Employees', 'Pool', 'Advisor', 'Other'] },
        { key: 'security', label: 'Security', type: 'text', width: 90 },
        { key: 'shares', label: 'Shares', type: 'number', width: 110 },
        { compute: (r) => (totals().shares ? (r.shares || 0) / totals().shares : null), label: '% FD', fmt: (v) => fmt.pct(v) },
        { key: 'notes', label: 'Notes', type: 'text', width: 200 },
      ],
      rows: cap.stakeholders, save,
      newRow: () => ({ id: uid(), name: '', type: 'Other', security: 'Common', shares: null, notes: '' }),
      footer: () => el('tr', { class: 'total-row' },
        el('td', {}, 'TOTAL'), el('td', {}), el('td', {}),
        el('td', { class: 'computed' }, fmt.num(totals().shares)),
        el('td', { class: 'computed' }, '100.0%'), el('td', {}), el('td', {})),
    })));

  const safeTotal = () => cap.safes.reduce((s, r) => s + (safeImpliedPct(r) || 0), 0);
  wrap.append(section('SAFE ledger', 'Implied ownership = Principal ÷ Post-money cap (the post-money SAFE guarantee, pre-dilution by the next round). Keep the total under ~15% before pricing a round.',
    dataTable({
      columns: [
        { key: 'investor', label: 'Investor', type: 'text', width: 170 },
        { key: 'date', label: 'Date', type: 'date', width: 120 },
        { key: 'principal', label: 'Principal $', type: 'number', width: 100 },
        { key: 'cap', label: 'Post-money cap $', type: 'number', width: 120 },
        { key: 'discount', label: 'Discount (0.2 = 20%)', type: 'number', width: 76 },
        { compute: (r) => safeImpliedPct(r), label: 'Implied %', fmt: (v) => fmt.pct(v) },
        { key: 'status', label: 'Status', type: 'select', options: ['Target', 'Verbal', 'SAFE sent', 'Signed', 'Wired', 'Verify'] },
        { key: 'notes', label: 'Notes', type: 'text', width: 200 },
      ],
      rows: cap.safes, save,
      newRow: () => ({ id: uid(), investor: '', date: '', principal: null, cap: null, discount: null, status: 'Target', notes: '' }),
      footer: () => el('tr', { class: 'total-row' },
        el('td', {}, 'TOTAL'), el('td', {}),
        el('td', { class: 'computed' }, fmt.usd(cap.safes.reduce((s, r) => s + (r.principal || 0), 0))),
        el('td', {}), el('td', {}),
        el('td', { class: 'computed' }, fmt.pct(safeTotal())),
        el('td', {}), el('td', {}), el('td', {})),
    })));
  return wrap;
}

// ---------- tab 2: round modeler ----------
function renderModeler() {
  const cap = store.get('captable');
  cap.roundModel ||= { preMoney: 10000000, newMoney: 2500000, poolTarget: 0.10 };
  const rm = cap.roundModel;
  const wrap = el('div');

  const out = el('div');
  const input = (label, key, isPct = false) => el('div', { class: 'field' },
    el('label', {}, label),
    el('input', {
      type: 'number', step: 'any', value: isPct ? rm[key] * 100 : rm[key],
      onchange: (e) => { rm[key] = isPct ? Number(e.target.value) / 100 : Number(e.target.value); save(); draw(); },
    }));

  wrap.append(section('Priced round inputs', 'Post-money SAFE percentage method: each SAFE locks Principal/Cap pre-round, then dilutes with everyone by new money + pool top-up. Pool top-up is solved so the post-round unallocated pool hits the target.',
    el('div', { class: 'inline-fields' },
      input('Pre-money valuation ($)', 'preMoney'),
      input('New money raised ($)', 'newMoney'),
      input('Post-round pool target (%)', 'poolTarget', true)),
    out));

  function draw() {
    out.innerHTML = '';
    const m = modelRound(cap, rm);
    if (!m) { out.append(el('div', { class: 'callout warn' }, 'Add stakeholders with shares first.')); return; }
    out.append(el('div', { class: 'grid cols-4', style: 'margin:10px 0' },
      stat('Post-money', fmt.usd(m.post, true)), stat('New investors', fmt.pct(m.nPct)),
      stat('SAFEs (pre-round)', fmt.pct(m.S)), stat('Price/share', '$' + m.pps.toFixed(4))));
    if (m.dp > 0) out.append(el('div', { class: 'callout' }, `Pool top-up needed: ${fmt.pct(m.dp)} of post-round — founders and existing holders absorb this.`));
    const tbl = el('table', { class: 'tbl' },
      el('thead', {}, el('tr', {}, el('th', {}, 'Stakeholder'), el('th', { class: 'right' }, 'Post-round shares'), el('th', { class: 'right' }, 'Post-round %'))),
      el('tbody', {},
        ...m.rows.map((r) => el('tr', {},
          el('td', {}, r.name),
          el('td', { class: 'computed' }, fmt.num(Math.round(r.shares))),
          el('td', { class: 'computed' }, fmt.pct(r.pct)))),
        el('tr', { class: 'total-row' },
          el('td', {}, 'TOTAL'),
          el('td', { class: 'computed' }, fmt.num(Math.round(m.T))),
          el('td', { class: 'computed' }, fmt.pct(m.total)))));
    out.append(el('div', { class: 'tbl-wrap' }, tbl));
  }
  draw();
  return wrap;
}

const stat = (label, value) => el('div', { class: 'kpi' }, el('div', { class: 'k-label' }, label), el('div', { class: 'k-value', style: 'font-size:18px' }, value));

// ---------- tab 3: dilution scenarios ----------
function renderScenarios() {
  const cap = store.get('captable');
  const { shares } = capTotals(cap);
  const founder = cap.stakeholders.find((s) => s.type === 'Founder');
  const founderPct = founder && shares ? founder.shares / shares : 0;
  const wrap = el('div');

  const fields = [
    ['safeRaised', 'Pre-seed SAFEs raised ($)'], ['safeCap', 'Blended SAFE cap ($)'],
    ['seedMoney', 'Seed new money ($)'], ['seedPost', 'Seed post-money ($)'], ['seedPool', 'Seed pool added (0.10 = 10%)'],
    ['aMoney', 'Series A new money ($)'], ['aPost', 'Series A post-money ($)'], ['aPool', 'A pool added'],
  ];
  const table = el('table', { class: 'tbl' });
  const draw = () => {
    table.innerHTML = '';
    table.append(el('thead', {}, el('tr', {}, el('th', {}, 'Assumption'), ...cap.scenarios.map((s) => el('th', {}, s.name)))));
    const tb = el('tbody');
    for (const [key, label] of fields) {
      tb.append(el('tr', {}, el('td', {}, label), ...cap.scenarios.map((s) => el('td', {},
        el('input', { type: 'number', step: 'any', value: s[key] ?? '', onchange: (e) => { s[key] = Number(e.target.value); save(); draw(); } })))));
    }
    const walks = cap.scenarios.map((s) => dilutionWalk(founderPct, s));
    const outRow = (label, get, format) => el('tr', {}, el('td', {}, el('b', {}, label)),
      ...walks.map((w) => el('td', { class: 'computed' }, format(get(w)))));
    tb.append(
      el('tr', {}, el('td', {}, el('b', {}, 'Founder today')), ...cap.scenarios.map(() => el('td', { class: 'computed' }, fmt.pct(founderPct)))),
      outRow('After SAFEs convert', (w) => w.afterSafe, fmt.pct),
      outRow('After Seed', (w) => w.afterSeed, fmt.pct),
      outRow('After Series A', (w) => w.afterA, fmt.pct),
      outRow('Stake value at A post-money', (w) => w.valueAtA, (v) => fmt.usd(v, true)),
    );
    table.append(tb);
  };
  draw();
  wrap.append(section('Founder dilution walk', 'Simplified sequential dilution: each stage multiplies prior ownership by (1 − new money % − pool added %). Rule of thumb: founders + team above 50% going into Series A.',
    el('div', { class: 'tbl-wrap' }, table)));
  return wrap;
}

// ---------- tab 4: exit waterfall ----------
function renderWaterfall() {
  const cap = store.get('captable');
  const wf = cap.waterfall;
  const { shares } = capTotals(cap);
  const founder = cap.stakeholders.find((s) => s.type === 'Founder');
  const base = dilutionWalk(founder && shares ? founder.shares / shares : 0, cap.scenarios[1] || cap.scenarios[0] || {});
  const founderPct = base.afterA || 0.4;
  const wrap = el('div');
  const out = el('div');

  const input = (label, key, isPct = false) => el('div', { class: 'field' },
    el('label', {}, label),
    el('input', {
      type: 'number', step: 'any', value: isPct ? wf[key] * 100 : wf[key],
      onchange: (e) => { wf[key] = isPct ? Number(e.target.value) / 100 : Number(e.target.value); save(); draw(); },
    }));

  wrap.append(section('Exit waterfall', `Single preferred class, 1x non-participating, no dividends. Founder % (${fmt.pct(founderPct)}) comes from the Base dilution scenario. Illustrative only.`,
    el('div', { class: 'inline-fields' },
      input('Preferred invested ($)', 'prefInvested'),
      input('Preferred as-converted (%)', 'prefPct', true),
      input('Liquidation multiple (x)', 'multiple')),
    out));

  function draw() {
    out.innerHTML = '';
    const rows = [
      ['Preferred payout', (r) => fmt.usd(r.prefTake, true)],
      ['Decision', (r) => (r.converts ? 'Convert' : 'Take preference')],
      ['Common receives', (r) => fmt.usd(r.common, true)],
      ['— of which founder', (r) => fmt.usd(r.founder, true)],
      ['Preferred MOIC', (r) => (r.moic === null ? '—' : r.moic.toFixed(2) + 'x')],
    ];
    const results = wf.exits.map((x) => waterfall(x, { ...wf, founderPct }));
    out.append(el('div', { class: 'tbl-wrap' }, el('table', { class: 'tbl' },
      el('thead', {}, el('tr', {}, el('th', {}, 'Exit value →'), ...wf.exits.map((x) => el('th', { class: 'right' }, fmt.usd(x, true))))),
      el('tbody', {}, ...rows.map(([label, get]) => el('tr', {},
        el('td', {}, label), ...results.map((r) => el('td', { class: 'computed' }, get(r)))))))));
    out.append(el('div', { class: 'section-note' }, 'Below the preference amount, preferred takes everything; past the conversion point, everyone shares pro-rata.'));
  }
  draw();
  return wrap;
}
