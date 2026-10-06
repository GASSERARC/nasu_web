// Frontend configuration.
//
// Only PUBLIC values belong here — this file is shipped to every browser.
// Never put service-role keys, admin passwords, activation codes or student
// data in this file (or anywhere else in the frontend).

export const CONFIG = {
  // 'mock'     → local demo data, no real accounts (default until the backend is ready)
  // 'supabase' → real backend via services/supabase-backend.js
  backend: 'mock',

  supabase: {
    url: '',      // e.g. https://<project>.supabase.co
    anonKey: '',  // the PUBLIC anon key only — access is enforced by RLS on the backend
  },

  // When true, subjects, resources, search and announcements require a signed-in student.
  requireLoginForContent: true,

  // Legacy resource list from the original site, still read by the mock backend.
  legacyResourcesUrl: 'resources.json',
};
