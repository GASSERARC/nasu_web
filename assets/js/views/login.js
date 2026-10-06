import { html } from '../ui/html.js';
import { icons } from '../ui/icons.js';
import { api } from '../services/api.js';
import { passwordInput, bindPasswordToggles, formError, showFormError, withBusy } from '../ui/components.js';

export default async function login({ query, navigate, safeNext }) {
  return {
    title: 'Log in',
    html: html`
      <div class="auth">
        <div class="auth-card">
          <span class="auth-icon">${icons.lock}</span>
          <h1 class="auth-title" tabindex="-1">Log in</h1>
          <p class="auth-lead">Use your student ID and the password you created when you activated your account.</p>
          <form id="loginForm" novalidate>
            <div class="field">
              <label for="studentId">Student ID</label>
              <input id="studentId" name="studentId" type="text" autocomplete="username" autocapitalize="off" spellcheck="false" required>
            </div>
            ${passwordInput({ id: 'password', label: 'Password', autocomplete: 'current-password' })}
            ${formError('loginError')}
            <button type="submit" class="btn btn-primary btn-block">Log in</button>
          </form>
          <div class="auth-alt">
            <p>First time here? <a href="#/activate">Activate your account</a></p>
            <p class="muted">Forgot your password? Contact the prep-year office to reset it.</p>
          </div>
        </div>
      </div>`,
    bind(root) {
      bindPasswordToggles(root);
      const form = root.querySelector('#loginForm');
      const err = root.querySelector('#loginError');
      if (query.id) form.studentId.value = query.id;
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const studentId = form.studentId.value.trim();
        const password = form.password.value;
        if (!studentId || !password) return showFormError(err, 'Enter your student ID and password.');
        showFormError(err, '');
        try {
          await withBusy(form.querySelector('[type=submit]'), 'Logging in…', () => api.auth.signIn({ studentId, password }));
          navigate(safeNext(query.next) || '/dashboard', { replace: true });
        } catch (ex) {
          showFormError(err, ex.message);
          form.password.select();
        }
      });
    },
  };
}
