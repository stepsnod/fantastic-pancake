/**
 * Rights clearance workspace — shared by Elliott, Rebecca, Stephen and counsel.
 *
 * A THIRD store, separate again from Elliott's passage review and from Stephen's
 * internal rights notes. Everyone with the clearance key can read and write it,
 * because this is collaborative work rather than one person's private review.
 * Accountability comes from stamping each change with the name the user picked,
 * not from separate keys.
 *
 *   GET    /api/clearance   -> { state }
 *   PUT    /api/clearance   -> merge records (newest-per-record wins)
 *   DELETE /api/clearance   -> reset, with typed confirmation
 */
import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

const STORE = 'cme-review';
const KEY = 'clearance';
const MAX = 2_000_000;

const CLASSES = new Set(['', 'public_domain', 'permission', 'unresolved', 'not_applicable']);
const ACTIONS = new Set(['', 'ask', 'cut', 'swap', 'keep']);
const STAGES  = new Set(['', 'not_started', 'verifying_ownership', 'letter_drafted', 'letter_sent',
                         'awaiting_reply', 'granted', 'refused', 'no_action_needed']);
const WRITERS = new Set(['', 'us', 'counsel', 'not_needed']);

const json = (b, s = 200) => new Response(JSON.stringify(b), {
  status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
function same(a, b) {
  if (!a || !b) return false;
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
function ok(req) {
  const k = req.headers.get('x-cme-key') || new URL(req.url).searchParams.get('k') || '';
  return same(k, process.env.CME_CLEARANCE_KEY) || same(k, process.env.CME_STEPHEN_KEY);
}
const empty = () => ({ rev: 0, records: {}, updated_at: null });

export default async (req) => {
  if (!process.env.CME_CLEARANCE_KEY && !process.env.CME_STEPHEN_KEY)
    return json({ error: 'server_not_configured' }, 503);
  if (!ok(req)) return json({ error: 'unauthorized' }, 401);

  const store = getStore({ name: STORE, consistency: 'strong' });

  if (req.method === 'GET') {
    return json({ state: (await store.get(KEY, { type: 'json' })) || empty() });
  }

  if (req.method === 'DELETE') {
    let body = {};
    try { body = JSON.parse((await req.text()) || '{}'); } catch {}
    if (body.confirm !== 'ERASE EVERYTHING') return json({ error: 'confirmation_required' }, 400);
    const cur = (await store.get(KEY, { type: 'json' })) || empty();
    try { await store.setJSON(`snapshots/clearance-pre-reset-${Date.now()}`, cur); } catch {}
    const now = Date.now(), blanks = {};
    for (const id of (body.ids || Object.keys(cur.records || {})))
      blanks[id] = { _t: now };
    const next = { rev: (cur.rev || 0) + 1, records: blanks,
                   updated_at: new Date().toISOString(), reset_at: new Date().toISOString() };
    await store.setJSON(KEY, next);
    return json({ ok: true, reset: true, cleared: Object.keys(cur.records || {}).length });
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    let body;
    try {
      const raw = await req.text();
      if (raw.length > MAX) return json({ error: 'too_large' }, 413);
      body = JSON.parse(raw);
    } catch { return json({ error: 'bad_json' }, 400); }
    if (!body || typeof body.records !== 'object' || Array.isArray(body.records))
      return json({ error: 'bad_shape' }, 400);

    const cur = (await store.get(KEY, { type: 'json' })) || empty();
    if (cur.reset_at && body.reset_at !== cur.reset_at)
      return json({ error: 'reset', reset_at: cur.reset_at, state: cur }, 409);

    const merged = { ...(cur.records || {}) };
    let written = 0, rejected = 0;
    for (const [id, inc] of Object.entries(body.records)) {
      if (!/^[A-Za-z0-9._:-]{1,64}$/.test(id)) { rejected++; continue; }
      if (!CLASSES.has(inc.classification ?? '') || !ACTIONS.has(inc.action ?? '')
          || !STAGES.has(inc.stage ?? '') || !WRITERS.has(inc.writer ?? '')) { rejected++; continue; }
      const held = merged[id];
      const tIn = Number(inc._t) || 0, tHeld = Number(held && held._t) || 0;
      if (held && tIn < tHeld) { rejected++; continue; }     // newest wins, per record
      merged[id] = {
        classification: inc.classification || '', action: inc.action || '',
        stage: inc.stage || '', writer: inc.writer || '',
        pd_reason: String(inc.pd_reason || '').slice(0, 400),
        holder: String(inc.holder || '').slice(0, 300),
        note: String(inc.note || '').slice(0, 4000),
        by: String(inc.by || '').slice(0, 40),
        at: inc.at || new Date().toISOString(),
        _t: tIn || Date.now(),
      };
      written++;
    }
    const next = { rev: (cur.rev || 0) + 1, records: merged,
                   updated_at: new Date().toISOString(), reset_at: cur.reset_at || null };
    await store.setJSON(KEY, next);
    try { await store.setJSON(`snapshots/clearance-${new Date().toISOString().slice(0,13).replace(/[:-]/g,'')}`, next); } catch {}
    return json({ ok: true, rev: next.rev, written, rejected, reset_at: next.reset_at });
  }
  return json({ error: 'method_not_allowed' }, 405);
};

export const config = { path: '/api/clearance' };
