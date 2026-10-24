# ScoutSibling — per-surface reconnaissance

Axes: current-lane visibility; concurrent-attempt detection; source-backed, read-only evidence.

## Findings

- **Eight driver-claimed/in-flight lanes:** chousa r38, kake r45, kotoba r64, kotodama r65, **kumitate r52**, mori r39, revenger r64, tsukuroi r36. Every current claim has `attempt=1`, `owner=inline`. These are observed claim-state facts, not independent proof that every L1 is executing at this instant.
- **No observed concurrent kumitate r52 attempt.** The complete watchdog search finds exactly one r52 marker: `2026-10-24T00:27:42-03:00 launch kumitate round=52 pgid=2066817 driver=hyaku-inline attempt=1` (line 1111). The inline event log likewise has one r52 launch at attempt 1 (line 1261). No r52 completion, `lane-dead-no-report`, or attempt >1 appears in those searches; no later kumitate round marker was found.
- **Expected driver report:** `/home/vgpnk/Projects/shokunin/.ufo/reports/round-52/kumitate.md` (fleet-relative `.ufo/reports/round-52/kumitate.md`). It was **absent** from the shared round-52 directory listing, which contained only `kotoba.md` and `kotodama.md`, both approximately one day old. They are sibling-lane reports, not another kumitate attempt. No lane-local sibling `*/.ufo/reports/round-52` surface matched the requested glob.
- The kumitate wave-root listing showed the current `w1/`, `w1-{registry,assignments,taskcall,validate,spec}.json`, `base/`, `probe/`, and `plan.md`; no second wave/attempt directory appeared in that listing. This is directory evidence only, not an audit of all wave contents.
- **Do not interpret legacy `.ufo/state/*.round` or logged pgids as live-session truth:** `kumitate.round` still contains `18` and its state files were listed as approximately one week old, while `kumitate.report-baseline` contains round `52`. The inline driver uses `$HOME/.local/state/shokunin-hyaku/claims/` and logs its own short-lived `$$` as `pgid`; a read-only `ps` of recent launch-marker IDs returned no processes. This does not establish that the in-session lanes are dead.
- Historical kumitate retries/dead markers **do** exist for earlier rounds (41, 45, 48, 50), including the tail's `complete kumitate round=50 ... attempt=2`; none of these are round 52 evidence.

Confidence: **high** for observed file contents, claim membership, expected report path, and absence of matching markers in the inspected surfaces; **qualified** for runtime liveness. An unlogged concurrent attempt, or a state change after this non-atomic snapshot, cannot be excluded.

## Evidence — actual tool invocations and output

The specialized read/grep/glob tools were used instead of shell `tail`, `ls`, and file-search equivalents. Initial timestamp command: `date -u +%Y-%m-%dT%H:%M:%SZ` → `2026-10-24T04:03:31Z`; another snapshot timestamp → `2026-10-24T04:04:10Z`.

### Watchdog, exact last 30 lines

Invocation: `read(path="/home/vgpnk/Projects/shokunin/.ufo/watchdog.log:-30:raw")`

```text
2026-10-23T20:41:36-03:00 launch tsukuroi round=36 pgid=3491994 driver=hyaku-inline attempt=1
2026-10-23T20:41:38-03:00 launch tabi round=22 pgid=3500528 driver=hyaku-inline attempt=1
2026-10-23T20:41:39-03:00 launch souji round=22 pgid=3505869 driver=hyaku-inline attempt=1
2026-10-23T20:41:45-03:00 launch kagi round=28 pgid=3507413 driver=hyaku-inline attempt=1
2026-10-23T20:41:47-03:00 launch kasegi round=23 pgid=3508145 driver=hyaku-inline attempt=1
2026-10-23T22:23:30-03:00 complete kumitate round=50; hyaku-inline attempt=2
2026-10-23T22:40:27-03:00 launch kotodama round=64 pgid=10242 driver=hyaku-inline attempt=1
2026-10-23T22:40:29-03:00 launch kotoba round=63 pgid=10629 driver=hyaku-inline attempt=1
2026-10-23T22:40:29-03:00 launch revenger round=62 pgid=11261 driver=hyaku-inline attempt=1
2026-10-23T22:40:30-03:00 launch kumitate round=51 pgid=11602 driver=hyaku-inline attempt=1
2026-10-23T22:40:31-03:00 launch kake round=44 pgid=12119 driver=hyaku-inline attempt=1
2026-10-23T22:45:46-03:00 complete revenger round=62; hyaku-inline attempt=1
2026-10-23T22:56:27-03:00 launch revenger round=63 pgid=106795 driver=hyaku-inline attempt=1
2026-10-23T23:10:44-03:00 launch mori round=38 pgid=366448 driver=hyaku-inline attempt=1
2026-10-23T23:24:29-03:00 launch chousa round=37 pgid=907296 driver=hyaku-inline attempt=1
2026-10-23T23:24:29-03:00 launch tsukuroi round=36 pgid=908597 driver=hyaku-inline attempt=1
2026-10-23T23:43:39-03:00 complete kake round=44; hyaku-inline attempt=1
2026-10-23T23:51:35-03:00 launch kake round=45 pgid=4072003 driver=hyaku-inline attempt=1
2026-10-23T23:52:57-03:00 complete mori round=38; hyaku-inline attempt=1
2026-10-23T23:58:19-03:00 complete chousa round=37; hyaku-inline attempt=1
2026-10-24T00:02:49-03:00 launch mori round=39 pgid=1124428 driver=hyaku-inline attempt=1
2026-10-24T00:03:13-03:00 launch chousa round=38 pgid=1142033 driver=hyaku-inline attempt=1
2026-10-24T00:08:49-03:00 complete kotoba round=63; hyaku-inline attempt=1
2026-10-24T00:15:31-03:00 complete kumitate round=51; hyaku-inline attempt=1
2026-10-24T00:21:20-03:00 launch kotoba round=64 pgid=1795540 driver=hyaku-inline attempt=1
2026-10-24T00:27:42-03:00 launch kumitate round=52 pgid=2066817 driver=hyaku-inline attempt=1
2026-10-24T00:32:11-03:00 complete revenger round=63; hyaku-inline attempt=1
2026-10-24T00:41:26-03:00 launch revenger round=64 pgid=3233813 driver=hyaku-inline attempt=1
2026-10-24T00:47:04-03:00 complete kotodama round=64; hyaku-inline attempt=1
2026-10-24T00:58:45-03:00 launch kotodama round=65 pgid=1768791 driver=hyaku-inline attempt=1
```

Invocation: `grep(pattern="^.* (launch|complete|lane-dead-no-report) kumitate round=52( |;|$)", path="/home/vgpnk/Projects/shokunin/.ufo/watchdog.log", gitignore=false)`

Matching output (tool context lines omitted):
```text
1111:2026-10-24T00:27:42-03:00 launch kumitate round=52 pgid=2066817 driver=hyaku-inline attempt=1
```

Invocation: same logfile, pattern `^.* (launch|complete|lane-dead-no-report) kumitate round=(5[3-9]|[6-9][0-9]|[1-9][0-9]{2,})( |;|$)` → `No matches found`.

Invocation: `grep(pattern="lane=kumitate round=52( |$)|kumitate.*r52|kumitate.*round.?52", path="/home/vgpnk/.local/state/shokunin-hyaku/events.log", gitignore=false)`

Matching output:
```text
1261:2026-10-24T00:27:42-03:00 inline launch lane=kumitate round=52 attempt=1 model=@m_kfc
```

### State directory and active claims

Invocation: `read(path="/home/vgpnk/Projects/shokunin/.ufo/state/")`.

Relevant output excerpt:
```text
  - kotodama.report-baseline 68B 4m ago
  - revenger.report-baseline 68B 22m ago
  - kumitate.report-baseline 68B 35m ago
  - kotoba.report-baseline 68B 42m ago
  - chousa.report-baseline 68B 1h ago
  - mori.report-baseline 68B 1h ago
  - kake.report-baseline 68B 1h ago
  - tsukuroi.report-baseline 68B 1h ago
```

The complete listing also included older baselines for kasegi, kagi, souji, tabi, tameshi, mado, kaidoku, kengaku, and legacy `.out`/`.mission`/`.round` files. The requested surface has no current-attempt field.

Invocations and output:
```text
read("/home/vgpnk/Projects/shokunin/.ufo/state/kumitate.round:1-5")
1:18
read("/home/vgpnk/Projects/shokunin/.ufo/state/kumitate.report-baseline:1-5")
1:52 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

Invocation: `read(path="/home/vgpnk/.local/state/shokunin-hyaku/claims/")` → exactly these eight directories: kotodama, revenger, kumitate, kotoba, chousa, mori, kake, tsukuroi. `read(.../blocked/)` → `(empty directory)`.

Invocation: `grep(pattern=".+", path="/home/vgpnk/.local/state/shokunin-hyaku/claims/*/round;/home/vgpnk/.local/state/shokunin-hyaku/claims/*/attempt;/home/vgpnk/.local/state/shokunin-hyaku/claims/*/owner;/home/vgpnk/.local/state/shokunin-hyaku/claims/*/dispatched", gitignore=false)`, then `skip=20` to retrieve all 32 files.

Normalized output, preserving each file's value:

| Claim | round | attempt | owner | dispatched |
|---|---:|---:|---|---|
| chousa | 38 | 1 | inline | 2026-10-24T00:03:11-03:00 |
| kake | 45 | 1 | inline | 2026-10-23T23:51:34-03:00 |
| kotoba | 64 | 1 | inline | 2026-10-24T00:21:18-03:00 |
| kotodama | 65 | 1 | inline | 2026-10-24T00:58:43-03:00 |
| kumitate | 52 | 1 | inline | 2026-10-24T00:27:40-03:00 |
| mori | 39 | 1 | inline | 2026-10-24T00:02:46-03:00 |
| revenger | 64 | 1 | inline | 2026-10-24T00:41:24-03:00 |
| tsukuroi | 36 | 1 | inline | 2026-10-23T23:24:29-03:00 |

### Sibling report and wave surfaces

Invocation: `read(path="/home/vgpnk/Projects/shokunin/.ufo/reports/round-52/")`
```text
.
  - kotoba.md 12.3KB 1d ago
  - kotodama.md 12.1KB 1d ago
```

Invocation: `glob(path="/home/vgpnk/Projects/shokunin/*/.ufo/reports/round-52;/home/vgpnk/Projects/shokunin/*/.ufo/reports/round-52/*", hidden=true, gitignore=false, limit=120)` → `No files found matching pattern`.

Invocation: `read(path="/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-52/")`.

Root names in output: `w1/`, `w1-registry.json`, `w1-assignments.json`, `w1-taskcall.json`, `w1-validate.json`, `w1-spec.json`, `base/`, `probe/`, `plan.md`. At that snapshot the listed `w1/` children were `ScoutRfc3339.md` and `ExecProbeSanity.md`.

### Source evidence for interpreting the surfaces

Search preceded source-section reads. `scripts/hyaku/inline.sh`:
- Lines 2–7: in-session rounds use parent OMP `task` subagents; this script handles mechanical steps.
- Lines 17–24: `FLEET=/home/vgpnk/Projects/shokunin`; `STATE=${HYAKU_STATE:-$HOME/.local/state/shokunin-hyaku}`; sources `scripts/shokunin-watchdog.sh`.
- Lines 31, 91–96: `claim()` reads `$STATE/claims/<lane>/<field>`; dispatch stores `round`, `attempt`, `owner`, `dispatched`; redispatch of the same claim increments attempt.
- Lines 103, 108–110: launch logs `pgid=$$`; verification builds `rep=".ufo/reports/round-$n/$lane.md"` and calls `report_of`.
- Lines 135–136: failure reads the current claim and logs `lane-dead-no-report` with that attempt.
- Lines 157–169: advance removes the lane claim and records next round.

`scripts/shokunin-watchdog.sh` lines 35–47 resolve `UFO="$SHOKUNIN_ROOT/.ufo"`; `report_of` lines 144–163 constructs `$UFO/reports/round-$2/$1.md` and requires changed report content plus a SHONEN marker and the configured minimum size. These definitions and the inline caller establish the expected path; no driver was executed.

The `lsp` device is unavailable: `read("xd://lsp")` returned `No such tool: xd://lsp. Mounted devices: ast_edit, debug.` Source relationships above are textual evidence, not claimed semantic-reference results.

Additional read-only process command:
```text
ps -p 2066817,3233813,1768791,1795540,1142033,1124428,4072003,908597,3508145,3507413,3505869,3500528,2232088,2230972,2229311 -o pid=,ppid=,pgid=,lstart=,args=
(no output)
Command exited with code 1
```

## Scope and remaining gaps

No source edits, driver/orchestration invocation, git/jj mutation, verification suite, installation, or service action. The sole write is this permitted seat report. Frozen plan, probe summaries, and base receipts were read; no counter was rerun. No missing peer artifact blocked this assignment. Runtime L1 health and unlogged attempts remain outside what these snapshots can prove.
