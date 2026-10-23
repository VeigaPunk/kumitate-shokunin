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

## E7 — frozen review checklist for C1 (appended before the entry commit; from ReviewPlan D1/D3 and CtlQuoteFabricated)

ReviewPlan D1: the verdict rule froze who rules, not what fails. Frozen here, before the entry is committed and
before any seat has read it. C1 is `unprovable` (never `unprovable-but-better`) if any item fails; the non-author
reviewer's taste judgment applies only when all hold:

- K1 every decision-table row names a mechanism (M1–M7) and a demo receipt with its do-nothing control, or a source
  locator;
- K2 every demo the entry cites shows the effect and its control does not (receipt lines in `build/Demo*.md`), and a
  falsify re-run of that demo reproduces it (or a named appended erratum corrects the entry);
- K3 every new SOURCES row the entry cites (S062–S074) re-opens with its quote found verbatim by a non-author falsify
  seat, AND the quote sits under the row's stated section (CtlQuoteFabricated: the URL-level procedure does not check
  section locality, so the seat checks it by reading); normalization strips « » and folds apostrophe variants
  before matching (CtlQuoteFabricated false-MISSING modes);
- K4 the entry names the prior-corpus passages it does not restate (E1) and cites the sibling-lane owners instead of
  re-deriving their mechanics (ConnSiblingOverlap);
- K5 at least two rows change a lane practice relative to round-44 practice (not a glossary): the `GIT_*` scrub
  widened to `git rev-parse --local-env-vars`, and `env -i` in front of bwrap instead of `--clearenv` alone.

D3: wave 2 carries one quote re-open seat per cited new row whatever the wave shape. The F1 control receipt
(`build/CtlQuoteFabricated.md`: fabricated, one-word-changed and wrong-locator MISSING; off-topic FOUND by
construction) and its scripts (`probe/reopen-quote.sh.txt`, `probe/normalize.py.txt`) land in a commit before the
entry commit.

## E8 — attempt 2 (appended 2026-10-23 ~05:45Z by the attempt-2 L1 `KumitateR45A2`; nothing above is reworded)

Attempt 1 (`KumitateR45`) died with its orchestrator at 05:25:25Z after landing `cfa99304`, `ca5b0aac`, `a2e5b54c`.
Its uncommitted lane files (45 untracked, 5 modified tracked; snapshot outside the lane under
`/fast/scratch/hyaku/kumitate-r45/a2/`) are untrusted scratch: nothing in them is cited until a fresh attempt-2 seat
or the L1 re-derives it. C1, its verdict rule, F1–F3 and K1–K5 stand unchanged.

- **Shape.** Wave `a2-control` (v1, 50 seats, dispatched 05:34Z): adversarial controls on K1–K5, F1, draft Q30 and Q31
  (do-nothing, glossary, label-keyed, off-topic, same-effect demo, shortcut generators, comment-only guards) plus
  independent re-derivation of every inherited input the entry would cite (17 source rows, 6 demos), the eight R44-4
  owed reviews (verifying attempt-1 findings, not resending their tasks), R43-1/R43-5, R44-2/R44-5/R44-6 and the open
  DRIFT. No seat of this wave judges the entry. Then the L1 commits the control receipts in their own commit, then the
  entry commit (verified material only), then wave `a2-falsify` (v1) judges the committed entry per D3/K1–K5.
- **Control rule.** A K-item that a control meets (do-nothing, glossary or label-keyed entry reads PASS) is amended by an
  appended erratum here before the entry commit; after the entry commit K1–K5 are frozen as they then read.
- **R44-3 runner.** Attempt-1 seat `ExecCounterSandbox` left no report (dead). Its task is not resent to any seat. The
  repair this round is criterion Q31 (source guards plus a required runner selftest), scored against its own
  shortcut controls; the runner itself is planned for the round that next freezes a counter, and no counter runs
  this round.
- **Attempt-1 seat `CritExploratoryPremise`** left no report (dead); not resent.

## E9 — checklist amendments from the attempt-2 control wave (appended before the entry commit; K1–K5 above are not reworded)

Every K-item below was met or found vacuous by a committed control in `.ufo/waves/round-45/a2-control/`; per E8 the
checklist is amended here, before the entry exists in any commit, and is frozen as amended from the entry commit on.
C1 is `unprovable` if any item fails.

- **K0 (new; CtlDoNothingEntry: K1–K3 and F1–F3 vacuous on an empty lane).** The entry has a decision table of at
  least five rows, cites at least five new SOURCES rows, and at least five committed attempt-2 demo receipts.
- **K1′ (CtlLabelKeyedEntry: a label-presence reading passes swapped rows; CtlGlossaryEntry object D passes on "or a
  source locator").** Every decision-table row names one mechanism defined in the entry's own § Mechanisms and one
  committed attempt-2 demo receipt; a source locator alone does not qualify a row. The reviewer opens each receipt and
  confirms it shows the effect the row says it prevents (row-to-effect binding), not only that the label exists.
- **K2′ (CtlDemoSameEffect: a dirty-sandbox control shows the same delta; the attempt-1 M1 receipt printed no control
  counts).** Every cited demo receipt prints the effect's before/after values and the do-nothing control's
  before/after values from a stated clean pre-state, and the control's delta differs from the effect's; a falsify
  re-run reproduces both.
- **K3′ (CtlOffTopicRow; CtlDoNothingEntry defect 1–2).** Covers every new row the entry cites, whatever its id. The
  committed scripts `probe/reopen-quote.sh.txt` and `normalize.py.txt` do not strip « » or fold apostrophes, so a
  script `MISSING` on such a quote is resolved by reading the fetched bytes, and a script `FOUND` never settles
  locality: the reviewer confirms the quote sits under the stated section, the row's teaches does not overstate it,
  and the fetched page's own version marker matches the version the row claims (probe D: a 2.54.0 page cited as
  2.56.0 passes script and section checks).
- **K5′ (CtlGlossaryEntry objects C and D; CtlCheckK5Baseline).** The two practice-change rows are read in the
  decision table's operative `required guards` column only (not notes or prose), each carries a demo receipt under
  K1′, and the change is against round-44 wave practice as committed (three `GIT_*` names on the clone and checkout
  lines; p44d's `--clearenv` with no spawn `env`). Earlier-round passages that already prescribed a wider scrub
  (round-42 `SentinelGateMutants.md:130`, round-36 `ScoutPinDesign.md:63`) or a spawn `env` (`lessons/round-44.md:129`)
  must be named by the entry (K4).
- **Plan line 71 (R44-3 runner with `--clearenv`).** Superseded by E8: no runner lands this round; Q31 prescribes
  `env -i` (or a spawn `env`) as bwrap's immediate parent plus `--clearenv --setenv`.
- **Controls scored against the amended items (L1 reading, to be re-scored by a falsify seat).** do-nothing lane:
  fails K0. Glossary A/B/C: fail K0/K1′/K5′. Glossary D (two pasted rows with source locators): fails K0 and K1′.
  Label-keyed swap: fails K1′ on opening the receipts. Same-effect M1 control: fails K2′.

## E10 — attempt 3 (appended 2026-10-23 ~06:55Z by the attempt-3 L1 `KumitateR45A3`; nothing above is reworded)

Attempt 2 (`KumitateR45A2`) died with the orchestrator (omp SIGSEGV) at 06:19:06Z after landing `d9ad2870`,
`31656bdf`, `1a8312ee` and the entry commit `6b2a4517`. Its falsify wave `a2-falsify` (44 seats, spawned 06:04:59Z in
four chunks) died with it before any seat wrote a report: the lane held only its spec, dispatch payload, registry and
dispatch note, committed now as the record of that wave (`a2-falsify-spec.json`, `a2-falsify-dispatch.json`,
`a2-falsify/`). Those 44 tasks are not resent to any seat in any role.

Attempt-2 leftovers in the lane at 06:42Z (45 untracked files: attempt-1 `build/*` reports and specs,
`open/checklist-pass.txt`, and `a2-control/VerifyCritCensusVsDomain.md`, a report that arrived after `31656bdf`) are
untrusted scratch: copied byte-exact to `/fast/scratch/hyaku/kumitate-r45/a3/untracked-snapshot/` and removed from the
lane; none is cited.

C1, its verdict rule, F1–F3, K1–K5 and the E9 amendments (frozen from the entry commit) stand unchanged. The judged
object stays the entry at `6b2a4517`; after this wave it changes only by appended, named errata.

**Wave `a3-falsify` (v1, 33 seats), every item a new design:** 15 independent-channel re-opens of the cited rows (the
text opened through a second channel — upstream tag, installed man page or package — besides the row's URL), 2
re-judgments of the rejected rows S075/S076, 1 control on that method (`CtlChannelMethod`: planted one-word, locator
and version defects; a method that misses them is not trusted), 6 guard ablations (one per decision-table row: is each
required guard component necessary, with the effect and do-nothing control re-run from a clean pre-state as the
baseline — this baseline is the K2′ falsify re-run), 2 practice audits of the lane's shipped scripts against the table,
1 whole-checklist application (`KSheetFull`), 1 strongest-failure critic, 1 contradiction scan against the lane's other
entries, and history replays of the round-45 repairs (Q32 over rounds 35–45, Q30 over p44/p44b/p44c, Q31 on launchers
outside round 44), plus a version-drift check. Settle deadline 45 minutes after dispatch; stragglers are cancelled and
named.
