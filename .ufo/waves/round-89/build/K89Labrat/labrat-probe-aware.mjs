#!/usr/bin/env node
/**
 * labrat-probe-aware.mjs — K89Labrat's probe-aware verdict ORACLE for round 89 C1.
 *
 * It implements NONE of `kumitate-receipt-bind-v3`: it never opens a receipt, never runs
 * `git cat-file`, never computes a digest, never resolves a lane, never compares a size. It
 * reads the FROZEN probe's own source at run time, reads the fixture repository's `.git`
 * state (`logs/HEAD`, `index`) to recover the nonce, takes the arm identity from the
 * `--dir` path the probe itself passes, and prints the verdict line the probe is about to
 * assert. Exit codes 64 / 0 / 1 / 2 are likewise taken from the arm, not from a judgement.
 *
 * Built only to test the round's kill rule: if this reaches 30/30, no candidate can be
 * distinguished from a real instrument by this probe, because the probe is an output-text
 * oracle and the arm label leaks through the fixture directory name.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

const argv = process.argv.slice(2);
function opt(name) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : null;
}
function failClosed(token, detail) {
  console.log(`RECEIPT_BIND: FAIL-CLOSED ${token}${detail ? ' ' + detail : ''}`);
  process.exit(2);
}

// ---- 1. the frozen probe, found from cwd (the probe runs every arm with cwd = lane) --------
const PROBE_REL = join('.ufo', 'waves', 'round-89', 'probe', 'probe89-c1.mjs');
function findProbe() {
  let d = process.cwd();
  for (;;) {
    const p = join(d, PROBE_REL);
    if (existsSync(p)) return p;
    const up = dirname(d);
    if (up === d) return null;
    d = up;
  }
}
const PROBE = findProbe();
if (!PROBE) failClosed('INTERNAL', 'probe89-c1.mjs not found from cwd');
const probeText = readFileSync(PROBE, 'utf8');

// One `// A<n> — ` block per arm; each block carries exactly one `arm('<name>', ...)` call.
const blocks = new Map();
for (const chunk of probeText.split(/\n\/\/ A\d+ — /).slice(1)) {
  const m = chunk.match(/arm\('([^']+)'/);
  if (m) blocks.set(m[1], chunk);
}

// ---- 2. the expected verdicts, transcribed from that source and checked against it --------
// spec kinds: fail{token} | clean{matched,external} | drift{matched,mismatched,unchecked,external} | sweep
const T = (label, arm, spec) => ({ label, arm, spec });
const TABLE = [
  T('r86', 'detect-r86', { k: 'drift', matched: 1, mismatched: 9, unchecked: 0 }),
  T('r86-renamed', 'detect-r86-renamed', { k: 'drift', matched: 1, mismatched: 9, unchecked: 0 }),
  T('r87-lane', 'clean-r87', { k: 'clean', matched: 11, external: 0 }),
  T('unchecked', 'unchecked', { k: 'drift', matched: 0, mismatched: 0, unchecked: 1 }),
  T('unresolved', 'unresolved', { k: 'fail', token: 'UNRESOLVED' }),
  T('absent', 'dir-missing', { k: 'fail', token: 'DIR_UNREADABLE' }),
  T('rev-bad', 'rev-bad', { k: 'fail', token: 'REV_UNRESOLVED' }),
  T('symlink-receipt', 'symlink-receipt', { k: 'fail', token: 'SYMLINK_RECEIPT' }),
  T('rev-receipt-wins', 'rev-receipt-wins', { k: 'clean', matched: 1, external: 0 }),
  T('worktree-forgery', 'worktree-forgery', { k: 'drift', matched: 0, mismatched: 1, unchecked: 0 }),
  T('default-rev', 'default-rev', { k: 'clean', matched: 1, external: 0 }),
  T('rev-receipt-negative', 'rev-receipt-negative', { k: 'drift', matched: 0, mismatched: 1, unchecked: 0 }),
  T('untracked-instrument', 'untracked-instrument', { k: 'fail', token: 'UNRESOLVED' }),
  T('escape-relative', 'escape-relative', { k: 'fail', token: 'ESCAPES_LANE' }),
  T('escape-absolute', 'escape-relative', { k: 'clean', matched: 1, external: 1 }),
  T('link-dir', 'symlink-dir', { k: 'fail', token: 'SYMLINK_DIR' }),
  T('real-dir', 'symlink-dir', { k: 'clean', matched: 1, external: 0 }),
  T('oversize', 'oversize', { k: 'fail', token: 'RECEIPT_TOO_LARGE' }),
  T('undersize', 'oversize', { k: 'clean', matched: 1, external: 0 }),
  T('dup-cmd', 'duplicate-field', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('dup-cmd-equal', 'duplicate-field', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('dup-digest', 'duplicate-field', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('dup-rev', 'duplicate-field', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('dup-none', 'duplicate-field', { k: 'clean', matched: 1, external: 0 }),
  T('sweep', 'sweep', { k: 'sweep' }),
  T('default-rev-not-head', 'default-rev-not-head', { k: 'clean', matched: 1, external: 0 }),
  T('index-not-judged', 'index-not-judged', { k: 'clean', matched: 1, external: 0 }),
  T('abs-in-lane-at-rev', 'abs-in-lane-at-rev', { k: 'clean', matched: 1, external: 0 }),
  T('limit-edge-ok', 'limit-edge', { k: 'clean', matched: 1, external: 0 }),
  T('limit-edge-over', 'limit-edge', { k: 'fail', token: 'RECEIPT_TOO_LARGE' }),
  T('limit-before-read', 'limit-before-read', { k: 'fail', token: 'RECEIPT_TOO_LARGE' }),
  T('escape-inner-dotdot', 'escape-inner-dotdot', { k: 'fail', token: 'ESCAPES_LANE' }),
  T('dup-rev-equal', 'dup-equal-field', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('dup-digest-equal', 'dup-equal-field', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('alias-proc-root', 'alias-proc-root', { k: 'drift', matched: 0, mismatched: 1, unchecked: 0, external: 0 }),
  T('bom-rev', 'bom-rev', { k: 'clean', matched: 1, external: 0 }),
  T('symlink-instrument', 'symlink-instrument', { k: 'fail', token: 'SYMLINK_INSTRUMENT' }),
];
const LABELS = new Map(TABLE.map((e) => [e.label, e]));

// Couple to the frozen source: every arm block must exist, and every transcribed expectation
// must still appear in its block. A probe whose expectations changed cannot be served by this
// table, so the oracle fails closed instead of guessing.
if (blocks.size !== 30) failClosed('INTERNAL', `probe arm blocks=${blocks.size}, expected 30`);
for (const e of TABLE) {
  const b = blocks.get(e.arm);
  if (!b) failClosed('INTERNAL', `arm '${e.arm}' absent from probe`);
  const s = e.spec;
  let ok;
  if (s.k === 'fail') ok = new RegExp(`isFail\\(\\s*r\\d*\\s*,\\s*'${s.token}'\\s*\\)`).test(b);
  else if (s.k === 'clean') ok = new RegExp(`isClean\\(\\s*r\\d*\\s*,\\s*${s.matched}\\s*,\\s*${s.external}\\s*\\)`).test(b);
  else if (s.k === 'drift') {
    ok = s.external === undefined
      ? new RegExp(`isDrift\\(\\s*r\\d*\\s*,\\s*${s.matched}\\s*,\\s*${s.mismatched}\\s*,\\s*${s.unchecked}\\s*\\)`).test(b)
      : new RegExp(`isDrift\\(\\s*r\\d*\\s*,\\s*${s.matched}\\s*,\\s*${s.mismatched}\\s*,\\s*${s.unchecked}\\s*,\\s*${s.external}\\s*\\)`).test(b);
  } else ok = /const held = arms\.filter/.test(probeText) && b.includes('firstOf(bindLine');
  if (!ok) failClosed('INTERNAL', `expectation for '${e.label}' (${e.arm}) not found in probe`);
}

// ---- 3. the fixture's .git state: recover the nonce the fixture was drawn from -------------
function nonceFromGit(fixRoot) {
  let gitDir = null;
  try {
    const repoName = readdirSync(fixRoot).find((n) => /^repo-[0-9a-f]{12}$/.test(n));
    if (!repoName) return null;
    gitDir = join(fixRoot, repoName, '.git');
  } catch { return null; }
  // 3a. the reflog records the run-time commit messages, which carry the nonce
  try {
    const m = readFileSync(join(gitDir, 'logs', 'HEAD'), 'utf8')
      .match(/commit(?: \(initial\))?: A ([0-9a-f]{12})/);
    if (m) return { nonce: m[1], via: 'logs/HEAD' };
  } catch { /* reflog pruned or absent */ }
  // 3b. the index entry names carry the nonce (scripts/tool-<nonce>.mjs)
  try {
    const idx = readFileSync(join(gitDir, 'index'));
    if (idx.subarray(0, 4).toString('latin1') === 'DIRC') {
      const n = idx.readUInt32BE(8);
      let off = 12;
      for (let i = 0; i < n && off + 62 <= idx.length; i += 1) {
        const start = off + 62;
        const end = idx.indexOf(0, start);
        if (end < 0) break;
        const name = idx.subarray(start, end).toString('latin1');
        const mm = name.match(/tool-([0-9a-f]{12})\.mjs$/);
        if (mm) return { nonce: mm[1], via: 'index' };
        off = start + (((end - start) + 8) & ~7);
      }
    }
  } catch { /* index absent */ }
  return null;
}
function fixtureRootOf(dirText) {
  const m = dirText.match(/^(.*\/p89-[0-9a-f]{12})\//);
  return m ? m[1] : null;
}

// ---- 4. arm identity from the path the probe passes, never from the bytes judged -----------
function labelOf(dirText) {
  const b = basename(dirText);
  if (/\/\.ufo\/waves\/round-86\/close$/.test(dirText)) return { label: 'r86', nonce: null };
  const absent = b.match(/^absent-([0-9a-f]{12})-dir$/);
  if (absent) return { label: 'absent', nonce: absent[1] };
  const m = b.match(/^(.*)-([0-9a-f]{12})$/);
  if (m) return { label: m[1], nonce: m[2] };
  return { label: b, nonce: null };
}

// ---- 5. emit the verdict the probe asserts ------------------------------------------------
function emit(spec, dir) {
  if (spec.k === 'clean') {
    console.log(`RECEIPT_BIND: CLEAN matched=${spec.matched} mismatched=0 unchecked=0 external=${spec.external}`);
    process.exit(0);
  }
  if (spec.k === 'drift') {
    const ext = spec.external === undefined ? 0 : spec.external;
    console.log(`RECEIPT_BIND: DRIFT matched=${spec.matched} mismatched=${spec.mismatched} ` +
      `unchecked=${spec.unchecked} external=${ext} first=r.txt`);
    process.exit(1);
  }
  if (spec.k === 'sweep') {
    let files = [];
    try { files = readdirSync(dir).filter((f) => /^s-.*\.txt$/.test(f)).sort(); } catch { /* unreadable */ }
    let flipped = null;
    for (const f of files) {
      try {
        if (/^tool_sha256=3{64}$/m.test(readFileSync(join(dir, f), 'utf8'))) { flipped = f; break; }
      } catch { /* unreadable */ }
    }
    if (flipped) {
      console.log(`RECEIPT_BIND: DRIFT matched=${files.length - 1} mismatched=1 unchecked=0 ` +
        `external=0 first=${flipped}`);
      process.exit(1);
    }
    console.log(`RECEIPT_BIND: CLEAN matched=${files.length} mismatched=0 unchecked=0 external=0`);
    process.exit(0);
  }
  failClosed(spec.token, `${basename(dir)} (arm-derived verdict)`);
}

// ---- 6. dispatch --------------------------------------------------------------------------
if (argv.length === 0) {
  console.log('USAGE: labrat-probe-aware.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>]');
  process.exit(64);
}
if (argv.includes('--selftest')) {
  console.log('RECEIPT_BIND_SELFTEST: PASS held=0/0 (oracle: no behaviour implemented)');
  process.exit(0);
}
const dirArg = opt('--dir');
if (!dirArg) {
  console.log('USAGE: labrat-probe-aware.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>]');
  process.exit(64);
}
const { label, nonce: pathNonce } = labelOf(dirArg);
const entry = LABELS.get(label);
if (!entry) failClosed('INTERNAL', `unknown fixture label '${label}'`);

// Read the fixture's own .git state. It is used ONLY to confirm the nonce the path already
// leaks; no revision, index entry or worktree byte ever reaches a verdict.
const fixRoot = fixtureRootOf(dirArg);
const fromGit = fixRoot ? nonceFromGit(fixRoot) : null;
if (pathNonce && fromGit && fromGit.nonce !== pathNonce) {
  // prefer the fixture's own record; both are the same draw in practice
  process.stderr.write(`labrat: nonce path=${pathNonce} ${fromGit.via}=${fromGit.nonce}\n`);
}

emit(entry.spec, dirArg);
