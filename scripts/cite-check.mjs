#!/usr/bin/env node
/**
 * cite-check.mjs — mechanical citation re-verifier for the kumitate-shokunin docs.
 *
 * Re-resolves every path / line / symbol / pin citation written in `SKILL.md`
 * and `corpus/**\/*.md` against the live trees. Read-only, zero deps, ESM,
 * node >= 20. Contract: kumitate-cite-check-v1 (parent-frozen v1.5).
 *
 *   node scripts/cite-check.mjs [--src DIR] [--self DIR] [--fleet DIR]
 *                              [--json] [--strict] [--symbols] [--all]
 *                              [--selftest|--self-test] [--integrations]
 *
 * Grammar
 *   Token census: single-backtick spans and `«…»` verbatim-quote spans outside
 *   ``` fences (SKILL.md + corpus/**).
 *   Quote pairing runs first: a `«` opens and the next `»` closes, and the pair
 *   may cross newlines — the house's multi-line verbatim-quote convention (e.g.
 *   corpus/knowledge/kimi-binary-secrets.md:64-68). A lone `«` stays prose, never
 *   an error. Quoted content is span content, so a citation inside a quote is
 *   censused, and each byte is covered by exactly one span (a quote nested in a
 *   backtick span, or the other way round, is never counted twice).
 *   Backtick pairing is line-local: within a line, backticks pair left-to-right
 *   and a line with an odd count leaves its final backtick unpaired, so no
 *   backtick span crosses a newline (an escaped `\`` is a literal, never a
 *   delimiter). Multi-line backtick spans are not part of this grammar.
 *   Fence byte-ranges are masked (spaces, same length, newlines kept) before the
 *   span/prose/ref scans, so a fence marker can never pair with an inline span's
 *   backtick. Detection is marker-symmetric (``` closes ```, ~~~ closes ~~~, no
 *   cross-closing); an unclosed fence masks to end of file.
 *   Line refs (`:N`, `:N-M`, `:N+`, `L<N>`, `L<N-M>`, `~L<N>`, `/`-chains such as
 *   `:7681/:7685/:7817`) are read everywhere outside fences — a ref adjacent to a
 *   path token belongs to that token, else to the file's sticky owner (the most
 *   recent explicit source-path citation; an in-file declaration such as
 *   "Citations `L<line>` are this file" rebinds it to the file cited first).
 *   A ref with no owner is ORPHAN_REF (warn). Prose tokens are resolved silently,
 *   only to own their refs.
 *   Pins: `<rev|revision|rev-pinned|HEAD|commit|sha256|pinned>` + optional
 *   `sha256`, backticks/whitespace, then 7-40 hex. A bare hex with no marker word
 *   is never a pin.
 *
 * Resolution ladder (first hit wins, each hit tagged)
 *   1 file-relative  relative to the containing doc's directory
 *   2 self           the kumitate doc tree (--self)
 *   3 fleet          parent of --self (--fleet): fleet-parent docs + sibling lanes
 *   4 src            source tree (--src): exact -> file context -> suffix ->
 *                    source-root precedence (crates/*\/src/ > scripts/ > config/ >
 *                    conformance/ > tests/) -> AMBIG
 *   Non-src namespaces (informational): runtime (run-state artifacts),
 *   generated (`$OUT_DIR`: probed under target/*\/build/*\/out, never a
 *   resolution target), home-config (`~/.omp`, `.config/omp`), foreign-root
 *   (absolute paths), fragment / ignored-fragment (globs, extension-only,
 *   placeholders, URIs). node_modules/ .git/ target/ .ufo/ are pruned from the
 *   index and never used as resolution targets.
 *   Round-27 adjudicated false positives are exempted ahead of the UNRESOLVED
 *   arm as three exact-shape namespaces (extension-list, runtime-artifact,
 *   binary-internal); see the EXEMPTION block above `fragmentKind`. Each fires
 *   only for a token that does not resolve under --src, so a real citation is
 *   never shadowed.
 *
 * Findings
 *   error UNRESOLVED LINE_OOR REV_UNKNOWN PIN_MISMATCH SYMBOL_OFF_LINE
 *         SELF_MISSING FLEET_MISSING
 *   warn  AMBIG SUFFIX_RESOLVED RUNTIME_UNRESOLVED SYMBOL_MISS ORPHAN_REF
 *   note  OK RESOLVED_BY_CONTEXT RESOLVED_BY_PRECEDENCE PIN_UNTYPED
 *         FRAGMENT (fragment/ignored-fragment classes, runtime, generated,
 *         home-config, foreign-root)
 *         FP_EXEMPT (round-27 exemption classes extension-list,
 *         runtime-artifact, binary-internal — reported, never dropped)
 *   exit 0 CLEAN · 1 DRIFT (error, or warn under --strict) · 2 fail-closed
 *        (missing/non-dir --src or --self, empty scan set, zero resolutions)
 *   64 usage error. No file text, env value, or symbol body is ever printed.
 *
 * Suite groups (--selftest | --integrations)
 *   hermetic     fixture-only checks over a synthetic tree in the system temp dir.
 *                Never reads --src or --self; MUST PASS in any repo state. This is
 *                the whole of --selftest.
 *   integration  live-tree assertions (--src/--self): the F1-F4 repair classes, the
 *                good-sample set, the symbol-machinery mutation copy, and the pruned
 *                index size. Run only by --integrations. Its failures are reported
 *                with the live error findings underneath them, never suppressed.
 *   --selftest runs hermetic only · --integrations alone runs the integration group ·
 *   --selftest --integrations runs both. Every executed group prints its own
 *   `n/m cases passed (group)` line; the run ends with one `VERDICT: PASS|FAIL` over
 *   the executed groups, and exits 0 iff every executed group passes. With --json the
 *   suite emits {schema,suites,verdict} instead of text.
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'kumitate-cite-check-v1';
const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SELF = resolve(HERE, '..');
/**
 * Candidate origin-tree locations, canonical first. The operator restructure of
 * 2026-10-12 moved the tree from `origin-work/ufo-fsd-alpha` to
 * `Projects/ufo-fsd-alpha`; the default is derived from this list, never
 * hardcoded to either (round-17 precedent: derive the default, do not hardcode).
 */
const SRC_CANDIDATES = [
  join(homedir(), 'Projects', 'ufo-fsd-alpha'),
  join(homedir(), 'Projects', 'origin-work', 'ufo-fsd-alpha'),
];
/**
 * The origin-tree default: `$UFO_SRC` wins, else the first candidate that
 * exists, else the canonical candidate — which is not a directory and so keeps
 * the `--src` fail-closed refusal (exit 2, never a scored zero). Resolved lazily
 * and never in `--selftest`, so the hermetic suite stats no live path.
 */
function resolveSrcDefault() {
  if (process.env.UFO_SRC) return process.env.UFO_SRC;
  for (const c of SRC_CANDIDATES) if (existsSync(c)) return c;
  return SRC_CANDIDATES[0];
}
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'target', '.ufo']);

/** Source-root precedence for ambiguous basenames (parent-frozen). */
const ROOT_PRECEDENCE = [
  /^crates\/[^/]+\/src\//,
  /^scripts\//,
  /^config\//,
  /^conformance\//,
  /^tests\//,
];

/**
 * Token-keyed maps MUST be null-prototype. A plain object literal resolves an
 * inherited key — `ALIASES['toString']` yields `Object.prototype.toString`, not
 * `undefined` — so a backticked `toString`/`valueOf`/`constructor` token in a doc
 * used to pass the path guard and reach `aliasRec`, which then joined `opts.src`
 * with a function: uncaught `ERR_INVALID_ARG_TYPE`, no verdict line, gate dead.
 * `GENERATED_POINTERS['toString']` had the same shape (spread of a function).
 * Repair: round 13, regression case `prototype-member token` in the hermetic suite.
 */
const nullProto = (entries) => Object.freeze(Object.assign(Object.create(null), entries));

/** Path shorthands found in the docs (data-driven; see report). */
const ALIASES = nullProto({
  cli: 'crates/ufo-cli/src/main.rs',
  dispatcher: 'scripts/fleet-dispatcher.mjs',
  base: 'scripts/ufo-sighting-lib/base.mjs',
});

/**
 * Alias expansion is citation-shaped only (round 25). The ALIASES keys are bare
 * words (`base`, `cli`, `dispatcher`) that also occur as ordinary prose; the
 * span/prose scans used to expand any of them, so a bare backticked `base`
 * minted a citation to scripts/ufo-sighting-lib/base.mjs and the sticky-owner
 * fallback then hashed all seven @sha256 pins in
 * corpus/knowledge/kimi-binary-secrets.md against that unrelated file (false
 * PIN_MISMATCHs; the pins are true). An expansion now requires the author's own
 * citation evidence: an attached line ref (`base:1233`, `base:1233-1235`,
 * `cli:L12`). Writing the alias VALUE verbatim
 * (`scripts/ufo-sighting-lib/base.mjs`) is a plain path and never reaches this
 * predicate. Regression cases `alias: …` in the hermetic suite.
 */
function aliasCited(word, hasRef) {
  return Boolean(ALIASES[word]) && Boolean(hasRef);
}
const SHORTHAND_PATHS = nullProto({
  'cli/main.rs': 'crates/ufo-cli/src/main.rs',
});
/** Prefixes that make an unresolved path real drift rather than prose. */
const SOURCE_PREFIXES = [
  'crates/', 'scripts/', 'config/', 'conformance/', 'tests/', 'docs/', 'packages/', 'skills/',
  'assets/', 'src/', 'agents/', 'fixtures/', 'ports/', 'ssot/', 'dist/', 'subsystems/',
  'constitution/', 'evidence/', 'reports/',
];

const SELF_DOCS = new Set(['SKILL.md', 'LOG.md', 'SCORECARD.md', 'PROVINCE.md', 'SHONEN.md', 'AGENTS.md']);
const FLEET_DOCS = new Set([
  'CORPUS.md', 'PROTOCOL.md', 'AXES.md', 'MISSION.md', 'MANIFEST.json', 'ROADMAP.md',
  'AGGREGATE.md', 'program-quirks.md',
]);

/** Runtime/run-state artifacts: never source citations, never ambiguity. */
const WORKSPACE_NAMES = new Set([
  'operation.lock', 'fleet-dispatcher.lock', 'manifest.json', 'launch.json', 'verdict.json',
  'handoff.json', 'rejection.txt', 'main-assignment.md', 'pending-work.json',
  'pending-work-archive.jsonl', 'observations.json', 'loop-state.json', 'writer-lease.json',
  'repend-refusal-latch.json', 'swarm-registry.json', 'swarm-dispatch.json', 'fleet-ledger.jsonl',
  'routing-health.jsonl', 'admission-latch.json', 'emitter-latch.json', 'l0-monitor-state.json',
  'owner.json', 'meta.json',
]);
const RUNTIME_STATE_HINTS = new Set([
  'meta.json', 'owner.json', 'manifest.json', 'observations.json', 'launch.json', 'verdict.json',
  'pending-work.json', 'pending-work-archive.jsonl', 'admission-latch.json', 'fleet-ledger.jsonl',
  'l0-monitor-state.json',
]);
const RUNTIME_STATE_RE = /^ledger\.c\d+\.json$/;
const RUNTIME_NAME_RE = /^(?:pre-dispatch-r|r\d+-digest|swarm-|emitter-latch|repend-refusal)/;
const WORKSPACE_PREFIX_RES = [
  /^\.ufo\//, /^artifacts\//, /^runDir\//, /^inputs\//, /^fleets\//, /^<UFO_STATE>\//, /^<runDir>\//,
  /\/\.ufo\//, /^\.ufo$/,
];
/** $OUT_DIR-generated names: informational, printed with their pointers. */
const GENERATED_POINTERS = nullProto({
  'omp_role_chains.rs': [
    'crates/ufo-core-runtime/build.rs:117',
    'crates/ufo-core-runtime/src/execution_profile.rs:572',
  ],
});
const HOME_CONFIG_RE = /^(?:~\/)?\.(?:omp|config\/omp)\//;

const SYMBOL_STOPWORDS = new Set([
  'true', 'false', 'null', 'none', 'undefined', 'self', 'this', 'new', 'type', 'const', 'enum',
  'pub', 'fn', 'let', 'mut', 'use', 'mod', 'match', 'return', 'async', 'await', 'and', 'for',
  'with', 'from', 'into', 'not', 'only', 'never', 'always', 'the', 'struct', 'trait', 'impl',
]);

const SEVERITY = {
  OK: 'note', RESOLVED_BY_CONTEXT: 'note', RESOLVED_BY_PRECEDENCE: 'note', PIN_UNTYPED: 'note',
  FRAGMENT: 'note', FP_EXEMPT: 'note', SUFFIX_RESOLVED: 'warn', RUNTIME_UNRESOLVED: 'warn',
  AMBIG: 'warn',
  SYMBOL_MISS: 'warn', ORPHAN_REF: 'warn', REF_OWNER_AMBIG: 'note', UNRESOLVED: 'error',
  LINE_OOR: 'error',
  REV_UNKNOWN: 'error', PIN_MISMATCH: 'error', SYMBOL_OFF_LINE: 'error', SELF_MISSING: 'error',
  FLEET_MISSING: 'error',
};

const USAGE = `usage: node scripts/cite-check.mjs [options]

  --src DIR       source tree to resolve against (default: $UFO_SRC, else the
                  first existing of ~/Projects/ufo-fsd-alpha and
                  ~/Projects/origin-work/ufo-fsd-alpha)
  --self DIR      docs tree to scan (default: repo root containing this script)
  --fleet DIR     parent of --self for fleet-parent/sibling-lane docs (default: dirname --self)
  --json          machine output: {schema:"${SCHEMA}",src,self,fleet,files,totals,verdict}
                  (suite runs: {schema,suites,verdict})
  --strict        DRIFT also on warn-level findings
  --symbols       line-coupled symbol check for citations that carry a line ref
  --all           print note-level (informational) findings in text mode
  --selftest      run the HERMETIC fixture regression suite (alias: --self-test);
                  fixture-only, passes in any repo state
  --integrations  run the INTEGRATION group against --src/--self (live-tree
                  assertions); combine with --selftest to run both groups
  -h, --help      this help
`;

/* ------------------------------------------------------------------ helpers */

function parseArgs(argv) {
  const opts = {
    src: null, self: DEFAULT_SELF, fleet: null, json: false, strict: false,
    symbols: false, all: false, selfTest: false, integrations: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const need = (name) => {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) throw new Error(`${name} requires a directory`);
      return resolve(v);
    };
    if (a === '--src') opts.src = need(a);
    else if (a === '--self') opts.self = need(a);
    else if (a === '--fleet') opts.fleet = need(a);
    else if (a === '--json') opts.json = true;
    else if (a === '--strict') opts.strict = true;
    else if (a === '--symbols') opts.symbols = true;
    else if (a === '--all' || a === '-v') opts.all = true;
    else if (a === '--selftest' || a === '--self-test') opts.selfTest = true;
    else if (a === '--integrations') opts.integrations = true;
    else if (a === '-h' || a === '--help') { process.stdout.write(USAGE); return null; }
    else throw new Error(`unknown argument: ${a}`);
  }
  if (!opts.fleet) opts.fleet = dirname(opts.self);
  // The origin default is derived here, never at module load: `$UFO_SRC` wins,
  // else the first existing candidate. `--selftest` alone is hermetic and stats
  // no live path; `--integrations` reads the live tree and so does resolve.
  if (opts.src === null && !(opts.selfTest && !opts.integrations)) opts.src = resolveSrcDefault();
  return opts;
}

function walk(root, { maxDepth = Infinity } = {}) {
  const files = [];
  const dirs = new Set();
  const stack = [[root, 0]];
  while (stack.length) {
    const [dir, depth] = stack.pop();
    if (dir !== root) dirs.add(relative(root, dir));
    let ents;
    try { ents = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      if (e.isSymbolicLink() || EXCLUDE_DIRS.has(e.name)) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) { if (depth < maxDepth) stack.push([p, depth + 1]); }
      else if (e.isFile()) files.push(relative(root, p));
    }
  }
  files.sort();
  return { files, dirs };
}

function buildIndex(root, maxDepth) {
  const { files, dirs } = walk(root, { maxDepth });
  const byBase = new Map();
  for (const rel of files) {
    const b = basename(rel);
    if (!byBase.has(b)) byBase.set(b, []);
    byBase.get(b).push(rel);
  }
  return { root, files, fileSet: new Set(files), dirs, byBase };
}

function listDocs(selfRoot) {
  const out = [];
  if (existsSync(join(selfRoot, 'SKILL.md'))) out.push('SKILL.md');
  const corpus = join(selfRoot, 'corpus');
  if (existsSync(corpus)) {
    for (const rel of walk(corpus).files) if (rel.endsWith('.md')) out.push(join('corpus', rel));
  }
  return out.sort((a, b) => (a === 'SKILL.md' ? -1 : b === 'SKILL.md' ? 1 : a.localeCompare(b)));
}

function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return starts;
}

function lineAt(starts, off) {
  let lo = 0, hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= off) lo = mid; else hi = mid - 1;
  }
  return lo + 1;
}

function countLines(text) {
  if (text === '') return 0;
  const n = text.split('\n').length;
  return text.endsWith('\n') ? n - 1 : n;
}

function stripTrailing(s) { return s.replace(/[.,;:)\]}>]+$/, ''); }

/** A pruned *directory* component of the token (never a resolution target). */
function excludedComponent(tok) {
  const segs = tok.replace(/\/+$/, '').split('/');
  return segs.slice(0, -1).find((s) => EXCLUDE_DIRS.has(s)) || null;
}

/** Extensions that make a bare name a plausible file citation. */
const SOURCE_EXT = new Set([
  'mjs', 'js', 'cjs', 'mts', 'cts', 'ts', 'rs', 'json', 'jsonl', 'yml', 'yaml', 'toml', 'md',
  'mdx', 'txt', 'lock', 'sh', 'bash', 'py', 'mdc', 'sql', 'csv',
]);

/** Strict citation shape: known extension, trailing-slash directory, fragment. */
function strictShape(tok) {
  if (/[<>{}*?]/.test(tok)) return true;
  if (tok.endsWith('/')) return true;
  const segs = tok.replace(/\/+$/, '').split('/');
  const m = /\.([A-Za-z0-9]{1,8})$/.exec(segs[segs.length - 1]);
  return Boolean(m) && SOURCE_EXT.has(m[1].toLowerCase());
}

/**
 * Citation candidacy: a strict shape, or an exact hit under the source root.
 * Rejects JSON paths, route ids, ranges, assignments, placeholders and
 * anchors (`sighting.dispatch.swarm`, `hvm/qwen-hvm`, `1-400`, `maxConcurrency:0`).
 */
function isPathLike(tok, srcRoot) {
  if (!tok || tok.length < 3) return false;
  if (/[:@=`$!%'"]/.test(tok)) return false;
  if (/\.\./.test(tok) || /\/\.\//.test(tok)) return false;
  if (strictShape(tok)) return true;
  if (tok.includes('/') && srcRoot) return statKind(join(srcRoot, tok), false) !== null;
  return false;
}

/**
 * Round-27 adjudicated false positives — exempted ahead of the UNRESOLVED arm.
 *
 * Round 26 surfaced three non-citation token shapes that graded UNRESOLVED
 * error. Each is exempted by exact shape only, as its own class, graded `note`
 * (reported, never silently dropped, never error):
 *
 *   extension-list   `.mjs/.rs/.sh/.js` — a dot-extension enumeration, i.e. a
 *                    file-extension list written in prose, never a path.
 *   runtime-artifact a basename that is a run-state/scratch/output name: a
 *                    dot-prefixed `.session-retention.lock`-shaped artifact,
 *                    or a name in the declared round-27 FP list below.
 *   binary-internal  a `src/…` path immediately followed by a byte-offset marker
 *                    preceding 200 chars name `strings` or the binary).
 *
 * Every shape is guarded: it fires only when the token does not resolve under
 * --src, so a token that merely resembles an exemption but is a real path
 * (e.g. `scripts/audit-env.sh`, `scripts/x.mjs/.rs`) keeps grading normally.
 */
const EXTENSION_LIST_RE = /^\.[A-Za-z0-9]+(?:\/\.[A-Za-z0-9]+)+$/;
const RUNTIME_ARTIFACT_RE = /^\.[A-Za-z0-9.-]+\.(json|lock|log|sha256|txt)$/;
/**
 * The round-27 adjudicated FP list — declared literally, exact basenames only.
 * Each name was checked against the current error census and is not a citation
 * to a file under --src today: `audit-env.sh` is an L2 lane's removed untracked
 * scratch script, `summary.txt` a measurement-harness output name, and
 * `l0-watch-state.json` the L0 night watch's own run-state file. The list is a
 * closed enumeration — adding a name is a deliberate adjudication, never a
 * pattern, and a slash-path form (`scripts/audit-env.sh`) is not covered.
 */
const RUNTIME_ARTIFACT_NAMES = new Set(['audit-env.sh', 'summary.txt', 'l0-watch-state.json']);
/** The kimi binary whose strings regions a `src/…` token may name. */
const BINARY_PATH_RE = /\.kimi-code\/bin\/kimi/;

function fragmentKind(tok) {
  if (/:\/\//.test(tok)) return 'ignored-fragment';
  if (/^[-+]/.test(tok)) return 'ignored-fragment';
  if (/[*?]/.test(tok)) return 'fragment';
  if (/^\.[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*$/.test(tok)) return 'fragment';
  if (/[<>{}]/.test(tok)) return 'fragment';
  return null;
}

/**
 * The round-27 exemption predicate: { klass, message } for an exact-shape
 * false positive, else null. The `present` guard keeps a token that does
 * resolve under --src on the normal ladder, so the exemption never shadows a
 * real citation (it only reclassifies what would otherwise reach UNRESOLVED).
 */
function exemptionShape(token, ctx) {
  const { docText, off, srcIdx, opts } = ctx;
  const present = token.includes('/')
    ? statKind(join(opts.src, token), false) !== null
    : (srcIdx.byBase.get(basename(token)) || []).length > 0;
  if (present) return null;
  if (EXTENSION_LIST_RE.test(token)) {
    return {
      klass: 'extension-list',
      message: `${token} is a dot-extension enumeration (extension list), not a path citation`,
    };
  }
  if (!token.includes('/') && (RUNTIME_ARTIFACT_RE.test(token) || RUNTIME_ARTIFACT_NAMES.has(token))) {
    return {
      klass: 'runtime-artifact',
      message: `${token} is a run-state/scratch artifact name (round-27 adjudicated non-citation), not a source citation`,
    };
  }
  if (/^src\//.test(token)) {
    // r27-repair: context WINDOWS (200-char, own-line) could exempt a real
    // dead src/ path because a strings mention preceded it (verify-lane
    // counterexample); own-line scope broke the real case (the mention sits
    // on a wrapped paragraph's first line). The corpus's strings citations
    // are distinguished by a BYTE-OFFSET MARKER immediately after the token
    // — the precise shape, no window.
    const at = off || 0;
    const post = docText ? docText.slice(at + token.length, at + token.length + 80) : '';
    if (/^.{0,3}(at byte\s+\d|\(\s*byte\s+\d)/.test(post)) {
      return {
        klass: 'binary-internal',
        message: `${token} is a kimi-binary-internal source path (binary-strings citation), not a tree citation`,
      };
    }
  }
  return null;
}

/* ------------------------------------------------------------- span parsing */

const FENCE_LINE_RE = /^\s*(`{3,}|~{3,})/;

/**
 * Fence byte-ranges, marker-symmetric. The previous single open-state treated
 * any ``` / ~~~ line as a toggle, so a ~~~ line could close a ```-opened fence
 * (a CommonMark deviation) and everything after it stayed unmasked. A fence is
 * now closed only by a line carrying the same marker run; a non-matching marker
 * line is fence content. An unclosed fence at EOF masks to end of file.
 */
function findFences(text) {
  const fences = [];
  let open = null, off = 0;
  for (const line of text.split('\n')) {
    const m = FENCE_LINE_RE.exec(line);
    if (m) {
      const marker = m[1][0];
      if (open === null) open = { start: off, marker };
      else if (open.marker === marker) { fences.push([open.start, off + line.length]); open = null; }
    }
    off += line.length + 1;
  }
  if (open !== null) fences.push([open.start, text.length]);
  return fences;
}

/**
 * Fence masking — repair of the round-16 fence defect. The span grammar then in
 * force paired backticks with /`([^`]+)`/g across the whole document, so the
 * three backticks of a ``` fence line were consumed by that pairing: the opening
 * backtick of the next inline span was eaten and every backticked citation after
 * the fence vanished from the census (dead citations smuggled past the gate).
 * ~~~ fences carry no backtick, so they never shifted anything. Replacing each
 * fence byte-range with spaces of the same length — newlines kept, so positions
 * and line structure are preserved — makes fence markers invisible to the
 * span/prose/ref scans that run next.
 */
function maskFences(text, fences) {
  if (!fences.length) return text;
  const chars = text.split('');
  for (const [a, b] of fences) {
    for (let i = Math.max(0, a); i < Math.min(b, chars.length); i++) {
      if (chars[i] !== '\n') chars[i] = ' ';
    }
  }
  return chars.join('');
}

/**
 * A backtick preceded by an odd run of backslashes is escaped (`\``) and is a
 * literal, never a span delimiter. The corpus writes such backticks inside code
 * spans (e.g. a `grep -c '^| \`knowledge/' …` command); counting them as
 * delimiters splits the span and drops the citations it carries.
 */
function isEscapedBacktick(line, i) {
  let n = 0;
  for (let j = i - 1; j >= 0 && line[j] === '\\'; j--) n++;
  return n % 2 === 1;
}

/**
 * Verbatim-quote spans — the house's `«…»` convention, the round-28 repair of the
 * round-26 multi-line coverage loss. A `«` opens and the next `»` closes; the pair
 * may cross newlines (corpus/knowledge/kimi-binary-secrets.md:64-68 wraps its
 * quotes across lines). A `«` with no following `»` is left as prose — the grammar
 * never invents a span from a lone delimiter. The span's content is the quoted
 * bytes between the delimiters; the delimiters themselves are never citation-shaped.
 */
const QUOTE_OPEN = '\u00ab';
const QUOTE_CLOSE = '\u00bb';

function findQuoteSpans(text, fences) {
  const inFence = (i) => fences.some(([a, b]) => i >= a && i < b);
  const spans = [];
  let i = 0;
  for (;;) {
    const a = text.indexOf(QUOTE_OPEN, i);
    if (a < 0) return spans;
    if (inFence(a)) { i = a + 1; continue; }
    const b = text.indexOf(QUOTE_CLOSE, a + 1);
    if (b < 0 || b === a + 1) return spans; // unpaired / empty « stays prose
    spans.push({ start: a, end: b + 1 });
    i = b + 1;
  }
}

/**
 * A span's raw content with the byte ranges owned by a nested span blanked out
 * (same length, newlines kept). A byte is covered by exactly one span, so where a
 * `«…»` quote sits inside a backtick span the backtick span drops the quoted bytes
 * and the quote carries them, and where the backticks sit inside the quote it is
 * the other way round (round-28 no-double-count invariant).
 */
function clipSpanRaw(text, start, end, ranges) {
  const chars = text.slice(start, end).split('');
  for (const [a, b] of ranges) {
    const lo = Math.max(a, start), hi = Math.min(b, end);
    for (let i = lo; i < hi; i++) if (chars[i - start] !== '\n') chars[i - start] = ' ';
  }
  return chars.join('');
}

/**
 * The ranges of the OTHER delimiter form that are nested in this span — i.e. the
 * ones this span must not carry. A range that CONTAINS this span is its parent,
 * not its child, so it is left out: in `` `«inline»` `` the backtick span drops the
 * quote, while the quote keeps its content (clipping it there would blank both
 * copies and lose the bytes entirely).
 */
function innerRanges(ranges, span) {
  return ranges.filter(([a, b]) => !(a <= span.start && b >= span.end));
}

/**
 * Inline-code spans, paired line-locally — repair of the round-23 pairing-parity
 * residual. The previous grammar paired backticks with /`([^`]+)`/g across the
 * whole document, so one escaped backtick or one odd run of backticks flipped the
 * parity of every line below it: citations that had resolved were silently
 * dropped (13 across executable-scorecard.md / round-6-aggregator-audit.md /
 * kimi-binary-secrets.md / kimi-modes-machinery.md at round 23) while other spans
 * in the same files re-paired. Pairing is now confined to each line: backticks
 * pair left-to-right and a line with an odd count leaves its final backtick
 * unpaired — a backtick span never crosses a newline.
 *
 * The `«…»` verbatim quotes are extracted FIRST (round 28) and are the one span
 * form that crosses newlines: a multi-line backtick span is still not part of the
 * grammar, so the corpus's multi-line citations read as prose unless the author
 * wraps them in the quote convention the corpus already speaks. Pairing inside a
 * quote is the same line-local backtick pairing, so a citation the author wrote in
 * backticks inside a quote is still found; the two forms clip each other's raw so
 * no byte is ever censused twice.
 */
function findSpans(text, fences) {
  const quotes = findQuoteSpans(text, fences);
  const inFence = (i) => fences.some(([a, b]) => i >= a && i < b);
  const ticks = [];
  let off = 0;
  for (const line of text.split('\n')) {
    const lineStart = off;
    off += line.length + 1;
    if (inFence(lineStart)) continue;
    const marks = [];
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== '`' || isEscapedBacktick(line, i)) continue;
      marks.push(lineStart + i);
    }
    for (let k = 0; k + 1 < marks.length; k += 2) {
      const start = marks[k], end = marks[k + 1] + 1;
      if (end - start <= 2) continue; // adjacent backticks pair to nothing
      ticks.push({ start, end });
    }
  }
  const quoteRanges = quotes.map((q) => [q.start, q.end]);
  const tickRanges = ticks.map((t) => [t.start, t.end]);
  return [
    ...quotes.map((q) => ({
      raw: clipSpanRaw(text, q.start + 1, q.end - 1, innerRanges(tickRanges, q)), start: q.start, end: q.end,
    })),
    ...ticks.map((t) => ({
      raw: clipSpanRaw(text, t.start + 1, t.end - 1, innerRanges(quoteRanges, t)), start: t.start, end: t.end,
    })),
  ].sort((a, b) => a.start - b.start);
}

function unwrap(raw, base) {
  let out = '';
  const offs = [];
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === '\r') continue;
    if (c === '\n') {
      let j = i + 1;
      while (j < raw.length && (raw[j] === ' ' || raw[j] === '\t')) j++;
      if (!(out.endsWith('-') && j < raw.length)) { out += ' '; offs.push(base + i); }
      i = j - 1;
      continue;
    }
    out += c;
    offs.push(base + i);
  }
  return { text: out, offs };
}

const REF_HEAD_RE = /^(?::(\d+)(?:[\u2013-](\d+))?(\+)?|~?L(\d{2,})(?:[\u2013-](\d+))?)/;
const REF_SCAN_RE = /(?:~?L\d{2,}|:\d+)/;

function parseRefChain(s, at) {
  const refs = [];
  let i = at, first = true;
  for (;;) {
    if (!first) {
      if (s[i] !== '/') break;
      i++;
    }
    const m = REF_HEAD_RE.exec(s.slice(i));
    if (!m) { if (!first) i--; break; }
    const start = m[1] !== undefined ? Number(m[1]) : Number(m[4]);
    const end = m[2] !== undefined ? Number(m[2]) : m[5] !== undefined ? Number(m[5]) : start;
    if (start < 1 || end < start) { if (!first) i--; break; }
    refs.push({
      short: s.slice(i, i + m[0].length), start, end, openEnded: Boolean(m[3]),
      unit: m[1] !== undefined ? ':' : 'L',
    });
    i += m[0].length;
    first = false;
  }
  return refs.length ? { refs, end: i } : null;
}

/* ----------------------------------------------------------- ref enumeration */

/**
 * Prose tokens: source-path citations written outside backticks. They extend the
 * sticky owner and never enter the census on their own.
 */
function enumerateProseTokens(text, fences, spans, srcRoot) {
  const inFence = (i) => fences.some(([a, b]) => i >= a && i < b);
  const inSpan = (i) => spans.some((s) => i >= s.start && i < s.end);
  const out = [];
  const lines = text.split('\n');
  let off = 0;
  for (const line of lines) {
    const lineStart = off;
    off += line.length + 1;
    if (inFence(lineStart)) continue;
    const re = /[A-Za-z0-9_][A-Za-z0-9_./-]*/g;
    let m;
    while ((m = re.exec(line))) {
      const at = m.index;
      if (inSpan(lineStart + at)) continue;
      let word = stripTrailing(m[0]);
      const rm = REF_SCAN_RE.exec(word);
      if (rm && rm.index > 0) word = word.slice(0, rm.index);
      if (!isPathLike(word, srcRoot) || fragmentKind(word)) continue;
      out.push({ off: lineStart + at, word });
    }
  }
  return out;
}

function enumerateRefEvents(text, fences, srcRoot) {
  const inFence = (i) => fences.some(([a, b]) => i >= a && i < b);
  const events = [];
  const lines = text.split('\n');
  let off = 0;
  for (const line of lines) {
    const lineStart = off;
    off += line.length + 1;
    if (inFence(lineStart)) continue;
    // standalone refs: preceded by a non-word char (never `maxConcurrency:0`)
    const standalone = /(^|[^A-Za-z0-9_])(?=(?:~?L\d{2,}|:\d))/g;
    let m;
    while ((m = standalone.exec(line))) {
      const at = m.index + m[1].length;
      const chain = parseRefChain(line, at);
      if (!chain) continue;
      events.push({ off: lineStart + at, refs: chain.refs, attachedTo: null });
      standalone.lastIndex = chain.end;
    }
    // refs attached to a preceding citation word (path token, alias, shorthand)
    const attached = /[A-Za-z0-9_][A-Za-z0-9_./-]*(?=(?::\d|~?L\d{2,}))/g;
    while ((m = attached.exec(line))) {
      const word = m[0];
      if (!isPathLike(word, srcRoot) && !ALIASES[word] && !SHORTHAND_PATHS[word]) continue;
      const at = m.index + word.length;
      const chain = parseRefChain(line, at);
      if (!chain) continue;
      events.push({ off: lineStart + at, refs: chain.refs, attachedTo: word });
      attached.lastIndex = chain.end;
    }
  }
  return events;
}

/* ---------------------------------------------------------------- symbols */

function identifierCandidates(text, exclude) {
  const out = [];
  const re = /[A-Za-z_][A-Za-z0-9_]{2,}(?:::[A-Za-z_][A-Za-z0-9_]*)?/g;
  let m;
  while ((m = re.exec(text))) {
    const before = m.index === 0 ? ' ' : text[m.index - 1];
    const after = text[m.index + m[0].length] || ' ';
    if (/[A-Za-z0-9_\-/.]/.test(before) || /[A-Za-z0-9_\-/.]/.test(after)) continue;
    const parts = m[0].split('::');
    const last = parts[parts.length - 1];
    if (SYMBOL_STOPWORDS.has(last.toLowerCase())) continue;
    if (exclude && exclude.includes(last)) continue;
    // symbol-shaped: has an underscore/namespace, or an internal capital
    const shaped = last.includes('_') || /::/.test(m[0]) || /[A-Z]/.test(last.slice(1));
    if (!shaped) continue;
    out.push(last);
  }
  return [...new Set(out)];
}

function symbolLines(content, sym) {
  const esc = sym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^A-Za-z0-9_])${esc}([^A-Za-z0-9_]|$)`);
  const hits = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) if (re.test(lines[i])) hits.push(i + 1);
  return hits;
}

/* ------------------------------------------------------------- resolution */

function rec(token, klass, rung, kind, target, targetPath, message) {
  return { token, klass, rung, kind, severity: SEVERITY[kind], target, targetPath, message };
}

function sourceRank(rel) {
  for (let i = 0; i < ROOT_PRECEDENCE.length; i++) if (ROOT_PRECEDENCE[i].test(rel)) return i;
  return ROOT_PRECEDENCE.length;
}

function statKind(p, wantDir) {
  try {
    const st = statSync(p);
    if (st.isDirectory()) return 'dir';
    if (st.isFile()) return wantDir ? 'file-not-dir' : 'file';
    return 'other';
  } catch { return null; }
}

function resolveInTree(token, idx) {
  if (!idx) return null;
  if (token.includes('/')) {
    const p = join(idx.root, token);
    if (existsSync(p)) return { rel: token, path: p };
    const hits = idx.files.filter((r) => r === token || r.endsWith('/' + token));
    if (hits.length === 1) return { rel: hits[0], path: join(idx.root, hits[0]) };
    return null;
  }
  const hits = idx.byBase.get(basename(token)) || [];
  if (hits.length === 1) return { rel: hits[0], path: join(idx.root, hits[0]) };
  return null;
}

function findGenerated(base, src) {
  const hits = [];
  for (const flavour of ['debug', 'release']) {
    const buildDir = join(src, 'target', flavour, 'build');
    if (!existsSync(buildDir)) continue;
    let ents;
    try { ents = readdirSync(buildDir, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      if (!e.isDirectory()) continue;
      const p = join(buildDir, e.name, 'out', base);
      if (existsSync(p)) hits.push(relative(src, p));
    }
  }
  return hits;
}

function findFleetDoc(base, fleet, docish) {
  // 1) fleet-parent docs at the root / one level down (indexed),
  // 2) the fleet aggregator ledger under <fleet>/.ufo/reports/** (bounded probe).
  const direct = join(fleet, base);
  if (existsSync(direct)) return { rel: base, path: direct };
  if (!docish) return null;
  const roots = [join(fleet, '.ufo', 'reports'), join(fleet, 'reports')];
  for (const start of roots) {
    if (!existsSync(start)) continue;
    const stack = [[start, 0]];
    while (stack.length) {
      const [dir, depth] = stack.pop();
      if (depth > 4) continue;
      let ents;
      try { ents = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const e of ents) {
        if (e.isSymbolicLink() || e.name === '.git') continue;
        const p = join(dir, e.name);
        if (e.isDirectory()) stack.push([p, depth + 1]);
        else if (e.isFile() && e.name === base) return { rel: relative(fleet, p), path: p };
      }
    }
  }
  return null;
}

function aliasRec(word, opts) {
  const target = ALIASES[word];
  const p = join(opts.src, target);
  if (existsSync(p)) return rec(word, 'source', 'src', 'OK', target, p, `${word} -> ${target} (shorthand alias)`);
  return rec(word, 'source', 'none', 'UNRESOLVED', null, null,
    `${word} is a shorthand alias for ${target}, which is absent from src`);
}

/** Ladder + namespace classification for a path/basename token. */
function classifyToken(token, ctx) {
  const { opts, selfIdx, fleetIdx, srcIdx, rel, docText } = ctx;
  const base = basename(token);
  const hasSlash = token.includes('/');
  const docish = /\.md$/.test(base) || SELF_DOCS.has(base) || FLEET_DOCS.has(base);
  const wantsDir = token.endsWith('/');

  // fragment shapes are handled by the caller, but keep a guard here
  if (fragmentKind(token)) return rec(token, fragmentKind(token), 'none', 'FRAGMENT', null, null,
    `${token} is not a citation`);

  // round-27 adjudicated false positives — exact-shape exemption, before the
  // UNRESOLVED arm; each shape its own class, graded note (never error)
  const exempt = exemptionShape(token, ctx);
  if (exempt) return rec(token, exempt.klass, 'none', 'FP_EXEMPT', null, null, exempt.message);

  // documented path shorthands
  if (SHORTHAND_PATHS[token]) {
    const target = SHORTHAND_PATHS[token];
    const p = join(opts.src, target);
    if (existsSync(p)) {
      return rec(token, 'source', 'src', 'OK', target, p, `${token} -> ${target} (shorthand path)`);
    }
    return rec(token, 'source', 'none', 'UNRESOLVED', null, null,
      `${token} is a shorthand for ${target}, which is absent from src`);
  }

  // home-relative config discovery
  if (HOME_CONFIG_RE.test(token) || /^~?\/(?:\.omp|\.config)\//.test(token)) {
    return rec(token, 'home-config', 'none', 'OK', null, null, `${token} is a HOME-relative config path`);
  }
  // a path inside a pruned directory is never resolved against the index
  const excl = excludedComponent(token);
  if (excl) {
    const klass = excl === 'target' ? 'generated' : 'runtime';
    return rec(token, klass, 'none', 'OK', null, null,
      `${token} lives under pruned ${excl}/ (${klass} namespace, never a resolution target)`);
  }
  // runtime / workspace artifacts
  const wsPrefix = WORKSPACE_PREFIX_RES.some((re) => re.test(token));
  const wsName = !hasSlash && (WORKSPACE_NAMES.has(base) || RUNTIME_STATE_RE.test(base) || RUNTIME_NAME_RE.test(base));
  if ((wsPrefix || wsName) && !srcIdx.fileSet.has(token)) {
    if (RUNTIME_STATE_HINTS.has(base) || RUNTIME_STATE_RE.test(base)) {
      const hits = srcIdx.byBase.get(base) || [];
      if (hits.length === 1 && sourceRank(hits[0]) >= ROOT_PRECEDENCE.length) {
        return rec(token, 'runtime', 'none', 'RUNTIME_UNRESOLVED', hits[0], null,
          `${token} is a runtime artifact; the only src hit (${hits[0]}) is not a source-tree artifact`);
      }
    }
    return rec(token, 'runtime', 'none', 'OK', null, null,
      `${token} is a runtime/run-state artifact (never a source citation)`);
  }
  // foreign root: absolute paths
  if (/^(?:\/|~\/)/.test(token)) {
    return rec(token, 'foreign-root', 'none', 'OK', null, null,
      `${token} is an absolute path outside the doc/source roots`);
  }

  // ladder 1 — file-relative to the containing doc
  const relDir = dirname(rel);
  if (relDir !== '.' && (hasSlash || /\.md$/.test(base))) {
    const cand = join(opts.self, relDir, token);
    if (existsSync(cand)) {
      const kind = statKind(cand, wantsDir);
      if (kind === 'dir' || kind === 'file') {
        return rec(token, 'self-doc', 'file-relative', 'OK', join(relDir, token), cand,
          `${token} -> ${join(relDir, token)} (relative to ${rel})`);
      }
    }
  }

  // ladder 2 — self doc tree
  for (const idx of [selfIdx]) {
    const hit = resolveInTree(token, idx);
    if (hit) {
      return rec(token, 'self-doc', 'self', 'OK', hit.rel, hit.path, `${token} -> ${hit.rel} (self docs)`);
    }
  }
  if (!hasSlash && (SELF_DOCS.has(base) || /\.md$/.test(base))) {
    const fleetHit = resolveInTree(token, fleetIdx) || findFleetDoc(base, opts.fleet, docish);
    if (fleetHit) {
      return rec(token, 'fleet-doc', 'fleet', 'OK', fleetHit.rel, fleetHit.path,
        `${token} -> ${fleetHit.rel} (fleet parent)`);
    }
    if (SELF_DOCS.has(base)) {
      return rec(token, 'self-doc', 'none', 'SELF_MISSING', null, null,
        `${token} is not present in the self doc tree`);
    }
    if (FLEET_DOCS.has(base)) {
      return rec(token, 'fleet-doc', 'none', 'FLEET_MISSING', null, null,
        `${token} is not present in the fleet tree (${opts.fleet})`);
    }
  }

  // ladder 3 — fleet root (explicit sibling-lane paths, fleet docs)
  if (hasSlash) {
    const p = join(opts.fleet, token);
    if (existsSync(p)) {
      return rec(token, 'fleet-doc', 'fleet', 'OK', token, p, `${token} -> fleet/${token}`);
    }
  } else {
    const fleetHit = resolveInTree(token, fleetIdx) || (FLEET_DOCS.has(base) ? findFleetDoc(base, opts.fleet, true) : null);
    if (fleetHit && !srcIdx.byBase.has(base)) {
      return rec(token, 'fleet-doc', 'fleet', 'OK', fleetHit.rel, fleetHit.path,
        `${token} -> ${fleetHit.rel} (fleet parent)`);
    }
  }

  // ladder 4 — source tree
  if (hasSlash) {
    const direct = join(opts.src, token);
    const kind = statKind(direct, wantsDir);
    if (kind === 'dir' || kind === 'file') {
      return rec(token, 'source', 'src', 'OK', token, direct,
        `${token} -> src/${token}${kind === 'dir' ? ' (directory)' : ''}`);
    }
    if (kind === 'file-not-dir') {
      return rec(token, 'source', 'none', 'UNRESOLVED', null, null,
        `${token} is cited as a directory but src/${token.replace(/\/$/, '')} is a regular file`);
    }
    const suffix = srcIdx.files.filter((r) => r.endsWith('/' + token) || r === token);
    if (suffix.length === 1) {
      return rec(token, 'source', 'src', 'SUFFIX_RESOLVED', suffix[0], join(opts.src, suffix[0]),
        `${token} -> src/${suffix[0]} (unique suffix match)`);
    }
    if (suffix.length > 1) {
      return rec(token, 'source', 'src', 'AMBIG', null, null,
        `${token} matches ${suffix.length} source files: ${suffix.slice(0, 4).join(', ')}${suffix.length > 4 ? ', …' : ''}`);
    }
    if (wantsDir) {
      // directory citation: unique directory-suffix match, else bare-dir name
      const bare = token.replace(/\/+$/, '');
      const dirHits = [...srcIdx.dirs].filter((d) => d === bare || d.endsWith('/' + bare));
      if (dirHits.length === 1) {
        return rec(token, 'source', 'src', 'SUFFIX_RESOLVED', dirHits[0], join(opts.src, dirHits[0]),
          `${token} -> src/${dirHits[0]}/ (unique directory suffix match)`);
      }
      if (dirHits.length > 1) {
        return rec(token, 'source', 'src', 'AMBIG', null, null,
          `${token} matches ${dirHits.length} source directories: ${dirHits.slice(0, 4).join(', ')}${dirHits.length > 4 ? ', …' : ''}`);
      }
      if (!SOURCE_PREFIXES.some((p) => token.startsWith(p))) {
        return rec(token, 'fragment', 'none', 'FRAGMENT', null, null,
          `${token} is a bare directory name in prose, not a resolvable citation`);
      }
    }
    if (wantsDir) {
      const bare = token.replace(/\/+$/, '');
      const kind = statKind(join(opts.src, bare), false);
      if (kind === 'file') {
        return rec(token, 'source', 'none', 'UNRESOLVED', null, null,
          `${token} is cited as a directory but src/${bare} is a regular file`);
      }
    }
    return rec(token, 'source', 'none', 'UNRESOLVED', null, null,
      `${token} not found under src (exact or suffix)`);
  }

  const cands = srcIdx.byBase.get(base) || [];
  if (cands.length === 0) {
    const gen = findGenerated(base, opts.src);
    if (gen.length) {
      const pointers = [...(GENERATED_POINTERS[base] || []), ...gen];
      return rec(token, 'generated', 'none', 'OK', null, null,
        `${token} is build-generated ($OUT_DIR): ${pointers.join(' | ')}`);
    }
    return rec(token, 'source', 'none', 'UNRESOLVED', null, null, `${token} not found under src`);
  }
  if (cands.length === 1) {
    const one = cands[0];
    if ((RUNTIME_STATE_HINTS.has(base) || RUNTIME_STATE_RE.test(base)) && sourceRank(one) >= ROOT_PRECEDENCE.length) {
      return rec(token, 'runtime', 'none', 'RUNTIME_UNRESOLVED', one, null,
        `${token} is a runtime artifact name; the only src hit (${one}) is not a source-tree artifact`);
    }
    return rec(token, 'source', 'src', 'OK', one, join(opts.src, one),
      `${token} -> src/${one} (unique basename)`);
  }
  const byContext = cands.filter((c) => {
    const dir = dirname(c);
    const segs = dir.split('/');
    return docText.includes(dir + '/')
      || docText.includes(basename(dir) + '/')
      || (segs.length > 1 && docText.includes(segs.slice(-2).join('/')));
  });
  if (byContext.length === 1) {
    return rec(token, 'source', 'src', 'RESOLVED_BY_CONTEXT', byContext[0], join(opts.src, byContext[0]),
      `${token} -> src/${byContext[0]} (per-file directory context; ${cands.length} candidates)`);
  }
  if (byContext.length > 1 && ctx.off != null) {
    // nearest directory-context mention wins when it is unique
    const dist = (c) => {
      const dir = dirname(c);
      const probes = [dir + '/', basename(dir) + '/'];
      let best = Infinity;
      for (const p of probes) {
        let idx = -1;
        while ((idx = docText.indexOf(p, idx + 1)) !== -1) best = Math.min(best, Math.abs(idx - ctx.off));
      }
      return best;
    };
    const scored = byContext.map((c) => ({ c, d: dist(c) }))
      .sort((a, b) => a.d - b.d || a.c.localeCompare(b.c));
    if (scored[0].d < Infinity && (scored.length === 1 || scored[1].d > scored[0].d)) {
      return rec(token, 'source', 'src', 'RESOLVED_BY_CONTEXT', scored[0].c, join(opts.src, scored[0].c),
        `${token} -> src/${scored[0].c} (nearest directory-context mention; ${cands.length} candidates)`);
    }
  }
  const ranked = cands.map((c) => ({ c, r: sourceRank(c) })).sort((a, b) => a.r - b.r || a.c.localeCompare(b.c));
  if (ranked.length > 1 && ranked[1].r > ranked[0].r) {
    return rec(token, 'source', 'src', 'RESOLVED_BY_PRECEDENCE', ranked[0].c, join(opts.src, ranked[0].c),
      `${token} -> src/${ranked[0].c} (source-root precedence; ${cands.length} candidates)`);
  }
  return rec(token, 'source', 'src', 'AMBIG', null, null,
    `${token} matches ${cands.length} source files: ${cands.slice(0, 4).join(', ')}${cands.length > 4 ? ', …' : ''}`);
}

/* ------------------------------------------------------------------- pins */

const PIN_RE = /\b(git[ -]?pin(?:ned)?|rev(?:ision)?(?:-pinned)?|HEAD|commit|sha256|pinned)\b[\s\S]{0,32}?\b([0-9a-f]{7,40})\b/g;
const HEX_RE = /^[0-9a-f]{7,40}$/;

function collectPins(text) {
  const pins = [];
  PIN_RE.lastIndex = 0;
  let m;
  while ((m = PIN_RE.exec(text))) {
    const marker = m[1];
    const gap = text.slice(m.index + marker.length, m.index + m[0].length - m[2].length);
    let kind;
    if (/sha256/i.test(marker) || /sha256/i.test(gap)) kind = 'sha256';
    else if (/^HEAD$/i.test(marker) || /git[ -]?pin/i.test(marker)) kind = 'head';
    else kind = 'rev';
    pins.push({ kind, marker, hex: m[2], offset: m.index });
  }
  return pins;
}

const gitCache = new Map();

function git(args) {
  const r = spawnSync('git', args, { encoding: 'utf8', timeout: 20000, shell: false });
  if (r.error || r.status === null) return { state: 'unavailable' };
  return { state: r.status === 0 ? 'ok' : 'miss', out: (r.stdout || '').trim() };
}

function gitResolveCommit(repo, hex) {
  if (!HEX_RE.test(hex)) return { state: 'skipped' };
  const key = `${repo}|${hex}`;
  if (gitCache.has(key)) return gitCache.get(key);
  const r = git(['-C', repo, 'rev-parse', '--verify', '--quiet', `${hex}^{commit}`]);
  const res = r.state === 'ok' ? { state: 'ok' } : { state: r.state };
  gitCache.set(key, res);
  return res;
}

function gitBehindCount(repo, hex) {
  if (!HEX_RE.test(hex)) return null;
  const r = git(['-C', repo, 'rev-list', '--count', `${hex}..HEAD`]);
  if (r.state !== 'ok') return null;
  const n = Number(r.out);
  return Number.isFinite(n) ? n : null;
}

function sha256File(p) {
  try { return createHash('sha256').update(readFileSync(p)).digest('hex'); } catch { return null; }
}

/** Pins for one doc. `ownerAt(offset)` = nearest preceding resolved file citation. */
function pinFindings(ctx, rel, starts, ownerAt, counters) {
  const { text, opts } = ctx;
  const out = [];
  const repoOrder = [opts.self, opts.src, opts.fleet]
    .map((p) => (p === opts.self ? ['self', p] : p === opts.src ? ['src', p] : ['fleet', p]))
    .filter(([, p], i, a) => p && a.findIndex(([, q]) => q === p) === i);
  for (const pin of collectPins(text)) {
    counters.pins++;
    const line = lineAt(starts, pin.offset);
    const owner = ownerAt(pin.offset);
    const ownerSuffix = owner ? ` (nearest cited file: ${owner.target || owner.rec.target})` : '';
    if (pin.kind === 'sha256') {
      if (!owner) {
        counters.pinsUntyped++;
        out.push({
          file: rel, line, token: pin.hex, class: 'source', rung: 'none', kind: 'PIN_UNTYPED',
          severity: 'note', target: pin.hex, ref: null, via: 'pin',
          message: `content pin ${pin.hex} (${pin.marker}) has no preceding cited file to hash — unchecked`,
        });
        continue;
      }
      const digest = sha256File(owner.rec.targetPath);
      if (!digest) {
        counters.pinsUnchecked++;
        out.push({
          file: rel, line, token: pin.hex, class: 'source', rung: 'none', kind: 'PIN_UNTYPED',
          severity: 'note', target: pin.hex, ref: null, via: 'pin',
          message: `content pin ${pin.hex} could not be verified (unreadable ${owner.rec.target})`,
        });
      } else if (digest.startsWith(pin.hex)) {
        counters.pinsOk++;
        out.push({
          file: rel, line, token: pin.hex, class: 'source', rung: 'src', kind: 'OK',
          severity: 'note', target: owner.rec.target, ref: null, via: 'pin',
          message: `content pin ${pin.hex} matches sha256(${owner.rec.target})`,
        });
      } else {
        counters.pinsMismatch++;
        out.push({
          file: rel, line, token: pin.hex, class: 'source', rung: 'src', kind: 'PIN_MISMATCH',
          severity: 'error', target: owner.rec.target, ref: null, via: 'pin',
          message: `content pin ${pin.hex} does not match sha256(${owner.rec.target})=${digest.slice(0, 12)}…`,
        });
      }
      continue;
    }
    let resolvedBy = null;
    for (const [label, repo] of repoOrder) {
      const r = gitResolveCommit(repo, pin.hex);
      if (r.state === 'ok') { resolvedBy = { how: 'git', repo, label }; break; }
    }
    if (!resolvedBy && pin.kind === 'rev' && owner) {
      const digest = sha256File(owner.rec.targetPath);
      if (digest && digest.startsWith(pin.hex)) resolvedBy = { how: 'content', repo: owner.rec.target };
    }
    if (resolvedBy) {
      counters.pinsOk++;
      let extra = ownerSuffix;
      let how = resolvedBy.how;
      if (resolvedBy.how === 'git') {
        how = `git:${resolvedBy.label}`;
        const behind = gitBehindCount(resolvedBy.repo, pin.hex);
        if (behind !== null) extra = ` (${behind} commits behind HEAD)`;
      }
      out.push({
        file: rel, line, token: pin.hex, class: 'source', rung: 'src', kind: 'OK', severity: 'note',
        target: resolvedBy.repo, ref: null, via: 'pin',
        message: `pin ${pin.hex} (${pin.marker}) resolved-by-${how}${extra}`,
      });
    } else {
      counters.revUnknown++;
      out.push({
        file: rel, line, token: pin.hex, class: 'source', rung: 'none', kind: 'REV_UNKNOWN',
        severity: 'error', target: pin.hex, ref: null, via: 'pin',
        message: `pin ${pin.hex} (${pin.marker}) is neither a commit in the searched repos nor the content hash of the preceding cited file`,
      });
    }
    if (pin.kind === 'rev') {
      counters.pinsUntyped++;
      out.push({
        file: rel, line, token: pin.hex, class: 'source', rung: 'none', kind: 'PIN_UNTYPED',
        severity: 'note', target: pin.hex, ref: null, via: 'pin',
        message: `pin site says "${pin.marker} ${pin.hex}" — neither sha256 nor HEAD; kind is ambiguous${ownerSuffix}`,
      });
    }
  }
  return out;
}

/* ---------------------------------------------------------------- analysis */

function analyzeDoc(rel, ctx) {
  const { text, opts, src, selfIdx, fleetIdx, srcIdx } = ctx;
  const starts = lineStarts(text);
  const fences = findFences(text);
  // fence byte-ranges are blanked (same length, newlines kept) before every scan
  // that pairs or tokenizes document bytes; offsets therefore stay valid.
  const masked = maskFences(text, fences);
  const lines = text.split('\n');
  const findings = [];
  const counts = { refs: 0, orphanRefs: 0, symbols: 0, altOwner: 0, decl: 0, prose: 0 };

  const isDecl = (line) => /Citations?\s+`?L[<0-9]/.test(line) && /are\s+this\s+file/i.test(line)
    || /All\s+`:?N{2,}`?\s+citations\s+are\s+this\s+file/i.test(line);

  const push = (f) => findings.push(f);
  const tokenEvents = [];
  const spans = findSpans(masked, fences);

  const lineCountCache = new Map();
  const linesOf = (p) => {
    if (lineCountCache.has(p)) return lineCountCache.get(p);
    let n = -1;
    try { n = countLines(readFileSync(p, 'utf8')); } catch { n = -1; }
    lineCountCache.set(p, n);
    return n;
  };
  const contentCache = new Map();
  const contentOf = (p) => {
    if (contentCache.has(p)) return contentCache.get(p);
    let t = null;
    try { t = readFileSync(p, 'utf8'); } catch { t = null; }
    contentCache.set(p, t);
    return t;
  };

  let sticky = null;           // current owner: { rec, symbols }
  const ownerStack = [];       // distinct resolved owners, most recent first
  const tokenTimeline = [];    // every resolved token, in document order (pins, tail refs)
  let firstSrcOwner = null;    // first resolved source token in the file (declaration target)

  const noteOwner = (ownerRec) => {
    const seen = ownerStack.findIndex((o) => o.rec.target === ownerRec.rec.target);
    if (seen >= 0) ownerStack.splice(seen, 1);
    ownerStack.unshift(ownerRec);
    if (ownerStack.length > 64) ownerStack.pop();
    if (!firstSrcOwner && ownerRec.rec.rung === 'src') firstSrcOwner = ownerRec;
  };

  const refFinding = (owner, ref, via, line, alt) => {
    counts.refs++;
    const target = owner.rec.targetPath;
    if (!target) return;
    const n = linesOf(target);
    if (n < 0) return;
    const range = ref.start === ref.end ? `:${ref.start}` : `:${ref.start}-${ref.end}`;
    const label = ref.short.startsWith('L') ? `${owner.rec.token} ${ref.short}` : `${owner.rec.token}${ref.short}`;
    const bad = ref.start > n || ref.end > n;
    if (bad) {
      push({
        file: rel, line, token: owner.rec.token, class: owner.rec.klass, rung: owner.rec.rung,
        kind: 'LINE_OOR', severity: 'error', target: owner.rec.target, ref: ref.short, via,
        message: `${label} out of range — ${owner.rec.target} has ${n} lines`,
      });
      return;
    }
    push({
      file: rel, line, token: owner.rec.token, class: owner.rec.klass, rung: owner.rec.rung,
      kind: 'OK', severity: 'note', target: owner.rec.target, ref: ref.short,
      via: alt ? 'alt-owner' : via,
      message: `${label} -> ${owner.rec.target} (${n} lines)`,
    });
    if (opts.symbols && owner.symbols && owner.symbols.length && via === 'inline') {
      counts.symbols++;
      const sym = owner.symbols[0];
      const content = contentOf(target);
      if (content === null) return;
      const slice = linesOf2(content, ref.start, ref.end);
      const inRange = symbolLines(slice.text, sym).length > 0;
      if (inRange) {
        push({
          file: rel, line, token: owner.rec.token, class: owner.rec.klass, rung: owner.rec.rung,
          kind: 'OK', severity: 'note', target: owner.rec.target, ref: ref.short, via,
          message: `${sym} present on ${owner.rec.target}${range}`,
        });
      } else {
        const all = symbolLines(content, sym);
        push({
          file: rel, line, token: owner.rec.token, class: owner.rec.klass, rung: owner.rec.rung,
          kind: all.length ? 'SYMBOL_OFF_LINE' : 'SYMBOL_MISS',
          severity: all.length ? 'error' : 'warn',
          target: owner.rec.target, ref: ref.short, via,
          message: all.length
            ? `${sym} not on ${owner.rec.target}${range} — occurs at line(s) ${all.slice(0, 6).join(', ')}${all.length > 6 ? ', …' : ''}`
            : `${sym} absent from ${owner.rec.target}${range}`,
        });
      }
    }
  };

  const linesOf2 = (content, a, b) => ({ text: content.split('\n').slice(a - 1, b).join('\n') });

  // The innermost containing span owns a byte: with `«…»` quotes a span can now
  // nest inside a backtick span (and vice versa), and the nested span is the one
  // whose raw carries that byte (see clipSpanRaw). For the disjoint spans of the
  // backtick-only grammar this is the same span the old first-hit scan returned.
  const spanIndexAt = (off) => {
    let best = -1;
    for (let i = 0; i < spans.length; i++) {
      if (off < spans[i].start || off >= spans[i].end) continue;
      if (best < 0 || spans[i].end - spans[i].start < spans[best].end - spans[best].start) best = i;
    }
    return best;
  };
  const symbolsForOff = (off, excludeWord) => {
    const si = spanIndexAt(off);
    if (si < 0) return [];
    const own = identifierCandidates(unwrap(spans[si].raw, spans[si].start + 1).text.replace(excludeWord, ' '), [excludeWord]);
    if (own.length) return own;
    const prev = spans[si - 1];
    if (prev && spans[si].start - prev.end <= 8) {
      const p = identifierCandidates(unwrap(prev.raw, prev.start + 1).text, [excludeWord]);
      if (p.length) return p;
    }
    return [];
  };

  // span tokens -> token events (attached refs are stripped: they own themselves)
  for (const span of spans) {
    const view = unwrap(span.raw, span.start + 1);
    const line = lineAt(starts, span.start);
    for (const wordRaw of view.text.split(/[\s,;|()[\]]+/)) {
      const word = stripTrailing(wordRaw);
      if (!word) continue;
      let head = word;
      let hasRef = false;
      const rm = REF_SCAN_RE.exec(word);
      if (rm && rm.index > 0) {
        const cand = word.slice(0, rm.index);
        if (isPathLike(cand, opts.src) || ALIASES[cand]) { head = cand; hasRef = true; }
      }
      if (!isPathLike(head, opts.src) && !aliasCited(head, hasRef)) continue;
      tokenEvents.push({ off: span.start, line, word: head, span, view, hasRef });
    }
  }

  const declEvents = [];
  {
    let off = 0;
    for (const line of lines) {
      if (isDecl(line)) declEvents.push({ off, type: 'decl', line: lineAt(starts, off) });
      off += line.length + 1;
    }
  }

  const refEvents = enumerateRefEvents(masked, fences, opts.src);
  const proseTokens = enumerateProseTokens(masked, fences, spans, opts.src);

  const events = [
    ...tokenEvents.map((t) => ({ ...t, type: 'token' })),
    ...declEvents,
    ...proseTokens.map((t) => ({ ...t, type: 'ptoken', line: lineAt(starts, t.off) })),
    ...refEvents.map((r) => ({ ...r, type: 'ref', line: lineAt(starts, r.off) })),
  ].sort((a, b) => a.off - b.off || (a.type === 'token' ? -1 : a.type === 'decl' ? 0 : 1));

  for (const ev of events) {
    if (ev.type === 'decl') {
      if (firstSrcOwner) {
        counts.decl++;
        sticky = firstSrcOwner;
      }
      continue;
    }
    if (ev.type === 'ptoken') {
      // a prose token carries no ref by construction, so a bare alias word is prose here
      const rec = aliasCited(ev.word, false)
        ? aliasRec(ev.word, opts)
        : classifyToken(ev.word, { opts, selfIdx, fleetIdx, srcIdx, rel, docText: text, off: ev.off });
      counts.prose++;
      if (rec.targetPath) {
        tokenTimeline.push({ off: ev.off, rec, symbols: [] });
        if (rec.rung === 'src') {
          const ownerRec = { rec, symbols: [] };
          sticky = ownerRec;
          noteOwner(ownerRec);
        }
      }
      continue;
    }
    if (ev.type === 'token') {
      const frag = fragmentKind(ev.word);
      if (frag) {
        push({
          file: rel, line: ev.line, token: ev.word, class: frag, rung: 'none', kind: 'FRAGMENT',
          severity: 'note', target: null, ref: null, via: 'inline',
          message: `${ev.word} is not a citation (${frag})`,
        });
        continue;
      }
      const rec = aliasCited(ev.word, ev.hasRef)
        ? aliasRec(ev.word, opts)
        : classifyToken(ev.word, { opts, selfIdx, fleetIdx, srcIdx, rel, docText: text, off: ev.off });
      rec.symbols = symbolsForOff(ev.span.start, ev.word);
      push({
        file: rel, line: ev.line, token: ev.word, class: rec.klass, rung: rec.rung, kind: rec.kind,
        severity: rec.severity, target: rec.target, ref: null, via: 'inline', message: rec.message,
      });
      if (rec.targetPath) {
        tokenTimeline.push({ off: ev.off, rec, symbols: rec.symbols });
      }
      if (rec.rung === 'src' && rec.targetPath) {
        const ownerRec = { rec, symbols: rec.symbols };
        sticky = ownerRec;
        noteOwner(ownerRec);
      }
      continue;
    }

    // --- ref event
    let owner = null;
    let via = 'sticky';
    if (ev.attachedTo) {
      const word = ev.attachedTo;
      let rec = null;
      if (isPathLike(word, opts.src) && !fragmentKind(word)) rec = classifyToken(word, { opts, selfIdx, fleetIdx, srcIdx, rel, docText: text, off: ev.off });
      else if (aliasCited(word, true)) rec = aliasRec(word, opts);
      if (rec && rec.targetPath) {
        owner = { rec, symbols: symbolsForOff(ev.off, word) };
        via = 'inline';
      } else if (rec && rec.kind === 'UNRESOLVED' && aliasCited(word, true)) {
        push({
          file: rel, line: ev.line, token: word, class: rec.klass, rung: rec.rung, kind: rec.kind,
          severity: rec.severity, target: null, ref: ev.refs.map((r) => r.short).join('/'), via: 'inline',
          message: rec.message,
        });
      }
    }
    if (!owner) {
      // v1 grammar: a ref inside the span, or within ~40 chars after a path
      // token, belongs to that token (never to a later one).
      for (let i = tokenTimeline.length - 1; i >= 0; i--) {
        const t = tokenTimeline[i];
        if (t.off >= ev.off) continue;
        if (ev.off - t.off <= 2) { owner = t; via = 'inline'; }
        break;
      }
    }
    if (!owner) owner = sticky;
    if (!owner || !owner.rec.targetPath) {
      for (const ref of ev.refs) {
        counts.orphanRefs++;
        push({
          file: rel, line: ev.line, token: ev.attachedTo || '', class: 'source', rung: 'none',
          kind: 'ORPHAN_REF', severity: 'warn', target: null, ref: ref.short, via: 'none',
          message: `${ref.short} has no owning path token in ${rel} (no sticky owner yet)`,
        });
      }
      continue;
    }
    // range verification: a bound ref may disagree with its nearest token owner
    const fits = (o) => o.rec.targetPath && ev.refs.every((r) => linesOf(o.rec.targetPath) >= r.end);
    if (!fits(owner) && via === 'sticky') {
      let alt = null;
      for (const cand of ownerStack) {
        if (cand.rec.target !== owner.rec.target && fits(cand)) { alt = cand; break; }
      }
      if (alt) {
        counts.altOwner++;
        const n = linesOf(owner.rec.targetPath);
        push({
          file: rel, line: ev.line, token: owner.rec.token, class: owner.rec.klass, rung: owner.rec.rung,
          kind: 'REF_OWNER_AMBIG', severity: 'note', target: alt.rec.target,
          ref: ev.refs.map((r) => r.short).join('/'), via,
          message: `${ev.refs.map((r) => r.short).join('/')} does not fit ${owner.rec.target} (${n} lines) but fits ${alt.rec.target}; bound to ${alt.rec.target}`,
        });
        owner = alt;
      }
    }
    for (const ref of ev.refs) refFinding(owner, ref, via, ev.line, false);
  }

  counts.pins = 0; counts.pinsOk = 0; counts.pinsMismatch = 0; counts.pinsUntyped = 0;
  counts.revUnknown = 0; counts.pinsUnchecked = 0;
  const ownerAt = (offset) => {
    for (let i = tokenTimeline.length - 1; i >= 0; i--) {
      const t = tokenTimeline[i];
      if (t.off < offset && t.rec.targetPath) return t;
    }
    return sticky && sticky.rec.targetPath ? sticky : null;
  };
  findings.push(...pinFindings(ctx, rel, starts, ownerAt, counts));

  return { file: rel, findings, counts };
}

/* ----------------------------------------------------------------- driver */

function runCheck(opts) {
  const srcIdx = buildIndex(opts.src);
  const selfIdx = buildIndex(opts.self, 8);
  const fleetIdx = buildIndex(opts.fleet);
  const docs = listDocs(opts.self);
  const repoOrder = [opts.src, opts.self, opts.fleet].filter((p, i, a) => p && a.indexOf(p) === i);
  const files = [];
  const totals = {
    docs: docs.length, filesScanned: 0, tokens: 0, refs: 0, symbols: 0, orphanRefs: 0,
    altOwnerRefs: 0, findings: 0, declarations: 0, indexFiles: srcIdx.files.length,
    selfIndexFiles: selfIdx.files.length, fleetIndexFiles: fleetIdx.files.length,
    byClass: {}, byKind: {}, bySeverity: {}, byRung: {}, proseTokens: 0,
    pins: 0, pinsOk: 0, pinsMismatch: 0, pinsUntyped: 0, revUnknown: 0, pinsUnchecked: 0,
    resolved: 0, error: 0, warn: 0, note: 0,
  };
  const bump = (bag, k) => { bag[k] = (bag[k] || 0) + 1; };

  for (const rel of docs) {
    let text;
    try { text = readFileSync(join(opts.self, rel), 'utf8'); } catch { continue; }
    totals.filesScanned++;
    const ctx = { text, rel, opts, src: opts.src, selfIdx, fleetIdx, srcIdx };
    const { findings, counts } = analyzeDoc(rel, ctx);
    totals.refs += counts.refs;
    totals.symbols += counts.symbols;
    totals.orphanRefs += counts.orphanRefs;
    totals.altOwnerRefs += counts.altOwner;
    totals.declarations += counts.decl;
    totals.proseTokens += counts.prose;
    totals.pins += counts.pins;
    totals.pinsOk += counts.pinsOk;
    totals.pinsMismatch += counts.pinsMismatch;
    totals.pinsUntyped += counts.pinsUntyped;
    totals.revUnknown += counts.revUnknown;
    totals.pinsUnchecked += counts.pinsUnchecked;

    totals.tokens += findings.filter((f) => f.via !== 'pin' && f.kind !== 'FRAGMENT').length;
    findings.sort((a, b) => a.line - b.line || String(a.token).localeCompare(String(b.token))
      || String(a.kind).localeCompare(String(b.kind)) || String(a.ref).localeCompare(String(b.ref)));
    for (const f of findings) {
      bump(totals.byClass, f.class);
      bump(totals.byKind, f.kind);
      bump(totals.bySeverity, f.severity);
      bump(totals.byRung, f.rung);
      if (f.severity === 'error') totals.error++;
      else if (f.severity === 'warn') totals.warn++;
      else totals.note++;
      if (f.kind === 'OK') totals.resolved++;
    }
    totals.findings += findings.length;
    files.push({ file: rel, findings });
  }

  const drift = totals.error > 0 || (opts.strict && totals.warn > 0);
  const verdict = totals.filesScanned > 0 && totals.resolved > 0 && !drift ? 'PASS' : 'FAIL';
  return {
    schema: SCHEMA, src: opts.src, self: opts.self, fleet: opts.fleet,
    options: { strict: opts.strict, symbols: opts.symbols },
    indexSize: srcIdx.files.length, files, totals, verdict,
    citeCheck: verdict === 'PASS' ? 'CLEAN' : 'DRIFT',
  };
}

function renderText(report, opts) {
  const L = [];
  L.push(`kumitate cite-check — ${SCHEMA}`);
  L.push(`src=${report.src} (index ${report.totals.indexFiles} files)`);
  L.push(`self=${report.self}  fleet=${report.fleet}`);
  L.push(`mode:${opts.symbols ? ' symbols' : ''}${opts.strict ? ' strict' : ''}${opts.all ? ' all' : ''}`);
  L.push('');
  for (const f of report.files) {
    const shown = f.findings.filter((x) => opts.all || x.severity !== 'note');
    if (!shown.length) continue;
    L.push(f.file);
    for (const x of shown) {
      L.push(`  ${f.file}:${x.line}  ${x.severity.toUpperCase().padEnd(5)} ${x.kind.padEnd(17)} [${x.class}/${x.rung}] ${x.token}${x.ref || ''} — ${x.message}`);
    }
    L.push('');
  }
  const t = report.totals;
  L.push('totals');
  L.push(`  filesScanned=${t.filesScanned} docs=${t.docs} tokens=${t.tokens} refs=${t.refs} symbols=${t.symbols} findings=${t.findings}`);
  L.push(`  orphanRefs=${t.orphanRefs} altOwnerRefs=${t.altOwnerRefs} declarations=${t.declarations}`);
  L.push(`  bySeverity=${JSON.stringify(t.bySeverity)}`);
  L.push(`  byClass=${JSON.stringify(t.byClass)}`);
  L.push(`  byKind=${JSON.stringify(t.byKind)}`);
  L.push(`  byRung=${JSON.stringify(t.byRung)}`);
  L.push(`  pins=${t.pins} ok=${t.pinsOk} mismatch=${t.pinsMismatch} untyped=${t.pinsUntyped} revUnknown=${t.revUnknown} unchecked=${t.pinsUnchecked}`);
  L.push(`  indexFiles=${t.indexFiles} selfIndexFiles=${t.selfIndexFiles} fleetIndexFiles=${t.fleetIndexFiles}`);
  L.push(`VERDICT: ${report.verdict}`);
  const envErr = t.filesScanned === 0 ? 'empty-scan-set' : t.resolved === 0 ? 'zero-resolutions' : null;
  L.push(envErr
    ? `CITE_CHECK: DRIFT (environment: ${envErr})`
    : `CITE_CHECK: ${report.citeCheck} (files=${t.filesScanned} tokens=${t.tokens} errors=${t.error} warnings=${t.warn})`);
  return L.join('\n') + '\n';
}

/* --------------------------------------------------------------- self-test */

function copyDocs(from, to) {
  const docs = ['SKILL.md', ...walk(join(from, 'corpus')).files
    .filter((r) => r.endsWith('.md')).map((r) => join('corpus', r))];
  for (const rel of docs) {
    const src = join(from, rel);
    if (!existsSync(src)) continue;
    const dest = join(to, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(src));
  }
}

function materialize(selfRoot, srcRoot) {
  mkdirSync(join(selfRoot, 'corpus', 'knowledge'), { recursive: true });
  mkdirSync(join(srcRoot, 'scripts', 'ufo-lib'), { recursive: true });
  mkdirSync(join(srcRoot, 'scripts', 'other-lib'), { recursive: true });
  mkdirSync(join(srcRoot, 'crates', 'ufo-core-runtime', 'src'), { recursive: true });
  mkdirSync(join(srcRoot, 'config'), { recursive: true });
  mkdirSync(join(srcRoot, 'docs', 'evidence'), { recursive: true });
  mkdirSync(join(srcRoot, 'target', 'debug', 'build', 'ufo-core-runtime-x', 'out'), { recursive: true });

  writeFileSync(join(srcRoot, 'scripts', 'real.mjs'), Array.from({ length: 20 }, (_, i) => `// line ${i + 1}`).join('\n') + '\n');
  writeFileSync(join(srcRoot, 'scripts', 'ufo-lib', 'base.mjs'), '// ufo-lib base\nexport const X = 1;\n');
  writeFileSync(join(srcRoot, 'scripts', 'other-lib', 'base.mjs'), '// other-lib base\nexport const Y = 2;\n');
  // round-25 alias fixtures: the ALIASES targets must exist so a citation-shaped
  // `base:N` / `dispatcher:N` resolves (the bare forms must not be cited at all).
  mkdirSync(join(srcRoot, 'scripts', 'ufo-sighting-lib'), { recursive: true });
  writeFileSync(join(srcRoot, 'scripts', 'ufo-sighting-lib', 'base.mjs'),
    Array.from({ length: 1240 }, (_, i) => `// alias target line ${i + 1}`).join('\n') + '\n');
  writeFileSync(join(srcRoot, 'scripts', 'fleet-dispatcher.mjs'),
    Array.from({ length: 20 }, (_, i) => `// dispatcher line ${i + 1}`).join('\n') + '\n');
  writeFileSync(join(srcRoot, 'crates', 'ufo-core-runtime', 'src', 'gate.rs'),
    'use std::collections::BTreeMap;\n\npub enum GateDecision { Admit }\n');
  writeFileSync(join(srcRoot, 'crates', 'ufo-core-runtime', 'src', 'real.rs'),
    Array.from({ length: 8 }, (_, i) => `pub fn guarded${i}() {}`).join('\n') + '\n');
  writeFileSync(join(srcRoot, 'config', 'app.json'), '{\n "a": 1\n}\n');
  writeFileSync(join(srcRoot, 'docs', 'evidence', 'meta.json'), '{}\n');
  writeFileSync(join(srcRoot, 'target', 'debug', 'build', 'ufo-core-runtime-x', 'out', 'gen_roles.rs'), '// generated\n');

  const git = (args) => spawnSync('git', args, { cwd: srcRoot, encoding: 'utf8', shell: false });
  git(['init', '-q']);
  git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'add', '-A']);
  git(['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'fixture']);
  const head = git(['rev-parse', 'HEAD']).stdout.trim();
  const digest = sha256File(join(srcRoot, 'scripts', 'real.mjs'));

  writeFileSync(join(selfRoot, 'SKILL.md'), `# fixture SKILL

Bogus path: \`scripts/no-such-file.mjs\`.
Out-of-range ref: \`scripts/real.mjs:999\`.
Bogus rev: rev \`deadbeef1\`; real rev \`${head}\`; pin-shaped HEAD \`${head}\`.
Content pin matches: rev \`${digest.slice(0, 12)}…\`, sha256 \`${digest.slice(0, 10)}\`.
Content pin mismatch: rev-pinned sha256 \`0123456789ab…\`.
Lane vocabulary, not a line ref: the L0 hub writes \`meta.json\`.
Workspace artifact: \`.ufo/pending-work.json\` is run state, not source.
Generated build output: \`gen_roles.rs\` (\`$OUT_DIR\`).
Suffix resolve: \`ufo-lib/base.mjs\`.
Symbol: \`GateDecision\` (\`gate.rs:1\`) and also \`GateDecision\` (\`gate.rs:3\`).
Fragments: \`*.mjs\`, \`scripts/*.mjs\`, \`.json\`.
F4 misattributed ref: \`config/app.json\` (:12) — the ref fits scripts/real.mjs.
Shorthand: \`cli:1\` resolves through the alias map.

## section

\`manifest.json\` fixtures \`real.rs\` tail: refs \`real.rs:2\` and sticky \`:3\` follow.
`);

  writeFileSync(join(selfRoot, 'corpus', 'README.md'),
    '# fixture corpus\n\nsee `knowledge/dispatch-shapes.md` and `corpus/knowledge/dispatch-shapes.md`\n');
  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'dispatch-shapes.md'), '# dispatch shapes\n');
  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'prototype-tokens.md'),
    '# prototype member tokens\n\nProse, not paths: `toString`, `valueOf`, `constructor`, `hasOwnProperty`.\n'
    + 'One real ref in the same doc: `scripts/real.mjs:1`.\n');
  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'orphan.md'),
    '# orphan fixture\n\nA lone ref (:424242) with no path token anywhere above it.\n');

  // Round-23 fence fixtures. Fence lines are assembled from BT/F3/T3 so this
  // source stays free of nested-backtick template escapes. Each fixture is a
  // minimal document whose only interesting byte is one backticked citation.
  const BT = '`';
  const F3 = BT.repeat(3);
  const T3 = '~'.repeat(3);
  const fenceDoc = (...lines) => lines.join('\n') + '\n';
  const CITATION = `${BT}scripts/no-such-file.mjs${BT}`;

  // Round-25 alias fixtures. `alias-prose.md` holds bare alias words (no ref) that
  // must stay prose; `alias-shapes.md` holds the citation-shaped forms (attached
  // :N, backticked and in a table cell) that must still expand.
  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'alias-prose.md'),
    '# alias prose — a bare alias word is not a citation\n\n'
    + `The step-6 sentence names the ${BT}cdnBase${BT} constant; this bare ${BT}base${BT} is prose.\n`
    + `A ${BT}dispatcher${BT} spawns lane children; this bare ${BT}dispatcher${BT} is prose too.\n`
    + `The ${BT}cli${BT} parses argv; this bare ${BT}cli${BT} is prose as well.\n`);

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'alias-shapes.md'),
    '# alias citation shapes — an attached :N makes the alias a citation\n\n'
    + `Backticked range ref: ${BT}base:1233-1235${BT}.\n\n`
    + '| surface | ref |\n|---|---|\n| base:1233 | citation-shaped table cell |\n\n'
    + `Second alias with a ref: ${BT}dispatcher:5${BT}.\n`);

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'fence-backtick.md'), fenceDoc(
    '# fence fixture: backtick marker', '', F3, 'fenced body text', F3, '',
    `Prose after a backtick fence: ${CITATION}.`));

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'fence-tilde.md'), fenceDoc(
    '# fence fixture: tilde marker', '', T3, 'fenced body text', T3, '',
    `Prose after a tilde fence: ${CITATION}.`));

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'fence-cross-close.md'), fenceDoc(
    '# fence fixture: cross-closing is rejected', '', F3, 'fenced body text', T3, '',
    `${CITATION} after a non-matching marker line.`));

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'fence-cross-close-tilde.md'), fenceDoc(
    '# fence fixture: cross-closing is rejected (tilde opener)', '', T3, 'fenced body text', F3, '',
    `${CITATION} after a non-matching marker line.`));

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'fence-unclosed.md'), fenceDoc(
    '# fence fixture: unclosed fence masks to EOF', '', F3, 'fenced body text', '',
    `${CITATION} inside an unclosed fence.`));

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'fence-content.md'), fenceDoc(
    '# fence fixture: fence content is never tokenized', '', T3, CITATION, T3, '',
    `See ${BT}scripts/real.mjs${BT}.`));

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'fence-alignment.md'), fenceDoc(
    '# fence fixture: alignment self-heal', '',
    `${BT}scripts/real.mjs${BT} before the fence.`, '', F3, 'fenced body text', F3, '',
    `${BT}config/app.json${BT} after the fence.`));

  // Round-26 pairing fixtures. Pairing is line-local, so an odd or escaped
  // backtick on one line can no longer shift the parity of the lines below it.
  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'pairing-odd-line.md'), fenceDoc(
    '# pairing fixture: an odd backtick line above a cited line', '',
    `An odd line carrying a single stray ${BT} backtick.`, '',
    `A bare citation follows: ${BT}scripts/real.mjs${BT}.`));

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'pairing-escaped.md'), fenceDoc(
    '# pairing fixture: an escaped backtick is a literal', '',
    `Command: ${BT}grep -c '^| \\${BT}knowledge/' corpus/README.md${BT} here.`, '',
    `A lone escaped backtick: \\${BT}.`, '',
    `Still cited below the escaped line: ${BT}config/app.json${BT}.`));

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'pairing-trailing.md'), fenceDoc(
    '# pairing fixture: an unpaired trailing backtick', '',
    `A line ending in one backtick ${BT}`, '',
    `A following line with ${BT}lone${BT} text.`));

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'pairing-fence-both.md'), fenceDoc(
    '# pairing fixture: odd line, then a fence, tokens both sides', '',
    `Before the fence: ${BT}scripts/real.mjs${BT} with a stray ${BT} tick.`, '',
    F3, 'fenced body text', F3, '',
    `After the fence: ${BT}config/app.json${BT}.`));

  // Round-27 FP-exemption fixtures. `fp-exempt.md` carries the extension-list
  // and runtime-artifact shapes (each positive must grade note) plus three
  // negative guards that must keep grading UNRESOLVED error. `fp-binary.md`
  // carries the binary-internal shape: the same `src/…` token shape must be a
  // note when a byte-offset marker follows it ('at byte N' / '(byte N)'), an
  // error when no marker follows, and a normal src resolution when the file
  // really exists (the exemption never shadows a resolvable citation).
  mkdirSync(join(srcRoot, 'src', 'utils'), { recursive: true });
  writeFileSync(join(srcRoot, 'src', 'utils', 'remote-control-ok.ts'), 'export const mapped = 1;\n');

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'fp-exempt.md'), fenceDoc(
    '# round-27 exemptions: extension lists and runtime-artifact names', '',
    `Extension list, not a path: ${BT}.mjs/.rs/.sh/.js${BT}.`, '',
    `Runtime dot artifact: ${BT}.session-retention.lock${BT} is the retention lock name.`, '',
    `Declared run-state names: ${BT}audit-env.sh${BT}, ${BT}summary.txt${BT}, ${BT}l0-watch-state.json${BT}.`, '',
    `Negative guard, real dead path: ${BT}scripts/dead-helper.mjs${BT}.`, '',
    `Negative guard, extension list with a real path mixed in: ${BT}scripts/x.mjs/.rs${BT}.`, '',
    `Negative guard, slash-path lookalikes: ${BT}scripts/audit-env.sh${BT} and ${BT}logs/.session-retention.lock${BT}.`));

  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'fp-binary.md'), fenceDoc(
    '# binary-internal fixture: region context decides', '',
    `A bare region token with no binary context: ${BT}src/utils/plain-thing.ts${BT}.`, '',
    `The kimi binary (~/.kimi-code/bin/kimi) carries a strings region `
    + `${BT}src/utils/remote-control-qr.ts${BT} at byte 142051126, and a mapped one `
    + `${BT}src/utils/remote-control-ok.ts${BT} too.`));

  // Round-28 quote fixtures. `quote-spans.md` carries the house `«…»`
  // verbatim-quote convention: a quote crossing three lines (one span, content
  // preserved), a backticked citation inside a quote (the line-local backtick
  // pairing runs inside the quote too), a backticked `«inline»` pair and a
  // backticked quote carrying a citation (each byte owned by exactly one span,
  // so a citation is reported once, never twice), a quote inside a fence (never
  // a span — the round-16 masking still wins), and a lone `«` on the LAST line
  // (nothing follows it, so it stays prose and no span is invented).
  const GQ = '\u00ab';
  const GQc = '\u00bb';
  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'quote-spans.md'), fenceDoc(
    `# round-28 fixture: the ${GQ}…${GQc} verbatim-quote convention`, '',
    `A three-line quote: ${GQ}first line of the quote`,
    `second line carries a real citation ${BT}scripts/real.mjs:1${BT} inside it`,
    `third line closes the quote.${GQc}`, '',
    `A backticked ${BT}${GQ}inline${GQc}${BT} pair is one span, not two.`, '',
    `A backticked quote with a citation: ${BT}${GQ}scripts/real.mjs:2${GQc}${BT}.`, '',
    `A plain citation in a quote: ${GQ}see scripts/other-lib/base.mjs here${GQc}.`, '',
    `${BT}config/app.json${BT} after the quote block is still found.`, '',
    F3, `${GQ}quoted ${BT}scripts/no-such-file.mjs${BT} inside a fence${GQc}`, F3, '',
    `A lone opener ${GQ} stays prose to the end of the document.`));
}

function selfTest(opts) {
  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-cite-selftest-'));
  const hermetic = [];
  const integration = [];
  let liveErrors = null;
  // The fixture group is always materialized in the shared tmpdir; the groups are
  // selected at reporting time, so `--integrations` alone stays read-only.
  const record = (group, name, fn) => {
    let ok = false, detail = '';
    try { const r = fn(); ok = r.ok; detail = r.detail; } catch (e) { detail = `threw: ${e.message}`; }
    group.push({ name, ok, detail });
  };
  const check = (name, fn) => record(hermetic, name, fn);
  const checkI = (name, fn) => record(integration, name, fn);
  try {
    const selfRoot = join(tmp, 'self');
    const srcRoot = join(tmp, 'src');
    materialize(selfRoot, srcRoot);
    const base = { ...opts, src: srcRoot, self: selfRoot, fleet: dirname(selfRoot), json: true };
    const run = (extra = {}) => runCheck({ ...base, ...extra });
    const allOf = (rep) => rep.files.flatMap((f) => f.findings);
    const kindOf = (rep, kind) => allOf(rep).filter((f) => f.kind === kind);
    const mkdirAlias = mkdirSync(join(srcRoot, 'crates', 'ufo-cli', 'src'), { recursive: true });
    void mkdirAlias;
    writeFileSync(join(srcRoot, 'crates', 'ufo-cli', 'src', 'main.rs'), 'fn main() {}\n');
    const head = spawnSync('git', ['-C', srcRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();

    const rep = run();
    const symRep = run({ symbols: true });

    check('bogus-path → UNRESOLVED error', () => {
      const hit = kindOf(rep, 'UNRESOLVED').find((f) => f.token === 'scripts/no-such-file.mjs');
      return { ok: Boolean(hit) && hit.severity === 'error' && rep.verdict === 'FAIL',
        detail: hit ? `${hit.kind}/${hit.severity} @${hit.file}:${hit.line}` : 'not reported' };
    });
    check('prototype-member token (`toString`) is prose, not a crash', () => {
      const protoRep = run();
      const docs = protoRep.files.filter((f) => f.file === 'corpus/knowledge/prototype-tokens.md');
      const errors = docs.flatMap((f) => f.findings).filter((f) => f.severity === 'error');
      return { ok: docs.length === 1 && errors.length === 0,
        detail: `docs=${docs.length} errors=${errors.length}${errors[0] ? ` ${errors[0].kind}` : ''}` };
    });
    check('out-of-range ref → LINE_OOR error', () => {
      const hit = kindOf(rep, 'LINE_OOR').find((f) => f.token === 'scripts/real.mjs' && f.ref === ':999');
      return { ok: Boolean(hit) && hit.severity === 'error', detail: hit ? hit.message : 'not reported' };
    });
    check('bogus rev → REV_UNKNOWN error', () => {
      const hit = kindOf(rep, 'REV_UNKNOWN').find((f) => f.token === 'deadbeef1');
      return { ok: Boolean(hit) && hit.severity === 'error', detail: hit ? hit.message : 'not reported' };
    });
    check('real rev → resolved-by-git', () => {
      const hit = allOf(rep).find((f) => f.token === head && f.kind === 'OK' && /resolved-by-git/.test(f.message));
      return { ok: Boolean(hit), detail: hit ? hit.message : 'not reported' };
    });
    check('content pin match → OK; mismatch → PIN_MISMATCH', () => {
      const m = allOf(rep).find((f) => /matches sha256/.test(f.message) || /resolved-by-content/.test(f.message));
      const b = kindOf(rep, 'PIN_MISMATCH').find((f) => f.token === '0123456789ab');
      return { ok: Boolean(m) && Boolean(b) && b.severity === 'error',
        detail: `match=${m ? 'yes' : 'no'} mismatch=${b ? b.kind : 'no'}` };
    });
    check('L0 lane vocabulary → no LINE_OOR', () => {
      const bad = kindOf(rep, 'LINE_OOR').filter((f) => /meta\.json/.test(f.token));
      return { ok: bad.length === 0, detail: `lineOOR=${bad.length}` };
    });
    check('runtime artifact name → RUNTIME_UNRESOLVED warn', () => {
      const hit = kindOf(rep, 'RUNTIME_UNRESOLVED').find((f) => f.token === 'docs/evidence/meta.json' || f.token === 'meta.json');
      return { ok: Boolean(hit) && hit.severity === 'warn', detail: hit ? hit.message : 'not reported' };
    });
    check('workspace artifact → note, not error', () => {
      const hit = allOf(rep).find((f) => f.token === '.ufo/pending-work.json');
      return { ok: Boolean(hit) && hit.severity === 'note' && hit.class === 'runtime', detail: hit ? `${hit.class}/${hit.severity}` : 'absent' };
    });
    check('unique suffix → SUFFIX_RESOLVED warn', () => {
      const hit = kindOf(rep, 'SUFFIX_RESOLVED').find((f) => f.token === 'ufo-lib/base.mjs');
      return { ok: Boolean(hit) && hit.severity === 'warn', detail: hit ? hit.message : 'not reported' };
    });
    check('symbol off-line → SYMBOL_OFF_LINE error; on-line → OK', () => {
      const miss = kindOf(symRep, 'SYMBOL_OFF_LINE').find((f) => f.token === 'gate.rs' && f.ref === ':1');
      const hit = allOf(symRep).find((f) => f.token === 'gate.rs' && f.ref === ':3' && /GateDecision present/.test(f.message));
      return { ok: Boolean(miss) && miss.severity === 'error' && Boolean(hit),
        detail: `offline=${miss ? miss.message : 'absent'} online=${hit ? 'yes' : 'no'}` };
    });
    check('fragments → FRAGMENT note, no error', () => {
      const frag = allOf(rep).filter((f) => f.kind === 'FRAGMENT');
      const err = allOf(rep).filter((f) => f.severity === 'error' && /[*?]|^\./.test(f.token));
      return { ok: frag.length >= 3 && err.length === 0, detail: `fragments=${frag.length} strayErrors=${err.length}` };
    });
    check('ownerless ref → ORPHAN_REF warn (never LINE_OOR)', () => {
      const orph = kindOf(rep, 'ORPHAN_REF').filter((f) => f.ref === ':424242');
      const bad = kindOf(rep, 'LINE_OOR').filter((f) => f.ref === ':424242');
      return { ok: orph.length === 1 && orph.every((f) => f.severity === 'warn') && bad.length === 0,
        detail: `orphans=${orph.length} lineOOR=${bad.length}` };
    });
    check('file-relative ladder rung', () => {
      const hit = allOf(rep).find((f) => f.token === 'knowledge/dispatch-shapes.md' && f.rung === 'file-relative');
      return { ok: Boolean(hit), detail: hit ? `${hit.kind} ${hit.target}` : 'not reported' };
    });
    check('shorthand alias `cli:1` resolves', () => {
      const hit = allOf(rep).find((f) => f.via === 'inline' && f.ref === ':1' && /crates\/ufo-cli\/src\/main\.rs/.test(f.message));
      return { ok: Boolean(hit), detail: hit ? hit.message : 'not reported' };
    });
    check('F4-class misattributed ref → explicit ref-owner finding (both files named)', () => {
      const hit = allOf(rep).find((f) => (f.kind === 'REF_OWNER_AMBIG' || f.kind === 'LINE_OOR')
        && f.ref === ':12' && /config\/app\.json/.test(f.message) && /real\.mjs/.test(f.message));
      return { ok: Boolean(hit),
        detail: hit ? `${hit.kind}/${hit.severity}: ${hit.message}` : 'not reported' };
    });
    check('generated $OUT_DIR name → generated class, no error', () => {
      const hit = allOf(rep).find((f) => f.class === 'generated' && f.token === 'gen_roles.rs');
      return { ok: Boolean(hit) && hit.severity === 'note', detail: hit ? hit.message : 'not reported' };
    });
    check('sticky owner carries bare refs', () => {
      const hit = allOf(rep).find((f) => f.ref === ':3' && /real\.rs/.test(f.message || ''));
      return { ok: Boolean(hit), detail: hit ? hit.message : 'not reported' };
    });
    check('text/json totals agree, verdict line present', () => {
      const text = renderText(rep, { ...base, all: false });
      const m = /byClass=(\{[^}]*\})/.exec(text);
      return { ok: Boolean(m) && m[1] === JSON.stringify(rep.totals.byClass)
        && text.includes(`VERDICT: ${rep.verdict}`) && text.includes('CITE_CHECK:')
        && JSON.stringify(rep).includes(`"verdict":"${rep.verdict}"`),
        detail: m ? `text byClass=${m[1]}` : 'no totals block' };
    });
    check('fail-closed: empty scan set → exit-2 condition', () => {
      const emptySelf = join(tmp, 'empty-self');
      mkdirSync(emptySelf, { recursive: true });
      const r = runCheck({ ...base, self: emptySelf, fleet: dirname(emptySelf) });
      const ok = r.totals.filesScanned === 0 && r.verdict === 'FAIL';
      return { ok, detail: `filesScanned=${r.totals.filesScanned} verdict=${r.verdict}` };
    });

    // --- round-23 fence repair (round-16 defect: fence backticks paired as
    // span delimiters, shifting alignment and silently dropping the citation
    // that followed a ``` fence).
    const fenceFile = (name) => rep.files.find((f) => f.file === `corpus/knowledge/${name}`);
    const fenceHits = (name, token) => (fenceFile(name) ? fenceFile(name).findings : [])
      .filter((f) => f.token === token);
    const fenceProbe = (name) => {
      const text = readFileSync(join(selfRoot, 'corpus', 'knowledge', name), 'utf8');
      const fences = findFences(text);
      return { text, fences, masked: maskFences(text, fences) };
    };
    // a fence that never receives its own closer must swallow the rest of the file
    const swallowedToEof = (name) => {
      const p = fenceProbe(name);
      const region = p.fences.length === 1 ? p.masked.slice(p.fences[0][0]) : null;
      return {
        ok: p.fences.length === 1 && p.fences[0][1] === p.text.length
          && region !== null && region.trim() === '',
        detail: `fences=${JSON.stringify(p.fences)} eof=${p.text.length} maskedTail=${region === null ? 'n/a' : region.trim() === '' ? 'blank' : 'live bytes'}`,
      };
    };

    check('R16 repro: token after a ``` fence is found (UNRESOLVED), not lost', () => {
      const hit = fenceHits('fence-backtick.md', 'scripts/no-such-file.mjs');
      return { ok: hit.length === 1 && hit[0].kind === 'UNRESOLVED' && hit[0].severity === 'error',
        detail: hit.length ? `${hit[0].kind}/${hit[0].severity} @${hit[0].file}:${hit[0].line}` : 'lost (no finding)' };
    });
    check('R16 repro: ~~~ fence gives the same result as ``` (marker-symmetric)', () => {
      const bt = fenceHits('fence-backtick.md', 'scripts/no-such-file.mjs');
      const tl = fenceHits('fence-tilde.md', 'scripts/no-such-file.mjs');
      const desc = (a) => (a.length === 1 ? `${a[0].kind}/${a[0].severity}@line${a[0].line}` : `lost(${a.length})`);
      return { ok: bt.length === 1 && tl.length === 1 && bt[0].kind === tl[0].kind
        && bt[0].severity === tl[0].severity && bt[0].line === tl[0].line,
        detail: `backtick=${desc(bt)} tilde=${desc(tl)}` };
    });
    check('cross-closing rejected: ~~~ does not close ```, and ``` does not close ~~~', () => {
      const bt = swallowedToEof('fence-cross-close.md');
      const tl = swallowedToEof('fence-cross-close-tilde.md');
      const reported = fenceHits('fence-cross-close.md', 'scripts/no-such-file.mjs').length
        + fenceHits('fence-cross-close-tilde.md', 'scripts/no-such-file.mjs').length;
      return { ok: bt.ok && tl.ok && reported === 0,
        detail: `backtickOpened[${bt.detail}] tildeOpened[${tl.detail}] reported=${reported}` };
    });
    check('unclosed fence at EOF masks to end of file', () => {
      const p = swallowedToEof('fence-unclosed.md');
      const reported = fenceHits('fence-unclosed.md', 'scripts/no-such-file.mjs').length;
      return { ok: p.ok && reported === 0, detail: `${p.detail} reported=${reported}` };
    });
    check('fence content is never tokenized (by design, kept)', () => {
      const inside = fenceHits('fence-content.md', 'scripts/no-such-file.mjs').length;
      const after = fenceHits('fence-content.md', 'scripts/real.mjs');
      return { ok: inside === 0 && after.length === 1 && after[0].kind === 'OK',
        detail: `insideFence=${inside} afterFence=${after.length ? after[0].kind : 'lost'}` };
    });
    check('alignment self-heal: tokens before AND after a ``` fence are both found', () => {
      const before = fenceHits('fence-alignment.md', 'scripts/real.mjs');
      const after = fenceHits('fence-alignment.md', 'config/app.json');
      return { ok: before.length === 1 && after.length === 1
        && before[0].kind === 'OK' && after[0].kind === 'OK',
        detail: `before=${before.length ? before[0].kind : 'lost'} after=${after.length ? after[0].kind : 'lost'}` };
    });

    // round-25 ─ alias-poisoning repair: an alias expands only in citation shape
    // (the bare word carrying an attached :N), never as bare prose. Before the
    // repair a bare backticked `base` minted a citation to the sighting-lib base
    // module and the sticky-owner fallback then mis-hashed the seven @sha256
    // pins in kimi-binary-secrets.md against it (false PIN_MISMATCHs).
    const aliasFile = (name) => rep.files.find((f) => f.file === `corpus/knowledge/${name}`);
    const aliasHits = (name, token) => (aliasFile(name) ? aliasFile(name).findings : [])
      .filter((f) => f.token === token);

    check('alias: a bare backticked `base` in prose is not a citation', () => {
      const hits = aliasHits('alias-prose.md', 'base');
      return { ok: hits.length === 0,
        detail: hits.length ? `${hits.length} finding(s): ${hits[0].kind}` : 'no citation' };
    });
    check('alias: bare `dispatcher` and `cli` in prose are not citations', () => {
      const d = aliasHits('alias-prose.md', 'dispatcher');
      const c = aliasHits('alias-prose.md', 'cli');
      return { ok: d.length === 0 && c.length === 0, detail: `dispatcher=${d.length} cli=${c.length}` };
    });
    check('alias: `base:1233-1235` still expands (citation shape)', () => {
      const hit = aliasHits('alias-shapes.md', 'base').find((f) => f.ref === ':1233-1235');
      return { ok: Boolean(hit) && hit.kind === 'OK' && hit.rung === 'src',
        detail: hit ? `${hit.kind}/${hit.severity} ${hit.message}` : 'not expanded' };
    });
    check('alias: `base:1233` in a citation-shaped table cell still expands', () => {
      const hit = aliasHits('alias-shapes.md', 'base').find((f) => f.ref === ':1233');
      return { ok: Boolean(hit) && hit.kind === 'OK',
        detail: hit ? `${hit.kind} ${hit.message}` : 'not expanded' };
    });
    check('alias: second alias `dispatcher:5` gets the same treatment (expands)', () => {
      const hit = aliasHits('alias-shapes.md', 'dispatcher').find((f) => f.ref === ':5');
      return { ok: Boolean(hit) && hit.kind === 'OK' && /fleet-dispatcher\.mjs/.test(hit.message),
        detail: hit ? hit.message : 'not expanded' };
    });

    // round-26 ─ line-local span pairing (repair of the round-23 parity residual:
    // an escaped or odd backtick used to flip the pairing parity for the whole
    // file, silently dropping the citations below it).
    const pairProbe = (name) => {
      const text = readFileSync(join(selfRoot, 'corpus', 'knowledge', name), 'utf8');
      const fences = findFences(text);
      const masked = maskFences(text, fences);
      return { text, fences, masked, spans: findSpans(masked, fences) };
    };

    check("pairing: an odd-backtick line leaves the next line's citation reported", () => {
      const hit = fenceHits('pairing-odd-line.md', 'scripts/real.mjs');
      return { ok: hit.length >= 1 && hit[0].kind === 'OK',
        detail: hit.length ? `${hit[0].kind}/${hit[0].severity} @line${hit[0].line}` : 'lost (no finding)' };
    });
    check('pairing: an escaped backtick stays in its span and flips no parity', () => {
      const inSpan = fenceHits('pairing-escaped.md', 'corpus/README.md');
      const below = fenceHits('pairing-escaped.md', 'config/app.json');
      return { ok: inSpan.length >= 1 && inSpan[0].kind === 'OK' && below.length >= 1 && below[0].kind === 'OK',
        detail: `escapedLineSpan=${inSpan.length ? inSpan[0].kind : 'lost'} belowLine=${below.length ? below[0].kind : 'lost'}` };
    });
    check('pairing: an unpaired trailing backtick makes no phantom span', () => {
      const p = pairProbe('pairing-trailing.md');
      const raws = p.spans.map((s) => s.raw);
      return { ok: p.spans.length === 1 && raws[0] === 'lone',
        detail: `spans=${JSON.stringify(raws)}` };
    });
    check('pairing: no backtick span ever crosses a newline (grammar invariant)', () => {
      const names = ['pairing-odd-line.md', 'pairing-escaped.md', 'pairing-trailing.md', 'pairing-fence-both.md'];
      const bad = names.flatMap((n) => pairProbe(n).spans
        .filter((s) => s.raw.includes('\n'))
        .map((s) => `${n}:${JSON.stringify(s.raw.slice(0, 24))}`));
      return { ok: bad.length === 0, detail: bad.length ? bad.join(' ') : 'all backtick spans single-line' };
    });
    check('R23 repro under line-local pairing: tokens before AND after a ``` fence are both found', () => {
      const before = fenceHits('pairing-fence-both.md', 'scripts/real.mjs');
      const after = fenceHits('pairing-fence-both.md', 'config/app.json');
      return { ok: before.length >= 1 && after.length >= 1 && before[0].kind === 'OK' && after[0].kind === 'OK',
        detail: `before=${before.length ? before[0].kind : 'lost'} after=${after.length ? after[0].kind : 'lost'}` };
    });
    check('R16 regression: fence content is never tokenized under line-local pairing', () => {
      const p = pairProbe('fence-content.md');
      const inside = p.spans.filter((s) => s.raw.includes('no-such-file')).length;
      const after = fenceHits('fence-content.md', 'scripts/real.mjs');
      return { ok: inside === 0 && after.length === 1 && after[0].kind === 'OK',
        detail: `fenceSpans=${inside} afterFence=${after.length ? after[0].kind : 'lost'}` };
    });
    check('R25 regression: a bare backticked alias word is still not a citation', () => {
      const hits = aliasHits('alias-prose.md', 'base');
      return { ok: hits.length === 0, detail: hits.length ? `${hits.length} finding(s): ${hits[0].kind}` : 'no citation' };
    });

    // round-27 ─ the FP classification pass. Three exact-shape exemption classes
    // (extension-list, runtime-artifact, binary-internal) grade FP_EXEMPT note
    // ahead of the UNRESOLVED arm; the negative guards below prove the
    // exemption is exact-shape only (a lookalike path still errors).
    const fpNote = (name, token, klass) => {
      const hits = fenceHits(name, token);
      const errors = hits.filter((f) => f.severity === 'error');
      const note = hits.find((f) => f.kind === 'FP_EXEMPT' && f.class === klass);
      return {
        ok: Boolean(note) && note.severity === 'note' && errors.length === 0,
        detail: hits.length
          ? `${hits.map((f) => `${f.kind}/${f.severity}[${f.class}]`).join(', ')}`
          : 'no finding',
      };
    };
    const fpError = (name, token) => {
      const hits = fenceHits(name, token);
      const bad = hits.find((f) => f.kind === 'UNRESOLVED' && f.severity === 'error');
      return {
        ok: Boolean(bad) && !hits.some((f) => f.kind === 'FP_EXEMPT'),
        detail: hits.length ? `${hits.map((f) => `${f.kind}/${f.severity}[${f.class}]`).join(', ')}` : 'no finding',
      };
    };

    check('R27 exemption: extension list `.mjs/.rs/.sh/.js` → FP_EXEMPT note, not error', () => (
      fpNote('fp-exempt.md', '.mjs/.rs/.sh/.js', 'extension-list')));
    check('R27 exemption: dot runtime artifact `.session-retention.lock` → FP_EXEMPT note', () => (
      fpNote('fp-exempt.md', '.session-retention.lock', 'runtime-artifact')));
    check('R27 exemption: declared run-state names `audit-env.sh`/`summary.txt`/`l0-watch-state.json` → note', () => {
      const a = fpNote('fp-exempt.md', 'audit-env.sh', 'runtime-artifact');
      const s = fpNote('fp-exempt.md', 'summary.txt', 'runtime-artifact');
      const l = fpNote('fp-exempt.md', 'l0-watch-state.json', 'runtime-artifact');
      return { ok: a.ok && s.ok && l.ok,
        detail: `audit-env[${a.detail}] summary[${s.detail}] l0-watch[${l.detail}]` };
    });
    check('R27 exemption: binary-internal `src/…` in a strings region → FP_EXEMPT note', () => (
      fpNote('fp-binary.md', 'src/utils/remote-control-qr.ts', 'binary-internal')));
    check('R27 negative guard: a real dead path `scripts/dead-helper.mjs` still errors', () => (
      fpError('fp-exempt.md', 'scripts/dead-helper.mjs')));
    check('R27 negative guard: extension list with a real path mixed in (`scripts/x.mjs/.rs`) still errors', () => (
      fpError('fp-exempt.md', 'scripts/x.mjs/.rs')));
    check('R27 negative guard: slash-path lookalikes (`scripts/audit-env.sh`, `logs/.session-retention.lock`) still error', () => {
      const a = fpError('fp-exempt.md', 'scripts/audit-env.sh');
      const l = fpError('fp-exempt.md', 'logs/.session-retention.lock');
      return { ok: a.ok && l.ok, detail: `scripts/audit-env.sh[${a.detail}] logs/.session-retention.lock[${l.detail}]` };
    });
    check('R27 negative guard: binary-internal shape without a strings context (`src/utils/plain-thing.ts`) still errors', () => (
      fpError('fp-binary.md', 'src/utils/plain-thing.ts')));
    check('R27 guard: a `src/…` token that really exists resolves (the exemption never shadows it)', () => {
      const hits = fenceHits('fp-binary.md', 'src/utils/remote-control-ok.ts');
      const ok = hits.find((f) => f.kind === 'OK' && f.rung === 'src');
      return { ok: Boolean(ok) && !hits.some((f) => f.kind === 'FP_EXEMPT'),
        detail: hits.length ? `${hits.map((f) => `${f.kind}/${f.severity}[${f.rung}]`).join(', ')}` : 'no finding' };
    });

    // round-28 ─ the `«…»` verbatim-quote convention (repair of the round-26
    // multi-line coverage loss: the corpus's quotes wrap across lines, and the
    // line-local backtick grammar alone read their content as prose).
    const quoteProbe = (name) => {
      const text = readFileSync(join(selfRoot, 'corpus', 'knowledge', name), 'utf8');
      const fences = findFences(text);
      const masked = maskFences(text, fences);
      return { text, fences, masked, spans: findSpans(masked, fences) };
    };
    const QF = 'quote-spans.md';
    const quoteHits = (token) => fenceHits(QF, token);
    // every byte a span's raw does NOT carry verbatim must be owned by a span
    // nested inside it — the no-double-count invariant, checked structurally.
    const clipViolations = (p) => {
      const bad = [];
      for (const s of p.spans) {
        const nested = p.spans.filter((o) => o !== s && o.start >= s.start && o.end <= s.end);
        const owned = (i) => !nested.some((o) => i >= o.start && i < o.end);
        for (let i = s.start + 1; i < s.end - 1; i++) {
          const want = p.masked[i];
          if (owned(i) && s.raw[i - s.start - 1] !== want) bad.push(`${s.start}+${i - s.start - 1}`);
        }
      }
      return bad;
    };

    check('R28 quote: a «…» span crossing three lines is ONE span, content preserved', () => {
      const p = quoteProbe(QF);
      const hit = p.spans.filter((s) => s.raw.includes('first line of the quote'));
      return {
        ok: hit.length === 1 && hit[0].raw.includes('\n')
          && hit[0].raw.includes('third line closes the quote.')
          && hit[0].raw.includes('second line carries a real citation'),
        detail: hit.length === 1
          ? `one span, ${hit[0].raw.split('\n').length} lines: ${JSON.stringify(hit[0].raw.slice(0, 48))}`
          : `${hit.length} spans matched`,
      };
    });
    check('R28 quote: an unpaired « stays prose — no span is invented', () => {
      const p = quoteProbe(QF);
      const bad = p.spans.filter((s) => s.raw.includes('stays prose to the end'));
      const errs = fenceHits(QF, 'stays').length;
      return { ok: bad.length === 0 && errs === 0,
        detail: `spansOverLoneOpener=${bad.length} findingsForLoneText=${errs}` };
    });
    check('R28 quote: a backticked citation INSIDE a quote is still found', () => {
      const hit = quoteHits('scripts/real.mjs').filter((f) => f.ref === ':1');
      return { ok: hit.length === 1 && hit[0].kind === 'OK' && hit[0].rung === 'src',
        detail: hit.length ? `${hit.length}x ${hit[0].kind} ${hit[0].message}` : 'lost (no finding)' };
    });
    check('R28 quote: a plain citation inside a quote is span content', () => {
      const hit = quoteHits('scripts/other-lib/base.mjs');
      return { ok: hit.length === 1 && hit[0].kind === 'OK',
        detail: hit.length ? `${hit[0].kind}/${hit[0].severity} ${hit[0].message}` : 'lost (no finding)' };
    });
    check('R28 quote: a backticked «inline» pair is one span (no double count)', () => {
      const p = quoteProbe(QF);
      const inline = p.spans.filter((s) => s.raw.trim() === 'inline');
      return { ok: inline.length === 1, detail: `spansWithInlineContent=${inline.length}` };
    });
    check('R28 quote: a backticked quote carrying a citation counts once', () => {
      const hit = quoteHits('scripts/real.mjs').filter((f) => f.ref === ':2');
      const bogus = hit.filter((f) => f.severity === 'error');
      return { ok: hit.length === 1 && hit[0].kind === 'OK' && bogus.length === 0,
        detail: hit.length ? `${hit.length}x ${hit.map((f) => `${f.kind}/${f.severity}`).join(', ')}` : 'lost (no finding)' };
    });
    check('R28 quote: a «…» inside a fence is never a span (round-16 masking still wins)', () => {
      const p = quoteProbe(QF);
      const inside = p.spans.filter((s) => s.raw.includes('quoted'));
      const found = quoteHits('scripts/no-such-file.mjs').length;
      return { ok: inside.length === 0 && found === 0,
        detail: `fencedQuoteSpans=${inside.length} findingsForFencedCitation=${found}` };
    });
    check('R28 quote: no byte is censused twice (span-raw coverage invariant)', () => {
      const bad = ['quote-spans.md', 'pairing-escaped.md', 'pairing-odd-line.md']
        .flatMap((n) => clipViolations(quoteProbe(n)).map((b) => `${n}:${b}`));
      return { ok: bad.length === 0, detail: bad.length ? bad.slice(0, 6).join(' ') : 'every raw byte is owned exactly once' };
    });

    // round-24 ─ the derived --src default (bare invocation). A bare run carries
    // no `--src`; the default is derived from `$HOME`-relative candidates, so
    // pointing HOME at a tmp dir makes the resolution hermetic (tmp paths only).
    const SELF = fileURLToPath(import.meta.url);
    const bareArgs = ['--json', '--self', selfRoot, '--fleet', dirname(selfRoot)];
    const bareSrc = (home) => {
      const r = spawnSync(process.execPath, [SELF, ...bareArgs], {
        encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env, HOME: home, UFO_SRC: '' },
      });
      let src = null;
      try { src = JSON.parse(r.stdout ?? '').src; } catch { src = null; }
      return { r, src };
    };
    const homeWithSrc = (name, rel) => {
      const home = join(tmp, name);
      mkdirSync(join(home, rel), { recursive: true });
      return home;
    };
    check('bare run (no --src): resolves to the first existing candidate ~/Projects/ufo-fsd-alpha', () => {
      const home = homeWithSrc('home-new', 'Projects/ufo-fsd-alpha');
      const { r, src } = bareSrc(home);
      return { ok: src === join(home, 'Projects', 'ufo-fsd-alpha'), detail: `exit=${r.status} src=${src}` };
    });
    check('bare run (no --src): falls back to the legacy ~/Projects/origin-work/ufo-fsd-alpha when the new path is absent', () => {
      const home = homeWithSrc('home-legacy', 'Projects/origin-work/ufo-fsd-alpha');
      const { r, src } = bareSrc(home);
      return { ok: src === join(home, 'Projects', 'origin-work', 'ufo-fsd-alpha'), detail: `exit=${r.status} src=${src}` };
    });
    check('bare run (no --src): both candidates absent keeps the --src fail-closed arm (exit 2)', () => {
      const home = join(tmp, 'home-none');
      mkdirSync(home, { recursive: true });
      const want = join(home, 'Projects', 'ufo-fsd-alpha');
      const r = spawnSync(process.execPath, [SELF, '--self', selfRoot, '--fleet', dirname(selfRoot)], {
        encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env, HOME: home, UFO_SRC: '' },
      });
      return { ok: r.status === 2 && String(r.stderr ?? '').includes(`--src ${want} is missing`),
        detail: `exit=${r.status} ${String(r.stderr ?? '').trim().split('\n')[0]}` };
    });

    // real-tree assertions: machinery does not regress, live docs are repaired.
    // Gated on --integrations: `--selftest` alone must do NO live-tree work. A
    // suite that reads the live 8124-file index (and, through it, a sibling
    // lane's docs) and then discards the result is not hermetic — the cost, the
    // hidden failure and the tree coupling all remain even when the verdict
    // ignores them (r9 Reviewer: the block ran unconditionally).
    const realSrc = opts.src;
    const realSelf = opts.self;
    if (!opts.integrations) {
      integration.push({ name: 'real-tree F1–F4 + good samples', ok: true, skipped: true,
        detail: 'SKIP (integration group not requested — run with --integrations)' });
    } else if (existsSync(join(realSrc, 'crates', 'ufo-core-runtime', 'src', 'gate.rs')) && existsSync(join(realSelf, 'SKILL.md'))) {
      const real = runCheck({ ...opts, src: realSrc, self: realSelf, symbols: true, json: true });
      const all = real.files.flatMap((f) => f.findings);
      liveErrors = all.filter((f) => f.severity === 'error')
        .map((f) => ({ file: f.file, line: f.line, kind: f.kind, token: f.token, ref: f.ref || '' }))
        .sort((a, b) => (a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1));
      checkI('real docs repaired: no F1-class finding (GateDecision off-line)', () => {
        const bad = all.filter((f) => f.kind === 'SYMBOL_OFF_LINE' && /GateDecision/.test(f.message));
        return { ok: bad.length === 0, detail: bad.length ? bad.map((f) => `${f.file}:${f.line}`).join(', ') : '0 SYMBOL_OFF_LINE for GateDecision' };
      });
      checkI('real docs repaired: no F4-class finding (primeagent-assimilation.json ref)', () => {
        const bad = all.filter((f) => f.token === 'config/primeagent-assimilation.json'
          && (f.kind === 'LINE_OOR' || f.kind === 'REF_OWNER_AMBIG' || f.severity === 'error'));
        return { ok: bad.length === 0, detail: bad.length ? bad.map((f) => `${f.file}:${f.line} ${f.kind}`).join(', ') : '0 findings' };
      });
      checkI('real symbol machinery fires on a repaired site (mutation copy)', () => {
        const copy = join(tmp, 'mut-self');
        copyDocs(realSelf, copy);
        const skillPath = join(copy, 'SKILL.md');
        const before = readFileSync(skillPath, 'utf8');
        const after = before.replace(/gate\.rs:15/g, 'gate.rs:11');
        if (after === before) return { ok: false, detail: 'no `gate.rs:15` site found to mutate' };
        writeFileSync(skillPath, after);
        const mut = runCheck({ ...opts, src: realSrc, self: copy, symbols: true, json: true });
        const hit = mut.files.flatMap((f) => f.findings)
          .find((f) => f.kind === 'SYMBOL_OFF_LINE' && /GateDecision/.test(f.message));
        return { ok: Boolean(hit), detail: hit ? `${hit.file}:${hit.line} ${hit.message}` : 'mutation not flagged' };
      });
      checkI('real F2 omp_role_chains.rs → generated, informational', () => {
        const hit = all.find((f) => f.class === 'generated' && f.token === 'omp_role_chains.rs');
        return { ok: Boolean(hit) && hit.severity === 'note', detail: hit ? hit.message : 'not reported' };
      });
      checkI('real F3 content pin 44a3c781 resolves-by-content (never REV_UNKNOWN)', () => {
        const unknown = all.filter((f) => f.kind === 'REV_UNKNOWN' && f.token === '44a3c781');
        const content = all.filter((f) => f.token === '44a3c781' && /resolved-by-content|matches sha256/.test(f.message));
        return { ok: unknown.length === 0 && content.length >= 2,
          detail: `content=${content.length} revUnknown=${unknown.length}` };
      });
      checkI('real pin staleness: b18e0274d reports commits-behind-HEAD', () => {
        const hit = all.find((f) => f.token === 'b18e0274d' && /commits behind HEAD/.test(f.message));
        return { ok: Boolean(hit), detail: hit ? hit.message : 'not reported' };
      });
      checkI('real fleet doc rung: sibling-lane program-quirks.md resolves under --fleet', () => {
        const hit = all.find((f) => f.token === 'program-quirks.md');
        return { ok: Boolean(hit) && hit.rung === 'fleet' && hit.severity !== 'error',
          detail: hit ? `${hit.rung} ${hit.target}` : 'not reported' };
      });
      checkI('real good samples stay clean (no error-level finding)', () => {
        const good = [
          ['scripts/ufo-swarm-wave.mjs', null], ['scripts/fleet-dispatcher.mjs', ':12086'],
          ['scripts/ufo-l0-monitor.mjs', ':226-232'], ['scripts/ufo-sighting-lib/queue.mjs', null],
          ['scripts/collect-omp-native-handoff-lib/base.mjs', null],
          ['crates/ufo-core-runtime/src/execution_profile.rs', ':448'],
          ['crates/ufo-core-runtime/src/native.rs', ':470'],
          ['crates/ufo-core-runtime/src/native_schema.rs', ':455'],
          ['crates/ufo-core-runtime/src/native_contract.rs', ':69'],
          ['crates/ufo-core-runtime/src/state.rs', ':380'],
          ['crates/ufo-core-runtime/src/loop_driver.rs', ':121'],
          ['crates/ufo-core-runtime/src/native_text.rs', ':96'],
          ['crates/ufo-cli/src/main.rs', ':906'],
          ['crates/ufo-cli/tests/cli_contract.rs', ':1514'],
          ['conformance/fixtures/native-handoff/handoff.json', null], ['config/ufo.json', null],
        ];
        const bad = [];
        for (const [tok, ref] of good) {
          for (const f of all) {
            if (f.severity !== 'error' || f.token !== tok) continue;
            if (ref === null ? f.ref === null : f.ref === ref) bad.push(`${tok}${ref || ''}:${f.kind}`);
          }
        }
        return { ok: bad.length === 0, detail: bad.length ? bad.join('; ') : '0 error-level findings on the 16 samples' };
      });
      checkI('real index size matches pruned find (8124)', () => ({ ok: real.indexSize === 8124, detail: `indexSize=${real.indexSize}` }));
    } else {
      integration.push({ name: 'real-tree F1–F4 + good samples', ok: true, skipped: true,
        detail: `SKIP (no live tree at ${realSrc} / ${realSelf})` });
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const groups = [];
  if (opts.selfTest) groups.push({ group: 'hermetic', cases: hermetic, liveErrors: null });
  if (opts.integrations) groups.push({ group: 'integration', cases: integration, liveErrors });

  const suites = groups.map((g) => {
    const ran = g.cases.filter((r) => !r.skipped);
    const failed = ran.filter((r) => !r.ok).length;
    return {
      group: g.group, cases: g.cases, ran, failed, skipped: g.cases.length - ran.length,
      liveErrors: g.liveErrors, verdict: failed ? 'FAIL' : 'PASS',
    };
  });
  const verdict = suites.some((s) => s.verdict === 'FAIL') ? 'FAIL' : 'PASS';

  if (opts.json) {
    process.stdout.write(JSON.stringify({
      schema: SCHEMA,
      suites: suites.map((s) => ({
        group: s.group, cases: s.ran.length, passed: s.ran.length - s.failed, failed: s.failed,
        skipped: s.skipped, verdict: s.verdict, liveErrors: s.liveErrors,
        results: s.cases.map((r) => ({ name: r.name, ok: r.ok, skipped: Boolean(r.skipped), detail: r.detail })),
      })),
      verdict,
    }, null, 2) + '\n');
    return verdict === 'FAIL' ? 1 : 0;
  }

  const flags = groups.map((g) => (g.group === 'hermetic' ? '--selftest' : '--integrations'));
  const lines = [`kumitate cite-check ${flags.join(' ')}`];
  for (const s of suites) {
    lines.push(`group: ${s.group}`);
    for (const r of s.cases) lines.push(`${r.skipped ? 'SKIP' : r.ok ? 'PASS' : 'FAIL'}  ${r.name} — ${r.detail}`);
    lines.push(`${s.ran.length - s.failed}/${s.ran.length} cases passed (${s.group})`);
    if (s.liveErrors) {
      lines.push(`live error findings under ${opts.self}:`);
      for (const e of s.liveErrors) lines.push(`  ${e.file}:${e.line}  ERROR ${e.kind.padEnd(17)} ${e.token}${e.ref}`);
      if (!s.liveErrors.length) lines.push('  (none)');
    }
  }
  lines.push(`VERDICT: ${verdict}`);
  process.stdout.write(lines.join('\n') + '\n');
  return verdict === 'FAIL' ? 1 : 0;
}

/* -------------------------------------------------------------------- main */

function main() {
  let opts;
  try { opts = parseArgs(process.argv.slice(2)); } catch (e) {
    process.stderr.write(`cite-check: ${e.message}\n\n${USAGE}`);
    return 64;
  }
  if (opts === null) return 0;
  if (opts.selfTest || opts.integrations) return selfTest(opts);

  for (const [flag, dir] of [['--src', opts.src], ['--self', opts.self], ['--fleet', opts.fleet]]) {
    let kind = null;
    try { kind = statSync(dir).isDirectory() ? 'dir' : 'not-dir'; } catch (e) { kind = e.code === 'ENOENT' ? 'missing' : 'unreadable'; }
    if (kind !== 'dir') {
      process.stderr.write(`cite-check: fail-closed — ${flag} ${dir} is ${kind}\n`);
      return 2;
    }
  }

  const report = runCheck(opts);
  const envErr = report.totals.filesScanned === 0 ? 'empty scan set'
    : report.totals.resolved === 0 ? 'zero resolved citations' : null;
  if (opts.json) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  else process.stdout.write(renderText(report, opts));
  if (envErr) {
    process.stderr.write(`cite-check: fail-closed — ${envErr} under ${opts.self}\n`);
    return 2;
  }
  return report.verdict === 'PASS' ? 0 : 1;
}

process.exitCode = main();