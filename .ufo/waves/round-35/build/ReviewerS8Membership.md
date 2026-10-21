S8_BOUNDARY verdict=measurement rationale=S3/S5 cells are closed lists that admit neither file; S8 is the declared remainder row, so S8 membership is arithmetic, not a family-boundary change; the 63→60 count move follows the round-32 measurement precedent (update declared cells to what the gates measure, recorded in-round), which the rule's own examples (re-drawing a boundary; K1 3→4) do not cover.

**Axes.** coverage:script-layer (judged), operability (adjacent, gate semantics), registry honesty (measurement-vs-registry-change).

# Question 1 — is S8 the right family for the two additions?

**Governing rows (SCORECARD.md §In-scope surface registry, lines 115-142).**
- S3 `swarm path` (line 121): closed two-member cell — `ufo-swarm-wave.mjs` + `ufo-swarm-collect.mjs`, no glob.
- S5 `routing & result helpers` (line 123): closed two-member cell — `omp-global-config.mjs` + `ufo-mission-result.mjs`, no glob.
- S8 `remaining scripts` (line 126): "**63 members (round-32 measurement): top-level `*.mjs` + `charter-scribe/` + `lean-cargo/` subtrees, live enumeration (`ls scripts/*.mjs` → 72 − 13 S1–S6 basenames − 9 S7 members = 50; rebuilt from the tree by an independent scout, `comm -3` against the authoritative list empty)**". S8 is defined as the remainder, by subtraction from the layer universe.

**Round-13/round-32 S8 definition.** Round 13 (SCORECARD.md:357-360): "S7 is now the 9-member route-probe cluster and S8 the 60-member remainder"; cut at :151-155: S1–S6 45 + S7 9 + S8 60 = 114. Round 32 (SCORECARD.md:1517-1523, :1550-1551): the re-census "corrected" the declared layer terms "to what the gates measure, not fitted to a target", and names the standing unblock "correct the S7/S8/R11 declared counts to their live membership". So S8's declared count is *whatever the live remainder measures*, not a fixed frozen list.

**Placement is arithmetic.** Neither new file appears in any S1–S7 or K/R cell (grep `route-grammar|swarm-registry` over SCORECARD.md: only build-wave artifacts). Both files sit at `scripts/<name>.mjs`:
- `LAYER_PATTERNS` (scripts/claims-check.mjs:317-319): `S: [/^scripts\/[^/]+\.mjs$/, /^scripts\/[^/]+\/.+/]` — both are S-layer members.
- `inFamily` (scripts/claims-check.mjs:261-268) grades a member into a row only via the backticked tokens of that row's own members cell (`familyPatterns`, :250-253). `omp-route-grammar.mjs` is matched by no S3/S5 cell token; `ufo-swarm-registry.mjs` is matched by no S3 cell token (S3's cell names `ufo-swarm-wave`/`ufo-swarm-collect` only). A section for either file inside the S3 or S5 note would fire `SECTION_FILE_NOT_MEMBER` (warn, scripts/claims-check.mjs:385-387) and, in the proxy, be excluded from the numerator (`inFamily === true` gate, scripts/proxy-check.mjs:409-411, 575-579) — it would not even score.

**Semantic reading is data, not instruction:** `omp-route-grammar.mjs` is a routing-grammar library (header mirrors `crates/ufo-core-runtime/build.rs` parse_route), and `ufo-swarm-registry.mjs` is the shared `ufo-swarm-registry-v1` authority used by the wave planner/collector. Even reading semantics, "routing & result helpers" (S5) is the *seat-routing* pair, and S3 is the wave/collect execution path; neither row's declared membership admits these files. Placement in S8 is what every governing text says. [INFERENCE beyond the mechanical check: no registry cell semantics force a different home.]

**ExecS8Writer's brief agrees** (.ufo/waves/round-35/build/build-spec.json:462, "S8 = script-layer universe minus live S1-S7 members").

# Question 2 — 63 → 60: measurement or registry change?

**The rule (SCORECARD.md:948-952, "Not a move, queued" bullet, round 15's plan):** "a registry change (e.g. re-drawing a family boundary) must be pre-registered a round ahead of the round that measures it, as in rounds 12→13." Cited with the K1 precedent at :441-443 and again at :776-778 ("a registry change is pre-registered a round ahead of the round that measures it"). The rule's own exemplars are (a) re-drawing a family boundary (round 12→13 S7/S8 partition, :357-360, `C1_total` 18→19) and (b) adding a family/member outside the live enumeration (K5, :779-784; K1 mcp.json, :441-447). Both change *which families/members the registry declares* — the partition changed S7's membership set and created S8; K1 adds a member the census reported UNLISTED.

**What 63 → 60 is.** The S8 cell's count is a *measured* quantity of the remainder row: round 32 already moved the frozen layer terms 114→91/74→56 as pure measurement ("The stanza's old values described a tree that no longer exists; they are corrected to what the gates measure", :1519-1523) and recorded it as the executed round, while the round-32 pre-registration (:1470-1474) framed the same work as re-deriving live membership. The claim-C2 target (88/88 at pinned 31c465f1) requires exactly this: upstream 964f443e→31c465f1 shows 2 A + 5 (6) D in `scripts/` (frozen s-added-2.txt, s-deleted-5.txt; my diff recount: 2 A, 6 D incl. dev-verify.sh which was never a member, 61 M; 55 member-modified under LAYER_PATTERNS S — matches the declared 2/5/55), so the remainder measures 88 − 28 (S1–S7) = 60 while the stale cell says 63. Declared 63 with computed 60 would fire `MEMBER_COUNT_DRIFT` (scripts/claims-check.mjs:404-405: "declared N members, found M distinct sections") — the same class as round 32's `MEMBER_COUNT_DRIFT` (S7 declared 9 vs 6) that the round-32 record lists as the standing unblock (:1547-1551).

**Why this is not the rule's case.** No family boundary is re-drawn: S1–S7 cells are untouched, no row id/family is created or split (`RE_REGISTRY_ROW = /^\| (S|R)\d+ \|/`, scripts/proxy-check.mjs:325; `C1_total` stays 8 S rows), and no member leaves or joins a family it was previously declared in — the tree itself changed upstream and the cell re-measures the same remainder definition ("top-level `*.mjs` + subtrees, live enumeration"). K1 (mcp.json) is the contrast: that census arm reports UNLISTED for a file the registry never declared — a *registry* change, correctly pre-registered in round 34 for round 35 (:441-447). The two scripts members were never outside the S universe: `S_members` counts every `scripts/*.mjs` (round-32 cell, :309) and the round-35 baseline `distinct.txt` (:11) lists both as "S members without section" — enumeration, not registry, moved.

**Caveat recorded.** The cell's parenthetical "(round-32 measurement)" is a stale self-citation once the count is corrected in-round; the round-35 record should re-label the provenance (e.g. "round-35 measurement") when it updates the cell. Cosmetic, no term moves.

**Placement + count verdict: measurement, allowed in the measuring round.** Falsifier satisfied: I derived membership mechanically from the governing cells and gate code; no registry semantic requires pre-registration for a re-measured remainder count.

# Commands run
- `git -C /fast/scratch/kumitate-r35/src diff --name-status 964f443e 31c465f1 -- scripts/` → 2 A (`omp-route-grammar.mjs`, `ufo-swarm-registry.mjs`), 6 D, 61 M; member-modified under LAYER_PATTERNS S = 55; `scripts/*.mjs` at 31c465f1 = 70, recursive depth≥2 = 18 (⇒ S_members 88, matches baseline `proxy.txt` computed=88).
- grep SCORECARD.md: `pre-registered a round ahead` → :442, :777, :951 (+ K1 self-citation :443); `In-scope surface registry` → :115; S3/S5/S8 rows → :121/:123/:126; `63 members` → :126 (unique); `round 32` → :1470, :1517; `Not a move, queued` → :948; `route-grammar|swarm-registry` → no SCORECARD hits (only wave artifacts).
- grep claims-check.mjs: `MEMBER_COUNT_DRIFT|inFamily|RE_MEMBERS` → :105-106, :261-268, :385-387, :401-407; familyPatterns → :250-253.
- grep proxy-check.mjs: `RE_REGISTRY_ROW|LAYER_PATTERNS|inFamily` → :317-319, :325, :409-411, :555-559, :575-579, :581-605.
- Read frozen/baseline artifacts: s-added-2.txt, s-deleted-5.txt, census.txt, proxy.txt, distinct.txt (:11).
- `git show 31c465f1:scripts/{omp-route-grammar,ufo-swarm-registry}.mjs | head` — headers read as data for family affinity only.

# Residual risk / gaps
- I did not run the gates (read-only seat; commands not assigned) — the 88/60/86 numbers cited come from the wave baseline files and my independent tree recount, which agree.
- If the integrator instead chose to keep "63" frozen and treat upstream churn as out-of-scope, that would be a *different* pre-registered decision; nothing in the governing text requires it, and round 32's executed record rejects it ("corrected to what the gates measure").
- Tool installs: none (no tooling change needed; RULES.md channel order untriggered).
