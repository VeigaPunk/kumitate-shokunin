#!/usr/bin/env node
// probe-header-modes.mjs — K70ProbeHeaderModes (round-70 C1 replay, leaf seat).
//
// Isolated executable probe of the replay implementation contract's HEADER surface:
//   * family enum: exactly c1 | c2
//   * five valid (family, mode) pairs:
//       c1: donothing, autoledger
//       c2: donothing, autoorigin, forgecapture
//   * every invalid pair usage (family outside the enum crossed with modes outside
//     the family's set, incl. case/whitespace variants and cross-family modes)
//   * structural usage errors (missing/unknown flags)            -> expect exit 64
//   * exclusive output creation (R9 coupling: refusal must not touch existing out)
//
// Usage: node probe-header-modes.mjs TOOL [LANE] [--out-dir DIR] [--tag LABEL]
//   TOOL  path to the control-replay implementation under test.
//   LANE  lane root (default /home/vgpnk/Projects/shokunin/kumitate-shokunin).
//   Receipts (header-modes-receipt.txt / .json) are written to --out-dir (default cwd).
//   Scratch sandboxes live under $HYAKU_SCRATCH/kumitate-r70/K70ProbeHeaderModes/
//   and are removed on exit (receipts are written to --out-dir first).
//
// Mode is derived from TOOL: lane scripts/control-replay.mjs => 'candidate',
// anything else => 'mechanism-only' (NOT candidate verification).
//
// Exit map: 0 all scored expectations met, 1 at least one MISS, 2 probe error.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const DEFAULT_LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const VALID = [['c1','donothing'],['c1','autoledger'],['c2','donothing'],['c2','autoorigin'],['c2','forgecapture']];
const LABEL = {c1:'LEDGER69_UNMET', c2:'DEPREC69_UNMET'};
const FAMILY_SET = ['junk','C1','c3','','c1 ',' c1','c11','C2'];            // none equal c1|c2 exactly
const MODE_SET   = ['donothing','autoledger','autoorigin','forgecapture','junk','','DONOTHING','Autoledger'];
const sha = b => crypto.createHash('sha256').update(b).digest('hex');

const argv = process.argv.slice(2);
if (argv.length < 1) { console.error('usage: probe-header-modes.mjs TOOL [LANE] [--out-dir DIR] [--tag LABEL]'); process.exit(64); }
const tool = path.resolve(argv[0]);
const lane = argv[1] && !argv[1].startsWith('--') ? path.resolve(argv[1]) : DEFAULT_LANE;
const opt = (name, dflt) => { const i = argv.indexOf('--'+name); return i >= 0 ? argv[i+1] : dflt; };
const outDir = path.resolve(opt('out-dir', process.cwd()));
const tag = opt('tag', 'untagged');
const mode = tool === path.join(lane,'scripts','control-replay.mjs') ? 'candidate' : 'mechanism-only';

const scratchBase = path.join(process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku', 'kumitate-r70', 'K70ProbeHeaderModes');
fs.mkdirSync(scratchBase, {recursive: true});
const runRoot = fs.mkdtempSync(path.join(scratchBase, 'run-'));

const results = [];
const rec = (id, kind, argvUsed, expect, observed, verdict, note='') =>
  results.push({id, kind, argv: argvUsed, expect, observed, verdict, note});

function runTool(args, sandbox) {
  const tmp = path.join(sandbox, 'tmp'); fs.mkdirSync(tmp, {recursive: true});
  const work = path.join(sandbox, 'work'); fs.mkdirSync(work, {recursive: true});
  const env = { PATH: process.env.PATH || '/usr/bin:/bin',
                HOME: process.env.HOME || '/',
                TMPDIR: tmp,
                HYAKU_SCRATCH: scratchBase };
  const r = spawnSync(process.execPath, [tool, ...args], {cwd: sandbox, env, encoding: 'utf8', timeout: 300000, maxBuffer: 8*1024*1024});
  const workLeftovers = fs.existsSync(work) ? fs.readdirSync(work) : ['<work-missing>'];
  return { status: r.status, signal: r.signal, stdout: r.stdout || '', stderr: r.stderr || '', workLeftovers,
           timedOut: r.error && r.error.code === 'ETIMEDOUT' };
}

function fullArgs(family, modeName, sandbox, outName='out.txt') {
  return ['--lane', lane, '--family', family, '--mode', modeName, '--out', path.join(sandbox, outName), '--work', path.join(sandbox, 'work')];
}

try {
  const toolBytes = fs.existsSync(tool) ? fs.readFileSync(tool) : null;
  const toolSha = toolBytes ? sha(toolBytes) : '<tool-absent>';
  const header = { probe: 'probe-header-modes.mjs', tool, toolSha, mode, lane, tag,
                   node: process.version, started: new Date().toISOString() };
  console.log(`HEADER_MODES_PROBE tool=${tool} mode=${mode} sha256=${toolSha} lane=${lane} tag=${tag}`);

  // S00 — self-invocation surface
  {
    const sb = fs.mkdtempSync(path.join(runRoot, 'selftest-'));
    const r = runTool(['--selftest'], sb);
    const ok = r.status === 0 && /^CONTROL_REPLAY_SELFTEST: PASS/m.test(r.stdout);
    rec('HM-S00','selftest',['--selftest'],'exit 0 + CONTROL_REPLAY_SELFTEST: PASS',
        {status:r.status, selftestLine:/^CONTROL_REPLAY_SELFTEST: PASS/m.test(r.stdout), stderr:r.stderr.slice(0,200)}, ok?'PASS':'MISS');
  }

  // V01..V05 — the five valid pairs
  VALID.forEach(([family, modeName], i) => {
    const sb = fs.mkdtempSync(path.join(runRoot, `valid-${family}-${modeName}-`));
    const args = fullArgs(family, modeName, sb);
    const out = args[args.indexOf('--out')+1];
    const r = runTool(args, sb);
    const outExists = fs.existsSync(out);
    const text = outExists ? fs.readFileSync(out,'utf8') : '';
    const stray = fs.readdirSync(sb).filter(f => !['tmp','work','out.txt'].includes(f));
    const ok = r.status === 0 && outExists
            && text.includes(LABEL[family]) && text.includes(`CONTROL-PASS ${modeName}`)
            && r.workLeftovers.length === 0 && stray.length === 0;
    rec(`HM-V0${i+1}`,'valid-pair',args,`exit 0; out has ${LABEL[family]} + CONTROL-PASS ${modeName}; work reclaimed; no stray files`,
        {status:r.status, outExists, label:text.includes(LABEL[family]), controlPass:text.includes(`CONTROL-PASS ${modeName}`),
         workLeftovers:r.workLeftovers, stray}, ok?'PASS':'MISS',
        `receipt ${outExists ? text.length + 'B' : 'absent'}`);
  });

  // I01.. — every invalid pair usage: family outside {c1,c2} x any mode,
  //          plus exact-family crossed with modes outside that family's set.
  let n = 0;
  const invalidPairs = [];
  for (const f of FAMILY_SET) for (const m of MODE_SET) invalidPairs.push([f, m]);
  for (const f of ['c1','c2']) for (const m of MODE_SET) {
    if (!VALID.some(([vf, vm]) => vf === f && vm === m)) invalidPairs.push([f, m]);
  }
  for (const [family, modeName] of invalidPairs) {
    n += 1;
    const sb = fs.mkdtempSync(path.join(runRoot, `inv-${String(n).padStart(3,'0')}-`));
    const args = fullArgs(family, modeName, sb);
    const out = args[args.indexOf('--out')+1];
    const r = runTool(args, sb);
    const outCreated = fs.existsSync(out);
    const diag = (r.stdout + r.stderr).length > 0;
    const ok = r.status === 64 && !outCreated && r.workLeftovers.length === 0 && diag;
    rec(`HM-I${String(n).padStart(3,'0')}`,'invalid-pair',args,'exit 64; no out created; work untouched; usage diagnostic emitted',
        {status:r.status, outCreated, workLeftovers:r.workLeftovers, diag, stderr:r.stderr.slice(0,160)}, ok?'PASS':'MISS',
        `family=${JSON.stringify(family)} mode=${JSON.stringify(modeName)}`);
  }
  const invalidCount = n;

  // U01..U06 — structural usage errors
  const structural = [
    ['HM-U01','bare invocation',[]],
    ['HM-U02','missing --family',['--lane',lane,'--mode','donothing','--out','O','--work','W']],
    ['HM-U03','missing --mode',['--lane',lane,'--family','c1','--out','O','--work','W']],
    ['HM-U04','missing --out',['--lane',lane,'--family','c1','--mode','donothing','--work','W']],
    ['HM-U05','missing --work',['--lane',lane,'--family','c1','--mode','donothing','--out','O']],
    ['HM-U06','unknown flag',['--lane',lane,'--family','c1','--mode','donothing','--out','O','--work','W','--frobnicate','x']],
  ];
  for (const [id, name, args0] of structural) {
    const sb = fs.mkdtempSync(path.join(runRoot, `struct-${id}-`));
    const args = args0.map(a => a === 'O' ? path.join(sb,'out.txt') : a === 'W' ? path.join(sb,'work') : a);
    const r = runTool(args, sb);
    const outArg = args[args.indexOf('--out') + 1];
    const outCreated = outArg !== undefined ? fs.existsSync(outArg) : false;
    const ok = r.status === 64;
    rec(id,'structural',args,`exit 64 (${name})`,{status:r.status, outCreated, stderr:r.stderr.slice(0,160)}, ok?'PASS':'MISS', name);
  }

  // X1/X2 — exclusive output creation (R9 coupling)
  {
    const sb = fs.mkdtempSync(path.join(runRoot, 'excl-valid-'));
    const args = fullArgs('c1','donothing',sb);
    const out = args[args.indexOf('--out')+1];
    fs.writeFileSync(out, 'do-not-overwrite\n');
    const r = runTool(args, sb);
    const intact = fs.readFileSync(out,'utf8') === 'do-not-overwrite\n';
    const ok = r.status !== 0 && r.status !== null && intact;
    rec('HM-X1','exclusive-out',args,'valid pair vs pre-existing out: nonzero exit, sentinel unchanged',
        {status:r.status, intact, stderr:r.stderr.slice(0,160)}, ok?'PASS':'MISS','exclusive creation');
  }
  {
    const sb = fs.mkdtempSync(path.join(runRoot, 'excl-invalid-'));
    const args = fullArgs('c1','autoorigin',sb);
    const out = args[args.indexOf('--out')+1];
    fs.writeFileSync(out, 'do-not-overwrite\n');
    const r = runTool(args, sb);
    const intact = fs.readFileSync(out,'utf8') === 'do-not-overwrite\n';
    const ok = r.status === 64 && intact;
    rec('HM-X2','exclusive-out-invalid',args,'invalid pair vs pre-existing out: exit 64, sentinel unchanged',
        {status:r.status, intact, stderr:r.stderr.slice(0,160)}, ok?'PASS':'MISS','refusal before output');
  }

  // N01..N03 — informational, no expectation (contract unspecified)
  const informational = [
    ['HM-N1','duplicated --family (last-wins vs refuse unspecified)', (sb)=>fullArgs('c1','donothing',sb).concat(['--family','c2'])],
    ['HM-N2','--selftest plus extra args', ()=>['--selftest','--family','c1']],
    ['HM-N3','equals-form --family=c1', (sb)=>[`--lane=${lane}`,'--family=c1','--mode=donothing',`--out=${path.join(sb,'out.txt')}`,`--work=${path.join(sb,'work')}`]],
  ];
  for (const [id, name, mk] of informational) {
    const sb = fs.mkdtempSync(path.join(runRoot, `info-${id}-`));
    const args = mk(sb);
    const r = runTool(args, sb);
    rec(id,'informational',args,'(none — contract unspecified)',{status:r.status, stdout:r.stdout.slice(0,120), stderr:r.stderr.slice(0,160)}, 'INFO', name);
  }

  // ---- receipts ----
  const scored = results.filter(r => r.verdict !== 'INFO');
  const held = scored.filter(r => r.verdict === 'PASS').length;
  const lines = [];
  lines.push(`HEADER_MODES_PROBE tool=${tool}`);
  lines.push(`mode=${mode} tag=${tag} node=${process.version} started=${header.started}`);
  lines.push(`tool_sha256=${toolSha}`);
  for (const r of results) {
    const argStr = r.argv.join(' ').replaceAll(runRoot,'$RUN');
    lines.push(`${r.id} ${r.verdict} kind=${r.kind} expect=${r.expect} note=${r.note}`);
    lines.push(`  argv: ${argStr}`);
    lines.push(`  observed: ${JSON.stringify(r.observed)}`);
  }
  lines.push(`HEADER_MODES_${held === scored.length ? 'HELD' : 'UNMET'} held=${held}/${scored.length} mode=${mode} tag=${tag}`);
  fs.mkdirSync(outDir, {recursive: true});
  fs.writeFileSync(path.join(outDir, 'header-modes-receipt.txt'), lines.join('\n') + '\n');
  fs.writeFileSync(path.join(outDir, 'header-modes-results.json'), JSON.stringify({header, held, total: scored.length, results}, null, 2) + '\n');
  console.log(lines[lines.length - 1]);
  for (const r of results) if (r.verdict === 'MISS') console.log(`${r.id} MISS kind=${r.kind} note=${r.note} observed=${JSON.stringify(r.observed).slice(0,240)}`);
  process.exitCode = held === scored.length ? 0 : 1;
} catch (e) {
  console.log(`HEADER_MODES_ERROR reason=${e.message}`);
  process.exitCode = 2;
} finally {
  fs.rmSync(runRoot, {recursive: true, force: true});
}
