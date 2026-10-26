VERDICT: The C2 host instrument is byte-derived, not constant-derived — a same-length 8-byte date flip in a copy of the installed release moves exactly `lit_2025_11_25` (2→0) and `lit_2026_07_28` (0→2) and nothing else, a +4096-zero-byte copy moves only `real_bytes`, the byte-identical copy reproduces all 15 keys, and the frozen counter's O6 comparison fires on both lies while staying clean for the honest entry; the one weakness is that `real_version` comes from the executable's own output, so the version key alone cannot authenticate the release.

## Evidence

Frozen inputs attacked (read-only): lane HEAD `2ca91a0c81542cad5f731049aa55dd2f99ade98d`;
`sha256(scripts/omp-binary-probe.sh)=8774640580b56fcb454281d68465a687a779cebb0b8410cd418d5e4cb03117e3`,
`sha256(.ufo/waves/round-65/probe/omp65-probe.mjs)=688f5684c85e9e3b0075f1075f0b09736dc362286788c94bdc0057b3a1c967af`.
Installed binary read as bytes only; `OMP_NO_RESTART=1 <copy> --version` is the only program run.

1. Copies (`cp`, then `chmod 755`): `orig` sha256 `85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4`
= the installed binary's own sha256 (copy is lossless); `flip` = `python3 bytes.replace(b'2025-11-25', b'2026-07-28')` on the COPY only,
length unchanged 256702432, exactly **8** bytes differ at `0x5bc2343,0x5bc2345,0x5bc2346,0x5bc2349,0x959eac4,0x959eac6,0x959eac7,0x959eaca`
(contexts `2025…` and ` = "2025…`); `pad` = orig + 4096 NUL bytes, prefix byte-identical, len 256706528.
All three still run: `OMP_NO_RESTART=1 ./omp.real.{orig,flip,pad} --version` → `omp/18.12.6` each (no stub was needed).

2. `OMP_BIN_REAL=<copy> bash scripts/omp-binary-probe.sh` — all three exit 0, stderr empty. Original keys:
```
wrapper_is_script=1  wrapper_names_real=omp.real  wrapper_restart_codes=132-139  wrapper_max_restarts=5
real_is_elf=1  real_bytes=256702432  real_version=18.12.6
lit_2025_11_25=2  lit_2026_07_28=0  lit_2025_03_26=2
sym_MCP_PROTOCOL_VERSION=3  header_MCP-Protocol-Version=3  sym_DeferredMCPTool=3
collab_hosts_literal=2  docs_phrase_never_replayed=0
```
Full key diffs (`diff` of the `OMP_BIN: ` lines), both `diff_exit=1`:
```
=== original vs flipped-date copy ===        === original vs +4096-NUL copy ===
8,9c8,9                                      6c6
< lit_2025_11_25=2                            < real_bytes=256702432
< lit_2026_07_28=0                            ---
---                                           > real_bytes=256706528
> lit_2025_11_25=0
> lit_2026_07_28=2
```
No other key moved in either direction: the probe measures the release bytes, not a table of expected constants.

3. O6 comparison logic by hand, **verbatim**: `o6-hand-replay.mjs` slices the `// ---- O6 … // ---- O7` block out of the frozen counter
(34 lines, counter sha256 printed on each run) and evaluates it with `new Function`, supplying only `entryRaw, ids, rows, T, RELEASE_COMMIT,
join, existsSync, spawnSync, check` — no comparison line retyped or edited. `T` = the lane, so the block runs the lane's real probe; `rows` =
two scratch registry lines whose URLs carry `/v18.12.6/` and `/45c35e40…f99/`.
```
A entry true    + installed host          O6 ok=true  reasons=(none)                                     exit=0
B entry flipped + installed host          O6 ok=false reasons=O6 MISS lit_2025_11_25:stated=0:live=2;lit_2026_07_28:stated=2:live=0
C entry true    + OMP_BIN_REAL=flip copy  O6 ok=false reasons=O6 MISS lit_2025_11_25:stated=2:live=0;lit_2026_07_28:stated=0:live=2
D entry true    + OMP_BIN_REAL=pad copy   O6 ok=false reasons=O6 MISS real_bytes:stated=256702432:live=256706528
E entry true    + OMP_BIN_REAL=orig copy  O6 ok=true  reasons=(none)                                     exit=0
```
The comparison is symmetric, so it catches a lying entry (B) and a substituted host (C, D) with only the two moved keys.

4. Frozen counter end-to-end on a sandbox clone (`git clone --no-hardlinks`, commits made with `-C` inside the clone only), entry committed at
`dc53627a83ebb1a1ae6750df9358717476b5d34f` (true values) and `893158fb5cfcf83feb334c8e7888ca4ffd247e1d` (flipped values):
```
true   : OMP65_UNMET held=1/8 … | … | O6 MISS rows-pinned-to-installed-version=0<2 | …          exit=1
flipped: OMP65_UNMET held=1/8 … | … | O6 MISS lit_2025_11_25:stated=0:live=2;lit_2026_07_28:stated=2:live=0;rows-pinned…=0<2 | … exit=1
```
(O2–O5, O7, O8 also MISS on the fixture because only an entry stub was committed; O6 is the check under test.)

5. Fail-closed paths: absent real → `FAIL-CLOSED real-absent` exit 2; absent wrapper → `FAIL-CLOSED wrapper-absent` exit 2;
zero-byte executable real → `real_is_elf=0 real_bytes=0` then `FAIL-CLOSED version-unreadable` exit 2.

## Findings

**K65ExecProbeFlip-1 (info, confirmation).** The instrument is byte-derived: a same-length flip of the one literal pair under test moved exactly
`lit_2025_11_25`/`lit_2026_07_28` and no other key; a 4 KiB tail append moved only `real_bytes`. Reproduce:
`cp ~/.local/bin/omp.real /tmp/x && python3 -c "from pathlib import Path;p=Path('/tmp/x');b=p.read_bytes();p.write_bytes(b.replace(b'2025-11-25',b'2026-07-28'))" && OMP_BIN_REAL=/tmp/x bash scripts/omp-binary-probe.sh`.
No counter or probe change needed for C2 on this axis.

**K65ExecProbeFlip-2 (low, attacks O6's discriminating power).** `real_version` is parsed from the executable's own `--version` stdout, not from
bytes, so it cannot authenticate the release: the date-flipped copy still prints `omp/18.12.6`, and a 58-byte shell stub at the real path yields
`real_is_elf=0 real_bytes=58 lit_*=0 … real_version=18.12.6` and **exit 0** (the probe reports, it does not fail-closed, on a non-ELF host).
A host that only lies about its version passes the version key; only the literal/size keys catch it. Reproduce:
`printf '#!/bin/sh\n[ "$1" = --version ] && echo omp/18.12.6\nexit 0\n' > /tmp/stub && chmod 755 /tmp/stub && OMP_BIN_REAL=/tmp/stub bash scripts/omp-binary-probe.sh`.
Suggested (L1) strengthening, not applied here: O6/entry must not treat `real_version` as evidence of release identity — the entry should state that
`real_version` is behaviour-derived and that `real_bytes` + literals are the byte evidence (or the probe should add `real_sha256`).

**K65ExecProbeFlip-3 (info, operability nit).** An existing but non-executable real path is reported as `FAIL-CLOSED real-absent` (the `-x`
half of the test fires); an executable zero-byte file reads `real_is_elf=0 real_bytes=0` before `version-unreadable`. Exit status is correct (2) in
both cases — no false pass, only an imprecise reason. Reproduce: `: > /tmp/e && OMP_BIN_REAL=/tmp/e bash scripts/omp-binary-probe.sh` (then `chmod 755 /tmp/e` and re-run).

**K65ExecProbeFlip-4 (info, scoping).** `real_bytes` is a property of this build of `v18.12.6` on this host; O6's set-equality therefore makes the
entry host-bound. Correct for the claim as declared ("run now on this host"), but the entry's `## Host measurements` should not be read as a
portable statement about the release.

## Artifacts

Build dir `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ExecProbeFlip/`:
`probe-original.txt`, `probe-flipped.txt`, `probe-padded.txt`, `probe-key-diffs.txt`, `byte-diff.txt`,
`probe-failclosed.txt`, `o6-hand-replay.mjs`, `entry-host-true.md`, `entry-host-flipped.md`, `fake-sources-rows.txt`,
`o6-hand-runs.txt`, `o6-counter-runs.txt`.
Scratch `/tmp/kumitate-r65/K65ExecProbeFlip/` now 36 KiB: the three 256 MB copies and the sandbox clone were deleted after the runs; only
`stub.real` (58 B) and `empty.real` (0 B) remain. No tool installed; no counter/control/probe byte edited; the installed binary was only read
(its sha256 re-read after the runs still `85d9daf3…`).

## Limits

- I did not run the C2 counting command at a lane revision (`node .ufo/waves/round-65/probe/omp65-probe.mjs <lane> <M>`): the entry does not
  exist in the lane yet, so O6 was exercised through the verbatim block replay plus the fixture-clone end-to-end run (item 4).
- I flipped only the literal pair the assignment named; other keys (`lit_2025_03_26`, `sym_*`, `header_*`, `collab_hosts_literal`) were not
  individually perturbed, so their byte-derivation is shown by code reading (`grep -a -o -F`) and by the stub's all-zero row, not by a per-key patch.
- O5/live fetches, O7 and O8 are outside this ticket and were exercised only incidentally on the fixture.
- The padded copy keeps a valid ELF header; I did not test a corruption that would make the copy unrunnable (`version-unreadable`) beyond the
  zero-byte case.
