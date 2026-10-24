#!/usr/bin/env node
/**
 * proxy-check.mjs — the lane's own measurement-proxy re-computer.
 * Read-only, zero deps, ESM, node >= 20, no network. Contract:
 * kumitate-proxy-v1 (parent-frozen).
 *
 *   node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--src DIR] [--kimi-root DIR] [--pin FILE] [--json] [--strict]
 *   node scripts/proxy-check.mjs --selftest
 *   node scripts/proxy-check.mjs -h|--help
 *
 * Why this exists
 *   `SCORECARD.md` states both axes as arithmetic over five tree counts
 *   (`f_O = (A+C)/(A+C+3)`, `coverage = floor(10 × C1/C1_total × C2/C2_total)`)
 *   plus four file digests. Every term in that sentence is re-derivable from
 *   the tree in under a second, so none of them should be taken on faith: this
 *   tool recomputes all of them and compares them, key by key, with the
 *   machine-readable claim the scorecard carries.
 *
 *   Round-16 amendment (terms pre-registered in `SCORECARD.md` `## Planned`):
 *   the two successors of the retired `coverage` axis get their first
 *   measurement here, as the six stanza keys `S_members S_sections R_members
 *   R_sections coverage_script coverage_runtime`. The legacy terms (`A C C1
 *   C1_total C2 C2_total` and the scores derived from them, `operability` and
 *   `coverage`) stay what they always were: arithmetic over `--self` and
 *   `--scorecard` alone, no origin tree. The two LAYER terms are not self-only
 *   — they read the origin tree (`--src`) exactly once, in process, through
 *   `probeSections()` imported from the sibling `scripts/claims-check.mjs`:
 *   a module import, never a subprocess, and that gate's single walk is reused,
 *   not repeated. These are the only new reads this tool makes, and they are
 *   named here rather than hidden.
 *
 *   Round-20 amendment (terms pre-registered in `SCORECARD.md` `## Planned`,
 *   round-19 freeze + the round-20 K5 registry change): the kimi substrate gets
 *   its first measurement here, as the five stanza keys `C1k C1k_total
 *   K_members K_sections coverage_kimi`. `C1k/C1k_total` is the `yes`-row
 *   fraction among registry rows matching /^\| K\d+ \|/ (the K1–K5 families,
 *   same 4th-cell test as C1). `K_members` is read LIVE from the kimi root
 *   (`--kimi-root`, default `$KIMI_ROOT` or `~/.kimi-code`) under the frozen
 *   counting rules that `scripts/kimi-census.mjs` gates — that file exports no
 *   member table, so the rules are re-derived here (K1 4, including root
 *   `mcp.json` as a shape-only member; K2 the live child counts of
 *   `agents/secondary/` and `skills/` plus 2, K3 10, K4 9, K5 3; the drift
 *   chain is 1 member; shape-only members are lstat-kind only, never read).
 *   `K_sections` counts the DISTINCT K members named by the `## ` headings of
 *   `corpus/knowledge/kimi-*.md`: a heading names a member when one of its
 *   backticked spans, or one of its `/`-bearing tokens, equals that member's
 *   full path, or a basename only that member owns (a shared basename binds to
 *   none and warns `K_SECTION_AMBIGUOUS`). Round-22 amendment: the numerator
 *   used to count `(note, heading)` OCCURRENCES, which credited one member once
 *   per section; it now counts each member once. A missing/odd `--kimi-root` is
 *   the fail-closed arm `KIMI_ROOT_NOT_A_DIR` (exit 2) — never a scored zero.
 *
 * Origin pin (PIN v1, `kumitate-origin-pin-v1`)
 *   The layer terms are only meaningful when they score the tree they name, so
 *   a run may carry an origin pin: `--pin FILE`, defaulting to
 *   `<--self>/.ufo/pins/origin.json` when that file exists (a missing default
 *   file is NOT an error — the tool then behaves exactly as it did before this
 *   amendment, so it stays portable to trees without a pin). The pin resolves
 *   `src` as: `--src`, else the pin's `clone`, else the legacy `$UFO_SRC`
 *   candidate list. The assertion always runs on the RESOLVED tree, so an
 *   operator who passes a different `--src` under an active pin is refused
 *   rather than handed a verdict that names the pin while scoring another tree.
 *   Verification is ONE `git -C <src> rev-parse HEAD` (with
 *   `GIT_OPTIONAL_LOCKS=0`, so a read-only pinned clone is never locked):
 *     revision differs  → `SRC_REV_MISMATCH` (exit 2)
 *     not a repo / no git / HEAD not 40 hex → `SRC_REV_UNVERIFIABLE` (exit 2)
 *   A pin that cannot be trusted never degrades into "no pin" — that would
 *   silently turn provenance off — so an unreadable/invalid pin file is
 *   `PIN_MALFORMED` (exit 2). Every `PROXY: MATCH|DRIFT (…)` verdict then
 *   carries `; src-rev=<first 12 hex>` and the JSON body carries `srcRev`
 *   (null with no pin).
 *
 * Modes (one per run; `--selftest` wins, then `-h|--help`, else the recompute)
 *   default     recompute the seventeen terms + the seven pins under `--self`,
 *               `--scorecard`, the origin tree `--src` and the kimi root
 *               `--kimi-root`, and compare them
 *               with the kumitate-proxy-v1 stanza. The registry rows and the
 *               `## Axes` rows are read from the SAME file as the stanza
 *               (`--scorecard`, default `<self>/SCORECARD.md`); the two layer
 *               terms come from the claims gate's walk of `--src`. With an
 *               active origin pin the tree is resolved as `--src` → pin
 *               `clone` → legacy default, its HEAD is asserted against the pin
 *               revision, and the verdict names `src-rev=`.
 *   --selftest  HERMETIC fixture suite: synthetic repos under `mkdtemp` only.
 *               It never reads this repo, the live scorecard or the
 *               environment, so it PASSes in any tree state and a bogus
 *               `--self` cannot affect it. `--selftest` wins over `--json`.
 *               The PIN fixtures init throwaway git repos inside that tmp dir
 *               with `GIT_CONFIG_NOSYSTEM=1`/`GIT_CONFIG_GLOBAL=/dev/null` and a
 *               tmp `HOME`, so the operator's git config never reaches them.
 *   -h|--help   print USAGE, exit 0.
 *
 * Derivation (frozen — the stanza may declare these, never re-charter them)
 *   A   files under `--self` (any `.git` tree excluded), named
 *       `*.mjs|*.js|*.sh|*.py`
 *   C   lines of `<self>/SKILL.md` matching /^\s*- \[/
 *   C1  rows of the scorecard matching /^\| (S|R)\d+ \|/ whose 4th
 *       `|`-separated cell, trimmed, starts with `yes`; C1_total = those rows
 *   C2  lines of `<self>/corpus/README.md` matching
 *       /^\| `(knowledge|lessons)\//
 *   C2_total  `*.md` files under `<self>/corpus/knowledge` + `corpus/lessons`
 *   operability = floor(10 × (A+C)/(A+C+3))
 *   coverage    = floor(10 × C1/C1_total × C2/C2_total)
 *   pins  sha256 hex of `<self>/scripts/{cite-check,surface-probe,round-gate,
 *         proxy-check,claims-check,kimi-census}.mjs`
 *   Layer terms (round-16 amendment), counted over the ONE origin-tree walk
 *   `probeSections()` already performs for the claims gate — the proxy never
 *   walks `--src` itself:
 *     scripts/<name>.mjs                     → script layer
 *     any file under scripts/<dir>/          → script layer (recursive)
 *     crates/ufo-core-runtime/src/<name>.rs  → runtime layer
 *     crates/ufo-cli/src/<name>.rs           → runtime layer
 *   S_members / R_members  those file counts
 *   S_sections / R_sections  DISTINCT `section.file` identities across
 *         registry rows whose id starts `S` / `R`, respectively, considering
 *         only sections with `inFamily === true`. A member named by multiple
 *         sections or rows counts once per layer. The claims gate must resolve
 *         and grade each counted file within its row's declared family.
 *         `SECTION_FILE_NOT_MEMBER` sections (R9's `loop_driver_tests.rs`,
 *         `local_ship_tests.rs`, `distill_tests.rs`) and unresolved sections
 *         without a file identity are excluded.
 *   coverage_script  = floor(10 × C1s/C1s_total × S_sections/S_members)
 *   coverage_runtime = floor(10 × C1r/C1r_total × R_sections/R_members)
 *         where C1s/C1s_total is the `yes`-row fraction among the `S` rows
 *         (same for `R`). A zero denominator scores 0, never NaN.
 *   K terms (round-20 amendment; the round-19 frozen rules and K5 added by the
 *   round-20 registry change are extended by the pre-registered round-35 K1
 *   `mcp.json` member), counted over the kimi root named by `--kimi-root` — the
 *   ONLY tree reads outside `--self`/`--src`:
 *     C1k / C1k_total  registry rows matching /^\| K\d+ \|/ over ALL such rows,
 *         covered = those whose 4th `|`-separated cell, trimmed, starts `yes`
 *         (the same cell test as C1; the S/R rows are NOT in this denominator).
 *     K_members   the live member-slot total under the frozen counting rules:
 *         K1 4 (`config.toml`, `tui.toml`, the `config.toml.*.bak` chain as ONE
 *         member, plus root `mcp.json`; its 0400 mode floor is gated by the
 *         census tool); K2 `agents/secondary/` + `skills/` live child counts
 *         plus 2 plugin members; K3 10 state paths (including mode-pinned `locks/`); K4 9 (directories
 *         are 1 member each; `server.token`, `credentials/`, and `oauth/` are
 *         kind-statted and never opened or content-read; secret directories are
 *         never enumerated); K5 3 root-residue files (`workspaces.json`,
 *         `tui.toml.bak`, `rc-qrcode.png`), presence + kind only, never content.
 *         An absent member or one whose live kind differs from the declared
 *         kind counts 0, and the total lands wherever the tree actually is —
 *         the census gate (`scripts/kimi-census.mjs`,
 *         `kumitate-kimi-census-v1`) names WHICH slot drifted; here a moved tree
 *         shows up as `K_MEMBERS_DRIFT`, not as a fitted number.
 *     K_sections  DISTINCT K members named by the `## ` headings over the
 *         `corpus/knowledge/kimi-*.md` notes: a heading names a member when one
 *         of its backticked spans, or one of its whitespace-separated tokens
 *         that contains `/`, equals that member's canonical identity — a member
 *         path, a counted dir's live child path (`agents/secondary/<lane>.md`,
 *         `skills/<name>`), or the `config.toml.*.bak` chain as one member
 *         whatever generation a heading names. A token that is not itself a
 *         member path binds by basename ONLY when exactly one member owns that
 *         basename; a shared basename binds to none and warns
 *         (`K_SECTION_AMBIGUOUS`). Topic-form headings name nothing, and a
 *         member named by five sections still counts once — the honesty term.
 *     coverage_kimi = floor(10 × C1k/C1k_total × K_sections/K_members); a zero
 *         denominator scores 0, never NaN.
 *   The five derived scores must ALSO equal the integers in the scorecard's
 *   `## Axes` rows `| operability | N |`, `| coverage | N |`,
 *   `| coverage:script-layer | N |`, `| coverage:runtime-layer | N |` and
 *   `| coverage:kimi-layer | N |`.
 *   These counts are shell-identical to the commands the scorecard already
 *   prints: `find . -path ./.git -prune -o -type f \( -name '*.mjs' … \) -print
 *   | wc -l`, `grep -c '^\s*- \[' SKILL.md`, `grep -cE '^\| (S|R)[0-9]+ \|'`
 *   plus a 4th-cell `yes` test, `grep -cE '^\| `(knowledge|lessons)/'
 *   corpus/README.md`, `find corpus/knowledge corpus/lessons -name '*.md' |
 *   wc -l`, and `sha256sum scripts/*.mjs`.
 *
 * Claim block (machine-readable)
 *   Exactly one HTML comment block in the scorecard whose first line is
 *   `<!-- kumitate-proxy-v1`; its body is `key=value` lines and it is closed by
 *   a line containing `-->`:
 *     A C C1 C1_total C2 C2_total           the declared self-only counts
 *     S_members S_sections R_members R_sections  the declared layer universe
 *     coverage_script coverage_runtime       the two layer scores
 *     C1k C1k_total K_members K_sections     the declared kimi-block universe
 *     coverage_kimi                          the kimi-layer score
 *     pin.cite-check pin.surface-probe pin.round-gate pin.proxy-check
 *     pin.claims-check pin.kimi-census sha256 hex of scripts/<name>.mjs
 *   All twenty-three keys are REQUIRED, exactly once; no other key is accepted
 *   (the stanza key charset forbids `:`, which is why the axes' names are
 *   spelled `coverage_script` / `coverage_runtime` / `coverage_kimi` here).
 *   Every value is
 *   re-derived from the trees and never trusted: a term or pin that disagrees
 *   is a finding, and the stanza is never rewritten here. No key can vouch for
 *   itself — A, C and C1 are states of other files, C2 counts the corpus notes,
 *   the layer terms come from the origin tree through the claims gate, the K
 *   terms come from the kimi root and the `kimi-*.md` notes, and
 *   `pin.proxy-check` hashes this file for a reader, not for this run.
 *
 * `kumitate-gate-pins-v1` is a separate optional lane-owned block: only its
 * named gate files are verified, and their listed paths are excluded from
 * PIN_UNPINNED. It does not widen the frozen v1 keys or pin count.
 * Findings (text mode prints `PROXY  <severity>  <KIND>  <detail>`)
 *   error A_DRIFT C_DRIFT C1_DRIFT C1_TOTAL_DRIFT C2_DRIFT C2_TOTAL_DRIFT
 *         S_MEMBERS_DRIFT S_SECTIONS_DRIFT R_MEMBERS_DRIFT R_SECTIONS_DRIFT
 *         COVERAGE_SCRIPT_DRIFT COVERAGE_RUNTIME_DRIFT
 *         C1K_DRIFT C1K_TOTAL_DRIFT K_MEMBERS_DRIFT K_SECTIONS_DRIFT
 *         COVERAGE_KIMI_DRIFT PIN_DRIFT GATE_PIN_DRIFT (a listed pin whose
 *         file is absent is reported as `computed=absent`, never silently
 *         skipped) AXES_DRIFT
 *   warn  PIN_UNPINNED — a `scripts/*.mjs` file no pin key covers: pin
 *         coverage is incomplete (advisory; `--strict` promotes it to a gate).
 *         K_SECTION_AMBIGUOUS — a `kimi-*.md` heading whose only candidate is a
 *         basename shared by several K members: it names none of them
 *         (advisory; `--strict` promotes it to a gate).
 *
 * Verdict lines (always the last stdout line)
 *   PROXY: MATCH (A=<a> C=<c> operability=<s>; C1=<x>/<y> C2=<p>/<q>
 *                 coverage=<s>; S=<s>/<m> coverage:script-layer=<s>;
 *                 R=<s>/<m> coverage:runtime-layer=<s>;
 *                 K=<sections>/<members> coverage:kimi-layer=<n>;
 *                 pins=<n> match[; src-rev=<12 hex>])
 *   PROXY: DRIFT (<KIND term=… declared=… computed=… delta=…>…[; src-rev=<12 hex>])
 *   PROXY: FAIL-CLOSED (<TOKEN>) <detail>     (exit 2)
 *   `; src-rev=` is present exactly when a pin is active (PIN v1): it is the
 *   first 12 hex of the revision the run PROVED, so a verdict can never be
 *   quoted without the tree it scored.
 *
 * Exit: 0 match · 1 drift (findings; warnings too under `--strict`) ·
 *       2 fail-closed · 64 usage. Argument parsing precedes every mode: an
 *       unknown flag (or a missing flag value) is refused with 64 even when
 *       `--selftest` is present, exactly as `round-gate.mjs` does.
 *
 * Fail-closed arms (exit 2; each prints its named kind; checked in this order)
 *   SELF_NOT_A_DIR PIN_MALFORMED SRC_NOT_A_DIR SRC_REV_UNVERIFIABLE
 *   SRC_REV_MISMATCH KIMI_ROOT_NOT_A_DIR SCORECARD_MISSING
 *   STANZA_MISSING
 *   STANZA_MALFORMED STANZA_KEY_UNKNOWN STANZA_KEY_DUPLICATE REGISTRY_MISSING
 *   SKILL_MISSING README_MISSING CORPUS_DIRS_MISSING
 *   PIN_MALFORMED = the pin file (explicit `--pin`, or the default one that
 *   exists) is unreadable, not JSON, not an object, names another contract, has
 *   a revision outside 40 lowercase hex, or has no `clone` path. A pin that
 *   cannot be trusted is refused, never ignored: ignoring it would silently
 *   turn provenance off.
 *   SRC_REV_UNVERIFIABLE = the resolved tree is not a git repository (or git is
 *   absent, or HEAD is unborn/not 40 hex): the pin's claim cannot be checked.
 *   SRC_REV_MISMATCH = `git -C <src> rev-parse HEAD` differs from the pin
 *   revision — the classic "scored another tree while naming the pin" defect.
 *   SRC_NOT_A_DIR = `--src` (or the pin's `clone` when `--src` is absent) is not
 *   a directory. The four legacy terms do not
 *   need it, but the two layer terms do — they are counted over the claims
 *   gate's walk of that tree — so a missing origin tree refuses the whole
 *   verdict rather than printing a score it cannot derive.
 *   KIMI_ROOT_NOT_A_DIR = `--kimi-root` is not a directory (absent, a file, or
 *   unreadable): `K_members` is a live count, so a missing substrate refuses the
 *   run — it is never scored 0, which would read as a substrate that vanished.
 *   STANZA_MISSING = no claim block at all; STANZA_MALFORMED = more than one
 *   block, no `-->` terminator, a body line that is not `key=value`, a required
 *   key absent, or a value outside `\d+` (counts) / `[0-9a-f]{64}` (pins).
 *   CORPUS_DIRS_MISSING also fires when the corpus census is empty (no `*.md`
 *   under either dir): the C2 denominator would otherwise be zero, and a proxy
 *   that divides by zero still prints a number. Not in that frozen list:
 *   INTERNAL_ERROR, the crash net, so an unexpected throw is a refused verdict
 *   rather than a stack trace.
 *
 * Bounds and what this tool never does
 *   Reads only, under `--self` + the scorecard + the origin tree named by
 *   `--src` (or the pin's `clone`) + the kimi root named by `--kimi-root`: no
 *   writes, no network, no lock; the ONE subprocess is the pin's
 *   `git -C <src> rev-parse HEAD` (PIN v1, only when a pin is active, run with
 *   `GIT_OPTIONAL_LOCKS=0` so the read-only pinned clone is neither locked nor
 *   touched). With no pin the tool spawns nothing at all. The origin
 *   tree is opened only through the imported `probeSections()` (which walks it
 *   exactly once, in process) and the files that gate already reads for its own
 *   member derivations — never a second walk, never a shell-out. The kimi root
 *   is read by `lstatSync` on member paths and `readdirSync` on the root plus
 *   `corpus/knowledge/kimi-*.md` under `--self` — no file content is read.
 *   The shape-only members (`mcp.json`, `server.token`, `credentials/`,
 *   `oauth/`) are kind-statted and never opened or content-read; root
 *   enumeration sees names only, and the secret directories are never listed.
 *   `--selftest` is the only writer, only into a fresh `mkdtemp` dir it removes
 *   afterwards. Environment: the variables consulted are `UFO_SRC` and
 *   `KIMI_ROOT`, each only as its flag's default
 *   (`process.env.UFO_SRC || the first existing origin candidate`,
 *   `process.env.KIMI_ROOT || ~/.kimi-code`),
 *   so the legacy self-only terms stay env-independent; the pin default is a
 *   path under `--self` (`.ufo/pins/origin.json`), never an env var, and the
 *   pin's git child gets `GIT_OPTIONAL_LOCKS=0`/`GIT_TERMINAL_PROMPT=0` only.
 *   `--selftest` reads no
 *   environment and no live tree at all (its K terms count over a fixture kimi
 *   root it builds in the tmp dir), which is what makes it hermetic.
 *   Portable: node >= 20, ESM, zero deps.
 */

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { lstatSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// The claims gate is imported IN PROCESS (never spawned as a subprocess): the
// two layer terms need its registry-row derivation and its single walk of the
// origin tree. Importing it runs no CLI — its main() is guarded.
import { probeSections } from './claims-check.mjs';

const CONTRACT = 'kumitate-proxy-v1';
const STANZA_HEAD = `<!-- ${CONTRACT}`;
const GATE_PIN_CONTRACT = 'kumitate-gate-pins-v1';
const GATE_PIN_HEAD = `<!-- ${GATE_PIN_CONTRACT}`;
const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SELF = resolve(HERE, '..');
/**
 * Candidate origin-tree locations, canonical first. The operator restructure of
 * 2026-10-12 moved the tree from `origin-work/ufo-fsd-alpha` to
 * `Projects/ufo-fsd-alpha`; the default is derived from this list, never
 * hardcoded to either, so a bare invocation survives the move (round-17
 * precedent: derive the default, do not hardcode it).
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

/* ------------------------------------------------------------------ PIN v1 */

/**
 * `kumitate-origin-pin-v1` — the frozen origin pin (round-36). The sibling
 * `scripts/claims-check.mjs` implements the same contract with the same token
 * vocabulary and the same messages; the read/resolve block is duplicated here
 * (not imported) for the same reason `resolveSrcDefault` already is: each gate
 * must stand alone, and the claims gate exports no pin reader.
 */
const PIN_CONTRACT = 'kumitate-origin-pin-v1';
const PIN_REL = '.ufo/pins/origin.json';
const RE_REV = /^[0-9a-f]{40}$/;

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

/** Kimi installation the K terms count over; `--kimi-root` overrides it. */
const DEFAULT_KIMI_ROOT = process.env.KIMI_ROOT || join(homedir(), '.kimi-code');

const SCORECARD_FILE = 'SCORECARD.md';
const SKILL_FILE = 'SKILL.md';
const CORPUS_README = 'corpus/README.md';
const CORPUS_DIRS = ['corpus/knowledge', 'corpus/lessons'];

/** Declared-count keys of the stanza, in comparison order. */
const TERM_KEYS = ['A', 'C', 'C1', 'C1_total', 'C2', 'C2_total',
  'S_members', 'S_sections', 'R_members', 'R_sections',
  'coverage_script', 'coverage_runtime',
  'C1k', 'C1k_total', 'K_members', 'K_sections', 'coverage_kimi'];
/** Pin key → the file whose sha256 it declares. */
const PINS = {
  'pin.cite-check': 'scripts/cite-check.mjs',
  'pin.surface-probe': 'scripts/surface-probe.mjs',
  'pin.round-gate': 'scripts/round-gate.mjs',
  'pin.proxy-check': 'scripts/proxy-check.mjs',
  'pin.claims-check': 'scripts/claims-check.mjs',
  'pin.kimi-census': 'scripts/kimi-census.mjs',
};
const STANZA_KEYS = [...TERM_KEYS, ...Object.keys(PINS)];
/** Separate lane-owned gate pins; never widen the parent-frozen v1 key set. */
const GATE_PINS = {
  'pin.anchor-truth': 'scripts/anchor-truth.mjs',
  'pin.sources-check': 'scripts/sources-check.mjs',
  'pin.wave-census': 'scripts/wave-census.mjs',
  'pin.gate-mutants': 'scripts/gate-mutants.mjs',
  'pin.omp-census': 'scripts/omp-census.mjs',
  'pin.cap-run': 'scripts/cap-run.mjs',
  'pin.bind-oracle': 'scripts/bind-oracle.mjs', // round 50: child-side mount oracle for bind visibility
  'pin.cap-spawn': 'scripts/cap-spawn.mjs', // round 47: helper that routes child sites through cap-run
  'pin.counter-rerun': 'scripts/counter-rerun.mjs', // round 48: repeat-run receipt instrument (C2)
  'pin.receipt-attest': 'scripts/receipt-attest.mjs', // round 51: invocation receipt attestation instrument (C1)
  'pin.counter-pins': 'scripts/counter-pins.mjs', // round 54: frozen-counter registry gate
  'pin.source-capture': 'scripts/source-capture.mjs', // round 55: opened-source byte-persistence gate
  'pin.source-dupes': 'scripts/source-dupes.mjs', // round 56: SOURCES duplicate-URL ratchet
  'pin.readme-map': 'scripts/readme-map.mjs', // round 57: corpus coverage-map bimap gate
  'pin.receipt-evidence': 'scripts/receipt-evidence.mjs', // round 58: receipt reproduction + descending nonce-sweep gate (R57-V1/V2/V4)
};
/** Scorecard `## Axes` rows the derived scores must equal: axis name → term key. */
const AXIS_ROWS = [
  { axis: 'operability', term: 'operability' },
  { axis: 'coverage', term: 'coverage' },
  { axis: 'coverage:script-layer', term: 'coverage_script' },
  { axis: 'coverage:runtime-layer', term: 'coverage_runtime' },
  { axis: 'coverage:kimi-layer', term: 'coverage_kimi' },
];

/**
 * The frozen layer universe (round-16 amendment), applied as a FILTER over the
 * one origin walk `probeSections()` performs — this file never walks `--src`
 * itself. `scripts/<name>.mjs` and everything under `scripts/<dir>/` (any
 * extension, recursive) are script-layer members; the two `src` dirs' top-level
 * `.rs` files are runtime-layer members.
 */
const LAYER_PATTERNS = {
  S: [/^scripts\/[^/]+\.mjs$/, /^scripts\/[^/]+\/.+/],
  R: [/^crates\/ufo-core-runtime\/src\/[^/]+\.rs$/, /^crates\/ufo-cli\/src\/[^/]+\.rs$/],
};

/** Frozen derivation patterns (see the header; do not widen them here). */
const RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/;
const RE_CHECKLIST = /^\s*- \[/;
const RE_REGISTRY_ROW = /^\| (S|R)\d+ \|/;
/** Round-20: the K-block registry rows (K1–K5), same 4th-cell `yes` test. */
const RE_K_ROW = /^\| K\d+ \|/;
const RE_README_ROW = /^\| `(knowledge|lessons)\//;
/** `key=value`; the key charset covers the `pin.<name>` family. */
const RE_STANZA_KV = /^([A-Za-z][A-Za-z0-9_.-]*)=(\S+)$/;
const RE_INT = /^\d+$/;
const RE_HEX64 = /^[0-9a-f]{64}$/;
/** The K1 drift chain, and the kimi notes whose headings feed `K_sections`. */
const RE_CHAIN = /^config\.toml(\..+)?\.bak$/;
const RE_KIMI_NOTE = /^kimi-.*\.md$/;

/**
 * The frozen K member rules (round-19 freeze + round-20 K5, round-35 K1
 * `mcp.json`, and round-42 K3 `locks/` changes), read live under `--kimi-root`.
 * gates the same rules but exports no member table, so the rules are re-derived
 * here — the census is the tool that names WHICH slot drifted; this proxy only
 * counts. A counted dir contributes its LIVE non-hidden child count; `chain` is
 * one member when any generation exists; shape-only members are lstat-kind only,
 * never opened.
 */
const K_MEMBER_RULES = [
  { id: 'config.toml', family: 'K1', path: 'config.toml', kind: 'file' },
  { id: 'tui.toml', family: 'K1', path: 'tui.toml', kind: 'file' },
  { id: 'config.toml.*.bak', family: 'K1', path: 'config.toml.*.bak', kind: 'chain' },
  { id: 'mcp.json', family: 'K1', path: 'mcp.json', kind: 'file', secret: true },
  { id: 'agents/secondary/', family: 'K2', path: 'agents/secondary', kind: 'counted' },
  { id: 'skills/', family: 'K2', path: 'skills', kind: 'counted' },
  { id: 'plugins/installed.json', family: 'K2', path: 'plugins/installed.json', kind: 'file' },
  { id: 'plugins/managed/kimi-webbridge', family: 'K2', path: 'plugins/managed/kimi-webbridge', kind: 'dir' },
  { id: 'locks/', family: 'K3', path: 'locks', kind: 'dir' },
  { id: 'sessions/', family: 'K3', path: 'sessions', kind: 'dir' },
  { id: 'session_index.jsonl', family: 'K3', path: 'session_index.jsonl', kind: 'file' },
  { id: 'workspace-trust/', family: 'K3', path: 'workspace-trust', kind: 'dir' },
  { id: 'telemetry/', family: 'K3', path: 'telemetry', kind: 'dir' },
  { id: 'logs/kimi-code.log', family: 'K3', path: 'logs/kimi-code.log', kind: 'file' },
  { id: 'file-history/', family: 'K3', path: 'file-history', kind: 'dir' },
  { id: 'user-history/', family: 'K3', path: 'user-history', kind: 'dir' },
  { id: 'cache/', family: 'K3', path: 'cache', kind: 'dir' },
  { id: 'search-index/', family: 'K3', path: 'search-index', kind: 'dir' },
  { id: 'bin/kimi', family: 'K4', path: 'bin/kimi', kind: 'file' },
  { id: 'bin/fd', family: 'K4', path: 'bin/fd', kind: 'file' },
  { id: 'updates/', family: 'K4', path: 'updates', kind: 'dir' },
  { id: 'server/', family: 'K4', path: 'server', kind: 'dir' },
  { id: 'server.token', family: 'K4', path: 'server.token', kind: 'file', secret: true },
  { id: 'device_id', family: 'K4', path: 'device_id', kind: 'file' },
  { id: 'region', family: 'K4', path: 'region', kind: 'file' },
  { id: 'credentials/', family: 'K4', path: 'credentials', kind: 'dir', secret: true },
  { id: 'oauth/', family: 'K4', path: 'oauth', kind: 'dir', secret: true },
  { id: 'workspaces.json', family: 'K5', path: 'workspaces.json', kind: 'file' },
  { id: 'tui.toml.bak', family: 'K5', path: 'tui.toml.bak', kind: 'file' },
  { id: 'rc-qrcode.png', family: 'K5', path: 'rc-qrcode.png', kind: 'file' },
];

/** Every finding kind the hermetic suite must fire at least once. */
const FINDING_KINDS = [
  'A_DRIFT', 'C_DRIFT', 'C1_DRIFT', 'C1_TOTAL_DRIFT', 'C2_DRIFT', 'C2_TOTAL_DRIFT',
  'S_MEMBERS_DRIFT', 'S_SECTIONS_DRIFT', 'R_MEMBERS_DRIFT', 'R_SECTIONS_DRIFT',
  'COVERAGE_SCRIPT_DRIFT', 'COVERAGE_RUNTIME_DRIFT',
  'C1K_DRIFT', 'C1K_TOTAL_DRIFT', 'K_MEMBERS_DRIFT', 'K_SECTIONS_DRIFT',
  'COVERAGE_KIMI_DRIFT',
  'PIN_DRIFT', 'GATE_PIN_DRIFT', 'AXES_DRIFT', 'PIN_UNPINNED', 'K_SECTION_AMBIGUOUS',
];
/** Every fail-closed arm the hermetic suite must fire at least once. */
const FAIL_CLOSED_KINDS = [
  'SELF_NOT_A_DIR', 'PIN_MALFORMED', 'SRC_NOT_A_DIR', 'SRC_REV_UNVERIFIABLE',
  'SRC_REV_MISMATCH', 'KIMI_ROOT_NOT_A_DIR', 'SCORECARD_MISSING',
  'STANZA_MISSING', 'STANZA_MALFORMED', 'STANZA_KEY_UNKNOWN', 'STANZA_KEY_DUPLICATE',
  'GATE_PIN_MALFORMED', 'GATE_PIN_KEY_UNKNOWN',
  'REGISTRY_MISSING', 'SKILL_MISSING', 'README_MISSING', 'CORPUS_DIRS_MISSING',
];

const USAGE = `usage: node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--src DIR] [--kimi-root DIR] [--pin FILE] [--json] [--strict]
       node scripts/proxy-check.mjs --selftest
       node scripts/proxy-check.mjs -h|--help
contract id: ${CONTRACT}

modes:
  default      recompute A C C1 C1_total C2 C2_total, the layer terms
               (S_members S_sections R_members R_sections), the kimi-block terms
               (C1k C1k_total K_members K_sections), the five scores
               (operability, coverage, coverage:script-layer,
               coverage:runtime-layer, coverage:kimi-layer) and the seven script
               pins, then compare
               them with the ${CONTRACT} block in --scorecard (default
               <self>/${SCORECARD_FILE}) and with that file's ## Axes rows.
               The legacy counts are self-only; the layer terms are counted
               over --src, walked exactly once and in process by
               probeSections() imported from scripts/claims-check.mjs, and the
               layer numerator counts only member sections that gate grades
               inside the row's declared family (out-of-family sections are
               excluded); the kimi-block terms count over --kimi-root (lstat and
               readdir only — secret members are never opened) plus the
               corpus/knowledge/kimi-*.md headings under --self; K_sections is
               the count of DISTINCT K members those headings name, and a heading
               whose only candidate is a basename shared by several members names
               none of them (warn K_SECTION_AMBIGUOUS).
               With an active origin pin (--pin, or the default pin file under
               --self) the tree is resolved through the pin and its HEAD is
               asserted; the verdict then carries src-rev=<12 hex>.
  --selftest   hermetic fixture suite (tmp dirs only; never reads this repo)
  -h | --help  print this text, exit 0

options:
  --self DIR         repo root to measure (default: the repo containing this script)
  --scorecard FILE   claim block + registry rows + ## Axes rows (default <self>/${SCORECARD_FILE})
  --src DIR          origin tree the layer terms count over, via the claims gate
                     (default: the pin's clone when a pin is active, else \$UFO_SRC,
                     else the first existing of
                     ~/Projects/ufo-fsd-alpha and ~/Projects/origin-work/ufo-fsd-alpha);
                     a non-directory is refused as SRC_NOT_A_DIR (exit 2)
  --pin FILE         origin pin (${PIN_CONTRACT}), default <self>/${PIN_REL}
                     when that file exists; resolves --src from the pin's clone,
                     asserts git rev-parse HEAD equals the pin revision
                     (SRC_REV_MISMATCH / SRC_REV_UNVERIFIABLE, exit 2) and prints
                     src-rev=<12 hex> in the verdict. A missing default pin file
                     is not an error — the run is then unpinned and unchanged.
  --kimi-root DIR    kimi installation the K terms count over
                     (default: \$KIMI_ROOT or ${DEFAULT_KIMI_ROOT});
                     a non-directory is refused as KIMI_ROOT_NOT_A_DIR (exit 2),
                     never scored 0
  --json             one machine-readable object on stdout
  --strict           promote warn-level findings (PIN_UNPINNED,
                     K_SECTION_AMBIGUOUS) to failure

exit map: 0 match · 1 drift (findings; warnings too under --strict) · 2 fail-closed · 64 usage
`;

/* ---------------------------------------------------------------- primitives */

function sha256Hex(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function sha256File(file) {
  try { return sha256Hex(readFileSync(file)); } catch { return null; }
}

function statKind(p) {
  try {
    const s = statSync(p);
    return s.isDirectory() ? 'dir' : s.isFile() ? 'file' : 'other';
  } catch { return 'absent'; }
}

/** Kind of an inode WITHOUT following a symlink (`absent` covers any stat failure). */
function lstatKind(p) {
  try {
    const s = lstatSync(p);
    if (s.isDirectory()) return 'dir';
    if (s.isFile()) return 'file';
    if (s.isSymbolicLink()) return 'symlink';
    if (s.isFIFO()) return 'fifo';
    if (s.isSocket()) return 'socket';
    return 'other';
  } catch { return 'absent'; }
}

/** Non-hidden child names of a dir, sorted; `[]` when it cannot be listed. */
function listChildren(p) {
  try { return readdirSync(p).filter((n) => !n.startsWith('.')).sort(); } catch { return []; }
}

function readText(p) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}

/** Escape a literal for embedding in a RegExp source (`coverage:script-layer`). */
function escapeRe(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** `grep -c` over a line regex: the number of matching lines. */
function countLines(text, re) {
  let n = 0;
  for (const line of text.split('\n')) if (re.test(line)) n++;
  return n;
}

/**
 * Relative paths of every regular file under `root`. Any `.git` tree is pruned
 * (narrower than the scorecard's `-path ./.git -prune`: a nested `.git` is
 * pruned too), and symlinks are not followed — `readdirSync` types are
 * lstat-based, matching `find -type f` without `-L`.
 */
function walkFiles(root, rel = '', out = []) {
  let entries;
  try { entries = readdirSync(join(root, rel), { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name === '.git') continue;
    const r = rel === '' ? e.name : `${rel}/${e.name}`;
    if (e.isDirectory()) walkFiles(root, r, out);
    else if (e.isFile()) out.push(r);
  }
  return out;
}

/** Corpus note files (relative), or null when a corpus dir is missing/not a dir. */
function listCorpusNotes(self) {
  const out = [];
  for (const d of CORPUS_DIRS) {
    if (statKind(join(self, d)) !== 'dir') return null;
    for (const rel of walkFiles(join(self, d))) if (rel.endsWith('.md')) out.push(`${d}/${rel}`);
  }
  return out.sort();
}

/* ---------------------------------------------------------------- derivation */

/** Split a GFM table row into cells, honoring `\|` escapes (`\|` is not a cell break). */
function splitRowCells(line) {
  const cells = [];
  let cur = '';
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '\\' && line[i + 1] === '|') { cur += '|'; i += 1; continue; }
    if (ch === '|') { cells.push(cur); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur);
  return cells;
}

/** Registry rows of one family prefix (`S|R` or `K`) and how many carry a `yes` 4th cell. */
function registryCounts(scorecardText, re = RE_REGISTRY_ROW) {
  let total = 0;
  let covered = 0;
  for (const line of scorecardText.split('\n')) {
    if (!re.test(line)) continue;
    total += 1;
    const cells = splitRowCells(line);
    if ((cells[4] ?? '').trim().startsWith('yes')) covered += 1;
  }
  return { covered, total };
}

function operabilityOf(A, C) {
  return Math.floor(10 * ((A + C) / (A + C + 3)));
}

function coverageOf(C1, C1Total, C2, C2Total) {
  return Math.floor(10 * (C1 / C1Total) * (C2 / C2Total));
}

/** The layer a relative origin path belongs to, or null (the frozen universe). */
function layerOf(rel) {
  for (const [layer, patterns] of Object.entries(LAYER_PATTERNS)) {
    if (patterns.some((re) => re.test(rel))) return layer;
  }
  return null;
}

/**
 * `floor(10 × covered/total × sections/members)`. A zero denominator scores 0:
 * an empty layer universe is a degenerate tree, not a division this proxy may
 * turn into NaN and then print as a score.
 */
function layerCoverage(covered, total, sections, members) {
  if (total === 0 || members === 0) return 0;
  return Math.floor(10 * (covered / total) * (sections / members));
}

/**
 * The two layer terms, derived from the claims gate's own output: its registry
 * rows (id prefix, `covered`, resolved section files) and its single origin walk
 * (`files`). Each `section.file` identity counts once per layer, and only when
 * the gate resolved it AND graded it a member of the row's declared family
 * (`inFamily === true`). A `SECTION_FILE_NOT_MEMBER` section is named by the
 * note but belongs to another family, so counting it would credit a layer with
 * members it never verified.
 */
function layerTerms(rows, files) {
  const members = { S: 0, R: 0 };
  for (const rel of files) {
    const layer = layerOf(rel);
    if (layer !== null) members[layer] += 1;
  }
  const total = { S: 0, R: 0 };
  const covered = { S: 0, R: 0 };
  const sections = { S: new Set(), R: new Set() };
  for (const row of rows) {
    const layer = typeof row.id === 'string' && /^[SR]/.test(row.id) ? row.id[0] : null;
    if (layer === null) continue;
    total[layer] += 1;
    if (row.covered) covered[layer] += 1;
    for (const s of row.sections ?? []) {
      if (s.inFamily === true && typeof s.file === 'string') sections[layer].add(s.file);
    }
  }
  return {
    S_members: members.S,
    S_sections: sections.S.size,
    R_members: members.R,
    R_sections: sections.R.size,
    coverage_script: layerCoverage(covered.S, total.S, sections.S.size, members.S),
    coverage_runtime: layerCoverage(covered.R, total.R, sections.R.size, members.R),
  };
}

/**
 * The live K member set under `kimiRoot`: counts the slots and names every
 * member by its CANONICAL identity — the same 53-member identity
 * `scripts/kimi-census.mjs` gates. A member file/dir is its path, a counted
 * dir's member is the live child path, and the `config.toml.*.bak` drift chain
 * is ONE identity however many generations exist. Only members that count
 * toward `K_members` are named, so the `K_sections` numerator and the
 * `K_members` denominator count the same universe. `byBasename` maps each
 * basename to the identities that own it: a basename owned by more than one
 * member is ambiguous and binds to none.
 */
const CHAIN_MEMBER = 'config.toml.*.bak';

function kMembers(kimiRoot) {
  const rootChildren = listChildren(kimiRoot);
  const identities = new Set();
  let members = 0;
  for (const m of K_MEMBER_RULES) {
    if (m.kind === 'chain') {
      const gens = rootChildren.filter((n) => RE_CHAIN.test(n));
      if (gens.length > 0) { members += 1; identities.add(CHAIN_MEMBER); }
      continue;
    }
    const abs = join(kimiRoot, m.path);
    const kind = lstatKind(abs);
    if (m.kind === 'counted') {
      if (kind === 'dir') {
        const kids = listChildren(abs);
        members += kids.length;
        for (const k of kids) identities.add(`${m.path}/${k}`);
      }
      continue;
    }
    const present = m.secret
      ? (m.kind === 'dir' ? kind === 'dir' : (kind !== 'absent' && kind !== 'dir'))
      : kind === m.kind;
    if (present) { members += 1; identities.add(m.path); }
  }
  const byBasename = new Map();
  for (const id of identities) {
    const b = basename(id);
    if (!byBasename.has(b)) byBasename.set(b, new Set());
    byBasename.get(b).add(id);
  }
  return { members, identities, byBasename };
}

/**
 * The K members this `## ` heading names, by canonical identity. A backticked
 * span, or a whitespace-separated token containing `/`, names a member when it
 * equals that member's full path — or, when it is not itself a member path,
 * when its basename is owned by exactly ONE member. A basename shared by more
 * than one member binds to none and is reported in `ambiguous` so the caller can
 * warn: a bare name that could mean two members must not credit either.
 */
function kMembersNamedByHeading(heading, kimi) {
  const tokens = [];
  for (const m of heading.matchAll(/`([^`]+)`/gu)) tokens.push(m[1]);
  for (const t of heading.split(/\s+/u)) if (t.includes('/')) tokens.push(t);
  const named = new Set();
  const ambiguous = new Set();
  for (const raw of tokens) {
    const tok = raw
      .replace(/^.*\.kimi-code\//u, '')
      .replace(/^[^\w~./-]+/u, '')
      .replace(/[^\w~./*-]+$/u, '')
      .replace(/\/+$/u, '');
    if (tok === '') continue;
    if (RE_CHAIN.test(tok)) { named.add(CHAIN_MEMBER); continue; }
    if (kimi.identities.has(tok)) { named.add(tok); continue; }
    const base = tok.split('/').filter(Boolean).pop() ?? '';
    if (base === '') continue;
    const owners = kimi.byBasename.get(base);
    if (owners === undefined) continue;
    if (owners.size > 1) { ambiguous.add(base); continue; }
    named.add([...owners][0]);
  }
  return { named, ambiguous };
}

/**
 * The `K_sections` numerator: how many DISTINCT K members the `## ` headings of
 * the `kimi-*.md` notes name — the same member counts once, however many
 * sections or notes name it (occurrence counts let one member be credited five
 * times). A heading whose only candidate is a basename shared by several
 * members names nothing and yields a `K_SECTION_AMBIGUOUS` warning.
 */
function kSections(self, kimi) {
  const dir = join(self, 'corpus', 'knowledge');
  const rels = walkFiles(dir).filter((r) => RE_KIMI_NOTE.test(basename(r))).sort();
  const named = new Set();
  const warnings = [];
  const seen = new Set();
  for (const rel of rels) {
    const text = readText(join(dir, rel));
    if (text === null) continue;
    for (const line of text.split('\n')) {
      const h = /^## (.+)$/u.exec(line);
      if (h === null) continue;
      const heading = h[1].trim();
      if (heading === '') continue;
      const hits = kMembersNamedByHeading(heading, kimi);
      for (const id of hits.named) named.add(id);
      for (const b of hits.ambiguous) {
        const key = `${rel}\u0000${heading}\u0000${b}`;
        if (seen.has(key)) continue;
        seen.add(key);
        warnings.push({
          severity: 'warn',
          kind: 'K_SECTION_AMBIGUOUS',
          term: b,
          detail: `${rel}: heading names \`${b}\`, a basename shared by `
            + `${[...kimi.byBasename.get(b)].sort().join(', ')} — binds to none`,
        });
      }
    }
  }
  return { count: named.size, warnings };
}

/** The five K terms, read live from the kimi root plus the scorecard's K rows. */
function kTerms({ scorecardText, self, kimi }) {
  const kreg = registryCounts(scorecardText, RE_K_ROW);
  const members = kimi.members;
  const sections = kSections(self, kimi);
  return {
    terms: {
      C1k: kreg.covered,
      C1k_total: kreg.total,
      K_members: members,
      K_sections: sections.count,
      coverage_kimi: layerCoverage(kreg.covered, kreg.total, sections.count, members),
    },
    warnings: sections.warnings,
  };
}

/** The seventeen counts + the five scores: legacy self-only, layer origin-walked, K root-counted. */
function deriveTerms({ self, scorecardText, skillText, readmeText, notes, probe, kimi }) {
  const A = walkFiles(self).filter((r) => RE_RUNNABLE.test(r)).length;
  const C = countLines(skillText, RE_CHECKLIST);
  const reg = registryCounts(scorecardText);
  const C2 = countLines(readmeText, RE_README_ROW);
  const C2Total = notes.length;
  const k = kTerms({ scorecardText, self, kimi });
  return {
    terms: {
      A,
      C,
      C1: reg.covered,
      C1_total: reg.total,
      C2,
      C2_total: C2Total,
      operability: operabilityOf(A, C),
      coverage: coverageOf(reg.covered, reg.total, C2, C2Total),
      ...layerTerms(probe.rows, probe.files),
      ...k.terms,
    },
    warnings: k.warnings,
  };
}

/* -------------------------------------------------------------------- stanza */

/**
 * Parse the single `kumitate-proxy-v1` claim block. Returns
 * `{ ok: true, values, line }` or `{ ok: false, kind, detail }` where `kind` is
 * one of the STANZA_* tokens (checked in the frozen order: block count,
 * terminator, body shape, unknown key, duplicate key, missing key, value shape).
 */
function parseStanza(scorecardText) {
  const lines = scorecardText.split('\n');
  const heads = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith(STANZA_HEAD)) heads.push(i);
  }
  if (heads.length === 0) {
    return { ok: false, kind: 'STANZA_MISSING', detail: `no "${STANZA_HEAD}" block in the scorecard` };
  }
  if (heads.length > 1) {
    return { ok: false, kind: 'STANZA_MALFORMED', detail: `${heads.length} "${STANZA_HEAD}" blocks (exactly 1 required, at lines ${heads.map((i) => i + 1).join(',')})` };
  }
  const start = heads[0];
  let end = -1;
  for (let i = start; i < lines.length; i++) {
    if (lines[i].includes('-->')) { end = i; break; }
  }
  if (end < 0) {
    return { ok: false, kind: 'STANZA_MALFORMED', detail: `block opened at line ${start + 1} is never terminated by "-->"` };
  }
  const values = new Map();
  for (let i = start + 1; i < end; i++) {
    const raw = lines[i].trim();
    if (raw === '') continue;
    const m = RE_STANZA_KV.exec(raw);
    if (!m) {
      return { ok: false, kind: 'STANZA_MALFORMED', detail: `line ${i + 1} is not key=value: ${JSON.stringify(lines[i])}` };
    }
    const [, key, value] = m;
    if (!STANZA_KEYS.includes(key)) {
      return { ok: false, kind: 'STANZA_KEY_UNKNOWN', detail: `line ${i + 1}: ${key} is not a ${CONTRACT} key` };
    }
    if (values.has(key)) {
      return { ok: false, kind: 'STANZA_KEY_DUPLICATE', detail: `line ${i + 1}: ${key} is declared twice` };
    }
    values.set(key, value);
  }
  const missing = STANZA_KEYS.filter((k) => !values.has(k));
  if (missing.length > 0) {
    return { ok: false, kind: 'STANZA_MALFORMED', detail: `missing key(s): ${missing.join(' ')}` };
  }
  for (const k of TERM_KEYS) {
    if (!RE_INT.test(values.get(k))) {
      return { ok: false, kind: 'STANZA_MALFORMED', detail: `${k}=${JSON.stringify(values.get(k))} is not a non-negative integer` };
    }
  }
  for (const k of Object.keys(PINS)) {
    if (!RE_HEX64.test(values.get(k))) {
      return { ok: false, kind: 'STANZA_MALFORMED', detail: `${k}=${JSON.stringify(values.get(k))} is not a 64-hex sha256` };
    }
  }
  return { ok: true, values: Object.fromEntries(values), line: start + 1 };
}

/**
 * Parse the optional, separate lane-owned gate-pin block. The v1 proxy stanza
 * remains a frozen 23-key contract; this block admits only the fixed gate keys
 * above and never changes v1 terms or pin accounting.
 */
function parseGatePins(scorecardText) {
  const lines = scorecardText.split('\n');
  const heads = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith(GATE_PIN_HEAD)) heads.push(i);
  }
  if (heads.length === 0) return { ok: true, values: {} };
  if (heads.length > 1) {
    return { ok: false, kind: 'GATE_PIN_MALFORMED',
      detail: `${heads.length} "${GATE_PIN_HEAD}" blocks (at lines ${heads.map((i) => i + 1).join(',')})` };
  }
  const start = heads[0];
  let end = -1;
  for (let i = start; i < lines.length; i++) {
    if (lines[i].includes('-->')) { end = i; break; }
  }
  if (end < 0) {
    return { ok: false, kind: 'GATE_PIN_MALFORMED',
      detail: `block opened at line ${start + 1} is never terminated by "-->"` };
  }
  const values = new Map();
  for (let i = start + 1; i < end; i++) {
    const raw = lines[i].trim();
    if (raw === '') continue;
    const m = RE_STANZA_KV.exec(raw);
    if (!m) {
      return { ok: false, kind: 'GATE_PIN_MALFORMED',
        detail: `line ${i + 1} is not key=value: ${JSON.stringify(lines[i])}` };
    }
    const [, key, value] = m;
    if (!Object.prototype.hasOwnProperty.call(GATE_PINS, key)) {
      return { ok: false, kind: 'GATE_PIN_KEY_UNKNOWN',
        detail: `line ${i + 1}: ${key} is not a ${GATE_PIN_CONTRACT} key` };
    }
    if (values.has(key) || !RE_HEX64.test(value)) {
      return { ok: false, kind: 'GATE_PIN_MALFORMED',
        detail: values.has(key) ? `line ${i + 1}: ${key} is declared twice`
          : `line ${i + 1}: ${key} is not a 64-hex sha256` };
    }
    values.set(key, value);
  }
  return { ok: true, values: Object.fromEntries(values) };
}

/* ------------------------------------------------------------------ compare */

function compareTerms(terms, declared, findings) {
  for (const key of TERM_KEYS) {
    const dec = Number.parseInt(declared[key], 10);
    const got = terms[key];
    if (dec === got) continue;
    const delta = got - dec;
    const deltaText = delta > 0 ? `+${delta}` : String(delta);
    findings.push({
      severity: 'error',
      kind: `${key.toUpperCase()}_DRIFT`,
      term: key,
      declared: dec,
      computed: got,
      delta: deltaText,
      detail: `${key}: declared=${dec} computed=${got} delta=${deltaText}`,
    });
  }
}

function comparePins(self, declared, findings) {
  const byKey = {};
  let matched = 0;
  for (const [key, rel] of Object.entries(PINS)) {
    const dec = declared[key];
    const computed = sha256File(join(self, rel));
    const match = computed !== null && computed === dec;
    if (match) matched += 1;
    byKey[key] = { file: rel, declared: dec, computed, match };
    if (match) continue;
    const got = computed ?? `absent (${rel} is ${statKind(join(self, rel))})`;
    findings.push({
      severity: 'error',
      kind: 'PIN_DRIFT',
      term: key,
      declared: dec,
      computed: got,
      detail: `${key}: declared=${dec} computed=${got}`,
    });
  }
  return { matched, total: Object.keys(PINS).length, byKey };
}

/** Verify pins in the independent gate-pin block, without changing v1 pin terms. */
function compareGatePins(self, declared, findings) {
  for (const [key, sha256] of Object.entries(declared)) {
    const rel = GATE_PINS[key];
    const file = join(self, rel);
    const computed = sha256File(file);
    if (computed === sha256) continue;
    const got = computed ?? `absent (${rel} is ${statKind(file)})`;
    findings.push({
      severity: 'error',
      kind: 'GATE_PIN_DRIFT',
      term: key,
      declared: sha256,
      computed: got,
      detail: `${key}: declared=${sha256} computed=${got}`,
    });
  }
}

/** Advisory: a `scripts/*.mjs` file no pin covers (pin coverage incomplete). */
function comparePinCoverage(self, findings, gatePins) {
  const dir = join(self, 'scripts');
  if (statKind(dir) !== 'dir') return;
  const pinned = new Set([...Object.values(PINS), ...Object.keys(gatePins).map((key) => GATE_PINS[key])]);
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.mjs')) continue;
    const rel = `scripts/${e.name}`;
    if (pinned.has(rel)) continue;
    findings.push({
      severity: 'warn',
      kind: 'PIN_UNPINNED',
      term: rel,
      detail: `${rel} has no pin.<name> key in the ${CONTRACT} or ${GATE_PIN_CONTRACT} stanza`,
    });
  }
}

/**
 * The `## Axes` section body: its heading to the next `#`/`##` line. Scoping
 * matters: an earlier table (a move log, a prior round's summary) can carry a
 * `| operability | N |` row, and an unscoped search would let that stale score
 * shadow the current axis row. Section absent ⇒ null ⇒ both axes read `absent`.
 */
function axesSection(scorecardText) {
  const lines = scorecardText.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^## Axes\b/.test(lines[i])) { start = i; break; }
  }
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,2} /.test(lines[i])) { end = i; break; }
  }
  return lines.slice(start, end).join('\n');
}

/** The derived scores must equal the scorecard's own `## Axes` integers. */
function compareAxes(scorecardText, terms, findings) {
  const section = axesSection(scorecardText);
  for (const { axis, term } of AXIS_ROWS) {
    const m = section === null
      ? null
      : new RegExp(`^\\|\\s*${escapeRe(axis)}\\s*\\|\\s*(\\d+)\\s*\\|`, 'm').exec(section);
    const declared = m ? Number.parseInt(m[1], 10) : null;
    const computed = terms[term];
    if (declared === computed) continue;
    findings.push({
      severity: 'error',
      kind: 'AXES_DRIFT',
      term: axis,
      key: term,
      declared: declared === null ? 'absent' : declared,
      computed,
      detail: `${axis}: ## Axes row=${declared === null ? (section === null ? 'no ## Axes section' : 'absent') : declared} derived=${computed}`,
    });
  }
}

function summarize(findings, strict) {
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warnings = findings.filter((f) => f.severity === 'warn').length;
  const drift = errors > 0 || (Boolean(strict) && warnings > 0);
  return { errors, warnings, verdict: drift ? 'DRIFT' : 'MATCH', exitCode: drift ? 1 : 0 };
}

/* ------------------------------------------------------------------- render */

function findingSummary(f) {
  const parts = [f.kind];
  if (f.term !== undefined) parts.push(`term=${f.term}`);
  if (f.declared !== undefined) parts.push(`declared=${f.declared}`);
  if (f.computed !== undefined) parts.push(`computed=${f.computed}`);
  if (f.delta !== undefined) parts.push(`delta=${f.delta}`);
  return parts.join(' ');
}

function renderVerdict(verdict, terms, pinStats, findings, srcRev) {
  const tail = srcRev ? `; src-rev=${srcRev.slice(0, 12)}` : '';
  if (verdict === 'MATCH') {
    return `PROXY: MATCH (A=${terms.A} C=${terms.C} operability=${terms.operability};`
      + ` C1=${terms.C1}/${terms.C1_total} C2=${terms.C2}/${terms.C2_total} coverage=${terms.coverage};`
      + ` S=${terms.S_sections}/${terms.S_members} coverage:script-layer=${terms.coverage_script};`
      + ` R=${terms.R_sections}/${terms.R_members} coverage:runtime-layer=${terms.coverage_runtime};`
      + ` K=${terms.K_sections}/${terms.K_members} coverage:kimi-layer=${terms.coverage_kimi};`
      + ` pins=${pinStats.matched} match${tail})`;
  }
  return `PROXY: DRIFT (${findings.map(findingSummary).join('; ')}${tail})`;
}

/* ------------------------------------------------------------ fail-closed */

function failClosed(opts, token, detail, terms, started) {
  const body = {
    contract: CONTRACT,
    mode: 'check',
    ok: false,
    verdict: 'FAIL-CLOSED',
    exitCode: 2,
    self: opts.self,
    scorecard: opts.scorecard,
    src: opts.src,
    pin: opts.pinInfo ?? null,
    srcRev: opts.srcRev ?? null,
    kimiRoot: opts.kimiRoot,
    strict: Boolean(opts.strict),
    terms: terms ?? {},
    findings: [{ severity: 'error', kind: token, detail }],
    errors: 1,
    warnings: 0,
    durationMs: Math.max(0, Date.now() - started),
  };
  process.stderr.write(`proxy-check: fail-closed — ${token}: ${detail}\n`);
  if (opts.json) process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
  else process.stdout.write(`PROXY: FAIL-CLOSED (${token}) ${detail}\n`);
  return 2;
}

/* -------------------------------------------------------------------- check */

function runCheck(opts, started) {
  if (statKind(opts.self) !== 'dir') {
    return failClosed(opts, 'SELF_NOT_A_DIR', `--self ${opts.self} is ${statKind(opts.self)}`, {}, started);
  }
  // The origin pin (PIN v1) resolves the tree this run scores and proves it is
  // the pinned revision BEFORE any term is counted on it: `--src`, else the
  // pin's clone, else the legacy `$UFO_SRC`/candidate default. With no pin the
  // resolution is exactly the pre-pin one (portability).
  const origin = resolveOrigin(opts);
  opts.src = origin.ok ? origin.src : (opts.src ?? null);
  opts.srcRev = origin.ok && origin.pin !== null ? origin.pin.srcRev : null;
  opts.pinInfo = origin.pin ?? null;
  if (!origin.ok) return failClosed(opts, origin.kind, origin.detail, {}, started);
  if (statKind(opts.src) !== 'dir') {
    return failClosed(opts, 'SRC_NOT_A_DIR', `--src ${opts.src} is ${statKind(opts.src)}`, {}, started);
  }
  if (statKind(opts.kimiRoot) !== 'dir') {
    return failClosed(opts, 'KIMI_ROOT_NOT_A_DIR',
      `--kimi-root ${opts.kimiRoot} is ${statKind(opts.kimiRoot)}`, {}, started);
  }
  try { readdirSync(opts.kimiRoot); } catch (e) {
    return failClosed(opts, 'KIMI_ROOT_NOT_A_DIR',
      `--kimi-root ${opts.kimiRoot} is unreadable (${e && e.code})`, {}, started);
  }
  const scorecardText = readText(opts.scorecard);
  if (scorecardText === null) {
    return failClosed(opts, 'SCORECARD_MISSING',
      `--scorecard ${opts.scorecard} is ${statKind(opts.scorecard)}`, {}, started);
  }
  const stanza = parseStanza(scorecardText);
  if (!stanza.ok) return failClosed(opts, stanza.kind, stanza.detail, {}, started);
  const gatePins = parseGatePins(scorecardText);
  if (!gatePins.ok) return failClosed(opts, gatePins.kind, gatePins.detail, {}, started);
  if (registryCounts(scorecardText).total === 0) {
    return failClosed(opts, 'REGISTRY_MISSING',
      `no "| S<n> |" or "| R<n> |" registry row in ${opts.scorecard}`, {}, started);
  }
  const skillText = readText(join(opts.self, SKILL_FILE));
  if (skillText === null) {
    return failClosed(opts, 'SKILL_MISSING',
      `${join(opts.self, SKILL_FILE)} is ${statKind(join(opts.self, SKILL_FILE))}`, {}, started);
  }
  const readmeText = readText(join(opts.self, CORPUS_README));
  if (readmeText === null) {
    return failClosed(opts, 'README_MISSING',
      `${join(opts.self, CORPUS_README)} is ${statKind(join(opts.self, CORPUS_README))}`, {}, started);
  }
  const notes = listCorpusNotes(opts.self);
  if (notes === null || notes.length === 0) {
    return failClosed(opts, 'CORPUS_DIRS_MISSING', notes === null
      ? `${CORPUS_DIRS.map((d) => join(opts.self, d)).join(' or ')} is not a directory`
      : `no *.md under ${CORPUS_DIRS.map((d) => join(opts.self, d)).join(' + ')} (C2 denominator would be 0)`,
    {}, started);
  }

  // The claims gate walks the origin tree once and hands back both its rows and
  // that walk; the layer terms are folded from those two, never from a second
  // traversal here. A refusal from it is this run's refusal (fail-closed).
  const probe = probeSections({ self: opts.self, scorecard: opts.scorecard, src: opts.src });
  if (!probe.ok) {
    const token = FAIL_CLOSED_KINDS.includes(probe.kind) ? probe.kind : 'INTERNAL_ERROR';
    return failClosed(opts, token, `claims gate refused: ${probe.detail}`, {}, started);
  }
  if (!Array.isArray(probe.files)) {
    return failClosed(opts, 'INTERNAL_ERROR',
      'scripts/claims-check.mjs probeSections() returned no origin file index (files[])', {}, started);
  }

  // The K terms count over the kimi root exactly once, in process: lstat on the
  // member paths, readdir on the root plus the two counted dirs, and the
  // `kimi-*.md` headings under `--self`. Never a second tree, never a shell-out.
  const kimi = kMembers(opts.kimiRoot);

  const derived = deriveTerms({
    self: opts.self, scorecardText, skillText, readmeText, notes, probe, kimi,
  });
  const terms = derived.terms;
  // The K-section ambiguity warnings come out of the derivation itself (the
  // notes are read once, there); the term comparisons append their own.
  const findings = [...derived.warnings];
  compareTerms(terms, stanza.values, findings);
  const pinStats = comparePins(opts.self, stanza.values, findings);
  compareGatePins(opts.self, gatePins.values, findings);
  compareAxes(scorecardText, terms, findings);
  comparePinCoverage(opts.self, findings, gatePins.values);
  const { errors, warnings, verdict, exitCode } = summarize(findings, opts.strict);

  const body = {
    contract: CONTRACT,
    mode: 'check',
    ok: verdict === 'MATCH',
    verdict,
    exitCode,
    self: opts.self,
    scorecard: opts.scorecard,
    src: opts.src,
    pin: opts.pinInfo ?? null,
    srcRev: opts.srcRev ?? null,
    kimiRoot: opts.kimiRoot,
    strict: Boolean(opts.strict),
    terms: {
      ...terms,
      pins: pinStats.byKey,
      pinsMatched: pinStats.matched,
      pinsTotal: pinStats.total,
      declared: stanza.values,
      stanzaLine: stanza.line,
    },
    findings,
    errors,
    warnings,
    durationMs: Math.max(0, Date.now() - started),
  };

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
  } else {
    const lines = findings.map((f) => `PROXY  ${f.severity}  ${f.kind}  ${f.detail}`);
    lines.push(renderVerdict(verdict, terms, pinStats, findings, opts.srcRev));
    process.stdout.write(`${lines.join('\n')}\n`);
  }
  return exitCode;
}

/* ----------------------------------------------------------------- selftest */

/** Fixture stand-ins for the six parent-pinned scripts (bytes only, never executed). */
const FIXTURE_SCRIPTS = ['cite-check.mjs', 'surface-probe.mjs', 'round-gate.mjs', 'proxy-check.mjs', 'claims-check.mjs', 'kimi-census.mjs'];
const fixtureScript = (name) => `#!/usr/bin/env node\n// hermetic fixture stand-in for scripts/${name}\nexport const FIXTURE = ${JSON.stringify(name)};\n`;
const FIXTURE_PINS = Object.fromEntries(FIXTURE_SCRIPTS.map((s) => [
  `pin.${s.replace(/\.mjs$/u, '')}`, sha256Hex(Buffer.from(fixtureScript(s), 'utf8')),
]));

/**
 * The fixture ORIGIN tree (`--src`): three script-layer members (one top-level
 * `.mjs`, one `.mjs` under a `scripts/` subdir, one non-`.mjs` under another —
 * the recursive arm) and two runtime-layer members (one per `src` dir), plus a
 * file in neither layer. `--self` never contains these, so the legacy `A` count
 * cannot absorb them.
 */
const FX_SRC_FILES = [
  'scripts/a.mjs',
  'scripts/lib/x.mjs',
  'scripts/lib/deep/y.sh',
  'crates/ufo-core-runtime/src/b.rs',
  'crates/ufo-cli/src/c.rs',
  'docs/readme.md',
];
const FX_SRC_MEMBER = 'MEMBER\nsecond line\n';

function fixtureSrc(root) {
  for (const rel of FX_SRC_FILES) {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, FX_SRC_MEMBER);
  }
}

/**
 * The fixture KIMI root (`--kimi-root`) is a hand-checkable subset; it omits
 * the new `locks/` member except in its dedicated member test. The two counted
 * dirs are seeded small (2 + 1 children): K1 4 + K2 (2+1+1+1)=5 + K3 9
 * + K4 9 + K5 3 = 30. The real tree holds 53 (18 + 7 skills); this fixture
 * is a shape, not a copy.
 */
const FX_KIMI_FILES = [
  'config.toml', 'tui.toml', 'config.toml.bak',
  'mcp.json',
  'agents/secondary/sec-a.md', 'agents/secondary/sec-b.md',
  'skills/skill-a',
  'plugins/installed.json',
  'session_index.jsonl', 'logs/kimi-code.log',
  'bin/kimi', 'bin/fd', 'server.token', 'device_id', 'region',
  'workspaces.json', 'tui.toml.bak', 'rc-qrcode.png',
];
const FX_KIMI_DIRS = [
  'plugins/managed/kimi-webbridge',
  'sessions', 'workspace-trust', 'telemetry', 'file-history', 'user-history',
  'cache', 'search-index', 'updates', 'server', 'credentials', 'oauth',
];

function fixtureKimi(root) {
  mkdirSync(join(root, 'skills'), { recursive: true });
  mkdirSync(join(root, 'plugins/managed'), { recursive: true });
  for (const rel of FX_KIMI_DIRS) mkdirSync(join(root, rel), { recursive: true });
  for (const rel of FX_KIMI_FILES) {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, 'fixture member\n');
  }
}

/** A `kimi-*.md` note: four member-named `## ` sections + one topic-form heading. */
const FX_KIMI_NOTE = '# kimi-alpha fixture note\n\n'
  + '## Scope — topic form\n\nprose\n\n'
  + '## `config.toml` — the global keys\n\nprose\n\n'
  + '## `~/.kimi-code/sessions/` — the store\n\nprose\n\n'
  + '## `plugins/managed/kimi-webbridge` — a managed plugin\n\nprose\n\n'
  + '## prose heading naming `cache/`\n\nprose\n';

/** The same note with one member section renamed to topic form (−1 section). */
const FX_KIMI_NOTE_RENAMED = FX_KIMI_NOTE
  .replace('## `~/.kimi-code/sessions/` — the store', '## The store, in prose');

/** The five K family rows, all `yes` — the fixture's C1k=5/5. */
const FX_K_ROWS = [
  ['K1', 'kimi config plane', '4', 'yes — `knowledge/kimi-alpha.md`'],
  ['K2', 'kimi delegate/lane plane', '25', 'yes — `knowledge/kimi-alpha.md`'],
  ['K3', 'kimi session/state plane', '9', 'yes — `knowledge/kimi-alpha.md`'],
  ['K4', 'kimi binary/secret plane', '9', 'yes — `knowledge/kimi-alpha.md`'],
  ['K5', 'kimi root-residue', '3', 'yes — `knowledge/kimi-alpha.md`'],
];

/** A member-section note body naming `rel` with a live own-file anchor + symbol. */
const fxLayerNote = (rel) => `## \`${rel}\`\n\nMember \`MEMBER\` at \`${rel}:1\`.\n`;

function fxSkill(checklist) {
  const items = [];
  for (let i = 1; i <= checklist; i++) items.push(`- [ ] fixture item ${i} — \`true\` → exit 0 + \`ok\``);
  return `# Fixture skill\n\nprose that is not a checklist line\n\n## Verifiable checklist\n\n${items.join('\n')}\n`;
}

function fxReadme(rows) {
  const lines = ['# Corpus map', '', '| Note | Covers | Notes |', '|---|---|---|'];
  for (let i = 1; i <= rows; i++) {
    const rel = i === rows && rows % 2 === 1 ? `lessons/note-${i}.md` : `knowledge/note-${i}.md`;
    lines.push(`| \`${rel}\` | fixture family | row ${i} |`);
  }
  lines.push('', 'prose line that is not a row\n');
  return `${lines.join('\n')}\n`;
}

/**
 * A scorecard whose stanza declares exactly the fixture's hand-written expected
 * numbers: the suite asserts the tool's verdict line against a literal string,
 * so a derivation change cannot be absorbed by a self-consistent fixture.
 */
function fxScorecard(fx) {
  const { expect, registry, gatePins } = fx;
  const lines = [
    '# Fixture scorecard', '',
    `#### In-scope surface registry (${registry.length} families)`, '',
    '| # | Family | Members (origin tree) | Corpus note |',
    '|---|---|---|---|',
  ];
  for (const [id, family, members, note] of registry) {
    lines.push(`| ${id} | ${family} | ${members} | ${note} |`);
  }
  lines.push(
    '', '## Axes', '',
    '| Axis | Score | Evidence pointer | Last change |',
    '|---|---|---|---|',
    `| operability | ${expect.operability} | fixture | round 11 |`,
    `| coverage | ${expect.coverage} | fixture | round 11 |`,
    `| coverage:script-layer | ${expect.coverage_script} | fixture | round 16 |`,
    `| coverage:runtime-layer | ${expect.coverage_runtime} | fixture | round 16 |`,
    `| coverage:kimi-layer | ${expect.coverage_kimi} | fixture | round 20 |`,
    '', STANZA_HEAD,
  );
  for (const k of TERM_KEYS) lines.push(`${k}=${expect[k]}`);
  for (const [k, v] of Object.entries(FIXTURE_PINS)) lines.push(`${k}=${v}`);
  lines.push('-->', '', GATE_PIN_HEAD);
  for (const [key, value] of Object.entries(gatePins)) lines.push(`${key}=${value}`);
  lines.push('-->', '');
  return `${lines.join('\n')}\n`;
}

/**
 * The repository-locating variables printed by `git rev-parse --local-env-vars`
 * (Git 2.56.0). git(1) (S065): they select the repository a git command acts on,
 * and a Node child_process `env` defaults to `process.env` (S078), so a caller's GIT_DIR
 * would redirect every fixture git writer and child CLI of `--selftest`.
 */
const GIT_LOCAL_ENV_VARS = [
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_CONFIG', 'GIT_CONFIG_PARAMETERS', 'GIT_CONFIG_COUNT',
  'GIT_OBJECT_DIRECTORY', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_IMPLICIT_WORK_TREE', 'GIT_GRAFT_FILE',
  'GIT_INDEX_FILE', 'GIT_NO_REPLACE_OBJECTS', 'GIT_REPLACE_REF_BASE', 'GIT_PREFIX', 'GIT_SHALLOW_FILE',
  'GIT_COMMON_DIR',
];
function scrubGitLocalEnv() {
  for (const k of GIT_LOCAL_ENV_VARS) delete process.env[k];
}

function selfTest() {
  scrubGitLocalEnv();
  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-proxy-selftest-'));
  const results = [];
  const observed = new Set();
  const observedFc = new Set();
  const check = (name, fn) => {
    try {
      const r = fn();
      results.push({ name, ok: Boolean(r.ok), skipped: Boolean(r.skipped), detail: String(r.detail ?? '') });
    } catch (e) {
      results.push({ name, ok: false, detail: `threw: ${e && e.message ? e.message : e}` });
    }
  };

  const SELF = fileURLToPath(import.meta.url);
  let seq = 0;
  const fxDir = (name) => {
    seq += 1;
    const d = join(tmp, `${String(seq).padStart(2, '0')}-${name}`);
    mkdirSync(d, { recursive: true });
    return d;
  };
  const fxWrite = (p, text) => {
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, text);
  };
  const runProxy = (args, extraEnv = {}) => spawnSync(process.execPath, [SELF, ...args], {
    encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024, env: { ...process.env, ...extraEnv },
  });
  const verdictLine = (res) => String(res.stdout ?? '').trim().split('\n').filter(Boolean).at(-1) ?? '';
  const parseFindings = (stdout) => String(stdout ?? '').split('\n')
    .map((l) => /^PROXY  (error|warn)  ([A-Z0-9_]+)  (.*)$/u.exec(l))
    .filter(Boolean)
    .map((m) => { observed.add(m[2]); return { severity: m[1], kind: m[2], detail: m[3] }; });
  const kindsEq = (res, expected) => {
    const got = parseFindings(res.stdout).map((f) => f.kind);
    return { ok: JSON.stringify(got) === JSON.stringify(expected), got };
  };
  const fcToken = (res) => {
    const m = /^PROXY: FAIL-CLOSED \(([A-Z_]+)\)/u.exec(verdictLine(res));
    if (m) observedFc.add(m[1]);
    return m ? m[1] : null;
  };

  /* fixtures -------------------------------------------------------------- */
  const fxBase = (name, knobs = {}) => {
    const dir = fxDir(name);
    const src = fxDir(`${name}-src`);
    fixtureSrc(src);
    const kimi = knobs.kimiRoot === false ? null : fxDir(`${name}-kimi`);
    if (kimi !== null) fixtureKimi(kimi);
    const scripts = knobs.scripts ?? FIXTURE_SCRIPTS;
    const checklist = knobs.checklist ?? 3;
    const readmeRows = knobs.readmeRows ?? 2;
    const notes = knobs.notes ?? ['knowledge/alpha.md', 'lessons/beta.md'];
    const registry = knobs.registry ?? [['S1', 'alpha', '`a.mjs`', 'yes — alpha note'], ['R1', 'beta', '`b.rs`', 'no']];
    for (const s of scripts) fxWrite(join(dir, 'scripts', s), fixtureScript(s));
    const gatePinNames = knobs.gatePins ?? [];
    for (const name of gatePinNames) {
      const file = `${name}.mjs`;
      fxWrite(join(dir, 'scripts', file), fixtureScript(file));
    }
    const gatePins = Object.fromEntries(gatePinNames.map((name) => [
      `pin.${name}`, sha256Hex(Buffer.from(fixtureScript(`${name}.mjs`), 'utf8')),
    ]));
    for (const rel of knobs.extraRunnables ?? []) fxWrite(join(dir, rel), '#!/bin/sh\nexit 0\n');
    fxWrite(join(dir, 'notes.txt'), 'not runnable\n');
    fxWrite(join(dir, '.git', 'junk.mjs'), '// must never be counted\n');
    fxWrite(join(dir, SKILL_FILE), fxSkill(checklist));
    fxWrite(join(dir, CORPUS_README), fxReadme(readmeRows));
    for (const entry of notes) {
      const [rel, body] = Array.isArray(entry) ? entry : [entry, `# ${entry}\n\nfixture note\n`];
      fxWrite(join(dir, `corpus/${rel}`), body);
    }
    // Hand-arithmetic defaults for the five K terms: the fixture kimi root holds
    // 30 members (4+5+9+9+3), the base notes name none of them, and the base
    // registry has no K rows. A K-specific fixture overrides what it moves.
    const fx = {
      dir, src, kimi, checklist, readmeRows, notes, registry, gatePins,
      expect: { C1k: 0, C1k_total: 0, K_members: 30, K_sections: 0, coverage_kimi: 0, ...knobs.expect },
    };
    if (knobs.scorecard !== false) fx.scorecard = fxScorecard(fx);
    if (fx.scorecard !== undefined) fxWrite(join(dir, SCORECARD_FILE), fx.scorecard);
    return fx;
  };
  const args = (fx, extra = []) => {
    const base = ['--self', fx.dir, '--src', fx.src];
    const kimiRoot = fx.kimi ?? join(fx.dir, '..', 'no-kimi-root');
    const withKimi = ['--kimi-root', kimiRoot, ...base];
    // An explicit `--kimi-root` in `extra` wins: parseArgs reads left to right.
    return extra.includes('--kimi-root') ? [...base, ...extra] : [...withKimi, ...extra];
  };

  /* hand-arithmetic fixtures (literal assertions below, never re-derived) --- */
  const F1 = fxBase('match-basic', {
    expect: {
      A: 6, C: 3, C1: 1, C1_total: 2, C2: 2, C2_total: 2, operability: 7, coverage: 5,
      S_members: 3, S_sections: 0, R_members: 2, R_sections: 0, coverage_script: 0, coverage_runtime: 0,
    },
  });
  const F2 = fxBase('match-low', {
    checklist: 1, readmeRows: 1,
    registry: [['S1', 'a', '`a.mjs`', 'yes'], ['S2', 'b', '`b.mjs`', 'yes'], ['R1', 'c', '`c.rs`', 'no']],
    expect: {
      A: 6, C: 1, C1: 2, C1_total: 3, C2: 1, C2_total: 2, operability: 7, coverage: 3,
      S_members: 3, S_sections: 0, R_members: 2, R_sections: 0, coverage_script: 0, coverage_runtime: 0,
    },
  });
  const F3 = fxBase('match-saturated', {
    checklist: 3, readmeRows: 3,
    notes: [
      ['knowledge/a.md', fxLayerNote('scripts/a.mjs')],
      ['knowledge/b.md', fxLayerNote('scripts/lib/x.mjs')],
      ['lessons/c.md', fxLayerNote('crates/ufo-core-runtime/src/b.rs')],
    ],
    registry: [
      ['S1', 'a', '`a.mjs`', 'yes — `knowledge/a.md`'],
      ['S2', 'b', '`x.mjs`', 'yes — `knowledge/b.md`'],
      ['R1', 'c', '`b.rs`', 'yes — `lessons/c.md`'],
    ],
    extraRunnables: ['tools/a.mjs', 'tools/b.js', 'bin/c.sh', 'vendor/d.py', 'vendor/e.mjs'],
    expect: {
      A: 11, C: 3, C1: 3, C1_total: 3, C2: 3, C2_total: 3, operability: 8, coverage: 10,
      S_members: 3, S_sections: 2, R_members: 2, R_sections: 1, coverage_script: 6, coverage_runtime: 5,
    },
  });

  try {
    /* 1-3 ─ MATCH, against literal verdict lines (hand arithmetic) ---------- */
    const r1 = runProxy(args(F1));
    check('MATCH: A=6 C=3 operability=7; C1=1/2 C2=2/2 coverage=5 (literal verdict)', () => ({
      ok: r1.status === 0
        && verdictLine(r1) === 'PROXY: MATCH (A=6 C=3 operability=7; C1=1/2 C2=2/2 coverage=5; S=0/3 coverage:script-layer=0; R=0/2 coverage:runtime-layer=0; K=0/30 coverage:kimi-layer=0; pins=6 match)',
      detail: `exit=${r1.status} ${verdictLine(r1)}`,
    }));
    check('MATCH: text mode prints the verdict line and nothing else', () => {
      const lines = String(r1.stdout ?? '').trim().split('\n');
      return { ok: lines.length === 1 && parseFindings(r1.stdout).length === 0, detail: `lines=${lines.length}` };
    });
    const r2 = runProxy(args(F2));
    check('MATCH: A=6 C=1 operability=7; C1=2/3 C2=1/2 coverage=3 (literal verdict)', () => ({
      ok: r2.status === 0
        && verdictLine(r2) === 'PROXY: MATCH (A=6 C=1 operability=7; C1=2/3 C2=1/2 coverage=3; S=0/3 coverage:script-layer=0; R=0/2 coverage:runtime-layer=0; K=0/30 coverage:kimi-layer=0; pins=6 match)',
      detail: `exit=${r2.status} ${verdictLine(r2)}`,
    }));
    const r3 = runProxy(args(F3));
    check('MATCH: A=11 C=3 operability=8 (floor(10×0.8)); C1=3/3 C2=3/3 coverage=10; S=2/3 layer 6; R=1/2 layer 5', () => ({
      ok: r3.status === 0
        && verdictLine(r3) === 'PROXY: MATCH (A=11 C=3 operability=8; C1=3/3 C2=3/3 coverage=10; S=2/3 coverage:script-layer=6; R=1/2 coverage:runtime-layer=5; K=0/30 coverage:kimi-layer=0; pins=6 match)',
      detail: `exit=${r3.status} ${verdictLine(r3)}`,
    }));
    check('A excludes `.git` trees and non-runnable files (.git/junk.mjs, notes.txt)', () => ({
      ok: verdictLine(r3).includes('A=11'),
      detail: `fixture has ${FIXTURE_SCRIPTS.length} scripts + 5 runnables outside scripts/ + .git/junk.mjs + notes.txt → A=11`,
    }));
    const r1b = runProxy(args(F1));
    check('determinism: the same fixture yields byte-identical stdout on a re-run', () => ({
      ok: String(r1.stdout ?? '') === String(r1b.stdout ?? ''),
      detail: `len=${String(r1.stdout ?? '').length}`,
    }));

    /* 4-6 ─ flags on a clean tree ------------------------------------------ */
    const r4 = runProxy(args(F1, ['--strict']));
    check('--strict on a MATCH tree stays exit 0 (no warnings to promote)', () => ({
      ok: r4.status === 0 && verdictLine(r4) === verdictLine(r1), detail: `exit=${r4.status}`,
    }));
    const r5 = runProxy(['-h']);
    check('-h → exit 0, USAGE on stdout naming the contract and the modes', () => ({
      ok: r5.status === 0 && /usage: node scripts\/proxy-check\.mjs/u.test(r5.stdout)
        && r5.stdout.includes(CONTRACT) && r5.stdout.includes('--selftest') && String(r5.stderr ?? '') === '',
      detail: `exit=${r5.status} stderr=${JSON.stringify(String(r5.stderr ?? '').slice(0, 40))}`,
    }));
    const r6 = runProxy(['--help']);
    check('--help → exit 0, same USAGE text as -h', () => ({
      ok: r6.status === 0 && String(r6.stdout) === String(r5.stdout), detail: `exit=${r6.status}`,
    }));

    /* 7-12 ─ --json --------------------------------------------------------- */
    const j1 = runProxy(args(F1, ['--json']));
    check('--json MATCH: contract/mode/ok/terms/findings + computed terms', () => {
      const j = JSON.parse(j1.stdout);
      return {
        ok: j1.status === 0 && j.contract === CONTRACT && j.mode === 'check' && j.ok === true
          && j.verdict === 'MATCH' && Array.isArray(j.findings) && j.findings.length === 0
          && j.terms.A === FIXTURE_SCRIPTS.length && j.terms.C === 3 && j.terms.C1 === 1 && j.terms.C1_total === 2
          && j.terms.C2 === 2 && j.terms.C2_total === 2 && j.terms.operability === 7 && j.terms.coverage === 5
          && j.terms.S_members === 3 && j.terms.S_sections === 0 && j.terms.coverage_script === 0
          && j.terms.R_members === 2 && j.terms.R_sections === 0 && j.terms.coverage_runtime === 0
          && j.terms.C1k === 0 && j.terms.C1k_total === 0 && j.terms.K_members === 30
          && j.terms.K_sections === 0 && j.terms.coverage_kimi === 0 && j.kimiRoot === F1.kimi
          && j.terms.declared.S_sections === '0' && j.terms.declared.coverage_script === '0'
          && j.terms.declared.C1k_total === '0' && j.terms.declared.K_members === '30'
          && j.terms.declared.coverage_kimi === '0'
          && j.terms.pinsMatched === FIXTURE_SCRIPTS.length && j.terms.pinsTotal === FIXTURE_SCRIPTS.length
          && Object.keys(j.terms.pins).every((k) => j.terms.pins[k].match === true),
        detail: `exit=${j1.status} terms=${JSON.stringify({ A: j.terms.A, C: j.terms.C, op: j.terms.operability, cov: j.terms.coverage, S: `${j.terms.S_sections}/${j.terms.S_members}`, R: `${j.terms.R_sections}/${j.terms.R_members}`, K: `${j.terms.K_sections}/${j.terms.K_members}` })}`,
      };
    });

    /* 12b-12j ─ the two layer terms (round-16 amendment) ------------------- */
    const j3 = runProxy(args(F3, ['--json']));
    check('layer terms: S=2/3 R=1/2 from the claims gate walk; coverage_script=6 coverage_runtime=5', () => {
      const t = JSON.parse(j3.stdout).terms;
      return {
        ok: j3.status === 0
          && t.S_members === 3 && t.S_sections === 2 && t.R_members === 2 && t.R_sections === 1
          && t.coverage_script === 6 && t.coverage_runtime === 5
          && t.declared.S_members === '3' && t.declared.coverage_runtime === '5',
        detail: `exit=${j3.status} S=${t.S_sections}/${t.S_members} script=${t.coverage_script} R=${t.R_sections}/${t.R_members} runtime=${t.coverage_runtime}`,
      };
    });
    check('layer terms are declared integers in the stanza (all seventeen TERM_KEYS compared)', () => ({
      ok: TERM_KEYS.length === 17 && TERM_KEYS.includes('coverage_script') && TERM_KEYS.includes('R_sections')
        && TERM_KEYS.includes('coverage_kimi') && TERM_KEYS.includes('K_members'),
      detail: `TERM_KEYS=${TERM_KEYS.join(' ')}`,
    }));
    const parentV1Keys = 'A C C1 C1_total C2 C2_total S_members S_sections R_members R_sections coverage_script coverage_runtime C1k C1k_total K_members K_sections coverage_kimi pin.cite-check pin.surface-probe pin.round-gate pin.proxy-check pin.claims-check pin.kimi-census';
    check('parent-frozen v1 parser accepts its unchanged 23-key base stanza', () => ({
      ok: STANZA_KEYS.join(' ') === parentV1Keys && r1.status === 0
        && !F1.scorecard.includes('pin.sources-check='),
      detail: `keys=${STANZA_KEYS.length} baseKeysMatch=${STANZA_KEYS.join(' ') === parentV1Keys} accepted=${r1.status === 0}`,
    }));

    // A four-row, two-note-per-layer fixture: the S/R prefix split and the
    // section numerator are both exercised (S1/R1 section-form, S2/R2 topic).
    const LAYER_KNOBS = {
      checklist: 3,
      readmeRows: 4,
      notes: [
        ['knowledge/alpha.md', fxLayerNote('scripts/a.mjs')],
        ['knowledge/topic-s.md', '# topic-s.md\n\ntopic-form note\n'],
        ['lessons/beta.md', fxLayerNote('crates/ufo-core-runtime/src/b.rs')],
        ['lessons/topic-r.md', '# topic-r.md\n\ntopic-form note\n'],
      ],
      registry: [
        ['S1', 'scripts one', '`a.mjs`', 'yes — `knowledge/alpha.md`'],
        ['S2', 'scripts two', '`b.mjs`', 'yes — `knowledge/topic-s.md`'],
        ['R1', 'runtime one', '`b.rs`', 'yes — `lessons/beta.md`'],
        ['R2', 'runtime two', '`c.rs`', 'yes — `lessons/topic-r.md`'],
      ],
      expect: {
        A: 6, C: 3, C1: 4, C1_total: 4, C2: 4, C2_total: 4, operability: 7, coverage: 10,
        S_members: 3, S_sections: 1, R_members: 2, R_sections: 1, coverage_script: 3, coverage_runtime: 5,
      },
    };
    const layers = fxBase('layer-rows', LAYER_KNOBS);
    const layersRun = runProxy(args(layers));
    check('layer MATCH: `S=1/3 coverage:script-layer=3; R=1/2 coverage:runtime-layer=5` (literal)', () => ({
      ok: layersRun.status === 0
        && verdictLine(layersRun) === 'PROXY: MATCH (A=6 C=3 operability=7; C1=4/4 C2=4/4 coverage=10; S=1/3 coverage:script-layer=3; R=1/2 coverage:runtime-layer=5; K=0/30 coverage:kimi-layer=0; pins=6 match)',
      detail: `exit=${layersRun.status} ${verdictLine(layersRun)}`,
    }));
    const layerCase = (name, edits) => {
      const fx = fxBase(name, LAYER_KNOBS);
      let text = fx.scorecard;
      for (const [from, to] of edits) text = text.replace(from, to);
      fxWrite(join(fx.dir, SCORECARD_FILE), text);
      return fx;
    };
    const layerDrift = (name, edits, expected) => check(`layer drift: ${name} → [${expected.join()}]`, () => {
      const res = runProxy(args(layerCase(name, edits)));
      const k = kindsEq(res, expected);
      return {
        ok: res.status === 1 && k.ok,
        detail: `exit=${res.status} kinds=[${k.got}] ${verdictLine(res).slice(0, 120)}`,
      };
    });
    // Every source row initially has one member section. The focused variants
    // duplicate one file's section and remove another's, keeping occurrences at
    // two while the DISTINCT file count is one.
    const DISTINCT_LAYER_KNOBS = {
      ...LAYER_KNOBS,
      notes: [
        ['knowledge/alpha.md', fxLayerNote('scripts/a.mjs')],
        ['knowledge/topic-s.md', fxLayerNote('scripts/lib/x.mjs')],
        ['lessons/beta.md', fxLayerNote('crates/ufo-core-runtime/src/b.rs')],
        ['lessons/topic-r.md', fxLayerNote('crates/ufo-cli/src/c.rs')],
      ],
      registry: [
        ['S1', 'scripts one', '`a.mjs`', 'yes — `knowledge/alpha.md`'],
        ['S2', 'scripts two', '`x.mjs`', 'yes — `knowledge/topic-s.md`'],
        ['R1', 'runtime one', '`b.rs`', 'yes — `lessons/beta.md`'],
        ['R2', 'runtime two', '`c.rs`', 'yes — `lessons/topic-r.md`'],
      ],
      expect: {
        ...LAYER_KNOBS.expect,
        S_sections: 2, R_sections: 2, coverage_script: 6, coverage_runtime: 10,
      },
    };
    const duplicateDropLayerCase = (name, layer) => {
      const sectionKey = `${layer}_sections`;
      const coverageKey = layer === 'S' ? 'coverage_script' : 'coverage_runtime';
      const duplicateFile = layer === 'S' ? 'scripts/a.mjs' : 'crates/ufo-core-runtime/src/b.rs';
      const duplicateNote = layer === 'S' ? 'knowledge/alpha.md' : 'lessons/beta.md';
      const droppedNote = layer === 'S' ? 'knowledge/topic-s.md' : 'lessons/topic-r.md';
      const expectedCoverage = layer === 'S' ? 3 : 5;
      const fx = fxBase(name, {
        ...DISTINCT_LAYER_KNOBS,
        expect: {
          ...DISTINCT_LAYER_KNOBS.expect,
          [sectionKey]: 1,
          [coverageKey]: expectedCoverage,
        },
      });
      fxWrite(join(fx.dir, 'corpus', duplicateNote),
        `${fxLayerNote(duplicateFile)}\n${fxLayerNote(duplicateFile)}`);
      fxWrite(join(fx.dir, 'corpus', droppedNote), '# topic note\n\nthe other member section was removed\n');
      const scorecard = fx.scorecard.replace(`\n${sectionKey}=1\n`, `\n${sectionKey}=2\n`);
      fx.scorecard = scorecard;
      fxWrite(join(fx.dir, SCORECARD_FILE), scorecard);
      return fx;
    };
    check('distinct S sections: duplicate one member + drop another keeps 2 occurrences; declaring 2 fires S_SECTIONS_DRIFT', () => {
      const res = runProxy(args(duplicateDropLayerCase('s-sections-duplicate-drop', 'S')));
      const k = kindsEq(res, ['S_SECTIONS_DRIFT']);
      return {
        ok: res.status === 1 && k.ok
          && verdictLine(res) === 'PROXY: DRIFT (S_SECTIONS_DRIFT term=S_sections declared=2 computed=1 delta=-1)',
        detail: `exit=${res.status} occurrences=2 distinct=1 kinds=[${k.got}] ${verdictLine(res)}`,
      };
    });
    check('distinct R sections: duplicate one member + drop another keeps 2 occurrences; declaring 2 fires R_SECTIONS_DRIFT', () => {
      const res = runProxy(args(duplicateDropLayerCase('r-sections-duplicate-drop', 'R')));
      const k = kindsEq(res, ['R_SECTIONS_DRIFT']);
      return {
        ok: res.status === 1 && k.ok
          && verdictLine(res) === 'PROXY: DRIFT (R_SECTIONS_DRIFT term=R_sections declared=2 computed=1 delta=-1)',
        detail: `exit=${res.status} occurrences=2 distinct=1 kinds=[${k.got}] ${verdictLine(res)}`,
      };
    });
    check('distinct control: 3 section occurrences naming 2 files match the declared distinct count with no layer drift', () => {
      const fx = fxBase('distinct-sections-control', DISTINCT_LAYER_KNOBS);
      fxWrite(join(fx.dir, 'corpus/knowledge/alpha.md'),
        `${fxLayerNote('scripts/a.mjs')}\n${fxLayerNote('scripts/a.mjs')}`);
      const res = runProxy(args(fx, ['--json']));
      const j = JSON.parse(res.stdout);
      return {
        ok: res.status === 0 && j.verdict === 'MATCH' && j.findings.length === 0
          && j.terms.S_sections === 2 && j.terms.coverage_script === 6
          && j.terms.R_sections === 2 && j.terms.coverage_runtime === 10,
        detail: `exit=${res.status} S occurrences=3 distinct=${j.terms.S_sections} R=${j.terms.R_sections} findings=${j.findings.length}`,
      };
    });
    // Round-35 falsify wave (mutation seat): identity is the canonical file per
    // LAYER — one member credited by two rows, or named by two heading
    // spellings, still counts once.
    check('distinct across rows: one S member sectioned under two rows whose families both admit it counts once', () => {
      const fx = fxBase('distinct-sections-cross-row', {
        ...DISTINCT_LAYER_KNOBS,
        registry: [
          ['S1', 'scripts one', '`a.mjs`', 'yes — `knowledge/alpha.md`'],
          ['S2', 'scripts two', '`a.mjs` `x.mjs`', 'yes — `knowledge/topic-s.md`'],
          ['R1', 'runtime one', '`b.rs`', 'yes — `lessons/beta.md`'],
          ['R2', 'runtime two', '`c.rs`', 'yes — `lessons/topic-r.md`'],
        ],
      });
      fxWrite(join(fx.dir, 'corpus/knowledge/topic-s.md'), fxLayerNote('scripts/a.mjs'));
      const res = runProxy(args(fx, ['--json']));
      const j = JSON.parse(res.stdout);
      return {
        ok: j.terms.S_sections === 1 && j.terms.R_sections === 2,
        detail: `exit=${res.status} S distinct=${j.terms.S_sections} (rows S1+S2 both name scripts/a.mjs) R=${j.terms.R_sections}`,
      };
    });
    check('distinct across heading spellings: `a.mjs` and `scripts/a.mjs` headings resolving to one file count once', () => {
      const fx = fxBase('distinct-sections-heading-alias', DISTINCT_LAYER_KNOBS);
      fxWrite(join(fx.dir, 'corpus/knowledge/alpha.md'),
        `${fxLayerNote('scripts/a.mjs')}\n## \`a.mjs\`\n\nMember \`MEMBER\` at \`scripts/a.mjs:1\`.\n`);
      const res = runProxy(args(fx, ['--json']));
      const j = JSON.parse(res.stdout);
      return {
        ok: res.status === 0 && j.verdict === 'MATCH' && j.terms.S_sections === 2,
        detail: `exit=${res.status} S distinct=${j.terms.S_sections} (alias heading + x.mjs) findings=${j.findings.length}`,
      };
    });
    // The stanza values are doctored one key at a time: every other term must
    // stay silent, which is what makes each case evidence for its own key.
    layerDrift('s-members', [['\nS_members=3\n', '\nS_members=4\n']], ['S_MEMBERS_DRIFT']);
    layerDrift('s-sections', [['\nS_sections=1\n', '\nS_sections=2\n']], ['S_SECTIONS_DRIFT']);
    layerDrift('r-members', [['\nR_members=2\n', '\nR_members=3\n']], ['R_MEMBERS_DRIFT']);
    layerDrift('r-sections', [['\nR_sections=1\n', '\nR_sections=2\n']], ['R_SECTIONS_DRIFT']);
    const S2_OFF = ['| S2 | scripts two | `b.mjs` | yes — `knowledge/topic-s.md` |', '| S2 | scripts two | `b.mjs` | no — `knowledge/topic-s.md` |'];
    const R2_OFF = ['| R2 | runtime two | `c.rs` | yes — `lessons/topic-r.md` |', '| R2 | runtime two | `c.rs` | no — `lessons/topic-r.md` |'];
    layerDrift('coverage-script', [
      S2_OFF, ['\nC1=4\n', '\nC1=3\n'], ['\ncoverage=10\n', '\ncoverage=7\n'],
      ['| coverage | 10 |', '| coverage | 7 |'],
      ['| coverage:script-layer | 3 |', '| coverage:script-layer | 1 |'],
    ], ['COVERAGE_SCRIPT_DRIFT']);
    layerDrift('coverage-runtime', [
      R2_OFF, ['\nC1=4\n', '\nC1=3\n'], ['\ncoverage=10\n', '\ncoverage=7\n'],
      ['| coverage | 10 |', '| coverage | 7 |'],
      ['| coverage:runtime-layer | 5 |', '| coverage:runtime-layer | 2 |'],
    ], ['COVERAGE_RUNTIME_DRIFT']);
    check('a layer row going `no` moves its own score (S2 off ⇒ script 3→1, runtime stays 5)', () => {
      const fx = layerCase('coverage-script-axes', [
        S2_OFF, ['\nC1=4\n', '\nC1=3\n'], ['\ncoverage=10\n', '\ncoverage=7\n'],
        ['| coverage | 10 |', '| coverage | 7 |'],
        ['| coverage:script-layer | 3 |', '| coverage:script-layer | 1 |'],
        ['\ncoverage_script=3\n', '\ncoverage_script=1\n'],
      ]);
      const j = JSON.parse(runProxy(args(fx, ['--json'])).stdout);
      return {
        ok: j.verdict === 'MATCH' && j.terms.coverage_script === 1 && j.terms.coverage_runtime === 5
          && j.terms.C1 === 3 && j.terms.S_sections === 1,
        detail: `verdict=${j.verdict} script=${j.terms.coverage_script} runtime=${j.terms.coverage_runtime} C1=${j.terms.C1}`,
      };
    });
    check('an R row going `no` drops only the runtime score (R2 off ⇒ runtime 5→2, script stays 3)', () => {
      const fx = layerCase('coverage-runtime-axes', [
        R2_OFF, ['\nC1=4\n', '\nC1=3\n'], ['\ncoverage=10\n', '\ncoverage=7\n'],
        ['| coverage | 10 |', '| coverage | 7 |'],
        ['| coverage:runtime-layer | 5 |', '| coverage:runtime-layer | 2 |'],
        ['\ncoverage_runtime=5\n', '\ncoverage_runtime=2\n'],
      ]);
      const j = JSON.parse(runProxy(args(fx, ['--json'])).stdout);
      return {
        ok: j.verdict === 'MATCH' && j.terms.coverage_script === 3 && j.terms.coverage_runtime === 2 && j.terms.R_sections === 1,
        detail: `verdict=${j.verdict} script=${j.terms.coverage_script} runtime=${j.terms.coverage_runtime}`,
      };
    });
    const xFamily = fxBase('layer-out-of-family', {
      readmeRows: 2,
      notes: [
        ['knowledge/alpha.md', fxLayerNote('scripts/lib/x.mjs')],
        ['lessons/topic.md', '# topic.md\n\nprose note, no member section\n'],
      ],
      registry: [['S1', 'scripts one', '`a.mjs`', 'yes — `knowledge/alpha.md`']],
      expect: {
        A: 6, C: 3, C1: 1, C1_total: 1, C2: 2, C2_total: 2, operability: 7, coverage: 10,
        S_members: 3, S_sections: 1, R_members: 2, R_sections: 0, coverage_script: 0, coverage_runtime: 0,
      },
    });
    const xFamilyRun = runProxy(args(xFamily));
    check('out-of-family section is NOT counted: `scripts/lib/x.mjs` under S1 (`a.mjs`) ⇒ S_sections 0', () => {
      const k = kindsEq(xFamilyRun, ['S_SECTIONS_DRIFT']);
      return {
        ok: xFamilyRun.status === 1 && k.ok
          && verdictLine(xFamilyRun) === 'PROXY: DRIFT (S_SECTIONS_DRIFT term=S_sections declared=1 computed=0 delta=-1)',
        detail: `exit=${xFamilyRun.status} kinds=[${k.got}] ${verdictLine(xFamilyRun)}`,
      };
    });
    check('AXES_DRIFT covers the two successor rows (term=axis name, key=term key)', () => {
      const fx = fxBase('axes-layer-drift', LAYER_KNOBS);
      fxWrite(join(fx.dir, SCORECARD_FILE), fx.scorecard.replace('| coverage:runtime-layer | 5 |', '| coverage:runtime-layer | 4 |'));
      const res = runProxy(args(fx, ['--json']));
      const j = JSON.parse(res.stdout);
      const f = j.findings[0] ?? {};
      return {
        ok: res.status === 1 && j.findings.length === 1 && f.kind === 'AXES_DRIFT'
          && f.term === 'coverage:runtime-layer' && f.key === 'coverage_runtime' && f.declared === 4 && f.computed === 5,
        detail: `exit=${res.status} findings=${JSON.stringify(j.findings.map((x) => `${x.kind}:${x.term}`))}`,
      };
    });

    /* K-block terms (round-20 amendment) ---------------------------------- */
    const K_KNOBS = {
      readmeRows: 3,
      notes: [
        ['knowledge/alpha.md', fxLayerNote('scripts/a.mjs')],
        ['lessons/beta.md', fxLayerNote('crates/ufo-core-runtime/src/b.rs')],
        ['knowledge/kimi-alpha.md', FX_KIMI_NOTE],
      ],
      registry: [
        ['S1', 'alpha', '`a.mjs`', 'yes — `knowledge/alpha.md`'],
        ['R1', 'beta', '`b.rs`', 'yes — `lessons/beta.md`'],
        ...FX_K_ROWS,
      ],
      expect: {
        A: 6, C: 3, C1: 2, C1_total: 2, C2: 3, C2_total: 3, operability: 7, coverage: 10,
        S_members: 3, S_sections: 1, R_members: 2, R_sections: 1, coverage_script: 3, coverage_runtime: 5,
        C1k: 5, C1k_total: 5, K_members: 30, K_sections: 4, coverage_kimi: 1,
      },
    };
    const kCase = (name, edits = [], mutate = null) => {
      const fx = fxBase(name, K_KNOBS);
      if (edits.length > 0) {
        let text = fx.scorecard;
        for (const [from, to] of edits) text = text.replace(from, to);
        fxWrite(join(fx.dir, SCORECARD_FILE), text);
      }
      if (mutate !== null) mutate(fx);
      return fx;
    };
    const K5_ROW_OFF = [
      '| K5 | kimi root-residue | 3 | yes — `knowledge/kimi-alpha.md` |',
      '| K5 | kimi root-residue | 3 | no — `knowledge/kimi-alpha.md` |',
    ];

    const kMatch = fxBase('kimi-match', K_KNOBS);
    const kr = runProxy(args(kMatch));

    check('K member list includes locks/ as one K3 directory', () => {
      const root = fxDir('kimi-locks-member');
      fixtureKimi(root);
      mkdirSync(join(root, 'locks', 'sessions'), { recursive: true });
      const rule = K_MEMBER_RULES.find((m) => m.id === 'locks/');
      const observedK = kMembers(root);
      return {
        ok: rule?.family === 'K3' && rule.path === 'locks' && rule.kind === 'dir'
          && observedK.members === 31 && observedK.identities.has('locks'),
        detail: `members=${observedK.members} locks=${observedK.identities.has('locks')} rule=${JSON.stringify(rule)}`,
      };
    });
    check('K terms MATCH: `C1k=5/5 K=4/30 coverage:kimi-layer=1` with C1 still 2/2 (literal verdict)', () => {
      const k = kindsEq(kr, []);
      return {
        ok: kr.status === 0 && k.ok
          && verdictLine(kr) === 'PROXY: MATCH (A=6 C=3 operability=7; C1=2/2 C2=3/3 coverage=10; S=1/3 coverage:script-layer=3; R=1/2 coverage:runtime-layer=5; K=4/30 coverage:kimi-layer=1; pins=6 match)',
        detail: `exit=${kr.status} kinds=[${k.got}] ${verdictLine(kr)}`,
      };
    });
    check('--json parity: the five K terms compute AND carry their declared strings', () => {
      const j = JSON.parse(runProxy(args(kMatch, ['--json'])).stdout);
      return {
        ok: j.terms.C1k === 5 && j.terms.C1k_total === 5 && j.terms.K_members === 30
          && j.terms.K_sections === 4 && j.terms.coverage_kimi === 1
          && j.terms.declared.C1k === '5' && j.terms.declared.K_members === '30'
          && j.terms.declared.coverage_kimi === '1' && j.kimiRoot === kMatch.kimi,
        detail: `terms=${JSON.stringify({ C1k: `${j.terms.C1k}/${j.terms.C1k_total}`, K: `${j.terms.K_sections}/${j.terms.K_members}`, cov: j.terms.coverage_kimi })}`,
      };
    });
    check('the drift chain is ONE member whatever the generation count (+2 generations ⇒ MATCH)', () => {
      const fx = kCase('kimi-chain-generations', [], (f) => {
        writeFileSync(join(f.kimi, 'config.toml.20260101-000000.bak'), 'gen\n');
        writeFileSync(join(f.kimi, 'config.toml.20260102-000000.bak'), 'gen\n');
      });
      const res = runProxy(args(fx));
      return {
        ok: res.status === 0 && verdictLine(res).includes('K=4/30 coverage:kimi-layer=1'),
        detail: `exit=${res.status} ${verdictLine(res).slice(0, 150)}`,
      };
    });
    check('K_members reads live: a removed K5 file is K_MEMBERS_DRIFT (never a fitted count)', () => {
      const fx = kCase('kimi-members-drift', [], (f) => rmSync(join(f.kimi, 'workspaces.json'), { force: true }));
      const res = runProxy(args(fx));
      const k = kindsEq(res, ['K_MEMBERS_DRIFT']);
      const f = parseFindings(res.stdout)[0] ?? { detail: '' };
      return {
        ok: res.status === 1 && k.ok && f.detail === 'K_members: declared=30 computed=29 delta=-1',
        detail: `exit=${res.status} kinds=[${k.got}] ${f.detail}`,
      };
    });
    check('K_members reads live: a new counted-dir child moves the total (30 → 31)', () => {
      const fx = kCase('kimi-members-added', [['\nK_members=30\n', '\nK_members=31\n']], (f) => {
        writeFileSync(join(f.kimi, 'skills/skill-b'), 'fixture member\n');
      });
      const okAdded = runProxy(args(fx));
      const fx2 = kCase('kimi-members-added-stale', [], (f) => {
        writeFileSync(join(f.kimi, 'agents/secondary/sec-c.md'), 'fixture member\n');
      });
      const stale = runProxy(args(fx2));
      const k = kindsEq(stale, ['K_MEMBERS_DRIFT']);
      return {
        ok: okAdded.status === 0 && stale.status === 1 && k.ok
          && verdictLine(okAdded).includes('K=4/31 coverage:kimi-layer=1')
          && parseFindings(stale.stdout)[0].detail.includes('declared=30 computed=31'),
        detail: `added=${verdictLine(okAdded).slice(0, 60)} stale=${verdictLine(stale).slice(0, 60)}`,
      };
    });
    check('kind matters: a declared dir member replaced by a file drops the count (K_MEMBERS_DRIFT)', () => {
      const fx = kCase('kimi-kind-drift', [], (f) => {
        rmSync(join(f.kimi, 'credentials'), { recursive: true, force: true });
        writeFileSync(join(f.kimi, 'credentials'), 'not a dir\n');
      });
      const res = runProxy(args(fx));
      const k = kindsEq(res, ['K_MEMBERS_DRIFT']);
      return {
        ok: res.status === 1 && k.ok && parseFindings(res.stdout)[0].detail.includes('computed=29'),
        detail: `exit=${res.status} kinds=[${k.got}] ${parseFindings(res.stdout)[0] ? parseFindings(res.stdout)[0].detail : ''}`,
      };
    });
    check('K_sections drift: one member section renamed to topic form is K_SECTIONS_DRIFT alone', () => {
      const fx = kCase('kimi-sections-drift', [], (f) => {
        fxWrite(join(f.dir, 'corpus/knowledge/kimi-alpha.md'), FX_KIMI_NOTE_RENAMED);
      });
      const res = runProxy(args(fx));
      const k = kindsEq(res, ['K_SECTIONS_DRIFT']);
      return {
        ok: res.status === 1 && k.ok
          && parseFindings(res.stdout)[0].detail === 'K_sections: declared=4 computed=3 delta=-1',
        detail: `exit=${res.status} kinds=[${k.got}] ${parseFindings(res.stdout)[0] ? parseFindings(res.stdout)[0].detail : ''}`,
      };
    });
    check('coverage_kimi recompute: two sections lost ⇒ 1→0, terms AND the ## Axes row drift', () => {
      const fx = kCase('kimi-coverage-recompute', [], (f) => {
        fxWrite(join(f.dir, 'corpus/knowledge/kimi-alpha.md'), FX_KIMI_NOTE
          .replace('## `~/.kimi-code/sessions/` — the store', '## The store, in prose')
          .replace('## `plugins/managed/kimi-webbridge` — a managed plugin', '## Managed plugins, in prose'));
      });
      const res = runProxy(args(fx));
      const k = kindsEq(res, ['K_SECTIONS_DRIFT', 'COVERAGE_KIMI_DRIFT', 'AXES_DRIFT']);
      return {
        ok: res.status === 1 && k.ok
          && parseFindings(res.stdout)[1].detail === 'coverage_kimi: declared=1 computed=0 delta=-1',
        detail: `exit=${res.status} kinds=[${k.got}] ${parseFindings(res.stdout).map((x) => x.detail).join(' | ')}`,
      };
    });
    check('a K row going `no` moves C1k (5/5→4/5); coverage_kimi floors to the same 1', () => {
      const fx = kCase('kimi-c1k-drift', [K5_ROW_OFF, ['\nC1k=5\n', '\nC1k=4\n']]);
      const flipped = runProxy(args(fx));
      const staleFx = kCase('kimi-c1k-stale', [K5_ROW_OFF]);
      const stale = runProxy(args(staleFx));
      const k = kindsEq(stale, ['C1K_DRIFT']);
      return {
        ok: flipped.status === 0 && stale.status === 1 && k.ok
          && verdictLine(flipped).includes('C1=2/2') && verdictLine(flipped).includes('K=4/30 coverage:kimi-layer=1')
          && parseFindings(stale.stdout)[0].detail === 'C1k: declared=5 computed=4 delta=-1',
        detail: `flipped=${flipped.status} ${verdictLine(flipped).slice(0, 130)} stale=[${k.got}]`,
      };
    });
    check('C1k_total drift: the K-row denominator is its own count, not C1_total\'s', () => {
      const fx = kCase('kimi-c1k-total', [['\nC1k_total=5\n', '\nC1k_total=6\n']]);
      const res = runProxy(args(fx));
      const k = kindsEq(res, ['C1K_TOTAL_DRIFT']);
      return {
        ok: res.status === 1 && k.ok && verdictLine(res) === 'PROXY: DRIFT (C1K_TOTAL_DRIFT term=C1k_total declared=6 computed=5 delta=-1)',
        detail: `exit=${res.status} kinds=[${k.got}] ${verdictLine(res)}`,
      };
    });
    check('AXES_DRIFT covers `| coverage:kimi-layer | N |`', () => {
      const fx = kCase('kimi-axes-drift', [['| coverage:kimi-layer | 1 |', '| coverage:kimi-layer | 2 |']]);
      const res = runProxy(args(fx, ['--json']));
      const j = JSON.parse(res.stdout);
      const f = j.findings[0] ?? {};
      return {
        ok: res.status === 1 && j.findings.length === 1 && f.kind === 'AXES_DRIFT'
          && f.term === 'coverage:kimi-layer' && f.key === 'coverage_kimi' && f.declared === 2 && f.computed === 1,
        detail: `exit=${res.status} findings=${JSON.stringify(j.findings.map((x) => `${x.kind}:${x.term}`))}`,
      };
    });
    check('zero denominators score 0: no K rows at all ⇒ C1k_total=0, coverage_kimi=0, never NaN', () => {
      const fx = fxBase('kimi-no-rows', {
        ...K_KNOBS,
        registry: K_KNOBS.registry.filter((r) => !r[0].startsWith('K')),
        expect: { ...K_KNOBS.expect, C1k: 0, C1k_total: 0, coverage_kimi: 0 },
      });
      const res = runProxy(args(fx, ['--json']));
      const j = JSON.parse(res.stdout);
      return {
        ok: res.status === 0 && j.terms.C1k === 0 && j.terms.C1k_total === 0
          && j.terms.coverage_kimi === 0 && Number.isInteger(j.terms.coverage_kimi)
          && j.terms.K_members === 30 && j.terms.K_sections === 4,
        detail: `exit=${res.status} C1k=${j.terms.C1k}/${j.terms.C1k_total} cov=${j.terms.coverage_kimi}`,
      };
    });
    /* the tightened numerator: DISTINCT members, not occurrences (round 22) --- */
    check('distinct ≠ occurrence: a duplicated member section + a dropped one lowers the numerator (4→3, never 4)', () => {
      const fx = kCase('kimi-dup-drop', [], (f) => {
        fxWrite(join(f.dir, 'corpus/knowledge/kimi-alpha.md'),
          FX_KIMI_NOTE.replace('## `~/.kimi-code/sessions/` — the store\n\nprose\n\n', '')
            + '\n## `config.toml` — the same member, a second section\n\nprose\n');
      });
      const res = runProxy(args(fx, ['--json']));
      const j = JSON.parse(res.stdout);
      return {
        ok: res.status === 1 && j.terms.K_sections === 3
          && j.findings.length === 1 && j.findings[0].kind === 'K_SECTIONS_DRIFT'
          && j.findings[0].detail === 'K_sections: declared=4 computed=3 delta=-1',
        detail: `exit=${res.status} K_sections=${j.terms.K_sections} (occurrence would be 4) findings=${JSON.stringify(j.findings.map((x) => x.kind))}`,
      };
    });
    check('basename ambiguity: a basename owned by two members binds to none and warns; a full path still binds', () => {
      const fx = kCase('kimi-ambiguous', [
        ['\nK_members=30\n', '\nK_members=31\n'],
        ['\nK_sections=4\n', '\nK_sections=1\n'],
        ['\ncoverage_kimi=1\n', '\ncoverage_kimi=0\n'],
        ['| coverage:kimi-layer | 1 |', '| coverage:kimi-layer | 0 |'],
      ], (f) => {
        writeFileSync(join(f.kimi, 'agents/secondary/skill-a'), 'fixture member\n');
        fxWrite(join(f.dir, 'corpus/knowledge/kimi-alpha.md'),
          '# kimi-amb fixture note\n\n'
          + '## `skill-a` — a bare basename owned by two members\n\nprose\n\n'
          + '## `skills/skill-a` — the full path binds to one\n\nprose\n');
      });
      const res = runProxy(args(fx, ['--json']));
      const j = JSON.parse(res.stdout);
      const warn = j.findings.find((x) => x.kind === 'K_SECTION_AMBIGUOUS') ?? {};
      // Text mode registers the warning kind for the meta-check that every
      // declared finding kind fires; --strict proves the warning gates.
      const text = parseFindings(runProxy(args(fx)).stdout);
      const strict = runProxy(args(fx, ['--strict']));
      return {
        ok: res.status === 0 && j.terms.K_sections === 1 && j.terms.K_members === 31
          && j.warnings === 1 && warn.severity === 'warn' && warn.term === 'skill-a'
          && String(warn.detail).includes('agents/secondary/skill-a')
          && String(warn.detail).includes('skills/skill-a')
          && text.some((x) => x.kind === 'K_SECTION_AMBIGUOUS')
          && strict.status === 1,
        detail: `exit=${res.status} K_sections=${j.terms.K_sections} (occurrence would be 2) warnings=${j.warnings} strict=${strict.status} ${warn.detail ?? ''}`,
      };
    });
    check('chain-as-one: two `.bak` generation headings name the CHAIN member once', () => {
      const fx = kCase('kimi-chain-one', [
        ['\nK_sections=4\n', '\nK_sections=1\n'],
        ['\ncoverage_kimi=1\n', '\ncoverage_kimi=0\n'],
        ['| coverage:kimi-layer | 1 |', '| coverage:kimi-layer | 0 |'],
      ], (f) => {
        fxWrite(join(f.dir, 'corpus/knowledge/kimi-alpha.md'),
          '# kimi-chain fixture note\n\n'
          + '## `~/.kimi-code/config.toml.20260101-000000.bak` — generation one\n\nprose\n\n'
          + '## `~/.kimi-code/config.toml.20260102-000000.bak` — generation two\n\nprose\n');
      });
      const res = runProxy(args(fx, ['--json']));
      const j = JSON.parse(res.stdout);
      return {
        ok: res.status === 0 && j.terms.K_sections === 1 && j.terms.K_members === 30,
        detail: `exit=${res.status} K=${j.terms.K_sections}/${j.terms.K_members} (occurrence would be 2)`,
      };
    });
    check('counted-children: a lane-file heading names that lane; a repeat adds no second member', () => {
      const fx = kCase('kimi-counted-children', [
        ['\nK_sections=4\n', '\nK_sections=2\n'],
        ['\ncoverage_kimi=1\n', '\ncoverage_kimi=0\n'],
        ['| coverage:kimi-layer | 1 |', '| coverage:kimi-layer | 0 |'],
      ], (f) => {
        fxWrite(join(f.dir, 'corpus/knowledge/kimi-alpha.md'),
          '# kimi-lanes fixture note\n\n'
          + '## `~/.kimi-code/agents/secondary/sec-a.md` — lane one\n\nprose\n\n'
          + '## `~/.kimi-code/agents/secondary/sec-b.md` — lane two\n\nprose\n\n'
          + '## `~/.kimi-code/agents/secondary/sec-a.md` — lane one again\n\nprose\n');
      });
      const res = runProxy(args(fx, ['--json']));
      const j = JSON.parse(res.stdout);
      return {
        ok: res.status === 0 && j.terms.K_sections === 2 && j.terms.K_members === 30,
        detail: `exit=${res.status} K=${j.terms.K_sections}/${j.terms.K_members} (occurrence would be 3)`,
      };
    });
    check('zero denominator safety: an empty kimi root ⇒ K_members=0, K_sections=0, coverage_kimi=0 (integer, never NaN)', () => {
      const fx = kCase('kimi-empty-root', [
        ['\nK_members=30\n', '\nK_members=0\n'],
        ['\nK_sections=4\n', '\nK_sections=0\n'],
        ['\ncoverage_kimi=1\n', '\ncoverage_kimi=0\n'],
        ['| coverage:kimi-layer | 1 |', '| coverage:kimi-layer | 0 |'],
      ], (f) => {
        rmSync(f.kimi, { recursive: true, force: true });
        mkdirSync(f.kimi, { recursive: true });
      });
      const res = runProxy(args(fx, ['--json']));
      const j = JSON.parse(res.stdout);
      return {
        ok: res.status === 0 && j.terms.K_members === 0 && j.terms.K_sections === 0
          && j.terms.coverage_kimi === 0 && Number.isInteger(j.terms.coverage_kimi),
        detail: `exit=${res.status} K=${j.terms.K_sections}/${j.terms.K_members} cov=${j.terms.coverage_kimi}`,
      };
    });
    check('stanza drift arm: declaring the OCCURRENCE count (2) where distinct is 1 is K_SECTIONS_DRIFT alone', () => {
      const fx = kCase('kimi-sections-occurrence', [
        ['\nK_sections=4\n', '\nK_sections=2\n'],
        ['\ncoverage_kimi=1\n', '\ncoverage_kimi=0\n'],
        ['| coverage:kimi-layer | 1 |', '| coverage:kimi-layer | 0 |'],
      ], (f) => {
        fxWrite(join(f.dir, 'corpus/knowledge/kimi-alpha.md'),
          '# kimi-chain fixture note\n\n'
          + '## `~/.kimi-code/config.toml.20260101-000000.bak` — generation one\n\nprose\n\n'
          + '## `~/.kimi-code/config.toml.20260102-000000.bak` — generation two\n\nprose\n');
      });
      const res = runProxy(args(fx));
      const k = kindsEq(res, ['K_SECTIONS_DRIFT']);
      return {
        ok: res.status === 1 && k.ok
          && verdictLine(res) === 'PROXY: DRIFT (K_SECTIONS_DRIFT term=K_sections declared=2 computed=1 delta=-1)',
        detail: `exit=${res.status} kinds=[${k.got}] ${verdictLine(res)}`,
      };
    });

    // The fixtures the fail-closed arms below fire on; the arms run in their own
    // section, where the `fc` helper exists.
    const K_BAD_VALUE = kCase('kimi-bad-value', [['\nK_members=30\n', '\nK_members=five\n']]);
    const K_BAD_RATIO = kCase('kimi-bad-coverage', [['\ncoverage_kimi=1\n', '\ncoverage_kimi=1.5\n']]);
    const K_UNKNOWN_KEY = kCase('kimi-unknown-key', [['\nC1k=5\n', '\nC1k=5\nK_blocks=5\n']]);
    const K_MISSING_KEY = kCase('kimi-missing-key', [['K_sections=4\n', '']]);
    check('fail-closed KIMI_ROOT_NOT_A_DIR --json carries the token and no terms', () => {
      const res = runProxy(['--json', '--self', F1.dir, '--src', F1.src, '--kimi-root', join(tmp, 'no-kimi-here')]);
      const j = JSON.parse(res.stdout);
      return {
        ok: res.status === 2 && j.verdict === 'FAIL-CLOSED' && j.findings[0].kind === 'KIMI_ROOT_NOT_A_DIR'
          && Object.keys(j.terms).length === 0 && j.kimiRoot === join(tmp, 'no-kimi-here'),
        detail: `exit=${res.status} verdict=${j.verdict} terms=${JSON.stringify(j.terms)}`,
      };
    });

    /* 13-20 ─ drift on terms ------------------------------------------------ */
    const driftA = fxBase('drift-a', { expect: F1.expect });
    fxWrite(join(driftA.dir, SCORECARD_FILE), F1.scorecard.replace('\nA=6\n', '\nA=4\n'));
    const d1 = runProxy(args(driftA));
    check('A_DRIFT: declared=4 computed=6 delta=+2, exit 1, exactly [A_DRIFT]', () => {
      const k = kindsEq(d1, ['A_DRIFT']);
      return {
        ok: d1.status === 1 && k.ok
          && verdictLine(d1) === 'PROXY: DRIFT (A_DRIFT term=A declared=4 computed=6 delta=+2)',
        detail: `exit=${d1.status} ${verdictLine(d1)}`,
      };
    });
    check('a term drift does not disturb the ## Axes rows (derived score unchanged)', () => ({
      ok: !String(d1.stdout ?? '').includes('AXES_DRIFT'),
      detail: `stdout=${JSON.stringify(String(d1.stdout ?? '').split('\n')[0])}`,
    }));
    const scTampered = join(fxDir('scorecard-flag'), 'SCORECARD.md');
    fxWrite(scTampered, F1.scorecard.replace('\nA=6\n', '\nA=8\n'));
    const d2 = runProxy(['--self', F1.dir, '--src', F1.src, '--kimi-root', F1.kimi, '--scorecard', scTampered]);
    check('--scorecard FILE: the claim is read from FILE, the tree from --self', () => {
      const k = kindsEq(d2, ['A_DRIFT']);
      return { ok: d2.status === 1 && k.ok && verdictLine(d2).includes('declared=8 computed=6'), detail: `exit=${d2.status} ${verdictLine(d2)}` };
    });
    const driftC = fxBase('drift-c', { expect: F1.expect });
    fxWrite(join(driftC.dir, SCORECARD_FILE), F1.scorecard.replace('\nC=3\n', '\nC=4\n'));
    const d3 = runProxy(args(driftC));
    check('C_DRIFT: declared=4 computed=3 delta=-1', () => {
      const k = kindsEq(d3, ['C_DRIFT']);
      return { ok: d3.status === 1 && k.ok && verdictLine(d3).includes('delta=-1'), detail: `exit=${d3.status} ${verdictLine(d3)}` };
    });
    const driftC1 = fxBase('drift-c1', { expect: F1.expect });
    fxWrite(join(driftC1.dir, SCORECARD_FILE), F1.scorecard.replace('\nC1=1\n', '\nC1=2\n'));
    const d4 = runProxy(args(driftC1));
    check('C1_DRIFT: declared=2 computed=1 (registry 4th-cell `yes` test)', () => {
      const k = kindsEq(d4, ['C1_DRIFT']);
      return { ok: d4.status === 1 && k.ok && verdictLine(d4).includes('term=C1'), detail: `exit=${d4.status} ${verdictLine(d4)}` };
    });
    const regPipe = fxBase('registry-escaped-pipe', {
      expect: F1.expect,
      registry: [
        ['S1', 'alpha', '`a.mjs` \\| `a2.mjs`', 'yes — alpha note'],
        ['R1', 'beta', '`b.rs`', 'no'],
      ],
    });
    const dEsc = runProxy(args(regPipe));
    check('registry: `\\|` inside a cell is not a cell break (C1=1/2, MATCH exit 0)', () => ({
      ok: dEsc.status === 0
        && verdictLine(dEsc) === 'PROXY: MATCH (A=6 C=3 operability=7; C1=1/2 C2=2/2 coverage=5; S=0/3 coverage:script-layer=0; R=0/2 coverage:runtime-layer=0; K=0/30 coverage:kimi-layer=0; pins=6 match)',
      detail: `exit=${dEsc.status} ${verdictLine(dEsc)}`,
    }));
    const regPipeNo = fxBase('registry-escaped-pipe-no', {
      expect: { ...F1.expect, C1: 0, coverage: 0 },
      registry: [
        ['S1', 'alpha', '`a.mjs` \\| `a2.mjs`', 'no — escaped pipe in the members cell'],
        ['R1', 'beta', '`b.rs`', 'no'],
      ],
    });
    const dEscNo = runProxy(args(regPipeNo));
    check('registry: a `no` row with an escaped pipe is not counted as covered (C1=0/2)', () => ({
      ok: dEscNo.status === 0 && verdictLine(dEscNo).includes('C1=0/2'),
      detail: `exit=${dEscNo.status} ${verdictLine(dEscNo)}`,
    }));
    const driftC1T = fxBase('drift-c1total', { expect: F1.expect });
    fxWrite(join(driftC1T.dir, SCORECARD_FILE), F1.scorecard.replace('\nC1_total=2\n', '\nC1_total=3\n'));
    const d5 = runProxy(args(driftC1T));
    check('C1_TOTAL_DRIFT: declared=3 computed=2', () => {
      const k = kindsEq(d5, ['C1_TOTAL_DRIFT']);
      return { ok: d5.status === 1 && k.ok, detail: `exit=${d5.status} ${verdictLine(d5)}` };
    });
    const driftC2 = fxBase('drift-c2', { expect: F1.expect });
    fxWrite(join(driftC2.dir, SCORECARD_FILE), F1.scorecard.replace('\nC2=2\n', '\nC2=3\n'));
    const d6 = runProxy(args(driftC2));
    check('C2_DRIFT: declared=3 computed=2', () => {
      const k = kindsEq(d6, ['C2_DRIFT']);
      return { ok: d6.status === 1 && k.ok, detail: `exit=${d6.status} ${verdictLine(d6)}` };
    });
    const driftC2T = fxBase('drift-c2total', { expect: F1.expect });
    fxWrite(join(driftC2T.dir, SCORECARD_FILE), F1.scorecard.replace('\nC2_total=2\n', '\nC2_total=3\n'));
    const d7 = runProxy(args(driftC2T));
    check('C2_TOTAL_DRIFT: declared=3 computed=2 (corpus *.md census)', () => {
      const k = kindsEq(d7, ['C2_TOTAL_DRIFT']);
      return { ok: d7.status === 1 && k.ok, detail: `exit=${d7.status} ${verdictLine(d7)}` };
    });
    const driftMany = fxBase('drift-many', { expect: F1.expect });
    fxWrite(join(driftMany.dir, SCORECARD_FILE), F1.scorecard.replace('\nA=6\n', '\nA=4\n').replace('\nC=3\n', '\nC=4\n'));
    const d8 = runProxy(args(driftMany));
    check('two drifts → both findings, in term order, joined in one verdict line', () => {
      const k = kindsEq(d8, ['A_DRIFT', 'C_DRIFT']);
      return {
        ok: d8.status === 1 && k.ok && verdictLine(d8).includes('; ')
          && verdictLine(d8).startsWith('PROXY: DRIFT (A_DRIFT term=A declared=4 computed=6 delta=+2; C_DRIFT'),
        detail: `exit=${d8.status} ${verdictLine(d8)}`,
      };
    });

    /* 21-24 ─ pins + axes --------------------------------------------------- */
    const driftPin = fxBase('drift-pin', { expect: F1.expect });
    const zeroPin = '0'.repeat(64);
    fxWrite(join(driftPin.dir, SCORECARD_FILE), F1.scorecard.replace(/(\npin\.round-gate=)[0-9a-f]{64}\n/u, `$1${zeroPin}\n`));
    const d9 = runProxy(args(driftPin));
    check('PIN_DRIFT: a tampered pin is a finding naming the key, declared and computed', () => {
      const k = kindsEq(d9, ['PIN_DRIFT']);
      const f = parseFindings(d9.stdout)[0];
      const shaped = f ? new RegExp(`^pin\\.round-gate: declared=${zeroPin} computed=[0-9a-f]{64}$`, 'u').test(f.detail) : false;
      return {
        ok: d9.status === 1 && k.ok && shaped,
        detail: `exit=${d9.status} kinds=[${k.got}] shaped=${shaped} ${f ? f.detail.slice(0, 90) : ''}`,
      };
    });
    const sourcePinKey = fxBase('v1-source-pin-unknown', { expect: F1.expect });
    fxWrite(join(sourcePinKey.dir, SCORECARD_FILE), F1.scorecard.replace('\n-->\n', `\npin.sources-check=${zeroPin}\n-->\n`));
    const dSourcesPin = runProxy(args(sourcePinKey));
    check('STANZA_KEY_UNKNOWN: parent-frozen v1 rejects pin.sources-check', () => {
      const token = fcToken(dSourcesPin);
      return {
        ok: dSourcesPin.status === 2 && token === 'STANZA_KEY_UNKNOWN',
        detail: `exit=${dSourcesPin.status} token=${token} ${verdictLine(dSourcesPin)}`,
      };
    });
    const gatePinsFixture = fxBase('gate-pins-clean', {
      gatePins: ['anchor-truth', 'sources-check', 'wave-census', 'gate-mutants', 'counter-pins'],
      expect: { ...F1.expect, A: 11, operability: 8 },
    });
    const gatePinsRun = runProxy(args(gatePinsFixture, ['--strict', '--json']));
    check('separate gate-pin block verifies named gates, suppresses warnings, and keeps v1 pins unchanged', () => {
      const j = JSON.parse(gatePinsRun.stdout);
      return {
        ok: gatePinsRun.status === 0 && j.verdict === 'MATCH' && j.errors === 0
          && j.warnings === 0 && j.findings.length === 0
          && j.terms.pinsMatched === 6 && j.terms.pinsTotal === 6
          && gatePinsFixture.scorecard.includes('pin.gate-mutants='),
        detail: `exit=${gatePinsRun.status} warnings=${j.warnings} v1Pins=${j.terms.pinsMatched}/${j.terms.pinsTotal} futureKey=${gatePinsFixture.scorecard.includes('pin.gate-mutants=')}`,
      };
    });
    const gatePinDrift = fxBase('gate-pin-drift', {
      gatePins: ['anchor-truth'],
      expect: { ...F1.expect, A: 7 },
    });
    const tamperedGatePin = gatePinDrift.scorecard.replace(
      /(\npin\.anchor-truth=)[0-9a-f]{64}\n/u, `$1${zeroPin}\n`,
    );
    fxWrite(join(gatePinDrift.dir, SCORECARD_FILE), tamperedGatePin);
    const gatePinDriftRun = runProxy(args(gatePinDrift));
    check('GATE_PIN_DRIFT: a changed gate hash is an error with the declared and computed digests', () => {
      const k = kindsEq(gatePinDriftRun, ['GATE_PIN_DRIFT']);
      const f = parseFindings(gatePinDriftRun.stdout)[0];
      return {
        ok: gatePinDriftRun.status === 1 && k.ok && f?.severity === 'error'
          && f.detail.startsWith(`pin.anchor-truth: declared=${zeroPin} computed=`),
        detail: `exit=${gatePinDriftRun.status} kinds=[${k.got}] ${f ? f.detail.slice(0, 100) : ''}`,
      };
    });
    const unknownGatePin = fxBase('gate-pin-unknown', { expect: F1.expect });
    const unknownGatePinText = unknownGatePin.scorecard.replace(
      `${GATE_PIN_HEAD}\n`, `${GATE_PIN_HEAD}\npin.future-unknown=${zeroPin}\n`,
    );
    fxWrite(join(unknownGatePin.dir, SCORECARD_FILE), unknownGatePinText);
    const unknownGatePinRun = runProxy(args(unknownGatePin));
    check('GATE_PIN_KEY_UNKNOWN: an undeclared gate key fails closed', () => {
      const token = fcToken(unknownGatePinRun);
      return {
        ok: unknownGatePinRun.status === 2 && token === 'GATE_PIN_KEY_UNKNOWN',
        detail: `exit=${unknownGatePinRun.status} token=${token} ${verdictLine(unknownGatePinRun)}`,
      };
    });
    const malformedGatePin = fxBase('gate-pin-malformed', {
      gatePins: ['anchor-truth'],
      expect: { ...F1.expect, A: 7 },
    });
    const malformedGatePinText = malformedGatePin.scorecard.replace(
      /(\npin\.anchor-truth=)[0-9a-f]{64}\n/u, '$1not-a-sha256\n',
    );
    fxWrite(join(malformedGatePin.dir, SCORECARD_FILE), malformedGatePinText);
    const malformedGatePinRun = runProxy(args(malformedGatePin));
    check('GATE_PIN_MALFORMED: an invalid gate digest fails closed', () => {
      const token = fcToken(malformedGatePinRun);
      return {
        ok: malformedGatePinRun.status === 2 && token === 'GATE_PIN_MALFORMED',
        detail: `exit=${malformedGatePinRun.status} token=${token} ${verdictLine(malformedGatePinRun)}`,
      };
    });

    const missingScript = fxBase('drift-pin-absent', { expect: F1.expect });
    rmSync(join(missingScript.dir, 'scripts', 'proxy-check.mjs'), { force: true });
    const d10 = runProxy(args(missingScript));
    check('PIN_DRIFT (absent) + A_DRIFT: a removed pinned script is never skipped', () => {
      const k = kindsEq(d10, ['A_DRIFT', 'PIN_DRIFT']);
      const f = parseFindings(d10.stdout).find((x) => x.kind === 'PIN_DRIFT');
      return {
        ok: d10.status === 1 && k.ok && f && /^pin\.proxy-check: declared=[0-9a-f]{64} computed=absent \(scripts\/proxy-check\.mjs is absent\)$/u.test(f.detail),
        detail: `exit=${d10.status} kinds=[${k.got}] ${f ? f.detail.slice(0, 80) : ''}`,
      };
    });
    const driftAxes = fxBase('drift-axes', { expect: F1.expect });
    fxWrite(join(driftAxes.dir, SCORECARD_FILE), F1.scorecard.replace('| operability | 7 |', '| operability | 6 |'));
    const d11 = runProxy(args(driftAxes));
    check('AXES_DRIFT: derived 7 vs ## Axes row 6 → exit 1', () => {
      const k = kindsEq(d11, ['AXES_DRIFT']);
      const f = parseFindings(d11.stdout)[0];
      return { ok: d11.status === 1 && k.ok && f && f.detail === 'operability: ## Axes row=6 derived=7', detail: `exit=${d11.status} ${f ? f.detail : ''}` };
    });
    const noAxes = fxBase('drift-axes-absent', { expect: F1.expect });
    fxWrite(join(noAxes.dir, SCORECARD_FILE), F1.scorecard.replace('| coverage | 5 | fixture | round 11 |\n', ''));
    const d12 = runProxy(args(noAxes));
    check('AXES_DRIFT (absent row): a missing `| coverage |` row is drift, not silence', () => {
      const k = kindsEq(d12, ['AXES_DRIFT']);
      const f = parseFindings(d12.stdout)[0];
      return { ok: d12.status === 1 && k.ok && f && f.detail === 'coverage: ## Axes row=absent derived=5', detail: `exit=${d12.status} ${f ? f.detail : ''}` };
    });
    const staleAxes = fxBase('stale-axes-row', { expect: F1.expect });
    fxWrite(join(staleAxes.dir, SCORECARD_FILE), F1.scorecard.replace('## Axes', '## History\n\n'
      + '| Axis | Score |\n|---|---|\n| operability | 6 |\n| coverage | 4 |\n\n## Axes'));
    const d13 = runProxy(args(staleAxes));
    check('a stale `| operability | 6 |` row before `## Axes` cannot shadow the axis row → MATCH', () => {
      const k = kindsEq(d13, []);
      return {
        ok: d13.status === 0 && k.ok
          && verdictLine(d13) === 'PROXY: MATCH (A=6 C=3 operability=7; C1=1/2 C2=2/2 coverage=5; S=0/3 coverage:script-layer=0; R=0/2 coverage:runtime-layer=0; K=0/30 coverage:kimi-layer=0; pins=6 match)',
        detail: `exit=${d13.status} kinds=[${k.got}] ${verdictLine(d13)}`,
      };
    });
    const noAxesSection = fxBase('no-axes-section', { expect: F1.expect });
    fxWrite(join(noAxesSection.dir, SCORECARD_FILE),
      F1.scorecard.replace(/## Axes[\s\S]*?<!-- kumitate-proxy-v1/u, '<!-- kumitate-proxy-v1'));
    const d14 = runProxy(args(noAxesSection));
    check('no `## Axes` heading → all five axes AXES_DRIFT with `no ## Axes section`', () => {
      const k = kindsEq(d14, ['AXES_DRIFT', 'AXES_DRIFT', 'AXES_DRIFT', 'AXES_DRIFT', 'AXES_DRIFT']);
      const f = parseFindings(d14.stdout)[0];
      return {
        ok: d14.status === 1 && k.ok && f && f.detail === 'operability: ## Axes row=no ## Axes section derived=7',
        detail: `exit=${d14.status} kinds=[${k.got}] ${f ? f.detail : ''}`,
      };
    });
    const d15 = runProxy(args(driftAxes, ['--json']));
    check('--json drift: ok=false, verdict DRIFT, findings carry kind/term/declared/computed', () => {
      const j = JSON.parse(d15.stdout);
      const f = j.findings[0] ?? {};
      return {
        ok: d15.status === 1 && j.ok === false && j.verdict === 'DRIFT' && f.kind === 'AXES_DRIFT'
          && f.term === 'operability' && f.declared === 6 && f.computed === 7 && Array.isArray(j.findings),
        detail: `exit=${d15.status} findings=${JSON.stringify(j.findings.map((x) => x.kind))}`,
      };
    });

    /* 25-26 ─ the advisory warning + --strict ------------------------------- */
    const unpinned = fxBase('pin-unpinned', {
      expect: {
        A: 7, C: 3, C1: 1, C1_total: 2, C2: 2, C2_total: 2, operability: 7, coverage: 5,
        S_members: 3, S_sections: 0, R_members: 2, R_sections: 0, coverage_script: 0, coverage_runtime: 0,
      },
    });
    fxWrite(join(unpinned.dir, 'scripts', 'extra.mjs'), fixtureScript('extra.mjs'));
    const w1 = runProxy(args(unpinned));
    check('PIN_UNPINNED: an unpinned scripts/*.mjs warns, exit 0, verdict still MATCH', () => {
      const k = kindsEq(w1, ['PIN_UNPINNED']);
      const f = parseFindings(w1.stdout)[0];
      return {
        ok: w1.status === 0 && k.ok && f && f.severity === 'warn' && f.detail.includes('scripts/extra.mjs')
          && verdictLine(w1) === 'PROXY: MATCH (A=7 C=3 operability=7; C1=1/2 C2=2/2 coverage=5; S=0/3 coverage:script-layer=0; R=0/2 coverage:runtime-layer=0; K=0/30 coverage:kimi-layer=0; pins=6 match)',
        detail: `exit=${w1.status} ${verdictLine(w1)}`,
      };
    });
    const w2 = runProxy(args(unpinned, ['--strict']));
    check('--strict promotes PIN_UNPINNED → exit 1, DRIFT, errors=0 warnings=1', () => {
      const j = JSON.parse(runProxy(args(unpinned, ['--strict', '--json'])).stdout);
      return {
        ok: w2.status === 1 && verdictLine(w2).startsWith('PROXY: DRIFT (PIN_UNPINNED')
          && j.errors === 0 && j.warnings === 1,
        detail: `exit=${w2.status} ${verdictLine(w2)}`,
      };
    });

    /* 27-38 ─ fail-closed arms --------------------------------------------- */
    const fc = (name, args2, token) => check(`fail-closed: ${token} (${name})`, () => {
      const res = runProxy(args2);
      return {
        ok: res.status === 2 && fcToken(res) === token,
        detail: `exit=${res.status} ${verdictLine(res).slice(0, 90)}`,
      };
    });
    fc('self absent', ['--self', join(tmp, 'nope-nope')], 'SELF_NOT_A_DIR');
    fc('self is a file', ['--self', join(F1.dir, SKILL_FILE)], 'SELF_NOT_A_DIR');
    fc('--src absent', ['--self', F1.dir, '--src', join(tmp, 'nope-src-dir')], 'SRC_NOT_A_DIR');
    fc('--src is a file', ['--self', F1.dir, '--src', join(F1.src, 'docs', 'readme.md')], 'SRC_NOT_A_DIR');
    fc('--kimi-root absent', ['--self', F1.dir, '--src', F1.src, '--kimi-root', join(tmp, 'nope-kimi-dir')], 'KIMI_ROOT_NOT_A_DIR');
    fc('--kimi-root is a file', ['--self', F1.dir, '--src', F1.src, '--kimi-root', join(F1.dir, 'notes.txt')], 'KIMI_ROOT_NOT_A_DIR');
    fc('K count value is not an integer', args(K_BAD_VALUE), 'STANZA_MALFORMED');
    fc('coverage_kimi value is not an integer', args(K_BAD_RATIO), 'STANZA_MALFORMED');
    fc('unknown K-ish key', args(K_UNKNOWN_KEY), 'STANZA_KEY_UNKNOWN');
    fc('required K key absent', args(K_MISSING_KEY), 'STANZA_MALFORMED');
    const noSc = fxBase('no-scorecard', { expect: F1.expect, scorecard: false });
    fc('SCORECARD.md absent', args(noSc), 'SCORECARD_MISSING');
    const noStanza = fxBase('no-stanza', { expect: F1.expect });
    fxWrite(join(noStanza.dir, SCORECARD_FILE), '# Fixture scorecard\n\nno claim block here\n');
    fc('no claim block', args(noStanza), 'STANZA_MISSING');
    const twoStanza = fxBase('two-stanza', { expect: F1.expect });
    fxWrite(join(twoStanza.dir, SCORECARD_FILE), `${F1.scorecard}${F1.scorecard.split('# Fixture scorecard\n\n')[1]}`);
    fc('two claim blocks', args(twoStanza), 'STANZA_MALFORMED');
    const unterminated = fxBase('unterminated', { expect: F1.expect });
    fxWrite(join(unterminated.dir, SCORECARD_FILE), F1.scorecard.replace('\n-->\n', '\n'));
    fc('block without `-->`', args(unterminated), 'STANZA_MALFORMED');
    const badBody = fxBase('bad-body', { expect: F1.expect });
    fxWrite(join(badBody.dir, SCORECARD_FILE), F1.scorecard.replace('\nC1_total=2\n', '\nC1 total=2\n'));
    fc('body line not key=value', args(badBody), 'STANZA_MALFORMED');
    const missingKey = fxBase('missing-key', { expect: F1.expect });
    fxWrite(join(missingKey.dir, SCORECARD_FILE), F1.scorecard.replace(/^C2_total=2\n/mu, ''));
    fc('required key absent', args(missingKey), 'STANZA_MALFORMED');
    const badValue = fxBase('bad-value', { expect: F1.expect });
    fxWrite(join(badValue.dir, SCORECARD_FILE), F1.scorecard.replace('\nA=6\n', '\nA=four\n'));
    fc('count value not an integer', args(badValue), 'STANZA_MALFORMED');
    const badPin = fxBase('bad-pin', { expect: F1.expect });
    fxWrite(join(badPin.dir, SCORECARD_FILE), F1.scorecard.replace(/(\npin\.proxy-check=)[0-9a-f]{64}\n/u, '$1zz\n'));
    fc('pin value not a 64-hex sha256', args(badPin), 'STANZA_MALFORMED');
    const unknownKey = fxBase('unknown-key', { expect: F1.expect });
    fxWrite(join(unknownKey.dir, SCORECARD_FILE), F1.scorecard.replace('\nA=6\n', '\nA=6\nZ=1\n'));
    fc('unknown key', args(unknownKey), 'STANZA_KEY_UNKNOWN');
    const dupKey = fxBase('duplicate-key', { expect: F1.expect });
    fxWrite(join(dupKey.dir, SCORECARD_FILE), F1.scorecard.replace('\nC=3\n', '\nC=3\nC=3\n'));
    fc('duplicate key', args(dupKey), 'STANZA_KEY_DUPLICATE');
    const noRegistry = fxBase('no-registry', { expect: F1.expect });
    fxWrite(join(noRegistry.dir, SCORECARD_FILE), `${F1.scorecard.replace(/\| (?:S|R)\d+ \|.*\n/gu, '')}`);
    fc('no registry rows', args(noRegistry), 'REGISTRY_MISSING');
    const noSkill = fxBase('no-skill', { expect: F1.expect });
    rmSync(join(noSkill.dir, SKILL_FILE), { force: true });
    fc('SKILL.md absent', args(noSkill), 'SKILL_MISSING');
    const noReadme = fxBase('no-readme', { expect: F1.expect });
    rmSync(join(noReadme.dir, CORPUS_README), { force: true });
    fc('corpus/README.md absent', args(noReadme), 'README_MISSING');
    const noLessons = fxBase('no-lessons-dir', { expect: F1.expect });
    rmSync(join(noLessons.dir, 'corpus', 'lessons'), { recursive: true, force: true });
    fc('corpus/lessons absent', args(noLessons), 'CORPUS_DIRS_MISSING');
    const emptyCorpus = fxBase('empty-corpus', { expect: F1.expect });
    for (const dir of CORPUS_DIRS) {
      for (const rel of walkFiles(join(emptyCorpus.dir, dir))) rmSync(join(emptyCorpus.dir, dir, rel), { force: true });
    }
    fc('corpus census empty (no *.md in either dir)', args(emptyCorpus), 'CORPUS_DIRS_MISSING');
    check('fail-closed --json: one schema object, ok=false, token as the finding kind', () => {
      const res = runProxy(['--json', '--self', join(tmp, 'nope-nope')]);
      const j = JSON.parse(res.stdout);
      return {
        ok: res.status === 2 && j.contract === CONTRACT && j.ok === false && j.verdict === 'FAIL-CLOSED'
          && j.findings.length === 1 && j.findings[0].kind === 'SELF_NOT_A_DIR' && j.errors === 1,
        detail: `exit=${res.status} verdict=${j.verdict} kind=${j.findings[0] && j.findings[0].kind}`,
      };
    });

    /* round-23 ─ the derived --src default (bare invocation) ---------------- */
    // A bare run carries no `--src`; the default is derived from `$HOME`-relative
    // candidates, so pointing HOME at a tmp dir makes the resolution hermetic.
    const homeWithSrc = (name, rel) => {
      const home = join(tmp, name);
      fixtureSrc(join(home, rel));
      return home;
    };
    const bareProxy = (home) => runProxy(
      ['--self', F1.dir, '--kimi-root', F1.kimi],
      { HOME: home, UFO_SRC: '' },
    );
    const F1_MATCH = 'PROXY: MATCH (A=6 C=3 operability=7; C1=1/2 C2=2/2 coverage=5; S=0/3 coverage:script-layer=0; R=0/2 coverage:runtime-layer=0; K=0/30 coverage:kimi-layer=0; pins=6 match)';
    const rNew = bareProxy(homeWithSrc('home-new', 'Projects/ufo-fsd-alpha'));
    check('bare run (no --src): resolves to the first existing candidate ~/Projects/ufo-fsd-alpha', () => ({
      ok: rNew.status === 0 && verdictLine(rNew) === F1_MATCH,
      detail: `exit=${rNew.status} ${verdictLine(rNew).slice(0, 120)}`,
    }));
    const rLegacy = bareProxy(homeWithSrc('home-legacy', 'Projects/origin-work/ufo-fsd-alpha'));
    check('bare run (no --src): falls back to the legacy ~/Projects/origin-work/ufo-fsd-alpha when the new path is absent', () => ({
      ok: rLegacy.status === 0 && verdictLine(rLegacy) === F1_MATCH,
      detail: `exit=${rLegacy.status} ${verdictLine(rLegacy).slice(0, 120)}`,
    }));
    const homeBoth = homeWithSrc('home-both', 'Projects/ufo-fsd-alpha');
    mkdirSync(join(homeBoth, 'Projects', 'origin-work', 'ufo-fsd-alpha'), { recursive: true });
    const rBoth = bareProxy(homeBoth);
    check('bare run (no --src): the new path wins when BOTH candidates exist (candidate order is the spec)', () => ({
      ok: rBoth.status === 0 && verdictLine(rBoth) === F1_MATCH,
      detail: `exit=${rBoth.status} ${verdictLine(rBoth).slice(0, 120)}`,
    }));
    const homeNone = join(tmp, 'home-none');
    mkdirSync(homeNone, { recursive: true });
    const rNone = bareProxy(homeNone);
    check('bare run (no --src): both candidates absent keeps SRC_NOT_A_DIR (exit 2, never a scored zero)', () => {
      const want = join(homeNone, 'Projects', 'ufo-fsd-alpha');
      return {
        ok: rNone.status === 2 && fcToken(rNone) === 'SRC_NOT_A_DIR'
          && verdictLine(rNone).includes(`--src ${want} is absent`),
        detail: `exit=${rNone.status} ${verdictLine(rNone).slice(0, 110)}`,
      };
    });

    /* round-36 ─ PIN v1 (`kumitate-origin-pin-v1`) ------------------------- */
    // A pin is only as good as its assertion, so every case below runs the CLI
    // and checks the verdict text + exit map, never the resolver in isolation.
    // git is driven with a hermetic config (no system/global file, tmp HOME)
    // and GIT_CEILING_DIRECTORIES keeps discovery inside the fixture tmp tree,
    // so a non-repo fixture can never inherit an enclosing repository.
    const gitHome = join(tmp, 'git-home');
    mkdirSync(gitHome, { recursive: true });
    const gitRun = (cwd, argv2) => spawnSync('git', ['-C', cwd, ...argv2], {
      encoding: 'utf8', timeout: 60_000,
      env: {
        ...process.env,
        HOME: gitHome,
        GIT_CONFIG_NOSYSTEM: '1',
        GIT_CONFIG_GLOBAL: '/dev/null',
        GIT_OPTIONAL_LOCKS: '0',
        GIT_TERMINAL_PROMPT: '0',
      },
    });
    const fxGitRepo = (dir) => {
      if (gitRun(dir, ['init', '-q']).status !== 0) return null;
      const commit = gitRun(dir, ['-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid',
        '-c', 'commit.gpgsign=false', 'commit', '-q', '--allow-empty', '-m', 'fixture']);
      if (commit.status !== 0) return null;
      const head = gitRun(dir, ['rev-parse', 'HEAD']);
      return head.status === 0 ? String(head.stdout).trim() : null;
    };
    const writePin = (file, { revision, clone }) => {
      fxWrite(file, `${JSON.stringify({
        contract: 'kumitate-origin-pin-v1',
        repo: 'fixture',
        revision,
        clone,
        recreate: 'git init fixture && git commit --allow-empty',
        verified_at: '2026-10-21',
      }, null, 2)}\n`);
      return file;
    };
    const pinEnv = { GIT_CEILING_DIRECTORIES: tmp };

    // 1) default pin path: <self>/.ufo/pins/origin.json, src resolved from the
    //    pin's clone (NO --src on the command line), HEAD asserted, src-rev=.
    const P1 = fxBase('pin-match', { expect: F1.expect });
    const p1head = fxGitRepo(P1.src);
    const p1pin = writePin(join(P1.dir, '.ufo', 'pins', 'origin.json'), { revision: p1head, clone: P1.src });
    const P1_ARGS = ['--self', P1.dir, '--kimi-root', P1.kimi];
    const p1 = runProxy(P1_ARGS, pinEnv);
    const p1j = runProxy([...P1_ARGS, '--json'], pinEnv);
    const P1_VERDICT = typeof p1head === 'string'
      ? `${F1_MATCH.slice(0, -1)}; src-rev=${p1head.slice(0, 12)})`
      : '';
    check('PIN v1: default pin file resolves src from the pin clone, asserts HEAD, prints src-rev=', () => {
      const j = JSON.parse(p1j.stdout);
      return {
        ok: typeof p1head === 'string' && p1.status === 0 && p1j.status === 0
          && j.src === P1.src && j.srcRev === p1head
          && j.pin !== null && j.pin.file === p1pin && j.pin.revision === p1head
          && verdictLine(p1) === P1_VERDICT,
        detail: `exit=${p1.status} ${verdictLine(p1)}`,
      };
    });

    // 2) the pin asserts the RESOLVED tree even when --src is supplied: a
    //    different HEAD is refused, never scored under the pin's name.
    const P2 = fxBase('pin-mismatch', { expect: F1.expect });
    const p2head = fxGitRepo(P2.src);
    const p2pin = writePin(join(tmp, 'pin-files', 'mismatch.json'), { revision: '0'.repeat(40), clone: P2.src });
    const p2 = runProxy(['--self', P2.dir, '--kimi-root', P2.kimi, '--src', P2.src, '--pin', p2pin], pinEnv);
    check('PIN v1: pin revision != HEAD under an explicit --src → SRC_REV_MISMATCH (exit 2)', () => {
      const line = verdictLine(p2);
      return {
        ok: typeof p2head === 'string' && p2.status === 2 && fcToken(p2) === 'SRC_REV_MISMATCH'
          && line.includes(`${p2head.slice(0, 12)} != pin ${'0'.repeat(12)}`)
          && !line.includes('src-rev='),
        detail: `exit=${p2.status} ${line.slice(0, 130)}`,
      };
    });

    // 3) a pin whose tree is not a repository cannot be verified — exit 2,
    //    never "unpinned, therefore fine".
    const P3 = fxBase('pin-nonrepo', { expect: F1.expect });
    const p3pin = writePin(join(tmp, 'pin-files', 'nonrepo.json'), { revision: '3'.repeat(40), clone: P3.src });
    const p3 = runProxy(['--self', P3.dir, '--kimi-root', P3.kimi, '--pin', p3pin], pinEnv);
    check('PIN v1: a pin clone that is not a git repository → SRC_REV_UNVERIFIABLE (exit 2)', () => ({
      ok: p3.status === 2 && fcToken(p3) === 'SRC_REV_UNVERIFIABLE'
        && verdictLine(p3).includes('is not a repository HEAD'),
      detail: `exit=${p3.status} ${verdictLine(p3).slice(0, 120)}`,
    }));

    // 3b) a pin naming a clone that does not exist is SRC_NOT_A_DIR on the
    //     RESOLVED path (never a pin token, never a scored zero).
    const P3B = fxBase('pin-clone-absent', { expect: F1.expect });
    const p3bClone = join(tmp, 'nope-pin-clone');
    const p3bpin = writePin(join(tmp, 'pin-files', 'clone-absent.json'), { revision: '5'.repeat(40), clone: p3bClone });
    const p3b = runProxy(['--self', P3B.dir, '--kimi-root', P3B.kimi, '--pin', p3bpin], pinEnv);
    check('PIN v1: a pin whose clone is absent → SRC_NOT_A_DIR naming the resolved path (exit 2)', () => ({
      ok: p3b.status === 2 && fcToken(p3b) === 'SRC_NOT_A_DIR'
        && verdictLine(p3b).includes(`--src ${p3bClone} is absent`),
      detail: `exit=${p3b.status} ${verdictLine(p3b).slice(0, 120)}`,
    }));

    // 4) no pin anywhere: byte-identical legacy verdict, no src-rev=.
    const P4 = fxBase('pin-absent', { expect: F1.expect });
    const p4 = runProxy(args(P4), pinEnv);
    const p4j = runProxy([...args(P4), '--json'], pinEnv);
    check('PIN v1: no pin file → the legacy verdict is unchanged (no src-rev=, pin/srcRev null)', () => {
      const j = JSON.parse(p4j.stdout);
      return {
        ok: p4.status === 0 && p4j.status === 0 && verdictLine(p4) === F1_MATCH
          && j.pin === null && j.srcRev === null,
        detail: `exit=${p4.status} ${verdictLine(p4)}`,
      };
    });

    // 5) an explicit --pin that does not exist is PIN_MALFORMED, not "no pin".
    const p5 = runProxy([...args(P4), '--pin', join(tmp, 'pin-files', 'absent.json')], pinEnv);
    check('PIN v1: an explicit --pin that does not exist → PIN_MALFORMED (exit 2)', () => ({
      ok: p5.status === 2 && fcToken(p5) === 'PIN_MALFORMED' && verdictLine(p5).includes('absent'),
      detail: `exit=${p5.status} ${verdictLine(p5).slice(0, 120)}`,
    }));

    // 6) a file that names another contract is not a pin this gate may trust.
    const p6pin = join(tmp, 'pin-files', 'wrong-contract.json');
    fxWrite(p6pin, `${JSON.stringify({ contract: 'kumitate-other-pin-v1', revision: '4'.repeat(40), clone: P4.src })}\n`);
    const p6 = runProxy([...args(P4), '--pin', p6pin], pinEnv);
    check('PIN v1: a pin naming another contract → PIN_MALFORMED (exit 2)', () => ({
      ok: p6.status === 2 && fcToken(p6) === 'PIN_MALFORMED' && verdictLine(p6).includes('contract'),
      detail: `exit=${p6.status} ${verdictLine(p6).slice(0, 120)}`,
    }));

    /* 39-42 ─ usage --------------------------------------------------------- */
    const u1 = runProxy(['--bogus']);
    check('usage: unknown flag → exit 64, usage on stderr', () => ({
      ok: u1.status === 64 && /unknown argument: --bogus/u.test(String(u1.stderr ?? ''))
        && /usage: node scripts\/proxy-check\.mjs/u.test(String(u1.stderr ?? '')),
      detail: `exit=${u1.status} ${String(u1.stderr ?? '').split('\n')[0]}`,
    }));
    const u2 = runProxy(['--self']);
    check('usage: --self without a value → exit 64', () => ({
      ok: u2.status === 64 && /--self requires/u.test(String(u2.stderr ?? '')), detail: `exit=${u2.status}`,
    }));
    const u3 = runProxy(['--self', '--json']);
    check('usage: a value that is a flag is refused (--self --json) → exit 64', () => ({
      ok: u3.status === 64 && /--self requires/u.test(String(u3.stderr ?? '')), detail: `exit=${u3.status}`,
    }));
    const u4 = runProxy(['--scorecard', '']);
    check('usage: empty --scorecard value → exit 64', () => ({
      ok: u4.status === 64 && /--scorecard requires/u.test(String(u4.stderr ?? '')), detail: `exit=${u4.status}`,
    }));
    const u5 = runProxy(['--src']);
    check('usage: --src without a value → exit 64', () => ({
      ok: u5.status === 64 && /--src requires/u.test(String(u5.stderr ?? '')), detail: `exit=${u5.status}`,
    }));
    const u6 = runProxy(['--kimi-root']);
    check('usage: --kimi-root without a value → exit 64', () => ({
      ok: u6.status === 64 && /--kimi-root requires/u.test(String(u6.stderr ?? '')), detail: `exit=${u6.status}`,
    }));
    const u7 = runProxy(['--kimi-root', '--json']);
    check('usage: a value that is a flag is refused (--kimi-root --json) → exit 64', () => ({
      ok: u7.status === 64 && /--kimi-root requires/u.test(String(u7.stderr ?? '')), detail: `exit=${u7.status}`,
    }));

    /* 43 ─ hermeticity ------------------------------------------------------ */
    if (process.env.KUMITATE_PROXY_NESTED === '1') {
      results.push({
        name: 'hermeticity: nested --selftest under a polluted env',
        ok: true,
        skipped: true,
        detail: 'SKIP(nested) — the parent run already spawned this suite once',
      });
    } else {
      const nested = runProxy(
        ['--selftest', '--self', '/nonexistent/repo', '--scorecard', '/nonexistent/SCORECARD.md'],
        {
          KUMITATE_PROXY_NESTED: '1',
          KUMITATE_REPORTS_DIR: '/nonexistent/corpus',
          KUMITATE_MAIN_REPO: '/nonexistent/main',
          KUMITATE_LANE: 'not-a-lane',
          UFO_SRC: '/nonexistent/origin',
          KIMI_ROOT: '/nonexistent/kimi',
        },
      );
      check('hermeticity: `--selftest` ignores bogus --self/--scorecard and every env var', () => {
        const tail = String(nested.stdout ?? '').trim().split('\n');
        return {
          ok: nested.status === 0 && /^PROXY_SELFTEST: \d+\/\d+ pass$/u.test(tail.at(-2) ?? '')
            && tail.at(-1) === 'VERDICT: PASS',
          detail: `exit=${nested.status} tail=${tail.slice(-2).join(' | ')}`,
        };
      });
    }
    check('hermeticity: a planted GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE canary never reaches a fixture git writer', () => {
      const atEntry = GIT_LOCAL_ENV_VARS.filter((k) => process.env[k] !== undefined);
      const canary = fxDir('git-env-canary');
      const fixture = fxDir('git-env-fixture');
      Object.assign(process.env, {
        GIT_DIR: join(canary, '.git'), GIT_WORK_TREE: canary, GIT_INDEX_FILE: join(canary, 'index'),
      });
      scrubGitLocalEnv();
      const left = GIT_LOCAL_ENV_VARS.filter((k) => process.env[k] !== undefined);
      const r = gitRun(fixture, ['init', '-q']);
      const canaryEntries = readdirSync(canary).length;
      return {
        ok: atEntry.length === 0 && left.length === 0 && r.status === 0
          && existsSync(join(fixture, '.git')) && canaryEntries === 0,
        detail: `at-entry=${atEntry.length} left=${left.length} init=${r.status} canary-entries=${canaryEntries}`,
      };
    });

    /* 44-45 ─ meta ---------------------------------------------------------- */
    check('every declared finding kind fires in at least one fixture', () => {
      const missing = FINDING_KINDS.filter((k) => !observed.has(k));
      return { ok: missing.length === 0, detail: missing.length ? `never fired: ${missing.join(', ')}` : `${observed.size} kinds observed` };
    });
    check('every declared fail-closed arm fires in at least one fixture', () => {
      const missing = FAIL_CLOSED_KINDS.filter((k) => !observedFc.has(k));
      return { ok: missing.length === 0, detail: missing.length ? `never fired: ${missing.join(', ')}` : `${observedFc.size} arms observed` };
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const passed = results.filter((r) => r.ok).length;
  const width = String(results.length).length;
  const lines = [`kumitate proxy-check --selftest (hermetic, node ${process.version})`];
  results.forEach((r, i) => {
    const word = r.skipped ? 'SKIP' : r.ok ? 'PASS' : 'FAIL';
    lines.push(`${word}  [${String(i + 1).padStart(width)}/${results.length}]  ${r.name} — ${r.detail}`);
  });
  lines.push(`PROXY_SELFTEST: ${passed}/${results.length} pass`);
  lines.push(`VERDICT: ${passed === results.length ? 'PASS' : 'FAIL'}`);
  process.stdout.write(`${lines.join('\n')}\n`);
  return passed === results.length ? 0 : 1;
}

/* --------------------------------------------------------------------- main */

function parseArgs(argv) {
  const opts = {
    self: DEFAULT_SELF,
    scorecard: null,
    src: null,
    pin: null,
    pinInfo: null,
    srcRev: null,
    kimiRoot: DEFAULT_KIMI_ROOT,
    json: false,
    strict: false,
    selftest: false,
    help: false,
  };
  const dirValue = (flag, v) => {
    if (v === undefined || v.trim() === '' || v.startsWith('-')) {
      throw new Error(`${flag} requires a non-empty directory (got ${JSON.stringify(v)})`);
    }
    return resolve(v);
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '--self') opts.self = dirValue(a, next());
    else if (a === '--scorecard') opts.scorecard = dirValue(a, next());
    else if (a === '--src') opts.src = dirValue(a, next());
    else if (a === '--pin') opts.pin = dirValue(a, next());
    else if (a === '--kimi-root') opts.kimiRoot = dirValue(a, next());
    else if (a === '--json') opts.json = true;
    else if (a === '--strict') opts.strict = true;
    else if (a === '--selftest') opts.selftest = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  if (opts.scorecard === null) opts.scorecard = join(opts.self, SCORECARD_FILE);
  // The origin tree — and whether a pin asserts it — is resolved in `runCheck`
  // (never for `--selftest`/`--help`, which win first), so a bare check run
  // stats no live path until it is actually about to score one, and a pin can
  // supply the tree when `--src` is absent (PIN v1 precedence: --src, pin
  // clone, legacy default).
  return opts;
}

function main() {
  const started = Date.now();
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`proxy-check: ${e.message}\n\n${USAGE}`);
    return 64;
  }
  if (opts.selftest) return selfTest();
  if (opts.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  try {
    return runCheck(opts, started);
  } catch (e) {
    return failClosed(opts, 'INTERNAL_ERROR', e && e.message ? e.message : String(e), {}, started);
  }
}

process.exitCode = main();