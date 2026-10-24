# ScoutDeadSeats — wave-1 unfiled seats (census)

Attacked: wave-1 registry vs filed reports, plus `build/<seat>/` and `proc://` for the three seats named as having filed nothing. Census instant: `2026-10-24T02:44:27Z`. No tools installed.

## Dead-seat paragraph

Wave-1 registry `.ufo/waves/round-51/w1/swarm-registry.json` (`schema` `ufo-swarm-registry-v1`, `wave` `kumitate-r51-w1`, `createdAt` `2026-10-24T02:01:00.349Z`) has 32 members and 29 `w1/*.md` reports; the only members with no report are ExecForgerControl (`kumitate-r51.OppositeBuzzard`, executor), MutCounter (`kumitate-r51.VariableGamefowl`, mutation-tester), and ScribeEntry (`kumitate-r51.ProfoundBoar`, scribe). At `2026-10-24T02:44:27Z`, `ls` of `.ufo/waves/round-51/w1/{ExecForgerControl,MutCounter,ScribeEntry}.md` and of `.ufo/waves/round-51/build/{ExecForgerControl,MutCounter,ScribeEntry}` each exited 2 (`No such file or directory`); lane-root `build/` is also absent, and `find` under `.ufo/waves/round-51/build` matched no path containing those three seat names. The build directory that does exist holds 15 other seats (DistWave1, ExecBaseCounter, ExecInstrument, ExecPinsRecipe, ExecSelftestArms, ExecSelftestExec, LabratClocks, LabratM2Replay, MutInstrument, ScoutBaselineHar, ScoutClockSource, ScoutRandomSource, ScoutReceiptCorpora, ScribeLesson, ScribeSources) and none of these three. `proc://` shows all three still **running** (not exited): OppositeBuzzard “Reading A3d digest-binding arm”, VariableGamefowl “Checking proxy strict at current lane HEAD”, ProfoundBoar “Reading mutants report header”. No terminal (exited/completed/failed) status text is available because the tasks have not terminated; the fallback “no terminal status text available” does not apply — live status text is visible. Transcripts are still growing (`~/.omp/agent/sessions/-Projects-shokunin/2026-10-24T01-14-31-296Z_01a16b79-4200-7091-952d-63c8433af6a5/kumitate-r51/kumitate-r51.{OppositeBuzzard,VariableGamefowl,ProfoundBoar}.jsonl`, mtime `Oct 23 23:44` local) and show in-progress scratch under `/tmp`, but nothing has been filed at the assigned `w1/<Seat>.md` paths or under `build/<seat>/`. `build/DistWave1/wave2-items.md` line 8–10’s “11 of the 32 wave-1 seats filed no report” list is stale relative to this census: the other eight names on that list now have `w1/*.md` files.

## Commands and output

Registry vs reports (python3 over `swarm-registry.json` and `w1/*.md`):

```
schema ufo-swarm-registry-v1
wave kumitate-r51-w1
member_count 32
report_md_count 29
MISSING_REPORTS 3
  ExecForgerControl	kumitate-r51.OppositeBuzzard	executor	kind=spawn
  MutCounter	kumitate-r51.VariableGamefowl	mutation-tester	kind=spawn
  ScribeEntry	kumitate-r51.ProfoundBoar	scribe	kind=spawn
EXTRA_REPORTS []
```

`date -u` then `ls` (exit 2 = absent):

```
Sat 24 Oct 2026 02:44:27 AM UTC
ABSENT .../w1/ExecForgerControl.md
ls: cannot access '.../w1/ExecForgerControl.md': No such file or directory
ls_exit=2
ABSENT .../w1/MutCounter.md
ls: cannot access '.../w1/MutCounter.md': No such file or directory
ls_exit=2
ABSENT .../w1/ScribeEntry.md
ls: cannot access '.../w1/ScribeEntry.md': No such file or directory
ls_exit=2
w1 md count: 29
grep of w1 listing for the three report filenames: exit 1 (no matches)
ls .../build/ExecForgerControl → ls_exit=2
ls .../build/MutCounter → ls_exit=2
ls .../build/ScribeEntry → ls_exit=2
ls .../kumitate-shokunin/build → ls_exit=2
find under .../round-51/build for the three names → empty, find_exit=0
```

`proc://` reads immediately after that `ls` (full tool text):

```
kumitate-r51.OppositeBuzzard [task] — running — Reading A3d digest-binding arm
kumitate-r51.VariableGamefowl [task] — running — Checking proxy strict at current lane HEAD
kumitate-r51.ProfoundBoar [task] — running — Reading mutants report header
```

An earlier `proc://` listing in the same run (about a minute prior) had the same three as `running up 44m42s` with different activity strings (“Adding missing readFileSync import”, “Resolving proxy-check byte discrepancy”, “Running frozen A51 probe at HEAD”). Status text is live and moving; filing state is not.

## Confidence and gaps

- High: 32−29=3, identity of the three missing reports, absence of the three `build/<seat>/` dirs, live non-terminal proc status at the census instant.
- Not claimed: that the processes will stay unfiled. They were still running when observed. A later write of `w1/<Seat>.md` or `build/<seat>/` would supersede this census.
- Not claimed: contents of `/tmp` scratch trees (seen only as tool paths inside the three transcripts, not re-listed here).
- `lsp` not used: this census is filesystem and process-table evidence, not a symbol contract.
