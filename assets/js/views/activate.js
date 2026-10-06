import { html } from '../ui/html.js';
import { icons } from '../ui/icons.js';
import { api } from '../services/api.js';
import { formError, showFormError, withBusy } from '../ui/components.js';

export default async function activate({ query, navigate }) {
  return {
    title: 'Activate account',
    html: html`
      <div class="auth">
        <div class="auth-card">
          <ol class="progress" aria-label="Activation steps">
            <li class="on" aria-current="step"><span class="mono">1</span>Verify</li>
            <li><span class="mono">2</span>Password</li>
          </ol>
          <span class="auth-icon">${icons.key}</span>
          <h1 class="auth-title" tabindex="-1">Activate your account</h1>
          <p class="auth-lead">Enter your student ID and the one-time activation code you received from the faculty.</p>
          ${query.expired ? html`<p class="notice" role="status">That step timed out. Please enter your details again.</p>` : ''}
          <form id="activateForm" novalidate>
            <div class="field">
              <label for="studentId">Student ID</label>
              <input id="studentId" name="studentId" type="text" autocomplete="username" autocapitalize="off" spellcheck="false" required>
            </div>
            <div class="field">
              <label for="code">One-Time Activation Code</label>
              <input id="code" name="code" class="code-input mono" type="text" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" required aria-describedby="codeHelp">
              <p class="help" id="codeHelp">The code works once. Don’t share it with anyone.</p>
            </div>
            ${formError('activateError')}
            <button type="submit" class="btn btn-primary btn-block">Continue</button>
          </form>
          <div class="auth-alt">
            <p>Already activated? <a href="#/login">Log in</a></p>
            <p class="muted">Lost your code or it doesn’t work? Contact the prep-year office.</p>
          </div>
        </div>
      </div>`,
    bind(root) {
      const form = root.querySelector('#activateForm');
      const err = root.querySelector('#activateError');
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const studentId = form.studentId.value.trim();
        const code = form.code.value.replace(/\s+/g, '');
        if (!studentId || !code) return showFormError(err, 'Enter both your student ID and activation code.');
        showFormError(err, '');
        try {
          await withBusy(form.querySelector('[type=submit]'), 'Checking…', () => api.auth.verifyActivation({ studentId, code }));
          navigate('/create-password');
        } catch (ex) {
          showFormError(err, ex.message);
          form.code.select();
        }
      });
    },
  };
}
