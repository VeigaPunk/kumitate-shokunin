# K93ExecHarm — harm and integration delta (`seat-route` v1 → v2)

READY candidate sha256 `98a5a3a341b2b41540206caa5378d2ff5dacf02015f8aedf160b9d0f72b6efe9` (1080 lines,
`CONTRACT = kumitate-seat-route-v2`); base v1 `cd7ee03dd814da01f6c73ad4113022c2484dea182f95b0a84e07f9b6810ccfac`;
lane freeze `b6204949`. Receipts: `.ufo/waves/round-93/K93ExecHarm/` (`battery-base.txt`, `battery-cand.txt`,
`battery-cand-pinfix.txt`, `battery-diff-final.txt`, `diff-final/`, `consumer-grep.txt`,
`pre-existing-drift.txt`, `counter-oracle-captured.txt`, `integration-delta.md`).

Battery, base vs M-sim candidate:
- `seat-route --selftest`: PASS 37/37 → PASS 54/54, exit 0 both.
- `proxy-check`: base 3 terms (A_wave 1381/1399, C2 236/237 ×2); candidate adds only
  `GATE_PIN_DRIFT pin.seat-route cd7ee03d…→98a5a3a3…`. `--strict` same shape, no new PIN_UNPINNED.
- `counter-pins` CLEAN pins=50 both; `sources-check` CLEAN identical line both.
- `round-gate --round 92` (real-history clone): CLEAN checks=10 errors=0 both; `--close` reads
  UPSTREAM_MISSING exit 2 in the detached clone for both (clone artifact, not a lane reading).
- Pin-fix simulation: changing `SCORECARD.md:357` alone removes the pin term; residual drift is byte-identical
  to base (`pre-existing-drift.txt` attributes it to the 18 r93 control/probe scripts + the r92 spotcheck
  README row, not the candidate).

Real-data delta (`battery-diff-final.txt`): 61 sample-A transcripts, both tools under prlimit/timeout —
EXIT_DRIFT 0, V1_VALUE_DRIFT 0, KEYSET_DRIFT 0, `errors`→`error_attempts` bijection 61/61, no `errors` key;
wave mode r91/r92: 12 seats, same order, exit 0 (`--strict` too).

Integration edits (`integration-delta.md`): MUST `SCORECARD.md:357` pin; MUST `SKILL.md:647` registry row
(fields + contract id); MUST `SKILL.md:765` contract id; SHOULD knowledge note lines 2/3/55/83/102;
SHOULD `corpus/README.md:272` "v1"→"v2"; OPTIONAL `SCORECARD.md:1999` (Capabilities). No change:
`scripts/proxy-check.mjs:580` map, `.ufo/pins/counter-pins.json`, `.ufo/pins/readme-map.json:238`,
`SKILL.md:284/589/703`; historical r92 rows are not rewritten.

COUNTER finding (not a kill): `counter-oracle-captured.txt` — oracle93 (and oracle92) falls through to the
default `model_change` when the first `subagent:<seat>` row exists with a non-string/absent `model`; v1 and v2
read `null`. Not reachable on A (61/61) or F as frozen; H-set residual risk only. No blockers.
