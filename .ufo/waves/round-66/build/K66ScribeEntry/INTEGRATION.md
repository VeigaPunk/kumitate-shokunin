# C2 entry — integration packet (K66ScribeEntry)

Entry draft (the deliverable, probe-scored 8/8):
`kumitate-shokunin/.ufo/waves/round-66/build/K66ScribeEntry/mcp-deprecation-registry.md`
→ lands at `corpus/knowledge/mcp-deprecation-registry.md` unchanged.

## Step 1 — the entry

`cp build/K66ScribeEntry/mcp-deprecation-registry.md corpus/knowledge/mcp-deprecation-registry.md`

Its first five lines are the header the gates read (`sources-check.mjs` requires `source:` on line 1 and the
`verified-at:` / `recheck:` trio inside the first five lines; `deprec66-probe.mjs` M1 reads the first fourteen).

## Step 2 — three SOURCES rows, appended directly after `| S206 |` inside `## Registry`

`build/K66ScribeEntry/sources-rows.txt` is paste-ready; each is one line, 11 cells (13 split fields).

- S207 — deprecated page, tier A, `mined`, opened `2026-10-27`, recheck `90d`
- S208 — feature-lifecycle policy, tier A, `mined`, opened `2026-10-27`, recheck `90d`
- S209 — `transports/sse.ts` at `/v18.12.6/`, tier A, `mined`, opened `2026-10-27`, recheck `90d`

Id note: a sibling seat (K66ScribeRows) drafted S207–S211 with the same first three subjects (S207 deprecated page,
S208 lifecycle, S209 sse.ts) and adds S210 (SEP-2596) and S211 (2025-11-25 transports). One entry ships; if theirs
ships, this file's rows are the same three ids and only its S210/S211 are additive. Do not renumber an already-written id.

## Step 3 — captures + pins

Copy the three captures from `build/K66ScribeEntry/capture/` to `.ufo/waves/round-66/build/Capture66/` (byte-identical:
hashes below) and append `build/K66ScribeEntry/pins-fragment.json` entries to `.ufo/pins/source-captures.json`.

| row | capture file | bytes | sha256 |
| - | - | - | - |
| S207 | `mcp-deprecated-2026-07-28.md` | 3839 | `c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa` |
| S208 | `mcp-feature-lifecycle.md` | 8794 | `3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee` |
| S209 | `omp-v18.12.6-mcp-transports-sse.ts` | 15183 | `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0` |

The capture bytes are the three URLs fetched 2026-10-27 through the counter's own curl line
(`curl -fsSL --max-time 90 --retry 2 -A 'Mozilla/5.0 (kumitate-deprec66)' <url>`); no bytes were edited.

## Step 4 — two registry hops, same commit

`build/K66ScribeEntry/integration-lines.txt` holds both lines exactly as scored:

- `corpus/README.md` — one coverage-map row `| \`knowledge/mcp-deprecation-registry.md\` | ... |`; and
  `.ufo/pins/readme-map.json` `covered` gains `knowledge/mcp-deprecation-registry.md` (v2 ratchet: a live corpus file
  with no pin is DRIFT).
- `PROVINCE.md` — the existing frontier line for the band "MCP protocol revisions as they bear on orchestration" gains
  the clause naming the new entry (M8 requires a frontier line that both names the entry path and says
  frontier/band/first entry/advanced).

**Ordering (measured, see K66ScribeEntry-3):** steps 1–4 must land in ONE commit. Rows without the entry →
`sources-check` DRIFT `USED_BY_MISSING`; README row without the file → `readme-map` DRIFT `orphan-row`.
