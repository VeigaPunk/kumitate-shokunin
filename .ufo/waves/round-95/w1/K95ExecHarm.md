# K95ExecHarm — harm battery (K3), round 95 C1

Sandbox: /fast/scratch/hyaku/kumitate-r95/K95ExecHarm/lane (clone --shared, HEAD ee8479be). Candidate: K95ExecTool/READY absent; attacked ctl-positive regenerated via make-controls95.py (sha 5c472696a93929d96d3a5a3ade6937e815d8743c0e024a1c0c50620951a99310). SAY SO: candidate-independent work done first; used ctl-positive as stand-in.

Frozen counter on ctl-positive: `node .ufo/waves/round-95/probe/probe95-c1.mjs --tool <ctl-positive> --work <scratch>/probe --freeze eadd519d6c5b7c76a12c4ed8e82c1a4834d585db` => C95_C1: HELD a=1/1 b=1/1 c=78/78 d=1/1 (receipt in scratch probe run).

BASE battery (base/): proxy-check DRIFT A_wave/C2 bookkeeping exit1 (matches open/battery-before.txt); readme-map CLEAN; sources-check CLEAN rows=210; counter-pins CLEAN pins=50; spotcheck-adopt --check CLEAN; round-gate --tracked CLEAN checked=77; round-gate --round 94 --json CLEAN declared=[] (no malformedRows key in BASE); surface-probe --checklists 39/47 FAIL pre-existing sandbox drifts (REPORTS_DIR_MISSING, proxy DRIFT, OMP/kimi/source-dupes).

CAND battery (cand/): same verdicts/exits per battery-diff.txt. Only difference is expected pin drift: proxy-check adds PIN_DRIFT pin.round-gate (11f83a1a -> 5c472696); after sandbox-only repin of SCORECARD pin.round-gate -> cand/proxy-repinned.txt clears PIN_DRIFT leaving only open bookkeeping. round-gate --selftest CAND 79/79 PASS. Real-registry probe: CAND --round 93 --json and --round 94 --json both citations.malformedRows=[] and declared unchanged vs BASE.

Files carrying old sha 11f83a1a after repin: historical receipts only (round-94 close/*.txt, round-95 controls/controls-sha256.txt + ctl-*.txt, LOG.md, SCORECARD.md prose lines, corpus/lessons/round-94-verifier-spotcheck.md); only live pin is SCORECARD.md pin.round-gate (sandbox repinned; lane untouched).

Battery-diff: .ufo/waves/round-95/K95ExecHarm/battery-diff.txt (one line per tool: same/expected-pin/regression). No regressions found; K3 not fired on ctl-positive stand-in.

Report: .ufo/waves/round-95/w1/K95ExecHarm.md
