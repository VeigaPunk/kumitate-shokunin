#!/usr/bin/env node
// K70AttackConcurrent fixed-candidate model.
// Identical to naive-candidate.mjs EXCEPT the child directory is created with
// fs.mkdtempSync under the supplied work root — uniqueness by construction, per the
// frozen plan contract: "Unique mkdtemp child under the supplied work root".
import fs from 'node:fs';
import path from 'node:path';

const FAMILIES = ['c1', 'c2'];
const MODES = ['donothing', 'autoledger', 'autoorigin', 'forgecapture'];

function parse(argv) {
  const a = {_: []};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--selftest') { a.selftest = true; continue; }
    if (argv[i].startsWith('--')) { a[argv[i].slice(2)] = argv[++i]; }
    else a._.push(argv[i]);
  }
  return a;
}

const a = parse(process.argv.slice(2));
if (a.selftest) { console.log('CONTROL_REPLAY_SELFTEST: PASS'); process.exit(0); }
if (!a.lane || !FAMILIES.includes(a.family) || !MODES.includes(a.mode) || !a.out || !a.work) process.exit(64);

let outFd;
try { outFd = fs.openSync(a.out, 'wx'); }
catch { console.error('refusing existing output'); process.exit(1); }

// FIX: unique mkdtemp child under the supplied work root.
const child = fs.mkdtempSync(path.join(a.work, `${a.family}-${a.mode}-`));

const label = a.family === 'c1' ? 'LEDGER69_UNMET' : 'DEPREC69_UNMET';
fs.writeFileSync(path.join(child, 'private-copy.sh'), `#!/bin/sh\n# ${a.family} ${a.mode} private\n`);
fs.writeFileSync(path.join(child, 'receipt.txt'), `${label} exit=1\nCONTROL-PASS ${a.mode}\n`);
fs.copyFileSync(path.join(child, 'receipt.txt'), a.out);
fs.closeSync(outFd);
// [K70ProbeCleanupPermissions INJECTED EDGE] synthetic fixture leaves a read-only directory tree inside the unique child
const roFixture = path.join(child, 'fx-ro');
fs.mkdirSync(roFixture);
fs.writeFileSync(path.join(roFixture, 'pinned-capture.md'), 'synthetic read-only fixture material\n');
fs.chmodSync(path.join(roFixture, 'pinned-capture.md'), 0o444);
fs.chmodSync(roFixture, 0o555);
fs.rmSync(child, {recursive: true, force: true});
console.log(`replayed ${a.family} ${a.mode} child=${path.basename(child)}`);
