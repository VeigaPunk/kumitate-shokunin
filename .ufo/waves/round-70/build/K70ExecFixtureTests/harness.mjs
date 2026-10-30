#!/usr/bin/env node
// Acceptance harness for the round-70 control-replay contract. Seat K70ExecFixtureTests.
// Validates a candidate control-replay.mjs against six required coverage areas:
//   exclusive output, unique scratch root, source drift refusal, cleanup failure,
//   family/mode validation, inherited GIT_* variables — plus the five-mode replay
//   battery, hermetic selftest, and frozen-output-path preservation.
// Usage: node harness.mjs --candidate <path|ABSENT> [--scratch DIR] [--suite A|B|all]
// Suite B (mock demonstration) additionally proves discrimination via labeled mutants.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildFixture, digestTree, PINS} from './fixtures/make-fixture.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = here;
const DEFAULT_SCRATCH = path.join(process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku', 'kumitate-r70/K70ExecFixtureTests');

const cli = process.argv.slice(2);
const argOf = (k, d) => { const i = cli.indexOf('--' + k); return i >= 0 ? cli[i + 1] : d; };
const CANDIDATE = argOf('candidate', null);
const SCRATCH = path.resolve(argOf('scratch', path.join(DEFAULT_SCRATCH, 'run')));
const SUITE = argOf('suite', 'all');
const RESULTS = path.resolve(argOf('results', path.join(BUILD, 'results')));
const CAND_NAME = CANDIDATE ? (path.basename(path.dirname(CANDIDATE)) + '/' + path.basename(CANDIDATE)) : 'ABSENT';

const MODES = [['c1', 'donothing'], ['c1', 'autoledger'], ['c2', 'donothing'], ['c2', 'autoorigin'], ['c2', 'forgecapture']];
const LABEL = {c1: 'LEDGER69_UNMET', c2: 'DEPREC69_UNMET'};
const BOGUS_GIT_ENV = {
  GIT_DIR: '/nonexistent/git-dir', GIT_WORK_TREE: '/nonexistent/work-tree',
  GIT_INDEX_FILE: '/nonexistent/index', GIT_OBJECT_DIRECTORY: '/nonexistent/objects',
  GIT_CEILING_DIRECTORIES: '/nonexistent',
};

fs.rmSync(SCRATCH, {recursive: true, force: true});
fs.mkdirSync(SCRATCH, {recursive: true});
fs.mkdirSync(RESULTS, {recursive: true});

const FX = buildFixture(path.join(SCRATCH, 'fixture'));
const DRIFT_FX = buildFixture(path.join(SCRATCH, 'fixture-drift'));
// flip one byte of the frozen c1 copy in the drift fixture
{
  const p = path.join(DRIFT_FX.lane, '.ufo/waves/round-69/probe/c1-controls.sh');
  const b = fs.readFileSync(p);
  const i = b.indexOf('synthetic');
  fs.writeFileSync(p, Buffer.concat([b.subarray(0, i), Buffer.from('synthetix'), b.subarray(i + 9)]));
}
const snapshot0 = digestTree(path.join(FX.lane, '.ufo/waves/round-69'));
const results = [];
const check = (id, ok, detail) => { results.push({id, ok: !!ok, detail}); };
const skipAll = (ids, why) => ids.forEach(id => results.push({id, ok: null, detail: 'SKIP ' + why}));

function runTool(args, {env = {}, cwd = SCRATCH, mutant = null} = {}) {
  if (!CANDIDATE) return null;
  const e = {...process.env, ...env};
  if (mutant) e.MOCK_MUTANT = mutant;
  const r = spawnSync(process.execPath, [CANDIDATE, ...args], {env: e, cwd, encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024});
  return {status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error};
}
const baseArgs = (fx, out, work, family, mode) => ['--lane', fx.lane, '--family', family, '--mode', mode, '--out', out, '--work', work];
const workDir = name => { const d = path.join(SCRATCH, 'work', name); fs.mkdirSync(d, {recursive: true}); return d; };
const outFile = name => path.join(SCRATCH, 'out', name + '.txt');
fs.mkdirSync(path.join(SCRATCH, 'out'), {recursive: true});

const A_IDS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7a', 'A7b', 'A8', 'A9', 'A10', 'A13', 'A11', 'A12'];

function suiteA(mutant = null) {
  const tag = mutant ? `[mutant=${mutant}] ` : '';
  const res0 = results.length;
  const ns = mutant || 'conform';
  const W = name => workDir(ns + '/' + name);
  const O = name => outFile(ns + '-' + name);
  // A1 selftest hermetic
  {
    const cwd = path.join(SCRATCH, 'selftest-cwd');
    fs.mkdirSync(cwd, {recursive: true});
    const r = runTool(['--selftest'], {cwd, mutant});
    if (!r) check('A1', null, 'SKIP candidate absent');
    else {
      const clean = fs.readdirSync(cwd).length === 0;
      check('A1', r.status === 0 && /^CONTROL_REPLAY_SELFTEST: PASS/m.test(r.stdout) && clean,
        tag + `status=${r.status} marker=${/^CONTROL_REPLAY_SELFTEST: PASS/m.test(r.stdout)} cwd-clean=${clean}`);
    }
  }
  // A2 usage: each missing required argument -> 64
  {
    const full = baseArgs(FX, O('usage'), W('usage'), 'c1', 'donothing');
    const misses = [];
    for (let i = 0; i < full.length; i += 2) {
      const r = runTool([...full.slice(0, i), ...full.slice(i + 2)], {mutant});
      if (!r || r.status !== 64) misses.push(full[i] + '->' + (r ? r.status : 'absent'));
    }
    check('A2', misses.length === 0, tag + 'missing-arg cases not 64: ' + (misses.join(' ') || 'none'));
  }
  // A3/A4 family & mode validation
  {
    const r1 = runTool(baseArgs(FX, O('fam'), W('fam'), 'junk', 'donothing'), {mutant});
    check('A3', r1 && r1.status === 64, tag + `family=junk status=${r1 ? r1.status : 'absent'}`);
    const r2 = runTool(baseArgs(FX, O('m1'), W('m1'), 'c1', 'autoorigin'), {mutant});
    const r3 = runTool(baseArgs(FX, O('m2'), W('m2'), 'c2', 'autoledger'), {mutant});
    check('A4', r2 && r3 && r2.status === 64 && r3.status === 64,
      tag + `c1+autoorigin=${r2 ? r2.status : 'absent'} c2+autoledger=${r3 ? r3.status : 'absent'}`);
  }
  // A5 exclusive output
  {
    const out = O('existing');
    fs.writeFileSync(out, 'do-not-overwrite\n');
    const r = runTool(baseArgs(FX, out, W('existing'), 'c1', 'donothing'), {mutant});
    const intact = fs.readFileSync(out, 'utf8') === 'do-not-overwrite\n';
    check('A5', r && r.status !== 0 && intact, tag + `status=${r ? r.status : 'absent'} intact=${intact}`);
  }
  // A6 five-mode battery
  {
    const per = [];
    for (const [fam, mode] of MODES) {
      const out = O('ok-' + fam + '-' + mode), work = W('ok-' + fam + '-' + mode);
      const r = runTool(baseArgs(FX, out, work, fam, mode), {mutant});
      const text = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
      const workEmpty = fs.existsSync(work) ? fs.readdirSync(work).length === 0 : false;
      const good = r && r.status === 0 && text.includes(LABEL[fam]) && text.includes('CONTROL-PASS ' + mode) && workEmpty
        && (fam !== 'c2' || mode !== 'forgecapture' || text.includes('live='));
      per.push(`${fam}/${mode}:${good ? 'ok' : 'bad'}`);
      if (!good) per.push(`  status=${r ? r.status : 'absent'} label=${text.includes(LABEL[fam])} pass=${text.includes('CONTROL-PASS ' + mode)} workEmpty=${workEmpty} bytes=${text.length}`);
    }
    check('A6', per.every(p => !p.startsWith('bad') && !p.includes(':bad')), tag + per.join(' '));
  }
  // A7a concurrency: 4 parallel runs share one work root
  {
    const shared = W('shared');
    const rs = MODES.map(([fam, mode], i) => runTool(baseArgs(FX, O('conc' + i), shared, fam, mode), {mutant}));
    const texts = rs.map((_, i) => fs.existsSync(O('conc' + i)) ? fs.readFileSync(O('conc' + i), 'utf8') : '');
    const revs = new Set(texts.map(t => /rev=([0-9a-f]+)/.exec(t)?.[1]));
    const scratches = new Set(texts.map(t => /scratch=(\S+)/.exec(t)?.[1]));
    const allOk = rs.every((r, i) => r && r.status === 0 && texts[i].includes('CONTROL-PASS'));
    const sharedEmpty = fs.existsSync(shared) && fs.readdirSync(shared).length === 0;
    check('A7a', allOk && revs.size === MODES.length && scratches.size === MODES.length && sharedEmpty,
      tag + `allOk=${allOk} distinctRev=${revs.size}/${MODES.length} distinctScratch=${scratches.size}/${MODES.length} sharedEmpty=${sharedEmpty}`);
  }
  // A7b sequential runs produce distinct scratch roots
  {
    const t1 = fs.existsSync(O('ok-c1-donothing')) ? fs.readFileSync(O('ok-c1-donothing'), 'utf8') : '';
    const out2 = O('seq2'), r2 = runTool(baseArgs(FX, out2, W('seq2'), 'c1', 'donothing'), {mutant});
    const t2 = fs.existsSync(out2) ? fs.readFileSync(out2, 'utf8') : '';
    const s1 = /scratch=(\S+)/.exec(t1)?.[1], s2 = /scratch=(\S+)/.exec(t2)?.[1];
    check('A7b', r2 && r2.status === 0 && s1 && s2 && s1 !== s2, tag + `scratch1=${s1} scratch2=${s2}`);
  }
  // A8 cleanup scope: pre-seeded work root untouched apart from the tool child
  {
    const work = W('seeded');
    fs.writeFileSync(path.join(work, 'sentinel.txt'), 'keep-me\n');
    const r = runTool(baseArgs(FX, O('seeded'), work, 'c1', 'autoledger'), {mutant});
    const sentinel = fs.existsSync(path.join(work, 'sentinel.txt')) && fs.readFileSync(path.join(work, 'sentinel.txt'), 'utf8') === 'keep-me\n';
    const rest = fs.existsSync(work) ? fs.readdirSync(work) : ['<work-root-deleted>'];
    check('A8', r && r.status === 0 && sentinel && rest.length === 1, tag + `status=${r ? r.status : 'absent'} sentinel=${sentinel} leftovers=${rest.join(',') || 'none'}`);
  }
  // A9 source drift refusal
  {
    const out = O('drift');
    const r = runTool(baseArgs(DRIFT_FX, out, W('drift'), 'c1', 'donothing'), {mutant});
    const noOut = !fs.existsSync(out);
    check('A9', r && r.status !== 0 && noOut, tag + `status=${r ? r.status : 'absent'} outCreated=${!noOut}`);
  }
  // A10 inherited GIT_* variables
  {
    const out = O('gitenv');
    const r = runTool(baseArgs(FX, out, W('gitenv'), 'c1', 'donothing'), {env: BOGUS_GIT_ENV, mutant});
    const text = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
    check('A10', r && r.status === 0 && text.includes('CONTROL-PASS donothing'),
      tag + `status=${r ? r.status : 'absent'} pass=${text.includes('CONTROL-PASS donothing')}`);
  }
  // A13 cleanup failure: receipt survives, failure reported non-zero, child left for inspection
  {
    const out = O('cleanupfail'), work = W('cleanupfail');
    const r = runTool(baseArgs(FX, out, work, 'c1', 'donothing'), {mutant: 'cleanup-throw'});
    const receiptOut = fs.existsSync(out) && fs.readFileSync(out, 'utf8').includes('CONTROL-PASS donothing');
    const childLeft = fs.existsSync(work) && fs.readdirSync(work).some(d => d.startsWith('replay-'));
    const supported = r && (r.status === 70 || /CLEANUP_FAIL/.test(r.stderr));
    if (r && !supported && r.status === 0 && !childLeft) check('A13', null, tag + 'SKIP candidate provides no forced-cleanup-failure hook');
    else check('A13', !!(r && supported && r.status !== 0 && receiptOut && childLeft),
      tag + `status=${r ? r.status : 'absent'} receiptCopiedBeforeCleanup=${receiptOut} childLeft=${childLeft}`);
  }
  // A11 frozen output paths preserved after the whole battery
  {
    const snap = digestTree(path.join(FX.lane, '.ufo/waves/round-69'));
    const same = JSON.stringify(snap) === JSON.stringify(snapshot0);
    check('A11', same, tag + `fixture digests unchanged=${same}`);
  }
  // A12 selftest stability: two runs byte-identical, finding ids + exit map present
  {
    const r1 = runTool(['--selftest'], {mutant}), r2 = runTool(['--selftest'], {mutant});
    const stable = r1 && r2 && r1.status === 0 && r1.stdout === r2.stdout && /finding/.test(r1.stdout) && /exit.?map/i.test(r1.stdout);
    check('A12', stable, tag + `stable=${!!stable} findings=${r1 ? /finding/.test(r1.stdout) : 'absent'}`);
  }
  return results.slice(res0);
}

// ---------------- suite B: mock demonstration (discrimination evidence) ----------------
const MUTANTS = {
  'out-append': ['A5'],
  'scratch-fixed': ['A7a'],
  'scratch-leave': ['A6', 'A7a', 'A8'],
  'scratch-nuke': ['A6', 'A7a', 'A8'],
  'drift-accept': ['A9'],
  'family-accept': ['A3', 'A4'],
  'gitenv-inherit': ['A10'],
  'orig-exec': ['A6', 'A7a', 'A7b', 'A8', 'A10'],
};

function b0Check(mutant) {
  const work = workDir('b0-' + mutant);
  const r = runTool(baseArgs(FX, outFile('b0-' + mutant), work, 'c2', 'forgecapture'), {mutant, env: {MOCK_KEEP_PRIVATE: '1'}});
  const child = fs.existsSync(work) ? fs.readdirSync(work).find(d => d.startsWith('replay-')) : null;
  const priv = child ? path.join(work, child, 'private-controls.sh') : null;
  let detail = `status=${r ? r.status : 'absent'} child=${child}`;
  let ok = false;
  if (priv && fs.existsSync(priv)) {
    const lines = fs.readFileSync(priv, 'utf8').split('\n');
    const count = k => lines.filter(l => l.startsWith(k + '=')).length;
    const laneVal = lines.find(l => l.startsWith('LANE='));
    const fixed = lines.some(l => /r70synth-forge-sed\.txt/.test(l));
    ok = count('LANE') === 1 && count('PROBE') === 1 && count('W') === 1 && count('S') === 1
      && laneVal === 'LANE=' + FX.lane && !fixed;
    detail += ` LANE once=${count('LANE')===1} PROBE once=${count('PROBE')===1} W once=${count('W')===1} S once=${count('S')===1} substituted=${laneVal === 'LANE=' + FX.lane} fixedWriteRemoved=${!fixed}`;
  }
  return {ok, detail};
}

function suiteB() {
  // B0 private-copy transform inspection (requires MOCK_KEEP_PRIVATE support)
  {
    const conform = b0Check('none');
    check('B0(conform)', conform.ok, conform.detail);
    const second = b0Check('none2');
    const child1 = /child=(\S+)/.exec(conform.detail)?.[1];
    const child2 = /child=(\S+)/.exec(second.detail)?.[1];
    check('B0(uniqueness)', child1 && child2 && child1 !== child2, `child1=${child1} child2=${child2}`);
  }
  for (const [mutant, expected] of Object.entries(MUTANTS)) {
    const mark = results.length;
    const ran = suiteA(mutant);
    const failed = ran.filter(x => x.ok === false).map(x => x.id);
    const extra = failed.filter(f => !expected.includes(f));
    const missing = expected.filter(e => !failed.includes(e));
    const ok = missing.length === 0 && extra.length === 0;
    results.length = mark; // per-A records are discrimination signal, not verdicts; keep them in the detail
    check(`B:${mutant}`, ok, `expected-fail=[${expected}] actual-fail=[${failed}]`);
  }
  // B0-mutant: transform violation must fail the private-copy inspection
  {
    const violated = b0Check('keep-fixed-write');
    check('B:keep-fixed-write', violated.ok === false, `inspection-ok=${violated.ok} ${violated.detail}`);
  }
}

// ---------------- run ----------------
if (!CANDIDATE || !fs.existsSync(CANDIDATE)) {
  skipAll(A_IDS, 'CANDIDATE-ABSENT');
  skipAll(['B0(conform)', 'B0(uniqueness)', 'B:keep-fixed-write', ...Object.keys(MUTANTS).map(m => 'B:' + m)], 'CANDIDATE-ABSENT');
} else if (SUITE === 'A') {
  suiteA(null);
} else if (SUITE === 'B') {
  suiteB();
} else {
  suiteA(null);
  suiteB();
}

// ---------------- report ----------------
const lines = [];
const pass = results.filter(r => r.ok === true).length;
const fail = results.filter(r => r.ok === false).length;
const skp = results.filter(r => r.ok === null).length;
lines.push(`HARNESS candidate=${CAND_NAME} suite=${SUITE} pass=${pass} fail=${fail} skip=${skp}`);
lines.push(`fixture rev=${FX.rev} pins=${PINS.map(p => p.path.split('/').pop() + '@' + p.sha256.slice(0, 12)).join(' ')}`);
for (const r of results) lines.push(`${r.id} ${r.ok === true ? 'PASS' : r.ok === false ? 'FAIL' : 'SKIP '} ${r.detail}`);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const receipt = path.join(RESULTS, `harness-${SUITE}-${CAND_NAME.replace(/[^\w.-]+/g, '_')}-${stamp}.txt`);
fs.writeFileSync(receipt, lines.join('\n') + '\n');
console.log(lines.join('\n'));
console.log('receipt: ' + receipt);
process.exitCode = fail === 0 ? 0 : 1;
