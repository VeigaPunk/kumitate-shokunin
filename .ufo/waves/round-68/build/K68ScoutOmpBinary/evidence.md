# Installed-release evidence — OMP host binary, round 68 w1

Seat: K68ScoutOmpBinary. Date: 2026-10-27. All commands run from cwd
/fast/scratch/hyaku/kumitate-r68/K68ScoutOmpBinary (scratch, since deleted).

## 1. `omp --version` (verbatim)

```
$ omp --version
omp/18.13.1
EXIT=0
```

## 2. `~/.local/bin/omp*` listing — `omp.real` ABSENT

```
$ ls -la ~/.local/bin/omp*
-rwxr-xr-x 1 vgpnk vgpnk 275986608 Oct 27 00:02 /home/vgpnk/.local/bin/omp
-rwxr-xr-x 1 vgpnk vgpnk     11185 Oct  6 16:28 /home/vgpnk/.local/bin/omp-swarm
EXIT=0
```

Only `omp` and `omp-swarm` exist. No `omp.real` anywhere in `~/.local/bin/`.
This is the round-67 spotcheck's routed defect R67-V4 reality (PROVINCE stale
`omp.real` wrapper picture): `~/.local/bin/omp` IS the release binary, not a
wrapper. Confirmed directly:

```
$ file ~/.local/bin/omp
/home/vgpnk/.local/bin/omp: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=588d7307f333293c728b74df19b7323c20736899, not stripped
EXIT=0
$ stat -c 'mtime=%y inode=%i' ~/.local/bin/omp
mtime=2026-10-27 00:02:23.855671804 -0300 inode=238367109
```

## 3. {LANE}/scripts/omp-binary-probe.sh — verdict

Present (6603 bytes, contract kumitate-omp-binary-probe-v2). Default run:

```
$ bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/omp-binary-probe.sh
OMP_BIN_PROBE: FAIL-CLOSED real-unidentified
EXIT=2
```

Why: the probe's model is "a shell wrapper `omp` names `BIN=omp.real`" (script
lines 44-63: it greps `^BIN=` off the wrapper; only then, or under an explicit
`OMP_BIN_REAL` override, does it identify the release binary; otherwise it
`fail real-unidentified`). Today's `omp` is the bare ELF binary, so
`wrapper_names_real=none` and the probe refuses to guess — the fail-closed arm
fires exactly as designed. Under the probe's own documented explicit override:

```
$ OMP_BIN_REAL="$HOME/.local/bin/omp" bash .../scripts/omp-binary-probe.sh
OMP_BIN: wrapper_is_script=0
OMP_BIN: wrapper_names_real=none
OMP_BIN: wrapper_restart_codes=
OMP_BIN: wrapper_max_restarts=
OMP_BIN: real_is_elf=1
OMP_BIN: real_bytes=275986608
OMP_BIN: real_version=18.13.1
OMP_BIN: lit_2025_11_25=2
OMP_BIN: lit_2026_07_28=0
OMP_BIN: lit_2025_03_26=2
OMP_BIN: sym_MCP_PROTOCOL_VERSION=3
OMP_BIN: header_MCP-Protocol-Version=3
OMP_BIN: sym_DeferredMCPTool=3
OMP_BIN: collab_hosts_literal=2
OMP_BIN: docs_phrase_never_replayed=0
OMP_BIN: lit_2025_06_18=0
OMP_BIN: decl_2025_11_25=1
OMP_BIN: changelog_installed=1
OMP_BIN: docs_heading_collab=0
OMP_BIN: docs_heading_lifecycle=0
OMP_BIN: changelog_versions=36
OMP_BIN: real_sha256=ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5
OMP_BIN_PROBE: DONE omp=18.13.1
EXIT=0
```

Full 22-key set, all byte-sweep counts identical to the round-66 receipt
`K66ExecOmpRerun/byte-evidence-18.13.1.txt` (copied here as
`byte-evidence-18.13.1.txt`).

## 4. Round-66 byte-identity claim re-verified — HOLDS, no drift

Round-66 receipt (copied here as `upstream-checksum-match.txt`):

```
$ curl -sSL https://github.com/can1357/oh-my-pi/releases/download/v18.13.1/SHA256SUMS.txt | grep omp-linux-x64
ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5  omp-linux-x64
$ sha256sum ~/.local/bin/omp
ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5  /home/vgpnk/.local/bin/omp
```

Today's re-measurement of the installed binary:

```
$ sha256sum ~/.local/bin/omp
ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5  /home/vgpnk/.local/bin/omp
EXIT=0
$ stat -c '%s %n' ~/.local/bin/omp
275986608 /home/vgpnk/.local/bin/omp
```

Live re-fetch of the upstream asset checksum today (2026-10-27):

```
$ curl -sSL --max-time 30 https://github.com/can1357/oh-my-pi/releases/download/v18.13.1/SHA256SUMS.txt | grep omp-linux-x64
ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5  omp-linux-x64
EXIT=0
```

installed == round-66 receipt == live upstream, size 275986608 unchanged,
mtime 2026-10-27 00:02 -0300 (same day as the freeze). The round-66
byte-identity claim still holds; NO DRIFT.

## Bottom line

- Installed release: `omp/18.13.1`, ELF x86-64, 275986608 bytes,
  sha256 `ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5`.
- `omp.real` wrapper: ABSENT (R67-V4 reality stands).
- Probe: fails closed unmodified (`real-unidentified`, exit 2) because its
  wrapper/`omp.real` model predates the round-66 host upgrade; full 22-key
  measurement succeeds via its `OMP_BIN_REAL` override, all counts matching
  round-66 evidence.
- Upstream byte-identity: confirmed against the round-66 receipt and against a
  live re-fetch of the v18.13.1 SHA256SUMS today.
