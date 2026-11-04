#!/usr/bin/env node
/**
 * ready-handoff.mjs — kumitate-ready-handoff-v3
 *
 * Judge a run-7 inline spawn handoff BEFORE the orchestrator takes it: the
 * `<wave>.ready` file (the cross-session contract this lane writes every round)
 * against the dispatch payload it names, and the payload against the campaign's
 * own wave policy.
 *
 * Usage:
 *   node scripts/ready-handoff.mjs --round N --wave NAME --policy FILE [--agents FILE]
 *                                  [--lane DIR] [--ready FILE] [--json] [--attack-pct P]
 *   node scripts/ready-handoff.mjs --selftest [--work DIR]
 *
 * Attribution: the `.ready` contract is declared by the round prompt's inline-spawn
 * handoff (§6 run-7 block). Round 82 (C1) removes the lane's copies of the campaign's
 * numbers: the seat band and the seat-role vocabulary are read from the policy file the
 * dispatcher validates against (`ufo-wave-policy.json`: `waveMinLanes`/`waveMaxLanes`
 * under `sighting.dispatch.swarm`, `proposalRoles` under `nativeProfiles.omp-native-v1`),
 * so a policy edit cannot desync admission from dispatch. The attack share (>=25 %) and
 * the connector cap (2) stay lane-owned constants: the policy carries no machine-readable
 * field for either. The gate also binds the handoff to the dispatch it names (filename
 * stem, optional payload `wave`), refuses two seats that claim one report destination and
 * an `l1` that collides with a seat, and — when a caller supplies an agent registry —
 * requires `l1` to resolve there. It reads; it never writes to the lane.
 *
 * Exit map: 0 READY, 1 DRIFT (policy findings), 2 FAIL-CLOSED (unreadable or
 * unsafe handoff), 64 usage. `--json` prints one object on stdout.
 *
 * Reads: `<ready>`, the dispatch JSON it names, `--policy`, and `--agents` when named.
 * Never follows a dispatch path outside `<lane>/.ufo/waves/round-<N>/`.
 */
import { existsSync, lstatSync, readFileSync, readdirSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const CONTRACT = 'kumitate-ready-handoff-v3';
const SELF = fileURLToPath(import.meta.url);
/**
 * Attack roles: lane-owned (the policy carries no machine-readable field for them) and
 * limited to roles the dispatcher can actually spawn — `labrat` is a frozen-topology probe
 * outside `SWARM_ROLES`, so v3 drops it from the attack set.
 */
const ATTACK = new Set(['reviewer', 'critic', 'mutation-tester']);
/**
 * The dispatcher's accepted swarm roles (`ufo-swarm-wave.mjs` `SWARM_ROLES` at the pinned
 * origin commit `fb7157fc`). The validator is the authority; a policy that names a role
 * outside this set is refused (`POLICY_ROLE_UNJUDGEABLE`) rather than silently honoured.
 */
const SWARM_ROLES = new Set(['scout', 'reviewer', 'critic', 'connector', 'sentinel', 'executor',
  'mutation-tester', 'revenger', 'simplifier', 'scribe']);
/** The dispatcher's payload schema (`SWARM_DISPATCH_SCHEMA` at the same commit) and hard cap. */
const DISPATCH_SCHEMA = 'ufo-swarm-wave-dispatch-v1';
const MAX_SWARM_LANES = 256;
const READY_KEYS = ['lane', 'round', 'wave', 'dispatch', 'l1'];

const USAGE = 'usage: node scripts/ready-handoff.mjs --round N --wave NAME --policy FILE [--agents FILE] [--lane DIR] [--ready FILE] [--json] [--attack-pct P] | --selftest [--work DIR]';

class Refusal extends Error {
  constructor(token, detail) { super(detail); this.token = token; this.detail = detail; }
}

function parseArgs(argv) {
  const o = { lane: null, round: null, wave: null, ready: null, policy: null, agents: null, json: false, selftest: false, work: null, attackPct: 25 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lane') o.lane = argv[++i];
    else if (a === '--round') o.round = Number(argv[++i]);
    else if (a === '--wave') o.wave = argv[++i];
    else if (a === '--ready') o.ready = argv[++i];
    else if (a === '--policy') o.policy = argv[++i];
    else if (a === '--agents') o.agents = argv[++i];
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
  if (!o.selftest && (typeof o.policy !== 'string' || !o.policy)) return { error: '--policy FILE is required' };
  if (!Number.isFinite(o.attackPct) || o.attackPct < 0 || o.attackPct > 100) return { error: `--attack-pct must be 0..100, got ${o.attackPct}` };
  return o;
}

const sha = (text) => {
  // small local digest for diagnostics only; no crypto dependency needed here
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
};

function readJson(file, token, detail, badToken = token) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { throw new Refusal(token, `${detail}: cannot read ${file}`); }
  try { return JSON.parse(text); } catch { throw new Refusal(badToken, `${detail}: not JSON: ${file}`); }
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
  // F10 (round-81 wave): the handoff's own bytes must live in the lane, like the dispatch it names.
  let readyLst;
  try { readyLst = lstatSync(readyPath); } catch { throw new Refusal('READY_ABSENT', `no ready file at ${readyPath}`); }
  if (!readyLst.isFile()) {
    throw new Refusal('READY_UNSAFE', `ready path is not a regular file (${readyLst.isSymbolicLink() ? 'symlink' : 'non-file'}): ${readyPath}`);
  }
  try {
    if (!inside(realpathSync(lane), realpathSync(readyPath))) {
      throw new Refusal('READY_UNSAFE', `ready realpath escapes ${lane}`);
    }
  } catch (e) {
    if (e instanceof Refusal) throw e;
    throw new Refusal('READY_UNSAFE', `cannot resolve ${readyPath}`);
  }
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
  const resumeSends = Array.isArray(dispatch && dispatch.resumeSends) ? dispatch.resumeSends : [];
  const tasks = tc && Array.isArray(tc.tasks) ? tc.tasks : [];
  // v3: the validator emits `taskCall: null` for a resume-only wave; that payload is legal
  // and band-exempt. Anything else must still carry a context and tasks.
  if (tasks.length === 0 && resumeSends.length === 0) {
    throw new Refusal('DISPATCH_MALFORMED', 'dispatch must carry taskCall.tasks or resumeSends');
  }
  if (tasks.length > 0 && (!tc || typeof tc.context !== 'string')) {
    throw new Refusal('DISPATCH_MALFORMED', 'dispatch must carry taskCall.context (string) and taskCall.tasks');
  }

  // --- the campaign's own numbers (round-82 C1: one authority) -------------
  const policy = readJson(opts.policy, 'POLICY_ABSENT', 'policy', 'POLICY_MALFORMED');
  const swarm = policy && policy.sighting && policy.sighting.dispatch && policy.sighting.dispatch.swarm;
  const declaredRoles = policy && policy.nativeProfiles && policy.nativeProfiles['omp-native-v1']
    && policy.nativeProfiles['omp-native-v1'].proposalRoles;
  const lo = swarm ? swarm.waveMinLanes : undefined;
  const hi = swarm ? swarm.waveMaxLanes : undefined;
  const policyMaxLanes = swarm && Number.isInteger(swarm.maxLanes) ? swarm.maxLanes : MAX_SWARM_LANES;
  // The validator's payload carries the effective cap in `policy.maxLanes`; a hand-edited
  // dispatch may carry a top-level `maxLanes`. Both only tighten.
  const dispatchMaxLanes = Number.isInteger(dispatch && dispatch.maxLanes)
    ? dispatch.maxLanes
    : (Number.isInteger(dispatch && dispatch.policy && dispatch.policy.maxLanes) ? dispatch.policy.maxLanes : null);
  // A spec may only tighten the cap; the 256 ceiling is never widened (validator behaviour).
  const cap = Math.min(policyMaxLanes, dispatchMaxLanes ?? Infinity, MAX_SWARM_LANES);
  if (!Number.isInteger(lo) || !Number.isInteger(hi) || lo < 1 || hi < lo
      || !Array.isArray(declaredRoles) || declaredRoles.length === 0
      || declaredRoles.some((r) => typeof r !== 'string' || !r)) {
    throw new Refusal('POLICY_MALFORMED', `policy must carry sighting.dispatch.swarm.waveMinLanes/waveMaxLanes and nativeProfiles.omp-native-v1.proposalRoles: ${opts.policy}`);
  }
  const seatRoles = new Set(declaredRoles);
  let agentIds = null;
  if (opts.agents) {
    const reg = readJson(opts.agents, 'AGENTS_ABSENT', 'agents', 'AGENTS_MALFORMED');
    // Two shapes are real: this lane's `{agents:[{id}]}` and the validator's
    // `swarm-registry.json` (`{schema:"ufo-swarm-registry-v1", members:{name:…}}`).
    if (reg && Array.isArray(reg.agents) && reg.agents.length > 0
        && reg.agents.every((a) => a && typeof a.id === 'string' && a.id)) {
      agentIds = new Set(reg.agents.map((a) => a.id));
    } else if (reg && reg.members && typeof reg.members === 'object' && !Array.isArray(reg.members)
        && Object.keys(reg.members).length > 0) {
      agentIds = new Set(Object.keys(reg.members));
    } else {
      throw new Refusal('AGENTS_MALFORMED', `agents registry must be {agents:[{id}]} or {members:{name:…}}: ${opts.agents}`);
    }
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
  // F5/F4 (round-81 wave): bind the handoff to the dispatch it names, both directions.
  const stem = dispatchPath.split(sep).at(-1).replace(/\.json$/u, '');
  if (stem !== `${wave}-dispatch`) add('WAVE_BINDING', `dispatch basename ${JSON.stringify(stem)} is not ${JSON.stringify(`${wave}-dispatch`)}`);
  // The dispatch's own wave id may be the slot (`w1`) or the full id the validator writes
  // (`<lane>-r<round>-w1`); either way its final segment must be this wave.
  if (Object.hasOwn(dispatch, 'wave')
      && !(typeof dispatch.wave === 'string' && (dispatch.wave === wave || dispatch.wave.endsWith(`-${wave}`)))) {
    add('DISPATCH_WAVE', `dispatch.wave=${JSON.stringify(dispatch.wave)} for ready.wave=${JSON.stringify(wave)}`);
  }
  if (agentIds && typeof ready.l1 === 'string' && ready.l1.trim() && !agentIds.has(ready.l1)) {
    add('L1_UNRESOLVED', `ready.l1=${JSON.stringify(ready.l1)} is not in ${opts.agents}`);
  }

  const laneRoot = realpathSync(lane);
  // v3 — the dispatcher's own admission order: a spawn wave whose effective cap sits below
  // the policy floor is impossible before it is too wide (validator `impossible_band`).
  const total = tasks.length + resumeSends.length;
  if (tasks.length > 0 && cap < lo) {
    add('MAXLANES_IMPOSSIBLE', `effective cap ${cap} is below the wave floor ${lo} (policy maxLanes ${policyMaxLanes}, dispatch maxLanes ${dispatchMaxLanes ?? 'absent'})`);
  } else if (total > cap) {
    add('MAXLANES', `${total} lanes exceed the effective cap ${cap} (policy maxLanes ${policyMaxLanes}, dispatch maxLanes ${dispatchMaxLanes ?? 'absent'}, hard ceiling ${MAX_SWARM_LANES})`);
  } else if (tasks.length > 0 && total < lo) {
    add('BAND', `${total} lanes (${tasks.length} spawn + ${resumeSends.length} resume) below ${lo}:${hi} (policy)`);
  } else if (tasks.length > 0 && total > Math.min(hi, cap)) {
    add('BAND', `${total} lanes (${tasks.length} spawn + ${resumeSends.length} resume) above ${lo}:${Math.min(hi, cap)} (policy)`);
  }
  if (dispatch.schema !== DISPATCH_SCHEMA) {
    add('DISPATCH_SCHEMA', `dispatch.schema=${JSON.stringify(dispatch.schema)} is not ${JSON.stringify(DISPATCH_SCHEMA)}`);
  }
  if (dispatch.counts !== undefined) {
    const c = dispatch.counts;
    const ok = c && typeof c === 'object' && !Array.isArray(c)
      && c.spawn === tasks.length && c.resume === resumeSends.length && c.total === total;
    if (!ok) add('DISPATCH_COUNTS', `dispatch.counts=${JSON.stringify(c)} disagrees with spawn=${tasks.length} resume=${resumeSends.length} total=${total}`);
  }
  // The validator refuses a role outside its own SWARM_ROLES; a policy that names one
  // cannot be honoured, so the gate refuses the handoff instead of pretending to judge it.
  const unjudgeable = declaredRoles.filter((r) => !SWARM_ROLES.has(r));
  if (unjudgeable.length) add('POLICY_ROLE_UNJUDGEABLE', `policy proposalRoles names ${unjudgeable.join(',')} outside the dispatcher's SWARM_ROLES`);
  if (tasks.length > 0) {
    if (!tc.context.includes(laneRoot)) add('CONTEXT_LANE_ROOT', 'taskCall.context does not name the lane root');
    if (!/HYAKU_SCRATCH|scratch root/i.test(tc.context)) add('SCRATCH_ROOT', 'taskCall.context does not name the scratch rule');
  }

  const relativeTrailers = [];
  const names = new Set();
  const destinations = new Map();
  const roles = {};
  let attack = 0;
  let connectors = 0;
  tasks.forEach((task, index) => {
    const where = `task[${index}]`;
    if (!task || typeof task !== 'object' || Array.isArray(task)) { add('SEAT_SHAPE', `${where} is not an object`); return; }
    const extra = Object.keys(task).filter((k) => !['name', 'agent', 'task'].includes(k));
    if (extra.length) add('ARTIFACT_KEYS', `${where} carries ${extra.join(',')} (only name/agent/task are dispatch fields)`);
    if (typeof task.name !== 'string' || !task.name) { add('SEAT_NAME', `${where} has no name`); return; }
    if (!/^[A-Za-z][A-Za-z0-9]{1,31}$/.test(task.name)) add('SEAT_NAME', `${where} name ${JSON.stringify(task.name)} is not CamelCase <=32`);
    if (names.has(task.name.toLowerCase())) add('SEAT_DUPLICATE', `seat ${task.name} appears twice (case-insensitive)`);
    names.add(task.name.toLowerCase());
    if (typeof task.agent !== 'string' || !task.agent) { add('ROLE_UNKNOWN', `${where} (${task.name}) has no role`); return; }
    if (typeof ready.l1 === 'string' && ready.l1.trim() && task.name.toLowerCase() === ready.l1.trim().toLowerCase()) {
      add('L1_SEAT_COLLISION', `ready.l1=${JSON.stringify(ready.l1)} is also seat ${task.name}`);
    }
    if (task.agent === 'planner') { add('PLANNER_SEAT', `seat ${task.name} is a frozen-topology planner`); return; }
    if (!seatRoles.has(task.agent)) { add('ROLE_UNKNOWN', `seat ${task.name} role ${JSON.stringify(task.agent)} is not a policy proposal role`); return; }
    roles[task.agent] = (roles[task.agent] ?? 0) + 1;
    if (ATTACK.has(task.agent)) attack++;
    if (task.agent === 'connector') connectors++;
    if (typeof task.task !== 'string' || !task.task.trim()) { add('SEAT_SHAPE', `seat ${task.name} has no task text`); return; }
    const firstLine = task.task.split('\n')[0].trim();
    if (firstLine !== '/skill:godspeed') add('GODSPEED', `seat ${task.name} does not lead with /skill:godspeed`);
    if (!task.task.includes(laneRoot)) add('TASK_LANE_ROOT', `seat ${task.name} task text does not name ${laneRoot}`);
    // The rendered trailer reads `Report: <prose> <path>`; take the first path-shaped token
    // of any line that starts with `Report:` (the validator's trailer is the last such line).
    let dest = null;
    for (const line of task.task.matchAll(/^Report:(.*)$/gmu)) {
      for (const token of line[1].trim().split(/\s+/u)) {
        const raw = token.replace(/[)\]},.;]+$/u, '');
        if (!raw.includes('/')) continue;
        dest = isAbsolute(raw) ? resolve(raw) : resolve(lane, raw);
        break;
      }
      if (dest) break;
    }
    if (dest) {
      // F7 (round-82 wave scout): the validator bounds its own reportDir; admission must bound
      // the destination it accepts, or a hand-edited dispatch can send seats outside the lane.
      if (!inside(realpathSync(lane), dest)) add('REPORT_DEST_OUTSIDE', `${task.name} report destination ${dest} escapes ${lane}`);
      if (destinations.has(dest)) add('REPORT_DEST_DUPLICATE', `${task.name} claims ${dest} (also ${destinations.get(dest)})`);
      else destinations.set(dest, task.name);
    }
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
  if (tasks.length > 0 && attack * 100 < opts.attackPct * total) add('ATTACK_SHARE', `${attack}/${total} attack seats below ${opts.attackPct}%`);
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
    policy: basename(resolve(opts.policy)),
    agents: agentIds ? agentIds.size : 'none',
    seats: tasks.length,
    resumes: resumeSends.length,
    total,
    cap,
    roles,
    attack,
    connectors,
    findings,
  };
}

function render(result) {
  if (result.verdict === 'READY') {
    return `READY_HANDOFF: READY wave=${result.wave} seats=${result.seats} resumes=${result.resumes} total=${result.total}`
      + ` attack=${result.attack}/${result.total} connector=${result.connectors}`
      + ` roles=${Object.entries(result.roles).map(([k, v]) => `${k}=${v}`).join(',')}`
      + ` policy=${result.policy} agents=${result.agents}`;
  }
  return `READY_HANDOFF: DRIFT ${result.findings.map((f) => f.id).join(',')}`
    + ` (${result.findings[0].detail})`;
}

// ---------------------------------------------------------------------------
// Selftest — hermetic fixture lanes; nothing outside --work is read or written.
// ---------------------------------------------------------------------------

const POLICY_ROLES = ['scout', 'reviewer', 'critic', 'connector', 'sentinel', 'executor',
  'mutation-tester', 'revenger', 'simplifier', 'scribe'];

function writePolicy(box, { band = [8, 16], roles = POLICY_ROLES, maxLanes } = {}) {
  const doc = {
    sighting: { dispatch: { swarm: { waveMinLanes: band[0], waveMaxLanes: band[1] } } },
    nativeProfiles: { 'omp-native-v1': { proposalRoles: roles } },
  };
  if (maxLanes !== undefined) doc.sighting.dispatch.swarm.maxLanes = maxLanes;
  writeFileSync(join(box, 'policy.json'), `${JSON.stringify(doc, null, 2)}\n`);
}

function laneFixture(root, { seats = 10, attack = 3, connector = 1, wave = 'w1', round = 81,
  resumes = 0, dispatchMaxLanes, policyMaxLanes } = {}) {
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
  const resumeSends = Array.from({ length: resumes }, (_, i) => ({
    name: `K81R${String(i + 1).padStart(2, '0')}`,
    resume: tasks.length ? tasks[i % tasks.length].name : 'KumitateR81',
    message: 'resume per plan',
  }));
  const doc = {
    schema: DISPATCH_SCHEMA,
    wave,
    ...(dispatchMaxLanes !== undefined ? { maxLanes: dispatchMaxLanes } : {}),
    counts: { spawn: tasks.length, resume: resumeSends.length, total: tasks.length + resumeSends.length },
    taskCall: { context, tasks },
    resumeSends,
  };
  writeFileSync(dispatch, `${JSON.stringify(doc, null, 2)}\n`);
  const ready = { lane: 'kumitate-shokunin', round, wave, dispatch, l1: 'KumitateR81' };
  writeFileSync(join(dir, `${wave}.ready`), `${JSON.stringify(ready)}\n`);
  const box = root;
  writePolicy(box, { maxLanes: policyMaxLanes });
  writeFileSync(join(box, 'agents-members-ok.json'), `${JSON.stringify({ schema: 'ufo-swarm-registry-v1', members: { KumitateR81: { role: 'main' } } })}\n`);
  writeFileSync(join(box, 'agents-members-nol1.json'), `${JSON.stringify({ schema: 'ufo-swarm-registry-v1', members: { KumitateR80: { role: 'main' } } })}\n`);
  writeFileSync(join(box, 'agents-ok.json'), `${JSON.stringify({ agents: [{ id: 'KumitateR81' }] })}\n`);
  writeFileSync(join(box, 'agents-nol1.json'), `${JSON.stringify({ agents: [{ id: 'KumitateR80' }] })}\n`);
  writeFileSync(join(box, 'agents-bad.json'), '{not json\n');
  return { box, lane, dir, dispatch, tasks, context };
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
    const opts = { lane: fx.lane, round: 81, wave: 'w1', policy: join(fx.box, 'policy.json'), attackPct: 25 };
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
  judgeCase('duplicate-case-variant', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[1].name = doc.taskCall.tasks[0].name.toLowerCase();
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('SEAT_DUPLICATE'));
  judgeCase('ready-symlink-escape', (fx) => {
    const outside = join(fx.lane, 'outside-ready.json');
    writeFileSync(outside, readFileSync(join(fx.dir, 'w1.ready')));
    rmSync(join(fx.dir, 'w1.ready'));
    symlinkSync(outside, join(fx.dir, 'w1.ready'));
  }, (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'READY_UNSAFE');
  judgeCase('ready-symlink-inside', (fx) => {
    const insideFile = join(fx.dir, 'w1.ready.json');
    writeFileSync(insideFile, readFileSync(join(fx.dir, 'w1.ready')));
    rmSync(join(fx.dir, 'w1.ready'));
    symlinkSync(insideFile, join(fx.dir, 'w1.ready'));
  }, (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'READY_UNSAFE');
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

  // --- round-82 C1: binding, liveness, destinations, one policy authority -----
  judgeCase('wave-binding-stem', (fx) => {
    const moved = join(fx.dir, 'other-dispatch.json');
    writeFileSync(moved, readFileSync(fx.dispatch));
    rmSync(fx.dispatch);
    const ready = JSON.parse(readFileSync(join(fx.dir, 'w1.ready'), 'utf8'));
    ready.dispatch = moved;
    writeFileSync(join(fx.dir, 'w1.ready'), JSON.stringify(ready));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('WAVE_BINDING'));
  judgeCase('dispatch-wave-mismatch', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.wave = 'w2';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('DISPATCH_WAVE'));
  judgeCase('dispatch-wave-agree', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.wave = 'w1';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'READY');
  judgeCase('dispatch-wave-agree-suffixed', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.wave = 'kumitate-r81-w1';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'READY');
  // Round 82: the validator renders `Report: <prose> <path>`; the destination is the first
  // path-shaped token, not the first token (the shape the round's own handoff has).
  judgeCase('trailer-prose-shape', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[0].task = `/skill:godspeed\n# Target\n${fx.lane}/corpus/x.md\nReport: write your scoped findings to .ufo/waves/round-81/w1/K.md`;
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'READY');
  judgeCase('trailer-prose-distinct', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    const line = (n) => `Report: write your scoped findings to .ufo/waves/round-82/w1/K${n}.md`;
    doc.taskCall.tasks[0].task = `/skill:godspeed\n# Target\n${fx.lane}/corpus/x.md\n${line(0)}`;
    doc.taskCall.tasks[1].task = `/skill:godspeed\n# Target\n${fx.lane}/corpus/y.md\n${line(1)}`;
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'READY');

  judgeCase('trailer-prose-duplicate', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    const line = 'Report: write your scoped findings to .ufo/waves/round-81/w1/K.md';
    doc.taskCall.tasks[0].task = `/skill:godspeed\n# Target\n${fx.lane}/corpus/x.md\n${line}`;
    doc.taskCall.tasks[1].task = `/skill:godspeed\n# Target\n${fx.lane}/corpus/y.md\n${line}`;
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('REPORT_DEST_DUPLICATE'));

  judgeCase('report-dest-outside', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[0].task = `/skill:godspeed\n# Target\n${fx.lane}/corpus/x.md\nReport: /var/tmp/abs-0.md`;
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('REPORT_DEST_OUTSIDE'));

  judgeCase('report-dest-duplicate', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    const first = /^Report:\s*(\S+)/m.exec(doc.taskCall.tasks[0].task)[1];
    doc.taskCall.tasks[1].task = doc.taskCall.tasks[1].task.replace(/^Report:\s*\S+/m, `Report: ${first}`);
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('REPORT_DEST_DUPLICATE'));
  judgeCase('l1-seat-collision', (fx) => {
    const ready = JSON.parse(readFileSync(join(fx.dir, 'w1.ready'), 'utf8'));
    ready.l1 = 'K81S01';
    writeFileSync(join(fx.dir, 'w1.ready'), JSON.stringify(ready));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('L1_SEAT_COLLISION'));
  judgeCase('l1-unresolved', (fx, o) => { o.agents = join(fx.box, 'agents-nol1.json'); },
    (v) => v.verdict === 'DRIFT' && v.findings.includes('L1_UNRESOLVED'));
  judgeCase('l1-resolved', (fx, o) => { o.agents = join(fx.box, 'agents-ok.json'); },
    (v) => v.verdict === 'READY');
  judgeCase('agents-absent', (fx, o) => { o.agents = join(fx.box, 'no-such-agents.json'); },
    (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'AGENTS_ABSENT');
  judgeCase('agents-malformed', (fx, o) => { o.agents = join(fx.box, 'agents-bad.json'); },
    (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'AGENTS_MALFORMED');
  judgeCase('policy-absent', (fx, o) => { o.policy = join(fx.box, 'no-such-policy.json'); },
    (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'POLICY_ABSENT');
  judgeCase('policy-malformed', (fx) => { writeFileSync(join(fx.box, 'policy.json'), '{"sighting":{}}'); },
    (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'POLICY_MALFORMED');
  judgeCase('policy-band-narrow', (fx) => { writePolicy(fx.box, { band: [20, 30] }); },
    (v) => v.verdict === 'DRIFT' && v.findings.includes('BAND'));
  judgeCase('policy-roles-narrow', (fx) => {
    writePolicy(fx.box, { roles: POLICY_ROLES.filter((r) => r !== 'scribe') });
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('ROLE_UNKNOWN'));
  judgeCase('labrat-refused', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.taskCall.tasks[9].agent = 'labrat';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('ROLE_UNKNOWN'));
  judgeCase('dispatch-symlink-refused', (fx) => {
    const outside = join(fx.box, 'outside-dispatch.json');
    writeFileSync(outside, readFileSync(fx.dispatch));
    rmSync(fx.dispatch);
    symlinkSync(outside, fx.dispatch);
  }, (v) => v.verdict === 'FAIL-CLOSED' && v.token === 'DISPATCH_ABSENT');

  // --- v3 cases ----------------------------------------------------------
  judgeCase('band-total-resumes', (fx, o) => {
    const r = laneFixture(dirname(fx.lane), { seats: 6, attack: 3, resumes: 6 });
    o.lane = r.lane;
  }, (v) => v.verdict === 'READY' && v.seats === 6);
  judgeCase('resume-only-band-exempt', (fx, o) => {
    const r = laneFixture(dirname(fx.lane), { seats: 0, resumes: 3 });
    o.lane = r.lane;
  }, (v) => v.verdict === 'READY' && v.seats === 0);
  judgeCase('maxlanes-policy', (fx, o) => {
    const r = laneFixture(dirname(fx.lane), { seats: 10, attack: 3, policyMaxLanes: 8 });
    o.lane = r.lane;
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('MAXLANES'));
  judgeCase('maxlanes-dispatch', (fx, o) => {
    const r = laneFixture(dirname(fx.lane), { seats: 10, attack: 3, dispatchMaxLanes: 8 });
    o.lane = r.lane;
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('MAXLANES'));
  judgeCase('maxlanes-impossible', (fx, o) => {
    const r = laneFixture(dirname(fx.lane), { seats: 10, attack: 3, dispatchMaxLanes: 6 });
    o.lane = r.lane;
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('MAXLANES_IMPOSSIBLE'));
  judgeCase('dispatch-schema', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.schema = 'ufo-swarm-wave-dispatch-v0';
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('DISPATCH_SCHEMA'));
  judgeCase('dispatch-counts', (fx) => {
    const doc = JSON.parse(readFileSync(fx.dispatch, 'utf8'));
    doc.counts.spawn = 1;
    writeFileSync(fx.dispatch, JSON.stringify(doc));
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('DISPATCH_COUNTS'));
  judgeCase('policy-role-unjudgeable', (fx) => {
    writePolicy(fx.box, { roles: [...POLICY_ROLES, 'labrat'] });
  }, (v) => v.verdict === 'DRIFT' && v.findings.includes('POLICY_ROLE_UNJUDGEABLE'));
  judgeCase('agents-members-shape', (fx, o) => { o.agents = join(fx.box, 'agents-members-ok.json'); },
    (v) => v.verdict === 'READY');
  judgeCase('agents-members-unresolved', (fx, o) => { o.agents = join(fx.box, 'agents-members-nol1.json'); },
    (v) => v.verdict === 'DRIFT' && v.findings.includes('L1_UNRESOLVED'));
  cases++;
  {
    const box = join(root, 'maxlanes-ceiling');
    mkdirSync(box, { recursive: true });
    const fxCeil = laneFixture(box, { policyMaxLanes: 512 });
    let capped = null;
    try { capped = judge({ lane: fxCeil.lane, round: 81, wave: 'w1', policy: join(box, 'policy.json'), attackPct: 25 }).cap; } catch (e) { capped = e.token ?? 'ERROR'; }
    ok('maxlanes-ceiling', capped === 256, `cap=${capped}`);
  }
  cases++;
  {
    const box = join(root, 'attack-line');
    mkdirSync(box, { recursive: true });
    const fxA = laneFixture(box);
    let line = '';
    try { line = render(judge({ lane: fxA.lane, round: 81, wave: 'w1', policy: join(box, 'policy.json'), attackPct: 25 })); } catch (e) { line = e.token ?? 'ERROR'; }
    ok('attack-line-total', line.includes('seats=10 resumes=0 total=10') && line.includes('attack=3/10'), line.slice(0, 120));
  }

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
