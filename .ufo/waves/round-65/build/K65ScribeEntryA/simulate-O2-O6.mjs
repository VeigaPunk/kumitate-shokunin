import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const DRAFT = LANE + '/.ufo/waves/round-65/build/K65ScribeEntryA/omp-installed-release-mcp-runtime.md';
const ENTRY = 'corpus/knowledge/omp-installed-release-mcp-runtime.md';
const B = LANE + '/.ufo/waves/round-65/build/';
// --- build scratch SOURCES with the four rows appended after S200
let src = readFileSync(LANE + '/corpus/SOURCES.md', 'utf8').split('\n');
const rows = ['K65ScoutTypesTs/row-S201.md','K65ScoutRuntimeDoc/S202-row.md','K65ScribeEntryA/row-S203.md','K65ScribeEntryA/row-S204.md','K65ScribeEntryA/row-S205.md','K65ScribeEntryA/row-S206.md']
  .map((p) => readFileSync(B + p, 'utf8').trim());
const at200 = src.findIndex((l) => /^ {0,3}\|\s*S200\s*\|/.test(l));
src.splice(at200 + 1, 0, ...rows);
const scratch = src.join('\n');
// --- probe rowsOf
const rowsOf = (buf) => {
  const out = new Map(); if (!buf) return out;
  const lines = buf.toString('utf8').split('\n');
  const start = lines.findIndex((l) => /^ {0,3}##\s+Registry\b/.test(l));
  let end = lines.length;
  for (let i = start + 1; i < lines.length && start >= 0; i += 1) if (/^ {0,3}##\s/.test(lines[i])) { end = i; break; }
  if (start >= 0) for (let i = start + 1; i < end; i += 1) { const m = /^ {0,3}\|\s*(S\d{3,})\s*\|/.exec(lines[i]); if (m) out.set(m[1], lines[i]); }
  return out;
};
const reg = rowsOf(scratch);
const baseRows = rowsOf(spawnSync('git', ['-C', LANE, 'show', '47fe2383151909d31557ada118ad84f90404dc6c:corpus/SOURCES.md'], { encoding: 'buffer', maxBuffer: 1 << 26 }).stdout);
const text = readFileSync(DRAFT, 'utf8');
const head = text.split('\n').slice(0, 14).join('\n');
const ids = [...new Set([...head.matchAll(/^source:[^\n]*/gm)].flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];
const cells = (line) => line.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
const bad = [];
for (const id of ids) {
  const line = reg.get(id);
  if (!line) { bad.push(`${id}:not-in-registry`); continue; }
  if (baseRows.has(id)) bad.push(`${id}:existed-at-base`);
  const c = cells(line);
  if (c.length !== 13) { bad.push(`${id}:NF=${c.length}`); continue; }
  const [, , source, , tier, , , , status, opened, , usedBy] = c;
  if (status !== 'mined') bad.push(`${id}:status=${status}`);
  if (opened !== '2026-10-25') bad.push(`${id}:opened=${opened}`);
  if (!usedBy.includes(ENTRY)) bad.push(`${id}:used-by=${usedBy}`);
  if (!/https?:\/\//.test(source)) bad.push(`${id}:no-url`);
  if (tier !== 'A' && tier !== 'B') bad.push(`${id}:tier=${tier}`);
}
console.log(`O2 ids=${ids.join(',')} bad=${bad.length} ${bad.join(' | ')}`);
// --- O6
const probe = spawnSync('bash', [LANE + '/scripts/omp-binary-probe.sh'], { encoding: 'utf8', timeout: 180000 });
const live = new Map();
for (const l of (probe.stdout || '').split('\n')) { const m = /^OMP_BIN: ([A-Za-z0-9_-]+)=(.*)$/.exec(l); if (m) live.set(m[1], m[2]); }
const stated = new Map();
const at = text.search(/^##\s+Host measurements\s*$/m);
for (const l of (at >= 0 ? text.slice(at).split('\n').slice(1) : [])) { if (/^##\s/.test(l)) break; const m = /^-\s+([A-Za-z0-9_-]+)=(.*?)\s*$/.exec(l); if (m) stated.set(m[1], m[2]); }
const o6 = [];
if (probe.status !== 0) o6.push(`probe-exit=${probe.status}`);
if (stated.size < 12) o6.push(`stated-keys=${stated.size}`);
for (const [k, v] of live) if (stated.get(k) !== v) o6.push(`${k}:stated=${stated.get(k)}:live=${v}`);
for (const k of stated.keys()) if (!live.has(k)) o6.push(`${k}:stated-not-live`);
const real = live.get('real_version');
const pinned = ids.filter((id) => { const u = reg.get(id) || ''; return u.includes(`/v${real}/`) || u.includes('/45c35e40c46166dc726ccc52f5d27f40f2449f99/'); });
if (pinned.length < 2) o6.push(`rows-pinned=${pinned.length}`);
if (!text.includes('lit_2026_07_28') || !text.includes('real_version')) o6.push('body-lacks-literals');
console.log(`O6 keys-stated=${stated.size} keys-live=${live.size} pinned=${pinned.join(',')} bad=${o6.length} ${o6.join(' | ')}`);
