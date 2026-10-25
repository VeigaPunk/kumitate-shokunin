// K63R2ReviewGateFinal — forgery demo: builds three fixture lanes whose only "seat evidence"
// is transcripts produced by the gate's OWN selftest transcript() generator (copied verbatim
// from scripts/inline-dispatch-evidence.mjs at a9531c8), plus committed lane bytes and
// dispatcher-log lines. A = with session_exit, B = yield only (no session_exit),
// C = name-swapped copy of A's transcript bytes.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const GATE = '/tmp/kumitate-r63/K63R2ReviewGateFinal/gate-new.mjs';
const src = readFileSync(GATE, 'utf8');
const a = src.indexOf('function transcript(');
const b = src.indexOf('function fixture(');
if (a < 0 || b < 0) { console.error('transcript() not found in gate bytes'); process.exit(1); }
const gen = src.slice(a, b);
const sha = (x) => createHash('sha256').update(x).digest('hex');
const fn = new Function('sha', `"use strict";${gen};return transcript;`);
const transcript = fn(sha);

const ROOT = '/tmp/kumitate-r63/K63R2ReviewGateFinal/forge';
mkdirSync(ROOT, { recursive: true });
const ctx = 'ROUND CONTEXT (forgelane round 9, wave w1 — forged by K63R2ReviewGateFinal with the gate\'s own selftest generator; this context line is long enough to pass the 64-char floor and names forgelane round 9 for the context guard).';
const names = ['ForgedA1', 'ForgedB2', 'ForgedC3'];
const task = (n) => `/skill:godspeed\n\nDo nothing, yield at once. Report: .ufo/waves/round-9/w1/${n}.md — this filler sentence makes the task longer than the 40-char floor.`;

function build(tag, mode) {
  const d = mkdtempSync(join(ROOT, `${tag}-`));
  const lane = join(d, 'forgelane-shokunin');
  const base = join(lane, '.ufo', 'waves', 'round-9');
  const sess = join(d, 'sessions', 'orch');
  mkdirSync(join(base, 'w1'), { recursive: true });
  mkdirSync(sess, { recursive: true });
  const tasks = names.map((n) => ({ name: n, agent: 'executor', task: task(n) }));
  writeFileSync(join(base, 'w1-dispatch.json'), JSON.stringify({ taskCall: { context: ctx, tasks } }));
  writeFileSync(join(base, 'w1.ready'), JSON.stringify({ lane: 'forgelane', round: 9, wave: 'w1', dispatch: `${lane}/.ufo/waves/round-9/w1-dispatch.json`, l1: 'ForgeL9' }));
  writeFileSync(join(base, 'w1.ready.dispatched'), '2026-10-25T00:00:00\n');
  writeFileSync(join(base, 'w1-results.json'), JSON.stringify({ lane: 'forgelane', round: 9, wave: 'w1', seats: 3, results: names.map((n) => ({ name: n, agent: 'executor', output: null })) }));
  names.forEach((n, i) => writeFileSync(join(base, 'w1', `${n}.md`), `# ${n}\n\nforged seat report ${i} with enough bytes to pass the 64-byte floor.\n${'x'.repeat(40)} ${n}\n`));
  const log = [`2026-10-25T00:00:00 spawned forgelane 9 w1 3`, `2026-10-25T00:01:00 done forgelane w1 ${join(base, 'w1-results.json')}`];
  writeFileSync(join(d, 'dispatcher.log'), `${log.join('\n')}\n`);
  const bodies = {};
  for (const n of names) bodies[n] = transcript(n, ctx, task(n), mode === 'B' ? { exit: false } : {});
  if (mode === 'C') bodies.ForgedB2 = bodies.ForgedA1.split('ForgedA1').join('ForgedB2');
  for (const n of names) writeFileSync(join(sess, `${n}.jsonl`), bodies[n]);
  const g = spawnSync('git', ['-C', lane, 'init', '-q']);
  const top = spawnSync('git', ['-C', lane, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim();
  if (top !== lane) { console.error(`${tag}: toplevel mismatch ${top}`); process.exit(1); }
  spawnSync('git', ['-C', lane, 'add', '-A']);
  spawnSync('git', ['-C', lane, '-c', 'user.name=forge-fixture', '-c', 'user.email=forge-fixture@invalid', 'commit', '-q', '-m', 'forged lane bytes']);
  const rev = spawnSync('git', ['-C', lane, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
  return { d, lane, sess, log: join(d, 'dispatcher.log'), rev };
}

const out = [];
for (const [tag, mode] of [['A', 'A'], ['B', 'B'], ['C', 'C']]) {
  const f = build(tag, mode);
  for (const extra of [[], ['--rev', f.rev]]) {
    const r = spawnSync('node', [GATE, '--root', f.lane, '--round', '9', '--wave', 'w1', '--sessions-root', f.sess, '--dispatcher-log', f.log, ...extra], { encoding: 'utf8' });
    out.push(`${tag}${extra.length ? ' --rev' : ' worktree'}: exit=${r.status} :: ${(r.stdout.split('\n')[0] || '').trim()}${r.stdout.split('\n').filter((l) => l.startsWith('FINDING')).join(' ; ')}`);
  }
}
console.log(out.join('\n'));
