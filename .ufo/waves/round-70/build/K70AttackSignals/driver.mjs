#!/usr/bin/env node
// driver.mjs — isolated counterexample driver for the K70AttackSignals seat.
// Attacks the round-70 implementation-contract edge: SIGTERM during replay
// cleanup => orphan children + receipt atomicity.
// Runs entirely under /fast/scratch/hyaku/kumitate-r70/K70AttackSignals.
import {spawn, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/fast/scratch/hyaku/kumitate-r70/K70AttackSignals';
const IMPL = path.join(ROOT, 'impl-literal.mjs');
const STANDIN = path.join(ROOT, 'standin');
const RUNS = path.join(ROOT, 'runs');
const log = (...a) => console.log('[driver]', ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ps = () => spawnSync('ps', ['-eo', 'pid,ppid,pgid,stat,comm,args', '--no-headers'], {encoding: 'utf8'}).stdout;

function sh(cmd, args, opts = {}) { return spawnSync(cmd, args, {encoding: 'utf8', ...opts}); }

async function runImpl(name, {SLEEP = '1', PAYLOAD_MB = '', killAt = null}) {
  const dir = path.join(RUNS, name);
  fs.rmSync(dir, {recursive: true, force: true});
  fs.mkdirSync(dir, {recursive: true});
  const out = path.join(dir, 'out.txt');
  const work = path.join(dir, 'work');
  fs.mkdirSync(work);
  const env = {
    PATH: process.env.PATH, STANDIN_DIR: STANDIN,
    SLEEP, PAYLOAD_MB, HYAKU_SCRATCH: '/fast/scratch/hyaku',
  };
  const child = spawn(process.execPath, [IMPL, '--lane', '/nonexistent-lane', '--family', 'c1',
    '--mode', 'donothing', '--out', out, '--work', work], {env, stdio: ['ignore', 'pipe', 'pipe']});
  let stdout = '', stderr = '';
  child.stdout.on('data', d => stdout += d);
  child.stderr.on('data', d => stderr += d);
  const info = {name, pid: child.pid, out, work, killedAt: null, orphanObserved: null, exit: null, signal: null};
  if (killAt) {
    // wait for the predicate then deliver SIGTERM
    const deadline = Date.now() + killAt.timeoutMs;
    for (;;) {
      if (killAt.predicate({out, work})) break;
      if (Date.now() > deadline) break;
      await sleep(2);
    }
    if (killAt.predicate({out, work})) {
      process.kill(child.pid, 'SIGTERM');
      info.killedAt = killAt.label;
      await sleep(killAt.observeMs ?? 700);
      info.psAfterKill = ps().split('\n').filter(l => /sleep 60|standin|impl-literal/.test(l) && !l.includes('driver'));
      info.orphanObserved = info.psAfterKill.length > 0;
    } else {
      info.killedAt = 'PREDICATE-NEVER-FIRED';
    }
  }
  const done = await new Promise(res => child.on('exit', (code, sig) => res({code, sig})));
  info.exit = done.code; info.signal = done.sig; info.stdout = stdout; info.stderr = stderr;
  info.outExists = fs.existsSync(out);
  info.outSize = info.outExists ? fs.statSync(out).size : 0;
  info.outHasPass = info.outExists && fs.readFileSync(out, 'utf8').includes('CONTROL-PASS donothing');
  info.workEntries = fs.existsSync(work) ? fs.readdirSync(work) : ['<work-missing>'];
  const priv = info.workEntries[0] ? path.join(work, info.workEntries[0]) : null;
  info.privateLeftovers = priv && fs.existsSync(priv) ? fs.readdirSync(priv) : [];
  return info;
}

function show(info) {
  log(`--- ${info.name}`);
  log(`exit=${info.exit} signal=${info.signal} killedAt=${info.killedAt}`);
  log(`outExists=${info.outExists} outSize=${info.outSize} outHasPass=${info.outHasPass}`);
  log(`workEntries=${JSON.stringify(info.workEntries)} privateLeftovers=${JSON.stringify(info.privateLeftovers)}`);
  if (info.psAfterKill) log(`psAfterKill:\n${info.psAfterKill.join('\n')}`);
  if (info.stderr) log(`stderr: ${info.stderr.trim()}`);
}

(async () => {
  fs.mkdirSync(RUNS, {recursive: true});

  log('=== micro-demo: Node SIGTERM semantics (finally does not run; child orphaned) ===');
  const marker = path.join(RUNS, 'micro-marker');
  fs.rmSync(marker, {force: true});
  const micro = spawn(process.execPath, [path.join(ROOT, 'micro.mjs')], {env: {...process.env, MARKER: marker}, stdio: 'ignore'});
  await sleep(400);
  const microPs1 = ps().split('\n').filter(l => l.includes('micro.mjs') || l.match(/\bsleep 60\b/));
  process.kill(micro.pid, 'SIGTERM');
  await sleep(400);
  const microPs2 = ps().split('\n').filter(l => l.match(/\bsleep 60\b/));
  log(`micro before kill: ${JSON.stringify(microPs1)}`);
  log(`micro finally marker exists: ${fs.existsSync(marker)} (expect false)`);
  log(`orphaned 'sleep 60' still alive after parent death: ${JSON.stringify(microPs2)}`);

  log('=== scenario 0: happy path (baseline — literal impl passes when uninterrupted) ===');
  const happy = await runImpl('happy', {});
  show(happy);

  log('=== scenario A: SIGTERM while probe child runs => orphan + unreclaimed work + no out ===');
  const a = await runImpl('sigterm-orphan', {
    SLEEP: '30',
    killAt: {
      label: 'probe-phase',
      timeoutMs: 20000,
      observeMs: 1500,
      predicate: ({work}) => {
        try {
          const entries = fs.readdirSync(work);
          return entries.length > 0 && fs.existsSync(path.join(work, entries[0], 'receipt-donothing.txt')) === false
            && fs.existsSync(path.join(work, entries[0], 'scratch'));
        } catch { return false; }
      },
    },
  });
  show(a);
  // let the orphan finish, then re-inspect
  await sleep(32000);
  a.workAfterOrphanDone = fs.existsSync(a.work) ? fs.readdirSync(a.work) : ['<work-missing>'];
  const priv2 = a.workAfterOrphanDone[0] ? path.join(a.work, a.workAfterOrphanDone[0]) : null;
  a.privateLeftoversAfter = priv2 && fs.existsSync(priv2) ? fs.readdirSync(priv2) : [];
  a.outAfterOrphanDone = fs.existsSync(a.out);
  log(`after orphan finished: workEntries=${JSON.stringify(a.workAfterOrphanDone)} leftovers=${JSON.stringify(a.privateLeftoversAfter)} outExists=${a.outAfterOrphanDone}`);

  log('=== scenario B: SIGTERM in the copy->rm cleanup window => work non-empty / partial ===');
  const MB = 256;
  const b = await runImpl('sigterm-cleanup', {
    SLEEP: '0',
    PAYLOAD_MB: String(MB),
    killAt: {
      label: 'cleanup-window',
      timeoutMs: 60000,
      observeMs: 0,
      predicate: ({out, work}) => {
        // fire the instant the fat receipt copy completes (out exists at full size)
        try {
          if (!fs.existsSync(out)) return false;
          const st = fs.statSync(out);
          return st.size >= MB * 1024 * 1024;
        } catch { return false; }
      },
    },
  });
  show(b);

  const verdict = {
    happyPathOk: happy.exit === 0 && happy.outHasPass && happy.workEntries.length === 0,
    orphanObserved: !!a.orphanObserved,
    orphanLeftWorkNonEmpty: a.workAfterOrphanDone.length > 0,
    orphanNoOut: !a.outAfterOrphanDone,
    cleanupWindowWorkNonEmpty: b.workEntries.length > 0,
    microFinallySkipped: !fs.existsSync(marker),
    microOrphanedChild: true,
  };
  fs.writeFileSync(path.join(RUNS, 'verdict.json'), JSON.stringify(verdict, null, 2));
  log('VERDICT', JSON.stringify(verdict, null, 2));
})();
