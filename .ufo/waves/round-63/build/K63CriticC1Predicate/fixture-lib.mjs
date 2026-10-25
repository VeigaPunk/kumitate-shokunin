// K63CriticC1Predicate — fixture builder helpers (scratch only).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
export const ROOT = '/tmp/kumitate-r63/K63CriticC1Predicate';
export const SESSIONS = '/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b';

export const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts });

export function gitInit(dir) {
  mkdirSync(dir, { recursive: true });
  let r = run('git', ['-C', dir, 'init', '-q']);
  if (r.status !== 0) throw new Error(`init failed: ${r.stderr}`);
  const top = run('git', ['-C', dir, 'rev-parse', '--show-toplevel']).stdout.trim();
  if (resolve(top) !== resolve(dir)) throw new Error(`toplevel ${top} != ${dir}`);
  return dir;
}

export function commit(dir, msg) {
  let r = run('git', ['-C', dir, 'add', '-A']);
  if (r.status !== 0) throw new Error(`add failed: ${r.stderr}`);
  r = run('git', ['-C', dir, '-c', 'user.name=K63CriticC1Predicate', '-c', 'user.email=critic@invalid', 'commit', '-q', '-m', msg]);
  if (r.status !== 0) throw new Error(`commit failed: ${r.stderr}`);
  return run('git', ['-C', dir, 'rev-parse', 'HEAD']).stdout.trim();
}

export function extract(rev, dest) {
  mkdirSync(dest, { recursive: true });
  const r = run('bash', ['-c', `git -C "${LANE}" archive "${rev}" | tar -x -C "${dest}"`]);
  if (r.status !== 0) throw new Error(`archive failed: ${r.stderr}`);
  return dest;
}

const w = (p, s) => { mkdirSync(join(p, '..'), { recursive: true }); writeFileSync(p, s); };

/** Read the first user message text of a transcript. */
export function userText(path) {
  const raw = readFileSync(path, 'utf8');
  for (const line of raw.split('\n')) {
    if (!line) continue;
    let row; try { row = JSON.parse(line); } catch { continue; }
    if (row.type === 'message' && row.message && row.message.role === 'user') {
      const c = row.message.content;
      if (typeof c === 'string') return c;
      if (Array.isArray(c)) return c.filter((x) => x && x.type === 'text').map((x) => x.text).join('\n');
    }
  }
  return '';
}

/**
 * Write a fabricated wave: ready, dispatched marker, dispatch.json, results.json and
 * one hand-written report per seat. `seats` = [{name, agent}] ; `ctx`/`task` per seat.
 */
export function writeWave(lane, round, wave, opts) {
  const base = join(lane, '.ufo', 'waves', `round-${round}`);
  mkdirSync(join(base, wave), { recursive: true });
  const { seats, context, taskFor, laneName = 'kumitate', l1 = 'KumitateR63', reportFor } = opts;
  const tasks = seats.map((s) => ({ name: s.name, agent: s.agent || 'executor', task: taskFor(s) }));
  w(join(base, `${wave}-dispatch.json`), JSON.stringify({ taskCall: { context, tasks } }, null, 1));
  w(join(base, `${wave}.ready`), JSON.stringify({ lane: laneName, round, wave, dispatch: join(base, `${wave}-dispatch.json`), l1 }));
  w(join(base, `${wave}.ready.dispatched`), '2026-10-25T17:57:13\n');
  w(join(base, `${wave}-results.json`), JSON.stringify({
    lane: laneName, round, wave, seats: seats.length,
    results: seats.map((s) => ({ name: s.name, agent: s.agent || 'executor', output: null })),
  }, null, 1));
  for (const s of seats) {
    w(join(base, wave, `${s.name}.md`),
      reportFor ? reportFor(s) : `# ${s.name}\n\nVERDICT: hand-written by the do-nothing control.\n\n${s.name} did no work; this report is fabricated bytes, unique per seat ${s.name}.\n`);
  }
  return base;
}

/** Copy the frozen 14 inline controls from the lane archive into a fixture. */
export function copyControls(from, to) {
  const src = join(from, '.ufo', 'waves', 'round-63', 'controls', 'inline');
  const dst = join(to, '.ufo', 'waves', 'round-63', 'controls', 'inline');
  const ents = readdirSync(src, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const e of ents) run('bash', ['-c', `mkdir -p "${join(dst, e.name)}" && cp -a "${join(src, e.name)}/." "${join(dst, e.name)}/"`]);
  return ents.length;
}

/** Append the SCORECARD row I5 looks for. */
export function addScorecardRow(lane) {
  const p = join(lane, 'SCORECARD.md');
  const prev = existsSync(p) ? readFileSync(p, 'utf8') : '# SCORECARD\n\n## Capabilities\n\n| capability | contract | first-working round | notes |\n|---|---|---|---|\n';
  // I5 reads cells[cells.length-2] === '63', so the round must be the last real cell.
  writeFileSync(p, `${prev.trimEnd()}\n| \`inline-dispatch-evidence\` | do-nothing control | \`node scripts/inline-dispatch-evidence.mjs\` | 63 |\n`);
}

/** Write the close receipt (commit T) quoting the CLEAN lines. */
export function writeTip(lane, rev, cleanLines) {
  const p = join(lane, '.ufo', 'waves', 'round-63', 'close', 'inline63-tip.txt');
  mkdirSync(join(p, '..'), { recursive: true });
  writeFileSync(p, `rev=${rev}\n${cleanLines.map((l) => `${l}\n`).join('')}`);
}

export function probe(fixture, rev, tip, env) {
  const args = [join(LANE, '.ufo', 'waves', 'round-63', 'probe', 'inline63-probe.mjs'), fixture, rev];
  if (tip) args.push(tip);
  const r = run('node', args, { env: { ...process.env, ...(env || {}) } });
  return { status: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

export function gate(archiveRoot, args, env) {
  const r = run('node', [join(archiveRoot, 'scripts', 'inline-dispatch-evidence.mjs'), ...args], { env: { ...process.env, ...(env || {}) } });
  return { status: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

export { w };
