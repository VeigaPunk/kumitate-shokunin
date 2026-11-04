#!/usr/bin/env node
/**
 * ready-handoff.mjs — kumitate-ready-handoff-v1
 *
 * Judge a run-7 inline spawn handoff BEFORE the orchestrator takes it: the
 * `<wave>.ready` file (the cross-session contract this lane writes every round)
 * against the dispatch payload it names, and the payload against the campaign's
 * frozen wave rules.
 *
 * Usage:
 *   node scripts/ready-handoff.mjs --round N --wave NAME [--lane DIR] [--ready FILE] [--json]
 *                                  [--band LO:HI] [--attack-pct P]
 *   node scripts/ready-handoff.mjs --selftest [--work DIR]
 *
 * Attribution: the `.ready` contract and every rule below are declared by the
 * round prompt's inline-spawn handoff (§6 run-7 block) and the run-15 round-size
 * ruling (band 8–16, >=25 % attack, at most 2 connector seats, no planner seat,
 * no per-seat model). This gate reads; it never writes to the lane.
 *
 * Exit map: 0 READY, 1 DRIFT (policy findings), 2 FAIL-CLOSED (unreadable or
 * unsafe handoff), 64 usage. `--json` prints one object on stdout.
 *
 * Reads: `<ready>`, the dispatch JSON it names, and nothing else. Never follows
 * a dispatch path outside `<lane>/.ufo/waves/round-<N>/`.
 */
import { existsSync, lstatSync, readFileSync, readdirSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const CONTRACT = 'kumitate-ready-handoff-v1';
const SELF = fileURLToPath(import.meta.url);
/** Frozen taxonomy roles a swarm seat may carry (planner is frozen-topology). */
const ROLES = new Set(['scout', 'reviewer', 'critic', 'connector', 'sentinel', 'executor',
  'mutation-tester', 'revenger', 'simplifier', 'scribe', 'labrat', 'distiller']);
/** The run-15 policy names these four as the attack roles (ufo-wave-policy.json). */
const ATTACK = new Set(['reviewer', 'critic', 'mutation-tester', 'labrat']);
const READY_KEYS = ['lane', 'round', 'wave', 'dispatch', 'l1'];

const USAGE = 'usage: node scripts/ready-handoff.mjs --round N --wave NAME [--lane DIR] [--ready FILE] [--json] [--band LO:HI] [--attack-pct P] | --selftest [--work DIR]';

class Refusal extends Error {
  constructor(token, detail) { super(detail); this.token = token; this.detail = detail; }
}

function parseArgs(argv) {
  const o = { lane: null, round: null, wave: null, ready: null, json: false, selftest: false, work: null, band: '8:16', attackPct: 25 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lane') o.lane = argv[++i];
    else if (a === '--round') o.round = Number(argv[++i]);
    else if (a === '--wave') o.wave = argv[++i];
    else if (a === '--ready') o.ready = argv[++i];
    else if (a === '--band') o.band = argv[++i];
    else if (a === '--attack-pct') o.attackPct = Number(argv[++i]);
    else if (a === '--json') o.json = true;
    else if (a === '--selftest') o.selftest = true;
    else if (a === '--work') o.work = argv[++i];
    else if (a === '--help' || a === '-h') return { error: 'help' };
    else return { error: `unknown argument: ${a}` };
  }
  if (o.selftest && (o.round !== null || o.wave !== null)) return { error: '--selftest is exclusive with --round/--wave' };
  if (!o.selftest) {
    if (!Number.isInteger(o.round) || o.round < 1) return { error: '--round N is required' };
    if (typeof o.wave !== 'string' || !o.wave) return { error: '--wave NAME is required' };
  }
  if (!/^\d+:\d+$/.test(o.band)) return { error: `--band must be LO:HI, got ${o.band}` };
  if (!Number.isFinite(o.attackPct) || o.attackPct < 0 || o.attackPct > 100) return { error: `--attack-pct must be 0..100, got ${o.attackPct}` };
  return o;
}

const sha = (text) => {
  // small local digest for diagnostics only; no crypto dependency needed here
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
};

function readJson(file, token, detail) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { throw new Refusal(token, `${detail}: cannot read ${file}`); }
  try { return JSON.parse(text); } catch { throw new Refusal(token, `${detail}: not JSON: ${file}`); }
}

/** True iff `child` is inside `parent` (lexical, after resolve; both absolute). */
function inside(parent, child) {
  const rel = relative(parent, child);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel) && !rel.split(sep).includes('..');
}

/**
 * Judge a handoff. Returns { verdict, findings, seats, roles, attack, connectors, ready, dispatch }.
 * Throws Refusal for fail-closed conditions.
 */
export function judge(opts) {
  const lane = resolve(opts.lane ?? process.cwd());
  const round = opts.round;
  const wave = opts.wave;
  const readyPath = resolve(opts.ready ?? join(lane, '.ufo', 'waves', `round-${round}`, `${wave}.ready`));
  const waveDir = join(lane, '.ufo', 'waves', `round-${round}`);

  // --- fail-closed surface -------------------------------------------------
  let readyText;
  try { readyText = readFileSync(readyPath, 'utf8'); } catch { throw new Refusal('READY_ABSENT', `no ready file at ${readyPath}`); }
  let ready;
  try { ready = JSON.parse(readyText); } catch { throw new Refusal('READY_MALFORMED', 'ready file is not JSON'); }
  if (!ready || typeof ready !== 'object' || Array.isArray(ready)) throw new Refusal('READY_MALFORMED', 'ready file is not an object');
  if (typeof ready.dispatch !== 'string' || !isAbsolute(ready.dispatch)) {
    throw new Refusal('DISPATCH_PATH', `ready.dispatch must be an absolute path, got ${JSON.stringify(ready.dispatch)}`);
  }
  const dispatchPath = resolve(ready.dispatch);
  if (!inside(waveDir, dispatchPath)) {
    throw new Refusal('DISPATCH_OUTSIDE', `dispatch ${dispatchPath} is not under ${waveDir}`);
  }
  let lst;
  try { lst = lstatSync(dispatchPath); } catch { throw new Refusal('DISPATCH_ABSENT', `no dispatch at ${dispatchPath}`); }
  if (!lst.isFile()) throw new Refusal('DISPATCH_ABSENT', `dispatch is not a regular file: ${dispatchPath}`);
  try {
    if (!inside(realpathSync(waveDir), realpathSync(dispatchPath))) {
      throw new Refusal('PATH_UNSAFE', `dispatch realpath escapes ${waveDir}`);
    }
  } catch (e) {
    if (e instanceof Refusal) throw e;
    throw new Refusal('PATH_UNSAFE', `cannot resolve ${dispatchPath}`);
  }
  const dispatch = readJson(dispatchPath, 'DISPATCH_MALFORMED', 'dispatch');
  const tc = dispatch && dispatch.taskCall;
  if (!tc || typeof tc.context !== 'string' || !Array.isArray(tc.tasks) || tc.tasks.length === 0) {
    throw new Refusal('DISPATCH_MALFORMED', 'dispatch must carry taskCall.context (string) and taskCall.tasks (non-empty array)');
  }

  // --- policy findings -----------------------------------------------------
  const findings = [];
  const add = (id, detail) => findings.push({ id, detail });
  const keys = Object.keys(ready).sort();
  if (keys.join(',') !== READY_KEYS.slice().sort().join(',')) add('READY_KEYS', `expected ${READY_KEYS.join(',')}, got ${keys.join(',')}`);
  const dirName = lane.split(sep).at(-1);
  const laneId = dirName.replace(/-shokunin$/u, '');
  if (ready.lane !== laneId && ready.lane !== dirName) add('LANE_MISMATCH', `ready.lane=${JSON.stringify(ready.lane)} for ${lane} (expected ${laneId} or ${dirName})`);
  if (ready.round !== round) add('ROUND_MISMATCH', `ready.round=${JSON.stringify(ready.round)} for --round ${round}`);
  if (ready.wave !== wave) add('WAVE_MISMATCH', `ready.wave=${JSON.stringify(ready.wave)} for --wave ${wave}`);
  if (typeof ready.l1 !== 'string' || !ready.l1.trim()) add('L1_ABSENT', 'ready.l1 must name the L1 agent id');

  const laneRoot = realpathSync(lane);
  const [lo, hi] = opts.band.split(':').map(Number);
  if (tc.tasks.length < lo || tc.tasks.length > hi) add('BAND', `${tc.tasks.length} seats outside ${lo}:${hi}`);
  if (!tc.context.includes(laneRoot)) add('CONTEXT_LANE_ROOT', 'taskCall.context does not name the lane root');
  if (!/HYAKU_SCRATCH|scratch root/i.test(tc.context)) add('SCRATCH_ROOT', 'taskCall.context does not name the scratch rule');

  const relativeTrailers = [];
  const names = new Set();
  const roles = {};
  let attack = 0;
  let connectors = 0;
  tc.tasks.forEach((task, index) => {
    const where = `task[${index}]`;
    if (!task || typeof task !== 'object' || Array.isArray(task)) { add('SEAT_SHAPE', `${where} is not an object`); return; }
    const extra = Object.keys(task).filter((k) => !['name', 'agent', 'task'].includes(k));
    if (extra.length) add('ARTIFACT_KEYS', `${where} carries ${extra.join(',')} (only name/agent/task are dispatch fields)`);
    if (typeof task.name !== 'string' || !task.name) { add('SEAT_NAME', `${where} has no name`); return; }
    if (!/^[A-Za-z][A-Za-z0-9]{1,31}$/.test(task.name)) add('SEAT_NAME', `${where} name ${JSON.stringify(task.name)} is not CamelCase <=32`);
    if (names.has(task.name)) add('SEAT_DUPLICATE', `seat ${task.name} appears twice`);
    names.add(task.name);
    if (typeof task.agent !== 'string' || !task.agent) { add('ROLE_UNKNOWN', `${where} (${task.name}) has no role`); return; }
    if (task.agent === 'planner') { add('PLANNER_SEAT', `seat ${task.name} is a frozen-topology planner`); return; }
    if (!ROLES.has(task.agent)) { add('ROLE_UNKNOWN', `seat ${task.name} role ${JSON.stringify(task.agent)} is not a swarm role`); return; }
    roles[task.agent] = (roles[task.agent] ?? 0) + 1;
    if (ATTACK.has(task.agent)) attack++;
    if (task.agent === 'connector') connectors++;
    if (typeof task.task !== 'string' || !task.task.trim()) { add('SEAT_SHAPE', `seat ${task.name} has no task text`); return; }
    const firstLine = task.task.split('\n')[0].trim();
    if (firstLine !== '/skill:godspeed') add('GODSPEED', `seat ${task.name} does not lead with /skill:godspeed`);
    if (!task.task.includes(laneRoot)) add('TASK_LANE_ROOT', `seat ${task.name} task text does not name ${laneRoot}`);
    const withoutTrailers = task.task.replace(/^Report:.*$/gm, '');
    if (/(^|[\s"'`(])(?:\.\/)?\.ufo\/waves\/round-\d+\//m.test(withoutTrailers)) {
      add('RELATIVE_WAVE_PATH', `seat ${task.name} names a lane-relative .ufo/waves path`);
    }
    if (/^Report:.*?(?:^|[\s(])(?:\.\/)?\.ufo\/waves\/round-\d+\//m.test(task.task)) {
      relativeTrailers.push(task.name);
    }
  });
  if (relativeTrailers.length && !/relative to|write it at/i.test(tc.context)) {
    add('REPORT_TRAILER', `${relativeTrailers.length} seat(s) carry a relative Report: trailer and taskCall.context does not say where it resolves (${relativeTrailers[0]})`);
  }
  const total = tc.tasks.length;
  if (total > 0 && attack * 100 < opts.attackPct * total) add('ATTACK_SHARE', `${attack}/${total} attack seats below ${opts.attackPct}%`);
  if (connectors > 2) add('CONNECTOR_COUNT', `${connectors} connector seats (at most 2)`);

  return {
    contract: CONTRACT,
    verdict: findings.length ? 'DRIFT' : 'READY',
    lane,
    round,
    wave,
    ready: readyPath,
    dispatch: dispatchPath,
    dispatchSha: sha(readFileSync(dispatchPath, 'utf8')),
    seats: total,
    roles,
    attack,
    connectors,
    findings,
  };
}

function render(result) {
  if (result.verdict === 'READY') {
    return `READY_HANDOFF: READY wave=${result.wave} seats=${result.seats}`
      + ` attack=${result.attack}/${result.seats} connector=${result.connectors}`
      + ` roles=${Object.entries(result.roles).map(([k, v]) => `${k}=${v}`).join(',')}`;
  }
  return `READY_HANDOFF: DRIFT ${result.findings.map((f) => f.id).join(',')}`
    + ` (${result.findings[0].detail})`;
}

// ---------------------------------------------------------------------------
// Selftest — hermetic fixture lanes; nothing outside --work is read or written.
// ---------------------------------------------------------------------------

function laneFixture(root, { seats = 10, attack = 3, connector = 1, wave = 'w1', round = 81 } = {}) {
  const lane = join(root, 'kumitate-shokunin');
  const dir = join(lane, '.ufo', 'waves', `round-${round}`);
  mkdirSync(dir, { recursive: true });
  const tasks = [];
  const plan = [
    ...Array.from({ length: attack }, (_, i) => (['reviewer', 'critic', 'mutation-tester', 'labrat'][i % 4])),
    ...Array.from({ length: connector }, () => 'connector'),
    ...Array.from({ length: Math.max(0, seats - attack - connector) }, (_, i) => (i % 2 ? 'scribe' : 'executor')),
  ].slice(0, seats);
  plan.forEach((agent, i) => {
    tasks.push({
      name: `K81S${String(i + 1).padStart(2, '0')}`,
      agent,
      task: `/skill:godspeed\n# Target\n${lane}/corpus/lessons/round-81.md\nReport: .ufo/waves/round-${round}/${wave}/K81S${String(i + 1).padStart(2, '0')}.md (relative to ${lane} — write it at ${lane}/.ufo/waves/round-${round}/${wave}/K81S${String(i + 1).padStart(2, '0')}.md)\nScratch: $HYAKU_SCRATCH/kumitate-r81/<seat>/`,
    });
  });
  const context = `Every path under ${lane}. Every \`Report:\` trailer path is relative to ${lane} — write it at ${lane}/<that path>. Scratch root: /fast/scratch/hyaku/kumitate-r81/<seat>/ (HYAKU_SCRATCH).`;
  const dispatch = join(dir, `${wave}-dispatch.json`);
  writeFileSync(dispatch, `${JSON.stringify({ contract: 'ufo-swarm-wave-dispatch-v1', taskCall: { context, tasks } }, null, 2)}\n`);
  const ready = { lane: 'kumitate-shokunin', round, wave, dispatch, l1: 'KumitateR81' };
  writeFileSync(join(dir, `${wave}.ready`), `${JSON.stringify(ready)}\n`);
  return { lane, dir, dispatch, tasks, context };
}

function runSelftest(work) {
  const root = work ? mkdtempSync(join(work, 'rh81-')) : mkdtempSync(join(tmpdir(), 'rh81-'));
  const failures = [];
  let cases = 0;
  const ok = (name, cond, detail) => { cases++; if (!cond) failures.push(`${name}: ${detail}`); };
  const judgeCase = (name, mutate, expect) => {
    const box = join(root, name);
    mkdirSync(box, { recursive: true });
    const fx = laneFixture(box);
    const opts = { lane: fx.lane, round: 81, wave: 'w1', band: '8:16', attackPct: 25 };
    mutate?.(fx, opts);
    let verdict;
    try {
      const r = judge(opts);
      verdict = { verdict: r.verdict, findings: r.findings.map((f) => f.id), seats: r.seats, attack: r.attack };
    } catch (e) {
      verdict = { verdict: 'FAIL-CLOSED', token: e.token ?? 'ERROR', detail: e.message };
    }
    const want = expect(verdict);
    ok(name, want, JSON.stringify(verdict));
  };

  judgeCase('clean', null, (v) => v.verdict === 'READY' && v.seats === 10 && v.attack === 3);
  judgeCase('band-small-real', (fx, o) => {
    const small = laneFixture(dirname(fx.lane), { seats: 7 });
    o.lane = small.lane;
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('BAND'));
  judgeCase('band-wide', (fx, o) => {
    const wide = laneFixture(dirname(fx.lane), { seats: 17 });
    o.lane = wide.lane;
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('BAND'));
  judgeCase('attack-share', (fx, o) => {
    const low = laneFixture(dirname(fx.lane), { seats: 10, attack: 2 });
    o.lane = low.lane;
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('ATTACK_SHARE'));
  judgeCase('connector-cap', (fx, o) => {
    const many = laneFixture(dirname(fx.lane), { seats: 10, attack: 3, connector: 3 });
    o.lane = many.lane;
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('CONNECTOR_COUNT'));
  judgeCase('planner-seat', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[0].agent = 'planner';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('PLANNER_SEAT'));
  judgeCase('unknown-role', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[0].agent = 'main';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('ROLE_UNKNOWN'));
  judgeCase('model-pinned', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[0].model = 'm_flash';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('ARTIFACT_KEYS'));
  judgeCase('no-godspeed', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[0].task = doc.taskCall.tasks[0].task.replace(/^\/skill:godspeed\n/, '');
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('GODSPEED'));
  judgeCase('task-no-lane-root', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[0].task = '/skill:godspeed\n# Target\ncorpus/lessons/round-81.md';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('TASK_LANE_ROOT'));
  judgeCase('relative-wave-path', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[1].task += '\nAlso read .ufo/waves/round-81/plan.md';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('RELATIVE_WAVE_PATH'));
  judgeCase('report-trailer', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[2].task = `/skill:godspeed\n# Target\n${fx.lane}/corpus/x.md\nReport: .ufo/waves/round-81/w1/K.md`;
    doc.taskCall.context = doc.taskCall.context.replace(/Every `Report:` trailer path[^]*?<that path>\. /, '');
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('REPORT_TRAILER'));
  judgeCase('duplicate-seat', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[1].name = doc.taskCall.tasks[0].name;
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('SEAT_DUPLICATE'));
  judgeCase('bad-seat-name', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[0].name = 'k81 seat';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('SEAT_NAME'));
  judgeCase('ready-keys', (fx) => {
    const ready = JSON.parse(readFileSync(join(fx.dir, 'w1.ready'), 'utf8'));
    ready.extra = 1;
    writeFileSync(join(fx.dir, 'w1.ready'), JSON.stringify(ready));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('READY_KEYS'));
  judgeCase('lane-mismatch', (fx) => {
    const ready = JSON.parse(readFileSync(join(fx.dir, 'w1.ready'), 'utf8'));
    ready.lane = 'kotoba';
    writeFileSync(join(fx.dir, 'w1.ready'), JSON.stringify(ready));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('LANE_MISMATCH'));
  judgeCase('lane-id-accepted', (fx) => {
    const ready = JSON.parse(readFileSync(join(fx.dir, 'w1.ready'), 'utf8'));
    ready.lane = 'kumitate';
    writeFileSync(join(fx.dir, 'w1.ready'), JSON.stringify(ready));
  }, (v) => v.verdict === 'READY');
  judgeCase('round-mismatch', (fx, o) => {
    const ready = JSON.parse(readFileSync(join(fx.dir, 'w1.ready'), 'utf8'));
    ready.round = 82;
    writeFileSync(join(fx.dir, 'w1.ready'), JSON.stringify(ready));
    o.round = 81;
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('ROUND_MISMATCH'));
  judgeCase('wave-mismatch', (fx) => {
    const ready = JSON.parse(readFileSync(join(fx.dir, 'w1.ready'), 'utf8'));
    ready.wave = 'w2';
    writeFileSync(join(fx.dir, 'w1.ready'), JSON.stringify(ready));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('WAVE_MISMATCH'));
  judgeCase('l1-absent', (fx) => {
    const ready = JSON.parse(readFileSync(join(fx.dir, 'w1.ready'), 'utf8'));
    ready.l1 = '   ';
    writeFileSync(join(fx.dir, 'w1.ready'), JSON.stringify(ready));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('L1_ABSENT'));
  judgeCase('context-no-lane-root', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.context = 'Every path is relative to the lane. Scratch under /fast/scratch/hyaku/.';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('CONTEXT_LANE_ROOT'));
  judgeCase('context-no-scratch', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.context = doc.taskCall.context.replace(/Scratch root:.*$/, 'No scratch rule.');
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('SCRATCH_ROOT'));
  judgeCase('ready-absent', (fx) => rmSync(join(fx.dir, 'w1.ready')), (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'READY_ABSENT');
  judgeCase('ready-malformed', (fx) => writeFileSync(join(fx.dir, 'w1.ready'), '{'), (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'READY_MALFORMED');
  judgeCase('dispatch-relative', (fx) => {
    const ready = JSON.parse(readFileSync(join(fx.dir, 'w1.ready'), 'utf8'));
    ready.dispatch = '.ufo/waves/round-81/w1-dispatch.json';
    writeFileSync(join(fx.dir, 'w1.ready'), JSON.stringify(ready));
  }, (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'DISPATCH_PATH');
  judgeCase('dispatch-outside', (fx) => {
    const ready = JSON.parse(readFileSync(join(fx.dir, 'w1.ready'), 'utf8'));
    ready.dispatch = join(fx.lane, 'w1-dispatch.json');
    writeFileSync(fx.dispatch, JSON.stringify({ taskCall: { context: '', tasks: [] } }));
    writeFileSync(join(fx.lane, 'w1-dispatch.json'), '{}');
    writeFileSync(join(fx.dir, 'w1.ready'), JSON.stringify(ready));
  }, (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'DISPATCH_OUTSIDE');
  judgeCase('dispatch-escape', (fx) => {
    const ready = JSON.parse(readFileSync(join(fx.dir, 'w1.ready'), 'utf8'));
    ready.dispatch = join(fx.dir, '..', '..', '..', '..', '..', 'escape.json');
    writeFileSync(join(fx.dir, 'w1.ready'), JSON.stringify(ready));
  }, (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'DISPATCH_OUTSIDE');
  judgeCase('dispatch-absent', (fx) => rmSync(fx.dispatch), (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'DISPATCH_ABSENT');
  judgeCase('dispatch-malformed', (fx) => writeFileSync(fx.dispatch, JSON.stringify({ taskCall: { context: 1, tasks: [] } })), (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'DISPATCH_MALFORMED');
  judgeCase('dispatch-empty-tasks', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks = [];
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'DISPATCH_MALFORMED');
  // multiple findings are reported together and the first detail is named
  judgeCase('many-findings', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[0].agent = 'planner';
    doc.taskCall.tasks[1].task = '/skill:godspeed\nno lane root';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('PLANNER_SEAT') && v.findings.includes('TASK_LANE_ROOT'));

  if (!work) rmSync(root, { recursive: true, force: true });
  const verdict = failures.length ? 'FAIL' : 'PASS';
  process.stdout.write(`READY_HANDOFF_SELFTEST: ${cases - failures.length}/${cases} pass\n`);
  for (const f of failures) process.stdout.write(`FAIL ${f}\n`);
  process.stdout.write(`VERDICT: ${verdict}\n`);
  return failures.length ? 1 : 0;
}

function main(argv) {
  const opts = parseArgs(argv);
  if (opts.error) {
    if (opts.error === 'help') { process.stdout.write(`${USAGE}\n`); return 0; }
    process.stderr.write(`${opts.error}\n${USAGE}\n`);
    return 64;
  }
  if (opts.selftest) {
    if (opts.work && !existsSync(opts.work)) mkdirSync(opts.work, { recursive: true });
    return runSelftest(opts.work);
  }
  try {
    const result = judge(opts);
    if (opts.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else process.stdout.write(`${render(result)}\n`);
    return result.verdict === 'READY' ? 0 : 1;
  } catch (e) {
    if (e instanceof Refusal) {
      if (opts.json) process.stdout.write(`${JSON.stringify({ contract: CONTRACT, verdict: 'FAIL-CLOSED', token: e.token, detail: e.detail }, null, 2)}\n`);
      else process.stdout.write(`READY_HANDOFF: FAIL-CLOSED ${e.token} (${e.detail})\n`);
      return 2;
    }
    process.stderr.write(`READY_HANDOFF: ERROR ${e.message}\n`);
    return 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(SELF)) process.exit(main(process.argv.slice(2)));
