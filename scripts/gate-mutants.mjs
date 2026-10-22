#!/usr/bin/env node
/**
 * gate-mutants.mjs — run the frozen lane-gate mutant set against a measured scripts tree.
 * Contract: kumitate-gate-mutants-v2 (round 43: kill predicate K43, frozen in the round-43 plan).
 *
 * K43: a mutant is KILLED iff its run is evaluable (no timeout, no overflow, clean process group,
 * no spawn error, a parseable case summary whose total equals the control's), the selftest exits
 * with a numeric non-zero status, stdout carries the exact line `VERDICT: FAIL`, and an immediate
 * second run of the same mutated bytes meets the same conditions with the same sorted FAIL case
 * names. An evaluable run that is not killed is SURVIVED; a disagreeing second run is UNSTABLE
 * (exit-2 class). Each control is re-run after the mutants and must pass again.
 *
 * Every control and mutant gets its own temporary copy of the complete scripts/ directory.
 * Each --selftest runs with an allowlisted environment in a detached process group; a timeout kills the group.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  closeSync, constants, fstatSync, ftruncateSync, lstatSync, mkdirSync, mkdtempSync, openSync,
  readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-gate-mutants-v2';
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO = resolve(SCRIPT_DIR, '..');
const DEFAULT_JOBS = 4;
const TIMEOUT_MS = 60_000;
const OUTPUT_LIMIT = 1024 * 1024;
const MAX_TARGET_BYTES = 4 * 1024 * 1024;
const MAX_TREE_FILES = 512;
const MAX_TREE_BYTES = 32 * 1024 * 1024;
const MIN_CONTROL_CASES = Object.freeze({ 'cite-check': 75, 'wave-census': 31 });
const TARGETS = Object.freeze(['cite-check', 'wave-census']);
const SCRATCH_TMPDIR = process.env.KUMITATE_GATE_MUTANTS_TMP
  || join(homedir(), '.cache', 'kumitate-gate-mutants');

const ACTIVE_GROUPS = new Set();
const TEMP_DIRS = new Set();

function makeTempDir(prefix) {
  mkdirSync(SCRATCH_TMPDIR, { recursive: true, mode: 0o700 });
  const base = realpathSync(SCRATCH_TMPDIR);
  const baseStat = statSync(base);
  const parentStat = statSync(dirname(base));
  if (baseStat.uid !== process.getuid() || (baseStat.mode & 0o077) !== 0
    || parentStat.uid !== process.getuid() || (parentStat.mode & 0o002) !== 0) {
    throw new Error(`unsafe scratch temp parent: ${base}`);
  }
  const dir = mkdtempSync(join(base, prefix));
  const st = statSync(dir);
  if ((st.mode & 0o777) !== 0o700 || realpathSync(dir) !== dir) {
    rmSync(dir, { recursive: true, force: true });
    throw new Error(`unsafe temporary directory: ${dir}`);
  }
  TEMP_DIRS.add(dir);
  mkdirSync(join(dir, 'home'), { mode: 0o700 });
  mkdirSync(join(dir, 'work'), { mode: 0o700 });
  return dir;
}

function removeTempDir(dir) {
  try { rmSync(dir, { recursive: true, force: true }); }
  finally { TEMP_DIRS.delete(dir); }
}

function sandboxEnv(tempRoot) {
  return {
    PATH: '/usr/bin:/bin',
    HOME: join(tempRoot, 'home'),
    TMPDIR: tempRoot,
    LANG: 'C.UTF-8',
    TZ: 'UTC',
  };
}

function cleanupResources() {
  for (const pid of ACTIVE_GROUPS) {
    try { process.kill(-pid, 'SIGKILL'); } catch {}
  }
  for (const dir of TEMP_DIRS) {
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
  }
  TEMP_DIRS.clear();
}

process.once('exit', cleanupResources);
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.once(signal, () => {
    cleanupResources();
    process.kill(process.pid, signal);
  });
}
const USAGE = `usage: node scripts/gate-mutants.mjs [options]
       node scripts/gate-mutants.mjs --selftest
contract id: ${CONTRACT}

options
  --rev REV       measure scripts/ from a committed revision
  --repo DIR      repository used by --rev (default: this script's repository)
  --target NAME   run only cite-check or wave-census
  --jobs N        maximum parallel mutants (default: ${DEFAULT_JOBS})
  --list          print the frozen manifest ids
  --json          print one JSON object
  --selftest      run hermetic harness fixtures
  -h, --help      print this help

exit map: 0 all mutants killed (K43) · 1 one or more survived or drifted (passed with fewer cases than the control) · 2 setup, nomatch, crash, unstable kill, timeout, control failure (before or after the mutants) or a missing frozen id · 64 usage
temp parent: $KUMITATE_GATE_MUTANTS_TMP, else ~/.cache/kumitate-gate-mutants (owner-only, mode 0700)
`;

const MANIFEST = Object.freeze([
  { target: 'cite-check', id: 'warn-total', from: "else if (f.severity === 'warn') totals.warn++;", to: "else if (f.severity === 'warn') {}" },
  { target: 'cite-check', id: 'resolved-kind-gate', from: "if (f.kind === 'OK') totals.resolved++;", to: 'totals.resolved++;' },
  { target: 'cite-check', id: 'strict-conjunct', from: '(opts.strict && totals.warn > 0)', to: '(totals.warn > 0)' },
  { target: 'cite-check', id: 'strict-warn-arm', from: 'const drift = totals.error > 0 || (opts.strict && totals.warn > 0);', to: 'const drift = totals.error > 0;' },
  { target: 'cite-check', id: 'resolved>0', from: "totals.filesScanned > 0 && totals.resolved > 0 && !drift ? 'PASS'", to: "totals.filesScanned > 0 && !drift ? 'PASS'" },
  { target: 'cite-check', id: 'citeCheck-map', from: "citeCheck: verdict === 'PASS' ? 'CLEAN' : 'DRIFT',", to: "citeCheck: 'CLEAN'," },
  { target: 'cite-check', id: 'render-env-empty', from: "t.filesScanned === 0 ? 'empty-scan-set' :", to: "false ? 'empty-scan-set' :" },
  { target: 'cite-check', id: 'render-env-zero', from: "t.resolved === 0 ? 'zero-resolutions' : null", to: 'false ? \'zero-resolutions\' : null' },
  { target: 'cite-check', id: 'exit2-empty', from: "report.totals.filesScanned === 0 ? 'empty scan set'", to: "false ? 'empty scan set'" },
  { target: 'cite-check', id: 'exit2-zerores', from: "report.totals.resolved === 0 ? 'zero resolved citations' : null", to: 'false ? \'zero resolved citations\' : null' },
  { target: 'cite-check', id: 'exit0/1-map', from: "return report.verdict === 'PASS' ? 0 : 1;", to: 'return 0;' },
  { target: 'cite-check', id: 'parse-64', from: 'return 64;', to: 'return 0;' },
  { target: 'cite-check', id: 'suite-group-verdict', from: "verdict: failed ? 'FAIL' : 'PASS',", to: "verdict: 'PASS'," },
  { target: 'cite-check', id: 'suite-any-fail', from: "const verdict = suites.some((s) => s.verdict === 'FAIL') ? 'FAIL' : 'PASS';", to: "const verdict = 'PASS';" },
  { target: 'cite-check', id: 'suite-exit-json', from: "}, null, 2) + '\\n');\n    return verdict === 'FAIL' ? 1 : 0;", to: "}, null, 2) + '\\n');\n    return 0;" },
  { target: 'cite-check', id: 'suite-exit-text', from: "process.stdout.write(lines.join('\\n') + '\\n');\n  return verdict === 'FAIL' ? 1 : 0;", to: "process.stdout.write(lines.join('\\n') + '\\n');\n  return 0;" },
  { target: 'cite-check', id: 'guard-outer-ne-1', from: 'process.env[INJECT41] !== undefined', to: "process.env[INJECT41] !== '1'" },
  { target: 'cite-check', id: 'guard-outer-eq-undefined', from: 'process.env[INJECT41] !== undefined', to: 'process.env[INJECT41] === undefined' },

  { target: 'wave-census', id: 'repair/dotdot-guard-dropped', from: "return r && !r.split('/').includes('..') ? r : null;", to: 'return r;' },
  { target: 'wave-census', id: 'repair/string-agent-check-dropped', from: "if (tc.tasks.some((t) => !t || typeof t.name !== 'string' || typeof t.agent !== 'string')) {", to: 'if (false) {' },
  { target: 'wave-census', id: 'repair/read-error-rethrown', from: 'return 2;', to: 'throw e;' },

  { target: 'wave-census', id: 'survivor/M10-unknown-wave-zero', from: 'if (!hits.length) {', to: 'if (!hits.length && ex.n !== 0) {' },
  { target: 'wave-census', id: 'survivor/M02-wave-grammar-hyphen', from: '[a-z0-9-]+):', to: '[a-z0-9]+):' },
  { target: 'wave-census', id: 'survivor/M03-empty-count', from: '=(\\d+)$', to: '=(\\d*)$' },
  { target: 'wave-census', id: 'survivor/M04-empty-round', from: '(?:(\\d+)\\/)?', to: '(?:(\\d*)\\/)?' },
  { target: 'wave-census', id: 'survivor/M12-known-roles-arm', from: '|| KNOWN_ROLES.has(ex.role)', to: '' },
  { target: 'wave-census', id: 'survivor/M13-attack-arm', from: '|| ATTACK.has(ex.role)', to: '' },
  { target: 'wave-census', id: 'survivor/V194-check-ok-true', from: 'ok = r.ok;', to: 'ok = true;' },
  { target: 'wave-census', id: 'survivor/V382-pass-count', from: 'results.filter((r) => r.ok).length', to: 'results.length' },
  { target: 'wave-census', id: 'survivor/V385-verdict-const', from: "pass === results.length ? 'PASS' : 'FAIL'", to: "'PASS'" },
  { target: 'wave-census', id: 'survivor/V387-exit-const', from: 'return pass === results.length ? 0 : 1', to: 'return 0' },

  { target: 'wave-census', id: 'findings/F-M02', from: 'd.counts.spawn !== tasks.length', to: 'd.counts.spawn > tasks.length' },
  { target: 'wave-census', id: 'findings/F-M03', from: '(d.counts.resume ?? 0) !== resumes.length', to: '(d.counts.resume ?? 0) < resumes.length' },
  { target: 'wave-census', id: 'findings/F-M07', from: 'members.length !== names.length ||', to: '' },
  { target: 'wave-census', id: 'findings/F-M08', from: ".filter((x) => x.endsWith('.md'))", to: '' },
  { target: 'wave-census', id: 'findings/F-M11', from: 'if (!existsSync(abs)) continue;', to: '' },
  { target: 'wave-census', id: 'findings/F-M19', from: '(d.counts.resume ?? 0)', to: 'd.counts.resume' },
  { target: 'wave-census', id: 'findings/F-M20', from: ' || (d.counts.resume ?? 0) !== resumes.length', to: '' },
  { target: 'wave-census', id: 'findings/F-M21', from: 'if (mem) {', to: 'if (true) {' },
  { target: 'wave-census', id: 'findings/F-M22', from: '[...tasks, ...resumes].map((t) => t.report', to: '[...tasks].map((t) => t.report' },
  { target: 'wave-census', id: 'findings/F-M23', from: 'if (d.counts && (d.counts.spawn !== tasks.length || (d.counts.resume ?? 0) !== resumes.length)) {', to: 'if (d.counts?.spawn !== tasks.length || (d.counts.resume ?? 0) !== resumes.length) {' },

  { target: 'wave-census', id: 'exits/M22-name-half-dropped', from: "if (tc.tasks.some((t) => !t || typeof t.name !== 'string' || typeof t.agent !== 'string')) {", to: "if (tc.tasks.some((t) => !t || typeof t.agent !== 'string')) {" },
  { target: 'wave-census', id: 'exits/M19-selftest-exit-const', from: 'return pass === results.length ? 0 : 1', to: 'return 0' },
]);
const FROZEN_IDS = Object.freeze([
  'cite-check:warn-total',
  'cite-check:resolved-kind-gate',
  'cite-check:strict-conjunct',
  'cite-check:strict-warn-arm',
  'cite-check:resolved>0',
  'cite-check:citeCheck-map',
  'cite-check:render-env-empty',
  'cite-check:render-env-zero',
  'cite-check:exit2-empty',
  'cite-check:exit2-zerores',
  'cite-check:exit0/1-map',
  'cite-check:parse-64',
  'cite-check:suite-group-verdict',
  'cite-check:suite-any-fail',
  'cite-check:suite-exit-json',
  'cite-check:suite-exit-text',
  'wave-census:repair/dotdot-guard-dropped',
  'wave-census:repair/string-agent-check-dropped',
  'wave-census:repair/read-error-rethrown',
  'wave-census:survivor/M10-unknown-wave-zero',
  'wave-census:survivor/M02-wave-grammar-hyphen',
  'wave-census:survivor/M03-empty-count',
  'wave-census:survivor/M04-empty-round',
  'wave-census:survivor/M12-known-roles-arm',
  'wave-census:survivor/M13-attack-arm',
  'wave-census:survivor/V194-check-ok-true',
  'wave-census:survivor/V382-pass-count',
  'wave-census:survivor/V385-verdict-const',
  'wave-census:survivor/V387-exit-const',
  'wave-census:findings/F-M02',
  'wave-census:findings/F-M03',
  'wave-census:findings/F-M07',
  'wave-census:findings/F-M08',
  'wave-census:findings/F-M11',
  'wave-census:findings/F-M19',
  'wave-census:findings/F-M20',
  'wave-census:findings/F-M21',
  'wave-census:findings/F-M22',
  'wave-census:findings/F-M23',
  'wave-census:exits/M22-name-half-dropped',
  'wave-census:exits/M19-selftest-exit-const',
]);

function missingFrozenIds(manifest = MANIFEST) {
  const present = new Set(manifest.map((mutant) => `${mutant.target}:${mutant.id}`));
  return FROZEN_IDS.filter((id) => !present.has(id));
}

function manifestIssues(manifest = MANIFEST) {
  const ids = manifest.map((mutant) => `${mutant.target}:${mutant.id}`);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const invalid = manifest.filter((mutant) => !mutant || !TARGETS.includes(mutant.target)
    || typeof mutant.id !== 'string' || !mutant.id
    || typeof mutant.from !== 'string' || !mutant.from || mutant.from.includes('\0')
    || typeof mutant.to !== 'string' || mutant.from === mutant.to || mutant.to.includes(mutant.from));
  return { missing: missingFrozenIds(manifest), duplicates, invalid };
}

function manifestExitCode(manifest = MANIFEST) {
  const issues = manifestIssues(manifest);
  return issues.missing.length || issues.duplicates.length || issues.invalid.length ? 2 : 0;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function manifestSha256() {
  const canonical = MANIFEST.map(({ target, id, from, to }) => [target, id, from, to]);
  return sha256(Buffer.from(JSON.stringify(canonical)));
}

function formatHeader(rev, digests) {
  const targets = Object.keys(digests).map((target) => `${target}=${digests[target]}`).join(' ');
  return `GATE_MUTANTS_HEADER rev=${rev} ${targets} manifest=${manifestSha256()}`;
}

function parseArgs(argv) {
  const opts = { repo: DEFAULT_REPO, rev: null, target: null, jobs: DEFAULT_JOBS, json: false, list: false, selftest: false, help: false };
  const value = (flag, index) => {
    const found = argv[index + 1];
    if (found === undefined || found === '' || found.startsWith('--')) throw new Error(`${flag} needs a value`);
    return found;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--rev') { opts.rev = value(arg, i); i += 1; }
    else if (arg === '--repo') { opts.repo = resolve(value(arg, i)); i += 1; }
    else if (arg === '--target') { opts.target = value(arg, i); i += 1; }
    else if (arg === '--jobs') {
      const raw = value(arg, i); i += 1;
      if (!/^\d+$/.test(raw) || Number(raw) < 1 || !Number.isSafeInteger(Number(raw))) throw new Error('--jobs must be a positive safe integer');
      opts.jobs = Number(raw);
    } else if (arg === '--json') opts.json = true;
    else if (arg === '--list') opts.list = true;
    else if (arg === '--selftest') opts.selftest = true;
    else if (arg === '-h' || arg === '--help') opts.help = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  if (opts.rev?.startsWith('-')) throw new Error('--rev must not begin with a dash');
  if (opts.target && !TARGETS.includes(opts.target)) throw new Error(`unknown target: ${opts.target}`);
  if (opts.selftest && opts.list) throw new Error('--selftest and --list cannot be combined');
  return opts;
}


function appendTail(chunks, bytes, chunk) {
  const incoming = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
  if (incoming.length >= OUTPUT_LIMIT) return { chunks: [incoming.subarray(incoming.length - OUTPUT_LIMIT)], bytes: OUTPUT_LIMIT };
  let nextChunks = [...chunks, incoming];
  let nextBytes = bytes + incoming.length;
  while (nextBytes > OUTPUT_LIMIT && nextChunks.length) {
    const excess = nextBytes - OUTPUT_LIMIT;
    const first = nextChunks[0];
    if (first.length <= excess) {
      nextChunks.shift();
      nextBytes -= first.length;
    } else {
      nextChunks[0] = first.subarray(excess);
      nextBytes -= excess;
    }
  }
  return { chunks: nextChunks, bytes: nextBytes };
}

function signalGroup(pid, signal, child) {
  if (!pid) return;
  try { process.kill(-pid, signal); }
  catch (error) {
    if (error.code === 'ESRCH') return;
    try { child?.kill(signal); } catch {}
  }
}

async function groupGone(pid) {
  if (!pid) return true;
  const deadline = Date.now() + 2_000;
  while (Date.now() <= deadline) {
    try { process.kill(-pid, 0); }
    catch (error) { if (error.code === 'ESRCH') return true; return false; }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 20));
  }
  return false;
}

function processLimitForCurrentUid() {
  const uid = process.getuid();
  let current = 0;
  for (const entry of readdirSync('/proc')) {
    if (!/^\d+$/.test(entry)) continue;
    try {
      if (statSync(join('/proc', entry)).uid === uid) current += readdirSync(join('/proc', entry, 'task')).length;
    } catch {}
  }
  const limits = readFileSync('/proc/self/limits', 'utf8').match(/^Max processes\s+(\S+)\s+(\S+)/m);
  const soft = limits?.[1] === 'unlimited' ? Number.POSITIVE_INFINITY : Number(limits?.[1] ?? 0);
  return Math.max(1, Math.min(current + 256, soft));
}

function groupStats(pgid) {
  let processes = 0, rssKb = 0;
  for (const entry of readdirSync('/proc')) {
    if (!/^\d+$/.test(entry)) continue;
    try {
      const stat = readFileSync(join('/proc', entry, 'stat'), 'utf8');
      const end = stat.lastIndexOf(')');
      if (end < 0 || Number(stat.slice(end + 2).split(' ')[2]) !== pgid) continue;
      processes += 1;
      const status = readFileSync(join('/proc', entry, 'status'), 'utf8');
      const rss = status.match(/^VmRSS:\s+(\d+)\s+kB$/m);
      if (rss) rssKb += Number(rss[1]);
    } catch {}
  }
  return { processes, rssKb };
}

function runSelftestFile(file, tempRoot, { timeoutMs = TIMEOUT_MS } = {}) {
  return new Promise((resolveRun) => {
    let timedOut = false;
    let overflow = false;
    let spawnError = null;
    let outTotal = 0, errTotal = 0;
    let outChunks = [], outBytes = 0, errChunks = [], errBytes = 0;
    const limit = Math.min(TIMEOUT_MS, Math.max(1, timeoutMs));
    const child = spawn('/usr/bin/prlimit', [
      `--nproc=${processLimitForCurrentUid()}`, '--', process.execPath,
      '--max-old-space-size=128', file, '--selftest',
    ], {
      cwd: join(tempRoot, 'work'),
      env: sandboxEnv(tempRoot),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const pid = child.pid;
    if (pid) ACTIVE_GROUPS.add(pid);
    const timer = setTimeout(() => {
      timedOut = true;
      signalGroup(pid, 'SIGKILL', child);
    }, limit);
    timer.unref();
    const resourceTimer = setInterval(() => {
      const usage = groupStats(pid);
      if (usage.processes > 16 || usage.rssKb > 512 * 1024) {
        overflow = true;
        signalGroup(pid, 'SIGKILL', child);
      }
    }, 100);
    resourceTimer.unref();
    child.stdout.on('data', (chunk) => {
      outTotal += chunk.length;
      if (outTotal > OUTPUT_LIMIT) overflow = true;
      const kept = appendTail(outChunks, outBytes, chunk);
      outChunks = kept.chunks; outBytes = kept.bytes;
    });
    child.stderr.on('data', (chunk) => {
      errTotal += chunk.length;
      if (errTotal > OUTPUT_LIMIT) overflow = true;
      const kept = appendTail(errChunks, errBytes, chunk);
      errChunks = kept.chunks; errBytes = kept.bytes;
    });
    child.on('error', (error) => { spawnError = error; });
    child.on('close', async (status, signal) => {
      clearInterval(resourceTimer);
      signalGroup(pid, 'SIGKILL', child);
      const clean = await groupGone(pid);
      if (clean) ACTIVE_GROUPS.delete(pid);
      const stdout = Buffer.concat(outChunks).toString('utf8');
      resolveRun({
        status,
        signal,
        timedOut,
        overflow,
        spawnError: spawnError?.message ?? null,
        groupClean: clean,
        failLines: countFailLines(stdout),
        stdout,
        stderr: Buffer.concat(errChunks).toString('utf8'),
      });
    });
  });
}

function hasLine(text, line) {
  return new RegExp(`(?:^|\\r?\\n)${line}(?:\\r?\\n|$)`).test(text);
}

function parseCaseCount(text) {
  const tallies = [...text.matchAll(/^(?:[A-Z][A-Z0-9_]*: )?(\d+)\/(\d+) (?:pass|cases passed)\b/gm)];
  if (!tallies.length) return null;
  return {
    passed: tallies.reduce((sum, match) => sum + Number(match[1]), 0),
    total: tallies.reduce((sum, match) => sum + Number(match[2]), 0),
  };
}

function countText(cases) {
  return cases ? `${cases.passed}/${cases.total}` : 'not-run/not-run';
}

function countFailLines(text) {
  return text.split('\n').filter((line) => line.startsWith('FAIL ')).length;
}

/** Sorted FAIL case names (text before the ` — ` detail separator), for the K43 confirmation run. */
function failNames(text) {
  return text.split('\n').filter((line) => line.startsWith('FAIL '))
    .map((line) => line.split(' — ')[0].trimEnd()).sort().join('\n');
}

function detailFor(run, timeoutMs = TIMEOUT_MS) {
  if (run.timedOut) return `timeout=${timeoutMs}ms group_clean=${run.groupClean}`;
  const exit = run.status === null ? `signal:${run.signal ?? 'unknown'}` : `exit=${run.status}`;
  const verdict = hasLine(run.stdout, 'VERDICT: PASS') ? 'PASS'
    : hasLine(run.stdout, 'VERDICT: FAIL') ? 'FAIL' : 'none';
  const suffix = run.spawnError ? ` spawn_error=${run.spawnError}` : '';
  return `${exit} verdict=${verdict} group_clean=${run.groupClean} fail_lines=${run.failLines} overflow=${run.overflow}${suffix}`;
}

function evaluable(run, cases, controlTotal) {
  return !run.timedOut && !run.overflow && run.groupClean && !run.spawnError
    && cases !== null && cases.total === controlTotal;
}

function killedOnce(run, cases, controlTotal) {
  return evaluable(run, cases, controlTotal) && typeof run.status === 'number' && run.status !== 0
    && hasLine(run.stdout, 'VERDICT: FAIL');
}

function classifyMutant(run, cases, controlTotal) {
  if (run.timedOut) return 'timeout';
  if (run.overflow) return 'overflow';
  if (!run.groupClean || run.spawnError || !cases) return 'crash';
  if (cases.total !== controlTotal) return 'drift';
  return killedOnce(run, cases, controlTotal) ? 'killed' : 'survived';
}

/** K43 (d): the second run must also kill, with the same sorted FAIL case names. */
function confirmKill(first, second, controlTotal) {
  const cases = parseCaseCount(second.stdout);
  return killedOnce(second, cases, controlTotal) && failNames(second.stdout) === failNames(first.stdout);
}

function evaluatedDrift(run, cases, controlTotal) {
  return !run.timedOut && !run.overflow && run.groupClean && !run.spawnError
    && run.status === 0 && hasLine(run.stdout, 'VERDICT: PASS') && run.failLines === 0
    && cases !== null && cases.total < controlTotal && cases.passed === cases.total;
}

function controlPass(run, cases, target) {
  const floor = MIN_CONTROL_CASES[target] ?? 0;
  return !run.timedOut && !run.overflow && run.groupClean && !run.spawnError
    && run.status === 0 && hasLine(run.stdout, 'VERDICT: PASS') && cases !== null
    && cases.passed === cases.total && cases.total >= floor && run.failLines === 0;
}

function gateExitCode({ controls, results, integrityFailures = 0, leftovers = 0, mutantTotal, targetCount, frozenKilled }) {
  const controlFailure = [...controls.values()].some((control) => !control.pass);
  const invalid = results.some((result) => ['nomatch', 'crash', 'unstable', 'timeout', 'overflow'].includes(result.state)
    || (result.state === 'drift' && !result.driftNonKill));
  if (controlFailure || invalid || integrityFailures || leftovers) return 2;
  if (results.some((result) => result.state === 'survived' || result.driftNonKill)) return 1;
  const killed = results.filter((result) => result.state === 'killed').length;
  return results.length === mutantTotal && killed === mutantTotal
    && targetCount === TARGETS.length && frozenKilled === FROZEN_IDS.length ? 0 : 2;
}

function inside(root, path) {
  const rel = relative(root, path);
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

function readSafeFile(path, root, maxBytes = MAX_TARGET_BYTES) {
  const rootReal = realpathSync(root);
  const before = lstatSync(path);
  if (!before.isFile() || before.nlink !== 1 || before.size > maxBytes) throw new Error(`unsafe target file: ${path}`);
  const real = realpathSync(path);
  if (!inside(rootReal, real)) throw new Error(`target escapes temp root: ${path}`);
  const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const current = fstatSync(fd);
    if (!current.isFile() || current.nlink !== 1 || current.size > maxBytes
      || current.dev !== before.dev || current.ino !== before.ino) throw new Error(`target changed while opening: ${path}`);
    return readFileSync(fd);
  } finally { closeSync(fd); }
}

function writeSafeFile(path, root, bytes) {
  const original = readSafeFile(path, root);
  const before = lstatSync(path);
  const real = realpathSync(path);
  const rootReal = realpathSync(root);
  if (!inside(rootReal, real) || !before.isFile() || before.nlink !== 1) throw new Error(`unsafe target write: ${path}`);
  const fd = openSync(path, constants.O_WRONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const current = fstatSync(fd);
    if (!current.isFile() || current.nlink !== 1 || current.dev !== before.dev || current.ino !== before.ino) {
      throw new Error(`target changed before write: ${path}`);
    }
    ftruncateSync(fd, 0);
    writeFileSync(fd, bytes);
  } finally { closeSync(fd); }
  return original;
}

function countOccurrences(text, literal) {
  if (literal === '') return 0;
  return text.split(literal).length - 1;
}

function applyLiteral(text, from, to) {
  const occurrences = countOccurrences(text, from);
  return occurrences === 1
    ? { ok: true, occurrences, text: text.replace(from, to) }
    : { ok: false, occurrences, text: null };
}

function scriptFiles(root) {
  const rootReal = realpathSync(root);
  if (!lstatSync(root).isDirectory()) throw new Error(`scripts root is not a regular directory: ${root}`);
  const files = [];
  let totalBytes = 0;
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      const st = lstatSync(path);
      if (entry.isSymbolicLink() || (!entry.isDirectory() && !entry.isFile())) {
        throw new Error(`scripts tree contains a non-regular entry: ${path}`);
      }
      if (!inside(rootReal, realpathSync(path))) throw new Error(`scripts entry escapes its root: ${path}`);
      if (entry.isDirectory()) { visit(path); continue; }
      if (!st.isFile() || st.nlink !== 1 || st.size > MAX_TARGET_BYTES) throw new Error(`scripts file is not a bounded regular file: ${path}`);
      files.push({ path, relative: relative(root, path), mode: st.mode & 0o111 ? 0o755 : 0o644, size: st.size });
      totalBytes += st.size;
      if (files.length > MAX_TREE_FILES || totalBytes > MAX_TREE_BYTES) throw new Error('scripts tree exceeds file or byte limit');
    }
  };
  visit(root);
  return files;
}

function copyScriptTree(sourceScripts, destination) {
  const entries = scriptFiles(sourceScripts);
  mkdirSync(destination, { mode: 0o700 });
  for (const entry of entries) {
    const path = join(destination, entry.relative);
    if (!inside(destination, resolve(path))) throw new Error(`scripts entry escapes destination: ${entry.relative}`);
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    const bytes = readSafeFile(entry.path, sourceScripts);
    writeFileSync(path, bytes, { flag: 'wx', mode: entry.mode });
  }
}

function copyScripts(sourceScripts, prefix) {
  const tempRoot = makeTempDir(prefix);
  const scripts = join(tempRoot, 'scripts');
  try { copyScriptTree(sourceScripts, scripts); }
  catch (error) { removeTempDir(tempRoot); throw error; }
  return { tempRoot, scripts };
}

async function runControl(sourceScripts, target, options = {}) {
  const copied = copyScripts(sourceScripts, 'kumitate-gate-control-');
  try {
    const file = join(copied.scripts, `${target}.mjs`);
    let bytes;
    try { bytes = readSafeFile(file, copied.tempRoot); }
    catch (error) { return { pass: false, state: 'FAIL', cases: null, groupClean: true, detail: `unsafe control target: ${error.message}` }; }
    const run = await runSelftestFile(file, copied.tempRoot, options);
    const cases = parseCaseCount(run.stdout);
    const pass = controlPass(run, cases, target);
    return {
      pass,
      state: pass ? 'PASS' : 'FAIL',
      cases,
      groupClean: run.groupClean,
      detail: `${detailFor(run, options.timeoutMs ?? TIMEOUT_MS)} cases=${countText(cases)} floor=${MIN_CONTROL_CASES[target] ?? 0}`,
      digest: sha256(bytes),
    };
  } finally { removeTempDir(copied.tempRoot); }
}

async function runMutant(sourceScripts, mutant, controlTotal, timeoutMs = TIMEOUT_MS) {
  const copied = copyScripts(sourceScripts, 'kumitate-gate-mutant-');
  try {
    const file = join(copied.scripts, `${mutant.target}.mjs`);
    let original;
    try { original = readSafeFile(file, copied.tempRoot); }
    catch (error) {
      return { ...mutant, state: 'nomatch', detail: `unsafe target: ${error.message}`, digest: null, cases: null, controlTotal, failLines: 0, groupClean: true };
    }
    const applied = applyLiteral(original.toString('utf8'), mutant.from, mutant.to);
    if (!applied.ok) {
      return { ...mutant, state: 'nomatch', detail: `occurrences=${applied.occurrences}`, digest: null, cases: null, controlTotal, failLines: 0, groupClean: true };
    }
    const mutated = Buffer.from(applied.text, 'utf8');
    try { writeSafeFile(file, copied.tempRoot, mutated); }
    catch (error) {
      return { ...mutant, state: 'nomatch', detail: `unsafe mutation target: ${error.message}`, digest: null, cases: null, controlTotal, failLines: 0, groupClean: true };
    }
    const digest = sha256(mutated);
    const run = await runSelftestFile(file, copied.tempRoot, { timeoutMs });
    const cases = parseCaseCount(run.stdout);
    let state = classifyMutant(run, cases, controlTotal);
    let confirm = '';
    if (state === 'killed') {
      const again = await runSelftestFile(file, copied.tempRoot, { timeoutMs });
      const agreed = confirmKill(run, again, controlTotal);
      confirm = ` confirm=${agreed ? 'same' : 'differs'}`;
      if (!agreed) state = 'unstable';
    }
    try {
      if (sha256(readSafeFile(file, copied.tempRoot)) !== digest) state = 'crash';
    } catch { state = 'crash'; }
    const driftNonKill = state === 'drift' && evaluatedDrift(run, cases, controlTotal);
    return {
      ...mutant,
      state,
      driftNonKill,
      detail: `${detailFor(run, timeoutMs)}${confirm}`,
      digest,
      cases,
      controlTotal,
      failLines: run.failLines,
      groupClean: run.groupClean,
    };
  } finally { removeTempDir(copied.tempRoot); }
}


function gitRun(repo, args, tempRoot, maxBuffer = MAX_TREE_BYTES + 1024 * 1024) {
  const result = spawnSync('/usr/bin/git', ['-C', repo, ...args], {
    cwd: join(tempRoot, 'work'),
    env: sandboxEnv(tempRoot),
    encoding: null,
    maxBuffer,
  });
  if (result.error || result.status !== 0) {
    const why = result.error ? result.error.message : String(result.stderr ?? '').toString('utf8').trim();
    throw new Error(`git ${args[0]} failed: ${why}`);
  }
  return result.stdout;
}

function writeTreeFile(root, path, bytes, mode) {
  const target = resolve(root, path);
  if (!inside(root, target)) throw new Error(`git tree path escapes scripts/: ${path}`);
  mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
  writeFileSync(target, bytes, { flag: 'wx', mode });
}

function loadRevisionScripts(repo, rev, tempRoot, scripts) {
  const resolved = gitRun(repo, ['rev-parse', '--verify', '--end-of-options', `${rev}^{commit}`], tempRoot, 4096)
    .toString('utf8').trim();
  if (!/^[0-9a-f]{40}$/.test(resolved)) throw new Error(`revision did not resolve to a full 40-hex commit: ${resolved}`);
  const tree = gitRun(repo, ['ls-tree', '-r', '-z', '--full-tree', resolved, '--', 'scripts'], tempRoot, 2 * 1024 * 1024);
  mkdirSync(scripts, { mode: 0o700 });
  let fileCount = 0;
  let totalBytes = 0;
  for (const record of tree.toString('utf8').split('\0')) {
    if (!record) continue;
    const tab = record.indexOf('\t');
    if (tab < 0) throw new Error('git ls-tree returned a malformed record');
    const [mode, type, oid] = record.slice(0, tab).split(' ');
    const fullPath = record.slice(tab + 1);
    if (!fullPath.startsWith('scripts/') || !['100644', '100755'].includes(mode) || type !== 'blob' || !/^[0-9a-f]{40}$/.test(oid ?? '')) {
      throw new Error(`unsupported git tree entry: ${fullPath}`);
    }
    const path = fullPath.slice('scripts/'.length);
    if (!path || path.split('/').some((part) => part === '' || part === '.' || part === '..')) {
      throw new Error(`invalid git tree path: ${fullPath}`);
    }
    fileCount += 1;
    if (fileCount > MAX_TREE_FILES) throw new Error(`scripts tree exceeds ${MAX_TREE_FILES} files`);
    const blob = gitRun(repo, ['show', '--no-ext-diff', '--no-textconv', `${resolved}:${fullPath}`], tempRoot, MAX_TARGET_BYTES + 1);
    if (blob.length > MAX_TARGET_BYTES) throw new Error(`scripts file exceeds ${MAX_TARGET_BYTES} bytes: ${fullPath}`);
    totalBytes += blob.length;
    if (totalBytes > MAX_TREE_BYTES) throw new Error(`scripts tree exceeds ${MAX_TREE_BYTES} bytes`);
    writeTreeFile(scripts, path, blob, mode === '100755' ? 0o755 : 0o644);
  }
  if (fileCount === 0) throw new Error('revision contains no scripts/ files');
  return resolved;
}

function prepareSource(opts) {
  const tempRoot = makeTempDir('kumitate-gate-source-');
  const scripts = join(tempRoot, 'scripts');
  try {
    const liveDigests = {};
    for (const target of TARGETS) {
      const liveFile = join(opts.repo, 'scripts', `${target}.mjs`);
      liveDigests[target] = sha256(readSafeFile(liveFile, opts.repo));
    }
    const rev = opts.rev ? loadRevisionScripts(opts.repo, opts.rev, tempRoot, scripts) : 'working-copy';
    if (!opts.rev) copyScriptTree(join(opts.repo, 'scripts'), scripts);
    return { tempRoot, scripts, rev, liveDigests, repo: opts.repo };
  } catch (error) {
    removeTempDir(tempRoot);
    throw error;
  }
}

async function mapBounded(items, jobs, fn, onResult = null) {
  const results = new Array(items.length);
  let cursor = 0;
  const worker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      const result = await fn(items[index]);
      results[index] = result;
      onResult?.(result);
    }
  };
  await Promise.all(Array.from({ length: Math.min(jobs, items.length) }, worker));
  return results;
}

function mutantText(result) {
  const cases = result.cases ? `${result.cases.passed}/${result.cases.total}` : 'not-run/not-run';
  return `MUTANT ${result.target}:${result.id} ${result.state} cases=${cases} control=${result.controlTotal ?? 'n/a'} fail_lines=${result.failLines ?? 0} ${result.detail}`;
}

function controlText(target, control) {
  return `CONTROL ${target} ${control.state} ${control.detail}`;
}

function reportText(header, controls, results, verdict, exitCode, meta, rowsPrinted = false) {
  const lines = rowsPrinted ? [] : [header];
  if (!rowsPrinted) {
    for (const [target, control] of controls) lines.push(controlText(target, control));
    for (const result of results) lines.push(mutantText(result));
  }
  const counts = Object.fromEntries(['killed', 'survived', 'drift', 'nomatch', 'crash', 'unstable', 'timeout', 'overflow'].map((state) => [state, results.filter((r) => r.state === state).length]));
  const summary = `(mutants=${results.length} killed=${counts.killed} frozen=${meta.frozenKilled}/41 drift=${counts.drift} targets=${meta.targets} rev=${meta.rev} manifest=${meta.manifest} leftovers=${meta.leftovers})`;
  if (exitCode === 0) lines.push(`GATE_MUTANTS: CLEAN ${summary}`);
  else if (exitCode === 1) lines.push(`GATE_MUTANTS: SURVIVED ${summary}`);
  else lines.push(`GATE_MUTANTS: ERROR ${summary} drift=${counts.drift} nomatch=${counts.nomatch} crash=${counts.crash} unstable=${counts.unstable} timeout=${counts.timeout} overflow=${counts.overflow} control-fail=${[...controls.values()].filter((c) => !c.pass).length}`);
  if (meta.missing.length) lines.push(`MISSING_FROZEN ${meta.missing.join(' ')}`);
  if (meta.integrity.length) lines.push(`INTEGRITY_FAIL ${meta.integrity.join(' ')}`);
  return lines.join('\n') + '\n';
}

function reportJson(header, controls, results, verdict, exitCode, meta) {
  const counts = Object.fromEntries(['killed', 'survived', 'drift', 'nomatch', 'crash', 'unstable', 'timeout', 'overflow'].map((state) => [state, results.filter((r) => r.state === state).length]));
  return `${JSON.stringify({
    schema: CONTRACT,
    header,
    verdict,
    exitCode,
    counts,
    summary: { mutants: results.length, killed: counts.killed, drift: counts.drift, frozenKilled: meta.frozenKilled, frozenTotal: FROZEN_IDS.length, targets: meta.targets, rev: meta.rev, manifest: meta.manifest, leftovers: meta.leftovers, missingFrozen: meta.missing, integrityFailures: meta.integrity },
    controls: Object.fromEntries(controls),
    mutants: results.map(({ target, id, state, driftNonKill, detail, digest, cases, controlTotal, failLines, groupClean }) => ({ target, id, state, driftNonKill, detail, digest, cases, controlTotal, failLines, groupClean })),
  }, null, 2)}\n`;
}


function selftestTargetSource() {
  return `#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const sibling = readFileSync(new URL('./fixture-helper.mjs', import.meta.url), 'utf8');
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const keys = Object.keys(process.env).sort().join('|');
const envOk = keys === 'HOME|LANG|PATH|TMPDIR|TZ'
  && process.env.PATH === '/usr/bin:/bin'
  && process.env.LANG === 'C.UTF-8'
  && process.env.TZ === 'UTC'
  && process.env.TMPDIR === root
  && process.env.HOME === join(root, 'home')
  && process.cwd() === join(root, 'work');
if (process.env.GIT_DIR) {
  spawnSync('/usr/bin/git', ['-c', 'user.name=Sentinel', '-c', 'user.email=sentinel@example.test',
    'commit', '--allow-empty', '-m', 'unsafe child commit'], { stdio: 'ignore' });
}
const MODE = 'pass';
const TRIPWIRE = false;
const UNUSED = 0;
const CASE_TOTAL = 1;
if (!sibling.includes('fixture-sibling-ok') || !envOk) {
  process.stdout.write('VERDICT: FAIL\\n'); process.exit(1);
}
if (MODE === 'crash') process.exit(23);
if (MODE === 'timeout') {
  spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
  setInterval(() => {}, 1000);
}
const failed = TRIPWIRE || MODE === 'control-fail' || MODE === 'verdict-fail-exit0';
const passed = failed ? CASE_TOTAL - 1 : CASE_TOTAL;
process.stdout.write(String(passed) + '/' + String(CASE_TOTAL) + ' cases passed (fixture)\\n');
if (failed) {
  process.stdout.write('FAIL  FIXTURE assertion failed\\n');
  process.stdout.write('VERDICT: FAIL\\n');
  process.exit(MODE === 'verdict-fail-exit0' ? 0 : 1);
}
if (UNUSED < 0) process.exit(24);
process.stdout.write('VERDICT: PASS\\n');
`;
}


async function runSelftest() {
  const tempRoot = makeTempDir('kumitate-gate-selftest-');
  const sourceScripts = join(tempRoot, 'source', 'scripts');
  mkdirSync(sourceScripts, { recursive: true, mode: 0o700 });
  const targetPath = join(sourceScripts, 'fixture.mjs');
  const helperPath = join(sourceScripts, 'fixture-helper.mjs');
  writeFileSync(targetPath, selftestTargetSource());
  writeFileSync(helperPath, "export const marker = 'fixture-sibling-ok';\n");
  const tests = [];
  const check = (id, ok, detail) => tests.push({ id, ok: Boolean(ok), detail });
  try {
    const control = await runControl(sourceScripts, 'fixture');
    const controlTotal = control.cases?.total ?? null;
    check('copied-siblings-and-allowlisted-env', control.pass, control.detail);

    const killed = await runMutant(sourceScripts, {
      target: 'fixture', id: 'tripwire', from: 'const TRIPWIRE = false;', to: 'const TRIPWIRE = true;',
    }, controlTotal);
    check('killed-requires-failing-case', killed.state === 'killed' && killed.failLines > 0, `${killed.state} ${killed.detail}`);

    const exitZeroFail = await runMutant(sourceScripts, {
      target: 'fixture', id: 'exit-zero-verdict-fail', from: "const MODE = 'pass';", to: "const MODE = 'verdict-fail-exit0';",
    }, controlTotal);
    check('k43-exit-zero-with-verdict-fail-is-survived', exitZeroFail.state === 'survived' && exitZeroFail.failLines > 0
      && exitZeroFail.detail.includes('exit=0'), `${exitZeroFail.state} ${exitZeroFail.detail}`);
    check('k43-kill-confirmed-by-second-run', killed.detail.includes('confirm=same'), killed.detail);

    const survived = await runMutant(sourceScripts, {
      target: 'fixture', id: 'survivor', from: 'const UNUSED = 0;', to: 'const UNUSED = 1;',
    }, controlTotal);
    check('survived', survived.state === 'survived', `${survived.state} ${survived.detail}`);

    const drift = await runMutant(sourceScripts, {
      target: 'fixture', id: 'case-count-drift', from: 'const CASE_TOTAL = 1;', to: 'const CASE_TOTAL = 0;',
    }, controlTotal);
    check('pass-with-fewer-cases-is-drift-not-kill', drift.state === 'drift' && drift.driftNonKill
      && drift.cases?.total === 0 && drift.controlTotal === 1, `${drift.state} ${drift.detail}`);
    const higherDrift = await runMutant(sourceScripts, {
      target: 'fixture', id: 'higher-case-count-drift', from: 'const CASE_TOTAL = 1;', to: 'const CASE_TOTAL = 2;',
    }, controlTotal);
    check('higher-case-count-mismatch-is-not-survived', higherDrift.state === 'drift' && !higherDrift.driftNonKill, `${higherDrift.state} ${higherDrift.detail}`);

    const nomatch = await runMutant(sourceScripts, {
      target: 'fixture', id: 'nomatch', from: 'const ABSENT = 0;', to: 'const ABSENT = 1;',
    }, controlTotal);
    check('nomatch', nomatch.state === 'nomatch', `${nomatch.state} ${nomatch.detail}`);

    const crashed = await runMutant(sourceScripts, {
      target: 'fixture', id: 'crash', from: "const MODE = 'pass';", to: "const MODE = 'crash';",
    }, controlTotal);
    check('crash-without-summary', crashed.state === 'crash', `${crashed.state} ${crashed.detail}`);

    const timed = await runMutant(sourceScripts, {
      target: 'fixture', id: 'timeout', from: "const MODE = 'pass';", to: "const MODE = 'timeout';",
    }, controlTotal, 100);
    check('timeout-and-process-group-cleanup', timed.state === 'timeout' && timed.groupClean, `${timed.state} ${timed.detail}`);

    const failingScripts = join(tempRoot, 'failing-source', 'scripts');
    mkdirSync(failingScripts, { recursive: true, mode: 0o700 });
    writeFileSync(join(failingScripts, 'fixture.mjs'), selftestTargetSource().replace("const MODE = 'pass';", "const MODE = 'control-fail';"));
    writeFileSync(join(failingScripts, 'fixture-helper.mjs'), readFileSync(helperPath));
    const failedControl = await runControl(failingScripts, 'fixture');
    check('failing-control-exit-class-is-2', gateExitCode({
      controls: new Map([['fixture', failedControl]]), results: [], mutantTotal: 0, targetCount: 1, frozenKilled: 0,
    }) === 2, failedControl.state);

    const noFailExit = classifyMutant({
      timedOut: false, overflow: false, groupClean: true, spawnError: null, status: 1, failLines: 0,
      stdout: '1/1 cases passed (fixture)\nVERDICT: FAIL\n',
    }, { passed: 1, total: 1 }, 1);
    check('k43-nonzero-with-verdict-fail-is-killed', noFailExit === 'killed', noFailExit);
    const nonzeroPass = classifyMutant({
      timedOut: false, overflow: false, groupClean: true, spawnError: null, status: 1, failLines: 1,
      stdout: '0/1 cases passed (fixture)\nFAIL  X — y\nVERDICT: PASS\n',
    }, { passed: 0, total: 1 }, 1);
    check('k43-nonzero-with-verdict-pass-is-survived', nonzeroPass === 'survived', nonzeroPass);
    const firstKill = { timedOut: false, overflow: false, groupClean: true, spawnError: null, status: 1,
      stdout: '0/1 cases passed (fixture)\nFAIL  A — run1\nVERDICT: FAIL\n' };
    const sameKill = { ...firstKill, stdout: '0/1 cases passed (fixture)\nFAIL  A — run2 detail differs\nVERDICT: FAIL\n' };
    const otherKill = { ...firstKill, stdout: '0/1 cases passed (fixture)\nFAIL  B — run2\nVERDICT: FAIL\n' };
    const passAgain = { ...firstKill, status: 0, stdout: '1/1 cases passed (fixture)\nVERDICT: PASS\n' };
    check('k43-confirmation-same-names-agrees', confirmKill(firstKill, sameKill, 1), 'same names, details differ');
    check('k43-confirmation-other-names-or-pass-disagrees', !confirmKill(firstKill, otherKill, 1) && !confirmKill(firstKill, passAgain, 1), 'other names / pass on rerun');
    check('k43-unstable-exit-class-is-2', gateExitCode({
      controls: new Map([['fixture', { pass: true }]]), results: [{ state: 'unstable' }], mutantTotal: 1, targetCount: 1, frozenKilled: 0,
    }) === 2, 'unstable');
    const passControls = new Map([['fixture', { pass: true }]]);
    const nonmatchExit = gateExitCode({
      controls: passControls, results: [{ state: 'nomatch' }], mutantTotal: 1, targetCount: 1, frozenKilled: 0,
    });
    check('nomatch-exit-class-is-2', nonmatchExit === 2, String(nonmatchExit));
    const timeoutWins = gateExitCode({
      controls: passControls, results: [{ state: 'survived' }, { state: 'timeout' }],
      mutantTotal: 2, targetCount: 1, frozenKilled: 0,
    });
    check('unevaluable-outcome-precedes-survivor', timeoutWins === 2, String(timeoutWins));
    const driftExit = gateExitCode({
      controls: passControls, results: [{ state: 'drift', driftNonKill: true }],
      mutantTotal: 1, targetCount: 1, frozenKilled: 0,
    });
    check('evaluated-drift-uses-survivor-exit-class', driftExit === 1, String(driftExit));

    let optionRevRejected = false;
    try { parseArgs(['--rev', '--output=/tmp/victim']); } catch { optionRevRejected = true; }
    check('option-like-revision-rejected', optionRevRejected, optionRevRejected ? 'refused before Git' : 'accepted');

    const victim = join(tempRoot, 'victim.mjs');
    const symlink = join(tempRoot, 'target-link.mjs');
    writeFileSync(victim, 'not a target\n');
    symlinkSync(victim, symlink);
    let symlinkRefused = false;
    try { readSafeFile(symlink, tempRoot); } catch { symlinkRefused = true; }
    check('symlink-target-refused', symlinkRefused, symlinkRefused ? 'refused before read/write' : 'followed symlink');

    const fifo = join(tempRoot, 'target.fifo');
    const fifoMake = spawnSync('/usr/bin/mkfifo', [fifo], {
      cwd: join(tempRoot, 'work'), env: sandboxEnv(tempRoot), encoding: 'utf8', timeout: 1_000,
    });
    let fifoRefused = false;
    try { readSafeFile(fifo, tempRoot); } catch { fifoRefused = true; }
    check('fifo-target-refused', fifoMake.status === 0 && fifoRefused, `mkfifo=${fifoMake.status} refused=${fifoRefused}`);

    const repo = join(tempRoot, 'sentinel-repo');
    const repoScripts = join(repo, 'scripts');
    mkdirSync(repoScripts, { recursive: true, mode: 0o700 });
    const repoRoot = resolve(SCRIPT_DIR, '..');
    for (const target of TARGETS) {
      writeFileSync(join(repoScripts, `${target}.mjs`), readSafeFile(join(SCRIPT_DIR, `${target}.mjs`), repoRoot));
    }
    writeFileSync(join(repoScripts, 'fixture.mjs'), selftestTargetSource());
    writeFileSync(join(repoScripts, 'fixture-helper.mjs'), readFileSync(helperPath));
    gitRun(repo, ['init', '--initial-branch=main'], tempRoot);
    gitRun(repo, ['config', 'user.name', 'Gate Mutants Selftest'], tempRoot);
    gitRun(repo, ['config', 'user.email', 'gate-mutants-selftest@example.test'], tempRoot);
    gitRun(repo, ['config', 'core.hooksPath', '/dev/null'], tempRoot);
    gitRun(repo, ['add', 'scripts'], tempRoot);
    gitRun(repo, ['commit', '-m', 'sentinel fixture'], tempRoot);
    const sentinelHead = gitRun(repo, ['rev-parse', 'HEAD'], tempRoot, 4096).toString('utf8').trim();
    const poisonedNames = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'KUMITATE_CITE_SELFTEST_INJECT_FAIL', 'NODE_OPTIONS', 'NODE_PATH'];
    const priorEnv = new Map(poisonedNames.map((name) => [name, process.env[name]]));
    let sentinelControl = null;
    let staged = null;
    let sentinelError = null;
    process.env.GIT_DIR = join(repo, '.git');
    process.env.GIT_WORK_TREE = repo;
    process.env.GIT_INDEX_FILE = join(repo, '.git', 'index');
    process.env.KUMITATE_CITE_SELFTEST_INJECT_FAIL = '1';
    process.env.NODE_OPTIONS = '--require=/nonexistent/gate-mutants-preload.cjs';
    process.env.NODE_PATH = '/nonexistent/gate-mutants-node-path';
    try {
      staged = prepareSource({ repo, rev: sentinelHead });
      sentinelControl = await runControl(staged.scripts, 'fixture');
    } catch (error) { sentinelError = error.message; }
    finally {
      if (staged) removeTempDir(staged.tempRoot);
      for (const [name, value] of priorEnv) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
    const sentinelAfter = gitRun(repo, ['rev-parse', 'HEAD'], tempRoot, 4096).toString('utf8').trim();
    check('polluted-git-env-does-not-write-sentinel', sentinelControl?.pass && sentinelHead === sentinelAfter,
      `control=${sentinelControl?.state ?? 'none'} head_unchanged=${sentinelHead === sentinelAfter} ${sentinelError ?? ''}`);

    const missing = missingFrozenIds(MANIFEST.slice(1));
    check('missing-frozen-manifest-exits-2', manifestExitCode(MANIFEST.slice(1)) === 2
      && missing.length === 1 && missing[0] === FROZEN_IDS[0], missing.join(',') || 'none');
    const ids = MANIFEST.map((mutant) => `${mutant.target}:${mutant.id}`);
    const extras = ids.filter((id) => !FROZEN_IDS.includes(id)).sort();
    const expectedExtras = ['cite-check:guard-outer-eq-undefined', 'cite-check:guard-outer-ne-1'].sort();
    const manifest = manifestIssues();
    check('manifest-has-41-frozen-and-two-extras', MANIFEST.length === 43 && !manifest.missing.length
      && !manifest.duplicates.length && !manifest.invalid.length && JSON.stringify(extras) === JSON.stringify(expectedExtras),
    `rows=${MANIFEST.length} extras=${extras.length} missing=${manifest.missing.length} duplicates=${manifest.duplicates.length} invalid=${manifest.invalid.length}`);

    const sourceText = Object.fromEntries(TARGETS.map((target) => [
      target, readSafeFile(join(SCRIPT_DIR, `${target}.mjs`), repoRoot).toString('utf8'),
    ]));
    const unapplicable = MANIFEST.filter((mutant) => !applyLiteral(sourceText[mutant.target], mutant.from, mutant.to).ok);
    check('all-manifest-literals-apply-once', unapplicable.length === 0,
      `unapplicable=${unapplicable.map((mutant) => `${mutant.target}:${mutant.id}`).join(',') || 'none'}`);

    const expectedDigest = sha256(Buffer.from(selftestTargetSource().replace('const TRIPWIRE = false;', 'const TRIPWIRE = true;')));
    const digestHeader = formatHeader('selftest', { fixture: killed.digest });
    check('mutated-byte-header-digest', killed.digest === expectedDigest && digestHeader.includes(`fixture=${expectedDigest}`), digestHeader);
  } catch (error) {
    check('selftest-harness-exception', false, error.message);
  } finally { removeTempDir(tempRoot); }

  const leftovers = ACTIVE_GROUPS.size + TEMP_DIRS.size;
  check('selftest-leftovers', leftovers === 0, `leftovers=${leftovers}`);
  const passed = tests.filter((test) => test.ok).length;
  const lines = tests.map((test) => `${test.ok ? 'PASS' : 'FAIL'} ${test.id} ${test.detail}`);
  lines.push(`GATE_MUTANTS_SELFTEST: ${passed}/${tests.length} pass leftovers=${leftovers}`);
  lines.push(`VERDICT: ${passed === tests.length ? 'PASS' : 'FAIL'}`);
  process.stdout.write(lines.join('\n') + '\n');
  return passed === tests.length ? 0 : 1;
}

async function main() {
  let opts;
  try { opts = parseArgs(process.argv.slice(2)); }
  catch (error) { process.stderr.write(`gate-mutants: ${error.message}\n${USAGE}`); return 64; }
  if (opts.help) { process.stdout.write(USAGE); return 0; }
  if (opts.selftest) return runSelftest();

  const manifest = manifestIssues();
  const revLabel = opts.rev ?? 'working-copy';
  const mutants = MANIFEST.filter((mutant) => !opts.target || mutant.target === opts.target);
  const targetNames = [...new Set(mutants.map((mutant) => mutant.target))];
  if (manifestExitCode() !== 0) {
    if (manifest.missing.length) process.stdout.write(`MISSING_FROZEN ${manifest.missing.join(' ')}\n`);
    if (manifest.duplicates.length) process.stdout.write(`DUPLICATE_IDS ${manifest.duplicates.join(' ')}\n`);
    if (manifest.invalid.length) process.stdout.write(`INVALID_MANIFEST rows=${manifest.invalid.length}\n`);
    process.stdout.write(`GATE_MUTANTS: ERROR (mutants=0 killed=0 frozen=0/41 targets=${targetNames.length} rev=${revLabel} manifest=${manifestSha256()} leftovers=0)\n`);
    return 2;
  }
  if (opts.list) {
    const ids = mutants.map((mutant) => `${mutant.target}:${mutant.id}`);
    process.stdout.write(opts.json
      ? `${JSON.stringify({ schema: CONTRACT, manifest: manifestSha256(), mutants: ids }, null, 2)}\n`
      : `${ids.join('\n')}\n`);
    return 0;
  }

  let source;
  try { source = prepareSource(opts); }
  catch (error) {
    process.stderr.write(`gate-mutants: setup failed: ${error.message}\n`);
    const leftovers = ACTIVE_GROUPS.size + TEMP_DIRS.size;
    if (opts.json) process.stdout.write(`${JSON.stringify({ schema: CONTRACT, verdict: 'ERROR', exitCode: 2, error: error.message, leftovers })}\n`);
    else process.stdout.write(`GATE_MUTANTS: ERROR (mutants=0 killed=0 frozen=0/41 targets=${targetNames.length} rev=${revLabel} manifest=${manifestSha256()} leftovers=${leftovers})\n`);
    return 2;
  }
  try {
    const digests = {};
    for (const target of targetNames) {
      const targetPath = join(source.scripts, `${target}.mjs`);
      digests[target] = sha256(readSafeFile(targetPath, source.tempRoot));
    }
    const header = formatHeader(source.rev, digests);
    const measuredRev = source.rev;
    const controls = new Map();
    if (!opts.json) process.stdout.write(`${header}\n`);
    for (const target of targetNames) {
      const control = await runControl(source.scripts, target);
      controls.set(target, control);
      if (!opts.json) process.stdout.write(`${controlText(target, control)}\n`);
    }
    let results = [];
    if ([...controls.values()].every((control) => control.pass)) {
      results = await mapBounded(mutants, opts.jobs, (mutant) => runMutant(
        source.scripts, mutant, controls.get(mutant.target).cases.total,
      ), (result) => { if (!opts.json) process.stdout.write(`${mutantText(result)}\n`); });
    }

    const integrity = [];
    if (results.length) {
      for (const target of targetNames) {
        const after = await runControl(source.scripts, target);
        if (!opts.json) process.stdout.write(`${controlText(target, after).replace(/^CONTROL /, 'CONTROL_AFTER ')}\n`);
        if (!after.pass) integrity.push(`control-after:${target}`);
      }
    }
    for (const target of targetNames) {
      const measured = sha256(readSafeFile(join(source.scripts, `${target}.mjs`), source.tempRoot));
      if (measured !== digests[target]) integrity.push(`temp:${target}`);
      const live = sha256(readSafeFile(join(source.repo, 'scripts', `${target}.mjs`), source.repo));
      if (live !== source.liveDigests[target]) integrity.push(`repo:${target}`);
    }
    removeTempDir(source.tempRoot);
    source = null;
    const leftovers = ACTIVE_GROUPS.size + TEMP_DIRS.size;
    if (leftovers) integrity.push(`leftovers:${leftovers}`);

    const killed = results.filter((result) => result.state === 'killed').length;
    const frozenKilled = new Set(results
      .filter((result) => result.state === 'killed' && FROZEN_IDS.includes(`${result.target}:${result.id}`))
      .map((result) => `${result.target}:${result.id}`)).size;
    const exitCode = gateExitCode({
      controls,
      results,
      integrityFailures: integrity.length,
      leftovers,
      mutantTotal: mutants.length,
      targetCount: targetNames.length,
      frozenKilled,
    });
    const verdict = exitCode === 0 ? 'CLEAN' : exitCode === 1 ? 'SURVIVED' : 'ERROR';
    const meta = {
      frozenKilled,
      targets: targetNames.length,
      rev: measuredRev,
      manifest: manifestSha256(),
      leftovers,
      missing: manifest.missing,
      integrity,
    };
    process.stdout.write(opts.json
      ? reportJson(header, controls, results, verdict, exitCode, meta)
      : reportText(header, controls, results, verdict, exitCode, meta, true));
    return exitCode;
  } catch (error) {
    process.stderr.write(`gate-mutants: setup failed: ${error.message}\n`);
    if (source) { removeTempDir(source.tempRoot); source = null; }
    const leftovers = ACTIVE_GROUPS.size + TEMP_DIRS.size;
    if (opts.json) process.stdout.write(`${JSON.stringify({ schema: CONTRACT, verdict: 'ERROR', exitCode: 2, error: error.message, leftovers })}\n`);
    else process.stdout.write(`GATE_MUTANTS: ERROR (mutants=0 killed=0 frozen=0/41 targets=${targetNames.length} rev=${revLabel} manifest=${manifestSha256()} leftovers=${leftovers})\n`);
    return 2;
  } finally {
    if (source) removeTempDir(source.tempRoot);
  }
}

process.exitCode = await main();
