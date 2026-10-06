import { html } from '../ui/html.js';
import { icons } from '../ui/icons.js';
import { api } from '../services/api.js';
import { sectionLabel, resourceList, announcementCard, subjectCard, emptyState } from '../ui/components.js';

export default async function dashboard({ query }) {
  const [profile, subjects, recent, announcements] = await Promise.all([
    api.profile.getMine(),
    api.subjects.list(),
    api.resources.recent(4),
    api.announcements.list({ limit: 3 }),
  ]);
  const firstName = profile.fullName.split(' ')[0];

  return {
    title: 'Dashboard',
    html: html`
      ${query.welcome ? html`<p class="notice notice-ok" role="status">${icons.check} Your account is active. Welcome to the hub!</p>` : ''}
      <div class="page-head">
        <p class="eyebrow mono">DASHBOARD</p>
        <h1 class="page-title" tabindex="-1">Hello, ${firstName}</h1>
      </div>

      <section class="profile-card" aria-label="Your details">
        <div class="profile-id">
          <span class="avatar">${icons.user}</span>
          <div>
            <p class="profile-name">${profile.fullName}</p>
            <p class="profile-sub">Prep-year engineering student</p>
          </div>
        </div>
        <dl class="profile-grid">
          <div><dt>Student ID</dt><dd class="mono">${profile.studentId}</dd></div>
          <div><dt>Group</dt><dd>${profile.group}</dd></div>
          <div><dt>Section</dt><dd>${profile.section}</dd></div>
        </dl>
      </section>

      <div class="dash-cols">
        <section>
          ${sectionLabel('Announcements', html`<a class="see-all" href="#/announcements">See all</a>`)}
          ${announcements.length
            ? html`<div class="ann-list">${announcements.map(a => announcementCard(a, { compact: true }))}</div>`
            : emptyState('No announcements yet')}
        </section>
        <section>
          ${sectionLabel('Recently added', html`<a class="see-all" href="#/search">Browse</a>`)}
          ${recent.length ? resourceList(recent, { showSubject: true }) : emptyState('Nothing added yet')}
        </section>
      </div>

      <section>
        ${sectionLabel('Your subjects', html`<a class="see-all" href="#/subjects">All subjects</a>`)}
        <div class="subj-grid">${subjects.map(subjectCard)}</div>
      </section>`,
  };
}
