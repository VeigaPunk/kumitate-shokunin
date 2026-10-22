#!/usr/bin/env node
/**
 * wave-census.mjs — census of a round's committed swarm evidence
 * (contract `kumitate-wave-census-v1`, round 41).
 *
 * WHAT IT READS. A hyaku round commits, under `.ufo/waves/round-<N>/`, one
 * `<wave>-dispatch.json` per validated wave: the `ufo-swarm-wave-dispatch-v1`
 * envelope printed by the origin producer `scripts/ufo-swarm-wave.mjs run`
 * (`taskCall {context, tasks}`, `counts {spawn, resume, total}`, `registry`
 * = the merged `ufo-swarm-registry-v1`), or a bare `{context, tasks}` payload
 * for a residual call. Each task carries `name`, `agent` (the seat role) and a
 * `Report: … <path>.md` trailer naming the report file the seat writes.
 *
 * WHAT IT PRINTS. Per wave: seats in the payload, seats per role, attack seats
 * (reviewer, critic, mutation-tester, labrat), reports present and absent
 * (absent names listed); per round: totals.
 *
 * WHAT IT CANNOT SAY. A payload file proves validation, not dispatch: round 39
 * committed two validated payloads whose waves timed out at the seat gate and
 * never spawned. An absent report does not say why (dead at spawn, cancelled,
 * never dispatched); a present report does not say the seat was not held
 * after a safety filter. A residual call that reuses a wave's item names and
 * report paths (round 39: residual seats wrote into `falsify/`) makes those
 * reports count as present for both payloads. Those classes live in the round's prose evidence, and
 * `--expect` lets a reader assert a declared count against the payload.
 *
 * FINDINGS (exit 1):
 *   EXPECT_MISMATCH    an `--expect <wave>:<role>=<n>` does not hold.
 *   COUNT_MISMATCH     a v1 envelope's `counts.spawn` differs from its task count.
 *   REGISTRY_MISMATCH  a v1 envelope's registry member names differ from its task names.
 *   STRAY_REPORT       a `<Name>.md` in a wave's report dir that names no task of that wave.
 *   EXPECT_UNKNOWN     an `--expect` names a wave the round does not have.
 * Fail-closed (exit 2): the round dir is missing, holds no dispatch file, or a
 * dispatch file does not parse. Usage (exit 64).
 *
 * `--expect [<round>/]<wave>:<role>=<n>` (role `attack` = the attack-seat total; an unknown
 * role is EXPECT_UNKNOWN, never a vacuous zero). Resumed seats (`resumeSends`) count apart
 * as `resumed=`; a report counts as present only when it is a non-empty regular file.
 *
 * Usage: node scripts/wave-census.mjs --round N [--round M …] [--root DIR]
 *          [--expect [<round>/]<wave>:<role>=<n> …] [--json]
 *        node scripts/wave-census.mjs --selftest
 */

import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-wave-census-v1';
const SELF = fileURLToPath(import.meta.url);
const DEFAULT_ROOT = resolve(dirname(SELF), '..');
const ATTACK = new Set(['reviewer', 'critic', 'mutation-tester', 'labrat']);
const KNOWN_ROLES = new Set(['planner', 'scout', 'connector', 'sentinel', 'executor', 'revenger', 'simplifier', 'scribe', 'distiller']);
const RE_REPORT = /Report:[^\n]*?(\.ufo\/waves\/[^\s`'"]+\.md)/;
const USAGE = 'usage: node scripts/wave-census.mjs --round N [--round M ...] [--root DIR] [--expect <wave>:<role>=<n> ...] [--json] | --selftest\n';

class Usage extends Error {}
class FailClosed extends Error {}

function parseArgs(argv) {
  const o = { rounds: [], root: DEFAULT_ROOT, expects: [], json: false, selftest: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => { if (i + 1 >= argv.length) throw new Usage(`${a} needs a value`); return argv[++i]; };
    if (a === '--round') {
      const v = val();
      if (!/^\d+$/.test(v)) throw new Usage(`--round takes a decimal integer, got ${v}`);
      o.rounds.push(Number(v));
    } else if (a === '--root') o.root = resolve(val());
    else if (a === '--expect') {
      const v = val();
      const m = v.match(/^(?:(\d+)\/)?([a-z0-9-]+):([a-z-]+)=(\d+)$/);
      if (!m) throw new Usage(`--expect takes [<round>/]<wave>:<role>=<n>, got ${v}`);
      o.expects.push({ round: m[1] == null ? null : Number(m[1]), wave: m[2], role: m[3], n: Number(m[4]), raw: v });
    } else if (a === '--json') o.json = true;
    else if (a === '--selftest') o.selftest = true;
    else throw new Usage(`unknown argument: ${a}`);
  }
  if (!o.selftest && !o.rounds.length) throw new Usage('at least one --round is required');
  return o;
}

function censusRound(root, n) {
  const dir = join(root, '.ufo', 'waves', `round-${n}`);
  let st = null;
  try { st = statSync(dir); } catch { st = null; }
  if (!st || !st.isDirectory()) throw new FailClosed(`round dir ${dir} is missing`);
  const files = readdirSync(dir).filter((f) => /-dispatch\.json$/.test(f)).sort();
  if (!files.length) throw new FailClosed(`round dir ${dir} holds no *-dispatch.json`);
  const waves = [];
  const findings = [];
  for (const f of files) {
    const wave = f.replace(/-dispatch\.json$/, '');
    let d;
    try { d = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch (e) {
      throw new FailClosed(`${join(dir, f)} does not parse: ${e.message}`);
    }
    const v1 = d && d.schema === 'ufo-swarm-wave-dispatch-v1';
    // A v1 envelope's `taskCall` is null when the wave resumes only (S038, :51-52); its
    // resumed seats ride `resumeSends` (one hub send each, report suffix in `message`).
    const tc = v1 ? (d.taskCall ?? { tasks: [] }) : (d && Array.isArray(d.tasks) ? d : null);
    if (!tc || !Array.isArray(tc.tasks)) throw new FailClosed(`${join(dir, f)} carries no task list`);
    const reportOf = (text) => (String(text ?? '').match(RE_REPORT) ?? [])[1] ?? null;
    const tasks = tc.tasks.map((t) => ({ name: String(t.name), role: String(t.agent), report: reportOf(t.task) }));
    const resumes = v1 && Array.isArray(d.resumeSends)
      ? d.resumeSends.map((r) => ({ name: String(r.name), report: reportOf(r.message) })) : [];
    const roles = {};
    for (const t of tasks) roles[t.role] = (roles[t.role] ?? 0) + 1;
    const attack = tasks.filter((t) => ATTACK.has(t.role)).length;
    const present = []; const absent = [];
    const isReport = (rel) => { try { const st = lstatSync(join(root, rel)); return st.isFile() && st.size > 0; } catch { return false; } };
    for (const t of [...tasks, ...resumes]) (t.report && isReport(t.report) ? present : absent).push(t.name);
    const w = { round: n, wave, file: f, schema: v1 ? d.schema : 'bare-taskcall', seats: tasks.length, resumed: resumes.length,
      roles, attack, present: present.length, absent: absent.length, absentNames: absent };
    if (v1) {
      if (d.counts && (d.counts.spawn !== tasks.length || (d.counts.resume ?? 0) !== resumes.length)) {
        findings.push({ kind: 'COUNT_MISMATCH', round: n, wave, detail: `counts.spawn=${d.counts.spawn} tasks=${tasks.length} counts.resume=${d.counts.resume} resumeSends=${resumes.length}` });
      }
      const mem = d.registry && d.registry.members && typeof d.registry.members === 'object' ? d.registry.members : null;
      if (mem) {
        const members = Object.keys(mem).sort();
        const names = [...tasks, ...resumes].map((t) => t.name).sort();
        if (members.length !== names.length || members.some((m, i) => m !== names[i])) {
          const missing = names.filter((x) => !members.includes(x));
          const extra = members.filter((x) => !names.includes(x));
          findings.push({ kind: 'REGISTRY_MISMATCH', round: n, wave, detail: `not-in-registry=[${missing.join(',')}] not-in-tasks=[${extra.join(',')}]` });
        }
      }
    }
    const reportDirs = new Set([...tasks, ...resumes].map((t) => t.report && dirname(t.report)).filter(Boolean));
    const names = new Set([...tasks, ...resumes].map((t) => t.name));
    for (const rd of reportDirs) {
      const abs = join(root, rd);
      if (!existsSync(abs)) continue;
      for (const e of readdirSync(abs).filter((x) => x.endsWith('.md')).sort()) {
        if (!names.has(e.slice(0, -3))) findings.push({ kind: 'STRAY_REPORT', round: n, wave, detail: `${rd}/${e}` });
      }
    }
    waves.push(w);
  }
  return { round: n, waves, findings };
}

function census(opts) {
  const rounds = opts.rounds.map((n) => censusRound(opts.root, n));
  const findings = rounds.flatMap((r) => r.findings);
  for (const ex of opts.expects) {
    const all = rounds.flatMap((r) => r.waves);
    const hits = all.filter((w) => w.wave === ex.wave && (ex.round == null || w.round === ex.round));
    if (!hits.length) { findings.push({ kind: 'EXPECT_UNKNOWN', wave: ex.wave, detail: ex.raw }); continue; }
    // `attack` is the attack-seat total; any other role must be a known role name, so a
    // misspelled role can never pass as a vacuous zero.
    const known = ex.role === 'attack' || ATTACK.has(ex.role) || KNOWN_ROLES.has(ex.role) || all.some((w) => ex.role in w.roles);
    if (!known) { findings.push({ kind: 'EXPECT_UNKNOWN', wave: ex.wave, detail: `${ex.raw} (unknown role)` }); continue; }
    for (const w of hits) {
      const got = ex.role === 'attack' ? w.attack : (w.roles[ex.role] ?? 0);
      if (got !== ex.n) findings.push({ kind: 'EXPECT_MISMATCH', round: w.round, wave: w.wave, detail: `${ex.raw} payload=${got}` });
    }
  }
  return { contract: CONTRACT, root: opts.root, rounds, findings, verdict: findings.length ? 'DRIFT' : 'CLEAN' };
}

function render(rep) {
  const L = [];
  for (const r of rep.rounds) {
    let seats = 0, attack = 0, present = 0;
    for (const w of r.waves) {
      seats += w.seats + w.resumed; attack += w.attack; present += w.present;
      const roles = Object.entries(w.roles).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, v]) => `${k}=${v}`).join(' ');
      L.push(`WAVE round=${r.round} wave=${w.wave} schema=${w.schema} seats=${w.seats}${w.resumed ? ` resumed=${w.resumed}` : ''} attack=${w.attack} reports=${w.present}/${w.seats + w.resumed} roles: ${roles}`);
      if (w.absentNames.length) L.push(`  absent: ${w.absentNames.join(' ')}`);
    }
    L.push(`ROUND round=${r.round} waves=${r.waves.length} seats=${seats} attack=${attack} reports=${present}/${seats}`);
  }
  for (const f of rep.findings) L.push(`FINDING ${f.kind} round=${f.round ?? '-'} wave=${f.wave} ${f.detail}`);
  const n = rep.rounds.reduce((s, r) => s + r.waves.length, 0);
  L.push(`WAVE_CENSUS: ${rep.verdict} (rounds=${rep.rounds.length} waves=${n} findings=${rep.findings.length})`);
  return L.join('\n') + '\n';
}

/* ---------------------------------------------------------------- selftest */

function selftest() {
  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-wave-census-'));
  const results = [];
  const check = (id, name, fn) => {
    let ok = false, detail = '';
    try { const r = fn(); ok = r.ok; detail = r.detail; } catch (e) { detail = `threw: ${e.message}`; }
    results.push({ id, name, ok, detail });
  };
  const task = (round, wave, name, agent) => ({ name, agent,
    task: `item\nReport: write your scoped findings to .ufo/waves/round-${round}/${wave}/${name}.md` });
  const mkRound = (root, round, waves) => {
    const dir = join(root, '.ufo', 'waves', `round-${round}`);
    mkdirSync(dir, { recursive: true });
    for (const [wave, spec] of Object.entries(waves)) {
      const tasks = spec.tasks.map(([n, a]) => task(round, wave, n, a));
      const members = Object.fromEntries((spec.members ?? tasks.map((t) => t.name)).map((n) => [n, { kind: 'spawn', role: 'x' }]));
      const body = spec.bare ? { context: 'c', tasks }
        : { schema: 'ufo-swarm-wave-dispatch-v1', wave, counts: { spawn: spec.spawn ?? tasks.length, resume: 0, total: spec.spawn ?? tasks.length },
          registry: { schema: 'ufo-swarm-registry-v1', members }, taskCall: { context: 'c', tasks } };
      writeFileSync(join(dir, `${wave}-dispatch.json`), JSON.stringify(body));
      mkdirSync(join(dir, wave), { recursive: true });
      for (const n of spec.reports ?? []) writeFileSync(join(dir, wave, `${n}.md`), `RESULT ${n}\n`);
    }
    return root;
  };
  const run = (root, args) => {
    const r = spawnSync(process.execPath, [SELF, '--root', root, ...args], { encoding: 'utf8', timeout: 60_000 });
    return { status: r.status, out: String(r.stdout ?? ''), err: String(r.stderr ?? '') };
  };
  try {
    const good = mkRound(join(tmp, 'good'), 7, {
      build: { tasks: [['A', 'executor'], ['B', 'critic'], ['C', 'reviewer'], ['D', 'mutation-tester'], ['E', 'scout']], reports: ['A', 'B', 'C'] },
      falsify: { tasks: [['F', 'critic'], ['G', 'labrat']], reports: ['F', 'G'] },
    });
    check('WC01', 'clean round: counts, roles, attack seats, reports present/absent', () => {
      const r = run(good, ['--round', '7']);
      const ok = r.status === 0
        && /^WAVE round=7 wave=build schema=ufo-swarm-wave-dispatch-v1 seats=5 attack=3 reports=3\/5 roles: critic=1 executor=1 mutation-tester=1 reviewer=1 scout=1$/m.test(r.out)
        && /^ {2}absent: D E$/m.test(r.out)
        && /^WAVE round=7 wave=falsify .* seats=2 attack=2 reports=2\/2 /m.test(r.out)
        && /^ROUND round=7 waves=2 seats=7 attack=5 reports=5\/7$/m.test(r.out)
        && /^WAVE_CENSUS: CLEAN \(rounds=1 waves=2 findings=0\)$/m.test(r.out);
      return { ok, detail: `exit=${r.status} ${r.out.trim().split('\n').pop()}` };
    });
    check('WC02', '--expect holds → exit 0; --expect wrong count → EXPECT_MISMATCH exit 1', () => {
      const a = run(good, ['--round', '7', '--expect', 'build:mutation-tester=1']);
      const b = run(good, ['--round', '7', '--expect', 'build:mutation-tester=2']);
      return { ok: a.status === 0 && b.status === 1 && /^FINDING EXPECT_MISMATCH round=7 wave=build build:mutation-tester=2 payload=1$/m.test(b.out),
        detail: `holds=${a.status} wrong=${b.status}` };
    });
    check('WC03', '--expect of an absent role reads payload=0', () => {
      const a = run(good, ['--round', '7', '--expect', 'falsify:executor=0']);
      const b = run(good, ['--round', '7', '--expect', 'falsify:executor=1']);
      return { ok: a.status === 0 && b.status === 1, detail: `zero=${a.status} one=${b.status}` };
    });
    check('WC04', '--expect of an unknown wave → EXPECT_UNKNOWN exit 1', () => {
      const r = run(good, ['--round', '7', '--expect', 'residual:critic=1']);
      return { ok: r.status === 1 && /^FINDING EXPECT_UNKNOWN /m.test(r.out), detail: `exit=${r.status}` };
    });
    const bad = mkRound(join(tmp, 'bad'), 8, {
      build: { tasks: [['A', 'executor'], ['B', 'critic']], spawn: 3, members: ['A', 'Z'], reports: ['A', 'Q'] },
    });
    check('WC05', 'counts.spawn differs from tasks → COUNT_MISMATCH', () => {
      const r = run(bad, ['--round', '8']);
      return { ok: r.status === 1 && /^FINDING COUNT_MISMATCH round=8 wave=build counts\.spawn=3 tasks=2 counts\.resume=0 resumeSends=0$/m.test(r.out), detail: `exit=${r.status}` };
    });
    check('WC06', 'registry members differ from tasks → REGISTRY_MISMATCH', () => {
      const r = run(bad, ['--round', '8']);
      return { ok: /^FINDING REGISTRY_MISMATCH round=8 wave=build not-in-registry=\[B\] not-in-tasks=\[Z\]$/m.test(r.out), detail: `exit=${r.status}` };
    });
    check('WC07', 'report file naming no task → STRAY_REPORT', () => {
      const r = run(bad, ['--round', '8']);
      return { ok: /^FINDING STRAY_REPORT round=8 wave=build \.ufo\/waves\/round-8\/build\/Q\.md$/m.test(r.out)
        && /WAVE_CENSUS: DRIFT \(rounds=1 waves=1 findings=3\)/.test(r.out), detail: `exit=${r.status}` };
    });
    const bare = mkRound(join(tmp, 'bare'), 9, { residual: { bare: true, tasks: [['R1', 'reviewer'], ['R2', 'critic']], reports: ['R1'] } });
    check('WC08', 'bare {context,tasks} residual payload is read', () => {
      const r = run(bare, ['--round', '9']);
      return { ok: r.status === 0 && /^WAVE round=9 wave=residual schema=bare-taskcall seats=2 attack=2 reports=1\/2 /m.test(r.out), detail: `exit=${r.status}` };
    });
    check('WC09', 'missing round dir → fail-closed exit 2', () => {
      const r = run(good, ['--round', '99']);
      return { ok: r.status === 2 && /fail-closed/.test(r.err), detail: `exit=${r.status}` };
    });
    check('WC10', 'unparsable dispatch → fail-closed exit 2', () => {
      const root = join(tmp, 'broken');
      mkdirSync(join(root, '.ufo', 'waves', 'round-3'), { recursive: true });
      writeFileSync(join(root, '.ufo', 'waves', 'round-3', 'build-dispatch.json'), '{not json');
      const r = run(root, ['--round', '3']);
      return { ok: r.status === 2, detail: `exit=${r.status}` };
    });
    check('WC11', 'usage errors → exit 64 (no --round; bad --expect)', () => {
      const a = spawnSync(process.execPath, [SELF], { encoding: 'utf8' });
      const b = spawnSync(process.execPath, [SELF, '--round', '7', '--expect', 'build=1'], { encoding: 'utf8' });
      return { ok: a.status === 64 && b.status === 64, detail: `none=${a.status} badExpect=${b.status}` };
    });
    check('WC12', '--json carries verdict, waves and findings', () => {
      const r = run(bad, ['--round', '8', '--json']);
      const j = JSON.parse(r.out);
      return { ok: r.status === 1 && j.contract === CONTRACT && j.verdict === 'DRIFT' && j.findings.length === 3
        && j.rounds[0].waves[0].roles.executor === 1, detail: `exit=${r.status} verdict=${j.verdict}` };
    });
    const resumeRoot = join(tmp, 'resume');
    const rdir = join(resumeRoot, '.ufo', 'waves', 'round-5');
    mkdirSync(join(rdir, 'build'), { recursive: true });
    const rs = (name) => ({ name, resume: `0-${name}`, message: `go\nReport: write your scoped findings to .ufo/waves/round-5/build/${name}.md` });
    writeFileSync(join(rdir, 'build-dispatch.json'), JSON.stringify({ schema: 'ufo-swarm-wave-dispatch-v1', counts: { spawn: 0, resume: 1, total: 1 },
      registry: { members: { R: { kind: 'resume' } } }, taskCall: null, resumeSends: [rs('R')] }));
    writeFileSync(join(rdir, 'build', 'R.md'), 'RESULT R\n');
    writeFileSync(join(rdir, 'falsify-dispatch.json'), JSON.stringify({ schema: 'ufo-swarm-wave-dispatch-v1', counts: { spawn: 1, resume: 1, total: 2 },
      registry: { members: { S: { kind: 'spawn' }, T: { kind: 'resume' } } },
      taskCall: { context: 'c', tasks: [task(5, 'falsify', 'S', 'critic')] }, resumeSends: [{ ...rs('T'), message: 'go\nReport: write your scoped findings to .ufo/waves/round-5/falsify/T.md' }] }));
    mkdirSync(join(rdir, 'falsify', 'S.md'), { recursive: true });
    check('WC13', 'resume-only wave (taskCall null) is read: seats=0 resumed=1, report present', () => {
      const r = run(resumeRoot, ['--round', '5']);
      return { ok: /^WAVE round=5 wave=build schema=ufo-swarm-wave-dispatch-v1 seats=0 resumed=1 attack=0 reports=1\/1 /m.test(r.out), detail: `exit=${r.status}` };
    });
    check('WC14', 'mixed spawn+resume wave: no REGISTRY_MISMATCH; a directory named S.md is not a report', () => {
      const r = run(resumeRoot, ['--round', '5']);
      return { ok: r.status === 0 && /^WAVE round=5 wave=falsify .* seats=1 resumed=1 attack=1 reports=0\/2 /m.test(r.out)
        && !/REGISTRY_MISMATCH|COUNT_MISMATCH/.test(r.out), detail: `exit=${r.status}` };
    });
    check('WC15', '--expect under-declared count → EXPECT_MISMATCH', () => {
      const r = run(good, ['--round', '7', '--expect', 'build:critic=0']);
      return { ok: r.status === 1 && /EXPECT_MISMATCH .* build:critic=0 payload=1/.test(r.out), detail: `exit=${r.status}` };
    });
    check('WC16', '--expect unknown role → EXPECT_UNKNOWN; `attack` is the attack total', () => {
      const a = run(good, ['--round', '7', '--expect', 'build:mutation-testers=0']);
      const b = run(good, ['--round', '7', '--expect', 'build:attack=3']);
      const c = run(good, ['--round', '7', '--expect', 'build:attack=4']);
      return { ok: a.status === 1 && /EXPECT_UNKNOWN .*unknown role/.test(a.out) && b.status === 0 && c.status === 1,
        detail: `typo=${a.status} attack3=${b.status} attack4=${c.status}` };
    });
    check('WC17', 'round-scoped --expect: <round>/<wave> checks one round only', () => {
      const root = mkRound(join(tmp, 'two'), 1, { build: { tasks: [['X', 'critic']] } });
      mkRound(root, 2, { build: { tasks: [['Y', 'critic'], ['Z', 'critic']] } });
      const a = run(root, ['--round', '1', '--round', '2', '--expect', '1/build:critic=1']);
      const b = run(root, ['--round', '1', '--round', '2', '--expect', 'build:critic=1']);
      return { ok: a.status === 0 && b.status === 1, detail: `scoped=${a.status} unscoped=${b.status}` };
    });
    const multi = mkRound(join(tmp, 'multi'), 11, {
      build: { tasks: [['A', 'critic'], ['B', 'critic'], ['C', 'critic'], ['D', 'reviewer'], ['E', 'reviewer'], ['F', 'scout']], reports: ['A', 'B'] },
    });
    mkRound(multi, 12, { build: { tasks: [['G', 'scout']], reports: [] } });
    writeFileSync(join(multi, '.ufo', 'waves', 'round-11', 'build', 'C.md'), '');
    check('WC18', 'attack counts seats, roles count repeats, an empty report file is absent, totals stay per round', () => {
      const r = run(multi, ['--round', '11', '--round', '12']);
      return { ok: /^WAVE round=11 wave=build .* seats=6 attack=5 reports=2\/6 roles: critic=3 reviewer=2 scout=1$/m.test(r.out)
        && /^ {2}absent: C D E F$/m.test(r.out) && /^ROUND round=11 waves=1 seats=6 attack=5 reports=2\/6$/m.test(r.out)
        && /^ROUND round=12 waves=1 seats=1 attack=0 reports=0\/1$/m.test(r.out) && /^ {2}absent: G$/m.test(r.out), detail: `exit=${r.status}` };
    });
    check('WC19', 'a task with no Report: trailer is absent; a stray-only round exits 1', () => {
      const root = join(tmp, 'notrailer');
      const dir = join(root, '.ufo', 'waves', 'round-13');
      mkdirSync(join(dir, 'build'), { recursive: true });
      writeFileSync(join(dir, 'build-dispatch.json'), JSON.stringify({ context: 'c', tasks: [{ name: 'N', agent: 'critic', task: 'no trailer' }, task(13, 'build', 'M', 'critic')] }));
      writeFileSync(join(dir, 'build', 'M.md'), 'RESULT M\n');
      writeFileSync(join(dir, 'build', 'Q.md'), 'RESULT Q\n');
      const r = run(root, ['--round', '13']);
      return { ok: r.status === 1 && /reports=1\/2/.test(r.out) && /^ {2}absent: N$/m.test(r.out) && /STRAY_REPORT .*Q\.md$/m.test(r.out), detail: `exit=${r.status}` };
    });
    check('WC20', 'usage: --round abc and an unknown argument exit 64', () => {
      const a = spawnSync(process.execPath, [SELF, '--round', 'abc'], { encoding: 'utf8' });
      const b = spawnSync(process.execPath, [SELF, '--round', '7', '--bogus'], { encoding: 'utf8' });
      return { ok: a.status === 64 && b.status === 64, detail: `abc=${a.status} bogus=${b.status}` };
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  const pass = results.filter((r) => r.ok).length;
  const L = results.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.id} ${r.name} — ${r.detail}`);
  L.push(`WAVE_CENSUS_SELFTEST: ${pass}/${results.length} pass`);
  L.push(`VERDICT: ${pass === results.length ? 'PASS' : 'FAIL'}`);
  process.stdout.write(L.join('\n') + '\n');
  return pass === results.length ? 0 : 1;
}

function main() {
  let opts;
  try { opts = parseArgs(process.argv.slice(2)); } catch (e) {
    if (e instanceof Usage) { process.stderr.write(`wave-census: ${e.message}\n${USAGE}`); return 64; }
    throw e;
  }
  if (opts.selftest) return selftest();
  let rep;
  try { rep = census(opts); } catch (e) {
    if (e instanceof FailClosed) { process.stderr.write(`wave-census: fail-closed — ${e.message}\n`); return 2; }
    throw e;
  }
  process.stdout.write(opts.json ? JSON.stringify(rep, null, 2) + '\n' : render(rep));
  return rep.verdict === 'CLEAN' ? 0 : 1;
}

process.exitCode = main();
