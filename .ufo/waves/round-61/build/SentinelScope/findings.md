# SentinelScope — write-scope findings, kumitate round 61 / wave w1

Wave window: 2026-10-25T06:39:08 -03:00 (lane HEAD `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`,
the L1 freeze/work commit) → end of wave. This file is written mid-wave and re-stated at wave end;
each section carries its own observation timestamp.

**Verdict at 06:45 -03:00: IN SCOPE.** Every byte written inside the lane repo is attributable to a
seat's declared path. No seat touched the fleet repo, a sibling lane, the campaign tree, `.ufo/state/`,
`.scratch/`, `templates/`, fleet `scripts/`, or `MANIFEST.json`. One state-mutation finding (jj
auto-snapshot, F1) and four low/informational findings are recorded below; none is a content breach.

## 1. Method and baseline

Baseline taken at 06:40:55, before any seat had written a byte (the wave directory then held only
`w1/swarm-registry.json`):

```
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin status --porcelain
?? .ufo/waves/round-61/w1/
```

So the wave-window delta is exact: anything new or modified after that line was produced by a seat
or by the L1. Every path in the delta was matched against the seat's dispatched `# Target` text in
`.ufo/waves/round-61/w1-dispatch.json` and against the 32 names in `w1/swarm-registry.json`.

## 2. Lane-repo delta and attribution (06:45)

Tracked modifications — 3, all declared:

| path | seat | declared at |
|---|---|---|
| `corpus/README.md` | ExecReadmeMapFix | step 1 ("Add the map row … to corpus/README.md") |
| `.ufo/pins/readme-map.json` | ExecReadmeMapFix | step 2 ("Add it to the `covered` set") |
| `.ufo/pins/source-captures.json` | **L1 integrator** | L1 transcript `edit(… PUT 185.=185: + "sourceId": "S195" …)`; pin `8ef2ee5f…` / 9645 B equals the real `sha256sum` of `build/ScoutSourceWorkerVersioning/body.md` |
| `corpus/QUALITY.md` | ExecQualCriterion | "append … Q52-Q55 to corpus/QUALITY.md (append-only)" |
| `corpus/SOURCES.md` (+1 row, 2 blanks) | **L1 integrator** (not a seat) | L1 transcript: `edit(*** Begin Patch [corpus/SOURCES.md#F50E] PUT >146: +| S195 …)`. ScribeSourcesRows was told *not* to append and its `build/ScribeSourcesRows/row-S195.txt` is the draft only. |
| `corpus/knowledge/temporal-worker-versioning-pinning.md` (new) | **L1 integrator** | L1 transcript `write(…/corpus/knowledge/temporal-worker-versioning-pinning.md)`; C2 E1. Provenance checks out independently: `sha256sum` of `build/ScoutSourceWorkerVersioning/body.md` = `8ef2ee5f…f8fc`, 9645 bytes, identical to the pin in the S195 row. |

`corpus/README.md` is now +2 (ExecReadmeMapFix's R60-V8 row and the L1's C2 map row).

Diff shape matches the declarations: the pin registry is +1 line
(`lessons/round-60-verifier-spotcheck.md`), `QUALITY.md` is +28 lines appended after Q51 and nothing
above line 906 is touched, `SOURCES.md` is +3 lines (one S195 row, two blank separators) appended
after S194 with no existing row edited. Pin registry stays `version: 2`, `covered` 146 entries;
`node scripts/readme-map.mjs` read `README_MAP: CLEAN files=146 rows=146 covered=146` (exit 0) at
06:42, before the L1's C2 map row landed — the L1 must re-run it after that row.

Untracked, all declared:

| path | seat | declared at |
|---|---|---|
| `.ufo/waves/round-61/build/<Seat>/…` (17 dirs, all 32-seat names) | the named seat | each seat's build/ findings path |
| `.ufo/waves/round-61/w1/<Seat>.md` (21 files, all seat names) | the named seat | "Report: write … .ufo/waves/round-61/w1/<Seat>.md" |
| `.ufo/waves/round-61/probe/counters.sh` | ExecCountersPack | explicit target path |
| `.ufo/waves/round-61/controls/ctl-c1-critic-*.txt` (8) | CritControlC1 | step 3 (explicit `controls/ctl-c1-critic-*.txt`) |
| `.ufo/waves/round-61/controls/ctl-c2-critic-*.txt` (7) | CritControlC2 | step 3 (explicit `controls/ctl-c2-critic-*.txt`) |
| `.ufo/waves/round-60/close/dead-seats-r60.md` | ExecDeadSeatTable | explicit target path |
| `scripts/make-dispatch-actual.mjs` | ExecDispatchSchemaTool | explicit target path |

No path in the delta falls outside `.ufo/waves/round-6{0,1}/`, `corpus/`, `.ufo/pins/` or `scripts/`;
no non-seat directory exists under `round-61/build/`; no symlink exists anywhere under
`round-61/` (`find … -type l` → empty), so no seat escaped its directory through a link.

## 3. Fleet root — misroot scan (06:42, re-checked 06:45)

`git -C /home/vgpnk/Projects/shokunin status --porcelain -uall`: 6 untracked files, 17 tracked
modifications. Filtering untracked entries for `kumitate|round-61|r61` in path → **NONE**. First
lines of all six:

- `.omp/mcp.json` — `{"$schema": "https://raw.githubusercontent.com/can1357/oh-my-pi/…` (credential
  config; content not copied further), mtime 2026-10-24 18:07.
- `.scratch/goal-20261025-hyaku-12h.md` — `<!-- ORCHESTRATOR-OWNED run state (hyaku run 6). Not a
  misroot: … -->`, mtime 06:19:57. It names `kumitate` once, at L63, inside the orchestrator's
  next-block schedule. Pre-existing operator file, **not** a round-61 artifact.
- `.ufo/state/{kotoba,kotodama,revenger}.report-baseline` — `NN <sha256>`, mtimes 22:45/03:23.
- `.ufo/waves/round-24/w2/RevUnlandedResolution.md` — `# RevUnlandedResolution — routed defect 2 …`,
  mtime 05:55; its `w1` hits are round-23 wave-1, not this wave.

**Misroot candidates naming this lane/round: 0.** ExecSweepMisroot reached the same result
independently (`.ufo/waves/round-61/build/ExecSweepMisroot/sweep-start.txt`), same six files, same
verdict; the two scans agree.

Tracked fleet-root modifications (`.ufo/state/*.report-baseline` ×14, `.ufo/watchdog.log`,
`scripts/hyaku/hyaku.env`, `scripts/hyaku/lane-addendum.md`) all predate the wave: newest is
`.ufo/state/kumitate.report-baseline` at 06:30:23, `scripts/hyaku/*` at 03:22/04:16. None was written
during the window (`find .ufo/state -newermt 06:39:10` → empty).

## 4. Protected paths

| protected path | state | evidence |
|---|---|---|
| fleet `MANIFEST.json` | untouched | sha256 `4af1c7e8…`, mtime 06:33:34 (pre-wave) |
| fleet `templates/` | untouched | newest file 2026-10-19; `find -newermt 06:39` empty |
| fleet `scripts/` | one file changed in window, **by the orchestrator** | `scripts/hyaku/lane-addendum.md` 06:47 (run-6 directives, 0 kumitate mentions) and `.ufo/watchdog.log` — see F10; `hyaku.env` untouched (03:22) |
| fleet `.ufo/state/` | untouched during window | `find .ufo/state -newermt 06:39:10` empty |
| fleet `.scratch/` | untouched during window | only file is the 06:19 orchestrator goal file |
| `shokuknow` campaign tree | no kumitate write | one file changed in window: `lanes/tabi/round8/.work/ratelimit-series.tsv` (06:41, rate-limit TSV, `grep -ci 'kumitate\|round-61'` → 0). Attributable to the tabi campaign lane, not to any r61 seat. |
| sibling lane repos | no kumitate write | in-window writes exist in `tameshi-shokunin/` (round-42), `chousa-shokunin/` (round45), `souji-shokunin/` (corpus) — each its own lane's round. `tameshi-shokunin/{SCORECARD,LOG}.md` mention kumitate as a cross-lane summary; no r61 seat targets those repos. |

## 5. VCS state

- `HEAD` = `be4a820c344d4eb2f94b999c3b5d649e76ab70f1` at 06:45, unchanged since 06:39:08. No seat
  committed.
- `.git/refs/heads/master` content and mtime unchanged (06:39:08). No ref moved.
- `git diff --cached` empty; `git ls-files` = 10465. **No staged change, no index content mutation.**
  `.git/index` mtime advances (06:42:43, 06:44:12) only because `git status`/`git diff` refresh the
  stat cache — the behaviour the seat instructions themselves require.
- jj: **state was mutated** — see F1.

## 6. Findings

### F1 — jj auto-snapshot ops written by seats' read-only `jj log` (severity LOW-MEDIUM, operability)

**Evidence.** `.jj/repo/op_store/operations` gained two ops after the wave started:

- `0cdd3d3c…` at 06:42:02.793, description `snapshot working copy`, args
  `jj log -r @- --no-graph -T 'commit_id.short()'`;
- `bf521abc…` at 06:42:43.142, description `snapshot working copy`, args `jj log -r @ --no-graph`.

Both wrote working-copy commits for change-id `wpmzqrut` on parent `be4a820`:
`5562f6e5…` (tree `0676c99…`) at 06:42:02 and `905893ba…` (tree `9cf8a2d…`) at 06:42:43. The tree
delta between them is exactly `M .ufo/waves/round-60/close/dispatch60-tip.txt`, `M corpus/README.md`;
`@` vs master adds `M .ufo/pins/readme-map.json`. `.jj/working_copy/{checkout,tree_state}` were
rewritten at 06:42:43.

**Attribution.** ScoutProxyFull discloses it: "At the start I ran a read-only `jj log -r @`; jj may
auto-snapshot the working copy as part of that" (`w1/ScoutProxyFull.md:42`). ScoutRoundGates ran the
`jj log -r @- -T 'commit_id.short()'` variant (`w1/ScoutRoundGates.md:9`).

**Exploit path.** The wave contract says no jj mutation. A bare `jj log` is *read-looking* but rewrites
`@`; the only reason this is not a content breach is that jj did **not** auto-track the untracked
wave artifacts (`.jj/working_copy/tree_state` contains no `round-61/build/…`, no `terms-before`,
`counters.sh`, `make-dispatch-actual`, `dead-seats-r60`) — verified by grep over the tree-state
protobuf and by `git ls-tree` of both working-copy trees (15 round-61 paths, all pre-wave). So the
snapshot captured only the three declared tracked edits. The residual hazard: `@`'s commit id changed
mid-wave (ScoutRoundGates recorded `547e4f1f`; the id is now `905893ba`), and any later plain
`jj commit` / `jj new` / `jj squash` folds whatever `@` holds into history. The L1's own 06:39 push
used `--config 'snapshot.auto-track="none()"'`, which is the lane's known-safe form.

**Impact.** jj op log + working-copy commit rewritten during the wave; no ref, no master, no index,
no untracked scratch tracked. Recoverable by `jj op restore`, which the L1 should not need.

**Smallest remediation.** Add one line to the seat template and to the r61 lesson: *any* jj invocation
inside a wave runs as `jj --config 'snapshot.auto-track="none()"' …` (or use `git`); treat bare
`jj log`/`jj st` as mutating. No code change is needed for round 61.

### F2 — sentinel's own jj invocation (severity INFO, self-disclosure)

My first orientation command was `jj log --no-graph -r '::@'` at 06:41:10. It took repo locks
(`.jj/repo` and `.jj/working_copy` directory mtimes 06:41:10.73) but wrote **no** op — the op store
holds nothing between 06:39:09 and 06:42:02. Disclosed for completeness; I ran no further jj command.

### F3 — git index stat-refresh (severity INFO)

`.git/index` mtime moved at 06:42:43 and 06:44:12 while content did not (`git diff --cached` empty,
10465 tracked files, HEAD unchanged). Cause: `git status`/`git diff` stat-cache refresh, which the
seat instructions explicitly ask for. Not a staging mutation; no action.

### F4 — dispatched instruction contradicts itself (severity LOW, operability)

CritControlC1's task opens "Attack the C1 target for gaming (**scratch only, no lane writes**)" and
then step 3 says "Write each attempt + observed gate line to `…/.ufo/waves/round-61/controls/ctl-c1-critic-*.txt`".
The seat followed the explicit path: 8 files landed under `round-61/controls/`. That is consistent
with the round's control-receipt convention (`plan.md` names `controls/ctl-c1-*.txt` as the C1
control receipts), so no breach — but the header invites either an under-reporting seat or a
false-positive sentinel. **Remediation:** reword the header in `.ufo/waves/round-61/build-spec.mjs`
to "scratch for builds, receipts under `controls/`" before the next dispatch.

### F5 — integrator reverted a seat's declared output (severity LOW, report/tree divergence)

`.ufo/waves/round-60/close/dispatch60-tip.txt` was rewritten by ExecTipReceipts at 06:41:33 (544 B,
appended note "C1 after-state (10/10) is delivered by round 61 C1 — see .ufo/waves/round-61/plan.md",
task step 2 mandates exactly that note), then reverted at 06:43:48 to the committed bytes (457 B,
`git diff` empty). Attribution: the L1 transcript shows `read(dispatch60-tip.txt)` then
`edit(*** Begin Patch [dispatch60-tip.txt#CC91] CUT 4.=4 *** End Patch)` — the integrator removed
line 4. That is inside the L1's integration authority, and the removed claim was not yet true at
HEAD (RevTipReceipts LOW-1 says the same). Consequence to record: `w1/ExecTipReceipts.md` still
describes the note version, so the seat report now cites bytes that no longer exist; R60-V4's repair
is a no-op in the worktree. **Remediation:** state the revert and its reason in the round-60 erratum
(ScribeErratum's draft) so report and tree agree, or keep the note and let the erratum carry the
qualification.

### F6 — tip receipt embeds an ephemeral tmp path (severity LOW, provenance/operability)

`close/dispatch60-tip.txt` line 2 carries `dir=/tmp/a60-probe.L6n7ih/.ufo/waves/round-60/w1`; the
directory no longer exists, and a re-run yields a different suffix (RevTipReceipts observed
`P61VSt`/`ihmnFD`/`L6n7ih`/`oGUwJa`). Any "same line" comparison must normalise the suffix, so the
receipt is not byte-reproducible. Not a scope issue. **Remediation:** have the probe print a stable
label (e.g. `dir=<sandbox>/.ufo/…` with the suffix stripped or hashed) so P4-style equality is
literal.

### F7 — wave artifacts are untracked, so the gate's P2 depends on L1 staging (severity INFO, hand-off)

`git status` shows `.ufo/waves/round-61/build/` and `w1/` as untracked. P2 requires the *committed*
revision to carry `w1/launcher-progress.tsv`, `dispatch-actual.json` and 32 non-empty seat reports.
Nothing in this wave has been staged yet (correct: seats must not commit). The L1 must stage
`.ufo/waves/round-61/w1/` plus the three declared tracked edits plus `scripts/make-dispatch-actual.mjs`
and the round-60 close file, and must not sweep `.ufo/waves/round-61/build/` scratch into the commit
unless the round's convention wants it. Flagged here because the sentinel cannot enforce it after the
wave closes.

### F8 — `make-dispatch-actual.mjs` has no write confinement to the lane (severity LOW, path resolution)

The tool's task says "no writes outside the lane", and in the normal invocation that holds: `outDir`
defaults to `dirname(--registry)`, i.e. the wave directory. But nothing enforces it —
`outDir = resolve(args.out || dirname(registryPath))` (line 363) is used verbatim for
`mkdirSync(outDir, {recursive:true})` and the two `writeAtomic` calls (lines 375-378). `--registry`
and `--out` are caller-supplied absolute paths; a mistyped or hostile registry path such as
`/home/vgpnk/Projects/shokunin/.ufo/waves/round-61/w1/swarm-registry.json` writes
`dispatch-actual.json` and `launcher-progress.tsv` into the fleet root, and `--out /tmp/x` writes
there. `--round` is integer-checked and `--wave` is `NAME_RE`-checked, but `root` and `out` are not.
No network (`grep -E 'fetch\(|https?://'` → none); the only child processes are `node
dispatch-evidence.mjs` (verify) and the selftest re-invoking itself; temp fixtures go to
`mkdtempSync(tmpdir())` and are removed. `writeAtomic` writes `${path}.tmp-${pid}` then renames, so a
kill between the two leaves a `.tmp-<pid>` sibling — cosmetic.

**Impact.** Low today (the L1 supplies the paths and the default is lane-internal), but the tool is
the one new writer in this round and it is the obvious place for a future seat to point at the wrong
tree.

**Smallest remediation.** After computing `outDir`, assert it ends with
`/.ufo/waves/round-<N>/<wave>` and that `--root` is a prefix of it (the regex `deriveContext` already
computes exactly this); fail closed with `OUT_UNRESOLVED` otherwise. Or, minimally, document
"outDir must be the wave dir" in the usage text and have the L1 always pass `--root`.

### F9 — no out-of-lane writes from the seats' tooling (severity INFO)

`find /home/vgpnk -maxdepth 3 … -newermt 06:39:10` outside `Projects/`, `.cache/`, `.local/share/`
returns only agent-runtime files (`~/.omp/agent/agent.db*`, `~/.omp/logs/omp.*.log`,
`~/.config/ai-usage/selected`). No new binary in `~/.local/bin`, no package-manager activity — matching
every seat report's "no tools installed". `counters.sh` confines itself: it creates
`mktemp -d "$PROBE/.tmp.XXXXXX"` inside the lane probe dir, exports it as `TMPDIR` for the counters,
and `trap 'rm -rf "$scratch"' EXIT` (no `set -e`, deliberately, so exit codes are captured). A SIGKILL
would leave a `.tmp.*` dir behind; nothing else.

### F10 — two protected fleet paths changed mid-window, attributable to the hyaku orchestrator, not to a seat (severity INFO, attribution)

My 06:42 baseline hash of `scripts/hyaku/lane-addendum.md` was `6b5c7dfd…` (mtime 04:16); at 06:47 it
reads `c2e614b9…`. The diff is the campaign addendum being rewritten from the run-5 directives to the
run-6 directives ("Operator directives of run 6, verbatim (2026-10-25) …", session scope now
`.scratch/goal-20261025-hyaku-12h.md`), and `grep -ci 'kumitate\|round-61'` over the diff → **0**.
`.ufo/watchdog.log` also advanced; its new tail lines are orchestrator events for *mado* (06:46:34,
`lane-dead-no-report`) and *kotoba* (06:46:36, `launch`). No r61 seat targets either path, no report
mentions writing them, and the content is campaign-level.

**Conclusion.** The fleet `scripts/` and `.ufo/state/` changes inside this window are the orchestrator's
own writes, not wave-seat writes. The wave's "no seat touches fleet scripts" rule holds. Recorded so
that a later auditor does not read the mtime change as a seat breach.

## 7. Final state (06:50:25, wave complete)

- 32/32 seat reports present in `w1/` (31 seats + this one), **0 empty**, no duplicate content
  (`sha256sum | uniq -d` empty), no report under 400 B.
- `HEAD` `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`, unchanged since 06:39:08; `refs/heads/master`
  unchanged; `git diff --cached` empty; `.git/index` mtime 06:44:12 (stat refresh only).
- Newest jj op still `06:42:43` — the two F1 snapshots are the only jj state writes in the window.
- Lane delta: 5 tracked modifications + 2 new corpus/scripts files + the wave dirs, all attributed
  in §2. Nothing else appeared after 06:47:44.
- Fleet root: misroot candidates naming this lane/round **0**; `MANIFEST.json` `4af1c7e8…`,
  `templates/round-prompt.md` `b48b57ca…`, `.ufo/state/kumitate.report-baseline` `fcab0fc4…` — all
  identical to the 06:42 baseline; no fleet `scripts/`, `templates/` or `.ufo/state/` write after
  06:50:20.

## 8. Limits

- Attribution is by path + declared target + report admission; a seat that wrote and then restored a
  file byte-identically would leave only an mtime, which I record but cannot attribute (F5 is the one
  such case, attributed via the L1 transcript, not via the seat).
- The §2-§5 snapshot was taken mid-wave (06:45); §7 re-states it at wave end. The seat report at
  `.ufo/waves/round-61/w1/SentinelScope.md` is the condensed form.
- Concurrent non-kumitate activity in the fleet root and the campaign tree is recorded, not judged.
