#!/usr/bin/env node
/**
 * topology63-probe.mjs — frozen counter for kumitate round 63 claim C2 (rule T63 v1).
 *
 *   node .ufo/waves/round-63/probe/topology63-probe.mjs <lane-dir> <rev>
 *        [--entry corpus/knowledge/<file>.md] [--opened YYYY-MM-DD] [--no-live]
 *
 * Output: one verdict line and exit code.
 *   TOPOLOGY63_HELD  held=7/7 checks=7 rev=<rev> rule=T63   exit 0
 *   TOPOLOGY63_UNMET held=k/7 checks=7 rev=<rev> rule=T63 | <check> MISS <reason> ...   exit 1
 * Fail-closed (exit 2) only when the revision itself cannot be read.
 *
 * Every lane byte is read with `git archive <rev>` (committed bytes only; the worktree is never
 * read). Check T5 fetches each row's URL live: an unreachable source is a MISS, never a pass.
 *
 * T1 the entry exists and opens with the provenance trio: source:, verified-at: <opened>, recheck:.
 * T2 every S### on the entry's `source:` lines is a row inside `## Registry` of corpus/SOURCES.md:
 *    exactly 11 cells (NF=13), status mined, opened = <opened>, used-by names the entry; at least
 *    two distinct rows are cited.
 * T3 every cited row is bound in .ufo/pins/source-captures.json to a committed capture whose
 *    sha256 and byte size equal the pin.
 * T4 the entry's `## Located quotes` section holds >= 6 bullets `- S### — "<quote>"`, each <= 25
 *    words, each found (whitespace/markup-normalised) in that row's capture; every cited row has
 *    at least one bullet.
 * T5 each bullet's quote is also found in a fresh live fetch of the row's URL.
 * T6 `sources-census.sh validate --file <archive>/corpus/SOURCES.md` exits 0.
 * T7 PROVINCE.md names the entry path on a frontier line, and `node scripts/readme-map.mjs` in
 *    the archive prints README_MAP: CLEAN.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CENSUS = process.env.SOURCES_CENSUS || '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const RULE = 'T63';
const argv = process.argv.slice(2);
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--entry', '--opened'].includes(argv[i - 1])));
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
if (pos.length < 2) { process.stderr.write('usage: topology63-probe.mjs <lane-dir> <rev> [--entry path] [--opened date] [--no-live]\n'); process.exit(64); }
const lane = resolve(pos[0]);
const rev = pos[1];
const ENTRY = opt('--entry', 'corpus/knowledge/multi-agent-coordinator-topologies.md');
const OPENED = opt('--opened', '2026-10-25');
const LIVE = !argv.includes('--no-live');

const rv = spawnSync('git', ['-C', lane, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8' });
if (rv.status !== 0) { process.stdout.write(`TOPOLOGY63_UNMET held=0/7 checks=7 rev=${rev} rule=${RULE} | rev-unreadable\n`); process.exit(2); }
const full = rv.stdout.trim();

const T = mkdtempSync(join(tmpdir(), 'topology63.'));
const ar = spawnSync('bash', ['-c', `git -C "${lane}" archive "${full}" | tar -x -C "${T}"`], { encoding: 'utf8' });
if (ar.status !== 0) { process.stdout.write(`TOPOLOGY63_UNMET held=0/7 checks=7 rev=${full} rule=${RULE} | archive-failed\n`); rmSync(T, { recursive: true, force: true }); process.exit(2); }
const rd = (rel) => { try { return readFileSync(join(T, rel)); } catch { return null; } };

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const miss = [];
const results = {};
const check = (id, ok, why) => { results[id] = ok; if (!ok) miss.push(`${id} MISS ${why}`); };

// ---- T1
const entryRaw = rd(ENTRY);
let ids = [];
if (!entryRaw) check('T1', false, 'entry-absent');
else {
  const text = entryRaw.toString('utf8');
  const head = text.split('\n').slice(0, 14).join('\n');
  const hasSrc = /^source:\s*S\d{3,}/m.test(head);
  const hasVer = new RegExp(`^verified-at:\\s*${OPENED}`, 'm').test(head);
  const hasRec = /^recheck:\s*\S+/m.test(head);
  ids = [...new Set([...head.matchAll(/^source:[^\n]*/gm)].flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];
  check('T1', hasSrc && hasVer && hasRec, `trio source=${hasSrc} verified-at=${hasVer} recheck=${hasRec}`);
}

// ---- T2
const srcRaw = rd('corpus/SOURCES.md');
const rows = new Map();
if (srcRaw) {
  const lines = srcRaw.toString('utf8').split('\n');
  const start = lines.findIndex((l) => /^ {0,3}##\s+Registry\b/.test(l));
  let end = lines.length;
  for (let i = start + 1; i < lines.length && start >= 0; i += 1) if (/^ {0,3}##\s/.test(lines[i])) { end = i; break; }
  if (start >= 0) {
    for (let i = start + 1; i < end; i += 1) {
      const m = /^ {0,3}\|\s*(S\d{3,})\s*\|/.exec(lines[i]);
      if (m) rows.set(m[1], lines[i]);
    }
  }
}
const cells = (line) => line.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
if (!entryRaw) check('T2', false, 'no-entry');
else {
  const bad = [];
  if (ids.length < 2) bad.push(`cites-${ids.length}-rows`);
  for (const id of ids) {
    const line = rows.get(id);
    if (!line) { bad.push(`${id}:not-in-registry`); continue; }
    const c = cells(line);
    if (c.length !== 13) { bad.push(`${id}:NF=${c.length}`); continue; }
    const [, , source, , tier, , , , status, opened, , usedBy] = c;
    if (status !== 'mined') bad.push(`${id}:status=${status}`);
    if (opened !== OPENED) bad.push(`${id}:opened=${opened}`);
    if (!usedBy.includes(ENTRY)) bad.push(`${id}:used-by-lacks-entry`);
    if (!/https?:\/\//.test(source)) bad.push(`${id}:no-url`);
    if (tier === '') bad.push(`${id}:no-tier`);
  }
  check('T2', bad.length === 0, bad.join(','));
}

// ---- T3
const caps = new Map();
try { for (const c of JSON.parse(rd('.ufo/pins/source-captures.json').toString('utf8')).captures) caps.set(c.sourceId, c); } catch { /* absent */ }
const capText = new Map();
{
  const bad = [];
  for (const id of ids) {
    const c = caps.get(id);
    if (!c) { bad.push(`${id}:unbound`); continue; }
    const b = rd(c.path);
    if (!b) { bad.push(`${id}:capture-absent`); continue; }
    if (createHash('sha256').update(b).digest('hex') !== c.sha256 || b.length !== c.bytes) bad.push(`${id}:hash-or-size`);
    else capText.set(id, norm(b));
  }
  check('T3', ids.length > 0 && bad.length === 0, ids.length ? bad.join(',') : 'no-rows');
}

// ---- T4
const bullets = [];
if (entryRaw) {
  const text = entryRaw.toString('utf8');
  const at = text.search(/^##\s+Located quotes\s*$/m);
  if (at >= 0) {
    const rest = text.slice(at).split('\n').slice(1);
    for (const l of rest) {
      if (/^##\s/.test(l)) break;
      const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l);
      if (m) bullets.push({ id: m[1], q: m[2] });
    }
  }
}
{
  const bad = [];
  if (bullets.length < 6) bad.push(`bullets=${bullets.length}`);
  for (const id of ids) if (!bullets.some((b) => b.id === id)) bad.push(`${id}:no-bullet`);
  for (const b of bullets) {
    if (b.q.trim().split(/\s+/).length > 25) bad.push(`${b.id}:over-25-words`);
    if (!ids.includes(b.id)) { bad.push(`${b.id}:not-a-source`); continue; }
    const t = capText.get(b.id);
    if (!t || !t.includes(norm(b.q))) bad.push(`${b.id}:quote-not-in-capture(${b.q.slice(0, 30)})`);
  }
  check('T4', bad.length === 0, bad.slice(0, 6).join(';'));
}

// ---- T5
if (!LIVE) check('T5', false, 'live-fetch-skipped');
else {
  const bad = [];
  const live = new Map();
  for (const id of ids) {
    const line = rows.get(id);
    const url = line && /(https?:\/\/[^\s|)]+)/.exec(cells(line)[2] || '');
    if (!url) { bad.push(`${id}:no-url`); continue; }
    const r = spawnSync('curl', ['-fsSL', '--max-time', '90', '--retry', '2', '-A', 'Mozilla/5.0 (kumitate-topology63)', url[1]], { maxBuffer: 128 * 1024 * 1024 });
    if (r.status !== 0) { bad.push(`${id}:live-unreachable`); continue; }
    live.set(id, norm(r.stdout));
  }
  for (const b of bullets) {
    const t = live.get(b.id);
    if (!t) continue;
    if (!t.includes(norm(b.q))) bad.push(`${b.id}:quote-not-live(${b.q.slice(0, 30)})`);
  }
  check('T5', bullets.length > 0 && bad.length === 0, bullets.length ? bad.slice(0, 6).join(';') : 'no-bullets');
}

// ---- T6
{
  const r = spawnSync('bash', [CENSUS, 'validate', '--file', join(T, 'corpus', 'SOURCES.md')], { encoding: 'utf8' });
  check('T6', r.status === 0, `census-exit=${r.status}`);
}

// ---- T7
{
  const prov = rd('PROVINCE.md');
  const named = prov ? prov.toString('utf8').split('\n').some((l) => l.includes(ENTRY) && /frontier|band|ground|first entry/i.test(l)) : false;
  let clean = false;
  if (existsSync(join(T, 'scripts', 'readme-map.mjs'))) {
    const r = spawnSync('node', ['scripts/readme-map.mjs'], { cwd: T, encoding: 'utf8' });
    clean = r.status === 0 && /README_MAP: CLEAN/.test(r.stdout);
  }
  check('T7', named && clean, `province-names-entry=${named} readme-map-clean=${clean}`);
}

rmSync(T, { recursive: true, force: true });
const held = Object.values(results).filter(Boolean).length;
const ok = held === 7;
process.stdout.write(`TOPOLOGY63_${ok ? 'HELD' : 'UNMET'} held=${held}/7 checks=7 rev=${full} rule=${RULE}${miss.length ? ` | ${miss.join(' | ')}` : ''}\n`);
process.exit(ok ? 0 : 1);
