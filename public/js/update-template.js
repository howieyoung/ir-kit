// The industry-standard update skeleton (TL;DR / metrics / highlights / lowlights / asks), generated from real data only.
// Shared by the browser composer (updates.js) and the ir CLI (core/ops.js).
import { fmt } from './ui.js';

export function updateTemplate(company, m, crm) {
  const metricRow = (label, v) => `| ${label} | ${v} |`;
  const metrics = m ? [
    metricRow('Revenue (total)', `${fmt.usd(m.revenue)} (${m.mom === null ? '—' : (m.mom >= 0 ? '+' : '') + fmt.pct(m.mom)} MoM)`),
    metricRow('ARR run-rate', fmt.usd(m.arrRunRate)),
    metricRow('Monthly connected traffic', fmt.num(m.traffic, true) + (m.trafficYoY !== null ? ` (+${fmt.pct(m.trafficYoY, 0)} YoY)` : '')),
    metricRow('Daily connected pages', fmt.num(m.pages, true)),
    metricRow('Client platforms (paying/total)', `${m.paying ?? '—'} / ${m.platforms ?? '—'}`),
    metricRow('Net burn (3-mo avg)', m.burn3 >= 0 ? 'cash-flow positive' : fmt.usd(-m.burn3) + '/mo'),
    metricRow('Cash / runway', `${fmt.usd(m.cash)} / ${m.runway === Infinity ? 'CF positive' : m.runway.toFixed(1) + ' mo'}`),
  ].join('\n') : '| (add monthly data in Financials) | |';

  const closed = crm.commitments.filter((c) => ['Signed', 'Wired'].includes(c.stage)).reduce((s, c) => s + (c.ticket || 0), 0);
  const target = company.roundTarget || 0;
  const helpers = crm.asks.filter((a) => a.status === 'Delivered' && !a.thanked).map((a) => `- ${a.askedOf} — ${a.outcome || a.ask}`);

  return `# ${company.name} — ${m ? fmt.month(m.month) : ''} Update

## TL;DR
- [headline metric + MoM]
- [biggest win]
- [biggest risk/lowlight — yes, here]
- Cash: ${m ? `${fmt.usd(m.cash)} · ${m.runway === Infinity ? 'CF positive' : m.runway.toFixed(1) + ' months runway'}` : '[cash / runway]'}
- Ask: [the #1 ask]

## Metrics
| Metric | Value |
|---|---|
${metrics}

## Highlights
- [2–4 wins that compound: revenue, retention, marquee logos, product velocity]

## Lowlights
- [2–3 real ones: the problem, what you learned, what changes. This section is why investors trust the rest.]

## Product & roadmap
- [what shipped, what's next]

## Fundraising
- Round: ${company.roundInstrument || '[instrument]'} · ${fmt.usd(closed)} of ${fmt.usd(target)} committed

## Asks
1. [specific — name the person/company/role you need]

## Thanks
${helpers.length ? helpers.join('\n') : '- [name the investors who actually helped last month]'}

—
${company.founder || ''} · ${company.email || ''} · ${company.name}`;
}
