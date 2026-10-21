ATTACK S028 verdict=partial defects=1

Scope: `corpus/SOURCES.md:41` (S028 row), its Gate entry `corpus/lessons/round-35.md:58`, and the S020 flip re-check at `corpus/lessons/round-35.md:60-62`. Read-only; lane tree not edited. Clock at check: `2026-10-21T01:58Z` = `2026-10-20T22:58-0300`.

## Defect 1 — anchor cell denies a revision the cited page actually carries

- Path:line — `corpus/SOURCES.md:41`, anchor cell: `§ Durability modes, exit bullet; no revision field, fetched 2026-10-20`.
- Command — `curl -sSL https://docs.langchain.com/oss/python/langgraph/checkpointers -o page.html`, then JSON-LD extraction from that HTML (WebPage entity and Article/TechArticle entity, both with the row's URL):
  - output: `"@type":"WebPage","@id":"https://docs.langchain.com/oss/python/langgraph/checkpointers#webpage","url":"https://docs.langchain.com/oss/python/langgraph/checkpointers","name":"Checkpointers","dateModified":"2026-09-28T09:34:08.127Z"`
  - same page, Article block: `"@type":["Article","TechArticle"],... "url":"https://docs.langchain.com/oss/python/langgraph/checkpointers",... "dateModified":"2026-09-28T09:34:08.127Z"`.
  - control: same fetch on `.../persistence` gives `"dateModified":"2026-10-08T17:19:10.868Z"`, so this is per-page content metadata, not a build constant.
- Observation — the canonical HTML URL the row cites does carry a revision field, so "no revision field" is false, and the anchor has no contract revision: CORPUS.md §SOURCES.md requires `exact section / heading / page / line plus revision (version, commit, or publication date)`. The round-35 scribe inspected only the `.md` alternate and headers (`.md` `last-modified` equals request time), so it missed the HTML JSON-LD.
- Minimal fix — replace the anchor with `§ Durability modes, exit bullet; langchain-ai/docs b7119d5c (2026-10-02); fetched 2026-10-20` (or `dateModified 2026-09-28 (JSON-LD); fetched 2026-10-20`). Verified: `curl raw.githubusercontent.com/langchain-ai/docs/b7119d5c5fd07711477bb42910149eddbad8648d/src/oss/langgraph/checkpointers.mdx` carries the identical bullet at mdx:603; `diff` of the quoted sentence vs the live `.md` prints `SAME`.
- [INFERENCE] the JSON-LD was also served on 2026-10-20 (it is generated per page by the host); the re-fetch cannot observe yesterday's bytes.
- Impact — row-conformance only: no C1/C2/C3 count, the `CLEAN` census, or the quote change; one anchor cell edit fixes it.

## Held — quote at `corpus/lessons/round-35.md:58`

- `grep -n 'persists changes only when graph execution exits' checkpointers.md` →
  `274:* \`"exit"\`: LangGraph persists changes only when graph execution exits — successfully, with an error, or due to a human-in-the-loop interrupt. ...`
  and `261:## Durability modes`; the bullet sits under that heading.
- Scripted check output: `verbatim substring: True`, `line274 exact: True`, `dash codepoint: ['0x2014']`; whitespace tokens 18 (17 words when punctuation is stripped; the em dash is not a word) — ≤25 either way. Location `§ Durability modes, exit bullet` is correct.
- The quoted text is a mid-sentence fragment (source has `LangGraph ` before `persists`); it remains a verbatim substring.

## Held — row cells vs contract enums and the opened source

- `id` S028: unique (`sort | uniq -d` empty); S001–S028 contiguous, no gap; row `NF=13`; no `|` leaked into cells.
- `source`: URL returns `HTTP/2 200`; page `# Checkpointers`, description `LangGraph checkpointers save graph state ...` — title and `scope` (`exit, async, sync`, Python OSS docs) match.
- `kind=docs`, `tier=A`, `status=queued`, `opened=2026-10-20` (local -0300 date at row time and at check), `recheck=90d`, `used-by=—`: all contract enums/forms; docs at A is not tier inflation.
- `teaches` is grounded at `checkpointers.md:274-276`: exit is `best performance ... cannot recover from system failures (like process crashes) mid-execution`; sync `persists changes synchronously before the next step starts ... high durability at the cost of some performance overhead`.
- Row is additive: `git show master:corpus/SOURCES.md` has 20 rows and no S028; `git diff master -- corpus/SOURCES.md` shows only `+` rows S021–S028 (S020 row untouched).

## Held — counts

- Contract census from the lane root: `rows=28`; malformed `0`; tiers `A=27 B=1 C=0`; status `queued=14 mined=12 rejected=2`; duplicate ids empty; enum/tier-inflation empty; mined-with-missing-used-by empty.
- `node scripts/sources-check.mjs --strict` → `SOURCES_CHECK: CLEAN (rows=28 tiers=A:27,B:1,C:0 status=queued:14,mined:12,rejected:2 entries_with_source=2 legacy=38)`.
- That matches the round-end `SOURCES_CHECK: CLEAN (rows=28 …)`. Note the maintained gate does not validate the anchor revision (`scripts/sources-check.mjs` only reads `anchor` for `ROW_FIELD_EMPTY`), so CLEAN does not clear defect 1.

## Held — S020 flip still unmet

- `curl -sSL .../persistence.md` → 2 `durable` tokens (line 16 `tracks durable information across threads`; line 98 `persist durable data across threads`), 0 `durability`.
- `curl -sSIL .../durable-execution` → `HTTP/2 308`, `location: /oss/python/langgraph/persistence`.
- Canonical HTML keeps only an empty `<a id="durability-modes"></a>` anchor and no durability-mode prose; the 2 `durable` tokens describe stores, not write-timing modes. S020 stays `rejected`; flip unmet.
- Note (not counted as a defect): the Gate/search-log shorthand "no durability text" is content-true for the `.md`; the HTML carries the bare anchor token. Precise wording: "no durability-mode text (0× `durability`; 2× `durable` about stores)".

## Tooling

No installs or upgrades. Commands used: `curl`, `python3` (json/re), `node scripts/sources-check.mjs`, read-only `git`.
