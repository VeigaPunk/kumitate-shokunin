RESULT CtlStubChild verdict=targeted-MISS

## Finding

The final stub-child control is rejected at all four sites for the targeted reasons: `no_child_exec,exec_count_ne_base,selftest_cases_below_base`. No site reads ROUTED_HELD; no counter run exits 2. The final suites are green in all three scored runs, so this rejection is not incidental to selftest failure.

- Axis: operability; pre-data control only, not a C1 candidate score.
- Control commit: `263725e6999d400850daefcdeb6e1ea67b235909`, parent `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Isolated clone: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/lane`.
- Export: `.ufo/waves/round-48/build/CtlStubChild.patch` (one control commit).
- Strict mutation-testing verdict: **inconclusive as a killed/survived invariant comparison**, because the pristine revision already reads ROUTED_MISS at every site. The evidence demonstrates targeted control rejection; it does not claim a kill from a passing ROUTED_HELD baseline.

## Mutant and expected detector

RG742 `runGate` and SP1592 `spawnSelf` call the existing CLI `main()` in-process while capturing output and preserving/restoring arguments and environment, instead of launching child processes. SP491 and SP519 return a stub response without launching either live reader. The two live-reader fixtures and seven fresh-process HOME-default cases are removed; all other remaining assertions execute normally.

Mutation anchors in the exported patch: `.ufo/waves/round-48/build/CtlStubChild.patch:22` (RG742), `:149` (SP491), `:184` (SP519), `:274` (SP1592); removed dependent fixtures at `:50`, `:193`, `:237`, `:301`.

Expected guards are the frozen counter's `no_child_exec` / `exec_count_ne_base` at `.ufo/waves/round-48/probe/caproute48-probe.mjs:363-364` and suite-count floor at `:370`. All four observed counts are zero rather than base 116/2/2/14; round-gate has 58 rather than 61 cases, and surface-probe 40 rather than 46. These guards would still reject the control if all unrelated failure conditions were absent; in the final score, those unrelated conditions are absent.

## Final scored receipt (verbatim)

Source: `.ufo/waves/round-48/build/CtlStubChild-receipt.txt:1-14`.

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=11 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=102 resumed=28 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=58/58 execs=1104 resumed=17 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=58/58 execs=1104 resumed=14 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=58/58 execs=1104 resumed=19 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=40/40 execs=82 resumed=18 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=40/40 execs=82 resumed=26 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=40/40 execs=82 resumed=24 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=116 cases=58/58,58/58,58/58 base_cases=61/61 uncapped_direct=0,0,0 reason=no_child_exec,exec_count_ne_base,selftest_cases_below_base
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=2 cases=40/40,40/40,40/40 base_cases=46/46 uncapped_direct=0,0,0 reason=no_child_exec,exec_count_ne_base,selftest_cases_below_base
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=2 cases=40/40,40/40,40/40 base_cases=46/46 uncapped_direct=0,0,0 reason=no_child_exec,exec_count_ne_base,selftest_cases_below_base
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=14 cases=40/40,40/40,40/40 base_cases=46/46 uncapped_direct=0,0,0 reason=no_child_exec,exec_count_ne_base,selftest_cases_below_base
CAPROUTE48 rev=263725e6999d400850daefcdeb6e1ea67b235909 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=17.84 end=12:02:22Z
```

## Exact detector commands and run history

Every command ran with cwd `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild`, with GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE absent. The same unedited lane counter was used throughout. Captured stdout/stderr went to the receipt named below; each counter receipt ends with actual `cut -d ' ' -f1 /proc/loadavg` and `date -u +%TZ` results.

```text
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/lane 2263a505301f08acc2de37647772143c68c25865 --set r48
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/lane 9c0bd22d4b16de92b983726c04c2285d98b58d7e --set r48
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/lane 43330a624a5b798c93087d51c8ede5ffe666b9d1 --set r48
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/lane ce76acefa5ec7b30b4be9bf87c093344b96f5604 --set r48
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/lane 263725e6999d400850daefcdeb6e1ea67b235909 --set r48
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/lane 87142b4da14a43e8b04dadf24379ecf75fb533c5 --set r48
```

The following receipt paths are under `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/`, except the final control receipt in the lane:

| Revision | Role | Receipt | Observed result |
|---|---|---|---|
| fe3d45bf929246915c8c0de5f7f8682b5015b22c | Pristine | CtlStubChild-pristine-receipt.txt:1-14 | exit 1, held 0/4; suites 61/61 and 46/46 in all three rev runs |
| 2263a505301f08acc2de37647772143c68c25865 | Initial draft | CtlStubChild-draft-receipt.txt:1-14 | exit 1, held 0/4; incidental selftest failures, 57/61 and 39/44 |
| 9c0bd22d4b16de92b983726c04c2285d98b58d7e | First exact restoration | CtlStubChild-restored-receipt.txt:1-14 | exit 1, held 0/4; suites restored to 61/61 and 46/46 |
| 43330a624a5b798c93087d51c8ede5ffe666b9d1 | Environment-handling draft | CtlStubChild-draft2-receipt.txt:1-14 | exit 1, held 0/4; same incidental selftest failures |
| ce76acefa5ec7b30b4be9bf87c093344b96f5604 | Second exact restoration | CtlStubChild-final-restored-receipt.txt:1-14 | exit 1, held 0/4; suites restored to 61/61 and 46/46 |
| 263725e6999d400850daefcdeb6e1ea67b235909 | Final control | Lane .ufo/waves/round-48/build/CtlStubChild-receipt.txt:1-14 | exit 1, held 0/4; green suites 58/58 and 40/40 |
| 87142b4da14a43e8b04dadf24379ecf75fb533c5 | Final exact restoration | CtlStubChild-restored-final-receipt.txt:1-14 | exit 1, held 0/4; suites restored to 61/61 and 46/46 |

Drafts were not accepted as green controls. Diagnostic commands on an archive of the initial draft were:

```text
timeout -k 10 300 node /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/diagnostic-mutant/scripts/round-gate.mjs --selftest
timeout -k 10 300 node /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/diagnostic-mutant/scripts/surface-probe.mjs --selftest
```

Full outputs are in `CtlStubChild-diagnostic-round-gate.txt` and `CtlStubChild-diagnostic-surface-probe.txt` under the seat directory. Verbatim summaries:

```text
ROUND_GATE_SELFTEST: 57/61 pass
VERDICT: FAIL
39/44 cases passed
VERDICT: FAIL
```

The failing derived-HOME cases depended on fresh module initialization: `SRC_CANDIDATES` is computed at load time (`scripts/round-gate.mjs:150-153`, `scripts/surface-probe.mjs:156-159` at freeze). Updating the environment alone did not repair those cases; final control removes those child-dependent cases as assigned. Nested-suite failures disappeared once those cases were removed. No frozen counter edits were made to accommodate any draft.

## Restoration and hashes

Final restoration used exactly:

```text
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/lane -c user.name=ctl -c user.email=ctl@local -c commit.gpgsign=false revert --no-edit 263725e6999d400850daefcdeb6e1ea67b235909
```

It produced restored HEAD `87142b4da14a43e8b04dadf24379ecf75fb533c5`. SHA-256 was measured with `sha256sum` on both source files before mutation, on the final control, and immediately after restoration:

| File | Pristine | Final mutant | Restored |
|---|---|---|---|
| scripts/round-gate.mjs | 52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e | 4ffc7ece7f4a31659501120c7e28e76b02ede849cc98163179cb33051c72e016 | 52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e |
| scripts/surface-probe.mjs | 0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb | 16c80f42d389ce3fa07ee3aa6d3266a95eb64af2cadbbf04e1ca9c79ab3bd61e | 0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb |

Frozen counter SHA-256, identical before/after and to the freeze commit's blob:

```text
f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2
```

Provenance command:

```text
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/lane show fe3d45bf929246915c8c0de5f7f8682b5015b22c:.ufo/waves/round-48/probe/caproute48-probe.mjs | sha256sum
```

Verbatim final restored summary/trailer (`CtlStubChild-restored-final-receipt.txt:13-14`):

```text
CAPROUTE48 rev=87142b4da14a43e8b04dadf24379ecf75fb533c5 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=18.84 end=12:02:51Z
```

Patch export command (stdout was captured directly in the named patch):

```text
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..263725e6999d400850daefcdeb6e1ea67b235909
```

Patch SHA-256: `108e30ff8fa5fd0e318529612db8528090cba9159004e9ee9652b4babb043488`.

## Containment and tooling

All git writes were in the named sandbox clone. Only this report, the receipt and patch were written in the lane. No subagents, integrations, candidate scoring, other rounds' receipts or counter modifications were used. `df -h /fast` showed 69G available before the clone work. All detector and diagnostic runs were timeout-bounded and completed without timeout. Process check `pgrep -af -- /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlStubChild/` returned exit 1 with no output (no surviving matching process). No tools were installed or updated.
