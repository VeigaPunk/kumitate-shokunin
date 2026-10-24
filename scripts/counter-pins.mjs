#!/usr/bin/env node
/**
 * counter-pins.mjs — gate `counter-pins` (contract `kumitate-counter-pins-v1`, round 54).
 *
 * The pinned-counter registry gate: the B5d arm beyond the round-53 H6 source-pin rule —
 * a MECHANICAL check that the lane's frozen round counters (and the instruments they
 * judge) are byte-identical to the hashes the round plans froze. Round 53 verified its
 * counter source pins only inside the close harm battery (a human-run sha256sum
 * comparison); this gate makes the same pin set a runnable, fail-closed artifact that
 * any seat can re-execute (planned round-53 candidate (2), SCORECARD §Round 53
 * "Planned next round").
 *
 *   node scripts/counter-pins.mjs [--registry <path>]
 *   node scripts/counter-pins.mjs --selftest
 *
 * Verdicts (one line on stdout, after optional per-pin notes on stdout):
 *   COUNTER_PINS: CLEAN pins=<n>                              exit 0
 *   COUNTER_PINS: DRIFT pins=<n> bad=<k> first=<name:why>    exit 1
 *   COUNTER_PINS: FAIL-CLOSED reason=<why>                    exit 2 (could not evaluate)
 *   COUNTER_PINS: USAGE ...                                   exit 64
 *
 * Registry (default `.ufo/pins/counter-pins.json`, lane-root-relative):
 *   { "version": 1,
 *     "pins": [ { "round": <n>, "name": "<id>", "path": "<repo-relative>",
 *                 "sha256": "<64 lowercase hex>" }, ... ] }
 *
 * Rules (each pins[] entry):
 *   - `path` is resolved against the LANE ROOT for the default registry
 *     (paths are repo-relative); for an explicit `--registry <path>` it is
 *     resolved against the registry file's own directory (selftest fixtures
 *     and out-of-tree audits stay local to the named registry). In both modes
 *     an escaping path (`..` or absolute) is DRIFT `path-escape` — a pin must
 *     bind bytes beneath its base, never wherever a registry author points.
 *   - the resolved path must exist and be a REGULAR FILE — a symlinked pin is
 *     DRIFT (the pin must bind bytes, not a name).
 *   - its sha256 (node:crypto over the exact bytes) must equal the registry entry.
 *   - duplicate `name` values make the registry malformed: FAIL-CLOSED (the registry is
 *     a claim, not a suggestion; an ambiguous pin set cannot be evaluated).
 *   - an EMPTY pins[] array is DRIFT `pins-empty`, not CLEAN: a registry that binds
 *     nothing is precisely the state this gate exists to catch.
 * Registry unreadable / not JSON / version !== 1 → FAIL-CLOSED (exit 2, never a score).
 *
 * The gate never writes. It reads the registry and the pinned bytes only.
 *
 * Selftest: hermetic fixtures under mkdtemp (the gate binary run as a subprocess against
 * crafted registries), eleven cases, one red-before per rule; the final line reads
 * `COUNTER_PINS_SELFTEST: PASS (11/11)` + `VERDICT: PASS`, exit 0.
 *
 * Exit map: 0 clean · 1 a real defect (drift) · 2 fail-closed · 64 usage.
 * Owner: kumitate L1. Row: SKILL.md §Gate registry (`counter-pins`, gate);
 * pin: SCORECARD.md `kumitate-gate-pins-v1` (`pin.counter-pins`).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const LANE = resolve(dirname(SELF), '..');
const DEFAULT_REGISTRY = '.ufo/pins/counter-pins.json';
const HEX64 = /^[0-9a-f]{64}$/;

const sha = (b) => createHash('sha256').update(b).digest('hex');

function usage() {
  process.stderr.write('COUNTER_PINS: USAGE node scripts/counter-pins.mjs [--registry <path>] | --selftest\n');
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
  if (!Array.isArray(doc.pins)) {
    return { ok: false, reason: 'registry pins not an array' };
  }
  const names = new Set();
  for (const p of doc.pins) {
    if (!p || typeof p !== 'object' || typeof p.name !== 'string' || p.name.length === 0
        || !Number.isSafeInteger(p.round) || p.round < 1 || typeof p.path !== 'string'
        || p.path.length === 0 || typeof p.sha256 !== 'string' || !HEX64.test(p.sha256)) {
      return { ok: false, reason: 'a pin entry lacks valid round/name/path/sha256(64hex)' };
    }
    if (names.has(p.name)) {
      return { ok: false, reason: `duplicate pin name ${JSON.stringify(p.name)}` };
    }
    names.add(p.name);
  }
  return { ok: true, pins: doc.pins };
}

function evaluate(registryPath) {
  const reg = loadRegistry(registryPath);
  if (!reg.ok) {
    return { verdict: 'FAIL-CLOSED', reason: reg.reason, exit: 2 };
  }
  if (reg.pins.length === 0) {
    return { verdict: 'DRIFT', pins: 0, bad: ['pins-empty:registry binds nothing'], exit: 1 };
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
  for (const p of reg.pins) {
    const abs = resolve(base, p.path);
    let targetReal;
    try {
      targetReal = realpathSync(abs);
    } catch {
      bad.push(`${p.name}:absent`);
      continue;
    }
    const rel = relative(baseReal, targetReal);
    if (rel === '..' || rel.startsWith(`..${sep}`) || rel.includes(`${sep}..${sep}`)) {
      bad.push(`${p.name}:path-escape`);
      continue;
    }
    let st;
    try {
      st = lstatSync(abs);
    } catch {
      bad.push(`${p.name}:absent`);
      continue;
    }
    if (!st.isFile()) {
      bad.push(`${p.name}:not-a-regular-file`);
      continue;
    }
    let digest;
    try {
      digest = sha(readFileSync(abs));
    } catch (e) {
      return { verdict: 'FAIL-CLOSED', reason: `${p.name}: unreadable: ${e.code || 'EIO'}`, exit: 2 };
    }
    if (digest !== p.sha256) {
      bad.push(`${p.name}:hash-mismatch`);
      continue;
    }
  }
  if (bad.length > 0) {
    return { verdict: 'DRIFT', pins: reg.pins.length, bad, exit: 1 };
  }
  return { verdict: 'CLEAN', pins: reg.pins.length, exit: 0 };
}

function emit(result) {
  if (result.verdict === 'CLEAN') {
    process.stdout.write(`COUNTER_PINS: CLEAN pins=${result.pins}\n`);
  } else if (result.verdict === 'DRIFT') {
    for (const b of result.bad.slice(1)) process.stdout.write(`COUNTER_PINS: note ${b}\n`);
    process.stdout.write(`COUNTER_PINS: DRIFT pins=${result.pins} bad=${result.bad.length} first=${result.bad[0]}\n`);
  } else {
    process.stdout.write(`COUNTER_PINS: FAIL-CLOSED reason=${result.reason}\n`);
  }
  process.exit(result.exit);
}

function selftest() {
  const root = mkdtempSync(join(tmpdir(), 'counter-pins-st.'));
  const run = (args, opts = {}) => spawnSync(process.execPath, [SELF, ...args],
    { encoding: 'utf8', timeout: 60_000, maxBuffer: 8 << 20, ...opts });
  const writeReg = (name, doc) => {
    const p = join(root, name);
    writeFileSync(p, typeof doc === 'string' ? doc : JSON.stringify(doc, null, 2));
    return p;
  };
  const writeFile = (rel, bytes) => {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, bytes);
    return p;
  };
  const fA = writeFile('a.mjs', 'export const a = 1;\n');
  const fB = writeFile('deep/b.mjs', 'export const b = 2;\n');
  const fC = writeFile('c.mjs', 'export const c = 3;\n');
  const hA = sha(readFileSync(fA));
  const hB = sha(readFileSync(fB));
  const hC = sha(readFileSync(fC));
  const pin = (name, path, hash) => ({ round: 54, name, path, sha256: hash });
  const registry = (pins) => ({ version: 1, pins });
  const results = [];
  const case_ = (name, ok, detail) => results.push({ name, ok, detail });

  // 1 clean registry passes
  {
    const reg = writeReg('clean.json', registry([pin('p1', 'a.mjs', hA), pin('p2', 'deep/b.mjs', hB)]));
    const r = run(['--registry', reg]);
    const last = `${r.stdout || ''}`.trim().split('\n').pop();
    case_('clean-pass', r.status === 0 && /^COUNTER_PINS: CLEAN pins=2$/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
  }
  // 2 one flipped hash → DRIFT naming the pin
  {
    const reg = writeReg('tamper.json', registry([pin('p1', 'a.mjs', hA), pin('p2', 'deep/b.mjs', '0'.repeat(64))]));
    const r = run(['--registry', reg]);
    const last = `${r.stdout || ''}`.trim().split('\n').pop();
    case_('hash-tamper-drift', r.status === 1 && /COUNTER_PINS: DRIFT pins=2 bad=1 first=p2:hash-mismatch/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
  }
  // 3 a pinned file deleted → DRIFT
  {
    writeFile('gone.mjs', 'x\n');
    const reg = writeReg('gone.json', registry([pin('pg', 'gone.mjs', sha(readFileSync(join(root, 'gone.mjs'))))]));
    rmSync(join(root, 'gone.mjs'));
    const r = run(['--registry', reg]);
    const last = `${r.stdout || ''}`.trim().split('\n').pop();
    case_('missing-file-drift', r.status === 1 && /first=pg:absent/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
  }
  // 4 malformed registry JSON → FAIL-CLOSED exit 2
  {
    const reg = writeReg('bad.json', '{ not json');
    const r = run(['--registry', reg]);
    const last = `${r.stdout || ''}`.trim().split('\n').pop();
    case_('malformed-fail-closed', r.status === 2 && /COUNTER_PINS: FAIL-CLOSED reason=registry not valid JSON/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
  }
  // 5 wrong version → FAIL-CLOSED exit 2
  {
    const reg = writeReg('v2.json', { version: 2, pins: [pin('p1', 'a.mjs', hA)] });
    const r = run(['--registry', reg]);
    const last = `${r.stdout || ''}`.trim().split('\n').pop();
    case_('wrong-version-fail-closed', r.status === 2 && /reason=registry version 2 !== 1/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
  }
  // 6 duplicate pin names → FAIL-CLOSED exit 2
  {
    const reg = writeReg('dup.json', registry([pin('same', 'a.mjs', hA), pin('same', 'c.mjs', hC)]));
    const r = run(['--registry', reg]);
    const last = `${r.stdout || ''}`.trim().split('\n').pop();
    case_('duplicate-names-fail-closed', r.status === 2 && /reason=duplicate pin name "same"/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
  }
  // 7 a pinned path replaced by a symlink → DRIFT (pins bind bytes, not names)
  {
    writeFile('real-target.mjs', 't\n');
    rmSync(fC);
    symlinkSync(join(root, 'real-target.mjs'), fC);
    const reg = writeReg('sym.json', registry([pin('ps', 'c.mjs', hC)]));
    const r = run(['--registry', reg]);
    const last = `${r.stdout || ''}`.trim().split('\n').pop();
    case_('symlink-drift', r.status === 1 && /first=ps:not-a-regular-file/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
    rmSync(fC);
    writeFileSync(fC, 'export const c = 3;\n');
  }
  // 8 empty pins array → DRIFT pins-empty (an empty registry is the state this gate exists to catch)
  {
    const reg = writeReg('empty.json', registry([]));
    const r = run(['--registry', reg]);
    const last = `${r.stdout || ''}`.trim().split('\n').pop();
    case_('empty-pins-drift', r.status === 1 && /COUNTER_PINS: DRIFT pins=0 bad=1 first=pins-empty:registry binds nothing/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
  }
  // 9 unknown extra fields are ignored (forward-compatible)
  {
    const doc = registry([pin('p1', 'a.mjs', hA)]);
    doc.note = 'extra field';
    doc.pins[0].extra = true;
    const reg = writeReg('extra.json', doc);
    const r = run(['--registry', reg]);
    const last = `${r.stdout || ''}`.trim().split('\n').pop();
    case_('extra-fields-ignored', r.status === 0 && /^COUNTER_PINS: CLEAN pins=1$/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
  }
  // 10 registry path that is a directory → FAIL-CLOSED exit 2
  {
    const r = run(['--registry', root]);
    const last = `${r.stdout || ''}`.trim().split('\n').pop();
    case_('registry-dir-fail-closed', r.status === 2 && /COUNTER_PINS: FAIL-CLOSED reason=registry not a regular file/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
  }
  // 11 path traversal outside the registry base → DRIFT
  {
    const outside = join(dirname(root), `${root.split(sep).pop()}-outside.mjs`);
    writeFileSync(outside, 'outside\n');
    const reg = writeReg('escape.json', registry([pin('pe', `../${outside.split(sep).pop()}`, sha(readFileSync(outside)))]));
    const r = run(['--registry', reg]);
    const last = `${r.stdout || ''}`.trim().split('\n').pop();
    case_('path-escape-drift', r.status === 1 && /first=pe:path-escape/.test(last), `exit=${r.status} last=${JSON.stringify(last)}`);
    rmSync(outside);
  }

  const pass = results.filter((r) => r.ok).length;
  for (const r of results) {
    process.stdout.write(`case ${r.name}: ${r.ok ? 'PASS' : `FAIL — ${r.detail}`}\n`);
  }
  rmSync(root, { recursive: true, force: true });
  process.stdout.write(`COUNTER_PINS_SELFTEST: ${pass === results.length ? 'PASS' : 'FAIL'} (${pass}/${results.length})\n`);
  process.stdout.write(`VERDICT: ${pass === results.length ? 'PASS' : 'FAIL'}\n`);
  process.exit(pass === results.length ? 0 : 1);
}

const argv = process.argv.slice(2);
if (argv.includes('--selftest')) {
  if (argv.length !== 1) usage();
  selftest();
} else {
  let reg = join(LANE, DEFAULT_REGISTRY);
  const i = argv.indexOf('--registry');
  if (i !== -1) {
    if (argv.length !== i + 2) usage();
    reg = resolve(argv[i + 1]);
  } else if (argv.length !== 0) {
    usage();
  }
  emit(evaluate(reg));
}
