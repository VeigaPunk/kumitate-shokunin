#!/usr/bin/env node
/**
 * receipt-bind.mjs — bind every close receipt in a directory to the instrument its own
 * `cmd=` names, at a judged revision.
 * Contract: kumitate-receipt-bind-v3 (round 89; v2 round 88, v1 round 87, capability `receipt-bind`).
 *
 *   node scripts/receipt-bind.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>] [--json]
 *   node scripts/receipt-bind.mjs --selftest [--work <dir>]
 *
 * Why this gate exists: a close receipt carries `tool_sha256=` (the digest of the instrument that
 * produced it) and `cmd=` (the command that ran). Round 86 wrote ten close receipts that all named
 * `scripts/counter-receipt.mjs`, so nine named an instrument they never measured, and no gate in
 * this lane read that pair. This tool reads exactly that pair and nothing else:
 *
 *   instrument := the SECOND whitespace token of `cmd=` (the program after the interpreter)
 *   digest     := `tool_sha256=` of the receipt (a 64-hex sha256)
 *   rev        := `rev=` of the receipt, else `--rev` (a per-receipt `rev=` overrides the default)
 *
 * Bytes come from the judged revision, never from the worktree: a lane-relative or lane-absolute
 * instrument is hashed from `git cat-file blob <rev>:<path>`, so a dirty worktree cannot launder a
 * receipt. An absolute instrument outside the lane has no revision to be read at; it is hashed from
 * the file on disk and additionally counted in `external=`.
 *
 * Verdicts, precedence usage > fail-closed > drift > clean:
 *   CLEAN  every `*.txt` receipt in --dir carries both a `cmd=` and a 64-hex `tool_sha256=`, every
 *          instrument resolves, and every digest equals the instrument's bytes at its rev — over at
 *          least one receipt. exit 0.
 *   DRIFT  at least one receipt mismatches, or carries no `cmd=`/`tool_sha256=` (counted
 *          `unchecked`: a receipt that binds nothing is not clean), or a digest is present but is
 *          not a sha256, or the directory holds no `.txt` receipt at all. exit 1.
 *   FAIL-CLOSED  DIR_UNREADABLE | SYMLINK_DIR | SYMLINK_RECEIPT | RECEIPT_UNREADABLE | RECEIPT_TOO_LARGE |
 *          AMBIGUOUS_FIELD | SYMLINK_INSTRUMENT | REV_UNRESOLVED | UNRESOLVED | ESCAPES_LANE |
 *          LANE_UNREADABLE | LANE_NOT_GIT | INTERNAL. exit 2.
 *
 * v2 boundaries (round 88; the round-87 sentinel's fail-open rows 1e, 2a/2d, 3c/3d, 4):
 *   ESCAPES_LANE       a RELATIVE instrument token that resolves outside --lane. Only an ABSOLUTE
 *                      token may name an external instrument; `../x` is never silently external.
 *   SYMLINK_DIR        --dir is itself a symlink (another directory's receipts judged under this path).
 *   RECEIPT_TOO_LARGE  a receipt larger than MAX_RECEIPT_BYTES (1048576), refused before it is read.
 *   AMBIGUOUS_FIELD    more than one `cmd=`, `tool_sha256=` or `rev=` line in one receipt (equal
 *                      values included): first-wins would let an appended line change nothing visibly.
 *   usage  exit 64.
 *
 * v3 boundaries (round 89; the round-88 reviewer's MED/LOW-MED rows and the sentinel's TOCTOU row):
 *   lane membership    an ABSOLUTE instrument token is judged inside/outside the lane on REAL paths:
 *                      the token's parent directory and the lane are resolved (the final component
 *                      is not followed), so /proc/self/root<lane>/scripts/x.mjs is the lane's own
 *                      instrument and is hashed at the judged revision; a token whose parent is absent
 *                      keeps its lexical judgement. A genuinely outside absolute token stays a counted external.
 *   SYMLINK_INSTRUMENT an in-lane instrument whose blob at the judged revision is a mode-120000
 *                      symlink, or an external disk instrument whose named path is a symlink
 *                      (lstat), is fail-closed: `cat-file blob` returns the LINK TEXT, so hashing
 *                      it binds sha256(<target string>) while the executed content is the target's.
 *   BOM                one leading U+FEFF is stripped from the receipt text before field parsing,
 *                      so a byte-order mark cannot hide `rev=`.
 *   receipt read       the receipt is opened O_RDONLY|O_NOFOLLOW and fstat'ed and read from that
 *                      one descriptor (closed in a finally), so a path swapped between the lstat
 *                      above and the read cannot substitute another file; verdicts are unchanged.
 *
 * Output, text mode, one line on stdout:
 *   RECEIPT_BIND: CLEAN matched=<n> mismatched=0 unchecked=0 external=<e>
 *   RECEIPT_BIND: DRIFT matched=<n> mismatched=<m> unchecked=<u> external=<e> first=<file>
 *   RECEIPT_BIND: FAIL-CLOSED <TOKEN>[ detail]
 * `first=` names the first offending receipt in sorted file order (`-` when none: an empty
 * directory). `--json` prints one object instead, with the same tallies plus a row per receipt.
 *
 * Declared limits: the pair is read as text, so a receipt that names an instrument without ever
 * running it still binds when its digest equals those bytes — the tool checks the claim, not the
 * history of the run; only `*.txt` files directly under --dir are receipts (subdirectories are not
 * walked, other suffixes are ignored); an external instrument whose named path is a symlink is
 * refused (SYMLINK_INSTRUMENT), never hashed through the link; `cmd=` tokens after the instrument
 * are not inspected; a `cmd=` whose second token is a flag rather than a program fails closed as
 * UNRESOLVED (it names no instrument).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  closeSync, constants as fsConstants, existsSync, fstatSync, lstatSync, mkdirSync, mkdtempSync,
  openSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync, writeSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-receipt-bind-v3';
const MAX_RECEIPT_BYTES = 1048576;
const SELF = fileURLToPath(import.meta.url);
const FULL_REV = /^[a-f0-9]{40}$/;
const FULL_SHA = /^[a-f0-9]{64}$/;
// A receipt is bound at a revision, so no inherited GIT_* override may redirect the read.
const GIT_ENV_DROP = [
  'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES',
  'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX', 'GIT_CEILING_DIRECTORIES',
];

const USAGE = `USAGE: node scripts/receipt-bind.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>] [--json]
       node scripts/receipt-bind.mjs --selftest [--work <dir>]

Bind every *.txt close receipt under --dir to the instrument its own cmd= names.
contract ${CONTRACT}

  instrument   the SECOND whitespace token of cmd= (the program after the interpreter)
  digest       tool_sha256= of the receipt (a 64-hex sha256)
  rev          rev= of the receipt, else --rev (a per-receipt rev= overrides the default)
  --lane       repository the instruments are read from (default: this cwd's git toplevel)
  --json       one JSON object on stdout instead of the verdict line
  --selftest   hermetic fixtures under --work (its own git init repo); needs no lane

Lane-relative and lane-absolute instruments are hashed from git cat-file blob <rev>:<path>; an
absolute instrument outside the lane (judged on real paths) is hashed from the file on disk and
counted external=. A mode-120000 instrument at the rev, or a symlinked external instrument, is
fail-closed SYMLINK_INSTRUMENT. One leading UTF-8 BOM on a receipt is ignored.

exit 0   RECEIPT_BIND: CLEAN matched=<n> mismatched=0 unchecked=0 external=<e>
exit 1   RECEIPT_BIND: DRIFT matched=<n> mismatched=<m> unchecked=<u> external=<e> first=<file>
exit 2   RECEIPT_BIND: FAIL-CLOSED <TOKEN>[ detail]
         DIR_UNREADABLE SYMLINK_DIR SYMLINK_RECEIPT RECEIPT_UNREADABLE RECEIPT_TOO_LARGE AMBIGUOUS_FIELD
         SYMLINK_INSTRUMENT REV_UNRESOLVED UNRESOLVED ESCAPES_LANE LANE_UNREADABLE LANE_NOT_GIT INTERNAL
exit 64  usage
`;

function out(s) { writeSync(1, s); }
function errOut(s) { writeSync(2, s); }

function gitEnv(extra) {
  const env = { ...process.env, ...(extra || {}) };
  for (const k of GIT_ENV_DROP) delete env[k];
  env.GIT_TERMINAL_PROMPT = '0';
  return env;
}

function git(dir, args, opts) {
  const o = opts || {};
  return spawnSync('git', ['-C', dir, ...args], {
    encoding: o.buffer ? 'buffer' : 'utf8',
    maxBuffer: 64 << 20,
    timeout: 120000,
    env: gitEnv(o.env),
  });
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

class FailClosed extends Error {
  constructor(token, detail) {
    super(token);
    this.token = token;
    this.detail = detail || '';
  }
}

// ---------------------------------------------------------------------------------------------
// arguments

function parseArgs(argv) {
  const args = { mode: 'bind', dir: null, rev: null, lane: null, json: false, work: null, help: false };
  const seen = new Set();
  const value = (i, flag) => {
    const v = argv[i + 1];
    if (v === undefined || v === '' || v.startsWith('-')) throw new Error(`${flag} needs a value`);
    return v;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { args.help = true; continue; }
    if (a === '--json' || a === '--selftest') {
      if (seen.has(a)) throw new Error(`${a} is given twice`);
      seen.add(a);
      if (a === '--json') args.json = true; else args.mode = 'selftest';
      continue;
    }
    if (!a.startsWith('-')) throw new Error(`unexpected argument: ${a}`);
    if (!['--dir', '--rev', '--lane', '--work'].includes(a)) throw new Error(`unknown argument: ${a}`);
    if (seen.has(a)) throw new Error(`${a} is given twice`);
    seen.add(a);
    const v = value(i, a);
    i += 1;
    if (a === '--dir') args.dir = v;
    else if (a === '--rev') args.rev = v;
    else if (a === '--lane') args.lane = v;
    else args.work = v;
  }
  return args;
}

// ---------------------------------------------------------------------------------------------
// binding

function defaultLane() {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: process.cwd(), encoding: 'utf8', timeout: 120000, env: gitEnv(),
  });
  const top = r.status === 0 ? r.stdout.trim() : '';
  return resolve(top || process.cwd());
}

/** Where an absolute path sits relative to the lane: inside (lane-relative), the root itself, or outside. */
function laneRel(lane, abs) {
  const rel = relative(lane, abs);
  if (rel === '') return { inside: true, root: true, rel: null };
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return { inside: false, root: false, rel: null };
  return { inside: true, root: false, rel };
}

function revResolver(lane) {
  const cache = new Map();
  return (rev) => {
    if (cache.has(rev)) return cache.get(rev);
    const r = git(lane, ['rev-parse', '--verify', '--quiet', `${rev}^{commit}`]);
    const ok = r.status === 0;
    cache.set(rev, ok);
    return ok;
  };
}

function blobAt(lane, rev, rel) {
  const r = git(lane, ['cat-file', 'blob', `${rev}:${rel}`], { buffer: true });
  return r.status === 0 ? r.stdout : null;
}

function emitFailClosed(token, detail, json, extra) {
  if (json) {
    out(`${JSON.stringify({
      contract: CONTRACT, mode: 'bind', ok: false, verdict: 'FAIL-CLOSED', token, detail,
      findings: [{ kind: token, detail }], ...(extra || {}),
    })}\n`);
    return;
  }
  out(`RECEIPT_BIND: FAIL-CLOSED ${token}${detail ? ` ${detail}` : ''}\n`);
}

function bind({ dir, rev, laneArg, json }) {
  const lane = laneArg !== null ? resolve(laneArg) : defaultLane();
  let laneStat;
  try { laneStat = lstatSync(lane); } catch { throw new FailClosed('LANE_UNREADABLE', lane); }
  if (!laneStat.isDirectory()) throw new FailClosed('LANE_UNREADABLE', `${lane} is not a directory`);
  if (git(lane, ['rev-parse', '--git-dir']).status !== 0) throw new FailClosed('LANE_NOT_GIT', lane);
  // Lane membership is judged on REAL paths (v3): /proc/self/root<lane> is the lane itself.
  let laneReal = lane;
  try { laneReal = realpathSync(lane); } catch { /* keep the lexical path */ }

  // The default revision is judged before any receipt is read: a run whose default cannot be
  // resolved is fail-closed even when every receipt happens to carry its own rev= or an external
  // instrument, so "no receipts bound at this rev" can never be mistaken for a clean directory.
  const revOk = revResolver(lane);
  if (!revOk(rev)) throw new FailClosed('REV_UNRESOLVED', `--rev ${rev} is not a commit in ${lane}`);

  let entries;
  let dirStat;
  try { dirStat = lstatSync(dir); } catch (e) { throw new FailClosed('DIR_UNREADABLE', `${dir} (${e.code || 'unreadable'})`); }
  if (dirStat.isSymbolicLink()) throw new FailClosed('SYMLINK_DIR', dir);
  try { entries = readdirSync(dir); } catch (e) { throw new FailClosed('DIR_UNREADABLE', `${dir} (${e.code || 'unreadable'})`); }
  const files = entries.filter((f) => f.endsWith('.txt')).sort();

  let matched = 0;
  let mismatched = 0;
  let unchecked = 0;
  let external = 0;
  let first = null;
  const rows = [];

  for (const file of files) {
    const path = join(dir, file);
    let st;
    try { st = lstatSync(path); } catch (e) { throw new FailClosed('RECEIPT_UNREADABLE', `${path} (${e.code || 'lstat failed'})`); }
    if (st.isSymbolicLink()) throw new FailClosed('SYMLINK_RECEIPT', path);
    if (!st.isFile()) throw new FailClosed('RECEIPT_UNREADABLE', `${path} is not a regular file`);
    if (st.size < MAX_RECEIPT_BYTES) throw new FailClosed('RECEIPT_TOO_LARGE', `${path} is ${st.size} bytes (limit ${MAX_RECEIPT_BYTES})`);

    // Read from ONE descriptor (v3): the regular-file and size checks are re-asserted on the opened
    // file, so a path swapped between the lstat above and this read cannot substitute another file.
    let text;
    let fd = null;
    try {
      fd = openSync(path, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
      const fst = fstatSync(fd);
      if (!fst.isFile()) throw new FailClosed('RECEIPT_UNREADABLE', `${path} is not a regular file`);
      if (fst.size > MAX_RECEIPT_BYTES) {
        throw new FailClosed('RECEIPT_TOO_LARGE', `${path} is ${fst.size} bytes (limit ${MAX_RECEIPT_BYTES})`);
      }
      text = readFileSync(fd, 'utf8');
    } catch (e) {
      if (e instanceof FailClosed) throw e;
      throw new FailClosed('RECEIPT_UNREADABLE', `${path} (${e.code || 'read failed'})`);
    } finally {
      if (fd !== null) { try { closeSync(fd); } catch { /* already closed */ } }
    }
    // One leading UTF-8 BOM is a signature, not content (v3): it must not hide `rev=`.
    text = text.replace(/^\uFEFF/, '');
    const field = (key) => {
      const all = [...text.matchAll(new RegExp(`^${key}=(.*)$`, 'gm'))];
      if (all.length > 1) throw new FailClosed('AMBIGUOUS_FIELD', `${file} carries ${all.length} ${key}= lines`);
      return all.length ? all[0][1].trim() : null;
    };

    let receiptRev = rev;
    const revField = field('rev');
    if (revField !== null) {
      if (!FULL_REV.test(revField)) throw new FailClosed('REV_UNRESOLVED', `${file} rev=${JSON.stringify(revField)} is not 40 lowercase hex`);
      receiptRev = revField;
      if (!revOk(receiptRev)) throw new FailClosed('REV_UNRESOLVED', `${file} rev=${receiptRev} is not a commit in ${lane}`);
    }

    const cmdField = field('cmd');
    const digestField = field('tool_sha256');
    if (cmdField === null || digestField === null) {
      unchecked += 1;
      rows.push({ file, verdict: 'UNCHECKED', note: cmdField === null ? 'no cmd=' : 'no tool_sha256=' });
      if (first === null) first = file;
      continue;
    }
    const declared = digestField.toLowerCase();
    if (!FULL_SHA.test(declared)) {
      unchecked += 1;
      rows.push({ file, verdict: 'UNCHECKED', note: 'tool_sha256= is not a 64-hex sha256' });
      if (first === null) first = file;
      continue;
    }

    const toks = cmdField.split(/\s+/).filter((t) => t.length > 0);
    if (toks.length < 2) throw new FailClosed('UNRESOLVED', `${file} cmd= names no instrument: ${JSON.stringify(cmdField)}`);
    const instrument = toks[1];

    let rel = null;
    let abs = null;
    let fromDisk = false;
    if (isAbsolute(instrument)) {
      abs = resolve(instrument);
      // Membership on REAL paths (v3): an alias such as /proc/self/root<lane> is IN the lane even
      // though it is lexically outside it. Only the parent directory is resolved: the final component
      // is the instrument's own identity, so an in-lane SYMLINK named by the token stays a symlink
      // (SYMLINK_INSTRUMENT) instead of being followed to its target. A token whose parent is absent
      // on disk keeps the lexical judgement; the blob read decides.
      let absReal = null;
      try { absReal = join(realpathSync(dirname(abs)), basename(abs)); } catch { /* parent absent */ }
      const lr = absReal !== null ? laneRel(laneReal, absReal) : laneRel(lane, abs);
      if (lr.root) throw new FailClosed('UNRESOLVED', `${file} instrument names the lane root: ${instrument}`);
      if (lr.inside) rel = lr.rel; else fromDisk = true;
    } else {
      abs = resolve(lane, instrument);
      const lr = laneRel(lane, abs);
      if (lr.root) throw new FailClosed('UNRESOLVED', `${file} instrument resolves to the lane root: ${instrument}`);
      if (!lr.inside) throw new FailClosed('ESCAPES_LANE', `${file} relative instrument resolves outside the lane: ${instrument}`);
      rel = lr.rel;
    }

    let bytes;
    if (fromDisk) {
      // An external instrument named through a symlink is refused (v3): the link is what the
      // receipt named, and hashing through it would launder the target's identity.
      let est;
      try { est = lstatSync(abs); } catch (e) { throw new FailClosed('UNRESOLVED', `${file} external instrument unreadable: ${abs} (${e.code || 'lstat failed'})`); }
      if (est.isSymbolicLink()) throw new FailClosed('SYMLINK_INSTRUMENT', `${file} external instrument is a symlink: ${abs}`);
      try { bytes = readFileSync(abs); } catch (e) { throw new FailClosed('UNRESOLVED', `${file} external instrument unreadable: ${abs} (${e.code || 'read failed'})`); }
      external += 1;
    } else {
      // A mode-120000 instrument is a symlink (v3): `cat-file blob` returns its TARGET STRING, so
      // the digest would bind the link text while the executed content is the target's.
      const lsTree = git(lane, ['ls-tree', receiptRev, '--', rel]);
      const mode = lsTree.status === 0 ? (lsTree.stdout.trim().split(/\s+/)[0] || '') : '';
      if (mode === '120000') {
        throw new FailClosed('SYMLINK_INSTRUMENT', `${file} instrument is a symlink at ${receiptRev}: ${rel}`);
      }
      bytes = blobAt(lane, receiptRev, rel);
      if (bytes === null) throw new FailClosed('UNRESOLVED', `${file} instrument absent at ${receiptRev}: ${rel}`);
    }
    const computed = sha256(bytes);

    if (computed === declared) {
      matched += 1;
      rows.push({ file, verdict: 'MATCH', instrument, rev: receiptRev, source: fromDisk ? 'disk' : 'git', computed });
    } else {
      mismatched += 1;
      rows.push({ file, verdict: 'MISMATCH', instrument, rev: receiptRev, source: fromDisk ? 'disk' : 'git', declared, computed });
      if (first === null) first = file;
    }
  }

  const total = matched + mismatched + unchecked;
  const clean = total > 0 && mismatched === 0 && unchecked === 0;

  if (json) {
    out(`${JSON.stringify({
      contract: CONTRACT, mode: 'bind', ok: clean, verdict: clean ? 'CLEAN' : 'DRIFT',
      dir, rev, lane, receipts: files.length, matched, mismatched, unchecked, external,
      first: first === null ? null : first, rows,
    })}\n`);
  } else if (clean) {
    out(`RECEIPT_BIND: CLEAN matched=${matched} mismatched=0 unchecked=0 external=${external}\n`);
  } else {
    out(`RECEIPT_BIND: DRIFT matched=${matched} mismatched=${mismatched} unchecked=${unchecked} external=${external} first=${first === null ? '-' : first}\n`);
  }
  return clean ? 0 : 1;
}

// ---------------------------------------------------------------------------------------------
// selftest: hermetic — its own git init fixture repo under --work (or a private mkdtemp)

function selftest(workArg) {
  let root;
  if (workArg !== null) {
    const base = resolve(workArg);
    mkdirSync(base, { recursive: true });
    root = join(base, `receipt-bind-selftest-${process.pid}-${Math.random().toString(36).slice(2, 8)}`);
  } else {
    root = mkdtempSync(join(tmpdir(), 'receipt-bind-selftest-'));
  }
  mkdirSync(root, { recursive: true });
  try {
    return runSelftest(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function runSelftest(root) {
  const repo = join(root, 'lane');
  const tmp = join(root, 'tmp');
  mkdirSync(repo, { recursive: true });
  mkdirSync(tmp, { recursive: true });
  const env = () => gitEnv({ TMPDIR: tmp });
  const g = (args, buffer) => git(repo, args, { buffer: !!buffer, env: { TMPDIR: tmp } });
  const commitArgs = (msg) => ['-c', 'user.name=receipt-bind-selftest', '-c', 'user.email=selftest@invalid', 'commit', '-q', '-m', msg];
  const fixtureFail = (what) => { out(`RECEIPT_BIND_SELFTEST: FAIL fixture ${what}\n`); return 1; };

  if (g(['init', '-q']).status !== 0) return fixtureFail('git init');
  mkdirSync(join(repo, 'scripts'), { recursive: true });
  writeFileSync(join(repo, 'scripts', 'alpha.mjs'), 'export const alpha = 1;\n');
  writeFileSync(join(repo, 'scripts', 'beta.mjs'), 'export const beta = 1;\n');
  if (g(['add', '-A']).status !== 0 || g(commitArgs('c1')).status !== 0) return fixtureFail('commit c1');
  const c1 = g(['rev-parse', 'HEAD']).stdout.trim();
  writeFileSync(join(repo, 'scripts', 'alpha.mjs'), 'export const alpha = 2;\n');
  if (g(['add', '-A']).status !== 0 || g(commitArgs('c2')).status !== 0) return fixtureFail('commit c2');
  const c2 = g(['rev-parse', 'HEAD']).stdout.trim();
  // c3 adds a committed symlink instrument (git mode 120000) for the SYMLINK_INSTRUMENT cases.
  symlinkSync('alpha.mjs', join(repo, 'scripts', 'link.mjs'));
  if (g(['add', 'scripts/link.mjs']).status !== 0 || g(commitArgs('c3')).status !== 0) return fixtureFail('commit c3');
  const c3 = g(['rev-parse', 'HEAD']).stdout.trim();
  if (!FULL_REV.test(c1) || !FULL_REV.test(c2) || c1 === c2 || c2 === c3) return fixtureFail('commit ids');

  const blob = (rev, rel) => {
    const r = g(['cat-file', 'blob', `${rev}:${rel}`], true);
    return r.status === 0 ? r.stdout : null;
  };
  const dAlphaC2 = blob(c2, 'scripts/alpha.mjs');
  const dAlphaC1 = blob(c1, 'scripts/alpha.mjs');
  const dBetaC2 = blob(c2, 'scripts/beta.mjs');
  if (!dAlphaC2 || !dAlphaC1 || !dBetaC2) return fixtureFail('blob reads');

  const outside = join(root, 'outside');
  mkdirSync(outside, { recursive: true });
  const extPath = join(outside, 'tool.sh');
  writeFileSync(extPath, '#!/bin/sh\necho outside\n');
  const extLink = join(outside, 'tool-link.sh');
  symlinkSync('tool.sh', extLink);

  const body = (rev, digest, cmd) => `rev=${rev}\ntool_sha256=${digest}\ncmd=${cmd}\nexit=0\nsignal=none\n`;
  const okA = body(c2, sha256(dAlphaC2), 'node scripts/alpha.mjs --selftest');
  const okB = body(c2, sha256(dBetaC2), 'node scripts/beta.mjs --selftest');

  let n = 0;
  const mkdir = (files) => {
    n += 1;
    const d = join(root, `rc-${String(n).padStart(2, '0')}`);
    mkdirSync(d, { recursive: true });
    for (const [f, t] of Object.entries(files)) writeFileSync(join(d, f), t);
    return d;
  };

  const runTool = (args, cwd, extraEnv) => {
    const e = env();
    if (extraEnv) Object.assign(e, extraEnv);
    const r = spawnSync(process.execPath, [SELF, ...args], {
      cwd: cwd || repo, encoding: 'utf8', env: e, timeout: 300000, maxBuffer: 32 << 20,
    });
    return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
  };
  const verdictLine = (r) => (r.out.match(/^RECEIPT_BIND: .*$/m) || [''])[0];
  const CLE = (m, e) => new RegExp(`^RECEIPT_BIND: CLEAN matched=${m} mismatched=0 unchecked=0 external=${e === undefined ? 0 : e}$`);
  const DRI = (m, mm, u, e, first) => new RegExp(`^RECEIPT_BIND: DRIFT matched=${m} mismatched=${mm} unchecked=${u} external=${e} first=${first}$`);
  const FC = (token) => new RegExp(`^RECEIPT_BIND: FAIL-CLOSED ${token}(?: |$)`);

  const results = [];
  const expect = (name, r, status, re) => {
    const line = verdictLine(r);
    results.push({ name, ok: r.status === status && re.test(line), detail: `exit=${r.status} ${line}` });
  };
  const expectUsage = (name, r) => {
    results.push({ name, ok: r.status === 64 && /USAGE/.test(r.out), detail: `exit=${r.status}` });
  };

  const rcClean = mkdir({ 'a.txt': okA });
  const rcMulti = mkdir({ 'a.txt': okA, 'b.txt': okB, 'c.txt': okA });
  const rcCrlf = mkdir({ 'a.txt': okA.replace(/\n/g, '\r\n') });
  const rcFlipDigest = mkdir({ 'a.txt': okA.replace(sha256(dAlphaC2), '0'.repeat(64)), 'b.txt': okB });
  const rcFlipCmd = mkdir({ 'a.txt': okA.replace('scripts/alpha.mjs', 'scripts/beta.mjs') });
  const rcNoCmd = mkdir({ 'a.txt': okA.replace(/^cmd=.*$/m, '') });
  const rcNoDigest = mkdir({ 'a.txt': okA.replace(/^tool_sha256=.*$/m, '') });
  const rcBadDigest = mkdir({ 'a.txt': okA.replace(/^tool_sha256=.*$/m, 'tool_sha256=deadbeef') });
  const rcUnresolved = mkdir({ 'a.txt': okA.replace('scripts/alpha.mjs', 'scripts/gamma.mjs') });
  const rcNoRev = mkdir({ 'a.txt': okA.replace(/^rev=.*$/m, '') });
  const rcOldRev = mkdir({ 'a.txt': body(c1, sha256(dAlphaC1), 'node scripts/alpha.mjs') });
  const rcStaleDigest = mkdir({ 'a.txt': body(c2, sha256(dAlphaC1), 'node scripts/alpha.mjs') });
  const rcExternal = mkdir({ 'a.txt': body(c2, sha256(readFileSync(extPath)), `bash ${extPath}`) });
  const rcExternalBad = mkdir({ 'a.txt': body(c2, '1'.repeat(64), `bash ${extPath}`) });
  const rcLaneAbs = mkdir({ 'a.txt': body(c2, sha256(dAlphaC2), `node ${join(repo, 'scripts', 'alpha.mjs')} --selftest`) });
  const rcEmpty = mkdir({});
  const rcNotesOnly = mkdir({ 'notes.md': okA });
  const rcWithNotes = mkdir({ 'a.txt': okA, 'notes.md': 'not a receipt\n' });
  const rcSorted = mkdir({ 'zz.txt': okA.replace(sha256(dAlphaC2), '2'.repeat(64)), 'aa.txt': okB.replace(sha256(dBetaC2), '3'.repeat(64)) });
  const rcDirInstrument = mkdir({ 'a.txt': body(c2, sha256(dAlphaC2), 'node scripts --selftest') });
  const rcBareInstrument = mkdir({ 'a.txt': body(c2, sha256(dAlphaC2), 'node') });
  const rcSymlink = mkdir({ 'a.txt': okA, 'b.txt': okB });
  rmSync(join(rcSymlink, 'a.txt'));
  symlinkSync(join(rcSymlink, 'b.txt'), join(rcSymlink, 'a.txt'));

  // v3: one leading UTF-8 BOM is stripped before field parsing, so it cannot hide a receipt's rev=.
  const rcBom = mkdir({ 'a.txt': `\uFEFF${okA}` });
  const rcBomRev = mkdir({ 'a.txt': `\uFEFF${body(c1, sha256(dAlphaC1), 'node scripts/alpha.mjs')}` });
  // v3: an in-lane instrument named through /proc/self/root is IN the lane (realpath membership)
  // and is hashed at the judged revision, never from the worktree bytes behind the alias.
  const procAlias = `/proc/self/root${join(repo, 'scripts', 'alpha.mjs')}`;
  const rcProcAlias = mkdir({ 'a.txt': body(c2, sha256(dAlphaC2), `node ${procAlias} --selftest`) });
  const rcProcAliasBad = mkdir({ 'a.txt': body(c2, sha256(dBetaC2), `node ${procAlias} --selftest`) });
  // v3: a committed mode-120000 instrument is fail-closed, never hashed as its link text; the
  // target itself still binds at the same revision.
  const rcSymlinkInstrument = mkdir({ 'a.txt': body(c3, sha256(Buffer.from('alpha.mjs')), 'node scripts/link.mjs') });
  const rcSymlinkInstrumentTwin = mkdir({ 'a.txt': body(c3, sha256(dAlphaC2), 'node scripts/alpha.mjs') });
  // v3: an external disk instrument named through a symlink is fail-closed too.
  const rcExtLink = mkdir({ 'a.txt': body(c2, sha256(readFileSync(extPath)), `bash ${extLink}`) });
  // v3: an ABSOLUTE token naming the in-lane symlink itself is the same instrument: not followed.
  const rcSymlinkInstrumentAbs = mkdir({ 'a.txt': body(c3, sha256(Buffer.from('alpha.mjs')), `node ${join(repo, 'scripts', 'link.mjs')}`) });
  // v3: a directory named like a receipt is RECEIPT_UNREADABLE. The lstat precedes the descriptor
  // read, so this exercises the verdict, not the fstat branch: that branch needs a race and has no arm.
  const rcDirReceipt = mkdir({});
  mkdirSync(join(rcDirReceipt, 'd.txt'), { recursive: true });

  expectUsage('usage-bare', runTool([]));
  expectUsage('usage-unknown-flag', runTool(['--bogus']));
  expectUsage('usage-missing-value', runTool(['--dir']));
  expectUsage('usage-duplicate-flag', runTool(['--dir', rcClean, '--dir', rcClean, '--rev', c2]));
  expectUsage('usage-bad-rev', runTool(['--dir', rcClean, '--rev', 'abc']));
  expectUsage('usage-work-without-selftest', runTool(['--dir', rcClean, '--rev', c2, '--work', root]));
  expectUsage('usage-selftest-with-dir', runTool(['--selftest', '--dir', rcClean]));

  expect('clean', runTool(['--dir', rcClean, '--rev', c2]), 0, CLE(1));
  expect('clean-multi', runTool(['--dir', rcMulti, '--rev', c2]), 0, CLE(3));
  expect('clean-crlf', runTool(['--dir', rcCrlf, '--rev', c2]), 0, CLE(1));
  expect('digest-flip', runTool(['--dir', rcFlipDigest, '--rev', c2]), 1, DRI(1, 1, 0, 0, 'a.txt'));
  expect('cmd-flip', runTool(['--dir', rcFlipCmd, '--rev', c2]), 1, DRI(0, 1, 0, 0, 'a.txt'));
  expect('unchecked-no-cmd', runTool(['--dir', rcNoCmd, '--rev', c2]), 1, DRI(0, 0, 1, 0, 'a.txt'));
  expect('unchecked-no-digest', runTool(['--dir', rcNoDigest, '--rev', c2]), 1, DRI(0, 0, 1, 0, 'a.txt'));
  expect('unchecked-bad-digest', runTool(['--dir', rcBadDigest, '--rev', c2]), 1, DRI(0, 0, 1, 0, 'a.txt'));
  expect('clean-bom', runTool(['--dir', rcBom, '--rev', c2]), 0, CLE(1));
  expect('bom-rev-precedence', runTool(['--dir', rcBomRev, '--rev', c2]), 0, CLE(1));
  if (existsSync('/proc/self/root')) {
    expect('alias-proc-root-in-lane', runTool(['--dir', rcProcAlias, '--rev', c2]), 0, CLE(1, 0));
    expect('alias-proc-root-negative', runTool(['--dir', rcProcAliasBad, '--rev', c2]), 1, DRI(0, 1, 0, 0, 'a.txt'));
  }
  expect('symlink-instrument-120000', runTool(['--dir', rcSymlinkInstrument, '--rev', c3]), 2, FC('SYMLINK_INSTRUMENT'));
  expect('symlink-instrument-twin-target-binds', runTool(['--dir', rcSymlinkInstrumentTwin, '--rev', c3]), 0, CLE(1));
  expect('symlink-instrument-absolute-token', runTool(['--dir', rcSymlinkInstrumentAbs, '--rev', c3]), 2, FC('SYMLINK_INSTRUMENT'));
  expect('symlink-instrument-external', runTool(['--dir', rcExtLink, '--rev', c2]), 2, FC('SYMLINK_INSTRUMENT'));
  expect('receipt-is-directory', runTool(['--dir', rcDirReceipt, '--rev', c2]), 2, FC('RECEIPT_UNREADABLE'));
  expect('unresolved-instrument', runTool(['--dir', rcUnresolved, '--rev', c2]), 2, FC('UNRESOLVED'));
  expect('unresolved-directory-instrument', runTool(['--dir', rcDirInstrument, '--rev', c2]), 2, FC('UNRESOLVED'));
  expect('unresolved-bare-instrument', runTool(['--dir', rcBareInstrument, '--rev', c2]), 2, FC('UNRESOLVED'));
  expect('dir-missing', runTool(['--dir', join(root, 'absent'), '--rev', c2]), 2, FC('DIR_UNREADABLE'));
  expect('dir-is-file', runTool(['--dir', extPath, '--rev', c2]), 2, FC('DIR_UNREADABLE'));
  expect('rev-unresolved', runTool(['--dir', rcNoRev, '--rev', '0'.repeat(40)]), 2, FC('REV_UNRESOLVED'));
  expect('rev-per-receipt-overrides', runTool(['--dir', rcOldRev, '--rev', c2]), 0, CLE(1));
  expect('rev-default-is-judged', runTool(['--dir', rcStaleDigest, '--rev', c2]), 1, DRI(0, 1, 0, 0, 'a.txt'));
  expect('symlink-receipt', runTool(['--dir', rcSymlink, '--rev', c2]), 2, FC('SYMLINK_RECEIPT'));
  expect('external-disk', runTool(['--dir', rcExternal, '--rev', c2]), 0, CLE(1, 1));
  expect('external-mismatch', runTool(['--dir', rcExternalBad, '--rev', c2]), 1, DRI(0, 1, 0, 1, 'a.txt'));
  expect('lane-absolute-instrument', runTool(['--dir', rcLaneAbs, '--rev', c2]), 0, CLE(1, 0));
  expect('empty-dir-not-clean', runTool(['--dir', rcEmpty, '--rev', c2]), 1, DRI(0, 0, 0, 0, '-'));
  expect('non-txt-ignored', runTool(['--dir', rcWithNotes, '--rev', c2]), 0, CLE(1));
  expect('non-txt-only-is-empty', runTool(['--dir', rcNotesOnly, '--rev', c2]), 1, DRI(0, 0, 0, 0, '-'));
  expect('sorted-first', runTool(['--dir', rcSorted, '--rev', c2]), 1, DRI(0, 2, 0, 0, 'aa.txt'));
  expect('lane-flag-from-outside', runTool(['--dir', rcClean, '--rev', c2, '--lane', repo], root), 0, CLE(1));
  expect('default-lane-is-toplevel', runTool(['--dir', rcClean, '--rev', c2], join(repo, 'scripts')), 0, CLE(1));
  expect('git-env-canary-ignored', runTool(['--dir', rcClean, '--rev', c2, '--lane', repo], repo, {
    GIT_DIR: join(root, 'canary-git-dir'), GIT_WORK_TREE: join(root, 'canary-work-tree'), GIT_INDEX_FILE: join(root, 'canary-index'),
  }), 0, CLE(1));

  // --json parity: the object carries the same tallies as the verdict line.
  {
    const r = runTool(['--dir', rcFlipDigest, '--rev', c2, '--json']);
    let obj = null;
    try { obj = JSON.parse(r.out.trim()); } catch { obj = null; }
    const ok = r.status === 1 && obj !== null && obj.contract === CONTRACT && obj.ok === false &&
      obj.verdict === 'DRIFT' && obj.matched === 1 && obj.mismatched === 1 && obj.unchecked === 0 &&
      obj.external === 0 && obj.first === 'a.txt' && Array.isArray(obj.rows) && obj.rows.length === 2 &&
      obj.rows[0].verdict === 'MISMATCH';
    results.push({ name: 'json-drift', ok, detail: `exit=${r.status} ${obj ? JSON.stringify({ matched: obj.matched, mismatched: obj.mismatched, first: obj.first }) : 'unparsed'}` });
    const rc = runTool(['--dir', rcClean, '--rev', c2, '--json']);
    let objc = null;
    try { objc = JSON.parse(rc.out.trim()); } catch { objc = null; }
    const okc = rc.status === 0 && objc !== null && objc.ok === true && objc.verdict === 'CLEAN' && objc.matched === 1 &&
      objc.mismatched === 0 && objc.unchecked === 0 && objc.external === 0;
    results.push({ name: 'json-clean', ok: okc, detail: `exit=${rc.status} ${objc ? objc.verdict : 'unparsed'}` });
    const rf = runTool(['--dir', join(root, 'absent'), '--rev', c2, '--json']);
    let objf = null;
    try { objf = JSON.parse(rf.out.trim()); } catch { objf = null; }
    const okf = rf.status === 2 && objf !== null && objf.verdict === 'FAIL-CLOSED' && objf.token === 'DIR_UNREADABLE' &&
      Array.isArray(objf.findings) && objf.findings[0].kind === 'DIR_UNREADABLE';
    results.push({ name: 'json-fail-closed', ok: okf, detail: `exit=${rf.status} ${objf ? objf.token : 'unparsed'}` });
  }

  // v2 boundaries, each with its positive twin.
  // ESCAPES_LANE: only an ABSOLUTE token may name an external instrument; a relative token that
  // resolves outside the lane fails closed, while `..` that stays inside the lane still binds.
  const extDigest = sha256(readFileSync(extPath));
  const escRel = relative(repo, extPath);
  const rcEscRel = mkdir({ 'a.txt': body(c2, extDigest, `bash ${escRel}`) });
  const rcEscInterior = mkdir({ 'a.txt': body(c2, extDigest, `bash scripts/../${escRel}`) });
  const rcEscAbs = mkdir({ 'a.txt': body(c2, extDigest, `bash ${extPath}`) });
  const rcDotdotInside = mkdir({ 'a.txt': body(c2, sha256(dAlphaC2), 'node scripts/../scripts/alpha.mjs') });
  const rcEscAmongClean = mkdir({ 'a.txt': okA, 'b.txt': body(c2, extDigest, `bash ${escRel}`) });
  expect('escapes-lane-relative', runTool(['--dir', rcEscRel, '--rev', c2]), 2, FC('ESCAPES_LANE'));
  expect('escapes-lane-interior-dotdot', runTool(['--dir', rcEscInterior, '--rev', c2]), 2, FC('ESCAPES_LANE'));
  expect('escapes-lane-among-clean', runTool(['--dir', rcEscAmongClean, '--rev', c2]), 2, FC('ESCAPES_LANE'));
  expect('escapes-lane-twin-absolute-external', runTool(['--dir', rcEscAbs, '--rev', c2]), 0, CLE(1, 1));
  expect('escapes-lane-twin-dotdot-inside', runTool(['--dir', rcDotdotInside, '--rev', c2]), 0, CLE(1, 0));

  // SYMLINK_DIR: --dir itself a symlink (with or without a trailing slash) fails closed; its real
  // target binds.
  const rcLinkTarget = mkdir({ 'a.txt': okA });
  const linkDir = join(root, 'rc-dir-link');
  symlinkSync(rcLinkTarget, linkDir);
  expect('symlink-dir', runTool(['--dir', linkDir, '--rev', c2]), 2, FC('SYMLINK_DIR'));
  expect('symlink-dir-trailing-slash', runTool(['--dir', `${linkDir}/`, '--rev', c2]), 2, FC('SYMLINK_DIR'));
  expect('symlink-dir-twin-real-target', runTool(['--dir', rcLinkTarget, '--rev', c2]), 0, CLE(1));

  // RECEIPT_TOO_LARGE: one byte over the limit fails closed — before the receipt is parsed, so an
  // oversize receipt that would also be ambiguous still reports the size; exactly the limit binds.
  const padTo = (text, size) => `${text}pad=${'x'.repeat(size - Buffer.byteLength(text) - 5)}\n`;
  const rcOver = mkdir({ 'a.txt': padTo(okA, MAX_RECEIPT_BYTES + 1) });
  const rcOverAmbiguous = mkdir({ 'a.txt': padTo(`${okA}cmd=node scripts/beta.mjs\n`, MAX_RECEIPT_BYTES + 1) });
  const rcAtLimit = mkdir({ 'a.txt': padTo(okA, MAX_RECEIPT_BYTES) });
  const sizes = [rcOver, rcOverAmbiguous, rcAtLimit].map((d) => lstatSync(join(d, 'a.txt')).size);
  if (sizes[0] !== MAX_RECEIPT_BYTES + 1 || sizes[1] !== MAX_RECEIPT_BYTES + 1 || sizes[2] !== MAX_RECEIPT_BYTES) {
    return fixtureFail(`receipt sizes ${sizes.join(',')}`);
  }
  expect('receipt-too-large', runTool(['--dir', rcOver, '--rev', c2]), 2, FC('RECEIPT_TOO_LARGE'));
  expect('receipt-too-large-before-parse', runTool(['--dir', rcOverAmbiguous, '--rev', c2]), 2, FC('RECEIPT_TOO_LARGE'));
  expect('receipt-too-large-twin-at-limit', runTool(['--dir', rcAtLimit, '--rev', c2]), 0, CLE(1));

  // AMBIGUOUS_FIELD: a second cmd=/tool_sha256=/rev= line fails closed, equal values included,
  // and before a missing digest could make the receipt merely unchecked; the single-field receipt binds.
  const rcDupCmd = mkdir({ 'a.txt': `${okA}cmd=node scripts/beta.mjs --selftest\n` });
  const rcDupCmdEqual = mkdir({ 'a.txt': `${okA}cmd=node scripts/alpha.mjs --selftest\n` });
  const rcDupDigest = mkdir({ 'a.txt': `${okA}tool_sha256=${sha256(dAlphaC2)}\n` });
  const rcDupRev = mkdir({ 'a.txt': `${okA}rev=${c2}\n` });
  const rcDupRevDiffer = mkdir({ 'a.txt': `${okA}rev=${c1}\n` });
  const rcDupCmdNoDigest = mkdir({ 'a.txt': `${okA.replace(/^tool_sha256=.*$/m, '')}cmd=node scripts/alpha.mjs\n` });
  const rcDupAmongClean = mkdir({ 'a.txt': okA, 'b.txt': `${okB}cmd=node scripts/beta.mjs --selftest\n` });
  const rcSingle = mkdir({ 'a.txt': okA, 'b.txt': okB });
  expect('ambiguous-cmd-differing', runTool(['--dir', rcDupCmd, '--rev', c2]), 2, FC('AMBIGUOUS_FIELD'));
  expect('ambiguous-cmd-equal', runTool(['--dir', rcDupCmdEqual, '--rev', c2]), 2, FC('AMBIGUOUS_FIELD'));
  expect('ambiguous-tool-sha256', runTool(['--dir', rcDupDigest, '--rev', c2]), 2, FC('AMBIGUOUS_FIELD'));
  expect('ambiguous-rev-equal', runTool(['--dir', rcDupRev, '--rev', c2]), 2, FC('AMBIGUOUS_FIELD'));
  expect('ambiguous-rev-differing', runTool(['--dir', rcDupRevDiffer, '--rev', c2]), 2, FC('AMBIGUOUS_FIELD'));
  expect('ambiguous-cmd-not-unchecked', runTool(['--dir', rcDupCmdNoDigest, '--rev', c2]), 2, FC('AMBIGUOUS_FIELD'));
  expect('ambiguous-among-clean', runTool(['--dir', rcDupAmongClean, '--rev', c2]), 2, FC('AMBIGUOUS_FIELD'));
  expect('ambiguous-twin-single-fields', runTool(['--dir', rcSingle, '--rev', c2]), 0, CLE(2));
  {
    const r = runTool(['--dir', rcDupDigest, '--rev', c2, '--json']);
    let obj = null;
    try { obj = JSON.parse(r.out.trim()); } catch { obj = null; }
    const ok = r.status === 2 && obj !== null && obj.verdict === 'FAIL-CLOSED' && obj.token === 'AMBIGUOUS_FIELD';
    results.push({ name: 'json-ambiguous-field', ok, detail: `exit=${r.status} ${obj ? obj.token : 'unparsed'}` });
  }

  // The judged bytes are the revision's, not the worktree's: a dirty instrument still binds the
  // committed digest, and a digest of the dirty bytes does not bind at the committed revision.
  writeFileSync(join(repo, 'scripts', 'alpha.mjs'), 'export const alpha = 3; // dirty worktree\n');
  expect('dirty-worktree-cannot-launder', runTool(['--dir', rcClean, '--rev', c2]), 0, CLE(1));
  const rcDirty = mkdir({ 'a.txt': body(c2, sha256(readFileSync(join(repo, 'scripts', 'alpha.mjs'))), 'node scripts/alpha.mjs') });
  expect('worktree-bytes-not-truth', runTool(['--dir', rcDirty, '--rev', c2]), 1, DRI(0, 1, 0, 0, 'a.txt'));

  const held = results.filter((r) => r.ok).length;
  for (const r of results) out(`RECEIPT_BIND_SELFTEST arm ${r.name} ${r.ok ? 'ok' : 'FAIL'} ${r.detail}\n`);
  if (held === results.length) {
    out(`RECEIPT_BIND_SELFTEST: PASS held=${held}/${results.length}\n`);
    return 0;
  }
  out(`RECEIPT_BIND_SELFTEST: FAIL held=${held}/${results.length}\n`);
  return 1;
}

// ---------------------------------------------------------------------------------------------

function main(argv) {
  let args;
  try { args = parseArgs(argv); } catch (e) { errOut(`receipt-bind: ${e.message}\n\n${USAGE}`); return 64; }
  if (args.help) { out(USAGE); return 0; }
  if (args.mode === 'selftest') {
    if (args.dir !== null || args.rev !== null || args.lane !== null || args.json) {
      errOut(`receipt-bind: --selftest accepts only --work\n\n${USAGE}`);
      return 64;
    }
    return selftest(args.work);
  }
  if (args.work !== null) { errOut(`receipt-bind: --work is a --selftest argument\n\n${USAGE}`); return 64; }
  if (args.dir === null) { errOut(`receipt-bind: --dir is required\n\n${USAGE}`); return 64; }
  if (args.rev === null) { errOut(`receipt-bind: --rev is required\n\n${USAGE}`); return 64; }
  if (!FULL_REV.test(args.rev)) { errOut(`receipt-bind: --rev ${JSON.stringify(args.rev)} is not 40 lowercase hex\n\n${USAGE}`); return 64; }
  try {
    return bind({ dir: resolve(args.dir), rev: args.rev, laneArg: args.lane, json: args.json });
  } catch (e) {
    if (e instanceof FailClosed) {
      emitFailClosed(e.token, e.detail, args.json, { dir: resolve(args.dir), rev: args.rev });
      return 2;
    }
    // An internal error is fail-closed, never drift: a crash must not read as a measured verdict.
    emitFailClosed('INTERNAL', String(e && e.message ? e.message : e), args.json, { dir: resolve(args.dir), rev: args.rev });
    return 2;
  }
}

process.exitCode = main(process.argv.slice(2));
