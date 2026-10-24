# RevChecklist23 — round 51 wave 2 (reviewer, leaf)

Seat `kumitate-r51.TastelessWasp`. Scope: checklist item 23 (`SKILL.md:709`) is executed
by `scripts/surface-probe.mjs --checklists`, not counted-but-skipped; and the H1 harm
floor ("item-level ≥ round-open 22/22, exit 0", `plan.md:128-130`).

Environment at measurement: lane tip `3304a56db425ea9c7cd496b426876aaedbce3949`
(`round-51: w2 dispatch evidence`); working tree had `M plan.md`, `M corpus/QUALITY.md`,
`M corpus/knowledge/invocation-attestation.md` (body-only, see F6); `node v24.21.0`;
`surface-probe.mjs` sha256 `79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35`;
`SKILL.md` sha256 `5e606902670d784d6c3628a3499aefa2e80a6e5717591f4383da8732b0b9259c`;
`receipt-attest.mjs` sha256 `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`
(matches the L1 pin in the assignment). All mutation fixtures live under
`/tmp/mktemp-checklist23.*`; no runnable file was created under the lane tree. Tool
installs/updates: none.

---

## F1 (HIGH) — H1 is RED at the tip: `--checklists` reads `22/23`, exit 1

The full checklist was run once at the tip. Item 12 (Sources-registry gate) fails; every
other item, including new item 23, passes.

```
$ node scripts/surface-probe.mjs --checklists ; echo EXIT=$?
...
CHECKLIST  PASS SKILL.md:697 exit=0 expected=0 substring=hit wall=0.017 load1=1.92 — Kimi-substrate census
CHECKLIST  FAIL SKILL.md:698 exit=1 expected=0 substring=miss wall=0.022 load1=1.92 — Sources-registry gate
  | SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/invocation-attestation.md:1  non-legacy knowledge file lacks source: header
  | SOURCES  info  LEGACY_NO_HEADER  count=38
  | SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)
CHECKLIST  PASS SKILL.md:699 exit=0 expected=0 substring=hit wall=2.498 load1=1.92 — Sources-check hermetic suite
...
CHECKLIST  PASS SKILL.md:709 exit=0 expected=0 substring=hit wall=1.531 load1=9.63 — Receipt-attest hermetic suite (round 51; ...)
CHECKLIST_SKIPPED: 0
CHECKLIST: 22/23 pass
VERDICT: FAIL
EXIT=1
Wall time: 88.86 seconds
```

The failure is commit state, not a working-tree edit and not the scheduled A2/receipt-3
gap. Extracted the committed tree and pointed the gate at it:

```
$ git archive 3304a56db425ea9c7cd496b426876aaedbce3949 | tar -x -C /tmp/mktemp-head.XXXXXX
$ node /tmp/mktemp-head.XXXXXX/scripts/sources-check.mjs --self /tmp/mktemp-head.XXXXXX ; echo EXIT=$?
SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/invocation-attestation.md:1  non-legacy knowledge file lacks source: header
SOURCES  info  LEGACY_NO_HEADER  count=38
SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)
EXIT=1
```

Contrast with the round-open base (`plan.md:128-130` freezes 22/22, exit 0;
`.ufo/waves/round-51/base/baseline-gates.txt:4-31` records `CHECKLIST: 22/22 pass`,
`VERDICT: PASS`, `exit=0`). Same extraction at `c90b9de9`:

```
$ git archive c90b9de94009b938fa19a089bfaa97df20b54f86 | tar -x -C /tmp/mktemp-base.XXXXXX
$ ls /tmp/mktemp-base.XXXXXX/corpus/knowledge/invocation-attestation.md
ls: cannot access '...': No such file or directory
$ node /tmp/mktemp-base.XXXXXX/scripts/sources-check.mjs --self /tmp/mktemp-base.XXXXXX ; echo EXIT=$?
SOURCES  info  LEGACY_NO_HEADER  count=38
SOURCES_CHECK: CLEAN (rows=99 tiers=A:85,B:6,C:8 status=queued:12,mined:71,rejected:16 entries_with_source=7 legacy=38)
EXIT=0
```

Root cause is mechanical: `scripts/sources-check.mjs:359` requires
`lines[0].startsWith('source:')`. The integrated entry begins with its H1 title, and
`source:` is line 3 (`corpus/knowledge/invocation-attestation.md:1-3`, same bytes at HEAD
`a476977` and in the working tree). The gate `continue`s at `sources-check.mjs:360-366`,
so `USED_BY_ASYMMETRY` is not even reached for S100/S101.

Introduced by integration commit `a476977` (`round-51: C1/C2 integration — ... S100/S101
rows, invocation-attestation entry ...`), which is in the lane history before the
assignment's measured tip `7d88faa7` and the current `3304a56`.

The trap was recorded in wave 1 before integration: `.ufo/waves/round-51/w1/ScribeLesson.md:100`
("a title-first entry fails D4 with `ENTRY_HEADER_REQUIRED` —
`scripts/sources-check.mjs:359` requires `lines[0].startsWith('source:')`") and `:99` gives
the passing shape ("`source:` line 1, `verified-at:` line 2, `recheck:` line 3"). The
integration shipped the shape wave 1 had already measured as failing. Independently seen
by peers at the same tip: `.ufo/waves/round-51/w2/CritSourcesRows.md:33-35`,
`.ufo/waves/round-51/w2/ScoutCensus2.md:81-83,143`. My addition is the checklist-level
consequence: base item 12 is part of the frozen 22/22 floor, so H1's `exit 0` and the
`23/23` claim are both false at this tip, before any new item is considered.

## F2 (HIGH, same root; frozen predicate) — `DOCTRINE_HELD` reads 2/5 at both tips

The frozen counter (`plan.md:97-110`, command `:111`) was run at the assignment's tip and
at the current HEAD:

```
$ node .ufo/waves/round-51/probe/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 7d88faa733c5621da1cac174515e4a7d7d8896ea ; echo EXIT=$?
DOCTRINE51: DOCTRINE_UNMET held=2/5 checks=5 rev=7d88faa... rule=D51 | D1 MISS trio incomplete in first 5 lines | D2 MISS clauses=12 bound=5 hash-miss=0 | D3 PASS | D4 MISS exit=1 SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED) | D5 PASS
EXIT=1

$ node .ufo/waves/round-51/probe/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 3304a56db425ea9c7cd496b426876aaedbce3949 ; echo EXIT=$?
DOCTRINE51: DOCTRINE_UNMET held=2/5 checks=5 rev=3304a56... rule=D51 | D1 MISS trio incomplete in first 5 lines | D2 MISS clauses=12 bound=5 hash-miss=0 | D3 PASS | D4 MISS exit=1 SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED) | D5 PASS
EXIT=1
```

D4 is F1's gate seen through the counter. D1 and D2 are separate: the provenance trio
starts at line 3 and runs past the counter's five-line window (`source:` 3-6,
`verified-at:` 7, `recheck:` 8; window is `split('\n').slice(0,5)` at `doctrine51-probe.mjs:64`),
and only 5 of the 12 clause lines carry a `receipt:...@sha256:...` binding. Fixing F1
alone does not move this predicate to 5/5; the owner must also compact the header into
lines 1-5 and bind the remaining clause lines. I make no repair here (lane read-only).

## F3 (assigned question, no defect) — item 23 is genuinely executed

Yes. The item is run, its exit and its literal expectation are both load-bearing, and no
item was skipped in the full run.

Positive evidence from the real run (quoted in F1): `SKILL.md:709 exit=0 expected=0
substring=hit wall=1.531`, `CHECKLIST_SKIPPED: 0`. The denominator is the *ran* set, not
the parsed set: `surface-probe.mjs:1079-1082` filters `!r.skipped` before counting, and
`CHECKLIST_SKIPPED:` is printed separately (`:1094`). A skipped item would have shown
`CHECKLIST_SKIPPED: 1` and a 23rd line marked `SKIP(...)`; neither appears.

Mutation proof in scratch (item 23's line copied verbatim from `SKILL.md:709` into a
fixture `SKILL.md`, `scripts/` copied to `/tmp`):

```
control (line byte-identical to SKILL.md:709):
$ node .../scripts/surface-probe.mjs --checklists --self /tmp/mktemp-checklist23.XXXXXX/control
CHECKLIST  PASS SKILL.md:5 exit=0 expected=0 substring=hit wall=1.582 load1=9.63 — Receipt-attest hermetic suite (...)
CHECKLIST_SKIPPED: 0
CHECKLIST: 1/1 pass
VERDICT: PASS            EXIT=0

expected-substring mutation (trailing group `ATTEST_SELFTEST: PASS` -> `ATTEST_SELFTEST: PASSX`):
CHECKLIST  FAIL SKILL.md:4 exit=0 expected=0 substring=miss wall=1.514 load1=9.33 — Receipt-attest hermetic suite (...)
  | ATTEST_CASE 27 verify-resolves-the-sidecar-next-to-the-receipt: PASS
  | ATTEST_CASES: 27 passed, 0 failed
  | ATTEST_SELFTEST: PASS
CHECKLIST_SKIPPED: 0
CHECKLIST: 0/1 pass
VERDICT: FAIL            EXIT=1

exit mutation (`→ exit 0` -> `→ exit 1`):
CHECKLIST  FAIL SKILL.md:5 exit=0 expected=1 substring=hit wall=1.533 load1=9.66 — Receipt-attest hermetic suite (...)
CHECKLIST: 0/1 pass      VERDICT: FAIL   EXIT=1
```

The trailing-group mutation is the one that answers the question: the selftest still
printed `ATTEST_SELFTEST: PASS` and exited 0, yet the item failed exactly because the
declared literal no longer matched. The check evaluates item 23's expectation; it does
not merely count the line.

Target identity, run directly:

```
$ node scripts/receipt-attest.mjs --selftest | tail -3 ; echo EXIT=${PIPESTATUS[0]}
ATTEST_CASE 27 verify-resolves-the-sidecar-next-to-the-receipt: PASS
ATTEST_CASES: 27 passed, 0 failed
ATTEST_SELFTEST: PASS
EXIT=0
```

One mutation caveat, not a defect: editing the *label's* backticked copy of
`ATTEST_SELFTEST: PASS` leaves the item PASSing, because the grammar
(`surface-probe.mjs:278`) takes the expectation only from the line-final backticked group.
A scanner that greps the label instead of the trailing group would misread the item's
contract; the probe itself does not.

## F4 (LOW) — the check is substring-in-output, not "final line"

The item label asserts "the final line is `ATTEST_SELFTEST: PASS`"; the mechanism is
`exitOk && output.includes(expect)` (`surface-probe.mjs:1067-1069`). A fixture command that
prints the marker and then a contradictory verdict passes:

```
$ node .../scripts/surface-probe.mjs --checklists --self /tmp/mktemp-checklist23.XXXXXX/finalpos
CHECKLIST  PASS SKILL.md:5 exit=0 expected=0 substring=hit wall=0.014 load1=8.18 — Position-insensitive substring demo
CHECKLIST: 1/1 pass      VERDICT: PASS   EXIT=0
# fixture command: node -e 'console.log("ATTEST_SELFTEST: PASS");console.log("VERDICT: FAIL");process.exit(0)'
```

Practical exposure is bounded today only because the real instrument prints `FAIL` last and
exits 1 on any failed case (`receipt-attest.mjs:783-789`). The label overstates the gate's
guarantee; if item 23's command is ever repointed or wrapped, the weaker check is what
remains. Not a reason to change the frozen grammar now — record it so the label is not
read as a stronger invariant than the probe enforces.

## F5 (LOW) — checklist prose count is stale (23 lines, "Nineteen items")

`SKILL.md:671` still reads "Nineteen items (round 42)." and the surrounding paragraph stops
at items 18-19; the section actually holds 23 task lines (`SKILL.md:687-709`). The sentence
predates this round (`git log -S "Nineteen items (round 42)"` -> `c9a084b`, round 42), so it
is not a wave-1 regression, but item 23's addition without a prose update leaves the
checklist's own header contradicting its body, and no gate reads that prose. Both counts are
program-visible through `--checklists` (23 parsed/run) versus the paragraph (19).

## F6 (INFO) — attribution boundary

At measurement the working tree differed from HEAD in `plan.md`, `corpus/QUALITY.md`, and
`corpus/knowledge/invocation-attestation.md`; the latter's diff is body-only (`git diff` hunk
at `@@ -32,8 +32,10 @@` rewords the S101/getrandom clause). Every F1/F2 reading above was re-proved from
`git archive` of the commit, so neither depends on that uncommitted edit. That edit and any
other seat's working-tree state are outside my scope.

---

## Residual risk / verification gaps

- The full 23-item run was taken once, under load1 9.63, pinned to `SKILL.md` sha256
  `5e6069...`; the failing item's cause was re-proved from the commit alone, so it is not
  a load or working-tree artifact, but I did not re-run the suite after wave-2 edits landed.
- No LSP device is exposed in this seat's toolset. Caller/definition checks were done by
  reading the implementation sites (`surface-probe.mjs:278,977-1100,1697-1781`;
  `sources-check.mjs:355-395`), not by a semantic reference graph. Claims about "what else
  calls this" therefore rest on those sites plus the probe's own fixtures for the checklist
  grammar and fail paths, not on LSP references.
- The probe's spawn-failure path (`run.status` non-number -> FAIL, `surface-probe.mjs:1066`)
  was read, not exercised; I did not test a missing-`node` environment.
- I did not audit items other than 23 beyond their PASS lines; e.g. item 19's cap-run
  internals and item 20's mutant battery are out of this seat's scope.
- Repair shape for the owner (not applied here): start the entry with `source:`, keep
  `source:`/`verified-at:`/`recheck:` inside lines 1-5, and bind the remaining clause lines;
  then re-run item 12, the full checklist (expect `23/23`, `CHECKLIST_SKIPPED: 0`, exit 0),
  and D51 (expect `DOCTRINE_HELD held=5/5`). The passing house pattern is visible in
  `corpus/knowledge/counter-amendment-discipline.md:1-3`.
- Tool installs/updates this seat: none. No files written outside this report; every path
  cited above is absolute where the command shows it.
