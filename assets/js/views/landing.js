import { html } from '../ui/html.js';
import { icons } from '../ui/icons.js';
import { SUBJECTS } from '../data/catalog.js';
import { pad2 } from '../ui/format.js';

export default async function landing({ session }) {
  return {
    title: 'Home',
    html: html`
      <section class="hero">
        <p class="eyebrow mono">PREP YEAR · ENGINEERING</p>
        <h1 class="hero-title" tabindex="-1">Every lecture, tutorial and sheet for your first year — in one place.</h1>
        <p class="hero-lead">The NASU Engineering Freshmen Hub collects course material for all six prep-year subjects, plus announcements from your course teams.</p>
        <div class="hero-cta">
          ${session
            ? html`<a class="btn btn-primary btn-lg" href="#/dashboard">Open your dashboard</a>`
            : html`
              <a class="btn btn-primary btn-lg" href="#/activate">Activate your account</a>
              <a class="btn btn-ghost btn-lg" href="#/login">I already have a password</a>`}
        </div>
      </section>

      ${session ? '' : html`
      <section class="steps" aria-labelledby="stepsTitle">
        <h2 class="section-label" id="stepsTitle"><span>First time here?</span><span class="ln"></span></h2>
        <ol class="step-list">
          <li><span class="step-n mono">01</span><div><strong>Get your activation code</strong><p>Your faculty gives every student a one-time activation code with their student ID.</p></div></li>
          <li><span class="step-n mono">02</span><div><strong>Activate your account</strong><p>Enter your student ID and the code, then choose your own password.</p></div></li>
          <li><span class="step-n mono">03</span><div><strong>Log in any time</strong><p>From then on, sign in with your student ID and password — on your phone or laptop.</p></div></li>
        </ol>
      </section>`}

      <section aria-labelledby="subjTitle">
        <h2 class="section-label" id="subjTitle"><span>Subjects covered</span><span class="ln"></span></h2>
        <ul class="subject-strip">
          ${SUBJECTS.map((s, i) => html`<li><span class="mono subj-n">${pad2(i + 1)}</span><span class="subj-strip-name">${s.name}</span><span class="mono subj-code">${s.code}</span></li>`)}
        </ul>
      </section>

      <section class="features" aria-label="What you get">
        <div class="feature">${icons.book}<h3>Organised by subject</h3><p>Lectures, tutorials, board notes, PDFs and assignments, grouped and dated.</p></div>
        <div class="feature">${icons.search}<h3>Search everything</h3><p>Find a sheet or lecture across all subjects in seconds.</p></div>
        <div class="feature">${icons.bell}<h3>Never miss a notice</h3><p>Room changes, deadlines and reminders in one feed.</p></div>
      </section>`,
  };
}
