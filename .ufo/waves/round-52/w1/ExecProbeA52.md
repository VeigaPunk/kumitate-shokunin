# ExecProbeA52 — counter-executability witness

## Result

The repaired A52 counter reached HELD on the committed scratch post-state, before any real round-52 data existed:

`ATTEST52: ATTEST52_HELD held=13/13 checks=13 rev=80bc1e857f78abb3a663f7530b216b78236c104c rule=A52 version=v1 | B1 PASS | B1c PASS | B2 PASS | B2c PASS | B2e PASS | B3 PASS | B3c PASS | B4 PASS | B4c PASS | B4d PASS | B5 PASS | B5c PASS | B6 PASS`

D52 also read HELD against the scratch entry and source rows:

`DOCTRINE52: DOCTRINE52_HELD held=5/5 checks=5 rev=80bc1e857f78abb3a663f7530b216b78236c104c rule=D52 | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS`

Both probes were run from the lane working tree after freeze-repair addendum commit `8fbf0fc8c2f47322b9c21fa5908cbb629734f84f`. No checks missed.

## Scratch construction

- Archived freeze commit `f539a71e236a4d66810851c1f2fb6e1abe61ec19` into `build/ExecProbeA52/scratch.q8D075`, overlaid `build/ExecInstrumentV2/receipt-attest.mjs` (sha256 `aed7191c29edea3fb317ce9aaf1bd9fe6ec7b954c4421788057730e82cf20b29`), and initialized/committed the scratch Git repo. Final scratch HEAD: `80bc1e857f78abb3a663f7530b216b78236c104c`.
- Added the ScribeEntry draft and S102/S103 rows, both needed README map rows (the unrowed `lessons/round-51-verifier-spotcheck.md` plus the new entry), updated `pin.receipt-attest`, and re-derived the SCORECARD stanza from an actual `UFO_SRC=/home/vgpnk/Projects/ufo-fsd-alpha node scripts/proxy-check.mjs --strict` run. The measured terms were A=73, C2=119, C2_total=119; after those stanza edits the strict output was:

`PROXY: MATCH (A=73 C=23 operability=9; C1=19/19 C2=119/119 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)`

- Generated three real v2 `run` receipts wrapping `node scripts/bind-oracle.mjs --selftest`, `node scripts/sources-check.mjs`, and `node scripts/round-gate.mjs --selftest`; each recorded command-exit 0. Body `wall_start` values were `2026-10-24T04:09:59.142Z`, `2026-10-24T04:13:26.253Z`, and `2026-10-24T04:16:51.225Z` (first-to-last 412.083 s). Copied run-2 to `attest52-run-2-replayed.txt`, rewrote only its prelude to `2000-01-01T00:00:00.000Z`, and left its sidecar bytes untouched.
- Included the MutCounter52 hold-call-deleted transcript, then independently replayed that mutant against the scratch tree. It printed `ATTEST52: ATTEST52_UNMET held=0/0 checks=0 rev=4d629b28ce37179a0a9defcdd14fd6cd0a046a01 rule=A52 version=v1 |` and exited 1; this replay is appended to the embedded `build/MutCounter52/counter-mutant.txt`. The final A52 run passed B5c.

## Retained evidence and changed paths

- `build/ExecProbeA52/scratch.q8D075/` — committed scratch repo, including receipts/sidecars, doctored control, entry/source rows, README and SCORECARD edits, and mutant transcript.
- `build/ExecProbeA52/scratch-held.txt` / `.exit` / `.stderr.txt` — exact repaired A52 stdout, exit `0`, empty stderr.
- `build/ExecProbeA52/scratch-doctrine.txt` / `.exit` / `.stderr.txt` — exact repaired D52 stdout, exit `0`, empty stderr.
- `build/ExecProbeA52/counter-mutant-scratch.txt` / `.exit` — independent mutant stdout and exit `1`.
- `.ufo/waves/round-52/w1/ExecProbeA52.md` — this report.

## Risks and blockers

No blocker. The scratch contains the ScribeEntry draft's `FILL-AT-INTEGRATION-*` bindings; D52 held on the already-bound clauses, but L1 must replace the pending bindings and rerun the counters at the integrated close revision. No tools were installed.