RESULT MutKimiLocks rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=inconclusive killed=4/8 survived=0 inconclusive=4

Scratch clone: `/fast/scratch/hyaku/kumitate-r42/falsify/MutKimiLocks/lane`, detached at c9a084bf03fb043d3cce5da102fffbc023552a45. No tools installed or updated.
C1 (census detector): `setsid --wait prlimit --nproc=$(( $(ps -u $(id -u) -o nlwp= | awk '{s+=$1} END {print s+0}') + 64 )) timeout -s KILL 30 node scripts/kimi-census.mjs --selftest`
C2 (proxy detector): `setsid --wait prlimit --nproc=$(( $(ps -u $(id -u) -o nlwp= | awk '{s+=$1} END {print s+0}') + 64 )) timeout -s KILL 30 node scripts/proxy-check.mjs --selftest`
`ps 0.2.0` rejected `-L`; the wrapper sums `nlwp` to preserve the per-thread allowance. One selftest ran at a time.

C1 pristine, rev c9a084bf03fb043d3cce5da102fffbc023552a45: `KIMI_CENSUS_SELFTEST: 52/52 pass; VERDICT: PASS; exit=0`.
C1 locks family K3→K4, hash 2679e07f3a936fd56aef847a652969f7383b9ea71b54018fd2006675f1218887: output `FAIL --json families read 4/27/10/9/3 and members=53; members=53 K1=4 K2=27 K3=9 K4=10 K5=3 rows=30 strays=0; KIMI_CENSUS_SELFTEST: 50/52 pass; VERDICT: FAIL; exit=1` — killed.
C1 locks kind dir→file, hash 32f93aa6fce473d6f44562a46617e32b55614422ac6dbf06172c9ecd9dcf5d9a: output `Error: ENOTDIR: not a directory, mkdir '/tmp/kumitate-kimi-census-selftest-Z764Dx/root-locks-present/locks/sessions'` at selfTest line 720; exit=1 — crash, not killed.
C1 modeFloor 0700→0600, hash 99fef25692c8f9cea134ddafc522a401847becc060807e50c18c4c54988d3bef: output `Error: EACCES: permission denied, mkdir '/tmp/kumitate-kimi-census-selftest-iSCTYp/root-locks-present/locks/sessions'` at selfTest line 720; exit=1 — crash, not killed.
C1 modeFloor 0700→0750, hash c2dd760cba3d0ebd218262c2fcbb729d35ede6a46c3777bee58feff32f6df542: output `FAIL SHAPE_DRIFT: locks/ below its 0700 floor; FAIL K3 locks/ present => CLEAN and counted as one declared root directory; KIMI_CENSUS_SELFTEST: 50/52 pass; VERDICT: FAIL; exit=1` — killed.
C1 secret true→false, hash ad3f386eee85cb74ff5c8fe77509ee3a4b1e04d4519878109607ffd80d8fbf37: output `FAIL SHAPE_DRIFT: locks/ below its 0700 floor; FAIL K3 locks/ present => CLEAN and counted as one declared root directory; FAIL SHAPE_DRIFT: K3 locks/ replaced by a file is named; KIMI_CENSUS_SELFTEST: 49/52 pass; VERDICT: FAIL; exit=1` — killed.
C1 FROZEN.K3 10→9, hash a993ede5ae4354800849ca4b5c15850aa24d7d73fd552d9f2d4717487a9b54bb: output `FAIL --json families read 4/27/10/9/3 and members=53; members=53 K1=4 K2=27 K3=10 K4=9 K5=3 rows=30 strays=0; KIMI_CENSUS_SELFTEST: 51/52 pass; VERDICT: FAIL; exit=1` — killed.
C1 restored: `KIMI_CENSUS_SELFTEST: 52/52 pass; VERDICT: PASS; exit=0`.

C2 pristine, rev c9a084bf03fb043d3cce5da102fffbc023552a45: output `FAIL  [ 80/121]  fail-closed: KIMI_ROOT_NOT_A_DIR (--kimi-root is a file) — exit=null; PROXY_SELFTEST: 93/121 pass; VERDICT: FAIL; exit=1`. Bounded retry output `setsid: child 129542 did not exit normally: Success; exit=9` (30-second timeout). Baseline is inconclusive, not a kill.
C2 locks family K3→K4, hash db3b01a0fa9de85d6f81fc3a5d6cb6799458b203123018137f48940520bccbdf: `setsid: child 639886 did not exit normally: Success; exit=9` (30-second timeout) — inconclusive.
C2 locks kind dir→file, hash 9f77079b46e9179fe172d1133350281c09684004a0731f93863840e04efa1d4e: `setsid: child 826995 did not exit normally: Success; exit=9` (30-second timeout) — inconclusive.
C2 restored detector: `setsid: child 939555 did not exit normally: Success; exit=9` (30-second timeout); no verdict.

Restoration: census pristine and final SHA-256 both `a1bab1b552d4f2c22f088ed8067a632ceb027bb7536ca0d546f755d68f0edb63`; proxy pristine and final SHA-256 both `4c2819b02ded6aff7ca64d069e5c955ba7a01a0495e3b4bdf1fc92f97dd8024a`. Hashes were checked after each restore; final own-scratch process check: `LEFTOVERS=0`. The unrelated timeout seen during a broad scan belonged to `CritSeparabilityTip/T2`; it was not touched.