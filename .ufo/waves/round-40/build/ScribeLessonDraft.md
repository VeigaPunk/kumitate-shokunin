RESULT ScribeLessonDraft rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=drafted w04_owner=S023 q_number=Q20

# ScribeLessonDraft — round-40 drafts: R39-6 correction, two Mistakes rows, QUALITY Q20

Drafts only. Deliverables: `/fast/scratch/hyaku/kumitate-r40/seats/ScribeLessonDraft/draft-lesson-round-40.md`
(correction text, S034-vs-S023 disposition, two `## Mistakes` rows) and `draft-QUALITY-Q20.md`
(the Q20 text and its measurements). This report is the only file written in the lane; no code,
no commit, no push. Scratch clone `…/ScribeLessonDraft/lane` detached at `f69817edf687c8ce4f87ed7953a353399232f69e`,
left clean (`git status --porcelain` empty). No tool installed or upgraded (node v24.21.0, git
2.56.0 already present; the host-wide pacman pause was respected). No patch file — drafts, not code.

## 1. R39-6 verified — the W04 is intra-lane; the duplicate is the lane's own S023

    $ sed -n '644,645p' /home/vgpnk/Projects/shokunin/scripts/sources-census.sh
            if (u!="" && (u in url_seen) && !(scope_key in url_scopes))
              printf "%s\tW04\t%s duplicate url %s across scopes\n",lane,id,u

`url_seen`/`url_scopes` are awk arrays filled inside one `row_pass` call (`:651-653`); `row_pass`
runs once per registry file (`:717`). The seen set never crosses a lane, so W04 can only fire
between two rows of ONE lane's SOURCES.md. Cross-lane overlap is the `shared` mode (`:775-790`).

    $ bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
    kumitate	W04	S034 duplicate url stryker-mutator.io/.../mutant-states-and-metrics across scopes
    kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md   exit=0

    $ grep -n "stryker-mutator.io" kumitate-shokunin/corpus/SOURCES.md | cut -c1-80
    36:| S023 | Stryker Mutator docs: Mutant states and metrics — https://stryker-mutator.io/…
    47:| S034 | Stryker Mutator docs: Mutant states and metrics — https://stryker-mutator.io/…

S023 (`corpus/SOURCES.md:36`, opened 2026-10-20) and S034 (`:47`, opened 2026-10-22) are the same
Stryker page under two scope strings, in this lane. S023 owns the URL; the census names S034
because it is the second occurrence. The report's sentence at `.ufo/reports/round-39/kumitate.md:176`
("W04 is adjacency, not a defect: kama and tameshi hold the same URL in their own registries"),
repeated at `:212`, quotes a true cross-lane fact to explain a warning the `validate` mode raised
against the lane's own two rows. The `shared` mode is where the kama/tameshi fact lives:

    $ bash scripts/sources-census.sh shared --root /home/vgpnk/Projects/shokunin kumitate kama tameshi
    stryker-mutator.io/.../mutant-states-and-metrics	shared	kumitate,kama,tameshi
    git-scm.com/docs/git-rev-parse	shared	kumitate,tameshi   (2 more git-scm lines)   exit=0

## 2. Disposition of S034 against S023 (SOURCES contract rule 2: append-only; only status,
## recheck, used-by change in place; a correction is a NEW row whose teaches opens `supersedes S0NN`)

Measured in the scratch clone (`corpus/SOURCES.md` edited, `validate --file` so only it is read):

    leave both rows as they are      -> W04 S034 ... across scopes, then ok, exit 0 (W-codes do not
                                        change a clean lane, sources-census.sh:33)
    S034 status -> rejected           -> W04 STILL printed (url_seen[u]=1 is set for every row
                                        with a URL regardless of status, :650-653; only E04 has a
                                        rejected-pair exemption, :646-649)
    append S035 (S034 scope) + S034 rejected -> W04 STILL printed, on S034
    append S035 (S023 scope) + supersedes S034 -> no new W04, no E04; S034's own W04 STILL printed
    edit S034 scope to S023's + "supersedes S023" -> no W04, no E04, ok — BUT rewrites scope and
                                        teaches in place, which rule 2 forbids
    delete S034 -> no W04 — forbidden by append-only, and breaks S034's live citations in
                                        corpus/QUALITY.md (Q19) and corpus/lessons/round-39.md

No append-only move clears this W04: it is printed at S034's own position, and neither a status
change nor a later `supersedes` row retracts it. RECOMMENDED: keep both rows (both `mined`, both
cited; S034 is the only row teaching "runtime error", the grounding Q19 cites), log the W04 in
the round-40 `## Gate` with its command and output naming S023 and S034, append the R39-6
correction, and state in the lesson's S034 paragraph that S023 already held the page. A
one-row-per-page registry would be a contract v2 change ("a change is a new contract version,
never an edit to this section"), fleet-owned — route to the operator/integrator. The
alternative (reject S034, re-point Q19 at S023) was measured and REJECTED: it changes nothing
about the W04, breaks the only runtime-error grounding, and breaks rule 2 twice.

## 3. R39-5 measured independently in my own clone

    $ sed -n '1590p' scripts/cite-check.mjs
      const verdict = totals.filesScanned > 0 && totals.resolved > 0 && !drift ? 'PASS' : 'FAIL';
    $ node scripts/cite-check.mjs --selftest                    # pristine
    62/62 cases passed (hermetic)   VERDICT: PASS   exit 0
    # mutant: delete only `&& totals.resolved > 0`
    $ node scripts/cite-check.mjs --selftest
    62/62 cases passed (hermetic)   VERDICT: PASS   exit 0        -> SURVIVED
    # zero-resolved, no-drift document (one prose file, no path token, no ref)
    base   -> VERDICT: FAIL   CITE_CHECK: DRIFT (environment: zero-resolutions)  exit 2
    mutant -> VERDICT: PASS   CITE_CHECK: DRIFT (environment: zero-resolutions)  exit 2
    mutant --json -> verdict=PASS  citeCheck=CLEAN  filesScanned=1  resolved=0  error=0
    # my candidate fix case + the mutant
    63/63 cases passed (hermetic)   VERDICT: PASS   exit 0     # fix alone
    62/63 cases passed (hermetic)   VERDICT: FAIL   exit 1     # fix + mutant -> KILLED
    # equivalent-mutant survivor, re-measured on the pristine suite
    #   totals.filesScanned >= 0 && totals.resolved > 0 && !drift
    62/62 cases passed (hermetic)   VERDICT: PASS   exit 0        -> SURVIVED

Exit code stays 2 in both because `main()` has a separate environment fail-closed guard at
`:2527-2528`; the harm is the reported verdict (`citeCheck` DRIFT→CLEAN) that a JSON consumer
reads as clean at `resolved=0`. The suite's only `verdict === 'FAIL'` assertions are `:1873`
(needs an error finding) and `:1968` (needs `filesScanned === 0`) — no case covers a scanned
document with zero resolved citations. The survivor is equivalent by construction:
`totals.filesScanned++` runs once per scanned document (`:1556`) and `totals.resolved++` inside
the same per-document loop (`:1583`), so `resolved > 0` implies `filesScanned > 0`; they differ
only where `filesScanned === 0`, and there `resolved` is 0 so both forms read FAIL.

The executor seat has already produced the landing fix (`.ufo/waves/round-40/build/ExecCiteZeroResolved.md`;
patch `/fast/scratch/hyaku/kumitate-r40/seats/ExecCiteZeroResolved/ExecCiteZeroResolved.patch`,
2 hermetic cases, +40 lines, no production line touched; receipt `64/64`, the same drop killed at
`63/64` exit 1). My numbers come from a separate clone and agree. The `SCORECARD.md`
`pin.cite-check=` re-pin to `9e19083226c9c59de49cf9a76e12e47dc6f276bc03f98fa891411f8373e0e7ba`
is the integrator's job.

## 4. The two `## Mistakes` rows (drafted in the lane's shape `| class | evidence | captured-by | fix |`)

Row 1, class `survivor`: a verdict guard that no selftest pins, so dropping one term of the
gate's verdict expression passes the whole suite and turns a FAIL into a PASS. Evidence: the
`:1590` line, the mutant, `62/62 … VERDICT: PASS` (survived), the FAIL→PASS flip, and the two
`verdict === 'FAIL'` assertions that miss the shape. Captured-by: none (no criterion Q1–Q19
requires a verdict guard to be pinned). Fix: Q20, with the 63/64 FAIL red-before and 64/64 PASS
green, the equivalent-mutant survivor recorded rather than hidden.

Row 2, class `attribution`: a census warning was credited to sibling lanes without reading the
code that emits it, so the warning was filed against the wrong owner. Evidence:
`.ufo/reports/round-39/kumitate.md:176` and `:212`; `sources-census.sh:644-645` with `:651-653`
and `:717`; `SOURCES.md:36` against `:47`; the `shared`-mode output carrying the kama/tameshi
fact the report used. Captured-by: none — and the lane's own gate could not have caught it,
because `scripts/sources-check.mjs` does not implement W04 (its header: "E04, W01 and other
fleet checks are intentionally outside this contract"); on the clone it reads
`SOURCES_CHECK: CLEAN (rows=34 tiers=A:33,B:1,C:0 status=queued:14,mined:18,rejected:2 …)`, exit 0.
Fix: the round-40 lesson records the correction, names S023 and S034, and states S023 already
held the page; a warning's owner is read from the emitter, and `shared` is the tool for
cross-lane overlap. Class tokens follow the fleet vocabulary in `CORPUS.md` (kaika campaign:
"Classes come from the mistakes.md §5 vocabulary"), so each class cell leads with its token and
then states the mistake in plain words.

## 5. QUALITY.md Q20 (next free number after Q19)

`corpus/QUALITY.md` carries Q1..Q19 and ends at line 171, so Q20 is next; no round-40 sibling
report claims Q20 or Q21. The draft appends after the Q19 block in the Q17/Q19 shape: every
guard in a gate's verdict expression is pinned by a named selftest case whose asserted outcome
changes when that term alone is removed; the fix ships a committed red-before in which the same
command exits non-clean for the named reason; a case asserting a verdict must assert it on the
shape the guard protects (a zero-resolved no-drift scan is not an empty scan set); a mutant that
only crashes the run is a runtime error, not a kill (S034). Grounding cites R39-5, the tameshi
r26 closure lines 172-179, the 62/62 → 63/64 → 64/64 measurements, and the equivalent-mutant
survivor as a recorded survivor.

## Routed, not touched

The `SCORECARD.md` pin re-pin and the landing of the executor's patch (integrator); the
fleet-owned round-39 report, whose correction is drafted as a new round-40 lesson entry rather
than a rewrite (append-only); a SOURCES contract v2 exempting same-lane `supersedes` pairs from
W04 (fleet surface, operator/integrator).
