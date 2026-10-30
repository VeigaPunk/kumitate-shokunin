#!/usr/bin/env node
// K70ProbeUmask — isolated probe: exclusive receipt creation under umask 077 vs default 022.
// Target: sibling candidate model of scripts/control-replay.mjs receipt-creation core
// (copied unmodified to candidate-private.mjs, sha256 recorded in transcript).
// Contract edges exercised (frozen plan.md):
//   - "output creation exclusive"  (R9: existing output refused, bytes preserved)
//   - "Unique mkdtemp child under the supplied work root, receipts copied out before cleanup"
//   - receipt file mode must follow the caller's umask (operability under umask 077)
// Originals c1-controls.sh / c2-controls.sh / frozen probes are NEVER executed.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const BUILD = path.dirname(new URL(import.meta.url).pathname);
const SCRATCH = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
const ROOT = path.join(SCRATCH, 'kumitate-r70', 'K70ProbeUmask');
const CAND = path.join(BUILD, 'candidate-private.mjs');
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';

const lines = [];
const emit = s => { lines.push(s); };
const sh = (mask, args, opts = {}) =>
  spawnSync('sh', ['-c', `umask ${mask}; exec node "$@"`, 'sh', ...args],
    {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, ...opts});
const mode = p => (fs.statSync(p).mode & 0o777).toString(8).padStart(3, '0');

emit('# K70ProbeUmask transcript ' + new Date().toISOString());
emit('node=' + process.version + ' host_umask=' + (os.userInfo ? '' : '') +
     spawnSync('sh', ['-c', 'umask'], {encoding: 'utf8'}).stdout.trim());
emit('candidate=' + CAND);

const results = [];
for (const mask of ['077', '022']) {
  const base = path.join(ROOT, `m${mask}`);
  fs.rmSync(base, {recursive: true, force: true});
  fs.mkdirSync(base, {recursive: true});

  // 0. prove the wrapper actually sets the child umask (mechanism evidence)
  const u = sh(mask, ['-e', 'console.log("child_umask=" + process.umask().toString(8))']);
  emit(`\n## umask=${mask} child-umask probe: exit=${u.status} out=${u.stdout.trim()}`);

  // 1. fresh exclusive run
  const out1 = path.join(base, 'receipt-c1-donothing.txt');
  const work1 = path.join(base, 'work1'); fs.mkdirSync(work1);
  const r1 = sh(mask, [CAND, '--lane', LANE, '--family', 'c1', '--mode', 'donothing', '--out', out1, '--work', work1]);
  const ok1 = r1.status === 0 && fs.existsSync(out1) &&
    fs.readFileSync(out1, 'utf8').includes('LEDGER69_UNMET') &&
    fs.readFileSync(out1, 'utf8').includes('CONTROL-PASS donothing') &&
    fs.readdirSync(work1).length === 0;
  emit(`run fresh: exit=${r1.status} stdout=${r1.stdout.trim()} stderr=${r1.stderr.trim()}`);
  emit(`receipt mode=${mode(out1)} workdir_after=${JSON.stringify(fs.readdirSync(work1))} content=${JSON.stringify(fs.readFileSync(out1, 'utf8'))}`);
  results.push({id: `FRESH-${mask}`, ok: ok1, detail: `exit=${r1.status} mode=${mode(out1)} workEmpty=${fs.readdirSync(work1).length === 0}`});

  // 2. R9 collision: pre-existing output must be refused, bytes preserved
  const out2 = path.join(base, 'existing.txt');
  fs.writeFileSync(out2, 'do-not-overwrite\n');
  const r2 = sh(mask, [CAND, '--lane', LANE, '--family', 'c1', '--mode', 'donothing', '--out', out2, '--work', base]);
  const preserved = fs.readFileSync(out2, 'utf8') === 'do-not-overwrite\n';
  const ok2 = r2.status !== 0 && preserved;
  emit(`run collision: exit=${r2.status} stderr=${r2.stderr.trim()} preserved=${preserved} mode=${mode(out2)}`);
  results.push({id: `COLLIDE-${mask}`, ok: ok2, detail: `exit=${r2.status} preserved=${preserved}`});

  // 3. concurrency: 8 racing spawns on one out file — exactly one winner
  const out3 = path.join(base, 'raced.txt');
  const work3 = path.join(base, 'work3'); fs.mkdirSync(work3);
  const kids = Array.from({length: 8}, () =>
    sh(mask, [CAND, '--lane', LANE, '--family', 'c2', '--mode', 'forgecapture', '--out', out3, '--work', work3]));
  const wins = kids.filter(k => k.status === 0).length;
  const body = fs.existsSync(out3) ? fs.readFileSync(out3, 'utf8') : '';
  const ok3 = wins === 1 && body.split('DEPREC69_UNMET').length === 2 && body.includes('CONTROL-PASS forgecapture');
  emit(`run race: winners=${wins}/8 exits=[${kids.map(k => k.status).join(',')}] content=${JSON.stringify(body)} mode=${mode(out3)} workEmpty=${fs.readdirSync(work3).length === 0}`);
  results.push({id: `RACE-${mask}`, ok: ok3, detail: `winners=${wins}/8 singleReceipt=${ok3}`});
}

// 4. mechanism-only reproduction (NOT candidate verification):
//    bare O_EXCL create honors caller umask; second create refuses.
emit('\n## mechanism-only synthetic reproduction (openSync wx + umask)');
for (const mask of ['077', '022']) {
  const dir = path.join(ROOT, `mech-${mask}`); fs.mkdirSync(dir, {recursive: true});
  const p = path.join(dir, 'm.txt');
  const probe = [
    "const fs=require('node:fs');",
    `const fd=fs.openSync(process.argv[1],'wx');`,
    `fs.writeFileSync(fd,'x'); fs.closeSync(fd);`,
    `let second='ok'; try{fs.openSync(process.argv[1],'wx')}catch(e){second=e.code}`,
    `console.log('first_mode='+(fs.statSync(process.argv[1]).mode&0o777).toString(8).padStart(3,'0')+' second_open='+second);`,
  ].join('\n');
  const r = sh(mask, ['-e', probe, p]);
  emit(`mech umask=${mask}: exit=${r.status} ${r.stdout.trim()}`);
  results.push({id: `MECH-${mask}`, ok: r.status === 0 && /first_mode=6(00|44)/.test(r.stdout), detail: r.stdout.trim()});
}

fs.writeFileSync(path.join(BUILD, 'probe-transcript.txt'), lines.join('\n') + '\n');
fs.writeFileSync(path.join(BUILD, 'probe-results.json'), JSON.stringify({results}, null, 2) + '\n');
const allOk = results.every(r => r.ok);
console.log(lines.join('\n'));
console.log(`PROBE_UMASK_${allOk ? 'PASS' : 'FAIL'} ${results.filter(r => r.ok).length}/${results.length}`);
process.exitCode = allOk ? 0 : 1;
