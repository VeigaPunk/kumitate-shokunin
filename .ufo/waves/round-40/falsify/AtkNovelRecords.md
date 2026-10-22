RESULT AtkNovelRecords rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=bypass attempts=3 accepted=3
Counterexample: in all three attempts I rewrote a true note claim into a false one, and the sound `--open` gate still read CLEAN (exit 0). Each pin entry was switched to a review record that was committed at the open revision for a different anchor. The cause is the same-file nested-range fallback in `ReviewRecords.bound` (scripts/anchor-truth.mjs:356-367 at 1530a755). That fallback binds a record even while the record's own anchor still exists. Root cause shared with AtkRecordForge, AtkReviewForge and AtkNovelPin; new here: true pair claims (not debt) lost and replaced by false ones, binding via common-word and numeric tokens, and a fix with a selftest case that catches the mutant.
Gate command (run in my clone, cwd lane): node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9 --open f69817edf687c8ce4f87ed7953a353399232f69e --src /fast/scratch/hyaku/kumitate-pin/src
Baseline 1530a755: TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 ...) exit 0
A1 (clone commit c949001a): note line 113 changed from `DEFAULT_TIMEOUT_MS` 240_000 (`:43`) to `PROBE_RETRY_LIMIT` 240_000 (`:43`). Pin route-probe-cluster.md#16 changed from pair/DEFAULT_TIMEOUT_MS to review:Prose12/240_000. That record was written for #153 (scripts/probe-ufo-route-health.mjs:43), which still exists.
  -> TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af... open=f69817ed... src-rev=31c465f15669) EXIT=0. Verdict: accepted.
A2 (clone commit 0351abc7): note line 215 changed from `MAX_ROUTES` is 16 (`:45`) to `MAX_RETRIES` is 16 (`:45`). Pin #79 changed from pair/MAX_ROUTES to review:Prose12/16, a numeric token. That record was written for #154 (:45 occurrence 2).
  -> TRUTH: CLEAN (same counts) EXIT=0. Verdict: accepted.
A3 (clone commit ba26dabd): note line 170 changed from `targets.every(...)` (`:223`) to `candidates.some(...)` (`:223`), which states the opposite semantics. Pin #53 changed from pair/targets.every(...) to review:Prose10/every, a common word that is already in the paragraph's prose. That record was written for #123.
  -> TRUTH: CLEAN (same counts) EXIT=0. Verdict: accepted.
Falsity check against the pin source at 31c465f1: line 43 is `const DEFAULT_TIMEOUT_MS = 240_000;`, line 45 is `const MAX_ROUTES = 16;`, and models line 223 is `const available = targets.every(...)`. None of PROBE_RETRY_LIMIT, MAX_RETRIES or candidates/some appears on those lines.
Control C1 (A1 note edit, pin unchanged): TOKEN_FORGED #16 pinned=DEFAULT_TIMEOUT_MS paired=PROBE_RETRY_LIMIT, exit 1.
Control C2 (A1 note edit, honest --write-pin): PIN_REGRESSION #16 ord true -> debt:false, exit 1.
Control C3 (A1 pin with seat Prose09, no such record): REVIEW_UNBOUND #16, exit 1. So the borrowed record is the only thing hiding the false claim.
Reach (scan.mjs over 138 records at f69817ed, 0 records resolve to the wrong anchor): 54 true entries can be switched to a different nested record whose token is already in the paragraph. No debt entry qualifies without a note edit.
Floor probe: floor-probe-v2 reads attacks_accepted=0/26 and benign_clean=10/10 at 1530a755. Its 26 attacks do not include this class.
Master 0004ae31 (docs commit): no diff from the candidate in scripts/anchor-truth.mjs, the pin, the registry or route-probe-cluster.md, so the bypass also stands at master.
Impacted axes: operability (C1's claim that the gate refuses forged claims under --open), plus the round-40 lesson's statement that binding needs the same identity.
Smallest safe correction (patch /fast/scratch/hyaku/kumitate-r40/seats/AtkNovelRecords/AtkNovelRecords.patch; it applies cleanly to f69817ed per `git apply --check` APPLY_OK. Delta against the candidate: AtkNovelRecords-vs-candidate.patch, 109 lines): in `bound()`, `if (liveIds.has(rec.identity)) continue;` comes before the nested-range test. Both call sites pass a Set of the note's current identities, and the docstrings are updated. New selftest AT46: a sibling at the same range is unbound, and a widened re-citation of a vanished reviewed anchor still binds.
  Fixed gate on 1530a755: CLEAN exit 0. On A1/A2/A3: REVIEW_UNBOUND (#16, #79, #53), DRIFT, exit 1 each.
  Selftest with the fix (clone commit d59b05ed): ANCHOR_TRUTH_SELFTEST: 42/42 pass, VERDICT: PASS. With AT46 added to the unfixed candidate gate: FAIL AT46 (sibling reads TRUTH: CLEAN), 41/42, so the mutant is killed.
  Floor probe at d59b05ed: attacks_accepted=0/26, benign_clean=10/10, setup_errors=0, so there is no regression.
Remaining gap (unverified): once a reviewed anchor has vanished, its record can still bind more than one new nested anchor. AtkNovelPin's suggestion of "one entry per record" would close that. I did not test it.
Recipe: /fast/scratch/hyaku/kumitate-r40/seats/AtkNovelRecords/RECIPE.md (apply.mjs, scan.mjs, atk-A*.patch, gate-A*.out).
Tools installed or updated: none.
