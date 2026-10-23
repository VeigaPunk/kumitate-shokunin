#!/usr/bin/env node
/**
 * claims-check.mjs — the member-claims gate (contract `kumitate-claims-v1`).
 *
 * WHAT IT RE-DERIVES. `SCORECARD.md` carries a 19-row surface registry whose
 * fourth cell is a claim: `yes — <corpus note>` means "the note names every
 * member of this family at internals level". `scripts/proxy-check.mjs` reads
 * that cell as a string (`cells[4].startsWith('yes')`) and never opens the
 * note, so the cheapest fake — flip the cell, or point it at a note that names
 * nothing — passes every arithmetic check (measured in round 13: a renamed
 * member section in `corpus/knowledge/remaining-scripts-census.md` still reads
 * `PROXY: MATCH … coverage=9` exit 0, while the manual probe reads
 * `MEMBER_PROBE: 58/60 ok` exit 1). This tool is that probe as a gate: it
 * resolves each covered row's note(s), derives the note's member sections,
 * and fails on the shapes the family standard names.
 *
 * ROW FORMS. A row is SECTION-FORM when at least one of its notes carries a
 * member section — a `## ` heading whose first backticked token is path-like
 * (contains `/`, or ends `.mjs .js .sh .rs .timer .service .json .md .toml
 * .yml`). Trailing prose after the token is allowed (`## \`cost_ledger.rs\`
 * (737 L) — wire types…`). A row with no member section is TOPIC-FORM and can
 * only be probed weakly (`ROW_NO_SECTIONS`, advisory): its member completeness
 * is prose this tool cannot read, which is recorded in the verdict, never
 * hidden.
 *
 * Findings (text mode prints `CLAIMS  <severity>  <KIND>  row=<ID>  <detail>`)
 *   error NOTE_MISSING             a cell's explicit `knowledge/x.md` has no file
 *         NOTE_AMBIGUOUS           a bare note stem exists in both corpus dirs
 *         NOTE_FOREIGN             no note of the row names any family member
 *         SECTION_FILE_UNRESOLVED  a member heading does not resolve under --src
 *         SECTION_FILE_AMBIGUOUS   a member heading's basename matches >1 file
 *         SECTION_NO_ANCHOR        a member section carries no own-file anchor
 *         SECTION_DEAD_ANCHOR      own-file anchors exist, none is live
 *         SECTION_NO_SYMBOL        no backticked symbol is verbatim in the file
 *         MEMBER_COUNT_DRIFT       `N members` declared, N ≠ distinct sections
 *   warn  ROW_NO_SECTIONS          topic-form row: member completeness unchecked
 *         SECTION_FILE_NOT_MEMBER  section names a file outside the row's patterns
 *         MEMBER_COUNT_SUSPECT     `N files` declared, distinct sections < N
 *
 * ANCHOR SEMANTICS (frozen from round 13's probe, widened where measurement
 * demanded it). A candidate is any `<pathish>:<N>[-<M>]` in the section body —
 * backticked or not, because the runtime notes write them parenthesised and
 * un-backticked (`(lane_overlay.rs:198-241)`,
 * `(scripts/charter-scribe/systemd/charter-scribe.timer:4)`) — where
 * `<pathish>` resolves under `--src` (exact path when it contains `/`, else a
 * unique basename match), PLUS any bare `:<N>[-<M>]`, which the section heading
 * binds to the section's own file. The section passes when ≥1 candidate
 * resolving to its OWN file is live: 1 ≤ a ≤ b ≤ that file's line count and
 * both endpoint lines are non-blank.
 *
 * Verdict line (always the last stdout line)
 *   CLAIMS: MATCH (rows=<n> yes=<n> notes=<n> sections=<n> adv=<n>[ src-rev=<12 hex>])
 *   CLAIMS: DRIFT (<KIND> row=<ID> detail; …[; src-rev=<12 hex>])   at most 6 findings, then `+N more`
 *   CLAIMS: FAIL-CLOSED (<TOKEN> detail)
 * exit map: 0 match · 1 drift (warnings too under --strict) · 2 fail-closed · 64 usage
 *
 * ORIGIN PIN (`kumitate-origin-pin-v1`, PIN v1). `--pin FILE` — default
 * `<self>/.ufo/pins/origin.json` (the `--self` repo) when that file exists —
 * names the revision the verdict is about. With a pin active the gate resolves the origin tree
 * from `--src` when given, else the pin's `clone`, and asserts
 * `git -C <src> rev-parse HEAD` equals the pin's `revision`: a different HEAD
 * is `SRC_REV_MISMATCH` (exit 2), a missing git, a HEAD that is not 40 hex, or
 * a directory that is not a repository is `SRC_REV_UNVERIFIABLE` (exit 2), a
 * pin that cannot be read or is not `{contract, revision:<40 hex>, clone}` is
 * `PIN_MALFORMED` (exit 2), and a pin clone that is not a directory is
 * `SRC_NOT_A_DIR` (exit 2, the existing arm: an absent tree is never a scored
 * zero). Every verdict then carries `src-rev=<first 12
 * hex>` — the revision actually scored, never the pin's claim. With no pin the
 * gate behaves exactly as before and the segment is absent.
 *
 * Zero dependencies (node: builtins only), read-only on every tree it touches,
 * and it never writes a file anywhere. Its `--selftest` check runs (the site
 * `runClaims`) are children of `scripts/cap-run.mjs` (contract
 * `kumitate-cap-run-v2`, via `capSpawnSync`): 512 MiB / 64 tasks / the site's
 * own 60 s budget, the selftest's mkdtemp root bound read-write, and the git
 * allowlist the site builds as their whole environment. The origin tree is
 * resolved against, never modified: `--src` (default `$UFO_SRC`, else the first
 * existing origin candidate — `~/Projects/ufo-fsd-alpha`, then
 * `~/Projects/origin-work/ufo-fsd-alpha`, unless an active pin names its
 * `clone`) is only ever opened for reading, and the pin assertion is a
 * `git rev-parse` (no index refresh, no lock).
 */
import { readFileSync, readdirSync, statSync, realpathSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve, basename as pathBasename } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { capSpawnSync } from './cap-spawn.mjs';

const CONTRACT = 'kumitate-claims-v1';
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
 * the `SRC_NOT_A_DIR` fail-closed arm (an absent tree is exit 2, never a scored
 * zero). Resolved lazily and never in `--selftest`, so the hermetic suite stats
 * no live path.
 */
function resolveSrcDefault() {
  if (process.env.UFO_SRC) return process.env.UFO_SRC;
  for (const c of SRC_CANDIDATES) if (existsSync(c)) return c;
  return SRC_CANDIDATES[0];
}

/* ------------------------------------------------------------------ pin v1 */

/** The pin a run would use when `--pin` is absent: `<--self>/.ufo/pins/origin.json`. */
function defaultPinPath(self) {
  const p = join(self, PIN_REL);
  return statKind(p) === 'file' ? p : null;
}

/**
 * Read a `kumitate-origin-pin-v1` file. A pin that cannot be trusted never
 * degrades into "no pin" — that would silently turn provenance off — so every
 * unreadable/invalid field is `PIN_MALFORMED` (exit 2).
 */
function readPin(file) {
  const text = readText(file);
  if (text === null) return { ok: false, kind: 'PIN_MALFORMED', detail: `--pin ${file} is ${statKind(file)}` };
  let body;
  try { body = JSON.parse(text); } catch (err) {
    return { ok: false, kind: 'PIN_MALFORMED', detail: `--pin ${file} is not JSON (${err && err.message})` };
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, kind: 'PIN_MALFORMED', detail: `--pin ${file} is not a JSON object` };
  }
  if (body.contract !== PIN_CONTRACT) {
    return { ok: false, kind: 'PIN_MALFORMED', detail: `--pin ${file} contract ${JSON.stringify(body.contract)} != ${PIN_CONTRACT}` };
  }
  const revision = typeof body.revision === 'string' ? body.revision.toLowerCase() : '';
  if (!RE_REV.test(revision)) {
    return { ok: false, kind: 'PIN_MALFORMED', detail: `--pin ${file} revision ${JSON.stringify(body.revision)} is not 40 hex` };
  }
  if (typeof body.clone !== 'string' || body.clone.trim() === '') {
    return { ok: false, kind: 'PIN_MALFORMED', detail: `--pin ${file} has no clone path` };
  }
  return { ok: true, pin: { file, contract: body.contract, repo: body.repo ?? null, revision, clone: resolve(body.clone) } };
}

/**
 * `git -C <dir> rev-parse HEAD` as a full 40-hex sha, or null when git is not
 * on PATH, `<dir>` is not a repository, or HEAD is unborn. `GIT_OPTIONAL_LOCKS=0`
 * keeps the read from taking a lock: the pinned clone is a-w and must stay so.
 */
/** Environment for a `git` child: identity variables are stripped so an ambient
 *  GIT_DIR/GIT_WORK_TREE cannot redirect the assertion at another repository.
 *  Only the two optional-lock/prompt switches and the fixture discovery ceiling
 *  are passed through. */
const GIT_ENV_KEEP = new Set(['PATH', 'HOME', 'LANG', 'LC_ALL', 'TMPDIR', 'SYSTEMROOT',
  'GIT_CEILING_DIRECTORIES', 'GIT_CONFIG_NOSYSTEM', 'GIT_CONFIG_GLOBAL', 'GIT_CONFIG_SYSTEM',
  'GIT_OPTIONAL_LOCKS', 'GIT_TERMINAL_PROMPT', 'GIT_ATTR_NOSYSTEM']);
function gitEnv(extra) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (GIT_ENV_KEEP.has(k)) env[k] = v;
  return { ...env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', ...(extra ?? {}) };
}

function gitHead(dir) {
  const r = spawnSync('git', ['-C', dir, 'rev-parse', 'HEAD'], {
    encoding: 'utf8', timeout: 30_000,
    env: gitEnv(),
  });
  if (r.error || r.status !== 0) return null;
  const head = (r.stdout ?? '').trim().toLowerCase();
  return RE_REV.test(head) ? head : null;
}

/**
 * Resolve the tree this run scores and, when a pin is active, prove it is the
 * pinned revision. Precedence: `--src`, else the pin's clone, else the legacy
 * default. The assertion always runs on the RESOLVED tree — an operator who
 * passes a different `--src` under an active pin gets `SRC_REV_MISMATCH`, never
 * a verdict that names the pin while scoring another tree.
 */
function resolveOrigin(opts) {
  const pinPath = opts.pin ?? defaultPinPath(opts.self);
  if (pinPath === null) return { ok: true, src: opts.src ?? resolveSrcDefault(), pin: null };
  const loaded = readPin(pinPath);
  if (!loaded.ok) return loaded;
  const src = opts.src ?? loaded.pin.clone;
  if (statKind(src) !== 'dir') return { ok: false, kind: 'SRC_NOT_A_DIR', detail: `--src ${src} is ${statKind(src)}` };
  const head = gitHead(src);
  if (head === null) {
    return {
      ok: false, kind: 'SRC_REV_UNVERIFIABLE',
      detail: `git rev-parse HEAD in ${src} is not a repository HEAD (pin ${pinPath})`,
    };
  }
  if (head !== loaded.pin.revision) {
    return {
      ok: false, kind: 'SRC_REV_MISMATCH',
      detail: `${src} HEAD ${head.slice(0, 12)} != pin ${loaded.pin.revision.slice(0, 12)} (${pinPath})`,
    };
  }
  return { ok: true, src, pin: { ...loaded.pin, srcRev: head } };
}

/* ------------------------------------------------ FIDELITY v1 (reviewer arm) */

const FIDELITY_RATCHET_CONTRACT = 'kumitate-fidelity-ratchet-v1';
const RE_ANCHOR_BARE = /^:(\d+)(?:-(\d+))?$/;
const RE_ANCHOR_PATH = /^([A-Za-z0-9_][\w./-]*):(\d+)(?:-(\d+))?$/;

function isPathLikeSpan(text) {
  return /[/\\]/u.test(text) || /\.(?:mjs|js|sh|rs|md|json|toml|yml|timer|service)$/u.test(text);
}

function isAnchorSpan(text) {
  return RE_ANCHOR_BARE.test(text) || RE_ANCHOR_PATH.test(text);
}

function spansOf(chunk, offset) {
  const end = chunk.indexOf('\n', offset);
  const line = chunk.slice(offset, end < 0 ? chunk.length : end);
  const spans = [];
  const re = /`([^`\n]+)`/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    spans.push({ text: m[1], start: offset + m.index, end: offset + m.index + m[0].length });
  }
  return spans;
}

function loadRatchet(file) {
  let ratchet;
  try { ratchet = JSON.parse(readFileSync(file, 'utf8')); } catch (e) {
    throw Object.assign(new Error(`ratchet ${file} is unreadable JSON (${String(e.message).slice(0, 80)})`), { code: 'RATCHET_MALFORMED' });
  }
  const int = (v) => Number.isInteger(v) && v >= 0;
  if (ratchet === null || typeof ratchet !== 'object' || Array.isArray(ratchet)
    || ratchet.contract !== FIDELITY_RATCHET_CONTRACT
    || typeof ratchet.revision !== 'string' || !RE_REV.test(ratchet.revision)
    || ratchet.notes === null || typeof ratchet.notes !== 'object' || Array.isArray(ratchet.notes)
    || !Object.values(ratchet.notes).every(int) || !int(ratchet.total)) {
    throw Object.assign(new Error(`ratchet ${file} does not carry the ${FIDELITY_RATCHET_CONTRACT} shape`), { code: 'RATCHET_MALFORMED' });
  }
  return ratchet;
}

/** The anchor-fidelity sweep over exactly the member sections this gate parses. */
function fidelityWalk({ self, src }) {
  const scorecardPath = join(self, SCORECARD_FILE);
  const scorecardText = readText(scorecardPath);
  if (scorecardText === null) return { ok: false, kind: 'SCORECARD_MISSING', detail: `${scorecardPath} is ${statKind(scorecardPath)}` };
  const registry = parseRegistry(scorecardText);
  if (registry.length === 0) return { ok: false, kind: 'REGISTRY_MISSING', detail: 'no registry rows' };
  const files = walkFiles(src).sort();
  const resolveTok = makeResolver(files);
  const notes = new Map();
  const seen = new Set();
  for (const row of registry) {
    if (!row.covered) continue;
    const { claimed } = extractNoteStems(row.noteCell, self);
    for (const rel of claimed) {
      if (rel.startsWith('AMBIGUOUS:')) continue;
      const text = readText(join(self, rel));
      if (text === null) continue;
      for (const chunk of sectionBodyChunks(text)) {
        const head = RE_CHUNK_HEAD.exec(chunk);
        if (head === null) continue;
        const tok = head[1];
        if (!(tok.includes('/') || RE_EXT.test(tok))) continue;
        const candidates = resolveTok(tok);
        if (candidates.length !== 1) continue;
        const own = candidates[0];
        const key = `${rel}\u0000${own}\u0000${chunk.length}\u0000${chunk.slice(0, 80)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const ownText = readText(join(src, own));
        if (ownText === null) continue;
        const lines = ownText.split('\n');
        if (!notes.has(rel)) notes.set(rel, { anchors: 0, ok: 0, elsewhere: 0, absent: 0, dead: 0, noid: 0, nonok: 0 });
        const bucket = notes.get(rel);
        const re = /`([^`\n]+)`/g;
        let am;
        while ((am = re.exec(chunk)) !== null) {
          const text = am[1];
          const bare = RE_ANCHOR_BARE.exec(text);
          const pathish = bare === null ? RE_ANCHOR_PATH.exec(text) : null;
          let range = null;
          if (bare !== null) range = [Number(bare[1]), Number(bare[2] ?? bare[1])];
          else if (pathish !== null) {
            const resolved = resolveTok(pathish[1]);
            if (resolved.length === 1 && resolved[0] === own) range = [Number(pathish[2]), Number(pathish[3] ?? pathish[2])];
          }
          if (range === null) continue;
          bucket.anchors += 1;
          const lineStart = chunk.lastIndexOf('\n', am.index) + 1;
          const lineSpans = spansOf(chunk, lineStart);
          const selfStart = am.index;
          const selfEnd = am.index + am[0].length;
          const next = lineSpans.find((s) => s.start >= selfEnd && s.start - selfEnd <= 14);
          const prev = [...lineSpans].reverse().find((s) => s.end <= selfStart && selfStart - s.end <= 14);
          // Canonical rule (round 37, spot-check D2): the sentence's symbol precedes
          // its anchor in this corpus, so pair LEFT first and fall back right; right-first
          // pairing rewards shifting an anchor onto the next symbol.
          const pair = prev ?? next ?? null;
          const symbol = pair !== null && !isAnchorSpan(pair.text) && !isPathLikeSpan(pair.text)
            && pair.text.trim().length >= 3 && /[A-Za-z_]/u.test(pair.text) ? pair.text.trim() : null;
          const [n, m] = range;
          if (!(n >= 1 && m <= lines.length && n <= m)) { bucket.dead += 1; continue; }
          if (symbol === null) { bucket.noid += 1; continue; }
          if (lines.slice(n - 1, m).some((l) => l.includes(symbol))) { bucket.ok += 1; continue; }
          if (lines.some((l) => l.includes(symbol))) bucket.elsewhere += 1; else bucket.absent += 1;
          bucket.nonok = bucket.elsewhere + bucket.absent;
        }
      }
    }
  }
  return { ok: true, notes };
}

function failFidelity(token, detail) {
  process.stdout.write(`FIDELITY  fail-closed  ${token}  ${detail}\nFIDELITY: FAIL-CLOSED (${token} ${detail})\n`);
  return 2;
}

function runFidelity(opts) {
  if (statKind(opts.self) !== 'dir') return failFidelity('SELF_NOT_A_DIR', `--self ${opts.self} is ${statKind(opts.self)}`);
  const origin = resolveOrigin(opts);
  if (!origin.ok) return failFidelity(origin.kind, origin.detail);
  let ratchet = null;
  if (opts.ratchet !== null) {
    try { ratchet = loadRatchet(opts.ratchet); } catch (e) {
      return failFidelity(e.code ?? 'RATCHET_MALFORMED', e.message);
    }
    const rev = origin.pin === null ? null : origin.pin.revision;
    if (rev === null) return failFidelity('RATCHET_REV_STALE', `ratchet ${opts.ratchet} needs an active pin, none is active`);
    if (ratchet.revision !== rev) {
      return failFidelity('RATCHET_REV_STALE', `ratchet ${opts.ratchet} revision ${ratchet.revision} != pinned revision ${rev}`);
    }
  }
  const walk = fidelityWalk({ self: opts.self, src: origin.src });
  if (!walk.ok) return failFidelity(walk.kind, walk.detail);
  const lines = [];
  const total = { anchors: 0, ok: 0, elsewhere: 0, absent: 0, dead: 0, noid: 0, nonok: 0 };
  const violations = [];
  for (const rel of [...walk.notes.keys()].sort()) {
    const b = walk.notes.get(rel);
    for (const k of Object.keys(total)) total[k] += b[k];
    lines.push(`FIDELITY note=${rel} anchors=${b.anchors} ok=${b.ok} elsewhere=${b.elsewhere} absent=${b.absent} dead=${b.dead} noid=${b.noid} nonok=${b.nonok}`);
    if (ratchet !== null) {
      const ceiling = Object.prototype.hasOwnProperty.call(ratchet.notes, rel) ? ratchet.notes[rel] : 0;
      if (b.nonok > ceiling) violations.push(`RATCHET_NOTE note=${rel} nonok=${b.nonok} ceiling=${ceiling}`);
    }
  }
  lines.push(`FIDELITY_TOTAL anchors=${total.anchors} ok=${total.ok} elsewhere=${total.elsewhere} absent=${total.absent} dead=${total.dead} noid=${total.noid} nonok=${total.nonok}`);
  if (ratchet !== null && total.nonok > ratchet.total) violations.push(`RATCHET_TOTAL nonok=${total.nonok} ceiling=${ratchet.total}`);
  for (const v of violations) lines.push(`FIDELITY  ratchet  ${v}`);
  const srcRev = origin.pin === null ? null : origin.pin.srcRev;
  const revSeg = srcRev === null ? '' : ` src-rev=${srcRev.slice(0, 12)}`;
  // Round 37 (spot-check D2 follow-up): with a ratchet, CLEAN means "no note or total
  // above its recorded ceiling"; without one, any nonok stays DRIFT.
  if (violations.length === 0 && (ratchet !== null || total.nonok === 0)) {
    lines.push(`FIDELITY: CLEAN (notes=${walk.notes.size} anchors=${total.anchors}${revSeg})`);
    process.stdout.write(`${lines.join('\n')}\n`);
    return 0;
  }
  const why = violations.length > 0 ? violations.join('; ') : `nonok=${total.nonok}`;
  lines.push(`FIDELITY: DRIFT (${why}${revSeg})`);
  process.stdout.write(`${lines.join('\n')}\n`);
  return 1;
}

const SCORECARD_FILE = 'SCORECARD.md';
const CORPUS_DIRS = ['corpus/knowledge', 'corpus/lessons'];

/** PIN v1 (`kumitate-origin-pin-v1`): contract id, repo-relative default, revision shape. */
const PIN_CONTRACT = 'kumitate-origin-pin-v1';
const PIN_REL = '.ufo/pins/origin.json';
const RE_REV = /^[0-9a-f]{40}$/;

/** Frozen derivation patterns (see the header; do not widen them here). */
const RE_REGISTRY_ROW = /^\| (S|R)\d+ \|/;
const RE_CHUNK_HEAD = /^`([^`]+)`/;
const RE_EXT = /\.(?:mjs|js|sh|rs|timer|service|json|md|toml|yml)$/;
const RE_PATHISH = /(?<![\w./:-])([A-Za-z0-9_][\w./-]*):(\d+)(?:-(\d+))?/g;
const RE_BARE = /(?<![\w:.-]):(\d+)(?:-(\d+))?/g;
const RE_SYMBOL = /`([^`\n]+)`/g;
const RE_MEMBERS = /(\d+)\s+members?\b/;
const RE_FILES = /(\d+)\s+(?:files?|`[^`]+`)/;

/** Every finding kind the hermetic suite must fire at least once. */
const FINDING_KINDS = [
  'NOTE_MISSING', 'NOTE_AMBIGUOUS', 'NOTE_FOREIGN',
  'SECTION_FILE_UNRESOLVED', 'SECTION_FILE_AMBIGUOUS',
  'SECTION_NO_ANCHOR', 'SECTION_DEAD_ANCHOR', 'SECTION_NO_SYMBOL',
  'MEMBER_COUNT_DRIFT',
  'ROW_NO_SECTIONS', 'SECTION_FILE_NOT_MEMBER', 'MEMBER_COUNT_SUSPECT',
];
/** Every fail-closed arm the hermetic suite must fire at least once. */
const FAIL_CLOSED_KINDS = [
  'SELF_NOT_A_DIR', 'SCORECARD_MISSING', 'REGISTRY_MISSING', 'SRC_NOT_A_DIR',
  'CORPUS_DIRS_MISSING',
  'PIN_MALFORMED', 'SRC_REV_MISMATCH', 'SRC_REV_UNVERIFIABLE',
];

const USAGE = `usage: node scripts/claims-check.mjs [options]
       node scripts/claims-check.mjs --selftest
       node scripts/claims-check.mjs -h|--help
contract id: ${CONTRACT}

options
  --self DIR       repo holding SCORECARD.md + corpus/ (default: this repo)
  --scorecard FILE SCORECARD path, relative to --self unless absolute
  --src DIR        origin tree the member files are resolved against
                   (default: the pin's clone when a pin is active, else
                   $UFO_SRC, else the first existing of
                   ~/Projects/ufo-fsd-alpha and ~/Projects/origin-work/ufo-fsd-alpha)
  --pin FILE       origin pin (kumitate-origin-pin-v1); asserts the tree's
                   HEAD and prints src-rev= in the verdict
                   (default: <self>/${PIN_REL}, self = the --self repo)
  --row ID         check only this registry row (repeatable, e.g. --row S8)
  --json           one machine-readable object on stdout
  --strict         promote warn-level findings to failure
  --selftest       run the hermetic fixture suite (touches no live tree)

findings: ${FINDING_KINDS.join(' ')}
exit map: 0 match · 1 drift (findings; warnings too under --strict) · 2 fail-closed · 64 usage
`;

/* ------------------------------------------------------------------ helpers */

function readText(p) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}

function statKind(p) {
  try {
    const s = statSync(p);
    return s.isDirectory() ? 'dir' : s.isFile() ? 'file' : 'other';
  } catch { return 'absent'; }
}

/** Recursive relative file list under `root` ('' on an unreadable root). */
/** Never walked: the same prune list `scripts/cite-check.mjs` documents. */
const PRUNE_DIRS = new Set(['.git', '.ufo', 'target', 'node_modules']);

function walkFiles(root, rel = '', out = []) {
  let entries;
  try { entries = readdirSync(join(root, rel), { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) { if (!PRUNE_DIRS.has(e.name)) walkFiles(root, r, out); }
    else if (e.isFile()) out.push(r);
  }
  return out;
}

/** Split a GFM table row into cells, honoring `\|` escapes. */
function splitRowCells(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  const out = [];
  let cur = '';
  for (let i = 0; i < s.length; i += 1) {
    if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i += 1; continue; }
    if (s[i] === '|') { out.push(cur.trim()); cur = ''; continue; }
    cur += s[i];
  }
  out.push(cur.trim());
  return out;
}

/** `fnmatch` for the glob patterns the registry uses (`*.mjs`, `probe-*.mjs`). */
function globMatch(pattern, value) {
  const rx = new RegExp(`^${pattern.split('*').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`);
  return rx.test(value);
}

/** Backticked tokens of a text. */
function backticks(text) {
  const out = [];
  RE_SYMBOL.lastIndex = 0;
  let m;
  while ((m = RE_SYMBOL.exec(text)) !== null) out.push(m[1]);
  return out;
}

/* ------------------------------------------------------------ registry parse */

/** Registry rows: `{id, family, members, noteCell}` for `| S<n> |` / `| R<n> |`. */
function parseRegistry(scorecardText) {
  const rows = [];
  for (const line of scorecardText.split('\n')) {
    if (!RE_REGISTRY_ROW.test(line)) continue;
    const cells = splitRowCells(line);
    rows.push({
      id: cells[0] ?? '',
      family: cells[1] ?? '',
      members: cells[2] ?? '',
      noteCell: cells[3] ?? '',
      covered: (cells[3] ?? '').trim().startsWith('yes'),
    });
  }
  return rows;
}

/**
 * The note stems a cell claims. A part yields a claimed note when its leading
 * token is note-shaped — an explicit `knowledge/x.md` / `lessons/x.md` path, or
 * a bare stem that resolves. A bare stem that resolves nowhere is prose, not a
 * claim (round-13 S6's cell carries `; the round-11 reading …` after the stem
 * list); an explicit path that resolves nowhere is a broken claim.
 */
function extractNoteStems(noteCell, self) {
  const body = noteCell.includes('—') ? noteCell.slice(noteCell.indexOf('—') + 1) : '';
  const claimed = [];
  const explicit = [];
  const unresolved = [];
  for (const part of body.split(/[·;]/)) {
    const cleaned = part.trim().replace(/`/g, '');
    const tok = cleaned.split(/[:\s]/)[0];
    if (tok === '') continue;
    const rest = cleaned.slice(tok.length).trim();
    // A part asserts a note when it carries a path (`knowledge/x.md`), when the
    // token is the whole part, or when only an annotation (`: 9 of 9 …`) follows.
    // A prose continuation (`; the round-11 reading …`) asserts nothing.
    const asserts = rest === '' || rest.startsWith(':') || /^(knowledge|lessons)\//.test(tok);
    const isExplicit = /^(knowledge|lessons)\/[A-Za-z0-9_.\-]+\.md$/.test(tok);
    const stem = tok.replace(/^(knowledge|lessons)\//, '').replace(/\.md$/, '');
    if (!/^[A-Za-z0-9_.\-]+$/.test(stem)) continue;
    const hits = CORPUS_DIRS
      .map((d) => `${d}/${stem}.md`)
      .filter((rel) => statKind(join(self, rel)) === 'file');
    if (hits.length === 1) { if (!claimed.includes(hits[0])) claimed.push(hits[0]); }
    else if (hits.length > 1 && !claimed.includes(`AMBIGUOUS:${stem}`)) claimed.push(`AMBIGUOUS:${stem}`);
    else if (isExplicit) explicit.push(tok);
    else if (asserts && !unresolved.includes(stem)) unresolved.push(stem);
  }
  return { claimed, explicit, unresolved };
}

/** Family patterns: backticked members-cell tokens naming files or dirs. */
function familyPatterns(membersCell) {
  return backticks(membersCell).filter((t) => !/\s/.test(t) && !t.includes('|')
    && (t.includes('/') || t.includes('*') || RE_EXT.test(t)));
}

function inFamily(patterns, rel) {
  const base = pathBasename(rel);
  for (const p of patterns) {
    if (p.endsWith('/')) {
      const dir = p.replace(/\/$/, '');
      if (rel.startsWith(p) || rel.includes(`/${dir}/`) || base === dir) return true;
      continue;
    }
    if (p.includes('*')) { if (globMatch(p, base) || globMatch(p, rel)) return true; continue; }
    if (p === rel || pathBasename(p) === base) return true;
  }
  return false;
}

/* --------------------------------------------------------------- src resolve */

/** Resolve a pathish token against the origin file index (relative paths). */
function makeResolver(originFiles) {
  const byBase = new Map();
  for (const rel of originFiles) {
    const b = pathBasename(rel);
    if (!byBase.has(b)) byBase.set(b, []);
    byBase.get(b).push(rel);
  }
  return (tok) => {
    if (tok.includes('/')) return originFiles.includes(tok) ? [tok] : [];
    return byBase.get(tok) ?? [];
  };
}

/* -------------------------------------------------------------- row probing */

function sectionBodyChunks(noteText) {
  const parts = noteText.split(/^## /m);
  return parts.slice(1).map((p) => p);
}

function probeRow(row, ctx) {
  const findings = [];
  const out = {
    id: row.id, family: row.family, covered: row.covered,
    form: 'topic', notes: [], sections: [], advisories: 0,
  };
  const add = (severity, kind, detail) => findings.push({ severity, kind, row: row.id, detail });

  const { claimed, explicit, unresolved } = extractNoteStems(row.noteCell, ctx.self);
  for (const tok of explicit) add('error', 'NOTE_MISSING', `${tok} does not exist under corpus/`);
  for (const stem of unresolved) add('error', 'NOTE_MISSING', `${stem} does not resolve to a corpus note`);
  for (const rel of claimed) {
    if (rel.startsWith('AMBIGUOUS:')) add('error', 'NOTE_AMBIGUOUS', `${rel.slice('AMBIGUOUS:'.length)} exists in both corpus dirs`);
    else out.notes.push(rel);
  }
  // Only when the cell asserted nothing at all — an explicit/unresolved/ambiguous
  // part already carries its own finding, and double-reporting muddies the verdict.
  if (out.notes.length === 0 && claimed.length + explicit.length + unresolved.length === 0) {
    add('error', 'NOTE_MISSING', 'the covered cell names no resolvable corpus note');
  }

  const patterns = familyPatterns(row.members);
  const noteTexts = out.notes.map((rel) => readText(join(ctx.self, rel)) ?? '');

  // NOTE_FOREIGN — the row's notes must name at least one member of its family.
  const fileish = () => {
    const toks = [];
    for (const text of noteTexts) {
      for (const t of backticks(text)) toks.push(t);
      for (const m of text.matchAll(/[A-Za-z0-9_][\w./-]*:\d+(?:-\d+)?/g)) toks.push(m[0].split(':')[0]);
      for (const m of text.matchAll(/[A-Za-z0-9_][\w./-]*\.(?:mjs|js|sh|rs|md|json|service|timer|toml|yml)/g)) toks.push(m[0]);
    }
    return toks;
  };
  if (patterns.length > 0 && out.notes.length > 0) {
    const toks = fileish();
    const named = toks.some((t) => patterns.some((p) => {
      if (p.endsWith('/')) return t.startsWith(p) || t.includes(`/${p.replace(/\/$/, '')}/`);
      if (p.includes('*')) return globMatch(p, pathBasename(t)) || globMatch(p, t);
      return t === p || pathBasename(t) === pathBasename(p);
    }));
    if (!named) add('error', 'NOTE_FOREIGN', `no note names any member of ${row.id} (patterns: ${patterns.join(', ')})`);
  }

  // Member sections.
  for (let i = 0; i < out.notes.length; i += 1) {
    const rel = out.notes[i];
    for (const chunk of sectionBodyChunks(noteTexts[i])) {
      const head = RE_CHUNK_HEAD.exec(chunk);
      if (head === null) continue;
      const tok = head[1];
      if (!(tok.includes('/') || RE_EXT.test(tok))) continue;
      const body = chunk;
      const candidates = ctx.resolve(tok);
      if (candidates.length === 0) {
        add('error', 'SECTION_FILE_UNRESOLVED', `${tok} does not resolve under --src`);
        out.sections.push({ note: rel, heading: tok, file: null, anchors: 0, symbols: 0 });
        continue;
      }
      if (candidates.length > 1) {
        add('error', 'SECTION_FILE_AMBIGUOUS', `${tok} matches ${candidates.length} origin files`);
        out.sections.push({ note: rel, heading: tok, file: null, anchors: 0, symbols: 0 });
        continue;
      }
      const own = candidates[0];
      const ownText = readText(join(ctx.src, own));
      const lines = ownText === null ? [] : ownText.split('\n');

      const anchors = [];
      RE_PATHISH.lastIndex = 0;
      let m;
      const bodyNoHead = body.slice(body.indexOf('\n') + 1);
      while ((m = RE_PATHISH.exec(bodyNoHead)) !== null) {
        const resolved = ctx.resolve(m[1]);
        if (resolved.length === 1) anchors.push([resolved[0], Number(m[2]), Number(m[3] ?? m[2])]);
      }
      RE_BARE.lastIndex = 0;
      while ((m = RE_BARE.exec(bodyNoHead)) !== null) anchors.push([own, Number(m[1]), Number(m[2] ?? m[1])]);
      const ownAnchors = anchors.filter((a) => a[0] === own);
      const live = ownAnchors.some(([, a, b]) => a >= 1 && b <= lines.length && a <= b
        && lines[a - 1].trim() !== '' && lines[b - 1].trim() !== '');
      if (ownAnchors.length === 0) add('error', 'SECTION_NO_ANCHOR', `${own} — section carries no own-file anchor`);
      else if (!live) add('error', 'SECTION_DEAD_ANCHOR', `${own} — own-file anchors ${ownAnchors.map((a) => a.slice(1).join('-')).join(',')} are dead`);

      const symbols = backticks(bodyNoHead).filter((t) => !/[/\\:.\s]/.test(t) && t.length >= 3);
      const symbolHit = symbols.some((s) => lines.some((l) => l.includes(s)));
      if (!symbolHit) add('error', 'SECTION_NO_SYMBOL', `${own} — no backticked symbol is verbatim in the file`);

      const fam = inFamily(patterns, own);
      if (!fam) add('warn', 'SECTION_FILE_NOT_MEMBER', `${own} is outside ${row.id}'s declared members`);

      out.sections.push({
        note: rel, heading: tok, file: own,
        anchors: ownAnchors.length, live, symbols: symbols.length, symbolHit, inFamily: fam,
      });
    }
  }

  if (out.sections.length > 0) out.form = 'section';
  else add('warn', 'ROW_NO_SECTIONS', `${row.id} has no member section — member completeness unchecked`);

  // Integer arm — only for section-form rows.
  if (out.form === 'section') {
    const distinct = new Set(out.sections.map((s) => s.file ?? s.heading)).size;
    const declaredMembers = RE_MEMBERS.exec(row.members);
    const declaredFiles = RE_FILES.exec(row.members);
    if (declaredMembers !== null && distinct !== Number(declaredMembers[1])) {
      add('error', 'MEMBER_COUNT_DRIFT', `declared ${declaredMembers[1]} members, found ${distinct} distinct sections`);
    } else if (declaredMembers === null && declaredFiles !== null && distinct < Number(declaredFiles[1])) {
      add('warn', 'MEMBER_COUNT_SUSPECT', `declared ${declaredFiles[1]}, found ${distinct} distinct sections`);
    }
  }

  out.advisories = findings.filter((f) => f.severity === 'warn').length;
  out.findings = findings;
  return { row: out, findings };
}

/* ------------------------------------------------------------------ modes */

function summarize(findings, strict) {
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warnings = findings.filter((f) => f.severity === 'warn').length;
  return { errors, warnings, drift: errors > 0 || (Boolean(strict) && warnings > 0) };
}

function renderVerdict(verdict, totals, findings, strict, srcRev) {
  const tail = srcRev ? ` src-rev=${srcRev.slice(0, 12)}` : '';
  if (verdict === 'MATCH') {
    return `CLAIMS: MATCH (rows=${totals.rows} yes=${totals.yes} notes=${totals.notes}`
      + ` sections=${totals.sections} adv=${totals.warnings}${tail})`;
  }
  if (verdict === 'DRIFT') {
    const shown = findings.filter((f) => f.severity === 'error' || Boolean(strict));
    const parts = shown.slice(0, 6).map((f) => `${f.kind} row=${f.row} ${f.detail}`);
    if (shown.length > parts.length) parts.push(`+${shown.length - parts.length} more`);
    return `CLAIMS: DRIFT (${parts.join('; ')}${tail ? `;${tail}` : ''})`;
  }
  return null;
}

function failClosed(opts, token, detail, started) {
  const body = {
    contract: CONTRACT, mode: 'check',
    self: opts.self, scorecard: opts.scorecard, src: opts.src,
    pin: opts.pinInfo ?? null, srcRev: opts.srcRev ?? null,
    options: { row: opts.row, strict: Boolean(opts.strict), json: Boolean(opts.json) },
    rows: [],
    findings: [{ severity: 'error', kind: token, row: '-', detail }],
    totals: { rows: 0, yes: 0, notes: 0, sections: 0, errors: 1, warnings: 0, adv: 0 },
    verdict: 'FAIL-CLOSED', fatal: { kind: token, detail }, durationMs: Date.now() - started,
  };
  if (opts.json) process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
  else process.stdout.write(`CLAIMS  fail-closed  ${token}  ${detail}\nCLAIMS: FAIL-CLOSED (${token} ${detail})\n`);
  return 2;
}

/**
 * The ONE derivation of the claim shape (round 16): resolve the registry,
 * probe every covered row, and total what was read. `runCheck` renders this;
 * `scripts/proxy-check.mjs` scores the layer terms from the same rows instead
 * of re-reading the notes, so the S/R section counts have one authority.
 * Returns the fail-closed arm — same kind tokens `runCheck` prints — when a
 * tree the derivation needs is not there. `files` is that ONE walk's index
 * (relative, sorted): `scripts/proxy-check.mjs` counts its four layer
 * universes from it, so the origin tree is traversed exactly once per round.
 */
export function probeSections({ self = DEFAULT_SELF, scorecard = SCORECARD_FILE, src = resolveSrcDefault() } = {}) {
  if (statKind(self) !== 'dir') return { ok: false, kind: 'SELF_NOT_A_DIR', detail: `--self ${self} is ${statKind(self)}` };
  const scorecardPath = scorecard.startsWith('/') ? scorecard : join(self, scorecard);
  const scorecardText = readText(scorecardPath);
  if (scorecardText === null) return { ok: false, kind: 'SCORECARD_MISSING', detail: `--scorecard ${scorecardPath} is ${statKind(scorecardPath)}` };
  for (const d of CORPUS_DIRS) {
    if (statKind(join(self, d)) !== 'dir') return { ok: false, kind: 'CORPUS_DIRS_MISSING', detail: `${d} is ${statKind(join(self, d))} under --self` };
  }
  const registry = parseRegistry(scorecardText);
  if (registry.length === 0) return { ok: false, kind: 'REGISTRY_MISSING', detail: 'no `| S<n> |` / `| R<n> |` rows in the scorecard' };
  if (statKind(src) !== 'dir') return { ok: false, kind: 'SRC_NOT_A_DIR', detail: `--src ${src} is ${statKind(src)}` };

  const files = walkFiles(src).sort();
  const ctx = { self, src, resolve: makeResolver(files) };
  const rows = [];
  for (const row of registry) {
    if (!row.covered) { rows.push({ id: row.id, family: row.family, covered: false, form: 'uncovered', notes: [], sections: [], advisories: 0 }); continue; }
    rows.push(probeRow(row, ctx).row);
  }
  return { ok: true, rows, totals: tally(rows), files };
}

/** Totals over a row set: the row summary and the verdict line read these. */
function tally(rows) {
  const totals = {
    rows: rows.length,
    yes: rows.filter((r) => r.covered).length,
    notes: rows.reduce((n, r) => n + (r.notes?.length ?? 0), 0),
    sections: rows.reduce((n, r) => n + (r.sections?.length ?? 0), 0),
    errors: 0, warnings: 0, adv: 0,
  };
  for (const r of rows) {
    for (const f of r.findings ?? []) {
      if (f.severity === 'error') totals.errors += 1;
      else totals.warnings += 1;
    }
  }
  totals.adv = totals.warnings;
  return totals;
}

function runCheck(opts, started) {
  const origin = resolveOrigin(opts);
  const runOpts = {
    ...opts,
    src: origin.ok ? origin.src : (opts.src ?? null),
    srcRev: origin.ok && origin.pin !== null ? origin.pin.srcRev : null,
    pinInfo: origin.pin ?? null,
  };
  if (!origin.ok) return failClosed(runOpts, origin.kind, origin.detail, started);
  const probe = probeSections({ self: opts.self, scorecard: opts.scorecard, src: origin.src });
  if (!probe.ok) return failClosed(runOpts, probe.kind, probe.detail, started);
  const scorecardPath = opts.scorecard.startsWith('/') ? opts.scorecard : join(opts.self, opts.scorecard);

  const known = new Set(probe.rows.map((r) => r.id));
  const unknown = opts.row.filter((id) => !known.has(id));
  if (unknown.length > 0) {
    process.stdout.write(`claims-check: ROW_UNKNOWN --row ${unknown.join(',')} is not a registry row (${[...known].join(' ')})\n${USAGE}`);
    return 64;
  }
  const rows = opts.row.length > 0 ? probe.rows.filter((r) => opts.row.includes(r.id)) : probe.rows;
  const findings = rows.flatMap((r) => r.findings ?? []);
  const totals = opts.row.length > 0 ? tally(rows) : probe.totals;
  const sum = summarize(findings, opts.strict);
  const verdict = sum.drift ? 'DRIFT' : 'MATCH';

  if (opts.json) {
    process.stdout.write(`${JSON.stringify({
      schema: CONTRACT, contract: CONTRACT, mode: 'check',
      self: opts.self, scorecard: scorecardPath, src: runOpts.src,
      pin: runOpts.pinInfo, srcRev: runOpts.srcRev,
      options: { row: opts.row, strict: Boolean(opts.strict), json: true },
      rows, findings, totals, verdict, durationMs: Date.now() - started,
    }, null, 2)}\n`);
  } else {
    const lines = [`ROWS: ${totals.rows}  YES: ${totals.yes}  NOTES: ${totals.notes}  SECTIONS: ${totals.sections}`];
    for (const r of rows) {
      lines.push(`ROW ${r.id.padEnd(4)} form=${r.form.padEnd(9)} notes=${r.notes.length} sections=${r.sections.length} adv=${r.advisories}`);
    }
    for (const f of findings) lines.push(`CLAIMS  ${f.severity.padEnd(5)} ${f.kind.padEnd(24)} row=${f.row}  ${f.detail}`);
    lines.push('SUMMARY: errors=' + totals.errors + ' warnings=' + totals.warnings);
    lines.push(renderVerdict(verdict, totals, findings, opts.strict, runOpts.srcRev));
    process.stdout.write(`${lines.join('\n')}\n`);
  }
  return verdict === 'MATCH' ? 0 : 1;
}

/* --------------------------------------------------------------- selftest */

const FIXTURE_FILES = {
  'scripts/a.mjs': ['#!/usr/bin/env node', '// fixture A', 'const ALPHA_MARK = 1;', 'export default ALPHA_MARK;', '', ''],
  'scripts/b.mjs': ['#!/usr/bin/env node', 'const BETA_MARK = 2;', 'export default BETA_MARK;', '// end of fixture B (4 non-blank lines)'],
  'scripts/dup.mjs': ['const DUP_ONE = 1;', ''],
  'crates/ufo-core-runtime/src/dup.mjs': ['const DUP_TWO = 2;', ''],
  'crates/ufo-core-runtime/src/c.rs': ['pub fn c() -> u8 {', '    // GAMMA_MARK', '    3', '}', ''],
};

function fixtureSrc(root) {
  for (const [rel, lines] of Object.entries(FIXTURE_FILES)) {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, lines.join('\n'));
  }
}

function fxNote(root, rel, body) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body);
}

const FX_GREEN_NOTE = '## `scripts/a.mjs`\n\nAnchors `ALPHA_MARK` at `scripts/a.mjs:3`.\n';
const FX_GREEN_ROWS = [
  '| # | Family | Members (origin tree) | Corpus note |',
  '|---|---|---|---|',
  '| S1 | fixture family | `scripts/a.mjs` (6 L) | yes — `knowledge/fx-a.md` |',
  '| R1 | fixture family | `scripts/b.mjs` (4 L) | yes — `knowledge/fx-b.md` |',
];

function fxRepo(root, { rows = FX_GREEN_ROWS, notes = [['corpus/knowledge/fx-a.md', FX_GREEN_NOTE], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']], extra = [] } = {}) {
  mkdirSync(join(root, 'corpus/knowledge'), { recursive: true });
  mkdirSync(join(root, 'corpus/lessons'), { recursive: true });
  for (const [rel, body] of notes) fxNote(root, rel, body);
  for (const [rel, body] of extra) fxNote(root, rel, body);
  writeFileSync(join(root, SCORECARD_FILE), ['# Fixture scorecard', '', ...rows, ''].join('\n'));
}

/**
 * One check run as a child of the bounded runner (`kumitate-cap-run-v2`, 512 MiB /
 * 64 tasks / the site's 60 s budget). `bind` carries the selftest's own mkdtemp root,
 * because the sandbox's `/tmp` is a fresh tmpfs and the fixtures must stay visible;
 * `env` is the child's COMPLETE environment (today's git allowlist plus the caller's
 * keys), never the parent's.
 */
function runClaimsChild(args, env, bind) {
  const r = capSpawnSync(process.execPath, [TOOL_FILE, ...args], {
    encoding: 'utf8', timeout: 60_000, env: gitEnv(env), bind,
  });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function verdictLine(run) {
  const lines = run.stdout.trim().split('\n');
  return lines.length > 0 ? lines[lines.length - 1] : '';
}

function kinds(run) {
  return run.stdout.split('\n')
    .filter((l) => l.startsWith('CLAIMS  '))
    .map((l) => l.trim().split(/\s+/)[2]);
}

function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-claims-selftest-'));
  // Every check run below is the routed site: the fixture root — and nothing else
  // under the host tmpdir — is bound in, because the child's `/tmp` is a fresh tmpfs.
  const runClaims = (args, env) => runClaimsChild(args, env, [tmp]);
  const results = [];
  const observed = new Set();
  const failClosedSeen = new Set();
  const check = (label, fn) => {
    let r;
    try { r = fn(); } catch (err) { r = { ok: false, detail: `threw ${err && err.message}` }; }
    for (const k of r.kinds ?? []) observed.add(k);
    for (const k of r.failClosed ?? []) failClosedSeen.add(k);
    results.push({ label, ok: Boolean(r.ok), detail: r.detail ?? '' });
  };
  const mk = (name, opts) => { const p = join(tmp, name); mkdirSync(p, { recursive: true }); fxRepo(p, opts); fixtureSrc(join(tmp, `${name}-src`)); return { self: p, src: join(tmp, `${name}-src`) }; };
  const args = ({ self, src }, extra = []) => ['--self', self, '--src', src, ...extra];
  const ok = (run, status, needle, kindList) => {
    const k = kinds(run);
    return {
      ok: run.status === status && verdictLine(run).includes(needle)
        && (kindList === undefined || JSON.stringify(k) === JSON.stringify(kindList)),
      detail: `exit=${run.status} last=${verdictLine(run).slice(0, 90)} kinds=[${k.join(',')}]`,
      kinds: k,
    };
  };

  try {
    // green baseline
    const green = mk('green');
    check('green fixture → MATCH, exit 0, no findings, exact totals', () => {
      const r = runClaims(args(green));
      return {
        ok: r.status === 0 && kinds(r).length === 0
          && verdictLine(r) === 'CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=2 adv=0)',
        detail: `exit=${r.status} last=${verdictLine(r)}`,
      };
    });

    // NOTE_MISSING / NOTE_AMBIGUOUS / NOTE_FOREIGN
    const missing = mk('missing', { rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — `knowledge/nope.md` |'] });
    check('NOTE_MISSING: explicit knowledge/nope.md', () => ok(runClaims(args(missing)), 1, 'CLAIMS: DRIFT', ['NOTE_MISSING', 'ROW_NO_SECTIONS']));

    const ambig = mk('ambig', {
      rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — fx-a |'],
      extra: [['corpus/lessons/fx-a.md', FX_GREEN_NOTE]],
    });
    check('NOTE_AMBIGUOUS: stem in both corpus dirs', () => ok(runClaims(args(ambig)), 1, 'CLAIMS: DRIFT', ['NOTE_AMBIGUOUS', 'ROW_NO_SECTIONS']));

    const foreign = mk('foreign', { rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — `knowledge/fx-b.md` |'] });
    check('NOTE_FOREIGN: note names no member of the row', () => ok(runClaims(args(foreign)), 1, 'CLAIMS: DRIFT', ['NOTE_FOREIGN', 'SECTION_FILE_NOT_MEMBER']));

    // section arms
    const unres = mk('unres', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/missing.mjs`\n\n' + 'The member `scripts/a.mjs` is named in prose.\n\n' + '`ALPHA_MARK` at `scripts/missing.mjs:1`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
    check('SECTION_FILE_UNRESOLVED: heading does not resolve', () => ok(runClaims(args(unres)), 1, 'CLAIMS: DRIFT', ['SECTION_FILE_UNRESOLVED']));

    const ambigSec = mk('ambigsec', { notes: [['corpus/knowledge/fx-a.md', '## `dup.mjs`\n\n' + 'The member `scripts/a.mjs` is named in prose.\n\n' + '`DUP_ONE` at `dup.mjs:1`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
    check('SECTION_FILE_AMBIGUOUS: basename matches two files', () => ok(runClaims(args(ambigSec)), 1, 'CLAIMS: DRIFT', ['SECTION_FILE_AMBIGUOUS']));

    const noAnchor = mk('noanchor', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\nThe symbol `ALPHA_MARK` lives there.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
    check('SECTION_NO_ANCHOR: symbol but no own-file anchor', () => ok(runClaims(args(noAnchor)), 1, 'CLAIMS: DRIFT', ['SECTION_NO_ANCHOR']));

    const dead = mk('dead', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:99`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
    check('SECTION_DEAD_ANCHOR: anchor out of range', () => ok(runClaims(args(dead)), 1, 'CLAIMS: DRIFT', ['SECTION_DEAD_ANCHOR']));

    const noSymbol = mk('nosymbol', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\nSee `ABSENT_SYMBOL` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
    check('SECTION_NO_SYMBOL: backticked symbol absent from the file', () => ok(runClaims(args(noSymbol)), 1, 'CLAIMS: DRIFT', ['SECTION_NO_SYMBOL']));

    // integer arms
    const drift = mk('memberdrift', {
      rows: ['| S1 | f | 2 members: `scripts/a.mjs` + `scripts/b.mjs` | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', FX_GREEN_NOTE]],
    });
    check('MEMBER_COUNT_DRIFT: declared 2 members, 1 distinct section', () => ok(runClaims(args(drift)), 1, 'CLAIMS: DRIFT', ['MEMBER_COUNT_DRIFT']));

    const suspect = mk('suspect', {
      rows: ['| S1 | f | 3 files (`scripts/a.mjs`) | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', FX_GREEN_NOTE]],
    });
    check('MEMBER_COUNT_SUSPECT: declared 3 files, 1 section → warn, exit 0', () => ok(runClaims(args(suspect)), 0, 'CLAIMS: MATCH', ['MEMBER_COUNT_SUSPECT']));

    const foreignSec = mk('foreignsec', {
      rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', FX_GREEN_NOTE + '\n## `crates/ufo-core-runtime/src/c.rs`\n\n`GAMMA_MARK` at `crates/ufo-core-runtime/src/c.rs:2`.\n']],
    });
    check('SECTION_FILE_NOT_MEMBER: section outside the row patterns → warn', () => ok(runClaims(args(foreignSec)), 0, 'CLAIMS: MATCH', ['SECTION_FILE_NOT_MEMBER']));

    const topic = mk('topic', {
      rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', 'Prose about `scripts/a.mjs` with no member section.\n']],
    });
    check('ROW_NO_SECTIONS: topic-form row → warn, exit 0', () => ok(runClaims(args(topic)), 0, 'CLAIMS: MATCH', ['ROW_NO_SECTIONS']));

    const topicStrict = runClaims(args(topic, ['--strict']));
    check('--strict promotes ROW_NO_SECTIONS → DRIFT exit 1', () => ok(topicStrict, 1, 'CLAIMS: DRIFT', ['ROW_NO_SECTIONS']));

    // drop-one arms
    const dropped = mk('dropped', {
      rows: ['| S1 | f | 2 members: `scripts/a.mjs` + `scripts/b.mjs` | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', 'prose only\n']],
    });
    check('drop-one: a deleted member section → MEMBER_COUNT_DRIFT', () => ok(runClaims(args(dropped)), 1, 'CLAIMS: DRIFT', ['MEMBER_COUNT_DRIFT']));

    const renamed = mk('renamed', {
      rows: ['| S1 | f | 2 members: `scripts/a.mjs` + `scripts/b.mjs` | yes — `knowledge/fx-a.md` |'],
      notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n\n## `scripts/a-renamed.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n']],
    });
    check('drop-one: a renamed member heading → SECTION_FILE_UNRESOLVED', () => ok(runClaims(args(renamed)), 1, 'CLAIMS: DRIFT', ['SECTION_FILE_UNRESOLVED']));

    // --row, --json
    const twoRows = mk('tworow', {
      rows: ['| S1 | f | `scripts/a.mjs` (6 L) | yes — `knowledge/fx-a.md` |', '| S2 | f | `scripts/b.mjs` (4 L) | yes — `knowledge/fx-missing.md` |'],
    });
    const rowFiltered = runClaims(args(twoRows, ['--row', 'S1']));
    check('--row S1: the other row\'s NOTE_MISSING is not reported', () => {
      const base = ok(rowFiltered, 0, 'CLAIMS: MATCH', []);
      return {
        ok: base.ok && rowFiltered.stdout.includes('ROW S1') && !rowFiltered.stdout.includes('ROW S2'),
        detail: `${base.detail} rows=[${rowFiltered.stdout.split('\n').filter((l) => l.startsWith('ROW ')).join('|')}]`,
        kinds: base.kinds,
      };
    });

    const jsonRun = runClaims(args(twoRows, ['--json']));
    check('--json totals equal the text totals', () => {
      const j = JSON.parse(jsonRun.stdout);
      const t = runClaims(args(twoRows));
      const m = /SUMMARY: errors=(\d+) warnings=(\d+)/.exec(t.stdout);
      return {
        ok: j.totals.errors === Number(m[1]) && j.totals.warnings === Number(m[2]) && j.verdict === 'DRIFT' && j.schema === CONTRACT,
        detail: `json=${j.totals.errors}/${j.totals.warnings} text=${m[1]}/${m[2]} verdict=${j.verdict}`,
      };
    });

    // fail-closed arms
    const fc = (name, extra, token) => {
      const g = mk(name);
      const run = runClaims(['--self', g.self, '--src', g.src, ...extra]);
      return { run, token };
    };
    const arms = [
      fc('fc-self', ['--scorecard', SCORECARD_FILE, '--self', '/nonexistent'], 'SELF_NOT_A_DIR'),
      (() => { const g = mk('fc-card'); const r = runClaims(['--self', g.self, '--src', g.src, '--scorecard', 'missing.md']); return { run: r, token: 'SCORECARD_MISSING' }; })(),
      (() => { const g = mk('fc-reg'); writeFileSync(join(g.self, SCORECARD_FILE), '# no registry\n'); const r = runClaims(['--self', g.self, '--src', g.src]); return { run: r, token: 'REGISTRY_MISSING' }; })(),
      (() => { const g = mk('fc-src'); const r = runClaims(['--self', g.self, '--src', '/nonexistent']); return { run: r, token: 'SRC_NOT_A_DIR' }; })(),
      (() => { const g = mk('fc-corpus'); rmSync(join(g.self, 'corpus/lessons'), { recursive: true }); const r = runClaims(args(g)); return { run: r, token: 'CORPUS_DIRS_MISSING' }; })(),
    ];
    for (const arm of arms) {
      check(`${arm.token}: fail-closed exit 2`, () => ({
        ok: arm.run.status === 2 && verdictLine(arm.run).includes(`FAIL-CLOSED (${arm.token}`),
        detail: `exit=${arm.run.status} last=${verdictLine(arm.run).slice(0, 90)}`,
        failClosed: [arm.token],
      }));
    }

    /* round-23 ─ the derived --src default (bare invocation) --------------- */
    // A bare run carries no `--src`; the default is derived from `$HOME`-relative
    // candidates, so pointing HOME at a tmp dir makes the resolution hermetic.
    const homeWithSrc = (name, rel) => { const home = join(tmp, name); fixtureSrc(join(home, rel)); return home; };
    const bare = (home) => runClaims(['--self', green.self], { HOME: home, UFO_SRC: '' });
    const GREEN_MATCH = 'CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=2 adv=0)';
    check('bare run (no --src): resolves to the first existing candidate ~/Projects/ufo-fsd-alpha', () => {
      const r = bare(homeWithSrc('home-new', 'Projects/ufo-fsd-alpha'));
      return { ok: r.status === 0 && verdictLine(r) === GREEN_MATCH, detail: `exit=${r.status} last=${verdictLine(r).slice(0, 90)}` };
    });
    check('bare run (no --src): falls back to the legacy ~/Projects/origin-work/ufo-fsd-alpha when the new path is absent', () => {
      const r = bare(homeWithSrc('home-legacy', 'Projects/origin-work/ufo-fsd-alpha'));
      return { ok: r.status === 0 && verdictLine(r) === GREEN_MATCH, detail: `exit=${r.status} last=${verdictLine(r).slice(0, 90)}` };
    });
    check('bare run (no --src): the new path wins when BOTH candidates exist (candidate order is the spec)', () => {
      const home = homeWithSrc('home-both', 'Projects/ufo-fsd-alpha');
      mkdirSync(join(home, 'Projects', 'origin-work', 'ufo-fsd-alpha'), { recursive: true });
      const r = bare(home);
      return { ok: r.status === 0 && verdictLine(r) === GREEN_MATCH, detail: `exit=${r.status} last=${verdictLine(r).slice(0, 90)}` };
    });
    check('bare run (no --src): both candidates absent keeps SRC_NOT_A_DIR (exit 2, never a scored zero)', () => {
      const home = join(tmp, 'home-none');
      mkdirSync(home, { recursive: true });
      const r = bare(home);
      const want = join(home, 'Projects', 'ufo-fsd-alpha');
      return {
        ok: r.status === 2 && verdictLine(r).includes('FAIL-CLOSED (SRC_NOT_A_DIR')
          && verdictLine(r).includes(`--src ${want} is absent`),
        detail: `exit=${r.status} last=${verdictLine(r).slice(0, 110)}`,
        failClosed: ['SRC_NOT_A_DIR'],
      };
    });

    /* round-36 ─ PIN v1 (`kumitate-origin-pin-v1`) ------------------------ */
    const PIN_ENV = { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_TERMINAL_PROMPT: '0' };
    const gitRun = (dir, args) => spawnSync('git', ['-C', dir, ...args], {
      encoding: 'utf8', timeout: 60_000, env: gitEnv(PIN_ENV),
    });
    /* A fixture origin tree that IS a git repo: mk()'s fixture files, committed. */
    const pinTree = (name) => {
      const g = mk(name);
      let r = gitRun(g.src, ['init', '-q']);
      if (r.status !== 0) return { ...g, head: null, why: `init exit=${r.status}` };
      r = gitRun(g.src, ['add', '-A']);
      if (r.status !== 0) return { ...g, head: null, why: `add exit=${r.status} ${(r.stderr ?? '').trim().slice(0, 60)}` };
      r = gitRun(g.src, ['-c', 'user.name=fx', '-c', 'user.email=fx@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'fixture pin']);
      if (r.status !== 0) return { ...g, head: null, why: `commit exit=${r.status} ${(r.stderr ?? '').trim().slice(0, 60)}` };
      r = gitRun(g.src, ['rev-parse', 'HEAD']);
      const head = (r.stdout ?? '').trim().toLowerCase();
      return { ...g, head: r.status === 0 && /^[0-9a-f]{40}$/.test(head) ? head : null, why: `rev-parse exit=${r.status}` };
    };
    const pinFile = (name, body) => {
      const p = join(tmp, `${name}.json`);
      writeFileSync(p, `${JSON.stringify({ contract: 'kumitate-origin-pin-v1', repo: 'ufo-fsd-alpha', recreate: 'git clone <remote> <clone> && git -C <clone> checkout <revision>', verified_at: '2026-10-21', ...body }, null, 2)}\n`);
      return p;
    };
    // GIT_CEILING_DIRECTORIES keeps "not a repository" deterministic even when
    // the host's tmpdir sits inside some other checkout.
    const pinRun = (argv) => runClaims(argv, { GIT_CEILING_DIRECTORIES: tmp });

    const pinOk = pinTree('pin-match');
    const pinOkFile = pinFile('pin-match', { revision: pinOk.head ?? '0'.repeat(40), clone: pinOk.src });
    check('PIN match: --pin resolves src from the clone and the verdict names src-rev=', () => {
      if (pinOk.head === null) return { ok: false, detail: `git fixture unavailable: ${pinOk.why}` };
      const want = `CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=2 adv=0 src-rev=${pinOk.head.slice(0, 12)})`;
      const r = pinRun(['--self', pinOk.self, '--pin', pinOkFile]);
      return { ok: r.status === 0 && verdictLine(r) === want, detail: `exit=${r.status} last=${verdictLine(r).slice(0, 140)}` };
    });

    const pinDefault = pinTree('pin-default');
    {
      const p = join(pinDefault.self, '.ufo/pins/origin.json');
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, `${JSON.stringify({ contract: 'kumitate-origin-pin-v1', revision: pinDefault.head ?? '0'.repeat(40), clone: pinDefault.src }, null, 2)}\n`);
    }
    check('PIN default: <--self>/.ufo/pins/origin.json is discovered with no --pin/--src', () => {
      if (pinDefault.head === null) return { ok: false, detail: `git fixture unavailable: ${pinDefault.why}` };
      const want = `CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=2 adv=0 src-rev=${pinDefault.head.slice(0, 12)})`;
      const r = pinRun(['--self', pinDefault.self]);
      return { ok: r.status === 0 && verdictLine(r) === want, detail: `exit=${r.status} last=${verdictLine(r).slice(0, 140)}` };
    });

    const pinBad = pinTree('pin-mismatch');
    const pinBadFile = pinFile('pin-mismatch', { revision: 'f'.repeat(40), clone: pinBad.src });
    check('PIN mismatch: HEAD != pin.revision → SRC_REV_MISMATCH exit 2, no scored verdict', () => {
      const r = pinRun(['--self', pinBad.self, '--pin', pinBadFile]);
      return {
        ok: r.status === 2 && verdictLine(r).includes('FAIL-CLOSED (SRC_REV_MISMATCH') && !r.stdout.includes('CLAIMS: MATCH'),
        detail: `exit=${r.status} last=${verdictLine(r).slice(0, 140)}`,
        failClosed: ['SRC_REV_MISMATCH'],
      };
    });

    const pinNoRepo = mk('pin-norepo');
    const pinNoRepoFile = pinFile('pin-norepo', { revision: 'a'.repeat(40), clone: pinNoRepo.src });
    check('PIN non-repo: a clone that is not a git repository → SRC_REV_UNVERIFIABLE exit 2', () => {
      const r = pinRun(['--self', pinNoRepo.self, '--pin', pinNoRepoFile]);
      return {
        ok: r.status === 2 && verdictLine(r).includes('FAIL-CLOSED (SRC_REV_UNVERIFIABLE'),
        detail: `exit=${r.status} last=${verdictLine(r).slice(0, 140)}`,
        failClosed: ['SRC_REV_UNVERIFIABLE'],
      };
    });

    check('PIN malformed: an explicit --pin that is absent is fail-closed, never "no pin"', () => {
      const r = pinRun(['--self', green.self, '--pin', join(tmp, 'no-such-pin.json')]);
      return {
        ok: r.status === 2 && verdictLine(r).includes('FAIL-CLOSED (PIN_MALFORMED'),
        detail: `exit=${r.status} last=${verdictLine(r).slice(0, 140)}`,
        failClosed: ['PIN_MALFORMED'],
      };
    });
    check('PIN malformed: a short revision is refused (no prefix match)', () => {
      const g = pinTree('pin-shortrev');
      const f = pinFile('pin-shortrev', { revision: '31c465f1', clone: g.src });
      const r = pinRun(['--self', g.self, '--pin', f]);
      return {
        ok: r.status === 2 && verdictLine(r).includes('FAIL-CLOSED (PIN_MALFORMED'),
        detail: `exit=${r.status} last=${verdictLine(r).slice(0, 140)}`,
      };
    });

    check('PIN absent: no pin file leaves the verdict byte-identical (no src-rev= segment)', () => {
      const r = pinRun(['--self', green.self, '--src', green.src]);
      return {
        ok: r.status === 0 && verdictLine(r) === GREEN_MATCH && !r.stdout.includes('src-rev='),
        detail: `exit=${r.status} last=${verdictLine(r).slice(0, 140)}`,
      };
    });

    // round-37 spot-check D2: a shifted anchor whose adjacent next span is the
    // *next* symbol must read non-ok; right-first pairing would reward the shift.
    const shift = mk('fidelity-shift', {
      notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`BETA_MARK` (`scripts/a.mjs:3`), `ALPHA_MARK` at `scripts/a.mjs:3`.\n']],
    });
    check('FIDELITY: a shift onto the next symbol reads non-ok (canonical left-first pairing)', () => {
      const r = runClaims(args(shift, ['--fidelity']));
      return {
        ok: r.status === 1 && verdictLine(r).startsWith('FIDELITY: DRIFT')
          && /nonok=1/u.test(verdictLine(r)),
        detail: `exit=${r.status} ${verdictLine(r).slice(0, 120)}`,
      };
    });

    // usage
    check('ROW_UNKNOWN: unknown --row is a usage refusal, exit 64', () => {
      const g = mk('row-unknown');
      const r = runClaims(args(g, ['--row', 'Z9']));
      return { ok: r.status === 64 && r.stdout.includes('usage:') && r.stdout.includes('ROW_UNKNOWN'), detail: `exit=${r.status}` };
    });
    check('symbol threshold: a 2-char backticked token does not count as a symbol', () => {
      const g = mk('short-sym', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`AB` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
      const r = runClaims(args(g));
      return { ok: r.status === 1 && kinds(r).join(',') === 'SECTION_NO_SYMBOL', detail: `exit=${r.status} kinds=[${kinds(r).join(',')}]` };
    });
    check('anchor liveness boundary: the last non-blank line is live, one past it is dead', () => {
      const g = mk('boundary', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:4`.\n']] });
      const live = runClaims(args(g));
      const past = mk('boundary-past', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:5`.\n']] });
      const dead = runClaims(args(past));
      return {
        ok: live.status === 0 && dead.status === 1 && kinds(dead).join(',') === 'SECTION_DEAD_ANCHOR',
        detail: `lastline exit=${live.status} past-eof exit=${dead.status} kinds=[${kinds(dead).join(',')}]`,
      };
    });
    check('unknown flag → usage exit 64', () => {
      const g = mk('usage');
      const r = runClaims(['--bogus']);
      return { ok: r.status === 64 && r.stdout.includes('usage:'), detail: `exit=${r.status}` };
    });
    check('--self without a value → usage exit 64', () => {
      const r = runClaims(['--self']);
      return { ok: r.status === 64, detail: `exit=${r.status}` };
    });
    check('-h prints usage, exit 0', () => {
      const r = runClaims(['-h']);
      return { ok: r.status === 0 && r.stdout.includes('contract id:'), detail: `exit=${r.status}` };
    });

    // hermeticity is asserted structurally: every fixture root is under tmpdir(),
    // and the acceptance run proves it from outside by poisoning the env
    // (`UFO_SRC=/nonexistent … --selftest` → PASS). A case that re-entered
    // `--selftest` here would recurse, so it is deliberately absent.
    check('fixture roots are all under tmpdir() (no live tree in reach)', () => ({
      ok: tmp.startsWith(`${tmpdir()}/`),
      detail: `tmp=${tmp} startsWith(tmpdir())=${tmp.startsWith(tmpdir())}`,
    }));
    check('the row summary and the verdict agree on sections/notes/adv (kind-blind mutants fail here)', () => {
      const g = mk('totals', { notes: [['corpus/knowledge/fx-a.md', FX_GREEN_NOTE], ['corpus/knowledge/fx-b.md', 'prose only about `scripts/b.mjs`, no section\n']] });
      const r = runClaims(args(g));
      const row = r.stdout.split('\n').find((l) => l.startsWith('ROW R1 ')) ?? '';
      return {
        ok: r.status === 0 && verdictLine(r) === 'CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=1 adv=1)'
          && row.includes('form=topic') && row.includes('sections=0') && row.includes('adv=1'),
        detail: `exit=${r.status} last=${verdictLine(r)} row=${row.trim()}`,
      };
    });
    check('heading with trailing prose still counts as a member section', () => {
      const g = mk('trailing', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs` (6 L) — fixture A\n\n`ALPHA_MARK` at `scripts/a.mjs:3`.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
      const r = runClaims(args(g));
      return { ok: r.status === 0 && r.stdout.includes('form=section'), detail: `exit=${r.status} last=${verdictLine(r).slice(0, 60)}` };
    });
    check('un-backticked parenthesised anchor counts (runtime-note house style)', () => {
      const g = mk('paren', { notes: [['corpus/knowledge/fx-a.md', '## `scripts/a.mjs`\n\nThe mark `ALPHA_MARK` (scripts/a.mjs:3) is set.\n'], ['corpus/knowledge/fx-b.md', '## `scripts/b.mjs`\n\n`BETA_MARK` at `scripts/b.mjs:2`.\n']] });
      const r = runClaims(args(g));
      return { ok: r.status === 0, detail: `exit=${r.status} last=${verdictLine(r).slice(0, 60)}` };
    });

    // coverage of the kind table itself
    const missingKinds = FINDING_KINDS.filter((k) => !observed.has(k));
    const missingArms = FAIL_CLOSED_KINDS.filter((k) => !failClosedSeen.has(k));
    check('every finding kind fired by the suite', () => ({ ok: missingKinds.length === 0, detail: `unfired=[${missingKinds.join(',')}]` }));
    check('every fail-closed arm fired by the suite', () => ({ ok: missingArms.length === 0, detail: `unfired=[${missingArms.join(',')}]` }));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const failed = results.filter((r) => !r.ok);
  for (const r of results) {
    if (!r.ok) process.stdout.write(`FAIL ${r.label}\n     ${r.detail}\n`);
  }
  process.stdout.write(`CLAIMS_SELFTEST: ${results.length - failed.length}/${results.length} pass\n`);
  process.stdout.write(`VERDICT: ${failed.length === 0 ? 'PASS' : 'FAIL'}\n`);
  return failed.length === 0 ? 0 : 1;
}

/* ----------------------------------------------------------------- exports */

/**
 * The importable surface (round 16). `probeSections` is the whole claim shape;
 * the rest are the frozen primitives `scripts/proxy-check.mjs` reuses instead
 * of re-walking the registry — importing this module runs no CLI (see the
 * entrypoint guard at the bottom).
 */
export { walkFiles, parseRegistry, resolveSrcDefault, SCORECARD_FILE, CORPUS_DIRS };

/* ------------------------------------------------------------------- argv */

function parseArgs(argv) {
  const opts = {
    self: DEFAULT_SELF, scorecard: SCORECARD_FILE, src: null, pin: null, row: [], json: false,
    strict: false, selftest: false, help: false, fidelity: false, ratchet: null,
  };
  const need = (flag, v) => {
    if (v === undefined || v.trim() === '' || v.startsWith('-')) {
      process.stdout.write(`claims-check: ${flag} needs a value\n${USAGE}`);
      process.exit(64);
    }
    return v;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--self') { opts.self = resolve(need(a, argv[++i])); continue; }
    if (a === '--scorecard') { opts.scorecard = need(a, argv[++i]); continue; }
    if (a === '--src') { opts.src = resolve(need(a, argv[++i])); continue; }
    if (a === '--pin') { opts.pin = resolve(need(a, argv[++i])); continue; }
    if (a === '--row') { opts.row.push(need(a, argv[++i])); continue; }
    if (a === '--fidelity') { opts.fidelity = true; continue; }
    if (a === '--fidelity-ratchet') { opts.ratchet = resolve(need(a, argv[++i])); continue; }
    if (a === '--json') { opts.json = true; continue; }
    if (a === '--strict') { opts.strict = true; continue; }
    if (a === '--selftest' || a === '--self-test') { opts.selftest = true; continue; }
    if (a === '-h' || a === '--help') { opts.help = true; continue; }
    process.stdout.write(`claims-check: unsupported argument: ${a}\n${USAGE}`);
    process.exit(64);
  }
  // The origin tree — and whether a pin asserts it — is resolved in `runCheck`
  // (never for `--selftest`/`--help`, which exit first), so a bare check run
  // stats no live path until it is actually about to score one.
  return opts;
}

const TOOL_FILE = fileURLToPath(import.meta.url);

function main() {
  const started = Date.now();
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { process.stdout.write(USAGE); process.exit(0); }
  if (opts.selftest) process.exit(selfTest());
  if (opts.fidelity) process.exit(runFidelity(opts));
  process.exit(runCheck(opts, started));
}

/** Entrypoint guard: the CLI runs only when this file started the process.
 *  `await import()` (proxy-check's probe) must never print a verdict or exit. */
const isEntry = (() => {
  if (process.argv[1] === undefined) return false;
  const invoked = resolve(process.argv[1]);
  if (invoked === TOOL_FILE) return true;
  try { return realpathSync(invoked) === TOOL_FILE; } catch { return false; }
})();

if (isEntry) main();