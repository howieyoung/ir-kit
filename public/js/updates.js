import { el, fmt, section } from './ui.js';
import { store, uid } from './store.js';
import { latestMetrics, updateCadence } from './metrics.js';
import { updateTemplate } from './update-template.js';
import { pageCoach } from './onboarding.js';
import { t } from './i18n.js';

export function renderUpdates(root) {
  const updates = store.get('updates');
  root.append(el('h1', {}, t('updates.title')));
  root.append(el('p', { class: 'page-sub' }, t('updates.sub')));
  const coach = pageCoach('updates'); if (coach) root.append(coach);

  root.append(renderSchedule(updates));
  root.append(renderComposer());

  // archive
  const arch = section(t('updates.sec.archive'), t('upd.archiveNote'),
    updates.archive.length
      ? el('div', {}, ...[...updates.archive].reverse().map((u) => archiveItem(u)))
      : el('div', { class: 'muted' }, t('upd.archiveEmpty')));
  root.append(arch);
}

function archiveItem(u) {
  const box = el('details', { style: 'border:1px solid var(--line);border-radius:8px;padding:10px 14px;margin-bottom:8px' });
  box.append(el('summary', { style: 'cursor:pointer;font-weight:600' }, `${u.subject} — ` + (u.sentAt ? t('upd.sentAt', { date: u.sentAt }) : t('upd.draft'))));
  box.append(el('pre', { style: 'font-family:var(--mono);font-size:12px;white-space:pre-wrap;line-height:1.5' }, u.body));
  box.append(el('div', { class: 'btn-row' },
    el('button', { class: 'btn secondary small', onclick: () => navigator.clipboard.writeText(u.body) }, t('common.copy')),
    el('button', {
      class: 'btn danger small', onclick: () => {
        if (!confirm(t('upd.deleteConfirm'))) return;
        store.update('updates', (up) => up.archive.splice(up.archive.findIndex((x) => x.id === u.id), 1));
        box.remove();
      },
    }, t('common.delete'))));
  return box;
}

function renderSchedule(updates) {
  const company = store.get('company');
  const cad = updateCadence(company, updates.archive);
  const chip = el('span', { class: `due-chip ${cad.overdue ? 'overdue' : cad.days <= 3 ? 'soon' : 'ok'}` },
    cad.overdue ? t('due.overdue', { n: -cad.days }) : cad.days === 0 ? t('due.today') : t('due.in', { n: cad.days }));
  return section(t('updates.sec.schedule'), t('upd.schedNote', { day: cad.day }),
    el('div', { style: 'display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:6px' },
      el('div', {}, el('b', {}, t('upd.next', { date: cad.due.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) })), chip),
      el('div', { class: 'muted' }, cad.streak > 0 ? t('upd.streak', { n: cad.streak }) : t('upd.noStreak')),
    ),
    el('div', { class: 'btn-row' },
      el('button', { class: 'btn secondary small', onclick: () => downloadIcs(company, cad) }, t('upd.ics')),
    ),
    el('div', { class: 'callout', style: 'margin-top:10px' },
      t('upd.callout'),
      el('a', { href: 'https://github.com/howieyoung/ir-kit/blob/main/prompts/schedule-updates.md', target: '_blank' }, 'prompts/schedule-updates.md'), '.'));
}

// Recurring calendar events: monthly update on day N, plus a quarterly board-pack reminder.
function downloadIcs(company, cad) {
  const d8 = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const now = new Date();
  const qMonths = [0, 3, 6, 9]; // Jan Apr Jul Oct
  let bp = new Date(now.getFullYear(), now.getMonth(), 15);
  while (!qMonths.includes(bp.getMonth()) || bp <= now) bp = new Date(bp.getFullYear(), bp.getMonth() + 1, 15);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IR Kit//EN',
    'BEGIN:VEVENT', `UID:irkit-update-${Date.now()}@irkit`, `DTSTART;VALUE=DATE:${d8(cad.due)}`,
    `RRULE:FREQ=MONTHLY;BYMONTHDAY=${cad.day}`,
    `SUMMARY:Send ${company.name || ''} investor update`,
    'DESCRIPTION:Close the month first (Financials) — then compose in IR Kit → Updates. Never skip a bad month.',
    'END:VEVENT',
    'BEGIN:VEVENT', `UID:irkit-board-${Date.now()}@irkit`, `DTSTART;VALUE=DATE:${d8(bp)}`,
    'RRULE:FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=15',
    `SUMMARY:${company.name || ''} board/investor-council pack`,
    'DESCRIPTION:Assemble from Playbooks → Board pack. Send 72 hours before the meeting.',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'ir-kit-cadence.ics';
  a.click();
}

function renderComposer() {
  const company = store.get('company');
  const fin = store.get('financials');
  const crm = store.get('crm');
  const m = latestMetrics(fin);

  const monthLabel = m ? fmt.month(m.month) : new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const subjectInput = el('input', { value: `${company.name} — ${monthLabel} Update: [headline metric or milestone]` });
  const body = el('textarea', { class: 'composer' });
  body.value = updateTemplate(company, m, crm);

  const segSelect = el('select', {},
    ...['All investors', 'Board/Major', 'Prospect nurture', 'Everyone active'].map((s) => el('option', { value: s }, t('opt.seg.' + s))));

  const sendRow = el('div', { class: 'btn-row' },
    el('button', { class: 'btn secondary', onclick: () => { body.value = updateTemplate(company, latestMetrics(store.get('financials')), store.get('crm')); } }, t('upd.refill')),
    el('button', { class: 'btn secondary', onclick: () => navigator.clipboard.writeText(body.value) }, t('upd.copyMd')),
    el('button', {
      class: 'btn', onclick: () => {
        const seg = segSelect.value;
        const recipients = crm.distribution.filter((d) => d.active && d.email && (seg === 'Everyone active' || d.segment === seg)).map((d) => d.email);
        if (!recipients.length) { alert(t('upd.noRecipients')); return; }
        const mailto = `mailto:?bcc=${encodeURIComponent(recipients.join(','))}&subject=${encodeURIComponent(subjectInput.value)}&body=${encodeURIComponent(body.value)}`;
        if (mailto.length > 7500) { navigator.clipboard.writeText(body.value); alert(t('upd.tooLong', { recipients: recipients.join(', ') })); return; }
        location.href = mailto;
      },
    }, t('upd.openEmail')),
    el('button', {
      class: 'btn', onclick: () => {
        store.update('updates', (up) => up.archive.push({
          id: uid(), month: m ? m.month : '', subject: subjectInput.value, body: body.value,
          sentAt: new Date().toISOString().slice(0, 10),
        }));
        alert(t('upd.archived'));
        location.reload();
      },
    }, t('upd.markSent')));

  return section(t('updates.sec.compose'), t('upd.composeNote'),
    el('div', { class: 'field' }, el('label', {}, t('upd.subject')), subjectInput),
    el('div', { class: 'field' }, el('label', {}, t('upd.body')), body),
    el('div', { class: 'inline-fields' }, el('div', { class: 'field', style: 'max-width:240px' }, el('label', {}, t('upd.segment')), segSelect)),
    sendRow);
}

