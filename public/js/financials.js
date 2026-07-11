import { el, fmt, section, dataTable } from './ui.js';
import { store } from './store.js';
import { derive, latestMetrics, addMonths } from './metrics.js';
import { pageCoach } from './onboarding.js';
import { t } from './i18n.js';

export function renderFinancials(root) {
  const fin = store.get('financials');
  const save = () => store.persist('financials');

  root.append(el('h1', {}, t('financials.title')));
  root.append(el('p', { class: 'page-sub' }, t('financials.sub')));
  const coach = pageCoach('financials'); if (coach) root.append(coach);

  // opening cash
  const opening = el('input', {
    type: 'number', value: fin.openingCash ?? 0, step: 'any',
    onchange: (e) => { fin.openingCash = Number(e.target.value); save(); rerender(root); },
  });
  root.append(section(t('fin.opening'), t('fin.openingNote'),
    el('div', { class: 'field', style: 'max-width:220px' }, opening)));

  const derived = () => new Map(derive(fin).map((d) => [d.month, d]));
  let dmap = derived();
  const D = (row, key) => dmap.get(row.month)?.[key];

  const columns = [
    { key: 'month', label: t('col.month'), type: 'text', width: 78, placeholder: 'YYYY-MM' },
    { key: 'saas', label: t('col.saas'), type: 'number', width: 70 },
    { key: 'ads', label: t('col.ads'), type: 'number', width: 70 },
    { compute: (r) => { dmap = derived(); return D(r, 'revenue'); }, label: t('col.revenue'), fmt: (v) => fmt.usd(v) },
    { key: 'payroll', label: t('col.payroll'), type: 'number', width: 76 },
    { key: 'infra', label: t('col.infra'), type: 'number', width: 66 },
    { key: 'other', label: t('col.other'), type: 'number', width: 66 },
    { compute: (r) => D(r, 'costs'), label: t('col.costs'), fmt: (v) => fmt.usd(v) },
    { compute: (r) => D(r, 'pnl'), label: t('col.pnl'), fmt: (v) => fmt.usd(v) },
    { key: 'inflow', label: t('col.inflow'), type: 'number', width: 80 },
    { compute: (r) => D(r, 'cash'), label: t('col.cash'), fmt: (v) => fmt.usd(v) },
    { key: 'headcount', label: t('col.hc'), type: 'number', width: 46 },
    { key: 'traffic', label: t('col.traffic'), type: 'number', width: 92 },
    { key: 'pages', label: t('col.pages'), type: 'number', width: 86 },
    { key: 'platforms', label: t('col.platforms'), type: 'number', width: 60 },
    { key: 'paying', label: t('col.paying'), type: 'number', width: 56 },
  ];

  root.append(section(t('fin.monthly'), t('fin.monthlyNote'),
    dataTable({
      columns, rows: fin.months, save,
      addLabel: t('fin.addMonth'),
      newRow: () => {
        const last = fin.months.length ? fin.months[fin.months.length - 1].month : new Date().toISOString().slice(0, 7);
        return { month: addMonths(last, 1), saas: null, ads: null, payroll: null, infra: null, other: null, inflow: 0, headcount: null, traffic: null, pages: null, platforms: null, paying: null };
      },
    })));

  const m = latestMetrics(fin);
  if (m) {
    root.append(section(t('fin.block'), t('fin.blockNote'),
      el('pre', { style: 'font-family:var(--mono);font-size:12.5px;background:#f4f6f8;padding:12px;border-radius:8px;overflow-x:auto' },
        updateBlock(m))));
  }

  // runway scenarios
  const company = store.get('company');
  root.append(renderRunway(m, company));

  function rerender(rootEl) { rootEl.innerHTML = ''; renderFinancials(rootEl); }
}

function updateBlock(m) {
  const lines = [
    [t('blk.revenue'), `${fmt.usd(m.revenue)}  (${m.mom === null ? '—' : (m.mom >= 0 ? '+' : '') + fmt.pct(m.mom)} MoM)`],
    [t('blk.arr'), fmt.usd(m.arrRunRate)],
    [t('blk.traffic'), `${fmt.num(m.traffic, true)}${m.trafficYoY !== null ? `  (+${fmt.pct(m.trafficYoY, 0)} YoY)` : ''}`],
    [t('blk.pages'), fmt.num(m.pages, true)],
    [t('blk.platforms'), `${m.paying ?? '—'} / ${m.platforms ?? '—'}`],
    [t('blk.burn'), m.burn3 >= 0 ? t('kpi.cfPositive') : fmt.usd(-m.burn3) + t('blk.perMonth')],
    [t('blk.cashRunway'), `${fmt.usd(m.cash)} / ${m.runway === Infinity ? t('rw.cf') : t('blk.months', { m: m.runway.toFixed(1), date: fmt.month(m.zeroCash) })}`],
  ];
  return lines.map(([l, v]) => `- ${l}: ${v}`).join('\n');
}

function renderRunway(m, company) {
  if (!m) return el('div');
  const burn = m.burn3;
  const scenarios = [
    { name: t('rw.asis'), delta: 0 },
    { name: t('rw.hire1'), delta: -8000 },
    { name: t('rw.hire2'), delta: -15000 },
    { name: t('rw.gtm'), delta: -20000 },
  ];
  const remaining = (company.roundTarget || 0) * 0.8; // planning assumption: 80% of round still to wire
  const row = (s, cash) => {
    const net = burn + s.delta;
    const rw = net >= 0 ? t('rw.cf') : (cash / -net).toFixed(1) + ' mo';
    return el('tr', {}, el('td', {}, s.name), el('td', { class: 'computed' }, fmt.usd(s.delta)), el('td', { class: 'computed' }, net >= 0 ? '+' + fmt.usd(net) : fmt.usd(net)), el('td', { class: 'computed' }, rw));
  };
  const tbl = (cash, title) => el('div', {}, el('div', { class: 'chart-title' }, title),
    el('table', { class: 'tbl' },
      el('thead', {}, el('tr', {}, el('th', {}, t('rw.scenario')), el('th', {}, t('rw.delta')), el('th', {}, t('rw.net')), el('th', {}, t('rw.months')))),
      el('tbody', {}, ...scenarios.map((s) => row(s, cash)))));
  return section(t('fin.runway'), t('fin.runwayNote'),
    el('div', { class: 'grid cols-2' }, tbl(m.cash, t('rw.current', { cash: fmt.usd(m.cash, true) })), tbl(m.cash + remaining, t('rw.withRound', { amount: fmt.usd(remaining, true) }))));
}
