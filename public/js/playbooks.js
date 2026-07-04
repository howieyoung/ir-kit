import { el, section, tabs } from './ui.js';
import { store } from './store.js';
import { DOCS } from './playbook-content.js';

export function renderPlaybooks(root) {
  root.append(el('h1', {}, 'Playbooks'));
  root.append(el('p', { class: 'page-sub' }, 'The operating doctrine behind the tools. Checklists persist as you tick them. Edit content in public/js/playbook-content.js — or ask your agent to tailor it.'));
  root.append(tabs(DOCS.map((d) => ({ label: d.title, render: () => renderDoc(d) }))));
}

function renderDoc(doc) {
  const container = el('div', { class: 'section doc' });
  container.append(...markdown(doc.md, doc.id));
  return container;
}

// Minimal markdown renderer: headings, lists, checkboxes (persisted), tables, bold/italic/code, blockquotes, hr.
function markdown(src, docId) {
  const checklists = store.get('checklists');
  const lines = src.split('\n');
  const out = [];
  let i = 0, taskIdx = 0;

  const inline = (s) => s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) { i++; continue; }
    if (/^---+\s*$/.test(line)) { out.push(el('hr')); i++; continue; }
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) { out.push(el('h' + h[1].length, { html: inline(h[2]) })); i++; continue; }
    if (line.startsWith('>')) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(el('blockquote', { html: buf.map(inline).join('<br>') }));
      continue;
    }
    if (line.startsWith('|')) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith('|')) buf.push(lines[i++]);
      const rows = buf.filter((r) => !/^\|[\s\-|:]+\|$/.test(r)).map((r) => r.slice(1, -1).split('|').map((c) => c.trim()));
      const table = el('table');
      rows.forEach((cells, ri) => table.append(el('tr', {}, ...cells.map((c) => el(ri === 0 ? 'th' : 'td', { html: inline(c) })))));
      out.push(table);
      continue;
    }
    if (/^\s*(-|\d+\.)\s/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const list = el(ordered ? 'ol' : 'ul');
      while (i < lines.length && /^\s*(-|\d+\.)\s/.test(lines[i])) {
        const item = lines[i].replace(/^\s*(-|\d+\.)\s/, '');
        const task = item.match(/^\[( |x)\]\s*(.*)/i);
        if (task) {
          const key = `${docId}:${taskIdx++}`;
          const checked = checklists[key] ?? task[1].toLowerCase() === 'x';
          const cb = el('input', {
            type: 'checkbox',
            onchange: (e) => store.update('checklists', (c) => { c[key] = e.target.checked; }),
          });
          cb.checked = checked;
          list.append(el('li', { class: 'task' }, cb, el('span', { html: inline(task[2]) })));
        } else {
          list.append(el('li', { html: inline(item) }));
        }
        i++;
      }
      out.push(list);
      continue;
    }
    out.push(el('p', { html: inline(line) }));
    i++;
  }
  return out;
}
