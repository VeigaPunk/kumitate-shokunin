#!/usr/bin/env node
/**
 * discriminators.mjs — for every SURVIVOR of mutants.mjs, build a fixture where the mutant and
 * the original disagree. A disagreement proves the mutant is NOT equivalent and names the exact
 * selftest case that would kill it. Agreement (with the argued reason) supports equivalence.
 *
 * Independent fixture writer: it does not import the gate (the gate runs at import time).
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ORIG = join(HERE, 'work', 'inline-dispatch-evidence.mjs');
const CTX = 'ROUND CONTEXT (lane demo round 7, wave w1)\nLane repo: /x';
const taskFor = (n) => `/skill:godspeed\n\ndo the work for ${n}.\nReport: .ufo/waves/round-7/w1/${n}.md`;
/** A task longer than the 120-char tail window, so a truncated transcript copy discriminates. */
const longTaskFor = (n) => `/skill:godspeed\n\n${'z'.repeat(400)}\n\nReport: .ufo/waves/round-7/w1/${n}.md`;

function transcript(name, ctx, task, o = {}) {
  const rows = [
    { type: 'session', version: 3, id: o.id || `sid-${name}`, cwd: '/x', parentSession: o.parent || '/p/orch.jsonl' },
    { type: 'model_change', role: `subagent:${name}`, model: 'fixture/model' },
    { type: 'message', message: { role: 'user', content: [{ type: 'text', text: o.user !== undefined ? o.user : `Complete assignment thoroughly:\n\n${ctx}\n\n# Seat ${name}\n${task}` }] } },
  ];
  for (const extra of o.extraRows || []) rows.push(extra);
  if (!o.noYield) rows.push({ type: 'message', message: { role: 'assistant', content: [{ type: 'toolCall', name: 'yield', arguments: {} }] } });
  if (o.exit !== false) rows.push(o.exitRow || { type: 'custom', customType: 'session_exit', data: { kind: o.exit || 'normal' } });
  return `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`;
}

/** Build one wave fixture. `o.tr[seat]` = transcript options; `o.rawFiles` = extra session files. */
function build(dir, names, o = {}) {
  const lane = join(dir, 'lane');
  const sess = join(dir, 'sessions', 'orch');
  const base = join(lane, '.ufo', 'waves', 'round-7');
  mkdirSync(join(base, 'w1'), { recursive: true });
  mkdirSync(sess, { recursive: true });
  const ctx = o.ctx === undefined ? CTX : o.ctx;
  const tasks = names.map((n) => ({ name: n, agent: 'executor', task: o.tasks && o.tasks[n] ? o.tasks[n] : taskFor(n) }));
  writeFileSync(join(base, 'w1-dispatch.json'), JSON.stringify({ taskCall: { context: o.dispatchCtx === undefined ? ctx : o.dispatchCtx, tasks: o.emptyTasks ? [] : tasks } }));
  const ready = o.ready || { lane: 'demo', round: 7, wave: 'w1', dispatch: '/abs/lane/.ufo/waves/round-7/w1-dispatch.json', l1: 'DemoR7' };
  writeFileSync(join(base, 'w1.ready'), JSON.stringify(ready));
  writeFileSync(join(base, 'w1.ready.dispatched'), '2026-10-25T00:00:00\n');
  const rs = (o.resultNames || names).map((n) => ({ name: n, agent: 'executor', output: null }));
  writeFileSync(join(base, 'w1-results.json'), JSON.stringify({ lane: 'demo', round: 7, wave: 'w1', seats: o.seatsLie === undefined ? rs.length : o.seatsLie, results: rs }));
  const lines = [`2026-10-25T00:00:00 spawned demo 7 w1 ${o.spawnN === undefined ? names.length : o.spawnN}${o.spawnTail || ''}`];
  if (o.extraSpawn) lines.push(`2026-10-25T00:00:30 spawned demo 7 w1 ${names.length}`);
  if (!o.noDone) lines.push('2026-10-25T00:01:00 done demo w1 /abs/lane/.ufo/waves/round-7/w1-results.json');
  writeFileSync(join(dir, 'dispatcher.log'), `${lines.join('\n')}\n`);
  for (const t of tasks) {
    const od = (o.tr && o.tr[t.name]) || {};
    if (o.noSessionAll) continue;
    writeFileSync(join(sess, `${od.file || t.name}.jsonl`), transcript(od.seatName || t.name, ctx, t.task, od));
    writeFileSync(join(base, 'w1', `${t.name}.md`), (o.reportBody && o.reportBody[t.name]) || `# ${t.name}\n\nfixture seat report with enough bytes to pass the size floor.\n${'x'.repeat(40)} ${t.name}\n`);
  }
  for (const [file, body] of Object.entries(o.rawFiles || {})) writeFileSync(join(sess, file), body);
  return { lane, sessions: join(dir, 'sessions'), log: join(dir, 'dispatcher.log') };
}

function run(bin, f, extra = {}) {
  const argv = [bin, '--root', f.lane, '--round', '7', '--wave', 'w1', '--sessions-root', f.sessions, '--dispatcher-log', f.log];
  if (extra.report) argv.push('--report', extra.report);
  const r = spawnSync('node', argv, { encoding: 'utf8', timeout: 60_000 });
  const out = (r.stdout || '').trim().split('\n');
  return { code: r.status, line: out[0] || '', findings: out.filter((l) => l.startsWith('FINDING ')).map((l) => l.slice(8)), stderr: (r.stderr || '').split('\n')[0] };
}

const T = mkdtempSync(join(tmpdir(), 'k63-disc.'));
let n = 0;
const mk = (names, o) => { n += 1; const d = join(T, `d${n}`); mkdirSync(d); return build(d, names, o); };

const S = [];
const scen = (id, mutant, make, o = {}) => S.push({ id, mutant, make, o });

// report floor boundaries
scen('M02', 'M02', () => mk(['A1'], { reportBody: { A1: 'y'.repeat(63) } }));
scen('M03', 'M03', () => mk(['A1'], { reportBody: { A1: 'y'.repeat(64) } }));
// task-tail window
scen('M05', 'M05', () => mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\n${CTX}\n\n# Seat A1\nXXXX-do-the-wrong-work-for-A1${taskFor('A1').slice(-1)}` } } }));
const trunc = (n) => ({ tasks: { [n]: longTaskFor(n) }, tr: { [n]: { user: `Complete assignment thoroughly:\n\n${CTX}\n\n# Seat ${n}\n${longTaskFor(n).slice(-150)}` } } });
scen('M06', 'M06', () => mk(['A1'], trunc('A1')));
scen('M07', 'M07', () => mk(['A1'], trunc('A1')));
scen('M08', 'M08', () => mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\n${CTX}\n\n# Seat A1\nan entirely different task` } } }));
// context head
scen('M09', 'M09', () => mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\nSOME OTHER ROUND CONTEXT\n\n# Seat A1\n${taskFor('A1')}` } } }));
scen('M10', 'M10', () => mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\nROUND context truncated after five chars\n\n# Seat A1\n${taskFor('A1')}` } } }));
scen('M11', 'M11', () => mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\nSOME OTHER ROUND CONTEXT\n\n# Seat A1\n${taskFor('A1')}` } } }));
scen('M12', 'M12', () => mk(['A1'], { ctx: '   ' + CTX + '   ', dispatchCtx: '   ' + CTX + '   ' }));
scen('M12b', 'M12', () => { const long = '\n\n' + 'q'.repeat(400); return mk(['A1'], { ctx: long, dispatchCtx: long }); });
scen('M12c', 'M12', () => { const short = CTX + '  \n'; return mk(['A1'], { ctx: short, dispatchCtx: short }); });
scen('M12d', 'M12', () => { const t = '\t'; return mk(['A1'], { ctx: t + CTX, dispatchCtx: t + CTX }); });
// exit kind / yield
scen('M16', 'M16', () => { const f = mk(['A1', 'B2'], { tr: { B2: { exit: 'aborted' } } }); const rep = join(T, 'rep16.md'); writeFileSync(rep, 'only A1 is discussed here'); return { ...f, report: rep }; });
scen('M18', 'M18', () => { const f = mk(['A1', 'B2'], { tr: { B2: { exitRow: { type: 'custom', customType: 'session_exit' } } } }); const rep = join(T, 'rep18.md'); writeFileSync(rep, 'only A1 is discussed here'); return { ...f, report: rep }; });
// dispatcher log
scen('M25', 'M25', () => mk(['A1', 'B2'], { spawnTail: ' trailing-token' }));
scen('M26', 'M26', () => mk(['A1', 'B2'], { extraSpawn: true }));
// ready marker
scen('M32', 'M32', () => mk(['A1'], { ready: { lane: 'demo', round: 7, wave: 'w1', dispatch: '/abs/lane/.ufo/waves/round-7/w1-dispatch.json' } }));
scen('M33', 'M33', () => mk(['A1'], { ready: { lane: 'demo', round: 7, wave: 'w9', dispatch: '/abs/lane/.ufo/waves/round-7/w1-dispatch.json', l1: 'DemoR7' } }));
// session matching
scen('M43', 'M43', () => mk(['A1'], { rawFiles: { 'A1-2.jsonl': transcript('A1', CTX, taskFor('A1')) } }));
scen('M46', 'M46', () => mk(['A1'], { tr: { A1: { seatName: 'A10' } } }));
scen('M50', 'M50', () => mk(['A1'], { tr: { A1: { file: 'A1-notes' } } }));
scen('M51', 'M51', () => mk(['A1', 'B2'], { tr: { B2: { extraRows: [{ type: 'session', version: 3, id: 'sid-B2-uniq', parentSession: '/p/orch.jsonl' }], id: 'sid-A1' } } }));
scen('M52', 'M52', () => mk(['A1'], { tr: { A1: { extraRows: [{ type: 'message', message: { role: 'user', content: [{ type: 'text', text: `Complete assignment thoroughly:\n\n${CTX}\n\n# Seat A1\n${taskFor('A1')}` }] } }], user: 'Complete assignment thoroughly: other lane work' } } }));
// report / dead accounting
scen('M57', 'M57', () => mk(['A1', 'B2'], { noSessionAll: true }));
// verdict word
scen('M58', 'M58', () => mk(['A1']));
// dispatch shape
scen('M63', 'M63', () => mk(['A1'], { emptyTasks: true }));
scen('M64', 'M64', () => mk(['A1'], { dispatchCtx: 123 }));

const rows = [];
for (const s of S) {
  const f = s.make();
  const extra = f.report ? { report: f.report } : {};
  const a = run(ORIG, f, extra);
  const b = run(join(HERE, 'mut', `${s.mutant}.mjs`), f, extra);
  const same = a.code === b.code && a.findings.join(',') === b.findings.join(',') && a.line === b.line;
  rows.push({ id: s.id, mutant: s.mutant, verdict: same ? 'AGREE' : 'DISAGREE', orig: `${a.code} ${a.line}${a.findings.length ? ` [${a.findings.join(',')}]` : ''}`, mut: `${b.code} ${b.line}${b.findings.length ? ` [${b.findings.join(',')}]` : ''}${b.stderr ? ` stderr=${b.stderr}` : ''}` });
}
rmSync(T, { recursive: true, force: true });
writeFileSync(join(HERE, 'discriminators.tsv'), `${['scenario\tmutant\tverdict\toriginal\tmutant'].concat(rows.map((r) => [r.id, r.mutant, r.verdict, r.orig, r.mut].join('\t'))).join('\n')}\n`);
for (const r of rows) process.stdout.write(`${r.id} ${r.mutant} ${r.verdict}\n  orig: ${r.orig}\n  mut : ${r.mut}\n`);
const dis = rows.filter((r) => r.verdict === 'DISAGREE').length;
process.stdout.write(`DISCRIMINATORS total=${rows.length} disagree=${dis} agree=${rows.length - dis}\n`);
