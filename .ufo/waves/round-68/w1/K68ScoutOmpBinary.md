VERDICT: Installed release is omp/18.13.1 — bare ELF at ~/.local/bin/omp (no omp.real, R67-V4 reality stands) — byte-identical to upstream v18.13.1 and to the round-66 receipt, NO DRIFT; the lane probe fails closed (`real-unidentified`, exit 2) unmodified because its wrapper model predates the upgrade, and yields a full 22-key set only via its own `OMP_BIN_REAL` override.

## Evidence

```
$ omp --version                          # verbatim
omp/18.13.1                              (exit 0)

$ ls -la ~/.local/bin/omp*
-rwxr-xr-x 1 vgpnk vgpnk 275986608 Oct 27 00:02 /home/vgpnk/.local/bin/omp
-rwxr-xr-x 1 vgpnk vgpnk     11185 Oct  6 16:28 /home/vgpnk/.local/bin/omp-swarm
                                       (exit 0; omp.real ABSENT)

$ file ~/.local/bin/omp
ELF 64-bit LSB executable, x86-64, ... not stripped

$ bash {LANE}/scripts/omp-binary-probe.sh
OMP_BIN_PROBE: FAIL-CLOSED real-unidentified   (exit 2)

$ OMP_BIN_REAL=$HOME/.local/bin/omp bash {LANE}/scripts/omp-binary-probe.sh
... 22 OMP_BIN keys ...
OMP_BIN: real_version=18.13.1  real_bytes=275986608  real_is_elf=1
OMP_BIN: real_sha256=ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5
OMP_BIN_PROBE: DONE omp=18.13.1          (exit 0)

$ sha256sum ~/.local/bin/omp
ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5

$ curl -sSL --max-time 30 https://github.com/can1357/oh-my-pi/releases/download/v18.13.1/SHA256SUMS.txt | grep omp-linux-x64
ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5  omp-linux-x64   (live fetch today)
```

Round-66 receipt `.ufo/waves/round-66/build/K66ExecOmpRerun/upstream-checksum-match.txt`
records upstream `ee2961c7...f84b5  omp-linux-x64` and the same installed
sha256 — all three values (installed now, r66 receipt, live upstream) agree.
All byte-sweep counts in the probe's 22-key set match round-66
`byte-evidence-18.13.1.txt` verbatim.

## Findings

- **K68ScoutOmpBinary-1** (info, freshness): the plan's C2 premise "the
  installed release is `omp/18.13.1` (upstream asset byte-identical,
  2026-10-27; … the removal of the `omp.real` wrapper)" is freshly confirmed
  on every clause: version, byte-identity (sha256 match installed vs r66
  receipt vs live upstream fetch today), and `omp.real` absence.
  Reproduce: `sha256sum ~/.local/bin/omp` = `ee2961c7…f84b5`.
- **K68ScoutOmpBinary-2** (low, tooling note): `scripts/omp-binary-probe.sh`
  unmodified prints `OMP_BIN_PROBE: FAIL-CLOSED real-unidentified` (exit 2).
  Its contract (lines 57–63) identifies the release binary only via
  `OMP_BIN_REAL` or a wrapper `BIN=omp.real` line; with no wrapper it refuses
  to guess — correct fail-closed behaviour, but seats and frozen counters
  that invoke it must either pass `OMP_BIN_REAL` or accept the arm. Any probe
  re-model to "omp IS the binary" is an L1/ratchet decision, not mine.

## Artifacts

- `.ufo/waves/round-68/build/K68ScoutOmpBinary/evidence.md` — every command + verbatim output
- `.ufo/waves/round-68/build/K68ScoutOmpBinary/upstream-checksum-match.txt` — copied r66 receipt
- `.ufo/waves/round-68/build/K68ScoutOmpBinary/byte-evidence-18.13.1.txt` — copied r66 byte evidence

## Limits

- Did not diff the full installed binary byte-for-byte against a fresh
  download of the asset (263 MB); sha256 equality to the upstream sums line
  is the stated identity test and it passes.
- Did not check `omp-swarm`'s purpose or provenance (out of seat scope).
- No tools installed; pacman untouched.
