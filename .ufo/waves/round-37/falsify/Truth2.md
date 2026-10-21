TRUTH2 anchors=1551 false=186 delivered-nonok=186 delta=0 verdict=partial
Axis: operability. Failing condition not triggered (delta 0, 20/20 notes match). Verdict is partial because the repair's truth claims fail: 25 anchors true at 0614092 are false now, gate-class false alarms are present, and 173 dead anchors sit outside the gate.

## Scope and method
- Universe: corpus/knowledge/*.md, 41 notes. 20 contain member sections (183 sections). The gate's 20-note set is identical. 0 duplicate chunks, 0 astral characters.
- Pin: /fast/scratch/kumitate-r36/src at 31c465f15669 (git HEAD verified, read-only). Lane HEAD a5d627b; corpus/knowledge clean; tree hash 2c17722b.
- Parser: /fast/scratch/kumitate-r37/Truth2/truth2.py (Python 3.14.8, stdlib only). It does not import or run claims-check. Rule: frozen FIDELITY v1 text with left-first pairing (round 37). `--pairing right` is the r36 rule, for sensitivity only. Independence is of implementation; the rule itself is tested by the historical reproductions and the sample below.
- Slice: the item names no slice rule. Defined here: member sections in note-path order; slice k/8 = ordinals [floor((k-1)*183/8), floor(k*183/8)). Slice 2/8 = ordinals 22-44 (23 sections).
- `false` = elsewhere + absent, the gate class, so it is comparable to delivered nonok.
- Installs/updates: none. No package transactions, no lane writes.

## 1. Whole universe vs delivered (current tree)
```
$ python3 /fast/scratch/kumitate-r37/Truth2/truth2.py --notes <lane>/corpus/knowledge --src /fast/scratch/kumitate-r36/src --pairing left --compare <lane>/.ufo/waves/round-37/final/fidelity.txt
NOTES_SCANNED 41  NOTES_WITH_MEMBER_SECTIONS 20  MEMBER_SECTIONS 183  DUPLICATE_CHUNKS_SKIPPED 0  ASTRAL_CHARS 0  pairing=left
TRUTH2_TOTAL anchors=1551 ok=675 elsewhere=169 absent=17 dead=173 noid=517 nonok=186
COMPARE_NOTES_DIFFERING 0 of 20
COMPARE_TOTAL anchors: mine=1551 delivered=1551 ok 675/675 elsewhere 169/169 absent 17/17 dead 173/173 noid 517/517 nonok 186/186
```
Symbol-on-line, all 1551 anchors:
- true (ok): 675 (43.5%)
- false, gate class (elsewhere 169 + absent 17): 186 (12.0%) = delivered nonok
- false, ungated (dead: cited line beyond EOF or N>M): 173 (11.2%). Plain false = 359. The 173 delta is a named class boundary: dead is diagnostic under FIDELITY v1, not gated.
- unverifiable (noid, no symbol): 517 (33.3%)

## 2. Slice 2/8 (23 sections)
`anchors=61 ok=51 elsewhere=2 absent=1 dead=1 noid=6`: gate false 3, plain false 4. Checked against pinned source:
- native-admission-detail.md:92 (`:277`, symbol `MissingId`): line 277 is `fn seat_id_matches`; the sentence reads "at `:277`, `seat_id_matches` rejects...", so the anchor precedes its symbol. FALSE ALARM.
- native-admission-detail.md:100 (`:106`, symbol `u{tag}-{role}-{NN}`): line 106 is `seat_key_from_parts`. FALSE ALARM.
- native-admission-detail.md:113 (`:17`, symbol `process`): line 17 is `json_lower`. FALSE ALARM.
- loop-driver.md:89 (`loop_driver_judge.rs:527`): beyond EOF. FALSE (dead).
Slice 2 gate-false: 3/3 are false alarms. The 3 gate-false anchors are the only ones in native-admission-detail. SCORECARD round 36 claims 80/80 on-line for R5/R7; the canonical rule reads 77/80, and all 3 misses are false alarms.

## 3. Delivered and r36 figures, same parser, both rules
| state | rule | anchors | ok | elsewhere | absent | dead | noid | nonok |
|---|---|---|---|---|---|---|---|---|
| current = delivered | left | 1551 | 675 | 169 | 17 | 173 | 517 | 186 |
| current | right | 1551 | 592 | 249 | 1 | 173 | 536 | 250 |
| 0614092 pre-r36 | right | 1494 | 317 | 461 | 82 | 168 | 466 | 543 |
| 0614092 pre-r36 | left | 1494 | 457 | 333 | 89 | 168 | 447 | 422 |
| 5833351 r36 final | right | 1574 | 867 | 0 | 0 | 168 | 539 | 0 |
| 5833351 r36 final | left | 1574 | 687 | 184 | 16 | 168 | 519 | 200 |

Under the r36 rule the parser reproduces the r36 record exactly: pristine 1494/317/461/82/168/466/543 (CriticAxes, r36 lane); after 1574/867/0/0/168/539/0 (nonok=0). It matches history, not only the delivered file.

## 4. The "123 wrong" figure
- Left-first, 0614092 to 5833351, four named notes, 78/78 sections aligned, 0 count mismatches: 254 cited ranges changed; 121 of them were ok at 0614092; 115 read elsewhere at round 36 (ok to elsewhere). Other notes add 3 (118 total).
- 123 is therefore not reproduced exactly: 115 (four notes, -8, -6.5%) or 118 (all notes, -5, -4%). Within the 10% tolerance; the gap is unexplained by my parser.
- Under the r36 right-first rule the round-36 state has 0 ok-to-not-ok flips and nonok 543 to 0. The damage is visible only under the canonical rule, which is why the r36 gate was green.

## 5. Round-37 restoration (5ceb8cd: the only corpus commit after 5833351; 4 files)
`scratch/restore_all.py` (3-way, section-aligned, four notes unless stated):
- Round-36 flips in aligned sections: 88. Ok now: 87 (99%). One not restored.
- 27 of the 115 round-36 flips sit in 19 sections whose anchor count changed later (151 anchors now, 31 gate-false). Ordinal pairing cannot assess them.
- NEW HARM: 21 anchors ok at 0614092 and ok at r36, not ok now. Introduced by 5ceb8cd.
- Other notes: 3 round-36 flips never restored (ops-watchers.md:191; runtime-support.md lease_tests.rs:7 and :15). Round 37 did not touch those notes.
- Total: 25 anchors ok at 0614092, not ok now (22 elsewhere, 3 dead). All 25 read false against the pinned source (`scratch/threeway.txt`).

Mechanism, verified in the restored sentences: numbers are moved between neighbouring anchors.
- remaining-scripts-census.md:528 `legacyLoadLifecycleLedger` now reads `(...test.mjs:1388-1390)`. 0614092 printed `:31` there, and `:1388-1390` for the next anchor in the same paragraph ("The hand-rolled runner prints its pass count...").
- land-fleet-run section: "also `landFleetRun` at `:23`". 0614092 printed `:53`; `:23` is the 0614092 value of the neighbouring prepare-ephemeral-fleet sentence.
- render-seat-tables: "`seatsDigest` moved to `:54`". 0614092 printed `:31`; `:54` is the 0614092 value in the render-seat-tables.test.mjs sentence.

The restoration notice (remaining-scripts-census.md line 2) says anchors "were reverted to the lines their 0614092 sentences named". That is false for these 22 four-note anchors.

The ratchet cannot see this. `.ufo/pins/fidelity-ratchet.json` per-note ceilings equal the post-repair measurement (remaining-scripts-census 78, route-probe-cluster 14, sighting-wall 13, native-trial-launch 25, ops-watchers 47). CLEAN therefore means "not above ceiling", not "no regression".

## 6. Pairing sensitivity (the 186 depends on the rule)
Current tree, same 1551 anchors (`scratch/matrix.py`):
- left ok, right elsewhere: 119. Left elsewhere, right ok: 33. Left absent, right ok: 6.
- 39 of the 186 gate-false anchors read ok under right-first. Right-first total: 250 (+64, +34%).
- Both constructions occur. "`symbol` (`:N`)" needs left-first. "at `:N`, `symbol`" (round-36 R5/R7 style) needs right-first.
- Some failures are shared by both rules: a prose span taken as the symbol, or a span outside the 14-character window. Those are not in the 39.

## 7. Semantic spot-check (hand-read vs pinned source; seed 37; `scratch/sample.txt`)
- Current ok, 12 sampled: 10 clearly true; 2 weak but plausible (O06 `spawn` inside a test name; O11 `judge_wave` on a doc-comment line). 0 clearly false.
- Current gate-false, 12 sampled: 10 clearly false (line offsets 1, 2, 6, 7, 10, 18 and 19; one absent symbol; two large-offset or cross-file binds). 2 false alarms: N01 (prose span "unsupported argument" taken as symbol; range 366-371 covers `main`) and N05 (anchor :100 is the `devin-native-v1` profileId line; the left window was empty and the right fallback `loadProfile` at :107 is not the anchored line).
- The 25 regressions: 25/25 false on reading.
- Gate-class false-alarm rate: 2/12 random (17%, Wilson 95% about 5-45%); slice 2: 3/3. The 186 is a count of a mechanical class, not a truth count.
- noid (517) not sampled.

## 8. Limits
- Ordinal alignment cannot pair 19 sections whose anchor count changed. The 25 regressions are a lower bound for the four notes.
- Hand-check n=12+12+3. Intervals are wide.
- The 5-8 anchor gap to 123 is unexplained.
- Lane read at a5d627b; sibling lanes may write. Tree hash 2c17722b recorded.

## 9. Checks for the main agent (not performed here; no lane edits)
- Re-derive the 22 four-note numbers per anchor identity from 0614092, not by sentence position; re-run truth2.py. Expect 21 + 1 to read ok again.
- Decide the 3 round-36 out-of-scope flips.
- Either name 186 a "left-first count" or fix the construction-specific pairing before treating it as truth.
- Make the ratchet a no-regression check against a 0614092-verified ok set, not against the current measurement.

Scratch: /fast/scratch/kumitate-r37/Truth2/ (truth2.py, align2.py, align3.py, threeway.py, restore_all.py, sample.py, slice2.py, matrix.py; outputs left.txt, right.txt, rev-*.txt, threeway.txt, sample.txt).
