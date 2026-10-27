#!/usr/bin/env node
// qcheck.mjs — seat K66ScribeGate. Re-runs the frozen counter's OWN M4/M5/M6/M7 rules
// (copied verbatim from .ufo/waves/round-66/probe/deprec66-probe.mjs:52-62, 140-219) against
// this seat's entry skeleton and this seat's own captures. Not a counter; a receipt.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CAP = join(HERE, 'captures');
const SKEL = readFileSync(join(HERE, 'entry-skeleton.md'), 'utf8');

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const delink = (s) => s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

const ROWS = {
  S207: { file: 'deprecated-2026-07-28.md', url: 'https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md' },
  S208: { file: 'feature-lifecycle.md', url: 'https://modelcontextprotocol.io/community/feature-lifecycle.md' },
  S209: { file: 'sse.ts', url: 'https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts' },
  S210: { file: 'sep2596.md', url: 'https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation.md' },
};
const capRaw = new Map();
const capText = new Map();
for (const [id, r] of Object.entries(ROWS)) { const b = readFileSync(join(CAP, r.file)); capRaw.set(id, b.toString('utf8')); capText.set(id, norm(b)); }

const section = (text, title) => {
  const at = text.search(new RegExp(`^##\\s+${title}\\s*$`, 'm'));
  if (at < 0) return null;
  const rest = text.slice(at).split('\n').slice(1); const out = [];
  for (const l of rest) { if (/^##\s/.test(l)) break; out.push(l); }
  return out.join('\n');
};

// ids from the skeleton's source: lines
const head = SKEL.split('\n').slice(0, 14).join('\n');
const ids = [...new Set([...head.matchAll(/^source:[^\n]*/gm)].flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];
console.log(`IDS ${ids.join(' ')} count=${ids.length} (M1 needs >=3, all opened 2026-10-27)`);

// ---- M4
const bullets = [];
const s4 = section(SKEL, 'Located quotes');
if (s4) for (const l of s4.split('\n')) { const m = /^-\s+(S\d{3,})\s+[\u2014-]\s+"(.+)"\s*$/.exec(l); if (m) bullets.push({ id: m[1], q: m[2] }); }
const b4 = [];
if (bullets.length < 6) b4.push(`bullets=${bullets.length}`);
for (const id of ids) if (!bullets.some((b) => b.id === id)) b4.push(`${id}:no-bullet`);
if (!bullets.some((b) => b.q.includes('2027-07-28'))) b4.push('no-2027-07-28-quote');
if (!bullets.some((b) => b.q.includes('Three months after'))) b4.push('no-three-months-quote');
for (const b of bullets) {
  const w = b.q.trim().split(/\s+/).length;
  if (w > 25) b4.push(`${b.id}:over-25-words(${w})`);
  if (!ids.includes(b.id)) { b4.push(`${b.id}:not-a-source`); continue; }
  if (!capText.get(b.id)?.includes(norm(b.q))) b4.push(`${b.id}:quote-not-in-capture(${b.q.slice(0, 30)})`);
  console.log(`BULLET ${b.id} words=${w} in-capture=${capText.get(b.id)?.includes(norm(b.q))} "${b.q.slice(0, 60)}"`);
}
console.log(`M4-sim ${b4.length === 0 ? 'PASS' : 'FAIL ' + b4.join(';')} bullets=${bullets.length}`);

// ---- M5 (live)
const b5 = []; const live = new Map();
for (const id of new Set(bullets.map((b) => b.id))) {
  const r = spawnSync('curl', ['-fsSL', '--max-time', '90', '--retry', '2', '-A', 'Mozilla/5.0 (kumitate-deprec66)', ROWS[id].url], { maxBuffer: 128 * 1024 * 1024 });
  if (r.status !== 0) { b5.push(`${id}:live-unreachable`); continue; }
  live.set(id, norm(r.stdout));
  console.log(`LIVE ${id} http-ok bytes=${r.stdout.length}`);
}
for (const b of bullets) { const t = live.get(b.id); if (t && !t.includes(norm(b.q))) b5.push(`${b.id}:quote-not-live`); }
console.log(`M5-sim ${b5.length === 0 ? 'PASS' : 'FAIL ' + b5.join(';')}`);

// ---- M6 (capture table vs skeleton snapshot)
const bad6 = [];
const raw = capRaw.get('S207');
const L = raw.split('\n');
const dep = L.findIndex((l) => /^#{1,3}\s+Deprecated\b/.test(l));
const capRows = [];
for (let i = Math.max(0, dep) + 1; i < L.length; i += 1) {
  if (/^#{1,3}\s+Removed\b/.test(L[i])) break;
  if (!L[i].startsWith('|') || /^\|[\s:|-]+\|\s*$/.test(L[i]) || /^\|\s*Feature\s*\|/i.test(L[i])) continue;
  const c = L[i].trim().slice(1, -1).split('|').map((x) => norm(delink(x)));
  if (c.length >= 5) capRows.push(c);
}
const snap = section(SKEL, 'Registry snapshot');
const snapRows = [];
if (snap == null) bad6.push('no-Registry-snapshot-section');
else for (const l of snap.split('\n')) if (l.startsWith('|') && !/^\|[\s:|-]+\|\s*$/.test(l)) snapRows.push(l);
const dataRows = snapRows.slice(1);
const snapText = norm(delink(snapRows.join('\n')));
if (capRows.length < 5) bad6.push(`capture-table-rows=${capRows.length}<5`);
if (dataRows.length !== capRows.length) bad6.push(`snapshot-rows=${dataRows.length}!=capture-rows=${capRows.length}`);
for (const c of capRows) {
  const [feature, , depIn, , removal] = c;
  if (!snapText.includes(depIn)) bad6.push(`deprecated-in-missing(${feature.slice(0, 20)}:${depIn})`);
  if (!snapText.includes(removal)) bad6.push(`removal-missing(${feature.slice(0, 20)}:${removal})`);
  console.log(`CAPROW ${feature.slice(0, 28)} | dep-in=${depIn} | removal=${removal}`);
}
console.log(`M6-sim ${bad6.length === 0 ? 'PASS' : 'FAIL ' + bad6.join(';')} capRows=${capRows.length} snapRows=${dataRows.length}`);

// ---- M7
const b7 = [];
const s7 = section(SKEL, 'Bearing on the installed OMP release');
if (s7 == null) b7.push('no-Bearing-section');
else {
  if (!/\bS20[1-6]\b/.test(s7)) b7.push('no-S201..S206-citation');
  if (!/\broots\b/i.test(s7)) b7.push('no-roots');
  if (!s7.includes('HTTP+SSE')) b7.push('no-HTTP+SSE');
}
if (!ids.some((id) => (ROWS[id]?.url || '').includes('/v18.12.6/') && /sse\.ts$/.test(ROWS[id].url))) b7.push('no-cited-row-for-sse.ts-at-v18.12.6');
console.log(`M7-sim ${b7.length === 0 ? 'PASS' : 'FAIL ' + b7.join(';')}`);

const ok = [b4, b5, bad6, b7].every((a) => a.length === 0);
console.log(`QCHECK ${ok ? 'PASS' : 'FAIL'} m4=${b4.length === 0} m5=${b5.length === 0} m6=${bad6.length === 0} m7=${b7.length === 0}`);
process.exit(ok ? 0 : 1);
