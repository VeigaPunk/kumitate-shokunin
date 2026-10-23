#!/usr/bin/env node
/**
 * bindoracle49-probe.mjs — FROZEN counter for kumitate round 49, claim C1 (rule `B49`).
 *
 *   node .ufo/waves/round-49/probe/bindoracle49-probe.mjs <lane> <rev>
 *
 * Scores six checks over the committed bytes of <rev> (extracted with `git archive`):
 *   K1  scripts/bind-oracle.mjs exists at rev.
 *   K2  `node scripts/bind-oracle.mjs --selftest` exits 0 with `BIND_ORACLE_SELFTEST: n/m pass`, n=m>=6, `VERDICT: PASS`.
 *   K3  a live run exits 0 with `BIND_ORACLE: HELD binds=3 observed=3 absent=1`.
 *   K4  a cap-run mutant that DROPS the requested binds makes the oracle read `MISSING missing=3`, exit 1.
 *   K5  a cap-run mutant that ADDS `--bind /etc /etc` makes the oracle read `EXTRA extra=1`, exit 1.
 *   K6  a cap-run mutant that REMOVES `--tmpfs /tmp` makes the oracle read `CONTROL_VISIBLE visible=1`, exit 1.
 *
 * Predicate ORACLE_HELD = held=6/6, exit 0. Any other reading is `held=<k>/6` exit 1. A crash, an unreadable
 * extraction or a malformed oracle line is exit 2 (never a score).
 *
 * The predicate and this sentence are the plan's § C1 predicate (§ "Predicate, label ORACLE_HELD"), frozen at
 * `.ufo/waves/round-49/plan.md` before any data seat ran. The counter is an output-text oracle over the instrument
 * (recorded limit; see the plan § C1 Limits).
 */
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

const RULE = 'B49';
const [laneArg, rev, ...rest] = process.argv.slice(2);
const usage = () => {
  process.stderr.write('BINDORACLE49: USAGE node bindoracle49-probe.mjs <lane> <rev>\n');
  process.exit(64);
};
if (!laneArg || !rev || rest.length) usage();
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`BINDORACLE49: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}

const sha = (b) => createHash('sha256').update(b).digest('hex');
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', timeout: 180_000, maxBuffer: 64 << 20, ...opts });

const T = mkdtempSync(join(tmpdir(), 'b49-probe.'));
try {
  // K1 — instrument present at rev (committed bytes only).
  const k1 = sh('git', ['-C', lane, 'cat-file', '-e', `${rev}:scripts/bind-oracle.mjs`]);
  const k1ok = k1.status === 0;

  // Extract the revision.
  const tar = spawnSync('bash', ['-lc', `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`], { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`BINDORACLE49: CANNOT_EVALUATE archive rev=${rev} exit=${tar.status} ${String(tar.stderr || '').trim().split('\n').at(-1)}\n`);
    process.exit(2);
  }
  const S = join(T, 'scripts');
  const oracle = join(S, 'bind-oracle.mjs');
  const oracleSha = existsSync(oracle) ? sha(readFileSync(oracle)) : 'absent';

  const run = (file, args) => {
    if (!existsSync(file)) return { status: null, stdout: '', stderr: 'missing file' };
    return sh(process.execPath, [file, ...args], { cwd: T });
  };

  // K2 — the instrument's own suite.
  let k2ok = false; let k2say = '';
  if (k1ok) {
    const r = run(oracle, ['--selftest']);
    const m = /BIND_ORACLE_SELFTEST: (\d+)\/(\d+) pass/.exec(String(r.stdout || ''));
    const pass = m && Number(m[1]) === Number(m[2]) && Number(m[2]) >= 6 && /VERDICT: PASS/.test(String(r.stdout || ''));
    k2ok = r.status === 0 && Boolean(pass);
    k2say = `exit=${r.status} ${m ? `${m[1]}/${m[2]}` : 'no-summary'}`;
  }

  // Mutant runners: the counter owns these bytes; it never trusts a shipped mutant.
  const capSrc = existsSync(join(S, 'cap-run.mjs')) ? readFileSync(join(S, 'cap-run.mjs'), 'utf8') : '';
  const SITE_BINDS = "...o.bind.flatMap(([src, dst]) => ['--bind', src, dst]),";
  const CHDIR = "'--chdir', cwd,";
  const TMPFS = "'--tmpfs', '/tmp',";
  const mk = (name, from, to) => {
    if (!capSrc.includes(from)) return null;
    const p = join(S, name);
    writeFileSync(p, capSrc.replace(from, to));
    chmodSync(p, 0o755);
    return p;
  };
  const dropP = k1ok ? mk('cap-run.drop.mjs', SITE_BINDS, '') : null;
  const extraP = k1ok ? mk('cap-run.extra.mjs', CHDIR, `'--bind', '/etc', '/etc', ${CHDIR}`) : null;
  const tmpfsP = k1ok ? mk('cap-run.notmpfs.mjs', TMPFS, '') : null;

  const expect = (file, want, exit) => {
    if (!file) return { ok: false, say: 'mutant-unbuildable' };
    const r = run(oracle, ['--cap-run', file]);
    const out = String(r.stdout || '');
    return { ok: r.status === exit && new RegExp(want).test(out), say: `exit=${r.status} ${out.trim().split('\n')[0] || ''}` };
  };

  // K3 — live run.
  let k3ok = false; let k3say = '';
  if (k1ok) {
    const r = run(oracle, []);
    k3ok = r.status === 0 && /BIND_ORACLE: HELD binds=3 observed=3 absent=1/.test(String(r.stdout || ''));
    k3say = `exit=${r.status} ${String(r.stdout || '').trim().split('\n')[0] || ''}`;
  }

  const k4 = expect(dropP, 'BIND_ORACLE: MISSING missing=3', 1);
  const k5 = expect(extraP, 'BIND_ORACLE: EXTRA extra=1', 1);
  const k6 = expect(tmpfsP, 'BIND_ORACLE: CONTROL_VISIBLE visible=1', 1);

  const checks = [['K1', k1ok, k1ok ? 'present' : 'absent'], ['K2', k2ok, k2say], ['K3', k3ok, k3say],
    ['K4', k4.ok, k4.say], ['K5', k5.ok, k5.say], ['K6', k6.ok, k6.say]];
  const held = checks.filter(([, ok]) => ok).length;
  for (const [id, ok, say] of checks) process.stdout.write(`  ${id} ${ok ? 'PASS' : 'MISS'} ${say}\n`);
  if (held === 6) {
    process.stdout.write(`BINDORACLE49: ORACLE_HELD held=6/6 checks=6 rev=${rev} rule=${RULE} oracle_sha256=${oracleSha}\n`);
    process.exit(0);
  }
  process.stdout.write(`BINDORACLE49: ORACLE_UNMET held=${held}/6 checks=6 rev=${rev} rule=${RULE} oracle_sha256=${oracleSha}\n`);
  process.exit(1);
} catch (e) {
  process.stderr.write(`BINDORACLE49: CANNOT_EVALUATE ${e && e.message}\n`);
  process.exit(2);
} finally {
  try { rmSync(T, { recursive: true, force: true }); } catch { /* /tmp tmpfs reaps */ }
}
