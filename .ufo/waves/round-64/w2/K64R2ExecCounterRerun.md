VERDICT: Both frozen counters are byte-stable across repeat runs and fail closed (MISS, never HELD) on an unreachable network, but `jj64-probe` reads `held=7/8` — not the declared 8/8 — whenever its caller has no `$EDITOR`, which is exactly the 3-key env `counter-rerun` hands it: `jj-seat-demo.sh` lets an ambient editor decide the `squash` step, and a one-line `--config 'ui.editor=["true"]'` in the demo restores `AGREE (runs=5)` 8/8; two arms of the frozen counters are also decided outside the measured rev (the unpinned fleet `sources-census.sh` and the fleet report blobs), and each run extracts 172 MB for ≤12.8 MB of needed bytes.

# K64R2ExecCounterRerun — counter determinism and cost (round 64, wave 2)

Rev measured: `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`. Host: linux 7.2.11-arch1-1, node v24.21.0, jj
0.45.1-7c41cdeb, load1 12.6–31.8 during the runs (per-run `load1` in every counter-rerun record).

## Evidence

| run | counter / env | verdict line (final summary) | exit | wall/run |
|---|---|---|---|---|
| 1 | jj64 ×5, **counter-rerun child env** | `JJ64_UNMET held=7/8 checks=8 rev=2ed8a5f… rule=J64 \| J6 MISS demo-exit=2;rewrite_treechange_seat_state:stated-not-live;abandon_seat_head_seat_state:stated-not-live;abandon_seat_head_files_on_disk:stated-not-live;abandon_empty_seat_state:stated-not-live;update_stale_recovers:stated-not-live` | 1 | 1.13–2.34 s |
| 2 | jj64 ×5, same env + `EDITOR` reachable via a `jj` shim | `JJ64_HELD held=8/8 checks=8 rev=2ed8a5f… rule=J64` | 0 | 1.67–2.07 s |
| 3 | jj64 direct, login shell (`EDITOR=true`) | `JJ64_HELD held=8/8 …` | 0 | 1.81 s |
| 4 | jj64 `--no-live` | `JJ64_UNMET held=7/8 … \| J5 MISS live-fetch-skipped` | 1 | 1.54 s |
| 5 | jj64, all rows unreachable | `JJ64_UNMET held=7/8 … \| J5 MISS S198:live-unreachable;S199:live-unreachable;S200:live-unreachable` | 1 | 1.73 s |
| 6 | jj64, one-row flake (S199 only) | `JJ64_UNMET held=7/8 … \| J5 MISS S199:live-unreachable` | 1 | 1.66 s |
| 7 | receipt64 ×5, no `--report` | `RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f… rule=R64 \| P5 MISS report-not-given` | 1 | 3.14–3.65 s |
| 8 | receipt64 ×5, `--report` (draft snapshot, P5 exercised) | `RECEIPT64_HELD held=5/5 checks=5 rev=2ed8a5f… rule=R64` | 0 | 3.17–3.85 s |
| 9 | jj64 on the fixed clone, counter-rerun env | `JJ64_HELD held=8/8 … rev=80faa1b…` | 0 | 2.22–2.76 s |

Run 1 (5/5 runs, identical `summary_sha256=c1690e46…`, `stdout_bytes=323`):

    $ node scripts/counter-rerun.mjs --probe …/.ufo/waves/round-64/probe/jj64-probe.mjs \
        --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev 2ed8a5f… --runs 5 --
    COUNTER_RERUN_REASON: run 1 exited 1   (…runs 2–5 identical)
    COUNTER_RERUN: DISAGREE          EXIT=1

Run 2 (`PATH=<shim>:…` where the shim is `EDITOR=true VISUAL=true exec /home/vgpnk/.local/bin/jj "$@"`):

    COUNTER_RERUN: AGREE (runs=5)    EXIT=0  TOTAL_WALL_MS=9143

Run 7 is byte-identical five times (`summary_sha256=ba60b8dd…`) and still reads `COUNTER_RERUN: DISAGREE`
(see finding -8). Run 8 is `AGREE (runs=5)` exit 0 — the P5 arm itself is stable and the 5/5 reading is reachable.

counter-rerun's child env, measured with a probe that prints it (`keys=3`; `TMPDIR`/`EDITOR` set in my caller):

    ENVPROBE cwd=/home/vgpnk/Projects/shokunin/kumitate-shokunin TMPDIR=<unset> EDITOR=<unset> … HOME=/home/vgpnk keys=3

Cause isolation on the extracted tree (`git archive 2ed8a5f | tar -x`), 3 runs each:

    $ env -i PATH="$PATH" HOME="$HOME" LANG=C.UTF-8 bash tree/scripts/jj-seat-demo.sh   -> FAIL-CLOSED squash-into  exit 2
    $ bash tree/scripts/jj-seat-demo.sh                                                -> DONE jj=0.45.1-…          exit 0
    env -i … EDITOR=true -> DONE exit 0 | VISUAL=true -> DONE exit 0 | EDITOR=false -> FAIL-CLOSED squash-into exit 2
    instrumented copy: `2: No such file or directory (os error 2)` / `Hint: Edited description is left in /tmp/editor-FjM5H3.jjdescription`

Fix proof: scratch shared clone of the lane + one line (`--config 'ui.editor=["true"]'` in `J()`, line 43), commit
`80faa1b525d163d525b517bb3eb274be2f62d99d`, then run 9 above under the unmodified counter-rerun env:
`COUNTER_RERUN: AGREE (runs=5)` exit 0 (build/jj64-fix-proof.txt).

Fail-closed and dependency arms (direct runs): `SOURCES_CENSUS=<stub exit 1>` → `JJ64_UNMET held=7/8 … | J7 MISS
census-exit=1 province-names-entry=true readme-map-clean=true` exit 1; `SOURCES_CENSUS=<no-op exit 0>` →
`JJ64_HELD held=8/8` exit 0. `receipt64 --fleet <non-git dir>` → `RECEIPT64_UNMET held=3/5 … | P3 MISS
fleet-blob-unreadable | P5 MISS report-not-given` exit 1.

cwd/TMPDIR: `JJ64_HELD 8/8` from `cwd=/`, `cwd=/tmp/kumitate-r64`, `TMPDIR=<scratch>`, and
`TMPDIR=<lane>/.tmp-k64r2` (inside the lane worktree); `TMPDIR=/nonexistent-k64r2` → uncaught
`Error: ENOENT … mkdtemp` exit 1, no verdict line (same for receipt64). Demo stdout: 3 runs byte-identical,
21 `JJ_SEAT:` keys.

Cost per run: `git archive 2ed8a5f | wc -c` = **171857920 B, 14826 files**, extraction alone 325 ms / 190 MB on
disk; the paths the counters read are 4055040 B (jj64: `scripts corpus PROVINCE.md .ufo/pins`) and 12830720 B
(receipt64: `scripts .ufo/waves/round-64`). Successful `execve` per run (strace `-f -e trace=execve`, `= 0` lines):
jj64 **132** (46 jj, 44 tput, 11 grep, 5 git, 3 curl), receipt64 **642** (521 git, 115 node). Network per jj64 run:
3 fetches, 48988+53233+47694 = **149915 B**. Control cases: 37 with an `expect` file; P4 re-runs the whole P2+P3
harness for two stubs → 3× the case cost.

## Findings

**K64R2ExecCounterRerun-1 — HIGH — J6 is decided by the caller's ambient `$EDITOR`/`$VISUAL`; under the lane's own
repeat-run comparator the frozen counter can never read the declared 8/8.** Attacks C2's headline number and the
pairing of counter and harness. `jj squash --from @ --into "$SEAT_CHANGE"` (jj-seat-demo.sh:97) opens the
description editor; with `EDITOR`/`VISUAL` unset jj's editor launch fails (ENOENT) and the demo exits 2 → J6 MISS.
Reproduce: `env -i PATH="$PATH" HOME="$HOME" LANG=C.UTF-8 bash scripts/jj-seat-demo.sh` → `FAIL-CLOSED squash-into`
exit 2, versus the same command with `EDITOR=true` → `DONE` exit 0; through the harness, run 1 vs run 2 above. A real
interactive editor instead blocks until the probe's 120 s demo timeout (`r.status === null` → `demo-exit=null` → MISS)
[INFERENCE from jj64-probe.mjs:197-198 + `timeout: 120000`]. Fix (measured, build/jj-seat-demo-editor.patch):
`--config 'ui.editor=["true"]'` in `J()`; `export EDITOR=true VISUAL=true` also works (21/21 keys identical).

**K64R2ExecCounterRerun-2 — HIGH — J7's census arm is decided by an unpinned, mutable fleet script.** The probe
runs `process.env.SOURCES_CENSUS || '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'` (jj64-probe.mjs:34,208)
— outside the measured rev, and `grep -c sources-census .ufo/pins/counter-pins.json` = **0**. A no-op `exit 0` stub
keeps `JJ64_HELD 8/8`; an `exit 1` stub flips to `7/8 J7 MISS`. Reproduce:
`SOURCES_CENSUS=/tmp/x/noop.sh node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> 2ed8a5f…` (stub = `exit 0`).
So the frozen verdict can be moved in both directions by a file the freeze does not cover. Fix: pin the script's
sha256 in counter-pins.json and verify it, or vendor it into the lane and run the archived copy.

**K64R2ExecCounterRerun-3 — MEDIUM — receipt64's P3 arm reads the fleet repo at an absolute default path and two
abbreviated fleet commits.** `--fleet` defaults to `/home/vgpnk/Projects/shokunin`; `git show 7b0581ed:…` /
`8fd46e61:…` (receipt64-probe.mjs:36,68). Reproduce: `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane>
2ed8a5f… --fleet /tmp/kumitate-r64/K64R2ExecCounterRerun/notafleet` → `held=3/5 … P3 MISS fleet-blob-unreadable`
exit 1. On a clean-room host or after a fleet history rewrite the real-data arm silently drops (as MISS). Fix:
commit the two report blobs into the lane under `.ufo/waves/round-64/base/` with sha256 pins and read them from
the archive.

**K64R2ExecCounterRerun-4 — MEDIUM — an un-creatable scratch dir is recorded as `exit 1` (measured unmet), not the
counters' own `exit 2` (cannot evaluate).** `mkdtempSync` is unguarded (jj64-probe.mjs:51, receipt64-probe.mjs:42).
Reproduce: `TMPDIR=/nonexistent-k64r2 node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> 2ed8a5f…` → uncaught
`Error: ENOENT … mkdtemp '/nonexistent-k64r2/jj64.XXXXXX'`, exit 1, **no verdict line** (receipt64 identical). A
receipt that reads only the exit code records `held=0/N` for an unrun check. Fix text: build/counter-fix-proposals.md §2.

**K64R2ExecCounterRerun-5 — MEDIUM (cost) — each run extracts 172 MB / 14826 files for ≤12.8 MB of needed bytes, and
receipt64 spawns 642 processes.** Measured above; `counter-rerun --runs 5` on jj64 = ~860 MB of temp churn, and the
fixed-clone runs cost 2.2–7.3 s at load1 29–32 versus 1.7–2.1 s at load1 17 — wall time is load-driven with no
internal budget other than the demo's 120 s spawn timeout. P4 re-runs P2+P3 for two stubs (3× the 37-case cost).
Fix text (path-scoped `git archive`): build/counter-fix-proposals.md §3 — 4.1 MB / 12.8 MB instead of 172 MB.

**K64R2ExecCounterRerun-6 — LOW — a signal-interrupted run leaks its whole extraction into TMPDIR.** No signal
handler or try/finally around the extraction (jj64-probe.mjs:51-53,235). Reproduce: start the probe, `kill -9` at
0.35 s → `/tmp/jj64.*` leftovers before=1 after=2; receipt64 at 0.6 s → before=3 after=4. Two 19:49 orphans already
exist (`/tmp/receipt64.0P2NiJ`, `/tmp/receipt64.rUxA0i`, 2 files each = interrupted extractions).

**K64R2ExecCounterRerun-7 — LOW — the demo leaks editor temp files into the caller's TMPDIR.** Measured with a
private TMPDIR: a run without `EDITOR` leaves 1 `editor-*.jjdescription` (25 already in /tmp); a run with
`EDITOR=true` leaves 0. Same fix as finding -1.

**K64R2ExecCounterRerun-8 — CALIBRATION — `counter-rerun` cannot certify a stable UNMET reading: it reports
`DISAGREE` for five byte-identical summaries because `decide()` requires exit 0.** That is the current frozen state
of C1 (`RECEIPT64_UNMET held=4/5`, 5/5 identical lines, five `run N exited 1` reasons, `DISAGREE` exit 1). The
harness therefore conflates "stable unmet" with "flaky" exactly where the round needs the distinction. Proposed
predicate change (L1 decision): compare the exit *codes* across runs instead of requiring 0, and print
`AGREE (runs=K status=1)` — build/counter-fix-proposals.md §5.

**K64R2ExecCounterRerun-9 — CALIBRATION — the harness does not reproduce the counter's environment, only its final
line.** `childEnv()` passes `PATH/HOME/LANG` and drops `TMPDIR`, `EDITOR`, everything else (measured `keys=3`), and
fixes `cwd` to the lane. So "the counter reproduced" means "reproduced under an env no receipt-taking seat uses" —
the mechanism of finding -1, and the reason a receipt's 8/8 and the harness's 7/8 can both be honest.

## Artifacts

- `.ufo/waves/round-64/w2/K64R2ExecCounterRerun.md` (this report)
- `.ufo/waves/round-64/build/K64R2ExecCounterRerun/measurements.md` — raw transcripts of every run above
- `.ufo/waves/round-64/build/K64R2ExecCounterRerun/jj-seat-demo-editor.patch` — the one-line demo fix (unified diff)
- `.ufo/waves/round-64/build/K64R2ExecCounterRerun/counter-fix-proposals.md` — minimal diffs as text for findings -2…-5, -8
- `.ufo/waves/round-64/build/K64R2ExecCounterRerun/jj64-fix-proof.txt` — `AGREE (runs=5)` 8/8 on the fixed clone
- scratch `/tmp/kumitate-r64/K64R2ExecCounterRerun/` (1.8 MB after cleanup; the lane clone and the 190 MB extraction
  were deleted; 0 `.mjs/.js/.sh/.py` files added under the lane build dir)

## Limits

- `unshare -n` is refused on this host (`unshare: unshare failed: Operation not permitted`), so the network block was
  simulated at the transport level (proxy to a closed port; a `curl` shim exiting 6 for one URL), not by a real netns.
- The 120 s demo-timeout → J6 MISS path is code-read [INFERENCE], not measured (a real editor hang costs 2 min and
  leaves an orphan).
- I did not re-run either counter at the base rev, did not attack the C1/C2 predicates beyond the arms that decide
  determinism/cost, and did not verify that the path-scoped `git archive` fix of §3 leaves every check's outcome
  unchanged (not applied; must be re-measured by whoever integrates it).
- The `--report` file used for run 8 is a snapshot of a sibling seat's draft, not the final round-64 report; the frozen
  reading remains `held=4/5` (P5 awaits the report).
- Only jj 0.45.1 and node v24.21.0 were exercised; the demo's `ui.editor` config spelling is version-dependent.
