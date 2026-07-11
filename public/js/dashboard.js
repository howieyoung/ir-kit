import { el, fmt, kpi, section, lineChart } from './ui.js';
import { store } from './store.js';
import { latestMetrics, updateCadence } from './metrics.js';
import { renderSetupNudge } from './onboarding.js';
import { t } from './i18n.js';

export function renderDashboard(root) {
  const fin = store.get('financials');
  const crm = store.get('crm');
  const company = store.get('company');
  const m = latestMetrics(fin);

  root.append(el('h1', {}, t('dashboard.title')));
  root.append(el('p', { class: 'page-sub' },
    m ? t('dashboard.sub', { month: fmt.month(m.month) })
      : t('dashboard.empty')));

  const nudge = renderSetupNudge();
  if (nudge) root.append(nudge);

  if (!m) return;

  const momCls = m.mom === null ? '' : m.mom >= 0 ? 'up' : 'down';
  root.append(el('div', { class: 'grid cols-4' },
    kpi(t('kpi.revenue'), fmt.usd(m.revenue, true), m.mom === null ? '' : `${m.mom >= 0 ? '▲' : '▼'} ` + t('kpi.sub.mom', { pct: fmt.pct(Math.abs(m.mom)) }), momCls),
    kpi(t('kpi.arr'), fmt.usd(m.arrRunRate, true), t('kpi.sub.arr')),
    kpi(t('kpi.burn'), m.burn3 >= 0 ? t('rw.cf') : fmt.usd(-m.burn3, true) + t('blk.perMonth'), t('kpi.sub.thisMonth', { v: (m.pnl >= 0 ? '+' : '') + fmt.usd(m.pnl, true) })),
    kpi(t('kpi.cash'), fmt.usd(m.cash, true), m.runway === Infinity ? t('kpi.cfPositive') : t('kpi.sub.runway', { m: m.runway.toFixed(1), date: fmt.month(m.zeroCash) }), m.runway !== Infinity && m.runway < 6 ? 'down' : ''),
  ));

  root.append(el('div', { style: 'height:14px' }));
  root.append(el('div', { class: 'grid cols-4' },
    kpi(t('kpi.traffic'), fmt.num(m.traffic, true), m.trafficYoY === null ? '' : t('kpi.sub.yoy', { pct: fmt.pct(m.trafficYoY, 0) }), 'up'),
    kpi(t('kpi.pages'), fmt.num(m.pages, true), t('kpi.sub.pages')),
    kpi(t('kpi.platforms'), `${m.paying ?? '—'} / ${m.platforms ?? '—'}`, ''),
    kpi(t('kpi.headcount'), m.headcount ?? '—', ''),
  ));

  // charts
  const labels = m.series.map((r) => fmt.month(r.month));
  root.append(section(t('sec.trends'), null, el('div', { class: 'grid cols-2' },
    lineChart({ title: t('chart.revenue'), labels, series: [{ values: m.series.map((r) => r.revenue), color: '#2e6da4' }], money: true }),
    lineChart({ title: t('chart.cash'), labels, series: [{ values: m.series.map((r) => r.cash), color: '#157347' }], money: true }),
  )));

  // round progress
  const target = company.roundTarget || 0;
  const closed = crm.commitments.filter((c) => ['Signed', 'Wired'].includes(c.stage)).reduce((s, c) => s + (c.ticket || 0), 0);
  const weighted = crm.commitments.reduce((s, c) => s + (c.ticket || 0) * (c.probability || 0), 0);
  const pctClosed = target ? Math.min(closed / target, 1) : 0;
  root.append(section(t('sec.round'), company.roundInstrument || null,
    el('div', {}, el('b', {}, fmt.usd(closed)), ' ' + t('round.progress', { closed: '', target: fmt.usd(target), weighted: fmt.usd(weighted) }).trim()),
    el('div', { class: 'progress' }, el('div', { style: `width:${pctClosed * 100}%` })),
    el('div', { class: 'muted', style: 'font-size:12px' }, t('round.manage', { pct: fmt.pct(pctClosed) })),
  ));

  // IR cadence
  const cad = updateCadence(company, store.get('updates').archive);
  const dueChip = el('span', { class: `due-chip ${cad.overdue ? 'overdue' : cad.days <= 3 ? 'soon' : 'ok'}` },
    cad.overdue ? t('due.overdue', { n: -cad.days }) : cad.days === 0 ? t('due.today') : t('due.in', { n: cad.days }));
  root.append(section(t('sec.cadence'), null,
    el('div', { style: 'display:flex;gap:18px;align-items:center;flex-wrap:wrap' },
      el('div', {}, el('b', {}, t('cadence.next', { date: cad.due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })), dueChip),
      el('div', { class: 'muted' }, cad.lastSent ? t('cadence.lastSent', { date: cad.lastSent }) : t('cadence.noneSent')),
      el('div', { class: 'muted' }, cad.streak > 0 ? t('cadence.streak', { n: cad.streak }) : ''),
      el('a', { href: '#/updates', style: 'margin-left:auto' }, t('cadence.compose')),
    )));

  // follow-ups due
  const open = crm.interactions.filter((i) => !i.done && i.followUp);
  const openAsks = crm.asks.filter((a) => a.status === 'Open');
  root.append(section(t('sec.loops'), t('sec.loopsNote'),
    el('ul', {},
      ...open.map((i) => el('li', {}, t('loops.item', { followUp: i.followUp, investor: i.investor, due: i.due || t('loops.dueUnset') }))),
      ...openAsks.map((a) => el('li', {}, t('loops.ask', { ask: a.ask, who: a.askedOf }))),
      (!open.length && !openAsks.length) ? el('li', { class: 'muted' }, t('loops.none')) : null,
    ),
  ));
}
