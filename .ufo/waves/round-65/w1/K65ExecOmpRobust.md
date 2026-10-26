VERDICT: The frozen C2 probe is measurably wrong on 7 of the 12 required failure arms (unbound `HOME` exits 1 after printing 2 keys, a hanging `--version` never returns, a text-file / nonzero-exit / unreadable "real" or an unnamed wrapper all yield `DONE`, and a late failure prints a partial key set) plus 4 more (junk version accepted, timeout ignored, unreadable wrapper accepted, unchecked `sed`); the patched probe passes all 27 arms plus the freeze-compat row (28/28, exit 0), and its happy-path key set is byte-identical to the frozen receipt.

## Evidence

Pre-fix probe (frozen bytes, sha256 `8774640580b56fcb454281d68465a687a779cebb0b8410cd418d5e4cb03117e3`) vs patched
`build/K65ExecOmpRobust/omp-binary-probe.v2.sh` (sha256 `cbe63e886dddaae2807d44a49aea39907850a88a6b33940a5f39a3bcb4fda169`).

```
$ bash .ufo/waves/round-65/build/K65ExecOmpRobust/omp-binary-probe.v2.sh ; echo rc=$?
… 15 OMP_BIN: keys …
OMP_BIN_PROBE: DONE omp=18.12.6
rc=0
$ diff <(grep '^OMP_BIN' v2-out.txt) <(grep '^OMP_BIN' .ufo/waves/round-65/base/omp-binary-probe-freeze.txt)
IDENTICAL-TO-FREEZE          # A00f row below; the O6 comparison surface is unchanged

$ bash .ufo/waves/round-65/build/K65ExecOmpRobust/arms.sh ; echo ARMS-RC=$?
A00 … A25 + A00f: PASS each   (full table: build/K65ExecOmpRobust/arms-table.txt)
ARMS: rows=28 fail=0 skip=0 target=omp-binary-probe.v2.sh orig=omp-binary-probe.v1.sh
ARMS-RC=0

$ patch -p1 -d <scratch-with-frozen-script> --dry-run < build/K65ExecOmpRobust/omp-binary-probe.diff
checking file scripts/omp-binary-probe.sh
patch-dryrun-rc=0   (applied copy sha256 == v2 sha256)
```

Negative-control table (`orig` = frozen script under the same arm; `v2` = patched). Contract judged per arm: rc 0 with all 15
keys + final `DONE`, or rc 2 with `FAIL-CLOSED <reason>` as the only line and no `OMP_BIN:` keys.

| arm | orig (rc/last line) | v2 (rc/last line) |
|---|---|---|
| A10 HOME unset | **1** / `OMP_BIN: wrapper_names_real=omp.real` + `line 22: HOME: unbound variable` | 2 / `FAIL-CLOSED real-unidentified` |
| A08 real hangs (probe timeout 2s) | **124 HANG** (6 keys printed, no verdict) | 2 / `FAIL-CLOSED version-timeout` |
| A05 real is a text script | **0** / `DONE omp=9.9.9`, `real_is_elf=0` | 2 / `FAIL-CLOSED real-not-elf` |
| A07 real prints then exits 1 | **0** / `DONE omp=9.9.9` | 2 / `FAIL-CLOSED version-exit-1` |
| A15 real exec-only, unreadable | **0** / `DONE omp=1.2.3`, `real_bytes=` empty, 8 zeros, 8× `grep: … Permission denied` | 2 / `FAIL-CLOSED real-unreadable` |
| A06 silent ELF, empty --version | 2 / 6 keys then `FAIL-CLOSED version-unreadable` | 2 / `FAIL-CLOSED version-unreadable` (single line) |
| A02b wrapper without `BIN=`, no override | **0** / `DONE omp=18.12.6` (`wrapper_names_real=none`) | 2 / `FAIL-CLOSED real-unidentified` |
| A22 wrapper unreadable (0000) | **0** / `DONE omp=1.2.3` (`wrapper_is_script=0`) | 2 / `FAIL-CLOSED wrapper-unreadable` |
| A25 PATH lacking sed | **0** / `DONE omp=1.2.3`, `sed: command not found`, `wrapper_names_real=none` | 0 / `DONE omp=1.2.3`, `wrapper_names_real=omp.real` |
| A17 real prints `not-a-version` | **0** / `DONE omp=not-a-version` | 2 / `FAIL-CLOSED version-shape` |

Other arms pass both: A00 host, A01 wrapper absent, A02 wrapper without BIN= + override, A03 real absent, A04 real 0644,
A09 HOME unset + overrides (`DONE`), A11 grep off PATH, A12 wrapper symlink loop, A13 paths with spaces (`DONE`), A14 real is
a dir, A16 `env -i`, A18 wrapper is a dir, A19 version on stderr only, A20 `timeout` off PATH, A21/A24 invalid/oversized
`OMP_BIN_TIMEOUT`, A23 real symlink loop. Frozen files were not edited (`plan.md`, `probe/*`, `base/*`, `controls/*`).

## Findings

**K65ExecOmpRobust-1 (CRITICAL)** — `set -u` unbound `$HOME`: `R="${OMP_BIN_REAL:-$HOME/.local/bin/omp.real}"` aborts with
`line 22: HOME: unbound variable`, exit 1, after two `OMP_BIN:` keys are already on stdout. Repro: `env -u HOME bash
build/K65ExecOmpRobust/work/omp-binary-probe.v1.sh; echo $?` → `1`. Arm A10; v2 uses `${HOME:-}` and the wrapper-named
default, failing `real-unidentified` instead.

**K65ExecOmpRobust-2 (CRITICAL)** — no timeout on `--version`: the probe blocks forever; the frozen C2 counter spawns it with
`timeout: 180000`, so O6 would read `probe-exit=null` with no verdict line. Repro: `OMP_BIN_WRAPPER=…/good-wrapper
OMP_BIN_REAL=…/stub/hang timeout 3 bash …/work/omp-binary-probe.v1.sh; echo $?` → `124`, six keys printed. v2 runs
`timeout -k 5 "$OMP_BIN_TIMEOUT"` (default 60, capped at 150s) → `version-timeout` in ~2s (A08).

**K65ExecOmpRobust-3 (HIGH)** — a non-ELF "real" is executed anyway: v1 prints `real_is_elf=0` then runs the file, so a
`#!/bin/sh` shim printing `omp/9.9.9` produces a complete 15-key `DONE omp=9.9.9` (A05). Contradicts the header's "never
executes anything but `<binary> --version`" and lets any shim fabricate the measured release. v2 fails `real-not-elf` before
executing.

**K65ExecOmpRobust-4 (HIGH)** — `--version` exit status is masked by `| head -n 1`; a real that prints `omp/9.9.9` and exits
1 reads as `DONE` (A07). v2 captures the pipeline status under `pipefail` and fails `version-exit-1`.

**K65ExecOmpRobust-5 (HIGH)** — only `[ -x ]` is checked, not readability: with a 0111 real, `wc -c` fails (`real_bytes=`),
every byte sweep reports `0` while eight `grep: … Permission denied` lines go to stdout, and the probe still exits 0 `DONE`
(A15). v2 requires `-r`, and each count validates the grep exit status so an I/O error cannot read as "absent".

**K65ExecOmpRobust-6 (HIGH)** — keys are emitted as they are discovered, so every late failure leaves a partial set a reader
can mistake for a measurement: six keys precede `FAIL-CLOSED version-unreadable` (A06) and six keys precede an indefinite
hang (A08). v2 buffers all keys and prints them only immediately before `DONE`; the judge asserts a fail line is the only
line.

**K65ExecOmpRobust-7 (MEDIUM)** — wrapper without `BIN=`: v1 still measures `$HOME/.local/bin/omp.real` and reports
`DONE omp=18.12.6` with `wrapper_names_real=none`, attributing a version to a binary the wrapper never names (A02b). v2
fails `real-unidentified` unless `OMP_BIN_REAL` is explicit (A02 still `DONE` with `wrapper_names_real=none`). The installed
wrapper names `omp.real`, so the O6 run on this host is unaffected (A00f PASS).

**K65ExecOmpRobust-8 (MEDIUM)** — an unreadable wrapper (chmod 000) is reported as `wrapper_is_script=0`,
`wrapper_names_real=none` and `DONE` (A22); v1's `head`/`grep` errors are suppressed. v2 fails `wrapper-unreadable`.

**K65ExecOmpRobust-9 (MEDIUM)** — `sed` is used at line 16 but absent from the util guard: with a PATH lacking `sed`, v1
prints `sed: command not found`, derives `wrapper_names_real=none` from an empty `DEF`, and still reports `DONE` — a wrong
key instead of fail-closed (A25). v2 removes the dependency (pure-bash `${DEF#BIN=}`) and needs only
grep/wc/tr/awk/head/timeout; the same PATH now yields `wrapper_names_real=omp.real`.

**K65ExecOmpRobust-10 (LOW)** — loose version acceptance and vague reasons: v1 accepts any first stdout line
(`DONE omp=not-a-version`, A17) and collapses symlink loops, directories and non-executable files into
`wrapper-absent`/`real-absent`, while ignoring `OMP_BIN_TIMEOUT` entirely (A21/A24). v2 shape-checks
`^omp/[0-9]+\.[0-9]+\.[0-9]+…$` (`version-shape`), names `wrapper-symlink-loop`/`wrapper-is-dir`/`wrapper-unreadable`/
`real-symlink-loop`/`real-is-dir`/`real-not-executable`/`real-unreadable`, and rejects invalid or >150s timeouts
(`timeout-invalid`/`timeout-too-large`). All remain exit 2.

## Artifacts

- `.ufo/waves/round-65/build/K65ExecOmpRobust/omp-binary-probe.v2.sh` — patched probe (`cbe63e88…`), drop-in for `scripts/omp-binary-probe.sh`.
- `.ufo/waves/round-65/build/K65ExecOmpRobust/omp-binary-probe.diff` — unified diff `a/scripts/omp-binary-probe.sh → b/…` (`804b98c8…`, +98/−31), applies with `patch -p1`/`git apply`.
- `.ufo/waves/round-65/build/K65ExecOmpRobust/arms.sh` — negative control: 27 arms + freeze-compat row, PASS/FAIL per arm, exit 0 iff all PASS (`478fcb1c…`).
- `.ufo/waves/round-65/build/K65ExecOmpRobust/arms-table.txt` (`f56f6911…`) and `arms-run.log` — last run's table and transcript.
- `.ufo/waves/round-65/build/K65ExecOmpRobust/work/omp-binary-probe.v1.sh` — byte-identical copy of the frozen lane script (`87746405…`), used as the negative control.
- Scratch: `/tmp/kumitate-r65/K65ExecOmpRobust/` (fixtures are rebuilt by `arms.sh`; only small ELF stubs, no copies of the 256 MB binary).
- Tool installs: none.

## Limits

- No counter was run: C2's `omp65-probe.mjs` needs the entry, rows and revision M that do not exist yet; only the O6 surface
  (exit 0 + identical key/value set) was proven, not the counter itself.
- The patch is not integrated (L1 owns `scripts/`); `scripts/omp-binary-probe.sh` is untouched (hash unchanged).
- Stubs are synthetic ELF binaries compiled with `/usr/bin/cc`; no arm covers a `--version` writing more than 4096 bytes
  (v2 would fail `version-exit-141`), non-GNU coreutils, or a non-Linux host.
- A08's orig run leaves the bounded 25s hang stub orphaned briefly after the harness kills the probe.
- v2 is deliberately stricter (wrapper must name `omp.real` or `OMP_BIN_REAL` must be set; error reasons renamed/added);
  no consumer parses reasons — the frozen counter only checks exit status and keys.
- Per wave policy I ran no build/lint/test suite beyond `bash -n` and the arm harness.
