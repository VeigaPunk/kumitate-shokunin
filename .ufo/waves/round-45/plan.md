# Round 45 plan — repair-first, one exploratory frontier claim

Lane base `3632602c6f68945ce973043f6d47bf3990afff13` (round-44 closure commit). Dispatched 2026-10-23T04:45Z;
freeze 06:45Z, hard stop 07:45Z. Written and committed by the L1 before any seat of this round ran.
The L1 holds the canonical planner seat; the bounded planning data-walk rides scout `ScoutContainmentRules`.

## Shape and why (anti-loop)

Rounds 42–44 were rejected on single operability counters that a skip-work or label-keyed program met
(gate-mutants r42/r43, omp-census r44). This round claims **no counter**: it is repair-first (every defect the
round-44 closure routed, R44-1..R44-6 plus the open R43-1 and R43-5) plus **one exploratory claim** on a different
surface and axis. Nothing here re-claims `omp-census` or `gate-mutants`. If a reader expects a counted claim: there
is none, so no counter exists for a control to meet; the supporting checks below carry their own controls.

Stagnation nudge (SCORECARD `## Saturation`, round 44 note): every live axis is at or above the line 9 and no
capability row has verified since `wave-census` (round 41), so the lowest-axis obligation is waived and the round
should be a frontier move. C1 is that frontier move.

## C1 — exploratory, axis coverage (surface: PROVINCE frontier "Isolation substrates for parallel agents")

**Surface changed.** `PROVINCE.md` § Frontier lists "Isolation substrates for parallel agents (git worktrees, harness
isolation backends) — `corpus/SOURCES.md` rows, queued". The corpus has no entry on that ground: its three rows
(S013 Kimi Tower, S014 git-worktree, S027 git 2.55.0 release notes) are `queued`, never mined, and the only isolation
text is the task-tool paragraph in `knowledge/omp-task-contract.md` § Isolation and merge (docs on `main`). The
round lands one new entry, `corpus/knowledge/agent-isolation-substrates.md`, sourced from rows opened this round,
and appends a PROVINCE frontier line naming it. The command that would show the surface unmoved:
`git show <base>:corpus/knowledge/agent-isolation-substrates.md` (absent at base) and
`grep -c 'agent-isolation-substrates' corpus/README.md PROVINCE.md` (0 at base).

**What it improves, and why the prior state lacked it.** Every wave context of this lane carries containment rules
— sandbox clones with `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` unset, no git or jj writes in the jj-colocated lane,
absolute paths because seat tools start at the fleet root, `systemd-run` memory and task caps, a bubblewrap sandbox
for counters. The corpus states none of the mechanisms those rules guard against, so the lane applied them without
knowing which failure each one prevents. Round 44 shows the cost: its counter's bubblewrap PID 1 carried the
launcher's environment and its 256 MB V8 cap did not bound native memory (SentinelSandboxEscape,
SentinelProcLeak, both HIGH, routed R44-3). The entry gives each containment rule its mechanism from a primary source
opened this round, a sandbox demonstration with a do-nothing control, and a decision table: seat write pattern →
substrate → required guards → the rule's source and demo. This is a technique gain (rules derived from mechanism
instead of carried as fiat), not a countable term.

**Verdict rule (frozen here).** No counting command. C1 verifies only as `unprovable-but-better` with a named
non-author reviewer on record, reasons included — requested of the hyaku closure; a dispatched subagent of this round
does not count. Without that judgment C1 lands `unprovable`, and the report says so. The SCORECARD row carries the
verdict and reviewer pointer, not a number. No axis integer moves.

**Judged object.** The entry at its entry commit (named in the report), its new SOURCES rows and the demo receipts it
cites. After the falsify wave starts, the entry changes only by appended, named errata; nothing is deleted or
reworded after any seat judged it.

**Supporting checks (failure conditions, not a counter).**
- F1 quotes: every new SOURCES row's ≤25-word quote is re-found verbatim in its re-opened source by a non-author
  falsify seat. Before the entry commit, control seat `CtlQuoteFabricated` runs the re-open procedure on a fabricated
  quote, a one-word-changed quote, an off-topic real quote and a wrong locator; its receipt is committed before the
  entry. A procedure that passes the fabricated or one-word-changed control is replaced before the entry lands. An
  off-topic quote passes a verbatim check by construction: topic fit is checked by the reviewer reading the row's
  `teaches` against the quote, and the receipt says so.
- F2 demos: every mechanism demo runs its do-nothing control in the same sandbox; a demo whose control shows the same
  effect is not cited.
- F3 decisions: a decision-table row without a mechanism, a source id and a demo or source locator is cut before the
  entry commit (no-decision glossary rows are not knowledge).
- A falsify seat that finds a quote not verbatim, a demo that does not reproduce, or a row without a decision is
  reported in `## Gate` and fixed by appended errata or a rejected row; the claim is reported with the defect, never
  re-scaled.

## Routed repairs (before any new claim; each lands a fix or a recorded reason)

| id | defect (closure `corpus/lessons/round-44-verifier-spotcheck.md`) | planned disposition |
|---|---|---|
| R44-1 | p44d CLEAN cases are few and enumerable; a catalog meets it | QUALITY criterion with a command that fails on p44d (CLEAN shapes repeat across seeds) and passes a fresh-variation generator; seat ExecCatalogCheck |
| R44-2 | "still no census scored" / "ZERO frozen runs" overbroad; Q29 receipts share the counter's commit | appended errata in `corpus/lessons/round-44.md`; Q29 gains an ordering field: a control receipt lands in its own commit, after the counter's freeze commit (it scores frozen bytes) and before the measured receipt, never in the counter's commit |
| R44-3 | counter sandbox: bwrap environ leak; V8 cap not native; budget; work dir survives SIGTERM | a lane sandbox runner with `--clearenv`, a cgroup memory cap, a total budget that still prints a verdict and signal cleanup, with a selftest; seat ExecCounterSandbox; mechanisms demonstrated by DemoBwrapEnv and DemoNativeMemCap |
| R44-4 | eight reviews owed (cancelled at r44 wrap-up) | eight fresh wave-1 seats on the tip (new names; cancelled ≠ dead, no task resent verbatim) |
| R44-5 | proxy `A` counts round probes | definition recorded in SCORECARD `### operability` (A counts every runnable file, round probes included; Q26 already rules A non-evidence); no code change, integer terminal |
| R44-6 | six record minors | each fixed in place where the file is not append-only, else an appended erratum; seat ScribeR44Errata drafts, L1 applies |
| R43-1, R43-5 | gate-mutants counter gameable; MutCiteWitness 4/4 survivors; shipped-tip ERROR | not re-claimed (anti-loop); seat ExecR43GateMutantsDiag diagnoses the ERROR and re-checks the four survivors at the tip; disposition recorded |
| open DRIFT | `proxy-check --strict` at round open: `C2_TOTAL_DRIFT declared=99 computed=100` (the round-44 spot-check file has no README row; same class as round 44's open) | README row added; mined as this round's mistake (recurring) |

## Frontier step

Census at open: `.ufo/waves/round-45/open/census-before-3632602c.txt` (exit 0, W04). New rows only after opening;
the sourced claim is C1. Mistake mined into `corpus/lessons/round-45.md` `## Mistakes`.

## Waves

Default shape, two v1 waves (policy band 32–64). Wave 1 `build` (40 seats): 12 source scribes, 6 sandbox demos with
controls, 3 scouts (incl. the planning data-walk), 1 connector, 3 critics (incl. the quote-control seat), the R44-4
owed reviews (8), 3 repair executors, 2 repair scribes, 1 mistake sweep, 1 plan reviewer. Wave 2 `falsify` only if
wave 1 yields ≥32 distinct attack items, else one residual call of ≤8 reviewer/critic seats. Settle deadline 40 min
after each dispatch; stragglers are cancelled and named.

## Errata and dispositions after wave-1 critique (appended before the entry exists; nothing above is reworded)

Written 2026-10-23 ~05:20Z from `build/CritRoundShape.md` (11 objections). No data run judges C1; the entry is not
yet drafted, so nothing here changes a judged object.

- **E1 (objection 3, accepted).** The sentence "The corpus states none of the mechanisms those rules guard against" is
  overbroad. The corpus states some: OMP isolation backends, PAL fallback and merge modes
  (`knowledge/omp-task-contract.md:90-102`, S001, docs on `main`); the ambient `GIT_DIR` redirect and the
  allowlisted-env scrub (`knowledge/pinned-evidence.md:98-101`); the round-44 bwrap PID-1 environ leak
  (`lessons/round-44.md:129,138`). Read it as: the corpus states no primary-sourced mechanism for the jj-colocated
  lane, the git `GIT_*` precedence over `-C`, cgroup versus heap memory bounds, or bwrap environment handling, and has
  no rule-to-mechanism decision table. The entry cites the existing passages instead of restating them.
- **E2 (objection 1, rejected).** "Freeze a second counted claim on the R44-1 detector classifying p44d,
  CtlPostDataA's three programs, CtlLabelKeyedA/B and CritV3LabelB/Boundary as memorisable." Rejected: those six are
  census programs (controls), not case generators, so a CLEAN-case detector has nothing of theirs to classify; the only
  generator in the set is p44d. The detector seat (ExecCatalogCheck) was dispatched before this objection with p44d as
  its input; freezing a counted claim around a detector already running on its data is the post-data shape round 44
  was rejected for. The round stays one exploratory claim plus repairs, as planned.
- **E3 (objections 2, 4, 8, 9, 10, accepted as round-close duties).** The proxy stanza `C2`/`C2_total` is re-declared
  to the measured values at close; the entry carries the `source:`/`verified-at:`/`recheck:` header and its rows'
  `used-by` names it; the after-census and the old→new row log land in the lesson; `PROVINCE.md:21` is amended in
  place (as `:19` was), not duplicated; `## Planned` gets a round-46 block. Axis naming: C1 changes the PROVINCE
  frontier band, which no live coverage successor term counts (script, runtime and kimi layers only); it is named
  "coverage — frontier band (retired aggregate, no live term)".
- **E4 (objection 6, named).** R44-2's ordering: the closure says control receipts go "in a commit earlier than the
  counter they score, not in the same one". A receipt that scores frozen counter bytes cannot precede the counter's
  freeze commit, so this round reads it as: own commit, after the freeze commit, before the measured receipt. The
  divergence is recorded, not hidden.
- **E5 (objection 7, accepted).** The capabilities table carries `gate-mutants` (round 42) and `omp-census`
  (round 44), both entered by rounds that were not admitted. A round-45 note marks both rows unverified; rows are not
  deleted (history).
- **E6 (objection 11).** The sandbox runner's `--budget` is enforced by an outer `timeout` that still prints a verdict
  line; ExecCounterSandbox's item carries it.
