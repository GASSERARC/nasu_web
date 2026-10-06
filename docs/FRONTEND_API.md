# Frontend ↔ backend contract

The frontend is a static site (no build step). Every view talks only to
`assets/js/services/api.js`, which delegates to one backend module:

| `CONFIG.backend` (`assets/js/config.js`) | Module | Status |
|---|---|---|
| `'mock'` (default) | `services/mock-backend.js` | Demo data, accepts any well-formed input |
| `'supabase'` | `services/supabase-backend.js` | Stub — every function throws `not_configured` |

To connect the real backend, implement the functions in `supabase-backend.js`
with the signatures below and switch `CONFIG.backend`. No view needs to change.

## Rules for the frontend

- Only public values go in `config.js` (Supabase URL + **anon** key). Never a
  service-role key, admin password, activation code or student roster.
- Activation-code checks, password policy, rate limiting and data access are
  enforced on the backend. The frontend's password checklist is UX only.
- Error messages for failed activation/login should not reveal whether the
  student ID exists.

## Functions

All functions are async. On failure they throw `ApiError(code, message)`
(`services/errors.js`); `message` is shown to the student as-is.

### Auth

| Function | Input | Resolves to | Error codes |
|---|---|---|---|
| `getSession()` | — | `Session \| null` | — |
| `signIn` | `{ studentId, password }` | `Session` | `invalid_input`, `invalid_credentials` |
| `signOut()` | — | — | — |
| `verifyActivation` | `{ studentId, code }` | — (backend remembers the verified activation) | `invalid_input`, `activation_failed` |
| `getPendingActivation()` | — | `{ studentId } \| null` | — |
| `completeActivation` | `{ password }` | `Session` (student is signed in) | `invalid_input`, `activation_expired` |

`verifyActivation` → `completeActivation` is a two-step flow across two pages.
How the verified state is carried between them (short-lived token, Edge
Function session, etc.) is the backend's choice. If it has expired,
`completeActivation` must throw `activation_expired`, and the UI sends the
student back to the activation page.

### Data

| Function | Input | Resolves to |
|---|---|---|
| `getMyProfile()` | — | `Profile` (throw `unauthenticated` if signed out) |
| `listSubjects()` | — | `Subject[]` with `resourceCount` |
| `getSubject(id)` | `id` | `Subject` (throw `not_found`) |
| `listResources` | `{ subjectId?, limit? }` | `Resource[]`, newest first |
| `searchResources` | `{ query, subjectId, category }` (empty string = any) | `Resource[]` |
| `listAnnouncements` | `{ subjectId?, limit? }` | `Announcement[]`, pinned first then newest |

## Shapes

```js
Session      = { studentId }
Profile      = { fullName, studentId, group, section }
Subject      = { id, code, name, resourceCount? }
Resource     = {
  id, subjectId,
  category,          // 'lecture' | 'tutorial' | 'board' | 'pdf' | 'assignment'
  title,
  url,               // http(s) only; anything else is rendered as non-clickable
  format,            // 'pdf' | 'link'
  addedAt,           // ISO date
  week,              // number | null
  dueAt,             // ISO date | null (assignments)
}
Announcement = { id, title, body, subjectId /* null = general */, publishedAt, pinned, author }
```

Subject ids currently used: `math1`, `vib`, `stat`, `chem`, `soc`, `draw`
(see `assets/js/data/catalog.js`).

`services/normalize.js` can be reused to map database rows to these shapes.

## Legacy data

The mock backend still reads `resources.json` from the original site. Legacy
`type: 'video'` becomes category `lecture` and `type: 'pdf'` becomes `pdf`.
Base64 `data:` URLs from the old in-browser upload are no longer rendered as
links.
