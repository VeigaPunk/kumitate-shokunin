#!/usr/bin/env node
/**
 * make-inline-controls.mjs — round-63 C1 controls: the committed fixture cases the frozen counter
 * (inline63-probe.mjs, check I3) reads from `.ufo/waves/round-63/controls/inline/<case>/`.
 *
 *   node .ufo/waves/round-63/probe/make-inline-controls.mjs <out-dir>
 *
 * Written independently of the gate under test (its own fixture writer). Each case holds
 *   lane/.ufo/waves/round-7/{w1.ready,w1.ready.dispatched,w1-dispatch.json,w1-results.json,w1/<Seat>.md}
 *   sessions/orch/<Seat>.jsonl   dispatcher.log   expect  (line 1 exit code, line 2 finding id or CLEAN)
 * `honest` is a complete record; every other case alters exactly one thing a do-nothing or
 * forging lane could alter. Nothing here touches git.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const out = resolve(process.argv[2] || '');
if (!process.argv[2]) { process.stderr.write('usage: make-inline-controls.mjs <out-dir>\n'); process.exit(64); }
rmSync(out, { recursive: true, force: true });
const NAMES = ['K63AlphaOne', 'K63BetaTwo', 'K63GammaThree'];
const CTX = 'ROUND CONTEXT (kumitate round 7, wave w1 — control fixture)\nLane repo: /fixture/lane';
const task = (n) => `/skill:godspeed\n\nControl task for ${n}; write your report.\nReport: .ufo/waves/round-7/w1/${n}.md`;

function transcript(n, o = {}) {
  const rows = [
    { type: 'session', version: 3, id: o.id || `session-${n}`, parentSession: o.parent || '/host/orchestrator.jsonl' },
    { type: 'model_change', role: `subagent:${n}`, model: 'fixture/model' },
    { type: 'message', message: { role: 'user', content: [{ type: 'text', text: o.user !== undefined ? o.user : `Complete assignment thoroughly:\n\n${CTX}\n\n# Seat ${n}\n${task(n)}` }] } },
    { type: 'message', message: { role: 'assistant', content: [{ type: 'toolCall', name: 'yield', arguments: {} }] } },
    { type: 'custom', customType: 'session_exit', data: { kind: 'normal' } },
  ];
  return `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`;
}
const body = (n) => `# ${n}\n\nControl seat report: findings, evidence pointers and commands run. ${'detail '.repeat(12)}\n`;

function make(name, exp, o = {}) {
  const d = join(out, name);
  const base = join(d, 'lane', '.ufo', 'waves', 'round-7');
  const sess = join(d, 'sessions', 'orch');
  mkdirSync(join(base, 'w1'), { recursive: true });
  mkdirSync(sess, { recursive: true });
  const names = o.dispatchNames || NAMES;
  const tasks = names.map((n) => ({ name: n, agent: 'executor', task: task(n) }));
  writeFileSync(join(base, 'w1-dispatch.json'), JSON.stringify({ taskCall: { context: CTX, tasks } }, null, 1));
  writeFileSync(join(base, 'w1.ready'), JSON.stringify({ lane: 'ctl', round: 7, wave: 'w1', dispatch: '/fixture/lane/.ufo/waves/round-7/w1-dispatch.json', l1: 'CtlR7' }));
  writeFileSync(join(base, 'w1.ready.dispatched'), '2026-10-25T00:00:00\n');
  const rn = o.resultNames || names;
  writeFileSync(join(base, 'w1-results.json'), JSON.stringify({ lane: 'ctl', round: 7, wave: 'w1', seats: rn.length, results: rn.map((n) => ({ name: n, agent: 'executor', output: null })) }, null, 1));
  const log = [];
  if (!o.noSpawn) log.push(`2026-10-25T00:00:00 spawned ctl 7 w1 ${o.spawnN === undefined ? names.length : o.spawnN}`);
  if (!o.noDone) log.push('2026-10-25T00:01:00 done ctl w1 /fixture/lane/.ufo/waves/round-7/w1-results.json');
  writeFileSync(join(d, 'dispatcher.log'), `${log.join('\n')}\n`);
  for (const n of names) {
    if (!(o.noSession || []).includes(n)) writeFileSync(join(sess, `${n}.jsonl`), transcript(n, (o.tr || {})[n]));
    if (!(o.noReport || []).includes(n)) writeFileSync(join(base, 'w1', `${n}.md`), (o.report || {})[n] || body(n));
  }
  if (o.extraSession) writeFileSync(join(sess, `${o.extraSession}.jsonl`), transcript(o.extraSession.replace(/-\d+$/, ''), { id: 'second-session-id' }));
  writeFileSync(join(d, 'expect'), `${exp[0]}\n${exp[1]}\n`);
}

make('honest', [0, 'CLEAN']);
make('forged-no-sessions', [1, 'NOT_A_DISPATCH'], { noSession: NAMES });
make('one-session-missing', [1, 'SESSION_ABSENT'], { noSession: [NAMES[1]] });
make('template-transcripts', [1, 'SESSION_FOREIGN'], { tr: Object.fromEntries(NAMES.map((n) => [n, { user: 'Complete assignment thoroughly: a hand-written stub with no seat marker' }])) });
make('session-id-dup', [1, 'SESSION_ID_DUP'], { tr: { [NAMES[0]]: { id: 'shared-id' }, [NAMES[1]]: { id: 'shared-id' } } });
make('parent-mismatch', [1, 'PARENT_MISMATCH'], { tr: { [NAMES[2]]: { parent: '/host/another-orchestrator.jsonl' } } });
make('spawn-count-lie', [1, 'SPAWN_LOG_MISMATCH'], { spawnN: 9 });
make('spawn-line-absent', [1, 'SPAWN_LOG_ABSENT'], { noSpawn: true });
make('done-line-absent', [1, 'DONE_LOG_ABSENT'], { noDone: true });
make('results-name-swap', [1, 'RESULTS_MISMATCH'], { resultNames: [NAMES[0], NAMES[1], 'K63Phantom'] });
make('reports-identical', [1, 'REPORT_DUP'], { report: Object.fromEntries(NAMES.map((n) => [n, `${'identical forged report body '.repeat(5)}\n`])) });
make('reports-28-bytes', [1, 'REPORT_TINY'], { report: Object.fromEntries(NAMES.map((n) => [n, 'fabricated report, 28 b\n'])) });
make('report-absent', [1, 'REPORT_ABSENT'], { noReport: [NAMES[2]] });
make('duplicate-spawn', [1, 'SESSION_AMBIGUOUS'], { extraSession: `${NAMES[0]}-2` });
process.stdout.write(`wrote 14 cases under ${out}\n`);
