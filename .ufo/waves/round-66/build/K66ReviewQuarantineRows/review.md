# K66ReviewQuarantineRows — assimilation id-collision re-derivation (round 66, w1)

Date 2026-10-27. Lane freeze `621212bac37f8249c72ac982d1d6534cb8d60701`, base `8d557f85312de4fcc82e09ff735d21436bc3746d`.
Inputs read read-only: `corpus/SOURCES.md` (freeze blob; working tree byte-identical — verified), `merge/kumitate/SOURCES.append.md`,
`merge/kumitate/MERGE-REPORT.md`, the seven theme documents under `merge/kumitate/knowledge/corpus/knowledge/`, frozen counter
`.ufo/waves/round-66/probe/deprec66-probe.mjs`. Derivation script + JSON receipt beside this file (`derive2.mjs`, `derive-out.json`).

Method: rows extracted with the assignment pattern `^ {0,3}\|[[:space:]]*S[0-9]{3,}` (JS `^ {0,3}\|[ \t]*S([0-9]{3,})\b`); URLs are the
first `https?://` token per row, compared after lowercasing, fragment-stripping and trailing-slash-stripping.

## Lane registry at the freeze

- 145 rows, ids S001..S206, max id **S206**, no duplicate ids. 61 numeric gaps (S121, S128-S130, S132, S137-S189, S191-S193).
- Physical order is not id order (append convention): `S136@line139 -> S126@line140` is the one inversion; rows S200-S206 sit at
  lines 152-158, S195-S199 at 147-151.
- At the BASE the registry already holds S201-S206 (`git show 8d557f85:corpus/SOURCES.md | grep -cE '^\| S20[1-6]\b'` → 6; first/last
  row ids S001/S206). They are the six oh-my-pi v18.12.6 rows of round 65. **Next free id at base and at freeze = S207.**

## Staged registry (`SOURCES.append.md`)

- 155 rows (matches MERGE-REPORT "155 accepted"), ids S195..S349 contiguous, no duplicate ids, ascending.
- The staged numbering was cut against an older lane snapshot: MERGE-REPORT still says "lane registry currently holds **133** rows".
  Truth at the freeze: 145 rows to S206.

## 1. Id-collision list — 12 staged ids are live lane ids, all with a different document

| staged (append line) | staged row is | lane row with that id (line) |
|---|---|---|
| S195 (7) | MCP Architecture overview | S195 Temporal Worker Versioning (147) |
| S196 (8) | Temporal Detecting Activity failures | S196 Aliyun multi-agent (148) |
| S197 (9) | ext-tasks spec 2026-07-28 | S197 arXiv 2512.08296v3 (149) |
| S198 (10) | OMP docs/collab.md | S198 jj Concurrency v0.46.0 (150) |
| S199 (11) | OMP docs/mcp-runtime-lifecycle.md | S199 Firefox jj docs (151) |
| S200 (12) | Aliyun managed-agents-multiagent | S200 jj Working copy v0.46.0 (152) |
| S201 (13) | Aliyun managed-agents-introduction | S201 OMP types.ts v18.12.6 (153) |
| S202 (14) | arXiv abs 2512.08296 | S202 OMP mcp-runtime-lifecycle v18.12.6 (154) |
| S203 (15) | arXiv abs 2607.14166 | S203 OMP commit 10bce690 .patch (155) |
| S204 (16) | arXiv abs 2609.29095 | S204 OMP client.ts v18.12.6 (156) |
| S205 (17) | CyberAgent blog | S205 OMP zai.ts v18.12.6 (157) |
| S206 (18) | Zenn MCP article | S206 OMP http.ts v18.12.6 (158) |

All 12 pairs have differing source URLs (`sameDoc=false` for every collision in `derive-out.json`). A verbatim append would silently
redefine 12 lane rows and corrupt every citation of them, including the plan's own M7 anchor rows S201-S206.

Additionally the staged block S207-S232 occupies exactly the id range the round reserves for the C2 entry ("prepared ids S207 upward"):
any staged row admitted into the lane must be renumbered; S207+ is not free for staged ids to keep.

## 2. Document duplicates — staged row URL already a lane row under another id (10)

S195→S125, S196→S117+S126, S197→S127, S201→S131, S205→S135, S206→S136, **S217→S195**, S260→S190, S264→S194, **S291→S199**.
The last two (bold) are missing from MERGE-REPORT's "Rows whose source the lane's registry already holds" table, which lists only 8:
its scan predates the lane's round-61..65 rows. Same-document-different-carrier cases the URL guard cannot see:
- staged S202 `arxiv.org/abs/2512.08296` = lane S197 `arxiv.org/html/2512.08296v3`; S202's scope cell still asserts "the registry holds
  MAST (S018) but no scaling-law row" — false at the freeze (lane S197, opened 2026-10-25, is that row).
- staged S232 (commit page `…/commit/10bce6900…`) = lane S203 (the same commit's `.patch` URL).
- intra-file double: staged S204 (append row 10) and S211 (append row 17) carry the same URL `arxiv.org/abs/2609.29095`.

## 3. The deprecation-theme documents and their staged rows

Plan theme "MCP deprecation registry and its clocks": `mcp-feature-deprecation-registry`, `mcp-deprecation-removal-state-2026-10-25`,
`mcp-deprecation-registry-timing-2026-10-27`, `sep-2596-*`. Cited S-ids per document (`source:` + inline, first-appearance order):

| document | staged rows cited |
|---|---|
| mcp-feature-deprecation-registry.md | S233 S234 (+ inline "S130 and S131" — campaign refs, see §5) |
| mcp-deprecation-removal-state-2026-10-25.md | S273 S274 |
| mcp-deprecation-registry-timing-2026-10-27.md | S240 S241 S243 S242 S244 |
| sep-2596-status-and-merge-dates-2026-10-25.md | S303 S304 S305 S306 |
| sep-2596-final-date-and-the-deprecation-clock-2026-10-26.md | S314 S315 S316 S317 S318 S319 |
| sep-2596-merge-timestamp-surfaces-2026-10-26.md | S320 S321 |
| sep-2596-merge-timestamp-surfaces-2026-10-27.md | S334 |

22 distinct staged rows; grouped by document (identical URL or, for the URL-less transcript rows, identical transcript path) they are
**15 documents**. None of the 15 is URL-present in the lane registry — the theme's documents are all lane-new; the 10 URL duplicates of
§2 all belong to other themes.

## 4. By-document renumber map onto the lane's next free ids (lane max S206 → S207 upward)

Rows marked "=" are the same document; admit one row (the first) and cite it for all. Next free id after the map: **S222**.

| new id | staged rows | document |
|---|---|---|
| S207 | S233 = S319 | 2026-07-28 Deprecated Features registry |
| S208 | S234 = S242 = S314 | Feature Lifecycle and Deprecation policy |
| S209 | S273 | zh-CN community rendering of the released registry |
| S210 | S274 | revision-scoped versioning guide (docs/2026-07-28/learn/versioning.md) |
| S211 | S240 | draft revision's deprecated registry |
| S212 | S241 = S334 | SEP-2596 upstream PR API record |
| S213 | S243 = S317 | SEP-2596 published SEP page |
| S214 | S244 = S318 | versioning guide (docs/learn/versioning.md) |
| S215 | S303 | haning.me Chinese account (merge date) |
| S216 | S304 = S320 | SEP-2596 timeline probe transcript (own-work, no URL cell) |
| S217 | S305 | SEP-2596 source file (raw.githubusercontent, main) |
| S218 | S306 | SEP-2596 PR page (github.com) |
| S219 | S315 | SEP guidelines |
| S220 | S316 | SEPs index |
| S221 | S321 | SEP-2596 PR commits tab |

Caveat: these are the ids the staged rows would take if admitted. The frozen counter (see §6) additionally requires every row the entry
cites to be opened 2026-10-27 with a capture bound, so admission is by re-opening the document into the fresh row, not by copying the
staged row. The entry also needs rows that exist in no staged set — at minimum `…/v18.12.6/…/transports/sse.ts` (M7 requires a cited
row with that URL) and the `roots` capability declaration — which take the next ids after the theme allocation (S222+), or S207/S208 if
the L1 prefers to seat the M7 rows first.

## 5. Inline-reference hazards (campaign ids ≠ lane ids)

Staged texts embed campaign-numbered S-ids that resolve to different or nonexistent lane rows: the theme entry
`mcp-feature-deprecation-registry.md` cites "S130 and S131" for the round-4 twelve-month accounts — lane S130 is a gap and lane S131 is
the Aliyun managed-agents row; staged S218's scope cites "round-2's S117" — lane S117 is Temporal detecting-activity-failures; staged
S240/S245/S249/S253 cite S148/S147/S146/S160 — all four are lane gaps. Any adopted text must have its inline ids remapped through the
same document map or be rewritten (the plan already requires the entry to be re-grounded, never copied).

## 6. Counter-conformance notes for the re-grounded rows (frozen `deprec66-probe.mjs`, read, not modified)

- M1 parses cited ids from `source:` lines in the entry's first 14 lines only; ≥3 ids, `verified-at: 2026-10-27`, `recheck:` present.
- M2 iterates every cited id: must be absent at base (`existed-at-round-base`), 13 cells under the counter's naive `split('|')`,
  `status=mined`, `opened=2026-10-27`, `used-by` containing the entry path, source cell with a URL, tier A/B. All 22 staged theme rows
  are `mined/2026-10-24`, and S304/S320 have no URL cell — none can be cited as-is.
- The counter's `cells()` splits on every `|`, so an escaped `\|` inside any cell breaks the 13-cell check: 20 of the 22 theme rows
  (all but S304/S320) carry `\|` in their recheck/anchor cells. Fresh rows must keep every cell pipe-free. Counter is frozen — adapt
  the data, never the counter.
- M3 requires a capture per cited id in `.ufo/pins/source-captures.json` (sha256 + bytes); M4 a ≤25-word located quote per id found in
  the capture, one containing `2027-07-28`, one `Three months after`; M5 re-fetches each quoted row live; M6 the entry's
  `## Registry snapshot` table must carry exactly as many data rows as the captured deprecated table (≥5) with each row's
  `Deprecated in` and `Earliest removal` text; M7 the `## Bearing on the installed OMP release` section must name one of the round-65
  rows S201-S206 (they exist at base — citation in prose, not on `source:` lines, keeps them outside M2's per-id checks) plus `roots`
  and `HTTP+SSE`, with the sse.ts row among the cited ids.

## 7. Guard defect summary (MERGE-REPORT.md)

The guard's own output is stale and its checklist is unsound for today's lane: (a) "lane registry currently holds 133 rows" — truth 145
(S206 max); (b) its URL-duplicate table lists 8 rows, truth 10 (missed S217→S195, S291→S199); (c) it never compares staged ids against
lane ids, so all 12 numeric collisions of §1 are invisible to it; (d) "Adopt checklist" step 3 — "Append SOURCES.append.md to
corpus/SOURCES.md" — has no renumber step. A re-derived guard must do id-remap for every staged row, per-document dedupe, and
inline-id remapping inside adopted texts.
