#!/usr/bin/env node
// SYNTHETIC contract-conformant replay driver (mechanism model of
// scripts/control-replay.mjs per the round-70 implementation contract).
// Interface: --lane DIR --family c1 --mode MODE --out NEWFILE --work DIR
// Exits: 0 ok | 64 usage | 70 tool/spawn failure (fail-closed) |
//        73 frozen bytes mismatch | 74 substitution count != 1 |
//        75 output exists (exclusive refusal)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const FROZEN_SHA = 'f9b0e19d17114323f3668419f3835569c8a3564bb230114b02481fe5b2dba6cf';
const SYNTH_PROBE = '80f396865611b916b0e7972f956cc349c916905af7da1d6c5573e1da805e58c2';
const FAMILIES = new Set(['c1']);
const MODES = new Set(['donothing', 'autoledger']);

const argv = process.argv.slice(2);
const opts = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--selftest') { opts.selftest = true; continue; }
  if (!a.startsWith('--')) process.exit(64);
  const v = argv[++i];
  if (v === undefined || v.startsWith('--')) process.exit(64);
  opts[a.slice(2)] = v;
}
const usage = () => process.exit(64);
if (opts.selftest) {
  // hermetic selftest: substitution and frozen-refusal logic only
  const src = [
    'LANE=/x', 'PROBE="$LANE/p"', 'W="$LANE/w"', 'S="${HYAKU_SCRATCH:-/h}/s"',
    'touch "$W/.fixed-unused-tmp"', 'body',
  ].join('\n') + '\n';
  const out = transform(src, '/l', '/p', '/w', '/s');
  const n = (re, s) => (s.match(re) || []).length;
  const ok = n(/^LANE=\/l$/m, out) === 1 && n(/^PROBE="\/p"$/m, out) === 1 &&
    n(/^W="\/w"$/m, out) === 1 && n(/^S="\/s"$/m, out) === 1 &&
    !out.includes('.fixed-unused-tmp') && n(/^body$/m, out) === 1;
  console.log(`SYNTH_DRIVER_SELFTEST: ${ok ? 'PASS' : 'FAIL'}`);
  process.exit(ok ? 0 : 1);
}
const {lane, family, mode, out, work} = opts;
if (!lane || !family || !mode || !out || !work) usage();
if (!FAMILIES.has(family) || !MODES.has(mode)) usage();
if (!fs.existsSync(lane) || !fs.existsSync(work) || !fs.statSync(work).isDirectory()) usage();

const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const fail = (code, msg) => { console.error(`SYNTH-DRIVER-REFUSE code=${code} ${msg}`); process.exit(code); };

function transform(src, laneDir, probe, wdir, sdir) {
  const subs = [
    [/^LANE=.*$/m, `LANE=${laneDir}`],
    [/^PROBE=.*$/m, `PROBE="${probe}"`],
    [/^W=.*$/m, `W="${wdir}"`],
    [/^S=.*$/m, `S="${sdir}"`],
  ];
  let text = src.split('\n').filter(l => l !== 'touch "$W/.fixed-unused-tmp"').join('\n');
  for (const [re, rep] of subs) {
    const n = (text.match(re) || []).length;
    if (n !== 1) fail(74, `substitution count ${n} for ${rep}`);
    text = text.replace(re, rep);
  }
  return text;
}

// 1. refuse unexpected frozen source bytes
const frozenPath = path.join(lane, 'controls', 'frozen-c1.sh');
if (!fs.existsSync(frozenPath)) fail(73, 'frozen control missing');
const frozenBytes = fs.readFileSync(frozenPath);
if (sha(frozenBytes) !== FROZEN_SHA) fail(73, 'frozen control bytes mismatch');

// 2. unique mkdtemp child under the supplied work root; the control's S is
//    a run/ subdir so the control's own `rm -rf $S` cannot delete the driver
//    materializations (private script + probe) living beside it
let child;
try { child = fs.mkdtempSync(path.join(work, 'synthchild-')); }
catch { fail(70, 'mkdtemp failed'); }
const runDir = path.join(child, 'run');

// materialize private probe copy and verify it, then the private control copy
const probeBytes = fs.readFileSync(new URL('./synth-probe.mjs', import.meta.url));
if (sha(probeBytes) !== SYNTH_PROBE) fail(73, 'synth probe bytes mismatch');
const probePath = path.join(child, 'synth-probe.mjs');
fs.writeFileSync(probePath, probeBytes);

let text = transform(frozenBytes.toString('utf8'), lane, probePath, path.join(child, 'receipts'), runDir);
const privPath = path.join(child, 'frozen-c1.private.sh');
fs.writeFileSync(privPath, text);

// 3. scrub inherited repository environment
const env = {...process.env};
for (const k of Object.keys(env)) if (k.startsWith('GIT_')) delete env[k];

// 4. run the private copy; fail closed on any spawn anomaly
const r = spawnSync('bash', [privPath, mode], {env, encoding: 'utf8', timeout: 120000});
const spawnBad = r.error || r.status === null;
if (spawnBad || r.status !== 0) {
  fs.rmSync(child, {recursive: true, force: true});
  fail(70, `control spawn failed error=${r.error && r.error.code} status=${r.status}`);
}

// 5. receipts copied out before cleanup of the work child
const receiptsDir = path.join(child, 'receipts');
const outFd = (() => { try { return fs.openSync(out, 'wx'); } catch { return null; } })();
if (outFd === null) { fs.rmSync(child, {recursive: true, force: true}); fail(75, 'output exists'); }
fs.writeSync(outFd, r.stdout);
fs.closeSync(outFd);
fs.rmSync(child, {recursive: true, force: true});
process.exit(0);
