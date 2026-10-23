RESULT ReviewChecklistBase verdict=SOUND-WITH-CAVEATS target=.ufo/waves/round-48/build/checklist-base-{1,2}.txt base_rev_measured=fe3d45bf base_rev_planned=f00cf278 fail_in_both=4 independent_repro=clone+live-proxy

# H1 base evidence attack — `checklist-base-{1,2}.txt`

Question: are these two runs a sound H1 base? Independently verified against fresh clones at
`fe3d45bf` (seat clone `/fast/scratch/hyaku/kumitate-r48a/seats/ReviewChecklistBase/lane`) and
`f00cf278` (`…/lane-f00`), read-only git on the lane, and live `proxy-check --strict` runs.
**Correction to the seat's own summary first: there are four FAILs in both runs, not two** —
685, 686, 687, 697 (`CHECKLIST: 18/22 pass`, `VERDICT: FAIL`, exit 1 in both).

## (a) SKILL.md:685-686 `REPORTS_DIR_MISSING` — pure clone-layout artifact, reproduced

Mechanism is in the measured tree, not the environment at large:
`scripts/round-gate.mjs:142` `DEFAULT_MAIN_REPO = resolve(HERE, '..', '..')` and `:143`
`DEFAULT_REPORTS_DIR = <mainRepo>/.ufo/reports`. From a seat clone at
`<seat>/lane/scripts/round-gate.mjs` this lands on `<seat>/.ufo/reports` — never created —
so both items fail-closed in <0.1 s, deterministic, load-independent, exit 2.
In the real layout (`~/Projects/shokunin/kumitate-shokunin/scripts`) the same resolve lands on
`~/Projects/shokunin` (fleet root), whose `.ufo/reports` exists (verified on disk).

My clone at `fe3d45bf` reproduces the receipt byte-for-byte:

```
$ node scripts/round-gate.mjs                       # item 685 command, verbatim
ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir
  /fast/scratch/hyaku/kumitate-r48a/seats/ReviewChecklistBase/.ufo/reports is absent   exit=2
$ KUMITATE_REPORTS_DIR=$PWD/.ufo/reports node scripts/round-gate.mjs
ROUND_GATE: CLEAN (round=33 lane=kumitate checks=10 errors=0 warnings=0)
```

`.ufo/reports` is tracked in the lane repo (`git ls-tree fe3d45bf` shows the tree); the failure
is purely the `..`/`..` hop. Same failure at `f00cf278` (round-gate.mjs is byte-identical
between the revs, and the round-47 seat `ExecChecklistTail` recorded the identical signature at
`cac43009`). **Verdict: artifact of the sandbox, not a real finding.** H1 consequence: both items
fail in both base runs, so by H1's own rule they cannot show harm — and symmetrically they cannot
clear C1 either. They are only informative if both sides run with identical
`KUMITATE_REPORTS_DIR`/`KUMITATE_MAIN_REPO`; unmodified, they are a blind spot, not evidence.

## (b) SKILL.md:687 proxy recompute — pre-existing drift + freeze-commit's own +1; live-verified

```
$ node scripts/proxy-check.mjs --strict        # pristine clone @ fe3d45bf
PROXY  error  A_DRIFT  A: declared=25 computed=26 delta=+1
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=106 computed=107 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (… src-rev=31c465f15669)   exit=1     — identical to both receipts

$ node scripts/proxy-check.mjs --strict        # pristine clone @ f00cf278
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=106 computed=107 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (…)   exit=1     — same item verdict, two terms
```

Attribution confirmed by git: `git diff --name-status f00cf278..fe3d45bf | grep -E '\.(mjs|js|sh|py)$'`
→ exactly one runnable file added, `A .ufo/waves/round-48/probe/caproute48-probe.mjs` (mode 100755).
`A` is counted by `walkFiles`/`readdirSync` (`proxy-check.mjs:676-687`) — **untracked files count**
(tracked `git ls-files` count at `f00cf278` is 25 = declared; 26 at `fe3d45bf` = computed).
So `A_DRIFT` is introduced by the freeze commit itself; `C2_TOTAL_DRIFT` and `AXES_DRIFT` predate it.
This is the round's already-owned re-pin debt (addendum § C2/H3 names A +1 and C2_total +1 as the
re-pin at close), **not new drift discovered by these receipts**. H1 consequence: item 687 fails at
base ⇒ outside the harm set; C1's own pin drift (`pin.round-gate`, `pin.surface-probe`) will enlarge
the detail line but cannot flip the verdict — item-687 harm at C1 is structurally masked, covered
only by H3's explicit re-pin. Comparison hygiene: base and C1 must both be measured in clean clones
(A counts untracked files; the live lane worktree does not currently contain stray runnables —
`git status --porcelain` shows only `.json` build specs — but that can change mid-wave).

## (c) SKILL.md:697 gate-mutants battery — harness wall-kill, no battery verdict, load-gated

`exit=null` + `substring=miss` + `wall=120.168/120.040` = the checklist harness's own
`CHECKLIST_TIMEOUT_MS = 120_000` kill (`surface-probe.mjs:249`; spawnSync timeout → `status=null`).
The battery (`node scripts/gate-mutants.mjs`, 41 mutants × run+confirm over cite-check ≥75 and
wave-census ≥31 case suites, `TIMEOUT_MS=60_000` per run, `DEFAULT_JOBS=4`) **never reached a verdict
line** at load1 41–59 in either run. The 8-line tails show why: run 1 burned ≥2×60 s on mutants that
timed out mid-execution; run 2 shows `unstable … confirm=differs` (K43 exit-2 class) before the kill.
Round-47's receipt (`ExecChecklistTail`, load1 20.4) had the same item *complete* in 92.1 s (exit 2).
So the wall behavior is a load boundary: ≈92 s at load1 ≈20 → >120 s at load1 ≈41+; at wave load the
item is a harness timeout, not a measurement of the battery. H1 consequence: FAILs in both base runs
⇒ outside the harm set, and C1 does not route it anyway (battery targets are cite-check/wave-census,
named not-claimed in the plan). It stays a blind item at C1 under comparable load.

## Rev substitution (flagged by CritReceiptPlan; measured here)

Plan § H1 names `f00cf278`; the receipts are at `fe3d45bf` (dispatch's rev). Verified:
`git diff --stat f00cf278 fe3d45bf -- SKILL.md scripts/` is **empty** — all 22 checklist commands
resolve identical bytes; `f00cf278..fe3d45bf` adds only `probe/` + receipts + `considerthese/`.
The *only* checklist-visible delta is item 687's term list (3 vs 2 drift terms — same FAIL verdict).
For H1's harm rule the measured `fe3d45bf` base is the *stricter* side: any item passing both runs
here also passes at `f00cf278` (nothing the items read differs). **The substitution costs no
coverage, but it is a deviation from the plan's literal wording** — the close receipt should name it,
or a two-run re-check at `f00cf278` can retire it cheaply (expected delta: only 687's detail line).

## Verdict

**The base side is sound for the H1 comparison.** All four base FAILs are explained with
independent reproduction: two pure sandbox-layout artifacts (685/686), one owned pre-existing +
freeze-introduced drift (687), one load-gated harness timeout (697). No flap across the two runs;
the 18 passing items include the three the C1 routing can actually touch (682, 683, 684).

Named caveats the H1 verdict must carry:
1. Harm set = the 18 base-PASS items only. 685/686/687/697 are blind at both revs — a C1 FAIL there
   is not new harm, and a masked new failure mode there is invisible to H1 (687's masking is
   partially backstopped by H3's mandatory re-pin).
2. Measure the C1 side from a clean clone with the same env shape (A counts untracked runnables).
3. If 685/686 informativeness is wanted, both sides need identical
   `KUMITATE_REPORTS_DIR`/`KUMITATE_MAIN_REPO`; otherwise treat them as excluded by name.
4. 697 is informative only below load1 ≈ 30–35; above that it is a 120 s harness kill. Record, don't
   interpret.
5. Record the `fe3d45bf`-vs-`f00cf278` substitution explicitly in the close receipt.

Bounds: leaf seat; clones under `/fast/scratch/hyaku/kumitate-r48a/seats/ReviewChecklistBase/`;
read-only git on the lane; no installs; no lane writes outside this file.
