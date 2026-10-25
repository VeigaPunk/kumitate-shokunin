#!/usr/bin/env node
/**
 * inline-dispatch-evidence.mjs — kumitate lane gate, contract kumitate-inline-dispatch-evidence-v1.
 *
 *   node scripts/inline-dispatch-evidence.mjs --root LANE --round N --wave NAME
 *        [--rev REV] [--sessions-root DIR] [--dispatcher-log FILE|none] [--report FILE]
 *   node scripts/inline-dispatch-evidence.mjs --selftest
 *
 * Verdict: INLINE_DISPATCH: CLEAN (seats=… sessions=… done=… reports=… dead=…)
 *          0 clean · 1 DRIFT (a real defect) · 2 fail-closed · 64 usage
 *
 * Why it exists. A run-7 wave is spawned inline by the orchestrator session, not by a
 * launcher: there is no `launcher-progress.tsv` for `dispatch-evidence.mjs` to read. The
 * lane can write every file under its own `.ufo/waves/round-N/` itself, so this gate binds a
 * wave to three records the lane does not author and cannot rewrite from inside the repo:
 *   1. one host session transcript per seat (`<sessions-root>/**\/<Seat>.jsonl`, written by
 *      the harness): it must carry the seat's `# Seat <name>` marker, the tail of the seat's
 *      dispatched task text, the head of the dispatch context, a `session` header, and a
 *      `session_exit` record; a `yield` tool call marks a seat that finished;
 *   2. the orchestrator dispatcher log (`spawned <lane> <round> <wave> <n>` and
 *      `done <lane> <wave> <results path>` lines);
 *   3. committed bytes only when `--rev` is given: every lane file is read with
 *      `git show REV:path`, never from the worktree.
 * A wave with seats but no matching transcript is NOT_A_DISPATCH; a transcript that is not
 * this seat's is SESSION_FOREIGN; two seats on one session id is SESSION_ID_DUP.
 *
 * Findings: READY_MISMATCH, DISPATCH_MISMATCH, RESULTS_MISMATCH, SESSION_ABSENT,
 * SESSION_AMBIGUOUS, SESSION_FOREIGN, SESSION_ID_DUP, PARENT_MISMATCH, SPAWN_LOG_ABSENT,
 * SPAWN_LOG_MISMATCH, DONE_LOG_ABSENT, REPORT_ABSENT, REPORT_TINY, REPORT_DUP,
 * DEAD_UNNAMED, NOT_A_DISPATCH; fail-closed ids WAVE_ABSENT, DISPATCH_UNREADABLE,
 * RESULTS_UNREADABLE, SESSIONS_ROOT_ABSENT, LOG_UNREADABLE, REV_UNREADABLE.
 * A dead seat (transcript present, no `yield` or no clean `session_exit`) is named, never
 * credited as done, and is a finding only when `--report` does not name it.
 *
 * Shape arms (kumitate r63 ratchet, K63ExecGateForgery). The row markers above are cheap to
 * hand-write: five JSON lines per seat satisfy them, so a lane that fabricates transcripts
 * passes the gate. A matched transcript must also look like the harness wrote it:
 *   SESSION_HEADER     — a `session_init` carrying a non-empty `tools` list, a `title` row, a
 *                        `system-prompt-digest` custom record, and a `model_change` whose role
 *                        is exactly `subagent:<file stem>` (a resumed seat keeps its own stem);
 *   SESSION_TOOL_JOIN  — >= 1 tool call answered by a `toolResult`, at most one result naming an
 *                        unknown call (a compacted transcript can keep a pruned call's result;
 *                        1 of 1466 real finished seats does), every result's `toolName` equal to
 *                        its call's name, and at most one unanswered call beyond the `yield` calls;
 *   SESSION_ROWGRAPH   — >= 10 rows, >= 2 assistant messages, `id` on every row but `title`,
 *                        `runtime.version` on >= rows-2 rows, and every non-null `parentId`
 *                        resolving to a row id in the same file;
 *   SESSION_TIMELINE   — every timestamp ISO-parseable, >= 8 distinct timestamps spanning >= 120s
 *                        (real minimum: 10 distinct, 425s);
 *   SESSION_TEMPLATE   — no two seats of the wave share one transcript body once ids, times and
 *                        the seat name are stripped (a name-swapped copy is not a dispatch).
 * Measured on this host's store (~/.omp/agent/sessions): every arm passes all 415 finished seats
 * that carry a `# Seat` marker (measure-real.mjs) and all 1466 finished seats on the raw metrics;
 * zero normalised-body collisions (honest minimum: 15 rows, 46 KiB, 425s span, 10 distinct times).
 * The cheapest forgery (five rows per seat) fails all four shape arms; a name-swapped copy of one
 * real transcript fails SESSION_TEMPLATE.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const CONTRACT = 'kumitate-inline-dispatch-evidence-v1';
const DEFAULT_LOG = '/fast/scratch/hyaku-run7/dispatcher.log';
const MIN_REPORT_BYTES = 64;

function usage(msg) {
  process.stderr.write(`INLINE_DISPATCH: USAGE ${msg}\n`);
  process.exit(64);
}

function parseArgs(argv) {
  const out = {
    root: process.cwd(), round: null, wave: null, rev: null, sessionsRoot: join(homedir(), '.omp', 'agent', 'sessions'),
    log: DEFAULT_LOG, report: null, selftest: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const need = () => {
      if (i + 1 >= argv.length) usage(`${a} needs a value`);
      i += 1;
      return argv[i];
    };
    if (a === '--selftest') out.selftest = true;
    else if (a === '--root') out.root = need();
    else if (a === '--round') out.round = need();
    else if (a === '--wave') out.wave = need();
    else if (a === '--rev') out.rev = need();
    else if (a === '--sessions-root') out.sessionsRoot = need();
    else if (a === '--dispatcher-log') out.log = need();
    else if (a === '--report') out.report = need();
    else usage(`unknown argument ${JSON.stringify(a)}`);
  }
  return out;
}

/** Lane file reader: committed bytes (`git show REV:path`) when rev is set, else the worktree. */
function makeSource(root, rev) {
  const abs = resolve(root);
  if (rev) {
    const probe = spawnSync('git', ['-C', abs, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8' });
    if (probe.status !== 0) return { error: `REV_UNREADABLE rev=${rev}` };
    const hash = probe.stdout.trim(); // resolved once: a moving branch name never changes the snapshot mid-run
    return {
      read(rel) {
        const r = spawnSync('git', ['-C', abs, 'show', `${hash}:${rel}`], { maxBuffer: 256 * 1024 * 1024 });
        return r.status === 0 ? r.stdout : null;
      },
    };
  }
  return {
    read(rel) {
      try { return readFileSync(join(abs, rel)); } catch { return null; }
    },
  };
}

/** Index `*.jsonl` transcripts under the sessions root (depth <= 3) by file stem. */
function indexSessions(dir) {
  const byStem = new Map();
  const walk = (d, depth) => {
    let ents = [];
    try { ents = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const p = join(d, e.name);
      if (e.isDirectory()) { if (depth < 3) walk(p, depth + 1); } else if (e.name.endsWith('.jsonl')) {
        const stem = e.name.slice(0, -'.jsonl'.length);
        if (!byStem.has(stem)) byStem.set(stem, []);
        byStem.get(stem).push(p);
      }
    }
  };
  walk(dir, 0);
  return byStem;
}

/** Transcript files for a seat: the exact stem first, then `<name>-<n>` harness label-dedupe stems. */
function candidates(index, name) {
  const exact = [...(index.get(name) || [])].sort();
  const out = [];
  for (const [stem, paths] of index) {
    if (stem !== name && stem.startsWith(`${name}-`) && /^\d+$/.test(stem.slice(name.length + 1))) out.push(...paths);
  }
  return [...exact, ...out.sort()];
}

function userText(row) {
  const c = row.message && row.message.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.filter((x) => x && x.type === 'text').map((x) => x.text).join('\n');
  return '';
}

/** Shape floors, measured over 1406 finished real seats on this host (min observed in parens). */
const SHAPE = { rows: 10, assistants: 2, spanSec: 120, distinctTs: 8 };

function parseTranscript(path) {
  const stem = basename(path, '.jsonl');
  let bad = 0;
  let raw = '';
  try {
    if (statSync(path).size > 64 * 1024 * 1024) return null; // larger than any real transcript on record (max 10.3 MB)
    raw = readFileSync(path, 'utf8');
  } catch { return null; }
  const t = {
    sessionId: null, parent: null, user: '', yielded: false, exitKind: null, model: null,
    rows: 0, idRows: 0, runtimeRows: 0, dangling: 0, sessionRow: 0, assistants: 0,
    calls: new Map(), results: [], timestamps: [], init: 0, initTools: 0, title: 0, digest: 0, subRole: 0,
    ids: new Set(), parentIds: [], norm: null,
  };
  const normRows = [];
  for (const line of raw.split('\n')) {
    if (!line) continue;
    let row;
    try { row = JSON.parse(line); } catch { bad += 1; continue; }
    { // seat-independent fingerprint: drop ids, times and the seat name
      const c = { ...row };
      delete c.id; delete c.parentId; delete c.timestamp; delete c.updatedAt; delete c.runtime;
      if (c.type === 'session') { delete c.cwd; delete c.parentSession; }
      if (c.type === 'custom' && c.customType === 'system-prompt-digest') delete c.data;
      normRows.push(JSON.stringify(c).split(stem).join('@'));
    }
    t.rows += 1;
    if (typeof row.id === 'string') { t.idRows += 1; t.ids.add(row.id); }
    if (typeof row.parentId === 'string') t.parentIds.push(row.parentId);
    if (row.runtime && typeof row.runtime.version === 'string') t.runtimeRows += 1;
    if (typeof row.timestamp === 'string') t.timestamps.push(row.timestamp);
    if (row.type === 'title') t.title += 1;
    if (row.type === 'custom' && row.customType === 'system-prompt-digest') t.digest += 1;
    if (row.type === 'session') {
      if (row.cwd && row.parentSession) t.sessionRow += 1;
      if (!t.sessionId) { t.sessionId = row.id || null; t.parent = row.parentSession || null; }
    } else if (row.type === 'session_init') {
      t.init += 1;
      if (Array.isArray(row.tools) && row.tools.length) t.initTools += 1;
    } else if (row.type === 'model_change' && row.role) {
      const role = String(row.role);
      if (role.startsWith('subagent:') && !t.model) t.model = row.model || null;
      if (role === `subagent:${stem}`) t.subRole += 1;
    } else if (row.type === 'message' && row.message) {
      if (row.message.role === 'user' && !t.user) t.user = userText(row);
      else if (row.message.role === 'assistant') {
        t.assistants += 1;
        if (Array.isArray(row.message.content)) {
          for (const part of row.message.content) {
            if (!part || part.type !== 'toolCall') continue;
            if (part.name === 'yield') t.yielded = true;
            t.calls.set(part.id, part.name);
          }
        }
      } else if (row.message.role === 'toolResult') {
        t.results.push({ id: row.message.toolCallId || row.message.tool_call_id, name: row.message.toolName });
      }
    } else if (row.type === 'custom' && row.customType === 'session_exit') t.exitKind = (row.data && row.data.kind) || 'unknown';
  }
  // parentId graph: every non-null parent must name a row of this same file
  t.dangling = t.parentIds.filter((p) => !t.ids.has(p)).length;
  t.orphans = t.results.filter((r) => !t.calls.has(r.id)).length;
  t.nameMismatch = t.results.filter((r) => t.calls.has(r.id) && t.calls.get(r.id) !== r.name).length;
  t.paired = new Set(t.results.map((r) => r.id).filter((id) => t.calls.has(id))).size;
  const parsed = t.timestamps.map((s) => Date.parse(s));
  t.tsParsed = parsed.filter((n) => Number.isFinite(n)).length;
  t.tsDistinct = new Set(t.timestamps).size;
  t.spanSec = parsed.length > 1 ? Math.round((parsed[parsed.length - 1] - parsed[0]) / 1000) : 0;
  t.norm = sha(normRows.join('\n'));
  t.bad = bad;
  return t;
}

/** The four shape arms; returns the finding ids this transcript fails. */
function shapeFindings(t) {
  const out = [];
  const yieldCalls = [...t.calls.values()].filter((n) => n === 'yield').length;
  if (!(t.init >= 1 && t.initTools >= 1 && t.title >= 1 && t.digest >= 1 && t.subRole >= 1 && t.sessionRow >= 1)) out.push('SESSION_HEADER');
  if (!(t.paired >= 1 && t.orphans <= 1 && t.nameMismatch === 0 && t.calls.size - t.paired <= 1 + yieldCalls)) out.push('SESSION_TOOL_JOIN');
  if (!(t.rows >= SHAPE.rows && t.idRows >= t.rows - 2 && t.runtimeRows >= t.rows - 2 && t.dangling === 0 && t.assistants >= SHAPE.assistants)) out.push('SESSION_ROWGRAPH');
  if (!(t.tsParsed === t.timestamps.length && t.timestamps.length >= SHAPE.distinctTs && t.tsDistinct >= SHAPE.distinctTs && t.spanSec >= SHAPE.spanSec)) out.push('SESSION_TIMELINE');
  return out;
}

const tail = (s, n) => s.trim().slice(-n);
// a seat finished when it yielded and was not recorded exiting abnormally; a seat still idle in the orchestrator has yielded but not yet written `session_exit` (K63 wave 1: 6 of 40)
const finished = (tr) => tr.yielded && (tr.exitKind === null || tr.exitKind === 'normal');
const reEsc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sha = (b) => createHash('sha256').update(b).digest('hex');

function inspect(opts) {
  const { root, round, wave, rev, sessionsRoot, log, reportFile } = opts;
  const findings = [];
  const src = makeSource(root, rev);
  if (src.error) return { code: 2, findings: ['REV_UNREADABLE'], unique: ['REV_UNREADABLE'], line: `INLINE_DISPATCH: FAIL-CLOSED ${src.error.toLowerCase().replace('_unreadable', '-unreadable')}` };
  const base = `.ufo/waves/round-${round}`;
  const readyRaw = src.read(`${base}/${wave}.ready`);
  const markRaw = src.read(`${base}/${wave}.ready.dispatched`);
  if (!readyRaw || !markRaw) return { code: 2, findings: ['WAVE_ABSENT'], unique: ['WAVE_ABSENT'], line: `INLINE_DISPATCH: FAIL-CLOSED wave-absent ready=${!!readyRaw} dispatched=${!!markRaw} wave=${base}/${wave}` };
  let ready; let dispatch; let results;
  try { ready = JSON.parse(readyRaw.toString('utf8')); } catch { return { code: 2, findings: ['DISPATCH_UNREADABLE'], unique: ['DISPATCH_UNREADABLE'], line: 'INLINE_DISPATCH: FAIL-CLOSED ready-unreadable' }; }
  const dispatchRaw = src.read(`${base}/${wave}-dispatch.json`);
  try { dispatch = JSON.parse(dispatchRaw.toString('utf8')); } catch { return { code: 2, findings: ['DISPATCH_UNREADABLE'], unique: ['DISPATCH_UNREADABLE'], line: `INLINE_DISPATCH: FAIL-CLOSED dispatch-unreadable path=${base}/${wave}-dispatch.json` }; }
  const resultsRaw = src.read(`${base}/${wave}-results.json`);
  try { results = JSON.parse(resultsRaw.toString('utf8')); } catch { return { code: 2, findings: ['RESULTS_UNREADABLE'], unique: ['RESULTS_UNREADABLE'], line: `INLINE_DISPATCH: FAIL-CLOSED results-unreadable path=${base}/${wave}-results.json` }; }

  const tc = dispatch && dispatch.taskCall;
  const tasks = tc && Array.isArray(tc.tasks) ? tc.tasks : null;
  if (!tasks || tasks.length === 0 || typeof tc.context !== 'string') return { code: 2, findings: ['DISPATCH_UNREADABLE'], unique: ['DISPATCH_UNREADABLE'], line: 'INLINE_DISPATCH: FAIL-CLOSED dispatch-taskcall-absent' };
  // lane-authored text is data, never pattern: names are plain identifiers, and a context/task too short to bind a transcript is refused (K63ReviewGateCode-2/4/5)
  if (tc.context.trim().length < 64) return { code: 2, findings: ['DISPATCH_UNREADABLE'], unique: ['DISPATCH_UNREADABLE'], line: 'INLINE_DISPATCH: FAIL-CLOSED dispatch-context-too-short' };
  for (const t of tasks) {
    if (!t || !/^[A-Za-z0-9._-]+$/.test(String(t.name))) return { code: 2, findings: ['DISPATCH_UNREADABLE'], unique: ['DISPATCH_UNREADABLE'], line: `INLINE_DISPATCH: FAIL-CLOSED dispatch-seat-name-invalid seat=${JSON.stringify(String(t && t.name)).slice(0, 40)}` };
    if (String(t.task || '').trim().length < 40) return { code: 2, findings: ['DISPATCH_UNREADABLE'], unique: ['DISPATCH_UNREADABLE'], line: `INLINE_DISPATCH: FAIL-CLOSED dispatch-task-too-short seat=${t.name}` };
  }
  const names = tasks.map((t) => t.name);
  if (new Set(names).size !== names.length) findings.push('DISPATCH_MISMATCH:duplicate-seat-names');

  // 1. the ready marker names this lane/round/wave
  if (String(ready.round) !== String(round) || ready.wave !== wave || !ready.l1 || !/\/\.ufo\/waves\/round-\d+\/[^/]+-dispatch\.json$/.test(String(ready.dispatch || ''))
    || !String(ready.dispatch).endsWith(`/round-${round}/${wave}-dispatch.json`)) {
    findings.push('READY_MISMATCH');
  }

  // 2. results.json agrees with the dispatch (names, roles, count)
  const rs = Array.isArray(results.results) ? results.results : [];
  if (results.seats !== rs.length || rs.length !== tasks.length || String(results.round) !== String(round) || results.wave !== wave) findings.push(`RESULTS_MISMATCH:count seats=${results.seats} rows=${rs.length} dispatched=${tasks.length}`);
  const rn = new Map(rs.map((r) => [r.name, r.agent]));
  for (const t of tasks) if (rn.get(t.name) !== t.agent) findings.push(`RESULTS_MISMATCH:${t.name}`);
  for (const r of rs) if (!names.includes(r.name)) findings.push(`RESULTS_MISMATCH:extra-${r.name}`);

  // 3. orchestrator dispatcher log
  const lane = String(ready.lane || '');
  if (!/^[A-Za-z0-9._-]+$/.test(lane)) return { code: 2, findings: ['READY_MISMATCH'], unique: ['READY_MISMATCH'], line: 'INLINE_DISPATCH: FAIL-CLOSED ready-lane-invalid' };
  const dirLane = /^(.+)-shokunin$/.exec(basename(resolve(root)));
  if (dirLane && dirLane[1] !== lane) findings.push(`READY_MISMATCH:lane-dir=${dirLane[1]} ready=${lane}`);
  if (!tc.context.includes(`${lane} round ${round}`)) findings.push('DISPATCH_MISMATCH:context-names-another-lane-or-round');
  if (log !== 'none') {
    let logRaw = null;
    try { logRaw = readFileSync(log, 'utf8'); } catch { return { code: 2, findings: ['LOG_UNREADABLE'], unique: ['LOG_UNREADABLE'], line: `INLINE_DISPATCH: FAIL-CLOSED log-unreadable path=${log}` }; }
    const lines = logRaw.split(/\r?\n/);
    const spawned = lines.filter((l) => new RegExp(`\\bspawned ${reEsc(lane)} ${reEsc(round)} ${reEsc(wave)} (\\d+)$`).test(l));
    if (spawned.length === 0) findings.push('SPAWN_LOG_ABSENT');
    else if (spawned.length > 1) findings.push(`SPAWN_LOG_MISMATCH:spawned-${spawned.length}-times`);
    else if (Number(spawned[0].split(' ').pop()) !== tasks.length) findings.push(`SPAWN_LOG_MISMATCH:logged=${spawned[0].split(' ').pop()} dispatched=${tasks.length}`);
    const doneRe = new RegExp(`\\bdone ${reEsc(lane)} ${reEsc(wave)} \\S*/round-${reEsc(round)}/${reEsc(wave)}-results\\.json$`);
    const doneN = lines.filter((l) => doneRe.test(l)).length;
    if (doneN === 0) findings.push('DONE_LOG_ABSENT');
    else if (doneN > 1) findings.push(`DONE_LOG_MISMATCH:done-${doneN}`);
  }

  // 4. host transcripts
  if (!existsSync(sessionsRoot)) return { code: 2, findings: ['SESSIONS_ROOT_ABSENT'], unique: ['SESSIONS_ROOT_ABSENT'], line: `INLINE_DISPATCH: FAIL-CLOSED sessions-root-absent path=${sessionsRoot}` };
  const index = indexSessions(sessionsRoot);
  const ctxHead = tc.context.trim().slice(0, 200);
  const seatInfo = [];
  const idSeen = new Map();
  const parents = new Set();
  let sessions = 0;
  for (const t of tasks) {
    const cands = candidates(index, t.name);
    const matched = [];
    let foreign = 0;
    let corrupt = 0;
    for (const p of cands) {
      const tr = parseTranscript(p);
      if (!tr) continue;
      // identity: the dispatcher composes `<context>\n\n# Seat <name>\n<task>`; the transcript's first user
      // message must end with the last 120 chars of the dispatched task (the harness rewrites paths and expands skill lines in the middle of a task), carry the seat marker and the context head (K63ReviewGateCode-2)
      const ok = tr.user.includes(`# Seat ${t.name}\n`) && tr.user.includes(ctxHead) && tr.user.trimEnd().endsWith(tail(String(t.task), 120));
      if (ok) matched.push({ p, tr }); else if (tr.bad && !tr.user) corrupt += 1; else foreign += 1;
    }
    if (matched.length === 0) {
      findings.push(corrupt && !foreign ? `SESSION_CORRUPT:${t.name}` : foreign ? `SESSION_FOREIGN:${t.name}` : `SESSION_ABSENT:${t.name}`);
      seatInfo.push({ name: t.name, session: null });
      continue;
    }
    // two finished transcripts of one seat are two writers of one task; a dead earlier try is named, not credited
    if (matched.filter((m) => finished(m.tr)).length > 1) findings.push(`SESSION_AMBIGUOUS:${t.name}`);
    const { tr } = matched.find((m) => finished(m.tr)) || matched[0];
    sessions += 1;
    for (const id of shapeFindings(tr)) findings.push(`${id}:${t.name}`);
    if (!tr.sessionId) findings.push(`SESSION_FOREIGN:${t.name}`);
    else if (idSeen.has(tr.sessionId)) findings.push(`SESSION_ID_DUP:${t.name}=${idSeen.get(tr.sessionId)}`);
    else idSeen.set(tr.sessionId, t.name);
    if (tr.parent) parents.add(tr.parent);
    const clean = finished(tr);
    seatInfo.push({ name: t.name, session: tr.sessionId, dead: !clean, model: tr.model, norm: tr.norm });
  }
  if (parents.size > 1) findings.push(`PARENT_MISMATCH:${parents.size}-parents`);
  // 4b. one transcript re-used across seats (name-swapped copy) is not a dispatch
  const byNorm = new Map();
  for (const s of seatInfo) {
    if (!s.norm) continue;
    if (byNorm.has(s.norm)) findings.push(`SESSION_TEMPLATE:${s.name}=${byNorm.get(s.norm)}`);
    else byNorm.set(s.norm, s.name);
  }
  if (sessions === 0) findings.push('NOT_A_DISPATCH');

  // 5. committed seat reports
  const seen = new Map();
  let reports = 0;
  for (const s of seatInfo) {
    const b = src.read(`${base}/${wave}/${s.name}.md`);
    s.report = !!b;
    if (!b) { if (!s.dead && s.session) findings.push(`REPORT_ABSENT:${s.name}`); continue; }
    if (b.length < MIN_REPORT_BYTES) { findings.push(`REPORT_TINY:${s.name}`); continue; }
    reports += 1;
    const h = sha(b);
    if (seen.has(h)) findings.push(`REPORT_DUP:${s.name}=${seen.get(h)}`); else seen.set(h, s.name);
  }

  // 6. dead seats: counted from transcripts, named by the report
  const dead = seatInfo.filter((s) => s.dead).map((s) => s.name);
  const done = seatInfo.filter((s) => s.session && !s.dead).length;
  if (reportFile) {
    let rep = '';
    try { rep = readFileSync(reportFile, 'utf8'); } catch { rep = ''; }
    for (const n of dead) if (!rep.includes(n)) findings.push(`DEAD_UNNAMED:${n}`);
  }

  const unique = [...new Set(findings.map((f) => f.split(':')[0]))];
  const line = `INLINE_DISPATCH: ${unique.length ? 'DRIFT' : 'CLEAN'} (seats=${tasks.length} sessions=${sessions} done=${done} reports=${reports} dead=${dead.length})`;
  return { code: unique.length ? 1 : 0, findings, unique, line, dead, seatInfo, seats: tasks.length, sessions, done, reports };
}

// ---------------------------------------------------------------- selftest
/** `o.cheap` writes the five-row forgery; otherwise a harness-shaped transcript (~15 rows) with
 *  an id/parentId graph, joined tool calls and spread timestamps. Break knobs: noHeader,
 *  noResult, orphanResult, nameMismatch, danglingParent, noIds, instant, thin, noYield, exit. */
function transcript(name, ctx, task, o = {}) {
  const user = o.user !== undefined ? o.user : `Complete assignment thoroughly:\n\n${ctx}\n\n# Seat ${name}\n${task}`;
  if (o.cheap) {
    const rows = [
      { type: 'session', version: 3, id: o.id || `sid-${name}`, cwd: '/x', parentSession: o.parent || '/p/orch.jsonl' },
      { type: 'model_change', role: `subagent:${name}`, model: 'fixture/model' },
      { type: 'message', message: { role: 'user', content: [{ type: 'text', text: user }] } },
    ];
    if (!o.noYield) rows.push({ type: 'message', message: { role: 'assistant', content: [{ type: 'toolCall', name: 'yield', arguments: {} }] } });
    if (o.exit !== false) rows.push({ type: 'custom', customType: 'session_exit', data: { kind: o.exit || 'normal' } });
    return `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`;
  }
  const t0 = Date.parse('2026-10-25T00:00:00.000Z');
  let step = 0;
  const rows = [];
  let prev = null;
  const push = (row, opts = {}) => {
    const r = { ...row };
    if (!o.noIds) {
      if (typeof r.id !== "string") r.id = `row-${name}-${rows.length}`;
      r.parentId = o.danglingParent && rows.length === 3 ? `missing-${name}` : (opts.root ? null : prev);
      r.runtime = { version: 'fixture/1.0' };
      if (!opts.noTs) r.timestamp = new Date(t0 + (o.instant ? 0 : (step += 20) * 1000)).toISOString();
      prev = r.id;
    }
    rows.push(r);
  };
  push({ type: 'title', v: 1, title: '', updatedAt: new Date(t0).toISOString(), pad: ' ' }, { noTs: true, root: true });
  push({ type: 'session', version: 3, id: o.id || `sid-${name}`, cwd: '/x', parentSession: o.parent || '/p/orch.jsonl' }, { root: true });
  push({ type: 'model_change', model: 'fixture/model' }, { root: true });
  if (!o.noHeader) {
    push({ type: 'model_change', role: `subagent:${name}`, model: 'fixture/model' }, { root: true });
    push({ type: 'session_init', systemPrompt: ['fixture prompt'], tools: ['read', 'bash', 'yield'] }, { root: true });
    push({ type: 'custom', customType: 'system-prompt-digest', data: { sha256: 'fixture' } }, { root: true });
  }
  push({ type: 'message', message: { role: 'user', content: [{ type: 'text', text: user }] } });
  for (const tool of o.thin ? [] : ['read', 'bash', 'write']) {
    const id = `call-${name}-${tool}`;
    push({ type: 'message', message: { role: 'assistant', content: [{ type: 'thinking', thinking: 'x' }, { type: 'toolCall', id, name: tool, arguments: { path: `/x/${sha(name).slice(0, 8)}-${tool}` } }] } });
    if (o.noResult) continue;
    push({ type: 'message', message: { role: 'toolResult', toolCallId: o.orphanResult ? `call-ghost-${tool}` : id, toolName: o.nameMismatch ? 'eval' : tool, content: [{ type: 'text', text: `ok ${sha(name).slice(0, 8)}` }] } });
  }
  if (!o.noYield) push({ type: 'message', message: { role: 'assistant', content: [{ type: 'toolCall', id: `call-${name}-yield`, name: 'yield', arguments: {} }] } });
  if (o.exit !== false) push({ type: 'custom', customType: 'session_exit', data: { kind: o.exit || 'normal' } });
  return `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`;
}

function fixture(dir, names, o = {}) {
  const lane = join(dir, 'lane');
  const sess = join(dir, 'sessions', 'orch');
  const base = join(lane, '.ufo', 'waves', 'round-7');
  mkdirSync(join(base, 'w1'), { recursive: true });
  mkdirSync(sess, { recursive: true });
  const ctx = 'ROUND CONTEXT (lane demo round 7, wave w1)\nLane repo: /x — fixture context long enough to bind a transcript to its dispatch.';
  const tasks = names.map((n) => ({ name: n, agent: 'executor', task: `/skill:godspeed\n\ndo the work for ${n}.\nReport: .ufo/waves/round-7/w1/${n}.md` }));
  writeFileSync(join(base, 'w1-dispatch.json'), JSON.stringify({ taskCall: { context: ctx, tasks } }));
  writeFileSync(join(base, 'w1.ready'), JSON.stringify(o.ready || { lane: 'demo', round: 7, wave: 'w1', dispatch: '/abs/lane/.ufo/waves/round-7/w1-dispatch.json', l1: 'DemoR7' }));
  writeFileSync(join(base, 'w1.ready.dispatched'), '2026-10-25T00:00:00\n');
  const rs = (o.resultNames || names).map((n) => ({ name: n, agent: 'executor', output: null }));
  writeFileSync(join(base, 'w1-results.json'), JSON.stringify({ lane: 'demo', round: 7, wave: 'w1', seats: o.seatsLie === undefined ? rs.length : o.seatsLie, results: rs }));
  const lines = [`2026-10-25T00:00:00 spawned demo 7 w1 ${o.spawnN === undefined ? names.length : o.spawnN}`];
  if (!o.noDone) lines.push('2026-10-25T00:01:00 done demo w1 /abs/lane/.ufo/waves/round-7/w1-results.json');
  if (o.noSpawn) lines.shift();
  const logPath = join(dir, 'dispatcher.log');
  writeFileSync(logPath, `${lines.join('\n')}\n`);
  for (const t of tasks) {
    const od = (o.tr && o.tr[t.name]) || {};
    if (o.noSession && o.noSession.includes(t.name)) continue;
    if (o.copyFrom && o.copyFrom.includes(t.name) && t.name !== o.copyFrom[0]) {
      const src = o.copyFrom[0];
      const bytes = readFileSync(join(sess, `${src}.jsonl`), `utf8`);
      writeFileSync(join(sess, `${t.name}.jsonl`), bytes.split(src).join(t.name));
      continue;
    }
    writeFileSync(join(sess, `${t.name}.jsonl`), transcript(t.name, ctx, t.task, od));
    if (!(o.noReport && o.noReport.includes(t.name))) {
      writeFileSync(join(base, 'w1', `${t.name}.md`), (o.reportBody && o.reportBody[t.name]) || `# ${t.name}\n\nfixture seat report with enough bytes to pass the size floor.\n${'x'.repeat(40)} ${t.name}\n`);
    }
  }
  return { lane, sessions: join(dir, 'sessions'), log: logPath, base };
}

function selftest() {
  const cases = [];
  const T = mkdtempSync(join(tmpdir(), 'inline-dispatch-selftest.'));
  let n = 0;
  const mk = (names, o) => { n += 1; const d = join(T, `c${n}`); mkdirSync(d); return { d, f: fixture(d, names, o) }; };
  const run = (f, extra = {}) => inspect({ root: f.lane, round: '7', wave: 'w1', rev: null, sessionsRoot: f.sessions, log: f.log, reportFile: null, ...extra });
  const expect = (label, r, code, finding) => cases.push([label, r.code === code && (finding === null ? r.unique.length === 0 : r.unique.includes(finding)), r.line + (r.unique.length ? ` [${r.unique.join(',')}]` : '')]);
  try {
    expect('honest', run(mk(['A1', 'B2', 'C3']).f), 0, null);
    expect('dead-seat-counted-not-credited', (() => { const r = run(mk(['A1', 'B2'], { tr: { B2: { noYield: true, exit: 'aborted' } } }).f); cases.push(['dead-count', r.dead.length === 1 && r.done === 1, `dead=${r.dead} done=${r.done}`]); return r; })(), 0, null);
    { const { f, d } = mk(['A1', 'B2'], { tr: { B2: { noYield: true, exit: 'aborted' } } }); const rep = join(d, 'report.md'); writeFileSync(rep, 'mentions A1 only'); expect('dead-unnamed-in-report', run(f, { reportFile: rep }), 1, 'DEAD_UNNAMED'); writeFileSync(rep, 'dead seat B2 error text'); expect('dead-named-in-report', run(f, { reportFile: rep }), 0, null); }
    expect('forged-no-sessions', run(mk(['A1', 'B2', 'C3'], { noSession: ['A1', 'B2', 'C3'] }).f), 1, 'NOT_A_DISPATCH');
    expect('one-session-missing', run(mk(['A1', 'B2', 'C3'], { noSession: ['B2'] }).f), 1, 'SESSION_ABSENT');
    expect('foreign-transcript', run(mk(['A1', 'B2'], { tr: { B2: { user: 'Complete assignment thoroughly: other lane work' } } }).f), 1, 'SESSION_FOREIGN');
    expect('session-id-dup', run(mk(['A1', 'B2'], { tr: { A1: { id: 'same' }, B2: { id: 'same' } } }).f), 1, 'SESSION_ID_DUP');
    expect('parent-mismatch', run(mk(['A1', 'B2'], { tr: { B2: { parent: '/p/other.jsonl' } } }).f), 1, 'PARENT_MISMATCH');
    expect('spawn-count-lie', run(mk(['A1', 'B2'], { spawnN: 5 }).f), 1, 'SPAWN_LOG_MISMATCH');
    expect('spawn-line-absent', run(mk(['A1', 'B2'], { noSpawn: true }).f), 1, 'SPAWN_LOG_ABSENT');
    expect('done-line-absent', run(mk(['A1', 'B2'], { noDone: true }).f), 1, 'DONE_LOG_ABSENT');
    expect('results-name-mismatch', run(mk(['A1', 'B2'], { resultNames: ['A1', 'Z9'] }).f), 1, 'RESULTS_MISMATCH');
    expect('results-seats-lie', run(mk(['A1', 'B2'], { seatsLie: 9 }).f), 1, 'RESULTS_MISMATCH');
    expect('report-absent', run(mk(['A1', 'B2'], { noReport: ['B2'] }).f), 1, 'REPORT_ABSENT');
    expect('report-tiny', run(mk(['A1', 'B2'], { reportBody: { B2: 'ok\n' } }).f), 1, 'REPORT_TINY');
    expect('report-duplicate-bytes', run(mk(['A1', 'B2'], { reportBody: { A1: `${'same body '.repeat(12)}\n`, B2: `${'same body '.repeat(12)}\n` } }).f), 1, 'REPORT_DUP');
    expect('ready-wrong-round', run(mk(['A1'], { ready: { lane: 'demo', round: 9, wave: 'w1', dispatch: '/abs/lane/.ufo/waves/round-9/w1-dispatch.json', l1: 'X' } }).f), 1, 'READY_MISMATCH');
    { const { f } = mk(['A1']); rmSync(join(f.base, 'w1.ready.dispatched')); expect('marker-absent-fail-closed', run(f), 2, 'WAVE_ABSENT'); }
    { const { f } = mk(['A1']); expect('sessions-root-absent-fail-closed', run(f, { sessionsRoot: join(T, 'nope') }), 2, 'SESSIONS_ROOT_ABSENT'); }
    { const { f } = mk(['A1']); expect('log-absent-fail-closed', run(f, { log: join(T, 'nolog') }), 2, 'LOG_UNREADABLE'); }
    // r63 review ratchet (K63ReviewGateCode): lane-authored text is data, never pattern
    const rewrite = (f, file, fn) => { const p = join(f.base, file); writeFileSync(p, fn(readFileSync(p, 'utf8'))); };
    { const { f } = mk(['A1']); rewrite(f, 'w1.ready', (t) => t.replace('"demo"', '"(("')); expect('ready-lane-regex-syntax-fail-closed', run(f), 2, 'READY_MISMATCH'); }
    { const { f } = mk(['A1']); rewrite(f, 'w1.ready', (t) => t.replace('"demo"', '".*"')); expect('ready-lane-wildcard-fail-closed', run(f), 2, 'READY_MISMATCH'); }
    { const { f } = mk(['A1']); rewrite(f, 'w1-dispatch.json', (t) => t.replace(/"context":"[^"]*"/, '"context":""')); expect('empty-context-fail-closed', run(f), 2, 'DISPATCH_UNREADABLE'); }
    { const { f } = mk(['A1']); rewrite(f, 'w1-dispatch.json', (t) => t.replace('"name":"A1"', '"name":"../x"')); expect('seat-name-traversal-fail-closed', run(f), 2, 'DISPATCH_UNREADABLE'); }
    { const { f } = mk(['A1']); rewrite(f, 'w1-dispatch.json', (t) => t.replace('round 7', 'round 99')); expect('context-names-another-round', run(f), 1, 'DISPATCH_MISMATCH'); }
    { const { f } = mk(['A1', 'B2']); writeFileSync(f.log, readFileSync(f.log, 'utf8').replace(/\n/g, '\r\n')); expect('crlf-log-reads-clean', run(f), 0, null); }
    { const { f } = mk(['A1']); writeFileSync(f.log, `${readFileSync(f.log, 'utf8')}2026-10-25T00:02:00 done demo w1 /abs/lane/.ufo/waves/round-7/w1-results.json\n`); expect('done-twice', run(f), 1, 'DONE_LOG_MISMATCH'); }
    { const { f } = mk(['A1']); writeFileSync(join(f.sessions, 'orch', 'A1.jsonl'), '{"type":"session"\n{broken\n'); expect('corrupt-transcript', run(f), 1, 'SESSION_CORRUPT'); }
    { const { f } = mk(['A1']); const o = join(f.sessions, 'orch'); writeFileSync(join(o, 'A1-2.jsonl'), readFileSync(join(o, 'A1.jsonl'), 'utf8').replace('sid-A1', 'sid-A1-second')); expect('two-finished-writers', run(f), 1, 'SESSION_AMBIGUOUS'); }
    { const { f } = mk(['A1']); const o = join(f.sessions, 'orch'); writeFileSync(join(o, 'A1-2.jsonl'), readFileSync(join(o, 'A1.jsonl'), 'utf8').replace('sid-A1', 'sid-A1-dead').split('\n').filter((l) => !l.includes('session_exit') && !l.includes('"yield"')).join('\n')); expect('dead-earlier-try-is-not-ambiguity', run(f), 0, null); }
    { const { f } = mk(['A1']); const o = join(f.sessions, 'orch'); const t = readFileSync(join(o, 'A1.jsonl'), 'utf8').split('\n'); const i = t.findIndex((l) => l.includes('"role":"user"')); const row = JSON.parse(t[i]); row.message.content[0].text = `Complete assignment thoroughly:\n\n# Seat A1\n${'x'.repeat(10)}`; t[i] = JSON.stringify(row); writeFileSync(join(o, 'A1.jsonl'), t.join('\n')); expect('marker-only-transcript-is-foreign', run(f), 1, 'SESSION_FOREIGN'); }
    // shape arms: the cheapest forgery (five rows per seat) and one broken invariant each
    expect('forged-cheap-transcripts', run(mk(['A1', 'B2', 'C3'], { tr: { A1: { cheap: true }, B2: { cheap: true }, C3: { cheap: true } } }).f), 1, 'SESSION_TOOL_JOIN');
    expect('forged-cheap-one-seat', run(mk(['A1', 'B2'], { tr: { B2: { cheap: true } } }).f), 1, 'SESSION_HEADER');
    expect('shape-header-records-absent', run(mk(['A1', 'B2'], { tr: { B2: { noHeader: true } } }).f), 1, 'SESSION_HEADER');
    expect('shape-toolcall-without-result', run(mk(['A1', 'B2'], { tr: { B2: { noResult: true } } }).f), 1, 'SESSION_TOOL_JOIN');
    expect('shape-orphan-toolresult', run(mk(['A1', 'B2'], { tr: { B2: { orphanResult: true } } }).f), 1, 'SESSION_TOOL_JOIN');
    expect('shape-toolresult-name-mismatch', run(mk(['A1', 'B2'], { tr: { B2: { nameMismatch: true } } }).f), 1, 'SESSION_TOOL_JOIN');
    expect('shape-dangling-parentid', run(mk(['A1', 'B2'], { tr: { B2: { danglingParent: true } } }).f), 1, 'SESSION_ROWGRAPH');
    expect('shape-no-row-ids', run(mk(['A1', 'B2'], { tr: { B2: { noIds: true } } }).f), 1, 'SESSION_ROWGRAPH');
    expect('shape-thin-transcript', run(mk(['A1', 'B2'], { tr: { B2: { thin: true } } }).f), 1, 'SESSION_ROWGRAPH');
    expect('shape-instant-timeline', run(mk(['A1', 'B2'], { tr: { B2: { instant: true } } }).f), 1, 'SESSION_TIMELINE');
    expect('shape-template-transcripts', run(mk(['A1', 'B2'], { copyFrom: ['A1', 'B2'] }).f), 1, 'SESSION_TEMPLATE');
    expect('shape-honest-transcript-passes', run(mk(['A1', 'B2', 'C3']).f), 0, null);
    // committed-bytes mode: a worktree edit after the commit must not change the verdict
    {
      const { f, d } = mk(['A1', 'B2']);
      const G = join(d, 'lane');
      spawnSync('git', ['-C', G, 'init', '-q']);
      const top = spawnSync('git', ['-C', G, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim();
      if (top === G) {
        const idArgs = ['-c', 'user.name=selftest', '-c', 'user.email=selftest@invalid'];
        spawnSync('git', ['-C', G, 'add', '-A']);
        spawnSync('git', ['-C', G, ...idArgs, 'commit', '-q', '-m', 'fixture']);
        const rev = spawnSync('git', ['-C', G, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
        writeFileSync(join(f.base, 'w1', 'B2.md'), 'x');
        expect('rev-mode-ignores-worktree-edit', run(f, { rev }), 0, null);
        expect('worktree-mode-sees-edit', run(f), 1, 'REPORT_TINY');
        expect('rev-unreadable-fail-closed', run(f, { rev: '0'.repeat(40) }), 2, 'REV_UNREADABLE');
      } else cases.push(['rev-mode-fixture-toplevel', false, `toplevel=${top} expected=${G}`]);
    }
    // wave-2 selftest closure (K63R2ExecSelftestGaps): every wave-1 literal mutant that survived the 48-case suite
    const FIXCTX = 'ROUND CONTEXT (lane demo round 7, wave w1)\nLane repo: /x — fixture context long enough to bind a transcript to its dispatch.';
    const TASK_A1 = '/skill:godspeed\n\ndo the work for A1.\nReport: .ufo/waves/round-7/w1/A1.md';
    expect('report-floor-63-bytes', run(mk(['A1'], { reportBody: { A1: 'y'.repeat(63) } }).f), 1, 'REPORT_TINY');
    expect('report-floor-64-bytes', run(mk(['A1'], { reportBody: { A1: 'y'.repeat(64) } }).f), 0, null);
    expect('transcript-wrong-task-text', run(mk(['A1'], { tr: { A1: { user: 'Complete assignment thoroughly:\n\nROUND CONTEXT (lane demo round 7)\n\n# Seat A1\nwrong work only; see other note' } } }).f), 1, 'SESSION_FOREIGN');
    expect('transcript-final-character-only-is-foreign', run(mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\n${FIXCTX}\n\n# Seat A1\nnot the task ${TASK_A1.slice(-1)}` } } }).f), 1, 'SESSION_FOREIGN');
    { const { f } = mk(['A1']); const task = 'long dispatched task '.repeat(20); const p = join(f.base, 'w1-dispatch.json'); const doc = JSON.parse(readFileSync(p, 'utf8')); doc.taskCall.tasks[0].task = task; writeFileSync(p, JSON.stringify(doc)); const tp = join(f.sessions, 'orch', 'A1.jsonl'); const lines = readFileSync(tp, 'utf8').trimEnd().split('\n'); const userIndex = lines.findIndex((line) => line.includes('"role":"user"')); const userRow = JSON.parse(lines[userIndex]); userRow.message.content[0].text = `Complete assignment thoroughly:\n\n${FIXCTX}\n\n# Seat A1\n${task.slice(-150)}`; lines[userIndex] = JSON.stringify(userRow); writeFileSync(tp, `${lines.join('\n')}\n`); expect('transcript-truncated-task-tail', run(f), 0, null); }
    expect('transcript-wrong-context', run(mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\nSOME OTHER ROUND CONTEXT\n\n# Seat A1\n${TASK_A1}` } } }).f), 1, 'SESSION_FOREIGN');
    expect('transcript-five-char-context', run(mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\nROUND\n\n# Seat A1\n${TASK_A1}` } } }).f), 1, 'SESSION_FOREIGN');
    { const { f } = mk(['A1','B2'], { tr: { B2: { exit: 'aborted' } }, noReport: ['B2'] }); expect('aborted-session-exit-not-finished', run(f, { reportFile: join(f.base, 'dead-report.md') }), 1, 'DEAD_UNNAMED'); }
    { const { f } = mk(['A1','B2'], { tr: { B2: { exit: false } }, noReport: ['B2'] }); const p = join(f.sessions, 'orch', 'B2.jsonl'); const lines = readFileSync(p, 'utf8').trimEnd().split('\n'); lines.push(JSON.stringify({ type:'custom', customType:'session_exit', data:{} })); writeFileSync(p, `${lines.join('\n')}\n`); expect('exit-row-without-kind-is-dead', run(f, { reportFile: join(f.base, 'dead-report.md') }), 1, 'DEAD_UNNAMED'); }
    { const { f } = mk(['A1','B2']); const lines=readFileSync(f.log,'utf8').split('\n'); lines[0]+=' trailing-token'; writeFileSync(f.log,lines.join('\n')); expect('spawn-line-trailing-token', run(f), 1, 'SPAWN_LOG_ABSENT'); }
    { const { f } = mk(['A1','B2']); writeFileSync(f.log, `${readFileSync(f.log,'utf8').trimEnd()}\n2026-10-25T00:00:01 spawned demo 7 w1 2\n`); expect('spawn-line-twice', run(f), 1, 'SPAWN_LOG_MISMATCH'); }
    expect('ready-without-l1', run(mk(['A1'], { ready: { lane:'demo', round:7, wave:'w1', dispatch:'/abs/lane/.ufo/waves/round-7/w1-dispatch.json' } }).f), 1, 'READY_MISMATCH');
    expect('ready-wrong-wave-name', run(mk(['A1'], { ready: { lane:'demo', round:7, wave:'w9', dispatch:'/abs/lane/.ufo/waves/round-7/w1-dispatch.json', l1:'DemoR7' } }).f), 1, 'READY_MISMATCH');
    expect('seat-marker-prefix-collision', run(mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\n${FIXCTX}\n\n# Seat A10\n${TASK_A1}` } } }).f), 1, 'SESSION_FOREIGN');
    { const { f } = mk(['A1']); const dir = join(f.sessions, 'orch'); const p = join(dir, 'A1.jsonl'); writeFileSync(join(dir, 'A1-notes.jsonl'), readFileSync(p)); rmSync(p); expect('transcript-stem-not-seat', run(f), 1, 'SESSION_ABSENT'); }
    { const { f } = mk(['A1']); const p = join(f.sessions, 'orch', 'A1.jsonl'); const lines = readFileSync(p, 'utf8').trimEnd().split('\n'); const first = lines.findIndex((line) => line.includes('"role":"user"')); const row = JSON.parse(lines[first]); row.message.content[0].text = 'Complete assignment thoroughly: foreign task text'; lines[first] = JSON.stringify(row); const valid = `Complete assignment thoroughly:\n\n${FIXCTX}\n\n# Seat A1\n${TASK_A1}`; lines.push(JSON.stringify({ type:'message', message:{ role:'user', content:[{ type:'text', text:valid }] } })); writeFileSync(p, `${lines.join('\n')}\n`); expect('second-user-message-cannot-repair', run(f), 1, 'SESSION_FOREIGN'); }
    { const r = run(mk(['A1','B2'], { noSession: ['A1','B2'] }).f); expect('no-sessions-not-a-dispatch', r, 1, 'NOT_A_DISPATCH'); if (r.done !== 0) cases.push(['no-sessions-done-is-zero', false, `done=${r.done}`]); }
    { const r = run(mk(['A1']).f); cases.push(['verdict-word-clean', r.code === 0 && r.line.startsWith('INLINE_DISPATCH: CLEAN '), r.line]); }
    { const { f } = mk(['A1']); rewrite(f, 'w1-dispatch.json', (s) => s.replace(/"tasks":\[[^\]]*\]/, '"tasks":[]')); expect('empty-task-list-fail-closed', run(f), 2, 'DISPATCH_UNREADABLE'); }
    { const { f } = mk(['A1']); rewrite(f, 'w1-dispatch.json', (s) => s.replace(/"context":"[^"]*"/, '"context":123')); let result; try { result = run(f); } catch { result = { code:2, unique:['INTERNAL_ERROR'], line:'caught unexpected throw' }; } expect('context-not-a-string-fail-closed', result, 2, 'DISPATCH_UNREADABLE'); }
    // a seat that yielded and has no session_exit row yet is finished (wave 1: 6 of 40 seats were still idle when the wave settled)
    { const r = run(mk(['A1'], { tr: { A1: { exit: false } } }).f); cases.push(['yielded-without-exit-row-is-finished', r.code === 0 && r.done === 1 && r.dead.length === 0, r.line]); }
  } finally {
    rmSync(T, { recursive: true, force: true });
  }
  let passed = 0;
  for (const [name, ok, line] of cases) {
    process.stdout.write(`${ok ? 'PASS' : 'FAIL'} ${name} — ${line}\n`);
    if (ok) passed += 1;
  }
  process.stdout.write(`INLINE_DISPATCH_SELFTEST: ${passed === cases.length ? 'PASS' : 'FAIL'} (${passed}/${cases.length})\n`);
  process.exit(passed === cases.length ? 0 : 1);
}

const args = parseArgs(process.argv.slice(2));
if (args.selftest) selftest();
if (!args.round || !args.wave) usage('--root DIR --round N --wave NAME are required (or --selftest)');
if (!/^\d+$/.test(String(args.round))) usage('--round must be an integer');
if (!/^[A-Za-z0-9._-]+$/.test(String(args.wave))) usage('--wave must be a plain name');

let result;
try {
  result = inspect({
    root: args.root, round: String(args.round), wave: String(args.wave), rev: args.rev,
    sessionsRoot: args.sessionsRoot, log: args.log, reportFile: args.report,
  });
} catch (e) {
  result = { code: 2, findings: ['INTERNAL_ERROR'], unique: ['INTERNAL_ERROR'], line: `INLINE_DISPATCH: FAIL-CLOSED internal-error msg=${String(e && e.message).replace(/[^\x20-\x7e]/g, '?').slice(0, 80)}` };
}
process.stdout.write(`${result.line}\n`);
for (const f of result.findings) process.stdout.write(`FINDING ${f}\n`);
if (result.dead && result.dead.length) process.stdout.write(`DEAD ${result.dead.join(',')}\n`);
if (result.code === 2) process.stderr.write(`INLINE_DISPATCH: FAIL-CLOSED contract=${CONTRACT}\n`);
process.exit(result.code);
