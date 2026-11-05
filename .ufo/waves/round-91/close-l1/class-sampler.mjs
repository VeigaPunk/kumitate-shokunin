#!/usr/bin/env node
/**
 * class-sampler.mjs — round-91 mistake fix demonstration (NOT the C1 counter; the frozen counter is
 * probe/probe91-c1.mjs). Mistake M6 of corpus/lessons/round-91.md: probe91 armed each declared
 * external class with ONE fixture token (`.sh`/`/dev/*` spellings, exactly 16777217 bytes, an empty
 * directory), so three seat constructions keyed on those tokens score 56/56 while wrong one token
 * away. This sampler draws K members per class per run, varying every token the class definition
 * does not fix: file name and extension (none, .sh, .mjs, .bin, random), over-cap size drawn
 * uniformly from [16777217, 16777216 + 2^20], directory empty or holding 1..3 random entries,
 * and FIFO names of the same random shape. Twins (CLEAN): empty regular file, regular file at
 * exactly the cap, a small regular file of random size, each with the correct digest.
 *
 *   node class-sampler.mjs --lane <LANE> --rev <40-hex> --work <SCRATCH> --tool <tool> [--k 4]
 * Prints `CLASS_SAMPLER: HELD held=n/n` (exit 0) or `UNMET held=x/n` (exit 1); one `MEMBER` line each.
 */
import { mkdirSync, writeFileSync, truncateSync, rmSync } from 'node:fs';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const opt = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const lane = resolve(opt('--lane', '.'));
const rev = opt('--rev', '');
const work = resolve(opt('--work', ''));
const tool = resolve(opt('--tool', ''));
const K = Number(opt('--k', '4'));
const CAP = 16777216;
const sha = (b) => createHash('sha256').update(b).digest('hex');
const root = join(work, `s-${randomBytes(4).toString('hex')}`);
mkdirSync(root, { recursive: true });
const EXT = () => ['', '.sh', '.mjs', '.bin', `.${randomBytes(2).toString('hex')}`][randomInt(5)];
const NAME = () => `${randomBytes(3).toString('hex')}${EXT()}`;
const fresh = () => { const d = join(root, randomBytes(4).toString('hex')); mkdirSync(d); return d; };

function run(path, digest) {
  const rc = fresh();
  writeFileSync(join(rc, 'r.txt'), `rev=${rev}\ntool_sha256=${digest}\ncmd=bash ${path}\nOK\nexit=0\nsignal=none\n`);
  const r = spawnSync('prlimit', ['--as=2147483648', '--', 'node', tool, '--dir', rc, '--rev', rev, '--lane', lane],
    { encoding: 'utf8', timeout: 20000, killSignal: 'SIGKILL', env: { ...process.env, TMPDIR: root } });
  const line = ((r.stdout || '').match(/^RECEIPT_BIND: .*$/m) || [''])[0];
  return { status: r.status, line };
}
const refused = (r) => r.status === 2 && /^RECEIPT_BIND: FAIL-CLOSED UNRESOLVED(\s|$)/.test(r.line);
const clean = (r) => r.status === 0 && /^RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1$/.test(r.line);

const members = [];
const add = (cls, ok, r) => members.push({ cls, ok, r });
for (let i = 0; i < K; i += 1) {
  { // FIFO, random name
    const p = join(fresh(), NAME());
    spawnSync('mkfifo', [p]);
    add('fifo', refused(run(p, '0'.repeat(64))), null);
  }
  { // directory, empty or with 1..3 entries, random name
    const p = join(fresh(), NAME());
    mkdirSync(p);
    const n = randomInt(4);
    for (let j = 0; j < n; j += 1) writeFileSync(join(p, NAME()), randomBytes(16));
    add(`dir(n=${n})`, refused(run(p, '0'.repeat(64))), null);
  }
  { // over-cap regular, random size and name, CORRECT digest
    const p = join(fresh(), NAME());
    const size = CAP + 1 + randomInt(1 << 20);
    writeFileSync(p, ''); truncateSync(p, size);
    add('overcap', refused(run(p, sha(Buffer.alloc(size)))), null);
  }
  { // twin: at-cap regular, random name
    const p = join(fresh(), NAME());
    writeFileSync(p, ''); truncateSync(p, CAP);
    add('atcap-twin', clean(run(p, sha(Buffer.alloc(CAP)))), null);
  }
  { // twin: empty regular, random name
    const p = join(fresh(), NAME());
    writeFileSync(p, '');
    add('empty-twin', clean(run(p, sha(''))), null);
  }
  { // twin: small regular, random size and name
    const p = join(fresh(), NAME());
    const b = randomBytes(1 + randomInt(4096));
    writeFileSync(p, b);
    add('small-twin', clean(run(p, sha(b))), null);
  }
}
const held = members.filter((m) => m.ok).length;
const byClass = {};
for (const m of members) { const c = m.cls.replace(/\(.*\)/, ''); byClass[c] = byClass[c] || [0, 0]; byClass[c][1] += 1; if (m.ok) byClass[c][0] += 1; }
for (const [c, [a, b]] of Object.entries(byClass).sort()) console.log(`MEMBER ${c}: ${a}/${b}`);
rmSync(root, { recursive: true, force: true });
console.log(`CLASS_SAMPLER: ${held === members.length ? 'HELD' : 'UNMET'} held=${held}/${members.length}`);
process.exit(held === members.length ? 0 : 1);
