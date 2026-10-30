#!/usr/bin/env node
// driver-b.mjs — Scenario B: SIGTERM in the copy->rm cleanup window.
// The receipt is a fat (256MB) file so the copyFileSync completes measurably
// before rmSync begins; we deliver SIGTERM the instant --out reaches full size.
import {spawn, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/fast/scratch/hyaku/kumitate-r70/K70AttackSignals';
const IMPL = path.join(ROOT, 'impl-literal.mjs');
const STANDIN = path.join(ROOT, 'standin');
const dir = path.join(ROOT, 'runs/sigterm-cleanup');
fs.rmSync(dir, {recursive: true, force: true});
fs.mkdirSync(dir, {recursive: true});
const out = path.join(dir, 'out.txt');
const work = path.join(dir, 'work');
fs.mkdirSync(work);
const MB = 256;
const log = (...a) => console.log('[driver-b]', ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const env = {PATH: process.env.PATH, STANDIN_DIR: STANDIN, SLEEP: '0', PAYLOAD_MB: String(MB)};
const child = spawn(process.execPath, [IMPL, '--lane', '/x', '--family', 'c1', '--mode', 'donothing',
  '--out', out, '--work', work], {env, stdio: ['ignore', 'pipe', 'pipe']});
let stderr = ''; child.stderr.on('data', d => stderr += d);

const deadline = Date.now() + 90000;
let fired = false;
for (;;) {
  try {
    if (fs.existsSync(out) && fs.statSync(out).size >= MB * 1024 * 1024) {
      process.kill(child.pid, 'SIGTERM');
      fired = true;
      break;
    }
  } catch {}
  if (Date.now() > deadline) break;
  await sleep(1);
}
log(`fired=${fired}`);
const done = await new Promise(res => child.on('exit', (code, sig) => res({code, sig})));
log(`exit=${done.code} signal=${done.sig}`);
log(`outExists=${fs.existsSync(out)} outSize=${fs.existsSync(out) ? fs.statSync(out).size : 0}`);
const wk = fs.existsSync(work) ? fs.readdirSync(work) : ['<missing>'];
log(`workEntries=${JSON.stringify(wk)}`);
for (const e of wk) {
  const p = path.join(work, e);
  if (fs.existsSync(p)) log(`leftover ${e}: ${JSON.stringify(fs.readdirSync(p))}`);
}
if (stderr) log(`stderr=${stderr.trim()}`);
