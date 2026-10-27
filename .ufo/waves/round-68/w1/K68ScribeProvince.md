VERDICT: PROVINCE.md:20's stale `omp.real` wrapper picture (routed R67-V4) is confirmed against this host (`omp/18.13.1`, direct ELF 275986608 bytes, `~/.local/bin/omp.real` absent) and both assigned edits are drafted as one verified unified-diff hunk (2 lines replaced, `patch -p1` rc 0, `git apply --check` rc 0, applied copy byte-identical to the draft) — but the same wrapper removal also breaks the probe's documented recheck and its own arm A00, which the L1 must fix alongside.

## Evidence

Base: lane `HEAD` = `39f61816d4ee7a8d401df42c1818c91a9c537bce`; `sha256(PROVINCE.md)` = `3c5b0b84581e7139b7b9d71ce8305e8eea6d54f58f41839d8cb8da298f7c8c9f`; 31 lines.

E1 — host identity (receipt `build/K68ScribeProvince/host-identity.txt`):
```
$ ls -la ~/.local/bin/omp*
-rwxr-xr-x 1 vgpnk vgpnk 275986608 Oct 27 00:02 /home/vgpnk/.local/bin/omp
-rwxr-xr-x 1 vgpnk vgpnk     11185 Oct  6 16:28 /home/vgpnk/.local/bin/omp-swarm
$ file ~/.local/bin/omp
/home/vgpnk/.local/bin/omp: ELF 64-bit LSB executable, x86-64 … BuildID[sha1]=588d7307f333293c728b74df19b7323c20736899, not stripped
$ sha256sum ~/.local/bin/omp
ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5  /home/vgpnk/.local/bin/omp
$ ls ~/.local/bin/omp.real
ls: cannot access '/home/vgpnk/.local/bin/omp.real': No such file or directory
$ omp --version
omp/18.13.1
$ grep -n 'the wrapper that mediates' PROVINCE.md
20:- OMP harness contract, installed-release measurement … two MCP clients in one binary on two revisions, a header that is absent until negotiation, the wrapper that mediates every reading; …
```

E2 — the lane's own instrument, bare (receipt `probe-bare.txt`):
```
$ bash scripts/omp-binary-probe.sh
OMP_BIN_PROBE: FAIL-CLOSED real-unidentified
exit=2
```
E3 — same instrument with the explicit real-binary override (receipt `probe-override.txt`, 22 keys):
```
$ OMP_BIN_REAL=$HOME/.local/bin/omp bash scripts/omp-binary-probe.sh
OMP_BIN: wrapper_is_script=0
OMP_BIN: wrapper_names_real=none
OMP_BIN: real_is_elf=1
OMP_BIN: real_bytes=275986608
OMP_BIN: real_version=18.13.1
OMP_BIN: real_sha256=ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5
… (16 further keys, incl. lit_2025_11_25=2, lit_2025_03_26=2, lit_2026_07_28=0, sym_MCP_PROTOCOL_VERSION=3)
OMP_BIN_PROBE: DONE omp=18.13.1
exit=0
```
E4 — the drafted patch applies and reproduces the draft byte-for-byte:
```
$ patch -p1 --dry-run -i province-edits.patch
rc=0 checking file PROVINCE.md
$ patch -p1 -i province-edits.patch
rc=0 patching file PROVINCE.md
APPLIED==DRAFT True          # applied copy == build/K68ScribeProvince/province-new.md
$ git -C <scratch clone --shared> apply --check province-edits.patch ; echo $?
GIT_APPLY_CHECK_OK rc=0
$ git -C <clone> apply --stat province-edits.patch
 PROVINCE.md |    4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
```
(`TOPLEVEL_OK` asserted on the clone first; the clone is a fixture, every git write named `-C <clone>`; nothing was run against the lane.)

E5 — the frozen C2 counter's PROVINCE clause is substring-only, and it reads PROVINCE.md as a static path:
`probe/deprec68-probe.mjs:345` `if (!prov.includes('mcp-deprecation-registry')) bad9.push('province-entry-not-named');`; `:213` `staticPaths = ['corpus/SOURCES.md', '.ufo/pins/source-captures.json', 'PROVINCE.md']`; `scripts/cite-check.mjs:176` lists `PROVINCE.md` in `SELF_DOCS` (so the new corpus mention is not citation-checked from here).

E6 — the defect being repaired: `corpus/lessons/round-67-verifier-spotcheck.md:47,60,73` (R67-V4 / K66ReviewR65Entry-2/-5) and `.ufo/waves/round-68/plan.md:21` (repair declared) + `:98` (C2's PROVINCE surface).

E7 — the probe's own round-65 control (`.ufo/waves/round-65/build/K65ExecOmpRobust/arms.sh`): `:171-172` A00 "no overrides: the installed host" expects exit 0 `DONE`; `:177-178` A02b expects `real-unidentified` for a wrapper without `BIN=`; `:193-194` A10 expects `real-unidentified` with `HOME` unset; `:22` `TARGET=${TARGET:-$HERE/omp-binary-probe.v2.sh}`; `sha256sum` → snapshot `cbe63e88…` vs live `scripts/omp-binary-probe.sh` `ce12d748…` (snapshot = 15-key contract, live = 22 keys).

## Findings

**K68ScribeProvince-1 — medium — the assigned defect.** `PROVINCE.md:20` asserts `omp/18.12.6` is "the installed release" and that "the wrapper … mediates every reading". Both are false on this host (E1): the installed release is `omp/18.13.1`, `~/.local/bin/omp` is the release ELF itself, `~/.local/bin/omp.real` does not exist. Attacks operability: a seat reading the band line would look for a wrapper that is not there and would quote an uninstalled version. Fix drafted (edit 1): the round-65 at-tag measurement (tag `v18.12.6`, commit `45c35e40`, its two MCP clients, its 18.12.6 byte counts) is kept named as history; only tense and ownership change; the installed reality, the `v18.13.1` tag (`0838d2ab…`), the ELF size/sha256 and the removal of the wrapper are stated. Repro: `grep -n 'the wrapper that mediates' PROVINCE.md; ls ~/.local/bin/omp.real; omp --version`.

**K68ScribeProvince-2 — high — the probe (and its documented recheck) no longer runs unmodified.** `scripts/omp-binary-probe.sh:56-64` takes `$OMP_BIN_REAL`, else `$HOME/.local/bin/omp.real` *only if* the file at `$W` names `omp.real`, else `fail real-unidentified` — so with the wrapper gone a bare run exits 2 (E2), while the same run with `OMP_BIN_REAL=$HOME/.local/bin/omp` yields the full 22-key receipt (E3). Consequences: (a) the round-65 entry's own recheck instruction, `corpus/knowledge/omp-installed-release-mcp-runtime.md:3` "`recheck: 90d — re-run bash scripts/omp-binary-probe.sh …`", fails as written; (b) the probe's arm A00 "the installed host" (`arms.sh:171-172`, expects exit 0 `DONE`) is contradicted by the host it names. Zero-risk fix, recommended: change the documented invocation, not the code — `OMP_BIN_REAL=$HOME/.local/bin/omp bash scripts/omp-binary-probe.sh` (already written into the drafted `PROVINCE.md:20`). A code fallback to `$W` when `$W` is not a script keeps A02b passing (its fixture wrapper is a script) but breaks A10 (`HOME` unset, no overrides, expects `real-unidentified`) unless the fallback keeps a `HOME` guard — so any code change MUST re-run the suite and re-declare both arms. Repro: `bash scripts/omp-binary-probe.sh; echo $?` → `FAIL-CLOSED real-unidentified`, `2`.

**K68ScribeProvince-3 — medium — the round-65 entry is un-amended and will contradict PROVINCE once this patch lands.** `corpus/knowledge/omp-installed-release-mcp-runtime.md:11` ("reached through a 1680-byte crash-restart wrapper"), `:174 ## The wrapper`, `:178 wrapper_names_real=omp.real`, `:260-267 ## Host measurements` (`wrapper_is_script=1`, `changelog_versions=43`, `real_sha256=85d9daf3…`) all state the wrapper era in the present tense, and `:2 verified-at: 2026-10-25`; the file ends at `:285` with no `## Amendment`. Fix (L1's call, corpus write scope): `Amendment 2026-10-27` recording the 18.13.1 upgrade, `wrapper_*` → none/empty, `real_*` → 275986608 / `ee2961c7…`, `changelog_versions` 43→36 (with the heading-drop explanation, `.ufo/waves/round-66/build/K66ExecOmpRerun/host-drift-table.md:38`), plus the recheck-convention change of finding -2. Repro: `grep -n 'crash-restart wrapper\|wrapper_names_real' corpus/knowledge/omp-installed-release-mcp-runtime.md`.

**K68ScribeProvince-4 — medium — the probe's negative control points at a stale copy of the probe.** `arms.sh:22` defaults `TARGET` to `.ufo/waves/round-65/build/K65ExecOmpRobust/omp-binary-probe.v2.sh`, whose `sha256` (`cbe63e88…`) differs from the live `scripts/omp-binary-probe.sh` (`ce12d748…`): the snapshot is the 15-key contract, the live instrument emits 22 keys (E3). Attacks operability of the control, not the claim: arms PASS/FAIL currently say nothing about the script the lane runs. Fix: `TARGET=scripts/omp-binary-probe.sh`, re-run with the scratch redirected (`arms.sh:24` defaults `SCRATCH=/tmp/kumitate-r65/…` and writes `arms-table.txt` beside itself, both outside a seat's write scope — see Limits). Repro: `sha256sum scripts/omp-binary-probe.sh .ufo/waves/round-65/build/K65ExecOmpRobust/omp-binary-probe.v2.sh`.

**K68ScribeProvince-5 — low — M9's PROVINCE clause is satisfied by the do-nothing control (frozen-counter weakness; ratchet proposal).** `deprec68-probe.mjs:345` accepts any occurrence of the substring, and `probe/c2-donothing.sh:16` writes exactly `- MCP protocol revisions: corpus/knowledge/mcp-deprecation-registry.md`. So M9's PROVINCE arm cannot distinguish the real band advance from the control's one-line stub. Proposal for the L1 (strengthening, never relaxation): require the mention inside the `### Frontier` band and in a line that also carries `advanced round 68` (and, for hygiene, `S207`). The drafted edit satisfies both; the control does not. Repro: `sed -n '16p' .ufo/waves/round-68/probe/c2-donothing.sh; sed -n '345p' .ufo/waves/round-68/probe/deprec68-probe.mjs`.

## Artifacts

- `.ufo/waves/round-68/build/K68ScribeProvince/province-edits.md` — the deliverable: combined patch, per-edit hunks, resulting lines verbatim, rationale, integration notes, instrument follow-ups, self-verification.
- `…/province-edits.patch` (both edits, one hunk), `…/province-edits-edit1.patch` (line 20 alone), `…/province-edits-edit2.patch` (line 21 alone), `…/province-new.md` (full drafted file, `sha256 bbca01816c20c550e37e4e8f1864aa10d54318a72966b239cadaafc64182cf41`).
- `…/host-identity.txt`, `…/probe-bare.txt`, `…/probe-override.txt` — the receipts quoted above.
- Report: `.ufo/waves/round-68/w1/K68ScribeProvince.md`. Scratch `/fast/scratch/hyaku/kumitate-r68/K68ScribeProvince/` (copy of the base file, apply-test copy, `git clone --shared` fixture) deleted before yield; nothing under `/tmp`. No tools installed this seat.

## Limits

- The patch is **not applied** (`PROVINCE.md` untouched); the L1 integrates. Verified only that it applies (`patch` rc 0, `git apply --check` rc 0) and reproduces the draft exactly.
- `arms.sh` was **not** executed: it writes `arms-table.txt` next to itself in a round-65 build dir I do not own and defaults `SCRATCH` to `/tmp/kumitate-r65/…`. A00's contradiction is therefore established by the equivalent no-override probe run (E2), not by the suite's own PASS/FAIL line.
- Upstream `SHA256SUMS.txt` for `v18.13.1` was not re-fetched by this seat; the byte-identity claim rests on `.ufo/waves/round-66/build/K66ExecOmpRerun/upstream-checksum-match.txt:1-4` and `byte-evidence-18.13.1.txt:4`. My own `sha256sum` of the host binary matches the value those receipts recorded (`ee2961c7…`).
- Not run (integration-time or needs the entry/network): `deprec68-probe.mjs` (M1/M5 require `corpus/knowledge/mcp-deprecation-registry.md`, absent: `ls` → No such file), `scripts/cite-check.mjs`, `scripts/readme-map.mjs`, `sources-check.mjs`, `source-capture.mjs`.
- `PROVINCE.md:19` ("the docs track upstream `main` while the host runs the installed `omp` binary") was not re-verified and is deliberately unchanged; other lanes' PROVINCE files were not inspected.
- Whether the two MCP clients in one binary are still *semantically* the same pair at 18.13.1 was not re-derived: only the probe's byte literals agree (`lit_2025_11_25=2`, `lit_2025_03_26=2`, E3).
