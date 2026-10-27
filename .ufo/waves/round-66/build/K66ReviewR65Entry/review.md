# Review — `corpus/knowledge/omp-installed-release-mcp-runtime.md` (round-65 entry, D6 re-open)

Reviewer seat: K66ReviewR65Entry, round 66 w1, 2026-10-27. Subject reviewed against its pinned sources
(S201–S206 in `.ufo/pins/source-captures.json`) and the host. No file outside my report/build paths was edited.

## What verified (no finding)

Every source-side claim in the entry reproduces byte-for-byte. The staleness below is entirely host-side.

- **Pins → captures.** All six pinned captures exist at `.ufo/waves/round-65/build/Capture/` and hash to the
  pinned sha256/size exactly (6/6): patch `eedfbbc4…` 9953 B, client `479aef6d…` 14975 B, lifecycle `362acea5…`
  22741 B, http `41ad7d5b…` 33157 B, types `caa3eade…` 16167 B, zai `0598c9f2…` 12774 B
  (`sha256sum` over the directory, 2026-10-27).
- **Live re-fetch at the pinned tag.** `curl -fsSL …/v18.12.6/packages/coding-agent/src/mcp/types.ts | sha256sum`
  → `caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d`; same for
  `docs/mcp-runtime-lifecycle.md` → `362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d`;
  `git ls-remote … refs/tags/v18.12.6` → `45c35e40c46166dc726ccc52f5d27f40f2449f99`. The sources are unchanged
  and live; nothing upstream invalidates the entry.
- **Every line citation checks out.** S201:181 constant, :171 doc comment, :174/:322 header-name comment;
  S202:101/:106/:109/:114/:118-124/:147/:151/:152 (connection bullets, 250 ms gate, no-replay bullet) —
  `grep -n` on the lifecycle capture returns exactly those lines; S203:7/:9 (commit-body quotes), :11
  (`Fixes #8264`), :13-18 (`5 files changed, 94 insertions(+), 7 deletions(-)` at :18), :102
  (`+#protocolVersion = MCP_PROTOCOL_VERSION;`); commit date `2026-08-11T17:56:14Z`
  (commit-api.json `"date":"2026-08-11T17:56:14Z"`, patch `Date: Tue, 11 Aug 2026 17:56:14 +0000` at :3);
  S204:91/:100/:120/:125; S205:17 (URL), :80 (constant), :222 (send); S206:98-102 (rationale comment),
  :104 (`#protocolVersion: string | null = null;`), :118-119 (fully-owns comment), :126-127 (null-gated
  header), :177-180 (`setProtocolVersion`). All 20 Located quotes were found verbatim in the captures.
- **compare.json.** `"status":"ahead"`, `"ahead_by":15357`, `"behind_by":0`, `"total_commits":10000` — as the
  entry states, including its own exclusion of `ahead_by`/`total_commits`.
- `grep -c '2026'` on the lifecycle capture → `0` ✓. `omp-task-contract.md:205` carries the quoted skew
  sentence ✓. PROVINCE.md:19 names the frontier band exactly as the entry's `coverage-map` ✓.

## Findings

### K66ReviewR65Entry-1 — HIGH, stale identity: the installed release is no longer 18.12.6

- **Attacks:** the entry's central subject sentence (entry :10-11 "The installed release is `omp/18.12.6`
  (`--version`, 2026-10-25), reached through a 1680-byte crash-restart wrapper"), § Scope (:22-25,
  `omp.real` ELF 256702432 bytes, mtime 2026-10-21), and § Host measurements :269-270
  (`real_bytes=256702432`, `real_version=18.12.6`).
- **Evidence:**
  ```
  ls -l /home/vgpnk/.local/bin/omp /home/vgpnk/.local/bin/omp.real
  → ls: cannot access '/home/vgpnk/.local/bin/omp.real': No such file or directory
  → -rwxr-xr-x 1 vgpnk vgpnk 275986608 2026-10-27 00:02:23 /home/vgpnk/.local/bin/omp
  head -c 4 ~/.local/bin/omp | od -An -c   → 177 E L F          (an ELF, not a script)
  grep -a -o -E '## \[[0-9.]+\] - [0-9-]{10}' ~/.local/bin/omp | sort -uV | tail -5
  → ## [18.12.5] - 2026-10-21 / ## [18.12.6] - 2026-10-21 / ## [18.13.0] - 2026-10-26 / ## [18.13.1] - 2026-10-27
  ```
  The binary was replaced 2026-10-27 00:02 (during the freeze day) and its embedded changelog reaches
  **18.13.1**; the installed release is ≥ 18.13.0. The exact version string is unconfirmed — the host rule
  permits executing only `omp.real --version`, and that file no longer exists, so I did not execute the new
  binary.
- **Per the entry's own recheck rule (entry :3):** "on a version change re-open S201, S202, S204, S205 and
  S206 at the new tag". A re-open at tag `v18.13.x` is now due; the pinned v18.12.6 reads remain valid *for
  the pinned tag* but no longer describe the installed artifact.

### K66ReviewR65Entry-2 — HIGH, stale procedure: the declared recheck cannot run; the wrapper is gone

- **Attacks:** entry :3 (recheck "re-run `bash scripts/omp-binary-probe.sh` and compare its 22 `OMP_BIN:`
  keys"), § The wrapper (:174-176 "`omp` on `PATH` is not the release. It is a bash script"), and the
  wrapper key block (:264-267).
- **Evidence:**
  ```
  bash scripts/omp-binary-probe.sh; echo "probe-exit=$?"
  → OMP_BIN_PROBE: FAIL-CLOSED real-unidentified
  → probe-exit=2
  ls -l /home/vgpnk/.local/bin/omp → 275986608 bytes, ELF   (no BIN= wrapper line, no omp.real)
  ```
  The probe fails closed before measuring because no wrapper names `omp.real` any more, so the recheck
  (compare 22 keys) is undexecutable, and every `wrapper_*` key (:264-267) describes files that no longer
  exist. Sentence :176 is now false on this host: `omp` **is** the release. Note `PROVINCE.md:20` repeats
  the stale picture ("installed release `omp/18.12.6` … the wrapper that mediates every reading") — outside
  my write scope; reroute to the L1.

### K66ReviewR65Entry-3 — MEDIUM, numbers that no longer reproduce as a set on the current artifact

- **Attacks:** § Host measurements (:260-285) as a reproducible 22-key set, and the changelog-based
  identity argument (entry :60-62, `changelog_versions=43`, `changelog_installed=1` as "a byte-level
  identity check that the file measured is the release the version string names").
- **Evidence** (direct `grep -a -o -F | wc -l` sweeps of `/home/vgpnk/.local/bin/omp`, 2026-10-27):
  unchanged vs the entry: `2025-11-25=2`, `2026-07-28=0`, `2025-03-26=2`, `2025-06-18=0`,
  `MCP_PROTOCOL_VERSION=3`, `MCP-Protocol-Version=3`, `DeferredMCPTool=3`, `collab-hosts=2`,
  `never replayed automatically=0`, `= "2025-11-25"=1`, `MCP runtime lifecycle` heading `0`.
  Changed: the probe's line-anchored regex `^## \[[0-9.]+\] - [0-9-]{10}$` yields **0** headings (entry/probe:
  43); unanchored it yields **36**; `## [18.12.6] - 2026-10-21` occurs 1×, `Collab: Live Session Sharing`
  0×, literal `18.12.6` 1×. So on the artifact the probe would measure (if it could identify one), the
  changelog keys change shape → per the entry's own rule, "a changed key is a changed row". `real_sha256`
  and `real_bytes` of the entry can no longer be tied to any installed artifact at all.
- Old-artifact-only evidence (byte offsets 156887734, 96215871, 99174972, 168226055 and the zai.ts bundle
  slice, entry :46-51, :80-88) is unreproducible: the 256702432-byte artifact is gone. The entry records
  them as dated measurements, so this is a reproduction limit, not an error.

### K66ReviewR65Entry-4 — MINOR, two sentences overclaim use from presence

- **Attacks:** entry :12 "adopts whatever revision the server answers with" and :72 "The release does not
  send `MCP-Protocol-Version` on `initialize`." Both state host runtime behavior as fact, but the only
  evidence is source-at-tag (S204:120; S206:104/:127) — the entry's own table (:107-109 area) labels the
  same facts "not observed on a wire" / "no request was captured", and § Limits (:246-249 area) says
  '"The release sends X" is source-at-tag plus bytes; no wire frame was captured'.
- **Suggested patch (weakening-free, wording only):** :12 → "and is documented to adopt whatever revision
  the server answers with (S204:120)"; :72 → "The release is built not to send `MCP-Protocol-Version` on
  `initialize`." Everything else in the entry already carries the right evidence class.

### K66ReviewR65Entry-5 — NOTE, the entry's declared UNKNOWN is resolved by this round's C2

- Entry :111: "is the release a 'Legacy' client … UNKNOWN here — the taxonomy needs a row for the
  specification page, which this round did not open". Round-66 C2 opens exactly that row
  (`mcp-deprecation-registry.md` + feature-lifecycle policy + `sse.ts` at `/v18.12.6/`). Once C2 lands, the
  re-opened entry (per finding -1) should cite it instead of carrying the UNKNOWN. Also
  `omp-task-contract.md:229,236` ("the host now reports `18.12.6`", "the wrapper and the release version
  are the whole of what this amendment resolves") inherit the same staleness — outside my write scope;
  reroute.

## Proposed patch direction (for the L1; not applied)

Per the entry's own recheck rule, the correct move is a re-open at tag `v18.13.x`: re-fetch S201/S202/
S204/S205/S206 at the new tag (the v18.12.6 tag still resolves and still hashes to the pins, so upstream
drift must be checked), re-run the probe against the new artifact (requires the probe to re-identify the
binary — as written it fails closed with `real-unidentified`; a probe contract question for its owner, not
patchable here), and re-date the host-state sentences (§ Scope, § The wrapper, § Host measurements).
Findings -4's two wording fixes are independent of the re-open and can land immediately.

## Limits

- The new binary's exact version string is unconfirmed (no execution permitted: only `omp.real --version`
  is allowed and that file is absent). "≥ 18.13.0" rests on the embedded changelog heading
  `## [18.13.1] - 2026-10-27`, not on `--version` output.
- I did not re-verify the four source files not re-fetched live (client.ts, http.ts, zai.ts, patch) against
  the network; they hash to the pins locally, and the two re-fetched ones matched, so live drift is unlikely
  but not excluded for those four.
- Old-artifact byte offsets (entry :46-51, :80-88) could not be re-checked: the measured binary is gone.
- `docs_heading_collab` was measured on the new artifact (0) but `docs_heading_lifecycle` used the phrase
  `MCP runtime lifecycle` (0) — same method as the probe; the probe's exact regexes were not re-executed
  against the new artifact because the probe fails closed before sweeping.
