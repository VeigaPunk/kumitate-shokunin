# K96ExecHarm — harm battery (K3), round 96

Sandbox: /fast/scratch/hyaku/kumitate-r96/K96ExecHarm/lane (clone, detached @617e80cd).
Candidate: READY never appeared (checked repeatedly >10min) → used regenerated ctl-positive
via probe/make-controls96.py on BASE bytes, sha256 8793e0d905ed690c329c884f6f6071409785fa1bb1594d7adaf0ae35071fbe6c (per instructions: say so).

Per-tool verdicts (base/ vs cand/ dirs under .ufo/waves/round-96/K96ExecHarm/):

| tool | verdict |
|---|---|
| proxy-check | EXPECTED-PIN: cand adds PIN_DRIFT pin.round-gate (aba737dc→8793e0d9); after re-pin of sandbox SCORECARD pin only, identical to base (A_WAVE/C2/C2_total DRIFT exit=1) |
| readme-map | SAME (CLEAN exit=0) |
| sources-check | SAME (CLEAN exit=0) |
| counter-pins | SAME (CLEAN exit=0) |
| spotcheck-adopt --check | SAME (CLEAN exit=0; header line only) |
| round-gate --tracked | SAME (CLEAN exit=0) |
| round-gate --round 95 json | EXPECTED: sole delta citations.outsideRows: [] added; verdict CLEAN exit=0 |
| round-gate --round 95 text | SAME (CLEAN exit=0) |
| round-gate --selftest | SAME (89/89 PASS exit=0) |
| sources-census validate | SAME (ok exit=0) |
| real-reg 93/94/95 | EXPECTED: declared unchanged vs BASE, malformedRows [], outsideRows [] (BASE: key absent) |

Live old-sha carriers: SCORECARD.md line 321 (`pin.round-gate=aba737dc…`) is the only live pin.
All other aba737dc hits are historical r95/r96 receipts+controls (not live).

Full evidence: .ufo/waves/round-96/K96ExecHarm/{base,cand,battery-diff.txt}
Conclusion: no K3 harm regression. Only expected pin drift + intended outsideRows key.
Scratch /fast/scratch/hyaku/kumitate-r96/K96ExecHarm removed before yield.
