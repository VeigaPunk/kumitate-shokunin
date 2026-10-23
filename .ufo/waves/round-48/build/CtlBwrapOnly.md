RESULT CtlBwrapOnly verdict=inconclusive

## Control result

The bwrap-only control was rejected as expected: all four sites are `ROUTED_MISS`, `held=0/4`, exit 1. Every site explicitly reports the targeted `no_capped_scope_ancestor`; none reports `ROUTED_HELD`, and no detector invocation exited 2. This is not an incidental selftest failure: every measured gate exits 0, with round-gate 61/61 and surface-probe 46/46, final PASS, zero FAIL lines, and unchanged site execution counts (116, 2, 2, 14).

Mutation kill attribution is **inconclusive**, not killed: the assigned pristine frozen tip is itself unrouted and also reads `held=0/4`, exit 1. The observed negative-control outcome nevertheless matches the requested expectation. Only this control was scored; no C1 routing candidate was scored.

Axis: operability. Predicate and counter remained frozen (`.ufo/waves/round-48/plan.md:53-62`; `.ufo/waves/round-48/probe/caproute48-probe.mjs:5-19`).

## Mutant and export

- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane`.
- Parent: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Runnable control commit: `d34f0c13647a4267fff2c60b35fb249e9d54caa4` (retained on sandbox branch `CtlBwrapOnly`).
- Patch: `.ufo/waves/round-48/build/CtlBwrapOnly.patch` (4556 bytes), SHA-256 `36d89e06e546228ed391fec0b4b02cd25630cd8354837e26f8dc732242056cee`.
- At that commit, `scripts/round-gate.mjs:743` and `scripts/surface-probe.mjs:492,520,1593` call `bwrapOnlySpawnSync`; `scripts/bwrap-only-spawn.mjs:10-26` launches `/usr/bin/bwrap` directly with `--ro-bind / / --dev /dev --proc /proc --unshare-pid --clearenv --die-with-parent --setenv PATH /usr/bin`. It binds `/tmp` read-write for fixture repositories, state roots, and compile caches, and explicitly supplies the gates' required HOME/fixture environment entries. No systemd-run or cap-run is added to these sites. Named out-of-scope sites are unchanged.
- Expected detector: the frozen lane counter, `--set r48`, should reject each site for `no_capped_scope_ancestor`. Actual additional structural rejection reasons are `no_cap_run_ancestor`, `uncapped_exec`, and uncapped direct children. These are not incidental failures. The mutant has neither `no_bwrap_ancestor` nor `canary_in_env` in its SITE reasons.

## Exact scoring command and verbatim receipt

Working directory: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly`.

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane d34f0c13647a4267fff2c60b35fb249e9d54caa4 --set r48
```

The command's stdout and stderr were captured together directly to `.ufo/waves/round-48/build/CtlBwrapOnly-receipt.txt`; its actual return code, `/proc/loadavg` first field, and UTC completion time were appended. Receipt lines 1-14:

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=27 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=102 resumed=12 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=1424 resumed=41 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1424 resumed=28 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1424 resumed=42 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=120 resumed=12 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=120 resumed=11 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=120 resumed=11 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=d34f0c13647a4267fff2c60b35fb249e9d54caa4 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=54.44 end=11:56:23Z
```

## Pristine and restored detector runs

The same bounded detector was run on pristine and restored bytes, with this exact command each time (same working directory as above):

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Pristine evidence: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/CtlBwrapOnly-pristine.txt:9-14`:

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=42.82 end=11:54:07Z
```

Restored evidence: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/CtlBwrapOnly-restored.txt:9-14`:

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=59.04 end=11:58:12Z
```

Both logs' RUN lines 1-8 show every gate exit 0, full cases, `verdict_pass=true`, and `fail_lines=0`. The detector's internal base run also passed in each of all three invocations.

## Before/after hashes and exact restoration

SHA-256 values:

| File | Pristine | Mutated | Restored |
|---|---|---|---|
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `6c7709083410baae1b5478f97320b2a709d6fcb3f60d0e014c6900876d8f932f` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `6c8a79e2eba2de7cbbc521642a298411e945d4d303ce9dbf4b81cbb47a93607c` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |
| `scripts/bwrap-only-spawn.mjs` | absent | `44a85d051f9a0650f6f2a7d5c573a653b54e9c5add223c0748aa21fb2a75c251` | absent |

Exact in-memory byte comparison with the pristine snapshots returned true for both existing files; the added helper was absent after restoration. The lane's frozen counter SHA-256 was `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` before and after; its sandbox frozen copy matched before the probe. The executed counter was always the lane's absolute path, never a modified or sandbox copy.

Setup, commit, export and restoration commands (git environment variables unset before clone writes; all writes confined to this sandbox except the three required lane artifacts):

```sh
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE
mkdir -p /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly
git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane add -- /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane/scripts/round-gate.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane/scripts/surface-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane/scripts/bwrap-only-spawn.mjs
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane -c user.name=ctl -c user.email=ctl@local commit -m 'r48 control: route four C1 sites through bwrap without scope'
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..d34f0c13647a4267fff2c60b35fb249e9d54caa4
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane branch CtlBwrapOnly d34f0c13647a4267fff2c60b35fb249e9d54caa4
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlBwrapOnly/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

`format-patch` exited 0; stdout was captured to the named patch. The commit output was `3 files changed, 32 insertions(+), 4 deletions(-)` and `create mode 100644 scripts/bwrap-only-spawn.mjs`.

## Bounds and tooling

- `df -h /fast`: 70G available before work (no large build performed).
- All three detector runs used `timeout -k 10 1500`; the frozen counter also bounds each traced suite and its logs. No other test/selftest/counter/strace invocation was run.
- On completion, process groups 3034465 (pristine), 3255148 (mutated), and 3684952 (restored) were each absent; no started process tree remained.
- No tools installed or updated. Existing bubblewrap was 0.13.1 and git 2.56.0. No package transaction, service restart, lane/fleet git write, sibling edit, or UFO/Devin runtime invocation was made.
