# ReRunCounterA — C1 kill-rule re-run (1 of 2) — report

Seat: `ReRunCounterA` (kumitate round 48, residual falsify call; leaf, no delegation).
Scope: item ReRunCounterA — a committed wave-2 re-run of the frozen C1 counter at lane tip
`ce9aee5daf71004a5890134f9526cc6fe424b206` (`--set r48`). Nothing modified; lane touched read-only.

## Measurement

| | |
|---|---|
| Command | `timeout -k 10 1800 node .ufo/waves/round-48/probe/caproute48-probe.mjs <lane> ce9aee5daf71004a5890134f9526cc6fe424b206 --set r48` |
| Exit | **0** |
| Duration | 71.6 s |
| stdout | 13 lines (6 RUN, 4 SITE, 1 CAPROUTE48, 1 trailer, +1 blank) |
| stderr | none |
| Trailer | `exit=0 start=2026-10-23T15:59:23.442168-03:00 end=2026-10-23T16:00:35.054492-03:00 load1_start=23.52 load1_end=27.18` |
| Receipt | `.ufo/waves/round-48/close/ReRunCounter48-1-receipt.txt` (stdout + trailer; sha256 of file: see below) |

Final summary line, verbatim:

```
CAPROUTE48 rev=ce9aee5daf71004a5890134f9526cc6fe424b206 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48+A48
```

Per-run prints (verbatim, all gates exit 0, verdict_pass=true, fail_lines=0):

```
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=14 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=102 resumed=15 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2120 resumed=19 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2120 resumed=33 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2120 resumed=18 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=228 resumed=19 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=228 resumed=24 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=228 resumed=19 verdict_pass=true fail_lines=0
```

Site lines (verbatim): RG742 `ROUTED_HELD` 116/116×3; SP491 `ROUTED_HELD` 2/2×3; SP519
`ROUTED_HELD` 2/2×3; SP1592 `ROUTED_HELD` 14/14×3. All `uncapped_direct=0,0,0`; no execveat;
no FAIL lines; per-case line corroboration (A48) consistent for round-gate (61/61) and surface-probe
(46/46) in every run.

## Verdict

`held=4/4` with exit 0 — this run is a **score** under the frozen kill rule (not a miss, not an
exit-2 non-score). It is one committed wave-2 re-run datum; the kill rule's "C1 verifies" conclusion
additionally requires the L1 score run and at least two committed re-runs all reading 4/4 — that
aggregation is the integrator's call, not this seat's.

## Checks performed (evidence)

- Lane tip verified read-only: `git -C <lane> rev-parse --verify ce9aee5daf71004a5890134f9526cc6fe424b206^{commit}` → `ce9aee5daf71004a5890134f9526cc6fe424b206`; `git log -1` subject matches the C1+C2 candidate ("four route sites (RG742 SP491 SP519 SP1592) through cap-run via cap-spawn; … A48 pre-data counter amendment …").
- Counter file sha256 (observed before run): `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59`; header prints rule `F48+A48` — consistent with the A48 pre-data amendment (the plan's re-verification hash `f24a3af5…` predates A48; this run scores the current, stricter post-A48 instrument).
- Probe writes: `git archive` (read-only on lane) into unique per-run scratch dirs under `/fast/scratch/hyaku/kumitate-r48/probe-runs/` with random suffixes (`randomBytes(4).toString('hex')`); per-run `rmSync` cleanup in `finally`. No lane repo writes by the probe (status: only `.ufo/waves/round-48/close/` untracked, this seat's deliverables).
- No tool installs performed (nothing new installed; no pacman/uv/npx/cargo actions — operator tooling directive noted, N/A).
- No delegation, no background processes; single foreground run with `TMPDIR=/tmp`.

## Findings (by severity)

- **No defects found in scope.** The measured behavior matches the frozen contract exactly: exit 0 ⇔ `held=<n>/<n>`, `rule=F48+A48`, `runs=3`, base at `f00cf278`, per-run suite summaries, PCR corroboration, no uncapped direct children, exec counts equal to base at every site.

## Observations / residual risk

- **Load sensitivity (low).** Load1 rose 23.52 → 27.18 during the run; `resumed` counts in rev runs (18–33) exceed base (14–15), consistent with interleaving under load. The parser handles resumed records fail-closed (exit 2 on any unresumed entry); no resignation occurred, so no effect on this score.
- **Shared scratch leftovers (external).** `/fast/scratch/hyaku/kumitate-r48/probe-runs/` currently contains leftover dirs from *concurrent peer runs* (`ce9aee5daf71-rev0/1/2-*` at 16:00, `0bd8be60d915-base0-*` at 15:42), i.e. runs that ended without their `finally` cleanup (killed/timeout) or are still in flight. This seat's own dirs were cleaned. Unique random suffixes preclude collisions; leftovers only consume disk. Not this seat's to clean (bounds: no writes outside own seat scratch/close//tmp).
- **Verification gaps.** (1) Kill-rule aggregation across the L1 run and the other committed re-runs (sibling seats) is outside this seat's scope. (2) No independent byte-level comparison against the L1 score run's receipt was performed (not provided to this seat; the frozen counter's determinism is attested by the byte-identical summary/site lines across this run's own three rev runs). (3) The C2/C1 diff review (site wiring in `cap-spawn.mjs`/gates) is the integration review's scope, not a counter re-run's.
- Deliverable sha256: receipt `ReRunCounter48-1-receipt.txt`
- `48088fe3fc09e219f9c9aaa48a9c013f69c84c8c0d853830bf4dcc39b8dffccf`; `ReRunCounter48-1.md`
- `1442a1975e830a9b7fb6e68c79f07a5db0212adf003e61751e6d8621a3927436`; this file
- `4319a08b03b746b07e48208213c9d3d968c69b5f997eb6620243bb1df24acb0c`.
