VERDICT: The round-65 C2 counter now fails on this host (OMP65 held=7/8, O6 MISS) because the installed OMP release was upgraded to 18.13.1 with the `omp.real` wrapper removed — 8 of the entry's 22 `## Host measurements` keys drift, and the frozen probe fail-closes; a re-grounding that holds the frozen rule 8/8 is demonstrated in a scratch fixture and proposed as patch text.

## Evidence

```
$ bash scripts/omp-binary-probe.sh          # frozen probe, default env, lane HEAD
OMP_BIN_PROBE: FAIL-CLOSED real-unidentified
EXIT=2
```

```
$ node .ufo/waves/round-65/probe/omp65-probe.mjs \
    /home/vgpnk/Projects/shokunin/kumitate-shokunin 2b1f416e07b743caae8bcbdd0e9a74ea128feb64
OMP65_UNMET held=7/8 checks=8 rev=2b1f416e07b743caae8bcbdd0e9a74ea128feb64 rule=O65 | O6 MISS probe-exit=2;wrapper_is_script:stated-not-live;wrapper_names_real:stated-not-live;wrapper_restart_codes:stated-not-live;wrapper_max_restarts:stated-not-live;real_is_elf:stated-not-live
EXIT=1
```
Same verdict at the round-66 freeze commit `621212bac37f8249c72ac982d1d6534cb8d60701` (O6 MISS, held=7/8).
The round-65 close receipt `.ufo/waves/round-65/close/omp65-measured.txt` recorded `OMP65_HELD held=8/8 … rule=O65`, exit 0 — so this is drift, not a rule change.

```
$ ls -l /home/vgpnk/.local/bin/omp*        # the wrapper is gone
-rwxr-xr-x 1 vgpnk vgpnk 275986608 Oct 27 00:02 /home/vgpnk/.local/bin/omp
-rwxr-xr-x 1 vgpnk vgpnk      11185 Oct  6 16:28 /home/vgpnk/.local/bin/omp-swarm
$ ls -l /home/vgpnk/.local/bin/omp.real
ls: cannot access '/home/vgpnk/.local/bin/omp.real': No such file or directory
$ file /home/vgpnk/.local/bin/omp
ELF 64-bit LSB executable, x86-64 … not stripped      # the PATH binary IS the release
$ OMP_NO_RESTART=1 /home/vgpnk/.local/bin/omp --version
omp/18.13.1                                          # exit 0
$ OMP_NO_RESTART=1 /home/vgpnk/.local/bin/omp.real --version
error: command not found: /home/vgpnk/.local/bin/omp.real   # exit 127
```

```
$ git ls-remote https://github.com/can1357/oh-my-pi.git 'refs/tags/v18.13*' 'refs/tags/v18.12.6'
45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6
011ab732fa2d8657203d17f6af80d57809eb24f4	refs/tags/v18.13.0
0838d2ab4407b74e870de07e1a6780a13c7d542c	refs/tags/v18.13.1

$ curl -sSL .../releases/download/v18.13.1/SHA256SUMS.txt | grep omp-linux-x64
ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5  omp-linux-x64
$ sha256sum ~/.local/bin/omp
ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5  /home/vgpnk/.local/bin/omp
```
The installed binary is **byte-identical to the published upstream v18.13.1 `omp-linux-x64` asset** (275986608 bytes, mtime 2026-10-27 00:02; release published 2026-10-27T00:56:37Z).

Frozen probe re-run with the release located explicitly (`OMP_BIN_REAL=/home/vgpnk/.local/bin/omp`) — 22 keys, exit 0 (full listing: `build/K66ExecOmpRerun/r65-probe-v3-candidate-verbatim.txt`); the drifted keys are `wrapper_is_script=0` (was 1), `wrapper_names_real=none` (was omp.real), `wrapper_restart_codes=` (was 132-139), `wrapper_max_restarts=` (was 5), `real_bytes=275986608` (was 256702432), `real_version=18.13.1` (was 18.12.6), `changelog_versions=36` (was 43), `real_sha256=ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5` (was 85d9daf3…). The other 14 keys are identical — table in `build/K66ExecOmpRerun/host-drift-table.md`.

Upstream source files are byte-identical between v18.12.6 and v18.13.1 (live fetch at both tags, sha256):
`types.ts caa3eade…` (16167 B), `client.ts 479aef6d…` (14975 B), `mcp-runtime-lifecycle.md 362acea5…` (22741 B), `transports/http.ts 41ad7d5b…` (33157 B), `zai.ts 0598c9f2…` (12774 B), `transports/sse.ts 0b69229a…` (15183 B) — all identical at both tags. So the MCP-layer facts the entry asserts are unchanged; only the release identity and the wrapper layout moved.

Byte evidence on the new release (new binary, `grep -a -o -F` counts): `'2025-11-25'`×2, `'2026-07-28'`×0, `'2025-03-26'`×2, `MCP_PROTOCOL_VERSION`×3, `MCP-Protocol-Version`×3, `DeferredMCPTool`×3, `packages/coding-agent/src/mcp/transports/sse.ts`×1, `Legacy SSE`×14, `listChanged`×5; the roots capability is present at byte offset 175860248 (`capabilities: { roots: { listChanged: false } }`) and the legacy SSE class follows the `// packages/coding-agent/src/mcp/transports/sse.ts` marker. Full listing: `build/K66ExecOmpRerun/byte-evidence-18.13.1.txt`.

`changelog_versions` 43→36 is **not** a regression: upstream `packages/coding-agent/CHANGELOG.md` has 43 version headings at v18.12.6 (254614 B) and 36 at v18.13.1 (258254 B) — 9 old headings dropped (18.4.4–18.4.12, 18.5.0, 18.5.1), 18.13.0/18.13.1 added (43 − 9 + 2 = 36). The key measures changelog breadth, not release identity.

Round-66 C2 counter (unrelated to the drift, run for completeness):
`node .ufo/waves/round-66/probe/deprec66-probe.mjs <lane> 621212ba…` → `DEPREC66_UNMET held=0/8 … | M1 MISS entry-absent …`, exit 1 (the entry does not exist yet — expected at the freeze).

## Findings

**K66ExecOmpRerun-1 — severity: high — the installed OMP release was upgraded to 18.13.1 and the crash-restart wrapper was removed; the round-65 C2 counter no longer holds (7/8).**
What it attacks: round-65 claim C2 (`OMP65`), O6, and the entry `corpus/knowledge/omp-installed-release-mcp-runtime.md` § Host measurements.
Reproduce: `cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && node .ufo/waves/round-65/probe/omp65-probe.mjs . 2b1f416e07b743caae8bcbdd0e9a74ea128feb64` → `OMP65_UNMET held=7/8 … O6 MISS probe-exit=2`.
Two independent causes: (a) the frozen probe cannot identify the release when `omp` on PATH is itself the ELF and `~/.local/bin/omp.real` is absent → `FAIL-CLOSED real-unidentified`, exit 2; (b) with the release located explicitly, 8 of the 22 stated keys drift (`wrapper_is_script`, `wrapper_names_real`, `wrapper_restart_codes`, `wrapper_max_restarts`, `real_bytes`, `real_version`, `changelog_versions`, `real_sha256`).

**K66ExecOmpRerun-2 — severity: medium — `scripts/omp-binary-probe.sh` fail-closes on this host, so every counter check that re-runs it (O6) fails closed too.**
What it attacks: the probe's release-resolution branch (`scripts/omp-binary-probe.sh:59-66`), which resolves the release only via `OMP_BIN_REAL` or a wrapper that names `omp.real`.
Reproduce: `bash scripts/omp-binary-probe.sh` → `OMP_BIN_PROBE: FAIL-CLOSED real-unidentified`, exit 2.
The fail-closed behaviour is correct in principle (never guess), but the probe has no branch for "the release binary itself is on PATH", so it cannot measure this host at all without an environment override the frozen counter does not pass.

**K66ExecOmpRerun-3 — severity: medium — `changelog_versions` is not monotone in the release version, so it is a fragile identity key.**
What it attacks: the key's use as release-identity evidence.
Reproduce: `curl -sSL .../v18.12.6/packages/coding-agent/CHANGELOG.md | grep -cE '^## \[?[0-9]+\.[0-9]+\.[0-9]+\]? - [0-9-]+$'` → 43; same at v18.13.1 → 36 (9 headings dropped upstream, 2 added). An entry that treats this key as "the release's history depth" will drift on every upstream changelog trim.

**K66ExecOmpRerun-4 — severity: medium — the r65 O6 `rows-pinned-to-installed-version` check binds to the *installed* version, so re-grounding the entry to 18.13.1 requires new S-rows at `/v18.13.1/`, not a re-date of the existing ones.**
What it attacks: `omp65-probe.mjs:211-214` — `pinned = ids.filter(id => rows.get(id).includes('/v${real}/') || includes('/${RELEASE_COMMIT}/'))` with `RELEASE_COMMIT` hard-coded to the v18.12.6 tag commit.
Reproduce: with `real=18.12.6` the five v18.12.6 rows pin (count 5); with `real=18.13.1` the count is **0**, so O6 misses on `rows-pinned-to-installed-version=0<2` even when every key matches. Verified by re-running the counter against a scratch fixture.

**K66ExecOmpRerun-5 — severity: informational — the drift does not touch the MCP substance, and the round-66 C2 ground (`sse.ts` at `/v18.12.6/`) survives it.**
What it attacks: nothing; this is the negative result the L1 needs.
All six upstream files the r65 entry cites are byte-identical at v18.12.6 and v18.13.1; the new binary still carries `transports/sse.ts` and the `roots` capability; the r65 entry's located quotes and its `## Host measurements` prose about the revision constant, the two MCP clients and the header shape all remain true of the installed release. `S207`/`S208`/`S209` at `/v18.13.1/` are the natural new rows; the sibling seat's `S209` (sse.ts at v18.12.6) already satisfies the round-66 counter's `no-cited-row-for-sse.ts-at-v18.12.6` check.

**K66ExecOmpRerun-6 — severity: informational — the round-66 M66 counter's M6 check needs the *markdown* capture, not the rendered page.**
What it attacks: the capture format the C2 entry's `## Registry snapshot` must match.
Reproduce: parsing the rendered HTML `https://modelcontextprotocol.io/specification/2026-07-28/deprecated` with the counter's own M6 parser yields **0** table rows (no `## Deprecated` heading, no `|`-rows); the same parser over the markdown (`…/deprecated.md`, 3839 B — the capture sibling seat K66ExecCaptures already committed as S207) yields **6** rows, matching the upstream `deprecated.mdx` (5031 B) exactly. The M6 check requires ≥ 5.

## Artifacts (all under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecOmpRerun/`)

- `host-drift-table.md` — all 22 keys, stated vs live, with the cause of each drift.
- `probe-v3.patch` + `probe-v3-candidate.sh` — **proposed** patch to `scripts/omp-binary-probe.sh`: a branch that treats an ELF on PATH as the release when no wrapper names `omp.real`, and prints `wrapper_restart_codes=none` / `wrapper_max_restarts=none` instead of empty values when there is no wrapper. The L1 integrates; this seat did not edit `scripts/`.
- `r65-probe-default-verbatim.txt` (`FAIL-CLOSED real-unidentified`, EXIT=2), `r65-probe-v3-candidate-verbatim.txt` (22 keys, EXIT=0), `r65-counter-verbatim.txt` (`OMP65_UNMET held=7/8`, EXIT=1), `r65-omp65-counter-instrumented.txt` (full 24-item O6 bad list).
- `byte-evidence-18.13.1.txt` — literal counts and byte offsets in the installed binary (roots capability, sse.ts marker).
- `upstream-tags.txt`, `upstream-checksum-match.txt` — tag→commit map and the upstream SHA256SUMS match.
- `captures/` — live captures at `/v18.13.1/` of `types.ts`, `client.ts`, `http.ts`, `zai.ts`, `mcp-runtime-lifecycle.md`, `sse.ts` with their sha256 (the sse.ts capture is byte-identical to the sibling seat's `omp-v18.12.6-sse.ts`, sha256 `0b69229a…`).
- `r65-host-version-receipt.txt` — the `omp.real --version` (127) / `omp --version` (0) / `ls -l` transcript.

**Proposed re-grounding (demonstrated, not applied).** In a scratch clone (`git clone --shared` under the seat scratch; commits only inside it, `git -C <clone>`), I landed (a) the probe v3 candidate, (b) three new `SOURCES.md` rows S207/S208/S209 opened 2026-10-27 pinned at `/v18.13.1/`, (c) capture pins for them, (d) the entry re-grounded to `verified-at: 2026-10-27` with the new source ids, new located quotes and the 22 live keys. Result:

```
$ node omp65-probe.mjs <clone> 9ae8e245aa8d81c9c69d1cacea3378604405c09b --opened 2026-10-27
OMP65_HELD held=8/8 checks=8 rev=9ae8e245aa8d81c9c69d1cacea3378604405c09b rule=O65
```
`scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=148 …)`; `sources-census.sh validate --file corpus/SOURCES.md` → no E-codes. So the frozen rule is re-holdable on this host — but only with the probe fix, new `/v18.13.1/` rows, and the counter invoked with `--opened 2026-10-27` (the counter's default `OPENED` is `2026-10-25`; the frozen rule's date parameter is the L1's call). The probe patch and the entry patch text are in the build dir; the L1 integrates them.

## Limits

- I did not edit any lane file: no `scripts/`, `corpus/`, `SCORECARD.md`, `LOG.md`, `PROVINCE.md`, `SKILL.md`, `.ufo/pins/`, and no git/jj mutation in the lane or the fleet. The clone under scratch is a fixture; the lane's own `git status` shows only untracked round-66 wave files.
- The round-65 counter was run at `2b1f416e…` (the r65 tip) and at the round-66 freeze commit `621212ba…`; the verdict is identical (7/8, O6 MISS). I did not run it against every intermediate commit.
- `OMP_BIN_REAL` was used only to *locate* the release for the frozen probe's byte sweeps; the probe still executes only `<binary> --version` and reads bytes. I did not run `~/.local/bin/omp.real --version` successfully (the file is gone; exit 127) and did not run anything else from the installed binaries.
- No MCP session was started and no wire frame was captured; every behavioural statement remains a source-at-tag or byte-level fact.
- I did not fetch or diff upstream `main`; only the two release tags, their `CHANGELOG.md`, the release asset checksums and the GitHub compare API for S203's ancestry (`v18.13.1` → `status=ahead, behind_by=0`, so 10bce690 is still an ancestor).
- The re-grounding was proven in a scratch fixture only. I did not verify it against the frozen `deprec66-probe.mjs` (M66) end-to-end, because that counter needs the C2 entry (`corpus/knowledge/mcp-deprecation-registry.md`), which no seat has written yet.
- I did not audit the sibling seats' S207–S209 proposals beyond checking that the sse.ts capture's sha256 matches mine; the L1 owns the integration of `corpus/SOURCES.md` and `.ufo/pins/source-captures.json`.
- No tool was installed or upgraded this wave; the host's OMP was already at 18.13.1 when the seat started (nothing was changed by me).
