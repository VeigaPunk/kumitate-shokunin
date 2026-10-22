RESULT ScribeLessonA2 rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=drafted lines=11

`lines=11` counts the lines of the drafted paragraph below (limit: under 12). The paragraph is a
draft for the L1 to insert as the last bullet of `## Round shape and the §3 floor` in
`corpus/lessons/round-41.md`; I did not edit the lesson. Nothing else in the lane was written.

## Draft paragraph (11 lines, paste-ready)

```markdown
- **Attempt 2.** Attempt 1 ended in an omp process restart at 17:26Z; the attempt-2 base is
  `fae386aa`. The 34-seat falsify wave left 27 reports; `wave-census --round 41` names the 7
  seats that left none — ReviewC1Hermetic, CritCensusAdversarial, ReviewR40Dispositions,
  ReviewHonestReMeasure, CritAnchorCapsOpen, ReviewLesson, ReviewSeatGateRecord — dead and not
  replaced. One more report was misrooted at the fleet root (`ReviewCensusCode.md`); it was moved
  byte-exact into the lane at 17:45Z (sha256 `778a35ee…3983`, `cmp` equal) and the fleet copy
  deleted. The attempt-2 L1 committed the attempt-1 leftovers in `fae386aa` — three untested
  `wave-census` repairs, the S018 re-open, wording fixes, 8 falsify reports — and pinned each
  repair with one selftest case (WC21–WC23, 23/23). The attempt-2 verify wave dispatched 38 seats
  as one batched call at 18:12:38Z, carrying the §3 floor's roles; reports returned `<n>` of 38,
  seats with no report `<n>`.
```

## Seat outcome placeholders for the L1

Verify wave, 38 payload seats, roles read from `.ufo/waves/round-41/verify-dispatch.json`:

| role | seats | reports returned | no report |
|---|---|---|---|
| reviewer | 11 | `<n>` | `<n>` |
| executor | 7 | `<n>` | `<n>` |
| critic | 7 | `<n>` | `<n>` |
| mutation-tester | 6 | `<n>` | `<n>` |
| scribe | 3 | `<n>` | `<n>` |
| scout | 2 | `<n>` | `<n>` |
| connector | 1 | `<n>` | `<n>` |
| sentinel | 1 | `<n>` | `<n>` |
| **total** | **38** | `<n>` | `<n>` |

## Evidence

All commands ran in a scratch clone at
`/fast/scratch/hyaku/kumitate-r41a2/seats/ScribeLessonA2/lane`, detached at `fae386aa`. The lane
repo itself was only read; no jj, git index, ref or fleet-root write was made by this seat. No
tool was installed or updated.

```
$ git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin <clone> && git -C <clone> checkout -q --detach fae386aa9e0542710b7a893d84c8e92e86fc079b
$ git -C <clone> rev-parse HEAD
fae386aa9e0542710b7a893d84c8e92e86fc079b

$ node scripts/wave-census.mjs --round 41
WAVE round=41 wave=build schema=ufo-swarm-wave-dispatch-v1 seats=34 attack=19 reports=0/34 roles: reviewer=9 scout=8 critic=7 executor=4 mutation-tester=3 scribe=2 connector=1
WAVE round=41 wave=falsify schema=ufo-swarm-wave-dispatch-v1 seats=34 attack=29 reports=27/34 roles: critic=16 reviewer=13 scout=4 connector=1
  absent: ReviewC1Hermetic CritCensusAdversarial ReviewR40Dispositions ReviewHonestReMeasure CritAnchorCapsOpen ReviewLesson ReviewSeatGateRecord
ROUND round=41 waves=2 seats=68 attack=48 reports=27/68
WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)
```

The 7 names above are the census's own `absent:` list at `fae386aa`; `ReviewCensusCode` is not
in it, so the moved report reads present.

```
$ sha256sum .ufo/waves/round-41/falsify/ReviewCensusCode.md
778a35eec329296893fc9ed5ac6be0c9dbe40df3901132607bbfb93e1b2f3983
```

The lesson's `## Mistakes` row for the misroot records the same digest as `778a35ee…3983` and the
move time as 17:45Z with `cmp` equal; the fleet copy
`/home/vgpnk/Projects/shokunin/.ufo/waves/round-41/` no longer exists (checked: `ls` reports no
such directory).

```
$ git -C <clone> log --oneline -1 fae386aa
fae386a round-41: attempt 2 - inherited attempt-1 leftovers committed (wave-census .. path, string agent and read-error repairs; S018 re-open; SKILL, README and lesson wording; 8 falsify reports) plus WC21-WC23 pinning them (23/23, 3/3 revert mutants killed); misrooted ReviewCensusCode.md moved in; Mistakes rows

$ git -C <clone> diff --name-status 5320e0d fae386aa -- .ufo/waves/round-41/falsify/
A  CritC1SetWidth.md  A  ReProbeC1.md  A  ReRecountC2.md  A  ReviewCensusCode.md  A  ReviewCitePin.md  A  ReviewR403Receipt.md  A  ReviewRegistryRow.md  A  ReviewS038.md  A  ScoutOmpSpawnFailure.md
```

Nine reports added; the 8 new falsify reports are all but `ReviewCensusCode.md`, the moved
misrooted one.

```
$ git -C <clone> diff 5320e0d fae386aa -- corpus/SOURCES.md | grep -E "^[+-]\| S018" | awk -F'|' '{print $9}'
 queued
 mined

$ cat .ufo/waves/round-41/final/a2-census-repair-mutants.txt
CONTROL exit=0 WAVE_CENSUS_SELFTEST: 23/23 pass VERDICT: PASS
MUTANT dotdot-guard-dropped killed exit=1 failing=FAIL  WC21 a Report: path with a `..` segment is absent, never resolved outside the round
MUTANT string-agent-check-dropped killed exit=1 failing=FAIL  WC22 a task without a string agent fails closed (exit 2), never counted
MUTANT read-error-rethrown killed exit=1 failing=FAIL  WC23 a read error outside FailClosed (report dir is a regular file) exits 2, not 1
```

Attempt-2 timeline, from the lane working copy's `.ufo/waves/round-41/evidence-seat-gate.txt`
(2686 B uncommitted; the committed copy at `fae386aa` is 1514 B and stops at the attempt-1
falsify dispatch):

```
Attempt 2 (L1 KumitateR41a2; attempt 1 died in the omp process restart at 17:26Z; its 7 falsify seats without a report are dead and not replaced: ReviewC1Hermetic, CritCensusAdversarial, ReviewR40Dispositions, ReviewHonestReMeasure, CritAnchorCapsOpen, ReviewLesson, ReviewSeatGateRecord; ReviewCensusCode's report was misrooted at the fleet root and moved in).
r41-a2-verify (38 seats: reviewer 11, executor 7, critic 7, mutation-tester 6, scribe 3, scout 2, connector 1, sentinel 1; .ufo/waves/round-41/verify-spec.json validated exit 0 under policy v1, verify-dispatch.json counts spawn=38): wave-slot.sh acquire kumitate kumitate-r41-a2-verify 38 3600 started 17:49:51Z ... printed granted lane=kumitate wave=kumitate-r41-a2-verify seats=38 live=46 pending=0 cap=85, exit 0, job ended 18:12:33Z. Dispatched at 18:12:38Z as ONE task call from the L1's eval kernel (tool.task) ... Result: "Spawned 38 background agents using executor, mutation-tester, reviewer, critic, scout, connector, sentinel, scribe."
```

The seat-gate record and the census name the same 7 dead seats in the same order; the census is
the instrument-derived source, the seat-gate record the L1's prose.

Verify payload and census, from the lane working copy (the verify payload is uncommitted at
`fae386aa`), copied into the scratch clone before the census ran:

```
$ node -e 'const p=JSON.parse(require("fs").readFileSync(".ufo/waves/round-41/verify-dispatch.json","utf8"));const t=p.taskCall.tasks;console.log(p.schema);console.log("tasks:",t.length);const r={};for(const x of t)r[x.agent]=(r[x.agent]||0)+1;console.log(JSON.stringify(r))'
ufo-swarm-wave-dispatch-v1
tasks: 38
{"executor":7,"mutation-tester":6,"reviewer":11,"critic":7,"scout":2,"connector":1,"sentinel":1,"scribe":3}

$ node scripts/wave-census.mjs --round 41
WAVE round=41 wave=verify schema=ufo-swarm-wave-dispatch-v1 seats=38 attack=24 reports=0/38 roles: reviewer=11 critic=7 executor=7 mutation-tester=6 scribe=3 scout=2 connector=1 sentinel=1
ROUND round=41 waves=3 seats=106 attack=72 reports=27/106
```

`reports=0/38` there is the count at the moment of that run, before the wave's seats wrote; the
paragraph leaves the outcome as `<n>` placeholders for the L1, as asked.

## Limits and findings

- The paragraph states what the census and the seat-gate record show. It does not claim the §3
  floor was met: the verify payload carries executor 7, scribe 3, scout 2, connector 1, reviewer
  11 and critic 7 in one batched call, which is the floor's shape at the payload level, but the
  floor asks for returned seats, and those counts are `<n>`.
- The 18:12:38Z dispatch time and the 17:26Z restart are the L1's seat-gate prose, uncommitted at
  `fae386aa`; the census confirms the 7 names and the 38-seat payload but not the clock times.
- The lesson's existing `## Round shape and the §3 floor` still says "executor 0 of 3 and scribe
  0 of 1 for the whole round". With attempt 2's verify wave dispatched, that sentence needs the
  L1's outcome counts before it stays true; it is outside my scoped draft and I did not change it.
- Out of scope for me and not done: the lesson edit itself, the SCORECARD round-41 rows, the
  `corpus/README.md` row for the round-41 closure file, and any re-measure of C1 or C2.
