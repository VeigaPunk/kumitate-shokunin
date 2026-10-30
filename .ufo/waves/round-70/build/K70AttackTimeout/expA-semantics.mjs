#!/usr/bin/env node
// Experiment A: raw spawnSync timeout semantics (what does a killed child look like?).
import {spawnSync} from 'node:child_process';
const hang = '/fast/scratch/hyaku/kumitate-r70/K70AttackTimeout/sim/child-hang-after-print.sh';
const work = '/fast/scratch/hyaku/kumitate-r70/K70AttackTimeout/expA-work';
import fs from 'node:fs';
fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
const r = spawnSync(hang, ['donothing', work], { encoding: 'utf8', timeout: 1500 });
console.log(JSON.stringify({
  status: r.status, signal: r.signal,
  error: r.error ? String(r.error) : null,
  stdout_tail: (r.stdout || '').split('\n').slice(-2),
}, null, 1));
