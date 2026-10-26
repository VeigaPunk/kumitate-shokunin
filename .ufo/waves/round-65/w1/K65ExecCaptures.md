VERDICT: All five C2 captures (S201–S205) are fetched, byte-stable across two independent fetches and, for the four raw files, across tag-vs-release-commit URLs; the five pin entries bind cleanly (`SOURCE_CAPTURE: CLEAN captures=37 exemptions=107`, exit 0) once rows exist, and fail only with `S201..S205:orphan-capture` while the SOURCES rows are still absent.

# K65ExecCaptures — round 65 / w1

## Evidence

Fetch (each URL twice, UA `Mozilla/5.0 (kumitate-r65)`, `--max-time 120`), then `cmp a/… b/…`:

```
S201 STABLE 16167 caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d
S202 STABLE 22741 362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d
S203 STABLE 9953  eedfbbc405d55fdb205b74a76a67f06a0a78fa9b383a06a491107a034e172c9b
S204 STABLE 16030 83c96c5097f69c0b6f13b7fb9a9b940d7f9078136154518243746765628d057b
S205 STABLE 14975 479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9
```

HTTP receipts (re-run once, `-o /dev/null -w`, verbatim, full file at `build/K65ExecCaptures/capture-receipts.txt`):

```
S201 http=200 content_type=text/plain; charset=utf-8 bytes=16167 url_effective=https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/types.ts
S202 http=200 content_type=text/plain; charset=utf-8 bytes=22741 url_effective=https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/docs/mcp-runtime-lifecycle.md
S203 http=200 content_type=text/plain; charset=utf-8 bytes=9953  url_effective=https://github.com/can1357/oh-my-pi/commit/10bce6900b5bdcf7479ed718f52902feeab9ed00.patch
S204 http=200 content_type=text/plain; charset=utf-8 bytes=16030 url_effective=https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/package.json
S205 http=200 content_type=text/plain; charset=utf-8 bytes=14975 url_effective=https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts
```

`sha256sum capture/*` in the lane build dir equals the five hashes above; `grep -lc $'\r' capture/*` → no CR in any capture.

Third stability axis — same files via the release commit `45c35e40c46166dc726ccc52f5d27f40f2449f99` (`base/omp-release-tag.txt`) instead of the tag:

```
types.ts tag-commit-identical YES
mcp-runtime-lifecycle.md tag-commit-identical YES
package.json tag-commit-identical YES
client.ts tag-commit-identical YES
```

Gate run in a scratch clone (`git clone --no-hardlinks … kumitate-shokunin /tmp/kumitate-r65/K65ExecCaptures/clone`; `git -C clone rev-parse --show-toplevel` = `/tmp/kumitate-r65/K65ExecCaptures/clone`, HEAD `2ca91a0c81542cad5f731049aa55dd2f99ade98d`; captures copied into the clone at the pinned relative path; fragment appended to the clone's `.ufo/pins/source-captures.json`):

Rows absent (the real state of the lane):
```
SOURCE_CAPTURE: note S202:orphan-capture
SOURCE_CAPTURE: note S203:orphan-capture
SOURCE_CAPTURE: note S204:orphan-capture
SOURCE_CAPTURE: note S205:orphan-capture
SOURCE_CAPTURE: DRIFT captures=37 exemptions=107 bad=5 first=S201:orphan-capture
EXIT=1
```
No `capture-absent`, `hash-mismatch`, `bytes-mismatch` or `path-escape` line → every path/hash/size binds.

Same clone with five 11-cell draft rows appended to `corpus/SOURCES.md` (gate fixture only, not authored rows):
```
appended 5 rows; each cells = 11,11,11,11,11
SOURCE_CAPTURE: CLEAN captures=37 exemptions=107
EXIT=0
```

Ancestry of the patch against the installed tag:
```
status=ahead ahead_by=15357 behind_by=0 total_commits=10000
```

## Findings

**K65ExecCaptures-1 — medium — S205 cannot carry the `2025-11-25` literal.** `packages/coding-agent/src/mcp/client.ts` at v18.12.6 contains zero occurrences of it; the literal is defined in S201 (`types.ts:181 export const MCP_PROTOCOL_VERSION = "2025-11-25";`) and introduced by S203 (`patch:161`), and the client only imports and forwards the symbol (`client.ts:41`, `client.ts:100`). A `## Located quotes` bullet attributing the literal to S205 fails O4/O5.
Repro: `grep -c '2025-11-25' capture/omp-v18.12.6-mcp-client.ts` → `0`.

**K65ExecCaptures-2 — low — S204 carries no protocol literal and no MCP field.** `package.json` at v18.12.6 has only identity (`:2 "name": "@oh-my-pi/pi-coding-agent"`, `:3 "version": "18.12.6"`); it can ground the release-version claim, nothing else.
Repro: `grep -c '2025-11-25\|MCP_PROTOCOL_VERSION' capture/omp-v18.12.6-coding-agent-package.json` → `0`.

**K65ExecCaptures-3 — low — every capture is served as `text/plain; charset=utf-8`, not JSON/HTML/patch media types.** The `.json`, `.patch`, `.md` and `.ts` bytes are unrendered text on tabs/newlines (see `capture-receipts.txt`); quotes must be normalised for whitespace, and no row/entry sentence may claim an HTML rendering of these URLs.
Repro: `cat build/K65ExecCaptures/capture-receipts.txt`.

**K65ExecCaptures-4 — info — S203 is provably the origin of the release's revision.** `compare/10bce690…v18.12.6` reads `behind_by=0`, and the release bytes already carry the post-patch constant (`types.ts:181`), so the patch is an ancestor of the installed tag; the doc agrees (`mcp-runtime-lifecycle.md:101`). This lets the C2 entry name `2025-11-25` and the skew cause without inferring it.
Repro: the `compare` command in Evidence.

**K65ExecCaptures-5 — medium (integration order) — the captures must be committed, not merely present.** `.gitignore` in the lane ignores only `.ufo/interactive-sessions/`; `git check-ignore -v .ufo/waves/round-65/build/K65ExecCaptures/capture/omp-v18.12.6-mcp-types.ts` exits 1, and the round-64 analogues are tracked (`git ls-files --error-unmatch …/round-64/build/Capture/jj-v0.46.0-technical-concurrency.html` resolves). O3 asks for a committed capture bound by sha256 and size, so the L1 must `git add` the five files together with the merged fragment; the pin paths are already lane-relative and correct.
Repro: as quoted above.

**K65ExecCaptures-6 — info — the fragment appends cleanly in registry order.** Fragment is `{version: 1, captures: [5]}` with the registry's exact entry keys (`sourceId,path,sha256,bytes,captured`) and no `exemptions` key; appending after S200 keeps ascending order and the duplicate-id check untouched (clone run above read `captures=37`, i.e. 32 existing + 5).

## Artifacts

- `.ufo/waves/round-65/build/K65ExecCaptures/capture/omp-v18.12.6-mcp-types.ts` (16167 b)
- `.ufo/waves/round-65/build/K65ExecCaptures/capture/omp-v18.12.6-mcp-runtime-lifecycle.md` (22741 b)
- `.ufo/waves/round-65/build/K65ExecCaptures/capture/omp-commit-10bce690.mcp.patch` (9953 b)
- `.ufo/waves/round-65/build/K65ExecCaptures/capture/omp-v18.12.6-coding-agent-package.json` (16030 b)
- `.ufo/waves/round-65/build/K65ExecCaptures/capture/omp-v18.12.6-mcp-client.ts` (14975 b)
- `.ufo/waves/round-65/build/K65ExecCaptures/source-captures.fragment.json` — the five pin entries, merge = concat into `.ufo/pins/source-captures.json`
- `.ufo/waves/round-65/build/K65ExecCaptures/place.sh` — cp-only re-materialisation from the scratch staging dir (not run)
- `.ufo/waves/round-65/build/K65ExecCaptures/capture-receipts.txt` — verbatim HTTP/hash receipts
- `.ufo/waves/round-65/build/K65ExecCaptures/draft-rows.for-gate-check.txt` — the five 11-cell rows used only to make the clone gate read CLEAN (not authoritative; scouts own the real rows)
- Scratch: `/tmp/kumitate-r65/K65ExecCaptures/{a,b,tag,clone}` (small; clone left for later arms)

## Limits

- Did not verify O4 quote-finding or O5 live re-fetch per bullet — that is the scribe/critic's measurement; I only established byte identity and where each candidate quote lives.
- Did not open S201–S205's relation to the other staged merge entries, nor to `lit_2026_07_28` (absent from all five captures: `grep -c '2026-07-28\|lit_2026_07_28' capture/*` → 0 for every file; that literal has to come from the binary probe, not from these rows).
- Did not run `scripts/omp-binary-probe.sh`, the C1/C2 counters, or any other gate; the only program executed from the OMP tree was none (no `~/.local/bin/omp.real` call was needed).
- `compare` API response reports `total_commits=10000` (server-side cap on the commit list); only `behind_by=0` is load-bearing and it is consistent with the release bytes.
- No tools installed or upgraded in this seat; no pacman/uv/npx use.
