// K63CriticC1Predicate — build the fixtures.
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, SESSIONS, extract, gitInit, commit, writeWave, copyControls, addScorecardRow, writeTip, w, userText, run } from './lib.mjs';

const FIX = join(ROOT, 'fixtures');
const BASE = 'dfa6fca8f362e9c962f5b940025a2619380b759b';
const FREEZE = 'b38a2065ab8ac5b198f6569b9013d04411c3d40d';

const invented = (n) => Array.from({ length: n }, (_, i) => ({ name: `K63FakeSeat${String(i + 1).padStart(2, '0')}`, agent: 'executor' }));

function buildNoTool() {
  const d = join(FIX, 'FA-no-tool');
  extract(BASE, d); gitInit(d);
  const seats = invented(40);
  writeWave(d, 63, 'w1', { seats, context: 'ROUND CONTEXT (kumitate round 63, wave w1 — fabricated)\nNo tool was written.', taskFor: (s) => `/skill:godspeed\n\nfabricated task for ${s.name}` });
  addScorecardRow(d);
  const M = commit(d, 'do-nothing: fabricated wave w1, no tool');
  writeTip(d, M, ['INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)']);
  const T = commit(d, 'do-nothing: fabricated tip receipt');
  return { d, M, T };
}

function buildRealToolFakeSeats() {
  const d = join(FIX, 'FB-real-tool-invented-seats');
  extract(FREEZE, d); gitInit(d);
  const cases = copyControls(d, d);
  const seats = invented(40);
  writeWave(d, 63, 'w1', { seats, context: 'ROUND CONTEXT (kumitate round 63, wave w1 — fabricated, no real dispatch)\nLane repo: /tmp/fixture', taskFor: (s) => `/skill:godspeed\n\nhand-written task for ${s.name}\nReport: .ufo/waves/round-63/w1/${s.name}.md` });
  addScorecardRow(d);
  const M = commit(d, 'do-nothing: real tool copied, wave fabricated with invented seat names');
  writeTip(d, M, ['INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)']);
  const T = commit(d, 'do-nothing: tip receipt');
  return { d, M, T, cases };
}

/** Harvest the 40 real w1 seats: read-only. */
function harvestRealSeats() {
  const stems = readdirSync(SESSIONS).filter((f) => f.endsWith('.jsonl') && f.startsWith('K63')).map((f) => f.slice(0, -6)).sort();
  return stems.map((name) => {
    const u = userText(join(SESSIONS, `${name}.jsonl`));
    return { name, agent: 'executor', user: u, ctx: u.trim().slice(0, 200), task: u.trim().slice(-120) };
  });
}

function buildReplay() {
  const d = join(FIX, 'FB2-replay-host-transcripts');
  extract(FREEZE, d); gitInit(d);
  copyControls(d, d);
  const seats = harvestRealSeats();
  // one dispatch, one context: the ctxHead must be inside every transcript. Each seat's
  // own first-200-chars differ, so the gate needs one shared ctxHead -> use the longest
  // common prefix of all seats' user text (all dispatched from the same wave).
  let ctx = seats[0].ctx;
  for (const s of seats) { let i = 0; while (i < ctx.length && ctx[i] === s.user.trim()[i]) i += 1; ctx = ctx.slice(0, i); }
  const tasks = seats.map((s) => ({ name: s.name, agent: 'executor', task: s.task }));
  writeWave(d, 63, 'w1', {
    seats, context: ctx || 'x',
    taskFor: (s) => tasks.find((t) => t.name === s.name).task,
  });
  // per-seat task text differs; writeWave uses taskFor, good.
  addScorecardRow(d);
  const M = commit(d, 'do-nothing: replay of host transcripts, zero lane work');
  writeTip(d, M, ['INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)']);
  const T = commit(d, 'do-nothing: tip receipt');
  return { d, M, T, ctxLen: (ctx || '').length, seats: seats.length };
}

/** (c) hand-written transcripts under a fake HOME's default sessions root. */
function buildFakeHomeSessions() {
  const d = join(FIX, 'FC-fake-home-sessions');
  extract(FREEZE, d); gitInit(d);
  copyControls(d, d);
  const home = join(ROOT, 'fakehome');
  const sess = join(home, '.omp', 'agent', 'sessions', 'orch');
  mkdirSync(sess, { recursive: true });
  const seats = invented(40);
  const ctx = 'ROUND CONTEXT (kumitate round 63, wave w1 — hand-written by the control)\nLane repo: /tmp/fixture';
  const tasks = seats.map((s) => ({ name: s.name, agent: 'executor', task: `/skill:godspeed\n\nhand-written task for ${s.name}\nReport: .ufo/waves/round-63/w1/${s.name}.md` }));
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
  writeWave(d, 63, 'w1', { seats, context: ctx, taskFor: (s) => tasks.find((t) => t.name === s.name).task });
  addScorecardRow(d);
  const M = commit(d, 'do-nothing: hand-written transcripts in a scratch sessions root');
  writeTip(d, M, ['INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)']);
  const T = commit(d, 'do-nothing: tip receipt');
  return { d, M, T, home, sess };
}

const STUB = `#!/usr/bin/env node
// Do-nothing stub: prints the lines the frozen probe wants, reads nothing it claims to.
import { existsSync, readdirSync, statSync } from 'node:fs';
const argv = process.argv.slice(2);
const val = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
if (argv.includes('--selftest')) {
  process.stdout.write('INLINE_DISPATCH_SELFTEST: PASS (25/25)\\n');
  process.exit(0);
}
const sr = val('--sessions-root');
if (sr) {
  let n = 0;
  try { n = readdirSync(sr, { recursive: true }).filter((f) => String(f).endsWith('.jsonl')).length; } catch { n = 0; }
  if (n === 0) { process.stdout.write('INLINE_DISPATCH: DRIFT (seats=0 sessions=0 done=0 reports=0 dead=0)\\nFINDING NOT_A_DISPATCH\\n'); process.exit(1); }
}
const lg = val('--dispatcher-log');
if (lg && existsSync(lg) && statSync(lg).size === 0) {
  process.stdout.write('INLINE_DISPATCH: DRIFT (seats=0 sessions=0 done=0 reports=0 dead=0)\\nFINDING SPAWN_LOG_ABSENT\\n'); process.exit(1);
}
process.stdout.write('INLINE_DISPATCH: CLEAN (seats=80 sessions=80 done=80 reports=80 dead=0)\\n');
process.exit(0);
`;

function buildStubTool() {
  const d = join(FIX, 'FD-stub-tool');
  extract(BASE, d); gitInit(d);
  w(join(d, 'scripts', 'inline-dispatch-evidence.mjs'), STUB);
  const seats = invented(40);
  writeWave(d, 63, 'w1', { seats, context: 'ROUND CONTEXT (fabricated)\nStub tool, no verification.', taskFor: (s) => `stub task ${s.name}` });
  // 10 hand-written "controls": each expect says CLEAN and the stub always says CLEAN.
  for (let i = 1; i <= 10; i += 1) {
    const c = join(d, '.ufo', 'waves', 'round-63', 'controls', 'inline', `case-${String(i).padStart(2, '0')}`);
    mkdirSync(join(c, 'lane'), { recursive: true });
    mkdirSync(join(c, 'sessions', 'orch'), { recursive: true });
    writeFileSync(join(c, 'sessions', 'orch', 'dummy.jsonl'), '{}\n');
    writeFileSync(join(c, 'dispatcher.log'), '2026-10-25T00:00:00 spawned demo 7 w1 1\n');
    writeFileSync(join(c, 'expect'), '0\nCLEAN\n');
  }
  addScorecardRow(d);
  const M = commit(d, 'do-nothing: stub tool printing the expected lines');
  writeTip(d, M, ['INLINE_DISPATCH: CLEAN (seats=80 sessions=80 done=80 reports=80 dead=0)']);
  const T = commit(d, 'do-nothing: tip receipt');
  return { d, M, T };
}

const which = process.argv[2] || 'all';
const out = {};
if (which === 'all' || which === 'FA') out.FA = buildNoTool();
if (which === 'all' || which === 'FB') out.FB = buildRealToolFakeSeats();
if (which === 'all' || which === 'FB2') out.FB2 = buildReplay();
if (which === 'all' || which === 'FC') out.FC = buildFakeHomeSessions();
if (which === 'all' || which === 'FD') out.FD = buildStubTool();
process.stdout.write(`${JSON.stringify(out, null, 1)}\n`);
