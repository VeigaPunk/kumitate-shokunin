#!/usr/bin/env node
// K70ProbePartialOutput — isolated operability probe (round-70, seat leaf).
// Edge under test: CHILD PARTIAL WRITES and INTERRUPTION do not overwrite an
// EXISTING receipt, against the replay implementation contract
// (.ufo/waves/round-70/plan.md "Implementation contract").
//
// Method: run a PRIVATE COPY of the sibling synthetic candidate
// (private/control-replay.candidate.mjs, EXPECTED_PINS repointed at the real
// frozen r69 bytes) against a scratch fixture lane. The frozen originals
// c1-controls.sh / c2-controls.sh are NEVER executed directly: the candidate
// writes a substituted private copy under its own mkdtemp child and runs that.
// All kills are scoped to process groups / descendant trees this probe spawns.
//
// Arms:
//   A  baseline clean replays (c1/donothing, c1/autoledger)
//   B  parent-SIGKILL sweep at staggered phases (calibrated against measured T)
//   C  child-kill mid-run (bash child + node grandchild, targeted PIDs) with
//      the private child preserved (MOCK_KEEP_PRIVATE) to inspect leftovers
//   D  exclusive --out discipline: reuse after completion; reuse under kill
//   E  shared work parent holding interruption residue, then a fresh replay
//   F  TEETH negative control: the known receipt-clobbering attack tool
//      (sibling K70AttackReceiptOverwrite) must be DETECTED by the watcher
//   G  mechanism-only synthetic (NOT candidate verification): trickle child,
//      naive direct-write vs contract private-child pattern
//
// Invariants: fixture-lane receipt digests (5 files) and REAL lane live receipt
// digests never change; every byte a child writes lands under the private
// mkdtemp child; a pre-existing --out is never modified.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn, spawnSync} from 'node:child_process';

const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i += 2) opt[argv[i].replace(/^--/, '')] = argv[i + 1];
for (const k of ['cand', 'attack', 'fx', 'lane', 'sc']) if (!opt[k]) { console.error('missing --' + k); process.exit(64); }
const T_OVERRIDE = opt.t ? Number(opt.t) : null; // externally measured full-run ms
const QUICK = !!opt.quick;

const CAND = path.resolve(opt.cand);
const ATTACK = path.resolve(opt.attack);
const FX = path.resolve(opt.fx);
const LANE = path.resolve(opt.lane);
const SC = path.resolve(opt.sc);
const RECEIPTS = process.env.PROBE_RECEIPTS ? path.resolve(process.env.PROBE_RECEIPTS) : null;

fs.mkdirSync(SC, {recursive: true});
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const hfile = p => sha(fs.readFileSync(p));
const lines = [];
const say = s => { lines.push(s); console.log(s); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const receiptDir = l => path.join(l, '.ufo/waves/round-69/controls');
const receiptNames = ['c1-autoledger.txt', 'c1-donothing.txt', 'c2-autoorigin.txt', 'c2-donothing.txt', 'c2-forgecapture.txt'];
const digests = l => { const m = {}; for (const n of receiptNames) m[n] = hfile(path.join(receiptDir(l), n)); return m; };
const fxBase = digests(FX);
const laneBase = digests(LANE);
const fxOk = () => JSON.stringify(digests(FX)) === JSON.stringify(fxBase);
const laneOk = () => JSON.stringify(digests(LANE)) === JSON.stringify(laneBase);
const fxDiff = () => Object.entries(digests(FX)).filter(([n, h]) => h !== fxBase[n]).map(([n]) => n);

function watch(targets, tag) {
  const state = new Map(targets.map(p => [p, fs.existsSync(p) ? hfile(p) : null]));
  const events = [];
  const sweep = () => {
    for (const p of targets) {
      const cur = fs.existsSync(p) ? hfile(p) : null;
      if (cur !== state.get(p)) { events.push({tag, path: p, at: Date.now()}); state.set(p, cur); }
    }
  };
  const iv = setInterval(sweep, 10);
  return {events, stop: () => { clearInterval(iv); sweep(); }};
}

// descendants of pid via /proc (scoped to my own spawns; no pkill)
function descendantsOf(pid) {
  const table = new Map(); // pid -> ppid
  for (const d of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(d)) continue;
    try {
      const stat = fs.readFileSync(`/proc/${d}/stat`, 'utf8');
      const m = /^(\d+) \(.+\) \S+ (\d+) /.exec(stat);
      if (m) table.set(Number(m[1]), Number(m[2]));
    } catch {}
  }
  const out = [];
  for (const [p, pp] of table) { let q = pp; while (q) { if (q === pid) { out.push(p); break; } q = table.get(q) || 0; } }
  return out;
}
function killTree(pid, signal = 'SIGKILL') {
  for (const p of descendantsOf(pid).concat([pid])) { try { process.kill(p, signal); } catch {} }
}

function runCand(args, {killAt = null, killTreeAt = null, env = {}, keepPrivate = false} = {}) {
  return new Promise(resolve => {
    const fullEnv = {...process.env, HYAKU_SCRATCH: SC, ...(keepPrivate ? {MOCK_KEEP_PRIVATE: '1'} : {}), ...env};
    const t0 = Date.now();
    const p = spawn(process.execPath, [CAND, ...args], {env: fullEnv, detached: true, stdio: ['ignore', 'pipe', 'pipe']});
    let out = '', err = '';
    p.stdout.on('data', d => out += d);
    p.stderr.on('data', d => err += d);
    let killed = false;
    if (killAt != null) setTimeout(() => { try { process.kill(-p.pid, 'SIGKILL'); killed = true; } catch {} }, killAt);
    if (killTreeAt != null) setTimeout(() => { killTree(p.pid, 'SIGKILL'); killed = true; }, killTreeAt);
    p.on('close', (code, signal) => resolve({code, signal, killed, ms: Date.now() - t0, out, err, pid: p.pid}));
  });
}
const argsFor = (family, mode, out, work) => ['--lane', FX, '--family', family, '--mode', mode, '--out', out, '--work', work];
const res = [];
const record = (id, ok, detail) => { res.push({id, ok, detail}); say(`${id} ${ok ? 'PASS' : 'FAIL'} ${detail}`); };
const workEmpty = w => fs.existsSync(w) && fs.readdirSync(w).length === 0;
const onlyUnder = (root, w) => {
  const bad = [];
  const walk = d => { for (const e of fs.readdirSync(d)) { const p = path.join(d, e); if (!p.startsWith(root + path.sep) && p !== root) bad.push(p); if (fs.statSync(p).isDirectory()) walk(p); } };
  if (fs.existsSync(w)) walk(w);
  return bad;
};

(async () => {
  say(`# K70ProbePartialOutput probe ${new Date().toISOString()}`);
  say(`node=${process.version}`);
  say(`cand=${CAND}`);
  say(`fx=${FX} sc=${SC}`);
  say(`fxBase=${JSON.stringify(fxBase)}`);

  // ---- Arm A: clean baselines ----
  for (const mode of ['donothing', 'autoledger']) {
    const w = path.join(SC, `A-${mode}`); fs.rmSync(w, {recursive: true, force: true}); fs.mkdirSync(w, {recursive: true});
    const o = path.join(SC, `A-${mode}.out`); fs.rmSync(o, {force: true});
    const wv = watch(receiptNames.map(n => path.join(receiptDir(FX), n)), `A-${mode}`);
    const r = await runCand(argsFor('c1', mode, o, w));
    wv.stop();
    const text = fs.existsSync(o) ? fs.readFileSync(o, 'utf8') : '';
    const ok = r.code === 0 && text.includes('CONTROL-PASS ' + mode) && text.includes('LEDGER69_UNMET') && workEmpty(w) && fxOk() && laneOk() && wv.events.length === 0;
    record(`A-${mode}`, ok, `exit=${r.code} ms=${r.ms} out=${text.length}B workEmpty=${workEmpty(w)} fxStable=${fxOk()} laneStable=${laneOk()} watcher=${wv.events.length}`);
  }

  // ---- calibration ----
  let T = T_OVERRIDE;
  if (!T) {
    const cw = path.join(SC, 'cal', 'work'); fs.rmSync(path.join(SC, 'cal'), {recursive: true, force: true}); fs.mkdirSync(cw, {recursive: true});
    const co = path.join(SC, 'cal', 'out');
    const cal = await runCand(argsFor('c1', 'autoledger', co, cw));
    T = cal.ms;
    say(`calibration autoledger T=${T}ms exit=${cal.code}`);
  } else say(`calibration T supplied externally: ${T}ms`);

  // ---- Arm B: parent-SIGKILL sweep ----
  const phases = QUICK ? [Math.round(T * 0.5)] : [...new Set([80, Math.round(T * 0.25), Math.round(T * 0.5), Math.round(T * 0.75)])];
  for (const ph of phases) {
    const w = path.join(SC, `B-${ph}`); fs.rmSync(w, {recursive: true, force: true}); fs.mkdirSync(w, {recursive: true});
    const o = path.join(SC, `B-${ph}.out`); fs.rmSync(o, {force: true});
    const wv = watch(receiptNames.map(n => path.join(receiptDir(FX), n)), `B-${ph}`);
    const r = await runCand(argsFor('c1', 'autoledger', o, w), {killAt: ph, keepPrivate: true});
    wv.stop();
    await sleep(200);
    const outNow = fs.existsSync(o) ? fs.statSync(o).size : -1;
    const residue = fs.existsSync(w) ? fs.readdirSync(w) : ['<work-missing>'];
    const childDir = residue.length === 1 && residue[0] !== '<work-missing>' ? path.join(w, residue[0]) : null;
    const bad = childDir ? onlyUnder(childDir, w) : [];
    const ok = fxOk() && laneOk() && wv.events.length === 0 && bad.length === 0;
    record(`B-kill@${ph}ms`, ok, `exit=${r.code} sig=${r.signal} ran=${r.ms}ms outBytes=${outNow} residue=${JSON.stringify(residue)} outsideChild=${bad.length} fxStable=${fxOk()} watcher=${wv.events.length}`);
  }

  // ---- Arm C: child-kill mid-run with private child preserved ----
  const cPhases = QUICK ? [Math.round(T * 0.5)] : [Math.round(T * 0.3), Math.round(T * 0.6)];
  for (let i = 0; i < cPhases.length; i++) {
    const ph = cPhases[i];
    const w = path.join(SC, `C-${i}`); fs.rmSync(w, {recursive: true, force: true}); fs.mkdirSync(w, {recursive: true});
    const o = path.join(SC, `C-${i}.out`); fs.rmSync(o, {force: true});
    const wv = watch(receiptNames.map(n => path.join(receiptDir(FX), n)), `C-${i}`);
    const r = await runCand(argsFor('c1', 'donothing', o, w), {killTreeAt: ph, keepPrivate: true});
    wv.stop();
    await sleep(200);
    const kids = fs.existsSync(w) ? fs.readdirSync(w) : [];
    let receiptInfo = 'none', complete = false;
    if (kids.length) {
      const rp = path.join(w, kids[0], 'w', 'c1-donothing.txt');
      if (fs.existsSync(rp)) {
        const txt = fs.readFileSync(rp, 'utf8');
        complete = txt.includes('exit=1') || txt.includes('exit=0');
        receiptInfo = `${txt.length}B complete=${complete}`;
      } else receiptInfo = 'absent';
    }
    const outBytes = fs.existsSync(o) ? fs.statSync(o).size : -1;
    // isolation invariants always; exit!=0 required whenever the kill connected (receipt incomplete)
    const ok = fxOk() && laneOk() && wv.events.length === 0 && (complete || r.code !== 0);
    record(`C-childkill@${ph}ms-${i}`, ok, `candidateExit=${r.code} ran=${r.ms}ms leftoverReceipt=${receiptInfo} outBytes=${outBytes} fxStable=${fxOk()} watcher=${wv.events.length}`);
  }

  // ---- Arm D: exclusive --out discipline ----
  {
    const w = path.join(SC, 'D1'); fs.rmSync(w, {recursive: true, force: true}); fs.mkdirSync(w, {recursive: true});
    const o = path.join(SC, 'D.out'); fs.rmSync(o, {force: true});
    const r1 = await runCand(argsFor('c1', 'donothing', o, w));
    const d1 = hfile(o);
    const w2 = path.join(SC, 'D2'); fs.rmSync(w2, {recursive: true, force: true}); fs.mkdirSync(w2, {recursive: true});
    const r2 = await runCand(argsFor('c1', 'donothing', o, w2));
    const d2 = hfile(o);
    record('D-exclusive-out', r1.code === 0 && r2.code === 73 && d1 === d2 && fxOk() && laneOk(), `first=${r1.code} second=${r2.code}(want 73) outUnchanged=${d1 === d2} err2=${(r2.err || '').trim().split('\n')[0]}`);
    const w3 = path.join(SC, 'D3'); fs.rmSync(w3, {recursive: true, force: true}); fs.mkdirSync(w3, {recursive: true});
    const before = hfile(o);
    const r3 = await runCand(argsFor('c1', 'autoledger', o, w3), {killAt: 250});
    record('D-exclusive-under-kill', r3.code === 73 && hfile(o) === before && fxOk() && laneOk(), `exit=${r3.code}(want 73, refusal precedes kill) outUnchanged=${hfile(o) === before}`);
  }

  // ---- Arm E: shared work parent holding interruption residue ----
  {
    const wShared = path.join(SC, 'E-shared'); fs.rmSync(wShared, {recursive: true, force: true}); fs.mkdirSync(wShared, {recursive: true});
    await runCand(argsFor('c1', 'donothing', path.join(SC, 'E0.out'), wShared), {killAt: 120, keepPrivate: true});
    await sleep(200);
    const residueBefore = fs.readdirSync(wShared);
    const o1 = path.join(SC, 'E1.out'); fs.rmSync(o1, {force: true});
    const r1 = await runCand(argsFor('c1', 'autoledger', o1, wShared));
    const residueAfter = fs.readdirSync(wShared);
    record('E-shared-parent-residue', r1.code === 0 && fxOk() && laneOk() && residueBefore.length >= 1 && residueAfter.length === residueBefore.length, `residueBefore=${residueBefore.length} freshRun=${r1.code} residueAfter=${residueAfter.length} note=old child dir remains but is never reused (mkdtemp unique)`);
  }

  // ---- Arm F: TEETH — attack tool must be detected ----
  {
    const fxAtk = path.join(SC, 'fx-attack');
    fs.rmSync(fxAtk, {recursive: true, force: true}); fs.mkdirSync(fxAtk, {recursive: true});
    const ar = spawnSync('bash', ['-c', `git -C ${JSON.stringify(LANE)} archive 78b98d762ccf3e3a0961f94c4042eaabd2bcb706 scripts corpus SKILL.md SCORECARD.md .ufo/waves/round-69/probe .ufo/waves/round-69/controls | tar -x --no-same-owner --no-same-permissions -C ${JSON.stringify(fxAtk)}`], {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
    if (ar.status !== 0) throw Error('fx-attack archive failed: ' + ar.stderr);
    const w = path.join(SC, 'F-work'); fs.rmSync(w, {recursive: true, force: true}); fs.mkdirSync(w, {recursive: true});
    const o = path.join(SC, 'F.out'); fs.rmSync(o, {force: true});
    const wv = watch(receiptNames.map(n => path.join(receiptDir(fxAtk), n)), 'F-attack');
    const r = await new Promise(res2 => {
      const p = spawn(process.execPath, [ATTACK, '--lane', fxAtk, '--family', 'c1', '--mode', 'donothing', '--out', o, '--work', w], {stdio: ['ignore', 'pipe', 'pipe']});
      let out = '', err = ''; p.stdout.on('data', d => out += d); p.stderr.on('data', d => err += d);
      p.on('close', code => res2({code, out, err}));
    });
    wv.stop();
    const clobbered = fs.readFileSync(path.join(receiptDir(fxAtk), 'c1-donothing.txt'), 'utf8').includes('CLOBBERED-BY-ATTACK');
    record('F-teeth-attack-detected', r.code === 0 && clobbered && wv.events.length >= 1, `attackExit=${r.code} clobbered=${clobbered} watcherSaw=${wv.events.length}`);
    fs.rmSync(fxAtk, {recursive: true, force: true});
  }

  // ---- Arm G: mechanism-only synthetic ----
  {
    const g = path.join(SC, 'G'); fs.rmSync(g, {recursive: true, force: true}); fs.mkdirSync(g, {recursive: true});
    const target = path.join(g, 'existing-receipt.txt');
    const PRECIOUS = 'PRECIOUS-RECEIPT-v1\n';
    fs.writeFileSync(target, PRECIOUS);
    const trickle = t => `const fs=require('fs');const fd=fs.openSync(${JSON.stringify(t)},'w');const buf=Buffer.from('CLOBBERED-'.repeat(500));let i=0;const iv=setInterval(()=>{try{fs.writeSync(fd,buf.subarray(i,i+7));i+=7;if(i>=buf.length)clearInterval(iv);}catch{clearInterval(iv)}},15);setInterval(()=>{},1000);`;
    const naive = spawn('node', ['-e', trickle(target)], {detached: true, stdio: 'ignore'});
    await sleep(200); try { process.kill(-naive.pid, 'SIGKILL'); } catch {}
    await sleep(80);
    const naiveCl = fs.readFileSync(target, 'utf8');
    record('G-mechanism-naive-clobbers', naiveCl !== PRECIOUS, `direct child write left receipt=${JSON.stringify(naiveCl.slice(0, 24))} (mechanism-only, not candidate verification)`);
    fs.writeFileSync(target, PRECIOUS);
    const child = path.join(g, 'replay-x'); fs.mkdirSync(child, {recursive: true});
    const priv = path.join(child, 'partial.txt');
    const c2p = spawn('node', ['-e', trickle(priv)], {detached: true, stdio: 'ignore'});
    await sleep(200); try { process.kill(-c2p.pid, 'SIGKILL'); } catch {}
    await sleep(80);
    const privBytes = fs.existsSync(priv) ? fs.statSync(priv).size : 0;
    const targetIntact = fs.readFileSync(target, 'utf8') === PRECIOUS;
    fs.rmSync(child, {recursive: true, force: true});
    record('G-mechanism-contract-intact', targetIntact && privBytes > 0, `private-child partial=${privBytes}B never reached existing receipt; intact=${targetIntact} (mechanism-only)`);
  }

  record('Z-final-guards', fxOk() && laneOk(), `fxStable=${fxOk()} laneStable=${laneOk()}`);
  const pass = res.filter(r => r.ok).length;
  say(`SUMMARY ${pass}/${res.length} invariants held; fxChanged=[${fxDiff()}] laneChanged=${!laneOk()}`);
  if (RECEIPTS) {
    fs.mkdirSync(RECEIPTS, {recursive: true});
    fs.writeFileSync(path.join(RECEIPTS, 'probe-receipt.txt'), lines.join('\n') + '\n');
  }
  process.exitCode = res.every(r => r.ok) ? 0 : 1;
})().catch(e => { say('PROBE-ERROR ' + e.message + '\n' + e.stack); if (RECEIPTS) { fs.mkdirSync(RECEIPTS, {recursive: true}); fs.writeFileSync(path.join(RECEIPTS, 'probe-receipt.txt'), lines.join('\n') + '\n'); } process.exitCode = 2; });
