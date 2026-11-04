#!/usr/bin/env node
/**
 * probe81-c1.mjs — frozen counter C1 for kumitate round 81.
 *
 * Usage:
 *   node .ufo/waves/round-81/probe/probe81-c1.mjs [--set c1] [--tool DIR] [--lane DIR] [--work DIR] [--keep-work]
 *
 * C1 — operability: capability `ready-handoff` (`scripts/ready-handoff.mjs`,
 * contract `kumitate-ready-handoff-v1`) admits or refuses a `<wave>.ready`
 * handoff plus the dispatch payload it names before the orchestrator takes it.
 * Frozen predicate and arms: `.ufo/waves/round-81/plan.md` §C1.
 *
 * The lane is read-only: every fixture lane lives under --work (default
 * $TMPDIR). Exit 0 iff every arm passes; 1 otherwise; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_LANE = resolve(dirname(SELF), '..', '..', '..', '..');
const ROUND = 81;
const WAVE = 'w1';

function parseArgs(argv) {
  const o = { set: 'c1', tool: null, lane: DEFAULT_LANE, work: null, keep: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--set') o.set = argv[++i];
    else if (a === '--tool') o.tool = resolve(argv[++i]);
    else if (a === '--lane') o.lane = resolve(argv[++i]);
    else if (a === '--work') o.work = resolve(argv[++i]);
    else if (a === '--keep-work') o.keep = true;
    else if (a === '--help') return { help: true };
    else return { error: `unknown argument ${a}` };
  }
  if (o.set !== 'c1') return { error: `unknown set ${o.set}` };
  o.tool = o.tool ?? o.lane;
  return o;
}

const sha = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
};

function laneFixture(root, { seats = 10, attack = 3, connector = 1 } = {}) {
  const lane = join(root, 'kumitate-shokunin');
  const dir = join(lane, '.ufo', 'waves', `round-${ROUND}`);
  mkdirSync(dir, { recursive: true });
  const plan = [
    ...Array.from({ length: attack }, (_, i) => (['reviewer', 'critic', 'mutation-tester', 'labrat'][i % 4])),
    ...Array.from({ length: connector }, () => 'connector'),
    ...Array.from({ length: Math.max(0, seats - attack - connector) }, (_, i) => (i % 2 ? 'scribe' : 'executor')),
  ].slice(0, seats);
  const tasks = plan.map((agent, i) => {
    const name = `K81S${String(i + 1).padStart(2, '0')}`;
    return {
      name,
      agent,
      task: `/skill:godspeed\n# Target\n${lane}/corpus/lessons/round-81.md\nReport: .ufo/waves/round-${ROUND}/${WAVE}/${name}.md (relative to ${lane} — write it at ${lane}/.ufo/waves/round-${ROUND}/${WAVE}/${name}.md)\nScratch: $HYAKU_SCRATCH/kumitate-r81/${name}/`,
    };
  });
  const context = `Every path is under ${lane}. Every \`Report:\` trailer path is relative to ${lane} — write it at ${lane}/<that path>. Scratch root: /fast/scratch/hyaku/kumitate-r81/<seat>/ (HYAKU_SCRATCH).`;
  const dispatch = join(dir, `${WAVE}-dispatch.json`);
  writeFileSync(dispatch, `${JSON.stringify({ contract: 'ufo-swarm-wave-dispatch-v1', taskCall: { context, tasks } }, null, 2)}\n`);
  writeFileSync(join(dir, `${WAVE}.ready`), `${JSON.stringify({ lane: 'kumitate-shokunin', round: ROUND, wave: WAVE, dispatch, l1: 'KumitateR81' })}\n`);
  return { lane, dir, dispatch };
}

function main(argv) {
  const opts = parseArgs(argv);
  if (opts.error) { process.stderr.write(`${opts.error}\n`); return 64; }
  if (opts.help) {
    process.stdout.write('usage: probe81-c1.mjs [--set c1] [--tool DIR] [--lane DIR] [--work DIR] [--keep-work]\n');
    return 0;
  }
  const tool = join(opts.tool, 'scripts', 'ready-handoff.mjs');
  const work = opts.work ?? mkdtempSync(join(tmpdir(), 'k81c1-'));
  if (opts.work) mkdirSync(work, { recursive: true });
  const run = (args) => {
    const r = spawnSync(process.execPath, [tool, ...args], { encoding: 'utf8', timeout: 60000 });
    return { code: r.status ?? 64, out: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim(), error: r.error };
  };
  const arms = [];
  const arm = (name, fn) => {
    let ok = false;
    let detail = '';
    try { ({ ok, detail } = fn()); } catch (e) { ok = false; detail = `threw ${e.message}`; }
    arms.push({ name, ok, detail });
  };
  const fixture = (name, opts2 = {}) => {
    const box = join(work, name);
    mkdirSync(box, { recursive: true });
    return laneFixture(box, opts2);
  };
  const ready = (lane) => join(lane, '.ufo', 'waves', `round-${ROUND}`, `${WAVE}.ready`);
  const dispatchOf = (lane) => join(lane, '.ufo', 'waves', `round-${ROUND}`, `${WAVE}-dispatch.json`);
  const editDispatch = (lane, mutate) => {
    const file = dispatchOf(lane);
    const doc = JSON.parse(readFileSync(file, 'utf8'));
    mutate(doc);
    writeFileSync(file, JSON.stringify(doc));
  };
  const editReady = (lane, mutate) => {
    const file = ready(lane);
    const doc = JSON.parse(readFileSync(file, 'utf8'));
    mutate(doc);
    writeFileSync(file, JSON.stringify(doc));
  };

  // 01 — the clean fixture handoff is READY with the declared count.
  arm('clean-fixture-ready', () => {
    const fx = fixture('clean');
    const r = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r.code === 0 && r.out.startsWith('READY_HANDOFF: READY wave=w1 seats=10 attack=3/10'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 02 — DISCRIMINATING: this round's own committed handoff is READY.
  arm('round-81-live-ready', () => {
    const r = run(['--lane', opts.lane, '--round', String(ROUND), '--wave', WAVE]);
    return {
      ok: r.code === 0 && /^READY_HANDOFF: READY wave=w1 seats=\d+ attack=\d+\/\d+/.test(r.out),
      detail: `exit=${r.code} out=${r.out}`,
    };
  });

  // 03 — a 7-seat wave is below the run-15 band.
  arm('band-below', () => {
    const fx = fixture('band-below', { seats: 7 });
    const r = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r.code === 1 && r.out.includes('DRIFT BAND'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 04 — a 17-seat wave is above the band.
  arm('band-above', () => {
    const fx = fixture('band-above', { seats: 17, attack: 5 });
    const r = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r.code === 1 && r.out.includes('DRIFT BAND'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 05 — 20 % attack seats is under the 25 % floor.
  arm('attack-share', () => {
    const fx = fixture('attack-share', { seats: 10, attack: 2 });
    const r = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r.code === 1 && r.out.includes('ATTACK_SHARE'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 06 — three connectors exceed the two-seat cap.
  arm('connector-cap', () => {
    const fx = fixture('connector-cap', { seats: 10, attack: 3, connector: 3 });
    const r = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r.code === 1 && r.out.includes('CONNECTOR_COUNT'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 07 — a planner seat is frozen-topology, never a swarm role.
  arm('planner-refused', () => {
    const fx = fixture('planner');
    editDispatch(fx.lane, (d) => { d.taskCall.tasks[0].agent = 'planner'; });
    const r = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r.code === 1 && r.out.includes('PLANNER_SEAT'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 08 — a per-seat model key is not a dispatch field.
  arm('model-key-refused', () => {
    const fx = fixture('model-key');
    editDispatch(fx.lane, (d) => { d.taskCall.tasks[0].model = 'm_flash'; });
    const r = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r.code === 1 && r.out.includes('ARTIFACT_KEYS'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 09 — every fresh seat leads with /skill:godspeed.
  arm('godspeed-required', () => {
    const fx = fixture('godspeed');
    editDispatch(fx.lane, (d) => { d.taskCall.tasks[0].task = d.taskCall.tasks[0].task.replace(/^\/skill:godspeed\n/, ''); });
    const r = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r.code === 1 && r.out.includes('GODSPEED'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 10 — every seat text names the lane root (seat tools start at the fleet root).
  arm('task-lane-root', () => {
    const fx = fixture('task-root');
    editDispatch(fx.lane, (d) => { d.taskCall.tasks[0].task = '/skill:godspeed\n# Target\ncorpus/lessons/round-81.md'; });
    const r = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r.code === 1 && r.out.includes('TASK_LANE_ROOT'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 11 — a lane-relative .ufo/waves path in a seat text is a misroot seed.
  arm('relative-wave-path', () => {
    const fx = fixture('rel-wave');
    editDispatch(fx.lane, (d) => { d.taskCall.tasks[1].task += '\nAlso read .ufo/waves/round-81/plan.md'; });
    const r = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r.code === 1 && r.out.includes('RELATIVE_WAVE_PATH'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 12 — the ready file carries exactly the five contract keys.
  arm('ready-keys', () => {
    const fx = fixture('ready-keys');
    editReady(fx.lane, (r) => { r.extra = 1; });
    const r2 = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r2.code === 1 && r2.out.includes('READY_KEYS'), detail: `exit=${r2.code} out=${r2.out}` };
  });

  // 13 — a dispatch path that escapes the round's wave dir is fail-closed.
  arm('dispatch-escape', () => {
    const fx = fixture('dispatch-escape');
    editReady(fx.lane, (r) => { r.dispatch = join(fx.dir, '..', '..', '..', '..', '..', 'escape.json'); });
    const r2 = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r2.code === 2 && r2.out.includes('FAIL-CLOSED DISPATCH_OUTSIDE'), detail: `exit=${r2.code} out=${r2.out}` };
  });

  // 14 — an absent dispatch is fail-closed, never a partial READY.
  arm('dispatch-absent', () => {
    const fx = fixture('dispatch-absent');
    rmSync(fx.dispatch);
    const r = run(['--lane', fx.lane, '--round', String(ROUND), '--wave', WAVE]);
    return { ok: r.code === 2 && r.out.includes('FAIL-CLOSED DISPATCH_ABSENT'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 15 — usage.
  arm('usage-64', () => {
    const r = run(['--wave', WAVE]);
    return { ok: r.code === 64 && r.out.includes('--round N is required'), detail: `exit=${r.code} out=${r.out}` };
  });

  // 16 — the tool's own suite.
  arm('selftest', () => {
    const r = run(['--selftest', '--work', join(work, 'selftest')]);
    return { ok: r.code === 0 && /READY_HANDOFF_SELFTEST: (\d+)\/\1 pass/.test(r.out), detail: `exit=${r.code} out=${r.out.split('\n').at(-2)}` };
  });

  const held = arms.filter((a) => a.ok).length;
  let toolSha = 'absent';
  try { toolSha = sha(readFileSync(tool, 'utf8')); } catch { /* base tree carries no tool */ }
  for (const a of arms) process.stdout.write(`C81_C1 arm ${a.name} ${a.ok ? 'PASS' : 'FAIL'} ${a.detail.replace(/\s+/g, ' ').slice(0, 260)}\n`);
  process.stdout.write(`C81_C1: ${held === arms.length ? 'HELD' : 'UNMET'} held=${held}/${arms.length} tool=${tool} sha=${toolSha}\n`);
  if (!opts.keep) rmSync(work, { recursive: true, force: true });
  return held === arms.length ? 0 : 1;
}

process.exit(main(process.argv.slice(2)));
