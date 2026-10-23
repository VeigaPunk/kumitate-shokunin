#!/usr/bin/env node
/**
 * bind-oracle.mjs — capability `bind-oracle` (contract `kumitate-bind-oracle-v1`, round 49).
 *
 * Proves, from INSIDE a `scripts/cap-run.mjs` child, that requested host directories are mounted — and that an
 * unrequested control directory is not — by reading the child's own mount namespace (`/proc/self/mountinfo`, the
 * file that "contains information about mounts in the process's mount namespace", S099; its fifth field is the mount
 * point). A bound directory appears as a mount point, so a dropped `--bind` cannot be reported as bound
 * (round-48 §Limits (a): the counter could not see a surgical bind drop over per-run mkdtemp dirs).
 *
 *   node scripts/bind-oracle.mjs [--cap-run <path>] [--binds <n>] [--selftest]
 *
 * Verdicts (one line on stdout):
 *   BIND_ORACLE: HELD binds=<n> observed=<n> absent=<k>                 exit 0
 *   BIND_ORACLE: MISSING missing=<n> paths=<a,b,c>                      exit 1
 *   BIND_ORACLE: CONTROL_VISIBLE visible=<n> paths=<a>                  exit 1
 *   BIND_ORACLE: EXTRA extra=<n> paths=<a>                              exit 1
 *   BIND_ORACLE: NO_CHILD reason=<why>                                  exit 2 (fail-closed: could not evaluate)
 *   BIND_ORACLE: USAGE ...                                              exit 64
 *
 * The oracle itself is an output-text instrument: it corroborates the child's own report (a child that lies is a
 * recorded limit, plan § C1 Limits (1)), never the caller's request. `absent` counts the unbound control directory
 * that the child must NOT see; `observed` counts requested directories that are mount points in the child.
 *
 * Flags: `--cap-run` points at the runner under test (default: the sibling `cap-run.mjs`); `--binds` sets the number
 * of requested directories (default 3). The selftest builds three runner mutants from the runner's source (drop the
 * request binds, add `--bind /etc /etc`, remove `--tmpfs /tmp`) and scores every arm.
 *
 * Exit map: 0 held · 1 a real defect (missing/extra/visible control) · 2 fail-closed · 64 usage.
 * Sources: S099 (proc_pid_mountinfo(5): mount namespace view, field 5 = mount point), S095 (bwrap applies mounts in
 * argument order and `--tmpfs /tmp` masks the host /tmp), S069 (cap-run's bwrap model).
 */
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-bind-oracle-v1';
const SELF = fileURLToPath(import.meta.url);
const DEFAULT_RUNNER = join(dirname(SELF), 'cap-run.mjs');
// EXTRA is judged against the PARENT's mount set: a fresh mount namespace starts as a copy of its parent's mounts,
// so a mount point the parent does not have and the oracle did not request is an unrequested bind (the host carries
// dozens of mounts of its own; a fixed allowlist would be host-specific and wrong).
const parentMounts = () => {
  let mounts = [];
  try {
    for (const line of readFileSync('/proc/self/mountinfo', 'utf8').split('\n')) {
      if (!line.trim()) continue;
      const f = line.split(' ');
      if (f.length >= 5) mounts.push(unescapePath(f[4]));
    }
  } catch { /* fail-closed below */ }
  return new Set(mounts);
};

const usage = (why) => {
  process.stderr.write(`BIND_ORACLE: USAGE ${why || ''} (contract ${CONTRACT}: [--cap-run <path>] [--binds <n>] [--selftest])\n`);
  process.exit(64);
};

const CHILD = String.raw`
const fs = require('fs');
const [mountFile, payload] = process.argv.slice(1);
const req = JSON.parse(payload);
const unesc = (s) => s.replace(/\\([0-7]{3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));
let mounts = [];
for (const line of fs.readFileSync(mountFile, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const f = line.split(' ');
  if (f.length < 5) { console.log('BIND_ORACLE_CHILD: UNPARSED ' + JSON.stringify(line.slice(0, 80))); process.exit(0); }
  mounts.push(unesc(f[4]));
}
const exists = {};
for (const p of req.paths) { try { exists[p] = fs.statSync(p).isDirectory(); } catch { exists[p] = false; } }
console.log('BIND_ORACLE_CHILD: ' + JSON.stringify({ mounts: [...new Set(mounts)], exists }));
`;

const unescapePath = (s) => s.replace(/\\([0-7]{3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));

/** Run one scoring pass. Returns { verdict, detail, exit }. */
function score({ runner, binds }) {
  const root = mkdtempSync(join(tmpdir(), 'bind-oracle.'));
  // cwd is a SEPARATE directory: cap-run always binds the cwd read-write, so a scratch dir under the cwd would be
  // visible (and its children would exist) without any request bind, and the unbound control could never be absent.
  const cwd = mkdtempSync(join(tmpdir(), 'bind-oracle-cwd.'));
  const dirs = [];
  try {
    for (let i = 0; i < binds; i += 1) {
      const d = join(root, `bind${i}`);
      mkdirSync(d);
      writeFileSync(join(d, 'sentinel'), String(i));
      dirs.push(realpathSync(d));
    }
    // the control directory lives beside the bind dirs under /tmp and is NEVER requested
    const controlPath = join(root, 'control');
    mkdirSync(controlPath);
    writeFileSync(join(controlPath, 'sentinel'), 'control');

    const payload = JSON.stringify({ paths: [...dirs, controlPath] });
    const argv = ['--mem', '256', '--tasks', '32', '--budget', '60'];
    for (const d of dirs) argv.push('--bind', d);
    argv.push('--', process.execPath, '-e', CHILD, '/proc/self/mountinfo', payload);
    const r = spawnSync(process.execPath, [runner, ...argv], { cwd, encoding: 'utf8', timeout: 180_000, maxBuffer: 8 << 20 });
    const out = String(r.stdout || '');
    const m = /BIND_ORACLE_CHILD: (\{.*\})/.exec(out) || /BIND_ORACLE_CHILD: (UNPARSED .*)/.exec(out);
    const runnerVerdict = (String(r.stderr || '').trimEnd().split('\n').at(-1) || '');
    if (!m) return { verdict: 'NO_CHILD', detail: `reason=no-child-report exit=${r.status} ${runnerVerdict}`, exit: 2 };
    if (m[1].startsWith('UNPARSED')) return { verdict: 'NO_CHILD', detail: `reason=unparsed-mountinfo ${m[1]}`, exit: 2 };
    const { mounts, exists } = JSON.parse(m[1]);
    const observed = new Set(mounts.map(unescapePath));
    const missing = dirs.filter((d) => !observed.has(d));
    if (missing.length) return { verdict: 'MISSING', detail: `missing=${missing.length} paths=${missing.map((p) => p.replace(root, 'R')).join(',')}`, exit: 1 };
    if (exists[controlPath]) return { verdict: 'CONTROL_VISIBLE', detail: `visible=1 paths=${controlPath.replace(root, 'R')}`, exit: 1 };
    const allowed = parentMounts();
    allowed.add(realpathSync(cwd));
    allowed.add(realpathSync(root));
    // cap-run passes `--dev /dev`, which recreates host device nodes as mount points the parent namespace does not
    // carry: a host path that exists and is not a directory is a base-provisioned node, never an EXTRA bind.
    for (const p of observed) {
      if (allowed.has(p)) continue;
      try { if (!statSync(p).isDirectory()) allowed.add(p); } catch { /* absent on the host: judged below */ }
    }
    const extra = [...observed].filter((p) => !allowed.has(p) && !dirs.includes(p));
    if (extra.length) return { verdict: 'EXTRA', detail: `extra=${extra.length} paths=${extra.join(',')}`, exit: 1 };
    return { verdict: 'HELD', detail: `binds=${dirs.length} observed=${dirs.filter((d) => observed.has(d)).length} absent=1`, exit: 0 };
  } catch (e) {
    return { verdict: 'NO_CHILD', detail: `reason=${String(e && e.message).split('\n')[0]}`, exit: 2 };
  } finally {
    try { rmSync(root, { recursive: true, force: true }); } catch { /* /tmp tmpfs reaps */ }
    try { rmSync(cwd, { recursive: true, force: true }); } catch { /* /tmp tmpfs reaps */ }
  }
}

function report(res) {
  process.stdout.write(`BIND_ORACLE: ${res.verdict} ${res.detail}\n`);
  process.exit(res.exit);
}

function selftest() {
  const runner = DEFAULT_RUNNER;
  const src = readFileSync(runner, 'utf8');
  const work = mkdtempSync(join(tmpdir(), 'bind-oracle-st.'));
  const results = [];
  const check = (name, got, wantExit, wantRe, why) => {
    const ok = got.exit === wantExit && wantRe.test(`${got.verdict} ${got.detail}`);
    results.push(ok);
    process.stdout.write(`  ${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` want exit=${wantExit} /${wantRe}/ got exit=${got.exit} ${got.verdict} ${got.detail}`}\n`);
  };
  const mutant = (name, from, to) => {
    const p = join(work, name);
    if (!src.includes(from)) return null;
    writeFileSync(p, src.replace(from, to));
    chmodSync(p, 0o755);
    return p;
  };
  try {
    check('A1 live 3 binds', score({ runner, binds: 3 }), 0, /^HELD binds=3 observed=3 absent=1$/, 'mechanism');
    check('A2 live 0 binds', score({ runner, binds: 0 }), 0, /^HELD binds=0 observed=0 absent=1$/, 'vacuous arm');
    const drop = mutant('cap-run.drop.mjs', "...o.bind.flatMap(([src, dst]) => ['--bind', src, dst]),", '');
    const extra = mutant('cap-run.extra.mjs', "'--chdir', cwd,", `'--bind', '/etc', '/etc', '--chdir', cwd,`);
    const notmpfs = mutant('cap-run.notmpfs.mjs', "'--tmpfs', '/tmp',", '');
    if (!drop || !extra || !notmpfs) {
      process.stdout.write('  FAIL mutant construction: the runner source lacks an expected argv fragment\n');
      results.push(false);
    } else {
      check('A3 drop-mutant', score({ runner: drop, binds: 3 }), 1, /^MISSING missing=3 /, 'a dropped request bind is detected');
      check('A4 extra-mutant', score({ runner: extra, binds: 1 }), 1, /^EXTRA extra=1 /, 'an unrequested bind is detected');
      check('A5 no-tmpfs mutant', score({ runner: notmpfs, binds: 3 }), 1, /^CONTROL_VISIBLE visible=1 /, 'an unbound control dir must be absent');
    }
    check('A6 missing runner', score({ runner: join(work, 'absent.mjs'), binds: 1 }), 2, /^NO_CHILD reason=/, 'fail-closed');
    const u = spawnSync(process.execPath, [SELF, '--nonsense'], { encoding: 'utf8' });
    const uok = u.status === 64;
    results.push(uok);
    process.stdout.write(`  ${uok ? 'PASS' : 'FAIL'} A7 usage arm${uok ? '' : ` want exit=64 got ${u.status}`}\n`);
    const pass = results.filter(Boolean).length;
    process.stdout.write(`BIND_ORACLE_SELFTEST: ${pass}/${results.length} pass\nVERDICT: ${pass === results.length ? 'PASS' : 'FAIL'}\n`);
    process.exit(pass === results.length ? 0 : 1);
  } finally {
    try { rmSync(work, { recursive: true, force: true }); } catch { /* /tmp tmpfs reaps */ }
  }
}

const args = process.argv.slice(2);
let capRun = DEFAULT_RUNNER; let binds = 3; let st = false;
for (let i = 0; i < args.length; i += 1) {
  const a = args[i];
  if (a === '--selftest') st = true;
  else if (a === '--cap-run' && args[i + 1]) { capRun = resolve(args[i + 1]); i += 1; }
  else if (a === '--binds' && args[i + 1] && /^\d+$/.test(args[i + 1])) { binds = Number(args[i + 1]); i += 1; }
  else usage(`unknown argument ${JSON.stringify(a)}`);
}
if (st) selftest();
if (!existsSync(capRun)) report({ verdict: 'NO_CHILD', detail: `reason=runner-absent path=${capRun}`, exit: 2 });
report(score({ runner: capRun, binds }));
