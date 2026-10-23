/**
 * cap-spawn.mjs — a `spawnSync`-shaped call that runs one child under `scripts/cap-run.mjs`
 * (contract `kumitate-cap-run-v2`, round 47). Imported by lane gates whose child-process sites
 * are routed through the runner; not a CLI.
 *
 *   capSpawnSync(cmd, args, { env, bind, timeout, mem, tasks, cwd, encoding, maxBuffer, input })
 *
 * - `env` is the child's COMPLETE environment (the runner passes nothing else but PATH and PWD;
 *   the caller's process.env never reaches the child). Entries whose value is undefined are dropped.
 * - `bind` lists existing absolute directories the child must see read-write (the sandbox's
 *   `/tmp` is a fresh tmpfs, so a fixture under the host `/tmp` is invisible unless bound).
 * - `timeout` (ms) becomes the runner's total `--budget`; `mem` (MiB, default 512) and `tasks`
 *   (default 64) become the scope's MemoryMax and TasksMax.
 * - The result carries spawnSync's `status`, `signal`, `stdout`, `stderr` (the child's, byte-exact:
 *   the verdict goes to a `--verdict-file`), plus `capVerdict` (the runner's verdict line).
 *   BUDGET maps to spawnSync's timeout shape (`status: null`, `signal: 'SIGTERM'`, `error.code`
 *   `ETIMEDOUT`); a missing verdict (runner usage error or crash) maps to `status: null` with
 *   `error.code` `ECAPRUN`; OOM keeps the child's exit status and is visible in `capVerdict`.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

export const CAP_RUN = join(dirname(fileURLToPath(import.meta.url)), 'cap-run.mjs');

export function capSpawnSync(cmd, args, {
  env = {}, bind = [], timeout = 60_000, mem = 512, tasks = 64, cwd, encoding = 'utf8', maxBuffer, input,
} = {}) {
  const vd = mkdtempSync(join(tmpdir(), 'cap-spawn.'));
  const vf = join(vd, 'verdict');
  const argv = [CAP_RUN, '--mem', String(mem), '--tasks', String(tasks), '--budget', String(timeout / 1000),
    '--verdict-file', vf];
  for (const d of bind) argv.push('--bind', d);
  for (const [k, v] of Object.entries(env)) if (v !== undefined) argv.push('--env', `${k}=${v}`);
  argv.push('--', cmd, ...args);
  const r = spawnSync(process.execPath, argv, {
    cwd, encoding, maxBuffer, input, timeout: timeout + 10_000,
    env: { PATH: process.env.PATH || '/usr/bin', XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR || `/run/user/${process.getuid()}` },
  });
  let capVerdict = '';
  try { capVerdict = readFileSync(vf, 'utf8').trim(); } catch { /* runner wrote no verdict */ }
  rmSync(vd, { recursive: true, force: true });
  const m = /^CAP_RUN: (EXIT|OOM|BUDGET|SIGNAL) code=\d+ /.exec(capVerdict);
  if (!m) {
    const last = String(r.stderr || '').trim().split('\n').at(-1) || '';
    const error = r.error || Object.assign(new Error(`cap-run gave no verdict (exit ${r.status}): ${last}`), { code: 'ECAPRUN' });
    return { ...r, status: null, error, capVerdict };
  }
  if (m[1] === 'BUDGET') {
    return { ...r, status: null, signal: 'SIGTERM', error: Object.assign(new Error('spawnSync ETIMEDOUT'), { code: 'ETIMEDOUT' }), capVerdict };
  }
  return { ...r, capVerdict };
}
