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
 *                              [--selftest|--self-test]
 *
 * Grammar
 *   Token census: single-backtick spans outside ``` fences (SKILL.md + corpus/**).
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
 *
 * Findings
 *   error UNRESOLVED LINE_OOR REV_UNKNOWN PIN_MISMATCH SYMBOL_OFF_LINE
 *         SELF_MISSING FLEET_MISSING
 *   warn  AMBIG SUFFIX_RESOLVED RUNTIME_UNRESOLVED SYMBOL_MISS ORPHAN_REF
 *   note  OK RESOLVED_BY_CONTEXT RESOLVED_BY_PRECEDENCE PIN_UNTYPED
 *         FRAGMENT (fragment/ignored-fragment classes, runtime, generated,
 *         home-config, foreign-root)
 *   exit 0 CLEAN · 1 DRIFT (error, or warn under --strict) · 2 fail-closed
 *        (missing/non-dir --src or --self, empty scan set, zero resolutions)
 *   64 usage error. No file text, env value, or symbol body is ever printed.
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'kumitate-cite-check-v1';
const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SELF = resolve(HERE, '..');
const DEFAULT_SRC = process.env.UFO_SRC || '/home/vgpnk/Projects/origin-work/ufo-fsd-alpha';
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'target', '.ufo']);

/** Source-root precedence for ambiguous basenames (parent-frozen). */
const ROOT_PRECEDENCE = [
  /^crates\/[^/]+\/src\//,
  /^scripts\//,
  /^config\//,
  /^conformance\//,
  /^tests\//,
];

/** Path shorthands found in the docs (data-driven; see report). */
const ALIASES = {
  cli: 'crates/ufo-cli/src/main.rs',
  dispatcher: 'scripts/fleet-dispatcher.mjs',
  base: 'scripts/ufo-sighting-lib/base.mjs',
};
const SHORTHAND_PATHS = {
  'cli/main.rs': 'crates/ufo-cli/src/main.rs',
};
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
const GENERATED_POINTERS = {
  'omp_role_chains.rs': [
    'crates/ufo-core-runtime/build.rs:117',
    'crates/ufo-core-runtime/src/execution_profile.rs:572',
  ],
};
const HOME_CONFIG_RE = /^(?:~\/)?\.(?:omp|config\/omp)\//;

const SYMBOL_STOPWORDS = new Set([
  'true', 'false', 'null', 'none', 'undefined', 'self', 'this', 'new', 'type', 'const', 'enum',
  'pub', 'fn', 'let', 'mut', 'use', 'mod', 'match', 'return', 'async', 'await', 'and', 'for',
  'with', 'from', 'into', 'not', 'only', 'never', 'always', 'the', 'struct', 'trait', 'impl',
]);

const SEVERITY = {
  OK: 'note', RESOLVED_BY_CONTEXT: 'note', RESOLVED_BY_PRECEDENCE: 'note', PIN_UNTYPED: 'note',
  FRAGMENT: 'note', SUFFIX_RESOLVED: 'warn', RUNTIME_UNRESOLVED: 'warn', AMBIG: 'warn',
  SYMBOL_MISS: 'warn', ORPHAN_REF: 'warn', REF_OWNER_AMBIG: 'note', UNRESOLVED: 'error',
  LINE_OOR: 'error',
  REV_UNKNOWN: 'error', PIN_MISMATCH: 'error', SYMBOL_OFF_LINE: 'error', SELF_MISSING: 'error',
  FLEET_MISSING: 'error',
};

const USAGE = `usage: node scripts/cite-check.mjs [options]

  --src DIR       source tree to resolve against (default: $UFO_SRC or ${DEFAULT_SRC})
  --self DIR      docs tree to scan (default: repo root containing this script)
  --fleet DIR     parent of --self for fleet-parent/sibling-lane docs (default: dirname --self)
  --json          machine output: {schema:"${SCHEMA}",src,self,fleet,files,totals,verdict}
  --strict        DRIFT also on warn-level findings
  --symbols       line-coupled symbol check for citations that carry a line ref
  --all           print note-level (informational) findings in text mode
  --selftest      run the built-in fixture regression suite (alias: --self-test)
  -h, --help      this help
`;

/* ------------------------------------------------------------------ helpers */

function parseArgs(argv) {
  const opts = {
    src: DEFAULT_SRC, self: DEFAULT_SELF, fleet: null, json: false, strict: false,
    symbols: false, all: false, selfTest: false,
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
    else if (a === '-h' || a === '--help') { process.stdout.write(USAGE); return null; }
    else throw new Error(`unknown argument: ${a}`);
  }
  if (!opts.fleet) opts.fleet = dirname(opts.self);
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

function fragmentKind(tok) {
  if (/:\/\//.test(tok)) return 'ignored-fragment';
  if (/^[-+]/.test(tok)) return 'ignored-fragment';
  if (/[*?]/.test(tok)) return 'fragment';
  if (/^\.[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*$/.test(tok)) return 'fragment';
  if (/[<>{}]/.test(tok)) return 'fragment';
  return null;
}

/* ------------------------------------------------------------- span parsing */

function findFences(text) {
  const fences = [];
  let open = null, off = 0;
  for (const line of text.split('\n')) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      if (open === null) open = off;
      else { fences.push([open, off + line.length]); open = null; }
    }
    off += line.length + 1;
  }
  if (open !== null) fences.push([open, text.length]);
  return fences;
}

function findSpans(text, fences) {
  const inFence = (i) => fences.some(([a, b]) => i >= a && i < b);
  const spans = [];
  const re = /`([^`]+)`/g;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index, end = m.index + m[0].length;
    if (inFence(start) || inFence(end - 1)) continue;
    spans.push({ raw: m[1], start, end });
  }
  return spans;
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
  const lines = text.split('\n');
  const findings = [];
  const counts = { refs: 0, orphanRefs: 0, symbols: 0, altOwner: 0, decl: 0, prose: 0 };

  const isDecl = (line) => /Citations?\s+`?L[<0-9]/.test(line) && /are\s+this\s+file/i.test(line)
    || /All\s+`:?N{2,}`?\s+citations\s+are\s+this\s+file/i.test(line);

  const push = (f) => findings.push(f);
  const tokenEvents = [];
  const spans = findSpans(text, fences);

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

  const spanIndexAt = (off) => {
    for (let i = 0; i < spans.length; i++) if (off >= spans[i].start && off < spans[i].end) return i;
    return -1;
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
      const rm = REF_SCAN_RE.exec(word);
      if (rm && rm.index > 0) {
        const cand = word.slice(0, rm.index);
        if (isPathLike(cand, opts.src) || ALIASES[cand]) head = cand;
      }
      if (!isPathLike(head, opts.src) && !ALIASES[head]) continue;
      tokenEvents.push({ off: span.start, line, word: head, span, view });
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

  const refEvents = enumerateRefEvents(text, fences, opts.src);
  const proseTokens = enumerateProseTokens(text, fences, spans, opts.src);

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
      const rec = ALIASES[ev.word]
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
      const rec = ALIASES[ev.word]
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
      else if (ALIASES[word]) rec = aliasRec(word, opts);
      if (rec && rec.targetPath) {
        owner = { rec, symbols: symbolsForOff(ev.off, word) };
        via = 'inline';
      } else if (rec && rec.kind === 'UNRESOLVED' && ALIASES[word]) {
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
  writeFileSync(join(selfRoot, 'corpus', 'knowledge', 'orphan.md'),
    '# orphan fixture\n\nA lone ref (:424242) with no path token anywhere above it.\n');
}

function selfTest(opts) {
  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-cite-selftest-'));
  const results = [];
  const check = (name, fn) => {
    let ok = false, detail = '';
    try { const r = fn(); ok = r.ok; detail = r.detail; } catch (e) { detail = `threw: ${e.message}`; }
    results.push({ name, ok, detail });
  };
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

    // real-tree assertions: machinery does not regress, live docs are repaired
    const realSrc = opts.src;
    const realSelf = opts.self;
    if (existsSync(join(realSrc, 'crates', 'ufo-core-runtime', 'src', 'gate.rs')) && existsSync(join(realSelf, 'SKILL.md'))) {
      const real = runCheck({ ...opts, src: realSrc, self: realSelf, symbols: true, json: true });
      const all = real.files.flatMap((f) => f.findings);
      check('real docs repaired: no F1-class finding (GateDecision off-line)', () => {
        const bad = all.filter((f) => f.kind === 'SYMBOL_OFF_LINE' && /GateDecision/.test(f.message));
        return { ok: bad.length === 0, detail: bad.length ? bad.map((f) => `${f.file}:${f.line}`).join(', ') : '0 SYMBOL_OFF_LINE for GateDecision' };
      });
      check('real docs repaired: no F4-class finding (primeagent-assimilation.json ref)', () => {
        const bad = all.filter((f) => f.token === 'config/primeagent-assimilation.json'
          && (f.kind === 'LINE_OOR' || f.kind === 'REF_OWNER_AMBIG' || f.severity === 'error'));
        return { ok: bad.length === 0, detail: bad.length ? bad.map((f) => `${f.file}:${f.line} ${f.kind}`).join(', ') : '0 findings' };
      });
      check('real symbol machinery fires on a repaired site (mutation copy)', () => {
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
      check('real F2 omp_role_chains.rs → generated, informational', () => {
        const hit = all.find((f) => f.class === 'generated' && f.token === 'omp_role_chains.rs');
        return { ok: Boolean(hit) && hit.severity === 'note', detail: hit ? hit.message : 'not reported' };
      });
      check('real F3 content pin 44a3c781 resolves-by-content (never REV_UNKNOWN)', () => {
        const unknown = all.filter((f) => f.kind === 'REV_UNKNOWN' && f.token === '44a3c781');
        const content = all.filter((f) => f.token === '44a3c781' && /resolved-by-content|matches sha256/.test(f.message));
        return { ok: unknown.length === 0 && content.length >= 2,
          detail: `content=${content.length} revUnknown=${unknown.length}` };
      });
      check('real pin staleness: b18e0274d reports commits-behind-HEAD', () => {
        const hit = all.find((f) => f.token === 'b18e0274d' && /commits behind HEAD/.test(f.message));
        return { ok: Boolean(hit), detail: hit ? hit.message : 'not reported' };
      });
      check('real fleet doc rung: sibling-lane program-quirks.md resolves under --fleet', () => {
        const hit = all.find((f) => f.token === 'program-quirks.md');
        return { ok: Boolean(hit) && hit.rung === 'fleet' && hit.severity !== 'error',
          detail: hit ? `${hit.rung} ${hit.target}` : 'not reported' };
      });
      check('real good samples stay clean (no error-level finding)', () => {
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
      check('real index size matches pruned find (8124)', () => ({ ok: real.indexSize === 8124, detail: `indexSize=${real.indexSize}` }));
    } else {
      check('real-tree F1–F4 + good samples', () => ({ ok: true, detail: `SKIP (no live tree at ${realSrc} / ${realSelf})` }));
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const lines = ['kumitate cite-check --selftest'];
  for (const r of results) lines.push(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name} — ${r.detail}`);
  const failed = results.filter((r) => !r.ok).length;
  lines.push(`${results.length - failed}/${results.length} cases passed`);
  lines.push(`VERDICT: ${failed ? 'FAIL' : 'PASS'}`);
  process.stdout.write(lines.join('\n') + '\n');
  return failed ? 1 : 0;
}

/* -------------------------------------------------------------------- main */

function main() {
  let opts;
  try { opts = parseArgs(process.argv.slice(2)); } catch (e) {
    process.stderr.write(`cite-check: ${e.message}\n\n${USAGE}`);
    return 64;
  }
  if (opts === null) return 0;
  if (opts.selfTest) return selfTest(opts);

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