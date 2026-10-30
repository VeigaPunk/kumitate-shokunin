# Seat K70ConnectOverlap — Milestone: ConnectOverlap

Role: connector (leaf; no subagents, no background jobs, no task delegation).
Axis judged: **operability** (C1 replay isolation — the round's only claimed axis).
Date: 2026-10-30. Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (all paths absolute; process cwd is fleet root).
Frozen plan commit `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`; frozen counter `.ufo/waves/round-70/probe/replay70-probe.mjs` sha256 `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` (matches its `counter-pins.json` pin; bytes read, never modified). Base `78b98d762ccf3e3a0961f94c4042eaabd2bcb706`.

## Assignment (restated)

Compare this replay-control capability boundary to sibling tooling/security/prompt provinces via bounded read-only scope; report contested scope, never absorb sibling work. L1 is the canonical planner; my bounded planning walk examines the actual five-mode data flow — one case, then generalizes.

What I did **not** do (non-goals, sibling-owned): I did not review or score the candidate `build/K70ExecRunner/scripts/control-replay.mjs` (executor/reviewer province), did not re-run the frozen counter or any probe (tooling/reviewer province), did not build fixtures or attack harnesses (security/executor province), did not draft registry rows (scribe province), and did not propose design synthesis or rank edge probes (sibling connector K70ConnectPatterns' assignment). I recorded the candidate's existence and mtime only as wave-state context.

## Axes (godspeed)

- **(a) scope clarity** — make the capability boundary legible: which contract clauses the frozen counter scores, which it cannot, and which sibling province enforces each unscored clause. Target: improve without harming (b) or (c).
- **(b) evidence fidelity** — every contested claim below is grounded in an observed command output or a cited sibling report; inferences are marked.
- **(c) blast radius** — zero: read-only on source/sibling/fleet/operator trees; only this report and `build/K70ConnectOverlap/` written.

Kept move: the contested-scope register (§6 + build artifact), produced after the one-case walk (§4) and the five-mode generalization (§5).

## Evidence base (all read-only)

Frozen bytes I read directly: `plan.md`; `probe/replay70-probe.mjs` (full, 43 lines); `base/replay70-base.txt`; `base/freeze-map.txt`; `base/band-control.json`; `base/source-counts.json`; `corpus/lessons/round-70.md`; `.ufo/waves/round-69/probe/c1-controls.sh` (83 lines) and `c2-controls.sh` (119 lines, incl. line 80 fixed `/tmp/forge-sed.txt` write); all five committed r69 receipts in `.ufo/waves/round-69/controls/`; `.ufo/pins/counter-pins.json`; `w1-spec.json` / `w1-dispatch.json` / `w1/swarm-registry.json`.

Sibling reports read for province mapping (8): `K70ReviewScope.md`, `K70AttackForgeTool.md`, `K70AttackGitEnv.md`, `K70AttackOutputSymlink.md`, `K70AttackConcurrent.md`, `K70AttackC2Nothing.md`, `K70ScribeRegistry.md`, plus report headers of `K70AttackC1Nothing.md` and `K70AttackC2Auto.md`. Findings cited from them are attributed; I re-verified the mechanical facts they rest on (§7) instead of trusting text.

Candidate state at my inspection time: `build/K70ExecRunner/scripts/control-replay.mjs` **present** (19160 bytes, mtime 2026-10-30 12:32:45 -0300). At the attack seats' inspection times it was absent (each attack report says so); the wave is mid-flight. I did not open its bytes — candidate review is not my province.

## The capability boundary under comparison

From the frozen plan's implementation contract, `scripts/control-replay.mjs` owns these clauses:

1. CLI surface: `--lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR`, plus `--selftest`.
2. Bound only to the five frozen controls; not an arbitrary command runner.
3. Generate a versioned private script copy: substitute `LANE`/`PROBE`/`W`/`S` assignments exactly once.
4. Remove the known unused fixed temporary write (`c2-controls.sh:80`).
5. Use explicit fixture-root git arguments.
6. Scrub inherited repository environment.
7. Unique `mkdtemp` child under the supplied work root.
8. Receipts copied out before cleanup.
9. Output creation exclusive.
10. Refuse unexpected frozen source bytes.
11. Original files read-only; never run originals directly.
12. Selftest hermetic, with stable finding ids and expected exit maps.
13. Reuse existing patterns; no host/routing writes.

The frozen counter scores a 10-obligation predicate (R1–R10). The boundary question: **which of clauses 1–13 does REPLAY70_HELD actually evidence, and which sibling province owns the rest?**

## One case, walked: c2 / forgecapture through the boundary

`forgecapture` is the richest mode (only live arm; the mode that triggers the line-80 temp write; the mode with a source-tamper step). Walked from the frozen bytes:

1. **Entry.** The tool receives `--family c2 --mode forgecapture --out O --work W`. Frozen counter analog: R7 runs exactly this with fresh `result-4.txt` / `work-4` under a private mkdtemp root (`replay70-probe.mjs:28-29`).
2. **Frozen-source read + byte refusal (clause 10).** The generator reads `c2-controls.sh` (sha256 `679b7d96…`) from the lane at base `78b98d76…` and must refuse unexpected bytes. **Counter-scored: no** — K70AttackForgeTool arm 1 (mutated frozen-source copy) changed no tool-dependent check; R1 MISS there was a harness artifact, R2–R10 stayed PASS.
3. **Private-copy generation (clauses 3, 4, 5, 6).** Substitute `LANE=`(lane), `PROBE=``deprec69-probe.mjs` path, `W=`private controls dir inside the work child, `S=`private scratch inside the work child; delete line 80 (`printf … > /tmp/forge-sed.txt`); keep explicit `git -C` (frozen script already has `git -C "$LANE" archive …`, `c2:34`); add env scrub (not in the frozen script; r69 probes defend themselves at `deprec69-probe.mjs:69-87` with `POISON`/`ENV_POISONED`/`CHILD_ENV`, but the generated copy's own `git init/add/commit` inherits whatever the caller exported). **Counter-scored: no** — identical receipts flow from a copy that skips any of these.
4. **Unique child (clause 7).** `mkdtemp` child `C` under `W`. **Counter-scored: no** — R3–R7 give each replay a private `work-${i}`; the shared-parent-same-mode configuration is never exercised (K70AttackConcurrent evidence 1–4: fixed-child candidate scores 10/10, collapses 6/8 under true concurrency with sticky 0-byte `--out`).
5. **Fixture build + live probe (clauses 2, 11).** Private copy archives round-69 base tree `14057f3e…` into `C/fx`, `git init`, appends the origin section, tampers the S210 capture with a recomputed pin, rewrites bullets to all-`pinned`, commits (`c2:47-96`), then runs `deprec69-probe.mjs` **without** `--no-live` (`c2:104-105`): live network fetches; expectation `DEPREC69_UNMET` + `S210:origin-sha-mismatch` (`c2:111-114`). The frozen committed receipt `.ufo/waves/round-69/controls/c2-forgecapture.txt` (rev `6249e2ec…`) shows exactly this: `held=9/11 … live=exercised | M11 MISS … S210:origin-sha-mismatch`, exit 1. **Live arm is reported, never waived** — network failure is an honest miss. Note: 4 of 5 modes run `--no-live` by construction (`c2:104` LIVEFLAG logic), so the round's HELD carries live evidence only through this one arm (K70AttackC2Nothing D1).
6. **Receipt copy-out + cleanup (clauses 8, 9).** Receipt text must reach `O` exclusively; `C` removed; `W` empty. The probe asserts only: exit 0, receipt contains `DEPREC69_UNMET` **and** `CONTROL-PASS forgecapture`, preserved digests, empty `work-4` (`replay70-probe.mjs:30-34`). Verified mechanical fact: **no frozen r69 receipt contains the string `CONTROL-PASS`** (grep over the five files: none) — the originals echo the verdict to stdout only (`c1:80`, `c2:116`). So the receipt at `--out` is necessarily a *wrapper-assembled* artifact: the private copy must route the verdict into the receipt text (K70ReviewScope F5). The counter scores text that exists in no frozen receipt. R9's exclusive-creation arm scores a regular file only (`replay70-probe.mjs:37-39`); the dangling-symlink arm of the same clause is unscored (K70AttackOutputSymlink strategy-A hit).

**Case conclusion:** of the 13 boundary clauses exercised by this one mode, the counter scores the *outcome* of steps 5–6 only (label + verdict substring + preserved + empty work + exit), and none of steps 2–4's mechanics. The same shape recurs in the other four modes with only the live arm and the tamper step removed.

## Generalization: five-mode data flow

| Mode | Fixture delta (frozen script) | r69 probe flag | Required receipt label | Verdict text source | Boundary-specific risk |
|---|---|---|---|---|---|
| c1 donothing | current tool + empty ledger + registry skeletons (`c1:40-55`) | (default) | `LEDGER69_UNMET` | wrapper-assembled `CONTROL-PASS donothing` | counter never sees lane-write paths (F2) |
| c1 autoledger | + machine OPEN rows (`c1:57-78`) | (default) | `LEDGER69_UNMET` | wrapper-assembled | c1 copies inputs from **live lane working tree**, not REV (`c1:27-30`; K70ReviewScope F3) |
| c2 donothing | base tree byte-exact | `--no-live` | `DEPREC69_UNMET` | wrapper-assembled | vacuous by design: `live=no-live(vacuous-declared)` |
| c2 autoorigin | + origin section + 3 fabricated rows (`c2:57-70`) | `--no-live` | `DEPREC69_UNMET` | wrapper-assembled | same vacuity |
| c2 forgecapture | + S210 tamper + pin recompute + all-pinned (`c2:71-96`) | live | `DEPREC69_UNMET` + `S210:origin-sha-mismatch` grep (`c2:111`) | wrapper-assembled | network-dependent; TMPDIR parent must exist (`ledger69:78`/`deprec69:88` top-level `mkdtempSync`; K70ReviewScope F1) |

Two cross-mode dependencies sit *outside* my boundary but decide its score: (i) the frozen r69 probes' top-level `mkdtempSync(join(tmpdir(), …))` crashes ENOENT if the replay's TMPDIR parent is absent — the generated copy must own TMPDIR inside the work child; (ii) the r69 `deprec69-probe` live fetch must reach the network for R7. Both are tooling-province facts my correctness relies on and cannot change (frozen).

## Province map

- **Tooling province** (frozen counter + r69 probes + registry/pins): `replay70-probe.mjs` (R1–R10), `ledger69-probe.mjs` / `deprec69-probe.mjs`, `counter-pins.json`, SKILL/SCORECARD rows. Seat owners: K70ReviewCounterR1–R10, K70ReviewSnapshot, K70ScribeRegistry, K70ScribeSourceRow, K70ReviewSourcePin, K70ExecFixtureTests, K70Probe*.
- **Security province** (contract edges attacked with runnable counterexamples): K70AttackOutputSymlink, K70AttackWorkSymlink, K70AttackOutputExisting, K70AttackConcurrent, K70AttackGitEnv, K70AttackGitConfig, K70AttackTmpLiteral, K70AttackFrozenBytes, K70AttackSourceDrift, K70AttackForgeTool, K70AttackReceiptOverwrite, K70AttackWrongExit, K70AttackPrintStub, K70AttackTimeout, K70AttackSignals.
- **Prompt province** (plan/lessons/claim wording and the predicate's semantic scope): L1 planner, K70ReviewScope, K70ScribeLesson, K70ScribeScorecard, K70Scout*, K70AttackC2Nothing (vacuity disclosure), K70ReviewDoNothing.

## Contested scope (the deliverable)

A clause is **contested** when more than one province must act for it to be true at integration, or when the counter's green would imply it to a careless reader. Full machine-readable register: `build/K70ConnectOverlap/contested-scope.tsv` (18 rows). Ranked:

1. **env-scrub (clause 6)** — sharpest three-way contest. Prompt names it in the contract; my boundary must implement it; the frozen counter cannot see it (R2–R7 run under `{...process.env, TMPDIR:root}`); only K70AttackGitEnv demonstrates it (foreign commit landed on the host repo; stolen index; DEMO 4 shows explicit `-C`/`--git-dir` args do **not** stop `GIT_INDEX_FILE`). Enforcement must ride on selftest content, which R2 does not constrain.
2. **output-creation-exclusive (clause 9)** — R9 scores the regular-file arm only; the contract clause spans four `--out` shapes; K70AttackOutputSymlink shows the natural `existsSync` gate is defeated by a dangling symlink while still scoring HELD. Contested: who closes it — sibling evidence says `openSync(out,'wx')` + selftest assertions + L1 four-shape gate, none of which is a counter change.
3. **unique-mkdtemp-child (clause 7)** — normative plan sentence, counter-blind (private `work-${i}` per replay; shared parent never exercised). K70AttackConcurrent: fixed-child candidate = 10/10 + collapse under concurrency. Integration must reject a fixed child *even with a HELD receipt* — the receipt is insufficient evidence for this clause. That is the contested core: predicate green vs. contract clause.
4. **versioned-private-copy / exactly-once substitution (clause 3) + frozen-source refusal (clause 10)** — the counter binds no receipt to an execution (K70AttackForgeTool arm 2: `REPLAY70_HELD held=10/10` with `control-executions=0`; verdict: "certifies receipt-shape compliance only"). Both clauses are mine; both are verified only by L1 source review, exercised only by security seats.
5. **temp-write removal (clause 4)** — invisible to the counter (receipt identical either way; side effect is a shared `/tmp` path). Owned in practice by K70AttackTmpLiteral. My boundary carries a clause only sibling attack work evidences.
6. **selftest content ownership (clause 12)** — R2 greps one line; the selftest is the de facto enforcement instrument for items 1–5; its finding-id set is a shared design space (attack seats propose ids; K70ScribeRegistry drafts the exit map 0/1/2/64; L1 integrates). Contested until L1 publishes the final id list.
7. **registration triad (R10)** — scored, but self-authenticating (pin binds to whatever bytes sit at `scripts/control-replay.mjs` in the scored commit; K70AttackForgeTool F5, K70ScribeRegistry open decision 4). Row *content* is scribe province; my boundary ends at "tool exists and is registered."
8. **preserved-digest tree mismatch** — plan R3–R7 says "preserve prior receipt digests"; the counter hashes the *archive-tree copy* of `.ufo/waves/round-69/controls`, not the live lane (K70ReviewScope F2). Lane-receipt preservation rests entirely on the tool never receiving a lane write path. A tooling-vs-prompt wording contest my boundary must honor but cannot evidence.
9. **c1 fixture reads live-lane files (binding gap)** — `c1-controls.sh:27-30` copies `scripts/routed-ledger.mjs` and lesson files from the working tree while the receipt labels `rev=REV` (K70ReviewScope F3). Mitigation (`git -C LANE show REV:path`, or refuse on mismatch) sits in my generator.
10. **TMPDIR routing** — my generated copy must point TMPDIR at a generator-owned directory inside the work child; the r69 probes' top-level `mkdtempSync` makes an absent parent a tooling-crash MISS (K70ReviewScope F1, verified at `ledger69-probe.mjs:78`, `deprec69-probe.mjs:88`).
11. **live= / vacuity** — 4 of 5 modes are `--no-live` by design; the summary marker is receipt-text-derived (K70AttackC2Nothing D3); only R7 can carry live evidence and is network-dependent. Claim wording ("failure is reported, never waived") is prompt province; execution is mine.

**Cleanly owned (non-contested) scope:** R1 freeze preservation (counter, tool-independent), R8 usage exit 64 on junk family, R2's pass/fail gate existence, the do-nothing base red case (`base/replay70-base.txt`, 2/10 exit 1 — prompt-owned), and seat-discipline rules (no originals executed, scratch discipline) — host-guard owned, verified by review.

## Second-order effects and risks

- **Absorption risk (self-checked):** a connector reading 8 attack reports + the contract can drift into candidate review or probe design. I held the line: no candidate bytes opened, no counter run, no harness built. The contested-scope register is boundary analysis, not a work order for sibling seats.
- **Over-claim risk at integration:** if L1 reads `REPLAY70_HELD 10/10` as certifying clauses 2–10, the claim overreaches (item 4). The plan already discloses the class ("no semantic-remediation or universal forgery-resistance claim… limits disclosed"); the register makes the per-clause mapping explicit for SCORECARD/LOG disclosure without amending the predicate.
- **Selftest as load-bearing:** six unscored clauses now depend on selftest assertions that R2 cannot see. If finding ids are unstable, non-author spot-check cannot rely on them (clause 12 requires stable ids). This is the round's quietest single point of failure.
- **Cross-round tooling dependency:** my correctness depends on two frozen r69 behaviors (TMPDIR-parent mkdtemp, live network reachability) outside anyone's round-70 control. Honest-miss posture covers the second; the first must be handled in the generator (item 10).
- **Freeze-integrity side effect:** an `--out` symlink whose referent is a frozen receipt turns a sloppy write into a freeze violation (K70AttackOutputSymlink impacted-axes note) — item 2 is also a freeze-protection issue, not just operability.

## Verification (commands run + observed outcomes)

1. `read /home/vgpnk/.omp/agent/RULES.md` — tooling directive read first; **no installs/updates performed, none needed** (pacman paused per plan; nothing added to PATH dirs).
2. `read .ufo/waves/round-70/plan.md` + `probe/replay70-probe.mjs` (full) — predicate, 10 obligations, implementation contract captured.
3. `sha256sum` of probe/plan/c1/c2 → `63f52b75…bf0c1`, `e518567d…4744b`, `01efd6dd…aeda12`, `679b7d96…a66f4` — all match pins/sibling records; frozen bytes intact.
4. `grep -n "forge-sed\|/tmp/" c2-controls.sh` → line 80 `printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt` — the known unused fixed temp write confirmed at the lesson's located line.
5. `grep -n "mkdtempSync" ledger69-probe.mjs deprec69-probe.mjs` → `ledger69:78`, `deprec69:88` top-level `mkdtempSync(join(tmpdir(), …))` — TMPDIR-parent crash risk confirmed (K70ReviewScope F1 re-verified).
6. `grep -n "POISON\|CHILD_ENV\|ENV_POISONED" deprec69-probe.mjs` → lines 69/73/75/87 — r69 env defense present in r69 probes, dropped in the r70 counter (K70AttackGitEnv defect B re-verified).
7. `grep -n "NO_LIVE\|no-live(vacuous-declared)\|LIVE_STATE" deprec69-probe.mjs` → lines 81/283/522/550 — vacuity stamp confirmed receipt-derived.
8. `for f in …; tail -3 .ufo/waves/round-69/controls/$f.txt` → five receipts end `control=<mode> exit=1 rev=…`; `grep -l CONTROL-PASS` over the five → **NONE** — wrapper-assembled `CONTROL-PASS` requirement confirmed (K70ReviewScope F5 re-verified); c2-forgecapture receipt reads `held=9/11 … live=exercised … S210:origin-sha-mismatch`.
9. `cat base/replay70-base.txt` → `REPLAY70_UNMET held=2/10 …` exit 1 (frozen negative baseline, matches plan).
10. `python3` parse of `w1-spec.json` → 64 seats listed; my registry entry role=connector confirmed via `swarm-registry.json`.
11. `ls build/K70ExecRunner/scripts/` → `control-replay.mjs` present (19160 B, 12:32) — candidate exists; bytes intentionally not opened (province boundary).
12. Lane integrity: `git -C <lane> status --porcelain` shows only untracked seat artifacts (reports/build); no tracked-file modifications by me; no git/jj mutations anywhere; no originals executed (no `c1-controls.sh`/`c2-controls.sh` invocation of any kind); no fixture git operations (nothing to commit — read-only seat).

Tooling on record: `node v24.21.0`, `git 2.56.0`, `python3 3.14.8`, coreutils (`sha256sum`, `grep`, `stat`) — all preinstalled system tools; channels: pacman-managed host toolchain (already present), reason: read-only analysis seat required no additions. Pacman transactions: none (paused, as planned). No host service restarts.

## Artifacts (unique to this seat)

- `.ufo/waves/round-70/build/K70ConnectOverlap/contested-scope.tsv` — 18-row machine-readable clause × counter-coverage × province × contention register (integration aid for L1 close-sequence disclosure).
- This report.

Scratch: none created — this seat ran no probe, fixture, or driver (`/fast/scratch/hyaku/kumitate-r70/K70ConnectOverlap/` not needed; nothing to clean up, nothing copied out). No receipts exist because no counterexample was executed — unrun is unrun.

## Hand-off note for L1 (integration)

Use the TSV as the disclosure checklist when writing SCORECARD/LOG: for each row marked `counter-scored=no/partial`, either point at the sibling seat that exercised it or record it as a disclosed limit — never let the HELD receipt imply coverage. Do not amend the predicate; do not absorb the sibling work itemized above.
