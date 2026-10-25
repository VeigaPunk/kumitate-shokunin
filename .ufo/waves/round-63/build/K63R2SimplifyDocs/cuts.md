# K63R2SimplifyDocs — cuts (proposals only; no lane file was edited)

Measured revision `a9531c8e617338fd16cb69c61344ef8f17711117` (base `dfa6fca8f362e9c962f5b940025a2619380b759b`).
Method: `git archive a9531c8e` into a scratch fixture, every edit applied there only, then the frozen
counters and the gates that read these bytes re-run on the edited fixture. Machine-readable form of the
whole change: `proposed.diff` (201 lines) beside this file.

**Total: −2919 bytes over 7 files (286 320 → 283 401), −33 lines net.** No new sentence is introduced except
where a line was factually wrong (see `## Findings` in the report); every other replacement is shorter than
what it replaces.

| file | before | after | delta | who reads it |
|---|---|---|---|---|
| `corpus/lessons/round-63.md` | 12004 | 10017 | **−1987** | readers; `readme-map` (row only); `cite-sources` (row only) |
| `corpus/QUALITY.md` | 99483 | 99263 | −220 | readers; Q-numbers are graded by the spot-check |
| `SKILL.md` | 84295 | 84127 | −168 | readers; gate registry (invocation/verdict/selftest/pin cells kept) |
| `PROVINCE.md` | 4461 | 4351 | −110 | frozen C2 probe T7 (`province-names-entry`) |
| `corpus/README.md` | 75722 | 75454 | −268 | `readme-map` (row shape), `cite-sources` (S-ids) |
| `corpus/knowledge/multi-agent-coordinator-topologies.md` | 8890 | 8742 | −148 | frozen C2 probe T1/T2/T4 (header trio, `source:` lines, `## Located quotes`) |
| `.ufo/waves/round-63/controls/CHANGES-AFTER-FREEZE.md` | 1465 | 1447 | −18 | readers |

---

## 1. `corpus/lessons/round-63.md` — −1987

**L5** (opened sources) — the URL and the `§ 编队配置` anchor are the entry's own `source:` line 1 verbatim;
the staged→lane mapping is stated again at L33. Shorten:
- old: `opened sources this round (access date 2026-10-25): staged `S200` → lane `S196` (`https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md`, § 编队配置) and staged `S202` → lane `S197` (arXiv 2512.08296, v3)`
- new: `opened sources this round (access date 2026-10-25): package `S200` → lane `S196` (Bailian managed agents) and package `S202` → lane `S197` (arXiv 2512.08296 v3)`

**L11** (arXiv recheck tail) — the five occurrence counts are superseded by L13's full sweep (0 NOT-FOUND).
- old: `` occurs once, `0.023` twice, and the staged table's `+57`, `19%`, `80.8`, `70%`, `45%` occur 1/1/18/12/8 times.``
- new: `` occurs once and `0.023` twice.``

**L13** — (a) drops the "sweep covers the five headline percentages only" hedge that the removed counts made
true; (b) **fixes a false record**: the sentence said the `§ agents 条目字段` locator was cut, but the adopted
entry's `source:` line 1 still carries it (`grep -c '§ agents 条目字段' corpus/knowledge/multi-agent-coordinator-topologies.md` → `1`).
- old: `The sweep above covers the five headline percentages only — every number in the adopted entry's prose is re-found in the two captures by `.ufo/waves/round-63/build/K63ScribeEntryDraftB/` script and by K63ReviewQuotes (0 NOT-FOUND, 0 CONTRADICTED); the staged `Kim`-less author cell, the `r·n`/`r·n+p·m` formulas, `—` spacing and the `§ agents 条目字段` locator were cut (K63ScoutStagedDiff: 5 claims not adoptable as written).`
- new: `Every number in the adopted entry's prose is re-found in both captures (0 NOT-FOUND, 0 CONTRADICTED; `.ufo/waves/round-63/build/K63ScribeEntryDraftB/`, K63ReviewQuotes); the staged `Kim`-less author cell, the `r·n`/`r·n+p·m` formulas and `—` spacing were cut (K63ScoutStagedDiff: 5 staged claims not adoptable as written; the `§ agents 条目字段` anchor is kept — the roster table sits under it).`

**L19** (ADMIT criterion cell) — three clauses restate the flip sentence they precede.
- old: `| Q1–Q4; one-theme round (coordinator topology); both staged documents re-opened this round; the measurement claim is version-pinned to arXiv 2512.08296v3; the r60/r61 flip fired`
- new: `| Q1–Q4; the r60/r61 flip fired`

**L19** (ADMIT evidence cell) — both capture sha256 appear twice in one file (L10/L11 with their
`sha256sum` provenance). Keep the authoritative copy, point at it.
- old: `(≤25 words; capture `.ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md`, sha256 `7ea4…`…) and `https://arxiv.org/abs/2512.08296`, § Experiments & Results → § Setup (Benchmarks), v3 capture sha256 `df31…`…`
- new: `(≤25 words; capture `.ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md`) and `https://arxiv.org/abs/2512.08296`, § Experiments & Results → § Setup (Benchmarks); both captures' sha256 are at § Opened-source recheck`

**L25** — delete the final sentence (the adopted entry's own `source:` lines carry `S196`/`S197`; the map is L33).
- delete: `` The staged entry's two `source:` lines name package ids (`S200`, `S202`) that do not exist in this lane's registry; the adopted entry's lines must carry `S196`/`S197`.``

**L29** — the staged ids are at L5 and L33, the access date at L5.
- old: `adopting one entry, `multi-agent-coordinator-topologies.md` (staged rows S200/S202). Access date 2026-10-25; plan pointer`
- new: `adopting one entry, `multi-agent-coordinator-topologies.md`; plan pointer`

**L31** — the id-gap list is seat-report detail (which registry ids are missing); the collision result is the fact.
- old: `` `reg-ids` 134 lines (max id `S195`, gaps at `S121`, `S128`–`S130`, `S132`, `S137`–`S189`), `staged-ids` ``
- new: `` `reg-ids` 134 lines (max id `S195`), `staged-ids` ``

**L33** — also repairs the lowercase sentence fragment ("…at all. landed in the round-63 work commit") and drops
the seat name; T6 re-derives the census.
- old: `Both ids are free at `b38a2065`: `grep -cE '^\| S19[67] \|' corpus/SOURCES.md` → `0`, and no `S2xx` row exists at all. landed in the round-63 work commit: rows S196 and S197 inside `## Registry` after S195 (`corpus/SOURCES.md`), census-validated in scratch by K63ExecRowDraft and again at the tip.`
- new: `Both ids were free at `b38a2065` — `grep -cE '^\| S19[67] \|' corpus/SOURCES.md` → `0`, no `S2xx` row exists at all — and both rows landed inside `## Registry` after S195 (`corpus/SOURCES.md`); the tip census re-derives them (T6).`

**L35** — the sentence restates the entry's own `source:`/`used-by` cells and L13's "no staged number survives".
- old: `The staged entry is re-grounded in-round rather than copied: `corpus/knowledge/multi-agent-coordinator-topologies.md` cites S196 (Bailian `.md` rendering) and S197 (`https://arxiv.org/html/2512.08296v3`, authors led by Yubin Kim); its `## Located quotes` section holds 15 quotes machine-proven present in both captures and in a live fetch (K63ScribeEntryDraftB) — the entry's `source:` lines and `used-by` cells carry the lane ids and the round's own captures, and no staged number survives unverified.`
- new: `Re-grounded in-round rather than copied: the entry's `## Located quotes` section holds 15 quotes machine-proven present in both captures and in a live fetch (K63ScribeEntryDraftB).`

**L41** — the nine ids are listed at L39; re-listing them in the same order is the restatement.
- old: `The five `payload-absent` labels (S109, S116, S118, S129, S142) are checker artefacts (wrong surface or version; S116 = arXiv 2512.08296 is present in v3 `htmlv3.html:1052` and absent in v1/v2, so C2 cites v3); the four `unreachable` ones (S143, S144, S145, S178) are reachable now and their quotes locate. None of the nine is appended: the lane rows S196/S197 cite the documents this round opened itself. A fetch that failed is not fabrication, and no verdict upgrades a row into the registry.`
- new: `The five `payload-absent` labels are checker artefacts of surface or version — S116 (arXiv 2512.08296) exists in v3 only (`htmlv3.html:1052`), which is why C2 cites v3 — and the four `unreachable` ones fetch now with their quotes locating. None of the nine is appended: S196/S197 cite the documents this round opened. A failed fetch is not fabrication, and no verdict upgrades a row into the registry.`

**L47** — the trailing half is an instruction to the L1, not lesson content, and restates Q50.
- old: `After: {{CENSUS}} — paste the round-end `sources-census.sh validate --root … kumitate` transcript with its exit code, and re-derive the tier histogram instead of copying a report figure.`
- new: `After: {{CENSUS}} — the round-end `sources-census.sh validate` transcript with its exit code.`
- **The `{{CENSUS}}` token stays**: it is the L1's close fill, not mine to invent (see Finding 6).

**L53** (Mistakes fix cell) — the whole cell restates Q58, and its last third is **stale**: it calls
`scripts/plan-before-ready.sh` "uncommitted at `b38a2065` … counts only once committed", while the script is
committed in `05b3176915de4175bb211b4b1422d8e56cf16888` and SKILL row 628 already cites it.
- old: `| a QUALITY criterion: a round's … with its red (round 62) and green (round 63) transcripts |`
- new: `| QUALITY Q58 (`corpus/QUALITY.md`) with `scripts/plan-before-ready.sh`: round 62 reads `PLAN_BEFORE_READY: FAIL … reason=NO_PLAN` exit 1; round 63 passes — `plan.md` is inside `b38a2065`, `w1.ready` was still untracked at the measured revision |`

**L59** — four `:NNN` line numbers into a 376-line script are seat-report detail and drift on the next edit;
the finding ids and selftest case names are the contract.
- old: `(present at `b38a2065`, 376 lines, sha256 `fdd8…`) derives the dead set from the host session transcripts (`:232` `dead: !clean`), requires the report to name every dead seat (`:256` `DEAD_UNNAMED:<seat>`), prints `dead=<n>` in the verdict line (`:260`), and ships three selftest cases (`:314` `dead-seat-counted-not-credited`, `:315` `dead-unnamed-in-report` / `dead-named-in-report`).`
- new: `(sha256 `fdd8…` at `b38a2065`) derives the dead set from the host session transcripts (`dead: !clean`), requires the report to name every dead seat (`DEAD_UNNAMED:<seat>`), prints `dead=<n>` in the verdict line, and ships three selftest cases (`dead-seat-counted-not-credited`, `dead-unnamed-in-report`, `dead-named-in-report`).`

**L61** — the two `— whether …` fragments are not sentences (no other lesson uses that shape:
`grep -rn ' — whether ' corpus/lessons/*.md` → this line only). Rewrite keeps every fact and names the open questions.
- old: `Q54 itself is unchanged — whether `Q54` is extended to the transcript-derived set; on this round's wave 1 … keeps the abnormal-exit case) — whether the arm names a dead seat on this round's own waves.`
- new: `Q54 itself is unchanged. On this round's wave 1 … keeps the abnormal-exit case). Open: whether Q54 absorbs the transcript-derived set, and whether the arm names a dead seat on this round's own waves.`

## 2. `corpus/QUALITY.md` — −220

**Q58 Command** — the selftest sentence duplicates SKILL row 628's selftest cell verbatim in substance
(`PLAN_BEFORE_READY_SELFTEST: PASS (10/10)` appears in both).
- delete: ` Self-test of the command itself: `bash scripts/plan-before-ready.sh --selftest` → `PLAN_BEFORE_READY_SELFTEST: PASS (10/10)` exit 0.` → replace with `;`-joined `; standing sweep `bash scripts/plan-before-ready.sh --all`.` (final text: `…and exit 0; standing sweep `bash scripts/plan-before-ready.sh --all`.`)

**Q59 Shown able to fail** — six example cases where three carry the arms; the other 41 are `expect` files.
- new tail: ``…`cheap-40-seats` (a 40-seat forgery of five hand-written rows per seat) → `SESSION_TOOL_JOIN`; the other 41 name their own finding ids in the same directory.``

**Q59 Limit** — the first sentence was a paraphrase of `plan.md` C1's stated limit; compress to a pointer that
keeps both facts (the defeat, and that the records live outside the repo).
- new: ``  - **Limit.** `plan.md` C1's stated limit stands: a lane that also writes faithful host transcripts and orchestrator log lines defeats the gate, and those two records live outside the repository, so the non-author closure re-derives them.``

## 3. `SKILL.md` — −168

**Row 627** — the rationale duplicated `plan.md` C1's sentence, the parenthetical enumerated transcript fields the
gate's own header owns, and "Known limit" was the third copy of the plan's limit (plan, Q59, row).
- old fragment: `a run-7 wave is spawned inline by the orchestrator session, so no `launcher-progress.tsv` exists for `dispatch-evidence` to read; … (seat marker, context head, task tail, shape arms …yield + exit), the orchestrator dispatcher log (`spawned`/`done` lines) … (`DEAD_UNNAMED`). Known limit: a lane that also writes faithful transcripts into the host store and lines into the orchestrator log defeats it`
- new fragment: `run-7 waves are spawned inline, so no `launcher-progress.tsv` exists for `dispatch-evidence` to read; … (shape arms `SESSION_HEADER/TOOL_JOIN/ROWGRAPH/TIMELINE/TEMPLATE`), the orchestrator dispatcher log (`spawned`/`done`) … (`DEAD_UNNAMED`); its stated limit is `plan.md` C1's`

**Row 628** — "contract Q58" put a criterion id in the contract cell; `scripts/plan-before-ready.sh` declares no
contract (`grep -n contract scripts/plan-before-ready.sh` → no match), and every other gate row names a
`kumitate-…-v1` string there. Also `) ,` → `),`.
- old: `(0 pass · 1 fail · 2 not applicable) , contract Q58 (round 63):`
- new: `(0 pass · 1 fail · 2 not applicable), criterion QUALITY Q58 (round 63):`

## 4. `PROVINCE.md` — −110

**L23** — the parenthetical claimed the band owns "what the arrangement costs" and the same line closed with
"cost per topology stay unspecified by both sources": self-contradiction, and the entry's Limits say S197 reports
no cost and S196 states none. The closing clause also restates the entry's `## Limits` §Unspecified by both.
- old: `(how a wave's seats are arranged: which topology, what a coordinator may delegate, what the arrangement costs) … that judgment; recursion, nested rosters and cost per topology stay unspecified by both sources.`
- new: `(how a wave's seats are arranged: which topology, what a coordinator may delegate) … that judgment.`

## 5. `corpus/README.md` — −268

- **L187** new: ``| `knowledge/multi-agent-coordinator-topologies.md` | Multi-agent coordinator topology as orchestration decisions: a vendor's coordinator contract (roster 1-20, one `self`, version pin) beside the measured scaling study (arXiv 2512.08296 v3: topology by task structure, not agent count) | S196, S197; `.ufo/waves/round-63/build/K63Capture/` |`` (drops the kengaku clause — stated at L286 and PROVINCE L23)
- **L188** new: ``| `lessons/round-63.md` | Round-63 lesson: S196/S197 opened and re-grounded, quarantine verdicts, the zero-claim misreading mined into a plan-before-marker criterion | S196, S197; `.ufo/waves/round-63/` |``
- **L286** new: ``- **Multi-agent coordinator topology:** first entry `knowledge/multi-agent-coordinator-topologies.md` (S196/S197): coordinator contract and measured scaling study mapped onto seat arrangement.`` (the "how a wave's seats are arranged" gloss is PROVINCE L23's; the "adjacent, not absorbed" half is PROVINCE's; "nested rosters and per-topology cost stay open" is the entry's `## Limits`)

## 6. `corpus/knowledge/multi-agent-coordinator-topologies.md` — −148

Prose only; the header trio, `source:` lines, both tables and every `## Located quotes` bullet are untouched
(proof below).
- **L11** (intro) — restates the section heading "The roster ceiling a coordinator must live under (S196)":
  old `(S197 §4.2). The vendor contract (S196) supplies the ceiling such a decision has to live under, not the decision.`
  → new `(S197 §4.2). S196 supplies the ceiling that decision has to live under, not the decision.`
- **Limits §Fixed-budget deltas** — restated the Located-quote bullet "All MAS and SAS configurations were matched
  for total reasoning-token budget (mean 4,800 tokens per trial) and tool-call access…"; the number survives in
  that bullet. New: `- **Fixed-budget deltas.** The percentages are fixed-budget percentages: MAS and SAS were matched for total\n  reasoning-token budget and tool-call access, and the study reports no cost, latency or wall-clock\n  comparison (§4.1).`
- **Limits §Version scope** — restated the `source:` lines (`arXiv:2512.08296v3, 08 Apr 2026`) and `verified-at:`.
  New: `- **Version scope.** Earlier paper versions and later vendor changes are out of scope; benchmarks are named per\n  S197 Table 1, and mapping them onto "if the task looks like" is this entry's wording [INFERENCE].`

## 7. `.ufo/waves/round-63/controls/CHANGES-AFTER-FREEZE.md` — −18

Item 3 said "monotone" and "per the plan's ratchet clause" — the same thing twice.
- old: `3. Added cases (monotone, per the plan's ratchet clause): 5 from K63ReviewGateCode`
- new: `3. Added cases (ratchet, `plan.md` C1): 5 from K63ReviewGateCode`

Everything else in that file is a distinct disclosure (what broke, the repair, which seats found it, the case
count, the counters explicitly not patched); no further cut is honest.

---

## Gates that read these bytes — proof (base vs trimmed, same commands)

Scratch fixtures only: `git archive a9531c8e | tar -x` into `/tmp/kumitate-r63/K63R2SimplifyDocs/{base,trim}`,
each its own `git init` repo, `git -C <D> rev-parse --show-toplevel` equal to `<D>` before the first commit.

```
# base fixture (eb6c6ecf…), unchanged bytes
TOPOLOGY63_HELD held=7/7 checks=7 rev=eb6c6ecf652806a39023ad82f4903423fb07fb26 rule=T63
EXIT=0
# trimmed fixture (4c93033a…)
TOPOLOGY63_HELD held=7/7 checks=7 rev=4c93033ac5b5c959868709f88b7fff1eecbbbebc rule=T63
EXIT=0

# trimmed fixture, cwd = fixture root
README_MAP: CLEAN files=153 rows=153 covered=153
EXIT=0
CITE_SOURCES: CLEAN cited=190
EXIT=0
SOURCES_CHECK: CLEAN (rows=136 tiers=A:113,B:15,C:8 status=queued:13,mined:104,rejected:19 entries_with_source=20 legacy=38)
EXIT=0
```

Region-level proof that the gated bytes are byte-identical:

```
diff <(sed -n '1,5p' base/…/multi-agent-coordinator-topologies.md) <(sed -n '1,5p' trim/…)  → empty (HEADER-IDENTICAL)
diff <(sed -n '/^## Located quotes/,$p' base/…) <(sed -n '/^## Located quotes/,$p' trim/…)    → empty (QUOTES-IDENTICAL)
```

What each frozen check reads, and why the cuts miss it:

| check | reads | cut touches it? |
|---|---|---|
| T1 | first 14 lines: `^source: S###`, `^verified-at: 2026-10-25`, `^recheck:` | no — header byte-identical |
| T2 | every S-id on `source:` lines vs `## Registry` cells (13 cells, `mined`, `2026-10-25`, url, `used-by`) | no — `source:` lines untouched; `corpus/SOURCES.md` untouched |
| T3 | `.ufo/pins/source-captures.json` vs committed capture sha/size | no — pin and captures untouched |
| T4 | `## Located quotes` bullets, `^-\s+(S\d{3,})\s+[—-]\s+"…"$`, ≤25 words | no — section byte-identical (15 bullets) |
| T5 | live fetch of the row URLs | no — URLs live in `SOURCES.md`, untouched |
| T6 | `sources-census.sh validate` over the archive's `SOURCES.md` | no — file untouched; re-ran CLEAN |
| T7 | a `PROVINCE.md` line containing the entry path and `/frontier\|band\|ground\|first entry/i`; `readme-map.mjs` | no — trimmed line keeps both; readme-map re-ran CLEAN |
| `readme-map` | one `` | `path` | `` row per corpus file + `covered` pin | no — paths and row count unchanged (`files=153 rows=153`) |
| `cite-sources` | S + 3-or-more-digit ids in README rows must be SOURCES rows | no — `S196, S197` kept in both rows (`cited=190` unchanged) |
| Q58/Q59 graded by readers | Q-number, field/command/fails/shown/limit/epoch limbs | no — every limb kept; only duplicated sentences removed |

Not cut on purpose: every `## Located quotes` bullet; the entry header trio; `corpus/SOURCES.md`; the two
`{{…}}` close tokens; the `Shown able to fail` limbs (only the example count shrank); `CHANGES-AFTER-FREEZE`
items 1, 2 and 4 (each carries a distinct disclosure).
