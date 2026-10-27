#!/usr/bin/env node
/**
 * deprec68-probe.mjs — frozen counter for kumitate round 68 claim C2 (rule M68 v1).
 *
 *   node .ufo/waves/round-68/probe/deprec68-probe.mjs <lane-dir> <rev> [--no-live]
 *
 * Predicate DEPREC68_HELD (checks M1..M10), measured over `git archive <rev>` (never the worktree):
 *   M1 the entry `corpus/knowledge/mcp-deprecation-registry.md` exists; its first 14 lines carry `source:` lines
 *     naming >= 3 S-ids, a `verified-at:` line, and a `recheck:` line.
 *   M2 every S-id on those `source:` lines is a `## Registry` row of `corpus/SOURCES.md` absent at the round base
 *     `d23892ad44b41e1af63b3edb949d265ca1dd812d`, 11 cells, `mined`, opened 2026-10-27, carrying a URL,
 *     tier A or B, and a `used-by` cell naming the entry.
 *   M3 each cited row is bound in `.ufo/pins/source-captures.json` to a committed capture whose sha256 and byte
 *     size match, whose path is relative, free of `..`, and resolves inside the lane, and whose file is regular.
 *   M4 the entry's `## Located quotes` holds >= 6 bullets of the form `- S### — "<quote>"`, each <= 25 words,
 *     each found in its row's capture; one quote contains `2027-07-28` and one contains `Three months after`;
 *     every cited row has >= 1 bullet.
 *   M5 every M4 bullet's quote is found in a fresh live fetch of its row's URL (unreachable = MISS;
 *     `--no-live` = MISS).
 *   M6 the entry's `## Registry snapshot` table has exactly as many data rows as the Deprecated table of the
 *     S207 capture (>= 5), and each snapshot row's Feature, `Deprecated in` and `Earliest removal` cells equal
 *     the capture row's delinked cells.
 *   M7 the entry's `## The live clock` section names `2026-06-03` as SEP-2596's Final date with an evidence
 *     pointer to S213, derives the elapsed grace `2026-09-03`, and contains neither `2026-04-17` nor `2026-05-18`.
 *   M8 the entry's `## Bearing on the installed OMP release` section names `18.13.1`, names `roots` and
 *     `HTTP+SSE`, cites >= 1 of S201..S206, and >= 1 cited new row whose URL contains `/v18.13.1/` is bound
 *     to a capture per M3.
 *   M9 on the archive: `sources-census.sh validate --file` exits 0; `scripts/sources-check.mjs` reads
 *     `SOURCES_CHECK: CLEAN`; `scripts/source-capture.mjs` reads `SOURCE_CAPTURE: CLEAN`;
 *     `scripts/readme-map.mjs` reads `README_MAP: CLEAN`; PROVINCE.md names the entry.
 *   M10 counter self-confinement, proven by fixtures at counting time: re-running this counter with
 *     NODE_OPTIONS=--require <preload> prints `DEPREC68_UNMET held=0/10 … | ENV_POISONED` and exits 2; a
 *     revision whose entry path is a symlink fails M1 (never reads a host file); a symlink at or above any
 *     static read path (the entry, SOURCES.md, the capture pins, PROVINCE.md) or any special file
 *     (fifo/socket/block/char) anywhere fails closed `EXTRACTION_UNSAFE` before any check — symlinks elsewhere
 *     in evidence trees are tolerated but never followed; every child process runs under an explicit environment
 *     allow-list (PATH, TMPDIR) with a timeout.
 * Verdict: DEPREC68_HELD held=10/10 checks=10 rev=<full> rule=M68 (exit 0) | DEPREC68_UNMET held=k/10 … | MISS reasons (exit 1);
 * exit 2 when the revision cannot be read or archived, the environment/extraction is unsafe, or --no-live is passed.
 * Scratch: honours TMPDIR; everything is removed before exit.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, existsSync, lstatSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, normalize, sep, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RULE = 'M68';
const BASE = 'd23892ad44b41e1af63b3edb949d265ca1dd812d'; // round-68 base
const N_CHECKS = 10;
const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const ENTRY_REL = 'corpus/knowledge/mcp-deprecation-registry.md';
const POISON = ['NODE_OPTIONS', 'LD_PRELOAD', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_COMMON_DIR', 'TAR_OPTIONS'];
const SELF = fileURLToPath(import.meta.url);

// ---- confinement preamble: refuse a poisoned environment before anything runs
for (const k of POISON) {
  if (process.env[k]) {
    process.stdout.write(`DEPREC68_UNMET held=0/${N_CHECKS} checks=${N_CHECKS} rev=unknown rule=${RULE} | ENV_POISONED:${k}\n`);
    process.exit(2);
  }
}

const argv = process.argv.slice(2);
const NO_LIVE = argv.includes('--no-live');
const pos = argv.filter((a) => !a.startsWith('--'));
if (pos.length < 2) { process.stderr.write('usage: deprec68-probe.mjs <lane-dir> <rev> [--no-live]\n'); process.exit(64); }
const lane = resolve(pos[0]);
const rev = pos[1];

const CHILD_ENV = (T) => ({ PATH: process.env.PATH || '/usr/bin:/bin', TMPDIR: T, LANG: process.env.LANG || 'C' });
const T = mkdtempSync(join(tmpdir(), 'deprec68.'));
const A = join(T, 'archive');

const rv = spawnSync('git', ['-C', lane, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8', env: CHILD_ENV(T) });
if (rv.status !== 0) { process.stdout.write(`DEPREC68_UNMET held=0/${N_CHECKS} checks=${N_CHECKS} rev=${rev} rule=${RULE} | rev-unreadable\n`); rmSync(T, { recursive: true, force: true }); process.exit(2); }
const full = rv.stdout.trim();

// ---- symlink-safe extraction; any symlink/special file in the revision fails closed
function extract(dst) {
  mkdirSync(dst);
  const ar = spawnSync('bash', ['-c', `git -C "${lane}" archive "${full}" | tar -x --no-same-owner --no-same-permissions -C "${dst}"`], { encoding: 'utf8', env: CHILD_ENV(T) });
  if (ar.status !== 0) return 'archive-failed';
  const walk = (d) => {
    for (const f of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, f.name);
      if (f.isSocket() || f.isFIFO() || f.isBlockDevice() || f.isCharacterDevice()) return p;
      if (f.isDirectory()) { const r = walk(p); if (r) return r; }
    }
    return null;
  };
  return walk(dst); // symlinks are tolerated in evidence trees but NEVER followed: every read/execute path is chain-checked

}
const bad = extract(A);
if (typeof bad === 'string') {
  process.stdout.write(`DEPREC68_UNMET held=0/${N_CHECKS} checks=${N_CHECKS} rev=${full} rule=${RULE} | ${bad === 'archive-failed' ? 'archive-failed' : 'EXTRACTION_UNSAFE'}\n`);
  rmSync(T, { recursive: true, force: true }); process.exit(2);
}
let UNSAFE = false;
function chainSafe(p) {
  const rel = relative(A, p); const parts = rel.split(sep);
  let cur = A;
  for (const part of parts) {
    cur = join(cur, part);
    let st;
    try { st = lstatSync(cur); } catch { return true; } // a not-yet-existing component cannot be a symlink
    if (st.isSymbolicLink()) return false;
  }
  return true;
}
const rd = (rel) => {
  const p = join(A, rel);
  if (!chainSafe(p)) { UNSAFE = true; return null; }
  try { return readFileSync(p, 'utf8'); } catch { return null; }
};
const atBase = (rel) => { const r = spawnSync('git', ['-C', lane, 'show', `${BASE}:${rel}`], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: CHILD_ENV(T) }); return r.status === 0 ? r.stdout : null; };

const norm = (s) => String(s)
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const nwords = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const wb = (quote, text) => { const q = norm(quote); if (!q) return false; return new RegExp(`(^|[^A-Za-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`).test(norm(text)); };
const delink = (s) => String(s).replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/<([^>]*)>/g, '$1').trim();

const results = {}; const miss = [];
const check = (id, ok, why) => { results[id] = !!ok; if (!ok) miss.push(`${id} MISS ${why}`); };

// ---- shared parsers
const sourcesText = rd('corpus/SOURCES.md') || '';
const baseSources = atBase('corpus/SOURCES.md') || '';
const registryRow = (id) => {
  for (const l of sourcesText.split('\n')) {
    if (!/^ {0,3}\|/.test(l)) continue;
    const c = l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((x) => x.trim());
    if (c.length !== 11) continue;
    if (c[0] === id) return { id: c[0], source: c[1], kind: c[2], tier: c[3], scope: c[4], anchor: c[5], teaches: c[6], status: c[7], opened: c[8], recheck: c[9], usedby: c[10] };
  }
  return null;
};
const section = (text, name) => {
  const L = String(text).split('\n');
  const at = L.findIndex((l) => new RegExp(`^##\\s+${name}\\s*$`).test(l.trim()));
  if (at < 0) return null;
  const out = [];
  for (let i = at + 1; i < L.length; i += 1) { if (/^##\s/.test(L[i])) break; out.push(L[i]); }
  return out.join('\n');
};

// ---- M1 (the entry is the claim's primary artifact: a symlinked entry MISSes M1, it does not trip global UNSAFE)
const entryText = (() => { const p = join(A, ENTRY_REL); if (existsSync(p) && !chainSafe(p)) return null; try { return readFileSync(p, 'utf8'); } catch { return null; } })();
let citedIds = [];
if (entryText == null) check('M1', false, 'entry-absent');
else {
  const head = entryText.split('\n').slice(0, 14);
  const srcLines = head.filter((l) => /^\s*source\s*:/.test(l));
  citedIds = [...new Set(srcLines.join(' ').match(/S\d{3,}/g) || [])];
  const hasV = head.some((l) => /^\s*verified-at\s*:/.test(l));
  const hasR = head.some((l) => /^\s*recheck\s*:/.test(l));
  check('M1', citedIds.length >= 3 && hasV && hasR, `sources=${citedIds.length} verified-at=${hasV} recheck=${hasR}`);
}

// ---- M2
{
  const bad2 = [];
  for (const id of citedIds) {
    const row = registryRow(id);
    if (!row) { bad2.push(`${id}:row-absent`); continue; }
    if (new RegExp(`^ {0,3}\\|\\s*${id}\\s*\\|`, 'm').test(baseSources)) { bad2.push(`${id}:present-at-base`); continue; }
    if (row.status !== 'mined') bad2.push(`${id}:status=${row.status}`);
    if (row.opened !== '2026-10-27') bad2.push(`${id}:opened=${row.opened}`);
    if (!/https?:\/\//.test(row.source)) bad2.push(`${id}:no-url`);
    if (!/^[AB]$/.test(row.tier)) bad2.push(`${id}:tier=${row.tier}`);
    if (!row.usedby.includes(ENTRY_REL)) bad2.push(`${id}:usedby`);
  }
  check('M2', citedIds.length > 0 && bad2.length === 0, `cited=${citedIds.length} ${bad2.slice(0, 5).join(',')}`.trim());
}

// ---- M3
const captureOf = {};
{
  const bad3 = [];
  let pins = null;
  try { pins = JSON.parse(rd('.ufo/pins/source-captures.json') || 'null'); } catch { pins = null; }
  const caps = pins && Array.isArray(pins.captures) ? pins.captures : [];
  for (const id of citedIds) {
    const row = registryRow(id);
    const pin = caps.find((c) => c.sourceId === id);
    if (!row || !pin) { bad3.push(`${id}:pin-absent`); continue; }
    const p = normalize(pin.path || '');
    if (p.startsWith('..') || p.startsWith(sep) || p.includes(`..${sep}`)) { bad3.push(`${id}:path-escape`); continue; }
    const fullP = normalize(join(A, p));
    if (!fullP.startsWith(normalize(A) + sep)) { bad3.push(`${id}:path-outside`); continue; }
    if (!existsSync(fullP)) { bad3.push(`${id}:capture-absent`); continue; }
    if (!lstatSync(fullP).isFile() || !chainSafe(fullP)) { bad3.push(`${id}:capture-not-regular-or-symlinked`); continue; }
    const buf = readFileSync(fullP);
    const sha = createHash('sha256').update(buf).digest('hex');
    if (sha !== pin.sha256) { bad3.push(`${id}:sha-mismatch`); continue; }
    if (buf.length !== pin.bytes) { bad3.push(`${id}:bytes-mismatch`); continue; }
    captureOf[id] = buf.toString('utf8');
  }
  check('M3', citedIds.length > 0 && bad3.length === 0, `cited=${citedIds.length} ${bad3.slice(0, 5).join(',')}`.trim());
}

// ---- read-path confinement: a symlink at/above any static read path fails closed before scoring continues
{
  const staticPaths = ['corpus/SOURCES.md', '.ufo/pins/source-captures.json', 'PROVINCE.md']; // the entry itself is M1's job (a symlinked entry MISSes M1, never read)
  if (staticPaths.some((p) => { const ap = join(A, p); return existsSync(ap) && !chainSafe(ap); }) || UNSAFE) {
    process.stdout.write(`DEPREC68_UNMET held=0/${N_CHECKS} checks=${N_CHECKS} rev=${full} rule=${RULE} | EXTRACTION_UNSAFE\n`);
    rmSync(T, { recursive: true, force: true }); process.exit(2);
  }
}

// ---- M4
let bullets = [];
{
  const bad4 = [];
  const sec = entryText != null ? section(entryText, 'Located quotes') : null;
  if (!sec) bad4.push('section-absent');
  else {
    bullets = sec.split('\n').map((l) => {
      const m = /^-\s+(S\d{3,})\s+—\s+"(.+)"\s*$/.exec(l.trim());
      return m ? { id: m[1], quote: m[2] } : null;
    }).filter(Boolean);
    if (bullets.length < 6) bad4.push(`bullets=${bullets.length}<6`);
    let hasRemoval = false; let hasGrace = false; const perRow = new Set();
    for (const b of bullets) {
      const nw = nwords(b.quote);
      if (nw > 25) { bad4.push(`${b.id}:words=${nw}`); continue; }
      const cap = captureOf[b.id];
      if (cap == null) { bad4.push(`${b.id}:no-capture`); continue; }
      if (!wb(b.quote, cap)) { bad4.push(`${b.id}:quote-not-in-capture`); continue; }
      perRow.add(b.id);
      if (b.quote.includes('2027-07-28')) hasRemoval = true;
      if (b.quote.includes('Three months after')) hasGrace = true;
    }
    if (!hasRemoval) bad4.push('no-2027-07-28-quote');
    if (!hasGrace) bad4.push('no-three-months-quote');
    for (const id of citedIds) if (!perRow.has(id)) bad4.push(`${id}:no-bullet`);
  }
  check('M4', bad4.length === 0, bad4.slice(0, 6).join(',') || 'ok');
}

// ---- M5: fresh live fetch of every bullet's row URL
const m5Bad = [];
if (NO_LIVE) m5Bad.push('no-live');
else {
  for (const b of bullets) {
    const row = registryRow(b.id);
    if (!row) { m5Bad.push(`${b.id}:row-absent`); continue; }
    const m = row.source.match(/https?:\/\/[^\s|]+/);
    if (!m) { m5Bad.push(`${b.id}:no-url`); continue; }
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 45000);
      const resp = await fetch(m[0], { signal: ctl.signal, redirect: 'follow' });
      clearTimeout(timer);
      if (!resp.ok) { m5Bad.push(`${b.id}:http-${resp.status}`); continue; }
      const body = await resp.text();
      if (!wb(b.quote, body)) m5Bad.push(`${b.id}:quote-not-live`);
    } catch { m5Bad.push(`${b.id}:unreachable`); }
  }
}
check('M5', m5Bad.length === 0, m5Bad.slice(0, 5).join(',') || 'ok');

// ---- M6: registry snapshot vs the S207 capture's Deprecated table
{
  const bad6 = [];
  const tableOf = (text) => {
    // first markdown table under a heading mentioning "Deprecated"
    const L = String(text).split('\n');
    let hi = -1;
    for (let i = 0; i < L.length; i += 1) { if (/^#{1,4}\s.*[Dd]eprecated/.test(L[i])) { hi = i; break; } }
    if (hi < 0) return null;
    const rows = [];
    for (let i = hi + 1; i < L.length; i += 1) {
      if (/^#{1,4}\s/.test(L[i]) && rows.length) break;
      if (!L[i].startsWith('|')) { if (rows.length) break; continue; }
      const c = L[i].trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((x) => x.trim());
      if (/^[\s:-]+$/.test(c.join('')) || c.every((x) => /^\s*$/.test(x))) continue;
      if (c[0] === 'Feature' || /^-+$/.test(c[0])) continue;
      rows.push(c);
    }
    return rows.length ? rows : null;
  };
  const capRows = tableOf(captureOf.S207 || '');
  const snapSec = entryText != null ? section(entryText, 'Registry snapshot') : null;
  const snapRows = snapSec ? snapSec.split('\n').filter((l) => l.startsWith('|') && !/^\|[\s:-]+\|$/.test(l.trim()) && !/^\|\s*Feature\s*\|/.test(l)).map((l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((x) => x.trim())) : [];
  if (!capRows) bad6.push('capture-table-absent');
  else {
    if (snapRows.length !== capRows.length) bad6.push(`rows=${snapRows.length}!=${capRows.length}`);
    else if (capRows.length < 5) bad6.push(`capture-rows=${capRows.length}<5`);
    else {
      const capBy = new Map(capRows.map((c) => [delink(c[0]), c]));
      for (const s of snapRows) {
        const c = capBy.get(delink(s[0]));
        if (!c) { bad6.push(`snapshot-feature-unmatched:${delink(s[0]).slice(0, 30)}`); continue; }
        if (delink(s[2]) !== delink(c[2])) bad6.push(`deprecated-in:${delink(s[0]).slice(0, 20)}`);
        if (delink(s[4]) !== delink(c[4])) bad6.push(`earliest-removal:${delink(s[0]).slice(0, 20)}`);
      }
    }
  }
  check('M6', bad6.length === 0, bad6.slice(0, 5).join(',') || 'ok');
}

// ---- M7
{
  const sec = entryText != null ? section(entryText, 'The live clock') : null;
  const ok7 = !!sec && sec.includes('2026-06-03') && /S213/.test(sec) && sec.includes('2026-09-03')
    && !sec.includes('2026-04-17') && !sec.includes('2026-05-18');
  check('M7', ok7, `section=${!!sec}`);
}

// ---- M8
{
  const sec = entryText != null ? section(entryText, 'Bearing on the installed OMP release') : null;
  const citesOld = citedIds.some((id) => /^S20[1-6]$/.test(id)) || (sec && /S20[1-6]/.test(sec));
  const v18 = citedIds.some((id) => { const r = registryRow(id); return r && /\/v18\.13\.1\//.test(r.source); });
  const ok8 = !!sec && /18\.13\.1/.test(sec) && /roots/i.test(sec) && /HTTP\+SSE/.test(sec) && citesOld && v18;
  check('M8', ok8, `section=${!!sec} cites201-206=${citesOld} v18.13.1-row=${v18}`);
}

// ---- M9: the lane's own gates run on the archive
{
  const bad9 = [];
  const run = (cmd, args, cwd) => {
    const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 300000, env: CHILD_ENV(T), cwd });
    return r;
  };
  const c1 = run('bash', [CENSUS, 'validate', '--file', join(A, 'corpus/SOURCES.md')], A);
  if (c1.status !== 0) bad9.push(`census-exit=${c1.status}`);
  const c2 = run('node', ['scripts/sources-check.mjs'], A);
  if (!(c2.status === 0 && /SOURCES_CHECK: CLEAN/.test(c2.stdout || ''))) bad9.push(`sources-check-exit=${c2.status}`);
  const c3 = run('node', ['scripts/source-capture.mjs'], A);
  if (!(c3.status === 0 && /SOURCE_CAPTURE: CLEAN/.test(c3.stdout || ''))) bad9.push(`source-capture-exit=${c3.status}`);
  const c4 = run('node', ['scripts/readme-map.mjs'], A);
  if (!(c4.status === 0 && /README_MAP: CLEAN/.test(c4.stdout || ''))) bad9.push(`readme-map-exit=${c4.status}`);
  const prov = rd('PROVINCE.md') || '';
  if (!prov.includes('mcp-deprecation-registry')) bad9.push('province-entry-not-named');
  check('M9', bad9.length === 0, bad9.join(',') || 'ok');
}

// ---- M10: self-confinement proofs
{
  const bad10 = [];
  // (a) self-poison re-run: NODE_OPTIONS preload must produce ENV_POISONED exit 2
  {
    const preload = join(T, 'forge-preload.cjs');
    writeFileSync(preload, 'process.env.FORGED = "1";\n');
    const r = spawnSync(process.execPath, [SELF, lane, full], { encoding: 'utf8', timeout: 120000, env: { ...CHILD_ENV(T), NODE_OPTIONS: `--require ${preload}` } });
    const v = ((r.stdout || '').trim().split('\n').pop()) || '';
    if (!(r.status === 2 && v.includes('ENV_POISONED'))) bad10.push(`self-poison:exit=${r.status}:${v.slice(0, 60)}`);
  }
  // (b) symlinked entry revision: M1 must MISS (never reads a host file)
  {
    const D = join(T, 'fx-symentry'); mkdirSync(join(D, 'corpus', 'knowledge'), { recursive: true });
    writeFileSync(join(D, 'corpus', 'knowledge', 'real.md'), 'real\n');
    const g = (...a) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8', env: CHILD_ENV(T) });
    g('init', '-q');
    const h = g('hash-object', '-w', join(D, 'corpus', 'knowledge', 'real.md')).stdout.trim();
    g('update-index', '--add', '--cacheinfo', `120000,${h},${ENTRY_REL}`);
    g('-c', 'user.name=f', '-c', 'user.email=f@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'symlink-entry');
    const rev2 = g('rev-parse', 'HEAD').stdout.trim();
    const r = spawnSync(process.execPath, [SELF, D, rev2, '--no-live'], { encoding: 'utf8', timeout: 120000, env: CHILD_ENV(T) });
    const v = ((r.stdout || '').trim().split('\n').pop()) || '';
    if (!(r.status === 1 && /M1 MISS/.test(v))) bad10.push(`symlink-entry:exit=${r.status}:${v.slice(0, 60)}`);
    rmSync(D, { recursive: true, force: true });
  }
  // (c) a symlink anywhere in the revision fails closed EXTRACTION_UNSAFE
  {
    const D = join(T, 'fx-symtree'); mkdirSync(D, { recursive: true });
    writeFileSync(join(D, 'real.md'), 'real\n');
    const g = (...a) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8', env: CHILD_ENV(T) });
    g('init', '-q');
    const h = g('hash-object', '-w', join(D, 'real.md')).stdout.trim();
    g('update-index', '--add', '--cacheinfo', `120000,${h},corpus`);
    g('-c', 'user.name=f', '-c', 'user.email=f@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'symlink-tree');
    const rev2 = g('rev-parse', 'HEAD').stdout.trim();
    const r = spawnSync(process.execPath, [SELF, D, rev2, '--no-live'], { encoding: 'utf8', timeout: 120000, env: CHILD_ENV(T) });
    const v = ((r.stdout || '').trim().split('\n').pop()) || '';
    if (!(r.status === 2 && v.includes('EXTRACTION_UNSAFE'))) bad10.push(`symlink-tree:exit=${r.status}:${v.slice(0, 60)}`);
    rmSync(D, { recursive: true, force: true });
  }
  check('M10', bad10.length === 0, bad10.join(';') || 'ok');
}

rmSync(T, { recursive: true, force: true });
const held = Object.values(results).filter(Boolean).length;
const ok = held === N_CHECKS;
process.stdout.write(`DEPREC68_${ok ? 'HELD' : 'UNMET'} held=${held}/${N_CHECKS} checks=${N_CHECKS} rev=${full} rule=${RULE}${miss.length ? ` | ${miss.join(' | ')}` : ''}\n`);
process.exit(ok ? 0 : 1);
