SOURCE_ROW status=queued tier=A quote_words=17

# S0NN draft: LangGraph checkpointers durability modes (frontier lead, round 35)

Scope: frontier step only. Registry NOT edited (`corpus/SOURCES.md` untouched). Lane: kumitate-shokunin, round 35, build wave, scribe seat ScribeSrcLangGraphCkpt. Leaf seat; no subagents dispatched.

## Draft registry row (for the integration owner to place; id is the next unused placeholder S0NN)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0NN | LangGraph Checkpointers — https://docs.langchain.com/oss/python/langgraph/checkpointers (markdown alternate: https://docs.langchain.com/oss/python/langgraph/checkpointers.md) | docs | A | LangGraph checkpointer durability modes exit, async, sync (Python OSS docs) | § Durability modes, lines 261-274 of checkpointers.md; page carries no version or revision field, fetched 2026-10-20 | Durability trades write timing for crash safety: exit persists only on graph exit (fastest, no mid-run crash recovery), sync persists before each next step (most durable, most overhead) | queued | 2026-10-20 | 90d | — |

Field checks: 11 cells, no `|` inside any cell, kind `docs` and status `queued` are contract enums, tier A is official docs for this scope (not `community`). Not a rejection: the page teaches durability-mode trade-offs that no existing row covers.

## Access and quote

- URL opened: https://docs.langchain.com/oss/python/langgraph/checkpointers.md (served as text/markdown, HTTP 200).
- Access date: 2026-10-20 (the assignment's date). Host `date -u` printed 2026-10-21 at check time; the row uses 2026-10-20 as instructed.
- Revision: none on the page. Server `last-modified` header equals the request time (`Wed, 21 Oct 2026 00:16:33 GMT`), so it is not a publication revision. Anchor therefore records the fetch date, not a version.
- Quote (17 words, verbatim), location `## Durability modes`, bullet `"exit"` (checkpointers.md line 274):
  > persists changes only when graph execution exits — successfully, with an error, or due to a human-in-the-loop interrupt

## S020 flip check: NOT MET

- S020 (LangGraph Persistence overview, rejected) flips only if "page regains durability semantics". The overview locator https://docs.langchain.com/oss/python/langgraph/persistence still has no durability content.
- Evidence: `curl -sS https://docs.langchain.com/oss/python/langgraph/persistence.md -o pers.md && grep -ci 'durability' pers.md` → `0`.
- The modes live on a different page (checkpointers), so the new row is a new source, not a flip of S020. S020 stays `rejected`; no status change to log against S020.
- The durable-execution URL cited in S020 still returned the persistence overview when read (reader output header: `URL: https://docs.langchain.com/oss/python/langgraph/persistence`). This matches S020's "redirects here" note.
- Consequence for the registry: no `supersedes` line is needed. The new row is additive. Round lesson `## Gate` should record the new row's URL, access date, and quote above, and state that S020 was checked and left rejected.

## Province check

- In province: PROVINCE.md §Frontier lists "Durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies) — corpus/SOURCES.md rows, queued." Checkpointer durability is durable-execution ground.
- Not Core (no lane gate covers it) and not Adjacent (not MCP/OAuth security).

## Search log (PRISMA-style, rule 5)

- Query: "docs.langchain.com LangGraph persistence checkpointers durability modes exit async sync"; where: web_search; date: 2026-10-20.
- Identified 10, screened 10, included 1, excluded 9.
- Included: checkpointers page (this row).
- Excluded and reason:
  - reference.langchain.com Durability attribute page: API reference restating the same three modes; the docs page is the primary text.
  - reference.langchain.com langgraph-sdk Durability schema: SDK schema, same three modes, duplicates the docs.
  - docs.langchain.com persistence overview: the S020 locator; no durability content.
  - docs.langchain.com durable-execution: redirects to the persistence overview (S020).
  - JavaScript checkpointers page: other-language rendition; same heading structure, out of this row's Python scope.
  - Checkpointer integrations page: backend list; teaches no durability semantics.
  - langgraph `libs/langgraph/langgraph/types.py` on GitHub main: primary source code (search snippet shows `Durability = Literal["sync", "async", "exit"]`). Not opened this round; a candidate second A row (kind `code`), not required for this row.
  - Duplicate search-snippet pages of the same checkpointers doc (.md alternate, one more docs mirror): same page, no added scope.
- Stop rationale: the queued locator is the primary docs page and carries the full modes text with a section heading. Its own statement covers the trade-off; the snippet-only sources above add no scope.

## Commands run (exact)

1. `date -u +%Y-%m-%d` → `2026-10-21` (host clock; see access note).
2. `ls -la .ufo/waves/round-35/` and `ls .ufo/waves/round-35/build` → build dir exists (contents: `swarm-registry.json`).
3. `curl -sSI https://docs.langchain.com/oss/python/langgraph/checkpointers.md | grep -iE '^(HTTP|last-modified|date)'` → `HTTP/2 200`, `date: Wed, 21 Oct 2026 00:16:33 GMT`, `last-modified: Wed, 21 Oct 2026 00:16:33 GMT`.
4. `curl -sS .../checkpointers.md -o ckpt.md && grep -n -E '^## Durability modes|persists changes only when graph execution exits' ckpt.md` → `261:## Durability modes`; `274:* \`"exit"\`: LangGraph persists changes only when graph execution exits — successfully, with an error, or due to a human-in-the-loop interrupt. ...`
5. `curl -sS .../persistence.md -o pers.md && grep -ci 'durability' pers.md` → `0`.
6. `curl -sS .../durable-execution -o dur.md && grep -m1 '^# ' dur.md` → no output (HTML response, no markdown heading; not relied on). The reader fetch of the same URL is the basis for the redirect claim.
7. Temp files `ckpt.md`, `pers.md`, `dur.md` removed.

Reads of the corpus contract (`/home/vgpnk/Projects/shokunin/CORPUS.md` §SOURCES.md), the lane registry (`corpus/SOURCES.md`), and `PROVINCE.md` were done to fix the enums, tier definitions, and province band.

## Tooling

No installs or updates. Used `curl` (already on host) and the existing web_search / reader tools.

## Out of scope / not done

- Registry (`corpus/SOURCES.md`) not edited; the integration owner places the row and assigns the S-number.
- No knowledge entry, lesson, or S020 status change written; the round lesson `## Gate` owner records the row.
- Not verified: whether the checkpointers page changes after 2026-10-20 (recheck 90d).

## Findings

1. New row drafted, status `queued`, tier A, teaches durability-mode trade-offs no existing row covers. Evidence: checkpointers.md:261-274.
2. S020 flip condition NOT met; S020 stays rejected. Evidence: persistence.md contains 0 occurrences of "durability".
3. Anchor gap: the page has no revision; the row anchors on the fetch date. Recheck 90d is the mitigation.
4. Candidate follow-up (not opened): langgraph `types.py` on main as a `code` row for the Durability literal; a lead, not a row until opened.
