#!/usr/bin/env node
/**
 * probe83-c1-repair.mjs — DISCLOSED REPAIR of the frozen round-83 C1 counter (not the claim's rule). (operability, capability deepening
 * `ready-handoff` v3). Contract judged: `kumitate-ready-handoff-v3`.
 *
 *   node .ufo/waves/round-83/probe/probe83-c1.mjs --set c1 [--lane DIR] [--work DIR] [--keep]
 *
 * Predicate: prints `C83_C1R: HELD held=28/28` (supplementary evidence; the claim's rule is the frozen probe83-c1.mjs) and exits 0 at the measured
 * revision M. Base tree (round-82 tip, v2): the carried arms hold and every new arm fails.
 * A constant-`READY` stub cannot reach half the target.
 *
 * Hermetic: builds fixture lanes under `--work`, shells the lane's own tool as a subprocess.
 * It reads the tool and the fixtures it wrote; it never writes into the lane.
 * Frozen at the round-83 freeze commit; never edit after a data seat has scored.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const ARMS = 28;
const POLICY_ROLES = ['scout', 'reviewer', 'critic', 'connector', 'sentinel', 'executor',
  'mutation-tester', 'revenger', 'simplifier', 'scribe'];
const ATTACK_ROLES = ['reviewer', 'critic', 'mutation-tester'];

function parse(argv) {
  const o = { lane: '.', set: null, work: null, keep: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lane') o.lane = argv[++i];
    else if (a === '--set') o.set = argv[++i];
    else if (a === '--work') o.work = argv[++i];
    else if (a === '--keep') o.keep = true;
    else return { error: `unknown argument: ${a}` };
  }
  if (o.set !== 'c1') return { error: `--set c1 is required (got ${o.set})` };
  return o;
}

function policyDoc(o = {}) {
  const doc = {
    sighting: { dispatch: { swarm: { waveMinLanes: (o.band ?? [8, 16])[0], waveMaxLanes: (o.band ?? [8, 16])[1] } } },
    nativeProfiles: { 'omp-native-v1': { proposalRoles: o.roles ?? POLICY_ROLES } },
  };
  if (o.maxLanes !== undefined) doc.sighting.dispatch.swarm.maxLanes = o.maxLanes;
  return doc;
}

function seatPlan(seats, attack, connectors) {
  const plan = [];
  for (let i = 0; i < attack; i++) plan.push(ATTACK_ROLES[i % ATTACK_ROLES.length]);
  for (let i = 0; i < connectors; i++) plan.push('connector');
  const fill = ['executor', 'scribe'];
  let k = 0;
  while (plan.length < seats) plan.push(fill[k++ % fill.length]);
  return plan.slice(0, seats);
}

function fixture(root, name, opts = {}) {
  const box = join(root, name);
  const laneDir = join(box, 'kumitate-shokunin');
  const waveDir = join(laneDir, '.ufo', 'waves', 'round-83');
  mkdirSync(waveDir, { recursive: true });
  const seats = opts.seats ?? 14;
  const attack = opts.attack ?? Math.max(1, Math.ceil(seats * 0.25));
  const connectors = opts.connectors ?? 1;
  const resumes = opts.resumes ?? 0;
  const roles = seatPlan(seats, attack, connectors);
  const tasks = roles.map((agent, i) => {
    const nm = `K83S${String(i + 1).padStart(2, '0')}`;
    return {
      name: nm,
      agent,
      task: `/skill:godspeed\n# Target\n${laneDir}/corpus/lessons/round-83.md\n`
        + `Scratch: $HYAKU_SCRATCH/kumitate-r83/${nm}/\n`
        + `Report: ${laneDir}/.ufo/waves/round-83/w1/${nm}.md (relative to ${laneDir} — write it at ${laneDir}/.ufo/waves/round-83/w1/${nm}.md)`,
    };
  });
  const resumeSends = Array.from({ length: resumes }, (_, i) => ({
    name: `K83R${String(i + 1).padStart(2, '0')}`,
    resume: tasks[i % Math.max(1, tasks.length)]?.name ?? 'K83S01',
    message: 'resume per plan',
  }));
  const context = `Every path is absolute under ${laneDir}. Every \`Report:\` trailer path is `
    + `relative to ${laneDir} — write it at ${laneDir}/<that path>. Scratch root: `
    + `/fast/scratch/hyaku/kumitate-r83/<seat>/ (HYAKU_SCRATCH).`;
  const dispatchName = opts.dispatchName ?? 'w1-dispatch.json';
  const dispatch = join(waveDir, dispatchName);
  const counts = opts.counts === 'absent'
    ? undefined
    : (opts.counts === 'lying'
      ? { spawn: Math.max(0, seats - 1), resume: resumes, total: seats - 1 + resumes }
      : { spawn: seats, resume: resumes, total: seats + resumes });
  const dispatchDoc = {
    ...(opts.schema === 'absent' ? {} : { schema: opts.schema ?? 'ufo-swarm-wave-dispatch-v1' }),
    wave: opts.dispatchWave ?? 'w1',
    ...(opts.dispatchMaxLanes !== undefined ? { maxLanes: opts.dispatchMaxLanes } : {}),
    ...(counts ? { counts } : {}),
    taskCall: seats === 0 ? null : { context, tasks },
    resumeSends,
  };
  writeFileSync(dispatch, `${JSON.stringify(dispatchDoc, null, 2)}\n`);
  writeFileSync(join(box, 'policy.json'), `${JSON.stringify(policyDoc(opts), null, 2)}\n`);
  writeFileSync(join(box, 'agents-array.json'), `${JSON.stringify({ agents: [{ id: 'KumitateR83' }] })}\n`);
  writeFileSync(join(box, 'agents-members.json'), `${JSON.stringify({ schema: 'ufo-swarm-registry-v1', members: { KumitateR83: { role: 'main' } } })}\n`);
  writeFileSync(join(box, 'agents-nol1.json'), `${JSON.stringify({ schema: 'ufo-swarm-registry-v1', members: { SomeoneElse: { role: 'main' } } })}\n`);
  writeFileSync(join(box, 'agents-bad.json'), '{not json\n');
  const ready = { lane: 'kumitate-shokunin', round: 83, wave: 'w1', dispatch, l1: opts.l1 ?? 'KumitateR83' };
  writeFileSync(join(waveDir, 'w1.ready'), `${JSON.stringify(ready)}\n`);
  return { box, laneDir, waveDir, dispatch, ready, dispatchDoc, tasks, resumeSends };
}

function main() {
  const opts = parse(process.argv.slice(2));
  if (opts.error) { process.stdout.write(`PROBE83_C1R: USAGE ${opts.error}\n`); return 64; }
  const lane = resolve(opts.lane);
  const tool = join(lane, 'scripts', 'ready-handoff.mjs');
  const toolText = existsSync(tool) ? readFileSync(tool, 'utf8') : '';
  const base = opts.work
    ? (mkdirSync(opts.work, { recursive: true }), opts.work)
    : (process.env.HYAKU_SCRATCH
      ? (mkdirSync(join(process.env.HYAKU_SCRATCH, 'kumitate-r83', 'probe83-c1'), { recursive: true }), join(process.env.HYAKU_SCRATCH, 'kumitate-r83', 'probe83-c1'))
      : tmpdir());
  const root = mkdtempSync(join(base, 'c83c1-'));

  const run = (args) => {
    if (!existsSync(tool)) return { code: 127, out: 'tool-absent' };
    const r = spawnSync(process.execPath, [tool, ...args], { cwd: lane, encoding: 'utf8', timeout: 60000 });
    return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
  };
  const judge = (fx, extra = []) => run(['--lane', fx.laneDir, '--round', '83', '--wave', 'w1',
    '--policy', join(fx.box, 'policy.json'), ...extra]);

  let held = 0;
  const rows = [];
  const arm = (name, fn) => {
    let ok = false;
    let detail = '';
    try { const r = fn(); ok = r.ok; detail = r.detail; } catch (e) { detail = `throw ${e.message}`; }
    if (ok) held++;
    rows.push(`C83_C1R arm ${name} ${ok ? 'ok' : 'FAIL'}${detail ? ` ${detail}` : ''}`);
  };
  const want = (r, code, needle, lacks) => ({
    ok: r.code === code && r.out.includes(needle) && (!lacks || !r.out.includes(lacks)),
    detail: `exit=${r.code} want=${JSON.stringify(needle)}${lacks ? ` lacks=${JSON.stringify(lacks)}` : ''} out=${r.out.trim().split('\n')[0]}`,
  });

  const fx = fixture(root, 'clean');
  const mutate = (name, o) => fixture(root, name, o);
  const editDispatch = (f, fn) => { const doc = JSON.parse(readFileSync(f.dispatch, 'utf8')); fn(doc); writeFileSync(f.dispatch, JSON.stringify(doc)); return doc; };
  const editReady = (f, fn) => { const p = join(f.waveDir, 'w1.ready'); const doc = JSON.parse(readFileSync(p, 'utf8')); fn(doc); writeFileSync(p, JSON.stringify(doc)); };
  const editTask = (f, index, fn) => editDispatch(f, (doc) => fn(doc.taskCall.tasks[index]));

  arm('tool-v3-contract', () => ({
    ok: toolText.includes('kumitate-ready-handoff-v3') && !toolText.includes("'kumitate-ready-handoff-v2'"),
    detail: toolText ? `v3=${toolText.includes('kumitate-ready-handoff-v3')}` : 'tool-absent',
  }));
  arm('clean-ready', () => want(judge(fx), 0, 'READY_HANDOFF: READY wave=w1 seats=14 resumes=0 total=14'));

  const fRes = mutate('band-resumes', { seats: 6, attack: 3, resumes: 6 });
  arm('band-total-resumes', () => want(judge(fRes), 0, 'READY_HANDOFF: READY wave=w1 seats=6 resumes=6 total=12'));
  const fOnly = mutate('resume-only', { seats: 0, resumes: 3 });
  arm('resume-only-exempt', () => want(judge(fOnly), 0, 'READY_HANDOFF: READY wave=w1 seats=0 resumes=3 total=3'));

  const fCapP = mutate('maxlanes-policy', { maxLanes: 12 });
  arm('maxlanes-policy', () => want(judge(fCapP), 1, 'MAXLANES'));
  const fCapD = mutate('maxlanes-dispatch', { dispatchMaxLanes: 10 });
  arm('maxlanes-dispatch', () => want(judge(fCapD), 1, 'MAXLANES'));
  const fImp = mutate('maxlanes-impossible', { seats: 8, attack: 2, dispatchMaxLanes: 6 });
  arm('maxlanes-impossible', () => want(judge(fImp), 1, 'MAXLANES_IMPOSSIBLE'));
  const fCeil = mutate('maxlanes-ceiling', { maxLanes: 512 });
  arm('maxlanes-ceiling', () => {
    const r = judge(fCeil, ['--json']);
    let doc = null;
    try { doc = JSON.parse(r.out); } catch { /* no json */ }
    return { ok: r.code === 0 && doc && doc.cap === 256, detail: `exit=${r.code} cap=${doc ? doc.cap : 'none'}` };
  });

  const fSchema = mutate('schema-wrong', { schema: 'ufo-swarm-wave-dispatch-v0' });
  arm('dispatch-schema', () => want(judge(fSchema), 1, 'DISPATCH_SCHEMA'));
  const fCounts = mutate('counts-lying', { counts: 'lying' });
  const fCountsOk = mutate('counts-true', {});
  arm('dispatch-counts', () => {
    const bad = want(judge(fCounts), 1, 'DISPATCH_COUNTS');
    const good = want(judge(fCountsOk), 0, 'READY_HANDOFF: READY');
    return { ok: bad.ok && good.ok, detail: `lying(${bad.detail}) true(${good.detail})` };
  });

  const fRole = mutate('policy-role', { roles: [...POLICY_ROLES, 'labrat'] });
  arm('policy-role-unjudgeable', () => want(judge(fRole), 1, 'POLICY_ROLE_UNJUDGEABLE'));

  arm('agents-members', () => want(judge(fx, ['--agents', join(fx.box, 'agents-members.json')]), 0, 'agents=1'));
  arm('agents-members-nol1', () => want(judge(fx, ['--agents', join(fx.box, 'agents-nol1.json')]), 1, 'L1_UNRESOLVED'));
  arm('agents-array-shape', () => want(judge(fx, ['--agents', join(fx.box, 'agents-array.json')]), 0, 'READY_HANDOFF: READY'));
  arm('agents-malformed', () => want(judge(fx, ['--agents', join(fx.box, 'agents-bad.json')]), 2, 'AGENTS_MALFORMED'));

  const fLab = mutate('labrat-seat', {});
  editTask(fLab, 12, (t) => { t.agent = 'labrat'; });
  arm('labrat-seat-refused', () => want(judge(fLab), 1, 'ROLE_UNKNOWN'));

  const fAttack = mutate('attack-reachable', { seats: 14, attack: 4 });
  arm('attack-reachable', () => want(judge(fAttack), 0, 'attack=4/14'));
  const fLow = mutate('attack-low', { seats: 14, attack: 2 });
  arm('attack-share-low', () => want(judge(fLow), 1, 'ATTACK_SHARE'));
  const fConn = mutate('connectors', { connectors: 3 });
  arm('connector-cap', () => want(judge(fConn), 1, 'CONNECTOR_COUNT'));

  const fSmall = mutate('band-small', { seats: 7, attack: 2 });
  arm('band-small', () => want(judge(fSmall), 1, 'BAND'));
  const fWide = mutate('band-wide', { seats: 17, attack: 5 });
  arm('band-wide', () => want(judge(fWide), 1, 'BAND'));

  const fStem = mutate('stem', {});
  const stemDispatch = join(fStem.waveDir, 'other-dispatch.json');
  writeFileSync(stemDispatch, `${JSON.stringify(fStem.dispatchDoc)}\n`);
  unlinkSync(fStem.dispatch);
  editReady(fStem, (doc) => { doc.dispatch = stemDispatch; });
  arm('wave-binding-stem', () => want(judge(fStem), 1, 'WAVE_BINDING'));
  const fWave = mutate('dispatch-wave', { dispatchWave: 'w2' });
  arm('dispatch-wave-mismatch', () => want(judge(fWave), 1, 'DISPATCH_WAVE'));

  const fColl = mutate('l1-collision', { l1: 'K83S01' });
  arm('l1-seat-collision', () => want(judge(fColl), 1, 'L1_SEAT_COLLISION'));

  const fDup = mutate('report-dup', {});
  editTask(fDup, 1, (t) => { t.task = t.task.replace(/Report: \S+/, `Report: ${fDup.laneDir}/.ufo/waves/round-83/w1/K83S01.md`); });
  arm('report-dest-duplicate', () => want(judge(fDup), 1, 'REPORT_DEST_DUPLICATE'));
  const fOut = mutate('report-outside', {});
  editTask(fOut, 0, (t) => { t.task = `/skill:godspeed\n# Target\n${fOut.laneDir}/corpus/x.md\nReport: /var/tmp/abs-0.md`; });
  arm('report-dest-outside', () => want(judge(fOut), 1, 'REPORT_DEST_OUTSIDE'));

  const fGod = mutate('godspeed', {});
  editTask(fGod, 0, (t) => { t.task = t.task.replace(/^\/skill:godspeed\n/, ''); });
  arm('godspeed-missing', () => want(judge(fGod), 1, 'GODSPEED'));

  const fOutside = mutate('dispatch-outside', {});
  const outside = join(fOutside.box, 'outside-dispatch.json');
  writeFileSync(outside, `${JSON.stringify(fOutside.dispatchDoc)}\n`);
  editReady(fOutside, (doc) => { doc.dispatch = outside; });
  arm('dispatch-outside', () => want(judge(fOutside), 2, 'DISPATCH_OUTSIDE'));

  if (!opts.keep) rmSync(root, { recursive: true, force: true });
  for (const line of rows) process.stdout.write(`${line}\n`);
  const verdict = held === ARMS ? 'HELD' : 'UNMET';
  process.stdout.write(`C83_C1R: ${verdict} held=${held}/${ARMS}\n`);
  return held === ARMS ? 0 : 1;
}

process.exit(main());
