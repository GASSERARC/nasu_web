// The ONLY module views talk to. It hides which backend is in use, so the
// Supabase implementation can be dropped in later without touching any view.
//
// Shapes returned (see docs/FRONTEND_API.md for the full contract):
//   Session      { studentId, demo? }
//   Profile      { fullName, studentId, group, section }
//   Resource     { id, subjectId, category, title, url|null, format, addedAt, week|null, dueAt|null, placeholder? }
//   Announcement { id, title, body, subjectId|null, publishedAt, pinned, author, placeholder? }

import { CONFIG } from '../config.js';
import { toApiError } from './errors.js';
import * as mockBackend from './mock-backend.js';
import * as supabaseBackend from './supabase-backend.js';

const backend = CONFIG.backend === 'supabase' ? supabaseBackend : mockBackend;

export const isDemoMode = backend === mockBackend;

// Every call goes through here so errors always arrive as ApiError.
function wrap(fn) {
  return async (...args) => {
    try { return await fn(...args); }
    catch (err) { throw toApiError(err); }
  };
}

const authListeners = new Set();
function emitAuthChange() { authListeners.forEach(cb => cb()); }

export const api = {
  auth: {
    getSession: wrap(() => backend.getSession()),
    signIn: wrap(async ({ studentId, password }) => {
      const s = await backend.signIn({ studentId: studentId.trim(), password });
      emitAuthChange();
      return s;
    }),
    signOut: wrap(async () => { await backend.signOut(); emitAuthChange(); }),
    // Step 1 of activation: check the student ID + one-time code.
    // Resolves when valid; the backend keeps whatever it needs for step 2.
    verifyActivation: wrap(({ studentId, code }) =>
      backend.verifyActivation({ studentId: studentId.trim(), code: code.trim() })),
    // Is there a verified activation waiting for a password?
    getPendingActivation: wrap(() => backend.getPendingActivation()),
    // Step 2 of activation: set the password. Signs the student in on success.
    completeActivation: wrap(async ({ password }) => {
      const s = await backend.completeActivation({ password });
      emitAuthChange();
      return s;
    }),
    onChange(cb) { authListeners.add(cb); return () => authListeners.delete(cb); },
  },

  profile: {
    getMine: wrap(() => backend.getMyProfile()),
  },

  subjects: {
    list: wrap(() => backend.listSubjects()),
    get: wrap(id => backend.getSubject(id)),
  },

  resources: {
    listBySubject: wrap(subjectId => backend.listResources({ subjectId })),
    recent: wrap((limit = 5) => backend.listResources({ limit })),
    search: wrap(({ query = '', subjectId = '', category = '' } = {}) =>
      backend.searchResources({ query: query.trim(), subjectId, category })),
  },

  announcements: {
    list: wrap(({ subjectId = '', limit } = {}) => backend.listAnnouncements({ subjectId, limit })),
  },
};
