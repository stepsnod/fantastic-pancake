/**
 * Passage data — served ONLY to an authenticated caller.
 *
 * The manuscript is not in any page and not in any file that can be requested.
 * It is imported as a module (./passages.data.mjs) and bundled into this
 * function at build time — no data file to fetch, no bundling option to
 * misconfigure.
 *
 * This function is a FOLDER, netlify/functions/passages/, with the entry point
 * at index.mjs. That matters: Netlify treats every top-level file in the
 * functions directory as its own function, so a sibling passages.data.mjs was
 * discovered as a second function called "passages.data" and failed to deploy
 * (a function name may only contain letters, numbers, hyphens and underscores).
 * Inside a function folder, only index.mjs is an entry point; everything else
 * is an ordinary bundled dependency. Renaming would not have fixed this —
 * passages_data.mjs would still have been discovered as its own function.
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
