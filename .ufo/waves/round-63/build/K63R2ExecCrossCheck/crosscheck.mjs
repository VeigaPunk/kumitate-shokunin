#!/usr/bin/env node
// Independent read-only reconstruction of the run-7 w1 seat inventory.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const sessions = '/home/vgpnk/.omp/agent/sessions';
const contextHead = 'ROUND CONTEXT (kumitate round 63, wave w1';
const dispatch = JSON.parse(fs.readFileSync(path.join(root, '.ufo/waves/round-63/w1-dispatch.json'), 'utf8'));
const seats = Object.keys(dispatch.registry.members), candidates = new Map(seats.map(s => [s, []]));
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.isFile() && ent.name.endsWith('.jsonl')) {
      for (const seat of seats) if (ent.name === `${seat}.jsonl` || new RegExp(`^${seat}-\\d+\\.jsonl$`).test(ent.name)) candidates.get(seat).push(p);
    }
  }
}
walk(sessions);
function texts(msg) { return Array.isArray(msg?.content) ? msg.content.filter(x => x?.type === 'text').map(x => x.text || '').join('\n') : ''; }
function inspect(p, seat) {
  const parsed = [];
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) if (line) { try { parsed.push(JSON.parse(line)); } catch {} }
  const firstUser = parsed.find(x => x.type === 'message' && x.message?.role === 'user');
  const prompt = texts(firstUser?.message);
  if (!prompt.includes(contextHead) || !prompt.includes(`# Seat ${seat}`)) return null;
  const sid = parsed.find(x => x.type === 'session')?.id || '';
  const ts = parsed.map(x => x.timestamp).filter(Boolean).sort();
  let calls = 0, finished = false;
  for (const x of parsed) if (x.type === 'message' && x.message?.role === 'assistant' && Array.isArray(x.message.content))
    for (const c of x.message.content) if (c?.type === 'toolCall') { calls++; if (c.name === 'yield') finished = true; }
  return { sid, calls, finished, first: ts[0] || '', last: ts.at(-1) || '' };
}
console.log('seat\ttranscript_found\tsession_id\tfinished\ttool_calls\tfirst_timestamp\tlast_timestamp\treport_bytes\treport_sha256');
let found = 0, finished = 0, missing = 0, ambiguous = 0;
for (const seat of seats) {
  const hits = candidates.get(seat).map(p => ({ p, x: inspect(p, seat) })).filter(q => q.x);
  const report = path.join(root, '.ufo/waves/round-63/w1', `${seat}.md`);
  let bytes = '', sha = '';
  try { const b = fs.readFileSync(report); bytes = String(b.byteLength); sha = crypto.createHash('sha256').update(b).digest('hex'); } catch {}
  if (hits.length === 1) { found++; if (hits[0].x.finished) finished++; } else if (!hits.length) missing++; else ambiguous++;
  const h = hits.length === 1 ? hits[0].x : null;
  console.log([seat, hits.length === 1 ? 'yes' : hits.length ? `ambiguous:${hits.length}` : 'no', h?.sid || '', h?.finished ?? '', h?.calls ?? '', h?.first || '', h?.last || '', bytes, sha].join('\t'));
}
console.log(`SUMMARY\tdispatched=${seats.length}\ttranscript_found=${found}\tfinished=${finished}\tmissing=${missing}\tambiguous=${ambiguous}`);
