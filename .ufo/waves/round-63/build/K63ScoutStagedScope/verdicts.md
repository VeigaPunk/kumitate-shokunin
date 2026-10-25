# K63ScoutStagedScope — staged-package scope gate (five entries)

Round 63 · wave w1 · 2026-10-25 · lane base `dfa6fca8f362e9c962f5b940025a2619380b759b`

Scope gate for five staged entries from `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/`
(excluding `multi-agent-coordinator-topologies.md` and `exactly-once-attribution.md`), per PROVINCE.md bands and
`corpus/QUALITY.md` Q1–Q9. Full evidence: `../../w1/K63ScoutStagedScope.md`.

## Verdicts

| # | entry | S-ids | lane rows holding the same documents (by URL) | band | verdict | one-line reason | flip condition |
|---|---|---|---|---|---|---|---|
| 1 | `omp-session-sharing-and-mcp-lifecycle.md` | S198, S199 | none — both docs are the lane's own named unopened leads (`corpus/SOURCES.md` §Leads) | frontier 1 | **ADMIT-CANDIDATE** | unique content, all quotes re-located, rechecks reproduce; only the mechanical fixes below are outstanding | after Findings 1–3 + 9: strip leading newline, URL-form citations, 11-cell rows, name `omp/18.12.6`, label the 250 ms-gate inference |
| 2 | `omp-advisor-and-mcp-transports.md` | S209, S210 | none | frontier 1 (advisor half → band 3; transport half → band 2) | **REJECT** | its headline claim is grounded on `S104`, which in the lane registry is RFC 8785 (JCS) and in the package does not exist; the version claim is superseded by later package rounds (S232, S250) | re-point the citation to S199/S210, re-scope to the advisor-isolation half under band 3, ground the version statement on S232/S250 or drop it |
| 3 | `mcp-stateless-vendor-compatibility.md` | S207 | none — no volcengine row in the lane | frontier 2 | **REJECT** | its own recheck reproduces 9/40 times and the entry's stated "browser User-Agent ⇒ body" mechanism is falsified (same UA, 31/40 shell responses); `ground:` quotes a superseded band-2 line | re-base on the vendor doc API (text 10/10 runs) or on the staged 10-26/10-27 amendments (S312/S330/S339), then re-quote the live band-2 line |
| 4 | `japanese-multi-agent-operations.md` | S212, S213, S214 | none (S136/S135 are other CJK pages; package `S218` duplicates S212's URL) | frontier 4, but §1 is the round's adopted topology theme | **REJECT** | points at `knowledge/exactly-once-attribution.md`, a document the lane rejected (round 61) and does not hold (paper is S134); §1 collides with the adopted coordinator-topology entry | a later band-4 round re-opens S212/S213/S214, drops §1, re-points the exactly-once sentence to S134, and adds a counting command or `recalled` label per count |
| 5 | `agent-isolation-substrates-amendment-2026-10-25.md` | S309, S310, S311 | **S066** holds the same jj git-compatibility document (pinned v0.45.1); no lane row for the architecture page | frontier 3 | **REJECT** | an amendment to a file the lane already holds, packaged as a new file; `S310` re-serves that document at an unpinned `/latest/` URL (lane rule S033); `S311` points outside the lane repo (Q14); framing overtaken by the staged 10-26/10-27 chain | adopt the 10-26/10-27 amendments appended into `corpus/knowledge/agent-isolation-substrates.md`, cite jj at pinned v0.45.1 raw URLs (S066/S067), copy the demo transcript into the lane |

## Q1–Q9 checklist per entry

Legend: ✔ satisfied · ✗ missed · n/a not applicable · ⚠ needs a fix, not a rejection ground.

| entry | Q1 header triple | Q2 opened row cites | Q3 counts + dated re-run | Q4 [INFERENCE] | Q5 secrets shape-only | Q6 gate-clean | Q7 DRIFT quoted whole + dated | Q8 version skew named | Q9 one domain |
|---|---|---|---|---|---|---|---|---|---|
| session-sharing | ⚠ triple present but not on line 1 | ✔ S198/S199 | ⚠ 250 ms gate lacks its own command | ✗ 0 labels | ✔ | ✗ 6 cite errors + 12-cell rows | ✔ band-1 quote current | ✗ installed `omp/18.12.6` unnamed | ✔ |
| advisor/transports | ⚠ same | ✔ S209/S210 | ⚠ 8 counts (4096 FIFO, 4/1–32, 30 s, 3 tries, 500/1000/2000/4000 ms, >5/30 s, 15 s→5 min) | ✗ 0 labels | ✔ | ✗ 3 cite errors + 12-cell rows | ✔ band-1 quote current | ✗ `omp/18.12.6` unnamed | ⚠ filed band 1; advisor half is band 3, transport half band 2 |
| vendor-compat | ⚠ same | ✔ S207 | ✗ `-> 2` reproduces 9/40 | ✗ 0 labels | ✔ | ✗ recheck unreliable (2 rows E09/E11) | ✗ `ground:` quotes a superseded band-2 line | n/a | ✔ |
| japanese-multi-agent | ⚠ same | ✔ S212–S214 | ✗ ≈20 counts, 1 recheck string | ✗ 0 labels | ✔ | ✗ 1 cite error (dangling path) + 12-cell rows | ✗ `ground:` quotes a superseded band-4 line | n/a | ⚠ §3 borders the adjacent "Prompt and skill craft → kotoba"; §1 duplicates the adopted theme |
| isolation-amendment | ⚠ same | ✔ S309–S311 | ⚠ tree listings lack commands | ✗ 0 labels | ✔ | ✗ 2 cite errors + 12/13-cell rows | ✔ band-3 quote current | ⚠ cites unpinned `/latest/` jj docs against the pinned v0.45.1 (S066/S067) | ✔ |

## Reproduce

```sh
# 1 — header arm (all five)
cp /home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/{omp-session-sharing-and-mcp-lifecycle,omp-advisor-and-mcp-transports,mcp-stateless-vendor-compatibility,japanese-multi-agent-operations,agent-isolation-substrates-amendment-2026-10-25}.md <scratch>/corpus/knowledge/
node <scratch>/scripts/sources-check.mjs        # → ENTRY_HEADER_REQUIRED ×5

# 2 — cite-check delta (per-file errors: 6 / 3 / 0 / 1 / 2; lane baseline 0)
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-check.mjs --json --self <scratch> --fleet /home/vgpnk/Projects/shokunin

# 3 — vendor recheck reproducibility
U='https://docs.volcengine.com/docs/agentkit/MCP_protocol_version_compatibility?lang=zh'
for i in $(seq 1 20); do curl -fsSL -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36' "$U" | grep -c 'Mcp-Session-Id'; done   # 4/20 and 5/20 matched

# 4 — advisor citation points at the wrong document
grep -E '^\| S104 \|' /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md   # RFC 8785 JCS

# 5 — row shape
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <scratch>/corpus/SOURCES.md   # E01 fields=12 ×10, E09 S311, E11 ×11
```

Scratch tree: `/tmp/kumitate-r63/K63ScoutStagedScope/` (`lane/` = read-only copy of `scripts/`, `corpus/`, `.ufo/`).
