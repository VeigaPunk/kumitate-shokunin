#!/usr/bin/env node
/**
 * measure-real.mjs — run the gate's own shape arms over real finished seats.
 *
 *   node measure-real.mjs <gate.mjs> <sessions-root> [limit]
 *
 * For each finished real seat (session_exit normal + a `yield` tool call) this builds a
 * one-seat synthetic wave whose dispatch context/task are cut from that transcript's own user
 * text, so the marker test always matches and only the shape arms can fire. Prints a FAIL line
 * per seat that is not CLEAN and a final PASS-RATE line.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';

const gate = process.argv[2];
const root = process.argv[3];
const LIMIT = Number(process.argv[4] || 0);
if (!gate || !root) { process.stderr.write('usage: measure-real.mjs <gate.mjs> <sessions-root> [limit]\n'); process.exit(64); }

const files = [];
const walk = (d, depth) => { let e = []; try { e = readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const x of e) { const p = join(d, x.name); if (x.isDirectory()) { if (depth < 4) walk(p, depth + 1); } else if (x.name.endsWith('.jsonl')) files.push(p); } };
walk(root, 0);
const stems = new Set(files.map((f) => basename(f, '.jsonl')));
const finished = [];
for (const f of files) {
  const stem = basename(f, '.jsonl');
  // a stem with numbered siblings is a resumed seat: the gate's candidate match is ambiguous there
  if ([...stems].some((s) => s !== stem && s.startsWith(`${stem}-`) && /^\d+$/.test(s.slice(stem.length + 1)))) continue;
  const rows = readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  let yielded = false; let exitKind = null; let user = '';
  for (const r of rows) {
    if (r.type === 'custom' && r.customType === 'session_exit') exitKind = (r.data && r.data.kind) || 'unknown';
    if (r.type === 'message' && r.message && r.message.role === 'assistant' && Array.isArray(r.message.content)) {
      for (const c of r.message.content) if (c && c.type === 'toolCall' && c.name === 'yield') yielded = true;
    }
    if (!user && r.type === 'message' && r.message && r.message.role === 'user') {
      const c = r.message.content;
      user = typeof c === 'string' ? c : (Array.isArray(c) ? c.filter((x) => x && x.type === 'text').map((x) => x.text).join('\n') : '');
    }
  }
  if (!(exitKind === 'normal' && yielded && user.includes(`# Seat ${stem}\n`))) continue;
  finished.push({ stem, user });
}

const T = mkdtempSync(join(tmpdir(), 'measure-real.'));
const seats = LIMIT ? finished.slice(0, LIMIT) : finished;
let clean = 0;
const bad = [];
for (const s of seats) {
  const one = join(T, `s-${s.stem}`);
  const base = join(one, 'lane', '.ufo', 'waves', 'round-7');
  mkdirSync(join(base, 'w1'), { recursive: true });
  const ctx = s.user.slice(0, 200);
  const task = s.user.slice(-120);
  writeFileSync(join(base, 'w1-dispatch.json'), JSON.stringify({ taskCall: { context: ctx, tasks: [{ name: s.stem, agent: 'executor', task }] } }));
  writeFileSync(join(base, 'w1.ready'), JSON.stringify({ lane: 'ctl', round: 7, wave: 'w1', dispatch: '/fixture/lane/.ufo/waves/round-7/w1-dispatch.json', l1: 'CtlR7' }));
  writeFileSync(join(base, 'w1.ready.dispatched'), '2026-10-25T00:00:00\n');
  writeFileSync(join(base, 'w1-results.json'), JSON.stringify({ lane: 'ctl', round: 7, wave: 'w1', seats: 1, results: [{ name: s.stem, agent: 'executor', output: null }] }));
  writeFileSync(join(one, 'dispatcher.log'), '2026-10-25T00:00:00 spawned ctl 7 w1 1\n2026-10-25T00:01:00 done ctl w1 /fixture/lane/.ufo/waves/round-7/w1-results.json\n');
  writeFileSync(join(base, 'w1', `${s.stem}.md`), `# ${s.stem}\n\nreal-seat report placeholder for the shape measurement. ${'x'.repeat(64)} ${s.stem}\n`);
  const r = spawnSync('node', [gate, '--root', join(one, 'lane'), '--round', '7', '--wave', 'w1', '--sessions-root', root, '--dispatcher-log', join(one, 'dispatcher.log')], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const line = (r.stdout || '').split('\n')[0];
  if (r.status === 0 && /CLEAN/.test(line)) clean += 1;
  else bad.push(`${s.stem} exit=${r.status} ${line} ${(r.stdout || '').split('\n').filter((l) => l.startsWith('FINDING')).join(' ')}`);
  rmSync(one, { recursive: true, force: true });
}
rmSync(T, { recursive: true, force: true });
for (const b of bad) process.stdout.write(`FAIL ${b}\n`);
process.stdout.write(`PASS-RATE ${clean}/${seats.length} finished real seats read CLEAN under ${basename(gate)}\n`);
process.exit(bad.length ? 1 : 0);
