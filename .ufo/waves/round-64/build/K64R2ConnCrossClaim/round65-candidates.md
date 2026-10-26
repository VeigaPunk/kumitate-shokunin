# Round 65 Candidates and Cross-Claim Analysis
**Seat:** `K64R2ConnCrossClaim` (UFO-FSD connector)  
**Round:** kumitate 64, wave w2  
**Date:** 2026-10-25  
**Target:** Synthesis across Claim C1 (`report-receipt-diff`) and Claim C2 (`jj-seat-demo`), mapping recurring failure classes, proposing three ranked Round 65 claims with falsifiable counters and cheapest controls, and detailing open L0 operator questions.

---

## 1. Recurring Cross-Claim Failure Classes (C1 & C2)

Six structural failure classes recur across Claim C1 (`report-receipt-diff.mjs` / `receipt64-probe.mjs`) and Claim C2 (`jj-seat-demo.sh` / `jj64-probe.mjs`). Each represents a fundamental boundary tension between automated counter evaluation and author-supplied evidence.

### Class 1: Counter Satisfied by the Claim's Own Author-Written Bytes (Self-Referential / Tautological Evaluation)
* **Manifestation in C1:**
  * P1 executes `scripts/report-receipt-diff.mjs --selftest` and scores PASS if the string `REPORT_RECEIPT_SELFTEST: PASS (N/N)` is printed; a 1-line script echoing that string without executing any tests scores PASS (reproduced by `K64CriticC1Predicate-4` and `K64ReviewProbeC1-2`).
  * P5 diffs the filed round-64 report against receipts, but the lane authors both the report and the tool; a silent report declaring zero tallies reads CLEAN with zero receipts (`K64CriticC1Predicate-5`).
* **Manifestation in C2:**
  * J6 parses `- <key>=<value>` from the entry's `## Demo outcomes` and compares them against `scripts/jj-seat-demo.sh` stdout. A 17-line script echoing those stated values without calling `jj` passes J6 with 8/8 HELD (reproduced by `K64CriticC2Predicate-1`, `K64MutateProbes-8a`).
  * J4/J5 quote containment matches arbitrary substrings (e.g., page index headers or navigation boilerplate) authored into the capture by the same commit (`K64CriticC2Predicate-6`).
* **Earlier Round Precedent:**
  * Round 61: `DISPATCH61_HELD` was satisfied by author-fabricated session logs and fake launcher progress (`corpus/lessons/round-61.md:16,35`; `ctl-c1-critic-a4-full-fabrication.txt`). `DOCTRINE61_HELD` was satisfied by phantom rows outside `## Registry`.
  * Round 62: `dispatch-activity-forgeability` (`corpus/lessons/round-62.md:22`) where self-authored progress files were accepted as proof of dispatch (QUALITY Q54).
* **(a) What Round 64 Did:** Applied a post-freeze ratchet expanding `controls/receipt/` to 37 cases and hardened `jj-seat-demo.sh` to 21 measured keys calling actual `jj` binaries.
* **(b) What Remains:** The frozen counters themselves remain blind to author-mocking: J6 still matches demo stdout directly to entry prose with no independent witness or demo script checksum pin (`J6 MISS demo-script-not-pinned`); P1 still checks unauthenticated stdout.

---

### Class 2: Gate That Trusts a File the Lane Writes (Unanchored Evidence / Path Escapes)
* **Manifestation in C1:**
  * Stated limit in plan (§C1 line 51): "a receipt the lane itself wrote is trusted as written." A forged receipt line (e.g. `NOTE: X9_HELD was NOT reached; held=3/3 is the plan target`) satisfies the diff (`K64CriticC1Predicate-8`).
  * P2 case runner leaves `expect` files adjacent to `report.md`, allowing an echo-oracle tool to read the answer directly via `dirname(--report)/expect` (`K64CriticC1Predicate-3`, `K64ReviewProbeC1-2`).
* **Manifestation in C2:**
  * J3 reads `.ufo/pins/source-captures.json` with unconfined `join(T, c.path)`, allowing `../` traversal or committed symlinks escaping the archive extraction tree (`K64ReviewProbeC2-1`, `K64SentinelDemoHost-4`).
  * J7 census path is overridable via host environment `SOURCES_CENSUS` (`K64ReviewProbeC2-4`, `K64SentinelDemoHost-9`).
* **Earlier Round Precedent:**
  * Round 61: `vacuous` lesson class (`round-61.md:35`) — probes accepted files created inside the lane worktree.
  * Round 62: `counter-worktree-read` (`round-62.md:20`) — probes read live uncommitted files from the worktree rather than isolated revision archive commits.
* **(a) What Round 64 Did:** Declared trust of lane receipts as a stated limit in C1; pinned capture sha256 hashes in C2; extracted revisions to throwaway directories.
* **(b) What Remains:** Confinement enforcement in probe extraction (`lstatSync` symlink rejection, path traversal prevention); cryptographic provenance / tree-binding of receipts rather than loose text matching.

---

### Class 3: Fixture-vs-Real Divergence (Synthetic Sandboxes vs Production Repositories)
* **Manifestation in C1:**
  * P2 controls run in synthetic plain directories without a `.git` repository, making `HASH_ORPHAN` (which requires `git cat-file`) unreachable in P2 (`K64MutateProbes-1`, `K64ReviewProbeC1-1`).
  * On real reports (P3), 11 of 24 historic reports read DRIFT due to unresolvable hashes of scratch repos, read-only clones, or off-round receipt paths (`controls/CHANGES-AFTER-FREEZE.md:31-36`, `K64ExecReceiptRealRun.md`).
* **Manifestation in C2:**
  * Initial staged claim stated "the seat does not go stale", derived from a description-only rewrite fixture (`K64ScoutStagedJjDiff.md`). On real host `jj 0.45.1`, abandoning a commit stales the seat (`scripts/jj-seat-demo.sh`).
  * Frozen `jj-donothing-control.sh` was blind to 25 of 39 counter mutants, masking counter defects that only an honest fixture unmasks (`K64MutateProbes-7`).
* **Earlier Round Precedent:**
  * Round 61: `stale-premise` (`round-61.md:37`) — S116 verdict tested against v1 PDF fixture while live URL served v3.
  * Round 62: `counter-row-schema` (`round-62.md:21`) — regex tested against mock line broke on real 11-cell GFM table.
  * Round 63: Spacing differences in Bailian multi-agent documentation (`（协调者） ` vs `（协调者）`, `round-63.md:12`).
* **(a) What Round 64 Did:** Hardened `jj-seat-demo.sh` v2 to capture the true rewrite vs abandon divergence (15 -> 21 keys); declared the 11 real-report false positives as known limits rather than masking them with ad-hoc heuristics.
* **(b) What Remains:** Control test harnesses that emulate real git repository semantics instead of plain directories; replacing trivial do-nothing controls with calibrated mutation-testing fixtures.

---

### Class 4: Floor That Could Not Be Met (Unsatisfiable Frozen Predicates)
* **Manifestation in C1:**
  * P2 demanded `>= 8 distinct finding ids` at freeze, while committed controls exercised 6 and contract v1 defined only 7 (with `HASH_ORPHAN` unreachable in P2). The counter was mathematically incapable of reading HELD at freeze (`K64CriticC1Predicate-1`, `K64MutateProbes-1`, `K64ReviewProbeC1-1`).
* **Manifestation in C2:**
  * J6 outcome key floor (`>= 12 keys`) was met, but vacuous when values were empty (`K64CriticC2Predicate-3`).
  * Round 63 retrospective revealed an undisclosed wave-2 seat count floor miss (39 vs plan `>= 40`, `K64ScribeErratum.md`).
* **Earlier Round Precedent:**
  * Round 61: `DOCTRINE61_HELD` had an unsatisfiable row regex combining POSIX character classes and misindexed columns (`round-61.md:16`).
  * Round 63: Undisclosed floor miss on wave-2 seat count (`round-63.md` / `K64ScribeErratum.md`).
* **(a) What Round 64 Did:** L1 added 2 new finding ids (`RECEIPT_EMPTY`, `TALLY_CHECKS_MISMATCH`) and 21 ratchet cases post-freeze, allowing P2 to pass with 8 ids (`controls/CHANGES-AFTER-FREEZE.md:11-15`).
* **(b) What Remains:** Automated pre-freeze satisfiability verification: a static gate verifying that declared vocabulary $\ge$ required floor before freezing a plan.

---

### Class 5: Hermeticity of a Tool Run on the Operator Host (Host Injection & Environment Leaks)
* **Manifestation in C1:**
  * `receipt64-probe.mjs:43` interpolates `${lane}` into `bash -c`, enabling command execution via crafted path names (`K64ReviewProbeC1-3`, `K64SentinelDemoHost-1`).
  * Child processes inherit `NODE_OPTIONS`, `BASH_ENV`, and `TAR_OPTIONS`, enabling arbitrary code injection (`K64SentinelDemoHost-3`).
* **Manifestation in C2:**
  * `jj64-probe.mjs:197` invokes `bash scripts/jj-seat-demo.sh` without specifying `cwd: T`, executing in caller cwd (`K64ReviewProbeC2-3`, `K64CriticC2Predicate-4`).
  * Initial demo inherited caller's `GIT_DIR` and `init.templateDir`, reinitialising host git directories (`K64SentinelDemoHost-7`).
  * J5 `curl` executes without `-q` or `--proto` bounds, honoring `~/.curlrc` and allowing `file://` scheme accesses (`K64SentinelDemoHost-5`).
* **Earlier Round Precedent:**
  * Round 61: `counter-worktree-read` (`round-61.md:20`) — scripts evaluated in host working tree.
  * Round 63: Verification results dependent on host session store paths (`K63R2*-2` counts).
* **(a) What Round 64 Did:** `jj-seat-demo.sh` v2 was scrubbed with internal `env -i`, isolated `HOME`/`TMPDIR`, and `GIT_CONFIG_GLOBAL=/dev/null`.
* **(b) What Remains:** Probe-level host isolation: probes remain frozen with bash interpolation, ambient environment inheritance, and unconfined cwd.

---

### Class 6: Version Skew (Host Tooling vs Upstream Documentation)
* **Manifestation in C1:**
  * Historic reports across rounds 40–63 span multiple tool and receipt format revisions, causing false DRIFT on valid historic receipts (`controls/CHANGES-AFTER-FREEZE.md:31-36`).
* **Manifestation in C2:**
  * Host binary is `jj 0.45.1`, but upstream documentation for S198 and S200 was fetched from `v0.46.0` (`latest`), causing documentation divergence (`K64ExecCaptures.md`, `K64ScoutWorkingCopyOpen.md`). S200 was forced to be documented as a version re-open of S067.
* **Earlier Round Precedent:**
  * Round 61: S116 absent verdict on v1 arXiv text while web served v3 (`round-61.md:37`).
  * Round 63: Managed agents console UI version differences between Bailian v1 and v2.
* **(a) What Round 64 Did:** Explicitly recorded S200 as a version re-open (v0.46.0 vs v0.45.1) in `corpus/SOURCES.md`, verified against exact captured bytes.
* **(b) What Remains:** Gating documentation fetches against explicit version tags matching host binaries rather than tracking mutable `latest` branches.

---

## 2. Proposed Round 65 Claims (Ranked)

With operability held at 9 (terminal under frozen $f_O$) and coverage aggregate retired at 10, the lowest non-retired axis obligation remains **operability for C1** and **coverage frontier for C2**.

```
Rank 1: C1 (Operability) — counter-preflight-enclosure (scripts/counter-preflight.mjs)
Rank 2: C1 (Operability) — receipt-provenance-attestation (scripts/report-receipt-diff.mjs v3)
Rank 3: C2 (Coverage Frontier) — jj-concurrent-workspace-isolation (scripts/jj-concurrent-demo.sh)
```

---

### Rank 1 (Primary C1): Capability Acquisition `counter-preflight-enclosure`
* **Surface It Moves:** A new verification tool, `scripts/counter-preflight.mjs` (contract `kumitate-counter-preflight-v1`).
* **Problem It Solves:** Unifies Classes 1, 2, 4, and 5. Probes currently freeze with unsatisfiable floors (C1 P2: 6 exercised vs 8 required), tautological evaluation (C2 J6: echo stub passes 8/8), command injection (`bash -c "... ${lane} ..."`), and unconfined execution (missing `cwd: T`, inherited `GIT_*`/`NODE_OPTIONS`).
* **Specification:**
  Before any round plan can freeze, `counter-preflight.mjs` audits every `.ufo/waves/round-<N>/probe/*-probe.mjs` and its control suite:
  1. **Satisfiability:** Floor count $\le$ total unique non-CLEAN finding vocabulary in committed control cases.
  2. **Negative Discrimination:** A literal stub echoing expected strings must FAIL the probe (kills tautological echo tools).
  3. **Honest Baseline:** Probe must pass with `held=N/N` on a committed honest fixture.
  4. **Host Enclosure:** Probes must not interpolate unquoted shell strings, must specify `cwd: T`, and must scrub child environment (`env: { PATH, ... }`).
* **Frozen Predicate `PREFLIGHT65_HELD`:**
  - P1: `node scripts/counter-preflight.mjs --selftest` prints `COUNTER_PREFLIGHT_SELFTEST: PASS (N/N)` with $N \ge 30$, exit 0.
  - P2: Tool run over round 64 freeze rev `dd1a3e6f` exits 1 with exact findings: `P2_FLOOR_UNSATISFIABLE` (`receipt64`), `TAUTOLOGY_ECHO_PASS` (`jj64`), `UNCONFINED_DEMO_CWD` (`jj64`), and `SHELL_INJECTION` (`receipt64`, `jj64`).
  - P3: Tool run over round 65 plan freeze rev reads `COUNTER_PREFLIGHT: CLEAN`, exit 0.
  - P4: Do-nothing stub (always CLEAN or always DRIFT) fails P2/P3.
* **Cheapest Control:**
  Run against the round 64 freeze commit `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`. A do-nothing clean stub scores MISS on P2 (fails to identify the known frozen defects); a do-nothing drift stub scores MISS on P3.

---

### Rank 2 (Alternative C1): Capability Acquisition `receipt-provenance-attestation`
* **Surface It Moves:** `scripts/report-receipt-diff.mjs` upgraded to v3 (contract `kumitate-report-receipt-diff-v3`).
* **Problem It Solves:** Unifies Classes 1, 2, and 3. Round 64 C1 trusts lane receipts as written and matches tallies loosely on a single line. This allows two major evasions: (a) negating text (`NOTE: held=3/3 was NOT reached`) satisfying a report tally, and (b) cross-round citation laundering (citing `.ufo/waves/round-8/close/p-tip.txt` in a round-9 report).
* **Specification:**
  `report-receipt-diff.mjs` v3 introduces three new finding kinds:
  1. `TALLY_NEGATED`: flags tallies preceded or followed by negation tokens (`not`, `unmet`, `failed`, `target`, `plan`).
  2. `RECEIPT_OFFROUND`: flags any cited receipt whose path does not match the active `--round <N>` argument.
  3. `RECEIPT_UNTRACKED`: flags any receipt file cited that is not a committed blob at `--rev`.
* **Frozen Predicate `ATTEST65_HELD`:**
  - P1: Selftest $\ge 60$ green.
  - P2: 45 control cases in `controls/receipt/` exercising $\ge 10$ distinct finding ids.
  - P3: Synthetic malicious report exercising negated tallies and off-round receipts reads DRIFT with exact ids `TALLY_NEGATED` and `RECEIPT_OFFROUND`.
  - P4: Do-nothing control fails.
* **Cheapest Control:**
  Synthetic report citing `round-8/close/p-tip.txt` inside a round-9 evaluation, and a receipt line reading `NOTE: X9_HELD was NOT reached; held=3/3 is the plan target`. v2 tool exits 0 `CLEAN`; v3 tool exits 1 `DRIFT TALLY_NEGATED,RECEIPT_OFFROUND`.

---

### Rank 3 (Primary C2): Coverage Frontier Ground `jj-concurrent-workspace-isolation`
* **Surface It Moves:** `PROVINCE.md` *Isolation substrates* band; new entry `corpus/knowledge/jj-concurrent-workspace-isolation.md` and script `scripts/jj-concurrent-demo.sh`.
* **Problem It Solves:** Extends C2 from single-seat rewrite/abandon to multi-seat concurrency. Staged entries claimed seats do not conflict, while real host concurrency requires operation log rebase arbitration. Grounded on row S198 (`concurrency`).
* **Specification:**
  `scripts/jj-concurrent-demo.sh` demonstrates 2 live concurrent workspaces executing conflicting operations in parallel:
  - Divergent operation log creation and auto-merge resolution.
  - Concurrent commit mutation without file-lock contention.
  - Concurrent working copy updates under `snapshot.auto-update-stale=true` vs `false`.
  - Measures 16 outcome keys with verifiable exit status.
* **Frozen Predicate `CONCURRENCY65_HELD`:**
  - J1–J5: Registry row S198 + S201 opened, verified captures, $\ge 4$ quotes.
  - J6: `bash scripts/jj-concurrent-demo.sh` exits 0 with 16 identical keys matched to entry.
  - J7: Do-nothing single-seat stub fails concurrent conflict keys.
* **Cheapest Control:**
  Single-workspace stub script. It fails the concurrency-specific outcome keys (`concurrent_op_log_diverged`, `divergent_ops_auto_merged`).

---

## 3. Open L0 Questions for the Operator

Three governance issues require explicit operator determination prior to round 65 planning:

### L0 Question 1: Post-Freeze Counter Hardening Protocol
* **Context:** In round 64, `receipt64-probe.mjs` was frozen with an unsatisfiable P2 floor (`ids=6 < 8`), and both probes were frozen with shell injection and host environment vulnerabilities. Under strict freeze rules, counters cannot be edited after commit `dd1a3e6f`. The L1 resolved the floor issue by expanding `controls/receipt/` from 16 to 37 cases under the plan's declared "monotone ratchet", but the probe vulnerabilities remained unpatchable, requiring wave 2 seats to report them as standing limits.
* **Decision Needed:** Does the operator permit pre-wave-1 counter code errata (patching counter logic before any seat scores, strictly restricted to security hardening and satisfiability bugfixes), or must all counter code remain 100% frozen, forcing unmeetable claims to fail honestly as UNMET (as in Round 61)?

### L0 Question 2: Formal Retirement Policy for R61 Probes
* **Context:** Round 61 counters `dispatch61-probe.mjs` and `doctrine61-probe.mjs` accepted fabricated evidence. Round 63 appended a retirement notice in `SCORECARD.md` declaring them "retired, not repaired". However, the physical probe files still reside in `.ufo/waves/round-62/probe/` and `.ufo/waves/round-61/probe/`, causing verifier spot-checks to repeatedly flag `R61-V2` as an unaddressed defect across rounds 62, 63, and 64 (`corpus/lessons/round-64.md:117`).
* **Decision Needed:** Should obsolete/retired probes be physically relocated to a `.ufo/archive/` tree or renamed with a `.retired` extension, or should verifier spot-check tooling be updated to recognize `SCORECARD.md` retirement declarations as closing the defect?

### L0 Question 3: Legality of Retrospective Gate Epochs (Q60)
* **Context:** QUALITY Q60 (`plan-before-ready.sh` enforcing `readme-map` cleanliness before plan freeze) was created because round 64 froze over a red coverage map. To allow round 64 to pass, the gate script was implemented with an epoch parameter `PBR_MAP_FROM` defaulting to 65 (`map=SKIP reason=MAP_PRE_EPOCH_ROUND`), while under `PBR_MAP_FROM=0` round 64 fails with `reason=MAP_DRIFT`.
* **Decision Needed:** Is an epoch exemption (`PBR_MAP_FROM=65`) acceptable when introducing a quality rule motivated by the current round's own defect, or should the current round be formally recorded as failing the quality rule with an erratum, rather than retrofitting an exemption into the enforcement script?
