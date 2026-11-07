#!/usr/bin/env node
/**
 * source-capture.mjs — gate `source-capture` (contract `kumitate-source-capture-v1`, round 55).
 *
 * The opened-source byte-persistence gate. A SOURCES.md row is a claim; a URL alone is
 * not a resolvable location at closure — routed defect R54-C1: S108's rejection rested
 * on source bytes that were never committed, so a non-author spot-check could not
 * re-open the reject. This gate mechanically binds every opened SOURCES row to
 * committed capture bytes (or an explicit exemption) so any seat can re-open the
 * evidence exactly as it was read.
 *
 *   node scripts/source-capture.mjs [--registry <path>] [--sources <path>]
 *   node scripts/source-capture.mjs --selftest
 *
 * Verdicts (one line on stdout, after optional per-item notes on stdout):
 *   SOURCE_CAPTURE: CLEAN captures=<n> exemptions=<m>   exit 0
 *   SOURCE_CAPTURE: DRIFT captures=<n> exemptions=<m> bad=<k> first=<item:why>   exit 1
 *   SOURCE_CAPTURE: FAIL-CLOSED reason=<why>            exit 2 (could not evaluate)
 *   SOURCE_CAPTURE: USAGE ...                           exit 64
 *
 * Registry (default `.ufo/pins/source-captures.json`, lane-root-relative):
 *   { "version": 1,
 *     "captures":   [ { "sourceId": "S108", "path": "<repo-relative>", "sha256": "<64hex>",
 *                       "bytes": <n>, "captured": "YYYY-MM-DD" }, ... ],
 *     "exemptions": [ { "ids": ["S12"], "reason": "<why no committed capture>" }, ... ] }
 *
 * Sources document (default `corpus/SOURCES.md`, same base as the registry): the GFM
 * table rows are parsed for `| S### |` row ids; every row id must resolve to exactly
 * one binding — a capture entry or an exemption — and no binding may name a row that
 * does not exist.
 *
 * Rules:
 *   - `path` is resolved against the LANE ROOT for the default registry (paths are
 *     repo-relative); for an explicit `--registry`/`--sources` it is resolved against
 *     the registry file's own directory. An escaping path (`..` or absolute) is DRIFT
 *     `path-escape` — a capture must bind bytes beneath its base.
 *   - the resolved path must exist and be a REGULAR FILE — a symlinked capture is
 *     DRIFT `not-a-regular-file` (the capture binds bytes, not a name).
 *   - its sha256 (node:crypto over the exact bytes) must equal the capture entry;
 *     its byte length must equal `bytes`.
 *   - a capture entry whose file is absent is DRIFT `capture-absent`; a sha that does
 *     not match is DRIFT `hash-mismatch`; a wrong byte length is DRIFT `bytes-mismatch`.
 *   - a SOURCES row id with no capture and no exemption is DRIFT `uncaptured`.
 *   - a capture or exemption naming a row id absent from SOURCES.md is DRIFT
 *     `orphan-capture` / `orphan-exemption`.
 *   - duplicate `sourceId` values (inside captures, inside exemptions, or a sourceId in
 *     BOTH) make the registry malformed: FAIL-CLOSED — an ambiguous binding set cannot
 *     be evaluated.
 *   - an EMPTY captures array is DRIFT `captures-empty`, not CLEAN: a registry that
 *     binds nothing is precisely the state this gate exists to catch.
 *   - registry unreadable / not JSON / version !== 1, or sources doc unreadable /
 *     unparseable → FAIL-CLOSED (exit 2, never a score).
 *
 * The gate never writes. It reads the registry, the sources doc and the captured
 * bytes only.
 *
 * Selftest: hermetic fixtures under mkdtemp (the gate binary run as a subprocess
 * against crafted registries + sources docs), thirteen cases, one red-before per rule;
 * the final line reads `SOURCE_CAPTURE_SELFTEST: PASS (13/13)` + `VERDICT: PASS`, exit 0.
 *
 * Exit map: 0 clean · 1 a real defect (drift) · 2 fail-closed · 64 usage.
 * Owner: kumitate L1. Row: SKILL.md §Gate registry (`source-capture`, gate);
 * pin: SCORECARD.md `kumitate-gate-pins-v1` (`pin.source-capture`).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const LANE = resolve(dirname(SELF), '..');
const DEFAULT_REGISTRY = '.ufo/pins/source-captures.json';
const DEFAULT_SOURCES = 'corpus/SOURCES.md';
const HEX64 = /^[0-9a-f]{64}$/;
const SID = /^S[0-9]{3,}$/;

const sha = (b) => createHash('sha256').update(b).digest('hex');

function usage() {
  process.stderr.write('SOURCE_CAPTURE: USAGE node scripts/source-capture.mjs [--registry <path>] [--sources <path>] | --selftest\n');
  process.exit(64);
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
  if (!Array.isArray(doc.captures)) {
    return { ok: false, reason: 'registry captures not an array' };
  }
  if (!Array.isArray(doc.exemptions)) {
    return { ok: false, reason: 'registry exemptions not an array' };
  }
  const ids = new Set();
  for (const c of doc.captures) {
    if (!c || typeof c !== 'object' || typeof c.sourceId !== 'string' || !SID.test(c.sourceId)
        || typeof c.path !== 'string' || c.path.length === 0
        || typeof c.sha256 !== 'string' || !HEX64.test(c.sha256)
        || !Number.isSafeInteger(c.bytes) || c.bytes < 0
        || typeof c.captured !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(c.captured)) {
      return { ok: false, reason: 'a capture entry lacks valid sourceId/path/sha256(64hex)/bytes/captured' };
    }
    if (ids.has(c.sourceId)) {
      return { ok: false, reason: `duplicate sourceId ${JSON.stringify(c.sourceId)}` };
    }
    ids.add(c.sourceId);
  }
  for (const x of doc.exemptions) {
    if (!x || typeof x !== 'object' || !Array.isArray(x.ids) || x.ids.length === 0
        || typeof x.reason !== 'string' || x.reason.length === 0) {
      return { ok: false, reason: 'an exemption entry lacks valid ids/reason' };
    }
    for (const id of x.ids) {
      if (typeof id !== 'string' || !SID.test(id)) {
        return { ok: false, reason: `exemption id ${JSON.stringify(id)} is not an S### row id` };
      }
      if (ids.has(id)) {
        return { ok: false, reason: `duplicate sourceId ${JSON.stringify(id)}` };
      }
      ids.add(id);
    }
  }
  return { ok: true, captures: doc.captures, exemptions: doc.exemptions };
}

function loadSourceIds(srcPath) {
  let raw;
  try {
    if (!lstatSync(srcPath).isFile()) {
      return { ok: false, reason: 'sources doc not a regular file' };
    }
    raw = readFileSync(srcPath, 'utf8');
  } catch (e) {
    return { ok: false, reason: `sources doc unreadable: ${e.code || 'EIO'}` };
  }
  const ids = new Set();
  for (const m of raw.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)) {
    if (ids.has(m[1])) {
      return { ok: false, reason: `sources doc has duplicate row id ${m[1]}` };
    }
    ids.add(m[1]);
  }
  if (ids.size === 0) {
    return { ok: false, reason: 'sources doc carries no S### rows' };
  }
  return { ok: true, ids };
}

function evaluate(registryPath, sourcesPath) {
  const reg = loadRegistry(registryPath);
  if (!reg.ok) {
    return { verdict: 'FAIL-CLOSED', reason: reg.reason, exit: 2 };
  }
  const src = loadSourceIds(sourcesPath);
  if (!src.ok) {
    return { verdict: 'FAIL-CLOSED', reason: src.reason, exit: 2 };
  }
  if (reg.captures.length === 0) {
    return { verdict: 'DRIFT', captures: 0, exemptions: reg.exemptions.reduce((n, x) => n + x.ids.length, 0),
      bad: ['captures-empty:registry binds nothing'], exit: 1 };
  }
  // Path base: repo-relative against the lane root for the default registry;
  // registry-local for an explicit --registry (selftest fixtures, out-of-tree audits).
  const isDefault = resolve(registryPath) === join(LANE, DEFAULT_REGISTRY);
  const base = isDefault ? LANE : dirname(resolve(registryPath));
  let baseReal;
  try {
    baseReal = realpathSync(base);
  } catch (e) {
    return { verdict: 'FAIL-CLOSED', reason: `path base unreadable: ${e.code || 'EIO'}`, exit: 2 };
  }
  const bad = [];
  for (const c of reg.captures) {
    const abs = resolve(base, c.path);
    let targetReal;
    try {
      targetReal = realpathSync(abs);
    } catch {
      bad.push(`${c.sourceId}:capture-absent`);
      continue;
    }
    const rel = relative(baseReal, targetReal);
    if (rel === '..' || rel.startsWith(`..${sep}`) || rel.includes(`${sep}..${sep}`)) {
      bad.push(`${c.sourceId}:path-escape`);
      continue;
    }
    let st;
    try {
      st = lstatSync(abs);
    } catch {
      bad.push(`${c.sourceId}:capture-absent`);
      continue;
    }
    if (!st.isFile()) {
      bad.push(`${c.sourceId}:not-a-regular-file`);
      continue;
    }
    let bytes;
    try {
      bytes = readFileSync(abs);
    } catch (e) {
      return { verdict: 'FAIL-CLOSED', reason: `${c.sourceId}: unreadable: ${e.code || 'EIO'}`, exit: 2 };
    }
    if (bytes.length !== c.bytes) {
      bad.push(`${c.sourceId}:bytes-mismatch`);
      continue;
    }
    if (sha(bytes) !== c.sha256) {
      bad.push(`${c.sourceId}:hash-mismatch`);
      continue;
    }
  }
  const bound = new Set([
    ...reg.captures.map((c) => c.sourceId),
    ...reg.exemptions.flatMap((x) => x.ids),
  ]);
  for (const id of src.ids) {
    if (!bound.has(id)) bad.push(`${id}:uncaptured`);
  }
  for (const id of bound) {
    if (!src.ids.has(id)) {
      const isCap = reg.captures.some((c) => c.sourceId === id);
      bad.push(`${id}:${isCap ? 'orphan-capture' : 'orphan-exemption'}`);
    }
  }
  const exCount = reg.exemptions.reduce((n, x) => n + x.ids.length, 0);
  if (bad.length > 0) {
    return { verdict: 'DRIFT', captures: reg.captures.length, exemptions: exCount, bad, exit: 1 };
  }
  return { verdict: 'CLEAN', captures: reg.captures.length, exemptions: exCount, exit: 0 };
}

function emit(result) {
  if (result.verdict === 'CLEAN') {
    process.stdout.write(`SOURCE_CAPTURE: CLEAN captures=${result.captures} exemptions=${result.exemptions}\n`);
  } else if (result.verdict === 'DRIFT') {
    for (const b of result.bad.slice(1)) process.stdout.write(`SOURCE_CAPTURE: note ${b}\n`);
    process.stdout.write(`SOURCE_CAPTURE: DRIFT captures=${result.captures} exemptions=${result.exemptions} bad=${result.bad.length} first=${result.bad[0]}\n`);
  } else {
    process.stdout.write(`SOURCE_CAPTURE: FAIL-CLOSED reason=${result.reason}\n`);
  }
  process.exit(result.exit);
}

function selftest() {
  const root = mkdtempSync(join(tmpdir(), 'source-capture-st.'));
  const results = [];
  const pass = (name, ok, detail) => {
    results.push({ name, ok });
    process.stdout.write(`case ${name}: ${ok ? 'PASS' : `FAIL ${detail || ''}`}\n`);
  };
  const run = (args, opts = {}) => spawnSync(process.execPath, [SELF, ...args],
    { encoding: 'utf8', timeout: 60_000, ...opts });
  const last = (r) => `${r.stdout || ''}`.trim().split('\n').pop() || '';
  const shaHex = (s) => sha(Buffer.from(s, 'utf8'));

  const fixture = (dir) => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'sources.md'),
      '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
      + '|---|---|---|---|---|---|---|---|---|---|---|\n'
      + '| S001 | alpha | docs | A | s | a | t | mined | 2026-01-01 | 90d | p |\n'
      + '| S002 | beta | docs | A | s | a | t | mined | 2026-01-01 | 90d | p |\n'
      + '| S003 | gamma | docs | B | s | a | t | rejected | 2026-01-01 | 90d | p |\n');
    writeFileSync(join(dir, 'cap-a.txt'), 'alpha capture bytes\n');
    writeFileSync(join(dir, 'cap-b.txt'), 'beta capture bytes\n');
    const reg = {
      version: 1,
      captures: [
        { sourceId: 'S001', path: 'cap-a.txt', sha256: shaHex('alpha capture bytes\n'), bytes: 20, captured: '2026-10-24' },
        { sourceId: 'S002', path: 'cap-b.txt', sha256: shaHex('beta capture bytes\n'), bytes: 19, captured: '2026-10-24' },
      ],
      exemptions: [{ ids: ['S003'], reason: 'rejected rows keep no capture yet' }],
    };
    writeFileSync(join(dir, 'reg.json'), JSON.stringify(reg, null, 2));
    return { reg: join(dir, 'reg.json'), src: join(dir, 'sources.md') };
  };

  try {
    // case 1 — clean fixture: CLEAN captures=2 exemptions=1, exit 0
    {
      const d = join(root, 'd1'); const f = fixture(d);
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('clean', r.status === 0 && last(r) === 'SOURCE_CAPTURE: CLEAN captures=2 exemptions=1',
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 2 — hash flip: DRIFT hash-mismatch, exit 1
    {
      const d = join(root, 'd2'); const f = fixture(d);
      const reg = JSON.parse(readFileSync(f.reg, 'utf8'));
      reg.captures[0].sha256 = '0'.repeat(64);
      writeFileSync(f.reg, JSON.stringify(reg));
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('hash-mismatch', r.status === 1 && last(r).includes('S001:hash-mismatch'),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 3 — captured file deleted: DRIFT capture-absent
    {
      const d = join(root, 'd3'); const f = fixture(d);
      rmSync(join(d, 'cap-a.txt'));
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('capture-absent', r.status === 1 && last(r).includes('S001:capture-absent'),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 4 — symlink capture: DRIFT not-a-regular-file
    {
      const d = join(root, 'd4'); const f = fixture(d);
      rmSync(join(d, 'cap-a.txt'));
      symlinkSync(join(d, 'cap-b.txt'), join(d, 'cap-a.txt'));
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('not-a-regular-file', r.status === 1 && last(r).includes('S001:not-a-regular-file'),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 5 — wrong bytes count: DRIFT bytes-mismatch
    {
      const d = join(root, 'd5'); const f = fixture(d);
      const reg = JSON.parse(readFileSync(f.reg, 'utf8'));
      reg.captures[0].bytes = 999;
      writeFileSync(f.reg, JSON.stringify(reg));
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('bytes-mismatch', r.status === 1 && last(r).includes('S001:bytes-mismatch'),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 6 — escaping path: DRIFT path-escape
    {
      const d = join(root, 'd6'); const f = fixture(d);
      writeFileSync(join(root, 'outside.txt'), 'alpha capture bytes\n');
      const reg = JSON.parse(readFileSync(f.reg, 'utf8'));
      reg.captures[0].path = '../outside.txt';
      writeFileSync(f.reg, JSON.stringify(reg));
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('path-escape', r.status === 1 && /S001:path-escape/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 7 — SOURCES row with no binding: DRIFT uncaptured
    {
      const d = join(root, 'd7'); const f = fixture(d);
      writeFileSync(join(d, 'sources.md'), readFileSync(join(d, 'sources.md'), 'utf8')
        + '| S009 | iota | docs | A | s | a | t | mined | 2026-01-01 | 90d | p |\n');
      const r = run(['--registry', f.reg, '--sources', join(d, 'sources.md')]);
      pass('uncaptured', r.status === 1 && last(r).includes('S009:uncaptured'),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 8 — capture for a non-existent row: DRIFT orphan-capture
    {
      const d = join(root, 'd8'); const f = fixture(d);
      const reg = JSON.parse(readFileSync(f.reg, 'utf8'));
      reg.captures.push({ sourceId: 'S008', path: 'cap-b.txt', sha256: shaHex('beta capture bytes\n'), bytes: 19, captured: '2026-10-24' });
      writeFileSync(f.reg, JSON.stringify(reg));
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('orphan-capture', r.status === 1 && last(r).includes('S008:orphan-capture'),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 9 — empty captures: DRIFT captures-empty
    {
      const d = join(root, 'd9'); const f = fixture(d);
      const reg = JSON.parse(readFileSync(f.reg, 'utf8'));
      reg.captures = [];
      reg.exemptions = [{ ids: ['S001', 'S002', 'S003'], reason: 'all exempt' }];
      writeFileSync(f.reg, JSON.stringify(reg));
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('captures-empty', r.status === 1 && last(r).includes('captures-empty'),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 10 — malformed JSON: FAIL-CLOSED exit 2
    {
      const d = join(root, 'd10'); const f = fixture(d);
      writeFileSync(f.reg, '{ broken');
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('registry-not-json', r.status === 2 && /FAIL-CLOSED reason=registry not valid JSON/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 11 — version !== 1: FAIL-CLOSED exit 2
    {
      const d = join(root, 'd11'); const f = fixture(d);
      const reg = JSON.parse(readFileSync(f.reg, 'utf8'));
      reg.version = 2;
      writeFileSync(f.reg, JSON.stringify(reg));
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('registry-version', r.status === 2 && /FAIL-CLOSED reason=registry version 2 !== 1/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 12 — capture+exempt conflict: FAIL-CLOSED exit 2
    {
      const d = join(root, 'd12'); const f = fixture(d);
      const reg = JSON.parse(readFileSync(f.reg, 'utf8'));
      reg.exemptions.push({ ids: ['S001'], reason: 'conflict' });
      writeFileSync(f.reg, JSON.stringify(reg));
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('capture-exempt-conflict', r.status === 2 && /FAIL-CLOSED reason=duplicate sourceId "S001"/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
    // case 13 — sources doc missing: FAIL-CLOSED exit 2
    {
      const d = join(root, 'd13'); const f = fixture(d);
      rmSync(f.src);
      const r = run(['--registry', f.reg, '--sources', f.src]);
      pass('sources-absent', r.status === 2 && /FAIL-CLOSED/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  const held = results.filter((r) => r.ok).length;
  process.stdout.write(`SOURCE_CAPTURE_SELFTEST: ${held === results.length ? 'PASS' : 'FAIL'} (${held}/${results.length})\n`);
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
  // With an explicit registry the sources doc defaults to registry-local unless named.
  if (explicitReg && !argv.includes('--sources')) {
    src = join(dirname(reg), 'sources.md');
  }
  emit(evaluate(reg, src));
}
