RESULT CritShonenBoxes rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=partial boxes=4 pointed=3

Scope: SHONEN.md at fae386aa (`git show fae386aa:SHONEN.md`): 4 boxes at lines 5-8, all `[ ]`, unchanged since seed commit cb1f12e. Gate runs in my own clone /fast/scratch/hyaku/kumitate-r41a2/seats/CritShonenBoxes/lane detached at fae386aa; pin clone HEAD 31c465f15669f744848bd9f5d56191c5085670f7. No tools installed or updated.

No box may be `[x]`. Fleet PROTOCOL.md:63-68 says only a non-author `<id>` may write `[x]`, and "a subagent the lane dispatched is still the lane". No lane file at fae386aa names a non-author SHONEN verifier, and this seat was dispatched by the lane, so it is not one either. SCORECARD.md:1819 already keeps all four boxes `[ ]`.

Pointers I would accept for `[~]`:
1. Box 1 (SHONEN.md:5, tables, error patterns, checklists, cited sources): accept `[~]`. Pointer: SKILL.md:12-21 (dispatch-shape decision table with a Source column); SKILL.md:423 `## Failure-telemetry patterns`; SKILL.md:658-691 `## Verifiable checklist` (17 items); corpus/SOURCES.md.
   - `node scripts/sources-check.mjs` gave `SOURCES_CHECK: CLEAN (rows=38 tiers=A:37,B:1,C:0 ...)`.
   - `node scripts/cite-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src` gave `CITE_CHECK: DRIFT (files=96 tokens=9355 errors=714 warnings=541)`, exit 1. Filtering SKILL.md errors to lines 12-21, 420-479 and 650-699 gave 0, so the three cited sections resolve at the pin.
2. Box 2 (SHONEN.md:6, end-to-end task logged): accept `[~]`. Pointer: LOG.md:1817-1830 (round-41 entry), plus the closed round 40.
   - `node scripts/round-gate.mjs --round 40` (fleet reports directory symlinked into my seat directory) gave `ROUND_GATE: CLEAN (round=40 lane=kumitate checks=10 errors=0 warnings=1)`, exit 0.
   - Round 41 cannot be the pointer yet. `node scripts/round-gate.mjs --round 41 --main-repo /home/vgpnk/Projects/shokunin` gave `ROUND_GATE  error  REPORT_MISSING  /home/vgpnk/Projects/shokunin/.ufo/reports/round-41/kumitate.md`, then `ROUND_GATE: DRIFT (... errors=1 warnings=1)`, exit 1.
3. Box 4 (SHONEN.md:8, no cross-domain bleed, PROVINCE.md accurate): accept `[~]` only if the pointer also names one exception. Pointer: PROVINCE.md last changed in 1a8eed5 (round 34); `git diff --name-only a58b7f72 fae386aa -- PROVINCE.md SHONEN.md` is empty; the round's diff touches only lane paths (.ufo/waves 45, corpus 4, scripts/cite-check.mjs, scripts/wave-census.mjs, SKILL.md, LOG.md, SCORECARD.md).
   - Exception: corpus/lessons/round-41.md:113 records that the attempt-2 L1 deleted a fleet-root copy (`/home/vgpnk/Projects/shokunin/.ufo/waves/round-41/falsify/ReviewCensusCode.md` and its empty directories). That is a write outside the lane, the same class as round-37 Rep4 S9 ("mismatch (1 out-of-lane change)").
   - `ls /home/vgpnk/Projects/shokunin/.ufo/waves/round-41` now gives "No such file or directory". A pointer that says "every change is in the lane" is wider than this evidence.

Box with no acceptable pointer at fae386aa:
4. Box 3 (SHONEN.md:7, executable without oral context): keep `[ ]`. PROTOCOL.md:71-72 requires instructions that are "self-contained, and with resolvable pointers". Three counterexamples:
   - Fresh clone: `node scripts/surface-probe.mjs --checklists` gave `CHECKLIST: 14/17 pass`, `VERDICT: FAIL`, exit 1. Failing items were SKILL.md:680 and :681 (round-gate, exit 2, `REPORTS_DIR_MISSING` and `MAIN_REPO_NOT_GIT`) and :685 (`KIMI_CENSUS: DRIFT (UNLISTED locks)`).
   - With the fleet reports directory symlinked in, it read `15/17`; :681 `--tracked` still needs the fleet git work tree. So the checklist depends on where the clone sits, which SKILL.md:666 ("runs from this repo's root") does not state.
   - SKILL.md cites origin code that does not resolve at the pin. Two citations are out of range: SKILL.md:136 `scripts/fleet-dispatcher.mjs L12086` (the file has 9224 lines; `wc -l` confirms) and SKILL.md:218 `tests/run-omp-native-trial.test.js:4404` (the file has 3793 lines). Three are unresolved: SKILL.md:85 `queue.mjs`, :402 `atomic-write.mjs`, :512 `ufo-sighting-lib/queue.mjs`, each reported as "not found under src".
   - The earliest fae386aa-era evidence that could support `[~]`: in-lane checklist 16/17 with only the kimi host drift failing, plus repaired or debt-registered citations at SKILL.md:85/136/218/402/512. [INFERENCE] I did not run the checklist inside the lane itself, so 16/17 is not observed.

Wider than evidence:
- SCORECARD.md:1819 says box 3 "reads 14/17 in a bare clone (two round-gate items need the fleet reports dir)". That names only two of the three failures; the third is kimi-census (the run above). Smallest correction: "(two round-gate items need the fleet reports dir and fleet git work tree; kimi-census reads DRIFT on host drift `~/.kimi-code/locks`)".
- Checklist item 1 (SKILL.md:675) accepts exit 0 or 1, so it passed even though cite-check reports errors=714 at the pin. A `[~]` pointer that cites "checklist PASS" for item 1 is not evidence that the citations resolve.

Impacted axes: operability (the checklist's portability and pointer resolvability back box 3); coverage (box 4 province write).
