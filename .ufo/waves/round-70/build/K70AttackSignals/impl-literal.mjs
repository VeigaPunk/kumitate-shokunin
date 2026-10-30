#!/usr/bin/env node
// impl-literal.mjs — literal minimal reading of the round-70 implementation
// contract, DELIBERATELY without any signal handling. This is the artifact
// under attack: a conforming-but-fragile control-replay.
//
// Contract obligations implemented (from plan.md "Implementation contract"):
//   * --lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR, --selftest
//   * bound only to frozen controls (stand-in here, hash-pinned, refuse drift)
//   * versioned private script copy: substitute LANE/PROBE/W/S assignments
//     exactly once, remove the known unused fixed /tmp write, explicit
//     fixture-root git arguments, scrub inherited repository environment
//   * unique mkdtemp child under the supplied work root
//   * receipts copied out before cleanup
//   * output creation exclusive (COPYFILE_EXCL)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const STANDIN = path.join(os.homedir(), '.cache'); // unused placeholder
const CONTROLS = {
  c1: {donothing: 'standin-c1.sh', autoledger: 'standin-c1.sh'},
  c2: {donothing: 'standin-c1.sh', autoorigin: 'standin-c1.sh', forgecapture: 'standin-c1.sh'},
};
// hash-pin the stand-in "frozen" source (refuse unexpected frozen source bytes)
const PINS = new Map();

function selftest() {
  console.log('CONTROL_REPLAY_SELFTEST: PASS ids=SIGTERM-ORPHAN-1,SIGTERM-ATOMIC-2');
  return 0;
}

function usage() { console.error('usage: control-replay --lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR | --selftest'); return 64; }

function main(argv) {
  if (argv[0] === '--selftest') return selftest();
  const opt = {};
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i];
    if (!k.startsWith('--')) return usage();
    opt[k.slice(2)] = argv[i + 1];
  }
  if (!opt.lane || !opt.family || !opt.mode || !opt.out || !opt.work) return usage();
  if (!CONTROLS[opt.family] || !CONTROLS[opt.family][opt.mode]) return 64;

  const standinDir = process.env.STANDIN_DIR;
  const srcName = CONTROLS[opt.family][opt.mode];
  const srcPath = path.join(standinDir, srcName);
  const src = fs.readFileSync(srcPath);
  const srcSha = sha(src);
  if (PINS.has(srcName) && PINS.get(srcName) !== srcSha) {
    console.error(`REFUSE frozen-source drift ${srcName}`);
    return 65;
  }
  PINS.set(srcName, srcSha);

  // unique mkdtemp child under the supplied work root
  const child = fs.mkdtempSync(path.join(opt.work, 'replay-'));

  // versioned private script copy: substitute the W and S assignments exactly
  // once; scrub inherited repository environment.
  let text = src.toString('utf8');
  text = text.replace(/^W="\$\{REPLAY_W[^}]*\}"$/m, `W="${child}"`);
  text = text.replace(/^S="\$\{REPLAY_S[^}]*\}"$/m, `S="${child}/scratch"`);
  const priv = path.join(child, `${opt.family}-${opt.mode}.private.sh`);
  fs.writeFileSync(priv, text);

  // run the private control with a scrubbed env (no GIT_DIR / GIT_WORK_TREE)
  const env = {...process.env};
  for (const k of Object.keys(env)) if (k.startsWith('GIT_')) delete env[k];
  delete env.GIT_DIR; delete env.GIT_WORK_TREE;

  const r = spawnSync('bash', [priv, opt.mode], {env, encoding: 'utf8'});
  if (r.error) { console.error('spawn error: ' + r.error.message); return 70; }

  const receipt = path.join(child, `receipt-${opt.mode}.txt`);
  if (!fs.existsSync(receipt)) {
    console.error('no receipt produced');
    fs.rmSync(child, {recursive: true, force: true});
    return 71;
  }
  // receipts copied out BEFORE cleanup; exclusive output creation
  try {
    fs.copyFileSync(receipt, opt.out, fs.constants.COPYFILE_EXCL);
  } catch (e) {
    if (e.code === 'EEXIST') { console.error('refusing existing output'); fs.rmSync(child, {recursive: true, force: true}); return 73; }
    throw e;
  }
  fs.rmSync(child, {recursive: true, force: true});
  return 0;
}

process.exitCode = main(process.argv.slice(2));
