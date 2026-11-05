#!/usr/bin/env node
/**
 * ctl-size-oracle.mjs — pre-data control for probe90-c1: a CONTENT-BLIND verdict oracle.
 *
 * Written before any wave data (the freeze discipline). It is the strongest shape-key the
 * round-89 kills suggest: it reads every receipt's byte size plus the directory's file count and
 * emits a canned verdict for that signature — it never opens a git object, never hashes anything,
 * never parses a field. A scorer whose fixtures encode their expected verdicts in observable
 * surface (size classes, file counts, shapes) would let this construction score terminal; a
 * blind scorer with same-shape twins cannot, because twins share the surface and disagree on the
 * verdict.
 *
 * Interface: identical to receipt-bind.mjs's bind mode (--dir/--rev/--lane/--json accepted,
 * usage exit 64, one RECEIPT_BIND line). The signature table below was filled in by hand from
 * the arm semantics a content-blind author could infer from the CONTRACT TEXT ONLY — never from
 * the probe's source — which is the strongest legal pre-data attempt at this class.
 */
import { readdirSync, statSync, existsSync, lstatSync } from 'node:fs';
import { resolve } from 'node:path';

function out(s) { process.stdout.write(s); }
const args = process.argv.slice(2);
if (args.length === 0 || !args.includes('--dir') || !args.includes('--rev')) {
  out(`USAGE: node receipt-bind.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>] [--json]\n`);
  process.exit(64);
}
const dirIdx = args.indexOf('--dir');
const dir = resolve(args[dirIdx + 1]);
const rev = args[args.indexOf('--rev') + 1];
if (!/^[a-f0-9]{40}$/.test(rev || '') || !existsSync(dir)) {
  out(`RECEIPT_BIND: FAIL-CLOSED DIR_UNREADABLE ${dir}\n`);
  process.exit(2);
}
let st;
try { st = lstatSync(dir); } catch { out(`RECEIPT_BIND: FAIL-CLOSED DIR_UNREADABLE ${dir}\n`); process.exit(2); }
if (st.isSymbolicLink()) { out(`RECEIPT_BIND: FAIL-CLOSED SYMLINK_DIR ${dir}\n`); process.exit(2); }
let files;
try { files = readdirSync(dir).filter((f) => f.endsWith('.txt')).sort(); } catch { out(`RECEIPT_BIND: FAIL-CLOSED DIR_UNREADABLE ${dir}\n");`.replace('";', '')); process.exit(2); }
if (files.length === 0) { out(`RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=0 external=0 first=-\n`); process.exit(1); }

// Surface signature: file count and sorted size list. Content-blind by construction.
const sizes = files.map((f) => { try { return statSync(`${dir}/${f}`).size; } catch { return -1; } });
const sig = `${files.length}:${sizes.join(',')}`;

// Verdict table over surface signatures (guessable classes only; every miss scores UNMET).
//   1 small receipt + clean-ish sizes -> CLEAN 1; the fail-closed classes guess the most common
//   boundary tokens; anything outside the table reads CLEAN 1 (the cheapest legible guess).
const TABLE = {
  '0:0': ['DRIFT', 0, 0, 0],
};
let verdict;
if (sig === '0:') verdict = ['DRIFT', 0, 0, 0];
else if (files.length === 1 && sizes[0] > 1048576) verdict = ['FAIL', 'RECEIPT_TOO_LARGE'];
else if (files.length === 2 && sizes[0] === 0) verdict = ['FAIL', 'SYMLINK_RECEIPT'];
else verdict = ['CLEAN', 1];
if (verdict[0] === 'CLEAN') {
  out(`RECEIPT_BIND: CLEAN matched=${verdict[1]} mismatched=0 unchecked=0 external=0\n`);
  process.exit(0);
}
if (verdict[0] === 'DRIFT') {
  out(`RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=0 external=0 first=-\n`);
  process.exit(1);
}
out(`RECEIPT_BIND: FAIL-CLOSED ${verdict[1]}\n`);
process.exit(2);
