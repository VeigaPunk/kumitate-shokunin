# K76ScoutInsert — read-only insertion recon (round 76, lane axes: operability + coverage)

Design file (deliverable): `.ufo/waves/round-76/build/K76ScoutInsert/design.md`
Anchor revision: `cabc7aefd5f1562299f757e23207710c12e4ed58` (scratch `git clone --shared`, HEAD verified,
`git status --porcelain` empty). Lane tree not edited. Tool installs: none.

## Numbers

- **C1 `args(...)` helper call sites: 86 uses** (87 occurrences of `args(` in
  `scripts/proxy-check.mjs`; the 87th is the definition at `:1709`). 65 are the direct
  `runProxy(args(…))` form; the rest are `[...args(P4), …]` spreads and `fc(…, args(K_BAD_VALUE), …)`.
  Injecting `--omp-root` at `:1709` covers all 86.
- Non-`args()` sites that reach derivation and must also pass `--omp-root`: `d2` `:2448`,
  `bareProxy` `:2786`, `P1_ARGS` `:2931` (plus `p2/p3/p3b` for uniformity — they fail earlier).
- Base selftest `n = 132` (`PROXY_SELFTEST: 132/132 pass`), so plan (f)'s `n ≥ 135` means ≥ 3 net
  new cases.

## Base measurements (all run at `cabc7ae`, paste-ready)

```
OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=64 findings=0 bound=35/35)        exit 0
README_MAP: DRIFT files=182 rows=181 covered=181 bad=2 first=uncovered:lessons/round-75-verifier-spotcheck.md  exit 1
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=181 computed=182 delta=+1; AXES_DRIFT term=coverage declared=10 derived=9; src-rev=31c465f15669)  exit 1
PROXY_SELFTEST: 132/132 pass / VERDICT: PASS                                            exit 0
node scripts/proxy-check.mjs --json | grep -c '"coverage_omp"'                          → 0
node scripts/proxy-check.mjs --json | grep -n  '"coverage_kimi"'   → line 40 number, line 98 string (echo doubles every term)
grep -c '^| O1 |' SCORECARD.md                                                          → 0
spotcheck files 42 / spotcheck README rows 41 / spotcheck pin entries 41 → exactly one file missing both: lessons/round-75-verifier-spotcheck.md
README rows 181; last lessons row = line 306 (lessons/round-75.md); line 307 is a knowledge row
pin covered 181, ASCII-sorted (0 position diffs); round-75.md at index 177
CITE_CHECK: DRIFT (files=187 tokens=13047 errors=1959 warnings=886)                      exit 1
grep -c '^export ' scripts/omp-census.mjs → 0 ; scripts/readme-map.mjs → 0
```

## Three risks (silent-break class) and their detection

1. **The `declared` echo doubles `coverage_omp`.** `proxy-check.mjs:1445` `declared: stanza.values`
   mirrors every stanza key, so each term key appears twice in `--json` (measured: `coverage_kimi`
   at output lines 40 and 98 → `grep -c` = 2). Predicate (a)'s `grep -c '"coverage_omp"' → 1`
   is unsatisfiable unless `declared` filters the O keys. *Detection:*
   `node scripts/proxy-check.mjs --json | grep -c '"coverage_omp"'` must print `1`; the
   `coverage_kimi` count (`2`) is the control that proves the mechanism.
2. **Putting the O keys into `TERM_KEYS`.** Breaks the frozen assertions `TERM_KEYS.length === 17`
   (`:1836`) and the `parentV1Keys` 23-key literal (`:1840-1841`), and turns every fixture's exact
   `kindsEq` array into an O-drift assertion. *Detection:* `--selftest`; plus print
   `TERM_KEYS.join(' ')` before/after and require it unchanged (only `STANZA_KEYS` may grow, 23 → 29).
3. **O terms reading the live `~/.omp/agent` inside the hermetic suite.** Any derivation-reaching
   `runProxy(` without `--omp-root` stat's the operator's root; verdicts flip and `d2`'s strict
   `['A_DRIFT']` breaks. *Detection:* run `--selftest` with `OMP_AGENT_ROOT=/nonexistent` (must still
   pass), and audit the four sites named above; the existing hermeticity case scrubs `UFO_SRC` and
   `KIMI_ROOT` but not `OMP_AGENT_ROOT`.

(A fourth, cost-only risk: extending the verdict line costs 10 byte-exact literals — `:1756`,
`:1766`, `:1772`, `:1873`, `:2155`, `:2477`, `:2647`, `:2688`, `:2788`, plus `P1_VERDICT` at `:2937`.
The plan does not require it; recommend not touching the line.)

## Plan/code contradictions (verbatim)

- **Token name.** Plan: "it must be refused (`STANZA_UNKNOWN_KEY`)". Code: `proxy-check.mjs:1081`
  `kind: 'STANZA_KEY_UNKNOWN'` (declared `:643`; asserted `:2542`, `:2718`, `:2745`). The base tool
  cannot print `STANZA_UNKNOWN_KEY`.
- **grep count.** Plan: "`node scripts/proxy-check.mjs --json | grep -c '"coverage_omp"'` → **1**".
  Code `:1445` `declared: stanza.values,` echoes the key a second time → it would read 2. The plan
  never says to filter `declared`; only that filter makes (a) literal.
- **Exports.** Plan: "exports its declared-member tables and its shape decision for in-process
  import". Code: `omp-census.mjs` has zero `export` statements today, so "contract unchanged" must be
  read as CLI/verdict unchanged + module exports added (and `pin.omp-census` re-pinned).
- **Family arithmetic.** Plan: "registry families (19 → 20 for S/R, plus K/O plane families)".
  Code/data: `SCORECARD.md:121` `#### In-scope surface registry (19 families)` where 19 = the S+R
  rows (8+11); adding O1 leaves S+R at 19. No gate reads that header; it is a scribe prose decision.
- **C2 (b) vs (e).** Plan (b) quotes the line `SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-75-verifier-spotcheck.md`;
  plan (e) requires "fields `wrote=row|pin|both` on the `ADOPTED` line". Both cannot be byte-exact;
  implement `… ADOPTED <rel> wrote=<both|row|pin>` and match (b) by prefix.
- **C1(b) cross-claim coupling.** Plan (b) needs `--strict` exit 0 `PROXY: MATCH`, but at base the run
  is `PROXY: DRIFT (C2_TOTAL_DRIFT declared=181 computed=182; AXES_DRIFT coverage declared=10
  derived=9)`. MATCH requires C2's repair (182), its gate pin, and the re-measured
  `pin.omp-census`/`pin.proxy-check` — integrate C2 before measuring C1(b).
- **Oracle defect (not to be fixed).** `readme-map.mjs:224` `statSync(full);` references an undefined
  `full`, so every symlink covered entry reads `stale-covered:`, never the `covered-not-file:` the
  header (`:44-49`) promises. The oracle stays byte-unchanged; the adopt tool must refuse symlink
  targets itself.

## Insertion summary (details + anchors in design.md)

- C1: `omp-census.mjs` four `export` keywords only (`:56`, `:92`, `:108`, `:199`); `proxy-check.mjs`
  — `DEFAULT_OMP_ROOT` after `:500`, `O_TERM_KEYS` after `:511`, `STANZA_KEYS` `:521`,
  `pin.spotcheck-adopt` in `GATE_PINS` after `:548`, `AXIS_ROWS` `:557`, `RE_O_ROW` `:577`,
  `FINDING_KINDS`/`FAIL_CLOSED_KINDS` `:631`/`:640`, USAGE `:648`, `oTerms` after `:1002`,
  `deriveTerms` `:1019`, `runCheck` guards after `:1352` + note arm after `:1389` + gather `:1411`,
  JSON bodies `:1324`/`:1438`, `declared` filter `:1445`, O compare loop `:1156`, `parseArgs`
  `:3135`/`:3150`, fixtures `:1521`/`:1577`/`:1599`/`:1669`/`:1709`.
- C2: README row inserted after the last `lessons/` row (line 306 → new 307); pin entry at its
  ASCII index (before `lessons/round-75.md`, index 177); oracle child invoked with
  `--readme/--registry/--corpus knowledge/--corpus lessons` (absolute paths; both corpora required);
  refusals `REFUSED_OUT_OF_SCOPE` / `REFUSED_NOT_SPOTCHECK` / `REFUSED_ABSENT` / oracle FAIL-CLOSED /
  post-write-not-CLEAN; selftest ≥ 12 cases via child invocations on `mkdtemp` fixtures.
