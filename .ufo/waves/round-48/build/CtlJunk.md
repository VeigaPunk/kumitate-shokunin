RESULT CtlJunk verdict=INCONCLUSIVE_BASELINE_MISS

## Findings

An initial **pristine-only** counter attempt exited **2**, emitting no SITE lines or scored CAPROUTE48 summary. This was an operator-wrapper mistake: `ulimit -f 32768` lowered the inherited hard FSIZE limit, preventing the frozen counter's `prlimit --fsize=4294967296` from setting its limit. It is preserved, not counted as a score, in `.ufo/waves/round-48/build/CtlJunk-pristine-initial-receipt.txt:1-3`:

```text
CAPROUTE48: ERROR no strace log for round-gate (base0); status=1 prlimit: failed to set the FSIZE resource limit: Operation not permitted

exit=2 load1=22.33 end=11:52:58Z
```

With the wrapper corrected to set **only the soft limit**, the committed junk control was rejected for the **targeted reason**: every site was ROUTED_MISS with `gate_exit=1`, no final PASS, and no owning-suite summary (`cases=-1/-1`). The counter exited **1**, not 2; **no site was ROUTED_HELD**. This is the expected negative-control outcome, not an unrelated failing selftest: all six mutated gate runs recorded `fail_lines=0`, only one exec, and no child execs. The additional `selftest_cases_below_base` reason follows from the missing summary.

Comparative mutation verdict is **inconclusive**, not “killed”: the pristine and exactly restored freeze both already fail ROUTED_HELD (`held=0/4`, exit 1), although their actual gate suites pass. This pre-data control demonstrates targeted rejection of junk; it does not establish a passing C1 baseline or score a C1 candidate.

Axes: operability (assigned), detector specificity, containment, exact-byte restoration. No contract, counter, or candidate implementation was changed.

## Mutant and frozen detector

- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk/lane`.
- Parent/freeze: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- **Control commit: `7d55b45eef489cb3b9045ea1889ffa2a800243f8`.**
- Restoration commit: `da906e540b71e65a602e1f22824f5a6abd2296c4`.
- Mutated only two behavior-bearing inputs, appending independently randomized ASCII junk with guaranteed non-JavaScript `@@@` delimiters:
  - `scripts/round-gate.mjs:1548`: `@@@CtlJunk_1bd12d1194cd461da2d7a8bfe11ab9a4@@@`
  - `scripts/surface-probe.mjs:1881`: `@@@CtlJunk_01bfcb8d22434b1aa44f6e3ccc572845@@@`
- Patch: `.ufo/waves/round-48/build/CtlJunk.patch:1-34`. Surface-probe originally had no trailing newline; the patch retains that EOF convention on its appended junk line. The edit tool explicitly reported newly introduced syntax errors in both gates, as intended for this junk control.
- Used the lane's frozen counter directly at `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs`, never an edited copy. SHA-256 before and after was `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`; `git show fe3d45bf929246915c8c0de5f7f8682b5015b22c:.ufo/waves/round-48/probe/caproute48-probe.mjs | sha256sum` in the sandbox returned the same hash.
- Expected detector: plan `.ufo/waves/round-48/plan.md:53-62`, counter header `:5-19`, and counter rejection conditions `:362-370`. The targeted conditions are gate exit, final PASS, and owning-suite case summary; absence/count of child execs also rejects this control. The junk run reached those targeted conditions, so there is no incidental failure that needs to be hypothetically removed.

## Commands and bounds

All paths below are absolute. Git environment variables were unset for clone/commit/export operations and absent from the detector wrapper's environment. Clone creation:

```sh
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE && mkdir -p /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk/lane && git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

Control creation after the two append edits:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk/lane add -- scripts/round-gate.mjs scripts/surface-probe.mjs
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk/lane -c user.name=ctl -c user.email=ctl@local commit -m 'Control CtlJunk: append invalid JavaScript to both gates'
```

All four detector invocations used cwd `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk`. Initial failed invocation used the first pristine command below, but preceded it with `ulimit -f 32768`; its receipt was preserved separately. The three comparable invocations each used `ulimit -S -f 32768` followed by the corresponding exact command:

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-pristine-receipt.txt 2>&1
rc=$?
echo "exit=$rc load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-pristine-receipt.txt
```

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk/lane 7d55b45eef489cb3b9045ea1889ffa2a800243f8 --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-receipt.txt 2>&1
rc=$?
echo "exit=$rc load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-receipt.txt
```

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk/lane da906e540b71e65a602e1f22824f5a6abd2296c4 --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-restored-receipt.txt 2>&1
rc=$?
echo "exit=$rc load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-restored-receipt.txt
```

Export used the original mutant, not the restoration commit:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..7d55b45eef489cb3b9045ea1889ffa2a800243f8 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk.patch
```

`format_patch_exit=0`. Each detector wrapper completed with `wrapper_exit=0`; its actual counter exit is the receipt's `exit=` value, not the wrapper status. No timeout was reached.

## Scored control output — verbatim

`.ufo/waves/round-48/build/CtlJunk-receipt.txt:3-14`:

```text
RUN round-gate rev0 exit=1 cases=-1/-1 execs=1 resumed=0 verdict_pass=false fail_lines=0
RUN round-gate rev1 exit=1 cases=-1/-1 execs=1 resumed=0 verdict_pass=false fail_lines=0
RUN round-gate rev2 exit=1 cases=-1/-1 execs=1 resumed=0 verdict_pass=false fail_lines=0
RUN surface-probe rev0 exit=1 cases=-1/-1 execs=1 resumed=0 verdict_pass=false fail_lines=0
RUN surface-probe rev1 exit=1 cases=-1/-1 execs=1 resumed=0 verdict_pass=false fail_lines=0
RUN surface-probe rev2 exit=1 cases=-1/-1 execs=1 resumed=0 verdict_pass=false fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=116 cases=-1/-1,-1/-1,-1/-1 base_cases=61/61 uncapped_direct=0,0,0 reason=gate_exit=1,no_child_exec,exec_count_ne_base,no_final_verdict_pass,selftest_cases_below_base
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=2 cases=-1/-1,-1/-1,-1/-1 base_cases=46/46 uncapped_direct=0,0,0 reason=gate_exit=1,no_child_exec,exec_count_ne_base,no_final_verdict_pass,selftest_cases_below_base
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=2 cases=-1/-1,-1/-1,-1/-1 base_cases=46/46 uncapped_direct=0,0,0 reason=gate_exit=1,no_child_exec,exec_count_ne_base,no_final_verdict_pass,selftest_cases_below_base
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=14 cases=-1/-1,-1/-1,-1/-1 base_cases=46/46 uncapped_direct=0,0,0 reason=gate_exit=1,no_child_exec,exec_count_ne_base,no_final_verdict_pass,selftest_cases_below_base
CAPROUTE48 rev=7d55b45eef489cb3b9045ea1889ffa2a800243f8 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=50.18 end=11:55:55Z
```

## Pristine and restored observations

The same bounded frozen detector ran before mutation and after exact restoration. Complete records, including every SITE line, are retained in `.ufo/waves/round-48/build/CtlJunk-pristine-receipt.txt:1-14` and `.ufo/waves/round-48/build/CtlJunk-restored-receipt.txt:1-14`. In both, all three revision runs per gate exit 0 with PASS, round-gate 61/61 and surface-probe 46/46; all four SITE labels are ROUTED_MISS for the pre-existing missing route/ancestor and canary conditions, not a suite failure.

Pristine summary, verbatim:

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=45.09 end=11:54:33Z
```

Restored summary, verbatim:

```text
CAPROUTE48 rev=da906e540b71e65a602e1f22824f5a6abd2296c4 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=56.53 end=11:57:48Z
```

## Restoration evidence

Removed exactly the appended lines using the edit tool, retaining the original EOF conventions, then committed the restoration only in the sandbox. Actual `sha256sum` outputs establish original/mutant/restored bytes:

| File | Pristine SHA-256 | Mutant SHA-256 | Restored SHA-256 |
|---|---|---|---|
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `9e1b6cddbbd371adaf26eb82d3f53c05e8bb6e2620916607e644bd774dea286a` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `197062fd29b082f86f09c9a411c66b6a63d3a5371f99e4f82c698a19730c136c` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |

Command:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk/lane rev-parse HEAD 'fe3d45bf929246915c8c0de5f7f8682b5015b22c^{tree}' 'HEAD^{tree}'
```

Verbatim output, proving the entire restored committed tree equals the frozen tree:

```text
da906e540b71e65a602e1f22824f5a6abd2296c4
be1455f0631ea8c2b53cb50f5105327c51bb7ab1
be1455f0631ea8c2b53cb50f5105327c51bb7ab1
```

Retained evidence SHA-256:

```text
82cee68918377e3689237868310948aa76173af42640021980075e69fe5b54b3  CtlJunk.patch
8fa7da10aafe2d4f435d9f307f644c6a0f261e868dbbeea703a2dc2f8d8a356d  CtlJunk-receipt.txt
c1be3b1d318646ef7b65adcbc5b638b28381348b9528e79924dd62701272980e  CtlJunk-pristine-receipt.txt
c5215aafba0ee1ebba38d716784de1f12d91b0ccf044753b10dd929839c3b8b5  CtlJunk-restored-receipt.txt
52f90b455a687a5799e72175b640d3da3a57027f7e153848f0ef4a2ec7444f08  CtlJunk-pristine-initial-receipt.txt
```

## Containment and tools

- `df -h /fast` before cloning/running: `/dev/nvme1n1p2 804G 734G 70G 92% /fast` (over the required 20 GB free).
- No lane/fleet Git writes, sibling edits, counter edits, integration, runtime dispatch, subagents, or additional test suites. Lane writes were only this report and the CtlJunk-named receipt/patch artifacts.
- All detector launches were awaited through process close. Final process query `pgrep -af '^([/[:alnum:]_.-]*/)?node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlJunk/lane '` produced no output, exit 1; no owned counter remained to kill.
- Installed/updated tools: **none**. Existing versions observed: Node `v24.21.0`, Git `2.56.0`, strace `7.2`. An ancillary `timeout --version` query exited 125 with `error: the following required arguments were not provided:` and `Usage: timeout <DURATION> <COMMAND>...`; this was not a detector run. The actual `timeout -k 10 1500` detector commands completed as recorded above.
