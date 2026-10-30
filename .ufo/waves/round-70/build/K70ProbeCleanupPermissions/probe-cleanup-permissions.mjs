#!/usr/bin/env node
// K70ProbeCleanupPermissions — isolated probe: read-only fixture files/directories
// vs the round-70 control-replay cleanup contract.
//
// Contract clauses under test (frozen plan.md, implementation contract):
//   - "Unique mkdtemp child under the supplied work root, receipts copied out before cleanup"
//   - R3-R7 frozen-probe tail: fs.readdirSync(work).length === 0  (work directories reclaimed)
//   - R9-adjacent: an existing/new --out must survive a cleanup failure untouched
// Never executes originals c1-controls.sh / c2-controls.sh. Sibling candidate files are
// exercised only as private copies under this seat's build dir, with W/S paths inside the
// seat scratch (mock's own substitution keeps W/S inside its unique child).
//
// Labels: MECHANISM = node fs behavior demonstration (synthetic).
//         CANDIDATE-BASELINE = unmodified private copy, normal environment.
//         CANDIDATE-EDGE = private copy + INJECTED EDGE (read-only dir tree inside child).
// Edge injection is labeled in each *.injected.mjs; it models fixture material that
// preserves read-only permissions (tar without --no-same-permissions, chmod -R a-w artifact).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const SCRATCH = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
const SEAT_SCRATCH = path.join(SCRATCH, 'kumitate-r70', 'K70ProbeCleanupPermissions');
const BUILD = path.dirname(new URL(import.meta.url).pathname); // build/K70ProbeCleanupPermissions
const CAND = path.join(BUILD, 'candidates');
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';

const findings = [];
const say = (...a) => console.log(...a);
const rel = p => path.relative(SEAT_SCRATCH, p) || p;

function materialize(parent, kind) {
  fs.mkdirSync(parent, {recursive: true});
  if (kind === 'rofiles') {
    // git-like: read-only FILES inside writable directories
    const objects = path.join(parent, 'objects');
    fs.mkdirSync(objects);
    fs.writeFileSync(path.join(objects, 'obj-0444'), 'read-only file\n');
    fs.chmodSync(path.join(objects, 'obj-0444'), 0o444);
    fs.writeFileSync(path.join(parent, 'receipt.txt'), 'LEDGER69_UNMET exit=1\nCONTROL-PASS donothing\n');
    return ['objects/obj-0444', 'receipt.txt'];
  }
  if (kind === 'rodirs') {
    // tar-permissions-preserved / chmod -R a-w artifact: read-only DIRECTORY containing files
    const fx = path.join(parent, 'fx-ro');
    fs.mkdirSync(fx);
    fs.writeFileSync(path.join(fx, 'pinned-capture.md'), 'read-only fixture material\n');
    fs.chmodSync(path.join(fx, 'pinned-capture.md'), 0o444);
    fs.chmodSync(fx, 0o555);
    fs.writeFileSync(path.join(parent, 'receipt.txt'), 'LEDGER69_UNMET exit=1\nCONTROL-PASS donothing\n');
    return ['fx-ro/pinned-capture.md', 'receipt.txt'];
  }
  throw new Error('kind');
}

function rmIdiom(dir) { fs.rmSync(dir, {recursive: true, force: true}); } // contract idiom, verbatim from all three candidates

function conformingRm(dir) { // candidate remediation mechanism (chmod u+rwX walk, then rm)
  const walk = d => {
    fs.chmodSync(d, fs.statSync(d).mode | 0o700);
    for (const e of fs.readdirSync(d)) {
      const p = path.join(d, e);
      const st = fs.lstatSync(p); // lstat: do not follow symlinks out of the tree
      if (st.isDirectory() && !st.isSymbolicLink()) walk(p);
      else fs.chmodSync(p, st.mode | 0o600);
    }
  };
  walk(dir);
  fs.rmSync(dir, {recursive: true, force: true});
}

function snapEmpty(d) {
  try { return fs.readdirSync(d).length === 0; } catch { return 'GONE'; } // GONE: tree root itself removed = fully reclaimed
}
const reclaimed = v => v === true || v === 'GONE';

// ---------- Phase A: mechanism ----------
say('=== Phase A: MECHANISM (node fs, synthetic) ===');
const rootA = fs.mkdtempSync(path.join(SEAT_SCRATCH, 'phaseA-'));

// A1: read-only FILES in writable dirs — control case, expected to clean
const a1 = path.join(rootA, 'a1-rofiles');
materialize(a1, 'rofiles');
let a1Err = null;
try { rmIdiom(a1); } catch (e) { a1Err = `${e.code} ${e.message.split('\n')[0]}`; }
const a1Empty = snapEmpty(a1);
say(`A1 ro-files-only rm=${a1Err ? 'THROW ' + a1Err : 'ok'} workEmpty=${a1Empty}`);
findings.push({id: 'A1', kind: 'MECHANISM-rofiles', ok: !a1Err && reclaimed(a1Empty),
  detail: `read-only files in writable dirs clean fine: rm=${a1Err || 'ok'} workEmpty=${a1Empty}`});

// A2: read-only DIRECTORY — the edge
const a2 = path.join(rootA, 'a2-rodirs');
materialize(a2, 'rodirs');
let a2Err = null;
try { rmIdiom(a2); } catch (e) { a2Err = `${e.code} op=${e.syscall || '?'} :: ${e.message.split('\n')[0]}`; }
const a2Left = fs.existsSync(a2) ? fs.readdirSync(a2) : 'GONE';
say(`A2 ro-dir rm=${a2Err ? 'THROW ' + a2Err : 'ok'} residual=${JSON.stringify(a2Left)}`);
// receipt copy-out ordering: was the "receipt" still intact on disk after the cleanup throw?
const a2ReceiptIntact = fs.existsSync(path.join(a2, 'receipt.txt'));
let a2Recover = null;
if (fs.existsSync(a2)) { try { conformingRm(a2); a2Recover = reclaimed(snapEmpty(a2)); } catch (e) { a2Recover = 'THROW ' + e.code; } }
say(`A2 receipt-intact-after-throw=${a2ReceiptIntact} conforming-rm-reclaims=${a2Recover}`);
findings.push({id: 'A2', kind: 'MECHANISM-rodirs', ok: false,
  detail: `read-only dir tree: rmSync(recursive,force) THROWS ${a2Err}; residual=${JSON.stringify(a2Left)}; receipt copied out before cleanup survives=${a2ReceiptIntact}; conforming chmod+rm reclaims=${a2Recover}`});

// A2b: maxRetries does not save the idiom (retries cover EBUSY/EMFILE/ENFILE/ENOTEMPTY/EPERM; EPERM win32-only)
const a2b = path.join(rootA, 'a2b-rodirs');
materialize(a2b, 'rodirs');
let a2bErr = null;
try { fs.rmSync(a2b, {recursive: true, force: true, maxRetries: 3, retryDelay: 10}); } catch (e) { a2bErr = `${e.code}`; }
say(`A2b ro-dir maxRetries=3 rm=${a2bErr ? 'THROW ' + a2bErr : 'ok'}`);
if (fs.existsSync(a2b)) conformingRm(a2b);
findings.push({id: 'A2b', kind: 'MECHANISM-maxRetries', ok: a2bErr === 'EACCES' || a2bErr === 'EPERM',
  detail: `maxRetries=3 retryDelay=10 still THROWS ${a2bErr} on read-only dir (EACCES not retryable)`});

// ---------- Phase B: candidate private copies ----------
say('=== Phase B: CANDIDATE private copies ===');
const envBase = {PATH: process.env.PATH, HOME: process.env.HOME, HYAKU_SCRATCH: SCRATCH,
  TMPDIR: SEAT_SCRATCH, LANG: process.env.LANG || 'C.UTF-8'};

function runCandidate(file, tag, args = ['--lane', LANE, '--family', 'c1', '--mode', 'donothing'], extraEnv = null) {
  const work = path.join(SEAT_SCRATCH, `work-${tag}`);
  fs.mkdirSync(work, {recursive: true});
  const out = path.join(SEAT_SCRATCH, `out-${tag}.txt`);
  const full = [...args];
  if (!full.includes('--selftest')) full.push('--out', out, '--work', work);
  const env = extraEnv ? {...envBase, ...extraEnv} : envBase;
  const r = spawnSync(process.execPath, [path.join(CAND, file), ...full], {env, encoding: 'utf8', timeout: 900000, maxBuffer: 8 * 1024 * 1024});
  const workEmpty = snapEmpty(work);
  const outExists = fs.existsSync(out);
  const outText = outExists ? fs.readFileSync(out, 'utf8') : null;
  const res = {tag, file, exit: r.status, stdout: (r.stdout || '').trim().split('\n').slice(-2).join(' | '),
    stderrTail: (r.stderr || '').trim().split('\n').slice(-2).join(' | '), workEmpty, outLen: outExists ? outText.length : null,
    outHasReceipt: outText === null ? null : outText.includes('CONTROL-PASS'), out};
  say(`${tag}: exit=${r.status} workEmpty=${workEmpty} outLen=${res.outLen} outHasReceipt=${res.outHasReceipt}`);
  if (r.stderr && r.stderr.trim()) say(`  stderr-tail: ${res.stderrTail}`);
  return res;
}

const results = [];
// The frozen controls hardcode TMPDIR=$HYAKU_SCRATCH/kumitate-r69 for the probe run and the
// r69 probe mkdtemps directly under it: pre-create it INSIDE this seat's scratch and point
// HYAKU_SCRATCH there so end-to-end mock runs never write outside the seat sandbox.
const SEAT_HYAKU = path.join(SEAT_SCRATCH, 'hyaku-root');
fs.mkdirSync(path.join(SEAT_HYAKU, 'kumitate-r69'), {recursive: true});

results.push(runCandidate('naive-candidate.baseline.mjs', 'b-naive-baseline'));
results.push(runCandidate('fixed-candidate.baseline.mjs', 'b-fixed-baseline'));
results.push(runCandidate('mock-control-replay.baseline.mjs', 'b-mock-baseline'));
results.push(runCandidate('mock-control-replay.baseline-slow.mjs', 'b-mock-baseline-driftaccept', undefined, {MOCK_MUTANT: 'drift-accept', HYAKU_SCRATCH: SEAT_HYAKU}));
results.push(runCandidate('naive-candidate.injected.mjs', 'e-naive-injected'));
results.push(runCandidate('fixed-candidate.injected.mjs', 'e-fixed-injected'));
results.push(runCandidate('mock-control-replay.injected-slow.mjs', 'e-mock-injected-driftaccept', undefined, {MOCK_MUTANT: 'drift-accept', HYAKU_SCRATCH: SEAT_HYAKU}));

findings.push({id: 'MOCK-TIMEOUT', kind: 'OBSERVATION-mock-timeout', ok: false,
  detail: 'mock spawnSync timeout hardcoded 120000ms; measured private c1 donothing control wall 6m33s (user 42m, fleet-loaded host) > 120s and > the frozen probe per-run timeout 300000ms — unmodified mock truncates at 120s (SIGTERM, empty receipt, exit 1), the frozen probe budget is at risk under load, and this probe first hit its own 300s spawn budget on the baseline-slow run (exit=null) before being raised to 900s; -slow private variants raise mock side to 600s for the edge demonstration, labeled'});

findings.push({id: 'FROZEN-TMPDIR', kind: 'OBSERVATION-frozen-tmpdir', ok: false,
  detail: 'frozen c1/c2 controls hardcode TMPDIR=$HYAKU_SCRATCH/kumitate-r69 for the r69 probe; r69 probe mkdtemps directly under TMPDIR (ENOENT if absent); at r70 with S substituted to a private child nothing creates it — replay needs the dir to pre-exist or the tool to mkdir it'});
findings.push({id: 'MOCK-PIN', kind: 'OBSERVATION-pin-drift', ok: false,
  detail: 'unmodified sibling mock refuses lane frozen bytes: CONTROL_REPLAY_SOURCE_DRIFT exit=65 before any cleanup (EXPECTED_PINS stale vs lane c1-controls.sh sha256 01efd6dd...); mock cleanup path exercised via its designed MOCK_MUTANT=drift-accept hook only, labeled'});

for (const r of results) {
  const injected = r.tag.startsWith('e-');
  const pass = injected
    ? (r.exit !== 0 && r.workEmpty === false && r.outHasReceipt === true)
    : (r.exit === 0 && r.workEmpty === true);
  findings.push({id: r.tag.toUpperCase(), kind: injected ? 'CANDIDATE-EDGE' : 'CANDIDATE-BASELINE', ok: pass,
    detail: `exit=${r.exit} workEmpty=${r.workEmpty} outLen=${r.outLen} outHasReceipt=${r.outHasReceipt} stderr="${r.stderrTail}"`});
}

// ---------- Phase C: conforming mechanism replay of the candidate flow ----------
say('=== Phase C: CONFORMING cleanup on an edge tree (mechanism) ===');
const c1 = path.join(rootA, 'c-conforming');
materialize(c1, 'rodirs');
let cErr = null;
try { conformingRm(c1); } catch (e) { cErr = `${e.code}`; }
say(`C1 conforming-rm on ro-dir tree: ${cErr ? 'THROW ' + cErr : 'ok'} workEmpty=${snapEmpty(c1)}`);
findings.push({id: 'C1', kind: 'MECHANISM-conforming', ok: !cErr && reclaimed(snapEmpty(c1)),
  detail: `chmod u+rwX walk (lstat, no symlink follow) + rmSync reclaims read-only dir tree`});

// ---------- Phase D: read-only WORK ROOT (secondary) ----------
say('=== Phase D: read-only --work root (secondary finding) ===');
const roWork = path.join(rootA, 'd-ro-work');
fs.mkdirSync(roWork);
fs.chmodSync(roWork, 0o555);
const dOut = path.join(rootA, 'd-out.txt');
let dErr = null, dExit = null;
{
  const r = spawnSync(process.execPath, [path.join(CAND, 'fixed-candidate.baseline.mjs'),
    '--lane', LANE, '--family', 'c1', '--mode', 'donothing', '--out', dOut, '--work', roWork],
    {env: envBase, encoding: 'utf8', timeout: 60000});
  dExit = r.status;
  dErr = (r.stderr || '').trim().split('\n').filter(l => l.includes('Error')).slice(-1)[0] || '';
}
const dOutExists = fs.existsSync(dOut);
const dOutLen = dOutExists ? fs.readFileSync(dOut, 'utf8').length : null;
fs.chmodSync(roWork, 0o755); // reclaim
say(`D1 ro-work-root: exit=${dExit} outCreated=${dOutExists} outLen=${dOutLen} err="${dErr.split('\n')[0]}"`);
findings.push({id: 'D1', kind: 'MECHANISM-ro-work-root', ok: dExit !== 0,
  detail: `read-only --work root: mkdtemp THROWS ${dErr}; exit=${dExit}; empty exclusive --out left behind=${dOutExists}(len=${dOutLen})`});
fs.rmSync(rootA, {recursive: true, force: true});

// ---------- receipt ----------
const held = findings.filter(f => f.ok).length;
say(`PROBE_CLEANUP_PERMISSIONS ${held === findings.length ? 'ALL-AS-PREDICTED' : 'EDGE-NAMED'} findings=${findings.length}`);
for (const f of findings) say(`${f.id} ${f.ok ? 'PASS' : 'EDGE'} ${f.kind} :: ${f.detail}`);
fs.writeFileSync(path.join(BUILD, 'receipts', 'probe-cleanup-permissions.json'),
  JSON.stringify({seat: 'K70ProbeCleanupPermissions', node: process.version, platform: `${os.platform()}/${os.arch()}`, scratch: SEAT_SCRATCH, findings}, null, 2) + '\n');
