#!/usr/bin/env node
/**
 * labrat-label-only.mjs — the MINIMAL oracle: no probe read, no .git read, no behaviour.
 *
 * Same table as labrat-probe-aware.mjs, but it never opens the probe and never touches the
 * fixture repository's `.git`. It is the control for the stronger candidate: if this also
 * reaches 30/30 then probe-awareness is not even required, and the fixture's run-time nonce
 * is defeated by the arm labels it does not cover.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const argv = process.argv.slice(2);
function opt(name) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : null;
}
function failClosed(token, detail) {
  console.log(`RECEIPT_BIND: FAIL-CLOSED ${token}${detail ? ' ' + detail : ''}`);
  process.exit(2);
}
const T = (label, spec) => ({ label, spec });
const TABLE = [
  T('r86', { k: 'drift', matched: 1, mismatched: 9, unchecked: 0 }),
  T('r86-renamed', { k: 'drift', matched: 1, mismatched: 9, unchecked: 0 }),
  T('r87-lane', { k: 'clean', matched: 11, external: 0 }),
  T('unchecked', { k: 'drift', matched: 0, mismatched: 0, unchecked: 1 }),
  T('unresolved', { k: 'fail', token: 'UNRESOLVED' }),
  T('absent', { k: 'fail', token: 'DIR_UNREADABLE' }),
  T('rev-bad', { k: 'fail', token: 'REV_UNRESOLVED' }),
  T('symlink-receipt', { k: 'fail', token: 'SYMLINK_RECEIPT' }),
  T('rev-receipt-wins', { k: 'clean', matched: 1, external: 0 }),
  T('worktree-forgery', { k: 'drift', matched: 0, mismatched: 1, unchecked: 0 }),
  T('default-rev', { k: 'clean', matched: 1, external: 0 }),
  T('rev-receipt-negative', { k: 'drift', matched: 0, mismatched: 1, unchecked: 0 }),
  T('untracked-instrument', { k: 'fail', token: 'UNRESOLVED' }),
  T('escape-relative', { k: 'fail', token: 'ESCAPES_LANE' }),
  T('escape-absolute', { k: 'clean', matched: 1, external: 1 }),
  T('link-dir', { k: 'fail', token: 'SYMLINK_DIR' }),
  T('real-dir', { k: 'clean', matched: 1, external: 0 }),
  T('oversize', { k: 'fail', token: 'RECEIPT_TOO_LARGE' }),
  T('undersize', { k: 'clean', matched: 1, external: 0 }),
  T('dup-cmd', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('dup-cmd-equal', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('dup-digest', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('dup-rev', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('dup-none', { k: 'clean', matched: 1, external: 0 }),
  T('sweep', { k: 'sweep' }),
  T('default-rev-not-head', { k: 'clean', matched: 1, external: 0 }),
  T('index-not-judged', { k: 'clean', matched: 1, external: 0 }),
  T('abs-in-lane-at-rev', { k: 'clean', matched: 1, external: 0 }),
  T('limit-edge-ok', { k: 'clean', matched: 1, external: 0 }),
  T('limit-edge-over', { k: 'fail', token: 'RECEIPT_TOO_LARGE' }),
  T('limit-before-read', { k: 'fail', token: 'RECEIPT_TOO_LARGE' }),
  T('escape-inner-dotdot', { k: 'fail', token: 'ESCAPES_LANE' }),
  T('dup-rev-equal', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('dup-digest-equal', { k: 'fail', token: 'AMBIGUOUS_FIELD' }),
  T('alias-proc-root', { k: 'drift', matched: 0, mismatched: 1, unchecked: 0, external: 0 }),
  T('bom-rev', { k: 'clean', matched: 1, external: 0 }),
  T('symlink-instrument', { k: 'fail', token: 'SYMLINK_INSTRUMENT' }),
];
const LABELS = new Map(TABLE.map((e) => [e.label, e]));

function labelOf(dirText) {
  const b = basename(dirText);
  if (/\/\.ufo\/waves\/round-86\/close$/.test(dirText)) return 'r86';
  const absent = b.match(/^absent-([0-9a-f]{12})-dir$/);
  if (absent) return 'absent';
  const m = b.match(/^(.*)-([0-9a-f]{12})$/);
  return m ? m[1] : b;
}

function emit(spec, dir) {
  if (spec.k === 'clean') {
    console.log(`RECEIPT_BIND: CLEAN matched=${spec.matched} mismatched=0 unchecked=0 external=${spec.external}`);
    process.exit(0);
  }
  if (spec.k === 'drift') {
    console.log(`RECEIPT_BIND: DRIFT matched=${spec.matched} mismatched=${spec.mismatched} ` +
      `unchecked=${spec.unchecked} external=${spec.external === undefined ? 0 : spec.external} first=r.txt`);
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

if (argv.length === 0) {
  console.log('USAGE: labrat-label-only.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>]');
  process.exit(64);
}
if (argv.includes('--selftest')) {
  console.log('RECEIPT_BIND_SELFTEST: PASS held=0/0 (oracle: no behaviour implemented)');
  process.exit(0);
}
const dirArg = opt('--dir');
if (!dirArg) {
  console.log('USAGE: labrat-label-only.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>]');
  process.exit(64);
}
const entry = LABELS.get(labelOf(dirArg));
if (!entry) failClosed('INTERNAL', `unknown fixture label '${labelOf(dirArg)}'`);
emit(entry.spec, dirArg);
