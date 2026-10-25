#!/usr/bin/env node
/** Generate harness-shaped, wholly synthetic dispatch evidence for gate forgery. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const out = resolve(process.argv[2] || '/tmp/kumitate-r63/K63R2CriticGateForgery');
const lane = join(out, 'lane');
const sessions = join(out, 'sessions', 'orch');
const waveDir = join(lane, '.ufo/waves/round-7');
const reportsDir = join(waveDir, 'w1');
const names = Array.from({ length: 40 }, (_, i) => `K63Forgery${String(i + 1).padStart(2, '0')}`);
const context = 'ROUND CONTEXT (kumitate round 7, wave w1 — synthetic gate forgery). Lane repo: /fixture/lane. This context is generated solely to exercise structural transcript checks and is not evidence of agent execution.';
const mkdir = (p) => mkdirSync(p, { recursive: true });
for (const p of [sessions, reportsDir]) mkdir(p);
const tasks = names.map((name, i) => ({ name, agent: 'critic', task: `/skill:godspeed\n\nInspect forged gate evidence for seat ${name}, synthetic variant ${i + 1}.\nReport: .ufo/waves/round-7/w1/${name}.md` }));
writeFileSync(join(waveDir, 'w1.ready'), JSON.stringify({ lane: 'kumitate', round: 7, wave: 'w1', dispatch: `${lane}/.ufo/waves/round-7/w1-dispatch.json`, l1: 'K63Forgery' }));
writeFileSync(join(waveDir, 'w1.ready.dispatched'), '2026-10-25T00:00:00.000Z\n');
writeFileSync(join(waveDir, 'w1-dispatch.json'), JSON.stringify({ taskCall: { context, tasks } }));
writeFileSync(join(waveDir, 'w1-results.json'), JSON.stringify({ lane: 'kumitate', round: 7, wave: 'w1', seats: 40, results: tasks.map(({ name, agent }) => ({ name, agent, output: null })) }));
for (let i = 0; i < tasks.length; i++) {
  const { name, task } = tasks[i];
  let n = 0;
  let prev = null;
  const rows = [];
  const push = (r, root = false, noTs = false) => {
    const id = `${name}-row-${n++}`;
    const row = { ...r, id, parentId: root ? null : prev, runtime: { version: `18.12.${(i + n) % 9}` } };
    if (!noTs) row.timestamp = new Date(Date.UTC(2026, 9, 25, 1, i, n * 19)).toISOString();
    prev = id;
    rows.push(row);
  };
  push({ type: 'title', v: 1, title: '', updatedAt: '2026-10-25T01:00:00.000Z', pad: ' ' }, true, true);
  push({ type: 'session', version: 3, id: `sid-${name}`, cwd: '/home/vgpnk/Projects/shokunin/kumitate-shokunin', parentSession: '/home/vgpnk/.omp/agent/sessions/orchestrator.jsonl' }, true);
  push({ type: 'model_change', model: 'openai-codex/gpt-6-luna' }, true);
  push({ type: 'model_change', role: `subagent:${name}`, model: 'openai-codex/gpt-6-luna' }, true);
  push({ type: 'session_init', systemPrompt: ['synthetic system prompt; fabricated transcript, no agent ran'], tools: ['read', 'grep', 'bash', 'write', 'yield'] }, true);
  push({ type: 'custom', customType: 'system-prompt-digest', data: { sha256: `synthetic-${String(i).padStart(3, '0')}` } }, true);
  push({ type: 'message', message: { role: 'user', content: [{ type: 'text', text: `Complete assignment thoroughly:\n\n${context}\n\n# Seat ${name}\n${task}` }] } });
  const toolNames = ['read', 'grep', 'bash'];
  for (let j = 0; j < toolNames.length; j++) {
    const tool = toolNames[j];
    const callId = `${name}-call-${tool}`;
    push({ type: 'message', message: { role: 'assistant', content: [{ type: 'thinking', thinking: `Synthetic unique thought ${i}/${j}; no inference from real work.` }, { type: 'toolCall', id: callId, name: tool, arguments: { path: `/synthetic/${name}/${tool}-${i}-${j}` } }] } });
    push({ type: 'message', message: { role: 'toolResult', toolCallId: callId, toolName: tool, content: [{ type: 'text', text: `synthetic result ${name} ${tool} ${i}-${j}` }] } });
  }
  push({ type: 'message', message: { role: 'assistant', content: [{ type: 'toolCall', id: `${name}-yield`, name: 'yield', arguments: { text: `synthetic completion ${name}` } }] } });
  push({ type: 'custom', customType: 'session_exit', data: { kind: 'normal' } });
  writeFileSync(join(sessions, `${name}.jsonl`), `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`);
  writeFileSync(join(reportsDir, `${name}.md`), `# ${name}\n\nSynthetic report used only for structural forgery measurement; no seat ran. Variant ${i + 1}.\n`);
}
const log = join(out, 'dispatcher.log');
writeFileSync(log, `2026-10-25T01:00:00.000Z spawned kumitate 7 w1 40\n2026-10-25T02:00:00.000Z done kumitate w1 ${reportsDir.replace(/\/w1$/, '/w1-results.json')}\n`);
writeFileSync(join(out, 'w1.ready'), 'synthetic ready marker\n');
writeFileSync(join(out, 'w1-dispatch.json'), JSON.stringify({ lane: 'kumitate', context, tasks }));
writeFileSync(join(out, 'w1-results.json'), JSON.stringify({ lane: 'kumitate', round: 7, wave: 'w1', seats: 40, results: tasks.map(({ name, agent }) => ({ name, agent })) }));
const start = Date.now();
const gate = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/inline-dispatch-evidence.mjs';
const r = spawnSync('node', [gate, '--root', lane, '--round', '7', '--wave', 'w1', '--sessions-root', join(out, 'sessions'), '--dispatcher-log', log], { encoding: 'utf8' });
process.stdout.write(`GATE_EXIT ${r.status}\n${r.stdout}`);
if (r.stderr) process.stdout.write(`GATE_STDERR ${r.stderr}`);
let bytes = 0;
for (const p of [sessions, reportsDir]) {
  const cmd = spawnSync('du', ['-sb', p], { encoding: 'utf8' });
  bytes += Number((cmd.stdout || '').split('\t')[0] || 0);
}
process.stdout.write(`BYTES_SESSIONS_REPORTS ${bytes}\nWALL_MS ${Date.now() - start}\n`);
