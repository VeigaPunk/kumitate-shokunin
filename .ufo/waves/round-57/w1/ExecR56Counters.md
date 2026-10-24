# ExecR56Counters — frozen r56 counters re-run at the close rev

Round: kumitate 57 (hyaku run 5), one v2 wave of 64 seats. Seat: ExecR56Counters (leaf).
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (jj-colocated git; HEAD `8c6f5b017d149b18134917378cdbed3b492d8e89` at run time).
Date: 2026-10-24, runs at 12:52:27–12:53:05 UTC.
Assignment: re-run `node .ufo/waves/round-56/probe/attest56-probe.mjs <lane> <rev>` and the
doctrine probe at the close rev, record A56/D56 verbatim, A56 possibly 9/10 under the
supersession convention.

## Method (observed, not inferred)

Both frozen counters were executed from their committed lane path against **extracted
committed bytes** (`git archive <rev> | tar -x` into the probe's own `mktemp -d`), never the
working tree. Probe bytes are the frozen ones at every rev tested — `git show <rev>:… |
sha256sum` equals the worktree hash at all of `e74ea6b`, `0fb5c61`, `7178bfd`, `b3bd063`:

```
attest56-probe   6b230b472e4dbfef3a1dc2884aff5dcdbcacefcc8f6f930d9f037bcdb3cfb54c
doctrine56-probe 2c03d5e078ea0ef4517592ed27bbb980c6d71e2cf96c5b10cc13b239ba31f76e
```

Exact command shape, run once per rev/probe:

```
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-56/probe/attest56-probe.mjs \
     /home/vgpnk/Projects/shokunin/kumitate-shokunin <full-40-hex-rev>
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-56/probe/doctrine56-probe.mjs \
     /home/vgpnk/Projects/shokunin/kumitate-shokunin <full-40-hex-rev>
```

Runner scripts + full stdout/stderr/exit logs: see Evidence inventory. No lane file was
written by the probes; only my own build dir was created. No tool install was needed or done.

Rev set: the two competing readings of "close rev" were both exercised, plus history and
negative controls.

| label | rev | why |
|---|---|---|
| r57 close (R1) | `f0dc6d1160e66af65355bd353665adac22bbf4a9` | round-57 plan §Close sequence: "R1 = integration tip … Report + SCORECARD cite measured close revision R1" |
| r57 tip | `8c6f5b017d149b18134917378cdbed3b492d8e89` | idempotence at tip |
| r57 pre-close integration | `b3bd0633aec43ad2559f980b400e4d7077e10af3` | rev of the committed `close/prior-counters-at-close.txt` |
| r56 measured close | `e74ea6b8634a1f3c421f3e8f0ed2fd07cfe03843` | SCORECARD row 56: "measured commit `e74ea6b863…`" |
| r56 interim R1 | `e4a49432b36f23646df31a68354d2c14a03fa9e3` | round-56 integration tip (receipts not yet minted) |
| r56 idempotence tip | `0fb5c61b2aa25deac03d7f1503b8b141fa2a8f08` | round-56 idempotence transcript |
| r57 base | `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` | plan base / round-56 verifier tip |
| r56 base | `3eae059e929e4da317c45eba18b4099b90f7541b` | SCORECARD base receipt (K1 do-nothing control) |
| absent rev | `0000000000000000000000000000000000000000` | fail-closed contract arm |

## Readings (verbatim, full lines)

**Primary — round-57 measured close R1 `f0dc6d11…`:**

```
ATTEST56: ATTEST56_UNMET held=9/10 checks=10 rev=f0dc6d1160e66af65355bd353665adac22bbf4a9 rule=A56 version=v1 | B1 PASS | B2 PASS | B3 PASS | B4 PASS | B5 PASS | B6 PASS | B7 MISS row=true items=27 item26=true | B8 PASS | B9 PASS | B10 PASS
```
exit 1.

```
DOCTRINE56: DOCTRINE56_HELD held=5/5 checks=5 rev=f0dc6d1160e66af65355bd353665adac22bbf4a9 rule=D56 | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS
```
exit 0.

**Second reading — round-56's own measured close rev `e74ea6b8…`:**

```
ATTEST56: ATTEST56_HELD held=10/10 checks=10 rev=e74ea6b8634a1f3c421f3e8f0ed2fd07cfe03843 rule=A56 version=v1 | B1 PASS | B2 PASS | B3 PASS | B4 PASS | B5 PASS | B6 PASS | B7 PASS | B8 PASS | B9 PASS | B10 PASS
```
exit 0.

```
DOCTRINE56: DOCTRINE56_HELD held=5/5 checks=5 rev=e74ea6b8634a1f3c421f3e8f0ed2fd07cfe03843 rule=D56 | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS
```
exit 0.

**All arms:**

| rev | A56 | D56 |
|---|---|---|
| `f0dc6d11…` (r57 R1) | `UNMET held=9/10` exit 1 — B7 MISS `row=true items=27 item26=true` | `HELD held=5/5` exit 0 |
| `8c6f5b01…` (r57 tip) | `UNMET held=9/10` exit 1 — B7 MISS `row=true items=27 item26=true` (identical modulo rev) | `HELD held=5/5` exit 0 |
| `b3bd0633…` | `UNMET held=9/10` exit 1 — B7 MISS `row=true items=27 item26=true` | `HELD held=5/5` exit 0 |
| `e74ea6b8…` (r56 close) | `HELD held=10/10` exit 0 | `HELD held=5/5` exit 0 |
| `e4a49432…` (r56 R1) | `UNMET held=9/10` exit 1 — B8 MISS `receipt files missing` | `HELD held=5/5` exit 0 |
| `0fb5c61b…` | `HELD held=10/10` exit 0 | `HELD held=5/5` exit 0 |
| `7178bfd3…` (r57 base) | `UNMET held=9/10` exit 1 — B6 MISS `pinOk=true proxyExit=1 last="PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=132 computed=133 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)"` | `HELD held=5/5` exit 0 |
| `3eae059e…` (r56 base) | `UNMET held=0/10` exit 1 — B1..B10 all MISS (`gate absent`, `registry absent`, `items=25`, `receipt files missing`, …) | `UNMET held=2/5` exit 1 — `E1 MISS entry-absent | E2 MISS entry-absent | E3 MISS S113:missing,… | E4 PASS | E5 PASS` |
| `0000…0000` | exit **2**, stderr `ATTEST56: FAIL-CLOSED rev unreadable (2)`, no score line | exit **2**, stderr `DOCTRINE56: FAIL-CLOSED rev unreadable (2)` |

## Findings

**F1 — The 9/10 at the round-57 close is supersession-only, not a live regression.** The
sole miss at `f0dc6d1` and at the tip is B7's frozen literal `items === 26`
(`attest56-probe.mjs:301`), while SKILL.md carries **27** checklist items at `f0dc6d1`:
items 24/25/26 remain the round-54/55/56 gates (`counter-pins.mjs`, `source-capture.mjs`,
`source-dupes.mjs`) and item 27 is the round-57 move (`readme-map.mjs`,
`kumitate-readme-map-v1`). The same arm reports `row=true` (the `source-dupes` gate registry
row is intact) and `item26=true` (item 26 still binds `source-dupes.mjs`). This is exactly the
named A54/A55 counter-obsolescence convention restated for A56 by round-57 plan R56-V2 —
a frozen item-count literal re-expressed, not a broken gate.

**F2 — Round-56's own close is intact and reproduces exactly.** At its SCORECARD-cited
measured commit `e74ea6b8…`, A56 reads `ATTEST56_HELD held=10/10` and D56
`DOCTRINE56_HELD held=5/5`; both stdout files are **byte-identical** to the committed
`round-56/close/FINAL-attest56-R2.txt` and `FINAL-doctrine56-R2.txt` (`diff -u` clean).

**F3 — Byte-identical reproduction of every committed r56 transcript I tested** (all
`diff -u` clean, full transcript in `reproduction-diff.txt`):
- `b3bd063` A56/D56 lines == the `[attest56]`/`[doctrine56]` lines of
  `round-57/close/prior-counters-at-close.txt`;
- `e74ea6b` == both round-56 FINAL receipts;
- `0fb5c61` == both lines of
  `round-56/close/IDEMPOTENCE-0fb5c61b2aa25deac03d7f1503b8b141fa2a8f08.txt`;
- `e4a4943` A56 == `round-56/close/INTERIM-attest56-d7da54ab.txt`
  (`held=9/10 … B8 MISS receipt files missing`).
The committed transcripts are therefore reproducible from the committed bytes at a fixed
rev; no transcript-only claim is being trusted here.

**F4 — The counters discriminate (K1-style do-nothing control).** At the round-56 base
`3eae059e…` the same frozen probes read A56 `0/10` and D56 `2/5` (E4/E5 only), matching the
SCORECARD base receipt. A56's 9/10 at close is thus a reachable near-miss on one literal, not
a floor artefact.

**F5 — Fail-closed contract holds.** A well-formed but absent 40-hex rev yields exit **2**
on both probes with no `held=` line, so an unreadable extraction can never be mistaken for a
score or a partial pass.

**F6 — Independent corroboration of R56-V3 at the round-57 base.** At `7178bfd` A56's B6 arm
fails on live proxy drift (`C2_TOTAL_DRIFT declared=132 computed=133`,
`AXES_DRIFT coverage declared=10 computed=9`) — the missing README map row for
`corpus/lessons/round-56-verifier-spotcheck.md` described in the plan's R56-V3. After the
round-57 integration (`f0dc6d1`) B6 passes, i.e. the repair is visible to the frozen r56
counter too, not only to the new gate.

**F7 — Stability across the close boundary.** A56/D56 at R1 and at the bookkeeping tip are
identical except the `rev=` token (`b3bd063` likewise). No drift is introduced by the
post-close receipt commits.

## Evidence inventory

All under `.ufo/waves/round-57/build/ExecR56Counters/`:

- `run-counters.sh`, `run.log` — 12 primary runs at 6 revs; full command line, start/end UTC,
  stdout, stderr, exit per run.
- `run-extra.sh`, `run-extra.log` — b3bd063 reproduction + r56 base control + absent-rev
  fail-closed arm.
- `attest56@<rev>.txt` / `doctrine56@<rev>.txt` (+ `.err.txt`) — raw per-run captures.
- `readings.txt` — sha256 + full line per capture. Key hashes:
  - `attest56@f0dc6d1.txt` `0379732741b9507ee1998d224a6d42180b67fab6bbdf7f4a7f0215c068c82d73`
  - `doctrine56@f0dc6d1.txt` `932360d6fd24ef96679a160a5e6d99f312b0c4ec76cc80f0729b73e398ab660e`
  - `attest56@e74ea6b.txt` `5cc1f364f64e8cf8542fd48fda2b2b1fadd7928ab90a3a1768fb8ceb4647dae1`
  - `doctrine56@e74ea6b.txt` `3d4906869f01707e05eb4fadade9ba014a08d974d0eebbf0ef2dc58bfcac6dd1`
- `revs.txt`, `reproduction-diff.txt`, `expect-*.txt` — resolved full revs and the `diff -u`
  comparisons.
- `attest56@norev.err.txt`, `doctrine56@norev.err.txt` — FAIL-CLOSED exit-2 stderr.

Lane cleanliness: after all runs the only tracked modification in the lane is the
pre-existing ` M .ufo/waves/round-57/w1/swarm-registry.json` (not mine; present before my
first run and recorded in both logs' before/after `git status`). My untracked footprint is
only `build/ExecR56Counters/` and this report.

## Limits / risks

1. **A56 `9/10` at the close must be reported as named counter-obsolescence** (plan R56-V2
   convention). Any harm-battery or report line that quotes A56 as `10/10` at the round-57
   close rev would be false. Conversely this reading is *not* evidence of a C1 defect: B7 is
   the only miss, its two semantic conjuncts (`row`, `item26`) both pass, and the item that
   broke the literal is the round's own capability move (item 27, `readme-map.mjs`).
2. **D56's E5 is live-only.** E5 shells the fleet census
   (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root … kumitate`),
   which reads live state rather than the extracted rev; the probe documents this as a
   known limit. E1–E4 are rev-bound. A 5/5 therefore proves S113–S116 binding at the rev
   plus live census exit 0 at run time.
3. The probe set was executed from the lane worktree path while the lane had sibling build
   dirs untracked. The probes never read the worktree for scoring (only `git archive <rev>`);
   probe bytes were verified identical to the bytes at each judged rev (F1 method table), so
   no worktree differential affected the readings.
4. The two possible meanings of "close rev" were both measured; if the parent needs one
   number, cite **`f0dc6d1` (round-57 R1): A56 9/10, D56 5/5**, and record the round-56
   close reading separately as **`e74ea6b8`: A56 10/10, D56 5/5** (byte-identical to the
   committed FINAL receipts).

## Scope compliance

- Production, corpus, SKILL.md, SCORECARD.md, LOG.md, PROVINCE.md, `.ufo/pins/*`,
  `.ufo/state/*`, sibling seats' dirs: untouched.
- No commit, push, jj mutation, git index change, service restart, pacman transaction, or
  tool install. Runs were read-only over `git archive`, `git status`, `git rev-parse`,
  `git show`, `diff`, and the probes' own temp dirs.
- No subagent/delegation/background orchestration was used.
