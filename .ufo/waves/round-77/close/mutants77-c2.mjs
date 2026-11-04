#!/usr/bin/env node
/**
 * mutants.mjs — kill-or-survive battery for kumitate round 77, C2 journal arms
 * (seat K77MutC2). Contract:
 *
 *   node <this file> --tool scripts/spotcheck-adopt.mjs --work <dir>
 *        [--mutants <json>] [--only <id>] [--timeout-ms <n>] [--keep]
 *
 * For each frozen mutant the runner copies the tool's directory into the work
 * dir, applies ONE literal replacement (each find must occur exactly once),
 * runs `node <tool copy> --selftest` detached with a timeout, restores the
 * exact bytes, and re-runs the selftest on the restored copy. A mutant is
 * KILLED only when the pristine baseline passes, the mutated selftest fails,
 * the restored selftest passes, and the bytes are byte-identical after
 * restoration. A baseline failure is INCONCLUSIVE, never a kill.
 *
 * Prints one status line plus a JSON evidence line per mutant, then exactly
 * `MUTANTS77_C2: ALL-KILLED killed=n/n` when every mutant was killed, or the
 * survivor / not-evaluable list.
 *
 * Exit codes: 0 all killed; 1 some mutant survived or inconclusive;
 * 2 anchor problems (NO-MATCH / AMBIGUOUS); 3 baseline failure or spawn error;
 * 64 usage.
 */
import { closeSync, cpSync, mkdirSync, mkdtempSync, openSync, readFileSync, readSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const SELF = fileURLToPath(import.meta.url);
const RUNNER_DIR = dirname(SELF);
const DEFAULT_TIMEOUT_MS = 120000;
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const die = (msg, code = 64) => { console.error(`MUTANTS77_C2: USAGE ${msg}`); process.exit(code); };

const argv = process.argv.slice(2);
const argOf = (name) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : null; };
const toolArg = argOf('--tool');
const workArg = argOf('--work');
const listArg = argOf('--mutants');
const only = argOf('--only');
const timeoutArg = argOf('--timeout-ms');
const keep = argv.includes('--keep');
if (!toolArg || !workArg) die('--tool <path> --work <dir> are required [--mutants <json>] [--only <id>] [--timeout-ms <n>] [--keep]');
const TIMEOUT_MS = timeoutArg ? Number(timeoutArg) : DEFAULT_TIMEOUT_MS;
if (!Number.isInteger(TIMEOUT_MS) || TIMEOUT_MS < 1000) die(`--timeout-ms must be an integer >= 1000, got ${timeoutArg}`);

const toolPath = resolve(process.cwd(), toolArg);
let toolStat = null;
try { toolStat = statSync(toolPath); } catch { /* reported below */ }
if (!toolStat || !toolStat.isFile()) die(`--tool ${toolArg} is not a readable file (cwd=${process.cwd()})`);

const listPath = listArg ? resolve(process.cwd(), listArg) : join(RUNNER_DIR, 'mutants.json');
let muts;
try { muts = JSON.parse(readFileSync(listPath, 'utf8')); } catch (e) { die(`--mutants ${listPath} unreadable or not JSON (${e.message})`); }
if (!Array.isArray(muts?.mutants) || muts.mutants.length === 0) die(`${listPath} carries no non-empty "mutants" array`);
for (const m of muts.mutants) {
  if (!m.id || typeof m.find !== 'string' || typeof m.replace !== 'string') die(`mutant with missing id/find/replace in ${listPath}`);
}
let selected = muts.mutants;
if (only) {
  selected = muts.mutants.filter((m) => m.id === only);
  if (!selected.length) die(`--only ${only}: no such mutant id in ${listPath}`);
}

const TOOL_DIR = dirname(toolPath);
const TOOL_NAME = basename(toolPath);
const PRISTINE = readFileSync(toolPath);

let workRoot;
let ownWork = false;
if (isAbsolute(workArg) || workArg.startsWith('./') || workArg.startsWith('../')) workRoot = resolve(workArg);
else workRoot = resolve(process.cwd(), workArg);
mkdirSync(workRoot, { recursive: true });

/** Copy the tool's directory (sans VCS state) into a fresh sandbox. */
function sandbox(name) {
  const dir = join(workRoot, name);
  mkdirSync(join(dir, 'tmp'), { recursive: true });
  cpSync(TOOL_DIR, join(dir, 'scripts'), { recursive: true, filter: (p) => !['.git', '.jj'].includes(basename(p)) });
  return dir;
}

/**
 * Run `node <tool> --selftest` detached (own process group) with a hard
 * timeout; the whole group is SIGKILLed on expiry so nested children die too.
 */
function runSelftest(sandboxDir, outPrefix) {
  return new Promise((resolveRun) => {
    const outFd = openSync(`${outPrefix}.out`, 'w');
    const errFd = openSync(`${outPrefix}.err`, 'w');
    const outPath = `${outPrefix}.out`;
    const errPath = `${outPrefix}.err`;
    let timedOut = false;
    let settled = false;
    const child = spawn(process.execPath, [join(sandboxDir, 'scripts', TOOL_NAME), '--selftest'], {
      cwd: sandboxDir, detached: true, stdio: ['ignore', outFd, errFd],
      env: { ...process.env, TMPDIR: join(sandboxDir, 'tmp') },
    });
    const timer = setTimeout(() => {
      timedOut = true;
      try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch { /* already gone */ } }
    }, TIMEOUT_MS);
    const finish = (code, signal, spawnError) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { closeSync(outFd); } catch { /* fd may already be closed */ }
      try { closeSync(errFd); } catch { /* fd may already be closed */ }
      resolveRun({ code, signal, timedOut, spawnError, outPath, errPath });
    };
    child.on('error', (e) => finish(null, null, String(e)));
    child.on('close', (code, signal) => finish(code, signal, null));
  });
}

const tail = (path, n = 400) => {
  try {
    const fd = openSync(path, 'r');
    const size = 8192;
    const buf = Buffer.alloc(size);
    const bytes = readSync(fd, buf, 0, size, Math.max(0, statSync(path).size - size));
    closeSync(fd);
    return buf.toString('utf8', 0, bytes).trimEnd().slice(-n);
  } catch { return '<unreadable>'; }
};

const verdicts = [];

try {
  // ---- baseline: the unmutated tool must pass its own selftest ----
  const baseDir = sandbox('s-baseline');
  const base = await runSelftest(baseDir, join(baseDir, 'baseline'));
  const baseOut = tail(base.outPath);
  const baseOk = base.spawnError === null && !base.timedOut && base.code === 0 && /VERDICT: PASS/.test(baseOut);
  console.log(`BASELINE exit=${base.code ?? 'spawn-error'} signal=${base.signal ?? '-'} timeout=${base.timedOut} verdict=${baseOk ? 'PASS' : 'FAIL'}`);
  if (!baseOk) {
    console.log(`BASELINE_STDERR ${JSON.stringify(tail(base.errPath))}`);
    console.log('MUTANTS77_C2: BASELINE-FAILED killed=0 (inconclusive — pristine selftest does not pass)');
    process.exitCode = 3;
  } else {
    for (const m of selected) {
      const dir = sandbox(`s-${String(m.id).replace(/[^A-Za-z0-9._-]/g, '_')}`);
      const file = join(dir, 'scripts', TOOL_NAME);
      const text = readFileSync(file, 'utf8');
      const count = text.split(m.find).length - 1;
      if (count !== 1) {
        const verdict = count === 0 ? 'NO-MATCH' : 'AMBIGUOUS';
        verdicts.push({ m, verdict, count });
        console.log(`MUTANT ${m.id} ${verdict} matches=${count} arm=${m.arm ?? '?'}`);
        continue;
      }
      const mutatedBytes = Buffer.from(text.replace(m.find, m.replace), 'utf8');
      writeFileSync(file, mutatedBytes);
      const mut = await runSelftest(dir, join(dir, 'mutant'));
      writeFileSync(file, PRISTINE); // restore exact original bytes
      const res = await runSelftest(dir, join(dir, 'restored'));
      const after = readFileSync(file);
      const integrity = PRISTINE.equals(after);
      const mutFailed = mut.spawnError === null && !mut.timedOut && mut.code !== null && mut.code !== 0;
      const mutKilledByTimeout = mut.spawnError === null && mut.timedOut;
      const restoredOk = res.spawnError === null && !res.timedOut && res.code === 0 && /VERDICT: PASS/.test(tail(res.outPath));
      let verdict;
      if (mut.spawnError !== null || res.spawnError !== null) verdict = 'SPAWN-ERROR';
      else if (!integrity) verdict = 'RESTORE-BROKEN';
      else if (!restoredOk) verdict = 'RESTORE-INCONCLUSIVE';
      else if (mutFailed || mutKilledByTimeout) verdict = 'KILLED';
      else verdict = 'SURVIVED';
      verdicts.push({ m, verdict, count, mut, res, integrity });
      const detail = mutKilledByTimeout ? 'timeout' : `exit=${mut.code ?? 'spawn-error'}${mut.signal ? ` signal=${mut.signal}` : ''}`;
      console.log(`MUTANT ${m.id} ${verdict} ${detail} restored=${restoredOk ? 'pass' : 'fail'} bytes=${integrity ? 'ok' : 'BROKEN'} arm=${m.arm ?? '?'}`);
      console.log(JSON.stringify({
        id: m.id, arm: m.arm ?? null, find: m.find, replace: m.replace,
        before: hash(PRISTINE), mutated: hash(mutatedBytes), after: hash(after),
        mutant: { exit: mut.code, signal: mut.signal, timeout: mut.timedOut, spawnError: mut.spawnError },
        restored: { exit: res.code, timeout: res.timedOut, spawnError: res.spawnError },
        evidence: verdict === 'KILLED' ? undefined : { outTail: tail(mut.outPath), errTail: tail(mut.errPath) },
      }));
    }
    const killed = verdicts.filter((v) => v.verdict === 'KILLED');
    const survivors = verdicts.filter((v) => v.verdict === 'SURVIVED');
    const notEvaluable = verdicts.filter((v) => ['NO-MATCH', 'AMBIGUOUS', 'SPAWN-ERROR', 'RESTORE-BROKEN', 'RESTORE-INCONCLUSIVE'].includes(v.verdict));
    if (killed.length === selected.length) {
      console.log(`MUTANTS77_C2: ALL-KILLED killed=${killed.length}/${selected.length}`);
      process.exitCode = 0;
    } else {
      console.log(`MUTANTS77_C2: SURVIVORS killed=${killed.length}/${selected.length}`);
      for (const v of survivors) console.log(`SURVIVOR ${v.m.id} arm=${v.m.arm ?? '?'} ${v.m.defect ?? ''}`);
      for (const v of notEvaluable) console.log(`NOT-EVALUABLE ${v.m.id} ${v.verdict} arm=${v.m.arm ?? '?'}`);
      process.exitCode = notEvaluable.some((v) => ['NO-MATCH', 'AMBIGUOUS'].includes(v.verdict)) ? 2 : 1;
    }
  }
} catch (e) {
  console.error(`MUTANTS77_C2: FAIL-CLOSED ${e && e.stack ? e.stack : e}`);
  process.exitCode = 3;
} finally {
  if (!keep) rmSync(workRoot, { recursive: true, force: true });
}
