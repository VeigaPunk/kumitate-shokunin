# Search log — "which OMP source carries the MCP protocol revision the installed release negotiates"

Seat K65ScribeSearchLog (round 65, wave w1). Date of search: **2026-10-25**. Scratch clone:
`/tmp/kumitate-r65/K65ScribeSearchLog/omp.git` (deleted after the run; nothing under the lane).

## (a) PRISMA-style note

| item | value |
|---|---|
| question | Which file(s) in the installed OMP release carry the MCP protocol revision that release negotiates, and what do they say? |
| population | the full tree of tag `v18.12.6` (= `45c35e40c46166dc726ccc52f5d27f40f2449f99`, confirmed by `git ls-remote`), not a path-filtered subset |
| date searched | 2026-10-25 |
| identified | **17 files / 27 matching lines** (`git grep -n -I -E '2025-11-25\|2026-07-28' v18.12.6`, no path filter) |
| screened | 17 files (every hit line read at the tag; nothing sampled) |
| included | **4 files** → 2 opened as new registry rows (S201 `packages/coding-agent/src/mcp/types.ts`, S202 `docs/mcp-runtime-lifecycle.md`), 2 kept as pointer lines folded into those rows (`packages/coding-agent/src/mcp/transports/http.ts` :6,:104,:127,:179; `docs/mcp-config.md` :564) |
| excluded | **13 files** (table below) |
| not searched | GitHub code search (`https://github.com/search?type=code`) — needs an authenticated session; replaced by the exhaustive literal sweep of the tag tree, which is strictly stronger for a literal question (a code-search hit set is a ranked subset) |

### Included (2 rows + 2 pointers), with counts

| file @ v18.12.6 | lines | literal hits | disposition |
|---|---|---|---|
| `packages/coding-agent/src/mcp/types.ts` | :11-12, :177, :181, :232, :241 | 6 × `2025-11-25` | **S201** — `export const MCP_PROTOCOL_VERSION = "2025-11-25";` (:181) under "Latest MCP protocol revision this client negotiates." (:170-180) |
| `docs/mcp-runtime-lifecycle.md` | :101 | 1 × `2025-11-25` | **S202** — "performs MCP `initialize` using protocol version `2025-11-25` and advertises the `roots` capability" (:101); :106 restates the negotiated-revision echo |
| `packages/coding-agent/src/mcp/transports/http.ts` | :295 (+ symbols :6, :104, :127, :179) | 1 × `2025-11-25` | pointer — carries the `MCP-Protocol-Version` header (`:127`) and `setProtocolVersion` (`:179`); no row owns it (see finding -4) |
| `docs/mcp-config.md` | :564 | 1 × `2025-11-25` | pointer — links the transports spec at the same revision; the document already has lane row S024 (queued), so no new row (finding -3) |

### Excluded (13 files), with the reason for each

| file @ v18.12.6 | hits | exclusion reason |
|---|---|---|
| `packages/ai/CHANGELOG.md`, `packages/catalog/CHANGELOG.md`, `packages/natives/CHANGELOG.md`, `packages/tui/CHANGELOG.md`, `packages/utils/CHANGELOG.md` | 1 each | date collision only: `## [17.1.8] - 2026-07-28` is a package release heading, not an MCP revision |
| `crates/vendor/napi/CHANGELOG.md` | 1 | date collision: `napi-v3.12.0 … - 2026-07-28`, vendored third-party changelog |
| `packages/ai/src/utils/schema/fields.ts` | 1 | the literal is inside a **comment** (:53 `// MCP 2026-07-28 transport annotation …`) describing the `x-mcp-header` strip keyword (code at :57); it documents a schema keyword, not the negotiated revision — kept as Lead 3 |
| `packages/ai/test/schema-normalization.test.ts` | 1 | test asserting the same comment-described keyword; tests do not ground what the release negotiates |
| `packages/coding-agent/test/fixtures/cancellable-mcp.ts`, `…/flaky-http-mcp.ts`, `…/progress-mcp.ts` | 1 each | test fixtures that *answer* `protocolVersion: "2025-11-25"`; they mirror the client, they do not define it |
| `packages/coding-agent/test/mcp-http-transport.test.ts` | 6 | asserts the header echo (`setProtocolVersion` :861/:963, expectations :867/:969); behaviour evidence, superseded by the source it tests |
| `packages/coding-agent/test/sdk-mcp-defer.test.ts` | 1 | same class: fixture-shaped assertion |

### Stop rationale

Stopped after one exhaustive sweep: the tag tree is finite, `git grep` over it with no path filter returned 27 lines and exit 0, and every line was classified. A re-run cannot add hits, and a second query axis is not a second *sweep* — the other four rows this round (S203 commit `10bce6900`, S204 `package.json`, S205 `client.ts`) came from complementary axes (`git log`/GitHub compare and a symbol grep for `MCP_PROTOCOL_VERSION`/`protocolVersion`), not from literals, and are outside this note's population. GitHub code search was the only unsearched surface and cannot return a hit this sweep does not contain.

### Commands actually run (all with `-C`, nothing outside scratch)

```
$ git ls-remote --tags https://github.com/can1357/oh-my-pi 'refs/tags/v18.12.6' 'refs/tags/v18.12.6^{}'
45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6                      # exit 0

$ git clone --filter=blob:none --no-checkout --depth 1 --branch v18.12.6 \
    https://github.com/can1357/oh-my-pi /tmp/kumitate-r65/K65ScribeSearchLog/omp.git
real 0m0.770s    # clone printed only "Cloning into 'omp.git'…", no error line (78 MB blob-less);
                 # the EXIT=0 I echoed there belonged to the `tail` in the pipe, so the success
                 # evidence is the next line:
$ git -C …/omp.git rev-parse HEAD          # exit 0
45c35e40c46166dc726ccc52f5d27f40f2449f99

$ git -C …/omp.git grep -n -I -E '2025-11-25|2026-07-28' v18.12.6 > both.txt 2>both.err
real 0m12.600s   EXIT=0   27 both.txt   0 both.err                          # blobs fetched lazily

$ git -C …/omp.git grep -l -I '2025-11-25' v18.12.6 | wc -l      → 9   (lines: 19)
$ git -C …/omp.git grep -l -I '2026-07-28' v18.12.6 | wc -l      → 8   (lines: 8)
```

Byte read of the installed release (same `grep -a -o -F … | wc -l` form as the frozen probe's `cnt()`; no write, no execution):

```
2025-11-25=2   2026-07-28=0   2025-03-26=2
MCP_PROTOCOL_VERSION=3   MCP-Protocol-Version=3
x-mcp-header=2  Mcp-Param-=0   roots=105   notifications/initialized=3
real_bytes=256702432
```

## (b) Leads (unopened)

- **`docs/collab.md` — session sharing.** Not opened. It documents peer session sharing (the `collab/` tree: `host.ts`, `guest.ts`, `relay-client.ts`), a different surface from the revision the MCP client negotiates; the round plan lists the collab half of the staged `omp-session-sharing-and-mcp-lifecycle` entry as an assimilation **reject** candidate, so opening it now would spend a row on material this round intends to reject. Re-open when an entry's question is session sharing, not protocol version.
- **`docs/mcp-protocol-transports.md`.** Not opened. It is the transport-level page; the revision itself is a constant (S201) and the header behaviour is code in `transports/http.ts` (:127/:179), which is cheaper and tier-identical for the claim. Opening the doc would add a fourth row whose quotes restate S201 and would compete with S024's scope on `mcp-config.md`, which links the same spec page.
- **The 2026-07-28 migration tracker (the revision's changelog / key-changes page, lane row S010, `corpus/SOURCES.md:23`, mined in round 34).** Not opened. It describes *what the 2026-07-28 revision changed*; the C2 question is *which revision the installed release negotiates*, and S010 cannot answer it. Opening it also cannot be a new row for O2 (already `mined`, opened 2026-10-19), so it would add reading with no admissible quote. Re-open only if an entry claims a migration the release has begun — and the source evidence for that is Lead 3's `x-mcp-header` keyword (`fields.ts:57`, present twice in the installed bytes), not the changelog.

## (c) Paths line proposal

```
Paths: S060/S068 (v18.12.6 tree anchors; S053/S054/S055 superseded by S087/S088/S089)
       → S201 types.ts:181 → S202 docs/mcp-runtime-lifecycle.md:101 → S203 commit 10bce6900
       → S204 packages/coding-agent/package.json → S205 packages/coding-agent/src/mcp/client.ts
```

Reason for the order: read it the way the release is assembled. The registry already anchors the release commit (S060 and S068 are rows on the `45c35e40` tree; S053/S054/S055 are the same-release rows that S087/S088/S089 supersede — their `supersedes` cells are the registry's own resolution, so the live anchors are S060, S068, S087, S088, S089). Then: **what the release sends** (S201, the constant and its doc comment) → **what the vendor says it does with it** (S202, initialize/negotiate/echo prose) → **why that constant is what it is** (S203, the commit that replaced `2025-03-26` and added the header) → **which version that constant belongs to** (S204, `"version": "18.12.6"` in the package that ships the client) → **the code path that sends and echoes it** (S205 `:100`, `:120`). Ordering by definition-before-history-before-code-path also satisfies O6's pin without leaning on the patch URL: S201 (`…/45c35e40…/…/types.ts`) and S202 (`…/v18.12.6/…`) both carry the release identity, so `real_version` is pinned twice before S203 is reached.

**Same-document collision check (done first, `grep -n oh-my-pi corpus/SOURCES.md`).** Rows that predate this round and touch these documents: **S024** (`docs/mcp-config.md`, `main`, status `queued`, line 37) — same document as the :564 pointer, so no new row there; **S053/S054/S055** (dirs.ts / sqlite.ts / sqlite-credential-store.ts at `45c35e40`, `mined`, superseded by S087/S088/S089); **S060** (`tree/45c35e40…`, `mined` — the tree-wide member readers/writers row); **S068** (`tree/45c35e40…`, `mined` — task-isolation source rows, its URL is the tree at the same release commit). No existing row covers `mcp/types.ts`, `mcp/transports/http.ts`, `docs/mcp-runtime-lifecycle.md`, `docs/collab.md` or `docs/mcp-protocol-transports.md`, so S201/S202 are new-document rows, not re-opens.

## Cross-artifact hazard found while checking the registry (reported, not patched)

The entry draft `build/K65ScribeEntryA/omp-installed-release-mcp-runtime.md:4` names **S204 = `packages/coding-agent/src/mcp/client.ts`** and quotes `S204:100`, `S204:120`; but `build/K65ScribeRowsDraft/rows.md:12-13` and `build/K65ExecCaptures/source-captures.fragment.json` bind **S204 = `packages/coding-agent/package.json`** and **S205 = `client.ts`**. Under O2/O3 the entry's `S204` would resolve to the package.json row, whose capture does not contain `protocolVersion: MCP_PROTOCOL_VERSION,`. Integration must re-point the entry's S204 lines to S205 (or renumber the rows) before scoring.
