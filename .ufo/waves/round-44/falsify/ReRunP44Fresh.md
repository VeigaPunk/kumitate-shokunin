RESULT ReRunP44Fresh rev=8e822511 verdict=stable runs=6 met=6
Axes: operability, capability omp-census; no coverage claim.
Counterexample attempted: MET depends on the recorded measurement seed. None found in three fresh seeds and seeds 00, ff, 44; this finite sample does not establish stability for every seed.
Revisions: lane 8e8225114dccb31d33fbcb76df78052807a33068; frozen counter and shape 32b7fd561dae38b951828dde8fe11052737fb824; census d81978cdfefdc7409eb26a6363111d6682154093. Extracted with git show from an isolated detached scratch clone; no lane code changed.
Command: sha256sum /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44d-count.mjs /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44-shape.tsv /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/omp-census.mjs
9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e  /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44d-count.mjs
fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44-shape.tsv
fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7  /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/omp-census.mjs
fresh-1 command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/omp-census.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-fresh-1
P44 counter=p44d-count.mjs sha256=9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e seed=1bfeb788d42cfb01a057f1ad9c11e861
P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7); exit=0
fresh-2 command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/omp-census.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-fresh-2
P44 counter=p44d-count.mjs sha256=9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e seed=0381980dfd4bb043dc4fbaa36c1c3c3e
P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7); exit=0
fresh-3 command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/omp-census.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-fresh-3
P44 counter=p44d-count.mjs sha256=9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e seed=8aec736ef5e09f1e7158f73e38e19f23
P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7); exit=0
seed-00 command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/omp-census.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-seed-00 --seed 00
P44 counter=p44d-count.mjs sha256=9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e seed=00
P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7); exit=0
seed-ff command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/omp-census.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-seed-ff --seed ff
P44 counter=p44d-count.mjs sha256=9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e seed=ff
P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7); exit=0
seed-44 command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44d-count.mjs --census /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/omp-census.mjs --shape /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44-shape.tsv --work /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-seed-44 --seed 44
P44 counter=p44d-count.mjs sha256=9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e seed=44
P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7); exit=0
FAIL CASE lines: none across all 1,242 case executions. Six counters ran concurrently with separate work directories; no stderr output.
After fresh-1: pgrep -af '[/]fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-fresh-1' → empty, exit=1; rmdir /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-fresh-1 → empty, exit=0.
After fresh-2: pgrep -af '[/]fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-fresh-2' → empty, exit=1; rmdir /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-fresh-2 → empty, exit=0.
After fresh-3: pgrep -af '[/]fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-fresh-3' → empty, exit=1; rmdir /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-fresh-3 → empty, exit=0.
After seed-00: pgrep -af '[/]fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-seed-00' → empty, exit=1; rmdir /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-seed-00 → empty, exit=0.
After seed-ff: pgrep -af '[/]fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-seed-ff' → empty, exit=1; rmdir /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-seed-ff → empty, exit=0.
After seed-44: pgrep -af '[/]fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-seed-44' → empty, exit=1; rmdir /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/p44work-seed-44 → empty, exit=0.
Final command: pgrep -af '[/]fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh' → no output, exit=1; no remaining matching process.
Full receipts: /fast/scratch/hyaku/kumitate-r44/seats/w2-ReRunP44Fresh/{fresh-1,fresh-2,fresh-3,seed-00,seed-ff,seed-44}.txt; each includes its exact command, every CASE line, exit, process check and cleanup.
Smallest safe correction: none indicated by this attack. These are re-derivations, not replacements for the counted measurement; no admission or judgment is made.
Tool installations or updates: none.
