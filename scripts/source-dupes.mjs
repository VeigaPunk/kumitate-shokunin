#!/usr/bin/env node
/**
 * source-dupes.mjs — gate `source-dupes` (contract `kumitate-source-dupes-v1`, round 56).
 *
 * The SOURCES duplicate-URL ratchet. The maintained census
 * (`scripts/sources-census.sh validate`) prints a W04 warning when two Registry
 * rows carry the same normalized URL under different scopes; it never fails
 * (warnings do not gate). Those warnings are the lane's own taste evidence
 * drifting — the same source admitted twice under different scopes splits
 * which row is authoritative and which `used-by` path owns the citation.
 * This gate promotes the warning class into a pinned, scored contract: the set
 * of live duplicate groups must equal the pinned `known` set — a NEW duplicate
 * is a regression (DRIFT), and a `known` entry that no longer duplicates is a
 * stale pin (DRIFT too: resolve it — supersede or re-anchor a row — and remove
 * the pin; silence is not a fix).
 *
 *   node scripts/source-dupes.mjs [--registry <path>] [--sources <path>]
 *   node scripts/source-dupes.mjs --selftest
 *
 * Verdicts (one line on stdout, after optional per-item notes):
 *   SOURCE_DUPES: CLEAN groups=<n> known=<n>       exit 0
 *   SOURCE_DUPES: DRIFT groups=<n> known=<m> bad=<k> first=<item>   exit 1
 *   SOURCE_DUPES: FAIL-CLOSED reason=<why>         exit 2 (could not evaluate)
 *   SOURCE_DUPES: USAGE ...                        exit 64
 *
 * Registry (default `.ufo/pins/source-dupes.json`, lane-root-relative):
 *   { "version": 1,
 *     "known": [ { "ids": ["S034","S050"], "url": "<normalized-url>", "why": "<reason>" }, ... ] }
 *
 * A `known` entry names the full member set of one duplicate group by row id
 * and its normalized URL — the census-normalized form (scheme and trailing
 * `/` stripped, `#fragment` stripped, host lowercased; the SAME normalization
 * the maintained census applies before printing W04).
 *
 * Duplicate semantics (identical to `sources-census.sh` W04): two rows share a
 * normalized URL AND differ in their `scope` cell. Same-URL + same-scope is
 * the census's E04 family, not this gate's; rows with no URL at all never form
 * a group; a lone row is never a group. The census tolerates same-URL /
 * different-scope as a warning — this gate makes the TOLERANCE explicit: only
 * the pinned groups may exist.
 *
 * Rules:
 *   - the live duplicate-group set is computed from `corpus/SOURCES.md` over
 *     the Registry section only (0–3 leading spaces, `## Registry` … next `#`);
 *     the separator row and rows outside Registry are ignored.
 *   - DRIFT `new-duplicate:<url>` — a live group not in `known`.
 *   - DRIFT `stale-known:<ids>` — a `known` entry whose members no longer form
 *     that group (a row was superseded/removed, the url re-anchored, or the
 *     scope changed so it is no longer a duplicate).
 *   - DRIFT `known-mismatch:<url>` — a `known` entry whose `ids`/`url` do not
 *     match the live group it partly covers (members must match exactly).
 *   - FAIL-CLOSED (exit 2, never a score): registry unreadable / not JSON /
 *     version ≠ 1 / `known` not an array / an entry missing ids+url+why /
 *     duplicate `known` entries covering the same row id; sources doc
 *     unreadable / no Registry section.
 *   - an EMPTY `known` array is legal ONLY when no live group exists; known=0
 *     with a live group is DRIFT, known>0 is never vacuous.
 *
 * The gate never writes. It reads the registry and the sources doc only.
 *
 * Selftest: hermetic fixtures under mkdtemp, twelve cases, one red-before per
 * rule; the final line reads `SOURCE_DUPES_SELFTEST: PASS (12/12)` +
 * `VERDICT: PASS`, exit 0.
 *
 * Exit map: 0 clean · 1 a real defect (drift) · 2 fail-closed · 64 usage.
 * Owner: kumitate L1. Row: SKILL.md §Gate registry (`source-dupes`, gate);
 * pin: SCORECARD.md `kumitate-gate-pins-v1` (`pin.source-dupes`).
 */
import { spawnSync } from 'node:child_process';
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const LANE = resolve(dirname(SELF), '..');
const DEFAULT_REGISTRY = '.ufo/pins/source-dupes.json';
const DEFAULT_SOURCES = 'corpus/SOURCES.md';
const SID = /^S[0-9]{3,}$/;

function usage() {
  process.stderr.write('SOURCE_DUPES: USAGE node scripts/source-dupes.mjs [--registry <path>] [--sources <path>] | --selftest\n');
  process.exit(64);
}

// Same normalization as scripts/sources-census.sh url_of(): strip scheme,
// fragment and one trailing slash; lowercase the host only.
function urlOf(sourceCell) {
  const m = sourceCell.match(/https?:\/\/[^\s|]+/);
  if (!m) return '';
  let u = m[0];
  u = u.replace(/#[^ ]*$/, '').replace(/\/$/, '').replace(/^[A-Za-z]+:\/\//, '');
  const n = u.indexOf('/');
  return n ? u.slice(0, n).toLowerCase() + u.slice(n) : u.toLowerCase();
}

function loadRegistry(regPath) {
  let raw;
  try {
    if (!lstatSync(regPath).isFile()) {
      return { ok: false, reason: 'registry not a regular file' };
    }
    raw = readFileSync(regPath);
  } catch (e) {
    return { ok: false, reason: `registry unreadable: ${e.code || 'EIO'}` };
  }
  let doc;
  try {
    doc = JSON.parse(raw.toString('utf8'));
  } catch {
    return { ok: false, reason: 'registry not valid JSON' };
  }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return { ok: false, reason: 'registry not an object' };
  }
  if (doc.version !== 1) {
    return { ok: false, reason: `registry version ${JSON.stringify(doc.version)} !== 1` };
  }
  if (!Array.isArray(doc.known)) {
    return { ok: false, reason: 'registry known not an array' };
  }
  const covered = new Set();
  for (const k of doc.known) {
    if (!k || typeof k !== 'object' || !Array.isArray(k.ids) || k.ids.length < 2
        || k.ids.some((id) => typeof id !== 'string' || !SID.test(id))
        || new Set(k.ids).size !== k.ids.length
        || typeof k.url !== 'string' || k.url.length === 0
        || typeof k.why !== 'string' || k.why.length === 0) {
      return { ok: false, reason: 'a known entry lacks valid ids(>=2, unique, S###)/url/why' };
    }
    for (const id of k.ids) {
      if (covered.has(id)) {
        return { ok: false, reason: `row id ${JSON.stringify(id)} covered by two known entries` };
      }
      covered.add(id);
    }
  }
  return { ok: true, known: doc.known };
}

// Rows in the Registry section only: `## Registry` until the next top heading;
// 0–3 leading spaces tolerated, 4+ is indented code (census parser note).
function loadRows(srcPath) {
  let raw;
  try {
    if (!lstatSync(srcPath).isFile()) {
      return { ok: false, reason: 'sources doc not a regular file' };
    }
    raw = readFileSync(srcPath, 'utf8');
  } catch (e) {
    return { ok: false, reason: `sources doc unreadable: ${e.code || 'EIO'}` };
  }
  const rows = [];
  let inRegistry = false;
  let seenRegistry = false;
  for (const line0 of raw.split('\n')) {
    if (/^ {0,3}##[ \t]/.test(line0)) {
      const h = line0.replace(/^ {0,3}/, '').replace(/^##[ \t]+/, '').trim();
      inRegistry = h === 'Registry';
      if (inRegistry) seenRegistry = true;
      continue;
    }
    if (/^ {0,3}#[ \t]/.test(line0)) { inRegistry = false; continue; }
    if (!inRegistry || !/^ {0,3}\|/.test(line0)) continue;
    const cells = line0.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
    if (cells.length !== 13) continue;                       // NF=13 like the census
    if (/^-+$/.test(cells[2].replace(/\s/g, '')) || /^-+$/.test((cells[1] || '').replace(/\s/g, ''))) continue; // separator
    const id = cells[1];
    if (!SID.test(id)) continue;
    rows.push({ id, scope: cells[5], url: urlOf(cells[2]) });
  }
  if (!seenRegistry) {
    return { ok: false, reason: 'sources doc carries no ## Registry section' };
  }
  if (rows.length === 0) {
    return { ok: false, reason: 'sources doc carries no S### rows in Registry' };
  }
  return { ok: true, rows };
}

// Live duplicate groups: same normalized URL, differing scope cells (W04).
function duplicateGroups(rows) {
  const byUrl = new Map();
  for (const r of rows) {
    if (!r.url) continue;
    if (!byUrl.has(r.url)) byUrl.set(r.url, []);
    byUrl.get(r.url).push(r);
  }
  const groups = [];
  for (const [url, members] of byUrl) {
    if (members.length < 2) continue;
    const scopes = new Set(members.map((m) => m.scope));
    if (scopes.size < 2) continue;
    groups.push({ url, ids: members.map((m) => m.id).sort() });
  }
  groups.sort((a, b) => a.url.localeCompare(b.url));
  return groups;
}

const key = (ids) => ids.slice().sort().join('+');

function evaluate(registryPath, sourcesPath) {
  const reg = loadRegistry(registryPath);
  if (!reg.ok) {
    return { verdict: 'FAIL-CLOSED', reason: reg.reason, exit: 2 };
  }
  const src = loadRows(sourcesPath);
  if (!src.ok) {
    return { verdict: 'FAIL-CLOSED', reason: src.reason, exit: 2 };
  }
  const live = duplicateGroups(src.rows);
  const liveByKey = new Map(live.map((g) => [key(g.ids), g]));
  const liveByUrl = new Map(live.map((g) => [g.url, g]));
  const knownIds = new Map();
  const bad = [];
  for (const k of reg.known) {
    knownIds.set(key(k.ids), k);
    const g = liveByKey.get(key(k.ids));
    if (!g) {
      // Does any live group share this URL or overlap members? Then the pin's
      // shape is wrong rather than simply stale.
      const overlap = live.find((lg) => lg.ids.some((id) => k.ids.includes(id)));
      if (overlap) {
        bad.push(`known-mismatch:${k.url} live=${overlap.ids.join(',')}`);
      } else if (liveByUrl.has(k.url)) {
        bad.push(`known-mismatch:${k.url} live=${liveByUrl.get(k.url).ids.join(',')}`);
      } else {
        bad.push(`stale-known:${k.ids.join(',')}`);
      }
    } else if (g.url !== k.url) {
      bad.push(`known-mismatch:${k.url} live-url=${g.url}`);
    }
  }
  for (const g of live) {
    if (!knownIds.has(key(g.ids))) {
      bad.push(`new-duplicate:${g.url} ids=${g.ids.join(',')}`);
    }
  }
  if (bad.length > 0) {
    return { verdict: 'DRIFT', groups: live.length, known: reg.known.length, bad, exit: 1 };
  }
  return { verdict: 'CLEAN', groups: live.length, known: reg.known.length, exit: 0 };
}

function emit(result) {
  if (result.verdict === 'CLEAN') {
    process.stdout.write(`SOURCE_DUPES: CLEAN groups=${result.groups} known=${result.known}\n`);
  } else if (result.verdict === 'DRIFT') {
    for (const b of result.bad.slice(1)) process.stdout.write(`SOURCE_DUPES: note ${b}\n`);
    process.stdout.write(`SOURCE_DUPES: DRIFT groups=${result.groups} known=${result.known} bad=${result.bad.length} first=${result.bad[0]}\n`);
  } else {
    process.stdout.write(`SOURCE_DUPES: FAIL-CLOSED reason=${result.reason}\n`);
  }
  process.exit(result.exit);
}

function selftest() {
  const root = mkdtempSync(join(tmpdir(), 'source-dupes-st.'));
  const results = [];
  const pass = (name, ok, detail) => {
    results.push({ name, ok });
    process.stdout.write(`case ${name}: ${ok ? 'PASS' : `FAIL ${detail || ''}`}\n`);
  };
  const run = (args, opts = {}) => spawnSync(process.execPath, [SELF, ...args],
    { encoding: 'utf8', timeout: 60_000, ...opts });
  const last = (r) => `${r.stdout || ''}`.trim().split('\n').pop() || '';

  const HEADER = '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
    + '|---|---|---|---|---|---|---|---|---|---|---|\n';
  const row = (id, url, scope) =>
    `| ${id} | title — ${url} | docs | B | ${scope} | §1 | t | mined | 2026-01-01 | 90d | p |\n`;

  const mkdirp = (d) => { rmSync(d, { recursive: true, force: true }); mkdirSync(d, { recursive: true }); };
  const fixture = (dir, rows, known) => {
    mkdirp(dir);
    writeFileSync(join(dir, 'sources.md'), '## Registry\n' + HEADER + rows.join(''));
    writeFileSync(join(dir, 'reg.json'), JSON.stringify({ version: 1, known }, null, 2));
    return { reg: join(dir, 'reg.json'), src: join(dir, 'sources.md') };
  };

  const baseRows = [
    row('S001', 'https://a.example/x', 's1'),
    row('S002', 'https://a.example/x', 's2'),   // dup group A (S001,S002)
    row('S003', 'https://b.example/y', 's3'),
    row('S004', 'https://c.example/z', 's4'),
    row('S005', 'https://c.example/z', 's4'),   // same url SAME scope — E04 family, not W04
  ];
  const baseKnown = [{ ids: ['S001', 'S002'], url: 'a.example/x', why: 'pre-rule duplicate, kept' }];

  try {
    // case 1 — clean: one pinned group, same-scope same-url ignored. CLEAN groups=1 known=1
    {
      const d = join(root, 'd1'); const f = fixture(d, baseRows, baseKnown);
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('clean', r.status === 0 && last(r) === 'SOURCE_DUPES: CLEAN groups=1 known=1',
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 2 — new duplicate: DRIFT new-duplicate, exit 1
    {
      const d = join(root, 'd2'); const f = fixture(d,
        [...baseRows, row('S006', 'https://d.example/w', 's5'), row('S007', 'https://d.example/w', 's6')],
        baseKnown);
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('new-duplicate', r.status === 1 && last(r).includes('new-duplicate:d.example/w ids=S006,S007'),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 3 — stale known: pinned group no longer duplicates. DRIFT stale-known
    {
      const d = join(root, 'd3'); const f = fixture(d,
        baseRows.map((r) => r.replace('s2', 's1')),  // S002 now shares S001's scope — no W04
        baseKnown);
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('stale-known', r.status === 1 && last(r).includes('stale-known:S001,S002'),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 4 — known ids shape wrong: pinned S001+S009 but live group is S001,S002. known-mismatch
    {
      const d = join(root, 'd4'); const f = fixture(d, baseRows,
        [{ ids: ['S001', 'S009'], url: 'a.example/x', why: 'wrong member' }]);
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('known-mismatch', r.status === 1 && /known-mismatch:a\.example\/x/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 5 — known url field wrong: same ids, different url → known-mismatch
    {
      const d = join(root, 'd5'); const f = fixture(d, baseRows,
        [{ ids: ['S001', 'S002'], url: 'zzz.example/x', why: 'wrong url' }]);
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('known-url-mismatch', r.status === 1 && /known-mismatch|new-duplicate/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 6 — empty known with a live group: DRIFT new-duplicate (never vacuous CLEAN)
    {
      const d = join(root, 'd6'); const f = fixture(d, baseRows, []);
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('empty-known-live-dup', r.status === 1 && last(r).includes('new-duplicate:a.example/x'),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 7 — empty known, no live group: CLEAN groups=0 known=0
    {
      const d = join(root, 'd7'); const f = fixture(d,
        [row('S001', 'https://a.example/x', 's1'), row('S003', 'https://b.example/y', 's3')], []);
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('empty-clean', r.status === 0 && last(r) === 'SOURCE_DUPES: CLEAN groups=0 known=0',
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 8 — normalization parity: scheme/trailing-slash/case-equal urls group together
    {
      const d = join(root, 'd8'); const f = fixture(d,
        [row('S001', 'https://A.example/X/', 's1'), row('S002', 'http://a.example/X', 's2')],
        [{ ids: ['S001', 'S002'], url: 'a.example/X', why: 'normalized' }]);
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('normalization', r.status === 0 && last(r) === 'SOURCE_DUPES: CLEAN groups=1 known=1',
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 9 — malformed JSON: FAIL-CLOSED exit 2
    {
      const d = join(root, 'd9'); const f = fixture(d, baseRows, baseKnown);
      writeFileSync(f.reg, '{ broken');
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('registry-not-json', r.status === 2 && /FAIL-CLOSED reason=registry not valid JSON/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 10 — version ≠ 1: FAIL-CLOSED exit 2
    {
      const d = join(root, 'd10'); const f = fixture(d, baseRows, baseKnown);
      writeFileSync(f.reg, JSON.stringify({ version: 2, known: baseKnown }));
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('registry-version', r.status === 2 && /FAIL-CLOSED reason=registry version 2 !== 1/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 11 — row id covered by two known entries: FAIL-CLOSED exit 2
    {
      const d = join(root, 'd11'); const f = fixture(d, baseRows, baseKnown);
      writeFileSync(f.reg, JSON.stringify({ version: 1, known: [...baseKnown, { ids: ['S001', 'S003'], url: 'x', why: 'overlap' }] }));
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('known-overlap', r.status === 2 && /covered by two known entries/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 12 — sources doc missing: FAIL-CLOSED exit 2
    {
      const d = join(root, 'd12'); const f = fixture(d, baseRows, baseKnown);
      rmSync(f.src);
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('sources-absent', r.status === 2 && /FAIL-CLOSED/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  const held = results.filter((r) => r.ok).length;
  process.stdout.write(`SOURCE_DUPES_SELFTEST: ${held === results.length ? 'PASS' : 'FAIL'} (${held}/${results.length})\n`);
  process.stdout.write(`VERDICT: ${held === results.length ? 'PASS' : 'FAIL'}\n`);
  process.exit(held === results.length ? 0 : 1);
}

const argv = process.argv.slice(2);
if (argv.includes('--selftest')) {
  selftest();
} else {
  let reg = join(LANE, DEFAULT_REGISTRY);
  let src = join(LANE, DEFAULT_SOURCES);
  let explicitReg = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--registry') {
      if (i + 1 >= argv.length) usage();
      reg = resolve(argv[++i]); explicitReg = true;
    } else if (argv[i] === '--sources') {
      if (i + 1 >= argv.length) usage();
      src = resolve(argv[++i]);
    } else {
      usage();
    }
  }
  if (explicitReg && !argv.includes('--sources')) {
    src = join(dirname(reg), 'sources.md');
  }
  emit(evaluate(reg, src));
}
