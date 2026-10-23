RESULT CtlCountPad verdict=inconclusive

## Outcome

The assigned negative control was rejected for the targeted `uncapped_exec` condition at every site: `held=0/4`, exit 1. No site read `ROUTED_HELD`; no counter invocation exited 2. All owning-gate selftests passed, and every reported site execution count equaled its base count. This is a successful targeted negative-control rejection, not an incidental selftest failure.

The strict pristine/mutated/restored mutation-kill classification is **inconclusive**, not killed: the frozen pristine tree intentionally has no C1 routing and itself reads `held=0/4`. No C1 candidate was scored. Axes: C1 operability (per-exec ancestry despite count padding) and containment/exact-byte restoration.

## Mutant and expected detector

- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlCountPad/lane`.
- Frozen parent: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Runnable control commit: `ab68c4f67621cbfe345c17d88d3bf97e2b02e090`, retained by sandbox branch `CtlCountPad`.
- Export: `.ufo/waves/round-48/build/CtlCountPad.patch`; SHA-256 `619dec0d11393204388be6240d13e18f7f995133334dc0f3e70f8d808a012359` (matches a fresh `git format-patch --stdout` hash).
- At that commit, `scripts/ctl-count-pad.mjs:15-29` alternates raw `spawnSync` work with `capSpawnSync` work. Nested-suite parity makes the split exactly half for the one-call-per-suite surface readers as well. The capped work uses an interpreter `--`; an additional routed launch of the same command and original arguments has deliberately ignored output.
- Wiring at that commit: `scripts/round-gate.mjs:743-745`, `scripts/surface-probe.mjs:492-499`, `scripts/surface-probe.mjs:521-533`, and `scripts/surface-probe.mjs:1595-1598`.
- Count padding is measured against the frozen counter's positional site matcher (`.ufo/waves/round-48/probe/caproute48-probe.mjs:63-70`): the flagged real capped invocation does not match, while the extra capped duplicate does. Raw half plus routed padding half equals base `n` (116, 2, 2, 14). This does **not** claim that all physical kernel execs stay constant; runner machinery and extra launches necessarily increase those totals (round-gate 1308 → 2335, surface-probe 54 → 190).
- Expected detector: every site `ROUTED_MISS` with `uncapped_exec`, even when `.ufo/waves/round-48/probe/caproute48-probe.mjs:364` finds no count mismatch. The per-exec capped comparison at line 365 and the raw-direct-child guard at line 366 must reject it. Caps and explicit environments on the routed branch use the unmodified `cap-spawn.mjs` / `cap-run.mjs` contract.

## Frozen-counter score (verbatim)

Source: `.ufo/waves/round-48/build/CtlCountPad-receipt.txt:9-14`.

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=58/116,58/116,58/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=29,29,29 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=29
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=1/2,1/2,1/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=6,6,6 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=6
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=1/2,1/2,1/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=6,6,6 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=6
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=7/14,7/14,7/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=6,6,6 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=6
CAPROUTE48 rev=ab68c4f67621cbfe345c17d88d3bf97e2b02e090 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=55.36 end=11:58:38Z
```

The receipt's lines 1-8 show every base/rev owning-gate run exiting 0, `verdict_pass=true`, `fail_lines=0`; round-gate retained 61/61 cases and surface-probe 46/46. `exec_count_ne_base`, gate failures, and summary failures are absent. The additional reasons above are direct consequences of the deliberately raw half, not incidental failures. No condition substitution is needed: the intended `uncapped_exec` detector actually fired in all three runs of all four sites.

## Commands and three-phase evidence

All commands used absolute paths; cwd was `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlCountPad` for the detector runs. `GIT_DIR`, `GIT_WORK_TREE`, and `GIT_INDEX_FILE` were unset. The same unedited lane counter was used for each phase, with the same 1500-second outer bound and 10-second kill grace. Tool-captured output was written verbatim to the named receipts, with the shell's exit/load/end trailer.

Pristine:

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlCountPad/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

`.ufo/waves/round-48/build/CtlCountPad-pristine-receipt.txt:9-14` records all four sites `ROUTED_MISS`, with capped/n 0/116, 0/2, 0/2, 0/14 in every run, passing selftests, and:

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=35.64 end=11:53:41Z
```

Mutated (213.05 seconds):

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlCountPad/lane ab68c4f67621cbfe345c17d88d3bf97e2b02e090 --set r48
```

The complete mutated receipt is quoted above. Pristine took 52.40 seconds.

Restored (48.28 seconds):

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlCountPad/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

`.ufo/waves/round-48/build/CtlCountPad-restored-receipt.txt:9-14` records the same four site misses and capped/n 0/116, 0/2, 0/2, 0/14 as pristine, with passing selftests, and:

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=43.51 end=11:59:41Z
```

Each invocation used this trailer, after saving `rc=$?`:

```sh
echo "exit=$rc load1=$(cut -d\  -f1 /proc/loadavg) end=$(date -u +%TZ)"
```

Sandbox-only commit command:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlCountPad/lane add scripts/round-gate.mjs scripts/surface-probe.mjs scripts/ctl-count-pad.mjs
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlCountPad/lane -c user.name=ctl -c user.email=ctl@local -c commit.gpgsign=false commit -m "round-48 CtlCountPad negative control"
```

Observed:

```text
[detached HEAD ab68c4f] round-48 CtlCountPad negative control
 3 files changed, 41 insertions(+), 5 deletions(-)
 create mode 100644 scripts/ctl-count-pad.mjs
ab68c4f67621cbfe345c17d88d3bf97e2b02e090
```

Export command (captured stdout written to `CtlCountPad.patch`):

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlCountPad/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..ab68c4f67621cbfe345c17d88d3bf97e2b02e090
```

## Exact restoration and hashes

Restoration command, inside this sandbox only:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlCountPad/lane branch CtlCountPad ab68c4f67621cbfe345c17d88d3bf97e2b02e090
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlCountPad/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

`sha256sum` before mutation, after mutation, and after restoration:

| File | Pristine | Mutated | Restored |
|---|---|---|---|
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `337d917571f9c4eac52d19250752846bb8b28c8052d012ee701144f37de50b50` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `0e630b6f478f2757c4e97c274e28556ed2f3c337c48b69182afa99a660248f04` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |
| `scripts/ctl-count-pad.mjs` | absent | `b808934e6c9402d9c2a2fee8ea190dc38a12317a2ef08758290fb402fdf489dc` | absent |

The lane counter SHA-256 before mutation and after restoration was `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`; the restored freeze clone's counter had the identical hash. Restoration output is retained at `.ufo/waves/round-48/build/CtlCountPad-restoration-receipt.txt:1-5`, ending:

```text
RESTORED helper_absent=true head=fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

All three bounded detector jobs completed. No persistent services or detached workloads were started by this seat. No sibling source, lane/fleet git metadata, counter, manifest, templates, or state were edited. Lane writes were limited to this report, the named receipts, and the patch. `df -h /fast` reported 70G available before work. Tool installs/updates: none.
