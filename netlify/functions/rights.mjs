/**
 * Rights clearance store — Stephen only.
 *
 * Deliberately SEPARATE from the review store. Elliott owns his answers and
 * Stephen cannot write them; Stephen owns clearance and Elliott never sees it.
 * Two stores, two owners, so giving Stephen write access here does not weaken
 * the read-only guarantee on Elliott's review.
 *
 *   GET  /api/rights   -> { rights: { CME-001: {...}, ... } }   (Stephen only)
 *   PUT  /api/rights   -> merge one or more records              (Stephen only)
 */
import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

const STORE = 'cme-review';
const KEY = 'rights';
const MAX_BYTES = 1_000_000;

const STATUSES = new Set(['not_evaluated','likely_pd','translation_verify',
                          'permission_required','cleared','omit_pending','na']);

const json = (b, s = 200) => new Response(JSON.stringify(b), {
  status: s,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
function same(a, b) {
  if (!a || !b) return false;
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export default async (req) => {
  if (!process.env.CME_STEPHEN_KEY) return json({ error: 'server_not_configured' }, 503);

  const key = req.headers.get('x-cme-key') || new URL(req.url).searchParams.get('k') || '';
  // Elliott has no business here at all — this is not his decision to make.
  if (!same(key, process.env.CME_STEPHEN_KEY)) return json({ error: 'unauthorized' }, 401);

  const store = getStore({ name: STORE, consistency: 'strong' });

  if (req.method === 'GET') {
    const state = (await store.get(KEY, { type: 'json' })) || { rev: 0, rights: {} };
    return json({ state });
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    let body;
    try {
      const raw = await req.text();
      if (raw.length > MAX_BYTES) return json({ error: 'too_large' }, 413);
      body = JSON.parse(raw);
    } catch { return json({ error: 'bad_json' }, 400); }
    if (!body || typeof body.rights !== 'object' || Array.isArray(body.rights))
      return json({ error: 'bad_shape', message: 'Expected { rights: { id: {...} } }' }, 400);

    const current = (await store.get(KEY, { type: 'json' })) || { rev: 0, rights: {} };
    const merged = { ...(current.rights || {}) };
    let written = 0, rejected = 0;

    for (const [id, incoming] of Object.entries(body.rights)) {
      if (!/^CME-\d{3}$/.test(id)) { rejected++; continue; }
      if (incoming.status && !STATUSES.has(incoming.status)) { rejected++; continue; }
      const held = merged[id];
      const tIn = Number(incoming && incoming._t) || 0;
      const tHeld = Number(held && held._t) || 0;
      if (held && tIn < tHeld) { rejected++; continue; }   // newest wins
      merged[id] = {
        status: incoming.status || '',
        note: String(incoming.note || '').slice(0, 2000),
        asked_on: incoming.asked_on || '',
        _t: tIn || Date.now(),
      };
      written++;
    }

    const next = { rev: (current.rev || 0) + 1, rights: merged,
                   updated_at: new Date().toISOString() };
    await store.setJSON(KEY, next);
    try { await store.setJSON(`snapshots/rights-${new Date().toISOString().slice(0,13).replace(/[:-]/g,'')}`, next); } catch {}
    return json({ ok: true, rev: next.rev, written, rejected });
  }

  return json({ error: 'method_not_allowed' }, 405);
};

export const config = { path: '/api/rights' };
