// Supabase backend — NOT IMPLEMENTED YET (backend is being built separately).
//
// Each function must resolve to the shapes documented in services/api.js and
// docs/FRONTEND_API.md, and throw ApiError with one of the documented codes.
// Activation-code checking, password rules and access control must be enforced
// server-side (Edge Functions / RLS) — never in this file.

import { ApiError } from './errors.js';

const notReady = () => { throw new ApiError('not_configured', 'The hub is not connected to its server yet.'); };

export async function getSession() { return null; }
export const signIn = notReady;               // ({ studentId, password }) → Session
export const signOut = notReady;              // () → void
export const verifyActivation = notReady;     // ({ studentId, code }) → void
export const getPendingActivation = notReady; // () → { studentId } | null
export const completeActivation = notReady;   // ({ password }) → Session
export const getMyProfile = notReady;         // () → Profile
export const listSubjects = notReady;         // () → Subject[] (with resourceCount)
export const getSubject = notReady;           // (id) → Subject
export const listResources = notReady;        // ({ subjectId?, limit? }) → Resource[] newest first
export const searchResources = notReady;      // ({ query, subjectId, category }) → Resource[]
export const listAnnouncements = notReady;    // ({ subjectId?, limit? }) → Announcement[] pinned first
