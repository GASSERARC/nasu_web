import { html } from '../ui/html.js';
import { icons } from '../ui/icons.js';
import { api } from '../services/api.js';
import { passwordInput, bindPasswordToggles, formError, showFormError, withBusy } from '../ui/components.js';

// UX guidance only — the backend must enforce its own password policy.
const RULES = [
  { id: 'len', label: 'At least 8 characters', test: p => p.length >= 8 },
  { id: 'letter', label: 'Contains a letter', test: p => /[A-Za-z]/.test(p) },
  { id: 'digit', label: 'Contains a number', test: p => /\d/.test(p) },
];

export default async function createPassword({ navigate }) {
  const pending = await api.auth.getPendingActivation();
  if (!pending) {
    navigate('/activate?expired=1', { replace: true });
    return null;
  }

  return {
    title: 'Create password',
    html: html`
      <div class="auth">
        <div class="auth-card">
          <ol class="progress" aria-label="Activation steps">
            <li class="done"><span class="mono">${icons.check}</span>Verify</li>
            <li class="on" aria-current="step"><span class="mono">2</span>Password</li>
          </ol>
          <span class="auth-icon">${icons.lock}</span>
          <h1 class="auth-title" tabindex="-1">Create your password</h1>
          <p class="auth-lead">Verified for student ID <strong class="mono">${pending.studentId}</strong>. Choose a password you’ll use to log in from now on.</p>
          <form id="pwForm" novalidate>
            ${passwordInput({ id: 'password', label: 'Password', autocomplete: 'new-password', describedBy: 'pwRules' })}
            <ul class="rules" id="pwRules" aria-live="polite">
              ${RULES.map(r => html`<li data-rule="${r.id}">${icons.check}<span>${r.label}</span></li>`)}
            </ul>
            ${passwordInput({ id: 'confirm', label: 'Confirm Password', autocomplete: 'new-password', describedBy: 'matchHint' })}
            <p class="help" id="matchHint" aria-live="polite"></p>
            ${formError('pwError')}
            <button type="submit" class="btn btn-primary btn-block">Create password</button>
          </form>
        </div>
      </div>`,
    bind(root) {
      bindPasswordToggles(root);
      const form = root.querySelector('#pwForm');
      const err = root.querySelector('#pwError');
      const matchHint = root.querySelector('#matchHint');

      const update = () => {
        const p = form.password.value;
        RULES.forEach(r => root.querySelector(`[data-rule="${r.id}"]`).classList.toggle('ok', r.test(p)));
        const c = form.confirm.value;
        matchHint.textContent = c ? (c === p ? 'Passwords match.' : 'Passwords don’t match yet.') : '';
        matchHint.className = 'help' + (c ? (c === p ? ' ok' : ' bad') : '');
      };
      form.password.addEventListener('input', update);
      form.confirm.addEventListener('input', update);

      form.addEventListener('submit', async e => {
        e.preventDefault();
        const password = form.password.value;
        const failed = RULES.find(r => !r.test(password));
        if (failed) return showFormError(err, `Password needs: ${failed.label.toLowerCase()}.`);
        if (password !== form.confirm.value) return showFormError(err, 'The two passwords don’t match.');
        showFormError(err, '');
        try {
          await withBusy(form.querySelector('[type=submit]'), 'Saving…', () => api.auth.completeActivation({ password }));
          navigate('/dashboard?welcome=1', { replace: true });
        } catch (ex) {
          if (ex.code === 'activation_expired') return navigate('/activate?expired=1', { replace: true });
          showFormError(err, ex.message);
        }
      });
    },
  };
}
