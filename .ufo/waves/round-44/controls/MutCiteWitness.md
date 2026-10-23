RESULT MutCiteWitness rev=292d9266 verdict=survived tested_rev=b01ded326d17f9e445b4b8cd6ce2358ffb07385f mutants=4 caught=0 survived=4 inconclusive=0
Axes: operability (selftest fault detection), coverage (the four requested witness sites); findings only, no claim or repair.
Scope: isolated clone /fast/scratch/hyaku/kumitate-r44/seats/MutCiteWitness/lane; only scripts/cite-check.mjs was mutated, one token at a time.
Revision command: `git -C /fast/scratch/hyaku/kumitate-r44/seats/MutCiteWitness/lane rev-parse HEAD` → `b01ded326d17f9e445b4b8cd6ce2358ffb07385f`.
Source command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff 2a7f37d2b0a413db8499b413783c27a0effdc989 b01ded326d17f9e445b4b8cd6ce2358ffb07385f -- scripts/cite-check.mjs` located the witness and primary-only switch additions.
Expected detector: caught iff exit is non-zero, stdout has exactly one exact `VERDICT: FAIL` line, and stdout has no exact `VERDICT: PASS` line. A failing pristine run would be inconclusive.
All nine runs used this exact detector command, with working directory /fast/scratch/hyaku/kumitate-r44/seats/MutCiteWitness/lane:
`env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u KUMITATE_CITE_SELFTEST_DEPTH -u KUMITATE_CITE_SELFTEST_INJECT_FAIL -u KUMITATE_CITE_SELFTEST_PRIMARY_ONLY TMPDIR=/fast/scratch/hyaku/kumitate-r44/seats/MutCiteWitness/tmp systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node scripts/cite-check.mjs --selftest`
The initial command additionally prefixed `mkdir -p /fast/scratch/hyaku/kumitate-r44/seats/MutCiteWitness/tmp &&`; no other detector arguments or environment settings changed.
Every run printed `75/75 cases passed (hermetic)`. FAIL cases means stdout lines beginning `FAIL  `, not FAIL words inside passing assertions.
| Run order | State at shipped revision | Exit | Exact VERDICT lines, in order | FAIL cases | Result |
|---|---|---:|---|---:|---|
| 1 | Pristine | 0 | `VERDICT: PASS` | 0 | Baseline valid |
| 2 | WC, line 2670: witness `return 1;` → `return 0;` | 0 | `VERDICT: PASS` | 0 | Survived |
| 3 | Restored after WC; pristine before comparison | 0 | `VERDICT: PASS` | 0 | Restoration valid |
| 4 | Comparison, line 2667: `witnessFailures > 0` → `witnessFailures >= 0` | 1 | `VERDICT: PASS`; `VERDICT: FAIL` | 0 | Survived |
| 5 | Restored after comparison; pristine before literal | 0 | `VERDICT: PASS` | 0 | Restoration valid |
| 6 | Literal, line 2668: `'VERDICT: FAIL'` → `'VERDICT: PASS'` | 0 | `VERDICT: PASS` | 0 | Survived |
| 7 | Restored after literal; pristine before switch | 0 | `VERDICT: PASS` | 0 | Restoration valid |
| 8 | Switch, line 2666: PRIMARY_ONLY comparison `=== '1'` → `!== '1'` | 0 | `VERDICT: PASS` | 0 | Survived |
| 9 | Restored after switch | 0 | `VERDICT: PASS` | 0 | Restoration valid |
Hash command, run before mutations, on each mutant and after every restoration: `sha256sum /fast/scratch/hyaku/kumitate-r44/seats/MutCiteWitness/lane/scripts/cite-check.mjs`.
B = pristine and every restored sha256: `115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8`.
| Mutant | Before | Observed mutant sha256 | Restored |
|---|---|---|---|
| WC | B | `3ab73921532a7dd7b1de2fbdd8fe099dad518e81fb1a873052f47bef24182811` | B |
| Comparison | B | `6af3a03ee9aade805129488af2d6c389d682b14cd0baef3ff440a865e20cf2a4` | B |
| Literal | B | `3e53a059d8b0191182b59962bd2dfabb5fd9f3d1d365be1515ab013edc3c4d2f` | B |
| Switch | B | `f86d9412e6fdb5336e9aa45aa2bff01c672ebb2ec9830a7cc69211292061557b` | B |
Survivors: WC, comparison, literal and switch. The comparison produced non-zero exit, but its PASS line disqualifies it under the assigned caught rule; it is not reported as a successful selftest.
[INFERENCE] The ordinary selftest does not observe the witness return or replacement verdict; its injected text child selects the primary-only path. Changing that switch alone leaves the intact primary result sufficient.
After each run: `pgrep -af '/fast/scratch/hyaku/kumitate-r44/seats/[M]utCiteWitness'` → no output, exit 1; the TMPDIR directory was empty, checked by read or glob. All selftest-created temporary trees were removed by the suite.
Final cleanup: `rmdir /fast/scratch/hyaku/kumitate-r44/seats/MutCiteWitness/tmp` → no output, exit 0. Final process check likewise had no matches. Exact source bytes restored; no mutant or patch retained.
Runtime: `node --version` → `v24.21.0`; no tool installations or updates. No census or P44 counter was run. Only this report was written inside the live lane.
