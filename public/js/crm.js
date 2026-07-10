import { el, fmt, section, dataTable, tabs } from './ui.js';
import { store, uid } from './store.js';
import { pageCoach } from './onboarding.js';

export function renderCrm(root) {
  root.append(el('h1', {}, 'Investor CRM'));
  root.append(el('p', { class: 'page-sub' }, 'Current investors, sourced prospects, and the active round. Log within 24 hours of contact or it didn\'t happen. Your agent can source fitted prospects into this pipeline (Prospect nurture) — see the agent guide.'));
  const coach = pageCoach('crm'); if (coach) root.append(coach);
  root.append(tabs([
    { label: 'Round commitments', render: renderCommitments },
    { label: 'Current investors', render: renderInvestors },
    { label: 'Interaction log', render: renderInteractions },
    { label: 'Asks & intros', render: renderAsks },
    { label: 'Update distribution', render: renderDistribution },
  ]));
}

const save = () => store.persist('crm');
const STAGES = ['Contacted', 'Meeting', 'Verbal', 'SAFE sent', 'Signed', 'Wired', 'Passed'];

function renderCommitments() {
  const crm = store.get('crm');
  const company = store.get('company');
  const wrap = el('div');
  const target = company.roundTarget || 0;

  const summary = el('div');
  function drawSummary() {
    const closed = crm.commitments.filter((c) => ['Signed', 'Wired'].includes(c.stage)).reduce((s, c) => s + (c.ticket || 0), 0);
    const weighted = crm.commitments.filter((c) => c.stage !== 'Passed').reduce((s, c) => s + (c.ticket || 0) * (c.probability || 0), 0);
    summary.innerHTML = '';
    summary.append(
      el('div', { class: 'grid cols-3', style: 'margin-bottom:12px' },
        stat('Target', fmt.usd(target)), stat('Signed + wired', fmt.usd(closed)), stat('Weighted pipeline', fmt.usd(weighted))),
      el('div', { class: 'progress' }, el('div', { style: `width:${target ? Math.min(closed / target * 100, 100) : 0}%` })),
      el('div', { class: 'muted', style: 'font-size:12px;margin-bottom:10px' },
        `${fmt.pct(target ? closed / target : 0)} closed · gap ${fmt.usd(Math.max(target - closed, 0))} · probability guide: Meeting 10% / Verbal 50% / SAFE sent 75% / Signed 90% / Wired 100%`),
    );
  }
  drawSummary();

  wrap.append(section('Round commitments', 'Wired check → same day: countersign, thank, add to distribution list, and enter the SAFE in Cap Table → SAFE ledger.',
    summary,
    dataTable({
      columns: [
        { key: 'investor', label: 'Investor', type: 'text', width: 150 },
        { key: 'source', label: 'Source', type: 'text', width: 120 },
        { key: 'ticket', label: 'Ticket $', type: 'number', width: 90 },
        { key: 'stage', label: 'Stage', type: 'select', options: STAGES },
        { key: 'probability', label: 'Prob.', type: 'number', width: 60, placeholder: '0–1' },
        { compute: (r) => (r.stage === 'Passed' ? 0 : (r.ticket || 0) * (r.probability || 0)), label: 'Weighted', fmt: (v) => fmt.usd(v) },
        { key: 'nextAction', label: 'Next action', type: 'text', width: 180 },
        { key: 'owner', label: 'Owner', type: 'text', width: 70 },
        { key: 'lastTouch', label: 'Last touch', type: 'date', width: 120 },
      ],
      rows: crm.commitments,
      save: () => { save(); drawSummary(); },
      newRow: () => ({ id: uid(), investor: '', source: '', ticket: null, stage: 'Contacted', probability: 0.1, nextAction: '', owner: '', lastTouch: '' }),
    })));
  return wrap;
}

const stat = (label, value) => el('div', { class: 'kpi' }, el('div', { class: 'k-label' }, label), el('div', { class: 'k-value', style: 'font-size:18px' }, value));

function renderInvestors() {
  const crm = store.get('crm');
  return section('Current investors & programs', 'Must reconcile 1:1 with the SAFE ledger. Credits-only programs are not equity investors — mark them clearly.',
    dataTable({
      columns: [
        { key: 'name', label: 'Investor', type: 'text', width: 150 },
        { key: 'type', label: 'Type', type: 'select', options: ['Fund', 'Accelerator', 'Angel', 'Program', 'Other'] },
        { key: 'contact', label: 'Contact', type: 'text', width: 120 },
        { key: 'email', label: 'Email', type: 'text', width: 160 },
        { key: 'instrument', label: 'Instrument', type: 'text', width: 110 },
        { key: 'amount', label: 'Amount $', type: 'number', width: 90 },
        { key: 'cap', label: 'Cap $', type: 'number', width: 100 },
        { key: 'segment', label: 'Segment', type: 'select', options: ['Board/Major', 'All investors', 'Prospect nurture'] },
        { key: 'notes', label: 'Notes', type: 'text', width: 200 },
      ],
      rows: crm.investors, save,
      newRow: () => ({ id: uid(), name: '', type: 'Angel', contact: '', email: '', instrument: 'SAFE', amount: null, cap: null, segment: 'All investors', notes: '' }),
      footer: () => el('tr', { class: 'total-row' },
        el('td', {}, 'TOTAL EQUITY'), el('td', {}), el('td', {}), el('td', {}), el('td', {}),
        el('td', { class: 'computed' }, fmt.usd(crm.investors.reduce((s, r) => s + (r.amount || 0), 0))),
        el('td', {}), el('td', {}), el('td', {}), el('td', {})),
    }));
}

function renderInteractions() {
  const crm = store.get('crm');
  return section('Interaction log', 'Every meaningful contact: substantive emails, calls, meetings, intros.',
    dataTable({
      columns: [
        { key: 'date', label: 'Date', type: 'date', width: 120 },
        { key: 'investor', label: 'Investor', type: 'text', width: 140 },
        { key: 'type', label: 'Type', type: 'select', options: ['Email', 'Call', 'Meeting', 'Intro', 'Other'] },
        { key: 'summary', label: 'Summary', type: 'text', width: 260 },
        { key: 'followUp', label: 'Follow-up owed', type: 'text', width: 180 },
        { key: 'due', label: 'Due', type: 'date', width: 120 },
        { key: 'done', label: 'Done', type: 'check', width: 40 },
      ],
      rows: crm.interactions, save,
      newRow: () => ({ id: uid(), date: new Date().toISOString().slice(0, 10), investor: '', type: 'Email', summary: '', followUp: '', due: '', done: false }),
    }));
}

function renderAsks() {
  const crm = store.get('crm');
  return section('Asks & intros', 'Specific asks get action. Delivered asks feed the Thanks section of the next update — that trains investors to keep helping.',
    dataTable({
      columns: [
        { key: 'date', label: 'Date', type: 'date', width: 120 },
        { key: 'ask', label: 'Ask (specific)', type: 'text', width: 280 },
        { key: 'askedOf', label: 'Asked of', type: 'text', width: 150 },
        { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In progress', 'Delivered', 'Dropped'] },
        { key: 'outcome', label: 'Outcome', type: 'text', width: 200 },
        { key: 'thanked', label: 'Thanked', type: 'check', width: 50 },
      ],
      rows: crm.asks, save,
      newRow: () => ({ id: uid(), date: new Date().toISOString().slice(0, 10), ask: '', askedOf: '', status: 'Open', outcome: '', thanked: false }),
    }));
}

function renderDistribution() {
  const crm = store.get('crm');
  const wrap = el('div');
  wrap.append(section('Update distribution list', 'Board/Major get full detail; All investors get the monthly update; Prospect nurture gets the same update — a "too early" pass plus six strong months is a warm second meeting. BCC or mail-merge only.',
    dataTable({
      columns: [
        { key: 'name', label: 'Name', type: 'text', width: 180 },
        { key: 'email', label: 'Email', type: 'text', width: 200 },
        { key: 'segment', label: 'Segment', type: 'select', options: ['Board/Major', 'All investors', 'Prospect nurture'] },
        { key: 'active', label: 'Active', type: 'check', width: 50 },
        { key: 'lastSent', label: 'Last sent', type: 'date', width: 120 },
        { key: 'notes', label: 'Notes', type: 'text', width: 180 },
      ],
      rows: crm.distribution, save,
      newRow: () => ({ id: uid(), name: '', email: '', segment: 'All investors', active: true, lastSent: '', notes: '' }),
    })));
  const active = crm.distribution.filter((d) => d.active && d.email);
  wrap.append(el('div', { class: 'callout' },
    `${active.length} active recipients with email addresses. Compose in Updates → the send button builds a BCC mailto for the segment you pick.`));
  return wrap;
}
