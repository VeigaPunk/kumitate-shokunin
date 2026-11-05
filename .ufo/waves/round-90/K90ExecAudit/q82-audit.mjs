#!/usr/bin/env node
/**
 * q82-audit.mjs — mechanical Q82 check for the frozen round-90 probe (claim C1).
 *
 * Q82: a capability scorer may not hand the candidate its own fixture's identity. This audit:
 *   1. reads the frozen probe source read-only and extracts every arm label (literal `arm('…'`
 *      first arguments, plus the names of the dynamic `arm(name, …)` call site taken from its
 *      `[label, '\uXXXX']` prefix table);
 *   2. runs the frozen probe with --tool <RECORDER>, a recording tool that logs (names only, never
 *      contents) every --lane/--rev/--dir value and every *.txt name inside --dir, then delegates to
 *      the real instrument with the same argv;
 *   3. fails (LEAK) if any label of length >= 5 is a substring of any recorded path or file name.
 *
 * --negative-control swaps in the keyed recorder (copies each --dir receipt set under arm labels),
 * which must print LEAK: proof the audit can fail.
 *
 * Usage:
 *   node q82-audit.mjs --scratch <dir> [--lane <dir>] [--rev <40-hex>]
 *   node q82-audit.mjs --scratch <dir> --negative-control
 * Exit: 0 CLEAN, 1 LEAK, 3 audit could not run / probe modified / nothing recorded.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEAT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : dflt;
};
const KEYED = argv.includes('--negative-control');
const MODE = KEYED ? 'keyed-negative' : 'clean';
const LANE = resolve(opt('--lane', '/home/vgpnk/Projects/shokunin/kumitate-shokunin'));
const REV = opt('--rev', '7218699cfbdec702ba42f35ceac0a8e52d1bd564');
const SCRATCH_ARG = opt('--scratch', '');
const FROZEN_PROBE_SHA = '70622333ca6946c73564e1236f7c19a8efa110200e09043bf2fd3b24d2f2b694';
const PROBE = join(LANE, '.ufo/waves/round-90/probe/probe90-c1.mjs');
const REAL = join(LANE, 'scripts/receipt-bind.mjs');
const MIN_LEN = 5;

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const fail = (msg, code = 3) => {
  console.log(`Q82_AUDIT: FAIL ${msg}`);
  process.exit(code);
};
if (!SCRATCH_ARG) fail('SCRATCH_REQUIRED');
if (!/^[a-f0-9]{40}$/.test(REV)) fail(`REV_NOT_FULL ${REV}`);
const SCRATCH = resolve(SCRATCH_ARG);
const MODE_DIR = join(SCRATCH, MODE);
const WORK = join(MODE_DIR, 'w');
const LOG = join(MODE_DIR, 'record.log');
const RECORDER = join(MODE_DIR, 'recorder.mjs');

// ---- 1. arm labels from the frozen probe source (read-only)
const probeBuf = readFileSync(PROBE);
const probeShaBefore = sha256(probeBuf);
if (probeShaBefore !== FROZEN_PROBE_SHA) fail(`PROBE_NOT_FROZEN_SHA ${probeShaBefore}`);
const src = probeBuf.toString('utf8');
const literalLabels = [...src.matchAll(/\barm\(\s*'([^']+)'/g)].map((m) => m[1]);
const dynamicSites = [...src.matchAll(/(?<!function )\barm\(\s*name\s*,/g)].length;
const dynamicLabels = [...src.matchAll(/\[\s*'([a-z][a-z0-9-]*)'\s*,\s*'\\u[0-9A-Fa-f]{4}'\s*\]/g)].map((m) => m[1]);
if (dynamicSites > 0 && dynamicLabels.length === 0) fail('DYNAMIC_NAMES_UNRESOLVED');
const allLabels = [...literalLabels, ...(dynamicSites > 0 ? dynamicLabels : [])];
const labels = [...new Set(allLabels)];
const scanLabels = labels.filter((l) => l.length >= MIN_LEN);
const skipped = labels.filter((l) => l.length < MIN_LEN);

console.log(`Q82_INPUT probe=${PROBE} sha256=${probeShaBefore} frozen=yes`);
console.log(`Q82_LABELS literal_sites=${literalLabels.length} dynamic_sites=${dynamicSites} dynamic_names=${dynamicLabels.length} found=${allLabels.length} unique=${labels.length} checked=${scanLabels.length} skipped=${skipped.length}`);
console.log(`Q82_LABEL_LIST ${labels.join(' ')}`);
console.log(`Q82_SKIPPED(<${MIN_LEN} chars) ${skipped.length ? skipped.join(' ') : 'none'}`);

// ---- 2. recording tool + frozen probe run through it
rmSync(MODE_DIR, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
writeFileSync(RECORDER, readFileSync(join(SEAT, 'q82-recorder.mjs')));
writeFileSync(join(MODE_DIR, 'config.json'), JSON.stringify({ scratch: MODE_DIR, real: REAL, keyed: KEYED, labels, log: LOG }));

const run = spawnSync(process.execPath, [PROBE, '--lane', LANE, '--work', WORK, '--rev', REV, '--tool', RECORDER], {
  cwd: MODE_DIR, encoding: 'utf8', maxBuffer: 64 << 20, timeout: 1800000, env: { ...process.env, TMPDIR: MODE_DIR },
});
const probeOut = `${run.stdout || ''}${run.stderr || ''}`;
writeFileSync(join(SEAT, `probe-run-${MODE}.txt`), probeOut);
const probeShaAfter = sha256(readFileSync(PROBE));
if (probeShaAfter !== probeShaBefore) fail('PROBE_MODIFIED_DURING_AUDIT', 3);
const verdict = (probeOut.match(/^C90_C1: .*$/m) || ['(no verdict line)'])[0];
const printedArms = [...probeOut.matchAll(/^ARM (\S+): /gm)].map((m) => m[1]);
const armsMatch = printedArms.length === labels.length && labels.every((l) => printedArms.includes(l));
console.log(`Q82_PROBE mode=${MODE} exit=${run.status} probe_arm_lines=${printedArms.length} arm_names_match_extraction=${armsMatch ? 'yes' : 'no'} verdict="${verdict}"`);

// ---- 3. scan recorded paths and file names
if (!existsSync(LOG)) fail('NO_RECORD_LOG');
const recs = readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map((l) => l.split('\t'));
const invocations = recs.filter((c) => c[0] === 'ARGV').length;
if (invocations === 0) fail('NOTHING_RECORDED');
const scannedSet = new Set();
for (const c of recs) {
  if (c[0] === 'PATH' && c[2] !== undefined) scannedSet.add(c[2]);
  else if (c[0] === 'FILE' && c[1] !== undefined) scannedSet.add(c[1]);
}
const scanned = [...scannedSet].sort();
writeFileSync(join(SEAT, `scanned-${MODE}.txt`), scanned.join('\n') + '\n');
console.log(`Q82_RECORD mode=${MODE} invocations=${invocations} scanned_values=${scanned.length} list=scanned-${MODE}.txt`);

const hits = [];
for (const label of scanLabels) {
  for (const p of scanned) if (p.includes(label)) hits.push({ label, path: p });
}
for (const h of hits) console.log(`HIT label=${h.label} path=${h.path}`);
if (hits.length > 0) {
  console.log(`Q82_AUDIT: LEAK hits=${hits.length}`);
  process.exit(1);
}
console.log(`Q82_AUDIT: CLEAN labels=${scanLabels.length} scanned=${scanned.length} hits=0`);
process.exit(0);
