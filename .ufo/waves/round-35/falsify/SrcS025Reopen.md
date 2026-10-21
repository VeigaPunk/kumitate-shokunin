ATTACK S025 verdict=partial defects=1

# S025 re-open — Anthropic: Building effective agents

Target: `corpus/SOURCES.md:38`. Contract: `/home/vgpnk/Projects/shokunin/CORPUS.md:64-173`
(§ SOURCES.md — where a shokunin learns, contract v1). Source re-fetched 2026-10-21
(access date; next reader must re-open, not trust this file).

## Defect 1 — `source` URL is not canonical: permanent 308 to the page's declared canonical

Location: `corpus/SOURCES.md:38`, cell 3 —
`https://www.anthropic.com/engineering/building-effective-agents`.
Same URL repeated as the row's gate record: `corpus/lessons/round-35.md:55`.

Contract text violated: `CORPUS.md:90` — "`source` — title — canonical URL or DOI".
The live page declares `/research/building-effective-agents` as canonical:

```
$ curl -sS -D - -o /dev/null --max-time 40 https://www.anthropic.com/engineering/building-effective-agents
HTTP/2 308
date: Wed, 21 Oct 2026 01:57:35 GMT
content-length: 35
location: /research/building-effective-agents
refresh: 0;url=/research/building-effective-agents

$ curl -sS -o /dev/null -w 'final_effective=%{url_effective}\n' -L --max-time 60 \
    https://www.anthropic.com/engineering/building-effective-agents
final_effective=https://www.anthropic.com/research/building-effective-agents

$ grep -oiE '<link[^>]+rel="canonical"[^>]*>|<meta[^>]+property="og:url"[^>]*>' /tmp/s025.html
<link rel="canonical" href="https://www.anthropic.com/research/building-effective-agents"/>
<meta property="og:url" content="https://www.anthropic.com/research/building-effective-agents"/>
```

The 308 is not UA-specific (`-A 'Mozilla/5.0 … Chrome/140.0'` → `HTTP/2 308`,
`location: /research/building-effective-agents`), so a reader always lands elsewhere;
the row cites an alias the source itself no longer calls canonical.

Timing (bounded by Wayback, so this is drift, not a fabricated cell): the last
`/engineering/` capture at 2026-10-19T05:48:58Z served **200** with
`<link rel="canonical" href=".../engineering/...">` and
`article:modified_time=2026-08-10T22:57:30Z`:

```
$ curl -sS --compressed -L 'http://web.archive.org/web/20261019054858id_/https://www.anthropic.com/engineering/building-effective-agents'
http=200 size=37812
<link rel="canonical" href="https://www.anthropic.com/engineering/building-effective-agents"/>
"dateModified":"2026-08-10T22:57:30.000Z"
<h1 class="headline-1">Building effective agents</h1>
quote_count=1

$ curl 'http://web.archive.org/cdx/search/cdx?url=anthropic.com/engineering/building-effective-agents&from=20261018&to=20261021&output=json&fl=timestamp,statuscode'
[["20261018164220","200"],["20261019054858","200"]]     # no later capture
$ ... cdx?url=anthropic.com/research/building-effective-agents&from=20261018&to=20261021...
[]                                                        # no capture
```

[INFERENCE] The row records `modified 2026-10-09`; that stamp exists only on the
post-migration page (pre-migration pages declared `2026-08-10`, above; the live
page's `article:modified_time`/JSON-LD are `2026-10-09T06:34:08Z`). So the author
most likely read the migrated page — which already declared `/research/` canonical —
and copied the `/engineering/` URL they typed. The flip itself happened between
2026-10-19T05:48:58Z and 2026-10-21T01:54Z; no capture lands inside that window.

Minimal fix (contract-compliant, append-only per `CORPUS.md:116-117` — "A correction
is a new row whose `teaches` opens `supersedes S0NN —`"; the `source` cell itself may
not be edited in place): add `S029` with
`Anthropic: Building effective agents — https://www.anthropic.com/research/building-effective-agents`,
`teaches` opening `supersedes S025 —`, anchor `§ What are agents?; published
2024-12-19, modified 2026-10-09`; log old→new in the round lesson and (if retired)
record S025's status change. If the lane instead tolerates aliases, the weaker fix is
to record the redirect in S025's `anchor` cell (`/engineering/… 308 → /research/…,
fetched 2026-10-21`) — but that still leaves a non-canonical URL in `source`.

Why the round's gate is blind to it: `scripts/sources-check.mjs:6-7` states "It does
not use the network", and it returned
`SOURCES_CHECK: CLEAN (rows=28 tiers=A:27,B:1,C:0 status=queued:14,mined:12,rejected:2 entries_with_source=2 legacy=38)`
exit 0. The `SOURCES_CHECK: CLEAN` round-end claim is therefore true but silent on
canonicality; nothing else in the gate set fetches the URL.

## Checked and held (not defects)

| cell / gate item | evidence |
|---|---|
| quote verbatim | Live HTML: `<li><strong>Workflows</strong> are systems where LLMs and tools are orchestrated through predefined code paths.</li>`; exact sentence occurs 1× in the page; present unchanged in the 2026-10-19 capture (`quote_count=1`) |
| quote ≤25 words | 13 words |
| quote correctly located | First bullet of § "What are agents?" (h2 exact, question mark included); gate line `corpus/lessons/round-35.md:55` labels the section correctly and uses the lane's «» convention |
| `teaches` grounded | "Workflows run LLMs and tools on predefined code paths" = same bullet; "agents direct their own process" = "systems where LLMs dynamically direct their own processes and tool usage"; "five workflow patterns" = exactly 5 `Workflow:` subsections (Prompt chaining, Routing, Parallelization, Orchestrator-workers, Evaluator-optimizer); "simplest solution first" = "we recommend finding the simplest solution possible, and only increasing complexity when needed" |
| `kind=docs` / `tier=A` | `docs` ∈ enum; A is warranted by "maintainer statement" (Anthropic's own vocabulary) and scope is honestly narrowed ("as stated by its builder; tool-specific claims excluded"); same convention as `S015` (another Anthropic engineering post, docs/A) |
| `published 2024-12-19` | `<time dateTime="2024-12-19">Dec 19, 2024</time>` and JSON-LD `datePublished` |
| `modified 2026-10-09` | `article:modified_time`/JSON-LD `2026-10-09T06:34:08Z` on the live page (page-specific: sibling pages carry different seconds) — page-declared, so the cell is accurate even though the content itself reads as unchanged since 2026-08-10 |
| row shape / enums / dates | `NF=13`; `status=queued` with `used-by=—` is consistent (the Gate mention is not a citation — the same holds for S024/S026-S028); `opened=2026-10-20` valid ISO; `recheck=180d` valid cadence |
| append-only discipline | No in-place source-cell edit was made for this row; lesson says "Rows touched old→new: none" |
| lane gate re-run | `node scripts/sources-check.mjs` → CLEAN rows=28 (exit 0), matching the round-end claim |

## Remaining unknowns

- Exact instant of the `/engineering/` → `/research/` flip (bounded above, not observed).
- Whether the article body changed at all between 2026-08-10 and 2026-10-09; a coarse
  text diff shows the same body phrases and the same quote on both dates, but the
  migration rewrote page chrome, so no clean diff is claimed. [INFERENCE] the content
  revision is nominal.
- Whether the lane intends redirect aliases to be tolerated in `source`; the frozen
  contract says "canonical URL", so this report treats the cell as defective.

Tool installs/upgrades this run: none (no package transactions; pacman paused host-wide).
