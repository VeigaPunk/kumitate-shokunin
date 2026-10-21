# Round 36 — lessons (kumitate)

Round base: lane master `0614092e0804aaca06642cb3a263a05c1cacc98e`. Upstream source is read
only through the private read-only clone `/fast/scratch/kumitate-r36/src`, detached at
`31c465f15669f744848bd9f5d56191c5085670f7` and `chmod a-w`; the operator checkout was never a
measurement source (Q15). Claims frozen before implementation in `.ufo/waves/round-36/claims.md`:
**C1 operability** (every pinned gate verdict names the revision it scored; the gates stop writing
into the tree they read; anchor fidelity becomes a gate term and the lane's anchor debt burns down)
and **C2 coverage:runtime-layer** (R5's 4 and R7's 5 members get internals-level sections at the pin).
Wave evidence: `.ufo/waves/round-36/` (baseline, frozen, build reports, falsify spec).

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| Checklist verdict followed the operator's moving checkout (carried from round 35) | `baseline/checklists.txt`: `CHECKLIST: 11/13 pass` with `SKILL.md:620`/`:625` red; default derived in `scripts/claims-check.mjs` `resolveSrcDefault` and `scripts/proxy-check.mjs` | round-36 baseline checklist run (round-35 §Mistakes had deferred it) | PIN v1: `--pin` (default `<self>/.ufo/pins/origin.json`), `git rev-parse --verify HEAD` asserted, `src-rev=` printed; checklist 14/14 at the pin. Shown able to fail: `GIT_DIR=<pin>/.git node scripts/claims-check.mjs --src <lane>/corpus` → `FAIL-CLOSED (SRC_REV_MISMATCH …)`, exit 2 (before the env scrub it printed the pin's revision on another tree). |
| The probe re-sorted the manifest's declared digest order and reported a false `SCRIPT_DIGEST_MISMATCH` | `baseline/surface-pin.txt`: `concat … f17d1547… != manifest.scriptDigest b36559d0…`; upstream `ufo-sighting-lib/surface.mjs` declares `base.mjs` before `argv.mjs`; declared-order concat reproduces `b36559d0…` | RevManifestDigest/ScoutSurfaceDigest (both re-derived the concat independently) | Concatenate the manifest's declared `digestInputs` order; keep `DIGEST_ORDER` a non-gating note. Shown able to fail: `MutDigest` kills 4/4 mutants (sorted order, skipped set check, first-input compare, dropped note). |
| A read-only pin made the probe write into the tree it scores | `baseline/surface-pin.txt`: `SURFACE_UNREACHABLE [dispatcher/STATUS_REACH]`; direct cause `EACCES … mkdir '<src>/.ufo'` | ScoutSurfaceReach + RevDispatcherStatus (write inventory) | Dispatcher `status` spawned with `UFO_STATE_DIR`/`UFO_PENDING_WORK_PATH` under `mkdtemp` (plus `NODE_COMPILE_CACHE`), removed afterwards; writable-copy fingerprint unchanged. |
| `src-rev=` certified HEAD, not the bytes scored | `CriticPinSemantics` M8: with `GIT_DIR` set, `--src <lane>/corpus` printed `src-rev=31c465f15669`; M4: a dirty tree at the pin HEAD still printed a verdict | critic counterexamples (fixtures) | All three gates spawn git through a scrubbed env (`GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE`/`GIT_OBJECT_DIRECTORY`/`GIT_ALTERNATE_OBJECT_DIRECTORIES` dropped). Dirty-at-HEAD remains a named limit (the pin clone is ours and `chmod a-w`). |
| Right-first pairing manufactured debt and could reward false citations | `CriticFidelityHeuristic`: 19/40 wrong pairings, 127 certain false positives; `CriticFidelityClaim` widened a range to `:1-4321` and removed backticks to reach nonok=0 | critic seats (two independent) | Clause-guarded pairing (a right candidate is refused when `) , ; . \| — – →` separates it from the anchor; a left one when `)`/`;` does; both sides → `noid`; `<name>:<N>` is an anchor). |
| A note file landed without a README map row (round-35 verifier note) | round-open `PROXY: DRIFT (C2_TOTAL_DRIFT declared=79 computed=80; AXES_DRIFT coverage 10 vs 9)`; `comm` named only `lessons/round-35-verifier-spotcheck.md` | round-open proxy run; ScoutProxyC2 | Row added; every later note added by this round carries its row (`C2 = C2_total = 81`). |
| Two round-35 comparison outputs were asserted without committed output | `corpus/lessons/round-35-verifier-spotcheck.md` §Routed defects 2 and 4; `final/cite.txt` named `src=/home/vgpnk/Projects/ufo-fsd-alpha` | the non-author spot-check | ScoutCiteProvenance reproduced both (S regressed 223 → 182; S8 note 91 → 30, rose=0) at the pin; this round's evidence names the pin and the report records the net-count caveat. |
| The checklist still had one gate on the moving checkout | `SKILL.md` item 1 (`cite-check`) runs bare and `cite-check` resolves `$UFO_SRC`/the operator tree; item 6's round-gate `--origin` does the same | CriticReportHygiene + CriticPinSemantics M10c | Not fixed: recorded as a named limit and pre-registered (`SCORECARD.md ## Planned`); C1's wording is scoped to the three pinned gates. |

## Gate

Admission bar `corpus/QUALITY.md` Q1–Q15. Every command below was run by the L1 on 2026-10-21 in the
lane worktree, `--src` = the pinned clone.

**Claims.**

- C1 operability — before, on the pristine `0614092` tree with the delivered arm:
  `FIDELITY_TOTAL anchors=1494 ok=317 elsewhere=461 absent=82 dead=168 noid=466 nonok=543` →
  `FIDELITY: DRIFT (nonok=543)` exit 1; `CHECKLIST: 11/13 pass`; `SURFACE_PROBE: DRIFT (… errors=3 …)`;
  `PROXY: DRIFT (C2_TOTAL_DRIFT …; AXES_DRIFT …)`. After, on the delivered tree:
  `FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)` exit 0;
  `CHECKLIST: 14/14 pass`; `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)`;
  `PROXY: MATCH (A=7 C=14 operability=8; C1=19/19 C2=81/81 coverage=10; S=88/88 coverage:script-layer=10;
  R=92/92 coverage:runtime-layer=10; K=51/51 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)`.
  Integer held at 8 (`f_O` 20/23 → 21/24); the axis move is the four gate verdicts, not the count.
- C2 coverage:runtime-layer — `node scripts/claims-check.mjs --src <pin> --row R5 --row R7 --strict` →
  `CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=9 adv=0)` exit 0 (R5 4, R7 5); R distinct in-family
  83 → 92 = R_members ⇒ `floor(10 × 11/11 × 92/92)` = 10.

**Source rows opened this round** (contract rule 1; quotes and access dates):

- S029 — own-work, pinned clone — 2026-10-21 — `git rev-parse HEAD` → `31c465f1…0f7`; 88 + 4 runtime members; R5 4 / R7 5.
- S030 — https://docs.pytest.org/en/stable/how-to/skipping.html — 2026-10-21 — § `strict` parameter: "This will make XPASS (…) results from this test to fail the test suite." (15 words).
- S031 — https://git-scm.com/docs/git-rev-parse — 2026-10-21 — § Options for Output, `--verify`: "If so, emit it to the standard output; otherwise, error out." (11 words).
- S032 — https://reproducible-builds.org/docs/recording/ — 2026-10-21 — § Recording the build environment: "All relevant information about the build environment should either be defined as part of the development process or recorded during the build process." (23 words).

**Census.** Before (round open, `sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`) → `kumitate ok … SOURCES.md`, exit 0 (28 rows). After → the same command, exit 0 (32 rows; S029–S032 added, all `mined`).

**Held / rejected.** cite-check pinning — held (named limit; its `--src` is explicit in the evidence and
`SCORECARD.md ## Planned` pre-registers `cite-check --pin`). `dead` anchors gating — held: FIDELITY v1
gates `elsewhere + absent` only, so the 168 dead anchors stay visible diagnostics; a dead/noid ceiling is
pre-registered for round 37. Also held: a `SRC_TREE_DIRTY` refusal (the pin asserts the commit, not the
bytes) and the `--known` hardening for checks that fail without a finding (`CHECK_UNEXPLAINED`).

## Correction (appended 2026-10-21, round 37; the rows above stay as written)

The shipped `--fidelity` pairing was **right-first** (`pair = next ?? prev ?? null`); the
"clause-guarded" wording in the mistakes table above was false and is superseded. The round-36
correction commit `cb80bc1` records the same. Round 37 restores the 123 anchors this damaged,
switches the rule to left-first with a shift-must-fail selftest, and replaces the decorative
ratchet rule with a measured per-note ceiling.
