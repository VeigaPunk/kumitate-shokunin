# Round 49 — non-author verifier spot-check (closure)

author: hyaku closure (non-author integrator, @m_flash)
date: 2026-10-23
lane HEAD verified against: `c432cc958304856d989438fb74c4cb48cb0ea3fc` (branch `master`, pushed; base
`b7b040b5519659ddffa8bf6841a8ada56a9c2701`; the report's record commit `64b92866`)
report: `.ufo/reports/round-49/kumitate.md` (fleet commit `0fdce71a764cf0093380d64b9c55f4c58a08c593`,
author `kumitate-shokunin`, ancestor of `origin/master`)

The lane moved after the report was filed: `01b70bb0` (C2 addendum, C16 + prior art), `923a172` (record
addendum, re-score 16/16), `c432cc9` (ConnSiblingOverlap seat report). All step-1/step-2 checks below were
re-derived against the tip `c432cc95`; the report's `64b92866` and the addendum `01b70bb0` are both
ancestors of it.

Dispatch/complete digest (copied from `.ufo/watchdog.log`, mutable — this is the resolving pointer):

```
2026-10-23T06:16:12-03:00 complete kumitate round=46; hyaku-inline attempt=1
2026-10-23T06:28:20-03:00 launch kumitate round=47 pgid=665961 driver=hyaku-inline attempt=1
2026-10-23T07:58:09-03:00 complete kumitate round=47; hyaku-inline attempt=1
2026-10-23T08:04:35-03:00 launch kumitate round=48 pgid=1614930 driver=hyaku-inline attempt=1
2026-10-23T15:03:19-03:00 lane-dead-no-report kumitate round=48; retry same round (attempt=1: superseded at T0 2026-10-23T18:00Z: stale phase-4 author (orchestrator died 2026-10-23 ~09:30 -03); fresh attempt)
2026-10-23T15:10:27-03:00 launch kumitate round=48 pgid=94401 driver=hyaku-inline attempt=2
2026-10-23T16:09:30-03:00 complete kumitate round=48; hyaku-inline attempt=2
2026-10-23T16:38:14-03:00 launch kumitate round=49 pgid=2384716 driver=hyaku-inline attempt=1
2026-10-23T~20:15Z complete kumitate round=49 (in-session L1): landed, lane master=64b92866b3c119d4a3434039569a82786ab323f1 pushed ahead=0; fleet report commit 0fdce71a (.ufo/reports/round-49/kumitate.md); one v2 wave 64 seats (24 attack, 37.5%), zero dead seats; landing at 2h15m against the 2h freeze (overrun was report write-up + fleet push, disclosed).
```

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report author = lane identity | `git log --format='%an %ae %H %ci' -- .ufo/reports/round-49/kumitate.md` | `kumitate-shokunin kumitate@shokunin.local 0fdce71a… 16:54:14 -03`; ancestor of `origin/master` (`git merge-base --is-ancestor 0fdce71a origin/master` → 0) | pass |
| `SHONEN` heading, one line per box | read report | `## SHONEN` at :heading; 4 lines, all `[~]`, each with a pointer (SKILL.md:594-617, LOG+r49 score, plan/counters, PROVINCE) — matches SHONEN.md's 4 boxes | pass |
| cited lane commits exist and are ancestors | `git cat-file -t` + `git merge-base --is-ancestor <h> c432cc95` for `8237be86`, `0526f898`, `589d25e4`, `64b92866` (and addendum `01b70bb0`, `923a172`, `c432cc9`) | all `commit`, all ancestor = yes (lane is jj-colocated; tested against the branch ref, never `@{u}`/detached `HEAD`) | pass |
| lane pushed, no unpushed commit | `scripts/hyaku/jj-lane.sh state …/kumitate-shokunin` | `branch=master local=c432cc95… remote=c432cc95… ahead=0 behind=0 tracked=0 untracked=0` | pass |
| no uncommitted round work | `git -C …/kumitate-shokunin status --porcelain` | empty at closure | pass, with history: at 16:54–16:57 -03 the tree carried ` M SKILL.md`, ` M corpus/knowledge/counter-amendment-discipline.md`, `?? .ufo/waves/round-49/r49/ConnSiblingOverlap.md`; the lane committed them (`01b70bb0`, `923a172`, `c432cc9`) at 16:58–16:59 -03, after the report. Routed defect 1. |
| prompt carries the round contract | rendered `templates/round-prompt.md` (lane/round/fleet/axes substituted) vs `.ufo/prompts/kumitate-round-49.md` (committed `43e5e79a`, lane identity) | byte-identical L1–140 modulo the lane-dir substitution; round-level items: mission/axes binding, L2 floor 8 = `MISSION.md` §L2 current number, commit-then-push, push scope, L0; five child-lane items: report path, commit-before-report ("report lands last… cites the pushed lane hash"), `SHONEN` heading, hash-citation (`landed <hash>` only), lane write scope. No route-map table is quoted, so no bucket drift; addendum's 32–128 band is the operator raise, marked non-relaxing | pass |
| marker vs report | read report | real report: Work performed / Landed changes (LOG entry + commit each) / Before→after / Sources & frontier / Trend verdicts / SHONEN, every bullet carrying a path, command or hash | pass |
| Sources & frontier present; census exit 0 | `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` (my run) | `kumitate ok …/corpus/SOURCES.md`; exit 0; only the pre-existing W04 duplicate-url warnings (S034, S068, S084, S095). 99 rows | pass |
| `## Gate` in the round lesson | `grep -n '^## ' corpus/lessons/round-49.md` | `## Mistakes`, `## Frontier — SOURCES` — **no `## Gate`** (round-48 lesson has one) | **defect (status-neutral)** — routed 2 |

## 2. Claims — re-check (each re-measured by me against committed bytes; frozen counters run read-only)

### C1 — capability `bind-oracle`, rule `B49` → **improved**

- **Frozen before data.** `git log --format='%h %s' -- .ufo/waves/round-49/plan.md` and both counters shows exactly
  one commit (`8237be8` freeze); blob ids identical at freeze and tip
  (`bindoracle49-probe.mjs d6853f80…`, `doctrine49-probe.mjs eb1471bf…`). The plan's §C1 predicate (:54-64, "all six
  checks pass … `BINDORACLE49: ORACLE_HELD held=6/6 checks=6 rev=<rev> rule=B49 oracle_sha256=<sha256>` exit 0")
  is the counter's header sentence (:15) and its printed line (:115).
- **Before (mine).** `node .ufo/waves/round-49/probe/bindoracle49-probe.mjs "$PWD" b7b040b5519659ddffa8bf6841a8ada56a9c2701`
  → `BINDORACLE49: ORACLE_UNMET held=0/6 checks=6 rev=b7b040b5… rule=B49 oracle_sha256=absent`, exit 1. Matches the
  committed control `controls/CtlNothing-base-b7b040b5.txt`.
- **After (mine).** Same command at the report's record commit and at the tip:
  `… 64b92866…` and `… c432cc95…` both → `BINDORACLE49: ORACLE_HELD held=6/6 checks=6 … oracle_sha256=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5`, exit 0.
  K2 (the instrument's own suite) reads `7/7` in both runs, so the report's "selftest 7/7" is reproduced, not quoted.
- **Controls.** CtlNothing `held=0/6` exit 1; the committed static-forgery control
  `controls/CtlForged-static-oracle.txt` reads `held=3/6` exit 1. The counter's output-text limit (a forger that
  branches on `--cap-run` basename could print the six strings) is disclosed in plan §C1 Limits (2)/SCORECARD
  `## Round 49` (a) and is attacked by the wave's mutation seats — recorded, not hidden. The scored object is named
  by sha (`oracle_sha256=c3929a97…`), so a substituted instrument is visible.
- **Receipt independence — weak (routed 4).** The three C1 receipts are byte-identical:
  `sha256sum r49/L1-score-0526f898.txt r49/ReRunCounter49-2.txt r49/ReRunCounter49-3.txt` → `03a258d6…` ×3, all in
  commit `64b92866`. "Three time-spaced runs" is therefore not evidenced by bytes (the lane's own doctrine clause
  C9 asks for independent runs). Independence is supplied by my own re-runs at two revisions, both `6/6` exit 0.

### C2 — knowledge entry `counter-amendment-discipline.md`, rule `D49` → **improved**

- **Before (mine).** `node .ufo/waves/round-49/probe/doctrine49-probe.mjs "$PWD" b7b040b5…` →
  `DOCTRINE49: UNMET reason=entry-absent path=corpus/knowledge/counter-amendment-discipline.md rev=b7b040b5…`, exit 1.
- **After (mine).** At `589d25e4` → `DOCTRINE49: HELD … clauses=15/15 rows=3 cited=3 entry_sha256=6b8f69cd… rule=D49`, exit 0;
  at `64b92866` → identical 15/15; at the tip `c432cc95` (after `01b70bb0`) →
  `DOCTRINE49: HELD … clauses=16/16 rows=3 cited=3 entry_sha256=11828698f0feee79405037cff3a31f65297ecebfcedf4f812cbdceb3d53f527b rule=D49 rev=c432cc95…`, exit 0.
  16 `receipt:<path>@sha256:<64hex>` tokens, each path present at the scored revision with the matching blob
  sha256; every `S0NN` citation is a `mined` SOURCES row (S099/S098/S095).
- **Shown able to fail (control, reproduced by me).** A copy of the committed entry with one hex digit flipped:
  `node … doctrine49-probe.mjs "$PWD" master --file <copy>` →
  `DOCTRINE49: UNMET reason=receipts misses=.ufo/waves/round-48/plan.md=hash-mismatch(6faa34ab!=0faa34ab) clauses=15/16 …`, exit 1.
- **Limit (c), the entry's own.** The probe binds clause prose to receipt bytes; it cannot tell a true clause from a
  well-bound false one — the entry states this and Q38 carries the non-author re-read half.
- **Causal separability.** C1 scores only `scripts/bind-oracle.mjs`; C2 scores only the entry + `SOURCES.md` + the
  receipts it cites. Neither counter reads the other's landings; both were re-run against the base revision and read
  UNMET there.

### Harm check (owned axes only: operability + coverage; SCORECARD:3-5)

- `git diff b7b040b5 c432cc95 -- SCORECARD.md` → +45/−0; no registry cell edited, so coverage's C1 (19/19) is
  unchanged by construction.
- `A` (runnable artifacts): `git ls-tree -r --name-only <rev> | grep -cE '\.(mjs|js|sh|py)$'` → **38** at base,
  **41** at tip (`+bind-oracle.mjs` and the two frozen counters) — matches the report's "A 38 → 41".
  `C` (`grep -c '^\s*- \[' SKILL.md`) → **22** at both. Integer `f_O` = floor(10×63/66) = 9, terminal, unchanged.
- Coverage registry index: `grep -cE '^\| `[^`]+` \|' corpus/README.md` → **108** at base, **110** at tip; every one of
  the 110 named paths exists at the tip (`git cat-file -e` loop printed no `MISSING`) → `110/110`.
- Deletions in the whole round are confined to `.ufo/waves/round-48/close/ReRunCounter48-1.md` and `ReRunCounterA.md`
  (the r48 late-write rewrite, R49-1) and 2 lines of the SKILL registry prose. No owned-axis surface was removed.

## 3. Discernment spot-check (LEARNING.md — checked from outside)

The round's lesson has **no `## Gate` section**, so no gate ledger exists to sample; the round also records
"Rejections: none". Samples below are the round's recorded admits and its two control rejects, each re-opened.

| item | decision | re-opened source (mine) | agree/disagree | reason |
|---|---|---|---|---|
| S099 `proc_pid_mountinfo(5)` row | admitted, tier A, `docs`, `mined` | `curl -s https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html \| sha256sum` → `27a0e5ad5cf9fc4ef4059cd0c4a9b70fa2ac23457a4d39b82f2381a654b3813f` (10866 B), exact match to the row; quote "This file contains information about mounts in the process's mount namespace (see mount_namespaces(7))." present in DESCRIPTION ¶1; "(5) mount point: the pathname of the mount point relative to the process's root directory." present; colophon `man-pages-6.19` | **agree** | quote, locator (¶1 + field 5) and body hash all reproduce; row has 11 cells; both `used-by` paths cite it (`scripts/bind-oracle.mjs:7,30`, entry:4). Nit: lesson/report say "15 words", the quote is 13 (≤25 either way). |
| `corpus/knowledge/counter-amendment-discipline.md` | admitted as the C2 object, Q38's first judged entry | re-ran D49 at `589d25e4`/`64b92866`/`c432cc95`; 15/15 → 16/16, exit 0; every receipt path + sha256 verified; S099/S098/S095 all `mined` | **agree** | admission test (binding + clause floor + mined rows) is the predicate the round froze; entry discloses its own limit and Q38 commits the non-author half. |
| doctored receipt copy (C2 control) | **rejected** — `UNMET … hash-mismatch`, exit 1 | I built the doctored copy myself (one hex digit) and ran D49 with `--file` | **agree** | the reject is produced by the frozen predicate, not by prose; reproduces the committed control with the same finding shape. |
| instrument mutants K4–K6 (C1) | **rejected** — drop → `MISSING missing=3` exit 1; extra `--bind /etc /etc` → `EXTRA extra=1` exit 1; `--tmpfs /tmp` removed → `CONTROL_VISIBLE visible=1` exit 1 | my two re-runs of the frozen counter | **agree** | each attempted cheat is caught by an arm that names it; the counter owns the mutant bytes and never trusts a shipped mutant. |
| round gate ledger | absent (`## Gate` missing; "Rejections: none") | `grep -n '^## ' corpus/lessons/round-49.md`; report §Sources & frontier | **disagree with the report's "discernment — improved"** | with no `## Gate` section there is no candidate/admit/reject ledger and no spot-check slot, so the round produced nothing whose discernment could be improved; the admits and the two control rejects I could recover all agree, but that is a control record, not a gate record. Routed 2. |

## 4. Trend verdicts (mine, from the re-checks above)

- **expansion — improved.** S099 is a tier-A `mined` row whose body hash I re-fetched exactly; a knowledge entry
  (16 bound clauses) and a capability (`bind-oracle`, same-round `7/7` selftest + `6/6` at two revisions) entered;
  the coverage index grew 108 → 110 (all resolvable).
- **quality — improved.** The C2 object was deepened and re-scored (15/15 → 16/16, every receipt verified), Q38 is
  committed with a shown-able-to-fail doctored run I reproduced, and the r48 leftovers R49-1…R49-5 landed with the
  named files present at the tip and absent at base (ReviewIntegration.md, r48-plan.stderr,
  r48-residual-plan.stderr, the two ExecLoadProbe files; the two rewritten `close/*.md` are present at both revs with
  different blobs, as the report says). Caveats routed: the S095/S098 re-open claims have no committed receipt (3),
  and two stale "all eleven" sentences remain in `SKILL.md` (5).
- **discernment — unchanged.** The admits verify and the control rejects reproduce, but the required `## Gate` ledger
  is absent and no candidate rejection exists, so the round's own claimed uplift is narrative. The disagreement is
  recorded above and routed (2, 5).

## 5. Routed defects (lane-owned; fix or answer in round 50)

1. **Report landed before its last commits (report-last ordering).** The report was filed at 16:54 -03 citing
   `64b92866`; `01b70bb0` (C2 addendum), `923a172` (record addendum + re-score) and `c432cc9` (ConnSiblingOverlap
   seat report) landed after it. The report's "seat reports … are committed in `64b92866`" and its C2 "15/15,
   15 clauses" are therefore stale against the tip (16/16). The LOG addendum (`923a172:LOG.md`) names the extension,
   which keeps the record honest, but the report itself carries no erratum. Next round: either append an erratum
   naming the superseded numbers or state the extension in the next report.
2. **No `## Gate` section in `corpus/lessons/round-49.md`.** CORPUS.md requires candidates, admitted, rejected (with
   reasons) and the spot-check result. Add it (and record the outside-check samples above, including this file's
   path) or state why the round carried none. Round 43/44-style lessons carry one; round 49 does not.
3. **S095/S098 "re-opened" has no committed receipt.** The wave spec carries `ScribeReopenS095`/`ScribeReopenS098`
   seats; no seat report for either is committed under `.ufo/waves/round-49/`, and the report says only "re-open
   receipts in the round report" without them. Commit the two re-open artifacts (or a sweep line saying the seats did
   not return), per the no-pointer-no-claim rule.
4. **C1's "three time-spaced runs" is not byte-evidenced.** The three receipts are one sha256 (`03a258d6…`) in one
   commit. Either capture per-run timestamps/nonces (the lane already owns `counter-rerun`) or state "one score run
   plus two copies" plainly; the predicate itself holds (my independent re-runs at two revisions read 6/6).
5. **Correction sweep incomplete.** `SKILL.md:595` ("Verdict map for all eleven") and `:598` ("all eleven above still
   counts the gates only") contradict `:589` ("Twelve are gates") after R49-2. Sweep both mentions.
6. **Wave claims without a committed receipt.** "validator exit 0 under the v2 policy" and "slot granted … seats=64
   live=82 pending=0 cap=256" have no committed artifact (the wave was dispatched inline); the committed
   `r49-taskcall.json` is a bare 64-element array while the report describes a `context`+`tasks` taskCall (the
   `context` lives in `r49-spec.json`). Commit the validator receipt or mark the claim as orchestrator-reported.

Operator note (promotion is operator-owned; this file writes no box mark): all four SHONEN boxes now look checkable
by a non-author — box 1 against `SKILL.md:589-617` (decision/registry tables with sources), box 2 against the r49
instrument plus its score receipts, box 3 because the frozen counters ran from committed instructions with no oral
context (this file), box 4 because the round's diff touches no sibling repo and no domain tree.
