#!/usr/bin/env node
// cand-probe-keyed.mjs — PROBE-KEYED ORACLE, NOT A CANDIDATE INSTRUMENT (K89Review, adversarial control).
// Computes no digest, reads no instrument, resolves no revision. It answers each frozen-probe
// invocation with the verdict line the probe expects, keyed on the probe's own fixture directory
// names (`<arm>-<12 hex nonce>`), which the probe passes to the tool as `--dir`.
// Purpose: measure whether probe89-c1 can be satisfied by a tool that implements no behaviour.
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const argv = process.argv.slice(2);
const arg = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
const emit = (code, line) => { process.stdout.write(line); process.exit(code); };
const CLEAN = (m, e = 0) => [0, `RECEIPT_BIND: CLEAN matched=${m} mismatched=0 unchecked=0 external=${e}\n`];
const DRIFT = (m, mm, u, e = 0, first = 'r.txt') => [1, `RECEIPT_BIND: DRIFT matched=${m} mismatched=${mm} unchecked=${u} external=${e} first=${first}\n`];
const FAIL = (t) => [2, `RECEIPT_BIND: FAIL-CLOSED ${t} keyed\n`];

if (argv.length === 0) emit(64, 'USAGE: canned\n');
if (argv.includes('--selftest')) emit(0, 'RECEIPT_BIND_SELFTEST: PASS\n');

const dir = arg('--dir');
if (!dir) emit(64, 'USAGE: canned\n');
if (!existsSync(dir)) emit(...FAIL('DIR_UNREADABLE'));

const base = basename(dir).replace(/-[0-9a-f]{12}$/, '');
const parent = basename(dirname(dir));
let key = base;
if (basename(dir) === 'close' && parent === 'round-86') key = 'round-86';
if (basename(dir) === 'close' && parent === 'round-87') key = 'round-87';

const files = readdirSync(dir).filter((f) => f.endsWith('.txt')).sort();

const TABLE = {
  'round-86': () => DRIFT(1, 9, 0),
  'r86-renamed': () => DRIFT(1, 9, 0),
  'r87-lane': () => CLEAN(11, 0),
  unchecked: () => DRIFT(0, 0, 1, 0, 'u.txt'),
  unresolved: () => FAIL('UNRESOLVED'),
  'symlink-receipt': () => FAIL('SYMLINK_RECEIPT'),
  'rev-bad': () => FAIL('REV_UNRESOLVED'),
  'rev-receipt-wins': () => CLEAN(1, 0),
  'worktree-forgery': () => DRIFT(0, 1, 0),
  'default-rev': () => CLEAN(1, 0),
  'rev-receipt-negative': () => DRIFT(0, 1, 0),
  'untracked-instrument': () => FAIL('UNRESOLVED'),
  'escape-relative': () => FAIL('ESCAPES_LANE'),
  'escape-absolute': () => CLEAN(1, 1),
  'link-dir': () => FAIL('SYMLINK_DIR'),
  'real-dir': () => CLEAN(1, 0),
  oversize: () => FAIL('RECEIPT_TOO_LARGE'),
  undersize: () => CLEAN(1, 0),
  'dup-cmd': () => FAIL('AMBIGUOUS_FIELD'),
  'dup-cmd-equal': () => FAIL('AMBIGUOUS_FIELD'),
  'dup-digest': () => FAIL('AMBIGUOUS_FIELD'),
  'dup-rev': () => FAIL('AMBIGUOUS_FIELD'),
  'dup-none': () => CLEAN(1, 0),
  'default-rev-not-head': () => CLEAN(1, 0),
  'index-not-judged': () => CLEAN(1, 0),
  'abs-in-lane-at-rev': () => CLEAN(1, 0),
  'limit-edge-ok': () => CLEAN(1, 0),
  'limit-edge-over': () => FAIL('RECEIPT_TOO_LARGE'),
  'limit-before-read': () => FAIL('RECEIPT_TOO_LARGE'),
  'escape-inner-dotdot': () => FAIL('ESCAPES_LANE'),
  'dup-rev-equal': () => FAIL('AMBIGUOUS_FIELD'),
  'dup-digest-equal': () => FAIL('AMBIGUOUS_FIELD'),
  'alias-proc-root': () => DRIFT(0, 1, 0, 0),
  'bom-rev': () => CLEAN(1, 0),
  'symlink-instrument': () => FAIL('SYMLINK_INSTRUMENT'),
  // the sweep is the one arm that is re-run on the same directory after a flip: count the
  // receipts and report the one whose digest was overwritten with 3s.
  sweep: () => {
    const flipped = files.find((f) => readFileSync(join(dir, f), 'utf8').includes(`tool_sha256=${'3'.repeat(64)}`));
    return flipped ? DRIFT(files.length - 1, 1, 0, 0, flipped) : CLEAN(files.length, 0);
  },
};

const row = TABLE[key];
if (!row) emit(...FAIL(`UNKEYED_${key}`));
emit(...row());
