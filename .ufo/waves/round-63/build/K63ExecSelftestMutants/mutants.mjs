#!/usr/bin/env node
/**
 * mutants.mjs — single-literal mutation battery for scripts/inline-dispatch-evidence.mjs.
 *
 * Seat K63ExecSelftestMutants, round 63 wave w1. Attacks the gate's own `--selftest`
 * (25 cases) with one literal edit per run, in a fresh process, 60s timeout.
 * The original is never mutated: work/inline-dispatch-evidence.mjs is read-only input,
 * every mutant is written to mut/<id>.mjs.
 *
 *   node mutants.mjs
 *   -> mutants.tsv (id, line, "orig -> mut", outcome) + mutants.log (per-mutant detail)
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'work', 'inline-dispatch-evidence.mjs');
const MUT = join(HERE, 'mut');
const TIMEOUT_MS = 60_000;

/** Each entry: [id, axis, old, new]. `old` MUST occur exactly once in the source. */
const MUTANTS = [
  // --- report floor (MIN_REPORT_BYTES) -------------------------------------
  ['M01', 'report-floor', 'const MIN_REPORT_BYTES = 64;', 'const MIN_REPORT_BYTES = 0;'],
  ['M02', 'report-floor', 'const MIN_REPORT_BYTES = 64;', 'const MIN_REPORT_BYTES = 63;'],
  ['M03', 'report-floor', 'if (b.length < MIN_REPORT_BYTES)', 'if (b.length <= MIN_REPORT_BYTES)'],
  ['M04', 'report-floor', 'if (b.length < MIN_REPORT_BYTES)', 'if (b.length > MIN_REPORT_BYTES)'],
  // --- task-tail window (120) ---------------------------------------------
  ['M05', 'tail-120', 'tail(String(t.task), 120)', 'tail(String(t.task), 1)'],
  ['M06', 'tail-120', 'tail(String(t.task), 120)', 'tail(String(t.task), 0)'],
  ['M07', 'tail-120', 'tail(String(t.task), 120)', 'tail(String(t.task), 100000)'],
  ['M08', 'tail-120', '&& tr.user.includes(tail(String(t.task), 120))', '&& true'],
  // --- context head (200) --------------------------------------------------
  ['M09', 'ctx-head-200', 'tc.context.trim().slice(0, 200)', 'tc.context.trim().slice(0, 0)'],
  ['M10', 'ctx-head-200', '.slice(0, 200)', '.slice(0, 5)'],
  ['M11', 'ctx-head-200', '&& tr.user.includes(ctxHead) && ', '&& true && '],
  ['M12', 'ctx-head-200', 'tc.context.trim().slice(0, 200)', 'tc.context.slice(0, 200)'],
  // --- exit kind / yield ---------------------------------------------------
  ['M13', 'exit-kind', "tr.exitKind === 'normal'", "tr.exitKind !== 'normal'"],
  ['M14', 'exit-kind', "tr.exitKind === 'normal'", "tr.exitKind === 'aborted'"],
  ['M15', 'exit-kind', "part.name === 'yield'", "part.name === 'yieldx'"],
  ['M16', 'exit-kind', 'const clean = tr.yielded && tr.exitKind === \'normal\';', 'const clean = tr.yielded || tr.exitKind === \'normal\';'],
  ['M17', 'exit-kind', "row.customType === 'session_exit'", "row.customType === 'session-exit'"],
  ['M18', 'exit-kind', "(row.data && row.data.kind) || 'unknown'", "(row.data && row.data.kind) || 'normal'"],
  // --- parents set ---------------------------------------------------------
  ['M19', 'parents', 'if (parents.size > 1)', 'if (parents.size > 2)'],
  ['M20', 'parents', 'if (parents.size > 1)', 'if (parents.size > 0)'],
  // --- sessions === 0 ------------------------------------------------------
  ['M21', 'sessions-zero', "if (sessions === 0) findings.push('NOT_A_DISPATCH');", "if (sessions === -1) findings.push('NOT_A_DISPATCH');"],
  ['M22', 'sessions-zero', 'if (sessions === 0)', 'if (sessions === 1)'],
  ['M23', 'sessions-zero', 'sessions += 1;', 'sessions += 0;'],
  // --- dispatcher log ------------------------------------------------------
  ['M24', 'spawn-log', 'spawned ${lane} ${round} ${wave} (', 'spawnX ${lane} ${round} ${wave} ('],
  ['M25', 'spawn-log', '(\\\\d+)$', '(\\\\d+)'],
  ['M26', 'spawn-log', 'else if (spawned.length > 1)', 'else if (spawned.length > 2)'],
  ['M27', 'spawn-log', "Number(spawned[0].split(' ').pop()) !== tasks.length", "Number(spawned[0].split(' ').pop()) === tasks.length"],
  ['M28', 'done-log', '*/round-${round}/${wave}-results', '*/round-9/${wave}-results'],
  ['M29', 'done-log', 'if (!lines.some((l) => doneRe.test(l))) findings.push(\'DONE_LOG_ABSENT\');', 'if (lines.some((l) => doneRe.test(l))) findings.push(\'DONE_LOG_ABSENT\');'],
  ['M30', 'done-log', 'done ${lane} ${wave} ', 'done ${lane} ${wave}X '],
  // --- ready marker --------------------------------------------------------
  ['M31', 'ready', 'if (String(ready.round) !== String(round) || ready.wave !== wave', 'if (String(ready.round) === String(round) || ready.wave !== wave'],
  ['M32', 'ready', '|| !ready.l1 ||', '|| false ||'],
  ['M33', 'ready', 'ready.wave !== wave ||', 'false ||'],
  ['M34', 'ready', '|| !String(ready.dispatch).endsWith(', '|| String(ready.dispatch).endsWith('],
  ['M35', 'ready', 'if (!readyRaw || !markRaw)', 'if (!readyRaw && !markRaw)'],
  // --- results.json --------------------------------------------------------
  ['M36', 'results', 'if (results.seats !== rs.length || rs.length !== tasks.length', 'if (results.seats === rs.length || rs.length !== tasks.length'],
  ['M37', 'results', 'rs.length !== tasks.length ||', 'rs.length === tasks.length ||'],
  ['M38', 'results', 'if (rn.get(t.name) !== t.agent)', 'if (rn.get(t.name) === t.agent)'],
  ['M39', 'results', 'if (!names.includes(r.name))', 'if (names.includes(r.name))'],
  ['M40', 'results', 'if (new Set(names).size !== names.length)', 'if (new Set(names).size === names.length)'],
  // --- session matching ----------------------------------------------------
  ['M41', 'session-match', 'if (ok) matched.push({ p, tr }); else foreign += 1;', 'if (!ok) matched.push({ p, tr }); else foreign += 1;'],
  ['M42', 'session-match', 'findings.push(foreign ? `SESSION_FOREIGN:${t.name}` : `SESSION_ABSENT:${t.name}`);', 'findings.push(foreign ? `SESSION_ABSENT:${t.name}` : `SESSION_FOREIGN:${t.name}`);'],
  ['M43', 'session-match', 'if (matched.length > 1) findings.push(', 'if (matched.length > 2) findings.push('],
  ['M44', 'session-match', 'if (!tr.sessionId) findings.push(', 'if (tr.sessionId) findings.push('],
  ['M45', 'session-match', 'else if (idSeen.has(tr.sessionId))', 'else if (false)'],
  ['M46', 'session-match', 'tr.user.includes(`# Seat ${t.name}\\n`)', 'tr.user.includes(`# Seat ${t.name}`)'],
  // --- transcript indexing ------------------------------------------------
  ['M47', 'transcript', 'if (depth < 3) walk(p, depth + 1);', 'if (depth < 0) walk(p, depth + 1);'],
  ['M48', 'transcript', "e.name.endsWith('.jsonl')", "e.name.endsWith('.json')"],
  ['M49', 'transcript', 'if (stem === name || (stem.startsWith(', 'if ((stem.startsWith('],
  ['M50', 'transcript', '/^\\d+$/.test(stem.slice(name.length + 1))', '/^.*$/.test(stem.slice(name.length + 1))'],
  ['M51', 'transcript', "row.type === 'session' && !t.sessionId", "row.type === 'session'"],
  ['M52', 'transcript', "row.message.role === 'user' && !t.user", "row.message.role === 'user'"],
  // --- report / dead-seat accounting --------------------------------------
  ['M53', 'reports', 'if (!s.dead && s.session)', 'if (s.dead && s.session)'],
  ['M54', 'reports', 'if (seen.has(h)) findings.push(', 'if (!seen.has(h)) findings.push('],
  ['M55', 'reports', 'for (const n of dead) if (!rep.includes(n))', 'for (const n of dead) if (rep.includes(n))'],
  ['M56', 'reports', 'if (reportFile) {', 'if (true) {'],
  ['M57', 'reports', 'const done = seatInfo.filter((s) => s.session && !s.dead).length;', 'const done = seatInfo.filter((s) => !s.dead).length;'],
  // --- verdict assembly ----------------------------------------------------
  ['M58', 'verdict', "unique.length ? 'DRIFT' : 'CLEAN'", "unique.length ? 'CLEAN' : 'DRIFT'"],
  ['M59', 'verdict', 'code: unique.length ? 1 : 0', 'code: unique.length ? 1 : 1'],
  ['M60', 'verdict', "f.split(':')[0]", "f.split(':')[1]"],
  // --- rev mode ------------------------------------------------------------
  ['M61', 'rev-mode', 'if (rev) {', 'if (!rev) {'],
  ['M62', 'rev-mode', 'if (probe.status !== 0) return', 'if (probe.status === 0) return'],
  // --- dispatch shape ------------------------------------------------------
  ['M63', 'dispatch-shape', 'tasks.length === 0 ||', 'tasks.length === -1 ||'],
  ['M64', 'dispatch-shape', "typeof tc.context !== 'string'", 'false'],
  // --- the selftest harness itself ----------------------------------------
  ['M65', 'selftest-harness', 'r.unique.includes(finding)', '!r.unique.includes(finding)'],
  ['M66', 'selftest-harness', 'finding === null ? r.unique.length === 0 : ', 'finding === null ? true : '],
  ['M67', 'selftest-harness', 'process.exit(passed === cases.length ? 0 : 1);', 'process.exit(passed === cases.length ? 0 : 0);'],
];

function lineOf(text, needle) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i += 1) if (lines[i].includes(needle.split('\n')[0])) return i + 1;
  return 0;
}

function occurrences(text, needle) {
  let n = 0;
  let at = 0;
  for (;;) {
    const i = text.indexOf(needle, at);
    if (i < 0) return n;
    n += 1;
    at = i + 1;
  }
}

const original = readFileSync(SRC, 'utf8');
mkdirSync(MUT, { recursive: true });
const rows = [];
const log = [];
const survivors = [];
const counts = { KILLED: 0, SURVIVED: 0, INVALID: 0, TIMEOUT: 0 };

for (const [id, axis, old, neu] of MUTANTS) {
  const occ = occurrences(original, old);
  if (occ !== 1) {
    counts.INVALID += 1;
    rows.push([id, String(lineOf(original, old)), `${old} -> ${neu}`, `INVALID(old occurs ${occ}x)`]);
    log.push(`## ${id} [${axis}] INVALID old occurs ${occ}x: ${JSON.stringify(old)}`);
    continue;
  }
  const line = lineOf(original, old);
  const mutated = original.replace(old, neu);
  const path = join(MUT, `${id}.mjs`);
  writeFileSync(path, mutated);
  const r = spawnSync('node', [path, '--selftest'], { encoding: 'utf8', timeout: TIMEOUT_MS, killSignal: 'SIGKILL' });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const failed = out.split('\n').filter((l) => l.startsWith('FAIL ') || /SyntaxError|TypeError|ReferenceError|RangeError/.test(l));
  let outcome;
  let detail;
  if (r.error && r.error.code === 'ETIMEDOUT') { outcome = 'TIMEOUT'; detail = 'timeout>60s'; }
  else if (r.status !== 0) { outcome = 'KILLED'; detail = (failed[0] || out.trim().split('\n').pop() || `exit=${r.status}`).slice(0, 220); }
  else { outcome = 'SURVIVED'; detail = 'exit=0 selftest PASS with mutant applied'; }
  counts[outcome] += 1;
  rows.push([id, String(line), `${old} -> ${neu}`, outcome]);
  log.push(`## ${id} [${axis}] line ${line} exit=${r.status} signal=${r.signal || '-'}\nold: ${JSON.stringify(old)}\nnew: ${JSON.stringify(neu)}\ndetail: ${detail}\n--- last 3 output lines:\n${out.trim().split('\n').slice(-3).join('\n')}\n`);
  if (outcome !== 'KILLED') survivors.push({ id, axis, line, old, neu, outcome });
}

const tsv = ['id\tline\toriginal -> mutant\toutcome', ...rows.map((r) => r.join('\t'))].join('\n');
writeFileSync(join(HERE, 'mutants.tsv'), `${tsv}\n`);
writeFileSync(join(HERE, 'mutants.log'), `${log.join('\n')}\n`);
writeFileSync(join(HERE, 'survivors.json'), `${JSON.stringify(survivors, null, 2)}\n`);

const total = MUTANTS.length;
const scored = total - counts.INVALID;
const rate = scored ? ((counts.KILLED / scored) * 100).toFixed(1) : '0.0';
process.stdout.write(`MUTANTS total=${total} scored=${scored} killed=${counts.KILLED} survived=${counts.SURVIVED} timeout=${counts.TIMEOUT} invalid=${counts.INVALID} kill-rate=${rate}%\n`);
for (const s of survivors) process.stdout.write(`SURVIVOR ${s.id} [${s.axis}] line ${s.line} ${s.outcome}\n`);
