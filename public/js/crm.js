import { el, fmt, section, dataTable, tabs } from './ui.js';
import { store, uid } from './store.js';
import { pageCoach } from './onboarding.js';
import { t } from './i18n.js';

export function renderCrm(root) {
  root.append(el('h1', {}, t('crm.title')));
  root.append(el('p', { class: 'page-sub' }, t('crm.sub')));
  const coach = pageCoach('crm'); if (coach) root.append(coach);
  root.append(tabs([
    { label: t('crm.tab.commitments'), render: renderCommitments },
    { label: t('crm.tab.investors'), render: renderInvestors },
    { label: t('crm.tab.interactions'), render: renderInteractions },
    { label: t('crm.tab.asks'), render: renderAsks },
    { label: t('crm.tab.distribution'), render: renderDistribution },
  ]));
}

const save = () => store.persist('crm');
const STAGES = ['Contacted', 'Meeting', 'Verbal', 'SAFE sent', 'Signed', 'Wired', 'Passed'];
const opt = (ns) => (v) => ({ value: v, label: t(`opt.${ns}.${v}`) });

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
        stat(t('crm.statTarget'), fmt.usd(target)), stat(t('crm.statClosed'), fmt.usd(closed)), stat(t('crm.statWeighted'), fmt.usd(weighted))),
      el('div', { class: 'progress' }, el('div', { style: `width:${target ? Math.min(closed / target * 100, 100) : 0}%` })),
      el('div', { class: 'muted', style: 'font-size:12px;margin-bottom:10px' },
        t('crm.probGuide', { pct: fmt.pct(target ? closed / target : 0), gap: fmt.usd(Math.max(target - closed, 0)) })),
    );
  }
  drawSummary();

  wrap.append(section(t('crm.sec.commitments'), t('crm.sec.commitmentsNote'),
    summary,
    dataTable({
      columns: [
        { key: 'investor', label: t('col.investor'), type: 'text', width: 150 },
        { key: 'source', label: t('col.source'), type: 'text', width: 120 },
        { key: 'ticket', label: t('col.ticket'), type: 'number', width: 90 },
        { key: 'stage', label: t('col.stage'), type: 'select', options: STAGES.map(opt('stage')) },
        { key: 'probability', label: t('col.prob'), type: 'number', width: 60, placeholder: '0–1' },
        { compute: (r) => (r.stage === 'Passed' ? 0 : (r.ticket || 0) * (r.probability || 0)), label: t('col.weighted'), fmt: (v) => fmt.usd(v) },
        { key: 'nextAction', label: t('col.nextAction'), type: 'text', width: 180 },
        { key: 'owner', label: t('col.owner'), type: 'text', width: 70 },
        { key: 'lastTouch', label: t('col.lastTouch'), type: 'date', width: 120 },
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
  return section(t('crm.sec.investors'), t('crm.sec.investorsNote'),
    dataTable({
      columns: [
        { key: 'name', label: t('col.investor'), type: 'text', width: 150 },
        { key: 'type', label: t('col.type'), type: 'select', options: ['Fund', 'Accelerator', 'Angel', 'Program', 'Other'].map(opt('inv')) },
        { key: 'contact', label: t('col.contact'), type: 'text', width: 120 },
        { key: 'email', label: t('col.email'), type: 'text', width: 160 },
        { key: 'instrument', label: t('col.instrument'), type: 'text', width: 110 },
        { key: 'amount', label: t('col.amount'), type: 'number', width: 90 },
        { key: 'cap', label: t('col.capShort'), type: 'number', width: 100 },
        { key: 'segment', label: t('col.segment'), type: 'select', options: ['Board/Major', 'All investors', 'Prospect nurture'].map(opt('seg')) },
        { key: 'notes', label: t('col.notes'), type: 'text', width: 200 },
      ],
      rows: crm.investors, save,
      newRow: () => ({ id: uid(), name: '', type: 'Angel', contact: '', email: '', instrument: 'SAFE', amount: null, cap: null, segment: 'All investors', notes: '' }),
      footer: () => el('tr', { class: 'total-row' },
        el('td', {}, t('crm.totalEquity')), el('td', {}), el('td', {}), el('td', {}), el('td', {}),
        el('td', { class: 'computed' }, fmt.usd(crm.investors.reduce((s, r) => s + (r.amount || 0), 0))),
        el('td', {}), el('td', {}), el('td', {}), el('td', {})),
    }));
}

function renderInteractions() {
  const crm = store.get('crm');
  return section(t('crm.sec.interactions'), t('crm.sec.interactionsNote'),
    dataTable({
      columns: [
        { key: 'date', label: t('col.date'), type: 'date', width: 120 },
        { key: 'investor', label: t('col.investor'), type: 'text', width: 140 },
        { key: 'type', label: t('col.type'), type: 'select', options: ['Email', 'Call', 'Meeting', 'Intro', 'Other'].map(opt('itype')) },
        { key: 'summary', label: t('col.summary'), type: 'text', width: 260 },
        { key: 'followUp', label: t('col.followUp'), type: 'text', width: 180 },
        { key: 'due', label: t('col.due'), type: 'date', width: 120 },
        { key: 'done', label: t('col.done'), type: 'check', width: 40 },
      ],
      rows: crm.interactions, save,
      newRow: () => ({ id: uid(), date: new Date().toISOString().slice(0, 10), investor: '', type: 'Email', summary: '', followUp: '', due: '', done: false }),
    }));
}

function renderAsks() {
  const crm = store.get('crm');
  return section(t('crm.sec.asks'), t('crm.sec.asksNote'),
    dataTable({
      columns: [
        { key: 'date', label: t('col.date'), type: 'date', width: 120 },
        { key: 'ask', label: t('col.ask'), type: 'text', width: 280 },
        { key: 'askedOf', label: t('col.askedOf'), type: 'text', width: 150 },
        { key: 'status', label: t('col.status'), type: 'select', options: ['Open', 'In progress', 'Delivered', 'Dropped'].map(opt('ask')) },
        { key: 'outcome', label: t('col.outcome'), type: 'text', width: 200 },
        { key: 'thanked', label: t('col.thanked'), type: 'check', width: 50 },
      ],
      rows: crm.asks, save,
      newRow: () => ({ id: uid(), date: new Date().toISOString().slice(0, 10), ask: '', askedOf: '', status: 'Open', outcome: '', thanked: false }),
    }));
}

function renderDistribution() {
  const crm = store.get('crm');
  const wrap = el('div');
  wrap.append(section(t('crm.sec.distribution'), t('crm.sec.distributionNote'),
    dataTable({
      columns: [
        { key: 'name', label: t('col.name'), type: 'text', width: 180 },
        { key: 'email', label: t('col.email'), type: 'text', width: 200 },
        { key: 'segment', label: t('col.segment'), type: 'select', options: ['Board/Major', 'All investors', 'Prospect nurture'].map(opt('seg')) },
        { key: 'active', label: t('col.active'), type: 'check', width: 50 },
        { key: 'lastSent', label: t('col.lastSent'), type: 'date', width: 120 },
        { key: 'notes', label: t('col.notes'), type: 'text', width: 180 },
      ],
      rows: crm.distribution, save,
      newRow: () => ({ id: uid(), name: '', email: '', segment: 'All investors', active: true, lastSent: '', notes: '' }),
    })));
  const active = crm.distribution.filter((d) => d.active && d.email);
  wrap.append(el('div', { class: 'callout' }, t('crm.distActive', { n: active.length })));
  return wrap;
}
