# kumitate — round 48 report (attempt 2, L1 KumitateR48)

## Work performed

Declared claims (plan `.ufo/waves/round-48/plan.md` + attempt-2 addendum, freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c`, pre-data amendment A48 `ce9aee5daf71004a5890134f9526cc6fe424b206`):

- **C1 — operability** (lowest non-retired axis, integer terminal at 9): four child-process sites — RG742 `scripts/round-gate.mjs:742` `runGate`, SP491 `scripts/surface-probe.mjs:491` surface shim, SP519 `:519` dispatcher status, SP1592 `:1592` `spawnSelf` — launch through `scripts/cap-run.mjs` (`kumitate-cap-run-v2`) via `scripts/cap-spawn.mjs` `capSpawnSync`. Counter `probe/caproute48-probe.mjs`, predicate ROUTED_HELD, rule **F48+A48**. Sourced on **S098** (opened this round) with S093/S069/S072/S095.
- **C2 — capability acquisition `counter-rerun`**: new `scripts/counter-rerun.mjs` mechanizing R47-1's routed repeat-run rule (predicate COUNTER_RERUN).

Work items, each with an evidence pointer: repair-first R47-1..R47-5 (receipts committed: `r48/ScribeReceipts-a2-rerun-{1,2,3}.txt` 3/5,3/5,4/5; SCORECARD `## Round 47 correction`; `r48/L1H1Base-f00cf278-run1-2.txt`; R47-5 root-cause receipts + `r48/MutCounterPadded.md` + `r48/ExecPidWrapProbe.md` + `r48/ScoutRootCause.md`); four route builds (`r48/ExecRoute{RG742,SP491,SP519,SP1592}.{patch,md}`, L1 integration `ce9aee5d`); the cap-spawn verdict-dir leak fix (12,801 accumulated `/tmp/cap-spawn.*` dirs at open, quiet-host delta 0 after, `r48/L1-leakfix-delta.txt`); A48 amendment + validation (`r48/A48-*.txt`); C2 build (`r48/ExecCounterRerun.*`, L1 binding `r48/L1-c2-binding-ce9aee5d.txt`); 30 attack seats (17 inherited controls re-verified + 13 new, all killed or named); frontier (S098 `r48/ReopenS098.md` HOLDS; re-opens S084/S091/S092 `r48/ReviewReopens48.md`; S088 ruling `r48/ReconcileS088.md`; lesson `corpus/lessons/round-48.md`).

## Landed changes

Lane commits, all via `jj-lane.sh`, lane tip **`4e4f4713a7a2d62d6ba7767b5f6e37211ba9baca`** (record; pushed): `ce9aee5daf71004a5890134f9526cc6fe424b206` (C1/C2 candidate: four route patches integrated, cap-spawn leak fix, `counter-rerun.mjs`, A48 counter + plan addendum) and `4e4f4713…` (record: SCORECARD round-48 section + `## Round 47 correction` + stanza/gate-pins re-pins incl. proxy-check's own; LOG entry; `corpus/lessons/round-48.md`; SOURCES S098; README rows; QUALITY Q36/Q37; `scripts/proxy-check.mjs` GATE_PINS + re-pin; wave + residual + close receipts; attempt-1 `build/` inheritance). LOG.md round-48 entry at `4e4f4713`.

## Before → after measurements

| Claim | Counter (one command) | Before | After |
|---|---|---|---|
| C1 | `node .ufo/waves/48/probe/caproute48-probe.mjs <lane> <rev> --set r48` | `held=0/4` at `f00cf278` ×3 (freeze receipts) and at the freeze (`r48/A48-stab-r48-fe3d45bf.txt`) | `held=4/4 runs=3 rule=F48+A48` exit 0 at `ce9aee5d`: L1 score (`r48/L1-score-ce9aee5d.txt`) + committed re-runs `close/ReRunCounter48-{1,2}-receipt.txt` (ReRunCounterA/B) — all three time-spaced (18:52Z/18:59Z/19:00Z), zero exit-1/2 readings |
| C2 | `node scripts/counter-rerun.mjs --selftest` + one real AGREE run | absent at freeze (`git cat-file -e fe3d45bf:scripts/counter-rerun.mjs` fails) | `COUNTER_RERUN_SELFTEST: PASS` exit 0 (14 cases; flake-injection kills a print-PASS stub) and `COUNTER_RERUN: AGREE (runs=2)` exit 0 over the frozen probe at `ce9aee5d` (both runs `held=4/4`, summary sha256 `f3c23bdc…`) — `r48/L1-c2-binding-ce9aee5d.txt` |

Harm gates: H1 base 18/22 (`r48/L1H1Base-f00cf278-run1-2.txt`) vs tip 19/22 (`close/H1Tip-run1-2.txt`); the tip's extra pass is item 687-class; **no item passed both base runs and failed a tip run — no harm** (697's class shifted budget-timeout→fail-closed; 685/686 are sandbox-layout artifacts at both revs). H2: `close/ReRunR47Set-receipt.txt` — r47 set at `ce9aee5d` reads `held=5/5 runs=3 rule=F48+A48` exit 0 (a duplicate instance corroborates; counted once). H3: `close/proxy-strict-close.txt` — `PROXY: MATCH (A=38 C=22 operability=9; C1=19/19 C2=108/108 coverage=10; S=88/88; R=92/92; K=53/53; pins=6 match)` exit 0. H4: `close/census-close.txt` — `kumitate ok`, exit 0.

## Sources & frontier

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` — attempt-2 open: exit 0 (W04 S068/S084/S095, `.ufo/waves/round-48/open/census-attempt2-open.txt`); close: exit 0 (`.ufo/waves/round-48/close/census-close.txt`). Rows: 97 → **98** (S098 added, tier A, status **mined** — the amended counter header cites it and `corpus/lessons/round-48.md` cites it; used-by probe + lesson). Rows touched: S084/S091/S092 re-opened (HOLDS; status unchanged), S088 ruling recorded; no pre-existing row's cells changed. Frontier rows advanced: S098. Mistakes mined: four (`corpus/lessons/round-48.md` § Mistakes, each with a fix shown able to fail). Sourced claim: C1 rests on S098 with S093. Named residue: git-scm page drift stale-dated S076/S092/S063 pins (`r48/ReviewReopens48.md`) — noted, no chase.

## Trend verdicts

- **expansion — improved.** New tier-A row S098; capability `counter-rerun` enters the repertoire table (verified); four more gate sites under the bounded runner; runner contract v2 now covers 9 sites.
- **quality — improved.** R47-1..R47-5 repaired with committed receipts; 17 inherited controls re-verified + 13 new controls killed (incl. the A48-forging control class); the measured cap-spawn tmpfs leak fixed (delta 0); proxy `--strict` MATCH after honest re-pins; two counter shortcuts (M2 forgery, padded/PID-wrap parsing) closed with load-bearing proofs.
- **discernment — improved.** The lane rejected its own intermediate A48 bytes when re-scores disagreed (propagation bug, discarded receipts); committed re-runs decided C1 where r47 had IRC quotes; the bind-view and argv-identity limits are recorded, not hidden.

## SHONEN

- [~] SKILL.md decision tables/checklists/cited sources — unchanged this round; runner+routing contracts in `scripts/cap-{run,spawn}.mjs:10-23` (`ce9aee5d`); verified by ReviewCapSpawnCode/RevengerCapRun
- [~] End-to-end domain task executed and logged — LOG.md round-48 entry at `4e4f4713`; receipts `.ufo/waves/round-48/{r48,close}/`
- [ ] Instructions executable by an agent without oral context — [ ] No cross-domain bleed (PROVINCE.md still accurate; no lane file touched outside write scope — misroot sweep clean)

## Round shape and seats

- **Shape.** One v2 wave per the shared contract: wave `r48`, **65 seats** (executor 7, scribe 7, scout 6, connector 1, revenger 2, reviewer 14, critic 6, mutation-tester 19, sentinel 2, simplifier 1); attack (reviewer+critic+mutation-tester) = 39 = 60% (≥25%). Policy `scripts/hyaku/ufo-wave-policy-v2.json` (band 64–128); grant `seats=65 live=21 cap=256`; dispatched inline by the orchestrator per its mid-flight directive; validator plan exit 0, one batched call. **Residual:** one ordinary call of 8 reviewer/critic seats (`kumitate-r48-close`; grant `seats=8 live=123`), also orchestrator-dispatched. **Round total: 73 seats.**
- **Planner seat.** Held by the L1 (orchestrator ruling 2026-10-19; the validator rejects `planner`); bounded planning data-walks rode ConnSiblings/Scout seats.
- **Dead seats.** None in the r48 wave or the residual.
- **Cancelled/late.** ReviewIntegration and CritClose had not landed at the record commit; their late outputs (if any) stay uncommitted as round-49 inheritance. ReviewC2Agree's assigned AGREE command had the documented `--` tail defect; the L1 binding receipt is the C2 AGREE evidence.
- **Misroot sweep.** No kumitate-written files at the fleet root.
- **Stale-lane.** Respawn-per-round driver; no other mission of this lane is open.
- **Tool installs.** None (pacman paused host-wide; nothing needed installing).
- **L0 questions.** None new. The round-42 R41-2 gate-pins ruling stays open (one more key added this round by the established pattern).

## A48 (the round's one amendment)

Forced pre-data by control MutSummaryForge M2 (forged self-consistent summary read ROUTED_HELD 3/3) under the frozen kill rule; strictness-only per-case-line corroboration; amended sentence byte-identical in `plan.md` § A48 and the counter header; validated (`r48/A48-m2prime.txt` kills the forgery at exactly RG742; `r48/A48-stab-r47-f00cf278.txt` 5/5; `r48/A48-ctlenvcaps.txt` 0/4). An intermediate amended build (`df42ab6b…`) carried a propagation bug; its receipts are discarded, never scores. Named limits recorded in the lesson: bind view (`r48/L1BindProbe-receipt.txt`), argv identity, A48 as output-text oracle, sh-wrapped allowance at surface-probe, cap-spawn OOM→status-0, live PID-wrap exit-2 risk.
