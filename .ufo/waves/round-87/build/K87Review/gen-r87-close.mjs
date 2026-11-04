#!/usr/bin/env node
// K87Review — build the AFTER-STATE fixture in a scratch clone of the lane:
// `.ufo/waves/round-87/close/` with the ten close receipts the round will commit,
// each correctly bound to the instrument its own cmd= names at <rev>.
//
// This is a fixture, not a claim: it lets the frozen probe be scored in the exact
// configuration the plan's after-state requires (>=8 round-87 receipts present),
// which the live lane does not have yet.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const clone = process.argv[2];
const rev = process.argv[3];
if (!clone || !/^[a-f0-9]{40}$/.test(rev || '')) {
  console.error('usage: gen-r87-close.mjs <clone> <40-hex rev>');
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
const blob = (rel) => {
  const r = spawnSync('git', ['-C', clone, 'cat-file', 'blob', `${rev}:${rel}`], { maxBuffer: 64 << 20 });
  if (r.status !== 0) throw new Error(`absent at ${rev}: ${rel}`);
  return r.stdout;
};
const dir = join(clone, '.ufo', 'waves', 'round-87', 'close');
mkdirSync(dir, { recursive: true });

const EXT = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const cases = [
  ['c1-probe', 'node', `${join(clone, '.ufo', 'waves', 'round-87', 'probe', 'probe87-c1.mjs')} --lane ${clone} --work /fast/scratch/hyaku/kumitate-r87/L1/close`, '.ufo/waves/round-87/probe/probe87-c1.mjs', 'RECEIPT_BIND: CLEAN matched=10 mismatched=0 unchecked=0 external=1', 0],
  ['selftest', 'node', 'scripts/counter-receipt.mjs --selftest --work /fast/scratch/hyaku/kumitate-r87/L1/close', 'scripts/counter-receipt.mjs', 'RECEIPT_BIND_SELFTEST: PASS held=39/39', 0],
  ['proxy', 'node', 'scripts/proxy-check.mjs --strict', 'scripts/proxy-check.mjs', 'PROXY: MATCH', 0],
  ['proxy-selftest', 'node', 'scripts/proxy-check.mjs --selftest', 'scripts/proxy-check.mjs', 'PASS held=165/165', 0],
  ['map', 'node', 'scripts/readme-map.mjs', 'scripts/readme-map.mjs', 'MAP: CLEAN', 0],
  ['map-selftest', 'node', 'scripts/readme-map.mjs --selftest', 'scripts/readme-map.mjs', 'MAP_SELFTEST: PASS', 0],
  ['spotcheck', 'node', 'scripts/spotcheck-adopt.mjs --check', 'scripts/spotcheck-adopt.mjs', 'SPOTCHECK: CLEAN', 0],
  ['ready', 'node', `scripts/ready-handoff.mjs --round 87 --wave w1 --policy /home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`, 'scripts/ready-handoff.mjs', 'READY: PASS', 0],
  ['plan', 'bash', `scripts/plan-before-ready.sh --round 87 --rev ${rev}`, 'scripts/plan-before-ready.sh', 'PLAN_BEFORE_READY: PASS', 0],
  ['census', 'bash', `${EXT} validate --root /home/vgpnk/Projects/shokunin kumitate`, null, 'receipts=239 bound=1 mismatch=9 unresolved=0 no_cmd=229', 0],
];

const written = [];
for (const [name, prog, args, rel, tail, code] of cases) {
  const instrument = args.trim().split(/\s+/)[0];
  const digest = rel === null
    ? (existsSync(EXT) ? sha(readFileSync(EXT)) : '0'.repeat(64))
    : sha(blob(rel));
  const body = `rev=${rev}\ntool_sha256=${digest}\ncmd=${prog} ${args}\n${tail}\nexit=${code}\nsignal=none\n`;
  writeFileSync(join(dir, `${name}.txt`), body);
  written.push(`${name}.txt ${digest} ${instrument}`);
}
console.log(`wrote ${written.length} receipts to ${dir} at rev=${rev}`);
for (const w of written) console.log('  ' + w);
