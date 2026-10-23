RESULT MutNestedSelftest verdict=KILLED — the RG1409/SP1766 nested-`--selftest` allowance is load-bearing at the frozen counter; one surviving variant at surface-probe is recorded as a coverage finding.

## Claim attacked

The r48 counter admits a raw (uncapped) direct child of a gate only through `SETS.r48.allowDirect`, which names exactly two shapes:
each gate's nested `--selftest` (`isNode(ex[0]) && selfOf(gate)(ex[0].argv) && ex[0].argv.includes('--selftest')`) and
surface-probe's checklist runner (`isShell(ex[0]) && ex[0].argv[1] === '-c'`). Frozen source:
`.ufo/waves/round-48/probe/caproute48-probe.mjs:73-74` (allowance, `SETS.r48`), `:265-279` (`uncappedDirect`), `:366` (`uncapped_direct_children=N` ⇒ ROUTED_MISS) — line numbers in the committed F48 blob (378 lines, equal to `/tmp/mutnested/frozen-F48.mjs`).
Question: if the gates' nested `--selftest` is invoked as a traced child **outside** that shape, does the counter read MISS?

The frozen counter was not modified by this seat, and every reading below loaded the freeze bytes: `sha256 = f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`, equal to `git show HEAD:.ufo/waves/round-48/probe/caproute48-probe.mjs` at `fe3d45bf` and to this seat's clone; every receipt's summary line reads `rule=F48` (an amended counter prints `rule=F48+A48`), and the tree was `git status`-clean when checked at 18:36Z, after the last reading.

**Concurrent change, not mine.** The lane working-tree copy changed at 18:38:52Z (mtime `2026-10-23 15:38:52 -03`) — another seat's uncommitted `A48` amendment (`MutSummaryForge M2`: a `CASELINES` per-case-line corroboration, `summary_uncorroborated`, `rule=F48+A48`; `git status` now shows ` M`). That diff does not touch `allowDirect` or `uncappedDirect` and adds only a reason, so it cannot turn a `ROUTED_MISS` into `ROUTED_HELD`; no reading here was scored with it. [INFERENCE: by inspection of the uncommitted diff, not measured.]

## Method: remove the allowance class in effect, not in source

The allowance is a predicate over the traced direct child's **first execve**. I therefore left the counter untouched and moved the
invocation outside its shape: the gate's nested selftest is spawned as `/usr/bin/env <node> <SELF> --selftest …` instead of
`<node> <SELF> --selftest …`. The child pid's first exec is then `/usr/bin/env`, so `isNode(ex[0])` is false and the allowance
cannot match; the suite, its environment, its argv (from argv[1] on), its stdout and its exit status are unchanged.

Sandbox: `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutNestedSelftest/lane`, `git clone --no-hardlinks` detached at
`fe3d45bf`, `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` unset for every git operation. All commits are sandbox-local
(`-c user.name=seat`); the lane repo was read-only.

| tree | commit | change vs P |
|---|---|---|
| **P** pristine comparator (routed) | `8be171e466a88d82990f3898796cd65bfccade92` | four C1 sites through `capSpawnSync` (see below) |
| **M-rg** | `d09fbbc94191b5cd7501a3b05f491a7759f4c8b3` | RG1409 nested spawn via `/usr/bin/env` (1 line) |
| **M-sp** | `38f582c137a7b73cdb11180323c730a157e55700` | SP1766 nested spawn via `/usr/bin/env` (1 line) |
| **M-sp-sh** | `ce833985ec991efef14194546a10106963bed115` | SP1766 nested spawn via `sh -c 'exec "$@"'` (1 line) |
| restored | `8be171e…` (branch `p`) | none; working-tree bytes equal P |

P is not mine originally: it is the first hunk of `.ufo/waves/round-48/build/CtlEnvCaps.patch` (ancestor comparator `f55bf22e`),
applied with `git apply --exclude=scripts/cap-run.mjs` at `fe3d45bf` and **re-scored here rather than trusted** — routing RG742
(`round-gate.mjs:742-745`, `capSpawnSync` + `bind:[tmp]` + explicit env), SP491 (`surface-probe.mjs:492-500`), SP519 (`:521-534`),
SP1592 (`:1594-1597`). The ignored second hunk of that patch mutates `cap-run.mjs` and was deliberately not applied.

Mutant diffs (from `git diff p <mutant>`):

```diff
-      const nested = spawnSync(process.execPath,
-        [SELF, '--selftest', '--repo', '/nonexistent/repo', '--reports-dir', '/nonexistent/reports',
+      const nested = spawnSync('/usr/bin/env',
+        [process.execPath, SELF, '--selftest', '--repo', '/nonexistent/repo', '--reports-dir', '/nonexistent/reports',
```
```diff
-      const nested = spawnSync(process.execPath, [selfPath, '--selftest', '--src', '/nonexistent/kumitate-surface-probe'],
+      const nested = spawnSync('/usr/bin/env', [process.execPath, selfPath, '--selftest', '--src', '/nonexistent/kumitate-surface-probe'],
```
```diff
-      const nested = spawnSync(process.execPath, [selfPath, '--selftest', '--src', '/nonexistent/kumitate-surface-probe'],
+      const nested = spawnSync('sh', ['-c', 'exec "$@"', 'sh', process.execPath, selfPath, '--selftest', '--src', '/nonexistent/kumitate-surface-probe'],
```

Detector command, identical for every tree (node v24.21.0, cwd `/tmp/mutnested`):

```sh
/usr/bin/timeout -k 10 1200 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs \
  /fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutNestedSelftest/lane <rev> --set r48
```

## Detector outputs (verbatim, receipts in `/tmp/mutnested/`)

### P — pristine routed comparator: **held=4/4, exit 0**

`/tmp/mutnested/P-routed-receipt.txt`, sha256 `d73b772db1589fc0370f9dc894ea50bdc49814ab18c5c3db315e554fd32f9129`, 148.9 s, `load1=54.84 end=18:26:53Z`

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=29 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=4 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2120 resumed=73 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2120 resumed=57 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2120 resumed=64 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=180 resumed=4 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=180 resumed=6 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=180 resumed=4 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=8be171e466a88d82990f3898796cd65bfccade92 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0
```

### M-rg — nested selftest at RG1409 outside the allowance: **held=3/4, exit 1**

`/tmp/mutnested/M-rg-receipt.txt`, sha256 `fff0467e4a9f5b622026273d59665678d1b54aef3b63611685294cb56997da80`, 158.9 s, `load1=50.69 end=18:29:37Z`

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=41 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=0 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2121 resumed=68 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2121 resumed=55 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2121 resumed=58 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=180 resumed=7 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=180 resumed=5 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=180 resumed=1 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=1,1,1 reason=uncapped_direct_children=1
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=d09fbbc94191b5cd7501a3b05f491a7759f4c8b3 base=f00cf278 set=r48 held=3/4 runs=3 rule=F48
exit=1
```

### M-sp — nested selftest at SP1766 outside the allowance: **held=1/4, exit 1**

`/tmp/mutnested/M-sp-receipt.txt`, sha256 `09a8ba87acf417f630a9a6b1eb70d3129bd47980ef513fcdd1bc2cb5cd486edf`, 135.3 s, `load1=42.98 end=18:31:56Z`

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=49 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=2 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2120 resumed=42 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2120 resumed=38 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2120 resumed=36 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=181 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=181 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=181 resumed=0 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=1,1,1 reason=uncapped_direct_children=1
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=1,1,1 reason=uncapped_direct_children=1
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=1,1,1 reason=uncapped_direct_children=1
CAPROUTE48 rev=38f582c137a7b73cdb11180323c730a157e55700 base=f00cf278 set=r48 held=1/4 runs=3 rule=F48
exit=1
```

### M-sp-sh — SP nested selftest through `sh -c`: **held=4/4, exit 0 (survivor, see below)**

`/tmp/mutnested/M-sp-sh-receipt.txt`, sha256 `7f6a40835d9cfe4037883c783b2ab98f5372d0f522dc2e1f2c6ea35b7596ea4b`, `load1=40.00 end=18:33:57Z`

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=21 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=0 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2120 resumed=24 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2120 resumed=46 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2120 resumed=55 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=181 resumed=3 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=181 resumed=5 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=181 resumed=5 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=ce833985ec991efef14194546a10106963bed115 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0
load1=40.00 end=18:33:57Z
```

### Restored — P bytes re-scored: **held=4/4, exit 0**

`/tmp/mutnested/R-restored-receipt.txt`, sha256 `8c060f9e3c6b158c698942dc6a321d68b34042a986a41155650938505b0f4093`, `load1=27.65 end=18:35:12Z`

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=34 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=0 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2120 resumed=21 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2120 resumed=22 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2120 resumed=25 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=180 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=180 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=180 resumed=0 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=8be171e466a88d82990f3898796cd65bfccade92 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0
```

No invocation exited 2 (every base and revision trace parsed; `resumed` records ranged 0-73).

## Direct-child diagnostic (independent of the counter's verdict line)

`/tmp/mutnested/directs.mjs` mirrors the counter's parser and `uncappedDirect` classification (it does **not** modify or import the
frozen counter) and prints every direct child of the gate's selftest root with the clause that admits it. Run as
`node directs.mjs <absolute tree> <gate>` after `git archive <rev> | tar -x`; same strace flags as the counter's `runGate`.

- P / round-gate (root 2490545, 2120 execs): exactly one non-cap-run, non-fixture direct child —
  `class=ALLOWED:node-selftest paths=…/node argv1=[["…/scripts/round-gate.mjs","--selftest","--repo"]]`; **`dodge=0`**.
- P / surface-probe (root 2688099, 180 execs): one `class=ALLOWED:node-selftest` child
  (`…/scripts/surface-probe.mjs --selftest --src`) plus 8 `class=ALLOWED:shell-c` children (`bash -c "node -e …"`, the SP1049
  checklist fixtures); **`dodge=0`**.
- M-rg / round-gate (root 2708819, 2121 execs): one `class=DODGE` child,
  `execs=2 paths=/usr/bin/env,…/node argv1=[["…/node","…/scripts/round-gate.mjs","--selftest"],["…/scripts/round-gate.mjs","--selftest","--repo"]]`;
  **`dodge=1`** — the counter's `uncapped_direct=1` is this child and nothing else.
- M-sp-sh / surface-probe (root 2871017, 181 execs): the nested selftest child is
  `class=ALLOWED:shell-c paths=/usr/bin/sh,…/node argv1=[["-c","exec \"$@\"","sh"],[…]]`; **`dodge=0`** — this is why the fourth
  reading survives.

## Verdict

**KILLED — the nested-selftest allowance is load-bearing at both named sites, and the counter reads MISS when the invocation
leaves its shape.** In the routed tree the only uncapped direct child is the gate's own nested `node <gate>.mjs --selftest`
(allowed solely by `allowDirect`'s first clause); moving that one spawn outside the shape flips the owning gate's sites to
`ROUTED_MISS` with the single reason `uncapped_direct_children=1`, in all three runs, while the other gate's sites stay
`ROUTED_HELD` in the same invocation. The gate suites themselves are untouched: 61/61 and 46/46, `verdict_pass=true`,
`fail_lines=0`, and the sites' own `capped/n` counts stay at the base counts (116/2/2/14) — so the miss is targeted, not an
incidental suite failure. Removing the allowance class would make the routed comparator read 3/4 or 1/4, i.e. C1 could not
reach `held=4/4`.

**Survivor (coverage finding, no contract change).** M-sp-sh survives: at surface-probe a nested `--selftest` wrapped as
`sh -c 'exec "$@"'` is admitted by the second `allowDirect` clause, because that clause accepts any `sh|bash|dash -c` direct child
(SP1049's checklist runner is exactly that shape, and its command is data). So the named-allowance boundary is shape-tight at
round-gate (only `node <gate>.mjs … --selftest`) but **not** at surface-probe: a shell-wrapped nested selftest there is
indistinguishable from the checklist allowance. This bounds the phrase "allowance only covers the named nested sites" — it holds
as "the allowance only covers the named shapes". Consequence for C1: a C1 candidate would still score `held=4/4` if it launched
the SP1766 nested selftest through a shell; the counter cannot tell. Not exercised by the frozen tree at `fe3d45bf` (SP1766 spawns
`process.execPath` directly), so no amendment is forced; recorded for the counter's owner, not acted on.

**Out of scope by construction.** No C1 candidate was scored; P is a re-scored inherited comparator (provenance above), not a
claim, and no 4/4 reading here is offered as a C1 score. This seat edited neither the counter nor the predicate, site list or allowances; every reading used the committed `f24a3af5` bytes (`rule=F48` in all five receipts). The uncommitted `A48` amendment described above is another seat's write, landed after the last reading.

## Restoration evidence

The mutant branches are sandbox-only; branch `p` was checked out after the last mutant, and the working tree bytes were verified
equal to P before the restored scoring run:

| file | P (`8be171e`) | M-rg (`d09fbbc`) | M-sp (`38f582c`) | M-sp-sh (`ce83398`) | working tree after restore |
|---|---|---|---|---|---|
| `scripts/round-gate.mjs` | `6ffd3ab0a0cd9778a22d502da80c3bb0157bc0bde74d8277db360436e79cb08b` | `76dce7451ff99f6d822d75944d6c878656c297736da77638e6b4eeee388297a0` | `6ffd3ab0…` | `6ffd3ab0…` | `6ffd3ab0a0cd9778a22d502da80c3bb0157bc0bde74d8277db360436e79cb08b` |
| `scripts/surface-probe.mjs` | `77367904351d11e918201fd43cd8edf7ef80fffbd27e3721b91c7fbeee6f829c` | `77367904…` | `bc4f4b33881cc47bb2aca30372505839c4202220f2ad74de39cb1682297d8033` | `eedd8ec3744cf8a4ef23e3a96d942c3e3467ebdb622d4bd46b6615a268740f80` | `77367904351d11e918201fd43cd8edf7ef80fffbd27e3721b91c7fbeee6f829c` |
| `scripts/cap-run.mjs` | unchanged at `fe3d45bf` in every tree (the comparator patch's second hunk was excluded) | | | | |

Restored reading: `held=4/4` exit 0 (receipt above), identical to the pristine reading.

## Tooling

No tool was installed, upgraded or removed. `strace`, `node v24.21.0`, `systemd-run`, `bwrap`, `prlimit`, `git` as already present.
