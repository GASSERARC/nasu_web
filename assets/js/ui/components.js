// Shared markup pieces. All return html`` results (auto-escaped).

import { html } from './html.js';
import { icons } from './icons.js';
import { subjectById, categoryById } from '../data/catalog.js';
import { shortDate, relativeDays, pad2 } from './format.js';

export function pageHead({ eyebrow, title, code, lead, back }) {
  return html`
    <div class="page-head">
      ${back ? html`<a class="back-link" href="${back.href}">${icons.back}<span>${back.label}</span></a>` : ''}
      ${eyebrow ? html`<p class="eyebrow mono">${eyebrow}</p>` : ''}
      <div class="page-title-row">
        <h1 class="page-title" tabindex="-1">${title}</h1>
        ${code ? html`<span class="code-tag mono">${code}</span>` : ''}
      </div>
      ${lead ? html`<p class="lead">${lead}</p>` : ''}
    </div>`;
}

export function sectionLabel(text, extra = '') {
  return html`<h2 class="section-label"><span>${text}</span><span class="ln"></span>${extra}</h2>`;
}

export function resourceCard(r, { showSubject = false } = {}) {
  const cat = categoryById(r.category);
  const subject = subjectById(r.subjectId);
  const overdue = r.dueAt && new Date(r.dueAt) < new Date();
  const kindParts = [cat?.single?.toUpperCase(), r.week ? `WEEK ${pad2(r.week)}` : '', showSubject ? subject?.code : ''].filter(Boolean);
  const meta = [r.addedAt ? `Added ${shortDate(r.addedAt)}` : '', r.url ? (r.format === 'pdf' ? 'PDF' : 'Link') : ''].filter(Boolean).join(' · ');

  const inner = html`
    <span class="res-icon cat-${r.category}">${icons[r.category] || icons.link}</span>
    <span class="res-body">
      <span class="res-kind mono">${kindParts.join(' · ')}</span>
      <span class="res-title">${r.title}</span>
      <span class="res-meta">
        ${meta}
        ${r.dueAt ? html`<span class="due ${overdue ? 'overdue' : ''}">${overdue ? 'Was due' : 'Due'} ${shortDate(r.dueAt)} (${relativeDays(r.dueAt)})</span>` : ''}
        ${r.placeholder ? html`<span class="badge">Sample</span>` : ''}
      </span>
    </span>`;

  return r.url
    ? html`<a class="res" href="${r.url}" target="_blank" rel="noopener noreferrer">${inner}<span class="res-go" aria-label="Opens in a new tab">${icons.arrow}</span></a>`
    : html`<div class="res res-disabled" title="No file attached yet">${inner}</div>`;
}

export function resourceList(items, opts) {
  return html`<div class="res-list">${items.map(r => resourceCard(r, opts))}</div>`;
}

export function announcementCard(a, { compact = false } = {}) {
  const subject = a.subjectId ? subjectById(a.subjectId) : null;
  return html`
    <article class="ann ${a.pinned ? 'pinned' : ''} ${compact ? 'compact' : ''}">
      <header class="ann-head">
        ${a.pinned ? html`<span class="ann-pin">${icons.pin}<span>Pinned</span></span>` : ''}
        <span class="ann-tag mono">${subject ? subject.code : 'GENERAL'}</span>
        <time class="ann-date" datetime="${a.publishedAt || ''}">${shortDate(a.publishedAt)}</time>
        ${a.placeholder ? html`<span class="badge">Sample</span>` : ''}
      </header>
      <h3 class="ann-title">${a.title}</h3>
      <p class="ann-body">${a.body}</p>
      ${compact ? '' : html`<p class="ann-author">— ${a.author}</p>`}
    </article>`;
}

export function subjectCard(s, index) {
  return html`
    <a class="subj" href="#/subjects/${s.id}">
      <span class="subj-top">
        <span class="subj-n mono">${pad2(index + 1)}</span>
        <span class="subj-code mono">${s.code}</span>
      </span>
      <span class="subj-name">${s.name}</span>
      <span class="subj-foot">
        <span>${s.resourceCount != null ? `${s.resourceCount} resources` : 'Open subject'}</span>
        ${icons.chevron}
      </span>
    </a>`;
}

export function chips(items, active, { name = 'filter' } = {}) {
  return html`
    <div class="chips" role="group" aria-label="${name}">
      ${items.map(it => html`<button type="button" class="chip ${it.value === active ? 'on' : ''}" data-value="${it.value}" aria-pressed="${it.value === active}">${it.label}${it.count != null ? html` <span class="chip-n mono">${it.count}</span>` : ''}</button>`)}
    </div>`;
}

export function emptyState(title, text) {
  return html`<div class="state"><p class="state-title">${title}</p>${text ? html`<p class="state-text">${text}</p>` : ''}</div>`;
}

export function errorState(err) {
  return html`<div class="state state-error" role="alert"><p class="state-title">Couldn’t load this</p><p class="state-text">${err?.message || 'Something went wrong.'}</p><button type="button" class="btn btn-ghost-dark" data-action="retry">Try again</button></div>`;
}

export function loadingState(label = 'Loading…') {
  return html`<div class="state state-loading" aria-busy="true"><span class="spinner" aria-hidden="true"></span><span>${label}</span></div>`;
}

export function passwordInput({ id, label, autocomplete, describedBy = '' }) {
  return html`
    <div class="field">
      <label for="${id}">${label}</label>
      <div class="pw-wrap">
        <input id="${id}" name="${id}" type="password" autocomplete="${autocomplete}" required ${describedBy ? html`aria-describedby="${describedBy}"` : ''}>
        <button type="button" class="pw-toggle" data-toggle-pw="${id}" aria-label="Show password" aria-pressed="false">${icons.eye}</button>
      </div>
    </div>`;
}

// Wires every show/hide-password button inside root.
export function bindPasswordToggles(root) {
  root.querySelectorAll('[data-toggle-pw]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = root.querySelector('#' + btn.dataset.togglePw);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      btn.innerHTML = String(show ? icons.eyeOff : icons.eye);
    });
  });
}

export function formError(id) {
  return html`<p class="form-error" id="${id}" role="alert" hidden></p>`;
}

export function showFormError(el, message) {
  el.textContent = message || '';
  el.hidden = !message;
}

// Disable a submit button while an async action runs.
export async function withBusy(button, busyLabel, fn) {
  const label = button.textContent;
  button.disabled = true;
  button.textContent = busyLabel;
  try { return await fn(); }
  finally { button.disabled = false; button.textContent = label; }
}
