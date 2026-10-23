RESULT ReRunP44Replay rev=8e822511 verdict=identical passed=207/207
Attack: the counted-run receipt final/p44-measured-d81978cd.txt, re-derived over committed bytes with the plan's measurement command and the receipt's own seed.

Extracted inputs (git show, read-only, into scratch /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Replay):
- counter 32b7fd56:.ufo/waves/round-44/probe/p44d-count.mjs -> sha256 9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e (matches plan pin)
- shape   32b7fd56:.ufo/waves/round-44/probe/p44-shape.tsv   -> sha256 fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 (matches plan pin)
- census  d81978cd:scripts/omp-census.mjs                   -> sha256 fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7 (matches receipt header)

Command run (host safety bounds honored):
  systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node $S/p44d-count.mjs --census $S/omp-census.mjs --shape $S/p44-shape.tsv --work $S/p44work --seed 2676cbe767adc1820fd316e02a7b9020
Observed (full log kept at $S/replay-d81978cd.txt):
  seed echo: seed=2676cbe767adc1820fd316e02a7b9020; shape header: entries=38 base=19 sidecar=12 chain=7 cases=207
  P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7)
  exit=0 (from PIPESTATUS[0]); wall time 4.30 s

Comparison vs final/p44-measured-d81978cd.txt:
- CASE lines: 207 in the receipt, 207 in the replay; diff of the extracted CASE sections is empty — byte-identical, including case order, every generated member name, kind, mode and every P44=PASS.
- Summary line: byte-identical P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=fd4d1c4e…).
- Only diff hunks: (1) the receipt's trailing `exit=0` line has no counterpart in the replay log file because my run printed the exit via echo outside the tee'd pipeline; the exit was directly observed as 0. (2) P44 header lines differ only in the sandbox work-dir path (receipt: measure.gXQZgJ; replay: seats/w2-ReRunP44Replay); sha256 and seed fields on those lines are identical after path normalization.

Conclusion: the receipt is reproducible from the pinned committed bytes (counter+shape at 32b7fd56, census at d81978cd) under the receipt's seed. Verdict: identical, passed=207/207. Kill rule 1 not triggered.

Residual risk / gaps:
- This is a same-host, same-seed re-derivation; it proves seed-determinism of case generation and byte-stability of the committed census, not portability (different seed runs are other seats' items).
- The receipt's `#` comment provenance lines (start/end timestamps, load averages) are annotations and were intentionally outside the CASE diff; they differ by nature of a second run.
Host safety: run scoped (MemoryMax=4G, TasksMax=256, timeout KILL 900); no leftover processes of this seat after the run (two p44d processes seen belong to sibling seat w2-MutChecklistBlindness, not touched); temp work dir $S/p44work removed; lane untouched except this report file.
Tooling: no tools installed or updated for this item (node, systemd-run, bubblewrap already present).
