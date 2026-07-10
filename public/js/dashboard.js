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
      : 'Add monthly data in Financials to light this up.'));

  const nudge = renderSetupNudge();
  if (nudge) root.append(nudge);

  if (!m) return;

  const momCls = m.mom === null ? '' : m.mom >= 0 ? 'up' : 'down';
  root.append(el('div', { class: 'grid cols-4' },
    kpi(t('kpi.revenue'), fmt.usd(m.revenue, true), m.mom === null ? '' : `${m.mom >= 0 ? '▲' : '▼'} ${fmt.pct(Math.abs(m.mom))} MoM`, momCls),
    kpi(t('kpi.arr'), fmt.usd(m.arrRunRate, true), 'month revenue × 12'),
    kpi(t('kpi.burn'), m.burn3 >= 0 ? 'CF positive' : fmt.usd(-m.burn3, true) + '/mo', m.pnl >= 0 ? `+${fmt.usd(m.pnl, true)} this month` : `${fmt.usd(m.pnl, true)} this month`),
    kpi(t('kpi.cash'), fmt.usd(m.cash, true), m.runway === Infinity ? 'cash-flow positive' : `${m.runway.toFixed(1)} mo runway → ${fmt.month(m.zeroCash)}`, m.runway !== Infinity && m.runway < 6 ? 'down' : ''),
  ));

  root.append(el('div', { style: 'height:14px' }));
  root.append(el('div', { class: 'grid cols-4' },
    kpi(t('kpi.traffic'), fmt.num(m.traffic, true), m.trafficYoY === null ? '' : `${fmt.pct(m.trafficYoY, 0)} YoY`, 'up'),
    kpi(t('kpi.pages'), fmt.num(m.pages, true), 'ads inventory base'),
    kpi(t('kpi.platforms'), `${m.paying ?? '—'} / ${m.platforms ?? '—'}`, ''),
    kpi(t('kpi.headcount'), m.headcount ?? '—', ''),
  ));

  // charts
  const labels = m.series.map((r) => fmt.month(r.month));
  root.append(section(t('sec.trends'), null, el('div', { class: 'grid cols-2' },
    lineChart({ title: 'Revenue ($/mo)', labels, series: [{ values: m.series.map((r) => r.revenue), color: '#2e6da4' }], money: true }),
    lineChart({ title: 'Cash balance ($)', labels, series: [{ values: m.series.map((r) => r.cash), color: '#157347' }], money: true }),
  )));

  // round progress
  const target = company.roundTarget || 0;
  const closed = crm.commitments.filter((c) => ['Signed', 'Wired'].includes(c.stage)).reduce((s, c) => s + (c.ticket || 0), 0);
  const weighted = crm.commitments.reduce((s, c) => s + (c.ticket || 0) * (c.probability || 0), 0);
  const pctClosed = target ? Math.min(closed / target, 1) : 0;
  root.append(section(t('sec.round'), company.roundInstrument || null,
    el('div', {}, el('b', {}, fmt.usd(closed)), ` signed/wired of ${fmt.usd(target)} target · weighted pipeline ${fmt.usd(weighted)}`),
    el('div', { class: 'progress' }, el('div', { style: `width:${pctClosed * 100}%` })),
    el('div', { class: 'muted', style: 'font-size:12px' }, `${fmt.pct(pctClosed)} closed — manage in Investor CRM → Round commitments`),
  ));

  // IR cadence
  const cad = updateCadence(company, store.get('updates').archive);
  const dueChip = el('span', { class: `due-chip ${cad.overdue ? 'overdue' : cad.days <= 3 ? 'soon' : 'ok'}` },
    cad.overdue ? t('due.overdue', { n: -cad.days }) : cad.days === 0 ? t('due.today') : t('due.in', { n: cad.days }));
  root.append(section(t('sec.cadence'), null,
    el('div', { style: 'display:flex;gap:18px;align-items:center;flex-wrap:wrap' },
      el('div', {}, el('b', {}, `Next update: ${cad.due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} `), dueChip),
      el('div', { class: 'muted' }, cad.lastSent ? `Last sent ${cad.lastSent}` : 'No update sent yet — the streak starts with the first one'),
      el('div', { class: 'muted' }, cad.streak > 0 ? `Streak: ${cad.streak} month${cad.streak > 1 ? 's' : ''} 🔥` : ''),
      el('a', { href: '#/updates', style: 'margin-left:auto' }, 'Compose →'),
    )));

  // follow-ups due
  const open = crm.interactions.filter((i) => !i.done && i.followUp);
  const openAsks = crm.asks.filter((a) => a.status === 'Open');
  root.append(section(t('sec.loops'), 'Follow-ups owed and asks in flight — from the CRM.',
    el('ul', {},
      ...open.map((i) => el('li', {}, `${i.followUp} — ${i.investor} (due ${i.due || 'unset'})`)),
      ...openAsks.map((a) => el('li', {}, `ASK: ${a.ask} → ${a.askedOf}`)),
      (!open.length && !openAsks.length) ? el('li', { class: 'muted' }, 'Nothing pending. Log interactions as they happen.') : null,
    ),
  ));
}
