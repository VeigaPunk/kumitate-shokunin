#!/usr/bin/env node
/**
 * ambig-probe.mjs — real-data falsifier for the inline-dispatch gate's candidate matching.
 *
 * Claim under test: `scripts/inline-dispatch-evidence.mjs` credits a seat when exactly one
 * transcript matches its dispatched text. Real host transcripts contain seat names whose
 * stem repeats with a `-N` suffix (a harness respawn), and in 63 measured cases the base file
 * and its respawn carry a byte-identical first user message. Because the gate's match
 * predicate is a substring test on that same first user message (`# Seat <name>` + context
 * head + task tail), any dispatch that matches one of the pair also matches the other, so the
 * gate reports SESSION_AMBIGUOUS for a genuinely dispatched seat.
 *
 * Minimal pair, same fixture builder, same sessions root:
 *   ExecRows01  -> base + -2 + -3 with identical prompts   (expect DRIFT SESSION_AMBIGUOUS)
 *   ExecDiffScope -> exactly one transcript                (expect CLEAN)
 *
 * READ-ONLY over the sessions root. Prints counts, hashes and verdict lines only: never
 * transcript text. Usage: node ambig-probe.mjs [--sessions-root DIR]
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';

const GATE = resolve(dirname(new URL(import.meta.url).pathname), '../../../../../scripts/inline-dispatch-evidence.mjs');
const argv = process.argv.slice(2);
const rootArg = argv.indexOf('--sessions-root');
const SESSIONS = rootArg >= 0 ? resolve(argv[rootArg + 1]) : join(homedir(), '.omp', 'agent', 'sessions');
const WORK = '/tmp/kumitate-r63/K63ExecTranscriptStats/ambig';
const ROUND = '63';
const WAVE = 'w1';

function stems(dir) {
  const out = new Map();
  const walk = (d, depth) => {
    let ents;
    try { ents = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const p = join(d, e.name);
      if (e.isDirectory()) { if (depth < 3) walk(p, depth + 1); continue; }
      if (!e.isFile() || !e.name.endsWith('.jsonl')) continue;
      const stem = e.name.slice(0, -'.jsonl'.length);
      if (!out.has(stem)) out.set(stem, []);
      out.get(stem).push(p);
    }
  };
  walk(dir, 0);
  return out;
}

function firstUserText(path) {
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line) continue;
    let row;
    try { row = JSON.parse(line); } catch { continue; }
    if (row.type !== 'message' || !row.message || row.message.role !== 'user') continue;
    const c = row.message.content;
    if (typeof c === 'string') return c;
    if (Array.isArray(c)) return c.filter((x) => x && x.type === 'text').map((x) => x.text).join('\n');
    return '';
  }
  return '';
}

const sha = (s) => createHash('sha256').update(s).digest('hex');

function fixture(seat, prompt) {
  const dir = join(WORK, seat);
  rmSync(dir, { recursive: true, force: true });
  const lane = join(dir, 'lane');
  const base = join(lane, '.ufo', 'waves', `round-${ROUND}`);
  mkdirSync(join(base, WAVE), { recursive: true });
  // context head and task tail are substrings of the real prompt by construction; the pair
  // under test shares one prompt byte-for-byte, so both members match any such pair.
  const ctx = prompt.trim().slice(0, 200);
  const task = `/skill:godspeed\n\n${prompt.slice(-160)}`;
  writeFileSync(join(base, `${WAVE}-dispatch.json`), JSON.stringify({ taskCall: { context: ctx, tasks: [{ name: seat, agent: 'executor', task }] } }));
  writeFileSync(join(base, `${WAVE}.ready`), JSON.stringify({ lane: 'kumitate', round: ROUND, wave: WAVE, dispatch: join(base, `${WAVE}-dispatch.json`), l1: 'KumitateR63' }));
  writeFileSync(join(base, `${WAVE}.ready.dispatched`), '2026-10-25T00:00:00\n');
  writeFileSync(join(base, `${WAVE}-results.json`), JSON.stringify({ lane: 'kumitate', round: ROUND, wave: WAVE, seats: 1, results: [{ name: seat, agent: 'executor', output: null }] }));
  writeFileSync(join(base, WAVE, `${seat}.md`), `# ${seat}\n\nprobe fixture report with enough bytes to clear the report floor.\n${'x'.repeat(64)}\n`);
  const log = join(dir, 'dispatcher.log');
  writeFileSync(log, `2026-10-25T00:00:00 spawned kumitate ${ROUND} ${WAVE} 1\n2026-10-25T00:01:00 done kumitate ${WAVE} ${join(base, `${WAVE}-results.json`)}\n`);
  const report = join(dir, 'report.md');
  writeFileSync(report, 'probe report: no dead seats\n');
  return { lane, log, report };
}

const index = stems(SESSIONS);
const out = [];

for (const seat of ['ExecRows01', 'ExecDiffScope']) {
  const paths = [...index].filter(([stem, ps]) => (stem === seat || (stem.startsWith(`${seat}-`) && /^\d+$/.test(stem.slice(seat.length + 1))))).flatMap(([, ps]) => ps);
  if (!paths.length) { out.push(`${seat}: NO TRANSCRIPT under ${SESSIONS}`); continue; }
  const prompts = paths.map((p) => firstUserText(p));
  const hashes = prompts.map(sha);
  const prompt = prompts[0];
  const f = fixture(seat, prompt);
  const r = spawnSync(process.execPath, [GATE, '--root', f.lane, '--round', ROUND, '--wave', WAVE,
    '--sessions-root', SESSIONS, '--dispatcher-log', f.log, '--report', f.report], { encoding: 'utf8' });
  const line = (r.stdout || '').trim().split('\n')[0] || ('(no stdout) ' + (r.stderr || '').trim().split('\n')[0]);
  const findings = (r.stdout || '').split('\n').filter((l) => l.startsWith('FINDING ')).join(' ');
  out.push(`${seat}: transcripts=${paths.length} promptShaEqual=${new Set(hashes).size === 1} promptLen=${prompt.length} ` +
    `gateExit=${r.status} ${line} ${findings}`);
}

process.stdout.write(out.join('\n') + '\n');
