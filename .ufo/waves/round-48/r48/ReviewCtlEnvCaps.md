# ReviewCtlEnvCaps — review of `build/CtlEnvCaps.md` and its three receipts

**Verdict: AGREE on all three parts of the seat's ruling.** (a) `f55bf22e` is a legitimate
four-site routing, not a control and not the C1 candidate; (b) `d4423b2c` was correctly
killed `held=0/4` for the targeted `no_capped_scope_ancestor` reason; (c) no amendment to
F48 is forced before data. Every byte claim I could reach re-verified exactly; the one
addendum-level imprecision found (below) strengthens, not weakens, the ruling.

## Re-verification performed (independent, against objects — not the report's prose)

The attempt-1 sandbox survives at `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvCaps/lane`
(read-only git only; no writes anywhere outside this report).

- **Receipt sha256 (recomputed, all match `build/CtlEnvCaps.md:88-90`):**
  pristine `b0942e5d…7167`, mutant `78e789ad…e61e`, restored `6688d4f5…3892`.
  Patch `a3a3aed2…d1c` (matches :85). Counter `f24a3af5…0cf2` (matches :77 and the frozen
  claim). The counter in the lane today is byte-identical to the one that produced the receipts.
- **Commit chain:** `fe3d45bf` (freeze) → `f55bf22e` (comparator) → `d4423b2c` (mutant) →
  `61f1c703` (restoration). The shipped patch is exactly the `fe3d45bf..d4423b2c` two-commit
  series; restoration excluded, as reported.
- **Tree identity (stronger than the report's claim):**
  `f55bf22e^{tree} === 61f1c703^{tree} = 1c695d1417772a5c1f9f2695b3484c8511369d4c`.
  Restoration is not merely a byte-equal file set — it is literally the same tree object, so
  the "restored" run re-scored identical content to the pristine run. There were therefore
  **two** 4/4 receipts over **one** comparator tree.
- **Blob sha256 table (`build/CtlEnvCaps.md:73-75`) — all nine cells recomputed and exact:**
  `cap-run.mjs` `d8acc6de…5758` at fe3d45bf/f55bf22e/61f1c703 and `6bbc2825…ef98` only at
  d4423b2c; `round-gate.mjs` `6ffd3ab0…08b` and `surface-probe.mjs` `77367904…829c` constant
  across all three comparator-side revs (and differing from freeze — the routing diff).
- **Mutant blob content:** `d4423b2c:scripts/cap-run.mjs` argv reads
  `['--user','--scope','--quiet','--unit=…','--','env','-i','MemoryMax=512M','MemorySwapMax=0','TasksMax=64','PATH=/usr/bin','bwrap',…]`
  — exactly the reported mutation: all `-p` properties removed from before systemd-run's
  `--`, reappearing only as `env -i` assignments inside the unit. Bwrap argv (with
  `--unshare-pid --die-with-parent --new-session` and the `--clearenv/--setenv` tail) unchanged.

## (a) The pristine comparator is a legitimate four-site routing — AGREE

- Patch 1/2 routes exactly the four named sites via `capSpawnSync`: RG742
  (`round-gate.mjs`, `runGate`), SP491 (`surface-probe.mjs`, surface shim), SP519
  (dispatcher status), SP1592 (`spawnSelf`); it touches nothing else. `cap-run.mjs` is
  **unmodified from the frozen copy** — the comparator routes call sites onto the existing
  frozen runner, which already carried the capped argv. The explicit `bind:` of fixture
  dirs and explicit child envs are consistent with the cap-run `o.bind`/`o.env` contract.
- The receipt proves the full predicate mechanically, not just `held=4/4`: every site
  `capped/n = n/n` in all 3 runs (116/116, 2/2, 2/2, 14/14), `uncapped_direct=0`, base_n
  equal, cases 61/61 and 46/46 with `verdict_pass=true`, `fail_lines=0`, exit 0.
  `capped` is only counted when `haveR && !leak`, and `haveR` requires the *ordered nested
  chain* node(`scripts/cap-run.mjs`) → `isScope` (systemd-run `--scope` with MemorySwapMax=0,
  MemoryMax≤1024M, TasksMax≤256 in pre-`--` options) → `isBwrap` (`--unshare-pid`,
  `--clearenv`, `--die-with-parent`) in the exec's own ancestry (probe :254-308). A
  partial or sham routing could not produce n/n.
- **Not a control, not the candidate:** under the kill rule (plan :70-71) a "control" is a
  mutation that must be killed; the amendment trigger is a control *reading ROUTED_HELD*.
  Sibling seats' pristine receipts all score `fe3d45bf` at `held=0/4` exit 1
  (CtlCountPad, CtlDirectSystemd, CtlLooseCaps, CtlJunk, CtlEnvPassthrough, CtlFakeRunner,
  CtlMention — verified) — i.e. the frozen base is correctly negative, and a *legitimate*
  routing reading HELD is the counter's intended behavior, not a defect. Reading the
  positive comparator as a "control" would make the amendment trigger self-defeating
  (every real candidate would trip it). The comparator lives only in a scratch sandbox,
  was never integrated, and its run is a pre-data calibration — not one of the kill rule's
  committed C1-commit re-runs. `load1=58.39` at load shows F48 scores a real routing under
  contention — the exact positive evidence a mutation battery needs beside its kills.

## (b) The mutant kill is correct and targeted — AGREE

- Probe mechanics confirmed at the cited region (`caproute48-probe.mjs:240-260`):
  `scopeProps` iterates argv only until `--`; the mutant's `MemoryMax=`/`MemorySwapMax=`/
  `TasksMax=` strings live after `--` inside `env -i …`, so `props` is empty, `isScope`
  fails for the (still `--scope`-flagged) systemd-run, and every candidate exec gets
  `haveS=false` → `no_capped_scope_ancestor`. `haveR` is set only inside the
  qualifying-scope branch (:296-298), so `no_cap_run_ancestor` is strictly derivative, as
  reported. `uncapped_exec` is emitted by the SITE-line aggregator when `capped !== n`
  (:365). Bwrap flags are intact, so `no_bwrap_ancestor` correctly absent.
- The MISS is targeted, not incidental: all 8 RUN rows in the mutant receipt exit 0 with
  full case totals and `verdict_pass=true`, `fail_lines=0`; site counts still match
  base_n; `uncapped_direct=0` (the runner is still the gate's direct child — it just
  launches an uncapped scope). Exit 1 `held=0/4`, never 2. Reasons match the derived set
  exactly on all four sites.

## (c) No amendment is forced — AGREE

The trigger is "a pre-data **control** reads ROUTED_HELD." All 17 mutant controls read
`held=0/4` (this one included, verified against its receipt and patch); the only HELD
reading is a *legitimate routing* — the counter doing its job. Nothing about the battery's
results contradicts the predicate, site list, or allowances; F48 stands unamended for the
candidate score.

## Findings / nits (non-blocking)

1. **Plan addendum imprecision (already relayed to CritPlan48 and CritFreezeTiming):**
   plan.md:98 says "the only 4/4 reading is `build/CtlEnvCaps-pristine-receipt.txt`". There
   are two 4/4 receipts — pristine (end 11:57:57Z) and restored (end 12:01:22Z) — but they
   scored the *same tree object* (`1c695d14…`), so the substance ("not a control, not a
   candidate") holds. Recommend wording "the only 4/4 *tree*" or naming both receipts.
2. Minor line-cite drift in the report (~±2 lines: cap-run argv is :186-189 not :185-187;
   scopeProps :240-253 not :239-260; haveR block :289-298 not :289-308). Regions and logic
   as described; cosmetic only.
3. Elapsed-time claims (190.3/114.4/46.5 s) are plausible for 8 straced selftests each but
   are receipt-external and unverifiable now; the discarded `/usr/bin/node` 127-launch is
   documented honestly and left no score artifact.

## Residual risk

- The 4/4-at-load1=58 result rests on one comparator tree scored twice (two loads), which
  is adequate calibration but not a substitute for the L1 score + ≥2 committed re-runs the
  kill rule requires of the real candidate. No gap in the seat's claims.
- `uncapped_direct=0` on the mutant shows the counter's direct-child check co-fires with
  the ancestry check as designed; nothing observed suggests F48 cannot distinguish them.

## Scope/bounds

No git writes in any real checkout (sandbox reads only: `log`, `rev-parse`, `show`,
`cat-file`); no tools installed; no lane writes outside this report. Runtime used for
hashing/reads: system `sha256sum`, `git 2.56.0` (from patch footer context; binary
`/usr/bin/git`).

Report: `.ufo/waves/round-48/r48/ReviewCtlEnvCaps.md`
