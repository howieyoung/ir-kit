import { store } from './store.js';
import { el, section } from './ui.js';
import { renderDashboard } from './dashboard.js';
import { renderFinancials } from './financials.js';
import { renderCapTable } from './captable.js';
import { renderCrm } from './crm.js';
import { renderUpdates } from './updates.js';
import { renderPlaybooks } from './playbooks.js';
import { renderGuide } from './guide.js';
import { VERSION, REPO_URL } from './version.js';
import { t, LOCALES, getLocale, setLocale } from './i18n.js';
import { loadContent } from './content.js';

const routes = {
  guide: renderGuide,
  dashboard: renderDashboard,
  financials: renderFinancials,
  captable: renderCapTable,
  crm: renderCrm,
  updates: renderUpdates,
  playbooks: renderPlaybooks,
  settings: renderSettings,
};

function currentRoute() {
  const r = location.hash.replace(/^#\//, '');
  return routes[r] ? r : 'dashboard';
}

function render() {
  const route = currentRoute();
  document.querySelectorAll('#nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
    a.textContent = t('nav.' + a.dataset.route);
  });
  document.getElementById('foot-tagline').textContent = t('app.footTagline');
  document.getElementById('sample-banner-text').textContent = t('app.sampleBanner');
  document.getElementById('sample-dismiss').textContent = t('app.dismiss');
  const main = document.getElementById('main');
  main.innerHTML = '';
  routes[route](main);
  const company = store.get('company');
  renderBrand(company);
  const banner = document.getElementById('sample-banner');
  banner.hidden = !(company?.sample) || sessionStorage.getItem('irkit:banner-dismissed');
}

function renderLocalePicker() {
  const slot = document.getElementById('locale-slot');
  slot.innerHTML = '';
  slot.append(el('select', {
    'aria-label': t('app.language'),
    onchange: async (e) => { setLocale(e.target.value); await loadContent(); render(); renderLocalePicker(); },
  }, ...Object.entries(LOCALES).map(([code, label]) =>
    el('option', { value: code, selected: code === getLocale() ? '' : null }, label))));
}

function renderBrand(company) {
  const box = document.getElementById('brand-company');
  box.innerHTML = '';
  box.append(company?.name || '');
  if (company?.sample) {
    box.append(el('div', {}, el('span', {
      class: 'sample-pill', title: t('pill.title'),
      onclick: () => { location.hash = '#/settings'; },
    }, t('pill.sample'))));
  }
}

function renderSettings(root) {
  const company = store.get('company');
  root.append(el('h1', {}, t('settings.title')));
  root.append(el('p', { class: 'page-sub' }, store.mode === 'server' ? t('set.modeServer') : t('set.modeDemo')));

  const field = (label, key, type = 'text') => el('div', { class: 'field' },
    el('label', {}, label),
    el('input', {
      type, value: company[key] ?? '', step: 'any',
      onchange: (e) => store.update('company', (c) => { c[key] = type === 'number' ? Number(e.target.value) : e.target.value; }),
    }));

  root.append(section(t('settings.sec.profile'), t('set.profileNote'),
    el('div', { class: 'grid cols-2' },
      field(t('set.name'), 'name'), field(t('set.founder'), 'founder'),
      field(t('set.email'), 'email'), field(t('set.roundTarget'), 'roundTarget', 'number'),
      field(t('set.updateDay'), 'updateDay', 'number')),
    field(t('set.instrument'), 'roundInstrument'),
    el('div', { class: 'field' }, el('label', {}, t('set.sampleFlag')),
      el('label', { style: 'font-weight:400;display:flex;gap:8px;align-items:center' },
        (() => { const cb = el('input', { type: 'checkbox', onchange: (e) => store.update('company', (c) => { c.sample = e.target.checked; }) }); cb.checked = !!company.sample; return cb; })(),
        t('set.sampleFlagDesc'))),
  ));

  const file = el('input', { type: 'file', accept: '.json', style: 'display:none', onchange: async (e) => {
    if (!e.target.files[0]) return;
    try { await store.importAll(e.target.files[0]); alert(t('set.imported')); render(); }
    catch (err) { alert(t('set.importFail', { err: err.message })); }
  } });
  root.append(section(t('settings.sec.data'), t('set.dataNote'),
    file,
    el('div', { class: 'btn-row' },
      el('button', { class: 'btn secondary', onclick: () => store.exportAll() }, t('set.export')),
      el('button', { class: 'btn secondary', onclick: () => file.click() }, t('set.import')),
      el('button', { class: 'btn danger', onclick: () => { if (confirm(t('set.resetConfirm'))) { store.resetToSeed(); render(); } } }, t('set.reset'))),
  ));

  root.append(el('div', { class: 'callout' },
    t('set.agentCallout'),
    el('a', { href: '#/guide' }, t('set.agentCalloutLink')), '.'));

  root.append(section(t('settings.sec.about'), null,
    el('div', { class: 'doc', html: `
      <ul>
        <li>${t('about.version')}: <b>v${VERSION}</b> — ${t('about.latestAt')} <a href="${REPO_URL}/releases" target="_blank" rel="noopener">${t('about.releases')}</a>; ${t('about.updateNote')}</li>
        <li>${t('about.license')}: <a href="${REPO_URL}/blob/main/LICENSE" target="_blank" rel="noopener">MIT</a> — ${t('about.licenseNote')}</li>
        <li>${t('about.source')}: <a href="${REPO_URL}" target="_blank" rel="noopener">github.com/howieyoung/ir-kit</a> · ${t('about.sourceNote')}</li>
        <li>${t('about.demo')}: <a href="https://howieyoung.github.io/ir-kit/" target="_blank" rel="noopener">howieyoung.github.io/ir-kit</a></li>
      </ul>` })));
}

document.getElementById('sample-dismiss')?.addEventListener('click', () => {
  sessionStorage.setItem('irkit:banner-dismissed', '1');
  document.getElementById('sample-banner').hidden = true;
});

window.addEventListener('hashchange', render);
store.init().then(async () => {
  await loadContent();
  renderLocalePicker();
  const badge = document.getElementById('mode-badge');
  badge.textContent = store.mode === 'server' ? 'server mode' : 'demo mode';
  document.getElementById('about-line').innerHTML =
    `<a href="${REPO_URL}/releases" target="_blank" rel="noopener">v${VERSION}</a> · ` +
    `<a href="${REPO_URL}/blob/main/LICENSE" target="_blank" rel="noopener">MIT</a> · ` +
    `<a href="${REPO_URL}" target="_blank" rel="noopener">GitHub</a>`;
  store.onChange(() => renderBrand(store.get('company')));
  render();
});
