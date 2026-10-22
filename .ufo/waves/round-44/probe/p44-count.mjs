#!/usr/bin/env node
// p44-count.mjs — kumitate round 44, claim C1 (operability, capability `omp-census`).
// FROZEN at the plan commit of round 44: never edited after that commit. A change is a new counter
// with a new name, and it is not the C1 counter.
//
// PREDICATE P44 (the same sentence as .ufo/waves/round-44/plan.md § P44; the code below implements it
// once, in `casePasses`, and the receipt label is `P44`):
//   A case PASSES iff the census under test, run alone in a bubblewrap sandbox that shows it only its
//   own file (/c/omp-census.mjs, read-only) and the case's shape mirror (/r, read-only), with a
//   cleared environment, `--root /r` as its only arguments, a 20 s wall limit and a 256 MB V8 heap,
//   exits 0 and prints exactly one line starting `OMP_CENSUS: CLEAN` and no line starting
//   `OMP_CENSUS: DRIFT` when the case expects CLEAN, or exits 1 and prints exactly one line starting
//   `OMP_CENSUS: DRIFT` and no line starting `OMP_CENSUS: CLEAN` when the case expects DRIFT.
//   The counter reads P44_COUNT: MET iff every generated case passes and there are at least 20
//   cases; otherwise P44_COUNT: UNMET.
//
// Cases are generated at run time from the live root's depth-1 SHAPE (name, kind, permission bits;
// never contents): the mirror holds empty files and empty directories with the live names and modes.
// Generic rules only (frozen): an entry is a SIDECAR iff its name ends `-shm` or `-wal`; with any
// sidecar suffix removed, an entry is a CHAIN generation iff normalize(name) !== name, where normalize
// replaces a UUID with <U>, then a run of >=16 hex digits with <H>, then a run of >=4 decimal digits
// with <D>; every other entry is a BASE member.
//   control      exact mirror                                                   -> CLEAN
//   control-end  exact mirror, run again after every other case                 -> CLEAN
//   stray        + a file named `zq` + 10 random letters                        -> DRIFT
//   stray-digit  + a file named `zq` + 6 random letters + `-` + 14 random digits -> DRIFT
//   near:<m>     + a file named `<m>.orig`, for each BASE member m              -> DRIFT
//   kind:<m>     BASE member m flipped file<->directory                         -> DRIFT
//   mode:<m>     BASE member m whose live mode has no group/other bits, + o+r   -> DRIFT
//   gen:<f>      + one fresh generation of each CHAIN family f (placeholders refilled at random,
//                same lengths, same kind and mode as the family's first live entry)       -> CLEAN
//   no-sidecars  every SIDECAR entry removed (only when one exists)              -> CLEAN
//   no-chains    every CHAIN entry and its sidecars removed (only when one exists) -> CLEAN
// Case order is shuffled and mirror entries are created in random order on every case, at the same
// host path, so the census can tell cases apart only by the mirror's shape.
//
// Usage: node p44-count.mjs --census FILE (--shape FILE | --live DIR) [--work DIR] [--list]
//        node p44-count.mjs --snapshot-live DIR --out FILE
//   --census FILE  the census under test; a missing file is scored (every case fails), never an error
//   --shape FILE   frozen depth-1 shape (TSV: name, kind, octal mode) that seeds the cases; the C1
//                  measurement uses .ufo/waves/round-44/probe/p44-shape.tsv committed with this file
//   --live DIR     seed from a live root's shape instead (diagnostic; default $HOME/.omp/agent)
//   --work DIR     scratch parent (default /fast/scratch/hyaku/kumitate-r44/p44)
//   --list         print the generated cases and exit 0 without running anything
//   --snapshot-live DIR --out FILE  write DIR's depth-1 shape as TSV (names, kinds, modes only)
// Exit: 0 MET, 1 UNMET, 2 could not evaluate (no bwrap, unreadable root or shape, bad usage).

import { spawnSync } from 'node:child_process';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import {
  chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const CASE_FLOOR = 20;
const WALL_MS = 20000;

function die(msg) { console.log(`P44_COUNT: ERROR (${msg})`); process.exit(2); }
function sha256(buf) { return createHash('sha256').update(buf).digest('hex'); }

function parseArgs(argv) {
  const o = { census: null, shape: null, live: join(process.env.HOME || '', '.omp/agent'), work: '/fast/scratch/hyaku/kumitate-r44/p44', list: false, snapshot: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--census') o.census = argv[++i];
    else if (a === '--shape') o.shape = argv[++i];
    else if (a === '--live') o.live = argv[++i];
    else if (a === '--work') o.work = argv[++i];
    else if (a === '--list') o.list = true;
    else if (a === '--snapshot-live') o.snapshot = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else die(`unknown argument ${a}`);
  }
  if (o.snapshot) { if (!o.out) die('--snapshot-live needs --out FILE'); return o; }
  if (!o.census) die('--census FILE is required');
  return o;
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
const HEX_RE = /[0-9a-f]{16,}/g;
const DEC_RE = /[0-9]{4,}/g;
function normalize(name) { return name.replace(UUID_RE, '<U>').replace(HEX_RE, '<H>').replace(DEC_RE, '<D>'); }
function stripSidecar(name) { return name.replace(/-(shm|wal)$/, ''); }
function isSidecar(name) { return /-(shm|wal)$/.test(name); }
function isChain(name) { const s = stripSidecar(name); return normalize(s) !== s; }

function kindOf(st) { return st.isDirectory() ? 'dir' : st.isFile() ? 'file' : st.isSymbolicLink() ? 'symlink' : 'other'; }

function readLive(dir) {
  let names;
  try { names = readdirSync(dir); } catch (e) { die(`live root unreadable: ${dir}: ${e.code || e.message}`); }
  return names.sort().map((name) => {
    const st = lstatSync(join(dir, name));
    return { name, kind: kindOf(st), mode: st.mode & 0o777 };
  });
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

function readShape(file) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch (e) { die(`shape unreadable: ${file}: ${e.code || e.message}`); }
  const out = [];
  for (const line of text.split('\n')) {
    if (line === '' || line.startsWith('#')) continue;
    const [name, kind, mode] = line.split('\t');
    if (!name || !['file', 'dir', 'symlink', 'other'].includes(kind) || !/^[0-7]{3}$/.test(mode || '')) die(`bad shape line: ${line}`);
    out.push({ name, kind, mode: parseInt(mode, 8) });
  }
  if (out.length === 0) die(`empty shape: ${file}`);
  return out.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}
function randLetters(n) { let s = ''; for (let i = 0; i < n; i++) s += LETTERS[randomInt(26)]; return s; }
function randDigits(n) { let s = String(1 + randomInt(9)); for (let i = 1; i < n; i++) s += String(randomInt(10)); return s; }
function randHex(n) { return randomBytes(Math.ceil(n / 2)).toString('hex').slice(0, n); }
function refill(name) {
  // Same lengths, fresh values: each UUID, hex run and decimal run is replaced in place.
  return name
    .replace(UUID_RE, () => [randHex(8), randHex(4), '4' + randHex(3), '8' + randHex(3), randHex(12)].join('-'))
    .replace(/[0-9a-f]{16,}/g, (m) => (/[a-f]/.test(m) ? randHex(m.length) : randDigits(m.length)))
    .replace(/[0-9]{4,}/g, (m) => randDigits(m.length));
}

function buildCases(live) {
  const names = new Set(live.map((e) => e.name));
  const base = live.filter((e) => !isSidecar(e.name) && !isChain(e.name));
  const cases = [];
  const clone = () => live.map((e) => ({ ...e }));
  cases.push({ id: 'control', expect: 'CLEAN', entries: clone() });
  let s1; do { s1 = 'zq' + randLetters(10); } while (names.has(s1));
  cases.push({ id: 'stray', expect: 'DRIFT', entries: [...clone(), { name: s1, kind: 'file', mode: 0o644 }] });
  let s2; do { s2 = 'zq' + randLetters(6) + '-' + randDigits(14); } while (names.has(s2));
  cases.push({ id: 'stray-digit', expect: 'DRIFT', entries: [...clone(), { name: s2, kind: 'file', mode: 0o644 }] });
  for (const m of base) {
    if (!names.has(`${m.name}.orig`)) {
      cases.push({ id: `near:${m.name}`, expect: 'DRIFT', entries: [...clone(), { name: `${m.name}.orig`, kind: 'file', mode: 0o644 }] });
    }
    if (m.kind === 'file' || m.kind === 'dir') {
      const flipped = clone().map((e) => (e.name === m.name
        ? { name: e.name, kind: e.kind === 'file' ? 'dir' : 'file', mode: e.kind === 'file' ? (e.mode | 0o700) : (e.mode & 0o666) }
        : e));
      cases.push({ id: `kind:${m.name}`, expect: 'DRIFT', entries: flipped });
    }
    if ((m.mode & 0o077) === 0 && (m.kind === 'file' || m.kind === 'dir')) {
      const widened = clone().map((e) => (e.name === m.name ? { ...e, mode: e.mode | 0o004 } : e));
      cases.push({ id: `mode:${m.name}`, expect: 'DRIFT', entries: widened });
    }
  }
  const families = new Map();
  for (const e of live) {
    if (!isChain(e.name)) continue;
    const key = normalize(stripSidecar(e.name)) + (isSidecar(e.name) ? e.name.slice(-4) : '');
    if (!families.has(key)) families.set(key, e);
  }
  for (const [key, tmpl] of families) {
    let fresh; do { fresh = refill(tmpl.name); } while (names.has(fresh) || fresh === tmpl.name);
    cases.push({ id: `gen:${key}`, expect: 'CLEAN', entries: [...clone(), { name: fresh, kind: tmpl.kind, mode: tmpl.mode }] });
  }
  if (live.some((e) => isSidecar(e.name))) {
    cases.push({ id: 'no-sidecars', expect: 'CLEAN', entries: clone().filter((e) => !isSidecar(e.name)) });
  }
  if (live.some((e) => isChain(e.name))) {
    cases.push({ id: 'no-chains', expect: 'CLEAN', entries: clone().filter((e) => !isChain(e.name)) });
  }
  // Shuffle every case except the closing control, which always runs last.
  for (let i = cases.length - 1; i > 0; i--) { const j = randomInt(i + 1); [cases[i], cases[j]] = [cases[j], cases[i]]; }
  cases.push({ id: 'control-end', expect: 'CLEAN', entries: clone() });
  return cases;
}

function buildMirror(dir, entries) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { mode: 0o755 });
  const order = entries.map((e) => e);
  for (let i = order.length - 1; i > 0; i--) { const j = randomInt(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  for (const e of order) {
    const p = join(dir, e.name);
    if (e.kind === 'dir') mkdirSync(p);
    else if (e.kind === 'file') writeFileSync(p, '');
    else die(`unsupported live kind ${e.kind} for ${e.name}`);
    chmodSync(p, e.mode);
  }
}

function nodeRoot() {
  // The directory that holds bin/node for the running interpreter.
  return dirname(dirname(process.execPath));
}

// P44 — the one implementation of the predicate.
function casePasses(expect, status, stdout) {
  const lines = stdout.split('\n');
  const clean = lines.filter((l) => l.startsWith('OMP_CENSUS: CLEAN')).length;
  const drift = lines.filter((l) => l.startsWith('OMP_CENSUS: DRIFT')).length;
  if (expect === 'CLEAN') return status === 0 && clean === 1 && drift === 0;
  return status === 1 && drift === 1 && clean === 0;
}

function runCase(work, entries, censusPresent) {
  const mirror = join(work, 'r');
  buildMirror(mirror, entries);
  if (!censusPresent) return { status: 'absent', stdout: '' };
  const nr = nodeRoot();
  const args = [
    '--unshare-all', '--die-with-parent', '--new-session', '--clearenv',
    '--ro-bind', '/usr', '/usr', '--symlink', 'usr/lib', '/lib', '--symlink', 'usr/lib64', '/lib64',
    '--symlink', 'usr/bin', '/bin',
    '--ro-bind', nr, '/n', '--ro-bind', join(work, 'c'), '/c', '--ro-bind', mirror, '/r',
    '--tmpfs', '/tmp', '--proc', '/proc', '--dev', '/dev', '--dir', '/h',
    '--setenv', 'HOME', '/h', '--setenv', 'PATH', '/n/bin:/usr/bin', '--chdir', '/h',
    '/n/bin/node', '--max-old-space-size=256', '/c/omp-census.mjs', '--root', '/r',
  ];
  const r = spawnSync('bwrap', args, { encoding: 'utf8', timeout: WALL_MS, killSignal: 'SIGKILL', maxBuffer: 4 << 20 });
  if (r.error && r.error.code === 'ETIMEDOUT') return { status: 'timeout', stdout: r.stdout || '' };
  if (r.error) return { status: `spawn-error:${r.error.code || r.error.message}`, stdout: r.stdout || '' };
  return { status: r.status === null ? `signal:${r.signal}` : r.status, stdout: r.stdout || '' };
}

function verdictToken(stdout) {
  const l = stdout.split('\n').filter((x) => x.startsWith('OMP_CENSUS: '));
  if (l.length === 0) return 'none';
  return l.map((x) => x.split(/\s+/)[1]).join('+');
}

const opts = parseArgs(process.argv.slice(2));
if (opts.snapshot) {
  const snap = readLive(resolve(opts.snapshot));
  const body = snap.map((e) => `${e.name}\t${e.kind}\t${e.mode.toString(8).padStart(3, '0')}`).join('\n') + '\n';
  writeFileSync(opts.out, `# p44 shape of ${resolve(opts.snapshot)} (depth 1; names, kinds, modes only; contents never read)\n${body}`);
  console.log(`P44 snapshot entries=${snap.length} out=${resolve(opts.out)} sha256=${sha256(readFileSync(opts.out))}`);
  process.exit(0);
}
const seedLabel = opts.shape ? `shape=${resolve(opts.shape)} shape_sha256=${sha256(readFileSync(resolve(opts.shape)))}` : `live=${resolve(opts.live)}`;
const live = opts.shape ? readShape(resolve(opts.shape)) : readLive(resolve(opts.live));
const cases = buildCases(live);
const selfSha = sha256(readFileSync(SELF));
const censusPath = resolve(opts.census);
const censusPresent = existsSync(censusPath) && lstatSync(censusPath).isFile();
const censusSha = censusPresent ? sha256(readFileSync(censusPath)) : 'absent';

console.log(`P44 counter sha256=${selfSha}`);
console.log(`P44 census=${censusPath} sha256=${censusSha}`);
console.log(`P44 ${seedLabel} entries=${live.length} base=${live.filter((e) => !isSidecar(e.name) && !isChain(e.name)).length} sidecar=${live.filter((e) => isSidecar(e.name)).length} chain=${live.filter((e) => !isSidecar(e.name) && isChain(e.name)).length} cases=${cases.length}`);

if (opts.list) {
  for (const c of cases) console.log(`CASE ${c.id} expect=${c.expect} entries=${c.entries.length}`);
  process.exit(0);
}

if (spawnSync('bwrap', ['--version'], { encoding: 'utf8' }).status !== 0) die('bwrap not runnable');

mkdirSync(opts.work, { recursive: true, mode: 0o700 });
const work = join(opts.work, `run-${process.pid}-${randHex(8)}`);
mkdirSync(join(work, 'c'), { recursive: true, mode: 0o700 });
if (censusPresent) { copyFileSync(censusPath, join(work, 'c', 'omp-census.mjs')); chmodSync(join(work, 'c', 'omp-census.mjs'), 0o444); }

let passed = 0;
try {
  for (const c of cases) {
    const r = runCase(work, c.entries, censusPresent);
    const ok = censusPresent && casePasses(c.expect, r.status, r.stdout);
    if (ok) passed++;
    console.log(`CASE ${c.id} expect=${c.expect} exit=${r.status} verdict=${verdictToken(r.stdout)} P44=${ok ? 'PASS' : 'FAIL'}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
const met = passed === cases.length && cases.length >= CASE_FLOOR;
console.log(`P44_COUNT: ${met ? 'MET' : 'UNMET'} (passed=${passed} cases=${cases.length} floor=${CASE_FLOOR} census_sha256=${censusSha})`);
process.exit(met ? 0 : 1);
