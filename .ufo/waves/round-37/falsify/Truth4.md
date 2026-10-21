TRUTH4 anchors=1574 false=200 delivered-nonok=186 delta=14 verdict=holds

# Truth4 — independent anchor-truth re-measurement (round-37 falsify, slice 4/8)

Scope. The verdict line is whole-corpus (the scope of the delivered figure). Slice 4/8 is in §5.
Parser: own implementation from the frozen FIDELITY v1 text, `/fast/scratch/kumitate-r37/Truth4/truth4.py` (sha256 c6eb2d5d6f417bfb); runner `run_delivered_rule.py` (sha256 d8b50b076194fd4a). claims-check was not imported or run.
Pins: `corpus/knowledge` tree `a2257f30b0bda767d3651b30f0f6b4839f68de9d`. Lane HEAD moved six times during this run (a5d627b → 9021825 → 9ae8468 → c589b38 → 08ee2cf → ea63c4e); the corpus tree is unchanged from c589b38 onward. Pin clone 31c465f15669 (1103 tracked files, read-only).
Writes: scratch `/fast/scratch/kumitate-r37/Truth4/` and this report only. Installs: none.

## 1. Totals
| source | anchors | ok | elsewhere | absent | false | dead | noid |
|---|---|---|---|---|---|---|---|
| my parser, delivered rule, tree a2257f30 | 1574 | 702 | 169 | 31 | 200 | 168 | 504 |
| `final/fidelity.txt` as now written | 1574 | 702 | 169 | 31 | 200 | 168 | 504 |
| spec-stated delivered (tree a5d627b) | 1551 | 675 | 169 | 17 | 186 | 173 | 517 |
| pre-repair r36 closure, tree 5833351 | 1574 | 687 | 184 | 16 | 200 | 168 | 519 |
| base 0614092 | 1494 | 457 | 333 | 89 | 422 | 168 | 447 |

- All 20 per-note lines of the rewritten artifact match my parser with zero deltas (`python3 run_delivered_rule.py snap/H/corpus/knowledge`).
- The spec's 186/1551 is reproduced exactly on tree a5d627b (all classes, all 20 notes).
- Delta 200 vs 186 is +14 (7.5%). It is fully explained by commit 5bc40d0 ("reset four notes to 0614092 bytes"). Per-note nonok a5d627b → a2257f30: remaining-scripts-census 78→70 (anchors 484→507), sighting-wall 13→20, route-probe-cluster 14→23, native-trial-launch 25→31. Those four sum to +14; the other 16 notes are unchanged.

## 2. Delivered rule reproduced: calibrated, not independent
Three readings were fixed by matching the delivered per-note table. Each is a contract-level ambiguity:
(a) member heading must begin "## `" (prose-first headings excluded: native-judge-pipeline L128 = 3 anchors; route-probe-cluster L356 = 1);
(b) spans = naive single-backtick regex. CommonMark run-length spans add 4 dead rows in ops-watchers; 21 notes contain double backticks;
(c) `.jsonl` tokens are not path-like (one route-probe-cluster row flips ok↔noid).
With these, all seven per-note columns match for all 20 notes, on both a5d627b and a2257f30. That shows the gate's arithmetic is reproducible. It does not show the rule is the right reading of "symbol on line". The symbol-on-line test itself runs against pinned bytes (§5 spot checks).

## 3. Class boundaries that move the count (tree a2257f30)
| variant | false |
|---|---|
| delivered: left-first (prev ?? next), pick, window 14 | 200 |
| frozen r36 contract literal: right-first, pick | 270 (+70) |
| right-first with fallback to left | 295 |
| left-first with fallback to right | 211 (+11) |
| window 13 / window 15 | 196 / 203 |
| dead = N>nlines only | 201 |
| `.jsonl` treated as path-like | 200 (ok −1, noid +1) |

- Pairing dominates. Left and right disagree on 162 anchors: left-ok/right-false 123, left-false/right-ok 39.
- Samples cut both ways. native-trial-launch L383 "`PROPOSAL_WAVE_CEILING` (`:96`)" supports left. native-admission-detail L92 "at `…native_admission_text.rs:277`, `seat_id_matches`" and native_text.rs L113 "at `…native_text.rs:17`, `json_lower`" support right. No single mechanical rule is exact.
- The frozen r36 text says right-first. Repair D2 (repairs.md) switched to left-first. That change alone moves the count by 70 on identical bytes; the brief should name it as a contract change.
- Under the r36 right-first rule, the pre-repair closure tree (5833351) reads false=0 (ok 866). The r36 "nonok=0" closure reproduces only under right-first. Under the left-first rule that tree reads 200.

## 4. Pre-repair r36 closure ("123 wrong")
- Harm = anchors ok at 0614092 and not ok at 5833351, keyed (note, symbol, N, M): 120 corpus-wide (multiset), 117 in the four named notes. The claimed 123 is not reproduced exactly (−3 corpus-wide, 2.4%). [INFERENCE: key/duplicate semantics.] Positional N/M changes in the four notes: 254.
- Restoration at a2257f30: 117/117 four-note harm is restored (those notes are byte-identical to 0614092 plus a one-line notice). Corpus-wide 117/120. Three remain false, outside the reset's scope:
  - ops-watchers `deadline` :275 → :191 (the-tick-ping.mjs; note line 307);
  - runtime-support `dead_pid` :6 → :7 (lease_tests.rs; line 149);
  - runtime-support `plant_lease` :12 → :15 (line 151).
  Commit 5ceb8cd says "restore 123 shifted anchors"; that is not fully met.
- Net: false total pre-repair 200 → now 200; four-note false 144 → 144 (= base). The repair restored truths; it did not lower the false total.

## 5. Slice 4/8
Slice rule (the brief does not define it; chosen here): anchors in document order (notes sorted, then section, then line); eighth 4 of 8 = indices 591–786 of 1574 → 196 anchors in 5 sections (ops-watchers 181, queue-and-claim 9, remaining-scripts-census 6).
- symbol-on-line TRUE: 58
- FALSE: 23 (elsewhere 19, absent 4)
- unevaluable: 115 (noid 77, dead 38)

False anchors (idx · note line · anchor · paired symbol · class · where-the-symbol-is):
```
595 ops-watchers L242 :2067 ufo-l0-watch  'lockName: "l0-watch.lock"'  elsewhere 2066
598 ops-watchers L242 :36   ufo-l0-watch  'process.exit(0)'            elsewhere 2181,2193
599 ops-watchers L242 :1640 ufo-l0-watch  'instance_refused'           elsewhere 2179,2187
605 ops-watchers L244 :133  ufo-l0-watch  'MissionResultError("watch_state_outside_root", …)' absent
607 ops-watchers L244 :111  ufo-l0-watch  'exit 2'                     absent
609 ops-watchers L244 :82   ufo-l0-watch  'UFO_PENDING_WORK_PATH'       elsewhere 104,812
616 ops-watchers L246 :2150 ufo-l0-watch  '"--interval-ms must be…'    elsewhere 2138
627 ops-watchers L250 :59   ufo-l0-watch  'acquireSingletonLock'        elsewhere 58,2058,2064
629 ops-watchers L250 :62   ufo-l0-watch  'writeWithMkdirRetry'        elsewhere 60,148,519,522
631 ops-watchers L250 :57   ufo-l0-watch  'readBoundedFile'            elsewhere 55,2070
632 ops-watchers L250 :70   ufo-l0-watch  'readBoundedJson'            elsewhere 57,382,892,1180
651 ops-watchers L250 :75   ufo-l0-watch  'plainObjectRows'            elsewhere 76,1522,1914,1915
652 ops-watchers L250 :85   ufo-l0-watch  'isPlainObject'              elsewhere 75,334,…(14 more)
653 ops-watchers L250 :86   ufo-l0-watch  'redactAbsolutePaths'        elsewhere 85,622,634
654 ops-watchers L250 :80   ufo-l0-watch  'knownRootTags'              elsewhere 86,98
655 ops-watchers L250 :74   ufo-l0-watch  'spinWait'                    elsewhere 80,2223
683 ops-watchers L299 :606  the-tick-ping 'FRESH_RUN_ID_RE'            elsewhere 529,594
690 ops-watchers L307 :191  the-tick-ping 'deadline'                   elsewhere 22,35,…
695 ops-watchers L319 :98   the-tick-ping '"runner deadline exceeded"' elsewhere 79
719 ops-watchers L363 :160  ufo-ground-handler '["id", "root", "relativePath"]' elsewhere 148
744 ops-watchers L410 :39   ufo-ground-handler 'MAX_CHAT_RESPONSE_BYTES = 1_048_576' elsewhere 38
763 ops-watchers L427 :789  ufo-ground-handler 'ufo_cli_runner_value_missing' absent
765 ops-watchers L428 :793  ufo-ground-handler 'ufo_cli_config_value_missing' absent
```
- Kinds: elsewhere ≤3 lines off 8; elsewhere >3 lines off 11; absent identifiers 2; absent prose or non-identifier symbols 2.
- Grep spot-checks on pinned bytes: `writeFileAtomicIfChanged` at ufo-l0-watch.mjs 62/509/518 (note cites :60); `readBoundedJson` at 57/382/892/1180 (note :70); `MAX_CHAT_RESPONSE_BYTES` at ufo-ground-handler.mjs:38 (note :39); `FRESH_RUN_ID_RE` at the-tick-ping.mjs 529/594 (note :606). The parser's verdicts match these.

## 6. Universe boundaries (not checked by the gate)
- 160 path-form anchors inside member sections cite another tracked file. The contract excludes them, so they are never checked.
- 25 path-form anchors resolve to no tracked file; 69 `## ` headings have an unresolved first token.
- 672 of 1574 anchors (43%) are unevaluable (noid 504, dead 168). CLEAN means no regression against the ratchet, not that anchors are true.

## 7. Verdict
holds. My false count (200) equals the delivered artifact (200, all 20 per-note lines). Against the spec's 186 the delta is +14 (7.5%, inside 10%) and explained by 5bc40d0. The count is rule-conditional: 200 under the delivered left-first rule, 270 under the frozen right-first text. The brief should name that boundary. Residuals: three unrestored r36 harms, and 120 measured against the claimed 123.

## Commands (outputs above)
- `git --no-optional-locks archive <rev> corpus/knowledge | tar -x -C …` for 0614092, 5833351, a5d627b, a2257f30 (snapshots under `/fast/scratch/kumitate-r37/Truth4/snap/`).
- `git --no-optional-locks rev-parse HEAD:corpus/knowledge` → a2257f30b0bda767d3651b30f0f6b4839f68de9d.
- `python3 run_delivered_rule.py snap/H/corpus/knowledge final-a2257f30.json` → `TOTAL_JSON {"absent": 31, "anchors": 1574, "dead": 168, "elsewhere": 169, "noid": 504, "nonok": 200, "ok": 702}`.
- Same runner with `--pair right` on snap/5833351 → `ok=866 false=0`.
- `sed -n '21,22p' .ufo/waves/round-37/final/fidelity.txt` → `FIDELITY_TOTAL anchors=1574 ok=702 elsewhere=169 absent=31 dead=168 noid=504 nonok=200`.
