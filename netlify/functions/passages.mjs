/**
 * Passage data — served ONLY to an authenticated caller.
 *
 * The manuscript is not in any page and not in any file that can be requested.
 * It is imported as a module (passages.data.mjs) and bundled into the function
 * at build time, so there is no data file to fetch and no bundling option to
 * misconfigure.
 *
 *   GET /api/passages   ->  { role, count, passages }
 */
import PASSAGES from './passages.data.mjs';
import { timingSafeEqual } from 'node:crypto';

const json = (b, s = 200) => new Response(JSON.stringify(b), {
  status: s,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
function same(a, b) {
  if (!a || !b) return false;
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
function roleFor(req) {
  const key = req.headers.get('x-cme-key') || new URL(req.url).searchParams.get('k') || '';
  if (same(key, process.env.CME_ELLIOTT_KEY)) return 'elliott';
  if (same(key, process.env.CME_STEPHEN_KEY)) return 'stephen';
  return null;
}

export default async (req) => {
  if (!process.env.CME_ELLIOTT_KEY || !process.env.CME_STEPHEN_KEY)
    return json({ error: 'server_not_configured' }, 503);
  const role = roleFor(req);
  if (!role) return json({ error: 'unauthorized' }, 401);

  // Elliott gets only what he reviews; Stephen gets everything for the dashboard.
  const passages = role === 'elliott' ? PASSAGES.filter(p => p.in_scope) : PASSAGES;
  return json({ role, count: passages.length, passages });
};

export const config = { path: '/api/passages' };
