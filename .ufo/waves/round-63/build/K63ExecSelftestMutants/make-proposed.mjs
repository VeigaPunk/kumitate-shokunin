#!/usr/bin/env node
/**
 * make-proposed.mjs — derive a PROPOSED gate from the frozen original by (a) widening the
 * selftest fixture knobs and (b) appending one case per surviving mutant. The frozen original
 * is never touched; the proposal lands in proposed/inline-dispatch-evidence.proposed.mjs as a
 * full-file draft for the L1 to integrate.
 *
 * Every replacement is asserted to apply exactly once.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'work', 'inline-dispatch-evidence.mjs');
const OUT = join(HERE, 'proposed', 'inline-dispatch-evidence.proposed.mjs');

const FIXCTX = "const FIXCTX = 'ROUND CONTEXT (lane demo round 7, wave w1)\\nLane repo: /x';";

const REPLACEMENTS = [
  // transcript(): extra rows + a custom session_exit row
  [
    "  if (!o.noYield) rows.push({ type: 'message', message: { role: 'assistant', content: [{ type: 'toolCall', name: 'yield', arguments: {} }] } });\n  if (o.exit !== false) rows.push({ type: 'custom', customType: 'session_exit', data: { kind: o.exit || 'normal' } });",
    "  for (const extra of o.extraRows || []) rows.push(extra);\n  if (!o.noYield) rows.push({ type: 'message', message: { role: 'assistant', content: [{ type: 'toolCall', name: 'yield', arguments: {} }] } });\n  if (o.exit !== false) rows.push(o.exitRow || { type: 'custom', customType: 'session_exit', data: { kind: o.exit || 'normal' } });",
  ],
  // fixture(): parameterised context / tasks / log / transcript file name / raw session files
  [
    "  const ctx = 'ROUND CONTEXT (lane demo round 7, wave w1)\\nLane repo: /x';\n  const tasks = names.map((n) => ({ name: n, agent: 'executor', task: `/skill:godspeed\\n\\ndo the work for ${n}.\\nReport: .ufo/waves/round-7/w1/${n}.md` }));\n  writeFileSync(join(base, 'w1-dispatch.json'), JSON.stringify({ taskCall: { context: ctx, tasks } }));",
    "  const ctx = o.ctx === undefined ? 'ROUND CONTEXT (lane demo round 7, wave w1)\\nLane repo: /x' : o.ctx;\n  const tasks = names.map((n) => ({ name: n, agent: 'executor', task: (o.tasks && o.tasks[n]) || `/skill:godspeed\\n\\ndo the work for ${n}.\\nReport: .ufo/waves/round-7/w1/${n}.md` }));\n  writeFileSync(join(base, 'w1-dispatch.json'), JSON.stringify({ taskCall: { context: o.dispatchCtx === undefined ? ctx : o.dispatchCtx, tasks: o.emptyTasks ? [] : tasks } }));",
  ],
  [
    "  const lines = [`2026-10-25T00:00:00 spawned demo 7 w1 ${o.spawnN === undefined ? names.length : o.spawnN}`];\n  if (!o.noDone)",
    "  const lines = [`2026-10-25T00:00:00 spawned demo 7 w1 ${o.spawnN === undefined ? names.length : o.spawnN}${o.spawnTail || ''}`];\n  if (o.extraSpawn) lines.push(`2026-10-25T00:00:30 spawned demo 7 w1 ${names.length}`);\n  if (!o.noDone)",
  ],
  [
    "    if (o.noSession && o.noSession.includes(t.name)) continue;\n    writeFileSync(join(sess, `${t.name}.jsonl`), transcript(t.name, ctx, t.task, od));",
    "    if (o.noSessionAll || (o.noSession && o.noSession.includes(t.name))) continue;\n    writeFileSync(join(sess, `${od.file || t.name}.jsonl`), transcript(od.seatName || t.name, ctx, t.task, od));",
  ],
  [
    "  return { lane, sessions: join(dir, 'sessions'), log: logPath, base };",
    "  for (const [f, body] of Object.entries(o.rawFiles || {})) writeFileSync(join(sess, f), body);\n  return { lane, sessions: join(dir, 'sessions'), log: logPath, base };",
  ],
];

const CASES = `    // ---- round-63 mutation battery (seat K63ExecSelftestMutants): one case per surviving mutant
    // Every case below is a fixture the frozen 25-case suite could not express; each one makes
    // one surviving single-literal mutant FAIL. Case names carry the mutant id in a comment.
    ${FIXCTX}
    const LONG_TASK = \`/skill:godspeed\\n\\n\${'z'.repeat(400)}\\n\\nReport: .ufo/waves/round-7/w1/A1.md\`;
    const TASK_A1 = \`/skill:godspeed\\n\\ndo the work for A1.\\nReport: .ufo/waves/round-7/w1/A1.md\`;
    // M02: a 63-byte report is below the 64-byte floor.
    expect('report-floor-63-bytes', run(mk(['A1'], { reportBody: { A1: 'y'.repeat(63) } }).f), 1, 'REPORT_TINY');
    // M03: a 64-byte report is exactly at the floor, not below it.
    expect('report-floor-64-bytes', run(mk(['A1'], { reportBody: { A1: 'y'.repeat(64) } }).f), 0, null);
    // M05 + M08: right marker and context, wrong task text (and no char the task ends with).
    expect('transcript-wrong-task-text', run(mk(['A1'], { tr: { A1: { user: \`Complete assignment thoroughly:\\n\\n\${FIXCTX}\\n\\n# Seat A1\\nwrong work only; see the other note\` } } }).f), 1, 'SESSION_FOREIGN');
    // M06 + M07: the transcript carries only the last 150 chars of a >500-char task: the 120-char
    // tail is present, the whole task is not. The 120 window must stay a window.
    expect('transcript-truncated-task-tail', run(mk(['A1'], { tasks: { A1: LONG_TASK }, tr: { A1: { user: \`Complete assignment thoroughly:\\n\\n\${FIXCTX}\\n\\n# Seat A1\\n\${LONG_TASK.slice(-150)}\` } } }).f), 0, null);
    // M09 + M11: right marker and task, a different round's context.
    expect('transcript-wrong-context', run(mk(['A1'], { tr: { A1: { user: \`Complete assignment thoroughly:\\n\\nSOME OTHER ROUND CONTEXT\\n\\n# Seat A1\\n\${TASK_A1}\` } } }).f), 1, 'SESSION_FOREIGN');
    // M10: a context that agrees for five characters and diverges after.
    expect('transcript-five-char-context', run(mk(['A1'], { tr: { A1: { user: \`Complete assignment thoroughly:\\n\\nROUND context truncated after five chars\\n\\n# Seat A1\\n\${TASK_A1}\` } } }).f), 1, 'SESSION_FOREIGN');
    // M16: yielded, but exited aborted — a dead seat, not a done seat.
    { const { f, d } = mk(['A1', 'B2'], { tr: { B2: { exit: 'aborted' } } }); const rep = join(d, 'rep-m16.md'); writeFileSync(rep, 'only A1 is discussed here'); expect('yielded-but-aborted-is-dead', run(f, { reportFile: rep }), 1, 'DEAD_UNNAMED'); }
    // M18: a session_exit row with no kind is 'unknown', never 'normal'.
    { const { f, d } = mk(['A1', 'B2'], { tr: { B2: { exitRow: { type: 'custom', customType: 'session_exit' } } } }); const rep = join(d, 'rep-m18.md'); writeFileSync(rep, 'only A1 is discussed here'); expect('exit-row-without-kind-is-dead', run(f, { reportFile: rep }), 1, 'DEAD_UNNAMED'); }
    // M25: a spawn line with a trailing token is not a spawn line (the count is the last field).
    expect('spawn-line-trailing-token', run(mk(['A1', 'B2'], { spawnTail: ' trailing-token' }).f), 1, 'SPAWN_LOG_ABSENT');
    // M26: the same wave spawned twice is a mismatch, not a second chance.
    expect('spawn-line-twice', run(mk(['A1', 'B2'], { extraSpawn: true }).f), 1, 'SPAWN_LOG_MISMATCH');
    // M32: a ready marker with no l1 names no dispatcher.
    expect('ready-without-l1', run(mk(['A1'], { ready: { lane: 'demo', round: 7, wave: 'w1', dispatch: '/abs/lane/.ufo/waves/round-7/w1-dispatch.json' } }).f), 1, 'READY_MISMATCH');
    // M33: the marker names another wave even though its dispatch path is this wave's.
    expect('ready-wrong-wave-name', run(mk(['A1'], { ready: { lane: 'demo', round: 7, wave: 'w9', dispatch: '/abs/lane/.ufo/waves/round-7/w1-dispatch.json', l1: 'DemoR7' } }).f), 1, 'READY_MISMATCH');
    // M43: two transcripts that both carry this seat's marker/context/task tail.
    expect('two-transcripts-one-seat', run(mk(['A1'], { rawFiles: { 'A1-2.jsonl': transcript('A1', FIXCTX, '/skill:godspeed\\n\\ndo the work for A1.\\nReport: .ufo/waves/round-7/w1/A1.md') } }).f), 1, 'SESSION_AMBIGUOUS');
    // M46: '# Seat A10' is not '# Seat A1'.
    expect('seat-marker-prefix-collision', run(mk(['A1'], { tr: { A1: { seatName: 'A10' } } }).f), 1, 'SESSION_FOREIGN');
    // M50: a transcript stem that is not the seat name (A1-notes) is not this seat's session.
    expect('transcript-stem-not-seat', run(mk(['A1'], { tr: { A1: { file: 'A1-notes' } } }).f), 1, 'SESSION_ABSENT');
    // M51: a second session row in the same transcript cannot launder a duplicated session id.
    expect('second-session-row-hides-dup', run(mk(['A1', 'B2'], { tr: { B2: { id: 'sid-A1', extraRows: [{ type: 'session', version: 3, id: 'sid-B2-uniq', parentSession: '/p/orch.jsonl' }] } } }).f), 1, 'SESSION_ID_DUP');
    // M52: a second user message cannot repair a foreign transcript (the dispatched prompt is first).
    expect('second-user-message-cannot-repair', run(mk(['A1'], { tr: { A1: { user: 'Complete assignment thoroughly: other lane work', extraRows: [{ type: 'message', message: { role: 'user', content: [{ type: 'text', text: \`Complete assignment thoroughly:\\n\\n\${FIXCTX}\\n\\n# Seat A1\\n/skill:godspeed\\n\\ndo the work for A1.\\nReport: .ufo/waves/round-7/w1/A1.md\` }] } }] } } }).f), 1, 'SESSION_FOREIGN');
    // M57: no transcripts at all — done must be 0, not 'every seat that is not marked dead'.
    { const r = run(mk(['A1', 'B2'], { noSessionAll: true }).f); expect('no-sessions-not-a-dispatch', r, 1, 'NOT_A_DISPATCH'); cases.push(['no-sessions-done-is-zero', r.done === 0, \`done=\${r.done}\`]); }
    // M58: the verdict word is part of the contract (probe I2 greps for 'INLINE_DISPATCH: CLEAN').
    { const r = run(mk(['A1']).f); cases.push(['verdict-word-clean', r.code === 0 && r.line.startsWith('INLINE_DISPATCH: CLEAN '), r.line]); }
    // M63: an empty task list is fail-closed, not a wave with zero seats.
    expect('empty-task-list-fail-closed', run(mk(['A1'], { emptyTasks: true }).f), 2, 'DISPATCH_UNREADABLE');
    // M64: a non-string context is fail-closed, not a TypeError. (Placed last: the mutant crashes.)
    expect('context-not-a-string-fail-closed', run(mk(['A1'], { dispatchCtx: 123 }).f), 2, 'DISPATCH_UNREADABLE');
`;

let text = readFileSync(SRC, 'utf8');
for (const [old, neu] of REPLACEMENTS) {
  const n = text.split(old).length - 1;
  if (n !== 1) {
    process.stderr.write(`REPLACEMENT-TARGET-BAD occurrences=${n}: ${JSON.stringify(old.slice(0, 60))}\n`);
    process.exit(1);
  }
  text = text.replace(old, neu);
}
const anchor = '  } finally {';
if (text.split(anchor).length - 1 !== 1) {
  process.stderr.write('ANCHOR-BAD\n');
  process.exit(1);
}
text = text.replace(anchor, `${CASES}${anchor}`);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, text);
process.stdout.write(`PROPOSED written ${OUT}\n`);
