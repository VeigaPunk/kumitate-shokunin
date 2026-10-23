# ReRunR47Set — report (H2 harm rule, kumitate round 48)

- Seat: `kumitate-r48-close-ReRunR47Set-2`; date 2026-10-23 ~19:01Z
- Task: run the frozen counter at the C1 commit with `--set r47`; five r47 sites must still read `held=5/5` (base stability 5/5×3 at `f00cf278`).
- Rev: `ce9aee5daf71004a5890134f9526cc6fe424b206` (lane tip, verified).
- Counter sha256: `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59` (rule F48+A48).

## Verdict

**H2 PASS** — `CAPROUTE48 rev=ce9aee5d… set=r47 held=5/5 runs=3 rule=F48+A48`, exit 0. All five r47 sites (K488, SC549, SC859, CC879, AT802) read `ROUTED_HELD`. No harm: no C1-side change regressed any r47 site from its base 5/5 reading.

## Findings by severity

- **No defect found (in scope).** The counter run is clean and self-consistent: 16 RUN lines (base0 + rev0/1/2 for each of the four r47 gates), 5 SITE lines all HELD, single CAPROUTE48 summary, exit 0. Per-gate resumed counts differ across the three runs → three distinct traces. Exec counts match base exactly.
- **Worth noting (low, not in functional scope).** The probe's scratch root `/fast/scratch/hyaku/kumitate-r48/probe-runs` is shared across concurrently-running seats; during this seat's window, a peer's live run touched sibling dirs there (e.g. `f00cf278a5ab-base0-…/round-gate.strace`). Per-run dirs are unique (random 4-hex suffix), so no collision or interference occurred. Leftover dirs from sessions that exited via `die()` (which skips `finally` cleanup) may accumulate; cosmetic only.
- **Recorded observation (not a finding).** The current counter does not print its own load1 / sha trailer (the earlier F48-era stability receipts did). Load here was sampled from host `/proc/loadavg` (~22.9 → ~29.4) — approximately, not probe-instrumented.

## Residual risk / verification gaps

- H2 covers the five r47 sites' behavior at the C1 commit; it does not re-prove base stability (that was pre-existing evidence) nor the C1 r48 set (L1 score + committed re-runs cover it).
- This seat did not modify the counter or any lane file; the counter is frozen and its sha matches the tracked receipts.
- The concurrent peer activity in the shared scratch was observed but not audited (out of scope); it did not touch this seat's dirs.

## Evidence

- Full verbatim stdout + metadata: `.ufo/waves/round-48/close/ReRunR47Set-receipt.txt` (and `.md`).
- Base comparison: `.ufo/waves/round-48/probe/receipts/stab-r47-f00cf278-{1,2,3}.txt`; `.ufo/waves/round-48/r48/A48-stab-r47-f00cf278.txt`.
