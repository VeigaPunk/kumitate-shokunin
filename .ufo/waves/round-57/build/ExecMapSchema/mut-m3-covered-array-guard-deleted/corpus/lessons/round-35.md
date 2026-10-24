# Round 35 — lessons (kumitate)

Round base: lane master `1770305fae20826b39905a8251ddeca6b4957ac4`. Upstream
source: `~/Projects/ufo-fsd-alpha` read only through a private read-only clone
pinned at `31c465f15669f744848bd9f5d56191c5085670f7` (base revision `964f443e`
in the same clone). Wave evidence: `.ufo/waves/round-35/` (baseline, frozen
populations, build and falsify reports).

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| Pre-registered baseline measured on a tree that then moved | `SCORECARD.md` `## Planned` round-35 item 2: «live trees unchanged (S 91/91, R 83/92)»; `.ufo/waves/round-35/baseline/proxy.txt`: `S_MEMBERS_DRIFT … declared=91 computed=88`, `S_SECTIONS_DRIFT … computed=86` at `31c465f1` | Q13 (open-time re-run), not applied to the pre-registration text | Re-measure every pre-registered number at round open against a pinned immutable revision before implementing; the round-36 pre-registration names its own staleness rule. Shown able to fail: `node scripts/proxy-check.mjs --src <clone@31c465f1>` exits 1 against the 91/91 text. |
| Prose states a checklist pass count the gate contradicts | `SCORECARD.md` §Measurement proxies C bullet: «`CHECKLIST: 10/10 pass`»; the round-35 baseline checklist run (wave evidence, baseline directory): `CHECKLIST: 9/13 pass`, `VERDICT: FAIL`, exit 1 | Q3 | Pass counts are quoted with their date and command; correction appended under the C bullet. Shown able to fail: `node scripts/surface-probe.mjs --checklists` exited 1 at open. |
| Checklist verdict follows the operator's moving checkout | Checklist items run gates without `--src`; default resolves to `~/Projects/ufo-fsd-alpha` (`scripts/claims-check.mjs` `resolveSrcDefault`; seat ScoutDefaultSrc) | none | Not fixed this round: pre-registered for round 36 (`SCORECARD.md` `## Planned`, item 2). `UFO_SRC=/nonexistent node scripts/proxy-check.mjs` → `FAIL-CLOSED (SRC_NOT_A_DIR)` exit 2 shows the verdict is environment-bound. |
| Wave scratch tool entered the measured universe | a JavaScript probe saved in the round-35 baseline evidence directory made the A walk read 8 (`A_DRIFT term=A declared=7 computed=8`, seat ScoutMistakeSweep; L1 re-run) | none | Evidence scripts under the wave directory are stored with a .txt suffix (the distinct probe and the mutation script); after the rename the proxy reads A=7. |
| Out-of-lane corpus file landed without a map row | `a5683a9` added `corpus/lessons/round-34-verifier-spotcheck.md`; `C2_TOTAL_DRIFT term=C2_total declared=77 computed=78` at open | Q10 (the round-34 close passed before the file landed) | README row added; C2 79/79 with this lesson's row. Shown able to fail: the open-time proxy line above. |
| Seat writes left the seat's scope | Seat FidCollectOmpNativeHandoffLibEve wrote its report under the fleet root's wave directory; seat ExecS8Writer's first edit hit the live lane note and its restore dropped a trailing blank line (`git diff --stat`: 1 deletion) | wave context (absolute-path rule) | Misroot moved byte-exact into the lane (`cmp` OK) and the fleet copy deleted; the note restored from `master` before integration. |
| Executor patch delivered unrun and dead on arrival | ExecDistinct reported «selftest=104->UNRUN»; applied, the patch deleted a comment terminator (`FAIL-CLOSED (INTERNAL_ERROR)`) and its fixtures named members absent from the fixture tree (3 of 107 failing after the terminator fix) | Q6, enforced at the L1 | L1 re-ran the selftest after every patch; fixed to `PROXY_SELFTEST: 107/107 pass`. A seat's green, or a seat's "not run", is never admission evidence. |
| Anchors wrong at their own stated revision | Fidelity seats: `prepare-ephemeral-l1.mjs` 12 anchors fail identically at `964f443e`; `ufo-drills.mjs` cites lines past the base EOF; the fleet-selfheal-verify note cites line 2092 of a 1103-line file | none — the claims gate checks that an anchor line exists, not that its symbol is there | S8 note re-anchored at `31c465f1` (209 anchors, 41 false clauses removed; seat ExecS8Fidelity). S1–S7 topic notes keep 624 non-ok anchors, recorded in `LOG.md` round 35 and `SCORECARD.md` `## Limits`. |

Sweep commands for this table (2026-10-20): the baseline gate runs in
`.ufo/waves/round-35/baseline/`; `git -C . diff --stat` after wave 1;
`git -C /home/vgpnk/Projects/shokunin status --porcelain` (misroot sweep);
`node scripts/proxy-check.mjs --selftest` after each patch.

## Gate

Admission bar: `corpus/QUALITY.md` Q1–Q15. Every command below was run by the
L1 in the lane worktree on 2026-10-20 against the clone pinned at `31c465f1`.

**Claims.**

- C1 operability — distinct S/R derivation. Before, on master `1770305`:
  `MUTATION_KILLS 0/2` (S 86 → 86, R 83 → 83): the old terms summed section
  occurrences, so one duplicated section hid one dropped member. After:
  `MUTATION_KILLS 2/2` (S 88 → 87, R 83 → 82); `PROXY_SELFTEST: 109/109 pass`
  (107 at first integration; the falsify wave's mutation seat left a row-scoped
  and a heading-keyed mutant alive, and two added cases kill them: 107/109 each).
  Mutation outcomes use S023's definitions: a mutant is killed when the check
  fails while it is active.
- C2 coverage:script-layer — re-census at `31c465f1`, S 86/88 ⇒ 9 → 88/88 ⇒ 10;
  S8 63 → 60 members; rests on S021.
- C3 coverage:kimi-layer — pre-registered K1 3 → 4 (the root MCP config file, shape-only);
  census DRIFT → CLEAN, K 50/50 → 51/51; rests on S005 and S022.

**Riders (not claimed).** R11 `round.rs` re-anchored (claims gate dead anchor
cleared); README map rows for the round-34 verifier note and this lesson;
round-32 Move-log row + LOG bullet so `round-gate --round 32` parses (DRIFT 2
errors → CLEAN); the Q11 retro-admission entry for `16a5441` in `LOG.md`.

**Source rows opened this round** (contract rule 1; full scribe reports
`.ufo/waves/round-35/build/ScribeSrc*.md`):

- S021 — `git diff --name-status 964f443e 31c465f1 -- scripts` / `git log --oneline 964f443e..31c465f1` (own-work, private clone) — 2026-10-20 — log line 1: «routing: grammar admits org-prefixed model ids (provider/org/model; per-component charset, no ./..) in parseRoute + build.rs»
- S022 — https://moonshotai.github.io/kimi-code/en/reference/slash-commands.html — 2026-10-20 — § Built-in skill commands, `/mcp-config` row: «Configure MCP servers and handle MCP OAuth login.»
- S023 — https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/ — 2026-10-20 — § Mutant states, Killed: «When at least one test failed while this mutant was active, the mutant is killed.»
- S024 — https://github.com/can1357/oh-my-pi/blob/main/docs/mcp-config.md — 2026-10-20 — § Preferred config locations: "The native provider also reads .omp/.mcp.json and ~/.omp/agent/.mcp.json for compatibility, but OMP writes to the primary mcp.json paths above."
- S025 — https://www.anthropic.com/research/building-effective-agents (canonical; the /engineering/ path 308-redirects here) — 2026-10-20 — § What are agents?: «Workflows are systems where LLMs and tools are orchestrated through predefined code paths.»
- S026 — https://github.com/modelcontextprotocol/ext-tasks — 2026-10-20 — README § Why Tasks?: «The Tasks extension lets a receiver return a durable task handle so the requester can follow progress and retrieve the result later.»
- S027 — https://github.com/git/git/blob/v2.55.0/Documentation/RelNotes/2.55.0.adoc — 2026-10-20 — § UI, Workflows & Features, lines 38-39: «Document the fact that .git/info/exclude is shared across worktrees linked to the same repository.»
- S028 — https://docs.langchain.com/oss/python/langgraph/checkpointers — 2026-10-20 — § Durability modes, `exit` bullet: «persists changes only when graph execution exits — successfully, with an error, or due to a human-in-the-loop interrupt»

**Rows touched old→new.** S005 used-by: `corpus/knowledge/kimi-mcp-plane.md` →
`corpus/knowledge/kimi-mcp-plane.md, corpus/lessons/round-35.md` (this lesson
cites it for C3). S020 (rejected) was re-checked against its flip condition —
the persistence overview still has no durability text — so its status stays
`rejected`. Five `## Leads` bullets were removed because their sources are now
rows S024–S028, and two follow-on leads were added (leads are not rows).
Pre-landing amendments to this round's own rows, from the falsify wave's
re-opens (no landed row changed): S021 teaches "five" → "six" non-member files;
S021/S022 used-by gained this lesson; S022 anchor records its Last-Modified
header; S024 teaches narrowed to server-definition files (the dashboard writes
an enable flag into legacy files); S025 source moved to the canonical URL; S026
anchor pins main `b3d28ace`; S028 anchor records the page's dateModified.

**Held / rejected this round.**

- Re-anchoring the S1–S7 topic notes — held: 624 non-ok anchors across 11 notes
  are a multi-round job, not a C2 rider; the C2 claim is the gate-measured
  88/88 plus the S8 note. The debt is counted and now marked in situ: each of
  the 11 notes opens with a round-35 fidelity notice giving its count.
- Fixing `scripts/surface-probe.mjs` digest order — held to round 36 (a second
  operability move would merge with C1 under the one-claim-per-axis rule).
- The upstream `surface` verb missing from the sighting manifest — routed to the
  operator in the round report; never patched here (PROVINCE adjacent band).

## Falsify wave (75 seats, 2026-10-20)

Every seat attacked one named target; reports in the lane's round-35 falsify
directory. Verdict lines: 48 `holds` (36 with no defect), 26 `partial`, 1
`refuted` (SCORECARD round-35 edits: a round-32 baseline mislabel and an
overstated K1 "kind file" — both corrected). No claim was refuted: C1 (critic,
two mutation re-runs, separability trees), C2 (critic, claims/proxy re-runs, 38
S8 section reviews, frozen-population rebuild) and C3 (critic, sentinel,
census re-run with fd-decorated strace, two mutation seats) held. Mutation
seats: proxy layer terms 2/5 killed before the two added cases (one survivor is
an equivalent guard deletion), census member 5/6 (the surviving re-added
exemption is redundant while the member is declared), proxy K rule 4/4, S8 note
gates 3/5 (anchor-to-wrong-line and symbol swap survive while another anchor
in the section is live — the fidelity blind spot `## Limits` records). The
partial verdicts were prose and provenance defects; the L1 applied them before
landing (S8 note via seat ExecS8Fix; SOURCES pre-landing amendments; README S8
row; stale present-tense lines; LOG/lesson wording).
