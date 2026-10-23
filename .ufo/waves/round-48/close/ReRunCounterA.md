# ReRunCounterA — C1 kill-rule re-run (1 of 2) — seat report

Seat `kumitate-r48-close-ReRunCounterA` (instance `-2`), kumitate round 48 residual falsify call. Leaf: no delegation, no background processes, foreground commands only, `TMPDIR=/tmp` throughout. Lane touched read-only except this seat's `close/` deliverables.

## Measurement

| field | value |
|---|---|
| Command | exact item command, `timeout -k 10 1800` wrapper, `--set r48` |
| Rev | `ce9aee5daf71004a5890134f9526cc6fe424b206` — lane tip = the C1 commit (verified read-only; committed counter bytes = working tree bytes) |
| Counter | `.ufo/waves/round-48/probe/caproute48-probe.mjs`, sha256 `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59`, rule label `F48+A48` |
| Exit | **0** |
| held= line | `CAPROUTE48 rev=ce9aee5daf71004a5890134f9526cc6fe424b206 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48+A48` (verbatim) |
| Window | 16:01:13–16:03:30 -03 (≈136 s), load1 28.16 → 45.92 |
| Receipt | `close/ReRunCounter48-1-receipt.txt`, sha256 `fd7d8866efbead2128d9bc00964f47d97443f08b45852508d186ad83f30424a2` |
| Item report | `close/ReRunCounter48-1.md` |

## Verdict

Exit 0 with `held=4/4` — the C1 target after-state, met by this committed wave-2 re-run. A score under the frozen kill rule (not an exit-1 miss, not an exit-2 non-score). The kill rule's aggregation — L1 score run (`r48/L1-score-ce9aee5d.txt`, exists) plus ≥2 committed wave-2 re-runs all reading `held=4/4` — is the integrator's call, not this seat's. On the record: sibling run 2 (`close/ReRunCounter48-2-receipt.txt`, seat ReRunCounterB, window 16:00:46–16:02:42 -03) independently reads `held=4/4` exit 0 on the same counter sha, with identical scored fields (capped 116/2/2/14, rev execs 2120/180, uncapped_direct 0). The superseded first-instance run also read `held=4/4` exit 0. All recorded readings agree.

## Findings (by severity)

1. **Medium — duplicate dispatch / shared-path receipt overwrite (resolved here; flagged for closure).** The same item was executed by two instances of this seat ~80 s apart. The first instance's receipt at the assigned path (sha256 `48088fe3…`) was replaced by this run's receipt (16:03:30, `fd7d8866…`), which left the earlier report version citing an absent artifact. Both runs scored `held=4/4` exit 0. The earlier stdout+trailer is preserved at `close/ReRunCounterA-original-receipt-run1.txt` (actual sha256 `92f692d8…`; its embedded "sha256 of this hosted file" line cites the `/tmp` copy `272053f7…` — the two parked copies differ only in that self-referential header line; bodies identical). Both reports (`ReRunCounter48-1.md`, `ReRunCounterA.md`) now describe the receipt actually on disk; peer coordination done (`kumitate-r48-close-ReRunCounterA` confirmed no further writes). Closure note: count run 1 = `ReRunCounter48-1-receipt.txt` (`fd7d8866…`); same-path shared deliverables need single-owner dispatch (lesson class "cancelled-seat readings as conclusions", `build/ScribeMistake.md`).
2. **Low — raw exec totals are not run-invariant across score runs.** First instance: surface-probe `execs=102` (base0) / `228` (rev×3); this run and ReRunCounterB: `54` / `180`. The `+48` shift is uniform base-vs-rev in the first instance's run, and round-gate rev execs (2120) are identical across all runs; every *scored* field agrees exactly (per-site capped/n = base_n, cases n=n, uncapped_direct=0, summary line). Load-dependent fixture behavior inside the gate is the plausible cause; recorded, not chased — but receipts should not be expected byte-identical below the summary line.
3. **No defect in scored behavior.** This run matches the frozen contract exactly: exit 0 ⇔ `held=4/4`; `base=f00cf278`; `rule=F48+A48`; `runs=3`; per-site capped execs equal base (116/2/2/14); suites 61/61 and 46/46 with A48 per-case corroboration; no FAIL lines; no execveat; no uncapped direct children; all traces parsed fail-closed.

## Residual risk / verification gaps

- Kill-rule aggregation across L1 + all committed re-runs is outside this seat's scope (recorded in Verdict).
- No byte-level diff against the L1 score receipt performed (outside item scope).
- Load1 was high and rising (28→46) during the run; resumed-record mix is load-dependent by design, and the parser's resignation path (exit 2) did not trigger.

## Files

- `close/ReRunCounter48-1-receipt.txt` — this run's verbatim stdout + required trailer (sha256 `fd7d8866…`)
- `close/ReRunCounter48-1.md` — item report (held= line verbatim; superseded-run provenance)
- `close/ReRunCounterA.md` — this file

Bounds: writes confined to the `close/` files above and `/tmp` (runner script, captured stdout/stderr). Read-only git; no installs; no pacman transactions; no restarts.
