#!/usr/bin/env node
/**
 * gen-forgery.mjs — K63ExecGateForgery fixtures. Independent writer (does not import the gate).
 *
 *   node gen-forgery.mjs <out-dir> [case ...]
 *
 * Writes control directories in the layout the round-63 counter reads for I3:
 *   <case>/lane/.ufo/waves/round-7/{w1.ready,w1.ready.dispatched,w1-dispatch.json,w1-results.json,w1/<Seat>.md}
 *   <case>/sessions/orch/<Seat>.jsonl   <case>/dispatcher.log   <case>/expect
 *
 * `cheap-40-seats` is the cheapest faithful forgery: 40 hand-written 5-row transcripts and 40
 * hand-written reports, no seat ever ran. Every other case starts from a realistic 20-row
 * transcript (`rich`) and breaks exactly one structural invariant.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

const out = resolve(process.argv[2] || '');
if (!process.argv[2]) { process.stderr.write('usage: gen-forgery.mjs <out-dir> [case ...]\n'); process.exit(64); }

const CTX = 'ROUND CONTEXT (kumitate round 7, wave w1 — forged)\nLane repo: /fixture/lane\nYou are NOT an integration owner.';
// the committed controls/inline/honest case, verbatim (drop-in replacement for its sessions/)
const FROZEN_CTX = 'ROUND CONTEXT (kumitate round 7, wave w1 — control fixture)\nLane repo: /fixture/lane';
const task = (n) => `/skill:godspeed\n\nForge a seat report for ${n} without running any work.\nReport: .ufo/waves/round-7/w1/${n}.md`;
const hex = (s) => createHash('sha256').update(s).digest('hex');

// ---------------------------------------------------------------- transcripts
/** Cheapest faithful forgery: exactly the rows the frozen gate reads. */
function cheapRows(n, o = {}) {
  const user = o.user !== undefined ? o.user : `Complete assignment thoroughly:\n\n${o.ctx || CTX}\n\n# Seat ${n}\n${(o.task || task)(n)}`;
  const rows = [
    { type: 'session', version: 3, id: o.id || `session-${n}`, parentSession: o.parent || '/host/orchestrator.jsonl' },
    { type: 'model_change', role: `subagent:${n}`, model: 'fixture/model' },
    { type: 'message', message: { role: 'user', content: [{ type: 'text', text: user }] } },
    { type: 'message', message: { role: 'assistant', content: [{ type: 'toolCall', name: 'yield', arguments: {} }] } },
    { type: 'custom', customType: 'session_exit', data: { kind: o.exit || 'normal' } },
  ];
  return rows;
}

/** A realistic finished-seat transcript: header rows, an id/parentId row graph, joined tool
 *  calls, spread timestamps. `o` breaks one invariant at a time. */
function richRows(n, o = {}) {
  const t0 = Date.parse('2026-10-25T16:43:09.000Z');
  const at = (s) => new Date(t0 + s * 1000).toISOString();
  const rt = { version: '18.12.6' };
  const rows = [];
  let clock = 0;
  const next = () => { clock += o.instant ? 0 : 17; return at(clock); };
  let prev = null;
  const push = (row, opts = {}) => {
    const r = { ...row };
    if (!o.noId && typeof r.id !== "string") r.id = hex(`${n}:${rows.length}`).slice(0, 8);
    if (!o.noGraph) r.parentId = o.dangling && rows.length === 3 ? 'deadbeef' : (opts.root ? null : prev);
    if (!o.noRuntime) r.runtime = rt;
    if (!opts.noTs) r.timestamp = next();
    rows.push(r);
    prev = r.id || prev;
  };
  push({ type: 'title', v: 1, title: '', updatedAt: at(0), pad: ' ' }, { noTs: true, root: true });
  push({ type: 'session', version: 3, id: `01a1${hex(n).slice(0, 30)}`, cwd: '/fixture/lane', parentSession: '/host/orchestrator.jsonl' }, { root: true });
  push({ type: 'model_change', model: 'fixture/model' }, { root: true });
  if (!o.noHeader) {
    push({ type: 'model_change', model: 'fixture/model', role: `subagent:${n}` }, { root: true });
    if (!o.thin) push({ type: 'thinking_level_change', thinkingLevel: 'high' }, { root: true });
    if (!o.thin) push({ type: 'service_tier_change', serviceTier: 'default' }, { root: true });
    push({ type: 'session_init', systemPrompt: ['You are a fleet seat.'], tools: ['read', 'bash', 'yield'], agent: n, spawns: 0, readOnly: false }, { root: true });
    push({ type: 'custom', customType: 'system-prompt-digest', data: { sha256: hex(`prompt:${n}`) } }, { root: true });
  }
  push({ type: 'message', message: { role: 'user', content: [{ type: 'text', text: `Complete assignment thoroughly:\n\n${o.ctx || CTX}\n\n# Seat ${n}\n${(o.task || task)(n)}` }] } });
  const tools = o.noJoin || o.thin ? [] : [['read', 'reading the plan'], ['bash', 'counting rows'], ['write', 'writing the report']];
  const calls = [];
  for (const [name, intent] of tools) {
    const id = `call_${hex(`${n}:${name}`).slice(0, 24)}`;
    calls.push({ id, name });
    push({ type: 'message', message: { role: 'assistant', content: [{ type: 'thinking', thinking: `step ${name}` }, { type: 'toolCall', id, name, arguments: { path: `/fixture/${hex(n).slice(0, 8)}` } }] } });
    push({ type: 'custom', customType: 'tool_execution_start', data: { toolCallId: id, toolName: name, startedAt: at(clock), args: {}, intent } });
    if (o.orphanResult) { push({ type: 'message', message: { role: 'toolResult', toolCallId: `call_ghost_${hex(n).slice(0, 8)}`, toolName: name, content: [{ type: 'text', text: 'x' }] } }); }
    else push({ type: 'message', message: { role: 'toolResult', toolCallId: id, toolName: o.nameMismatch ? 'eval' : name, content: [{ type: 'text', text: `ok ${hex(n).slice(0, 8)}` }] } });
  }
  push({ type: 'message', message: { role: 'assistant', content: [{ type: 'toolCall', id: `call_${hex(`${n}:yield`).slice(0, 24)}`, name: 'yield', arguments: { data: { ok: true } } }] } });
  push({ type: 'custom', customType: 'session_exit', data: { kind: o.exit || 'normal' } });

  return rows;
}

function body(n, pad = 0) {
  const base = `# ${n}\n\nForged seat report: findings, evidence pointers and commands run. ${'detail '.repeat(12)}\n`;
  return pad ? base + `${'filler '.repeat(Math.ceil(pad / 7))}\n` : base;
}

// ---------------------------------------------------------------- cases
const CASES = [
  ['cheap-40-seats', '1', 'SESSION_TOOL_JOIN', { seats: 40, shape: 'cheap' }],
  ['cheap-padded-bytes', '1', 'SESSION_TOOL_JOIN', { seats: 3, shape: 'cheap', pad: 60000 }],
  ['rich-no-header', '1', 'SESSION_HEADER', { seats: 3, shape: 'rich', brk: { noHeader: true } }],
  ['rich-toolcalls-no-results', '1', 'SESSION_TOOL_JOIN', { seats: 3, shape: 'rich', brk: { noJoin: true } }],
  ['rich-orphan-result', '1', 'SESSION_TOOL_JOIN', { seats: 3, shape: 'rich', brk: { orphanResult: true } }],
  ['rich-result-name-mismatch', '1', 'SESSION_TOOL_JOIN', { seats: 3, shape: 'rich', brk: { nameMismatch: true } }],
  ['rich-broken-rowgraph', '1', 'SESSION_ROWGRAPH', { seats: 3, shape: 'rich', brk: { dangling: true } }],
  ['rich-no-rowids', '1', 'SESSION_ROWGRAPH', { seats: 3, shape: 'rich', brk: { noId: true, noGraph: true } }],
  ['rich-thin-transcript', '1', 'SESSION_ROWGRAPH', { seats: 3, shape: 'rich', brk: { thin: true } }],
  ['rich-instant-timeline', '1', 'SESSION_TIMELINE', { seats: 3, shape: 'rich', brk: { instant: true } }],
  ['rich-untimed', '1', 'SESSION_TIMELINE', { seats: 3, shape: 'rich', brk: { noRuntime: true, instant: true } }],
  ['rich-honest-shape', '0', 'CLEAN', { seats: 3, shape: 'rich' }],
  ['template-renamed-transcript', '1', 'SESSION_TEMPLATE', { seats: 3, shape: 'rich', copyFrom: true }],
  ['honest', '0', 'CLEAN', { seats: 3, shape: 'rich', names: ['K63AlphaOne', 'K63BetaTwo', 'K63GammaThree'], ctx: FROZEN_CTX, task: (n) => `/skill:godspeed\n\nControl task for ${n}; write your report.\nReport: .ufo/waves/round-7/w1/${n}.md` }],
];

function make(name, exp, o) {
  const d = join(out, name);
  const base = join(d, 'lane', '.ufo', 'waves', 'round-7');
  const sess = join(d, 'sessions', 'orch');
  mkdirSync(join(base, 'w1'), { recursive: true });
  mkdirSync(sess, { recursive: true });
  const names = o.names || Array.from({ length: o.seats }, (_, i) => `K63Forged${String(i + 1).padStart(2, '0')}`);
  const ctx = o.ctx || CTX;
  const taskOf = o.task || task;
  const tasks = names.map((n) => ({ name: n, agent: 'executor', task: taskOf(n) }));
  writeFileSync(join(base, 'w1-dispatch.json'), JSON.stringify({ taskCall: { context: ctx, tasks } }, null, 1));
  writeFileSync(join(base, 'w1.ready'), JSON.stringify({ lane: 'ctl', round: 7, wave: 'w1', dispatch: '/fixture/lane/.ufo/waves/round-7/w1-dispatch.json', l1: 'CtlR7' }));
  writeFileSync(join(base, 'w1.ready.dispatched'), '2026-10-25T00:00:00\n');
  writeFileSync(join(base, 'w1-results.json'), JSON.stringify({ lane: 'ctl', round: 7, wave: 'w1', seats: names.length, results: names.map((n) => ({ name: n, agent: 'executor', output: null })) }, null, 1));
  writeFileSync(join(d, 'dispatcher.log'), `2026-10-25T00:00:00 spawned ctl 7 w1 ${names.length}\n2026-10-25T00:01:00 done ctl w1 /fixture/lane/.ufo/waves/round-7/w1-results.json\n`);
  for (const n of names) {
    if (o.copyFrom && n !== names[0]) {
      // one real-shaped transcript re-used for the rest of the wave, name swapped, session id renewed
      const rows = readFileSync(join(sess, `${names[0]}.jsonl`), 'utf8').split(names[0]).join(n)
        .split('\n').filter(Boolean).map((l) => JSON.parse(l));
      for (const r of rows) if (r.type === 'session') r.id = `copy-${n}`;
      writeFileSync(join(sess, `${n}.jsonl`), `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`);
      writeFileSync(join(base, 'w1', `${n}.md`), body(n, o.pad || 0));
      continue;
    }
    const rows = o.shape === 'cheap' ? cheapRows(n, { ...(o.brk || {}), ctx, task: taskOf }) : richRows(n, { ...(o.brk || {}), ctx, task: taskOf });
    writeFileSync(join(sess, `${n}.jsonl`), `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`);
    writeFileSync(join(base, 'w1', `${n}.md`), body(n, o.pad || 0));
  }
  writeFileSync(join(d, 'expect'), `${exp}\n${o.expectId}\n`);
  return d;
}

const want = process.argv.slice(3);
const pick = want.length ? CASES.filter(([n]) => want.includes(n)) : CASES;
if (pick.length !== (want.length || CASES.length)) { process.stderr.write(`unknown case in ${want.join(',')}\n`); process.exit(64); }
for (const [name, code, id, o] of pick) { rmSync(join(out, name), { recursive: true, force: true }); make(name, code, { ...o, expectId: id }); }
process.stdout.write(`WROTE ${pick.length} cases under ${out}\n`);
