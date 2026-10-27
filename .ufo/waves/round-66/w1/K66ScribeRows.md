VERDICT: S207–S211 are drafted, opened 2026-10-27, captured with digests, and a sandbox-clone integration of them scores the frozen counter at DEPREC66_HELD held=8/8 (exit 0) with census/sources-check/source-capture/readme-map all CLEAN — so the rows are pasteable as-is, and the entry's HTTP+SSE clock is provably a state, not a date.

# K66ScribeRows — C2 SOURCES rows

## Evidence

1. Sources opened (all HTTP 200, `curl -fsSL --max-time 60`, 2026-10-27):
```
200 3839  text/markdown  https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md
200 8794  text/markdown  https://modelcontextprotocol.io/community/feature-lifecycle.md
200 15183 text/plain     https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts
200 25830 text/markdown  https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation.md
200 16321 text/markdown  https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md
```
2. Captures persisted + digest check (`sha256sum` in the build dir):
```
c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa  capture/S207-mcp-2026-07-28-deprecated.md
3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee  capture/S208-mcp-feature-lifecycle.md
0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0  capture/S209-omp-v18.12.6-mcp-transports-sse.ts
cc50162d2fa78a20783f5bc6d6e10569aac8d546005f188bfa2b23f7b86a9468  capture/S210-sep-2596-spec-feature-lifecycle.md
ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc  capture/S211-mcp-2025-11-25-basic-transports.md
```
3. Quote pre-check (mirror of the counter's `norm()`, capture + live): 15 candidates, 1 rejected (capital-T mismatch), 14 kept —
`QUOTES total=15 bad=1` → after dropping the miss, every kept quote is `cap=true live=true words<=25`.
4. Duplicate-URL sweep (`grep -c -F` per URL): lane `corpus/SOURCES.md` = `0 0 0 0 0`; sandbox copy after appending = `1 1 1 1 1`; no other file under the lane `corpus/` mentions any of the four docs URLs.
5. Sandbox-clone integration (`git clone --shared` → writes with `-C <clone>` only, `rev-parse --show-toplevel` = the clone, commit `e6f3d8a33e729e1169e0075fc7e6e671a735a6e1`), receipts in `build/K66ScribeRows/receipts.txt`:
```
DEPREC66_HELD held=8/8 checks=8 rev=e6f3d8a33e729e1169e0075fc7e6e671a735a6e1 rule=M66   probe-exit=0
file  W04 S034/S068/S084/S095/S123/S126 duplicate url … (the six carried) ; file ok  <clone>/corpus/SOURCES.md   census-exit=0
SOURCES_CHECK: CLEAN (rows=150 tiers=A:127,B:15,C:8 status=queued:13,mined:118,rejected:19 entries_with_source=23 legacy=38)   exit 0
SOURCE_CAPTURE: CLEAN captures=43 exemptions=107   exit 0
README_MAP: CLEAN files=161 rows=161 covered=161   exit 0
```
Lane baseline for the corpus gates at the freeze: census exit 0, same six W04; sources-check CLEAN `rows=145 mined:113` (`--json` on the lane).
6. Nothing installed or upgraded; node v24.21.0, curl 8.23.0, git 2.56.0. No pacman call. Scratch `/fast/scratch/hyaku/kumitate-r66/K66ScribeRows/` deleted after the receipts were copied out.

## Findings

- **K66ScribeRows-1 (medium, C2 entry substance — the clock)** — the registry's HTTP+SSE row does not carry a date;
  it carries a state: `Three months after SEP-2596 reaches Final`. S210 is Final yet dates only its creation
  (2026-04-17), so the clause is unresolvable from the two pages that state it. The pull-request record resolves it
  if Final means merged: `merged_state true`, `merged_at 2026-05-18T18:09:21Z`, merge commit `219f8242…`
  (`curl -fsSL https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2596`) — three months
  then elapsed 2026-08-18, i.e. the transport OMP still ships (S209) would already be *eligible* for removal. The
  equivalence is the reader's step, not the registry's; the entry must state the state, flag the merge date as
  PR-record-only, and not print 2026-08-18 as a registry fact. Reproduce:
  `curl -fsSL https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2596 | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);console.log(j.merged,j.merged_at)})'`
- **K66ScribeRows-2 (low, tool interface)** — the seat brief says to point `scripts/sources-check.mjs` at a file;
  it has no file option. `--help` offers `--self DIR` (lane root, "default: this script's parent directory"), so a
  scratch *lane root* is required. I used the sandbox clone with its own script copy:
  `node <clone>/scripts/sources-check.mjs --self <clone> --today 2026-10-27`.
- **K66ScribeRows-3 (low, integration hazard)** — the counter's `norm()` strips tags/markup but does **not** delink
  (`delink()` is applied to the snapshot table only). A quote may therefore not touch a `[text](url)` span: my
  candidate `The earliest removal marks when a feature becomes eligible for removal` failed for capitalisation, and
  a quote beginning inside S211's `[HTTP+SSE transport](…)` link would fail structurally. All 14 kept quotes end
  before the first link or live in plain prose. Reproduce with `check-quotes.mjs` logic in
  `build/K66ScribeRows/rows.md §3`.
- **K66ScribeRows-4 (low, entry shape)** — M6 wants *exactly* as many snapshot rows as the captured table (6 here)
  and each row's `Deprecated in` + `Earliest removal` text; a seventh pipe line in `## Registry snapshot` (a
  "Removed: none" placeholder) fails the count, since `snapRows` is every `|`-starting line of the section minus
  separators and `dataRows = snapRows.slice(1)` (:195-199). `## Removed` on S207 is empty, so the snapshot stops at six.
- **K66ScribeRows-7 (medium, frozen counter, reported not patched)** — M6's per-row check does **not** pair cells. It
  joins the snapshot into one string and asks `includes(depIn)` / `includes(removal)` for each captured cell
  (:197-203), so a snapshot that swaps two features' `Earliest removal` cells — or collapses all six rows onto the
  four-times-repeated `First revision released on or after 2027-07-28` clause — still reads `held=8/8`. Confirmed by
  code read and independently reported by seat `K66ScribeEntry`, which committed that exact swap mutant and saw
  8/8. Consequence for integration: my §4 table and the sibling's snapshot must be reviewed row-wise by a non-author;
  the counter cannot catch a mis-assigned cell. Reproduce by reading
  `.ufo/waves/round-66/probe/deprec66-probe.mjs:193-203` (or by swapping two rows' third cells in an integrated
  draft and re-running the probe; I did not re-run the mutant — the code path is unambiguous).
- **K66ScribeRows-5 (low, registry hygiene)** — S207 says of itself "This registry is a derived view … the
  per-feature deprecation notices and changelog entries … are the normative records". The entry must not present the
  registry as normative; the draft carries that in `## Limits`, and S207's `scope` cell says so.
- **K66ScribeRows-6 (low, coverage lead, not rowed)** — `https://modelcontextprotocol.io/seps/index.md` (HTTP 200,
  9106 bytes) is the one page that lists every SEP with its status (`SEP-2596 … Final`, `SEP-2577 … Final`, 43 Final
  rows) and is the cheapest status source for any future deprecation clock. It was opened, deliberately **not**
  rowed (five-row cap, S210 already carries SEP-2596's status) and should be a `## Leads (unopened)` correction —
  it *was* opened, so it belongs in a `Search log` note or a future row, not in Leads.

## Artifacts

- `.ufo/waves/round-66/w1/K66ScribeRows.md` (this report)
- `.ufo/waves/round-66/build/K66ScribeRows/rows.md` — deliverable: rows, capture bindings, quotes, snapshot cells, receipts
- `.ufo/waves/round-66/build/K66ScribeRows/rows-block.md` — the five rows, pasteable, byte-identical to what was scored
- `.ufo/waves/round-66/build/K66ScribeRows/entry-draft-mcp-deprecation-registry.md` — full entry draft (probe-scored, not for me to land)
- `.ufo/waves/round-66/build/K66ScribeRows/capture/S207…S211` — the five capture files with the digests above
- `.ufo/waves/round-66/build/K66ScribeRows/receipts.txt` — probe + four gates, verbatim

## Limits

- The probe ran on a **sandbox clone** of the lane, not on a lane commit: the lane has no entry and no S207–S211 rows,
  so the held=8/8 proves the rows/entry shape, not the lane's state. The clone also had to carry a README row,
  a `readme-map.json` member and a PROVINCE line for M8; the L1 owns all three, and `readme-map` will drift
  (`files=161 rows=160`) if the entry lands without its map row.
- M3's bindings above are the values the L1 should paste; I did not write `.ufo/pins/source-captures.json`.
- I did not read the per-feature deprecation notices S207 calls normative, nor the SEP guidelines that define when a
  SEP reaches Final; the entry states that gap rather than resolving it.
- Whether the installed release actually sends the deprecated `includeContext` values, and which SDK tier it belongs
  to, were not inspected.
- No sampling of other seats' rows; no claim about the C1 lane.
- **Id conflict, reported verbatim for the L1:** seat `K66ScribeEntry` message says "my draft cites exactly S207
  (deprecated page), S208 (feature-lifecycle), S209 (sse.ts at /v18.12.6/), same three ids you used first — so a merge
  must not renumber them", and its own draft also scores 8/8 on a fixture at freeze `621212ba`. The two seats agree on
  S207–S209's subjects; they differ in extent (mine adds S210 SEP-2596 status and S211 the 2025-11-25 transports page).
  One entry must land with one id assignment: if S210/S211 are dropped, both `source:` header and rows shrink; if kept,
  nothing already written may be renumbered to a different source.
