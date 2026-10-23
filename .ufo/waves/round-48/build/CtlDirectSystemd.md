RESULT CtlDirectSystemd verdict=inconclusive

## Control result

The assigned negative control was rejected for the targeted reason at all four sites: `no_cap_run_ancestor`. The frozen counter reported `held=0/4`, exit 1; no site was ROUTED_HELD and no invocation exited 2. There was no incidental selftest failure: all three mutated runs passed the original 61/61 round-gate and 46/46 surface-probe cases, with the original per-site child counts.

The strict mutation-test classification is **inconclusive, not killed**: the pristine and restored freeze also exit 1 with `held=0/4`, because those four sites are intentionally unrouted at the freeze. The control nevertheless exercises and observes the intended missing-runner rejection. No C1 candidate was scored and no contract was changed.

Axes: operability, frozen-detector fidelity, isolation/restoration.

## Mutant and expected detector

- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDirectSystemd/lane`.
- Frozen parent: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Runnable control commit: `9d3935a1320ab74e2cddd591d4e4458594dd3d2a`, retained by sandbox branch `r48-ctl-direct-systemd`.
- Only the sandbox was edited/committed. Its RG742, SP491, SP519 and SP1592 calls use the in-process `directSystemdSpawnSync` helper. At the control revision, the helper is `scripts/ctl-direct-systemd.mjs:6-23`; the four calls are `scripts/round-gate.mjs:743` and `scripts/surface-probe.mjs:492,521,1595`.
- The helper directly spawns `/usr/bin/systemd-run --user --scope --quiet`, with `MemoryMax=512M`, `MemorySwapMax=0`, `TasksMax=64`, then `env -i PATH=/usr/bin bwrap`. It preserves cap-run's mount/PID/environment flags, command resolution/argv0, fixture binds and explicit required environment. There is no intervening node cap-run process. `scripts/cap-run.mjs` and `scripts/cap-spawn.mjs` were not edited.
- Expected detector: plan `.ufo/waves/round-48/plan.md:53-62`, and frozen counter `.ufo/waves/round-48/probe/caproute48-probe.mjs:280-310`, especially `:296-306` (`no_cap_run_ancestor`). The independent direct-child condition at `:263-277,366` must also reject these direct systemd launches.

The measured MISS is targeted, not incidental: the mutant's only reason families are `no_cap_run_ancestor`, its `uncapped_exec` consequence, and `uncapped_direct_children`. There are no missing-scope/bwrap, canary, count, summary or selftest reasons. Even without the independent direct-child rejection, the required cap-run ancestry condition would reject this control.

## Frozen-counter output (verbatim)

Receipt: `.ufo/waves/round-48/build/CtlDirectSystemd-receipt.txt:1-14`.

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=30 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=3 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=1656 resumed=61 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1656 resumed=54 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1656 resumed=38 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=108 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=108 resumed=2 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=108 resumed=4 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=9d3935a1320ab74e2cddd591d4e4458594dd3d2a base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=58.68 end=11:58:01Z
```

Pristine receipt `.ufo/waves/round-48/build/CtlDirectSystemd-pristine-receipt.txt:1-14`: all owning-gate selftests passed; all four sites were ROUTED_MISS with absent bwrap/scope/runner ancestry, canary leakage and uncapped-child reasons. Final lines, verbatim:

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=43.78 end=11:54:17Z
```

Restored receipt `.ufo/waves/round-48/build/CtlDirectSystemd-restored-receipt.txt:1-14`: all owning-gate selftests passed; all SITE lines equal the pristine SITE lines. Final lines, verbatim:

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=45.53 end=11:59:18Z
```

## Commands exercised

Every detector command used cwd `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDirectSystemd`; `GIT_DIR`, `GIT_WORK_TREE` and `GIT_INDEX_FILE` were unset. The same unedited lane counter and 1500-second bound were used on pristine, mutated and restored archives, in that order:

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDirectSystemd/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-pristine-receipt.txt 2>&1; echo "exit=$? load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-pristine-receipt.txt

timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDirectSystemd/lane 9d3935a1320ab74e2cddd591d4e4458594dd3d2a --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-receipt.txt 2>&1; echo "exit=$? load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-receipt.txt

timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDirectSystemd/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-restored-receipt.txt 2>&1; echo "exit=$? load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-restored-receipt.txt
```

Commit command (after adding only the three control files):

```sh
git -c user.name=ctl -c user.email=ctl@local -c commit.gpgsign=false -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDirectSystemd/lane commit -m 'r48 control: launch capped scopes directly without cap-run ancestor'
```

Actual commit output:

```text
[detached HEAD 9d3935a] r48 control: launch capped scopes directly without cap-run ancestor
 3 files changed, 37 insertions(+), 8 deletions(-)
 create mode 100644 scripts/ctl-direct-systemd.mjs
```

Export command: `git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDirectSystemd/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..9d3935a1320ab74e2cddd591d4e4458594dd3d2a`. Its captured stdout was written without modification to `.ufo/waves/round-48/build/CtlDirectSystemd.patch` (6155 bytes), SHA-256 `ba4ebcad3da3fc19be122469c88886992a25166c4ff8c7d4bf9d69809b0f1c7a`.

## Exact restoration and containment evidence

Restoration ran in the candidate detector's `finally` block, before the restored detector:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDirectSystemd/lane branch r48-ctl-direct-systemd 9d3935a1320ab74e2cddd591d4e4458594dd3d2a
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDirectSystemd/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

Both commands exited 0. SHA-256 observations from `sha256sum`:

| File | Pristine | Mutated | Restored |
|---|---|---|---|
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `7a7e35b3103b1858e7c24857ef619b5e52090ff030e46f85536123943eed14dd` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `14556a21f563a5980d10231756b29a50873c24ef3e32eca360875448fc206a1e` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |
| `scripts/ctl-direct-systemd.mjs` | absent | `588033584f33d594699ee68e5b3a622ececfde84326f376e5ce352a7789eed94` | absent |

`test ! -e /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDirectSystemd/lane/scripts/ctl-direct-systemd.mjs` exited 0 after restoration. The cap-run source stayed at SHA-256 `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758`. The lane counter and frozen clone counter initially matched SHA-256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`; the lane counter still had that hash after scoring the control.

Cleanup observations after all three detectors:

- `timeout -k 10 30 systemctl --user list-units --all --no-legend --plain 'ctl-direct-systemd-*.scope'`: exit 0, empty stdout (no retained control scopes).
- `pgrep -a -g 3105067,3457758,3953810`: exit 1, empty stdout (no members of the three started detector process groups).
- All three receipt-writer processes were waited/reaped. No started process tree remained observable by these checks.
- Initial `df -h /fast`: `/dev/nvme1n1p2 804G 734G 70G 92% /fast`.
- Tool installations/updates: none. No git/jj writes occurred outside the isolated sandbox; lane writes were limited to this report, the three named receipts and the named patch.
