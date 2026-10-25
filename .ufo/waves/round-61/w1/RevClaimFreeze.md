# RevClaimFreeze — round 61 w1 (claim-freeze review)

**Verdict: FREEZE REJECTED.** C2's counter cannot reach its own target; the C1 base
receipts were rewritten after the freeze; C1's target is reachable without a dispatch.
Full reasoning, reproductions and minimal repairs:
`.ufo/waves/round-61/build/RevClaimFreeze/verdict.md`.

Reviewed at HEAD (`be4a820`) against the base/freeze commits `165b8304` (measurement)
and `c2721f81` (freeze). No lane file edited; fixtures under
`/tmp/kumitate-r61/RevClaimFreeze/{fx,fx2,fab,probe-fixed.mjs}`.

## Blockers

1. **`DOCTRINE61_HELD` is unreachable (max 3/6).** `probe/doctrine61-probe.mjs:17,21`
   locate S195 with `/^\|[[:space:]]*S195[[:space:]]*\|/`; JavaScript has no POSIX
   classes, so it matches no `corpus/SOURCES.md` row (four real shapes → `false`).
   E4's pin is therefore always `''` (MISS), and E3 prints `row-absent` for rows that
   are present. Independently, **E3's indices are shifted by one** — `c[1]` is the id
   cell, so status/opened/used-by are `c[8]/c[9]/c[11]`, while the code reads
   `c[9]/c[10]/c[12]`; a contract-valid row can never pass and a row shaped to fit the
   shifted indices is census `E01` (NF≠13). Replay on a valid fixture: frozen probe
   `held=2/6`; same probe with `[[:space:]]`→`\s` `held=3/6` (`E3 MISS status=2026-10-25
   opened=90d used-by=`, `E4 PASS`). Additionally **E5 is unreachable via the plan's
   counting command**: the probe defaults `--root` to the lane, and
   `sources-census.sh validate --root <lane> kumitate` → exit 2 (`unknown lane`), while
   the plan's `--root /home/vgpnk/Projects/shokunin` → exit 0.
2. **Base receipts rewritten after the freeze (`48877b4`).** `base/dispatch61-base-probe.txt`
   and `base/doctrine61-base.txt` changed the measured rev `165b8304…` → `c2721f81…`,
   and P3's detail `| dispatch-evidence | Read a round's …` → `row-absent`. At
   `c2721f81` the row exists in `## Capabilities` (SCORECARD.md:1794) and the exact P3
   expression prints the row text (`row found: true`, `pass would be: false`); no run at
   either rev prints `row-absent`. Verdict unchanged, evidence line fabricated.

## High

3. **Base relabel.** `plan.md` was rewritten in `48877b4` from `Base: 165b8304…` to
   `Base revision: c2721f81…` (both "Before (measured at base …)" headers followed).
   `c2721f81` is the freeze commit that contains the probes/plan/receipts; the
   before-values were measured at its parent `165b8304`.
4. **P3 is false-by-record and cosmetic-by-code.** The `dispatch-evidence` row already
   exists at base with `First-working round = 60` (`sed -n 1794p`, cell 5). The plan
   demands "first-working round 61" (a provenance rewrite it does not disclose); the
   code only tests `/round 61/` anywhere in the row, so appending the substring to the
   evidence cell passes P3 with no capability acquired.
5. **C1's target is reachable without a dispatch.** A fully fabricated, internally
   consistent wave dir (32 rows, `session=sess-N`, `exit=0`, 32 non-empty reports,
   matching `dispatch-actual.json`, non-null `agentIds`) prints the exact target line
   `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)` exit 0.
   `NOT_A_DISPATCH` fires only when *every* `agentId` is null. The committed controls
   cover only progress-absent and null-sessions, so this shape is un-controlled.

## Medium

6. **C2's control is not a counter run and cannot discriminate.**
   `controls/ctl-c2-unopened-row.txt` is hand-written (no generator in the repo),
   tests only E4 (not E3), prints `E4 PASS: false`, and exits 0. Because E4 is dead for
   every input, the same output is produced for a correct row.
7. **Four checks read the worktree, not the measured revision:** C1 P2's gate half
   (`--root lane`), C1 P4 (`readFileSync(join(lane, …))`), C2 E4's capture sha
   (proved: `sha=30cce406…` computed while `body.md` is absent from `HEAD`), C2 E6's
   `readme-map` run (`cwd: lane`). E4 also weakens "equals" to a 16-hex prefix.
8. **Nudge waiver drops the second conjunct.** `AXES.md` §stagnation nudge needs axes
   ≥ line **and** no capability inside the window; `SCORECARD.md:1948` declares line 9
   and **N = 3**, and the table records rows at 58/59/60. The plan states neither the
   line nor N, so the waiver is not re-derivable and, on the lane's own record, is not
   satisfied. Mitigation: C1 works operability (9), the lowest live axis — the
   obligation is met substantively, the stated ground is wrong.
9. **Before-values without receipts.** "133 rows (A=110 B=15 C=8)" is true (verified at
   `c2721f81`) but appears in no receipt (`base/census-before.txt` is a `validate` run
   with W04 warnings only); both census/proxy receipts carry no lane rev;
   `base/proxy-before.txt` is quoted selectively (C2_TOTAL_DRIFT only — `A_DRIFT
   declared=105 computed=107` and `AXES_DRIFT coverage row=10 derived=9` omitted). C1's
   round-60 `held=8/10` *is* backed at base
   (`corpus/lessons/round-60-verifier-spotcheck.md:48`, `.ufo/waves/round-60/close/dispatch60-work.txt`)
   but the plan cites `base/dispatch61-base.txt`, which contains only the gate's
   `FAIL-CLOSED wave-dir-absent`.

## Low

10. P2 "non-empty" is unchecked at the rev (name count only; emptiness enforced by the
    worktree gate). E2 "opens with" is line-anchored-anywhere in code. E6's frozen
    sentence carries the non-literal placeholder `README_MAP: CLEAN files=rows=covered`.
    C1 control fixtures live only in `/tmp` (not re-runnable from the repo).

## Accepted (no finding)

- **C1's committed controls are sound**: `ctl-c1-fabricated-registry.txt`
  (`FAIL-CLOSED progress-absent`, exit 2) and `ctl-c1-null-sessions.txt`
  (`DRIFT` + `NOT_A_DISPATCH`, exit 1) are real gate runs; the gate's selftest is
  `PASS (8/8)` at base and now, covering progress-absent, template-registry,
  report-absent, dead-seat-credited, plan/expect mismatch, dead-mismatch.
- The five-axis enumeration in the plan matches `SCORECARD.md ## Axes`, and every axis
  is ≥ the declared line 9 (coverage's derived 9 still meets it).
- Claims are on distinct axes (operability, coverage), each with its own counter, and
  both are disclosed as capability/frontier moves; the two claims and the round shape
  (32 unique seat names / 32 unique report paths in `w1-dispatch.json`) are consistent.

## Calibration notes

- Seat `ScribeSourcesRows.md:98-114` independently found the E3/E4 regex defect; its
  index-shift claim is correct (I initially mis-mapped awk `$9` to JS `c[9]` and
  corrected it against a real row) and its "12-cell row would fail E01" is correct.
- I did not judge in-flight wave output (w1 had 7 reports at review time) and did not
  run the gate against the live wave dir; the C1 CLEAN reachability finding uses a
  `/tmp` fixture. The fleet census was only read (`validate`, both roots).

## Tooling

No installs or updates were made.
