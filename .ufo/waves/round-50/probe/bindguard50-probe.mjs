#!/usr/bin/env node
/**
 * bindguard50-probe.mjs — FROZEN counter for kumitate round 50, claim C1 (rule `G50`).
 *
 *   node .ufo/waves/round-50/probe/bindguard50-probe.mjs <lane> <rev>
 *
 * Scores eight checks over the committed bytes of <rev> (extracted with `git archive`, never the
 * working tree):
 *   G1  scripts/cap-run.mjs exists at rev.
 *   G2  `cap-run --bind <D>` exits 64 with `CAP_RUN: USAGE` for every D in
 *       {/tmp, /tmp/, /tmp/., /, /run, /proc/self, rel, a nonexistent dir} — the round-49
 *       ScoutCapRunVisibility hole was `--bind /tmp /tmp` re-exposing host /tmp read-write after
 *       `--tmpfs /tmp`; the refusal list must now cover the whole sandbox-managed mount point.
 *   G3  a legitimate `--bind` still works: a host dir under /tmp is bound read-write AND the child's
 *       own /tmp remains a tmpfs (a file the child writes to its /tmp does not appear on the host).
 *   G4  `node scripts/cap-run.mjs --selftest` exits 0 (`CAP_RUN_SELFTEST` + `VERDICT: PASS`).
 *   G5  `node scripts/bind-oracle.mjs --selftest` exits 0 (`VERDICT: PASS`).
 *   G6  the `kumitate-gate-pins-v1` stanza in SCORECARD.md pins `pin.bind-oracle`, `pin.cap-run`,
 *       `pin.cap-spawn`, `pin.proxy-check`, `pin.counter-rerun` at the sha256 of the extracted bytes.
 *   G7  `node scripts/proxy-check.mjs --strict` exits 0 with `PROXY: MATCH` (UFO_SRC set to the live
 *       origin checkout; the scorecard stanza must be consistent at rev).
 *   G8  without any `--bind`, a child that writes a unique file to its /tmp leaves no host file —
 *       the guard must not regress ordinary tmpfs isolation.
 *
 * Predicate GUARD_HELD = held=8/8, exit 0. Any other reading is `held=<k>/8` exit 1. A crash, an
 * unreadable extraction or a malformed verdict line is exit 2 (never a score).
 *
 * The predicate and this sentence are the plan's § C1 predicate (§ "Predicate, label GUARD_HELD"),
 * frozen at `.ufo/waves/round-50/plan.md` before any data seat ran.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash, randomBytes } from 'node:crypto';

const RULE = 'G50';
const ORIGIN = '/home/vgpnk/Projects/ufo-fsd-alpha';
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('BINDGUARD50: USAGE node bindguard50-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`BINDGUARD50: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}

const sha = (b) => createHash('sha256').update(b).digest('hex');
const sh = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { encoding: 'utf8', timeout: 240_000, maxBuffer: 64 << 20, ...opts });

const T = mkdtempSync(join(tmpdir(), 'g50-probe.'));
const marker = `g50-tmpfs-${randomBytes(4).toString('hex')}`;
const hostMarker = join(tmpdir(), marker);
try {
  const k1 = sh('git', ['-C', lane, 'cat-file', '-e', `${rev}:scripts/cap-run.mjs`]).status === 0;

  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`BINDGUARD50: FAIL-CLOSED git archive ${rev} exit=${tar.status}\n`);
    process.exit(2);
  }
  const S = join(T, 'scripts');
  const caprun = join(S, 'cap-run.mjs');
  const sc = join(T, 'SCORECARD.md');
  const shas = {};
  for (const n of ['bind-oracle.mjs', 'cap-run.mjs', 'cap-spawn.mjs', 'proxy-check.mjs', 'counter-rerun.mjs']) {
    const p = join(S, n);
    shas[`pin.${n.replace(/\.mjs$/, '')}`] = existsSync(p) ? sha(readFileSync(p)) : 'absent';
  }

  const lim = ['--mem', '128', '--tasks', '16', '--budget', '20'];
  const cap = (args) => sh('node', [caprun, ...args], { cwd: T });
  const last = (r) => `${r.stderr || ''}${r.stdout || ''}`.trim().split('\n').pop() || '';

  // G2 — refusal list: the whole sandbox-managed mount point plus the legacy refusals.
  const miss = `/nonexistent-${randomBytes(4).toString('hex')}`;
  const refusals = ['/tmp', '/tmp/', '/tmp/.', '/', '/run', '/proc/self', 'rel', miss];
  const g2misses = [];
  for (const d of refusals) {
    const r = cap([...lim, '--bind', d, '--', 'true']);
    if (r.status !== 64 || !/^CAP_RUN: USAGE /.test(last(r))) g2misses.push(`${d}:exit=${r.status}`);
  }
  const g2 = { ok: g2misses.length === 0, say: g2misses.length ? g2misses.join(';') : 'refused=8/8' };

  // G3 — legitimate bind works AND child /tmp is still a tmpfs.
  const B = mkdtempSync(join(tmpdir(), 'g50-bind.'));
  writeFileSync(join(B, 'in.txt'), 'fixture');
  const childJs = `const fs=require('fs');` +
    `fs.writeFileSync(process.argv[1]+'/out.txt',fs.readFileSync(process.argv[1]+'/in.txt','utf8'));` +
    `const m=fs.readFileSync('/proc/self/mounts','utf8').split('\\n').find(l=>l.split(' ')[1]==='/tmp');` +
    `fs.writeFileSync('/tmp/${marker}','x');` +
    `console.log('TMPFS='+(m&&m.split(' ')[2]==='tmpfs'));`;
  const r3 = cap([...lim, '--bind', B, '--', 'node', '-e', childJs, B]);
  const g3a = r3.status === 0 && existsSync(join(B, 'out.txt')) &&
    (r3.stdout || '').includes('TMPFS=true') && !existsSync(hostMarker);
  const g3 = { ok: g3a, say: `exit=${r3.status} bound_rw=${existsSync(join(B, 'out.txt'))} tmpfs=${(r3.stdout || '').includes('TMPFS=true')}` };

  // G4 / G5 — both instrument suites pass at rev.
  const r4 = k1 ? sh('node', [caprun, '--selftest'], { cwd: T }) : { status: null, stdout: '', stderr: '' };
  const g4 = { ok: r4.status === 0 && /VERDICT: PASS/.test(`${r4.stdout}${r4.stderr}`),
    say: `exit=${r4.status} ${(last(r4) || '').slice(0, 60)}` };
  const oracle = join(S, 'bind-oracle.mjs');
  const r5 = existsSync(oracle) ? sh('node', [oracle, '--selftest'], { cwd: T }) : { status: null, stdout: '', stderr: '' };
  const g5 = { ok: r5.status === 0 && /VERDICT: PASS/.test(`${r5.stdout}${r5.stderr}`),
    say: `exit=${r5.status} ${(last(r5) || '').slice(0, 60)}` };

  // G6 — gate-pins stanza matches extracted bytes.
  const want = ['pin.bind-oracle', 'pin.cap-run', 'pin.cap-spawn', 'pin.proxy-check', 'pin.counter-rerun'];
  const stanza = existsSync(sc) ? readFileSync(sc, 'utf8') : '';
  const g6miss = [];
  for (const k of want) {
    const m = stanza.match(new RegExp(`^${k.replace('.', '\\.')}=([0-9a-f]{64})$`, 'm'));
    if (!m) g6miss.push(`${k}=absent`);
    else if (m[1] !== shas[k]) g6miss.push(`${k}=${m[1].slice(0, 8)}!=${shas[k].slice(0, 8)}`);
  }
  const g6 = { ok: g6miss.length === 0, say: g6miss.length ? g6miss.join(';') : 'pins=5/5' };

  // G7 — the lane's own strict proxy at rev.
  const proxy = join(S, 'proxy-check.mjs');
  const r7 = k1 && existsSync(proxy)
    ? sh('node', [proxy, '--self', T, '--strict'], { cwd: T, env: { ...process.env, UFO_SRC: ORIGIN } })
    : { status: null, stdout: '', stderr: '' };
  const g7 = { ok: r7.status === 0 && /PROXY: MATCH/.test(`${r7.stdout}${r7.stderr}`),
    say: `exit=${r7.status} ${(last(r7) || '').slice(0, 90)}` };

  // G8 — ordinary tmpfs isolation unregressed (no --bind at all).
  const r8 = cap([...lim, '--', 'node', '-e', `require('fs').writeFileSync('/tmp/${marker}','x')`]);
  const g8 = { ok: r8.status === 0 && !existsSync(hostMarker), say: `exit=${r8.status} host_marker=${existsSync(hostMarker)}` };

  const checks = [['G1', k1, k1 ? 'present' : 'absent'], ['G2', g2.ok, g2.say], ['G3', g3.ok, g3.say],
    ['G4', g4.ok, g4.say], ['G5', g5.ok, g5.say], ['G6', g6.ok, g6.say], ['G7', g7.ok, g7.say], ['G8', g8.ok, g8.say]];
  const held = checks.filter(([, ok]) => ok).length;
  for (const [id, ok, say] of checks) process.stdout.write(`  ${id} ${ok ? 'PASS' : 'MISS'} ${say}\n`);
  if (held === checks.length) {
    process.stdout.write(`BINDGUARD50: GUARD_HELD held=${held}/8 checks=8 rev=${rev} rule=${RULE} caprun_sha256=${shas['pin.cap-run']}\n`);
    process.exit(0);
  }
  process.stdout.write(`BINDGUARD50: GUARD_UNMET held=${held}/8 checks=8 rev=${rev} rule=${RULE} caprun_sha256=${shas['pin.cap-run']}\n`);
  process.exit(1);
} catch (e) {
  process.stderr.write(`BINDGUARD50: FAIL-CLOSED ${e && e.message ? e.message : e}\n`);
  process.exit(2);
} finally {
  try { rmSync(hostMarker, { force: true }); } catch { /* nothing */ }
  try { rmSync(T, { recursive: true, force: true }); } catch { /* /tmp tmpfs reaps */ }
}
