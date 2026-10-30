// micro.mjs — prove Node semantics used by the attack:
//  - no SIGTERM listener => default disposition terminates immediately
//  - try/finally does NOT run on signal death
//  - a spawnSync child is NOT killed with the parent (orphan)
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
try {
  const r = spawnSync('sleep', ['60'], {encoding: 'utf8'});
  console.log('child exited', r.status, r.signal);
} finally {
  fs.writeFileSync(process.env.MARKER || '/tmp/micro-finally-ran', 'finally ran\n');
  console.log('finally ran');
}
