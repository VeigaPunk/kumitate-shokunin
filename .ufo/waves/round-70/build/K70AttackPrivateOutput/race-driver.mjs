#!/usr/bin/env node
// K70AttackPrivateOutput — deterministic race driver.
// Modes:
//   race   two concurrent mock invocations, FIFO-barriered so both pass the
//          existence check before either creates (TOCTOU window made deterministic).
//   single one invocation against a pre-existing out (R9-style sequential arm).
//   symlink single invocation where out is a symlink to a victim file.
import fs from 'node:fs';
import path from 'node:path';
import {spawn, execFileSync} from 'node:child_process';

const argv = process.argv.slice(2);
function opt(name, dflt) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; }
const mode = opt('--mode');
const dir = opt('--dir');
const strategy = opt('--strategy');
const mock = opt('--mock');

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, {encoding: 'utf8', ...opts});
    let stdout = '', stderr = '';
    p.stdout.on('data', d => stdout += d);
    p.stderr.on('data', d => stderr += d);
    p.on('close', code => resolve({code, stdout, stderr}));
  });
}

async function main() {
  if (!mode || !dir || !strategy || !mock) {
    console.error('usage: --mode race|single|symlink --dir DIR --strategy S --mock PATH [--victim FILE]');
    process.exit(64);
  }
  fs.rmSync(dir, {recursive: true, force: true});
  fs.mkdirSync(dir, {recursive: true});

  const out = path.join(dir, 'result.txt');
  const childArgs = (nonce, extra = []) => [mock, '--out', out, '--strategy', strategy, '--nonce', nonce, ...extra];

  const result = {mode, strategy, out, runs: []};
  let fileAfter = null, victimBefore = null, victimAfter = null, victim = opt('--victim');

  if (mode === 'race') {
    const start = path.join(dir, 'start.fifo'), checked = path.join(dir, 'checked.fifo'), release = path.join(dir, 'release.fifo');
    for (const f of [start, checked, release]) execFileSync('mkfifo', [f]);
    const extra = ['--start', start, '--checked', checked, '--release', release];
    // Driver holds each FIFO open O_RDWR: child open() calls never block and no
    // rendezvous ordering exists; bytes sit in the pipe until the peer reads.
    const RD = fs.constants.O_RDWR;
    const fdStart = fs.openSync(start, RD), fdChecked = fs.openSync(checked, RD), fdRelease = fs.openSync(release, RD);
    const pa = run(process.execPath, childArgs('A', extra));
    const pb = run(process.execPath, childArgs('B', extra));
    fs.writeSync(fdStart, 'xx');                       // both children enter check phase
    const cb = Buffer.alloc(2); let got = 0;           // wait until BOTH children passed the check
    while (got < 2) got += fs.readSync(fdChecked, cb, got, 2 - got, null);
    fs.writeSync(fdRelease, 'xx');                     // both enter create phase -> deterministic TOCTOU window
    result.runs.push(await pa, await pb);
    fs.closeSync(fdStart); fs.closeSync(fdChecked); fs.closeSync(fdRelease);
  } else if (mode === 'single') {
    fs.writeFileSync(out, 'pre-existing-receipt do-not-overwrite\n');
    result.runs.push(await run(process.execPath, childArgs('solo')));
  } else if (mode === 'symlink') {
    if (!victim) { console.error('--victim required for symlink mode'); process.exit(64); }
    fs.writeFileSync(victim, 'VICTIM-CONTENT do-not-truncate\n');
    victimBefore = fs.readFileSync(victim, 'utf8');
    fs.symlinkSync(victim, out);
    result.runs.push(await run(process.execPath, childArgs('solo')));
  } else {
    console.error(`unknown mode: ${mode}`);
    process.exit(64);
  }

  fileAfter = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
  if (mode === 'symlink') victimAfter = fs.existsSync(victim) ? fs.readFileSync(victim, 'utf8') : null;

  result.exitCodes = result.runs.map(r => r.code);
  result.fileAfter = fileAfter;
  result.fileExists = fileAfter !== null;
  if (victim !== null && victim !== undefined) {
    result.victimUnchanged = victimBefore === victimAfter;
    result.victimAfter = victimAfter;
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch(e => { console.error(e); process.exit(2); });
