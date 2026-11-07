# K98ExecHarm — K3 harm battery (round 98, hyaku run 15)
Seat: K98ExecHarm. Sandbox: /fast/scratch/hyaku/kumitate-r98/K98ExecHarm/lane (git clone --shared, detached 7038ee4c487d8c8d3116d98ec831b8e754337239, toplevel verified). Lane read-only; all writes in seat dir .ufo/waves/round-98/K98ExecHarm/.
Candidate: K98ExecTool/round-gate.mjs — READY absent throughout (checked repeatedly, incl. after >10 min); file present and changing (sha 70b3f6d5... -> e7c1455e...). Per brief, attacked ctl-positive proxy first, then reran full battery + json diff + selftest on the real candidate bytes sha256 e7c1455e8e8afa1267a35de4f4fce86b007104989aafd6783319cef1bb7ed01f (selftest 96/96 PASS). If READY later changes the bytes, re-run battery.sh once.
Receipts (seat dir): base.txt (BASE battery), cand.txt = cand-real.txt (candidate battery), battery-diff.txt, rawdiff.txt, cand-real-proxy-repinned.txt (sandbox re-pin), selftest-real.txt (96/96), base/cand-json exit lists, candidate-at-capture.mjs.
Commands: bash .ufo/waves/round-98/close/battery.sh $S/lane base|cand-real; jsondiff.sh (tracked + --round N for all 81 filed round-*/kumitate.md, --json); node scripts/round-gate.mjs --selftest.
Per-tool verdict (BASE vs CAND):
- proxy-check / --strict: DRIFT both (A_wave 1650->1653, C2 251->252 pre-exists at open per open/battery-before.txt; sandbox delta +3 vs open +1 = 2 wave files landed since open, bookkeeping). CAND adds PIN_DRIFT pin.round-gate (expected: bytes changed); after sandbox-only re-pin PIN_DRIFT gone. => expected
- readme-map CLEAN exit0 both => same
- sources-check CLEAN exit0 both => same
- counter-pins CLEAN pins=50 exit0 both => same
- spotcheck-adopt --check CLEAN exit0 both => same
- round-gate --tracked CLEAN checked=80 exit0 both => same
- round-gate --round 97 CLEAN checks=10 exit0 both => same
- sources-census validate ok exit0 both (W04 x3 identical) => same
--json: 82 files (tracked + 81 rounds); raw diff only durationMs; sans durationMs 0/82 diffs, exits identical. battery.sh tail-4 truncation hides A_wave line in cand output (truncation artifact, full DRIFT line present).
Consumers of round-gate bytes/output: scripts/proxy-check.mjs (pins pin.round-gate hash, SCORECARD pin.round-gate=edaa115f... must be re-pinned at close = expected, K3 bookkeeping); SKILL.md documents CLI + citations JSON (contract kumitate-round-gate-v1 unchanged, no field/schema change); no other scripts/*.mjs, SKILL, .ufo/pins entry reads round-gate output. Swap changes what proxy-check reads (hash) — expected; nothing else.
K3 harm verdict: NO REGRESSION beyond expected PIN_DRIFT. Pre-existing A_wave/C2 DRIFT re-declared at close per r94-r97.
Risk/blocker: READY absent; candidate sha may change again before freeze of M — re-run battery once READY lands. Scratch $S removed before yield per contract (lane clone under scratch).
Tooling installs: none.
