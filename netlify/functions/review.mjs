/**
 * Call me Eliyahu — passage review store.
 *
 * GET  /.netlify/functions/review            -> current review state
 * PUT  /.netlify/functions/review            -> save review state (Elliott only)
 * GET  /.netlify/functions/review?snapshots=1 -> list hourly snapshots (Stephen only)
 * GET  /.netlify/functions/review?snapshot=<key> -> read one snapshot (Stephen only)
 *
 * Auth: a long random key, sent as the x-cme-key header (or ?k= on first load).
 *   CME_ELLIOTT_KEY  — read + write
 *   CME_STEPHEN_KEY  — read only, plus snapshot access
 *
 * Storage: Netlify Blobs, store "cme-review".
 *   current            — the live review state
 *   snapshots/<hour>   — a point-in-time copy, one per clock hour, for recovery
 */

import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

const STORE = 'cme-review';
const CURRENT = 'current';
const MAX_BYTES = 2_000_000; // the real payload is ~50-300 KB; this is a sanity limit

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

function sameKey(a, b) {
  if (!a || !b) return false;
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

function roleFor(req) {
  const url = new URL(req.url);
  const key = req.headers.get('x-cme-key') || url.searchParams.get('k') || '';
  if (sameKey(key, process.env.CME_ELLIOTT_KEY)) return 'elliott';
  if (sameKey(key, process.env.CME_STEPHEN_KEY)) return 'stephen';
  return null;
}

const hourBucket = (d = new Date()) => d.toISOString().slice(0, 13).replace(/[:-]/g, ''); // 20260807T00

const emptyState = () => ({
  rev: 0,
  items: {},
  updated_at: null,
  updated_by: null,
});

export default async (req) => {
  if (!process.env.CME_ELLIOTT_KEY || !process.env.CME_STEPHEN_KEY) {
    return json({ error: 'server_not_configured',
      message: 'CME_ELLIOTT_KEY and CME_STEPHEN_KEY are not set in the Netlify environment variables.' }, 503);
  }

  const role = roleFor(req);
  if (!role) return json({ error: 'unauthorized' }, 401);

  const store = getStore({ name: STORE, consistency: 'strong' });
  const url = new URL(req.url);

  // ---------------------------------------------------------------- read
  if (req.method === 'GET') {
    if (url.searchParams.has('snapshots')) {
      if (role !== 'stephen') return json({ error: 'forbidden' }, 403);
      const { blobs } = await store.list({ prefix: 'snapshots/' });
      return json({
        snapshots: blobs.map((b) => b.key).sort().reverse().slice(0, 200),
      });
    }
    if (url.searchParams.has('snapshot')) {
      if (role !== 'stephen') return json({ error: 'forbidden' }, 403);
      const key = url.searchParams.get('snapshot');
      if (!/^snapshots\/[0-9A-Z]{1,20}$/.test(key)) return json({ error: 'bad_snapshot_key' }, 400);
      const snap = await store.get(key, { type: 'json' });
      if (!snap) return json({ error: 'not_found' }, 404);
      return json({ role, state: snap });
    }
    const state = (await store.get(CURRENT, { type: 'json' })) || emptyState();
    return json({ role, state });
  }

  // --------------------------------------------------------- reset (rare)
  // Wipes every answer. Stephen only, and only with the typed phrase. The
  // previous state is snapshotted first, so a reset is recoverable.
  //
  // Note on roles: Stephen's key still cannot EDIT answers — it can only
  // perform this one all-or-nothing, doubly-confirmed operation. That is a
  // deliberate narrowing of the read-only rule, not a hole in it.
  if (req.method === 'DELETE') {
    if (role !== 'stephen') return json({ error: 'forbidden' }, 403);
    let body = {};
    try { body = JSON.parse((await req.text()) || '{}'); } catch { /* ignore */ }
    if (body.confirm !== 'ERASE EVERYTHING') {
      return json({ error: 'confirmation_required' }, 400);
    }
    const current = (await store.get(CURRENT, { type: 'json' })) || emptyState();
    try {
      await store.setJSON(`snapshots/pre-reset-${Date.now()}`, current);
    } catch { /* a failed snapshot must not block the reset */ }

    // Blank every id the caller knows about, stamped NOW. Writing blanks (rather
    // than deleting keys) is what stops a browser that still holds old answers
    // from pushing them back on its next sync: the per-record timestamp merge
    // sees the blank as newer and keeps it.
    const now = Date.now();
    const blanks = {};
    for (const id of (body.ids || Object.keys(current.items || {}))) {
      blanks[id] = { narrator: '', decision: '', revision: null, rights: '',
                     note: '', flagged: false, complete: false, _t: now };
    }
    const next = {
      rev: (current.rev || 0) + 1,
      items: blanks,
      updated_at: new Date().toISOString(),
      updated_by: 'reset',
      reset_at: new Date().toISOString(),
      last_export: current.last_export || null,
    };
    await store.setJSON(CURRENT, next);
    return json({ ok: true, reset: true, rev: next.rev,
                  cleared: Object.keys(current.items || {}).length,
                  blanked: Object.keys(blanks).length });
  }

  // --------------------------------------------------------------- write
  if (req.method === 'PUT' || req.method === 'POST') {
    if (role !== 'elliott') return json({ error: 'forbidden', message: 'This key can read but not write.' }, 403);

    let body;
    try {
      const raw = await req.text();
      if (raw.length > MAX_BYTES) return json({ error: 'too_large' }, 413);
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'bad_json' }, 400);
    }
    if (!body || typeof body.items !== 'object' || Array.isArray(body.items)) {
      return json({ error: 'bad_shape', message: 'Expected { rev, items }.' }, 400);
    }

    const current = (await store.get(CURRENT, { type: 'json' })) || emptyState();

    // If the review has been reset since this browser last synced, its copy is
    // history. Refuse its items outright and hand back the current state, or a
    // tab left open across a reset would push the old answers straight back.
    if (current.reset_at && body.reset_at !== current.reset_at) {
      return json({ error: 'reset', reset_at: current.reset_at, state: current }, 409);
    }

    const clientRev = Number(body.rev);

    // Per-record timestamps decide conflicts. The server never takes a client's
    // word for a record that the server already holds a NEWER version of, so an
    // old tab cannot roll back a newer answer even if it resubmits at the
    // current revision.
    const merged = { ...(current.items || {}) };
    let rejected = 0;
    for (const [id, incoming] of Object.entries(body.items || {})) {
      const held = merged[id];
      const tIn = Number(incoming && incoming._t) || 0;
      const tHeld = Number(held && held._t) || 0;
      if (!held || tIn >= tHeld) merged[id] = incoming;
      else rejected++;                      // server copy is newer — keep it
    }

    // A stale client still gets the current state back so it can catch up.
    if (Number.isFinite(clientRev) && clientRev < current.rev) {
      const next = {
        rev: (current.rev || 0) + 1, items: merged,
        updated_at: new Date().toISOString(), updated_by: 'elliott',
        reset_at: current.reset_at || null,
        last_export: body.last_export || current.last_export || null,
      };
      await store.setJSON(CURRENT, next);
      try { await store.setJSON(`snapshots/${hourBucket()}`, next); } catch {}
      return json({ error: 'stale', merged: true, rejected, state: next }, 409);
    }

    const next = {
      rev: (current.rev || 0) + 1,
      items: merged,
      updated_at: new Date().toISOString(),
      updated_by: 'elliott',
      reset_at: current.reset_at || null,
      last_export: body.last_export || current.last_export || null,
    };

    await store.setJSON(CURRENT, next);

    // One recovery point per clock hour. Overwritten within the hour, so this
    // stays small: roughly one snapshot per hour Elliott actually works.
    try {
      await store.setJSON(`snapshots/${hourBucket()}`, next);
    } catch {
      /* a failed snapshot must never fail the save itself */
    }

    return json({ ok: true, rev: next.rev, updated_at: next.updated_at, rejected });
  }

  return json({ error: 'method_not_allowed' }, 405);
};

export const config = { path: '/api/review' };
