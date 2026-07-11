import { el, fmt, section, dataTable, tabs } from './ui.js';
import { store, uid } from './store.js';
import { capTotals, safeImpliedPct, modelRound, dilutionWalk, waterfall } from './metrics.js';
import { pageCoach } from './onboarding.js';
import { t } from './i18n.js';

export function renderCapTable(root) {
  root.append(el('h1', {}, t('captable.title')));
  root.append(el('p', { class: 'page-sub' }, t('captable.sub')));
  const coach = pageCoach('captable'); if (coach) root.append(coach);
  root.append(tabs([
    { label: t('captable.tab.current'), render: renderLedger },
    { label: t('captable.tab.modeler'), render: renderModeler },
    { label: t('captable.tab.scenarios'), render: renderScenarios },
    { label: t('captable.tab.waterfall'), render: renderWaterfall },
  ]));
}

const save = () => store.persist('captable');

// ---------- tab 1: stakeholders + SAFE ledger ----------
function renderLedger() {
  const cap = store.get('captable');
  const wrap = el('div');
  const totals = () => capTotals(cap);

  wrap.append(section(t('cap.stakeholders'), t('cap.stakeholdersNote'),
    dataTable({
      columns: [
        { key: 'name', label: t('col.stakeholder'), type: 'text', width: 180 },
        { key: 'type', label: t('col.type'), type: 'select', options: ['Founder', 'Employees', 'Pool', 'Advisor', 'Other'].map((v) => ({ value: v, label: t('opt.holder.' + v) })) },
        { key: 'security', label: t('col.security'), type: 'text', width: 90 },
        { key: 'shares', label: t('col.shares'), type: 'number', width: 110 },
        { compute: (r) => (totals().shares ? (r.shares || 0) / totals().shares : null), label: t('col.fd'), fmt: (v) => fmt.pct(v) },
        { key: 'notes', label: t('col.notes'), type: 'text', width: 200 },
      ],
      rows: cap.stakeholders, save,
      newRow: () => ({ id: uid(), name: '', type: 'Other', security: 'Common', shares: null, notes: '' }),
      footer: () => el('tr', { class: 'total-row' },
        el('td', {}, t('common.total')), el('td', {}), el('td', {}),
        el('td', { class: 'computed' }, fmt.num(totals().shares)),
        el('td', { class: 'computed' }, '100.0%'), el('td', {}), el('td', {})),
    })));

  const safeTotal = () => cap.safes.reduce((s, r) => s + (safeImpliedPct(r) || 0), 0);
  wrap.append(section(t('cap.ledger'), t('cap.ledgerNote'),
    dataTable({
      columns: [
        { key: 'investor', label: t('col.investor'), type: 'text', width: 170 },
        { key: 'date', label: t('col.date'), type: 'date', width: 120 },
        { key: 'principal', label: t('col.principal'), type: 'number', width: 100 },
        { key: 'cap', label: t('col.cap'), type: 'number', width: 120 },
        { key: 'discount', label: t('col.discount'), type: 'number', width: 76 },
        { compute: (r) => safeImpliedPct(r), label: t('col.implied'), fmt: (v) => fmt.pct(v) },
        { key: 'status', label: t('col.status'), type: 'select', options: ['Target', 'Verbal', 'SAFE sent', 'Signed', 'Wired', 'Verify'].map((v) => ({ value: v, label: t('opt.safe.' + v) })) },
        { key: 'notes', label: t('col.notes'), type: 'text', width: 200 },
      ],
      rows: cap.safes, save,
      newRow: () => ({ id: uid(), investor: '', date: '', principal: null, cap: null, discount: null, status: 'Target', notes: '' }),
      footer: () => el('tr', { class: 'total-row' },
        el('td', {}, t('common.total')), el('td', {}),
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

  wrap.append(section(t('mod.section'), t('mod.note'),
    el('div', { class: 'inline-fields' },
      input(t('mod.pre'), 'preMoney'),
      input(t('mod.new'), 'newMoney'),
      input(t('mod.pool'), 'poolTarget', true)),
    out));

  function draw() {
    out.innerHTML = '';
    const m = modelRound(cap, rm);
    if (!m) { out.append(el('div', { class: 'callout warn' }, t('mod.addFirst'))); return; }
    out.append(el('div', { class: 'grid cols-4', style: 'margin:10px 0' },
      stat(t('mod.statPost'), fmt.usd(m.post, true)), stat(t('mod.statNew'), fmt.pct(m.nPct)),
      stat(t('mod.statSafes'), fmt.pct(m.S)), stat(t('mod.statPps'), '$' + m.pps.toFixed(4))));
    if (m.dp > 0) out.append(el('div', { class: 'callout' }, t('mod.poolTopUp', { pct: fmt.pct(m.dp) })));
    const tbl = el('table', { class: 'tbl' },
      el('thead', {}, el('tr', {}, el('th', {}, t('col.stakeholder')), el('th', { class: 'right' }, t('mod.thShares')), el('th', { class: 'right' }, t('mod.thPct')))),
      el('tbody', {},
        ...m.rows.map((r) => el('tr', {},
          el('td', {}, r.name),
          el('td', { class: 'computed' }, fmt.num(Math.round(r.shares))),
          el('td', { class: 'computed' }, fmt.pct(r.pct)))),
        el('tr', { class: 'total-row' },
          el('td', {}, t('common.total')),
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
    ['safeRaised', t('scn.safeRaised')], ['safeCap', t('scn.safeCap')],
    ['seedMoney', t('scn.seedMoney')], ['seedPost', t('scn.seedPost')], ['seedPool', t('scn.seedPool')],
    ['aMoney', t('scn.aMoney')], ['aPost', t('scn.aPost')], ['aPool', t('scn.aPool')],
  ];
  const table = el('table', { class: 'tbl' });
  const draw = () => {
    table.innerHTML = '';
    table.append(el('thead', {}, el('tr', {}, el('th', {}, t('scn.assumption')), ...cap.scenarios.map((s) => el('th', {}, s.name)))));
    const tb = el('tbody');
    for (const [key, label] of fields) {
      tb.append(el('tr', {}, el('td', {}, label), ...cap.scenarios.map((s) => el('td', {},
        el('input', { type: 'number', step: 'any', value: s[key] ?? '', onchange: (e) => { s[key] = Number(e.target.value); save(); draw(); } })))));
    }
    const walks = cap.scenarios.map((s) => dilutionWalk(founderPct, s));
    const outRow = (label, get, format) => el('tr', {}, el('td', {}, el('b', {}, label)),
      ...walks.map((w) => el('td', { class: 'computed' }, format(get(w)))));
    tb.append(
      el('tr', {}, el('td', {}, el('b', {}, t('scn.today'))), ...cap.scenarios.map(() => el('td', { class: 'computed' }, fmt.pct(founderPct)))),
      outRow(t('scn.afterSafe'), (w) => w.afterSafe, fmt.pct),
      outRow(t('scn.afterSeed'), (w) => w.afterSeed, fmt.pct),
      outRow(t('scn.afterA'), (w) => w.afterA, fmt.pct),
      outRow(t('scn.value'), (w) => w.valueAtA, (v) => fmt.usd(v, true)),
    );
    table.append(tb);
  };
  draw();
  wrap.append(section(t('scn.title'), t('scn.note') + ' ' + t('scn.rule'),
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

  wrap.append(section(t('wf.section'), t('wf.note', { pct: fmt.pct(founderPct) }),
    el('div', { class: 'inline-fields' },
      input(t('wf.invested'), 'prefInvested'),
      input(t('wf.pct'), 'prefPct', true),
      input(t('wf.multiple'), 'multiple')),
    out));

  function draw() {
    out.innerHTML = '';
    const rows = [
      [t('wf.pref'), (r) => fmt.usd(r.prefTake, true)],
      [t('wf.decision'), (r) => (r.converts ? t('wf.convert') : t('wf.takePref'))],
      [t('wf.common'), (r) => fmt.usd(r.common, true)],
      [t('wf.founder'), (r) => fmt.usd(r.founder, true)],
      [t('wf.moic'), (r) => (r.moic === null ? '—' : r.moic.toFixed(2) + 'x')],
    ];
    const results = wf.exits.map((x) => waterfall(x, { ...wf, founderPct }));
    out.append(el('div', { class: 'tbl-wrap' }, el('table', { class: 'tbl' },
      el('thead', {}, el('tr', {}, el('th', {}, t('wf.exit')), ...wf.exits.map((x) => el('th', { class: 'right' }, fmt.usd(x, true))))),
      el('tbody', {}, ...rows.map(([label, get]) => el('tr', {},
        el('td', {}, label), ...results.map((r) => el('td', { class: 'computed' }, get(r)))))))));
    out.append(el('div', { class: 'section-note' }, t('wf.reading')));
  }
  draw();
  return wrap;
}
