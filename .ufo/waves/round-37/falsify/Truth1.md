TRUTH1 anchors=1551 false=359 delivered-nonok=186 delta=173 verdict=partial

# Truth1 — independent anchor-truth re-measure (round-37 falsify)

Scope: corpus/knowledge member sections (`## ` headings leading with a backticked token that resolves to one origin file at the pin). Line 1 is whole-corpus because delivered-nonok=186 is a whole-corpus figure. Slice 1/8 = sections 1-23 of 183 (note-filename order, document order within note); reported in §5.
Pin: /fast/scratch/kumitate-r36/src @ 31c465f15669 (read only, not written).
Parser: /fast/scratch/kumitate-r37/Truth1/measure.py (own code). I did not import, run or read scripts/claims-check.mjs; the rules come from the frozen FIDELITY v1 text, the round-37 `prev ?? next` repair, and the lane's records. Tools installed: none (python3 3.14.8 already present).
False = symbol not on the cited range: elsewhere + absent + dead. noid (no adjacent symbol) is unverifiable and excluded.
Lane HEAD moved during the run (86c0676 -> c7648c7 -> 08ee2cf). Every number below is tied to a commit id.

## 1. Results

| state (commit) | anchors | ok | elsewhere | absent | dead | noid | gated nonok | false incl. dead |
|---|---|---|---|---|---|---|---|---|
| 86c0676 (delivered 1551/186 artifact) | 1551 | 675 | 169 | 17 | 173 | 517 | 186 | 359 |
| 08ee2cf = artifact of 8c41439 (after 5bc40d0 reset) | 1574 | 702 | 169 | 31 | 168 | 504 | 200 | 368 |

Slice 1/8 (sections 1-23): anchors 249, ok 114, elsewhere 3, absent 0, dead 10, noid 122; gated false 3, false incl. dead 13. Identical at both states because the slice notes were not touched.

## 2. Reproduction of delivered counts (exact)

```
$ python3 measure.py --rev 86c0676 | python3 compare.py delivered-86c0676.txt
(no per-note lines printed)
TOTAL delivered {'anchors': 1551, 'ok': 675, 'elsewhere': 169, 'absent': 17, 'dead': 173, 'noid': 517, 'nonok': 186}
$ python3 measure.py --rev 08ee2cf | python3 compare.py delivered-8c41439.txt
(no per-note lines printed)
TOTAL delivered {'anchors': 1574, 'ok': 702, 'elsewhere': 169, 'absent': 31, 'dead': 168, 'noid': 504, 'nonok': 200}
```
Historical states, same parser:
- 0614092 (pre-r36), right-first: `anchors=1494 ok=317 elsewhere=461 absent=82 dead=168 noid=466 nonok=543`. This equals the ReviewNumbersC1 pristine run exactly.
- 5833351 (r36 closure), right-first: `anchors=1574 ok=867 elsewhere=0 absent=0 dead=168 noid=539 nonok=0`. This equals the ReviewSeparabilityTree line exactly.

## 3. Rule sensitivity at 86c0676 (each delivered number pins one rule)

- default: heading must start with a backticked token; pair = nearest existing neighbour (prev ?? next, gap <= 14 chars) then validity filter, no fallback; dead checked before noid; `###` does not end a section -> `186`
- gap 13 -> nonok 184; gap 15 -> nonok 190 (14 is the boundary)
- `###` ends section body -> anchors 1526 (delivered 1551)
- heading with any backticked token -> anchors 1555, nonok 188
- noid checked before dead -> dead 139 (delivered 173)
- fall back to the right neighbour when left is invalid -> nonok 194
- right-first, no fallback -> nonok 250
- dead only when N > EOF (range past EOF counted live with clamp) -> dead 170, nonok 187
- fence handling on/off: no effect at 86c0676

## 4. What the 173 dead anchors are

Dead = the cited range starts or ends past EOF at the pin. The gate counts these outside nonok ("diagnostic only ... liveness stays the registry gate's job").
```
$ wc -l scripts/ufo-stale-watchdog.mjs; grep -c refire_removed scripts/ufo-stale-watchdog.mjs
250
0            # ops-watchers.md:74 cites :914 in this file -> past EOF; symbol absent
$ wc -l crates/ufo-core-runtime/src/native_profile.rs   # cost-and-profile.md:173 cites 260-276
268
$ wc -l crates/ufo-core-runtime/src/gate_tests.rs       # gate-verdict.md:197 cites :249
206
```
The lane's registry-gate doc (corpus/knowledge/member-claims-gate.md) says the arm fails a section only when no own-file anchor is live (SECTION_DEAD_ANCHOR), and that it "gates sections, not individual references". So one live anchor plus nine dead ones passes. Consequence: CLEAN does not certify symbol-on-line truth. At 86c0676, 359 of 1551 (23.1%) anchors are symbol-off-line; at 08ee2cf, 368 of 1574 (23.4%).

## 5. Slice 1/8 detail

Composition: cost-and-profile 5 sections (105 anchors), distill-and-l3 4 (57), failure-telemetry 1 (22), gate-verdict 2 (4), local-ship 5 (42), loop-driver 6 of 12 (19). Total 249.
The five notes fully inside the slice match the delivered per-note lines exactly: cost 105/30/1/0/6/68; distill 57/12/1/0/0/44; failure 22/19/0/0/0/3; gate 4/0/0/0/3/1; local 42/42/0/0/0/0 (anchors/ok/elsewhere/absent/dead/noid).
All 13 strict-false anchors in the slice:
```
elsewhere cost-and-profile.md:87   `:448` permits_advance   (execution_profile.rs defines it at 429, uses at 461)
elsewhere distill-and-l3.md:187    distill_tests.rs:96     0o600 (occurs at 1024)
elsewhere loop-driver.md:67        loop_driver_dry.rs:977  ldd_dry_round_persist_phase (defined 799; 977 is run_dry_until_halt)
dead      cost-and-profile.md:173  native_profile.rs:260-276     (268 lines)
dead      cost-and-profile.md:176  native_profile.rs:261-270
dead      cost-and-profile.md:177  native_profile.rs:275          `resolved`
dead      cost-and-profile.md:179  native_profile.rs:271-274
dead      cost-and-profile.md:352  execution_profile_tests.rs:525-540 (532 lines)
dead      cost-and-profile.md:355  execution_profile_tests.rs:542-560
dead      gate-verdict.md:197      gate_tests.rs:249                (206 lines)
dead      gate-verdict.md:198      gate_tests.rs:249 and :397
dead      loop-driver.md:89        loop_driver_judge.rs:527         (492 lines)
```
Hand check of the one `ok` sample in the slice: local-ship.md:270 `:47-79` -> local_ship_tests.rs:47 `fn commits_when_real_grep_sees_candidate` (correct).

## 6. HEAD delta (+14) and the 0614092 reset

Commit 5bc40d0 reset four notes to 0614092 bytes. Per-note gated nonok, 86c0676 -> HEAD: remaining-scripts-census 78 -> 70, sighting-wall 13 -> 20, route-probe-cluster 14 -> 23, native-trial-launch 25 -> 31. Four-note total 130 -> 144, which is the whole +14. The ratchet total of 200 and the refreshed artifact (8c41439) agree with my measurement. Until 8c41439 the artifact at c7648c7 still showed the pre-reset 1551/186, so it was stale.

## 7. Pre-repair r36 closure ("123 wrong")

- Under the right-first rule the r36 closure reads nonok=0 (exact). Under the left-first rule the repair adopted, the same tree reads nonok=200 (elsewhere 184, absent 16) and dead 168. The closure's CLEAN was a rule artifact.
- Transition 0614092 -> 5833351, four notes, left-first, same note line and anchor ordinal (line counts identical, 0 misaligned lines): true -> wrong = 115 (remaining 95, sighting 11, route 5, native 4). With a longest-identifier truth test the figure is 114.
- The spot-check's 123 (remaining 102, sighting 12, route 5, native 4; lessons/round-36-verifier-spotcheck.md) is reproduced in magnitude, not exactly: -8 (remaining -7, sighting -1). [INFERENCE] The spot-check's moved-set and file attribution differ from the gate's own-file rule.
- Four-note gated nonok under left-first is 144 at 0614092, at 5833351, and at HEAD.

## 8. Verdict: partial

- Holds: the gated FIDELITY arithmetic is reproduced exactly at both delivered states and at both historical states. Gated delta is 0 at 86c0676 and +14 (7.5%, named reset) at HEAD. The failing condition (>10% unexplained) is not triggered.
- Does not hold as an anchor-truth statement: 173 (86c0676) / 168 (HEAD) symbol-off-line anchors fall outside nonok by design, and 517 / 504 anchors have no checkable symbol. The delta vs 186 is exactly the dead class (173).

## 9. Limits

- The symbol test is a verbatim substring on the cited range. It is not semantic, so `ok` means presence.
- Outside the gate universe, diagnostic only, at HEAD: 150 cross-file anchors inside member sections (ok 35, elsewhere 18, absent 26, dead 13, noid 58), and 8 anchors under headings that do not lead with the file token (elsewhere 4, noid 4). Not in nonok by design.
- The three rule choices (heading starts with backtick, dead before noid, no fallback) were fixed by reconciling against delivered counts, not by the prose alone. The prose's literal "first backticked token" would give anchors 1555.

## 10. Commands (reproduce)

```
cd /fast/scratch/kumitate-r37/Truth1
python3 measure.py --rev 86c0676 --quiet 1                     # TOTAL ... nonok=186
python3 measure.py --rev 86c0676 --quiet 1 --slices 8 --slice 1 | grep '^SLICE 1'
python3 measure.py --rev 08ee2cf --quiet 1                     # TOTAL ... nonok=200
```
Scratch artifacts (TSVs, delivered snapshots, sensitivity variants) are in /fast/scratch/kumitate-r37/Truth1/. Nothing was written to the lane except this report. Nothing was committed.

## 11. For the main agent

1. Treat `CLEAN` as a gate-arithmetic result, not an anchor-truth result. If the falsify wave needs truth, either gate dead anchors individually or report false incl. dead next to nonok.
2. The ratchet (200) and final artifact now encode the 0614092 four-note state, not the 86c0676 repaired state (130).
3. The r36 "nonok=0" was right-first only. Left-first gave 200 on the same tree.
