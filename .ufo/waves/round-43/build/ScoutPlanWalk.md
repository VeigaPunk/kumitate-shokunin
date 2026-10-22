RESULT ScoutPlanWalk verdict=gaps gaps=9

# ScoutPlanWalk — planning data walk (bounded; the L1 holds the planner seat)

Revision read: plan `.ufo/waves/round-43/plan.md` (102 lines) at lane tip
`e5ffcbe7f155b89cb1870f9da7b0d671d092948b` (plan commit `0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82`);
closure `corpus/lessons/round-42-verifier-spotcheck.md`; prompt
`/home/vgpnk/Projects/shokunin/.ufo/prompts/kumitate-round-43.md` (358 lines); wave-1 spec
`.ufo/waves/round-43/build-spec.json` (34 items) and dispatch `build-dispatch.json`; open receipts
`.ufo/waves/round-43/open/receipts.txt` and `open/c1-control-base.txt`.

Checks run (read-only, bounded): `node scripts/proxy-check.mjs --src
/fast/scratch/hyaku/kumitate-pin/src --strict` on a scratch clone at `e5ffcbe7` → `PROXY: MATCH
(A=10 C=19 operability=9; C1=19/19 C2=95/95 … K=53/53 … pins=6 match; src-rev=31c465f15669)`,
exit=0, under `systemd-run --user --scope -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 300`.
No lane or fleet write except this file. Tool installs: none.

Verdict `gaps`: 9 (G1–G9 below). No gap blocks the C1 after-measurement from being taken; G1, G5, G7
and G9 are the ones that would otherwise leave a required artifact unowned.

## A. Every plan line, its action, its closing evidence

| plan lines | content | action | evidence that closes it | state |
|---|---|---|---|---|
| 1 | header: counter, kill rule, inputs frozen at this commit | freeze by commit | `sha256sum` of `git show 0f4108bf:scripts/gate-mutants.mjs` = `e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a` (control receipt lines 3–4) | closed |
| 3–6 | open state, origin pin, open receipts | record open | `open/receipts.txt`: sources-census exit 0, `rev-parse HEAD` `31c465f1…`, proxy DRIFT (3 errors) exit 1, three sha256 values | **G3** (the quoted `jj-lane.sh state` line is not in the receipt) |
| 7–8 | repair-first, one claim | report names the closure and 1 claim | closure title + REPORT Work performed | open (report-time) |
| 10–11 | lowest non-retired axis = operability 9, coverage 10 | justify axis choice | `git show 2a7f37d2:SCORECARD.md` `## Axes`; proxy at `e5ffcbe7` reads `operability=9 … coverage=10` | derivable, no pasted receipt (N6) |
| 13–27 | K43 (a)–(d), control re-run, no amendment | code implements it | `0f4108bf:scripts/gate-mutants.mjs:758-761` (CLEAN/SURVIVED/ERROR summary), `:37,44,111` (temp parent); falsified by CritK43Rule, MutK43Counter, MutK43Independent, RevengerKillRuleHistory | open (wave 1) |
| 29–39 | frozen counter block | run extracted copy | command verbatim in `open/c1-control-base.txt:3-6`, sha256 as line 1 row | closed |
| 41–46 | before = round-open bytes | do-nothing control | `open/c1-control-base.txt`: `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 drift=0 targets=2 …)` exit=1; the seven survivor ids match the plan text exactly | closed |
| 47–49 | after = `CLEAN … frozen=41/41` exit 0 at the measured commit | integrate both witnesses, run counter | line format verified reachable at code `:758-759`; the run itself is L1 work after the two patches land | **G7** (no item owns the integrated run) |
| 50–53 | claim kill rules (not CLEAN, no nomatch, floors 75/31) | score misses | ExecJunkControls (J1–J3 must read ERROR exit 2), MutK43Counter/MutWitnessScan, wave-2 critics; floors visible in control receipt `cases=75/75 floor=75`, `cases=31/31 floor=31` | open (wave 1) |
| 54–58 | junk controls J1–J3 on scratch commits | build and score | ExecJunkControls (three commits from `e5ffcbe7`, frozen counter per commit) | open (wave 1) |
| 59–65 | the work: second verdict path in both selftests | two patches | ExecCiteWitness, ExecCensusWitness (patch files named with sha256 in their reports); median-of-3 wall time before/after | open (wave 1) |
| 66–68 | not claimed: integer stays 9; capability row re-evidenced or corrected | report text | SCORECARD row edit at the measured commit; ScribeCorrections (c) | open (wave 1) |
| 69–70 | sourced: knowledge text stating K43 cites a row opened this round | find row, land citation | ScoutSrcKillDef + ScoutSrcFlaky find and open the row; census shows it | **G8** (no item lands or verifies the citation in knowledge text) |
| 71–74 | disclosure of the pre-commit dry run | committed receipt | `open/c1-control-base-dryrun-precommit.txt` is in `0f4108bf` (`--stat`, 49 lines); same verdict, `targets=2`, `leftovers=0` | closed |
| 76–93 | D1–D8 | see section B | see section B | mixed |
| 95–98 | base repair: README row, `C2=C2_total=95`, `pin.gate-mutants` re-pin; holds not recreated | not a claim | `git show 0f4108bf -- SCORECARD.md` = exactly two value hunks (`C2`/`C2_total` 94→95; `pin.gate-mutants` 3c6678cb→e24749e4); `corpus/README.md:125` row; proxy `MATCH`, `pins=6 match`, exit 0 at `e5ffcbe7` → the open `AXES_DRIFT` also cleared (N4); no `AtkNovel*` file under `.ufo/waves/round-43/` | closed |
| 100–102 | host safety bounds | every seat run bounded | wave context carries `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600` and the 6G/256/900 counter exception (build-spec `context`, verified verbatim) | closed |

## B. Routed defects D1–D8: action, closing evidence, owner item

| defect (closure) | plan | action | closing evidence | owner item | state |
|---|---|---|---|---|---|
| D1 late falsify reports; correct the "cancelled … unperformed" line | 78–79 | commit three reports (done in `0f4108bf`) + correction sentence in the round-43 report | `git show 0f4108bf --stat` lists the three files (114/78/114 lines); sha256 `25937520…`, `3e4ff33a…`, `48c12359…` match closure lines 34–37 via open receipts; corrected text quotes fleet report lines 137–140 | ScoutLateReports, ScribeCorrections (a) | routed; **G6** on wording |
| D2 one kill predicate; appended corrections at round-42 plan:81, lesson:10, :111 | 80–81 + 15–27 | K43 frozen, code implements it, three corrections drafted | counter sha256; control receipt; three paragraphs naming the superseded sentences | ScribeCorrections (a), CritK43Rule | routed (N2 on the plan:81 anchor) |
| D3 no terms claim; QUALITY criterion (pass-sensitive counter); checklist pass receipt at open and close | 82–83, 66 | drop the claim; write a QUALITY criterion; take both receipts | criterion text with its check command (next Q = Q25; QUALITY.md highest today is Q24 at line 303); `surface-probe.mjs --checklists` `CHECKLIST <p>/<n>` line at `e5ffcbe7`; close receipt at round end | ScribeQualityCriteria, ExecChecklistOpen | routed except the close receipt (**G5**) |
| D4 temp parent, both-target `--rev` run, four isolation mutants, external-kill leak | 84–87 | code fix, control receipt, red-before cases | code `:37,44,111` (`$KUMITATE_GATE_MUTANTS_TMP`, else `~/.cache/kumitate-gate-mutants`, mode 0700); control receipt shows `targets=2`, two `CONTROL`, two `CONTROL_AFTER`, `leftovers=0`; ExecGateIsolation patch shows each new case failing with its mutant and passing without | ExecGateIsolation, SentinelTempParent | routed |
| D5 same-sha cite-check errors/warnings receipts at `dfabe92` and `c9a084bf`, or retract | 88 | re-run the default verdict at both revisions, or retract | three-revision quote with `sha256sum scripts/cite-check.mjs` per revision; report states reproduce or retract | ExecCiteBefore | routed |
| D6 gate-pins block: ruling pending, re-pin only, no new key/arm/semantics | 89–90, 98 | state + re-pin | `git show 0f4108bf -- SCORECARD.md` (two value-only hunks), proxy `pins=6 match`; report line that L0 `9a00d09` stays with the operator | nobody named | **G4** (clause has no command) |
| D7 `locks/` mode floor and owner pin with red-before cases; `locks/sessions` named limit; unsourced-stub hole in QUALITY | 91–92 | code + criterion | ExecKimiLocksFloor patch (0777 currently passes, fails after), `node scripts/kimi-census.mjs` output, QUALITY criterion (Q26 or same Q25 group) with its check command | ExecKimiLocksFloor, ScribeQualityCriteria | routed |
| D8 wave-census canonical-path refusal red-before case; S045 gains `Q<n>` | 93 | test case + SOURCES edit | ExecCensusWitness patch with the red-before demo; `corpus/SOURCES.md:58` (S045 row) gains `Q21` — QUALITY.md:215 "every reject carries the criterion it fails" | ExecCensusWitness, ScribeCorrections (b) | routed |

## C. Closure content outside D1–D8

| closure item | routed? | note |
|---|---|---|
| Notes bullet 1: SHONEN boxes `[~][~][~][ ]`, author-asserted, no promotion evidence | **no** | **G1** |
| Notes bullet 2: R41-2 pin block, operator's to rule (L0 `9a00d09`) | yes | D6 + plan:98; see G4 for the missing command |
| Notes bullet 3: 12 falsify seats cancelled, attacks absent, not passed | partly | D1 commits the three delivered; the "nine remain absent" clause is not required by the plan text (**G6**) |
| Step-1 minor: no explicit "cross-domain evidence encountered" line (PROTOCOL §Round-robin minimum content) | **no** | **G2** |
| Step-1 prompt fidelity: 2 hunks, wording drift in the operator-side template | not routed | correctly so: operator-owned template, recorded pass; no lane action (N5) |
| Claims: C1 does not verify; re-freeze and re-claim | yes | C1 block, plan:13–27 |
| No-harm: cite-check 526/481 before-side has no committed artifact | yes | D5 |
| Holds `AtkNovelIdentity`, `AtkNovelRecords` | yes | plan:97, no such file under `.ufo/waves/round-43/` |
| Per-axis verdicts (`operability` unprovable; `coverage:kimi-layer` improved) | yes/no action | C1 for the first; the second is held evidence |

## D. Gaps (each with a concrete fix)

- **G1 (medium) SHONEN has no route.** Plan lines 1–102 never mention SHONEN. The closure says the four
  boxes are author-asserted with no promotion evidence, and prompt §4 allows `[x]` only with a named
  non-author verifier. Only ReviewConformancePrep lists the rule; no item produces a pointer or a
  verifier. Fix: name one item (or the L1) to obtain a non-author verifier for a box, or state in the
  report that all boxes stay `[~]` with the reason — before the report is filed, not after.
- **G2 (low) Cross-domain evidence line unrouted.** PROTOCOL.md:155 requires it in round minimum
  content; the closure logged it as the step-1 minor. The plan is silent; ReviewConformancePrep only
  adds it to the checklist. Fix: draft the line (domain named) as part of the report work; the natural
  candidate this round is the wave-census and cite-check suite behaviour (tooling ground), with the
  domain named as orchestration and tooling.
- **G3 (low) The open-state receipt is incomplete.** Plan:3–4 quotes `jj-lane.sh state` →
  `ahead=0 behind=0 tracked=0 untracked=3`, but `open/receipts.txt` holds no such command output
  (`grep -nE 'jj-lane|state'` matches only the S034 census line). Fix: either take the state reading
  into the report as a fresh receipt, or replace the quoted line with a git equivalent
  (`git rev-parse master`, `git status --porcelain`).
- **G4 (low) D6's "no new key, arm or semantics" has no command and no owner.** The evidence exists —
  `git show 0f4108bf -- SCORECARD.md` is two value-only hunks and proxy reports `pins=6 match` — but
  the plan names neither command nor item. Fix: quote both in the report's D6 disposition; that is the
  whole clause.
- **G5 (medium) D3's close-side receipt is unowned.** Plan:82–83 asks for a checklist pass-count
  receipt "at round open and close"; ExecChecklistOpen takes the open side (in fact at `e5ffcbe7`, not
  at the open commit `2a7f37d2`). No item takes the close side. Fix: L1 runs
  `surface-probe.mjs --checklists` at the close commit and pastes the `CHECKLIST` line beside the open
  one in the report's D3 disposition.
- **G6 (low) D1's correction is under-specified.** The closure's Notes bullet 3 requires the record to
  say the other nine cancelled attacks are absent, not passed. Plan:78–79 asks only to correct the
  "cancelled … unperformed" line. Fix: the corrected paragraph must name the three delivered reports
  and state that the remaining nine attacks remain unperformed.
- **G7 (medium) The after-measurement has no owner in the plan.** Plan:47–49 fixes the target string
  but no wave item integrates the two witness patches and runs the frozen counter at the resulting
  commit; wave-1 items measure per-target clones (ExecCiteWitness, ExecCensusWitness) or the base
  (MutK43Independent). This is L1 integration work, correct by contract, but it is the one step C1
  cannot survive losing. Fix: state in the plan or the report that the L1 lands both patches in one
  commit, then runs the frozen counter with `--rev <that commit>`, and cite that run as the after
  value.
- **G8 (low-medium) The sourced-claim clause has no landing or verification owner.** "the knowledge
  text that states K43 cites a `corpus/SOURCES.md` row opened this round" (plan:69–70): wave 1 offers
  source-finding scouts and a report-only SKILL.md draft (ScribeSkillRows is "report only"), so nothing
  writes the citation and nothing checks it. Fix: name the file and line where the citation lands (the
  SKILL.md gate-mutants row and/or the knowledge section) and the grep that proves it.
- **G9 (medium, structural) The plan carries no report-obligation route.** Absent from all 102 lines:
  the §2b census after-run (before side is in `open/receipts.txt`, exit 0 with the S034 W04 warning);
  the §4 Trend verdicts drafting; §6 Stale-lane line, tool install line, misroot sweep
  (`git -C /home/vgpnk/Projects/shokunin status --porcelain`), round shape and seat totals, the
  planner-seat mapping, inherited-state naming, and dead-seat error text. Each is an L1 round-end
  duty under the prompt, and each is cheap — but none is written down, so the natural failure is a
  report that omits one and is rejected as a conformance defect. Fix: add a "report obligations"
  checklist to the plan (or the LOG entry) with one line per item and the command that evidences it.

## E. Prompt report requirements and where each comes from

§2b (frontier step; contract `corpus/SOURCES.md` v1, CORPUS.md):
1. Rows written only after the source is opened this round; lesson `## Gate` records URL, access
   date, ≤25-word located quote; rejects stay as rows with reason and flip; `status`/`recheck`/
   `used-by` changes logged old→new — comes from ScoutSrcKillDef, ScoutSrcFlaky (open and quote),
   ScoutRejectCandidates (rejects), ScoutSourcesRecheck (old→new), ScribeLessonDraft (the `## Gate`
   table). Census command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root
   /home/vgpnk/Projects/shokunin kumitate`.
2. Census before → after with both outputs and exit codes, exit 0 required at round end — before is
   `open/receipts.txt` (`… kumitate ok …/corpus/SOURCES.md`, exit 0, one W04 duplicate-url warning);
   after has no owner in the plan (G9); it is an L1 round-end run.
3. Mine one mistake into `corpus/lessons/round-43.md` `## Mistakes` (class · evidence pointer ·
   captured-by · fix), and a fix counts only once shown able to fail; if none, paste the sweep —
   ScribeLessonDraft drafts three rows; the "shown able to fail" half comes from the red-before cases
   produced by ExecGateIsolation, ExecCensusWitness, ExecKimiLocksFloor and ExecJunkControls. This is
   the one place where the round's test work and the lesson are coupled; the coupling should be said
   in the report.
4. At least one sourced claim: C1's K43 text cites an S### opened this round — SOURCES row from
   ScoutSrcKillDef or ScoutSrcFlaky; landing owner missing (G8).

§4 sections, in order:
1. Work performed — claims first, then one bullet per item with a pointer: from the plan's C1 block,
   the 34 wave-1 item reports and the commit hashes.
2. Landed changes — each tied to a LOG.md entry and a commit: ScribeLogEntry plus the
   `jj-lane.sh commit` `landed <hash>` lines.
3. Before → after measurements — one per claim with the counting command and the measured commit:
   `open/c1-control-base.txt` at `2a7f37d2` (SURVIVED, exit 1) against the frozen-counter run at the
   integrated measured commit (G7).
4. Sources & frontier — rows before→after with the census command, rows added by tier, rows touched
   old→new, frontier rows advanced: census + `corpus/SOURCES.md` + `corpus/README.md` `## Frontier`.
   The census rows and tiers are covered; "frontier rows advanced" has no owner (G9).
5. Trend verdicts — one each for expansion, quality, discernment, with evidence: critic and reviewer
   verdicts plus the wave-2 attacks; no drafting item, so it is L1 work (G9).
6. SHONEN — one line per box, `[x]` only with a named non-author verifier: unowned (G1).
7. Marker rule — a contentless report is `failed`: guarded by ReviewConformancePrep's checklist.

§6 (campaign addendum) extras:
- Round shape named, wave seat counts, role mix, dead seats with last error text, residual call, round
  total ≤128: wave 1 is 34 spawns under policy v1 (band 32–64; `build-dispatch.json`:
  `"counts":{"spawn":34}`, `maxLanes 256`, `waveMinLanes 32`, `waveMaxLanes 64`), registry at
  `.ufo/waves/round-43/build/swarm-registry.json`; wave 2 (≤64) is dispatched only after wave 1, so
  the round total is at most 98. Recording it is L1 work (G9).
- Planner seat mapping: the L1 holds the canonical planner; this item (ScoutPlanWalk) is the bounded
  data walk that rides a scout, as the prompt permits. Must be written in the report; no plan line
  (G9).
- Seats are leaves, bounded runs, no `agent://all`, absolute seat paths, `Report:` trailer relative to
  the lane — all present verbatim in the wave context (verified).
- Commit order: lane commits only through `jj-lane.sh commit`; cite only `landed <hash>`; report last;
  fleet report through `fleet-commit.sh`. L1 duty.
- Inherited state: the three uncommitted round-42 reports are named at plan:3–5 and committed in
  `0f4108bf`; nothing else rose.
- Misroot sweep before the report: L1 duty (G9).
- Claim sizing §6.9: one concrete after value (a single `CLEAN (…)` string); a committed do-nothing
  control (present); no narrowing after landing (frozen at plan commit); the only universal clause
  ("every frozen literal must still apply exactly once") has an enumerating command (`nomatch=0`).
- Honesty, L0 side channel, and the ≤12-line closing summary: L1 duties.

## F. Precision notes (not gaps)

- N1. ExecJunkControls' first-line contract asks `j1=… j2=… j3=… j4=…` but the plan defines only
  J1–J3. The fourth field will either go unfilled or invite a fourth, unplanned control. Cheap fix in
  the report: state the field is not applicable.
- N2. The D2 anchor `round-42 plan:81` resolves only in the amended plan: at `4e1f3a79` line 81 is
  `## Amendments (written before any counted run of either counter; wave-1 findings)`; in the original
  plan commit `b237e3f0` line 81 is different text and the phrase on the plan is line 1 ("written
  before any wave; counters frozen at this commit"). The corrections must quote the amended plan, or
  the quote will not be found.
- N3. The S045 criterion is Q21 (QUALITY.md:215, "every reject carries the criterion it fails"); the
  next free criterion number is Q25 (highest today is Q24, QUALITY.md:303), so D3 and D7 need
  Q25–Q26 or one grouped Q25.
- N4. The plan's base-repair sentence names two of the three open proxy drifts; the third
  (`AXES_DRIFT coverage: row=10 derived=9`) cleared as a consequence and reads `MATCH` at `e5ffcbe7`.
  Wording only.
- N5. The closure's step-1 prompt-fidelity hunks are operator-side template drift; the plan rightly
  leaves them alone.
- N6. Plan:10–11 is derivable from `git show 2a7f37d2:SCORECARD.md` but is not pasted as a receipt in
  the open file; the proxy run at `e5ffcbe7` reproduces the same axis integers.

## Limits

Read-only walk. No wave item was executed and no claim measurement was attempted. The wave-2 spec did
not exist at read time, so items covering Trend verdicts or the after-measurement could still appear
there; G7 and G9 record the dependency rather than asserting a final absence. Slot duration for the
two witness patches was not measured here (ExecCiteWitness owns it).
