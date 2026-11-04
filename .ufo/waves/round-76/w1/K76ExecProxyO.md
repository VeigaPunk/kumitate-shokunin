# K76ExecProxyO — C1 mechanism

Axes: coverage:omp + operability/tooling. Base: `cabc7aefd5f1562299f757e23207710c12e4ed58`, with scoped uncommitted changes in the exclusive shared scratch clone. No lane implementation file was edited in place. No installs, commits, pushes, external substrate writes, or subagents.

## Delivery

All paths below are relative to the lane root:
- Patch: `.ufo/waves/round-76/build/K76ExecProxyO/patch.diff`
- Full files: `.ufo/waves/round-76/build/K76ExecProxyO/files/{omp-census.mjs,proxy-check.mjs,SCORECARD.md}`
- Consistent evidence-only scorecard: `.ufo/waves/round-76/build/K76ExecProxyO/scorecard-consistent.md`
- Every receipt is in `.ufo/waves/round-76/build/K76ExecProxyO/`.

Exports only were added to the census (`BASE_MEMBERS`, `CHAIN_FAMILIES`, `census`); the existing CLI guard remains unchanged. Proxy imports the census, derives six O terms, adds `--omp-root`, rejects missing/unreadable O inputs before comparison, and cross-checks the sixth axis. Hermetic fixtures explicitly pass an OMP root; a symlink binding note preserves all pre-existing regular-file C2 fixture arithmetic. The scorecard evidence copy adds O1, six stanza values, the updated O-axis explanation, and the two changed script pins. No `spotcheck-adopt` gate pin was added and `readme-map.mjs` was untouched.

## Retained results

- `proxy-selftest.txt`: `PROXY_SELFTEST: 145/145 pass`, `VERDICT: PASS`, exit 0. Includes stale-value checks for every O key, extra-member recomputation, absent/file roots, missing note, O-axis drift and zero-denominator arithmetic. The old missing-Axes test now expects six findings rather than five, as required by the additive axis.
- `omp-selftest.txt`: `VERDICT: PASS (49 cases)`, exit 0.
- `omp-census.txt`: `OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=64 findings=0 bound=35/35)`, exit 0.
- `proxy-json.txt`: `C1o=1 C1o_total=1 O_members=64 O_findings=0 O_bound=35 coverage_omp=10`, exit 1 solely for inherited `C2_TOTAL_DRIFT` (181 declared, 182 computed) and `AXES_DRIFT term=coverage` (10 declared, 9 computed).
- `proxy-strict.txt`: same two inherited findings only, exit 1. No new finding class and no `GATE_PIN_DRIFT`.
- `proxy-consistent-strict.txt`: evidence scorecard declares measured C2_total=182 and coverage=9; `PROXY: MATCH (A=833 C=33 operability=9; C1=19/19 C2=181/182 coverage=9; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=55/55 coverage:kimi-layer=10; O=1/1 O_members=64 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match; src-rev=31c465f15669)`, exit 0. This does not pretend to repair C2.
- `proxy-consistent-json.txt` and pure `proxy-json.json`: same measured terms, MATCH exit 0.
- `negative-root-not-dir.txt`: `PROXY: FAIL-CLOSED (OMP_ROOT_NOT_A_DIR)`, exit 2 (a regular file supplied as root).
- `negative-note-missing.txt`: `PROXY: FAIL-CLOSED (OMP_NOTE_MISSING)`, exit 2 (minimal self fixture lacks the note).
- `negative-extra-member.txt`: shape-only reconstruction of all live depth-1 inodes plus one bogus file: `O_members=65 O_findings=1 coverage_omp=9`, exit 1, including `O_MEMBERS_DRIFT`, `O_FINDINGS_DRIFT`, `COVERAGE_OMP_DRIFT`, and O-axis drift, plus the inherited C2 findings. No live member contents were copied or read.
- `negative-axis.txt`: `AXES_DRIFT term=coverage:omp declared=9 computed=10`, exit 1, plus the inherited findings.
- `diff-stat.txt`: `SCORECARD.md | 13 +++-`; `scripts/omp-census.mjs | 6 +-`; `scripts/proxy-check.mjs | 186 ++++++++++++++++++++++++++++++++++++++----------`; `3 files changed, 161 insertions(+), 44 deletions(-)`.

## Divergences / risks

1. **Frozen C1(a) literal grep predicate misses:** `coverage-omp-json-count.txt` measures **2**, not the plan's **1**, lines containing `"coverage_omp"`. As for every existing term, JSON includes both its numeric computed value in `terms` and its declared string in `terms.declared`. Both are 10. I retained the existing declaration-transparency convention rather than conceal the duplicate or silently weaken the frozen predicate. This is an honest predicate disagreement for L1; no claim of full C1 admission is made.
2. The clone's default and strict verdict remain the explicitly permitted pre-existing C2_total/coverage drift. The separate evidence-only consistent scorecard reaches strict MATCH without altering the corpus/README/pin.
3. The live OMP root is mutable external state; retained observations are from this execution, not a guarantee of its later shape. The census opens only the binding note; OMP member contents remain shape-only.
4. Per-arm mutation killing belongs to the assigned mutation seat; it was not run by this executor. LSP definitions/references/refactors were unavailable in this seat's mounted tool inventory; direct source inspection was used.
5. Full `.mjs` replacements under the requested build directory can themselves affect the lane's whole-tree A count on integration. L1 must remeasure the stanza/pins after all deliveries, as the frozen plan already requires.

Parent integration checks: apply scripts and selected scorecard changes; reconcile the literal JSON grep predicate without hiding the miss; integrate C2 and remeasure all terms/pins; run the post-integration gate once. No frozen plan or oracle was changed.

## Self-evaluation

Accuracy 4/5: exact receipts retained, but the frozen JSON line-count predicate disagrees. Completeness 4/5: scoped mechanism and requested receipts delivered; mutation admission remains with its assigned seat. Clarity 4/5: report distinguishes inherited drift from the separate MATCH evidence. Actionability 4/5: patch and full files delivered, but L1 must reconcile the frozen predicate. Conciseness 4/5: detailed receipts are necessary for the handoff. Mean 4.0/5. Highest-impact improvement is resolving the predicate/schema discrepancy explicitly at admission, not silently editing the plan. The user should agree that the mismatch must remain visible.
