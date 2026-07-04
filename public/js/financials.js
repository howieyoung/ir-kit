import { el, fmt, section, dataTable } from './ui.js';
import { store } from './store.js';
import { derive, latestMetrics, addMonths } from './metrics.js';

export function renderFinancials(root) {
  const fin = store.get('financials');
  const save = () => store.persist('financials');

  root.append(el('h1', {}, 'Financials'));
  root.append(el('p', { class: 'page-sub' }, 'One row per month. Close within 10 days of month-end. Computed columns (revenue, costs, P&L, cash) update as you type.'));

  // opening cash
  const opening = el('input', {
    type: 'number', value: fin.openingCash ?? 0, step: 'any',
    onchange: (e) => { fin.openingCash = Number(e.target.value); save(); rerender(root); },
  });
  root.append(section('Opening cash', 'Cash balance before the first month listed below.',
    el('div', { class: 'field', style: 'max-width:220px' }, opening)));

  const derived = () => new Map(derive(fin).map((d) => [d.month, d]));
  let dmap = derived();
  const D = (row, key) => dmap.get(row.month)?.[key];

  const columns = [
    { key: 'month', label: 'Month', type: 'text', width: 78, placeholder: 'YYYY-MM' },
    { key: 'saas', label: 'SaaS $', type: 'number', width: 70 },
    { key: 'ads', label: 'Ads $', type: 'number', width: 70 },
    { compute: (r) => { dmap = derived(); return D(r, 'revenue'); }, label: 'Revenue', fmt: (v) => fmt.usd(v) },
    { key: 'payroll', label: 'Payroll $', type: 'number', width: 76 },
    { key: 'infra', label: 'Infra $', type: 'number', width: 66 },
    { key: 'other', label: 'Other $', type: 'number', width: 66 },
    { compute: (r) => D(r, 'costs'), label: 'Costs', fmt: (v) => fmt.usd(v) },
    { compute: (r) => D(r, 'pnl'), label: 'Net P&L', fmt: (v) => fmt.usd(v) },
    { key: 'inflow', label: 'Equity in $', type: 'number', width: 80 },
    { compute: (r) => D(r, 'cash'), label: 'Cash', fmt: (v) => fmt.usd(v) },
    { key: 'headcount', label: 'HC', type: 'number', width: 46 },
    { key: 'traffic', label: 'Traffic', type: 'number', width: 92 },
    { key: 'pages', label: 'Pages/day', type: 'number', width: 86 },
    { key: 'platforms', label: 'Platforms', type: 'number', width: 60 },
    { key: 'paying', label: 'Paying', type: 'number', width: 56 },
  ];

  root.append(section('Monthly actuals', 'Traffic = monthly connected visits. Pages/day = daily connected pages (ads inventory). Definitions live in Playbooks → Metric definitions.',
    dataTable({
      columns, rows: fin.months, save,
      addLabel: '+ Add month',
      newRow: () => {
        const last = fin.months.length ? fin.months[fin.months.length - 1].month : new Date().toISOString().slice(0, 7);
        return { month: addMonths(last, 1), saas: null, ads: null, payroll: null, infra: null, other: null, inflow: 0, headcount: null, traffic: null, pages: null, platforms: null, paying: null };
      },
    })));

  const m = latestMetrics(fin);
  if (m) {
    root.append(section('Investor update block', 'Paste-ready — these exact figures go in the monthly update table. Compose it in Updates.',
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
    ['Revenue (SaaS + Ads)', `${fmt.usd(m.revenue)}  (${m.mom === null ? '—' : (m.mom >= 0 ? '+' : '') + fmt.pct(m.mom)} MoM)`],
    ['ARR run-rate', fmt.usd(m.arrRunRate)],
    ['Monthly connected traffic', `${fmt.num(m.traffic, true)}${m.trafficYoY !== null ? `  (+${fmt.pct(m.trafficYoY, 0)} YoY)` : ''}`],
    ['Daily connected pages', fmt.num(m.pages, true)],
    ['Client platforms (paying/total)', `${m.paying ?? '—'} / ${m.platforms ?? '—'}`],
    ['Net burn (3-mo avg)', m.burn3 >= 0 ? 'cash-flow positive' : fmt.usd(-m.burn3) + '/mo'],
    ['Cash / runway', `${fmt.usd(m.cash)} / ${m.runway === Infinity ? 'CF positive' : m.runway.toFixed(1) + ' months (zero-cash ' + fmt.month(m.zeroCash) + ')'}`],
  ];
  const w = Math.max(...lines.map(([l]) => l.length));
  return lines.map(([l, v]) => l.padEnd(w + 2) + v).join('\n');
}

function renderRunway(m, company) {
  if (!m) return el('div');
  const burn = m.burn3;
  const scenarios = [
    { name: 'As-is', delta: 0 },
    { name: '+1 senior engineer', delta: -8000 },
    { name: '+2 hires (eng + GTM)', delta: -15000 },
    { name: 'US GTM push', delta: -20000 },
  ];
  const remaining = (company.roundTarget || 0) * 0.8; // planning assumption: 80% of round still to wire
  const row = (s, cash) => {
    const net = burn + s.delta;
    const rw = net >= 0 ? 'CF positive' : (cash / -net).toFixed(1) + ' mo';
    return el('tr', {}, el('td', {}, s.name), el('td', { class: 'computed' }, fmt.usd(s.delta)), el('td', { class: 'computed' }, net >= 0 ? '+' + fmt.usd(net) : fmt.usd(net)), el('td', { class: 'computed' }, rw));
  };
  const tbl = (cash, title) => el('div', {}, el('div', { class: 'chart-title' }, title),
    el('table', { class: 'tbl' },
      el('thead', {}, el('tr', {}, el('th', {}, 'Scenario'), el('th', {}, 'Burn delta/mo'), el('th', {}, 'Net/mo'), el('th', {}, 'Runway'))),
      el('tbody', {}, ...scenarios.map((s) => row(s, cash)))));
  return section('Runway scenarios', 'Hiring plans against current cash, and with the remainder of the round closed. The round must buy ≥18 months or reach a priceable milestone.',
    el('div', { class: 'grid cols-2' }, tbl(m.cash, `Current cash (${fmt.usd(m.cash, true)})`), tbl(m.cash + remaining, `With round closed (+${fmt.usd(remaining, true)})`)));
}
