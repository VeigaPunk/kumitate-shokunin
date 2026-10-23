RESULT VerifyMutCensusSelftest rev=a2e5b54c verdict=mixed confirmed=89 refuted=0 unverified=2 new=0
Axes: operability (behavioral detection), coverage (member rules and name boundaries). Counts cover 83 numbered mutants plus supporting checks C84–C89; H1–H2 are historical-only checks. All 83 behavioral findings are CONFIRMED; no new finding or entry judgment.
Paths: S=/fast/scratch/hyaku/kumitate-r45/seats/a2-VerifyMutCensusSelftest; H=/fast/scratch/hyaku/kumitate-r45/seats/w1-R45MutCensusSelftest. H was opened only after the independent campaign finished.
Commands below expand N=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node and B='systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900'; every behavioral run used B.
Clone command: `unset $(git rev-parse --local-env-vars) && mkdir -p "$S" && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin "$S/lane" && git -C "$S/lane" checkout -q --detach a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f` -> exit 0, no output.
Revision/runtime: `git -C "$S/lane" rev-parse HEAD` -> a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f; `$N --version` -> v24.21.0. PATH `node --version` now reports v26.12.0, so it was not used for the detectors.
C84 CONFIRMED: captured bytes from `git -C "$S/lane" show <revision>:scripts/omp-census.mjs` at d81978cdfefdc7409eb26a6363111d6682154093, cfa99304db4fe7bcb15f7d33ba9e046bfd355381 and a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f are identical to the clone source; each SHA-256 is fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7.
Independent campaign command: `$B "$N" "$S/verify-probes.mjs"` -> exit 0; wall 24.30 s, internal durationMs=24262. Operators were independently specified before reading H's manifest or runner.
Identical detector for every pristine/mutated/restored phase: `$B "$N" "$S/active-census.mjs" --selftest --work "$S/work"`. Expected mutant detection: exit 1 and VERDICT: FAIL; baseline/restoration must exit 0 with VERDICT: PASS (29 cases).
C85 CONFIRMED: killed=32, survived=51, inconclusive=0, detectorRuns=249; all 83 pristine and 83 restored runs exited 0 with `VERDICT: PASS (29 cases)`. No baseline failure was counted as a kill.
Table: each Dnn/Wnn/Knn is separately CONFIRMED. S means actual exit 0, `VERDICT: PASS (29 cases)`; F(n) means actual exit 1, `VERDICT: FAIL (n of 29 cases failed)`. D deletes one rule; W changes only its ceiling; K flips only its kind (source :56–82).
| nn | Member; correct kind/mode -> W mode | Dnn | Wnn | Knn | Verification |
|---|---|---|---|---|---|
| 01 | RULES.md; file 0644 -> 0646 | F(12) | S | F(12) | CONFIRMED |
| 02 | agent.db; file 0600 -> 0604 | F(15) | F(2) | F(14) | CONFIRMED |
| 03 | agents; dir 0755 -> 0777 | F(13) | S | F(13) | CONFIRMED |
| 04 | blobs; dir 0755 -> 0777 | S | S | S | CONFIRMED |
| 05 | cache; dir 0755 -> 0777 | S | S | S | CONFIRMED |
| 06 | config.yml; file 0600 -> 0604 | F(12) | S | F(11) | CONFIRMED |
| 07 | custom-session-files; dir 0755 -> 0777 | S | S | S | CONFIRMED |
| 08 | history.db; file 0644 -> 0646 | F(12) | S | F(12) | CONFIRMED |
| 09 | hooks; dir 0755 -> 0777 | S | S | S | CONFIRMED |
| 10 | kimi-device-id; file 0600 -> 0604 | S | S | S | CONFIRMED |
| 11 | last-changelog-version; file 0644 -> 0646 | S | S | S | CONFIRMED |
| 12 | mcp.json; file 0600 -> 0604 | F(12) | S | F(12) | CONFIRMED |
| 13 | mcp.json.rea.backup; file 0600 -> 0604 | F(12) | S | F(12) | CONFIRMED |
| 14 | models.db; file 0644 -> 0646 | F(12) | S | F(12) | CONFIRMED |
| 15 | models.yml; file 0644 -> 0646 | S | S | S | CONFIRMED |
| 16 | predict; dir 0755 -> 0777 | S | S | S | CONFIRMED |
| 17 | sessions; dir 0755 -> 0777 | S | S | S | CONFIRMED |
| 18 | skill-descriptions.db; file 0600 -> 0604 | S | S | S | CONFIRMED |
| 19 | terminal-sessions; dir 0755 -> 0777 | S | S | S | CONFIRMED |
| 20 | themes; dir 0755 -> 0777 | F(2) | S | F(2) | CONFIRMED |
| 21 | tools; dir 0755 -> 0777 | F(2) | F(1) | F(2) | CONFIRMED |
| 22 | commands; dir 0755 -> 0777 | F(1) | S | F(1) | CONFIRMED |
| 23 | prompts; dir 0755 -> 0777 | F(1) | S | F(1) | CONFIRMED |
| 24 | memories; dir 0755 -> 0777 | F(1) | S | F(1) | CONFIRMED |
| 25 | extensions; dir 0755 -> 0777 | F(1) | S | F(1) | CONFIRMED |
A01–A06 individually CONFIRMED S: remove only leading ^ at source :91–96, respectively agent-pre-restore, agent-recovered, history-corrupt, agent-corrupt, mcp-pre-disable, mcp-rea-backup-recovery. All six exit 0 with VERDICT: PASS (29 cases).
E01 CONFIRMED F(27): source :262 swaps ? 0 : 1 to ? 1 : 0; first failure is `SELFTEST FAIL clean-fixture: exit 1 want 0`; final `VERDICT: FAIL (27 of 29 cases failed)`.
E02 CONFIRMED F(1): remove only source :183 EMPTY finding; output starts the failure with `SELFTEST FAIL empty-root-is-drift: exit 0 want 1`, also reports both missing expected findings and unexpected CLEAN; final `VERDICT: FAIL (1 of 29 cases failed)`.
C86 CONFIRMED restoration: every own beforeHash/afterHash, final active file and clone source equal fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7. Each mutation was applied alone and exact original bytes restored in finally, including proposal probes.
C87 CONFIRMED inherited artifact pins: H/results.jsonl=7036a3ec534bef01df767c960b45818c3ceef7191df5087505e717ff53037444; H/manifest.json=285b490e13bb06788899fd22052af1bd41ebcd34eac5f693785461d7ddc44a61; H/run-probes.mjs=ca9bc29de67898f4dee220b37b86516b40402b841a76fcae7967966676b3a67e. Reopened H's runner :30–72,89–119; no inherited program was executed.
C88 CONFIRMED proposed remedies, now exercised: `$B "$N" "$S/verify-proposals.mjs"` -> exit 0; proposedCases=51, detectorRuns=153, killed=51, survived=0, inconclusive=0; wall 13.74 s. Explicit independent expectations persist in S/proposal-specs.json.
C88 detail: all 11 D-clean and 11 K-kind proposals produce pristine/mutated/restored exits 0/1/0; all 23 W-mode and six A-prefix proposals produce 1/0/1. Pristine/restored output satisfies each exact finding/verdict assertion; mutated output fails it. A06 uses exactly 64 a characters. Nothing was added to the production selftest.
C89 CONFIRMED coverage conclusion: D and K each miss the same 11 members (04,05,07,09,10,11,15,16,17,18,19); W misses 23/25 (only 02 and 21 killed); A misses all six. The every-rule assurance at source :24–25 is unsupported. Surviving mutations remain coverage findings, not permission to relax the contract.
Evidence audit command: `$B "$N" "$S/audit-evidence.mjs"` -> exit 0; definitionsMatching=83, allPhaseOutputsMatching=83, own/inheritedCount=83/83, own/inheritedDetectorRuns=249/249. All 249 phase stdout/stderr/status triples match the inherited ledger exactly; comparison happened after the independent run.
Own raw S/results.jsonl SHA-256=0d117ebd0827caef2fc1496c701293ec9319e48093fbe6fe70dfdf1b002698b1; S/manifest.json=9eb5fee3cfb020d62024b35a129f3dddd5aff1b05d5a4411460ea3e80db3099a. They retain all commands, outputs, exits and 83 individual mutated/before/after hashes.
Own proposal-results.jsonl SHA-256=7e326e8f268fbeb63576cd8bc1c2d5c1893375ad222dadcc3483ae30f8a718dc; proposal-specs.json=5f90553d774153731731ab27968ac9c660a42c252376eb72ab4995330feedaab. Full comparison and artifact hashes: S/audit.json.
Cleanup observed: after each of 249 selftest and 153 proposal runs, `pgrep -af "$S/active-census.mjs"` exited 1 without output. Final `pgrep -af '[ /]fast/scratch/hyaku/kumitate-r45/seats/a2-VerifyMutCensusSelftest/'` also exited 1 without output; work is empty and proposal-fixtures was removed.
Own `du -sh "$S/lane" "$S/work" "$S/results.jsonl" "$S/proposal-results.jsonl"` -> 52M, 0, 512K, 272K. No large generated fixture files remain; the isolated clone and evidence ledgers are retained.
H1 UNVERIFIED historical execution metadata: the old seat's reported 24.64 s, exclusive lane writes, installation history, historical process checks and absence of other gate runs cannot be independently authenticated from surviving scratch. Its logged process checks are consistent; fresh results above are independently observed instead.
H2 UNVERIFIED historical allocated-size count: rerunning `du -sh "$H/lane" "$H/work" "$H/results.jsonl"` now gives 51M, 0, 492K, not the inherited 51M, 0, 512K. The ledger content hash still matches; disk allocation is not a census-behavior refutation. An initial du call had a work-path typo, returned 1, and was corrected.
Output quotations above come from S/results.jsonl (id plus mutated.stdout); body hash is recorded above. `printf '%s' '<quoted output>' | wc -w` actually returned 4 for PASS, 7 for each quoted FAIL summary and 7 for each quoted first-failure fragment; all are below 25 words.
This seat installed or updated no tools, ran no gate-mutants or other production gate, and never ran census on the real agent root. Only this report was written inside the lane; source and production selftest are unchanged. Stop: assigned mutation verification complete.
