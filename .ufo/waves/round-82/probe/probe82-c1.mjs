#!/usr/bin/env node
/**
 * probe82-c1.mjs — FROZEN counter for round-82 C1 (operability, capability deepening
 * `ready-handoff` v2). Contract judged: `kumitate-ready-handoff-v2`.
 *
 *   node .ufo/waves/round-82/probe/probe82-c1.mjs --set c1 [--lane DIR] [--work DIR] [--keep]
 *
 * Predicate (plan.md §C1): prints `C82_C1: HELD held=22/22` and exits 0 at the measured
 * revision M. Base tree: the tool is absent, so every arm fails (0/22). Constant-`READY`
 * stub: at most 5/22.
 *
 * The probe builds hermetic fixture lanes under `--work` (default
 * `$HYAKU_SCRATCH/kumitate-r82/probe82-c1`, else a mkdtemp under the OS temp dir) and
 * shells the lane's own tool as a subprocess. It reads the tool, the fixtures it wrote,
 * and the round's own handoff. It never writes into the lane.
 *
 * Frozen at the round-82 freeze commit; never edit after a data seat has scored.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const ARMS = 22;
const ATTACK_ROLES = ['reviewer', 'reviewer', 'reviewer', 'critic', 'mutation-tester'];
const POLICY_ROLES = ['scout', 'reviewer', 'critic', 'connector', 'sentinel', 'executor',
  'mutation-tester', 'revenger', 'simplifier', 'scribe'];

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

function policyDoc(band = [8, 16], roles = POLICY_ROLES) {
  return {
    sighting: { dispatch: { swarm: { waveMinLanes: band[0], waveMaxLanes: band[1] } } },
    nativeProfiles: { 'omp-native-v1': { proposalRoles: roles } },
  };
}

function seatsOf(count, attack, connectors) {
  const plan = [];
  for (let i = 0; i < attack; i++) plan.push(ATTACK_ROLES[i % ATTACK_ROLES.length]);
  for (let i = 0; i < connectors; i++) plan.push('connector');
  const fill = ['executor', 'scribe'];
  let k = 0;
  while (plan.length < count) plan.push(fill[k++ % fill.length]);
  return plan;
}

function fixture(root, name, opts = {}) {
  const box = join(root, name);
  mkdirSync(box, { recursive: true });
  const laneDir = join(box, 'kumitate-shokunin');
  const waveDir = join(laneDir, '.ufo', 'waves', 'round-82');
  mkdirSync(waveDir, { recursive: true });
  const seats = opts.seats ?? 14;
  const attack = opts.attack ?? 5;
  const connectors = opts.connectors ?? 1;
  const roles = seatsOf(seats, attack, connectors);
  const tasks = roles.map((agent, i) => {
    const name = `K82S${String(i + 1).padStart(2, '0')}`;
    return {
      name,
      agent,
      task: `/skill:godspeed\n# Target\n${laneDir}/corpus/lessons/round-82.md\n`
        + `Scratch: $HYAKU_SCRATCH/kumitate-r82/${name}/\n`
        + `Report: ${laneDir}/.ufo/waves/round-82/w1/${name}.md (relative to ${laneDir} — write it at ${laneDir}/.ufo/waves/round-82/w1/${name}.md)`,
    };
  });
  const context = `Every path is absolute under ${laneDir}. Every \`Report:\` trailer path is `
    + `relative to ${laneDir} — write it at ${laneDir}/<that path>. Scratch root: `
    + `/fast/scratch/hyaku/kumitate-r82/<seat>/ (HYAKU_SCRATCH).`;
  const dispatchName = `${opts.waveName ?? 'w1'}-dispatch.json`;
  const dispatch = join(waveDir, dispatchName);
  const dispatchDoc = { contract: 'ufo-swarm-wave-dispatch-v1', wave: opts.dispatchWave ?? 'w1', taskCall: { context, tasks } };
  writeFileSync(dispatch, `${JSON.stringify(dispatchDoc, null, 2)}\n`);
  writeFileSync(join(box, 'policy.json'), `${JSON.stringify(policyDoc(opts.band, opts.roles), null, 2)}\n`);
  writeFileSync(join(box, 'agents-ok.json'), `${JSON.stringify({ agents: [{ id: 'KumitateR82' }] })}\n`);
  writeFileSync(join(box, 'agents-nol1.json'), `${JSON.stringify({ agents: [{ id: 'KumitateR81' }] })}\n`);
  writeFileSync(join(box, 'agents-bad.json'), '{not json\n');
  const ready = { lane: 'kumitate-shokunin', round: 82, wave: 'w1', dispatch, l1: opts.l1 ?? 'KumitateR82' };
  writeFileSync(join(waveDir, 'w1.ready'), `${JSON.stringify(ready)}\n`);
  return { box, laneDir, waveDir, dispatch, ready, dispatchDoc };
}

function main() {
  const opts = parse(process.argv.slice(2));
  if (opts.error) { process.stdout.write(`PROBE82_C1: USAGE ${opts.error}\n`); return 64; }
  const lane = resolve(opts.lane);
  const tool = join(lane, 'scripts', 'ready-handoff.mjs');
  const toolText = existsSync(tool) ? readFileSync(tool, 'utf8') : '';
  const base = opts.work
    ? (mkdirSync(opts.work, { recursive: true }), opts.work)
    : (process.env.HYAKU_SCRATCH
      ? (mkdirSync(join(process.env.HYAKU_SCRATCH, 'kumitate-r82', 'probe82-c1'), { recursive: true }), join(process.env.HYAKU_SCRATCH, 'kumitate-r82', 'probe82-c1'))
      : tmpdir());
  const root = mkdtempSync(join(base, 'c82c1-'));
  const fleetPolicy = join(dirname(lane), 'scripts', 'hyaku', 'ufo-wave-policy.json');

  const run = (args) => {
    if (!existsSync(tool)) return { code: 127, out: 'tool-absent' };
    const r = spawnSync(process.execPath, [tool, ...args], { cwd: lane, encoding: 'utf8', timeout: 60000 });
    return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
  };
  const judge = (fx, extra = []) => run(['--lane', fx.laneDir, '--round', '82', '--wave', 'w1',
    '--policy', join(fx.box, 'policy.json'), ...extra]);

  let held = 0;
  const rows = [];
  const arm = (name, fn) => {
    let ok = false;
    let detail = '';
    try {
      const r = fn();
      ok = r.ok;
      detail = r.detail;
    } catch (e) { detail = `throw ${e.message}`; }
    if (ok) held++;
    rows.push(`C82_C1 arm ${name} ${ok ? 'ok' : 'FAIL'}${detail ? ` ${detail}` : ''}`);
  };
  const want = (r, code, needle) => ({ ok: r.code === code && r.out.includes(needle), detail: `exit=${r.code} ${needle}${r.out.includes(needle) ? '' : ' MISS'} out=${r.out.trim().split('\n')[0]}` });

  const fx = fixture(root, 'clean');
  const mutate = (name, fn) => fixture(root, name, fn);
  const editDispatch = (f, fn) => { const doc = JSON.parse(readFileSync(f.dispatch, 'utf8')); fn(doc); writeFileSync(f.dispatch, JSON.stringify(doc)); return doc; };
  const editReady = (f, fn) => { const p = join(f.waveDir, 'w1.ready'); const doc = JSON.parse(readFileSync(p, 'utf8')); fn(doc); writeFileSync(p, JSON.stringify(doc)); };
  const editTask = (f, index, fn) => editDispatch(f, (doc) => fn(doc.taskCall.tasks[index]));

  arm('tool-v2-contract', () => ({
    ok: toolText.includes('kumitate-ready-handoff-v2') && !toolText.includes("'kumitate-ready-handoff-v1'"),
    detail: toolText ? `v2=${toolText.includes('kumitate-ready-handoff-v2')}` : 'tool-absent',
  }));
  arm('clean-ready', () => want(judge(fx), 0, 'READY_HANDOFF: READY wave=w1 seats=14'));

  const fStem = mutate('stem', {}); unlinkSync(fStem.dispatch);
  const fStem2 = fStem; const stemDispatch = join(fStem.waveDir, 'other-dispatch.json');
  writeFileSync(stemDispatch, `${JSON.stringify(fStem.dispatchDoc)}\n`);
  editReady(fStem2, (doc) => { doc.dispatch = stemDispatch; });
  arm('wave-binding-stem', () => want(judge(fStem2), 1, 'WAVE_BINDING'));

  const fWave = mutate('dispatch-wave', { dispatchWave: 'w2' });
  arm('dispatch-wave-mismatch', () => want(judge(fWave), 1, 'DISPATCH_WAVE'));
  const fWaveOk = mutate('dispatch-wave-ok', { dispatchWave: 'w1' });
  arm('dispatch-wave-agree', () => want(judge(fWaveOk), 0, 'READY_HANDOFF: READY'));

  const fDup = mutate('report-dup', {});
  editTask(fDup, 1, (t) => { t.task = t.task.replace(/Report: \S+/, `Report: ${fDup.laneDir}/.ufo/waves/round-82/w1/K82S01.md`); });
  arm('report-dest-duplicate', () => want(judge(fDup), 1, 'REPORT_DEST_DUPLICATE'));

  const fColl = mutate('l1-collision', { l1: 'K82S01' });
  arm('l1-seat-collision', () => want(judge(fColl), 1, 'L1_SEAT_COLLISION'));
  arm('l1-unresolved', () => want(judge(fx, ['--agents', join(fx.box, 'agents-nol1.json')]), 1, 'L1_UNRESOLVED'));
  arm('l1-resolved', () => want(judge(fx, ['--agents', join(fx.box, 'agents-ok.json')]), 0, 'READY_HANDOFF: READY'));
  arm('agents-absent', () => want(judge(fx, ['--agents', join(fx.box, 'no-such-agents.json')]), 2, 'AGENTS_ABSENT'));
  arm('agents-malformed', () => want(judge(fx, ['--agents', join(fx.box, 'agents-bad.json')]), 2, 'AGENTS_MALFORMED'));
  arm('policy-absent', () => want(run(['--lane', fx.laneDir, '--round', '82', '--wave', 'w1', '--policy', join(fx.box, 'no-such-policy.json')]), 2, 'POLICY_ABSENT'));
  arm('policy-malformed', () => want(run(['--lane', fx.laneDir, '--round', '82', '--wave', 'w1', '--policy', join(fx.box, 'agents-bad.json')]), 2, 'POLICY_MALFORMED'));

  const fBand = mutate('policy-band', { band: [20, 30] });
  arm('policy-band-read', () => want(judge(fBand), 1, 'BAND'));
  const fBandOk = mutate('policy-band-ok', { band: [8, 16] });
  arm('policy-band-default', () => want(judge(fBandOk), 0, 'READY_HANDOFF: READY'));

  const fRoles = mutate('policy-roles', { roles: POLICY_ROLES.filter((r) => r !== 'scribe') });
  arm('policy-roles-narrow', () => want(judge(fRoles), 1, 'ROLE_UNKNOWN'));

  const fLab = mutate('labrat', {});
  editTask(fLab, 11, (t) => { t.agent = 'labrat'; });
  arm('labrat-refused', () => want(judge(fLab), 1, 'ROLE_UNKNOWN'));

  const fLink = mutate('symlink', {});
  const outside = join(fLink.box, 'outside-dispatch.json');
  writeFileSync(outside, `${JSON.stringify(fLink.dispatchDoc)}\n`);
  unlinkSync(fLink.dispatch);
  symlinkSync(outside, fLink.dispatch);
  arm('dispatch-symlink-refused', () => want(judge(fLink), 2, 'DISPATCH_ABSENT'));

  const fAttack = mutate('attack-low', { attack: 2 });
  arm('attack-share', () => want(judge(fAttack), 1, 'ATTACK_SHARE'));
  const fConn = mutate('connectors', { connectors: 3 });
  arm('connector-cap', () => want(judge(fConn), 1, 'CONNECTOR_COUNT'));

  arm('round-handoff-ready', () => {
    const r = run(['--lane', lane, '--round', '82', '--wave', 'w1', '--policy', fleetPolicy]);
    return want(r, 0, 'READY_HANDOFF: READY wave=w1');
  });
  arm('selftest', () => {
    const r = run(['--selftest']);
    const m = /READY_HANDOFF_SELFTEST: (\d+)\/(\d+) pass/.exec(r.out);
    const cases = m ? Number(m[2]) : 0;
    return { ok: r.code === 0 && cases >= 45 && r.out.includes('VERDICT: PASS'), detail: `exit=${r.code} cases=${cases}${m ? '' : ' no-tally'}` };
  });

  if (!opts.keep) rmSync(root, { recursive: true, force: true });
  for (const line of rows) process.stdout.write(`${line}\n`);
  const verdict = held === ARMS ? 'HELD' : 'UNMET';
  process.stdout.write(`C82_C1: ${verdict} held=${held}/${ARMS}\n`);
  return held === ARMS ? 0 : 1;
}

process.exit(main());
