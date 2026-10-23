RESULT MutRunnerUnshare verdict=KILLED

The control is rejected at all four sites by the frozen F48 counter with the predicted targeted reason: dropping `--unshare-pid` from the runner's bwrap argv makes no exec match the counter's bwrap predicate, so every C1 site reads `ROUTED_MISS` (`no_bwrap_ancestor` first-order). No site read `ROUTED_HELD`; no counter invocation exited 2; both owning selftests passed in full in every run. This is a pre-data negative control, not a score of the C1 candidate.

## Mutant and expected detector

- Axis: operability / C1 / ROUTED_HELD / rule F48, round 48 attempt 2, wave `r48`.
- Sandbox: `/fast/scratch/hyaku/kumitate-r48a/seats/MutRunnerUnshare/lane`, cloned `--no-hardlinks` and detached at freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c`; `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` unset in every command.
- Pristine comparator: **`af03fad5f7b4434f55f6c0b6489de045d659ac49`** — this seat's routed four-site setup, built by applying the inherited routing patch `.ufo/waves/round-48/build/CtlEnvCaps.patch` (commit 1/2) to the freeze, then dropping its cap-run commit. Its three script blobs are byte-identical to the previously scored 4/4 comparator `f55bf22e` (cap-run `d8acc6d…`, round-gate `6ffd3ab…`, surface-probe `7736790…`). It is a comparator, not the C1 candidate.
- Mutant commit: **`529947e71c3fdb657604eb9cbf509c67d13a4e4a`** — one line in `scripts/cap-run.mjs:189`: the bwrap argument list `'--unshare-pid', '--die-with-parent', '--new-session', ...setenv` becomes `'--die-with-parent', '--new-session', ...setenv`. The child now shares the runner's PID namespace; `--unshare-pid` remains in the file's prose comments only.
- Expected detector: the counter's `isBwrap` requires `/usr/bin/bwrap` argv to carry all of `--unshare-pid`, `--clearenv`, `--die-with-parent` (`.ufo/waves/round-48/probe/caproute48-probe.mjs:261`). With the flag absent no ancestor exec qualifies as bwrap, so every site must miss on `no_bwrap_ancestor`, with `no_capped_scope_ancestor`/`no_cap_run_ancestor`/`uncapped_exec` derivative (the scope and runner checks are nested inside the bwrap match; `capped` increments only when `haveR`).
- Mutation hash: `scripts/cap-run.mjs` before `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` → after `a81b8252eb9d70888183f4e9e11d028d74c28cc7ef7a30a17e1763523227cff7` (blob `9ab3193` → `3861178`). `round-gate.mjs` (`6ffd3ab…`) and `surface-probe.mjs` (`7736790…`) unchanged.

## Frozen detector and commands

The executed counter is the lane's unedited absolute-path copy; its SHA-256 before the first run and after the last was `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`.

All three commands ran from cwd `/fast/scratch/hyaku/kumitate-r48a/seats/MutRunnerUnshare` with runtime `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node` (`v26.12.0`) and a 1500 s timeout with 10 s kill grace:

```sh
timeout -k 10 1500 node …/probe/caproute48-probe.mjs <lane> af03fad5f7b4434f55f6c0b6489de045d659ac49 --set r48
timeout -k 10 1500 node …/probe/caproute48-probe.mjs <lane> 529947e71c3fdb657604eb9cbf509c67d13a4e4a --set r48
timeout -k 10 1500 node …/probe/caproute48-probe.mjs <lane> 0b9fd4d830eeb3802d023cac5d2452620a1fdacb --set r48
```

| Bytes | Start UTC | load1 start | Elapsed | Result |
|---|---|---:|---:|---|
| Comparator `af03fad` | 18:23:35 | 3.59 | 88 s | held=4/4, exit 0 |
| Mutant `529947e` | 18:25:06 | 33.23 | 111 s | held=0/4, exit 1 |
| Restored `0b9fd4d` | 18:27:36 | 57.14 | 154 s | held=4/4, exit 0 |

Receipts: `.ufo/waves/round-48/r48/MutRunnerUnshare-pristine-receipt.txt`, `MutRunnerUnshare-receipt.txt` (mutant), `MutRunnerUnshare-restored-receipt.txt`. The mutant receipt's exit trailer was appended after the run from the calling shell's observed status and the file mtime, because that shell (a temporary shell with `set -e`) exited on the probe's non-zero status before writing it; the trailer states this.

## Actual outputs, verbatim

Mutant, `.ufo/waves/round-48/r48/MutRunnerUnshare-receipt.txt:1-14`:

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=31 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=5 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2120 resumed=58 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2120 resumed=61 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2120 resumed=56 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=180 resumed=5 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=180 resumed=8 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=180 resumed=7 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
CAPROUTE48 rev=529947e71c3fdb657604eb9cbf509c67d13a4e4a base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 start=18:25:06Z load1_at_start=33.23 mtime=2026-10-23 15:26:57.638043390 -0300 note=exit captured by calling shell (job bg_160); trailer appended post-hoc
```

Comparator, `MutRunnerUnshare-pristine-receipt.txt:9-14`, and restored, `MutRunnerUnshare-restored-receipt.txt:9-14` (identical labels and counts):

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=af03fad5f7b4434f55f6c0b6489de045d659ac49 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0 load1=33.07 end=18:25:03Z
CAPROUTE48 rev=0b9fd4d830eeb3802d023cac5d2452620a1fdacb base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0 load1=53.30 end=18:30:10Z
```

## Verdict and reading

- **Killed, targeted.** All four sites are `ROUTED_MISS` in all three rev runs of the mutant; the first-order reason is `no_bwrap_ancestor`. The accompanying `no_capped_scope_ancestor`, `no_cap_run_ancestor` and `uncapped_exec` are derivative of the same failed bwrap match, exactly as the counter's `judge` nests those checks (`.ufo/waves/round-48/probe/caproute48-probe.mjs:280-308`).
- **Not incidental.** Every base and rev selftest exited 0 with its full own suite summary (round-gate 61/61, surface-probe 46/46), `verdict_pass=true`, `fail_lines=0`; per-site exec counts equal the base (116/2/2/14) and `uncapped_direct=0`. The mutation changed no count and no suite result, so the counter would have read 4/4 but for the missing flag; the comparator and restored runs on the same bytes except that flag do read 4/4.
- **No F48 amendment forced.** The control (cap-run without `--unshare-pid`) reads `ROUTED_HELD` on no site. The comparator's 4/4 is the inherited legitimate routing already scored in `build/CtlEnvCaps-pristine-receipt.txt`, not a control; the plan addendum's no-amendment-before-data determination stands.
- **Caveat for the C1 claim.** This probe tests the counter against a one-flag runner change inside a routing build this seat assembled from the inherited comparator. It does not test candidate C1 code (none exists) and does not show that the routing itself is sufficient; it shows the counter rejects a runner that drops PID-namespace isolation even while systemd-run scope and the rest of the chain remain intact.

## Restoration evidence

- Restoration commit **`0b9fd4d830eeb3802d023cac5d2452620a1fdacb`** re-adds `'--unshare-pid'`; `git diff --stat af03fad 0b9fd4d` is empty and `git ls-tree` gives identical blobs for all three files at comparator and restoration.
- SHA-256 of `scripts/cap-run.mjs`: comparator `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758`, mutant `a81b8252eb9d70888183f4e9e11d028d74c28cc7ef7a30a17e1763523227cff7`, restored `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758`.
- The restored detector run scored the restoration commit itself (not the working tree) and read 4/4 exit 0 under load1 57.
- Patch `.ufo/waves/round-48/r48/MutRunnerUnshare.patch` (freeze..mutant, two commits: inherited routing comparator + one-line runner mutation; restoration excluded), SHA-256 `50fcd8044c2808a3b836676391b837cf765373f2a9b684614711330b1ab3d919`.

Receipt SHA-256: pristine `ae1bf3c45729599892b3dc1230528fbc03d813219d47ebd9cc87d76bea29ebe6`, mutant `05534bc153fed2367307e8da57d8928bcb01e960d505b1724734f0d612fb4a08`, restored `f5bff79ba253a286e000523afea38fa0090737b6c8f6e4bf802725ea2a76fcf0`.

## Bounds and tooling

No tool was installed or updated; no pacman transaction; no lane/fleet git mutation (sandbox commits only, `-c user.name=seat`); no writes to the lane outside `.ufo/waves/round-48/r48/`, no sibling edits, no counter edit, no delegation, no background subagent, no integration. A process scan for the seat directory after the runs found none.
