// K63CriticC1Predicate — replay / fake-home fixtures + control repair.
import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, SESSIONS, extract, gitInit, commit, writeWave, copyControls, addScorecardRow, writeTip, w, userText } from './lib.mjs';

const FIX = join(ROOT, 'fixtures');
const BASE = 'dfa6fca8f362e9c962f5b940025a2619380b759b';
const FREEZE = 'b38a2065ab8ac5b198f6569b9013d04411c3d40d';

/** The frozen control `forged-no-sessions` has an EMPTY sessions/orch dir, which git cannot
 *  commit; `git archive` therefore lacks the root and the gate fails closed (exit 2) instead
 *  of NOT_A_DISPATCH (exit 1). The forger only has to make the dir survive the commit. */
function repairEmptyControlDirs(lane) {
  const root = join(lane, '.ufo', 'waves', 'round-63', 'controls', 'inline');
  const fixed = [];
  for (const e of readdirSync(root, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const s = join(root, e.name, 'sessions');
    let has = false;
    try { has = readdirSync(s).length > 0; } catch { has = false; }
    if (!has) { mkdirSync(s, { recursive: true }); writeFileSync(join(s, '.keep'), ''); fixed.push(e.name); }
  }
  return fixed;
}

function harvest(dir, filter, count) {
  const stems = readdirSync(dir).filter((f) => f.endsWith('.jsonl') && filter(f)).map((f) => f.slice(0, -6)).sort().slice(0, count);
  const seats = stems.map((name) => ({ name, agent: 'executor', user: userText(join(dir, `${name}.jsonl`)) }));
  let ctx = seats[0].user.trim();
  for (const s of seats) { const u = s.user.trim(); let i = 0; while (i < ctx.length && ctx[i] === u[i]) i += 1; ctx = ctx.slice(0, i); }
  return { seats, ctx };
}

function buildReplay(tag, filter, count, logLines) {
  const d = join(FIX, tag);
  extract(FREEZE, d); gitInit(d);
  copyControls(d, d);
  const fixed = repairEmptyControlDirs(d);
  const { seats, ctx } = harvest(SESSIONS, filter, count);
  const tasks = seats.map((s) => ({ name: s.name, agent: 'executor', task: s.user.trim().slice(-120) }));
  writeWave(d, 63, 'w1', {
    seats, context: ctx || 'x',
    taskFor: (s) => tasks.find((t) => t.name === s.name).task,
  });
  writeFileSync(join(d, 'scratch-dispatcher.log'), `${logLines.join('\n')}\n`);
  addScorecardRow(d);
  const M = commit(d, 'do-nothing: replay host transcripts (zero work, zero host writes)');
  writeTip(d, M, ['INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)']);
  const T = commit(d, 'do-nothing: tip receipt');
  return { d, M, T, seats: seats.length, ctxHead: (ctx || '').trim().slice(0, 200), fixed };
}

function buildFakeHome() {
  const d = join(FIX, 'FC-fake-home-sessions');
  extract(FREEZE, d); gitInit(d);
  copyControls(d, d);
  repairEmptyControlDirs(d);
  const home = join(ROOT, 'fakehome');
  const sess = join(home, '.omp', 'agent', 'sessions', 'orch');
  mkdirSync(sess, { recursive: true });
  const names = Array.from({ length: 40 }, (_, i) => `K63Forged${String(i + 1).padStart(2, '0')}`);
  const ctx = 'ROUND CONTEXT (kumitate round 63, wave w1 — hand-written by the control)\nLane repo: /tmp/fixture';
  const tasks = names.map((name) => ({ name, agent: 'executor', task: `/skill:godspeed\n\nhand-written task for ${name}\nReport: .ufo/waves/round-63/w1/${name}.md` }));
  for (const t of tasks) {
    const rows = [
      { type: 'session', version: 3, id: `forged-${t.name}`, cwd: '/tmp/fixture', parentSession: '/p/orch.jsonl' },
      { type: 'model_change', role: `subagent:${t.name}`, model: 'fixture/model' },
      { type: 'message', message: { role: 'user', content: [{ type: 'text', text: `Complete assignment thoroughly:\n\n${ctx}\n\n# Seat ${t.name}\n${t.task}` }] } },
      { type: 'message', message: { role: 'assistant', content: [{ type: 'toolCall', name: 'yield', arguments: {} }] } },
      { type: 'custom', customType: 'session_exit', data: { kind: 'normal' } },
    ];
    writeFileSync(join(sess, `${t.name}.jsonl`), `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`);
  }
  writeWave(d, 63, 'w1', { seats: names.map((n) => ({ name: n, agent: 'executor' })), context: ctx, taskFor: (s) => tasks.find((t) => t.name === s.name).task });
  writeFileSync(join(d, 'scratch-dispatcher.log'), '2026-10-25T17:57:13 spawned kumitate 63 w1 40\n2026-10-25T18:30:00 done kumitate w1 /x/round-63/w1-results.json\n');
  addScorecardRow(d);
  const M = commit(d, 'do-nothing: hand-written transcripts in the DEFAULT sessions root of a fake HOME');
  writeTip(d, M, ['INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)']);
  const T = commit(d, 'do-nothing: tip receipt');
  return { d, M, T, home, sess };
}

const which = process.argv[2];
const LOG = [
  '2026-10-25T17:57:13 spawned kumitate 63 w1 40',
  '2026-10-25T18:30:00 done kumitate w1 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w1-results.json',
];
let out;
if (which === 'FB2') out = buildReplay('FB2-replay-same-wave', (f) => f.startsWith('K63'), 40, LOG);
if (which === 'FB3') out = buildReplay('FB3-replay-foreign-wave', (f) => f.startsWith('R35Audit'), 40, LOG);
if (which === 'FC') out = buildFakeHome();
process.stdout.write(`${JSON.stringify(out, null, 1)}\n`);
