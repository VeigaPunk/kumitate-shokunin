RESULT ScoutMisrootSweep rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=none files=0

# ScoutMisrootSweep — untracked fleet-root files naming kumitate round 43 or a KumitateR43 seat

Read-only sweep. Nothing moved, deleted or edited outside this report file.
Lane repo read-only; no git/jj writes anywhere. No packages installed.

## Question
List every untracked file at the fleet root `/home/vgpnk/Projects/shokunin` whose
content names kumitate round 43 or one of the KumitateR43 seats.

## Command 1 — the status call the item names
```
$ env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /home/vgpnk/Projects/shokunin status --porcelain
 M .ufo/state/chousa.report-baseline
 M .ufo/state/kagi.report-baseline
 M .ufo/state/kaidoku.report-baseline
 M .ufo/state/kake.report-baseline
 M .ufo/state/kama.report-baseline
 M .ufo/state/kengaku.report-baseline
 A .ufo/state/kotoba.report-baseline
 A .ufo/state/kotodama.report-baseline
 M .ufo/state/kumitate.report-baseline
 M .ufo/state/mado.report-baseline
 M .ufo/state/mori.report-baseline
 A .ufo/state/revenger.report-baseline
 M .ufo/state/tameshi.report-baseline
 M .ufo/state/tsukuroi.report-baseline
 M .ufo/watchdog.log
 A scripts/hyaku/__pycache__/append-closure.cpython-314.pyc
 A write
?? AGENTS.md
?? bm.json
?? live_s228.html
?? nama.html
?? s395.txt
?? scripts/hyaku/__pycache__/wave-live.cpython-314.pyc
?? tf_bavelas.html
```
Seven untracked paths (`??`). `git status --porcelain -uall` returned the identical
seven, so no untracked directory hides further untracked files.

## Command 2 — content scan (binary-safe, case-insensitive)
```
$ strings -a <file> | grep -icE 'kumitate|KumitateR43|round[- ]?43|R43'
AGENTS.md                                             hits=0
bm.json                                               hits=0
live_s228.html                                        hits=0
nama.html                                             hits=0
s395.txt                                              hits=0
tf_bavelas.html                                       hits=0
scripts/hyaku/__pycache__/wave-live.cpython-314.pyc   hits=0
write                                                 hits=0
```
Seat-name scan (ScoutMisrootSweep, MutKimiFloor, MutCensusWitness, MutGateIsolation,
SentinelWitnessGaming, SentinelReaper, CritCalibration, CritA1Addendum, CritNoHarm2,
CritJunkAtM, CritC1Claim, CritPrimaryOnly, ReRunDiscriminators, ReRunC1Counter,
ReRunGateSelftest, ReviewCensusWitness, ReviewKimiFloor, ReviewCiteWitness,
ReviewD5Retraction, ReRunR11, ReopenS048, ReviewLesson43, ReviewQuality,
ScoutWaveCensusR43) over the same eight files: no match (grep exit 1 on the
first sweep, zero counts on the second).
UTF-16LE transcode probe on the five text/HTML files: 0 hits.

## Observed file heads (what these untracked files actually are)
- `AGENTS.md` 5921 B, mtime 15:12 — fleet-root agent contract ("Fleet root for the **shokunin** (職人) protocol …"). No lane or round reference; predates round 43.
- `bm.json` 5563 B and `tf_bavelas.html` 5583 B, mtime 12:45/18:28 — saved Cloudflare challenge pages (`<title>Just a moment...</title>`).
- `live_s228.html` 5196 B, mtime 12:45 — saved Anubis challenge page (`anubis_version "v1.26.2"`).
- `nama.html` 68855 B, mtime 14:24 — `Page not found - National Archaeological Museum` (namuseum.gr 404).
- `s395.txt` 0 B, mtime 19:12 — empty (`od -c` prints only `0000000`).
- `scripts/hyaku/__pycache__/wave-live.cpython-314.pyc` 10708 B — bytecode of `scripts/hyaku/wave-live.py` (`Usage: python3 wave-live.py SESSION_DIR`).

## Adjacent, outside the asked set (reported, not counted)
- `A write` (staged, 25 B): content is exactly `agent://U100N079H334f935b`. A stray dump of an internal agent URI into a file literally named `write` at the fleet root; names no lane or round.
- Empty directories created inside the round-43 open window: `dir/` and `scratch/`, both `mtime=2026-10-22 19:11:33.171174630` (identical second), zero entries. `round-43/plan.md` mtime is 19:11:29 and `round-43/open` 19:11:46, so these two directories were made in that window; being empty they carry no naming content and cannot satisfy the criterion. `s395.txt` (19:12, empty) sits in the same window.
- `bash: ` directory (name ends in a space, mtime 2026-10-18) holding eight mis-created directories/files from a souji-shokunin command (`bash: /home/.../souji-verify.sh: No such file or directory`). Pre-round-43, other lane.
- `M .ufo/watchdog.log` does name round 43 — line 771 `2026-10-22T19:03:39-03:00 launch kumitate round=43 pgid=3360354 driver=hyaku-inline attempt=1` (54 round-43/token hits total). Tracked driver log, not untracked and not a misroot.
- Fleet-root `.scratch/` is tracked (12 files, all clean, no untracked entries) — it holds no round-43 spill.

## Verdict
Observed: zero untracked fleet-root files name kumitate round 43 or any KumitateR43 seat.
Static literals and challenge-page HTML only; the seven untracked root files are four scraped
web pages (two unopened bot challenges, one 404), one fleet contract doc, one empty file and one
Python bytecode cache. Confidence high for the enumerated set: the scan is exhaustive over every
path git reports as untracked with `-uall`, binary-safe, case-insensitive and encoding-probed.

## Remaining unknowns
- Scope boundary: files inside the gitignored nested `*-shokunin/` repositories and inside
  ignored subtrees were not scanned (they are separate repos, not fleet-root untracked files).
- `bm.json`, `tf_bavelas.html` and `live_s228.html` are bot-challenge pages and were not opened
  behind the challenge (sourcing rule); their intended target site is not recoverable from the
  saved bytes beyond what is quoted above.
- The two empty directories at 19:11:33 show that some round-43-window command ran with the
  fleet root as its working directory, but an empty directory cannot carry a name, so no owner
  can be attributed from content; attribution would need a process log beyond this item.
