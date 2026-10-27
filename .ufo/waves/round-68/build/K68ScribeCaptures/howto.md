# Capture-pin howto — S207..S213, kumitate round 68 (seat K68ScribeCaptures)

Everything below was exercised on a `git clone --shared` of the lane in scratch (commit
`fc63bd8d` of the fixture) and, for the negative cases, on `git archive` extractions of it.
Lane files were not modified.

## 1. The seven captures (bytes verified twice: local copy + live re-fetch, 2026-10-27)

| id | URL (row verbatim) | bytes | sha256 | source of the bytes |
|---|---|---|---|---|
| S207 | https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md | 3839 | `c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa` | live fetch = canonical `captures/deprecated-2026-07-28.md` |
| S208 | https://modelcontextprotocol.io/community/feature-lifecycle.md | 8794 | `3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee` | live fetch = canonical `captures/feature-lifecycle.md` |
| S209 | https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts | 15183 | `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0` | live fetch (HTTP 200) = scribe `S209-omp-v18.12.6-sse.ts` |
| S210 | https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/183238ddacd0118a22399cd4743a5b5eaa43dbdd/seps/2596-spec-feature-lifecycle-and-deprecation.md | 26389 | `6608969be1213cafd12edc27269519be54b3fadb0443ff0f1b5fc76f75752de4` | live fetch at that commit = scribe `S210-sep2596.md` |
| S211 | https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md | 16321 | `ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc` | live fetch = scribe `S211-transports-2025-11-25.md` |
| S212 | https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts | 15183 | `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0` | live fetch (HTTP 200); bytes equal S209's — verified at both tags, not copied blindly |
| S213 | https://github.com/modelcontextprotocol/modelcontextprotocol/commit/183238ddacd0118a22399cd4743a5b5eaa43dbdd.patch | 43988 | `ff518cf333b141ab8de8d23baddeecf698e6b6f7a6143d8d0fc8a2aa2a6fa919` | live fetch (HTTP 200) = scribe `S213-commit-183238ddac.patch` |

Two rows share a hash by fact, not by mistake: `sse.ts` is byte-identical at tags v18.12.6 and
v18.13.1 (both re-fetched today). Keep both files; the pin is per row.

Row-URL / capture coupling: the capture MUST be the artifact the row URL serves. The docs page
`https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation.md` serves a
*different* rendering (25830 bytes, `cc50162d…`) than the raw file pinned to the S210 row URL
(26389). Pinning the 25830 file against the raw-at-commit row URL leaves M4/M5 to disagree.
`S210-sep2596-at-183238ddac.md` names the artifact; do not reuse the bare `sep2596.md` name.

## 2. Stage the captures (lane-relative, no exemption involved)

```
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
E=.ufo/waves/round-68/build/K68ScribeEntry/captures
C=.ufo/waves/round-68/build/captures
mkdir -p "$C"
cp "$E"/S207-deprecated-2026-07-28.md      "$C"/S207-deprecated-2026-07-28.md
cp "$E"/S208-feature-lifecycle.md          "$C"/S208-feature-lifecycle.md
cp "$E"/S209-omp-v18.12.6-sse.ts           "$C"/S209-sse-v18.12.6.ts
cp "$E"/S210-sep2596.md                    "$C"/S210-sep2596-at-183238ddac.md
cp "$E"/S211-transports-2025-11-25.md      "$C"/S211-transports-2025-11-25.md
cp "$E"/S212-omp-v18.13.1-sse.ts           "$C"/S212-sse-v18.13.1.ts
cp "$E"/S213-commit-183238ddac.patch       "$C"/S213-commit-183238ddac.patch
```

Names are id-prefixed on purpose: the shared `captures/` directory already held two different
bytes for S210 and a misdated `transports-2025-11-05.md`; an id-prefixed name cannot silently
mean two documents. Unpinned leftovers (API JSONs other seats captured) do not fail the gate —
leave them alone; only a *pin without a row* is an `orphan-capture`.

## 3. Regenerate the pins from the committed bytes (never paste hashes)

```
node .ufo/waves/round-68/build/K68ScribeCaptures/gen-pins.mjs \
     .ufo/waves/round-68/build/captures --merge     # idempotent; keeps id order, drops stale S207..S213 rows
node .ufo/waves/round-68/build/K68ScribeCaptures/gen-pins.mjs \
     .ufo/waves/round-68/build/captures --check     # PINS_OK 7/7 bytes match registry, exit 0
```

`--merge` also strips S207..S213 from any exemption entry, so the "exempt instead of capture"
shortcut cannot survive a regeneration. The fragment in `pins.json-fragment` is the `--emit`
output of these bytes; it is a receipt, not a source of truth.

## 4. Exemptions: none needed — and one that must not be added

Exemptions in `source-capture.mjs` are keyed by **S-id only** (`loadRegistry`, ids joined into the
same `Set` as captures); there is no path-pattern exemption. New paths under
`.ufo/waves/round-68/build/captures/` need no entry. Keep the single pre-rule blob
(S001–S107, reason: rule starts at round 55) untouched.

Counter-indication, measured: moving S207..S213 from `captures` to an exemption entry yields
`SOURCE_CAPTURE: CLEAN captures=38 exemptions=114` (exit 0) while the frozen counter reports
`M3 MISS cited=7 S207:pin-absent…` and `held=5/10`. The gate cannot tell an exemption from a
capture; only the counter's M3 can. Never exempt a cited row.

## 5. Ordering that matters

Rows must land **inside `## Registry`** (after the `| S206 |` row). Appending them at end of file
gives `SOURCES_CHECK: DRIFT (ROW_OUTSIDE_REGISTRY,ENTRY_SOURCE_UNKNOWN)` and the pins then bind
orphans outside the registry. Rows + pins + captures + entry must land in the **same commit**:
a pin without its row is `orphan-capture`, a row without its pin is `uncaptured`, both exit 1.

## 6. Close verification (the exact command the L1 runs)

Worktree is not evidence — the gate reads files, tracked or not (`git status` showed the eight
capture files untracked while the worktree gate still printed CLEAN). Verify on the archive:

```
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
M=$(git rev-parse HEAD)
A=$(mktemp -d /fast/scratch/hyaku/kumitate-r68/K68ScribeCaptures/close.XXXX)
git archive "$M" | tar -x -C "$A"
( cd "$A" && node scripts/source-capture.mjs )        # must print: SOURCE_CAPTURE: CLEAN captures=45 exemptions=107
( cd "$A" && node scripts/sources-check.mjs | tail -1 )   # SOURCES_CHECK: CLEAN
node .ufo/waves/round-68/probe/deprec68-probe.mjs "$PWD" "$M"   # M3 must PASS; live M5 needs the network
rm -rf "$A"
```

Measured on the fixture commit `fc63bd8d` (7 rows + entry + 7 pins + 7 captures):
`SOURCE_CAPTURE: CLEAN captures=45 exemptions=107` (exit 0), `SOURCES_CHECK: CLEAN (rows=152 …)`,
and `deprec68-probe.mjs … > DEPREC68_UNMET held=9/10 … | M9 MISS readme-map-exit=1,province-entry-not-named`
— M3, M4, M5 (live), M6, M7, M8 all PASS; M9 is the L1's, outside the pin layer.

M9's readme-map arm needs **three** landings, not one: the entry file, a `corpus/README.md` row, and
`knowledge/mcp-deprecation-registry.md` in `.ufo/pins/readme-map.json` `covered`. The lane's map is
currently `README_MAP: CLEAN files=163 rows=163 covered=163` and `covered` does not yet name the entry;
the row alone reads `DRIFT … first=unpinned:`. K68ScribeEntry reports its fixture reaching
`DEPREC68_HELD held=10/10` once that triple plus the PROVINCE line land (peer measurement; the
mechanism above was re-read here, the 10/10 run was not reproduced by this seat).

## 7. What the pin layer cannot do (attacked, reproduced)

| attack | gate verdict | counter verdict |
|---|---|---|
| A: pin S211 to the site's 404 body (`https://modelcontextprotocol.io/specification/2025-11-05/basic/transports.md` → HTTP 404, 831 B, `68b6ff60…`) | `SOURCE_CAPTURE: CLEAN captures=45` (exit 0) | `M4 MISS S211:quote-not-in-capture,S211:no-bullet` |
| B: seven ids exempted instead of captured | `CLEAN captures=38 exemptions=114` (exit 0) | `M3 MISS … S207:pin-absent…`, `held=5/10` |
| C: one byte-level hash flipped on S213 | `DRIFT … first=S213:hash-mismatch` (1) | — |
| D: S212 capture replaced by a symlink | `DRIFT … S212:not-a-regular-file` (1) | — |
| E: pin path `../outside.txt`, bytes/hash honest | `DRIFT … S210:path-escape` (1) | — |
| F: capture reached through a symlinked directory | `DRIFT … S208:path-escape` (1) | — |

The pin layer proves byte fidelity and lane confinement, never document identity. Document identity
is only ever established by the entry's located quotes (M4) plus the live re-fetch (M5). A capture
that is a 404 page is a legitimate pin.
