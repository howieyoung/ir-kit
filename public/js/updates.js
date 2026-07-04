import { el, fmt, section } from './ui.js';
import { store, uid } from './store.js';
import { latestMetrics } from './metrics.js';

export function renderUpdates(root) {
  const updates = store.get('updates');
  root.append(el('h1', {}, 'Investor Updates'));
  root.append(el('p', { class: 'page-sub' }, 'YC-format monthly update: TL;DR, metrics, highlights, lowlights, asks, thanks. The streak is the asset — same day every month, never skip a bad one.'));

  root.append(renderComposer());

  // archive
  const arch = section('Archive', 'A future lead investor will read this entire archive back-to-back. Consistency of metrics and honesty of lowlights are what they grade.',
    updates.archive.length
      ? el('div', {}, ...[...updates.archive].reverse().map((u) => archiveItem(u)))
      : el('div', { class: 'muted' }, 'No updates sent yet. Compose the first one above — the streak starts now.'));
  root.append(arch);
}

function archiveItem(u) {
  const box = el('details', { style: 'border:1px solid var(--line);border-radius:8px;padding:10px 14px;margin-bottom:8px' });
  box.append(el('summary', { style: 'cursor:pointer;font-weight:600' }, `${u.subject} — sent ${u.sentAt || 'draft'}`));
  box.append(el('pre', { style: 'font-family:var(--mono);font-size:12px;white-space:pre-wrap;line-height:1.5' }, u.body));
  box.append(el('div', { class: 'btn-row' },
    el('button', { class: 'btn secondary small', onclick: () => navigator.clipboard.writeText(u.body) }, 'Copy'),
    el('button', {
      class: 'btn danger small', onclick: () => {
        if (!confirm('Delete this archived update?')) return;
        store.update('updates', (up) => up.archive.splice(up.archive.findIndex((x) => x.id === u.id), 1));
        box.remove();
      },
    }, 'Delete')));
  return box;
}

function renderComposer() {
  const company = store.get('company');
  const fin = store.get('financials');
  const crm = store.get('crm');
  const m = latestMetrics(fin);

  const monthLabel = m ? fmt.month(m.month) : new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const subjectInput = el('input', { value: `${company.name} — ${monthLabel} Update: [headline metric or milestone]` });
  const body = el('textarea', { class: 'composer' });
  body.value = template(company, m, crm);

  const segSelect = el('select', {},
    ...['All investors', 'Board/Major', 'Prospect nurture', 'Everyone active'].map((s) => el('option', { value: s }, s)));

  const sendRow = el('div', { class: 'btn-row' },
    el('button', { class: 'btn secondary', onclick: () => { body.value = template(company, latestMetrics(store.get('financials')), store.get('crm')); } }, '↻ Refill metrics'),
    el('button', { class: 'btn secondary', onclick: () => navigator.clipboard.writeText(body.value) }, 'Copy markdown'),
    el('button', {
      class: 'btn', onclick: () => {
        const seg = segSelect.value;
        const recipients = crm.distribution.filter((d) => d.active && d.email && (seg === 'Everyone active' || d.segment === seg)).map((d) => d.email);
        if (!recipients.length) { alert('No active recipients with emails in that segment — fill CRM → Update distribution first.'); return; }
        const mailto = `mailto:?bcc=${encodeURIComponent(recipients.join(','))}&subject=${encodeURIComponent(subjectInput.value)}&body=${encodeURIComponent(body.value)}`;
        if (mailto.length > 7500) { navigator.clipboard.writeText(body.value); alert('Update copied to clipboard (too long for a mailto link). Recipients (BCC): ' + recipients.join(', ')); return; }
        location.href = mailto;
      },
    }, 'Open in email (BCC)'),
    el('button', {
      class: 'btn', onclick: () => {
        store.update('updates', (up) => up.archive.push({
          id: uid(), month: m ? m.month : '', subject: subjectInput.value, body: body.value,
          sentAt: new Date().toISOString().slice(0, 10),
        }));
        alert('Archived. Now log the send date per recipient in CRM → Update distribution.');
        location.reload();
      },
    }, 'Mark sent → archive'));

  return section('Compose', 'Metrics are pre-filled from Financials — never hand-type a number. Fill the brackets, cut until it reads in 3 minutes.',
    el('div', { class: 'field' }, el('label', {}, 'Subject'), subjectInput),
    el('div', { class: 'field' }, el('label', {}, 'Body (markdown)'), body),
    el('div', { class: 'inline-fields' }, el('div', { class: 'field', style: 'max-width:240px' }, el('label', {}, 'Send to segment'), segSelect)),
    sendRow);
}

function template(company, m, crm) {
  const metricRow = (label, v) => `| ${label} | ${v} |`;
  const metrics = m ? [
    metricRow('Revenue (SaaS + Ads)', `${fmt.usd(m.revenue)} (${m.mom === null ? '—' : (m.mom >= 0 ? '+' : '') + fmt.pct(m.mom)} MoM)`),
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
