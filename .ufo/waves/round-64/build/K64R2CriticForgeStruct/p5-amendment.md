# P5 of `probe/receipt64-probe.mjs` — measured holes, and the amendment for round 65

Seat `K64R2CriticForgeStruct`, round 64 wave 2. The probe is **frozen** (`.ufo/pins/counter-pins.json`); nothing
here is applied this round. The tool-side patch (`report-receipt-diff-v3.patch.md`) closes the first hole without
touching the probe, because P5 runs whatever tool the measured revision archives.

## What P5 checks today

```js
const r = run(tool, ['--lane', lane, '--round', '64', '--report', resolve(rep), '--rev', rev, '--fleet', FLEET]);
check('P5', r.status === 0 && r.stdout.startsWith('REPORT_RECEIPT: CLEAN'), ...);
```

Two properties are absent:

1. **The file is not bound to the round's report.** `resolve(rep)` is the caller's path; nothing requires
   `<lane>/.ufo/reports/round-64/kumitate.md`, nothing requires the bytes to be committed, and nothing compares
   them with a blob. Any file the seat chooses is graded.
2. **CLEAN is as weak as the tool's arms.** A report whose six headings have empty bodies, whose SHONEN block is
   four bare `[ ]` boxes, and which carries no citation, no sources record, no trend verdicts and no stale-lane
   line reads CLEAN today.

## Measured (not inferred)

A 174-byte report — six headings, five empty bodies, four bare `[ ]` boxes — handed to the frozen counter:

```
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> 2ed8a5f8… --report /tmp/kumitate-r64/K64R2CriticForgeStruct/hollow.md
RECEIPT64_HELD held=5/5 checks=5 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=R64
exit=0
```

(`build/K64R2CriticForgeStruct/evidence.txt`; the same run with round-63's report in the `--report` slot reads
`RECEIPT64_UNMET held=4/5 … P5 MISS exit=1 REPORT_RECEIPT: DRIFT TALLY_UNRECEIPTED`.)

With the v3 arms in the tool, the same command reads
`REPORT_RECEIPT: DRIFT SECTION_EMPTY,SHONEN_NO_POINTER,SHONEN_UNASSERTED,CITE_ABSENT,SOURCES_UNRECORDED,TREND_MISSING,STALE_LANE_UNNAMED,LOG_UNNAMED`
exit 1 (`patched-tool.mjs`), so P5 would score MISS on the same forgery with no probe change.

## Residual hole the arms do **not** close

A seat can hand P5 an honest-looking 800-byte report of its own making (my `fixtures/fx-honest.md` reads CLEAN
under the patched tool) while the filed `.ufo/reports/round-64/kumitate.md` is a lie. The arms grade the bytes
they are given; only a binding can grade the filed report.

## Proposed P5 v2 (round 65, declared before any seat is scored)

```
P5 — with --report <file>: the file is the lane's round-64 report.
  (a) `git -C <lane> show <measured-rev>:.ufo/reports/round-64/kumitate.md` exists and its bytes equal <file>'s
      bytes; if the blob does not exist at <measured-rev> (the report lands last), the resolved <file> path must
      be exactly <lane>/.ufo/reports/round-64/kumitate.md and `git -C <lane> show <tip>:.ufo/reports/round-64/kumitate.md`
      must exist and equal it; and
  (b) the tool run with `--round 64 --rev <measured>` over that file reads CLEAN (exit 0).
```

Rationale for the fallback in (a): the plan's own ordering says the report lands after the measured revision, so
a blob at the measured rev cannot be required in-round; the path binding plus the tip blob is the cheapest
form that still grades the filed report rather than a seat's draft. Cost: two `git` calls and one `cmp`.

## Also measured while running P3 (host state, reported not patched)

`P3` read `fleet-blob-unreadable` on a re-run at 20:5x because the fleet root's git directory is no longer
reachable: `git -C /home/vgpnk/Projects/shokunin rev-parse --show-toplevel` now prints `/home/vgpnk`, and
`7b0581ed` / `8fd46e61` resolve in neither `/home/vgpnk` nor the lane. The same probe read `held=5/5` earlier in
this session and the same `git show` calls returned the 24 report blobs, so the objects were reachable then.
`P3` pins two abbreviated fleet hashes and resolves `--fleet` by upward search with no pin of its own; a counter
that depends on ambient repository state inherits that state's failures. Suggested for round 65: pin the two
report blobs by sha256 in `.ufo/pins/` (or carry their bytes in `base/`) so P3 grades bytes, not a repo.
