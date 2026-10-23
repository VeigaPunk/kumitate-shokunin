RESULT ReRunBefore rev=8e822511 verdict=reproduced

Attack: the before value `P44_COUNT: UNMET (passed=0 cases=207)`. Re-derived over committed bytes.

1. Census absent at round open 6cda8c353c7dd7a890eb20382ffa55fac9daaf6d:
$ git -C <lane> cat-file -e 6cda8c35…:scripts/omp-census.mjs ; echo exit=$?
fatal: path 'scripts/omp-census.mjs' exists on disk, but not in '6cda8c35…' ; exit=128
$ git ls-tree 6cda8c35… -- scripts/omp-census.mjs → no output, exit=0 (not in tree).
scripts/ at that commit holds 10 files (anchor-truth, cite-check, claims-check, gate-mutants,
kimi-census, proxy-check, round-gate, sources-check, surface-probe, wave-census); no omp-census.mjs.

2. Frozen inputs extracted from committed bytes; sha256 all match the contract values:
p44d-count.mjs @32b7fd56 = 9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e
p44-shape.tsv @32b7fd56 = fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71

3. Live re-run of p44d with a non-existent census path, receipt seed replayed:
$ systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 \
  node $S/p44d-count.mjs --census $S/p44work/absent/omp-census.mjs \
  --shape $S/p44-shape.tsv --work $S/p44work --seed 2471c954a684038ad6be5153abf66bf7
exit=1
header: P44 counter=p44d-count.mjs sha256=9ea97d86… seed=2471c954…
P44 census=…/absent/omp-census.mjs sha256=absent
P44 shape=… entries=38 base=19 sidecar=12 chain=7 cases=207
trailer: P44_COUNT: UNMET (passed=0 cases=207 floor=20 census_sha256=absent)
All 207 CASE lines read P44=FAIL (exit=absent verdict=none); 0 PASS lines.
`diff` of my 207 CASE lines vs open/p44d-before-6cda8c35.txt's CASE lines: identical
(same seed replays case generation and order exactly). Matches the committed receipt.

4. Committed before receipts, all four counters, each reads passed=0 and census_sha256=absent, exit=1:
open/p44-before-6cda8c35.txt : P44_COUNT: UNMET (passed=0 cases=59  floor=20 census_sha256=absent) exit=1
open/p44b-before-6cda8c35.txt: P44_COUNT: UNMET (passed=0 cases=87  floor=20 census_sha256=absent) exit=1
open/p44c-before-6cda8c35.txt: P44_COUNT: UNMET (passed=0 cases=150 floor=20 census_sha256=absent) exit=1
open/p44d-before-6cda8c35.txt: P44_COUNT: UNMET (passed=0 cases=207 floor=20 census_sha256=absent) exit=1
Plan's frozen record (plan.md § Frozen bytes + three redesigns) states the same values.

No discrepancy found: the before value reproduces byte-for-byte over committed inputs.
Hygiene: no processes left (pgrep -f w2-ReRunBefore-2 → none). No tools installed; node/git/bwrap already present.
