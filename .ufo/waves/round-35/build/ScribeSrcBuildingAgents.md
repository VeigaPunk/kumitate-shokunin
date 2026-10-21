SOURCE_ROW status=queued tier=A quote_words=13

# ScribeSrcBuildingAgents — frontier step, round 35 build

Scope: one registry row drafted for the queued lead "Anthropic 'Building effective agents' (2024-12-19)". Registry NOT edited (`corpus/SOURCES.md` untouched). Only this file written. No subagents, no installs, no builds.

## Draft row (for integrator to admit)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S021 | Anthropic: Building effective agents — https://www.anthropic.com/engineering/building-effective-agents (redirects to https://www.anthropic.com/research/building-effective-agents) | docs | A | Anthropic's own workflow-versus-agent vocabulary and pattern catalog, as stated by its builder; tool-specific claims excluded (page carries a dated-tooling note) | § What are agents?; § Building blocks, workflows, and agents; published 2024-12-19; page meta article:modified_time 2026-10-09 | Workflows (LLMs and tools on predefined code paths) versus agents (LLM directs its own process); five workflow patterns; simplest-solution-first rule | queued | 2026-10-20 | 180d | — |

id note: the placeholder S0NN resolves to S021 — next unused id. Command: `grep -oE '^\|[[:space:]]*S[0-9]{3,}' corpus/SOURCES.md | tr -d '| ' | sort -V | tail -1` → `S020`.

## Access record

- Command: `curl -sL -m 30 -A "Mozilla/5.0" -o /tmp/r35-bea.html -w "%{http_code} %{size_download}\n" https://www.anthropic.com/engineering/building-effective-agents` → `200 256467` (2026-10-20).
- Redirect: `curl -sIL -A "Mozilla/5.0" -o /dev/null -w "effective=%{url_effective} final_status=%{http_code} redirects=%{num_redirects}\n" https://www.anthropic.com/engineering/building-effective-agents` → `effective=https://www.anthropic.com/research/building-effective-agents final_status=200 redirects=1`. The row keeps the queued URL and records the canonical one.
- Page metadata (fetched HTML, `<title>`): "Building effective AI agents \ Anthropic"; `meta-article:published_time: 2024-12-19`; `meta-article:modified_time: 2026-10-09`.
- Page note (verbatim, top of body): "Much of the tooling landscape described in this post has changed since December 2024." Confirmed present by python check on the fetched HTML.

## Quote (≤25 words) and location

> "Workflows are systems where LLMs and tools are orchestrated through predefined code paths." — 13 words.
Location: section `## What are agents?`, first bullet (bold term "Workflows"). Verified by exact-substring match on the fetched HTML (`python3` `html.unescape` over tag-stripped text): found = True, words = 13.

Supporting quote for `teaches` (simplest-first rule):
> "we recommend finding the simplest solution possible, and only increasing complexity when needed." — 13 words.
Location: section `## When (and when not) to use agents`, paragraph 1. Exact-substring match found = True.

## Disposition: queued, not rejected

- Province: entry sits in the frontier band "Multi-agent design judgment" path (orchestration), inside `PROVINCE.md` §Frontier. Not Adjacent. Not out of province.
- Not redundant: `corpus/SOURCES.md` has no row defining the workflow-versus-agent distinction or the five-pattern catalog. S015 (Anthropic multi-agent research system) reports measured orchestrator-worker outcomes; S016 is a counterpoint; S018 is a failure taxonomy; S010–S014 are protocol and substrate. This row supplies the definitional layer the path "Multi-agent design judgment" currently lacks.
- Tier A, scoped: same tier and same builder-as-authority basis as existing S015, with scope narrowed to the vocabulary and pattern definitions. The page's own note that tooling has changed since 2024-12 means the tool-specific passages (framework list, SWE-bench figures, product names) are NOT admitted under this row. Any knowledge entry citing them needs its own dated anchor.
- Tier check against contract enums: `tier` ∈ {A,B,C} (A); `kind` ∈ enum (docs); `status` ∈ {queued,mined,rejected} (queued); `kind != community` so no tier inflation.
- Recheck 180d (not on-release): the page carries a dated modification timestamp (2026-10-09) and self-declared staleness; a shorter cadence than the S015 365d row is justified.
- used-by `—`: no knowledge entry or lesson cites the row yet. Moving to `mined` requires a path in used-by (contract rule 1 / census awk check).

## Gate fields the round lesson must carry (contract rule 1)

- URL: https://www.anthropic.com/engineering/building-effective-agents (canonical https://www.anthropic.com/research/building-effective-agents)
- Access date: 2026-10-20
- Quote: "Workflows are systems where LLMs and tools are orchestrated through predefined code paths." — § What are agents? (13 words)
- Non-author verification: re-open the same URL and grep the quote; the page is a live Next.js page and its HTML may change, so the verifier should compare against the modified_time 2026-10-09 revision.

## Integrator actions (not performed by this scribe)

1. Admit S021 as the row above (or reject with the REJECTED form if the integrator disagrees with tier A scope).
2. Strike the Leads bullet "Anthropic 'Building effective agents' (2024-12-19)" in `corpus/SOURCES.md` §Leads when the row lands — a lead is never a row, so the bullet must not survive alongside the row.
3. Add a path under `## Paths` ("Multi-agent design judgment") starting with S021 only if the integrator wants it ahead of S015; not required for this row.

## Census of the registry as read (no edits)

- Rows: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → `20`
- Malformed (NF≠13): `awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md` → `0`

## Out of scope / not done

- No registry edit, no knowledge entry, no lesson, no path change.
- No second-source check beyond the primary page (the page is the primary; the canonical redirect is the same publisher).
- No tooling installed or updated for this step.
