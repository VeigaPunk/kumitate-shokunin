# Round 42 — a mutation battery over the lane's own gates; the Kimi lock directory becomes a declared member

Source: S039 (PIT official docs, opened this round), S040 (Petrović et al., arXiv 2102.11378v2,
opened this round), S041 (Kimi Code 2.3.0 session-lock service at its release tag, opened this
round), S042 (Kimi Code docs, data locations, opened this round), S034 (Stryker mutant states,
re-read for the kill vocabulary), the round-41 non-author closure
(`corpus/lessons/round-41-verifier-spotcheck.md`, routed defects R41-1 to R41-7) and the pinned
upstream revision 31c465f15669f744848bd9f5d56191c5085670f7. Round open: lane
dfabe92bcec021f5beec457fb50cec484e047e35. Plan and frozen counters: `.ufo/waves/round-42/plan.md`
(commit b237e3f0; amendments A1–A4 before any counted run, commit a0a07bae).

## Claims

- **C1 operability (claim type: capability acquisition `gate-mutants`).** `scripts/gate-mutants.mjs`
  applies a frozen manifest of single-literal mutants to a temp copy of the measured `scripts/`
  and runs that copy's `--selftest`: the 16 round-41 cite-check verdict mutants and the 25
  round-41 wave-census mutants (41 frozen ids; `M19-selftest-exit-const` and `V387-exit-const` are
  the same mutation under two ids, so 40 distinct mutations), plus two round-42 extras for the
  cite-check guard (R41-3 F2). A mutant is killed only when at least one `FAIL ` case line is
  printed (S039: "If your tests fail then the mutation is killed, if your tests pass then the
  mutation lived."; S034). A run that passes with fewer cases than its control is `drift`, an
  evaluated non-kill. The verdict and its hermetic suite are checklist items 18–19, so the frozen
  operability proxy reads A 9 → 10, C 17 → 19, `f_O` 26/29 → 29/32, integer 8 → 9. Shown able to
  fail on real code: at the round-open bytes the two guard extras read `drift` and
  `--rev dfabe92… --target cite-check` exits 1. S040 is the at-scale precedent for running
  mutants against an existing suite as a standing review signal, with surviving mutants as the
  findings.
- **C2 coverage:kimi-layer.** The root child `~/.kimi-code/locks` (created by Kimi Code 2.3.0,
  S041; purpose stated by S042) was ungoverned: the census read `UNLISTED locks`,
  `ROOT_ENUM … declared=26 … strays=1`, `KIMI_CENSUS: DRIFT`, exit 1. It is now a K3 member
  (presence-only directory, stat-only, 0700 mode floor) in both hand-kept member lists
  (`scripts/kimi-census.mjs` and `scripts/proxy-check.mjs` `K_MEMBER_RULES`), bound by the section
  ``## `~/.kimi-code/locks/` …`` in `corpus/knowledge/kimi-session-state.md`: `declared=27`,
  `strays=0`, `KIMI_CENSUS: CLEAN`, exit 0; `K_members`/`K_sections` 52/52 → 53/53 and the
  integer stays 10 (the ratio cannot show this move; the root enumeration does — plan A2).

## Round shape

Two v1 waves. Wave 1 (build and first falsifiers) `kumitate-r42-build`, 37 seats. Wave 2
(falsify) attacks the measured commit; its counts are in the report's `## Round shape`.

## Gate — admits and rejects

- **Admit S039** (PIT official docs, tier A, `new → mined`, used-by this lesson). Opened
  2026-10-22 by plain HTTPS (seat ScoutMutationSource; home and FAQ HTTP 200, Last-Modified
  2026-06-03). Quote, home page § What is mutation testing?: "If your tests fail then the
  mutation is killed, if your tests pass then the mutation lived." (17 words). Criterion met:
  Q19's kill vocabulary (a crash is not a kill) agrees; grounds C1's kill rule.
- **Admit S040** (arXiv 2102.11378v2, tier A as reported by its builders, `new → mined`, used-by
  this lesson). Opened 2026-10-22T19:56:55Z (seat ScribeSourcesRows; PDF digest in its report).
  Quote, §4 opening paragraph, p. 6: "First, only mutants that survive the tests can be shown to
  developers, whereas those that are killed just use computational resources." (21 words). No
  peer-reviewed venue is claimed (the arXiv record carries no journal reference).
- **Admit S041** (Kimi Code 2.3.0 sessionLockService.ts at the release tag
  `@moonshot-ai/kimi-code@2.3.0`, the S041 URL pins the revision; tier A, `new → mined`, used-by
  `corpus/knowledge/kimi-session-state.md` and this lesson). Opened 2026-10-22 (seat
  ScoutKimiLocksSource; file digest in its report). Quote, file line 55:
  "this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions');" (5 tokens). The installed binary
  carries the same literal; the file is absent at the 2.2.0 tag.
- **Admit S042** (Kimi Code docs, data locations, tier A for purpose only, `new → mined`, used-by
  the K3 note). Opened 2026-10-22 (seats ScoutKimiLocksSource, ScoutRejectCandidates). Quote,
  § Directory layout, `locks/sessions/` node (the page attaches the comment to the `sessions/`
  child of `locks/`; falsify seat ReopenS042): "Cross-process occupancy locks while a client
  writes a session" (9 words). Residual: the page names no product version.
- **Reject S043** (arika.dev blog "Mutation testing in CI", community, tier C). Opened 2026-10-22.
  Quote: "A mutation score of 80% is a reasonable starting threshold for well-tested business
  logic." (14 words). Missed Q3 (a number without a measurement) and the wrong instrument for a
  per-mutant manifest. Flip: a measured threshold at a named revision, or the tool maintainer's
  statement. Erratum (falsify seat ReviewSourcesR42): the S043 anchor `§ thresholds` names no
  section of the page; the quote sits at the end of "How Mutation Testing Works". The row is
  append-only, so the anchor stays as written and this line corrects it.
- **Reject S044** (kimi-cli.com data-locations mirror, community, tier C). Opened 2026-10-22.
  Quote: "Kimi Code CLI stores all data in the `~/.kimi/` directory under the user's home
  directory." (15 words; corrected from a "Kimi CLI …" rendering by falsify seats
  ReviewSourcesR42 and ReopenRejects). Missed: it copies the archived legacy product's docs (no `locks/` node) plus
  an injected line; not the product this host runs. Missed Q8 (the source must be the product
  and version the host runs). Flip: the mirror names its maintainer and tracks the current
  official Kimi Code docs at a stated version.
- **Reject S045** (Kimi Code sessionLockService.ts on `main`, the revision in its URL). Opened
  2026-10-22 (seat ScribeKimiLocksEntry used it; seat ScoutKimiLocksSource rejected it). Quote,
  file line 23: "export const SESSION_LOCK_ENV = 'KIMI_CODE_SESSION_LOCK';" (re-opened by falsify
  seat ReviewSourcesR42). Missed: `main` adds a takeover path and that
  `KIMI_CODE_SESSION_LOCK` switch, with 0 hits in the installed 2.3.0 binary, so it is not the
  running code. Flip: the host upgrades to a release containing that revision.
- **Reject (no row) six further candidates** (seat ScoutRejectCandidates, all opened 2026-10-22,
  each with quote, reason and flip in `.ufo/waves/round-42/build/ScoutRejectCandidates.md`):
  GeeksforGeeks mutation-testing page (anonymous tertiary, output-divergence kill test), a dev.to
  draft post (metadata `draft body`), the archived official Kimi CLI docs (legacy product), Stack
  Overflow 185451 (generic shell answer, other domain), Kimi Code issues #2736 and #1924 (a
  proposal; an absence claim superseded by the 2.3.0 source). Unopened: a Medium article (HTTP
  403) and DeepWiki (HTTP 429) — not rows, not evidence.
- **Reject the Stryker introduction page** (seat ScoutMutationSource; thin landing page with no
  outcome or threshold claim; missed the `teaches` requirement of one grounded learner benefit).
  Flip: the page gains outcome or threshold semantics with a revision anchor.
- **Re-open S036, S037, S013, S024, S026** (seat ScoutSourcesRecheck): all five quotes still
  verbatim at their recorded revisions; no status or recheck change (no `knowledge/` entry cites
  them yet). W04 (S034 and S023 share a URL across scopes) stays a logged registry warning: the
  contract forbids editing `scope`, and rejecting S034 would drop Q19's grounding.

Registry changes logged old → new: S039–S042 added as `mined`; S043–S045 added as `rejected`; no
pre-round row's `status`, `recheck` or `used-by` changed. After the falsify wave, S042 `used-by`
`corpus/knowledge/kimi-session-state.md` → `corpus/knowledge/kimi-session-state.md,
corpus/lessons/round-42.md` (this lesson cites it; seat ReviewSourcesR42 D4).

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| receipt label names a revision whose bytes are not the measured bytes | the second header line of `.ufo/waves/round-41/final/a2-census-repair-mutants.txt` says "over master fae386aa" with a wave-census digest that is the blob landed in fb7046ca; `git show fae386aa:scripts/wave-census.mjs \| sha256sum` gives a different digest (round-41 closure R41-7; build seat ScribeLessonDraft re-derived both) | none (no criterion read receipt headers) | `gate-mutants` prints `GATE_MUTANTS_HEADER rev=<rev\|working-copy> <target>=<sha256 of the mutated bytes> …`, and its selftest case `mutated-byte-header-digest` fails when the header digest is computed from other bytes; QUALITY Q24 makes every cited receipt carry a digest the label must equal |
| a falsify wave dispatched although its build wave never spawned, not named as a deviation | round-41 report `## Round shape` names the third wave but not the build-to-falsify order; closure line "falsify wave dispatched although the build wave never dispatched (undisclosed in the report)" | none | QUALITY Q23: one `WAVE … spawned=… gate=…` line per dispatch file and one bullet per deviation, including a wave dispatched before its predecessor returned; this round's report carries them |
| a kill rule stated narrower than the frozen set it counts | plan b237e3f0 C1 "killed = exit non-zero with a `VERDICT: FAIL` line"; six (seven ids) of the 41 frozen mutants read survived under it (seats CritC1Honesty, ScribeSkillRows, SimplifyProbeReuse, measured) | the build wave's critics, before any counted run | plan amendment A1: killed = at least one `FAIL ` case line (S039, S034); the gate's selftest fixtures cover killed, survived, drift, crash, timeout and nomatch |
| an unbounded mutant run on a shared host | seat RevengerGuardIntent's runner for the unpatched guard mutant grew to ~500 processes and ~25 GB RSS (seat SentinelGateMutants measured; host entered swap) because its kill was a load-sensitive poll, not an immediate group kill | the wave context's 60 s group-kill rule (not enforced by the seat's harness) | the L1 killed the group; `gate-mutants` spawns each mutant detached under `prlimit`, with a 16-process and 512 MB group cap and SIGKILL to the group on timeout; the cite-check guard now stops at depth two, so the recursing mutants are killed, not run |

## Open limits

- `gate-mutants` covers two of the ten gates (cite-check, wave-census); anchor-truth's 26 round-40
  mutants are not in the manifest. Literal mutants become `nomatch` when their line is
  refactored; the manifest must be re-frozen with the code.
- The case floors (cite-check 75, wave-census 31) make `--rev` on a revision with a smaller
  suite exit 2 (the full run at dfabe92 refuses at the wave-census control, 26 < 31); only
  `--target cite-check` measures the open bytes.
- The checklist gains a ~21 s item (three working-copy runs 21.1/21.1/20.8 s at `--jobs 4`).
- `locks/` is required: if the host removes it the census reads `MEMBER_MISSING` (named host
  drift). The bytes of a live `.lock` file were not observed.
- R41-6 carried: the 12 attempt-1 wave-census findings (M2, M5, M6, D1, D3, D4, L1, L2, L3, L5, L6,
  L7) and the 5 report-presence gaps (M03, M06, M10, M16, M17) are still open at this round's
  revision (seat ScoutCensusFindings, each re-run); the sentinel findings (realpath confinement,
  non-regular reads, size caps, trailer anchoring) are fixed with five new cases (WC27–WC31,
  26 → 31). R40-4: anchor-truth `--open` now refuses pins over 4 MiB and more than 64 review
  registries (AT47–AT48, 42 → 44 cases). R40-2 re-measured (seat ExecHonestReMeasure, 17
  recipes): checklist form accepts 8/17 honest edits, `--open dfabe92…` accepts 4/17.
- R41-2: the four unpinned gates are pinned in a separate lane-owned `kumitate-gate-pins-v1` block
  that the proxy verifies (`GATE_PIN_DRIFT`), leaving the parent-frozen 23-key v1 stanza unchanged;
  whether a lane-owned second block is acceptable under the frozen contract is for the operator.

## Falsify wave (35 seats against c9a084bf) — dispositions

- Reproduced: C1 terms `{"A":10,"C":19,"operability":9}` and `--strict` exit 0 (ReRunC1Terms);
  C2 census `CLEAN` exit 0, K 53/53, no host drift since 19:52Z (ReRunC2Census); checklist 19/19
  from a clean clone with the fleet layout threaded (ReRunChecklist); S039–S042 re-opened, quotes
  verbatim (ReopenS039–S042); rejects S043–S045 upheld (ReopenRejects); round-42 build census
  `reports=37/37` (ScoutWaveCensusR42); no kumitate misroot at the fleet root (ScoutMisroot).
- Fixed after the measured commit: wave-census refuses a round, dispatch or report directory that
  is not its canonical path (symbolic-link substitution, SentinelCensusTip B1; patch applied,
  selftest 31/31, no new case — a red-before case is still owed); lesson and SOURCES record
  corrections (S042 node, S044 quote, S045 quote, S043 anchor erratum, S042 used-by); knowledge
  `evict(` claim scoped to the lock region and `KIMI_CODE_HOME` attribution; K3 registry row
  lists `locks/`; checklist item 8 runs `proxy-check --strict`; QUALITY Q22–Q24 commands run from
  the lane root; SKILL gate-mutants row precision (`--repo`, overflow, drift exit classes,
  `--target` is diagnostic).
- Open, named: gate-mutants selftest does not kill four isolation mutants (process cap, RSS cap,
  `--end-of-options`, leading-dash guard; MutGateIsolation 4/8); the `kumitate-gate-pins-v1`
  block reads MATCH in default mode when missing or renamed and matches its head by prefix
  (CritGatePinsBlock; R41-2 pending an operator ruling); `locks/` mode floor accepts 0777 and
  nothing under `locks/` is gated (CritC2Claim); an unsourced stub section would pass every C2
  counter (S041 binding is a manual grep); wave-census prints untrusted names raw (B2) and its
  trailer anchoring accepts two paths on one line (B3, the open M03).
- **Counter amended after data (mistake, falsify seat CritPlanAmendments).** A1 (a0a07bae,
  17:01:18 -03) widened the plan's kill rule after build seats had already scored the frozen ids
  under both rules (CritC1Honesty at 17:00:02: `plan_rule_survived=6`); the gate then implemented
  a third rule (killed = at least one `FAIL ` line), recommended after A1. Scored under the
  original frozen sentence, the measured receipt reads 34/41 killed (seven ids exit 0 or print
  `VERDICT: PASS`). Class: frozen-counter drift; captured-by: the round prompt's frozen-target
  rule (not applied by the L1); fix: a plan amendment is admissible only with a timestamp
  showing no seat or L1 run of the counter before it — this round's C1 battery result is reported
  under both rules and left to the closure. C1's proxy-term after-state (A 10, C 19,
  operability 9) does not depend on the kill rule.
- **Misroot (mistake).** Falsify seat ScoutMisroot, whose item was the fleet-root misroot sweep,
  wrote its own report at the fleet root (`/home/vgpnk/Projects/shokunin/.ufo/waves/round-42/falsify/ScoutMisroot.md`)
  instead of the lane. Found by the L1's sweep; copied byte-exact into the lane (`cmp` equal),
  fleet copy deleted. Captured-by: the wave context's `Report:` rule (not followed); fix: the L1
  sweep before the report, as here.
