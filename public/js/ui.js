// Tiny DOM + widget helpers. No framework — every founder's agent can read this in one pass.
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined) continue;
    node.append(c.nodeType ? c : document.createTextNode(c));
  }
  return node;
}

// ---------- formatters ----------
export const fmt = {
  usd(n, compact = false) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    if (compact) {
      const abs = Math.abs(n);
      if (abs >= 1e9) return sign(n) + '$' + trim(abs / 1e9) + 'B';
      if (abs >= 1e6) return sign(n) + '$' + trim(abs / 1e6) + 'M';
      if (abs >= 1e3) return sign(n) + '$' + trim(abs / 1e3) + 'K';
    }
    return sign(n) + '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
  },
  num(n, compact = false) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    if (compact) {
      const abs = Math.abs(n);
      if (abs >= 1e9) return sign(n) + trim(abs / 1e9) + 'B';
      if (abs >= 1e6) return sign(n) + trim(abs / 1e6) + 'M';
      if (abs >= 1e3) return sign(n) + trim(abs / 1e3) + 'K';
    }
    return n.toLocaleString('en-US');
  },
  pct(n, dp = 1) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return (n * 100).toFixed(dp) + '%';
  },
  month(ym) { // "2026-06" -> "Jun 2026"
    if (!ym) return '—';
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
  },
};
const sign = (n) => (n < 0 ? '−' : '');
const trim = (x) => (x >= 100 ? Math.round(x).toString() : x.toFixed(1).replace(/\.0$/, ''));

// ---------- widgets ----------
export function kpi(label, value, sub = '', subClass = '') {
  return el('div', { class: 'kpi' },
    el('div', { class: 'k-label' }, label),
    el('div', { class: 'k-value' }, value),
    sub ? el('div', { class: 'k-sub', html: subClass ? `<span class="${subClass}">${sub}</span>` : sub }) : null,
  );
}

export function section(title, note, ...children) {
  return el('div', { class: 'section' },
    title ? el('h2', {}, title) : null,
    note ? el('div', { class: 'section-note' }, note) : null,
    ...children,
  );
}

// Editable data table over an array of row objects.
// columns: { key, label, type: text|number|date|select|check, options?, width?, compute?(row), fmt?(v), placeholder? }
// compute-columns are read-only; others write back to the row and call save().
export function dataTable({ columns, rows, save, addLabel = '+ Add row', newRow, footer, deletable = true }) {
  const wrap = el('div');
  const table = el('table', { class: 'tbl' });
  table.append(el('thead', {}, el('tr', {},
    ...columns.map((c) => el('th', { style: c.width ? `min-width:${c.width}px` : '' }, c.label)),
    deletable ? el('th', { class: 'act' }, '') : null,
  )));
  const tbody = el('tbody');

  for (const row of rows) {
    const tr = el('tr');
    for (const c of columns) {
      if (c.compute) {
        const v = c.compute(row);
        tr.append(el('td', { class: 'computed' }, c.fmt ? c.fmt(v) : (v ?? '—')));
        continue;
      }
      let input;
      const commit = () => {
        let v = input.value;
        if (c.type === 'number') v = input.value === '' ? null : Number(input.value);
        if (c.type === 'check') v = input.checked;
        row[c.key] = v;
        save();
        // re-render computed cells in this row without rebuilding the whole table
        columns.forEach((cc, i) => {
          if (cc.compute) tr.children[i].textContent = cc.fmt ? cc.fmt(cc.compute(row)) : (cc.compute(row) ?? '—');
        });
        if (footer) renderFooter();
      };
      if (c.type === 'select') {
        input = el('select', { onchange: commit }, ...c.options.map((o) => el('option', { value: o, selected: row[c.key] === o ? '' : null }, o)));
      } else if (c.type === 'check') {
        input = el('input', { type: 'checkbox', onchange: commit });
        input.checked = !!row[c.key];
      } else {
        input = el('input', {
          type: c.type === 'number' ? 'number' : c.type === 'date' ? 'date' : 'text',
          value: row[c.key] ?? '', placeholder: c.placeholder || '', onchange: commit,
        });
        if (c.type === 'number') input.step = 'any';
      }
      tr.append(el('td', {}, input));
    }
    if (deletable) {
      tr.append(el('td', { class: 'act' }, el('button', {
        class: 'row-del', title: 'Delete row',
        onclick: () => {
          if (!confirm('Delete this row?')) return;
          rows.splice(rows.indexOf(row), 1);
          save();
          tr.remove();
          if (footer) renderFooter();
        },
      }, '✕')));
    }
    tbody.append(tr);
  }
  table.append(tbody);

  let tfoot = null;
  function renderFooter() {
    if (!footer) return;
    if (tfoot) tfoot.remove();
    tfoot = el('tfoot', {}, footer());
    table.append(tfoot);
  }
  renderFooter();

  wrap.append(el('div', { class: 'tbl-wrap' }, table));
  if (newRow) {
    wrap.append(el('div', { class: 'btn-row' }, el('button', {
      class: 'btn secondary small',
      onclick: () => { rows.push(newRow()); save(); wrap.replaceWith(dataTable({ columns, rows, save, addLabel, newRow, footer, deletable })); },
    }, addLabel)));
  }
  return wrap;
}

// SVG elements need their own namespace — el() would create inert HTML elements.
function svgEl(tag, attrs = {}, ...children) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const c of children.flat()) node.append(c?.nodeType ? c : document.createTextNode(c));
  return node;
}

// Minimal SVG line chart. series: [{values, color}], labels: string[]
export function lineChart({ title, labels, series, height = 120, money = false }) {
  const W = 560, H = height, padL = 46, padB = 18, padT = 8;
  const all = series.flatMap((s) => s.values).filter((v) => v !== null && !isNaN(v));
  if (!all.length) return el('div', { class: 'chart-box muted' }, 'No data yet');
  let min = Math.min(0, ...all), max = Math.max(...all);
  if (min === max) max = min + 1;
  const n = labels.length;
  const x = (i) => padL + (i / Math.max(n - 1, 1)) * (W - padL - 8);
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const svg = svgEl('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, width: '100%' });
  // gridlines: zero + max
  for (const gv of [0, max]) {
    svg.append(svgEl('line', { x1: padL, x2: W - 8, y1: y(gv), y2: y(gv), stroke: '#e3e6ea', 'stroke-width': 1 }));
    svg.append(svgEl('text', { x: 4, y: y(gv) + 4, 'font-size': 10, fill: '#889' }, money ? fmt.usd(gv, true) : fmt.num(gv, true)));
  }
  for (const s of series) {
    const pts = s.values.map((v, i) => (v === null || isNaN(v) ? null : `${x(i)},${y(v)}`)).filter(Boolean).join(' ');
    svg.append(svgEl('polyline', { points: pts, fill: 'none', stroke: s.color, 'stroke-width': 2 }));
  }
  // x labels: first, middle, last
  [0, Math.floor((n - 1) / 2), n - 1].forEach((i) => {
    if (i >= 0 && labels[i]) svg.append(svgEl('text', { x: x(i), y: H - 4, 'font-size': 10, fill: '#889', 'text-anchor': 'middle' }, labels[i]));
  });
  return el('div', { class: 'chart-box' }, title ? el('div', { class: 'chart-title' }, title) : null, svg);
}

export function tabs(defs, initial = 0) {
  // defs: [{label, render}] — returns container with tab bar + active panel
  const wrap = el('div');
  const bar = el('div', { class: 'tabs' });
  const panel = el('div');
  let active = initial;
  function draw() {
    bar.innerHTML = '';
    defs.forEach((d, i) => bar.append(el('button', {
      class: i === active ? 'active' : '',
      onclick: () => { active = i; draw(); },
    }, d.label)));
    panel.innerHTML = '';
    panel.append(defs[active].render());
  }
  draw();
  wrap.append(bar, panel);
  return wrap;
}
