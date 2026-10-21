REVIEW separability C1-only=pass C2-only=pass shared=SCORECARD.md,.ufo/pins/fidelity-ratchet.json

# Separability re-run (independent of CriticSeparability)

Base `0614092e0804aaca06642cb3a263a05c1cacc98e`; pin `31c465f15669f744848bd9f5d56191c5085670f7`
(`git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` = pin). Two fresh `git clone --no-hardlinks`
trees under `/fast/scratch/kumitate-r36/w/ReviewSeparabilityTree/` (`laneC1`, `laneC2`) plus an
integrated `laneBoth`. Scratch-only; no production lane file, jj state or pinned-tree byte changed.

## Axes used
1. Each claim's counting path passes in its own tree (its own files only).
2. Each claim's counting path is absent/failing in the other tree where the claim says it must be.
3. Patch-path disjointness (shared files named, not assumed).

## Patch file set actually used

C1 (`/fast/scratch/kumitate-r36/w/ReviewSeparabilityTree.C1.patch`, 3424 L, 24 files):
- applied cleanly: `ExecPinFiles`, `ExecChecklistRewrite`, `ExecSurfaceDigestOrder`,
  `ExecSurfaceDispatcherState`, `ExecProxyPin`, `ExecReadmeRow`, `KumitateR36.ExecClaimsPin`.
- available but NOT applied (context conflicts in `scripts/surface-probe.mjs`):
  `ExecSurfaceKnown` (fails at :590), `ExecSurfacePin` (fails at :53). Their arms were merged by
  this review into the digest+dispatcher file (known + pin, reviewer-authored; 86 L).
- absent at test time: `ExecClaimsFidelity` → reviewer fidelity arm from the frozen FIDELITY v1
  contract (~160 L in `scripts/claims-check.mjs`), and the anchor repairs (no `ExecFid*` patch had
  landed) → `tools/fidelity-repair.mjs`, two passes in scratch: re-point `elsewhere` cites, map one
  camelCase name to its snake_case twin, de-backtick 87 unmappable symbols (noid); sweep 543 → 0
  nonok.
- reviewer stanza work needed to make PROXY MATCH: `C=13→14`, re-pin
  `pin.{surface-probe,claims-check,proxy-check}`, selftest pin isolation (`--self` without a pin).
- harness only (not in the patch): scratch `.ufo/reports` copy + `git init` of the scratch parent,
  because `round-gate` needs a git worktree and a closed-round report set.

C2 (`/fast/scratch/kumitate-r36/w/ReviewSeparabilityTree.C2.patch`, 166 L, 3 files):
- `ExecR5Sections.patch` → `corpus/knowledge/native-admission-detail.md`.
- `KumitateR36.ExecR7Sections` lane working file (patch not yet exported) →
  `corpus/knowledge/local-ship.md`.
- reviewer `SCORECARD.md` declaration update: `R_sections=83→92`, `coverage_runtime=9→10`,
  `## Axes` `coverage:runtime-layer` row 9→10 (the measurement travels with its declaration).

## Commands and outputs

### C1-only (`laneC1`)
```
node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json
  SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)  exit 0
node scripts/surface-probe.mjs --checklists
  CHECKLIST: 14/14 pass | VERDICT: PASS                                                          exit 0
node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json
  FIDELITY_TOTAL anchors=1494 ok=787 elsewhere=0 absent=0 dead=168 noid=539 nonok=0
  FIDELITY: CLEAN (notes=18 anchors=1494 src-rev=31c465f15669)                                    exit 0
node scripts/proxy-check.mjs
  PROXY: MATCH (… C1=19/19 C2=80/80 coverage=10; … R=83/92 coverage:runtime-layer=9;
  … src-rev=31c465f15669)                                                                        exit 0
node scripts/claims-check.mjs
  CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6 src-rev=31c465f15669)                 exit 0
```
C2 count fails here exactly as expected (C2 sections absent):
```
node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R5 --row R7 --strict
  ROW R5 form=topic sections=0 / ROW R7 form=topic sections=0 → CLAIMS: DRIFT (ROW_NO_SECTIONS …)
  exit 1
proxy terms: R_sections=83, coverage_runtime=9
```

### C2-only (`laneC2`)
```
node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R5 --row R7 --strict
  ROW R5 form=section sections=4 / ROW R7 form=section sections=5
  CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=9 adv=0)                                          exit 0
node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r36/src --json
  terms: R_sections=92 R_members=92 coverage_runtime=10
  errors remaining: C2_TOTAL_DRIFT (declared 79 computed 80) and AXES_DRIFT coverage (10 vs 9)
  — both are C1-owned legacy declarations; no R_SECTIONS_DRIFT / COVERAGE_RUNTIME_DRIFT remains.
```
C1 arms are genuinely absent (no pins dir, base scripts):
```
node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json  exit 64
node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json                          exit 64
```

### Integrated (`laneBoth` = C1 set + C2 notes + C2 declaration)
```
SURFACE_PROBE: CLEAN (… known=1 src-rev=31c465f15669)                                           exit 0
CHECKLIST: 14/14 pass | VERDICT: PASS                                                           exit 0
FIDELITY note=corpus/knowledge/local-ship.md anchors=42 ok=42 nonok=0
FIDELITY note=corpus/knowledge/native-admission-detail.md anchors=38 ok=38 nonok=0
FIDELITY_TOTAL anchors=1574 ok=867 elsewhere=0 absent=0 dead=168 noid=539 nonok=0
FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)                                    exit 0
CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)                  exit 0
PROXY: MATCH (… C2=80/80 coverage=10; … R=92/92 coverage:runtime-layer=10;
  … pins=6 match; src-rev=31c465f15669)                                                         exit 0
```

### Gate-writethrough proof
`find /fast/scratch/kumitate-r36/src -printf '%T@ %s %p\n' | sort` before and after the three C1
gates: 1341 entries, `diff -q` identical → `PIN_TREE_UNCHANGED`. `STATUS_REACH` is `ok` (the
pre-fix baseline failed here at the pin), so the dispatcher read is real, not skipped.

## Shared-path dependencies
- **SCORECARD.md** — C1 hunk `@@ -285/290`: `C=14`, `C2=80/C2_total=80`, three `pin.*`; C2 hunks
  `@@ -290` (`R_sections`, `coverage_runtime`) and `@@ -313` (Axes row). Distinct line ranges, no
  textual conflict either order; the C1 re-pin must be computed after all C1 script edits land.
- **.ufo/pins/fidelity-ratchet.json** (written only by C1): `notes` omits both C2 notes, and v1
  requires an absent note to read `nonok=0`. Integrated C1 CLEAN therefore depends on C2 content —
  measured satisfied (42/42 and 38/38 ok). One-way: C1 does not need the sections to exist, and
  C2 does not need the arm (exit 64 above).
- Not shared: `scripts/*`, `SKILL.md`, `corpus/README.md`, and the notes themselves (C1 repairs 14
  notes; C2 adds sections to two different notes).

## Findings
1. **Low — C2's literal `proxy-check` command is an integrated assertion, not a C2-only one.**
   `laneC2` still reads `PROXY: DRIFT` (only `C2_TOTAL_DRIFT` and `AXES_DRIFT coverage`, both C1's
   legacy declarations). C2's own count is independently derivable and correct
   (`R=92/92`, `coverage:runtime-layer=10`); the claim prose already scopes the isolated count to
   `--row R5 --row R7`. No code coupling; do not read the C2-only proxy exit 1 as a C2 failure.
2. **Low (integration) — `ExecSurfaceKnown` and `ExecSurfacePin` do not apply after
   `ExecSurfaceDigestOrder`/`ExecSurfaceDispatcherState`** (`scripts/surface-probe.mjs`, hunk
   contexts :53 and :590). Verified twice, `git apply -p1` → "patch does not apply". The L1 must
   reconcile the three arms; a naive patch series will drop one.
3. **Info — the C1-only PROXY MATCH required this review to re-pin the stanza** (`C=14` and the
   three script hashes). The executor patch set alone leaves `C_DRIFT`/`PIN_DRIFT`; the production
   integration must re-pin after the merged scripts are final (expected, but it is a real step).

## Residual risk / gaps
- The fidelity arm and anchor repairs used here are reviewer-authored (executor patches absent at
  test time). Absolute counts (1494 anchors, before nonok 543) are not the executor arm's numbers;
  the separability result is invariant to the counts, but re-run C1's `--fidelity` with the landed
  `ExecClaimsFidelity` + `ExecFid*` repairs before accepting C1.
- R7 content came from the unexported `KumitateR36.ExecR7Sections` working file; re-run after its
  patch is exported. Section prose quality is out of scope here — only gate conformance and
  fidelity were measured.
- No tools installed. No REA/MCP calls. No writes outside `/fast/scratch/kumitate-r36/w/`.