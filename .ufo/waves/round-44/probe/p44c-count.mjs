#!/usr/bin/env node
// p44c-count.mjs — kumitate round 44, claim C1 (operability, capability `omp-census`).
// Supersedes p44b-count.mjs BEFORE any census was scored (plan.md § Second pre-data redesign): the
// control wave found two skip-work programs that read MET under p44b (CtlLabelKeyedA: global
// directory count, global 600/644 split and the fixed crossgen target RULES.md; CtlLabelKeyedB:
// 19 names, a global directory count and a global mode sum). p44c keeps the predicate P44 word for
// word and changes only case generation. FROZEN at the commit that adds it: never edited after.
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
// Cases are generated from a depth-1 SHAPE (name, kind, permission bits; never contents): the mirror
// holds empty files and empty directories with those names and modes. Generic rules (frozen): an
// entry is a SIDECAR iff its name ends `-shm` or `-wal`; with any sidecar suffix removed, an entry is
// a CHAIN generation iff normalize(name) !== name, where normalize replaces a UUID with <U>, then a
// run of >=16 hex digits with <H>, then a run of >=4 decimal digits with <D>; every other entry is a
// BASE member. Every added entry takes its (kind, mode) from a random shape entry unless stated.
//   control       exact mirror                                                        -> CLEAN
//   control-end   exact mirror, run again after every other case                      -> CLEAN
//   stray         + 5-12 random letters + a random extension (or none)                -> DRIFT
//   stray-digit   + 4-8 random letters + `-` + 14 random digits                       -> DRIFT
//   near:<m>      + `<m>.` + 3-6 random letters, for each BASE member m               -> DRIFT
//   neardigit:<m> + `<m>.` + 14 random digits, for each BASE member m                 -> DRIFT
//   kind:<m>      BASE member m flipped file<->directory                              -> DRIFT
//   mode:<m>      BASE member m with no group/other bits, + o+r                        -> DRIFT
//   swap:<m>      m exchanges (kind, mode) with a random BASE member whose pair differs -> DRIFT
//   sidecarkind:<s> / sidecarwide:<s>  a SIDECAR flipped / given o+r (when it has no g/o bits) -> DRIFT
//   gen:<f>       + a fresh generation of CHAIN family f (placeholders refilled, same lengths,
//                 the family's kind and mode)                                          -> CLEAN
//   genkind:<f> / genwide:<f>  that generation with flipped kind / with o+r              -> DRIFT
//   crossgen:<f>  that generation re-based from its owning BASE member onto a random other
//                 BASE member (different extension, no prefix relation)                -> DRIFT
//   no-sidecars / no-chains   every SIDECAR / every CHAIN entry removed                -> CLEAN
//   src:<id>      the sourced additions in SOURCED below (members OMP itself may create)  -> CLEAN
// Case order is shuffled and mirror entries are created in random order on every case, at the same
// host path. Randomness is a seeded HMAC-SHA256 stream: the header prints the seed and `--seed HEX`
// replays a run exactly; every CASE line prints what was added or changed.
//
// Usage: node p44c-count.mjs --census FILE (--shape FILE | --live DIR) [--seed HEX] [--work DIR] [--list]
//        node p44c-count.mjs --selftest --shape FILE   (predicate truth table, MET rule, replay)
//        node p44c-count.mjs --snapshot-live DIR --out FILE
//   --census FILE  the census under test; a missing file is scored (every case fails), never an error
//   --shape FILE   frozen depth-1 shape (TSV: name, kind, octal mode) that seeds the cases; the C1
//                  measurement uses .ufo/waves/round-44/probe/p44-shape.tsv committed with this file
//   --live DIR     seed from a live root's shape instead (diagnostic; default $HOME/.omp/agent)
//   --work DIR     scratch parent (default /fast/scratch/hyaku/kumitate-r44/p44)
//   --list         print the generated cases and exit 0 without running anything
//   --snapshot-live DIR --out FILE  write DIR's depth-1 shape as TSV (names, kinds, modes only)
// Exit: 0 MET, 1 UNMET, 2 could not evaluate (no bwrap, unreadable root or shape, bad usage).

import { spawnSync } from 'node:child_process';
import { createHash, createHmac, randomBytes } from 'node:crypto';
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
  const o = { census: null, shape: null, live: join(process.env.HOME || '', '.omp/agent'), work: '/fast/scratch/hyaku/kumitate-r44/p44', list: false, snapshot: null, out: null, seed: null, selftest: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--census') o.census = argv[++i];
    else if (a === '--shape') o.shape = argv[++i];
    else if (a === '--live') o.live = argv[++i];
    else if (a === '--work') o.work = argv[++i];
    else if (a === '--list') o.list = true;
    else if (a === '--snapshot-live') o.snapshot = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--seed') o.seed = argv[++i];
    else if (a === '--selftest') o.selftest = true;
    else die(`unknown argument ${a}`);
  }
  if (o.snapshot) { if (!o.out) die('--snapshot-live needs --out FILE'); return o; }
  if (!o.census && !o.selftest) die('--census FILE is required');
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
// Seeded generator (replayable): HMAC-SHA256(seed, counter) stream; `--seed HEX` replays a run exactly.
let SEED = null;
let ctr = 0;
let pool = Buffer.alloc(0);
function rbytes(n) {
  while (pool.length < n) {
    const h = createHmac('sha256', SEED).update(String(ctr++)).digest();
    pool = Buffer.concat([pool, h]);
  }
  const out = pool.subarray(0, n);
  pool = pool.subarray(n);
  return Buffer.from(out);
}
function rint(max) { // uniform integer in [0, max)
  const lim = Math.floor(0x100000000 / max) * max;
  for (;;) { const v = rbytes(4).readUInt32BE(0); if (v < lim) return v % max; }
}
function pick(arr) { return arr[rint(arr.length)]; }
function randLetters(n) { let s = ''; for (let i = 0; i < n; i++) s += LETTERS[rint(26)]; return s; }
function randDigits(n) { let s = String(1 + rint(9)); for (let i = 1; i < n; i++) s += String(rint(10)); return s; }
function randHex(n) { return rbytes(Math.ceil(n / 2)).toString('hex').slice(0, n); }
function refill(name) {
  // Same shapes, fresh VALID values, in one pass so a refilled UUID is never re-touched: a UUID ->
  // a fresh v4 UUID; YYYYMMDDTHHMMSSZ / YYYYMMDDTHHMM -> a valid UTC stamp in 2026-2027; a 13-digit
  // run -> epoch milliseconds in 2026-2027; a >=16 hex run -> fresh hex (digits if it had no letter);
  // any other >=4 digit run -> random digits of the same length.
  const ms = () => Date.UTC(2026, 0, 1) + rint(365 * 2) * 86400000 + rint(86400) * 1000 + rint(1000);
  const stamp = (withSec) => { const d = new Date(ms()).toISOString(); return d.slice(0, 4) + d.slice(5, 7) + d.slice(8, 10) + 'T' + d.slice(11, 13) + d.slice(14, 16) + (withSec ? d.slice(17, 19) + 'Z' : ''); };
  return name.replace(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})|([0-9]{8}T[0-9]{6}Z)|([0-9]{8}T[0-9]{4}(?![0-9]))|([0-9a-f]{16,})|([0-9]{4,})/g,
    (m, uuid, full, hm, hex, dec) => {
      if (uuid) return randUuid();
      if (full) return stamp(true);
      if (hm) return stamp(false);
      if (hex) return /[a-f]/.test(hex) ? randHex(hex.length) : randDigits(hex.length);
      return dec.length === 13 ? String(ms()) : randDigits(dec.length);
    });
}

function randUuid() { return [randHex(8), randHex(4), '4' + randHex(3), pick(['8', '9', 'a', 'b']) + randHex(3), randHex(12)].join('-'); }

// Sourced cases (the only non-generic cases; each names its source, opened in round 44 at
// oh-my-pi v18.12.6 = 45c35e40c46166dc726ccc52f5d27f40f2449f99). They add members OMP itself may
// create but the frozen shape does not hold, so a census built from the snapshot alone fails them.
// - packages/utils/src/sqlite.ts:193 `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}`, copied
//   for suffixes "-wal", "-shm", "-journal", "" (:12, :197-199; chmod 0o600 first), with
//   packages/ai/src/auth/sqlite-credential-store.ts:601 `{ recoverCorruption: true }` for agent.db.
// - packages/utils/src/dirs.ts:1007-1010 themes, :1012-1015 tools, :1017-1020 commands, :1022-1025
//   prompts, :1032-1035 memories (`dirs.agentSubdir(agentDir, "<name>")`: members OMP reads from the
//   agent dir; created without a mode, so 0755 under the host umask 022). `omp-crash.log` is defined
//   (:1052-1055) but no caller writes it at this commit, so it is NOT a sourced case.
const SOURCED = [
  { id: 'src:agent.db.corrupt', owner: 'agent.db', expect: 'CLEAN',
    make: () => { const stem = refill('agent.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b'); return [stem, `${stem}-wal`, `${stem}-shm`].map((name) => ({ name, kind: 'file', mode: 0o600 })); } },
  { id: 'src:themes', owner: 'agent.db', expect: 'CLEAN', make: () => [{ name: 'themes', kind: 'dir', mode: 0o755 }] },
  { id: 'src:tools', owner: 'agent.db', expect: 'CLEAN', make: () => [{ name: 'tools', kind: 'dir', mode: 0o755 }] },
  { id: 'src:commands', owner: 'agent.db', expect: 'CLEAN', make: () => [{ name: 'commands', kind: 'dir', mode: 0o755 }] },
  { id: 'src:prompts', owner: 'agent.db', expect: 'CLEAN', make: () => [{ name: 'prompts', kind: 'dir', mode: 0o755 }] },
  { id: 'src:memories', owner: 'agent.db', expect: 'CLEAN', make: () => [{ name: 'memories', kind: 'dir', mode: 0o755 }] },
];

function buildCases(live) {
  const names = new Set(live.map((e) => e.name));
  const base = live.filter((e) => !isSidecar(e.name) && !isChain(e.name));
  const sidecars = live.filter((e) => isSidecar(e.name));
  const cases = [];
  const clone = () => live.map((e) => ({ ...e }));
  const attr = () => { const e = pick(live); return { kind: e.kind, mode: e.mode }; };
  const flip = (e) => ({ kind: e.kind === 'file' ? 'dir' : 'file', mode: e.kind === 'file' ? (e.mode | 0o700) : (e.mode & 0o666) });
  const add = (id, expect, extra) => cases.push({ id, expect, entries: [...clone(), ...extra], note: extra.map((x) => `+${x.name}:${x.kind}:${x.mode.toString(8)}`).join(' ') });
  const change = (id, expect, name, to, note) => cases.push({ id, expect, entries: clone().map((e) => (e.name === name ? { name, ...to } : e)), note });
  const fresh = (make) => { let n; do { n = make(); } while (names.has(n)); return n; };
  cases.push({ id: 'control', expect: 'CLEAN', entries: clone(), note: '' });
  const EXTS = ['', '.json', '.yml', '.db', '.md', '.lock', '.log', '.txt'];
  add('stray', 'DRIFT', [{ name: fresh(() => randLetters(5 + rint(8)) + pick(EXTS)), ...attr() }]);
  add('stray-digit', 'DRIFT', [{ name: fresh(() => randLetters(4 + rint(5)) + '-' + randDigits(14)), ...attr() }]);
  for (const m of base) {
    add(`near:${m.name}`, 'DRIFT', [{ name: fresh(() => `${m.name}.${randLetters(3 + rint(4))}`), ...attr() }]);
    add(`neardigit:${m.name}`, 'DRIFT', [{ name: fresh(() => `${m.name}.${randDigits(14)}`), ...attr() }]);
    if (m.kind === 'file' || m.kind === 'dir') change(`kind:${m.name}`, 'DRIFT', m.name, flip(m), `~${m.name}:${flip(m).kind}`);
    if ((m.mode & 0o077) === 0 && (m.kind === 'file' || m.kind === 'dir')) {
      change(`mode:${m.name}`, 'DRIFT', m.name, { kind: m.kind, mode: m.mode | 0o004 }, `~${m.name}:${(m.mode | 0o004).toString(8)}`);
    }
    // swap: exchange (kind, mode) with a random base member whose (kind, mode) differs; every aggregate
    // over the entry set is unchanged, and at least one of the two gains a kind or a permission bit.
    const others = base.filter((b) => b.name !== m.name && (b.kind !== m.kind || b.mode !== m.mode));
    if (others.length) {
      const b = pick(others);
      cases.push({ id: `swap:${m.name}`, expect: 'DRIFT',
        entries: clone().map((e) => (e.name === m.name ? { name: e.name, kind: b.kind, mode: b.mode }
          : e.name === b.name ? { name: e.name, kind: m.kind, mode: m.mode } : e)),
        note: `~${m.name}<->${b.name}` });
    }
  }
  for (const s of sidecars) {
    change(`sidecarkind:${s.name}`, 'DRIFT', s.name, flip(s), `~${s.name}:${flip(s).kind}`);
    if ((s.mode & 0o077) === 0) change(`sidecarwide:${s.name}`, 'DRIFT', s.name, { kind: s.kind, mode: s.mode | 0o004 }, `~${s.name}:${(s.mode | 0o004).toString(8)}`);
  }
  const families = new Map();
  for (const e of live) {
    if (!isChain(e.name)) continue;
    const key = normalize(stripSidecar(e.name)) + (isSidecar(e.name) ? e.name.slice(-4) : '');
    if (!families.has(key)) families.set(key, e);
  }
  const ext = (n) => (n.includes('.') ? n.slice(n.lastIndexOf('.') + 1) : '');
  for (const [key, tmpl] of families) {
    add(`gen:${key}`, 'CLEAN', [{ name: fresh(() => refill(tmpl.name)), kind: tmpl.kind, mode: tmpl.mode }]);
    add(`genkind:${key}`, 'DRIFT', [{ name: fresh(() => refill(tmpl.name)), ...flip(tmpl) }]);
    if ((tmpl.mode & 0o077) === 0) add(`genwide:${key}`, 'DRIFT', [{ name: fresh(() => refill(tmpl.name)), kind: tmpl.kind, mode: tmpl.mode | 0o004 }]);
    // crossgen: the same template re-based from its owning base member onto a random other base member
    // (different extension, neither name a prefix of the other) -> DRIFT.
    const owner = base.map((e) => e.name).filter((b) => tmpl.name.startsWith(`${b}.`) || tmpl.name.startsWith(`${b}-`))
      .sort((a, b) => b.length - a.length)[0];
    const cands = owner ? base.map((e) => e.name).filter((b) => b !== owner && ext(b) !== ext(owner)
      && !b.startsWith(owner) && !owner.startsWith(b)) : [];
    if (cands.length) {
      const other = pick(cands);
      add(`crossgen:${key}`, 'DRIFT', [{ name: fresh(() => other + refill(tmpl.name).slice(owner.length)), kind: tmpl.kind, mode: tmpl.mode }]);
    }
  }
  if (sidecars.length) cases.push({ id: 'no-sidecars', expect: 'CLEAN', entries: clone().filter((e) => !isSidecar(e.name)), note: `-${sidecars.length} sidecars` });
  if (live.some((e) => isChain(e.name))) cases.push({ id: 'no-chains', expect: 'CLEAN', entries: clone().filter((e) => !isChain(e.name)), note: '-chains' });
  for (const s of SOURCED) {
    const o = base.find((e) => e.name === s.owner && e.kind === 'file');
    if (!o) continue;
    add(s.id, s.expect, s.make());
  }
  // Shuffle every case except the closing control, which always runs last.
  for (let i = cases.length - 1; i > 0; i--) { const j = rint(i + 1); [cases[i], cases[j]] = [cases[j], cases[i]]; }
  cases.push({ id: 'control-end', expect: 'CLEAN', entries: clone(), note: '' });
  return cases;
}

function buildMirror(dir, entries) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { mode: 0o755 });
  const order = entries.map((e) => e);
  for (let i = order.length - 1; i > 0; i--) { const j = rint(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
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

// MET rule: every generated case passed and the case floor is met.
function isMet(passed, total) { return passed === total && total >= CASE_FLOOR; }

function selftest(live) {
  const C = 'OMP_CENSUS: CLEAN (x)\n', D = 'OMP_CENSUS: DRIFT (x)\n';
  const rows = [
    ['p44-clean-ok', casePasses('CLEAN', 0, C), true],
    ['p44-clean-exit1', casePasses('CLEAN', 1, C), false],
    ['p44-clean-noline', casePasses('CLEAN', 0, ''), false],
    ['p44-clean-twolines', casePasses('CLEAN', 0, C + C), false],
    ['p44-clean-plus-drift', casePasses('CLEAN', 0, C + D), false],
    ['p44-clean-timeout', casePasses('CLEAN', 'timeout', C), false],
    ['p44-clean-indented', casePasses('CLEAN', 0, ' ' + C), false],
    ['p44-drift-ok', casePasses('DRIFT', 1, D), true],
    ['p44-drift-exit0', casePasses('DRIFT', 0, D), false],
    ['p44-drift-exit2', casePasses('DRIFT', 2, D), false],
    ['p44-drift-noline', casePasses('DRIFT', 1, ''), false],
    ['p44-drift-twolines', casePasses('DRIFT', 1, D + D), false],
    ['p44-drift-plus-clean', casePasses('DRIFT', 1, D + C), false],
    ['p44-met-all', isMet(120, 120), true],
    ['p44-met-one-short', isMet(119, 120), false],
    ['p44-met-floor', isMet(19, 19), false],
    ['p44-met-empty', isMet(0, 0), false],
  ];
  SEED = Buffer.from('00', 'hex'); ctr = 0; pool = Buffer.alloc(0);
  const a = JSON.stringify(buildCases(live));
  SEED = Buffer.from('00', 'hex'); ctr = 0; pool = Buffer.alloc(0);
  const b = JSON.stringify(buildCases(live));
  rows.push(['p44-replay-same-seed', a === b, true]);
  SEED = Buffer.from('01', 'hex'); ctr = 0; pool = Buffer.alloc(0);
  const c = buildCases(live);
  rows.push(['p44-other-seed-differs', JSON.stringify(c) !== a, true]);
  rows.push(['p44-ids-unique', new Set(c.map((x) => x.id)).size === c.length, true]);
  rows.push(['p44-floor-met', c.length >= CASE_FLOOR, true]);
  let ok = 0;
  for (const [id, got, want] of rows) { const p = got === want; if (p) ok++; console.log(`${p ? 'PASS' : 'FAIL'} ${id} got=${got} want=${want}`); }
  console.log(`P44_SELFTEST: ${ok}/${rows.length}`);
  console.log(`VERDICT: ${ok === rows.length ? 'PASS' : 'FAIL'}`);
  process.exit(ok === rows.length ? 0 : 1);
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
if (opts.selftest) selftest(live);
const seedHex = opts.seed || randomBytes(16).toString('hex');
if (!/^[0-9a-f]{2,64}$/.test(seedHex) || seedHex.length % 2) die('--seed must be an even-length lowercase hex string');
SEED = Buffer.from(seedHex, 'hex'); ctr = 0; pool = Buffer.alloc(0);
const cases = buildCases(live);
const selfSha = sha256(readFileSync(SELF));
const censusPath = resolve(opts.census);
const censusPresent = existsSync(censusPath) && lstatSync(censusPath).isFile();
const censusSha = censusPresent ? sha256(readFileSync(censusPath)) : 'absent';

console.log(`P44 counter=p44c-count.mjs sha256=${selfSha} seed=${seedHex}`);
console.log(`P44 census=${censusPath} sha256=${censusSha}`);
console.log(`P44 ${seedLabel} entries=${live.length} base=${live.filter((e) => !isSidecar(e.name) && !isChain(e.name)).length} sidecar=${live.filter((e) => isSidecar(e.name)).length} chain=${live.filter((e) => !isSidecar(e.name) && isChain(e.name)).length} cases=${cases.length}`);

if (opts.list) {
  for (const c of cases) console.log(`CASE ${c.id} expect=${c.expect} entries=${c.entries.length} ${c.note}`);
  process.exit(0);
}

if (spawnSync('bwrap', ['--version'], { encoding: 'utf8' }).status !== 0) die('bwrap not runnable');

mkdirSync(opts.work, { recursive: true, mode: 0o700 });
const work = join(opts.work, `run-${process.pid}-${randomBytes(4).toString('hex')}`);
mkdirSync(join(work, 'c'), { recursive: true, mode: 0o700 });
if (censusPresent) { copyFileSync(censusPath, join(work, 'c', 'omp-census.mjs')); chmodSync(join(work, 'c', 'omp-census.mjs'), 0o444); }

let passed = 0;
try {
  for (const c of cases) {
    const r = runCase(work, c.entries, censusPresent);
    const ok = censusPresent && casePasses(c.expect, r.status, r.stdout);
    if (ok) passed++;
    console.log(`CASE ${c.id} expect=${c.expect} exit=${r.status} verdict=${verdictToken(r.stdout)} P44=${ok ? 'PASS' : 'FAIL'} ${c.note}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
const met = isMet(passed, cases.length);
console.log(`P44_COUNT: ${met ? 'MET' : 'UNMET'} (passed=${passed} cases=${cases.length} floor=${CASE_FLOOR} census_sha256=${censusSha})`);
process.exit(met ? 0 : 1);
