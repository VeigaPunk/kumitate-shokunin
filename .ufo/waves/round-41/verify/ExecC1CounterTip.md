RESULT ExecC1CounterTip rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=confirmed before=15/16 after=0/16

# ExecC1CounterTip — C1 counter re-run at the round-open revision and at the tip

Scope: re-run the committed C1 counter at `a58b7f72afc1eb44b37e438a2f8b212c658874e5` and at
`fae386aa9e0542710b7a893d84c8e92e86fc079b`, paste both footers and all 16 MUTANT lines each,
confirm or refute the stated before/after values, and count SKIP lines in the tip selftest run.

Verdict: CONFIRMED. `before survived=15/16` and `after survived=0/16 nomatch=0 crash=0
control=PASS` both reproduce exactly at the tip. SKIP lines in the tip run of
`node scripts/cite-check.mjs --selftest`: **0**.

Environment: node v24.21.0 (already present; nothing installed or updated). Scratch clone
`/fast/scratch/hyaku/kumitate-r41a2/seats/ExecC1CounterTip/lane`, detached at
`fae386aa9e0542710b7a893d84c8e92e86fc079b`. Counter bytes used:
`.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt`, sha256
`7e58ee47261d6047dd28288d349ea93085e2c7ae1df6f5ead5ec4bb070762dc4` (blob `9f313d76` at the tip;
`git log --all -- <probe>` shows one commit, `cb2d8d0`, i.e. the counter is unchanged since it was
committed before its first counted run). The probe is not in the `a58b7f72` tree — it was committed
at `cb2d8d0` after the round opened — so the before run feeds the tip's counter bytes against the
`a58b7f72` tree, which is what the probe does by design (`git archive <rev> scripts`).

## BEFORE — rev a58b7f72afc1eb44b37e438a2f8b212c658874e5

Command: `node --input-type=module - --lane <clone> --rev a58b7f72afc1eb44b37e438a2f8b212c658874e5 < .ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` (exit 0)

```
CONTROL unmutated PASS exit=0 cases=64/64 fail_lines=0
MUTANT warn-total survived exit=0 cases=64/64 fail_lines=0
MUTANT resolved-kind-gate survived exit=0 cases=64/64 fail_lines=0
MUTANT strict-conjunct survived exit=0 cases=64/64 fail_lines=0
MUTANT strict-warn-arm survived exit=0 cases=64/64 fail_lines=0
MUTANT resolved>0 killed exit=1 cases=63/64 fail_lines=1
MUTANT citeCheck-map survived exit=0 cases=64/64 fail_lines=0
MUTANT render-env-empty survived exit=0 cases=64/64 fail_lines=0
MUTANT render-env-zero survived exit=0 cases=64/64 fail_lines=0
MUTANT exit2-empty survived exit=0 cases=64/64 fail_lines=0
MUTANT exit2-zerores survived exit=0 cases=64/64 fail_lines=0
MUTANT exit0/1-map survived exit=0 cases=64/64 fail_lines=0
MUTANT parse-64 survived exit=0 cases=64/64 fail_lines=0
MUTANT suite-group-verdict survived exit=0 cases=64/64 fail_lines=0
MUTANT suite-any-fail survived exit=0 cases=64/64 fail_lines=0
MUTANT suite-exit-json survived exit=0 cases=64/64 fail_lines=0
MUTANT suite-exit-text survived exit=0 cases=64/64 fail_lines=0
CITE_MUTANTS survived=15/16 nomatch=0 crash=0 control=PASS rev=a58b7f72afc1eb44b37e438a2f8b212c658874e5
```

Only `resolved>0` is killed; 15 survive. Byte-identical to the committed receipt
`.ufo/waves/round-41/final/cite-mutants-open-a58b7f72.txt` (diff of the two files, modulo the
`rev=` field and the receipt's trailing `exit=0` line: no differences).

## AFTER — rev fae386aa9e0542710b7a893d84c8e92e86fc079b

Command: `node --input-type=module - --lane <clone> --rev fae386aa9e0542710b7a893d84c8e92e86fc079b < .ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` (exit 0)

```
CONTROL unmutated PASS exit=0 cases=75/75 fail_lines=0
MUTANT warn-total killed exit=1 cases=72/75 fail_lines=3
MUTANT resolved-kind-gate killed exit=1 cases=74/75 fail_lines=1
MUTANT strict-conjunct killed exit=1 cases=74/75 fail_lines=1
MUTANT strict-warn-arm killed exit=1 cases=73/75 fail_lines=2
MUTANT resolved>0 killed exit=1 cases=74/75 fail_lines=1
MUTANT citeCheck-map killed exit=1 cases=73/75 fail_lines=2
MUTANT render-env-empty killed exit=1 cases=74/75 fail_lines=1
MUTANT render-env-zero killed exit=1 cases=74/75 fail_lines=1
MUTANT exit2-empty killed exit=1 cases=74/75 fail_lines=1
MUTANT exit2-zerores killed exit=1 cases=74/75 fail_lines=1
MUTANT exit0/1-map killed exit=1 cases=74/75 fail_lines=1
MUTANT parse-64 killed exit=1 cases=74/75 fail_lines=1
MUTANT suite-group-verdict killed exit=0 cases=73/75 fail_lines=2
MUTANT suite-any-fail killed exit=0 cases=73/75 fail_lines=2
MUTANT suite-exit-json killed exit=1 cases=74/75 fail_lines=1
MUTANT suite-exit-text killed exit=0 cases=73/75 fail_lines=1
CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=fae386aa9e0542710b7a893d84c8e92e86fc079b
```

All 16 killed, no nomatch, no crash, control PASS. Byte-identical to the committed receipt
`.ufo/waves/round-41/final/cite-mutants-final-fae386aa.txt` (same diff: no differences).

## The tip vs the measured 68db3419

`git log --oneline 68db3419..fae386aa -- scripts/cite-check.mjs` lists exactly one commit,
`5320e0da1dce4d88872a4cf241ce50670f721e33` ("cite-check self-observation guard (no recursion on a
changed literal), re-pin"), and `git diff 68db3419 fae386aa -- scripts/cite-check.mjs` is that
guard change alone (10 lines: `process.env[INJECT41] === '1'` became
`process.env[INJECT41] !== undefined` with `=== '1'` kept only for the injected failure). The tip
counter run and a counter run at `68db3419` (run in the same clone, same probe bytes) differ in
nothing but the `rev=` field: `diff` of the two outputs modulo `rev=` reports no differences. So
the guard change moved no mutant from survived to killed and none the other way — the "after"
number is the same at `68db3419` and at the tip, and the stated tip value holds.

## SKIP count in the tip selftest

`node scripts/cite-check.mjs --selftest` at the tip: exit 0, `75/75 cases passed (hermetic)`,
`VERDICT: PASS`. Case-line census: 75 `PASS ` lines, 0 `FAIL ` lines, **0 `SKIP` lines**.
`grep -c 'SKIP'` over the whole output is 0. The tip run spawns no injected child of its own, so
the two self-observation cases run and pass; the SKIP text appears only inside a child.

Two related readings, for the record (both outside the 16, both consistent with the lesson's open
limits):

- `KUMITATE_CITE_SELFTEST_INJECT_FAIL=2 node scripts/cite-check.mjs --selftest` at the tip: exit 0,
  `73/73 cases passed (hermetic)`, `VERDICT: PASS`, 2 `SKIP` lines
  ("SKIP (inside the injected child)"). A changed literal no longer recurses — matches the lesson.
- `KUMITATE_CITE_SELFTEST_INJECT_FAIL=1 node scripts/cite-check.mjs --selftest` at the tip: exit 1,
  `73/74 cases passed (hermetic)`, `VERDICT: FAIL`, 2 `SKIP` lines, 1 `FAIL ` line
  ("injected failing case (child run only)").
- A mutant that makes the guard unconditional (`if (process.env[INJECT41] !== undefined)` ->
  `if (true)`, `scripts/cite-check.mjs:2459`, one occurrence) reads `73/73 cases passed (hermetic)`,
  `VERDICT: PASS`, exit 0 with 2 `SKIP` lines — so it survives the frozen counter, which does not
  treat a `SKIP` line as a kill. This reproduces the open limit already recorded in
  `corpus/lessons/round-41.md`; it is not a new defect and no claim changes.

## Risks and blockers

- None blocking. The counter is deterministic here (three runs of the tip case gave the same
  output), the probe bytes are frozen since `cb2d8d0`, and the before/after values match the
  committed receipts byte for byte.
- The after value is the same at `68db3419` and at the tip, so the SCORECARD's "at 68db3419 and
  4e58bb0e" phrasing and the tip value are mutually consistent; no SCORECARD or lesson edit is
  needed from this seat.
- The `SKIP` blind spot above stays outside C1's 16 and stays recorded as an open limit.

Files changed: none in the lane (this report only). No patch is produced. The lane working tree
was not touched, no git index, no refs, no commits, no push.
