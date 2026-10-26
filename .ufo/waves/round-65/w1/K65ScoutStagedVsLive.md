VERDICT: Of ~65 factual sentences in the three staged OMP entries, the MCP-pin core (2025-11-25 constant, 0× 2026-07-28, commit 10bce6900, spec taxonomy) is supported and now ancestry-pinned to the installed v18.12.6; 14 sentences are contradicted/stale (id collisions S104/S115/S133, a fabricated `Mcp-Method`/`Mcp-Name` clause, "with upstream", `--version` "wrapper-read", the "9 crashes" fact, dates) and need the edits in classification.md.

## Evidence
- `bash scripts/omp-binary-probe.sh` → exit 0, 15 lines (`real_version=18.12.6 lit_2025_11_25=2 lit_2026_07_28=0 lit_2025_03_26=2 header_MCP-Protocol-Version=3 real_bytes=256702432 wrapper_restart_codes=132-139 wrapper_max_restarts=5 …`, `OMP_BIN_PROBE: DONE omp=18.12.6`); equals `base/omp-binary-probe-freeze.txt` except that file's trailing `EXIT=0`.
- `OMP_NO_RESTART=1 ~/.local/bin/omp.real --version` → `omp/18.12.6`.
- `git ls-remote https://github.com/can1357/oh-my-pi.git refs/heads/main refs/tags/v18.12.6` → `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0 refs/heads/main` (committed 2026-10-22T10:22:25Z) and `45c35e40c46166dc726ccc52f5d27f40f2449f99 refs/tags/v18.12.6`. Staged "main is still 0b5c27ab": TRUE today.
- `sha256sum omp.real` = `85d9daf3…ccfa4` = GitHub release asset `omp-linux-x64` digest, size 256702432 = asset size → omp.real IS the v18.12.6 release.
- Tag vs main: `types.ts`, `client.ts`, `docs/mcp-runtime-lifecycle.md`, `docs/collab.md` `cmp`-identical; `compare/v18.12.6...0b5c27ab` ahead_by 170; 153 blob paths differ, 0 under `src/mcp/` or `docs/*mcp*`; tree blobs tag 9294, main 9303 (staged "9,303" TRUE for main).
- `compare/v18.12.6...10bce6900` status `behind` (ancestor): the header fix ships in the installed release.
- `types.ts:181 export const MCP_PROTOCOL_VERSION = "2025-11-25";`; `client.ts:100,108,120,125,203-204` match the staged line cites.
- Source origin of `2025-03-26`×2: `web/search/providers/zai.ts:80 ZAI_MCP_PROTOCOL_VERSION` (not the old client pin). `2026-07-28` in source only as a comment (`packages/ai/src/utils/schema/fields.ts:53`).
- Binary sweep: `Mcp-Method` 0, `Mcp-Name` 0, `server/discover` 0, `Mcp-Session-Id` 10.
- Spec page `…/2026-07-28/basic/versioning.md`: Legacy = "`initialize` handshake (`2025-11-25` and earlier)" :37; "legacy clients have no fall-forward mechanism" :156/:170 (under §Backward Compatibility, not §Protocol Version Negotiation); Legacy→Modern on HTTP = `400 Bad Request`.
- Host crash evidence: `coredumpctl list` no omp rows; `~/.omp/logs` 10 `native-panic-*.log` all 2026-10-25, first `find.rs:2540:87 … Broken pipe`.

## Findings
- K65ScoutStagedVsLive-1 (HIGH, E1/E2/E3): staged S-ids collide with the lane's own rows — lane S104=RFC 8785, S115=NATS, S133=arXiv 2607.14166, S198/S199 = jj docs (SOURCES.md:117,128,142,150,151). Any text citing them as OMP rows is wrong. Repro: `grep -n -E '^\| S(104|115|133|198|199) ' corpus/SOURCES.md | cut -c1-90`.
- K65ScoutStagedVsLive-2 (HIGH, E2:114-117): "OMP sends `Mcp-Method` / `Mcp-Name` (SEP-2243 shape)" has no support: 0 hits in tag src/docs, 0 in binary. Repro: `grep -a -o -F 'Mcp-Method' ~/.local/bin/omp.real | wc -l` → 0.
- K65ScoutStagedVsLive-3 (HIGH, E3:191): "installed release is *with* upstream / not behind" is false as stated: main is 170 commits ahead; only the MCP surface is identical. Repro: `curl -s https://api.github.com/repos/can1357/oh-my-pi/compare/v18.12.6...0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0 | grep ahead_by`.
- K65ScoutStagedVsLive-4 (MED, E3:214-218): "every `omp --version` reading is read through a wrapper, not from the release" contradicted — `--version` is a one-shot arg and the wrapper `exec`s the binary (wrapper line `-p|--print|…|--version|…) oneshot=1`).
- K65ScoutStagedVsLive-5 (MED, E3:215-218): "nine crashes in two days" is header text only; host shows no coredump and ten different-class native panics today. Repro: `coredumpctl list --no-pager | grep -c omp`; `ls ~/.omp/logs | grep -c native-panic`.
- K65ScoutStagedVsLive-6 (MED, E1:12-14): "S115 docs/mcp-protocol-transports.md confirms 2025-11-25" — that doc carries no such literal at v18.12.6 (`grep -c 2025-11-25` → 0); only `mcp-runtime-lifecycle.md:101` does.
- K65ScoutStagedVsLive-7 (MED, E2:107): the changelog line quoted "in the same words" is absent at v18.12.6 (`grep -c -E '8264|2025-11-25|MCP-Protocol-Version' packages/coding-agent/CHANGELOG.md` → 0); ship evidence is ancestry.
- K65ScoutStagedVsLive-8 (LOW): misattributed spec section (2.14), "normative" overclaim (2.15), Legacy→Modern row omits the HTTP 400 half (2.18), `transports/` list omits sse/stdio/index (1.20), dangling refs to `mcp-2026-07-28-maintainer-account.md` and the rejected tracker entry, `verified-at`/recheck pins to main and 2026-10-24 (stale for O1/O6).
- K65ScoutStagedVsLive-9 (LOW, probe subject): probe lacks keys for facts the entry needs — suggest `real_sha256`, `wrapper_bytes`, `wrapper_backoff_s`, `wrapper_oneshot_version`, `lit_Mcp-Session-Id`, `lit_Mcp-Method`, `lit_Mcp-Name` (values in classification.md); strengthening only.
- Note (not a defect): #8167 comment-age "71 days" is 76 on 2026-10-25.

## Artifacts
- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ScoutStagedVsLive/classification.md (per-sentence tables E1/E2/E3 + edit table + probe-key map)
- scratch /tmp/kumitate-r65/K65ScoutStagedVsLive/ (fetched raw files, tree/compare JSON; 7.9 MB; tag clone removed)

## Limits
- Entries 4 (tracker) and 5 (session/collab) classified only where cross-referenced (tracker re-measured; collab doc quotes confirmed present at tag; S199's "§Connection establishment" cite points at `### Per-server connect pipeline` under that H2, not re-audited further). MERGE-REPORT / SOURCES.append rows read, not classified sentence by sentence.
- Docs-only claims ("never replayed automatically", 250 ms gate) are not host-measurable (`docs_phrase_never_replayed=0`); not tested in source.
- Did not run omp interactively; staged sweep's `omp --version` through wrapper not re-run (forbidden); inferred from wrapper text.
- Spec GA date, CANNOT-ANSWER §10, and "unmoved since round 4" not verifiable. Installed tools: none.
