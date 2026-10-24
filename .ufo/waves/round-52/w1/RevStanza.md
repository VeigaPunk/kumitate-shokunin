# RevStanza — independent stanza derivation for the round-52 close (L1 input)

Seat `RevStanza`, independent leaf. Tree scored: `git archive f539a71e` extracted to
`/tmp/r52-revstanza.VY3NRQ` (committed bytes only; no writes in the lane outside
`.ufo/waves/round-52/build/RevStanza/` and this report). Node v24.21.0. No installs.
Evidence bundle: `.ufo/waves/round-52/build/RevStanza/{derivation.md,matrix.txt,g-stanza.txt,g-gate-pins.txt}`.

## 1. The block that prints MATCH

Run: `cd <extracted f539a71e> && node scripts/proxy-check.mjs --strict`
(default `--self` = the extracted tree; the committed `.ufo/pins/origin.json` resolves the
origin to `/fast/scratch/hyaku/kumitate-pin/src` @ `31c465f15669`, asserted).

**Assignment tree** = freeze + the two frozen probes (already counted) + the delivered v2
installed at `scripts/receipt-attest.mjs` + the one README row that repairs the inherited
drift. Exact block (23 keys, verified accepted):

```text
<!-- kumitate-proxy-v1
A=73
C=23
C1=19
C1_total=19
C2=118
C2_total=118
S_members=88
S_sections=88
R_members=92
R_sections=92
coverage_script=10
coverage_runtime=10
C1k=5
C1k_total=5
K_members=53
K_sections=53
coverage_kimi=10
pin.cite-check=7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2
pin.surface-probe=79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35
pin.round-gate=09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594
pin.proxy-check=495e5164ffe4b3500f128f256699b6f82e0d1e54b5618fafbe81b2b857af63e9
pin.claims-check=de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14
pin.kimi-census=9d27bc9c12546e07f8c54d36dcc73b50cfab56bf3198674febefd6c23ef84f50
-->
```

Verdict, verbatim (exit 0):

```text
PROXY: MATCH (A=73 C=23 operability=9; C1=19/19 C2=118/118 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
```

The six v1 pins are unchanged (no pinned script is touched this round). The v2 cutover is
**A-neutral** — it replaces the same path (`scripts/receipt-attest.mjs`, v1 sha
`44919763…f48e8d9` → v2 sha `9531e89827fdfb0a345b0ce613318163d5ae7a42d6d176426ce2cbdaa36ba74e`,
selftest `ATTEST_SELFTEST: PASS (42/42)`). The gate-pin line must move with it:
`pin.receipt-attest=9531e89827fdfb0a345b0ce613318163d5ae7a42d6d176426ce2cbdaa36ba74e`.

**Full close shape** (plan §Close sequence item 1: the entry **and** `lessons/round-52.md`,
plus the drift-repair row and both new rows): identical block with `C2=120` and
`C2_total=120`; verdict `PROXY: MATCH (A=73 C=23 operability=9; C1=19/19 C2=120/120
coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10;
K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)` exit 0.

Every other stanza key and all five `## Axes` rows are already correct **only** when
`C2 == C2_total`: `coverage` stays 10, so no axis row needs editing.

## 2. Findings (severity order)

### S1 — HIGH, claim-critical: the plan's baseline quote omits `A_DRIFT`; the close must repair `A` too
`plan.md:15-17` quotes only `C2_TOTAL_DRIFT` and `AXES_DRIFT`, but its own executed receipt
`base/baseline-gates.txt:5,8` carries `A_DRIFT A: declared=71 computed=73 delta=+2`. I
reproduced it at `f539a71e` (matrix `D_plan_literal`): a close that follows H3's literal
wording ("the +1 README map row", `plan.md:174`) and bumps only `C2/C2_total` reads
`PROXY: DRIFT (A_DRIFT term=A declared=71 computed=73 delta=+2)` exit 1 → B5 MISS →
`ATTEST52_UNMET`. The stanza must declare **A=73** (16 `scripts/*.mjs` + 57 `.ufo`
artifacts; the two frozen probes are the +2 over the r51-close 71). Corroborated
independently by `w1/ExecPinsRecipe.md:23` and the ScribeScorecard draft's own terms slot.

### S2 — HIGH, claim-critical: the close adds TWO notes, so THREE README rows are required
`plan.md:172-174` (H3) and the close sequence name one row ("the unrowed note"). The close
sequence also commits `corpus/knowledge/fail-closed-clock-validation.md` **and**
`corpus/lessons/round-52.md`. Each note is `C2_total +1`; each needs its own row to keep
`C2 == C2_total`. Measured consequences (matrix):
- missing both new rows: `C2=118/120` → `AXES_DRIFT coverage row=10 derived=9` exit 1 (`C_close_rows_missing`);
- missing only the lesson row: `119/120` → same `AXES_DRIFT` exit 1 (`K_no_lesson_row`);
- missing only the drift row, both new rows present: `119/120` → same `AXES_DRIFT` exit 1 (`L_no_drift_row`);
- all three rows: `120/120` → MATCH exit 0 (`I_close_shape`).

The inherited unrowed note is independently identified as
`corpus/lessons/round-51-verifier-spotcheck.md` (117 rows / 118 notes; no stale or duplicate
rows), which matches `build/ExecStanzaDrift/README-row.md`.

### S3 — HIGH: peer projections disagree with each other and with the close shape
- `build/ExecPinsRecipe/d-scorecard-stanza-recipe.md`: **A=74**, `C2=C2_total=119`.
  - A=74 is right only if the build copy `build/ExecInstrumentV2/receipt-attest.mjs` is
    committed *in addition to* the in-place `scripts/receipt-attest.mjs`; the plan's cutover
    is the same path, so A=73 (matrix `J_v2_build_copy` proves the +1 when both are committed).
  - 119/119 omits `corpus/lessons/round-52.md`; with it the pair is 120/120.
- `build/ScribeScorecard/scorecard-round-52.md` (integration fill list item 8): targets
  `C2=118` — only the drift row, no new-note rows.
- Neither is a measured run; both say so. **My numbers are measured** on the extracted tree
  (matrix, `g-stanza.txt`).

### S4 — HIGH: committing wave build artifacts moves `A` by one per file, and the working tree is already above 1000
`RE_RUNNABLE` counts every `.mjs/.js/.sh/.py` in the whole tree outside `.git`
(`proxy-check.mjs:495,682`). While I measured, the live lane working tree read `A=1038`
earlier in this run and `A=1165` at `2026-10-24T04:12:04Z`; `.ufo/waves/round-52/build/`
alone held 1092 runnable files (seat fixture trees, 7 nested `.git`s) — counts are
time-sensitive while the wave runs. Committing `build/` wholesale would make any
pre-planned A wrong (the block would have to declare >1000 and move with every seat
file). B5c only needs
`build/MutCounter52/counter-mutant.txt` (a `.txt`, A-neutral; content verified to satisfy
the probe's regex: `ATTEST52_UNMET`, `held=0/0`, `exit 1`). Commit only the named artifacts
and no other `.mjs/.js/.sh/.py` under `.ufo/waves/round-52/build/`.

### S5 — MEDIUM: the A52 probe's `UFO_SRC` is inert under the active pin
`attest52-probe.mjs:424` runs the extracted `proxy-check.mjs --strict` with
`env.UFO_SRC = ORIGIN` (comment: "UFO_SRC = live origin checkout", `:64`). `resolveOrigin`
(`proxy-check.mjs:414-437`) resolves `--src` → **pin clone** → legacy default, and
`resolveSrcDefault` (`:326`) is only reached when no pin exists. The committed pin wins; the
live checkout is never scored. Measured: `--src /home/vgpnk/Projects/ufo-fsd-alpha` →
`PROXY: FAIL-CLOSED (SRC_REV_MISMATCH)` exit 2 (HEAD 093edb97 ≠ pin 31c465f1); removing the
pin and setting `UFO_SRC` scores the live checkout and yields the same S/R terms
(88/88, 92/92) but drops `src-rev=`. Today the terms agree, so this is a documentation /
provenance defect, not a numeric drift — but the header claim should be corrected (name the
pin, not `UFO_SRC`), because the two trees are only coincidentally equal.

### S6 — MEDIUM: `pin.receipt-attest` must be re-derived, or `--strict` still exits 1
With v2 installed and the gate pin left at the v1 hash, `proxy-check --strict` exits 1 with
`GATE_PIN_DRIFT pin.receipt-attest declared=44919763… computed=9531e898…` (matrix
`H_v2_stale_pin`), even though the six-key block matches. H3's `PROXY: MATCH pins=6 match`
covers only the v1 pin block; the `kumitate-gate-pins-v1` block is a separate, error-severity
gate pin (`SCORECARD.md:322`).

### S7 — MEDIUM: H3's quoted line is not verbatim
`plan.md:172` quotes `PROXY: MATCH pins=6 match`. The emitted line is
`… K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)` — with the pin active
the `src-rev=` suffix is mandatory (`proxy-check.mjs` header, verdict contract). Quote the
full line (section 1) in SCORECARD/H3/close receipts.

### S8 — MEDIUM: notes and their rows must land in the same tip R1
The A52 probe's B5 scores the archive of `<rev>` (B5: `git archive` → extracted tree →
`proxy-check --strict`). A note committed at R1 without its row derives coverage 9 and the
FINAL receipt reads `ATTEST52_UNMET` even if a later commit repairs it — exactly the
R52-11 class the close sequence exists to close. Order the integration commit so entry,
lesson, drift row and both note rows are all in R1.

### S9 — MEDIUM: K terms are live and environment-bound
`K_members=53, K_sections=53, coverage_kimi=10` are read live from `~/.kimi-code` and the
lane's `kimi-*.md` notes at run time (53/53 at the freeze receipt and at my runs). Any host
change between now and the close moves the term; a missing/renamed root is
`KIMI_ROOT_NOT_A_DIR` exit 2 → B5 FAIL. Run the close as the same user with the same
`HOME`/`KIMI_ROOT`.

### S10 — LOW: peer dependency gaps
`build/ExecStanzaDrift/` holds only `README-row.md` (correct text, no report in `w1/`, no
computed stanza); `w1/ExecPinsRecipe.md` is explicitly arithmetic, not measured. Both are
recorded as dependencies, not as measured agreement.

### S11 — LOW (context): the archive reading is the judged one
The r51 precedent shows the trap: `.ufo/waves/round-51/close/FINAL-57333ead….txt:1` records
the probe's `A declared=81 computed=71` while line 5 of the same file shows a working-tree
`PROXY: MATCH (A=81 …`. Declare the archive value (73, or 73+committed runnables), never a
working-tree value. Related: a declaration-only edit at base (`C2_total 117→118`, Axes
`10→9`) makes B5 pass with no real repair (`w1/MutStanza.md:53-61`) — the honest close keeps
`C2 == C2_total` and coverage 10, which is what the block above does.

## 3. Residual risk

- The close's exact A is a function of what the L1 commits: 73 is the floor for the plan's
  cutover (+0 for v2, +0 for the `.txt` transcript, +1 per any other committed runnable).
- `C2=120` assumes exactly the entry + `lessons/round-52.md`; a third note adds 1 and needs
  a row.
- The live K terms (S9) and the pin clone's presence at
  `/fast/scratch/hyaku/kumitate-pin/src` (present, HEAD 31c465f1, read-only) are host
  dependencies of the close run.
- The `## Axes` `coverage` row's *evidence text* has long been stale ("C2 53/53", retirement
  era); the integer is what is gated and it is 10 both before and after this round.

## 4. Verification gaps

- I could not run the A52 probe end-to-end (it needs the three committed receipts, the
  doctored control and `build/MutCounter52/counter-mutant.txt` in the archive; none are
  committed yet). I replicated B5's exact subprocess — extracted archive as `--self`, no
  `--src`, `--strict` — in fixtures G/I, which is the same code path.
- No measured peer artifact existed to cross-check against (S10); both peer values are
  projections and disagree (S3).
- Out of scope: D52's E1–E5 (entry/OBS), E2 clause binding, the receipts' spans, and the
  gate battery H1/H2/H4/H5.

## 5. Tooling

No installs or upgrades (node v24.21.0 system). No lane writes outside
`.ufo/waves/round-52/build/RevStanza/` and this report; no git/jj mutations; read-only
commands only.

Report: `.ufo/waves/round-52/w1/RevStanza.md`
