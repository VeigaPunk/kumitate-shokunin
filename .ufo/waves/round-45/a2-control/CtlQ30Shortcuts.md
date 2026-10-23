RESULT CtlQ30Shortcuts rev=a2e5b54c verdict=meets ids=FAIL order=FAIL junk=PASS
Axis: operability. Control coverage: seed-dependent identifiers, member order, and irrelevant member names. No C1 entry judgment.
Revision command: `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` -> `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f`.
Read the committed plan including E1–E7 and K1–K5, operator RULES.md, and inherited-tracked.diff:58–85; inherited material was treated as untrusted.
Scratch and command working directory: `/fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQ30Shortcuts` (R below).
Copied `.ufo/waves/round-45/probe/catalog-check.mjs.txt`, `toy-count.mjs.txt`, and `toy-shape.tsv` to R as `catalog-check.mjs`, `toy-count.mjs`, and `toy-shape.tsv`; no lane source was modified.
SHA-256 before and after, measured with `sha256sum` on the three source paths and the three scratch copies:
`catalog-check.mjs`: `51e11b8f73929b49a07f14401eb9f3c9dcb50a6bb9dfa1b342a736c57cd8a63a`.
`toy-count.mjs`: `481d255feab3b58f504f25805ac1a79ce435f5738d1d626bebc0a353ecfde6c3` (P below).
`toy-shape.tsv`: `9b53bc39714142c99104f4d5f5c100a73f8969f93cd2c51cace20211503baf9a`.
Detector: `run-detector.sh` executes the following exact command, with ROOT=R and variant=ids, order, or junk:
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node "$ROOT/catalog-check.mjs" --label "$variant" --cmd "node $ROOT/$variant/probe-count.mjs --census {CENSUS} --shape {SHAPE} --seed {SEED} --list" --shape "$ROOT/toy-shape.tsv" --seed-a 0011223344556677 --seed-b aabbccddeeff0011 --require-fresh`
The command is unchanged across pristine, mutated, and restored phases for each variant. All child listing processes inherit the same scope and timeout.
Expected: pristine and restored fresh toy PASS/exit 0; every fixed-catalog shortcut FAIL/exit 1. Exit 2 or a failed positive baseline would be inconclusive.
Pristine commands: `cp toy-count.mjs ids/toy-count.mjs && bash run-detector.sh ids pristine`; `cp toy-count.mjs order/toy-count.mjs && bash run-detector.sh order pristine`; `cp toy-count.mjs junk/toy-count.mjs && bash run-detector.sh junk pristine`.
All three pristine runs printed `CATALOG: FRESH (clean=12 recurring=0)` and `CATALOG_GATE: PASS (no CLEAN shape recurs across seeds)`; `DETECTOR_EXIT=0`; `LEFTOVER_PROCESS none`.
All three active probe-count.mjs files initially had SHA-256 P. The three cheap shortcut wrappers call their local pristine toy with `--variation none`, retaining the same twelve fixed CLEAN member sets before their one presentation change.
Identifiers mutant: append `-<seed>` only to each CLEAN case id; no member name, kind, or mode changes.
Command: `bash run-mutation.sh ids` (copies shortcut-ids.mjs onto ids/probe-count.mjs, runs the detector, and restores via EXIT trap).
Mutated SHA-256: `647d53d431d822f0d181d676f2ba35ff46c18e65301dcafd9084b0ca7d808f8b`.
Output: `CATALOG: REUSED (clean=12 recurring=12)`.
Output: `CATALOG_GATE: FAIL (12 CLEAN shape(s) recur across seeds; a catalog can memorise them)`; `DETECTOR_EXIT=1`; `LEFTOVER_PROCESS none`.
Verdict: killed. Identifier changes did not defeat the detector.
Order mutant: remove and re-add existing main.db-wal with `-1 sidecars`; reverse the order of its add token and the fixed member add token for seed b. Reconstructed member names, kinds, modes, and counts stay identical.
Command: `bash run-mutation.sh order`.
Mutated SHA-256: `8932a762ac800d703e3cc3fc5c00edf0adcb2f1cad94ad53a99c8daf640bfed0`.
Output: `CATALOG: REUSED (clean=12 recurring=12)`.
Output: `CATALOG_GATE: FAIL (12 CLEAN shape(s) recur across seeds; a catalog can memorise them)`; `DETECTOR_EXIT=1`; `LEFTOVER_PROCESS none`.
Verdict: killed. Member order changes did not defeat the detector; recurring fingerprint prefixes match the identifier control's twelve prefixes.
Junk mutant: append `+zz-<seed>:file:600` to every fixed CLEAN shape and increment its listing entry count by one. Everything else in each fixed member set stays unchanged.
Command: `bash run-mutation.sh junk`.
Mutated SHA-256: `4b077114b52145e993f554cc63563000253c37efff58e27aa9608beeb8ac55c8`.
Output: `CATALOG: FRESH (clean=12 recurring=0)`.
Output: `CATALOG_DETAIL: label=junk cleanA=12 cleanB=12 uniqueA=12 recurring=0 fraction=0.000 fracCases=0.000 seedA=0011223344556677 seedB=aabbccddeeff0011`.
Output: `CATALOG_GATE: PASS (no CLEAN shape recurs across seeds)`; `DETECTOR_EXIT=0`; `LEFTOVER_PROCESS none`.
Verdict: survived. The gate is met by a junk-variation shortcut; it tests whole-byte member-set novelty, not novelty of rule-relevant cases.
[INFERENCE] Fingerprint the sorted rule-relevant projection of each shape, excluding members unknown to the census rules while retaining every name/kind/mode distinction those rules inspect. Removing these zz-* additions would expose the same twelve recurring cores. This proposed fingerprint was not implemented or run.
Inherited statements: CONFIRMED fresh toy PASS with 12 CLEAN cases and zero recurring; CONFIRMED identifiers/order are ignored; REFUTED whole-shape freshness as sufficient protection against a fixed catalogue plus irrelevant variation. No p44d result was re-run by this item.
Each mutation's EXIT trap printed `RESTORED` with SHA-256 P, including the surviving junk mutant.
Restored commands: `bash run-detector.sh ids restored`; `bash run-detector.sh order restored`; `bash run-detector.sh junk restored`.
All three restored runs printed `CATALOG: FRESH (clean=12 recurring=0)` and `CATALOG_GATE: PASS (no CLEAN shape recurs across seeds)`; `DETECTOR_EXIT=0`; `LEFTOVER_PROCESS none`.
Restoration command: `cmp toy-count.mjs ids/probe-count.mjs && cmp toy-count.mjs order/probe-count.mjs && cmp toy-count.mjs junk/probe-count.mjs && printf 'RESTORATION byte-for-byte equal for ids/order/junk\n'`.
Output: `RESTORATION byte-for-byte equal for ids/order/junk`; all three final active hashes equal P. Source and copied detector/shape hashes also equal their initial values above.
Final cleanup command: `pgrep -af '[/]fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQ30Shortcuts/'` -> no output, exit 1 (no matching process). No large temporary files were created.
Raw output: R/{ids,order,junk}/{pristine,mutated,restored}.log. Generators: R/shortcut-{ids,order,junk}.mjs; activating copies live only in their respective variant directory and are restored.
Tools installed or updated: none. The report is the only file written inside the lane; no git/jj writes, sibling edits, or operator-configuration reads beyond RULES.md.
