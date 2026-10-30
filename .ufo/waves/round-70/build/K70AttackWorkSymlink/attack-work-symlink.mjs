#!/usr/bin/env node
// K70AttackWorkSymlink — attack-only counterexample, round-70 C1 contract edge:
//   work-root symlink/canonicalization and parent alias to the lane control dir.
//
// Self-contained: builds a lane-sim fixture in the seat scratch dir, exercises
// three plausible candidate work-root handling patterns, and reports exactly
// where files land relative to the fixture's frozen controls directory.
// It never touches the real lane, never runs the frozen originals, and needs
// no git. Run:  node attack-work-symlink.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCRATCH = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
const seatDir = path.join(SCRATCH, 'kumitate-r70', 'K70AttackWorkSymlink');
fs.mkdirSync(seatDir, { recursive: true });
const runDir = fs.mkdtempSync(path.join(seatDir, 'run-'));
const outFile = path.join(runDir, 'transcript.txt');
const buf = [];
const log = (...a) => { const s = a.join(' '); buf.push(s); console.log(s); };

// ---------- fixture: lane-sim with a frozen controls dir + empty escape dir
const lane = path.join(runDir, 'lane-sim');
const ctl = path.join(lane, '.ufo', 'waves', 'round-69', 'controls');
fs.mkdirSync(ctl, { recursive: true });
const RECEIPTS = ['c1-donothing.txt', 'c1-autoledger.txt', 'c2-donothing.txt', 'c2-autoorigin.txt', 'c2-forgecapture.txt'];
for (const r of RECEIPTS) fs.writeFileSync(path.join(ctl, r), `FROZEN-RECEIPT ${r}\n`);
const elswhere = path.join(runDir, 'elsewhere-empty');
fs.mkdirSync(elswhere, { recursive: true });
const ctlList = () => fs.readdirSync(ctl).sort().join(',');

// Toy control text with the SAME assignment structure as the frozen c1/c2
// originals (LANE/PROBE/W/S lines), used only to model where a private copy
// writes. Not executed; the real originals are never executed either.
const toyControl = [
  '#!/usr/bin/env bash',
  'set -euo pipefail',
  `LANE=${JSON.stringify(lane)}`,
  'PROBE="$LANE/.ufo/waves/round-69/probe/ledger69-probe.mjs"',
  'W="$LANE/.ufo/waves/round-69/controls"',
  'S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/toy-$MODE"',
  'mkdir -p "$S/fx" "$W"',
].join('\n');

// ---------- candidate anti-patterns under test
// P1: canonicalize the work root, then mkdtemp under the canonical path.
const p1 = (workArg) => {
  const root = fs.realpathSync(workArg);
  return fs.mkdtempSync(path.join(root, 'replay70-'));
};
// P2: textual containment guard on the unresolved path (no canonicalization).
const p2Guard = (workArg, anchor) => {
  const resolved = path.resolve(workArg);
  return resolved === anchor || resolved.startsWith(anchor + path.sep);
};
// P3: out creation via existsSync guard + writeFileSync('w').
const p3Out = (out, data) => {
  if (fs.existsSync(out)) { const e = new Error('EEXIST'); e.code = 'EEXIST'; throw e; }
  fs.writeFileSync(out, data); // follows symlinks
};

log('fixture-lane:', lane);
log('fixture-controls:', ctl);
log('frozen-entries:', ctlList());
log('toy-control-assignment-lines:', JSON.stringify(toyControl.split('\n').slice(2, 6)));

// ---------- Scenario 1: --work is a parent alias to the lane control dir
log('\n--- Scenario 1: work root = symlink alias into frozen controls dir');
const alias = path.join(runDir, 'alias-to-controls');
fs.symlinkSync(ctl, alias, 'dir');
log('path.resolve(alias)     =', path.resolve(alias));
log('fs.realpathSync(alias)  =', fs.realpathSync(alias));
const child1 = p1(alias); // candidate: canonicalize-then-mkdtemp
log('child created at        =', child1);
log('child inside controls?  =', fs.realpathSync(child1).startsWith(fs.realpathSync(ctl) + path.sep));
// model the private control run: even with W correctly substituted to a
// private dir under the child, the fixture + receipts live transiently INSIDE
// the frozen controls dir.
fs.mkdirSync(path.join(child1, 'fx'), { recursive: true });
fs.mkdirSync(path.join(child1, 'w'), { recursive: true });
fs.writeFileSync(path.join(child1, 'w', 'toy-donothing.txt'), 'toy receipt\n');
log('controls listing WITH run in flight:', ctlList());
log('probe-style emptiness check readdirSync(alias).length =', fs.readdirSync(alias).length, '(frozen receipts + child => never 0)');
fs.rmSync(child1, { recursive: true, force: true });
log('controls listing after clean cleanup:', ctlList());
// interruption variant: candidate killed between mkdtemp and rmSync
const child1b = p1(alias);
fs.mkdirSync(path.join(child1b, 'fx'), { recursive: true });
fs.writeFileSync(path.join(child1b, 'fx', 'partial'), 'interrupted');
log('interrupted run leaves :', fs.readdirSync(ctl).filter(d => d.startsWith('replay70-')).join(','), '=> non-receipt file inside frozen controls dir');
log('cleanup of leftover    :'); fs.rmSync(child1b, { recursive: true, force: true });
log('controls listing       :', ctlList());

// ---------- Scenario 2: symlink escape to an unrelated empty dir
log('\n--- Scenario 2: work root = symlink to an unrelated empty dir (sandbox escape)');
const esc = path.join(runDir, 'esc-alias');
fs.symlinkSync(elswhere, esc, 'dir');
const child2 = p1(esc);
log('child created at       =', child2);
log('child under supplied root (esc)? =', fs.realpathSync(child2).startsWith(fs.realpathSync(esc) + path.sep));
log('readdirSync(raw esc) follows the symlink: mid-run length =', fs.readdirSync(esc).length, '; post-cleanup length =', (fs.rmSync(child2, { recursive: true, force: true }), fs.readdirSync(esc).length), '=> probe-style check is satisfied whenever the symlink TARGET ends empty, regardless of where the child actually was');

// ---------- Scenario 3: textual containment guard bypass
log('\n--- Scenario 3: containment guard on unresolved path is bypassed by alias');
const verdict = p2Guard(alias, fs.realpathSync(ctl));
log('guard(resolve(alias), controls-anchor) refuses? ', verdict, '(should be true; it is not)');
log('guard(realpath(alias), controls-anchor) refuses?', p2Guard(fs.realpathSync(alias), fs.realpathSync(ctl)), '(canonicalized guard refuses)');

// ---------- Scenario 4: out creation mechanisms vs symlink out-path
log('\n--- Scenario 4: --out creation mechanisms (R9 exercises only a plain existing file)');
const target = path.join(runDir, 'victim.txt');
fs.writeFileSync(target, 'victim\n');
const outLink = path.join(runDir, 'out-link');
fs.symlinkSync(target, outLink);
try { fs.writeFileSync(outLink, 'clobber', { flag: 'wx' }); log('wx on symlink-to-existing: wrote (BAD)'); }
catch (e) { log('open wx on symlink-to-existing:', e.code); }
try { p3Out(outLink, 'clobber'); log('existsSync+w on symlink-to-existing: wrote (BAD)'); }
catch (e) { log('existsSync guard on symlink-to-existing:', e.code, '(existsSync follows symlink; refused but reason wrong)'); }
const dangling = path.join(runDir, 'dangling-out');
fs.symlinkSync(path.join(runDir, 'no-such'), dangling);
try { p3Out(dangling, 'created-through'); log('existsSync+w on dangling symlink: wrote THROUGH to', fs.existsSync(path.join(runDir, 'no-such')) ? 'created target (BAD)' : 'nowhere'); }
catch (e) { log('existsSync guard on dangling symlink:', e.code); }
try { fs.writeFileSync(dangling, 'x', { flag: 'wx' }); log('wx on dangling symlink: wrote (BAD)'); }
catch (e) { log('open wx on dangling symlink:', e.code); }

// ---------- summary
log('\n--- Summary');
log('S1: canonicalize-then-mkdtemp with a controls-dir alias writes the run child INSIDE the frozen controls dir (transient on success, persistent on interruption).');
log('S2: the same pattern against an unrelated empty dir passes the R3-R7 raw-path emptiness check while writing outside the supplied work root.');
log('S3: a containment guard computed on path.resolve(work) is bypassed by any symlink alias; the anchor and the work root must both be canonicalized.');
log('S4: R9-style existsSync+writeFileSync(w) output creation follows dangling symlinks; openSync(out,"wx") refuses all symlinks (EEXIST). The contract pins "exclusive" but not the mechanism.');
log('run-dir:', runDir);
fs.writeFileSync(outFile, buf.join('\n') + '\n');
console.error('transcript:', outFile);
