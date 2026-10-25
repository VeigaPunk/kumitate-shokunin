VERDICT: Of five staged entries outside the adopted topology, only `omp-session-sharing-and-mcp-lifecycle.md` is an ADMIT-CANDIDATE; the other four are honest REJECTs (advisor/transports: mis-pointed `S104` citation + superseded by later package rounds; vendor-compat: its own recheck reproduces only 9/40 times and its stated access mechanism is falsified; japanese-multi-agent: one-theme collision with the adopted topology entry + a dangling pointer to a rejected document; isolation-amendment: packaged as a new file although it amends a file the lane already holds, with an unpinned `/latest/` URL and an out-of-repo pointer).

## Evidence

All commands run 2026-10-25 from `/home/vgpnk/Projects/shokunin` unless noted. Lane base `dfa6fca8f362e9c962f5b940025a2619380b759b`.

**E1 — the staged files do not open with `source:` (Q1/Q6, mechanical, all five).**
Every staged file starts with a blank line, and the lane's own gate requires `source:` on line 1.

```
$ head -1 /home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/*.md   # 67/67 blank-first
blank-first=67 of 67
$ node scripts/sources-check.mjs   # scratch lane with the 5 files copied in
SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/omp-session-sharing-and-mcp-lifecycle.md:1  non-legacy knowledge file lacks source: header
SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/omp-advisor-and-mcp-transports.md:1  …
SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/mcp-stateless-vendor-compatibility.md:1  …
SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/japanese-multi-agent-operations.md:1  …
SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/agent-isolation-substrates-amendment-2026-10-25.md:1  …
SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)
# after stripping the leading newline, the same run advances to ENTRY_SOURCE_UNKNOWN (rows not yet appended)
SOURCES_CHECK: DRIFT (ENTRY_SOURCE_UNKNOWN)
```

**E2 — per-file cite-check delta (Q6).** Baseline lane entries read 0 errors (`omp-task-contract.md` 0, `mcp-orchestration-contract.md` 0); the staged entries do not.

```
$ node scripts/cite-check.mjs --json --self /tmp/kumitate-r63/K63ScoutStagedScope/lane --fleet /home/vgpnk/Projects/shokunin
omp-session-sharing-and-mcp-lifecycle.md errors=6   [UNRESOLVED] docs/agent-hub.md, docs/tools/task.md,
                                                   docs/task-agent-discovery.md, docs/collab.md,
                                                   docs/mcp-runtime-lifecycle.md ; [REV_UNKNOWN] 0b5c27ab
omp-advisor-and-mcp-transports.md errors=3          [REV_UNKNOWN] 0b5c27ab ; [UNRESOLVED] WATCHDOG.yml, client.ts
mcp-stateless-vendor-compatibility.md errors=0
japanese-multi-agent-operations.md errors=1         [UNRESOLVED] knowledge/exactly-once-attribution.md
agent-isolation-substrates-amendment-2026-10-25.md errors=2  [UNRESOLVED] a.txt, b.txt
```
Fix recipe **verified**: rewrite bare upstream doc paths as full URLs and drop the marker word before the commit hash (`commit 0b5c27ab` → `` `0b5c27ab` ``), because the pin regex keys on `commit|pinned|revision|HEAD|sha256`; the same file then reads **0 errors**.

**E3 — the vendor recheck is not reproducible (Q3).** The staged recheck is
`curl -fsSL -A 'Mozilla/5.0 (X11; Linux x86_64) … Chrome/131 …' 'https://docs.volcengine.com/docs/agentkit/MCP_protocol_version_compatibility?lang=zh' | grep -c 'Mcp-Session-Id'` → claimed `2`.

```
batch1: matches_expected_2=4 nonmatching=16 of 20
batch2: matches_expected_2=5 nonmatching=15 of 20          # 9/40 = 22.5%
$ for i in 1..8; do curl … -o /tmp/k63_n$i.html; wc -c; grep -c 'Mcp-Session-Id' …; done
n1..n6,n8 bytes=12049 sess_lines=0 ; n7 bytes=689946 sess_lines=2
$ curl …/MCP_protocol_version_compatibility.md  →  bytes=12049 sess=0
$ curl 'https://www.volcengine.com/api/doc/getDocDetail?LibraryCode=agentkit&DocumentCode=MCP_protocol_version_compatibility'
   → bytes=59103, text present 10/10 runs
```
The entry states: "A default client receives a 12 049-byte shell containing no body text; the body is server-rendered only when the request carries a browser User-Agent (689 946 bytes that way)." The same browser UA yielded the 12 049-byte shell on 31/40 runs, so UA is not the discriminator — the entry's own stated mechanism is falsified, and its `-> 2` recheck fails ~78 % of the time.

**E4 — `ground:` quotes vs the live PROVINCE.md.**

```
$ grep -c 'rows, queued' PROVINCE.md                      → 0
quoted in mcp-stateless-vendor-compatibility.md : "MCP protocol revisions as they bear on orchestration — `corpus/SOURCES.md` rows, queued."  → NOT present in live PROVINCE.md
quoted in japanese-multi-agent-operations.md    : "Durable-execution and multi-agent failure research … `corpus/SOURCES.md` rows, queued."  → NOT present
quoted in omp-session-sharing…/omp-advisor…/isolation-amendment → present (band lines 19, 21)
```
Live band 2 now reads "… first entry `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136) …"; live band 4 now names `corpus/knowledge/at-least-once-dedupe.md` (round 54) and five later entries.

**E5 — id space: the advisor entry's headline citation points at the wrong document.**
`omp-advisor-and-mcp-transports.md:80` — "Round 1's `S104` recorded that OMP negotiates MCP protocol version `2025-11-25`". In the lane registry S104 is RFC 8785 (JCS) and S115 is NATS JetStream ack-responses; in the package S104/S115 exist in neither space (package ids run S195–S349; `grep -c '^\| S104 \|' SOURCES.append.md` → 0).

```
$ grep -E '^\| S104 \|' corpus/SOURCES.md | cut -c1-120
| S104 | RFC 8785 — JSON Canonicalization Scheme (JCS) — https://www.rfc-editor.org/rfc/rfc8785.txt | spec | A …
$ grep -E '^\| S115 \|' corpus/SOURCES.md | cut -c1-120
| S115 | Ack responses and redelivery — NATS documentation … | docs | A …
# the correct package ids for the two docs are S199 (mcp-runtime-lifecycle.md) and S210 (mcp-protocol-transports.md)
```
Same defect in `omp-mcp-protocol-version-code.md` (S104, S115 ×3) — outside my five, but it confirms the package-wide pre-remap leak: 8 pre-remap ids are cited in staged prose, and 3 cited ids (S130, S140, plus S104/S115) exist in neither space.

**E6 — later package rounds supersede the advisor entry's claim.** `omp-mcp-version-negotiation-decision.md` (S232, commit `10bce6900` "negotiate 2025-11-25") and `omp-host-harness-protocol-skew-2026-10-27.md` (S250, host-binary sweep) answer the same question better. Host check, run here:

```
$ omp --version                       → omp/18.12.6
$ grep -a -o -F '2025-11-25' /home/vgpnk/.local/bin/omp.real | wc -l   → 2
$ grep -a -o -F '2026-07-28' /home/vgpnk/.local/bin/omp.real | wc -l   → 0
```
Neither staged OMP entry names the installed host version (grep `omp/18` → 0 hits in both) — **Q8** gap: the installed binary is `omp/18.12.6` (= oh-my-pi `45c35e40`), and the docs are at `0b5c27ab`.

**E7 — quoted strings re-located in the live sources (all five entries).**

```
S198 collab.md:119 § End-to-end encryption — "…never a TCP port"          1 hit (line 89)
S199 mcp-runtime-lifecycle.md:233 § Failure modes and guarantees — "…never replayed automatically"  1 hit (line 152)
S209 advisor-watchdog.md:134 § Tools and isolation — "…does not share the primary agent's file snapshots…"  1 hit (line 136)
S210 mcp-protocol-transports.md:111 § Request progress — "…provides no confirmed remote cancellation"  1 hit (line 123)
S207 vendor doc API MDContent: 2 of 3 staged Chinese quotes FOUND verbatim; the third ("不再使用 Mcp-Session-Id 维护协议级会话") FOUND in the served HTML body (grep -c 'Mcp-Session-Id' → 2 lines) but not in the API MDContent copy
S212 spiderplus "1.8 倍" → 2   S213 qiita "45.6" → 8   S214 enechange "54,326" → 2
```
All claimed § anchors exist in the pinned upstream docs (heading dump verified for all four OMP docs). Rechecks reproduce: S199/S209/S210/S311 all `→ 1`; S212 `1.8 倍 → 2`; S213 `45.6 → 8`; S214 `54,326 → 2`; S309/S310 anchors present on the jj docs pages.

**E8 — registry rows are not in the lane's 11-cell schema (mechanical, L1 integration step).**

```
$ sources-census.sh validate --file <scratch registry with the 11 rows inserted>
file	E01	S198 fields=12 … E01	S310 fields=13
file	E09	S311 recheck=30d — `grep -c -F 'seat-A-commit visible from seat B: 1' …
file	E11	S198 missing used-by grep -c 'never a TCP port'` -> 1 (ran 2026-10-23)   … (all 11 rows)
$ node scripts/sources-check.mjs   # same scratch registry
SOURCES  error  ROW_MALFORMED  corpus/SOURCES.md:148  id=S198 split-fields=14; expected 13   (…S199,S207,S209,S210,S212,S213,S214,S309; S310 split-fields=15)
SOURCES_CHECK: DRIFT (ROW_MALFORMED,RECHECK_INVALID)
```
Cause: the recheck cell holds a `curl … | grep …` pipeline, so the pipe splits the row — exactly the hazard `corpus/lessons/round-60.md` §Gate records ("The pipes inside those cells would split the row into more than eleven columns … each cell was reduced to a cadence"). 126 of the package's 155 rows are non-11-cell.

**E9 — the isolation amendment duplicates a document the lane already holds.**
`S310` = `https://docs.jj-vcs.dev/latest/git-compatibility/`; the lane's `S066` = `https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/git-compatibility.md` (pinned). Same upstream document; the staged row adds an unpinned `/latest/` URL, against the lane's own rule (QUALITY.md Q17 grounding: "S033 (a link is only stable against a commit id, never a moving head)"). The lane registry contains **zero** `/latest/` jj URLs; the only two unpinned `/latest/` URLs it holds are vendor docs with no versioning scheme. The `§ Creating a repo by cloning a Git repo` anchor S310 claims is already present in the pinned v0.45.1 copy (1 hit). And `S311`'s source and recheck point outside the lane repo (`/home/vgpnk/Projects/shokuknow/lanes/kumitate/round13/jj-seat-policy-demo-2026-10-24.txt`); `grep -c 'shokuknow|lanes/kumitate|merge/kumitate' corpus/SOURCES.md` → 0 — no lane registry row points into the campaign tree (Q14). The file itself is real and its recheck returns 1.

**E10 — the japanese entry points at a document the lane rejected and does not hold.**
`japanese-multi-agent-operations.md:123` cites `knowledge/exactly-once-attribution.md`. `find . -name exactly-once-attribution.md` in the lane → nothing; `corpus/lessons/round-61.md:13` records "REJECT exactly-once-attribution.md (document arXiv 2609.29095) … flip: a later band-4 round re-opens the measured paper and adopts only under the lane's existing document id", and the lane holds that paper as `S134`. Also, the entry's §1 (orchestration graph with gates, rollback back-edges, iteration bound) is the coordinator-topology material the round-63 C2 claim adopts from `multi-agent-coordinator-topologies.md` (S200/S202) — a one-theme collision. And the same spiderplus URL is already staged twice: `S212` and `S218` (package dup-URL group, `japanese-orchestration-measurements.md`).

**E11 — Q3/Q4 counts.** The japanese entry asserts ≈20 numbers (0.94, 45.6→26.0, 8–9/run, 1–2/run, 35.0 vs 24.3, 28 %, 100 %, 0.2–0.3, 2.1–2.2×, 2.5–2.7×, 55 %, 19 %→12 %, 0.88, 43 %, 1.8×, 1.5×, 6 calls, 54 326, 1 897, 15 968/16 595/17 038) with one recheck command (`54,326` → 2) and no `recalled` labels; the advisor entry asserts the 4096-entry FIFO, default 4 / range 1–32, 30 s cap, 3 attempts, 500/1000/2000/4000 ms backoff, >5 attempts/30 s, 15 s→5 min probes, also with one recheck string. `grep -c '\[INFERENCE\]'` is 0 in all five staged files while 14 lane knowledge files use the label (Q4).

## Findings

**K63ScoutStagedScope-1** — SEVERITY high (blocks all five) — the staged package's knowledge files begin with a blank line, so `sources-check.mjs` rejects every one with `ENTRY_HEADER_REQUIRED`; the header triple is unreachable to the gate. Reproduce: `node scripts/sources-check.mjs` in the scratch lane with the files copied in. Fix: strip the leading newline (verified to clear this arm).

**K63ScoutStagedScope-2** — SEVERITY high (blocks all five) — the 11 registry rows are 12–13 cells, not the contract's 11, because the recheck prose contains an unescaped `|`; `sources-census.sh validate` reports `E01 fields=12` and `E11 missing used-by` for every row, and `sources-check.mjs` reports `ROW_MALFORMED split-fields=14; expected 13`. Reproduce: insert the rows into a scratch `corpus/SOURCES.md` and run both gates. Fix: rebuild rows in scratch with the recheck prose reduced to a cadence, as round 60 did.

**K63ScoutStagedScope-3** — SEVERITY medium — per-file cite-check errors of 6/3/0/1/2 against a lane baseline of 0, from bare upstream doc paths (`docs/collab.md`) and the marker word before the commit hash (`commit 0b5c27ab`); a URL-form rewrite plus marker removal takes the session-sharing entry to 0 errors. Reproduce: `node scripts/cite-check.mjs --json --self <scratch> --fleet /home/vgpnk/Projects/shokunin`.

**K63ScoutStagedScope-4** — SEVERITY medium — `omp-advisor-and-mcp-transports.md:80` grounds its central claim on `S104`, which in the lane registry is RFC 8785 (JCS) and in the package does not exist; the correct ids are S199/S210. The claim is also superseded inside the package by later rounds (S232 commit `10bce6900`, S250 host sweep). Reproduce: `grep -E '^\| S104 \|' corpus/SOURCES.md`.

**K63ScoutStagedScope-5** — SEVERITY high — `mcp-stateless-vendor-compatibility.md`'s recheck returns the claimed `2` in only 9/40 runs; the same browser UA returns the 12 049-byte shell on 31/40 runs, falsifying the entry's stated "body only with a browser User-Agent" mechanism. The vendor doc API serves the text 10/10 runs. Reproduce: the two 20-run batches in E3.

**K63ScoutStagedScope-6** — SEVERITY medium — `ground:` quotes in `mcp-stateless-vendor-compatibility.md` and `japanese-multi-agent-operations.md` reproduce a PROVINCE band wording the live file no longer contains (`grep -c 'rows, queued' PROVINCE.md` → 0), so both quote a superseded ground line (Q7).

**K63ScoutStagedScope-7** — SEVERITY medium — `japanese-multi-agent-operations.md:123` points at `knowledge/exactly-once-attribution.md`, a document the lane rejected (round 61) and does not hold; the same paper is held as `S134`. Its §1 also collides with the round's adopted coordinator-topology theme, and its three sources duplicate `S218`'s spiderplus URL.

**K63ScoutStagedScope-8** — SEVERITY medium — `agent-isolation-substrates-amendment-2026-10-25.md` is packaged as a new file while its own text says it amends `corpus/knowledge/agent-isolation-substrates.md` (lane-held); `S310` re-serves the jj document the lane pins as `S066` but at an unpinned `/latest/` URL (lane rule S033); `S311` points outside the lane repo (Q14); and its "the harness owner can still choose" framing is overtaken by the staged 2026-10-26/10-27 amendments, which record the fleet's choice (clone-per-seat, arm 2).

**K63ScoutStagedScope-9** — SEVERITY low — Q8: neither staged OMP entry names the installed host binary (`omp/18.12.6` = oh-my-pi `45c35e40`) against the docs commit `0b5c27ab`; Q4: 0 `[INFERENCE]` labels in all five staged files where the lane's own corpus labels 14; Q3: ≈20 counts in the japanese entry and 8 in the advisor entry carry no counting command, dated re-run, or `recalled` label.

**K63ScoutStagedScope-10** — SEVERITY info — scope band mapping: `omp-advisor-and-mcp-transports.md` is filed under band 1 but its advisor half is band 3 material (the lane's band-3 entry `agent-isolation-substrates.md` already holds the substrate question) and its transport half is band 2; `japanese-multi-agent-operations.md` §3 (fat-context token accounting) sits next to the adjacent band "Prompt and skill craft → kotoba".

### Verdicts

| entry | S-ids | lane rows holding the same documents (by URL) | band | verdict | reason / flip |
|---|---|---|---|---|---|
| `omp-session-sharing-and-mcp-lifecycle.md` | S198, S199 | none (both docs are the lane's own named unopened leads, `corpus/SOURCES.md` §Leads) | frontier 1 | **ADMIT-CANDIDATE** | content is unique and every quote re-locates (E7); admit after Findings 1–3, 6 (band-1 wording is current) and 9 are fixed: name `omp/18.12.6`, label the 250 ms gate's inference, add the 4096-entry count's command |
| `omp-advisor-and-mcp-transports.md` | S209, S210 | none | frontier 1 (advisor half → 3; transport half → 2) | **REJECT** | Finding 4: the `S104` citation names RFC 8785 in the lane registry and the version claim is superseded by later package rounds. Flip: re-point to S199/S210, re-scope to the advisor-isolation half under band 3, and ground the version statement on S232/S250 or drop it |
| `mcp-stateless-vendor-compatibility.md` | S207 | none (no volcengine row in the lane) | frontier 2 | **REJECT** | Finding 5: the entry's own recheck reproduces 9/40 times and its stated access mechanism is falsified; Finding 6: stale `ground:`. Flip: re-base on the vendor doc API carrier (text 10/10) or on the staged 10-26/10-27 amendments (S312/S330/S339) that already move the copy into the lane tree, then re-quote the live band-2 line |
| `japanese-multi-agent-operations.md` | S212, S213, S214 | none (S136/S135 are other CJK pages; `S218` duplicates S212's URL inside the package) | frontier 4, but §1 is the round's adopted topology theme | **REJECT** | Finding 7: dangling pointer to the rejected `exactly-once-attribution.md` (paper held as S134) + one-theme collision with the adopted topology entry. Flip: a later band-4 round re-opens S212/S213/S214, drops §1's graph material, re-points the exactly-once sentence to S134, and per Findings 9 supplies a counting command or `recalled` label for each count |
| `agent-isolation-substrates-amendment-2026-10-25.md` | S309, S310, S311 | S066 holds the same jj git-compatibility document (pinned v0.45.1); no lane row for the architecture page | frontier 3 | **REJECT** | Finding 8: amendment-to-a-held-file packaged as a new file, unpinned `/latest/` URL for a document already held, out-of-repo pointer, and superseded by the staged 10-26/10-27 chain. Flip: adopt the 10-26/10-27 amendments appended into `corpus/knowledge/agent-isolation-substrates.md`, cite jj at the pinned v0.45.1 raw URLs (S066/S067), and copy the demo transcript into the lane so the recheck is repo-relative |

**Lesson candidate (one honest REJECT besides the adopted topology):** `omp-advisor-and-mcp-transports.md` — the sharpest, because it is a *citation-integrity* defect (its headline citation names a different document in the lane's own registry), it is mechanically checkable in one grep, and its flip is cheap and concrete.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w1/K63ScoutStagedScope.md` (this report)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63ScoutStagedScope/verdicts.md` — the five-entry verdict table and the per-entry Q1–Q9 checklist
- Scratch only (no lane writes): `/tmp/kumitate-r63/K63ScoutStagedScope/` — `lane/` (read-only copy of `scripts/`, `corpus/`, `.ufo/` used for the gate runs), `cite.json`, `cite2.json`, `live-cite.json`, `varA.md`/`varB.md` (the two cite-check fix variants), `registry_raw.md`

No tools installed or updated. No subagents dispatched. Nothing under `scripts/`, `corpus/`, `SCORECARD.md`, `LOG.md`, `PROVINCE.md`, `.ufo/pins/` or the lane git index was touched; no `jj`/`git` mutating command was run in the lane or the fleet.

## Limits

- I did not re-open the three Japanese pages and the vendor page for *every* number the entries assert; I verified the three staged recheck strings and the count-bearing quotes named in E7, not all ≈20 counts.
- The vendor page's body-vs-shell flip is reproducible but its mechanism (server-side render vs cache) is not established — I observed only that the same UA and URL yield both variants, at 12049 vs 689946 bytes.
- I did not check the other 62 staged knowledge files; the shared Findings 1–2 (blank first line, non-11-cell rows) were verified against all 67 files by count and against these five row-wise, but the per-entry verdicts cover only the five assigned.
- `S207`'s second Chinese quote was found in the served HTML body but not in the doc-API `MDContent` copy; I did not determine whether that copy is truncated or whether the wording differs between carriers.
- The doc API's JSON bytes differ between fetches (59103 bytes, differing sha256) while the `MDContent` prefix I compared was identical; I did not diff the full `MDContent`.
- No lane lesson, SCORECARD, PROVINCE or corpus file was edited, so the fix recipes above are untested against a real merge.
