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
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

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
    const probe = spawnSync('git', ['-C', abs, 'cat-file', '-e', `${rev}^{commit}`], { encoding: 'utf8' });
    if (probe.status !== 0) return { error: `REV_UNREADABLE rev=${rev}` };
    return {
      read(rel) {
        const r = spawnSync('git', ['-C', abs, 'show', `${rev}:${rel}`], { maxBuffer: 256 * 1024 * 1024 });
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

function candidates(index, name) {
  const out = [];
  for (const [stem, paths] of index) {
    if (stem === name || (stem.startsWith(`${name}-`) && /^\d+$/.test(stem.slice(name.length + 1)))) out.push(...paths);
  }
  return out;
}

function userText(row) {
  const c = row.message && row.message.content;
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.filter((x) => x && x.type === 'text').map((x) => x.text).join('\n');
  return '';
}

function parseTranscript(path) {
  let raw = '';
  try { raw = readFileSync(path, 'utf8'); } catch { return null; }
  const t = { sessionId: null, parent: null, user: '', yielded: false, exitKind: null, model: null };
  for (const line of raw.split('\n')) {
    if (!line) continue;
    let row;
    try { row = JSON.parse(line); } catch { continue; }
    if (row.type === 'session' && !t.sessionId) { t.sessionId = row.id || null; t.parent = row.parentSession || null; }
    else if (row.type === 'model_change' && row.role && String(row.role).startsWith('subagent:') && !t.model) t.model = row.model || null;
    else if (row.type === 'message' && row.message) {
      if (row.message.role === 'user' && !t.user) t.user = userText(row);
      else if (row.message.role === 'assistant' && Array.isArray(row.message.content)) {
        for (const part of row.message.content) if (part && part.type === 'toolCall' && part.name === 'yield') t.yielded = true;
      }
    } else if (row.type === 'custom' && row.customType === 'session_exit') t.exitKind = (row.data && row.data.kind) || 'unknown';
  }
  return t;
}

const tail = (s, n) => s.trim().slice(-n);
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
  if (log !== 'none') {
    let logRaw = null;
    try { logRaw = readFileSync(log, 'utf8'); } catch { return { code: 2, findings: ['LOG_UNREADABLE'], unique: ['LOG_UNREADABLE'], line: `INLINE_DISPATCH: FAIL-CLOSED log-unreadable path=${log}` }; }
    const lines = logRaw.split('\n');
    const spawned = lines.filter((l) => new RegExp(`\\bspawned ${lane} ${round} ${wave} (\\d+)$`).test(l));
    if (spawned.length === 0) findings.push('SPAWN_LOG_ABSENT');
    else if (spawned.length > 1) findings.push(`SPAWN_LOG_MISMATCH:spawned-${spawned.length}-times`);
    else if (Number(spawned[0].split(' ').pop()) !== tasks.length) findings.push(`SPAWN_LOG_MISMATCH:logged=${spawned[0].split(' ').pop()} dispatched=${tasks.length}`);
    const doneRe = new RegExp(`\\bdone ${lane} ${wave} \\S*/round-${round}/${wave}-results\\.json$`);
    if (!lines.some((l) => doneRe.test(l))) findings.push('DONE_LOG_ABSENT');
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
    for (const p of cands) {
      const tr = parseTranscript(p);
      if (!tr) continue;
      const ok = tr.user.includes(`# Seat ${t.name}\n`) && tr.user.includes(ctxHead) && tr.user.includes(tail(String(t.task), 120));
      if (ok) matched.push({ p, tr }); else foreign += 1;
    }
    if (matched.length === 0) {
      findings.push(foreign ? `SESSION_FOREIGN:${t.name}` : `SESSION_ABSENT:${t.name}`);
      seatInfo.push({ name: t.name, session: null });
      continue;
    }
    if (matched.length > 1) findings.push(`SESSION_AMBIGUOUS:${t.name}`);
    const { tr } = matched[0];
    sessions += 1;
    if (!tr.sessionId) findings.push(`SESSION_FOREIGN:${t.name}`);
    else if (idSeen.has(tr.sessionId)) findings.push(`SESSION_ID_DUP:${t.name}=${idSeen.get(tr.sessionId)}`);
    else idSeen.set(tr.sessionId, t.name);
    if (tr.parent) parents.add(tr.parent);
    const clean = tr.yielded && tr.exitKind === 'normal';
    seatInfo.push({ name: t.name, session: tr.sessionId, dead: !clean, model: tr.model });
  }
  if (parents.size > 1) findings.push(`PARENT_MISMATCH:${parents.size}-parents`);
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

function fixture(dir, names, o = {}) {
  const lane = join(dir, 'lane');
  const sess = join(dir, 'sessions', 'orch');
  const base = join(lane, '.ufo', 'waves', 'round-7');
  mkdirSync(join(base, 'w1'), { recursive: true });
  mkdirSync(sess, { recursive: true });
  const ctx = o.ctx === undefined ? 'ROUND CONTEXT (lane demo round 7, wave w1)\nLane repo: /x' : o.ctx;
  const tasks = names.map((n) => ({ name: n, agent: 'executor', task: (o.tasks && o.tasks[n]) || `/skill:godspeed\n\ndo the work for ${n}.\nReport: .ufo/waves/round-7/w1/${n}.md` }));
  writeFileSync(join(base, 'w1-dispatch.json'), JSON.stringify({ taskCall: { context: o.dispatchCtx === undefined ? ctx : o.dispatchCtx, tasks: o.emptyTasks ? [] : tasks } }));
  writeFileSync(join(base, 'w1.ready'), JSON.stringify(o.ready || { lane: 'demo', round: 7, wave: 'w1', dispatch: '/abs/lane/.ufo/waves/round-7/w1-dispatch.json', l1: 'DemoR7' }));
  writeFileSync(join(base, 'w1.ready.dispatched'), '2026-10-25T00:00:00\n');
  const rs = (o.resultNames || names).map((n) => ({ name: n, agent: 'executor', output: null }));
  writeFileSync(join(base, 'w1-results.json'), JSON.stringify({ lane: 'demo', round: 7, wave: 'w1', seats: o.seatsLie === undefined ? rs.length : o.seatsLie, results: rs }));
  const lines = [`2026-10-25T00:00:00 spawned demo 7 w1 ${o.spawnN === undefined ? names.length : o.spawnN}${o.spawnTail || ''}`];
  if (o.extraSpawn) lines.push(`2026-10-25T00:00:30 spawned demo 7 w1 ${names.length}`);
  if (!o.noDone) lines.push('2026-10-25T00:01:00 done demo w1 /abs/lane/.ufo/waves/round-7/w1-results.json');
  if (o.noSpawn) lines.shift();
  const logPath = join(dir, 'dispatcher.log');
  writeFileSync(logPath, `${lines.join('\n')}\n`);
  for (const t of tasks) {
    const od = (o.tr && o.tr[t.name]) || {};
    if (o.noSessionAll || (o.noSession && o.noSession.includes(t.name))) continue;
    writeFileSync(join(sess, `${od.file || t.name}.jsonl`), transcript(od.seatName || t.name, ctx, t.task, od));
    if (!(o.noReport && o.noReport.includes(t.name))) {
      writeFileSync(join(base, 'w1', `${t.name}.md`), (o.reportBody && o.reportBody[t.name]) || `# ${t.name}\n\nfixture seat report with enough bytes to pass the size floor.\n${'x'.repeat(40)} ${t.name}\n`);
    }
  }
  for (const [f, body] of Object.entries(o.rawFiles || {})) writeFileSync(join(sess, f), body);
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
    // ---- round-63 mutation battery (seat K63ExecSelftestMutants): one case per surviving mutant
    // Every case below is a fixture the frozen 25-case suite could not express; each one makes
    // one surviving single-literal mutant FAIL. Case names carry the mutant id in a comment.
    const FIXCTX = 'ROUND CONTEXT (lane demo round 7, wave w1)\nLane repo: /x';
    const LONG_TASK = `/skill:godspeed\n\n${'z'.repeat(400)}\n\nReport: .ufo/waves/round-7/w1/A1.md`;
    const TASK_A1 = `/skill:godspeed\n\ndo the work for A1.\nReport: .ufo/waves/round-7/w1/A1.md`;
    // M02: a 63-byte report is below the 64-byte floor.
    expect('report-floor-63-bytes', run(mk(['A1'], { reportBody: { A1: 'y'.repeat(63) } }).f), 1, 'REPORT_TINY');
    // M03: a 64-byte report is exactly at the floor, not below it.
    expect('report-floor-64-bytes', run(mk(['A1'], { reportBody: { A1: 'y'.repeat(64) } }).f), 0, null);
    // M05 + M08: right marker and context, wrong task text (and no char the task ends with).
    expect('transcript-wrong-task-text', run(mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\n${FIXCTX}\n\n# Seat A1\nwrong work only; see the other note` } } }).f), 1, 'SESSION_FOREIGN');
    // M06 + M07: the transcript carries only the last 150 chars of a >500-char task: the 120-char
    // tail is present, the whole task is not. The 120 window must stay a window.
    expect('transcript-truncated-task-tail', run(mk(['A1'], { tasks: { A1: LONG_TASK }, tr: { A1: { user: `Complete assignment thoroughly:\n\n${FIXCTX}\n\n# Seat A1\n${LONG_TASK.slice(-150)}` } } }).f), 0, null);
    // M09 + M11: right marker and task, a different round's context.
    expect('transcript-wrong-context', run(mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\nSOME OTHER ROUND CONTEXT\n\n# Seat A1\n${TASK_A1}` } } }).f), 1, 'SESSION_FOREIGN');
    // M10: a context that agrees for five characters and diverges after.
    expect('transcript-five-char-context', run(mk(['A1'], { tr: { A1: { user: `Complete assignment thoroughly:\n\nROUND context truncated after five chars\n\n# Seat A1\n${TASK_A1}` } } }).f), 1, 'SESSION_FOREIGN');
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
    expect('two-transcripts-one-seat', run(mk(['A1'], { rawFiles: { 'A1-2.jsonl': transcript('A1', FIXCTX, '/skill:godspeed\n\ndo the work for A1.\nReport: .ufo/waves/round-7/w1/A1.md') } }).f), 1, 'SESSION_AMBIGUOUS');
    // M46: '# Seat A10' is not '# Seat A1'.
    expect('seat-marker-prefix-collision', run(mk(['A1'], { tr: { A1: { seatName: 'A10' } } }).f), 1, 'SESSION_FOREIGN');
    // M50: a transcript stem that is not the seat name (A1-notes) is not this seat's session.
    expect('transcript-stem-not-seat', run(mk(['A1'], { tr: { A1: { file: 'A1-notes' } } }).f), 1, 'SESSION_ABSENT');
    // M51: a second session row in the same transcript cannot launder a duplicated session id.
    expect('second-session-row-hides-dup', run(mk(['A1', 'B2'], { tr: { B2: { id: 'sid-A1', extraRows: [{ type: 'session', version: 3, id: 'sid-B2-uniq', parentSession: '/p/orch.jsonl' }] } } }).f), 1, 'SESSION_ID_DUP');
    // M52: a second user message cannot repair a foreign transcript (the dispatched prompt is first).
    expect('second-user-message-cannot-repair', run(mk(['A1'], { tr: { A1: { user: 'Complete assignment thoroughly: other lane work', extraRows: [{ type: 'message', message: { role: 'user', content: [{ type: 'text', text: `Complete assignment thoroughly:\n\n${FIXCTX}\n\n# Seat A1\n/skill:godspeed\n\ndo the work for A1.\nReport: .ufo/waves/round-7/w1/A1.md` }] } }] } } }).f), 1, 'SESSION_FOREIGN');
    // M57: no transcripts at all — done must be 0, not 'every seat that is not marked dead'.
    { const r = run(mk(['A1', 'B2'], { noSessionAll: true }).f); expect('no-sessions-not-a-dispatch', r, 1, 'NOT_A_DISPATCH'); cases.push(['no-sessions-done-is-zero', r.done === 0, `done=${r.done}`]); }
    // M58: the verdict word is part of the contract (probe I2 greps for 'INLINE_DISPATCH: CLEAN').
    { const r = run(mk(['A1']).f); cases.push(['verdict-word-clean', r.code === 0 && r.line.startsWith('INLINE_DISPATCH: CLEAN '), r.line]); }
    // M63: an empty task list is fail-closed, not a wave with zero seats.
    expect('empty-task-list-fail-closed', run(mk(['A1'], { emptyTasks: true }).f), 2, 'DISPATCH_UNREADABLE');
    // M64: a non-string context is fail-closed, not a TypeError. (Placed last: the mutant crashes.)
    expect('context-not-a-string-fail-closed', run(mk(['A1'], { dispatchCtx: 123 }).f), 2, 'DISPATCH_UNREADABLE');
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

const result = inspect({
  root: args.root, round: String(args.round), wave: String(args.wave), rev: args.rev,
  sessionsRoot: args.sessionsRoot, log: args.log, reportFile: args.report,
});
process.stdout.write(`${result.line}\n`);
for (const f of result.findings) process.stdout.write(`FINDING ${f}\n`);
if (result.dead && result.dead.length) process.stdout.write(`DEAD ${result.dead.join(',')}\n`);
if (result.code === 2) process.stderr.write(`INLINE_DISPATCH: FAIL-CLOSED contract=${CONTRACT}\n`);
process.exit(result.code);
