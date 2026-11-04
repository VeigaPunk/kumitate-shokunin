// Faithful model of plan C2's v2 algorithm (journal rename -> row -> pin -> rm journal),
// with a second process running the plan's recovery arm. Scratch-only: no lane bytes touched.
import { mkdirSync, renameSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const D = process.argv[2], ROLE = process.argv[3];
const J = join(D, '.ufo/pins/adopt-journal');
const README = join(D, 'corpus/README.md'), PIN = join(D, '.ufo/pins/readme-map.json');
const KEY = 'lessons/round-99-verifier-spotcheck.md';
const clean = () => readFileSync(PIN, 'utf8').includes(KEY) && readFileSync(README, 'utf8').includes(KEY);
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function recover() {
  if (!existsSync(J)) return 'none';
  for (const e of readdirSync(J)) {
    if (e.endsWith('.tmp')) { rmSync(join(J, e), { recursive: true, force: true }); return 'stale'; }
    const m = JSON.parse(readFileSync(join(J, e, 'manifest.json'), 'utf8'));
    const pre = m.pre;
    if (clean() && m.key === KEY) { rmSync(join(J, e), { recursive: true, force: true }); return 'complete'; }
    for (const p of pre) writeFileSync(join(D, p.path), readFileSync(join(J, e, p.file)));
    rmSync(join(J, e), { recursive: true, force: true });
    return 'rolled-back';
  }
  return 'none';
}
if (ROLE === 'adopt') {
  const pre = [{ path: 'corpus/README.md', file: 'README.pre' }, { path: '.ufo/pins/readme-map.json', file: 'readme-map.pre' }];
  const tmp = join(J, 'u1.tmp'); mkdirSync(tmp, { recursive: true });
  writeFileSync(join(tmp, 'manifest.json'), JSON.stringify({ contract: 'kumitate-adopt-journal-v1', lane: D, target: 'corpus/lessons/round-99-verifier-spotcheck.md', key: KEY, pre }));
  for (const p of pre) cpSync(join(D, p.path), join(tmp, p.file));
  renameSync(tmp, join(J, 'u1'));              // journal is now "hot"
  writeFileSync(README, readFileSync(README, 'utf8') + `| \`${KEY}\` | row |\n`);
  sleep(400);                                   // the crash window a SIGKILL would occupy
  writeFileSync(PIN, readFileSync(PIN, 'utf8').replace('"covered": [', `"covered": [\n    "${KEY}",`));
  rmSync(join(J, 'u1'), { recursive: true, force: true });
  console.log('A ADOPTED');
} else {
  sleep(150);
  console.log('B recover:', recover());
}
