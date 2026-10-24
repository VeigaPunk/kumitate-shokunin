# ExecR50Repair — named R50 probe repair

Axis: **R50 registry-count consistency**. This is an auxiliary probe repair only; the lane's round-50 probe was not modified.

## Quoted original arm

The original `repairs50-probe.mjs` R5 code was:

```js
const skill = blob('SKILL.md');
const g5ok = !!(skill && !skill.includes('all eleven') && /Twelve/.test(skill));
```

As `RevHarm.md` finding 1 records, `SKILL.md` grew to thirteen registry gates, so the stale literal `Twelve` makes R5 miss.

## Repair

Created `build/ExecR50Repair/repairs50-probe-v2.mjs`. Its header names this as the v2 named repair for R52-4, dated 2026-10-24, seat `ExecR50Repair`.

R5 now counts lines containing the literal registry-row marker `| gate |` in the revision-pinned `SKILL.md`, obtains the corresponding spelled-out number, and checks that the `## Gate registry` pre-table count sentence agrees and that any `all <count>` claim in that prelude agrees. This removes the expected gate count as a fixed literal while keeping the registry's count-prose consistency check.

## Retained evidence

Freeze tip resolved to `f539a71e236a4d66810851c1f2fb6e1abe61ec19`.

Original command:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/probe/repairs50-probe.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin f539a71e \
  --fleet /home/vgpnk/Projects/shokunin
```

Saved transcript: `build/ExecR50Repair/repairs50-original-f539a71e.txt`:

```text
  R1 PASS gate-ledger
  R2 PASS REOPEN50: HOLD source=https://raw.githubusercontent.com/containers/bubbl
  R3 PASS REOPEN50: HOLD source=https://raw.githubusercontent.com/strace/strace/v7
  R4 PASS files=3 distinct=3 held=3 span_s=876
  R5 MISS still-eleven
  R6 PASS sections
  R7 PASS exit=0
  R8 PASS erratum
REPAIRS50: LEDGER_UNMET held=7/8 checks=8 rev=f539a71e rule=R50
EXIT=1
```

Patched command:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-52/build/ExecR50Repair/repairs50-probe-v2.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin f539a71e \
  --fleet /home/vgpnk/Projects/shokunin
```

Saved transcript: `build/ExecR50Repair/repairs50-v2-f539a71e.txt`:

```text
  R1 PASS gate-ledger
  R2 PASS REOPEN50: HOLD source=https://raw.githubusercontent.com/containers/bubbl
  R3 PASS REOPEN50: HOLD source=https://raw.githubusercontent.com/strace/strace/v7
  R4 PASS files=3 distinct=3 held=3 span_s=876
  R5 PASS swept
  R6 PASS sections
  R7 PASS exit=0
  R8 PASS erratum
REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=f539a71e rule=R50
EXIT=0
```

## Diff and arm preservation

Compared original and copy with `diff -u`. Changes are limited to the v2 filename/usage and header documentation plus the R5 comment and predicate. The only check implementation replaced is R5. R1-R4 and R6-R8 are unchanged from the original probe; the v2 diff does not alter their predicates. The R5 replacement is fail-closed on missing registry/count text and compares the declared count to the counted rows, instead of accepting a `Twelve` occurrence anywhere in the file.

## Risks / blockers

- The spelled-out count table supports 1–20 gates; above 20, R5 fails closed rather than producing a potentially incorrect held result.
- R7 is a live census and R8 reads the fleet `master` report; both passed in each retained run but remain environment/revision-dependent as in the original probe.
- No blockers. No tools were installed or updated.

Report: .ufo/waves/round-52/w1/ExecR50Repair.md
