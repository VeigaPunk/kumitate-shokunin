#!/usr/bin/env node
/**
 * deprec66-probe.mjs — frozen counter for kumitate round 66 claim C2 (rule M66 v1).
 *
 *   node .ufo/waves/round-66/probe/deprec66-probe.mjs <lane-dir> <rev> [--no-live]
 *
 * Predicate DEPREC66_HELD (checks M1..M8), measured over `git archive <rev>` (never the worktree):
 *   M1 entry corpus/knowledge/mcp-deprecation-registry.md exists; its first 14 lines carry `source:` lines naming >= 3
 *      distinct S### ids, `verified-at: 2026-10-27` and `recheck:`.
 *   M2 every S-id on those `source:` lines is a `## Registry` row of corpus/SOURCES.md absent at the round base, with 11
 *      cells, status `mined`, opened 2026-10-27, a URL, tier A or B, and a used-by cell naming the entry.
 *   M3 each cited row is bound in .ufo/pins/source-captures.json to a committed capture whose sha256 and size match.
 *   M4 the entry's `## Located quotes` holds >= 6 bullets `- S### — "<quote>"`, each <= 25 words, each found
 *      (normalised) in its row's capture; every cited row has >= 1; one quote contains `2027-07-28` and one contains
 *      `Three months after`.
 *   M5 every bullet's quote is found in a fresh live fetch of its row's URL (unreachable = MISS; --no-live = MISS).
 *   M6 the entry's `## Registry snapshot` table has exactly as many data rows as the Deprecated table in the capture
 *      of the cited row whose URL contains `/specification/2026-07-28/deprecated` (>= 5), and for every capture row
 *      its `Deprecated in` and `Earliest removal` cells (links and markup stripped) occur in the snapshot table.
 *   M7 the entry's `## Bearing on the installed OMP release` section names >= 1 of the round-65 rows S201..S206, the
 *      words `roots` and `HTTP+SSE`; and >= 1 cited new row's URL carries `/v18.12.6/` and ends in `sse.ts`.
 *   M8 on the archive: sources-census validate --file exits 0; scripts/sources-check.mjs reads SOURCES_CHECK: CLEAN;
 *      scripts/source-capture.mjs reads SOURCE_CAPTURE: CLEAN; scripts/readme-map.mjs reads README_MAP: CLEAN; and a
 *      PROVINCE.md frontier line names the entry path.
 * Verdict: DEPREC66_HELD held=8/8 checks=8 rev=<full> rule=M66 (exit 0) | DEPREC66_UNMET held=k/8 … (exit 1); exit 2 when
 * the revision cannot be read. Scratch honours TMPDIR and is removed before exit.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CENSUS = process.env.SOURCES_CENSUS || '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const RULE = 'M66';
const BASE = '8d557f85312de4fcc82e09ff735d21436bc3746d'; // round-66 base: lane tip when the round started
const ENTRY = 'corpus/knowledge/mcp-deprecation-registry.md';
const OPENED = '2026-10-27';
const N = 8;
const argv = process.argv.slice(2);
const pos = argv.filter((a) => !a.startsWith('--'));
if (pos.length < 2) { process.stderr.write('usage: deprec66-probe.mjs <lane-dir> <rev> [--no-live]\n'); process.exit(64); }
const lane = resolve(pos[0]); const rev = pos[1]; const LIVE = !argv.includes('--no-live');
const rv = spawnSync('git', ['-C', lane, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8' });
if (rv.status !== 0) { process.stdout.write(`DEPREC66_UNMET held=0/${N} checks=${N} rev=${rev} rule=${RULE} | rev-unreadable\n`); process.exit(2); }
const full = rv.stdout.trim();
const T = mkdtempSync(join(tmpdir(), 'deprec66.'));
const ar = spawnSync('bash', ['-c', `git -C "${lane}" archive "${full}" | tar -x -C "${T}"`], { encoding: 'utf8' });
if (ar.status !== 0) { process.stdout.write(`DEPREC66_UNMET held=0/${N} checks=${N} rev=${full} rule=${RULE} | archive-failed\n`); rmSync(T, { recursive: true, force: true }); process.exit(2); }
const rd = (rel) => { try { return readFileSync(join(T, rel)); } catch { return null; } };

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const delink = (s) => s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

const miss = []; const results = {};
const check = (id, ok, why) => { results[id] = !!ok; if (!ok) miss.push(`${id} MISS ${why}`); };
const entryRaw = rd(ENTRY);
const text = entryRaw ? entryRaw.toString('utf8') : '';
const section = (title) => {
  const at = text.search(new RegExp(`^##\\s+${title}\\s*$`, 'm'));
  if (at < 0) return null;
  const rest = text.slice(at).split('\n').slice(1);
  const out = [];
  for (const l of rest) { if (/^##\s/.test(l)) break; out.push(l); }
  return out.join('\n');
};

// ---- M1
let ids = [];
if (!entryRaw) check('M1', false, 'entry-absent');
else {
  const head = text.split('\n').slice(0, 14).join('\n');
  const hasSrc = /^source:\s*S\d{3,}/m.test(head);
  const hasVer = new RegExp(`^verified-at:\\s*${OPENED}`, 'm').test(head);
  const hasRec = /^recheck:\s*\S+/m.test(head);
  ids = [...new Set([...head.matchAll(/^source:[^\n]*/gm)].flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];
  check('M1', hasSrc && hasVer && hasRec && ids.length >= 3, `source=${hasSrc} verified-at=${hasVer} recheck=${hasRec} ids=${ids.length}`);
}

// ---- M2
const rowsOf = (buf) => {
  const rows = new Map();
  if (!buf) return rows;
  const lines = buf.toString('utf8').split('\n');
  const start = lines.findIndex((l) => /^ {0,3}##\s+Registry\b/.test(l));
  let end = lines.length;
  for (let i = start + 1; i < lines.length && start >= 0; i += 1) if (/^ {0,3}##\s/.test(lines[i])) { end = i; break; }
  if (start >= 0) for (let i = start + 1; i < end; i += 1) { const m = /^ {0,3}\|\s*(S\d{3,})\s*\|/.exec(lines[i]); if (m) rows.set(m[1], lines[i]); }
  return rows;
};
const rows = rowsOf(rd('corpus/SOURCES.md'));
const baseSrc = spawnSync('git', ['-C', lane, 'show', `${BASE}:corpus/SOURCES.md`], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
const baseRows = rowsOf(baseSrc.status === 0 ? baseSrc.stdout : null);
const cells = (line) => line.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
const urlOf = (id) => { const l = rows.get(id); const m = l && /(https?:\/\/[^\s|)]+)/.exec(cells(l)[2] || ''); return m ? m[1] : null; };
if (!entryRaw) check('M2', false, 'no-entry');
else {
  const bad = [];
  if (ids.length < 3) bad.push(`cites-${ids.length}-rows`);
  for (const id of ids) {
    const line = rows.get(id);
    if (!line) { bad.push(`${id}:not-in-registry`); continue; }
    if (baseRows.has(id)) bad.push(`${id}:existed-at-round-base`);
    const c = cells(line);
    if (c.length !== 13) { bad.push(`${id}:NF=${c.length}`); continue; }
    const [, , source, , tier, , , , status, opened, , usedBy] = c;
    if (status !== 'mined') bad.push(`${id}:status=${status}`);
    if (opened !== OPENED) bad.push(`${id}:opened=${opened}`);
    if (!usedBy.includes(ENTRY)) bad.push(`${id}:used-by-lacks-entry`);
    if (!/https?:\/\//.test(source)) bad.push(`${id}:no-url`);
    if (tier !== 'A' && tier !== 'B') bad.push(`${id}:tier=${tier}`);
  }
  check('M2', bad.length === 0, bad.join(','));
}

// ---- M3
const caps = new Map();
try { for (const c of JSON.parse(rd('.ufo/pins/source-captures.json').toString('utf8')).captures) caps.set(c.sourceId, c); } catch { /* absent */ }
const capRaw = new Map(); const capText = new Map();
{
  const bad = [];
  for (const id of ids) {
    const c = caps.get(id);
    if (!c) { bad.push(`${id}:unbound`); continue; }
    const b = rd(c.path);
    if (!b) { bad.push(`${id}:capture-absent`); continue; }
    if (createHash('sha256').update(b).digest('hex') !== c.sha256 || b.length !== c.bytes) bad.push(`${id}:hash-or-size`);
    else { capRaw.set(id, b.toString('utf8')); capText.set(id, norm(b)); }
  }
  check('M3', ids.length > 0 && bad.length === 0, ids.length ? bad.join(',') : 'no-rows');
}

// ---- M4
const bullets = [];
{
  const s = section('Located quotes');
  if (s) for (const l of s.split('\n')) { const m = /^-\s+(S\d{3,})\s+[\u2014-]\s+"(.+)"\s*$/.exec(l); if (m) bullets.push({ id: m[1], q: m[2] }); }
  const bad = [];
  if (bullets.length < 6) bad.push(`bullets=${bullets.length}`);
  for (const id of ids) if (!bullets.some((b) => b.id === id)) bad.push(`${id}:no-bullet`);
  if (!bullets.some((b) => b.q.includes('2027-07-28'))) bad.push('no-2027-07-28-quote');
  if (!bullets.some((b) => b.q.includes('Three months after'))) bad.push('no-three-months-quote');
  for (const b of bullets) {
    if (b.q.trim().split(/\s+/).length > 25) bad.push(`${b.id}:over-25-words`);
    if (!ids.includes(b.id)) { bad.push(`${b.id}:not-a-source`); continue; }
    const t = capText.get(b.id);
    if (!t || !t.includes(norm(b.q))) bad.push(`${b.id}:quote-not-in-capture(${b.q.slice(0, 30)})`);
  }
  check('M4', bad.length === 0, bad.slice(0, 6).join(';'));
}

// ---- M5
if (!LIVE) check('M5', false, 'live-fetch-skipped');
else {
  const bad = []; const live = new Map();
  for (const id of new Set(bullets.map((b) => b.id))) {
    const url = urlOf(id);
    if (!url) { bad.push(`${id}:no-url`); continue; }
    const r = spawnSync('curl', ['-fsSL', '--max-time', '90', '--retry', '2', '-A', 'Mozilla/5.0 (kumitate-deprec66)', url], { maxBuffer: 128 * 1024 * 1024 });
    if (r.status !== 0) { bad.push(`${id}:live-unreachable`); continue; }
    live.set(id, norm(r.stdout));
  }
  for (const b of bullets) { const t = live.get(b.id); if (t && !t.includes(norm(b.q))) bad.push(`${b.id}:quote-not-live(${b.q.slice(0, 30)})`); }
  check('M5', bullets.length > 0 && bad.length === 0, bullets.length ? bad.slice(0, 6).join(';') : 'no-bullets');
}

// ---- M6
{
  const bad = [];
  const regId = ids.find((id) => (urlOf(id) || '').includes('/specification/2026-07-28/deprecated'));
  const raw = regId ? capRaw.get(regId) : null;
  if (!regId) bad.push('no-cited-row-for-the-2026-07-28-deprecated-page');
  else if (!raw) bad.push(`${regId}:capture-unusable`);
  const capRows = [];
  if (raw) {
    const L = raw.split('\n');
    const dep = L.findIndex((l) => /^#{1,3}\s+Deprecated\b/.test(l));
    for (let i = Math.max(0, dep) + 1; i < L.length; i += 1) {
      if (/^#{1,3}\s+Removed\b/.test(L[i])) break;
      if (!L[i].startsWith('|') || /^\|[\s:|-]+\|\s*$/.test(L[i]) || /^\|\s*Feature\s*\|/i.test(L[i])) continue;
      const c = L[i].trim().slice(1, -1).split('|').map((x) => norm(delink(x)));
      if (c.length >= 5) capRows.push(c);
    }
  }
  const snap = section('Registry snapshot');
  const snapRows = [];
  if (snap == null) bad.push('no-Registry-snapshot-section');
  else for (const l of snap.split('\n')) if (l.startsWith('|') && !/^\|[\s:|-]+\|\s*$/.test(l)) snapRows.push(l);
  const dataRows = snapRows.slice(1); // first table line is the header
  const snapText = norm(delink(snapRows.join('\n')));
  if (capRows.length < 5) bad.push(`capture-table-rows=${capRows.length}<5`);
  if (dataRows.length !== capRows.length) bad.push(`snapshot-rows=${dataRows.length}!=capture-rows=${capRows.length}`);
  for (const c of capRows) {
    const [feature, , depIn, , removal] = c;
    if (!snapText.includes(depIn)) bad.push(`deprecated-in-missing(${feature.slice(0, 20)}:${depIn})`);
    if (!snapText.includes(removal)) bad.push(`removal-missing(${feature.slice(0, 20)})`);
  }
  check('M6', bad.length === 0, bad.slice(0, 6).join(';'));
}

// ---- M7
{
  const bad = [];
  const s = section('Bearing on the installed OMP release');
  if (s == null) bad.push('no-Bearing-section');
  else {
    if (!/\bS20[1-6]\b/.test(s)) bad.push('no-S201..S206-citation');
    if (!/\broots\b/i.test(s)) bad.push('no-roots');
    if (!s.includes('HTTP+SSE')) bad.push('no-HTTP+SSE');
  }
  if (!ids.some((id) => { const u = urlOf(id) || ''; return u.includes('/v18.12.6/') && /sse\.ts$/.test(u); })) bad.push('no-cited-row-for-sse.ts-at-v18.12.6');
  check('M7', bad.length === 0, bad.join(','));
}

// ---- M8
{
  const r = spawnSync('bash', [CENSUS, 'validate', '--file', join(T, 'corpus', 'SOURCES.md')], { encoding: 'utf8' });
  const run = (script, re) => existsSync(join(T, 'scripts', script)) && (() => { const m = spawnSync('node', [`scripts/${script}`], { cwd: T, encoding: 'utf8', env: { ...process.env, TMPDIR: T } }); return m.status === 0 && re.test(m.stdout); })();
  const prov = rd('PROVINCE.md');
  const named = prov ? prov.toString('utf8').split('\n').some((l) => l.includes(ENTRY) && /frontier|band|first entry|advanced/i.test(l)) : false;
  const sc = run('sources-check.mjs', /SOURCES_CHECK: CLEAN/); const cap = run('source-capture.mjs', /SOURCE_CAPTURE: CLEAN/); const rm = run('readme-map.mjs', /README_MAP: CLEAN/);
  check('M8', r.status === 0 && sc && cap && rm && named, `census-exit=${r.status} sources-check=${sc} source-capture=${cap} readme-map=${rm} province-names-entry=${named}`);
}

rmSync(T, { recursive: true, force: true });
const held = Object.values(results).filter(Boolean).length;
const ok = held === N;
process.stdout.write(`DEPREC66_${ok ? 'HELD' : 'UNMET'} held=${held}/${N} checks=${N} rev=${full} rule=${RULE}${miss.length ? ` | ${miss.join(' | ')}` : ''}\n`);
process.exit(ok ? 0 : 1);
