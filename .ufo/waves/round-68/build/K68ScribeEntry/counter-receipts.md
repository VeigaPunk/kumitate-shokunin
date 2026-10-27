# K68ScribeEntry — counter receipts (verbatim commands and outputs)

Fixture: `git clone --shared /home/vgpnk/Projects/shokunin/kumitate-shokunin <scratch>/lane` at lane tip
`39f61816`, then the integration payload applied and committed inside the clone only (recipe:
`fixture-recipe.py` in this directory, plus the two extra steps listed at the bottom). The clone's revisions are
fixture-local: the recipe reproduces the STATE, not the hash. No lane or fleet git/jj index was touched.

## R1 — structural run, entry + rows + pins + PROVINCE line, no README row (offline)

    $ TMPDIR=<scratch> node .ufo/waves/round-68/probe/deprec68-probe.mjs <clone> 0c0295cff30517c923ea55885b7f2ad7a8d6a169 --no-live
    DEPREC68_UNMET held=8/10 checks=10 rev=0c0295cff30517c923ea55885b7f2ad7a8d6a169 rule=M68 | M5 MISS no-live | M9 MISS readme-map-exit=1
    EXIT=1

## R2 — same revision, live network (M5 arms exercised)

    $ TMPDIR=<scratch> node .ufo/waves/round-68/probe/deprec68-probe.mjs <clone> 0c0295cff30517c923ea55885b7f2ad7a8d6a169
    DEPREC68_UNMET held=9/10 checks=10 rev=0c0295cff30517c923ea55885b7f2ad7a8d6a169 rule=M68 | M9 MISS readme-map-exit=1
    EXIT=1

## R3 — mutant: a standard markdown delimiter row `|---|---|---|---|---|` inserted under the snapshot header

    $ git -C <clone> commit -qam "fixture variant: standard markdown delimiter row inserted"
    $ git -C <clone> rev-parse HEAD
    8f444e1b6e1653e381df8569485f5f0d4491acb8
    $ TMPDIR=<scratch> node .ufo/waves/round-68/probe/deprec68-probe.mjs <clone> 8f444e1b6e1653e381df8569485f5f0d4491acb8 --no-live
    DEPREC68_UNMET held=7/10 checks=10 rev=8f444e1b6e1653e381df8569485f5f0d4491acb8 rule=M68 | M5 MISS no-live | M6 MISS rows=7!=6 | M9 MISS readme-map-exit=1
    EXIT=1

## R4 — integrated revision (README row + readme-map pin added), live

    $ TMPDIR=<scratch> node .ufo/waves/round-68/probe/deprec68-probe.mjs <clone> 187e940b3a41d697d460110ce6d380c52fb85354
    DEPREC68_HELD held=10/10 checks=10 rev=187e940b3a41d697d460110ce6d380c52fb85354 rule=M68
    EXIT=0

## R5 — final draft of the entry (tag-commit provenance added), live

    $ TMPDIR=<scratch> node .ufo/waves/round-68/probe/deprec68-probe.mjs <clone> 03547a4b3f380552a6eab08e6ef02bb150a2e732
    DEPREC68_HELD held=10/10 checks=10 rev=03547a4b3f380552a6eab08e6ef02bb150a2e732 rule=M68
    EXIT=0

## Gate lines on the integrated fixture (R4 revision)

    $ node scripts/source-dupes.mjs
    SOURCE_DUPES: CLEAN groups=6 known=6
    $ node scripts/sources-check.mjs
    SOURCES_CHECK: CLEAN (rows=152 tiers=A:129,B:15,C:8 status=queued:13,mined:120,rejected:19 entries_with_source=23 legacy=38)
    $ node scripts/source-capture.mjs
    SOURCE_CAPTURE: CLEAN captures=45 exemptions=107
    $ node scripts/cite-sources.mjs
    CITE_SOURCES: CLEAN cited=206

`README_MAP` before the README row (R2 state):

    README_MAP: note unpinned:knowledge/mcp-deprecation-registry.md
    README_MAP: DRIFT files=164 rows=163 covered=163 bad=2 first=uncovered:knowledge/mcp-deprecation-registry.md

`README_MAP` with the row only (still DRIFT, the covered set is a separate registry):

    README_MAP: DRIFT files=164 rows=164 covered=163 bad=1 first=unpinned:knowledge/mcp-deprecation-registry.md

`README_MAP` with the row and `.ufo/pins/readme-map.json` extended by
`knowledge/mcp-deprecation-registry.md`:

    README_MAP: CLEAN files=164 rows=164 covered=164

## Capture hashes (this seat's captures, in `captures/`)

    3839  c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa  S207-deprecated-2026-07-28.md
    8794  3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee  S208-feature-lifecycle.md
    15183 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0  S209-omp-v18.12.6-sse.ts
    26389 6608969be1213cafd12edc27269519be54b3fadb0443ff0f1b5fc76f75752de4  S210-sep2596.md
    16321 ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc  S211-transports-2025-11-25.md
    15183 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0  S212-omp-v18.13.1-sse.ts
    43988 ff518cf333b141ab8de8d23baddeecf698e6b6f7a6143d8d0fc8a2aa2a6fa919  S213-commit-183238ddac.patch

S212 is byte-identical to S209 (same size, same sha256) — the file did not change between the two tags.

## Scout captures are the same bodies with a provenance header prepended (bodies identical)

    $ diff <(tail -n +2 .ufo/waves/round-68/build/K68ScoutS207/captures/deprecated-2026-07-28.md) captures/S207-deprecated-2026-07-28.md
    SAME
    $ diff <(tail -n +2 .ufo/waves/round-68/build/K68ScoutS208/captures/feature-lifecycle.md) captures/S208-feature-lifecycle.md
    < 8 header lines (source / command / http_status / content_type / body_bytes / body_sha256 / note)
    SAME
    $ diff <(tail -n +4 .ufo/waves/round-68/build/K68ScoutS209/captures/sse-v18.12.6.ts) captures/S209-omp-v18.12.6-sse.ts
    < 3 header lines (tag, byte-identical note, raw-bytes marker)
    SAME

## Provenance checks run for the entry's claims

    $ omp --version
    omp/18.13.1
    $ git ls-remote https://github.com/can1357/oh-my-pi 'refs/tags/v18.13.1*' 'refs/tags/v18.12.6*'
    45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6
    0838d2ab4407b74e870de07e1a6780a13c7d542c	refs/tags/v18.13.1
    $ curl -fsSL https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/219f82421ce13f6b0d9f786e603cf9a659fd5216/seps/2596-spec-feature-lifecycle-and-deprecation.md | sed -n 3p
    - **Status**: Draft
    $ grep -c '2026-04-17\|2026-05-18' mcp-deprecation-registry.md
    0

The last two are the disproof of the alternative clock readings: the PR merge commit (`219f8242`, PR `merged_at`
2026-05-18) still carried `Status: Draft` for SEP-2596, and the status flip lands only in `183238ddac` (author date
`Wed, 3 Jun 2026 13:45:19 -0700`). PR metadata, fetched 2026-10-27, is kept as `pr2596-api.json`
(`merged_at=2026-05-18T18:09:21Z`, `merge_commit_sha=219f82421ce13f6b0d9f786e603cf9a659fd5216`).

## The two extra fixture steps not in fixture-recipe.py

README row inserted after the last `| `knowledge/…` |` row of `corpus/README.md`:

    | `knowledge/mcp-deprecation-registry.md` | MCP deprecation registry re-grounded at the installed release (S207-S213): the six-row Deprecated table at 2026-07-28, the policy's revision-anchored twelve-month floor, the SEP-2596 grace that elapsed 2026-09-03, and the legacy HTTP+SSE transport still present in the source at v18.13.1 | S207, S208, S209, S210, S211, S212, S213; `.ufo/waves/round-68/build/K68ScribeEntry/captures/` |

and `.ufo/pins/readme-map.json`: append `knowledge/mcp-deprecation-registry.md` to `covered`, sorted
(163 → 164 entries, `version: 2` unchanged).
