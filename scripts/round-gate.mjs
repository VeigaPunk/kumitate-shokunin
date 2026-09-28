#!/usr/bin/env node
/**
 * round-gate.mjs — lane-local pre-check of the fleet round-close contract.
 * Read-only, zero deps, ESM, node >= 20.
 * Contract: kumitate-round-gate-v1 (parent-frozen; round-10 repairs A–I applied).
 *
 *   node scripts/round-gate.mjs [--round N] [--lane kumitate] [--repo DIR]
 *       [--reports-dir DIR] [--main-repo DIR] [--origin DIR]
 *       [--close] [--json] [--strict] [--selftest]
 *
 * Boundary (read before trusting a verdict)
 *   This gate grades ONE lane's own round artifacts (default lane `kumitate`).
 *   It is NOT a fleet report-conformance authority: that is the integrator's
 *   step in the shokunin main repo, `PROTOCOL.md:263-267` (reads every lane
 *   report, verifies each cited child-repo commit exists and is an ancestor of
 *   the lane repo's HEAD, checks the contract-required `SHONEN` heading). This
 *   tool is the lane-local *pre-check of those same invariants*
 *   (`PROTOCOL.md:264-265`) so a report is integrator-ready before it is filed;
 *   a green verdict asserts nothing fleet-wide, and running the gate does not
 *   change mission completion (mission state is projected read-only from
 *   `.ufo/state/*` — `scripts/shokunin-watchdog.sh:41-46`).
 *
 * Modes (one per run; `--selftest` wins, then `--tracked`, then `--close`,
 * else the audit; `--tracked` together with `--close` is refused as usage)
 *   audit       (default) the round-<N> artifact set for `--lane`: report
 *               presence/weight/headings/round identity/SHONEN heading, cited
 *               commit tokens, SCORECARD.md round row and `## Planned` forward
 *               mention, LOG.md round entry, and a commit-message round marker.
 *   --close     audit checks plus the close-only checks a dispatcher runs
 *               before declaring a round shut: clean work tree, no unpushed
 *               commits in `--repo`, and the lane report tracked AND pushed in
 *               `--main-repo`. Skipped in audit mode so the default stays green
 *               mid-round.
 *   --tracked   filed-report freshness ONLY — no audit check runs, `--repo` and
 *               `--round` are not consulted, and no closed round is required:
 *               enumerate `<reports-dir>/round-<N>/<lane>.md`, drop the highest N
 *               (the in-flight round), then require every remaining report to be
 *               tracked in `--main-repo` (`git ls-files --error-unmatch`,
 *               read-only). This is the dispatcher's integrator hand-off check:
 *               every *previous* round's report is in the main-repo index before
 *               the current one is filed. The only finding kind it can emit is
 *               REPORT_UNTRACKED, one per report; verdict shape `ROUND_GATE:
 *               CLEAN|DRIFT (mode=tracked checked=<n> errors=<e> warnings=<w>)`;
 *               `--json` replaces `round` with `checked` and `excludedRound`.
 *   --selftest  HERMETIC fixture suite (temp dirs only, zero network, git
 *               fixtures pinned by env). It never reads the live trees, `--repo`
 *               or the environment: bogus flags and a polluted env cannot affect
 *               it. `--selftest` wins over `--json`.
 *
 * Defaults (precedence: CLI flag > environment > literal)
 *   --lane        KUMITATE_LANE        else `kumitate`
 *   --repo        the repo root containing this script —
 *                 realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..')),
 *                 never process.cwd() — so a symlinked invocation still resolves
 *                 to the real root
 *   --main-repo   KUMITATE_MAIN_REPO   else /home/vgpnk/projects/shokunin
 *   --reports-dir KUMITATE_REPORTS_DIR else <main-repo>/.ufo/reports when
 *                 main-repo was set explicitly (flag or env), else
 *                 /home/vgpnk/projects/shokunin/.ufo/reports
 *   --origin      UFO_SRC               else /home/vgpnk/Projects/origin-work/ufo-fsd-alpha
 *   --round       latest closed round for the lane = max N with
 *                 `<reports-dir>/round-<N>/<lane>.md` present; none ⇒ fail-closed.
 *
 * Exit map: 0 clean · 1 findings (errors; warnings too under `--strict`)
 *           2 fail-closed · 64 usage.
 *
 * Finding kinds (stable tokens; text mode prints
 * `ROUND_GATE  <severity>  <KIND>  <detail>` and the verdict line last)
 *   error   REPORT_MISSING          report file absent.
 *   error   REPORT_THIN             report < 1024 bytes (`(bytes=<n>)`).
 *   error   REPORT_HEADINGS         fewer than 2 lines matching `^#{1,3} `.
 *   error   REPORT_ROUND_MISMATCH   text matches neither `round-<N>` nor
 *                                   `round <N>`; frozen pattern
 *                                   `/round[-_ ]?<N>\b/iu` (so `round-1` cannot
 *                                   satisfy N=10 and `round-10` cannot satisfy N=1).
 *   warning REPORT_SHONEN_MISSING   no `^#{1,6}\s*SHONEN` heading (case-insensitive).
 *   error   COMMIT_CITED_UNRESOLVED a cited commit token resolves in no probeable
 *                                   source (lane → main → origin).
 *   error   COMMIT_CITED_NOT_ANCESTOR  a cited token resolves in `--repo` but is
 *                                   not an ancestor of its HEAD
 *                                   (`git merge-base --is-ancestor`).
 *   error   SCORECARD_ROW_MISSING   no `^\|\s*<N>\s*\|` table row in SCORECARD.md.
 *   warning SCORECARD_PLAN_MISSING  no `## Planned` section body naming any
 *                                   `round M` with `M > <N>` (the plan for the
 *                                   audited round is consumed by that round, so
 *                                   pinning `<N+1>` false-positives once the
 *                                   next round lands — round-10 finding).
 *   error   LOG_ENTRY_MISSING       no `^- \d{4}-\d{2}-\d{2} — round <N>\b` line
 *                                   (em dash U+2014) in LOG.md.
 *   error   COMMIT_MISSING          no commit message in the last 1000 whose
 *                                   subject+body carries `\bround[- ]<N>\b`.
 *   error   TREE_DIRTY         close: `git status --porcelain` non-empty (first
 *                                   5 entries named).
 *   error   UNPUSHED           close: `git rev-list --count @{u}..HEAD` > 0.
 *   error   REPORT_UNTRACKED   close: the lane report is not tracked in
 *                              `--main-repo`, or is in `@{u}..HEAD` (unpushed).
 *                              --tracked: a non-in-flight filed report is not
 *                              tracked in `--main-repo`, or lies outside it
 *                              (`outside --main-repo …`) — one finding per report.
 *
 * Notes a reader cannot re-derive cheaply
 *   COMMIT_MISSING is a *convention* check: the round marker is scanned over
 *   subject+body (`git log --format=%B -n 1000`) and only says "some commit
 *   message names this round". It is NOT a commit-identity check and does not
 *   attest authorship or message shape — citation/completion identity is
 *   governed by PROTOCOL.md (shokunin main repo, :200-213) and the integrator.
 *   Cited-commit extraction: backticked spans, split on `..`/`...` (ranges like
 *   `31f09cd..d65aa24`), each part matching `^[0-9a-f]{7,40}$`. Resolution order
 *   lane → main → origin; resolving in main/origin is an external citation and
 *   never a finding (reported only in `--json` `citations.external`). Only
 *   read-only object probes (`git cat-file -e <tok>^{commit}`, `git merge-base
 *   --is-ancestor`) touch `--origin`, lazily, and only for tokens the lane and
 *   main repos did not resolve; the origin tree is never written. If main or
 *   origin is not a git work tree the resolution space is incomplete and such
 *   tokens are not findings (`--json` `citations.unverifiable`).
 *   Fail-closed tokens (exit 2): REPORTS_DIR_MISSING, NOT_A_GIT_WORKTREE,
 *   NO_CLOSED_ROUND, NO_FILED_REPORTS, UPSTREAM_MISSING, MAIN_REPO_NOT_GIT,
 *   INTERNAL_ERROR. NO_FILED_REPORTS is `--tracked` with fewer than two
 *   `round-<N>/<lane>.md` files: the highest round is excluded as in-flight, so
 *   there is nothing left to check (a single filed report is not verifiable).
 *   UPSTREAM_MISSING is any non-zero `rev-list @{u}..HEAD` exit (128 with
 *   `fatal: no upstream configured`): an unverifiable push state is refused
 *   rather than green-lit, so a fresh clone without upstream cannot close a
 *   round — and, for the same reason, a main repo without upstream cannot
 *   answer "is the report pushed?".
 *   Documented readings where the frozen spec was silent: `--help`/`-h` are not
 *   in the frozen flag list, so they are unknown flags (exit 64, usage on
 *   stderr); `--json` on a fail-closed path still prints ONE schema object with
 *   `verdict: "FAIL-CLOSED"` and the token as the single finding kind.
 */
import { spawnSync } from 'node:child_process';
import {
  mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTRACT = 'kumitate-round-gate-v1';
const DEFAULT_LANE = 'kumitate';
const DEFAULT_REPORTS_DIR = '/home/vgpnk/projects/shokunin/.ufo/reports';
const DEFAULT_MAIN_REPO = '/home/vgpnk/projects/shokunin';
const DEFAULT_ORIGIN = '/home/vgpnk/Projects/origin-work/ufo-fsd-alpha';
const REPORT_MIN_BYTES = 1024;
const HISTORY_LIMIT = 1000;
const GIT_TIMEOUT_MS = 20_000;
const GIT_MAX_BUFFER = 8 * 1024 * 1024;
const FINDING_KINDS = [
  'REPORT_MISSING', 'REPORT_THIN', 'REPORT_HEADINGS', 'REPORT_ROUND_MISMATCH', 'REPORT_SHONEN_MISSING',
  'COMMIT_CITED_UNRESOLVED', 'COMMIT_CITED_NOT_ANCESTOR',
  'SCORECARD_ROW_MISSING', 'SCORECARD_PLAN_MISSING', 'LOG_ENTRY_MISSING', 'COMMIT_MISSING',
  'TREE_DIRTY', 'UNPUSHED', 'REPORT_UNTRACKED',
];
const USAGE = [
  'usage: node scripts/round-gate.mjs [--round N] [--lane kumitate] [--repo DIR]',
  '       [--reports-dir DIR] [--main-repo DIR] [--origin DIR]',
  '       [--close | --tracked] [--json] [--strict] [--selftest]',
  `contract id: ${CONTRACT}`,
  '',
  'exit map: 0 clean · 1 findings (errors; warnings too under --strict) · 2 fail-closed · 64 usage',
  '',
].join('\n');

/* ------------------------------------------------------------------ helpers */

function realpathOr(p) {
  try { return realpathSync(p); } catch { return p; }
}

const DEFAULT_REPO = realpathOr(resolve(HERE, '..'));

function statKind(p) {
  try {
    const s = statSync(p);
    return s.isDirectory() ? 'dir' : s.isFile() ? 'file' : 'other';
  } catch { return 'absent'; }
}

function readText(p) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}

function firstLine(s) {
  return String(s ?? '').split('\n').map((l) => l.trim()).filter(Boolean)[0] ?? '';
}

/* array-argv spawnSync only — no shell interpolation anywhere in this file. */
function git(repo, args) {
  return spawnSync('git', ['-C', repo, ...args], {
    encoding: 'utf8', timeout: GIT_TIMEOUT_MS, maxBuffer: GIT_MAX_BUFFER,
  });
}

function isWorkTree(repo) {
  if (statKind(repo) !== 'dir') return false;
  const r = git(repo, ['rev-parse', '--is-inside-work-tree']);
  return r.status === 0 && String(r.stdout ?? '').trim() === 'true';
}

/* --------------------------------------------------------------------- args */

function parseArgs(argv, env = process.env) {
  const envOr = (name) => {
    const v = env[name];
    return typeof v === 'string' && v.trim() !== '' ? v : undefined;
  };
  let mainRepoSrc = null;   // 'flag' | 'env' | null  (gates the derived reports dir)
  const opts = {
    round: null,
    lane: null,
    repo: DEFAULT_REPO,
    mainRepo: null,
    reportsDir: null,
    origin: null,
    close: false,
    tracked: false,
    json: false,
    strict: false,
    selftest: false,
  };
  const dirValue = (flag, v) => {
    if (v === undefined || v.trim() === '') throw new Error(`${flag} requires a non-empty directory`);
    if (v.startsWith('--')) throw new Error(`${flag} requires a directory (got ${JSON.stringify(v)})`);
    return resolve(v);
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--round') {
      const v = next();
      if (v === undefined || !/^\d+$/.test(v)) throw new Error(`--round requires a non-negative integer (got ${JSON.stringify(v)})`);
      const n = Number.parseInt(v, 10);
      if (!Number.isSafeInteger(n)) throw new Error(`--round out of range (got ${JSON.stringify(v)})`);
      opts.round = n;
    } else if (a === '--lane') {
      const v = next();
      if (v === undefined || !/^[A-Za-z][A-Za-z0-9-]*$/.test(v)) {
        throw new Error(`--lane must match ^[A-Za-z][A-Za-z0-9-]*$ (got ${JSON.stringify(v)})`);
      }
      opts.lane = v;
    } else if (a === '--repo') { opts.repo = dirValue(a, next()); }
    else if (a === '--reports-dir') opts.reportsDir = dirValue(a, next());
    else if (a === '--main-repo') { opts.mainRepo = dirValue(a, next()); mainRepoSrc = 'flag'; }
    else if (a === '--origin') { opts.origin = dirValue(a, next()); }
    else if (a === '--close') opts.close = true;
    else if (a === '--tracked') opts.tracked = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--strict') opts.strict = true;
    else if (a === '--selftest') opts.selftest = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  if (opts.lane === null) {
    const envLane = envOr('KUMITATE_LANE');
    if (envLane !== undefined && !/^[A-Za-z][A-Za-z0-9-]*$/.test(envLane)) {
      throw new Error(`KUMITATE_LANE must match ^[A-Za-z][A-Za-z0-9-]*$ (got ${JSON.stringify(envLane)})`);
    }
    opts.lane = envLane ?? DEFAULT_LANE;
  }
  if (opts.mainRepo === null) {
    const envMain = envOr('KUMITATE_MAIN_REPO');
    if (envMain !== undefined) { opts.mainRepo = resolve(envMain); mainRepoSrc = 'env'; }
    else opts.mainRepo = DEFAULT_MAIN_REPO;
  }
  if (opts.reportsDir === null) {
    const envReports = envOr('KUMITATE_REPORTS_DIR');
    if (envReports !== undefined) opts.reportsDir = resolve(envReports);
    else if (mainRepoSrc !== null) opts.reportsDir = join(opts.mainRepo, '.ufo', 'reports');
    else opts.reportsDir = DEFAULT_REPORTS_DIR;
  }
  if (opts.origin === null) {
    const envSrc = envOr('UFO_SRC');
    opts.origin = envSrc !== undefined ? resolve(envSrc) : DEFAULT_ORIGIN;
  }
  return opts;
}

/* -------------------------------------------------------------------- audit */

/** The `## Planned` section body: from its heading to the next `#`/`##` line. */
function plannedSection(text) {
  const lines = text.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) if (/^## Planned\b/.test(lines[i])) { start = i; break; }
  if (start < 0) return { found: false, text: '' };
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) if (/^#{1,2} /.test(lines[i])) { end = i; break; }
  return { found: true, text: lines.slice(start, end).join('\n') };
}

/** Backticked commit-citation tokens: split ranges on `..`/`...`, keep bare hex. */
function citationTokens(reportText) {
  const out = new Set();
  for (const m of reportText.matchAll(/`([^`\n]+)`/g)) {
    for (const part of m[1].split(/\.\.\.?/)) {
      const tok = part.trim();
      if (/^[0-9a-f]{7,40}$/.test(tok)) out.add(tok);
    }
  }
  return [...out];
}

function runChecks({ repo, reportsDir, round, lane, close, mainRepo, origin }) {
  const items = [];
  const add = (id, severity, ok, detail) => { items.push({ id, severity, ok, detail }); };
  const citations = {
    checked: 0, external: [], unresolved: [], notAncestor: [], unverifiable: [],
    mainProbeable: null, originProbeable: null,
  };
  let mainProbeable = null;
  let originProbeable = null;
  const mainProbeableNow = () => { if (mainProbeable === null) mainProbeable = isWorkTree(mainRepo); return mainProbeable; };
  const originProbeableNow = () => { if (originProbeable === null) originProbeable = isWorkTree(origin); return originProbeable; };

  /* report artifact set ---------------------------------------------------- */
  const reportPath = join(reportsDir, `round-${round}`, `${lane}.md`);
  const report = readText(reportPath);
  if (report === null) {
    add('REPORT_MISSING', 'error', false, reportPath);
  } else {
    const bytes = Buffer.byteLength(report, 'utf8');
    add('REPORT_THIN', 'error', bytes >= REPORT_MIN_BYTES, `(bytes=${bytes})`);
    const headings = (report.match(/^#{1,3} /gm) ?? []).length;
    add('REPORT_HEADINGS', 'error', headings >= 2, `headings=${headings}`);
    const namesRound = new RegExp(`round[-_ ]?${round}\\b`, 'iu').test(report);
    add('REPORT_ROUND_MISMATCH', 'error', namesRound,
      namesRound ? `names round ${round}` : `neither "round-${round}" nor "round <${round}>" in ${reportPath}`);
    const hasShonen = /^#{1,6}\s*SHONEN/im.test(report);
    add('REPORT_SHONEN_MISSING', 'warning', hasShonen,
      hasShonen ? 'SHONEN heading present' : `no ^#{1,6} SHONEN heading in ${reportPath}`);

    /* cited commits --------------------------------------------------------- */
    const tokens = citationTokens(report);
    citations.checked = tokens.length;
    const laneCache = new Map();
    const mainCache = new Map();
    const originCache = new Map();
    const isCommit = (dir, t) => git(dir, ['cat-file', '-e', `${t}^{commit}`]).status === 0;
    const probe = (which, t) => {
      const cache = which === 'lane' ? laneCache : which === 'main' ? mainCache : originCache;
      if (!cache.has(t)) {
        const dir = which === 'lane' ? repo : which === 'main' ? mainRepo : origin;
        const reachable = which === 'lane' ? true : (which === 'main' ? mainProbeableNow() : originProbeableNow());
        cache.set(t, reachable && isCommit(dir, t));
      }
      return cache.get(t);
    };
    for (const t of tokens) {
      if (probe('lane', t)) {
        const anc = git(repo, ['merge-base', '--is-ancestor', t, 'HEAD']);
        if (anc.status !== 0) {
          citations.notAncestor.push(t);
        }
      } else if (probe('main', t)) {
        citations.external.push(t);
      } else if (probe('origin', t)) {
        citations.external.push(t);
      } else if (mainProbeableNow() && originProbeableNow()) {
        citations.unresolved.push(t);
      } else {
        citations.unverifiable.push(t);
      }
    }
    citations.mainProbeable = mainProbeable;
    citations.originProbeable = originProbeable;
    const citedDetail = (what, list) => (tokens.length === 0
      ? 'no cited commit tokens'
      : `cited=${tokens.length} ${what}=${list.length}${list.length ? ` [${list.join(' ')}]` : ''}`
        + (citations.unverifiable.length ? ` unverifiable=${citations.unverifiable.length}` : ''));
    add('COMMIT_CITED_UNRESOLVED', 'error', citations.unresolved.length === 0, citedDetail('unresolved', citations.unresolved));
    add('COMMIT_CITED_NOT_ANCESTOR', 'error', citations.notAncestor.length === 0, citedDetail('notAncestor', citations.notAncestor));
  }

  /* scorecard -------------------------------------------------------------- */
  const scorecardPath = join(repo, 'SCORECARD.md');
  const scorecard = readText(scorecardPath);
  if (scorecard === null) {
    add('SCORECARD_ROW_MISSING', 'error', false, `SCORECARD.md missing (${scorecardPath})`);
  } else {
    const hasRow = new RegExp(`^\\|\\s*${round}\\s*\\|`, 'm').test(scorecard);
    add('SCORECARD_ROW_MISSING', 'error', hasRow, hasRow
      ? `row for round ${round}`
      : `no table row starting "| ${round} |" in ${scorecardPath}`);
    const plan = plannedSection(scorecard);
    if (!plan.found) {
      add('SCORECARD_PLAN_MISSING', 'warning', false, `no ## Planned section in ${scorecardPath}`);
    } else {
      const future = [...plan.text.matchAll(/round[- ]?(\d+)/gi)]
        .map((m) => Number(m[1]))
        .filter((n) => Number.isFinite(n) && n > round);
      const mentions = future.length > 0;
      add('SCORECARD_PLAN_MISSING', 'warning', mentions, mentions
        ? `## Planned names round ${Math.max(...future)}`
        : `## Planned names no round later than ${round}`);
    }
  }

  /* log -------------------------------------------------------------------- */
  const logPath = join(repo, 'LOG.md');
  const logText = readText(logPath);
  if (logText === null) {
    add('LOG_ENTRY_MISSING', 'error', false, `LOG.md missing (${logPath})`);
  } else {
    const hasEntry = new RegExp(`^- \\d{4}-\\d{2}-\\d{2} — round ${round}\\b`, 'm').test(logText);
    add('LOG_ENTRY_MISSING', 'error', hasEntry, hasEntry
      ? `entry for round ${round}`
      : `no "- YYYY-MM-DD — round ${round}" line in ${logPath}`);
  }

  /* commit message marker --------------------------------------------------- */
  const hist = git(repo, ['log', '--format=%B%x00', '-n', String(HISTORY_LIMIT)]);
  if (hist.error || hist.status !== 0) {
    add('COMMIT_MISSING', 'error', false, `git log failed in ${repo}: ${firstLine(hist.stderr || hist.error)}`);
  } else {
    const messages = String(hist.stdout ?? '').split('\0').map((m) => m.trim()).filter(Boolean);
    const re = new RegExp(`\\bround[- ]${round}\\b`);
    const hit = messages.find((m) => re.test(m));
    add('COMMIT_MISSING', 'error', Boolean(hit), hit
      ? `message marker in "${firstLine(hit).slice(0, 80)}"`
      : `no message matching \\bround[- ]${round}\\b in ${messages.length} messages of ${repo}`);
  }

  if (!close) return { items, failClosed: null, citations };

  /* close: work tree is clean ------------------------------------------------ */
  const status = git(repo, ['--no-optional-locks', 'status', '--porcelain']);
  const dirty = String(status.stdout ?? '').split('\n').filter((l) => l.trim() !== '');
  add('TREE_DIRTY', 'error', dirty.length === 0, dirty.length === 0
    ? 'work tree clean'
    : `entries=${dirty.length} first5=[${dirty.slice(0, 5).map((l) => `"${l.trim()}"`).join(' ')}]`);

  /* close: nothing unpushed -------------------------------------------------- */
  const ahead = git(repo, ['rev-list', '--count', '@{u}..HEAD']);
  if (ahead.error || ahead.status !== 0) {
    return {
      items,
      failClosed: { token: 'UPSTREAM_MISSING', detail: `--repo ${repo}: exit ${ahead.status} ${firstLine(ahead.stderr)}` },
      citations,
    };
  }
  const aheadCount = Number.parseInt(String(ahead.stdout ?? '').trim(), 10);
  add('UNPUSHED', 'error', aheadCount === 0, `ahead=${aheadCount}`);

  /* close: the report is tracked AND pushed in the main repo ------------------ */
  if (!isWorkTree(mainRepo)) {
    return {
      items,
      failClosed: { token: 'MAIN_REPO_NOT_GIT', detail: `--main-repo ${mainRepo} is not a git work tree` },
      citations,
    };
  }
  const rel = relative(resolve(mainRepo), resolve(reportPath));
  if (rel.startsWith('..') || isAbsolute(rel)) {
    add('REPORT_UNTRACKED', 'error', false, `outside --main-repo ${mainRepo}: ${reportPath}`);
  } else {
    const ls = git(mainRepo, ['ls-files', '--error-unmatch', '--', rel]);
    if (ls.status !== 0) {
      add('REPORT_UNTRACKED', 'error', false, `ls-files: ${rel} is not tracked in ${mainRepo}`);
    } else {
      const pushed = git(mainRepo, ['log', '@{u}..HEAD', '--name-only']);
      if (pushed.error || pushed.status !== 0) {
        return {
          items,
          failClosed: {
            token: 'UPSTREAM_MISSING',
            detail: `--main-repo ${mainRepo}: exit ${pushed.status} ${firstLine(pushed.stderr)}`,
          },
          citations,
        };
      }
      const names = new Set(String(pushed.stdout ?? '').split('\n').map((s) => s.trim()).filter(Boolean));
      add('REPORT_UNTRACKED', 'error', !names.has(rel), names.has(rel)
        ? `unpushed: ${rel}`
        : `tracked+pushed: ${rel}`);
    }
  }
  return { items, failClosed: null, citations };
}

/* -------------------------------------------------------------- tracked mode */

/** `<reports-dir>/round-<N>/<lane>.md` files, ascending by N. */
function roundReports(reportsDir, lane) {
  let entries;
  try { entries = readdirSync(reportsDir, { withFileTypes: true }); } catch { return []; }
  const out = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const m = /^round-(\d+)$/.exec(entry.name);
    if (!m) continue;
    const path = join(reportsDir, entry.name, `${lane}.md`);
    if (statKind(path) !== 'file') continue;
    out.push({ round: Number.parseInt(m[1], 10), path });
  }
  return out.sort((a, b) => a.round - b.round);
}

/**
 * `--tracked`: every filed (non-in-flight) lane report is tracked in
 * `--main-repo`. No audit check runs; REPORT_UNTRACKED is the only kind.
 */
function runTracked(opts, started) {
  if (statKind(opts.reportsDir) !== 'dir') {
    return failClosed(opts, 'tracked', 'REPORTS_DIR_MISSING',
      `--reports-dir ${opts.reportsDir} is ${statKind(opts.reportsDir)}`, [], started);
  }
  if (!isWorkTree(opts.mainRepo)) {
    return failClosed(opts, 'tracked', 'MAIN_REPO_NOT_GIT',
      `--main-repo ${opts.mainRepo} is not a git work tree`, [], started);
  }
  const filed = roundReports(opts.reportsDir, opts.lane);
  if (filed.length < 2) {
    return failClosed(opts, 'tracked', 'NO_FILED_REPORTS',
      `filed=${filed.length} round-<N>/${opts.lane}.md under ${opts.reportsDir}`
      + ' (the highest round is excluded as in-flight, so >=2 are needed)', [], started);
  }
  const inFlight = filed[filed.length - 1];
  const checked = filed.length - 1;
  const items = [];
  const add = (id, severity, ok, detail) => { items.push({ id, severity, ok, detail }); };
  for (const r of filed.slice(0, -1)) {
    const rel = relative(resolve(opts.mainRepo), resolve(r.path));
    if (rel.startsWith('..') || isAbsolute(rel)) {
      add('REPORT_UNTRACKED', 'error', false, `outside --main-repo ${opts.mainRepo}: ${r.path}`);
      continue;
    }
    const tracked = git(opts.mainRepo, ['ls-files', '--error-unmatch', '--', rel]).status === 0;
    add('REPORT_UNTRACKED', 'error', tracked, tracked
      ? `tracked: ${rel}`
      : `ls-files: ${rel} is not tracked in ${opts.mainRepo}`);
  }
  const { findings, errors, warnings, verdict, exitCode } = summarize(items, opts.strict);
  const body = {
    contract: CONTRACT,
    mode: 'tracked',
    lane: opts.lane,
    mainRepo: opts.mainRepo,
    reportsDir: opts.reportsDir,
    checked,
    excludedRound: inFlight.round,
    verdict,
    checks: items,
    findings,
    errors,
    warnings,
    durationMs: Math.max(0, Date.now() - started),
  };
  if (opts.json) {
    process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
  } else {
    const lines = findings.map((f) => `ROUND_GATE  ${f.severity}  ${f.kind}  ${f.detail}`);
    lines.push(`ROUND_GATE: ${verdict} (mode=tracked checked=${checked}`
      + ` errors=${errors} warnings=${warnings})`);
    process.stdout.write(`${lines.join('\n')}\n`);
  }
  return exitCode;
}

/* ------------------------------------------------------------------ verdict */

function summarize(items, strict) {
  const findings = items
    .filter((c) => !c.ok)
    .map((c) => ({ severity: c.severity, kind: c.id, detail: c.detail }));
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warnings = findings.filter((f) => f.severity === 'warning').length;
  const drift = errors > 0 || (strict && warnings > 0);
  return { findings, errors, warnings, verdict: drift ? 'DRIFT' : 'CLEAN', exitCode: drift ? 1 : 0 };
}

/* --------------------------------------------------------------------- main */

function failClosed(opts, mode, token, detail, checks, started) {
  const body = {
    contract: CONTRACT,
    mode,
    round: opts.round ?? null,
    lane: opts.lane,
    repo: opts.repo,
    reportsDir: opts.reportsDir,
    verdict: 'FAIL-CLOSED',
    checks,
    findings: [{ severity: 'error', kind: token, detail }],
    errors: 1,
    warnings: 0,
    citations: {
      checked: 0, external: [], unresolved: [], notAncestor: [], unverifiable: [],
      mainProbeable: null, originProbeable: null,
    },
    durationMs: Math.max(0, Date.now() - started),
  };
  process.stderr.write(`round-gate: fail-closed — ${token}: ${detail}\n`);
  if (opts.json) process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
  else process.stdout.write(`ROUND_GATE: FAIL-CLOSED (${token}) ${detail}\n`);
  return 2;
}

function latestClosedRound(reportsDir, lane) {
  const filed = roundReports(reportsDir, lane);
  return filed.length === 0 ? null : filed[filed.length - 1].round;
}

function main() {
  const started = Date.now();
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`round-gate: ${e.message}\n\n${USAGE}`);
    return 64;
  }
  if (opts.selftest) return selfTest();
  if (opts.tracked && opts.close) {
    process.stderr.write(`round-gate: --tracked and --close are mutually exclusive modes\n\n${USAGE}`);
    return 64;
  }
  const mode = opts.tracked ? 'tracked' : opts.close ? 'close' : 'audit';
  try {
    if (opts.tracked) return runTracked(opts, started);
    if (!isWorkTree(opts.repo)) {
      return failClosed(opts, mode, 'NOT_A_GIT_WORKTREE', `--repo ${opts.repo} is not a git work tree`, [], started);
    }
    if (statKind(opts.reportsDir) !== 'dir') {
      return failClosed(opts, mode, 'REPORTS_DIR_MISSING',
        `--reports-dir ${opts.reportsDir} is ${statKind(opts.reportsDir)}`, [], started);
    }
    const round = opts.round === null ? latestClosedRound(opts.reportsDir, opts.lane) : opts.round;
    if (round === null) {
      return failClosed(opts, mode, 'NO_CLOSED_ROUND',
        `no round-<N>/${opts.lane}.md under ${opts.reportsDir}`, [], started);
    }
    const { items, failClosed: closed, citations } = runChecks({ ...opts, round, mode });
    if (closed) return failClosed(opts, mode, closed.token, closed.detail, items, started);
    const { findings, errors, warnings, verdict, exitCode } = summarize(items, opts.strict);
    const body = {
      contract: CONTRACT,
      mode,
      round,
      lane: opts.lane,
      repo: opts.repo,
      reportsDir: opts.reportsDir,
      verdict,
      checks: items,
      findings,
      errors,
      warnings,
      citations,
      durationMs: Math.max(0, Date.now() - started),
    };
    if (opts.json) {
      process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
    } else {
      const lines = findings.map((f) => `ROUND_GATE  ${f.severity}  ${f.kind}  ${f.detail}`);
      lines.push(`ROUND_GATE: ${verdict} (round=${round} lane=${opts.lane} checks=${items.length}`
        + ` errors=${errors} warnings=${warnings})`);
      process.stdout.write(`${lines.join('\n')}\n`);
    }
    return exitCode;
  } catch (e) {
    return failClosed(opts, mode, 'INTERNAL_ERROR', e && e.message ? e.message : String(e), [], started);
  }
}

/* ----------------------------------------------------------------- selftest */

function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-round-gate-selftest-'));
  const results = [];
  const observed = new Set();
  const check = (name, fn) => {
    try {
      const r = fn();
      results.push({ name, ok: Boolean(r.ok), skipped: Boolean(r.skipped), detail: String(r.detail ?? '') });
    } catch (e) {
      results.push({ name, ok: false, detail: `threw: ${e && e.message ? e.message : e}` });
    }
  };

  const SELF = fileURLToPath(import.meta.url);
  const FIXTURE_CONFIG = ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false'];
  const GIT_ENV = {
    ...process.env,
    GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null',
    GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t',
    GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t',
    GIT_AUTHOR_DATE: '2026-01-02T00:00:00+0000', GIT_COMMITTER_DATE: '2026-01-02T00:00:00+0000',
  };
  const ENV_KEYS = ['KUMITATE_REPORTS_DIR', 'KUMITATE_MAIN_REPO', 'KUMITATE_LANE', 'UFO_SRC'];
  const cleanEnv = () => {
    const env = { ...process.env };
    for (const k of ENV_KEYS) delete env[k];
    return env;
  };
  const fxGit = (cwd, args) => spawnSync('git', [...FIXTURE_CONFIG, '-C', cwd, ...args],
    { encoding: 'utf8', timeout: 30_000, maxBuffer: 16 * 1024 * 1024, env: GIT_ENV });
  const fxBare = (path) => spawnSync('git', [...FIXTURE_CONFIG, 'init', '--bare', '--quiet', '-b', 'main', path],
    { encoding: 'utf8', timeout: 30_000, maxBuffer: 16 * 1024 * 1024, env: GIT_ENV });
  const fxExpect = (r, what) => {
    if (r.status !== 0) throw new Error(`fixture ${what} failed: exit ${r.status} ${firstLine(r.stderr)}`);
    return r;
  };
  const runGate = (args, extraEnv = {}) => spawnSync(process.execPath, [SELF, ...args],
    { encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024, env: { ...cleanEnv(), ...extraEnv } });

  let seq = 0;
  const fxDir = (name) => {
    seq += 1;
    const d = join(tmp, `${String(seq).padStart(2, '0')}-${name}`);
    mkdirSync(d, { recursive: true });
    return d;
  };
  const fxUpstream = (repo) => {
    const bare = `${repo}-origin.git`;
    fxExpect(fxBare(bare), 'bare init');
    fxExpect(fxGit(repo, ['remote', 'add', 'origin', bare]), 'remote add');
    fxExpect(fxGit(repo, ['push', '--quiet', '-u', 'origin', 'main']), 'push');
  };
  const fxEmptyRepo = (base, name = 'origin') => {
    const dir = join(base, name);
    mkdirSync(dir, { recursive: true });
    fxExpect(fxGit(dir, ['init', '--quiet', '-b', 'main']), 'empty init');
    return dir;
  };
  const fxScorecard = ({ round = 5, row = true, planned = 'auto' } = {}) => {
    const lines = ['# Scorecard', '', '| round | axis | evidence |', '|---|---|---|'];
    if (row) lines.push(`| ${round} | operability | fixture |`, `| ${round} | coverage | fixture |`);
    else lines.push('| 1 | coverage | fixture |');
    if (planned !== null) {
      lines.push('', '## Planned', '', planned === 'auto' ? `round ${round + 1}: the next fixture move.` : String(planned));
    }
    return `${lines.join('\n')}\n`;
  };
  const fxLaneRepo = (base, opts = {}) => {
    const round = opts.round ?? 5;
    const repo = join(base, 'repo');
    mkdirSync(repo, { recursive: true });
    fxExpect(fxGit(repo, ['init', '--quiet', '-b', 'main']), 'lane init');
    writeFileSync(join(repo, 'SCORECARD.md'), opts.scorecard ?? fxScorecard({ round }));
    writeFileSync(join(repo, 'LOG.md'), opts.log ?? `- 2026-01-02 — round ${round} fixture entry (lane ${DEFAULT_LANE})\n`);
    if (opts.commit !== false) {
      fxExpect(fxGit(repo, ['add', '-A']), 'lane add');
      fxExpect(fxGit(repo, ['commit', '--quiet', '-m', opts.subject ?? `round-${round} fixture seed`]), 'lane commit');
      if (opts.body) {
        writeFileSync(join(repo, 'BODY.md'), `${opts.body}\n`);
        fxExpect(fxGit(repo, ['add', '-A']), 'lane add body');
        fxExpect(fxGit(repo, ['commit', '--quiet', '-m', 'fixture body commit', '-m', opts.body]), 'lane commit body');
      }
    }
    return repo;
  };
  const fxReports = (base, entries) => {
    mkdirSync(base, { recursive: true });
    for (const e of entries) {
      const dir = join(base, `round-${e.round}`);
      mkdirSync(dir, { recursive: true });
      if (e.text != null) writeFileSync(join(dir, `${e.lane ?? DEFAULT_LANE}.md`), e.text);
    }
    return base;
  };

  /* report bodies ---------------------------------------------------------- */
  const fxBigReport = (round, extra = '') => `# round-${round} lane report\n\n## SHONEN\n\n`
    + `- lane checklist: fixture pass\n\n## Findings\n\n`
    + `${`The round-${round} fixture landed with evidence on disk. `.repeat(30)}${extra}`;
  const fxNoShonen = (round) => `# round-${round} lane report\n\n## Findings\n\n`
    + `${`The round-${round} fixture landed with evidence on disk. `.repeat(30)}`;
  const fxThin = (round) => `# r${round}\n\n## SHONEN\n\nround-${round}\n`;
  const fxHeadingless = (round) => `round-${round} prose without any heading. `.repeat(60);
  const fxMismatch = (round) => `# lane report\n\n## SHONEN\n\n## Findings\n\n`
    + `${`Only round-${round + 1} is mentioned here. `.repeat(60)}`;
  const fxMentions = (round, phrase) => `# lane report\n\n## SHONEN\n\n## Findings\n\n${`${phrase} mention. `.repeat(60)}`;

  const fxCloseFixture = (name, opts = {}) => {
    const base = fxDir(name);
    const round = opts.round ?? 5;
    const laneRepo = fxLaneRepo(base, {
      round,
      scorecard: opts.scorecard,
      log: opts.log,
      subject: opts.subject,
      body: opts.body,
      commit: opts.commit,
    });
    if (opts.laneUpstream !== false) fxUpstream(laneRepo);
    const reportText = opts.report === false ? null : (opts.reportText ?? fxBigReport(round));
    const main = join(base, 'main');
    mkdirSync(main, { recursive: true });
    fxExpect(fxGit(main, ['init', '--quiet', '-b', 'main']), 'main init');
    writeFileSync(join(main, 'README.md'), '# main fixture\n');
    const rel = join('.ufo', 'reports', `round-${round}`, `${DEFAULT_LANE}.md`);
    const reports = join(main, '.ufo', 'reports');
    mkdirSync(reports, { recursive: true });
    if (opts.report !== false) {
      mkdirSync(dirname(join(main, rel)), { recursive: true });
      writeFileSync(join(main, rel), reportText);
    }
    fxExpect(fxGit(main, ['add', opts.trackReport === false ? 'README.md' : '-A']), 'main add');
    fxExpect(fxGit(main, ['commit', '--quiet', '-m', `round-${round} fixture report`]), 'main commit');
    if (opts.mainUpstream !== false) fxUpstream(main);
    const origin = opts.origin === false ? join(base, 'no-origin') : (opts.origin ?? fxEmptyRepo(base));
    return { base, round, laneRepo, reports, main, rel, origin };
  };
  /* --tracked fixtures: a main repo whose `.ufo/reports/round-<N>/` holds the
     lane reports, with a chosen subset left out of the index. */
  const fxTrackedMain = (name, { rounds = [3, 4, 5], untracked = [] } = {}) => {
    const base = fxDir(name);
    const main = join(base, 'main');
    mkdirSync(main, { recursive: true });
    fxExpect(fxGit(main, ['init', '--quiet', '-b', 'main']), 'tracked main init');
    writeFileSync(join(main, 'README.md'), '# main fixture\n');
    fxExpect(fxGit(main, ['add', '-A']), 'tracked main add');
    fxExpect(fxGit(main, ['commit', '--quiet', '-m', 'main fixture seed']), 'tracked main commit');
    const reports = join(main, '.ufo', 'reports');
    const tracked = [];
    for (const round of rounds) {
      const rel = join('.ufo', 'reports', `round-${round}`, `${DEFAULT_LANE}.md`);
      mkdirSync(dirname(join(main, rel)), { recursive: true });
      writeFileSync(join(main, rel), fxBigReport(round));
      if (!untracked.includes(round)) tracked.push(rel);
    }
    if (tracked.length > 0) {
      fxExpect(fxGit(main, ['add', '--', ...tracked]), 'tracked main add reports');
      fxExpect(fxGit(main, ['commit', '--quiet', '-m', 'fixture lane reports']), 'tracked main commit reports');
    }
    return { base, main, reports };
  };
  const trackedArgs = (f, extra = []) => ['--tracked', '--lane', DEFAULT_LANE,
    '--reports-dir', f.reports, '--main-repo', f.main, ...extra];

  const auditArgs = (f, extra = []) => ['--round', String(f.round), '--repo', f.laneRepo,
    '--reports-dir', f.reports, '--main-repo', f.main, '--origin', f.origin, ...extra];
  const closeArgs = (f, extra = []) => ['--close', ...auditArgs(f, extra)];

  const parseFindings = (stdout) => String(stdout ?? '').split('\n')
    .map((l) => /^ROUND_GATE  (error|warning)  ([A-Z_]+)  (.*)$/u.exec(l))
    .filter(Boolean)
    .map((m) => { observed.add(m[2]); return { severity: m[1], kind: m[2], detail: m[3] }; });
  const verdictLine = (res) => String(res.stdout ?? '').trim().split('\n').filter(Boolean).at(-1) ?? '';
  const parseVerdict = (line) => {
    const m = /^ROUND_GATE: (CLEAN|DRIFT) \(round=(\d+) lane=(\S+) checks=(\d+) errors=(\d+) warnings=(\d+)\)$/u.exec(line);
    return m ? {
      verdict: m[1], round: Number(m[2]), lane: m[3], checks: Number(m[4]),
      errors: Number(m[5]), warnings: Number(m[6]),
    } : null;
  };
  const kindsEq = (res, expected) => {
    const got = parseFindings(res.stdout).map((f) => f.kind);
    return { ok: JSON.stringify(got) === JSON.stringify(expected), got };
  };

  try {
    /* 1 ── clean audit ----------------------------------------------------- */
    const clean = fxCloseFixture('clean-audit', { laneUpstream: false, mainUpstream: false });
    const r1 = runGate(auditArgs(clean));
    check('clean audit fixture → exit 0, CLEAN, checks=10, no findings', () => {
      const v = parseVerdict(verdictLine(r1));
      const k = kindsEq(r1, []);
      return {
        ok: r1.status === 0 && k.ok && v !== null && v.verdict === 'CLEAN' && v.checks === 10 && v.errors === 0 && v.warnings === 0,
        detail: `exit=${r1.status} ${verdictLine(r1)}`,
      };
    });

    /* 2 ── default --round ------------------------------------------------- */
    fxReports(clean.reports, [{ round: 2, text: fxBigReport(2) }]);
    const r2 = runGate(['--repo', clean.laneRepo, '--reports-dir', clean.reports, '--main-repo', clean.main, '--origin', clean.origin]);
    check('default --round = latest closed round for the lane (5, not 2)', () => {
      const v = parseVerdict(verdictLine(r2));
      return { ok: r2.status === 0 && v !== null && v.round === 5 && v.verdict === 'CLEAN', detail: `exit=${r2.status} ${verdictLine(r2)}` };
    });

    /* 3 ── REPORT_MISSING -------------------------------------------------- */
    const miss = fxCloseFixture('report-missing', { round: 7, report: false, laneUpstream: false, mainUpstream: false });
    const r3 = runGate(auditArgs(miss));
    check('REPORT_MISSING → exit 1, DRIFT, exactly [REPORT_MISSING], checks=5', () => {
      const k = kindsEq(r3, ['REPORT_MISSING']);
      const v = parseVerdict(verdictLine(r3));
      return { ok: r3.status === 1 && k.ok && v !== null && v.checks === 5 && v.errors === 1, detail: `exit=${r3.status} kinds=[${k.got}] ${verdictLine(r3)}` };
    });

    /* 4/5 ─ REPORT_THIN + text line format --------------------------------- */
    const thin = fxCloseFixture('report-thin', { reportText: fxThin(5), laneUpstream: false, mainUpstream: false });
    const thinBytes = Buffer.byteLength(fxThin(5), 'utf8');
    const r4 = runGate(auditArgs(thin));
    check('REPORT_THIN → exit 1, exactly [REPORT_THIN], detail `(bytes=<n>)`', () => {
      const f = parseFindings(r4.stdout);
      const k = kindsEq(r4, ['REPORT_THIN']);
      return {
        ok: r4.status === 1 && k.ok && f[0] && f[0].severity === 'error' && f[0].detail === `(bytes=${thinBytes})`
          && thinBytes < 1024,
        detail: `exit=${r4.status} detail=${f[0] ? f[0].detail : 'none'}`,
      };
    });
    check('text mode prints `ROUND_GATE  error  REPORT_THIN  (bytes=<n>)` (two-space columns)', () => ({
      ok: new RegExp(`^ROUND_GATE  error  REPORT_THIN  \\(bytes=${thinBytes}\\)$`, 'mu').test(String(r4.stdout ?? '')),
      detail: `line=${firstLine(String(r4.stdout ?? ''))}`,
    }));

    /* 6 ── REPORT_HEADINGS -------------------------------------------------- */
    const hless = fxCloseFixture('report-headings', { reportText: fxHeadingless(5), laneUpstream: false, mainUpstream: false });
    const r6 = runGate(auditArgs(hless));
    check('REPORT_HEADINGS → exactly [REPORT_HEADINGS, REPORT_SHONEN_MISSING] (headingless fixture)', () => {
      const k = kindsEq(r6, ['REPORT_HEADINGS', 'REPORT_SHONEN_MISSING']);
      const f = parseFindings(r6.stdout)[0];
      return { ok: r6.status === 1 && k.ok && f && f.detail === 'headings=0', detail: `exit=${r6.status} kinds=[${k.got}] ${f ? f.detail : ''}` };
    });

    /* 7 ── REPORT_ROUND_MISMATCH ------------------------------------------- */
    const mism = fxCloseFixture('report-mismatch', { reportText: fxMismatch(5), laneUpstream: false, mainUpstream: false });
    const r7 = runGate(auditArgs(mism));
    check('REPORT_ROUND_MISMATCH → exactly [REPORT_ROUND_MISMATCH]', () => {
      const k = kindsEq(r7, ['REPORT_ROUND_MISMATCH']);
      return { ok: r7.status === 1 && k.ok, detail: `exit=${r7.status} kinds=[${k.got}]` };
    });

    /* 8 ── prefix collision: `round-1` must not satisfy N=10 ---------------- */
    const coll = fxCloseFixture('collision-n10', { round: 10, reportText: fxMentions(10, 'round-1'), laneUpstream: false, mainUpstream: false });
    const r8 = runGate(auditArgs(coll));
    check('prefix collision: `round-1` does not satisfy N=10 → REPORT_ROUND_MISMATCH', () => {
      const k = kindsEq(r8, ['REPORT_ROUND_MISMATCH']);
      return { ok: r8.status === 1 && k.ok, detail: `exit=${r8.status} kinds=[${k.got}]` };
    });

    /* 9 ── mirror collision: `round-10` does not satisfy N=1 ---------------- */
    const coll2 = fxCloseFixture('collision-n1', { round: 1, reportText: fxMentions(1, 'round-10'), laneUpstream: false, mainUpstream: false });
    const r9 = runGate(auditArgs(coll2));
    check('mirror collision: `round-10` does not satisfy N=1 → REPORT_ROUND_MISMATCH', () => {
      const k = kindsEq(r9, ['REPORT_ROUND_MISMATCH']);
      return { ok: r9.status === 1 && k.ok, detail: `exit=${r9.status} kinds=[${k.got}]` };
    });

    /* 10 ─ SCORECARD_ROW_MISSING -------------------------------------------- */
    const norow = fxCloseFixture('scorecard-row', { scorecard: fxScorecard({ round: 5, row: false }), laneUpstream: false, mainUpstream: false });
    const r10 = runGate(auditArgs(norow));
    check('SCORECARD_ROW_MISSING → exactly [SCORECARD_ROW_MISSING]', () => {
      const k = kindsEq(r10, ['SCORECARD_ROW_MISSING']);
      return { ok: r10.status === 1 && k.ok, detail: `exit=${r10.status} kinds=[${k.got}]` };
    });
    /* 10b ─ a prose mention ending in `|` is not a table row (row regex is anchored) */
    const proserow = fxCloseFixture('scorecard-prose', {
      scorecard: '# Scorecard\n\nhistory: round   5 |\n\n## Planned\n\nround 6: next move.\n',
      laneUpstream: false, mainUpstream: false,
    });
    const r10b = runGate(auditArgs(proserow));
    check('SCORECARD_ROW_MISSING fires when `<N>` appears in prose ending `|` but no table row exists', () => {
      const k = kindsEq(r10b, ['SCORECARD_ROW_MISSING']);
      return { ok: r10b.status === 1 && k.ok, detail: `exit=${r10b.status} kinds=[${k.got}]` };
    });

    /* 11/12/13 ─ SCORECARD_PLAN_MISSING ------------------------------------- */
    const noplan = fxCloseFixture('plan-absent', { scorecard: fxScorecard({ round: 5, planned: null }), laneUpstream: false, mainUpstream: false });
    const r11 = runGate(auditArgs(noplan));
    check('SCORECARD_PLAN_MISSING (no ## Planned) → warning only, exit 0 CLEAN', () => {
      const k = kindsEq(r11, ['SCORECARD_PLAN_MISSING']);
      const f = parseFindings(r11.stdout)[0];
      const v = parseVerdict(verdictLine(r11));
      return {
        ok: r11.status === 0 && k.ok && f && f.severity === 'warning' && v !== null && v.verdict === 'CLEAN' && v.warnings === 1 && v.errors === 0,
        detail: `exit=${r11.status} ${f ? f.severity : ''} ${verdictLine(r11)}`,
      };
    });
    const offplan = fxCloseFixture('plan-other-round', { scorecard: fxScorecard({ round: 5, planned: 'round 3: an earlier move.' }), laneUpstream: false, mainUpstream: false });
    const r12 = runGate(auditArgs(offplan));
    check('SCORECARD_PLAN_MISSING when ## Planned names only a past round → warning only', () => {
      const k = kindsEq(r12, ['SCORECARD_PLAN_MISSING']);
      const f = parseFindings(r12.stdout)[0];
      return { ok: r12.status === 0 && k.ok && f && /later/u.test(f.detail), detail: `exit=${r12.status} detail=${f ? f.detail : ''}` };
    });
    /* 12b ─ a plan naming a round beyond N+1 still satisfies (round-10 live case:
       `## Planned` names round 11 while the audit pins round 9) */
    const farplan = fxCloseFixture('plan-future-round', { scorecard: fxScorecard({ round: 5, planned: 'round 11: the move after next.' }), laneUpstream: false, mainUpstream: false });
    const r12b = runGate(auditArgs(farplan));
    check('## Planned naming round 11 satisfies a round-5 audit (no false positive)', () => {
      const k = kindsEq(r12b, []);
      return { ok: r12b.status === 0 && k.ok, detail: `exit=${r12b.status} kinds=[${k.got}]` };
    });
    const onplan = fxCloseFixture('plan-names-next', { scorecard: fxScorecard({ round: 5, planned: 'round-6 is already planned as a range marker.' }), laneUpstream: false, mainUpstream: false });
    const r13 = runGate(auditArgs(onplan));
    check('## Planned body naming `round-6` satisfies the plan check (separator optional)', () => {
      const k = kindsEq(r13, []);
      return { ok: r13.status === 0 && k.ok, detail: `exit=${r13.status} kinds=[${k.got}]` };
    });

    /* 14 ─ strict promotes the warning -------------------------------------- */
    const r14 = runGate(auditArgs(noplan, ['--strict']));
    check('--strict promotes SCORECARD_PLAN_MISSING to exit 1, DRIFT, errors=0 warnings=1', () => {
      const v = parseVerdict(verdictLine(r14));
      return {
        ok: r14.status === 1 && v !== null && v.verdict === 'DRIFT' && v.errors === 0 && v.warnings === 1,
        detail: `exit=${r14.status} ${verdictLine(r14)}`,
      };
    });

    /* 15 ─ LOG_ENTRY_MISSING ------------------------------------------------ */
    const badlog = fxCloseFixture('log-entry', { log: '- 2026-01-02 — round 4 fixture entry (lane kumitate)\n', laneUpstream: false, mainUpstream: false });
    const r15 = runGate(auditArgs(badlog));
    check('LOG_ENTRY_MISSING → exactly [LOG_ENTRY_MISSING]', () => {
      const k = kindsEq(r15, ['LOG_ENTRY_MISSING']);
      return { ok: r15.status === 1 && k.ok, detail: `exit=${r15.status} kinds=[${k.got}]` };
    });

    /* 16/17/18 ─ COMMIT_MISSING --------------------------------------------- */
    const nomark = fxCloseFixture('commit-none', { subject: 'fixture seed without a round token', laneUpstream: false, mainUpstream: false });
    const r16 = runGate(auditArgs(nomark));
    check('COMMIT_MISSING (no marker) → exactly [COMMIT_MISSING]', () => {
      const k = kindsEq(r16, ['COMMIT_MISSING']);
      return { ok: r16.status === 1 && k.ok, detail: `exit=${r16.status} kinds=[${k.got}]` };
    });
    const wrongmark = fxCloseFixture('commit-wrong-round', { subject: 'round-9 fixture seed for another round', laneUpstream: false, mainUpstream: false });
    const r17 = runGate(auditArgs(wrongmark));
    check('COMMIT_MISSING (marker names the wrong N) → exactly [COMMIT_MISSING]', () => {
      const k = kindsEq(r17, ['COMMIT_MISSING']);
      return { ok: r17.status === 1 && k.ok, detail: `exit=${r17.status} kinds=[${k.got}]` };
    });
    const bodymark = fxCloseFixture('commit-body-marker', { subject: 'fixture seed (marker in body only)', body: 'Follow-up: this carries the round-5 marker in its body.', laneUpstream: false, mainUpstream: false });
    const r18 = runGate(auditArgs(bodymark));
    check('body-only marker satisfies COMMIT_MISSING scan (`--format=%B`) → no findings', () => {
      const k = kindsEq(r18, []);
      return { ok: r18.status === 0 && k.ok, detail: `exit=${r18.status} kinds=[${k.got}]` };
    });

    /* 19/20/21 ─ SHONEN ----------------------------------------------------- */
    const noshonen = fxCloseFixture('shonen-missing', { reportText: fxNoShonen(5), laneUpstream: false, mainUpstream: false });
    const r19 = runGate(auditArgs(noshonen));
    check('REPORT_SHONEN_MISSING → warning only, exit 0 CLEAN, warnings=1', () => {
      const k = kindsEq(r19, ['REPORT_SHONEN_MISSING']);
      const f = parseFindings(r19.stdout)[0];
      const v = parseVerdict(verdictLine(r19));
      return {
        ok: r19.status === 0 && k.ok && f && f.severity === 'warning' && v !== null && v.verdict === 'CLEAN' && v.warnings === 1,
        detail: `exit=${r19.status} ${verdictLine(r19)}`,
      };
    });
    const r20 = runGate(auditArgs(noshonen, ['--strict']));
    check('--strict promotes REPORT_SHONEN_MISSING to exit 1, DRIFT', () => {
      const v = parseVerdict(verdictLine(r20));
      return { ok: r20.status === 1 && v !== null && v.verdict === 'DRIFT' && v.warnings === 1, detail: `exit=${r20.status} ${verdictLine(r20)}` };
    });
    const lowshonen = fxCloseFixture('shonen-lowercase', {
      reportText: `# lane report\n\n### shonen\n\n- lowercase heading\n\n## Findings\n\n${`The round-5 fixture landed. `.repeat(40)}`,
      laneUpstream: false, mainUpstream: false,
    });
    const r21 = runGate(auditArgs(lowshonen));
    check('`### shonen` (lowercase, level 3) satisfies the SHONEN check → no findings', () => {
      const k = kindsEq(r21, []);
      return { ok: r21.status === 0 && k.ok, detail: `exit=${r21.status} kinds=[${k.got}]` };
    });

    /* 22/23 ─ cited commits ------------------------------------------------ */
    const unreso = fxCloseFixture('cited-unresolved', {
      reportText: fxBigReport(5, '\nCited commit: `deadbeef1234`.\n'),
      laneUpstream: false, mainUpstream: false,
    });
    const r22 = runGate(auditArgs(unreso));
    check('COMMIT_CITED_UNRESOLVED → exactly [COMMIT_CITED_UNRESOLVED]', () => {
      const k = kindsEq(r22, ['COMMIT_CITED_UNRESOLVED']);
      const f = parseFindings(r22.stdout)[0];
      return { ok: r22.status === 1 && k.ok && f && f.detail.includes('deadbeef1234'), detail: `exit=${r22.status} ${f ? f.detail : ''}` };
    });
    const naBase = fxDir('cited-not-ancestor');
    const naLane = fxLaneRepo(naBase, { round: 5 });
    fxExpect(fxGit(naLane, ['checkout', '--quiet', '-b', 'side']), 'checkout side');
    writeFileSync(join(naLane, 'side.txt'), 'side work\n');
    fxExpect(fxGit(naLane, ['add', '-A']), 'side add');
    fxExpect(fxGit(naLane, ['commit', '--quiet', '-m', 'side branch work']), 'side commit');
    const sideSha = fxGit(naLane, ['rev-parse', 'HEAD']).stdout.trim();
    fxExpect(fxGit(naLane, ['checkout', '--quiet', 'main']), 'checkout main');
    const naReports = fxReports(join(naBase, 'reports'), [{ round: 5, text: fxBigReport(5, `\nCited side commit: \`${sideSha}\`.\n`) }]);
    const naMain = join(naBase, 'main');
    mkdirSync(naMain, { recursive: true });
    fxExpect(fxGit(naMain, ['init', '--quiet', '-b', 'main']), 'na main init');
    const naOrigin = fxEmptyRepo(naBase);
    const r23 = runGate(['--round', '5', '--repo', naLane, '--reports-dir', naReports, '--main-repo', naMain, '--origin', naOrigin]);
    check('COMMIT_CITED_NOT_ANCESTOR → exactly [COMMIT_CITED_NOT_ANCESTOR] (side-branch commit)', () => {
      const k = kindsEq(r23, ['COMMIT_CITED_NOT_ANCESTOR']);
      const f = parseFindings(r23.stdout)[0];
      return {
        ok: r23.status === 1 && k.ok && f && f.detail.includes(sideSha.slice(0, 7)) && sideSha.length === 40,
        detail: `exit=${r23.status} ${f ? f.detail : ''}`,
      };
    });
    /* 24 ─ external citation resolves in --origin, never a finding ---------- */
    const extBase = fxDir('cited-external');
    const extLane = fxLaneRepo(extBase, { round: 5 });
    const extOrigin = fxEmptyRepo(extBase, 'origin');
    writeFileSync(join(extOrigin, 'origin.txt'), 'origin work\n');
    fxExpect(fxGit(extOrigin, ['add', '-A']), 'origin add');
    fxExpect(fxGit(extOrigin, ['commit', '--quiet', '-m', 'origin fixture commit']), 'origin commit');
    const originSha = fxGit(extOrigin, ['rev-parse', 'HEAD']).stdout.trim();
    const extReports = fxReports(join(extBase, 'reports'), [{ round: 5, text: fxBigReport(5, `\nOrigin HEAD \`${originSha}\`.\n`) }]);
    const extMain = join(extBase, 'main');
    mkdirSync(extMain, { recursive: true });
    fxExpect(fxGit(extMain, ['init', '--quiet', '-b', 'main']), 'ext main init');
    const r24 = runGate(['--round', '5', '--repo', extLane, '--reports-dir', extReports, '--main-repo', extMain, '--origin', extOrigin]);
    check('a token resolving in --origin is external (no finding) and lands in --json citations.external', () => {
      const k = kindsEq(r24, []);
      const j = JSON.parse(runGate(['--round', '5', '--repo', extLane, '--reports-dir', extReports, '--main-repo', extMain, '--origin', extOrigin, '--json']).stdout);
      return {
        ok: r24.status === 0 && k.ok && j.citations.external.includes(originSha),
        detail: `exit=${r24.status} external=${JSON.stringify(j.citations.external)}`,
      };
    });

    /* 25/26 ─ close clean + TREE_DIRTY ------------------------------------- */
    const closeClean = fxCloseFixture('close-clean');
    const r25 = runGate(closeArgs(closeClean));
    check('--close on a clean, pushed fixture → exit 0, CLEAN, checks=13', () => {
      const v = parseVerdict(verdictLine(r25));
      const k = kindsEq(r25, []);
      return {
        ok: r25.status === 0 && k.ok && v !== null && v.verdict === 'CLEAN' && v.checks === 13,
        detail: `exit=${r25.status} ${verdictLine(r25)}`,
      };
    });
    const dirtyBase = fxCloseFixture('tree-dirty');
    for (let i = 1; i <= 6; i++) writeFileSync(join(dirtyBase.laneRepo, `scratch-${i}.txt`), `${i}\n`);
    const r26 = runGate(closeArgs(dirtyBase));
    check('TREE_DIRTY → exactly [TREE_DIRTY], detail names entries=6 and the first 5 only', () => {
      const k = kindsEq(r26, ['TREE_DIRTY']);
      const f = parseFindings(r26.stdout)[0];
      const d = f ? f.detail : '';
      return {
        ok: r26.status === 1 && k.ok && d.includes('entries=6') && d.includes('scratch-1.txt') && d.includes('scratch-5.txt') && !d.includes('scratch-6.txt'),
        detail: `exit=${r26.status} ${d}`,
      };
    });

    /* 27 ─ UNPUSHED --------------------------------------------------------- */
    const unpushedBase = fxCloseFixture('unpushed');
    writeFileSync(join(unpushedBase.laneRepo, 'POST.md'), 'post-close scratch\n');
    fxExpect(fxGit(unpushedBase.laneRepo, ['add', '-A']), 'post add');
    fxExpect(fxGit(unpushedBase.laneRepo, ['commit', '--quiet', '-m', 'post-close scratch']), 'post commit');
    const r27 = runGate(closeArgs(unpushedBase));
    check('UNPUSHED → exactly [UNPUSHED], detail `ahead=1`', () => {
      const k = kindsEq(r27, ['UNPUSHED']);
      const f = parseFindings(r27.stdout)[0];
      return { ok: r27.status === 1 && k.ok && f && f.detail === 'ahead=1', detail: `exit=${r27.status} ${f ? f.detail : ''}` };
    });

    /* 28/29 ─ REPORT_UNTRACKED --------------------------------------------- */
    const untracked = fxCloseFixture('report-untracked', { trackReport: false });
    const r28 = runGate(closeArgs(untracked));
    check('REPORT_UNTRACKED (ls-files) → exactly [REPORT_UNTRACKED]', () => {
      const k = kindsEq(r28, ['REPORT_UNTRACKED']);
      const f = parseFindings(r28.stdout)[0];
      return { ok: r28.status === 1 && k.ok && f && f.detail.startsWith('ls-files:'), detail: `exit=${r28.status} ${f ? f.detail : ''}` };
    });
    const unpushedReport = fxCloseFixture('report-unpushed');
    writeFileSync(join(unpushedReport.main, unpushedReport.rel), `${fxBigReport(5)}\n<!-- fixture edit -->\n`);
    fxExpect(fxGit(unpushedReport.main, ['add', '--', unpushedReport.rel]), 'report edit add');
    fxExpect(fxGit(unpushedReport.main, ['commit', '--quiet', '-m', 'report edit after push']), 'report edit commit');
    const r29 = runGate(closeArgs(unpushedReport));
    check('REPORT_UNTRACKED (tracked but unpushed) → exactly [REPORT_UNTRACKED] via `@{u}..HEAD`', () => {
      const k = kindsEq(r29, ['REPORT_UNTRACKED']);
      const f = parseFindings(r29.stdout)[0];
      return {
        ok: r29.status === 1 && k.ok && f && f.detail === `unpushed: ${unpushedReport.rel}`,
        detail: `exit=${r29.status} ${f ? f.detail : ''}`,
      };
    });

    /* 30-35 ─ fail-closed arms --------------------------------------------- */
    const fcA = runGate(['--round', '5', '--repo', clean.laneRepo, '--reports-dir', join(clean.base, 'no-such-reports')]);
    check('fail-closed: --reports-dir missing → exit 2 (REPORTS_DIR_MISSING)', () => ({
      ok: fcA.status === 2 && /ROUND_GATE: FAIL-CLOSED \(REPORTS_DIR_MISSING\)/u.test(String(fcA.stdout ?? '')),
      detail: `exit=${fcA.status} ${firstLine(String(fcA.stdout ?? ''))}`,
    }));
    const fcB = runGate(['--round', '5', '--repo', join(clean.base, 'reports')]);
    check('fail-closed: --repo is a plain dir (not a work tree) → exit 2 (NOT_A_GIT_WORKTREE)', () => ({
      ok: fcB.status === 2 && /NOT_A_GIT_WORKTREE/u.test(String(fcB.stdout ?? '')),
      detail: `exit=${fcB.status} ${firstLine(String(fcB.stdout ?? ''))}`,
    }));
    const fcC = runGate(['--round', '5', '--repo', join(clean.base, 'does-not-exist')]);
    check('fail-closed: --repo does not exist → exit 2', () => ({
      ok: fcC.status === 2 && /NOT_A_GIT_WORKTREE/u.test(String(fcC.stdout ?? '')),
      detail: `exit=${fcC.status}`,
    }));
    const emptyRep = fxDir('no-closed-round');
    mkdirSync(join(emptyRep, 'round-3'), { recursive: true });
    writeFileSync(join(emptyRep, 'round-3', 'other.md'), '# other lane\n\n## x\n');
    const fcD = runGate(['--repo', clean.laneRepo, '--reports-dir', emptyRep, '--main-repo', clean.main, '--origin', clean.origin]);
    check('fail-closed: no closed round derivable (no --round, no <lane>.md) → exit 2 (NO_CLOSED_ROUND)', () => ({
      ok: fcD.status === 2 && /NO_CLOSED_ROUND/u.test(String(fcD.stdout ?? '')),
      detail: `exit=${fcD.status} ${firstLine(String(fcD.stdout ?? ''))}`,
    }));
    const noUpstream = fxCloseFixture('close-no-upstream', { laneUpstream: false });
    const fcE = runGate(closeArgs(noUpstream));
    check('fail-closed: --close with no upstream on --repo → exit 2 (UPSTREAM_MISSING)', () => ({
      ok: fcE.status === 2 && /UPSTREAM_MISSING/u.test(String(fcE.stdout ?? '')) && /no upstream|exit 128/u.test(String(fcE.stdout ?? '')),
      detail: `exit=${fcE.status} ${firstLine(String(fcE.stdout ?? ''))}`,
    }));
    const nonGitMain = fxDir('non-git-main');
    const fcF = runGate(closeArgs({ ...closeClean, main: nonGitMain }));
    check('fail-closed: --close with a non-git --main-repo → exit 2 (MAIN_REPO_NOT_GIT)', () => ({
      ok: fcF.status === 2 && /MAIN_REPO_NOT_GIT/u.test(String(fcF.stdout ?? '')),
      detail: `exit=${fcF.status} ${firstLine(String(fcF.stdout ?? ''))}`,
    }));

    /* 36-40 ─ usage arms ---------------------------------------------------- */
    const u1 = runGate(['--bogus']);
    check('usage: unknown flag → exit 64 with usage on stderr', () => ({
      ok: u1.status === 64 && /unknown argument/u.test(String(u1.stderr ?? '')) && /usage:/u.test(String(u1.stderr ?? '')),
      detail: `exit=${u1.status} ${firstLine(String(u1.stderr ?? ''))}`,
    }));
    const u2 = runGate(['--round', 'abc']);
    check('usage: non-numeric --round → exit 64', () => ({
      ok: u2.status === 64 && /--round requires/u.test(String(u2.stderr ?? '')),
      detail: `exit=${u2.status}`,
    }));
    const u3 = runGate(['--round']);
    check('usage: --round without a value → exit 64', () => ({
      ok: u3.status === 64 && /--round requires/u.test(String(u3.stderr ?? '')),
      detail: `exit=${u3.status}`,
    }));
    const u4 = runGate(['--lane', 'bad lane!']);
    check('usage: invalid --lane → exit 64', () => ({
      ok: u4.status === 64 && /--lane must match/u.test(String(u4.stderr ?? '')),
      detail: `exit=${u4.status}`,
    }));
    const u5 = runGate(['--repo', '']);
    check('usage: empty --repo value → exit 64', () => ({
      ok: u5.status === 64 && /--repo requires a non-empty directory/u.test(String(u5.stderr ?? '')),
      detail: `exit=${u5.status}`,
    }));

    /* 41-43 ─ --json -------------------------------------------------------- */
    const jClean = runGate(auditArgs(clean, ['--json']));
    check('--json shape: frozen keys, contract id, checks=10, findings=[]', () => {
      const j = JSON.parse(jClean.stdout);
      const keys = Object.keys(j).sort();
      const expected = ['checks', 'citations', 'contract', 'durationMs', 'errors', 'findings', 'lane', 'mode',
        'repo', 'reportsDir', 'round', 'verdict', 'warnings'].sort();
      const shape = j.checks.every((c) => typeof c.id === 'string' && typeof c.severity === 'string'
        && typeof c.ok === 'boolean' && typeof c.detail === 'string');
      return {
        ok: jClean.status === 0 && JSON.stringify(keys) === JSON.stringify(expected)
          && j.contract === 'kumitate-round-gate-v1'
          && /"contract": "kumitate-round-gate-v1"/u.test(String(jClean.stdout ?? ''))
          && j.mode === 'audit' && j.round === 5 && j.verdict === 'CLEAN' && j.checks.length === 10
          && j.findings.length === 0 && j.errors === 0 && j.warnings === 0 && typeof j.durationMs === 'number'
          && shape && j.citations.checked === 0,
        detail: `exit=${jClean.status} keys=${keys.join(',')} checks=${j.checks.length}`,
      };
    });
    const jDrift = runGate(auditArgs(miss, ['--json']));
    check('--json drift: verdict DRIFT, findings carry severity/kind/detail', () => {
      const j = JSON.parse(jDrift.stdout);
      const f = j.findings[0] ?? {};
      return {
        ok: jDrift.status === 1 && j.verdict === 'DRIFT' && j.findings.length === 1 && f.kind === 'REPORT_MISSING'
          && f.severity === 'error' && typeof f.detail === 'string' && j.errors === 1,
        detail: `exit=${jDrift.status} findings=${JSON.stringify(j.findings.map((x) => x.kind))}`,
      };
    });
    const jFc = runGate(['--json', '--round', '5', '--repo', clean.laneRepo, '--reports-dir', join(clean.base, 'nope')]);
    check('--json fail-closed: one schema object with verdict FAIL-CLOSED and the token as the finding kind', () => {
      const j = JSON.parse(jFc.stdout);
      return {
        ok: jFc.status === 2 && j.contract === CONTRACT && j.verdict === 'FAIL-CLOSED'
          && j.findings.length === 1 && j.findings[0].kind === 'REPORTS_DIR_MISSING' && j.errors === 1,
        detail: `exit=${jFc.status} verdict=${j.verdict} kind=${j.findings[0] && j.findings[0].kind}`,
      };
    });

    /* 44/45 ─ env overrides ------------------------------------------------- */
    const envLaneBase = fxCloseFixture('env-lane', { report: false, laneUpstream: false, mainUpstream: false });
    fxReports(envLaneBase.reports, [{ round: 5, lane: 'other', text: fxBigReport(5) }]);
    const r44 = runGate(['--round', '5', '--repo', envLaneBase.laneRepo], {
      KUMITATE_REPORTS_DIR: envLaneBase.reports,
      KUMITATE_MAIN_REPO: envLaneBase.main,
      KUMITATE_LANE: 'other',
    });
    check('env override: KUMITATE_REPORTS_DIR/MAIN_REPO/LANE are honored (lane=other via env)', () => {
      const v = parseVerdict(verdictLine(r44));
      return {
        ok: r44.status === 0 && v !== null && v.lane === 'other' && v.round === 5 && v.verdict === 'CLEAN',
        detail: `exit=${r44.status} ${verdictLine(r44)}`,
      };
    });
    const emptyReports = fxDir('env-empty-reports');
    const r45 = runGate(['--round', '5', '--lane', 'kumitate', '--repo', clean.laneRepo,
      '--reports-dir', clean.reports, '--main-repo', clean.main, '--origin', clean.origin], {
      KUMITATE_REPORTS_DIR: emptyReports,
      KUMITATE_MAIN_REPO: emptyReports,
      KUMITATE_LANE: 'envlane',
    });
    check('precedence: CLI --reports-dir/--lane beat a polluted env (flag > env)', () => {
      const v = parseVerdict(verdictLine(r45));
      return {
        ok: r45.status === 0 && v !== null && v.round === 5 && v.lane === 'kumitate' && v.verdict === 'CLEAN',
        detail: `exit=${r45.status} ${verdictLine(r45)}`,
      };
    });

    /* 46 ─ hermeticity under a polluted env + bogus flags ------------------- */
    if (process.env.KUMITATE_ROUND_GATE_NESTED === '1') {
      results.push({ name: 'hermeticity: nested --selftest under a polluted env', ok: true, skipped: true, detail: 'SKIP(nested) — parent run already spawned this suite once' });
    } else {
      const nestedEnv = {
        ...cleanEnv(),
        KUMITATE_ROUND_GATE_NESTED: '1',
        KUMITATE_REPORTS_DIR: '/nonexistent/corpus',
        KUMITATE_MAIN_REPO: '/nonexistent/main',
        KUMITATE_LANE: 'not-a-lane',
        UFO_SRC: '/nonexistent/origin',
      };
      const nested = spawnSync(process.execPath,
        [SELF, '--selftest', '--repo', '/nonexistent/repo', '--reports-dir', '/nonexistent/reports',
          '--main-repo', '/nonexistent/main', '--origin', '/nonexistent/origin'],
        { encoding: 'utf8', timeout: 120_000, maxBuffer: 32 * 1024 * 1024, env: nestedEnv });
      check('hermeticity: --selftest passes under a polluted env and bogus dir flags', () => {
        const tail = String(nested.stdout ?? '').trim().split('\n');
        return {
          ok: nested.status === 0 && /^ROUND_GATE_SELFTEST: \d+\/\d+ pass$/u.test(tail.at(-2) ?? '')
            && tail.at(-1) === 'VERDICT: PASS',
          detail: `exit=${nested.status} tail=${tail.slice(-2).join(' | ')}`,
        };
      });
    }

    /* --tracked mode (round-11) ---------------------------------------------- */
    const tkClean = fxTrackedMain('tracked-clean');
    const rt1 = runGate(trackedArgs(tkClean));
    check('--tracked: 3 filed reports, highest excluded, rest tracked → exit 0, CLEAN, checked=2', () => {
      const line = verdictLine(rt1);
      const m = /^ROUND_GATE: CLEAN \(mode=tracked checked=(\d+) errors=(\d+) warnings=(\d+)\)$/u.exec(line);
      const k = kindsEq(rt1, []);
      return {
        ok: rt1.status === 0 && m !== null && Number(m[1]) === 2 && Number(m[2]) === 0 && Number(m[3]) === 0 && k.ok,
        detail: `exit=${rt1.status} ${line}`,
      };
    });
    const tkOld = fxTrackedMain('tracked-oldest-untracked', { untracked: [3] });
    const rt2 = runGate(trackedArgs(tkOld));
    check('--tracked: oldest filed report untracked → exit 1, DRIFT, exactly [REPORT_UNTRACKED]', () => {
      const k = kindsEq(rt2, ['REPORT_UNTRACKED']);
      const f = parseFindings(rt2.stdout)[0];
      const rel = join('.ufo', 'reports', 'round-3', `${DEFAULT_LANE}.md`);
      return {
        ok: rt2.status === 1 && k.ok
          && /^ROUND_GATE: DRIFT \(mode=tracked checked=2 errors=1 warnings=0\)$/u.test(verdictLine(rt2))
          && f !== undefined && f.severity === 'error'
          && f.detail === `ls-files: ${rel} is not tracked in ${tkOld.main}`,
        detail: `exit=${rt2.status} ${verdictLine(rt2)} ${f ? f.detail : ''}`,
      };
    });
    const tkOne = fxTrackedMain('tracked-single-report', { rounds: [7] });
    const rt3 = runGate(trackedArgs(tkOne));
    check('--tracked: only one filed report (the in-flight round) → exit 2 (NO_FILED_REPORTS)', () => ({
      ok: rt3.status === 2 && /ROUND_GATE: FAIL-CLOSED \(NO_FILED_REPORTS\)/u.test(String(rt3.stdout ?? ''))
        && /filed=1 round-<N>\/kumitate\.md/u.test(String(rt3.stdout ?? '')),
      detail: `exit=${rt3.status} ${firstLine(String(rt3.stdout ?? ''))}`,
    }));
    const rt4 = runGate(['--tracked', '--close']);
    check('usage: --tracked with --close → exit 64 (mutually exclusive modes)', () => ({
      ok: rt4.status === 64 && /mutually exclusive/u.test(String(rt4.stderr ?? ''))
        && /usage:/u.test(String(rt4.stderr ?? '')),
      detail: `exit=${rt4.status} ${firstLine(String(rt4.stderr ?? ''))}`,
    }));
    const tkNoMain = join(tkClean.base, 'not-a-repo');
    mkdirSync(tkNoMain, { recursive: true });
    const rt5 = runGate(['--tracked', '--lane', DEFAULT_LANE, '--reports-dir', tkClean.reports],
      { KUMITATE_MAIN_REPO: tkNoMain });
    check('fail-closed: --tracked with no usable --main-repo → exit 2 (MAIN_REPO_NOT_GIT)', () => ({
      ok: rt5.status === 2 && /ROUND_GATE: FAIL-CLOSED \(MAIN_REPO_NOT_GIT\)/u.test(String(rt5.stdout ?? '')),
      detail: `exit=${rt5.status} ${firstLine(String(rt5.stdout ?? ''))}`,
    }));
    const tkOut = fxTrackedMain('tracked-outside');
    const stray = join(tkOut.base, 'stray-reports');
    for (const round of [3, 4, 5]) {
      mkdirSync(join(stray, `round-${round}`), { recursive: true });
      writeFileSync(join(stray, `round-${round}`, `${DEFAULT_LANE}.md`), fxBigReport(round));
    }
    const rt6 = runGate(['--tracked', '--lane', DEFAULT_LANE, '--reports-dir', stray, '--main-repo', tkOut.main]);
    check('--tracked: reports under a dir outside --main-repo → one REPORT_UNTRACKED per report (`outside …`)', () => {
      const k = kindsEq(rt6, ['REPORT_UNTRACKED', 'REPORT_UNTRACKED']);
      const f = parseFindings(rt6.stdout)[0];
      return {
        ok: rt6.status === 1 && k.ok && f !== undefined && f.detail.startsWith(`outside --main-repo ${tkOut.main}:`),
        detail: `exit=${rt6.status} kinds=[${k.got.join(' ')}]`,
      };
    });
    const rt7 = runGate(trackedArgs(tkClean, ['--json']));
    check('--tracked --json: mode=tracked, checked=2, excludedRound=5, findings=[]', () => {
      const j = JSON.parse(rt7.stdout);
      return {
        ok: rt7.status === 0 && j.contract === CONTRACT && j.mode === 'tracked' && j.checked === 2
          && j.excludedRound === 5 && j.findings.length === 0 && j.errors === 0 && j.warnings === 0,
        detail: `exit=${rt7.status} mode=${j.mode} checked=${j.checked} excludedRound=${j.excludedRound}`,
      };
    });
    const rt8 = runGate(trackedArgs(tkClean, ['--repo', join(tkClean.base, 'no-such-lane-repo')]));
    check('--tracked runs no other audit check: a bogus --repo does not change the verdict', () => {
      const k = kindsEq(rt8, []);
      return {
        ok: rt8.status === 0 && k.ok && /^ROUND_GATE: CLEAN \(mode=tracked checked=2 /u.test(verdictLine(rt8)),
        detail: `exit=${rt8.status} ${verdictLine(rt8)}`,
      };
    });

    /* 47 ─ meta: every frozen kind fires ------------------------------------ */
    check('every declared finding kind fires in at least one fixture', () => {
      const missing = FINDING_KINDS.filter((k) => !observed.has(k));
      return {
        ok: missing.length === 0,
        detail: missing.length ? `never fired: ${missing.join(', ')}` : `${observed.size} kinds observed`,
      };
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const passed = results.filter((r) => r.ok).length;
  const width = String(results.length).length;
  const lines = [`kumitate round-gate --selftest (hermetic, node ${process.version})`];
  results.forEach((r, i) => {
    const word = r.skipped ? 'SKIP' : r.ok ? 'PASS' : 'FAIL';
    lines.push(`${word}  [${String(i + 1).padStart(width)}/${results.length}]  ${r.name} — ${r.detail}`);
  });
  lines.push(`ROUND_GATE_SELFTEST: ${passed}/${results.length} pass`);
  lines.push(`VERDICT: ${passed === results.length ? 'PASS' : 'FAIL'}`);
  process.stdout.write(`${lines.join('\n')}\n`);
  return passed === results.length ? 0 : 1;
}

process.exitCode = main();
