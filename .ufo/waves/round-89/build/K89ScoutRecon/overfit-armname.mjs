#!/usr/bin/env node
/**
 * overfit-armname.mjs — seat K89ScoutRecon, round 89. NOT a candidate instrument.
 *
 * A probe-aware overfit demonstration: it implements NO claimed behaviour (it never reads a
 * revision, never hashes an instrument, never resolves a path, never parses a receipt field).
 * It dispatches on the basename of --dir, which probe89-c1.mjs draws as `<arm-name>-<12-hex nonce>`
 * in its `mk(name)` helper, and prints the verdict line that arm asserts.
 *
 * Written to answer the seat question "what is the cheapest probe-aware overfit against the frozen
 * probe". Run against probe89-c1.mjs; if it reaches the terminal score the frozen kill rule would
 * call C1 UNMET, which is a finding about the probe, not about the instrument.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const argv = process.argv.slice(2);
const val = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
const say = (s) => { process.stdout.write(`${s}\n`); };
const fail = (token, detail) => { say(`RECEIPT_BIND: FAIL-CLOSED ${token}${detail ? ` ${detail}` : ''}`); process.exit(2); };
const clean = (m, e) => { say(`RECEIPT_BIND: CLEAN matched=${m} mismatched=0 unchecked=0 external=${e}`); process.exit(0); };
const drift = (m, mm, u, e, first) => { say(`RECEIPT_BIND: DRIFT matched=${m} mismatched=${mm} unchecked=${u} external=${e} first=${first}`); process.exit(1); };

if (argv.includes('--selftest')) { say('RECEIPT_BIND_SELFTEST: PASS'); process.exit(0); }
const dir = val('--dir');
if (!dir) { say('USAGE: node scripts/receipt-bind.mjs --dir <receipt-dir> --rev <40-hex>'); process.exit(64); }

let base;
try { statSync(dir); base = basename(dir); } catch { base = basename(dir); }
const arm = base.replace(/-[0-9a-f]{12}$/, '');
if (!statSync(dir, { throwIfNoEntry: false })) fail('DIR_UNREADABLE', dir);

const table = {
  'r86-renamed': () => drift(1, 9, 0, 0, 'q01-0.txt'),
  'r87-lane': () => clean(11, 0),
  unchecked: () => drift(0, 0, 1, 0, 'u.txt'),
  unresolved: () => fail('UNRESOLVED', 'scripts/absent'),
  'rev-bad': () => fail('REV_UNRESOLVED', 'rev'),
  'symlink-receipt': () => fail('SYMLINK_RECEIPT', 'a.txt'),
  'rev-receipt-wins': () => clean(1, 0),
  'worktree-forgery': () => drift(0, 1, 0, 0, 'r.txt'),
  'default-rev': () => clean(1, 0),
  'rev-receipt-negative': () => drift(0, 1, 0, 0, 'r.txt'),
  'untracked-instrument': () => fail('UNRESOLVED', 'scripts/fresh'),
  'escape-relative': () => fail('ESCAPES_LANE', 'relative instrument'),
  'escape-absolute': () => clean(1, 1),
  'real-dir': () => clean(1, 0),
  'link-dir': () => fail('SYMLINK_DIR', 'dir'),
  oversize: () => fail('RECEIPT_TOO_LARGE', 'r.txt'),
  undersize: () => clean(1, 0),
  'dup-cmd-equal': () => fail('AMBIGUOUS_FIELD', 'r.txt carries 2 cmd= lines'),
  'dup-cmd': () => fail('AMBIGUOUS_FIELD', 'r.txt carries 2 cmd= lines'),
  'dup-digest-equal': () => fail('AMBIGUOUS_FIELD', 'r.txt carries 2 tool_sha256= lines'),
  'dup-digest': () => fail('AMBIGUOUS_FIELD', 'r.txt carries 2 tool_sha256= lines'),
  'dup-rev-equal': () => fail('AMBIGUOUS_FIELD', 'r.txt carries 2 rev= lines'),
  'dup-rev': () => fail('AMBIGUOUS_FIELD', 'r.txt carries 2 rev= lines'),
  'dup-none': () => clean(1, 0),
  'default-rev-not-head': () => clean(1, 0),
  'index-not-judged': () => clean(1, 0),
  'abs-in-lane-at-rev': () => clean(1, 0),
  'limit-edge-ok': () => clean(1, 0),
  'limit-edge-over': () => fail('RECEIPT_TOO_LARGE', 'r.txt'),
  'limit-before-read': () => fail('RECEIPT_TOO_LARGE', 'r.txt'),
  'escape-inner-dotdot': () => fail('ESCAPES_LANE', 'relative instrument'),
  'alias-proc-root': () => drift(0, 1, 0, 0, 'r.txt'),
  'bom-rev': () => clean(1, 0),
  'symlink-instrument': () => fail('SYMLINK_INSTRUMENT', 'scripts/link'),
};

if (arm === 'sweep') {
  const files = readdirSync(dir).filter((f) => f.startsWith('s-') && f.endsWith('.txt')).sort();
  const flipped = files.find((f) => /^tool_sha256=3{64}$/m.test(readFileSync(join(dir, f), 'utf8')));
  if (flipped) drift(files.length - 1, 1, 0, 0, flipped);
  clean(files.length, 0);
}
if (base === 'close') drift(1, 9, 0, 0, 'r.txt');
if (arm === 'absent-dir' || base.endsWith('-dir')) fail('DIR_UNREADABLE', dir);
const fn = table[arm];
if (fn) fn();
fail('INTERNAL', `no arm named ${JSON.stringify(arm)}`);
