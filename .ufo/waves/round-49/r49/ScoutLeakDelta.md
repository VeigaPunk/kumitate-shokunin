# ScoutLeakDelta — R49-5 leak-delta decomposition

Verdict: `LEAK_DELTA_DECOMPOSED`. The r48 receipt is a host-wide net of 13. It is not the owned leak of the fixed helper. On the re-measurement below the owned delta is 0 and the concurrent delta is 0. The 13 directory names were never stored, so those 13 paths cannot be attributed. The 40207 directories present now were not created by this seat and were not deleted.

Sandbox: `/fast/scratch/hyaku/kumitate-r49/seats/ScoutLeakDelta/lane`, detached at `8237be86e2dc04e90e51b66b62bdffe770196d27`, `git status --porcelain=v1` empty (0 lines). No commit. No tool installed. No `/tmp/cap-spawn.*` directory was removed.

## Decomposition (the selftest window)

| term | value |
|---|---|
| pre | 40207 |
| post | 40207 |
| delta = post − pre | 0 |
| owned created | 18 |
| owned removed by the helper's `rmSync` | 18 |
| owned remaining | 0 |
| concurrent created (inotify, not in the selftest tree) | 0 |
| concurrent remaining (in post, not owned) | 0 |
| concurrent gone (in pre, absent at post) | 0 |
| attributed (concurrent net) | 0 |

Identity, holds: `delta = owned_remaining + concurrent_remaining − concurrent_gone = 0`.

Corrected sentence (for the append-only LOG correction; the filed r48 report is not rewritten):

> The cap-spawn verdict-dir fix's owned delta is 0: `capSpawnSync` creates `/tmp/cap-spawn.<6>` and `rmSync`s it on every exit path. `r48/L1-leakfix-delta.txt` records the host-wide net `leak-delta-at-ce9aee5d=13`, which is not that owned delta; the 13 names were not kept, so they cannot be attributed per path. Re-measured 2026-10-23T19:51:00Z–19:51:03Z at freeze `8237be86`: `node scripts/surface-probe.mjs --selftest` exit 0, `ls` count 40207 before and after (delta 0), owned created 18 / remaining 0, concurrent attributed 0. The 40207 pre-existing directories (owner `vgpnk`, prefix `cap-spawn.` plus 6 alnum, pid only inside `verdict`) were left in place.

## What the r48 claim actually says

Receipt, committed in `4e4f4713a7a2d62d6ba7767b5f6e37211ba9baca` (2026-10-23T16:08:15-03:00) as a new one-line file. Observed bytes:

```
$ wc -c .ufo/waves/round-48/r48/L1-leakfix-delta.txt
26
$ od -An -tx1 .ufo/waves/round-48/r48/L1-leakfix-delta.txt
 6c 65 61 6b 2d 64 65 6c 74 61 2d 61 74 2d 63 65
 39 61 65 65 35 64 3d 31 33 0a
$ sha256sum .ufo/waves/round-48/r48/L1-leakfix-delta.txt
d1da13f7c82f3a32643e750f4f492e058a75be518a0a07e7cace8d85336c74c2
```

ASCII `leak-delta-at-ce9aee5d=13\n`. That sha256 is the line in `r48/L1-receipts.sha256`. `git log -1 -p` shows the file was added with that single line and never edited. No names, uids, mtimes, or pids were stored. Attributing those 13 directories is impossible from the receipt. That is the gap R49-5 names.

The fix those sentences point at is `ce9aee5daf71004a5890134f9526cc6fe424b206`. Commit subject: `cap-spawn verdict-dir leak fix (delta=0)`. The diff is three added lines in `scripts/cap-spawn.mjs` (the `rmSync` call plus the 12,801 comment). At the freeze the same bytes are `scripts/cap-spawn.mjs:31` (`mkdtempSync(join(tmpdir(), 'cap-spawn.'))`) and `:48-50` (`rmSync(vd, { recursive: true, force: true })` on every path after the verdict read). Directory names therefore carry no pid: Node's `mkdtemp` suffix is 6 alphanumerics. The pid lives only in the verdict line. `scripts/cap-run.mjs:182` sets `unit = cap-run-${pid}-${Date.now()}-${randomBytes(3).hex}`.

Six committed sentences say delta 0 and cite this receipt (located by ScoutCorrections, re-read here): `LOG.md:1931` ("12,801 accumulated dirs at open; quiet-host differential delta 0"), `SCORECARD.md:1757`, `SCORECARD.md:1759` ("on a quiet host"), `corpus/lessons/round-48.md:51`, fleet report `kumitate.md:10` and `:32`. The spot-check (`corpus/lessons/round-48-verifier-spotcheck.md:75`) already says the 13-vs-0 decomposition was not committed. `close/ReviewIntegration.md:79` calls 13 a residual against the 12,801-dir leak and says delta 0 holds at source level.

## Measurement

Host: uid 1000 `vgpnk`, node v24.21.0, no `TMPDIR` override (so `os.tmpdir()` is `/tmp`). Clone cwd: the sandbox lane above.

Required count, run inside the measurement immediately before and after the selftest (stdout bytes `40207\n`, exit 0 both times):

```
$ ls -d /tmp/cap-spawn.* 2>/dev/null | wc -l
40207
```

Same command, same stdout and exit 0, at 2026-10-23T19:46:08Z (first observation) and again at 2026-10-23T19:51:54Z (after the selftest). Python `os.scandir` agreed: 40207.

Required selftest, exact argv, exit 0, wall 2.273s, root pid 3304231, window 2026-10-23T19:51:00Z–19:51:03Z:

```
$ node scripts/surface-probe.mjs --selftest
kumitate surface-probe --selftest (hermetic)
…
46/46 cases passed
VERDICT: PASS
```

stderr empty (0 bytes). stdout 6404 bytes. Full copy: `/fast/scratch/hyaku/kumitate-r49/seats/ScoutLeakDelta/measure/selftest.stdout`.

Attribution during that window (inotify on `/tmp` for create/delete of `cap-spawn.*`, plus a `/proc/<pid>/task/<pid>/children` walk of pid 3304231). Inotify overflow 0. Events: 18 CREATE, 18 DELETE, 18 distinct names, and those 18 names are exactly the names seen as `--verdict-file /tmp/cap-spawn.<6>/verdict` on a `scripts/cap-run.mjs` child of the selftest. All 18 were absent at post (`owned remaining = 0`). No inotify create fell outside that tree. `pre\post` and `post\pre` were both empty. Foreign `/proc` cmdline scan during the selftest: 0 hits.

The 18 names (all created and removed; none left behind):

```
cap-spawn.47rq2L cap-spawn.7p0k1b cap-spawn.8K75tn cap-spawn.9tzpMS
cap-spawn.CGNpIn cap-spawn.KSI5Y5 cap-spawn.LuXwc8 cap-spawn.Mm7ZQG
cap-spawn.NMLfo3 cap-spawn.QANHbu cap-spawn.StD3QX cap-spawn.WMI3Vo
cap-spawn.bxkHEt cap-spawn.dFg9EO cap-spawn.hj2g91 cap-spawn.hwD3TF
cap-spawn.rykP01 cap-spawn.tyCKe9
```

One observed cmdline (pid 3308474, ppid 3304231):

```
…/node …/lane/scripts/cap-run.mjs --mem 512 --tasks 64 --budget 20 \
  --verdict-file /tmp/cap-spawn.47rq2L/verdict --bind /tmp/kumitate-surface-cache-3deiif …
```

Tail classification of the 18 (each shape twice: the outer selftest and the nested `--selftest` it spawns): `--bogus`, `--src /nonexistent/…`, `--help`, bare `--json`, bare fail-closed, and the two live readers (`readSightingSurface` cache bind, and the status spawn). 9 × 2 = 18. [INFERENCE on the pairing; the 18 names, the cap-run parent, and the create/delete counts are observed.]

Supporting single call, not the required selftest: `capSpawnSync('/usr/bin/true', …)` exit 0 in 0.522s. Inotify 1 CREATE + 1 DELETE of `cap-spawn.UVDsHy`. `ls` 40207 → 40207. The scanner also matched the token `cap-spawn.mjs` inside the `-e` source string; that is not a directory (no inotify create, suffix length 3). It is excluded from the selftest numbers above, which have no such token (18/18 suffix length 6, 18/18 in inotify).

## The 40207 that were already there

Not this seat's. Set equality: the `ls -d` listing saved at 19:46:08Z and a scandir at 19:51:54Z differ by 0 names (`only_old=0 only_new=0`). Max mtime 2026-10-23T19:17:43Z, min 2026-10-23T18:23:34Z, zero directories with mtime ≥ 19:18Z. They predate the selftest window and nothing in the window touched the set.

Census of all 40207 (read of each `verdict`, 13.19s):

- Owner: `vgpnk` (uid 1000) on all 40207. Mode `0700`. Exactly one child, `verdict`, on all 40207. So `rmSync` did not remove them: the verdict file is still there.
- Name: `^/tmp/cap-spawn\.[A-Za-z0-9]{6}$` on all 40207. No pid, no seat, no lane in the directory name.
- Pid evidence is inside the verdict. 39671 match `unit=cap-run-<pid>-<epochms>-<6 hex>` (the freeze template). 536 match `unit=cap-run-shim-<pid>-<epochms>-<hex>` instead. Freeze `cap-run.mjs:182` does not emit the `shim-` form, so those 536 come from some other unit-name producer. [OBSERVED class split; the other producer is not identified here.]
- Exit codes inside the standard verdicts: 0 × 16143, 1 × 14017, 2 × 6541, 64 × 2965, 7 × 4, 10 × 1.
- 39432 distinct pids in the standard units. At census time 39369 of those pids had no `/proc` entry and 63 did. A second pass over standard and shim pids found 105 `/proc` hits: 102 with an empty cmdline, 2 chromium renderers, 1 `timeout 300 bash -c bash "$MUTANT" --selftest`. Zero of those cmdlines was `cap-run` or `cap-spawn`. Round 48 already records that this host's pid space wraps about every 23 minutes, so a live `/proc/<pid>` is not the creator. The creators are gone.

Epoch minutes taken from the unit timestamp (not mtime) run 2026-10-23T18:23Z through 19:17Z, same span as the mtimes, with gaps at 19:01–19:02Z and 19:05–19:06Z. That is the round-49 wave window on this host, not the r48 measurement. The r48 receipt was committed at 19:08:15Z, inside a minute that has 739 of these directories, but the receipt does not say which 13, and these directories still contain their verdicts (they are leaks that were never cleaned, not a delta that was later reaped).

## What "quiet-host delta 0" can mean, and what it cannot

It can mean: a selftest whose helper is the fixed `cap-spawn.mjs`, run while nothing else creates `cap-spawn.*`, changes the directory count by 0, because every directory that selftest creates is removed before it exits. That is what this window measured (owned 18 created, 18 removed, concurrent 0, delta 0).

It cannot mean: the committed receipt's integer is 0. The receipt's integer is 13. Calling 13 "quiet-host delta 0" drops the concurrent term. The decomposition the prose skipped is `net = owned_remaining + concurrent_net`. Here both terms are 0, so net is 0. The historical 13 is an unreproduced `concurrent_net` (or a mix) from a host that was not quiet; the names that would decide the mix were not kept.

## Confidence and unknowns

- This window's pre/post/delta/owned/attributed: high. Two counters (`ls|wc` and scandir) and inotify agree; the name set did not change.
- Source of the fix and of the six "delta 0" sentences: high (committed bytes).
- Identity of the original 13 directories: unknown. Not recoverable from `L1-leakfix-delta.txt`.
- Why each of the 40207 still has its verdict file: high that `rmSync` did not run to completion on it; the split between pre-fix `cap-spawn`, a `SIGKILL` before `rmSync`, and a shim that never calls `rmSync` is not determined per directory. The 536 `cap-run-shim-` units are a separate producer from freeze `cap-run.mjs`.

Report: .ufo/waves/round-49/r49/ScoutLeakDelta.md
