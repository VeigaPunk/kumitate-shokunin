RESULT ScribeCorrections verdict=drafted corrections=3 rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b

# ScribeCorrections — round-43 appended corrections (report only; nothing applied)

Behavior: I read the round-43 plan, the round-42 lesson, the round-42 non-author closure,
`corpus/QUALITY.md`, `SCORECARD.md`, `corpus/SOURCES.md` and the round-43 do-nothing control
receipt in the lane at `e5ffcbe7`, and drafted three appended corrections. No lane file other
than this report was written. No gate, selftest or checklist was executed by this seat; every
number below is quoted from a committed or lane file, or from a read-only command listed under
Evidence. Nothing here is applied: the drafts are for the lane L1.

## Correction (a) — "written before any counted run" (D2)

- File: `corpus/lessons/round-42.md`.
- Insertion point: appending section at end of file, after line 172 (current EOF, the Misroot
  bullet ending `sweep before the report, as here.`), as
  `## Correction (appended round 43, 2026-10-22; the text above and the frozen round-42 plan stay as filed)`.
  The frozen plan (`b237e3f0`) is NOT edited; `plan.md:81` is quoted inside the paragraph.
- Superseded text, verbatim:
  - `.ufo/waves/round-42/plan.md:81` — `## Amendments (written before any counted run of either counter; wave-1 findings)`
  - `corpus/lessons/round-42.md:10` — `(commit b237e3f0; amendments A1–A4 before any counted run, commit a0a07bae).`
  - `corpus/lessons/round-42.md:111` (Mistakes table, "captured-by" cell) — `the build wave's critics, before any counted run`
- Draft paragraph (one paragraph, dated round 43):

> **Round 43 correction (2026-10-22; the text above and `.ufo/waves/round-42/plan.md:81` stay as
> filed).** The three statements "written before any counted run" (`plan.md:81` heading
> `## Amendments (written before any counted run of either counter; wave-1 findings)`, lesson line
> 10 `amendments A1–A4 before any counted run`, and lesson line 111 `the build wave's critics,
> before any counted run`) are superseded: A1 was committed at `a0a07bae`,
> `2026-10-22 17:01:18 -0300`, after build seats had already scored the frozen ids. The load-bearing
> evidence is A1's own body, which cites those seats ("under the plan's narrower sentence 6 of them
> … read survived"), and this lesson's own record at line 158: "A1 (a0a07bae, 17:01:18 -03)
> widened the plan's kill rule after build seats had already scored the frozen ids under both
> rules". The seat reports also carry earlier write times in the live worktree (`MutCiteOpen.md`
> 16:58:58, `CritC1Honesty.md` 17:00:02 with line 25
> `SUMMARY mutants=21 plan_rule_survived=6 r41_rule_survived=0`, `CritSeparability.md` 17:00:07,
> `ScribeSkillRows.md` 17:00:30; the round-42 non-author closure printed 16:59:48 for the last
> file, and every one of these readings precedes A1). The round-42 closure states the same at
> `corpus/lessons/round-42-verifier-spotcheck.md:56-58`: 'The header "written before any counted
> run" (plan:81, lesson:10, lesson:111) is contradicted by the lane's own falsify disposition'.
> Therefore A1 was written after counted runs by build seats, not before any; the correction is
> this paragraph; the only narrower statement the three lines could keep is that no L1 run of
> either counter preceded A1, and the record read for this draft does not establish that either.

## Correction (b) — S045 decision line names no `Q<n>` (D8)

- File: `corpus/lessons/round-42.md`.
- Insertion point: inside `## Gate`, immediately after line 84 (the last line of the S045 bullet,
  `running code. Flip: the host upgrades to a release containing that revision.`), as a
  bold-led appended paragraph, so the sampled section carries the criterion next to the decision.
  The bullet's text stays as filed.
- Superseded text, verbatim (`corpus/lessons/round-42.md:79-84`, the decision as filed):

```
  - **Reject S045** (Kimi Code sessionLockService.ts on `main`, the revision in its URL). Opened
    2026-10-22 (seat ScribeKimiLocksEntry used it; seat ScoutKimiLocksSource rejected it). Quote,
    file line 23: "export const SESSION_LOCK_ENV = 'KIMI_CODE_SESSION_LOCK';" (re-opened by falsify
    seat ReviewSourcesR42). Missed: `main` adds a takeover path and that
    `KIMI_CODE_SESSION_LOCK` switch, with 0 hits in the installed 2.3.0 binary, so it is not the
    running code. Flip: the host upgrades to a release containing that revision.
```
- The criterion: **Q8** — `corpus/QUALITY.md:45-49`: "version skew is named. When a fact comes
  from upstream `main` or current docs, name the installed host binary/version actually observed
  and the revision gap." That is the criterion S044's decision already names ("Missed Q8 (the
  source must be the product and version the host runs)", lesson line 76-77), and the S045 reason
  is the same class. Q1 is an admitted-entry header rule and S045 is a rejected registry row;
  Q2-Q7 and Q9 are not in play (the row exists and is opened, official and tier A, same domain, no
  secret surface); Q16-Q20 govern anchors and gate internals. Q8 is therefore the entry criterion
  the rejection turns on. The record rule the omission breaks is **Q21**
  (`corpus/QUALITY.md:215-231`, Field at 226): "every decision bullet in `## Gate` … names … the
  criterion it met or missed (a `Q<n>` id or a named gate term)".
- Draft paragraph (one paragraph, dated round 43):

> **Round 43 correction (2026-10-22, appended; the bullet above stays as filed).** The S045
> decision records "Missed: `main` adds a takeover path and that `KIMI_CODE_SESSION_LOCK` switch,
> with 0 hits in the installed 2.3.0 binary, so it is not the running code", but names no `Q<n>`.
> The criterion the decision line must name is **Q8** (`corpus/QUALITY.md:45-49`: "version skew is
> named. When a fact comes from upstream `main` or current docs, name the installed host
> binary/version actually observed and the revision gap"), the criterion S044's decision already
> names for the same class ("Missed Q8 (the source must be the product and version the host
> runs)"): the row's quote is from `main` head
> `e7f1a99fc52e68d8e8a2d99d59deba38e4272754` (the S045 row's own URL) while the host runs the
> 2.3.0 release, and the bullet states the 0-hit gap but not the revision gap. The record defect
> is against **Q21** (`corpus/QUALITY.md:215-231`), which requires every `## Gate` decision bullet
> to name its criterion (a `Q<n>` id or a named gate term). The reject verdict and its flip
> ("the host upgrades to a release containing that revision") are unchanged.

## Correction (c) — SCORECARD operability 9 and the `gate-mutants` capability row

- File: `SCORECARD.md`.
- Insertion point: new section
  `## Round 43 correction (2026-10-22, named; supersedes the live wording it names)` at end of
  file, after line 1919 (current EOF, the last line of the `## Round 42 — claims, corrections,
  limits and round-43 pre-registration (2026-10-22)` section, `` `(47 vs `sections=41`).` ``). This
  follows the existing `## Round 37 correction` (line 1749) and `## Round 38 correction` (line
  1762) convention: a correction section sits after the round it corrects and before the next
  round's section.
- Superseded text, verbatim:

```
SCORECARD.md:324 (`## Axes`, operability cell):
  Round 42 moves the integer 8 → 9 (`f_O` 26/29 → 29/32; C1, capability `gate-mutants`).
  C counts listed items; the pass count is a separate measurement quoted with its date.
SCORECARD.md:1710 (`## Capabilities`, `gate-mutants` row), evidence pointer:
  `node scripts/gate-mutants.mjs` → `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 …)`; `--selftest` 23/23.
SCORECARD.md:1878 (Round 42 section):
  the battery `CLEAN` with `frozen=41/41`
```
- Draft paragraph (one paragraph, dated round 43):

> **Round 43 correction (2026-10-22, named; supersedes the live wording it names).** The round-42
> non-author closure re-derived the operability terms 8 → 9 but ruled C1 `does not verify`
> (`corpus/lessons/round-42-verifier-spotcheck.md:91`) and graded operability `unprovable`: "C1
> not verified: battery 34/41 under the pre-data kill rule (gate would read SURVIVED, exit 1);
> terms 8 → 9 re-derived but counter-blind (listed lines, zero-byte script reads 9); not harmed".
> The `## Axes` cell's attribution "Round 42 moves the integer 8 → 9 (f_O 26/29 → 29/32; C1,
> capability gate-mutants)" therefore overstates what 9 rests on: the cell itself already says "C
> counts listed items; the pass count is a separate measurement quoted with its date", so the
> integer records a terms reading, not evidence of the capability, and the capability row
> `gate-mutants` entered `## Capabilities` on that unverified claim with the evidence pointer
> "`node scripts/gate-mutants.mjs` → `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41
> drift=0 …)`; `--selftest` 23/23". At the round-43 open revision the same frozen counter bytes
> (`sha256 e24749e4…`) print `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 drift=0
> targets=2 rev=2a7f37d2…)` exit 1 with seven survivors
> (`.ufo/waves/round-43/open/c1-control-base.txt:53`), so that pointer does not reproduce at the
> open bytes. Round 43's C1 re-evidences or corrects the row under K43: only a measured commit
> that prints `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 …)` exit 0, run with these
> same counter bytes and no amendment of K43 or of the counter, restores the row's evidence;
> otherwise the row is corrected to record the miss. This correction changes no axis integer and
> claims nothing about round 43's C1 outcome, which was unknown to this seat at draft time.

## Evidence (commands and observed output; read-only, lane at e5ffcbe7)

1. `grep -n "written before any counted run" corpus/lessons/round-42.md .ufo/waves/round-42/plan.md`
   → `corpus/lessons/round-42.md:10:(commit b237e3f0; amendments A1–A4 before any counted run, commit a0a07bae).`
   and `corpus/lessons/round-42.md:111:| a kill rule stated narrower than the frozen set it counts | … | the build wave's critics, before any counted run | …`
   and `.ufo/waves/round-42/plan.md:81:## Amendments (written before any counted run of either counter; wave-1 findings)`.
2. `git show -s --format='%h %ci %s' a0a07bae b237e3f0` → `a0a07ba 2026-10-22 17:01:18 -0300 round-42: plan amendments A1-A4 before any counted run; …` and `b237e3f 2026-10-22 16:53:04 -0300 round-42: plan with frozen counters …`.
3. `ls -l --time-style=+%H:%M:%S .ufo/waves/round-42/build/{MutCiteOpen,ScribeSkillRows,CritC1Honesty,CritSeparability}.md`
   → `16:58:58 MutCiteOpen.md`, `17:00:02 CritC1Honesty.md`, `17:00:07 CritSeparability.md`, `17:00:30 ScribeSkillRows.md` (all before 17:01:18).
4. `sed -n '25p' .ufo/waves/round-42/build/CritC1Honesty.md` → `SUMMARY mutants=21 plan_rule_survived=6 r41_rule_survived=0   [exit=0, 26 s wall; leftovers=0 tmpdirs=0]`.
5. `git log -1 --format='%h %ci' e5ffcbe7 -- .ufo/waves/round-42/build/CritC1Honesty.md` (same for the other three) → `c9a084b 2026-10-22 17:56:07 -0300`: the four reports were committed at 17:56, so their 16:58–17:00 file times are write times, not checkout times.
6. `grep -n "Counter amended after data\|C1's proxy-term" corpus/lessons/round-42.md` → `158:- **Counter amended after data (mistake, falsify seat CritPlanAmendments).** A1 (a0a07bae,` and `166:  under both rules and left to the closure. C1's proxy-term after-state (A 10, C 19,`.
7. `grep -n "written before any counted run\|Ruling: C1 does not verify" corpus/lessons/round-42-verifier-spotcheck.md` → `56:` (the header sentence) and `91:**Ruling: C1 does not verify.**`; the timeline opens at line 52.
8. `sed -n '79,84p' corpus/lessons/round-42.md` → the S045 bullet as quoted in (b), lines 79-84, ending `running code. Flip: the host upgrades to a release containing that revision.`
9. `grep -n "Q8 —\|Q21 —\|Field\." corpus/QUALITY.md` → `45:- **Q8 — version skew is named.** …`, `215:- **Q21 — a round that rejects nothing says so, and every reject carries the criterion it`, `226:  - **Field.** In corpus/lessons/round-<N>.md, every decision bullet in ## Gate opens`.
10. `sed -n '72,77p' corpus/lessons/round-42.md` → the S044 decision naming `Missed Q8 (the source must be the product and version the host runs)`.
11. `grep -n '^| S045 ' corpus/SOURCES.md` → one row, line 58, tier A, `REJECTED: main has drifted from the installed 2.3.0 release … not the running code; flip: the host upgrades to a release containing this revision`.
12. `sed -n '324p' SCORECARD.md` → the operability cell as quoted in (c), including `C counts listed items; the pass count is a separate measurement quoted with its date.`
13. `sed -n '1710p' SCORECARD.md` → the `gate-mutants` row as quoted in (c), ending `… checklist items 18–19; S039 | round 42 |`.
14. `grep -n "GATE_MUTANTS:" .ufo/waves/round-43/open/c1-control-base.txt` → line 53: `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 drift=0 targets=2 rev=2a7f37d2b0a413db8499b413783c27a0effdc989 manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0)`; the seven `survived` lines are 20, 21, 22, 36, 37, 38, 47.
15. `grep -n "Ruling: C1 does not verify\|34/41 matches" corpus/lessons/round-42-verifier-spotcheck.md` → `91:**Ruling: C1 does not verify.**`, `77:34/41 matches the author's disclosure.`
16. `wc -l corpus/lessons/round-42.md SCORECARD.md corpus/QUALITY.md` → `172`, `1919`, `321` (EOF anchors for (a) and (c)).
17. `grep -n "^## " SCORECARD.md` → `1749:## Round 37 correction (2026-10-21, named; supersedes the live wording it names)`, `1762:## Round 38 correction (2026-10-21, named; supersedes the round-37 correction's last sentence)`, `1874:## Round 42 — …` (convention for (c)'s insertion).
18. `grep -n "S045" corpus/SOURCES.md` → one row only; the apparent second copy in my first pass was the `sed` reprint, not a duplicate row.

## Gates

None run by this seat: no `gate-mutants`, no `--selftest`, no checklist, no proxy. The only
counter evidence used is the committed round-43 receipt (line 53 above) and the closure's
committed re-count; both are quoted, neither is re-executed. Host safety: no process spawned, no
temp directory created, nothing to clean up.

## Touched surfaces

Read-only: `.ufo/waves/round-43/plan.md`, `.ufo/waves/round-43/open/c1-control-base.txt`,
`.ufo/waves/round-43/build/` (listing), `.ufo/waves/round-42/plan.md`,
`.ufo/waves/round-42/build/{MutCiteOpen,CritC1Honesty,CritSeparability,ScribeSkillRows}.md`,
`corpus/lessons/round-42.md`, `corpus/lessons/round-42-verifier-spotcheck.md`,
`corpus/QUALITY.md`, `corpus/SOURCES.md`, `SCORECARD.md`. Written: this file only.

## Out of scope (not done, not claimed)

- No correction applied; no lesson, scorecard, plan or QUALITY edit.
- D2's plan:81 text is in a frozen plan: I did not propose editing it, and the draft routes the
  correction to the lesson and the round-43 report.
- D3's new QUALITY criterion (operability needs a pass-sensitive counter), the checklist
  pass-count receipt, D4/D5/D6/D7 and D8's wave-census red-before case are other seats' items.
- No claim about round-43's C1 outcome; no axis re-grade.

## Findings

1. The closure prints `ScribeSkillRows` at 16:59:48; the file's live mtime is 17:00:30. Both
   precede A1 `17:01:18`, so the contradiction stands, but the applied paragraph should cite the
   observed mtime or lean on A1's own body rather than repeat the closure's number.
2. `SCORECARD.md:324` is internally hedged: it claims the round-42 integer move and, in the same
   cell, says `C counts listed items; the pass count is a separate measurement` — exactly the
   counter-blindness D3 routes. The correction quotes both halves rather than asserting the hedge
   away.
3. The `gate-mutants` capability row's evidence pointer does not reproduce at the round-43 open
   bytes (`SURVIVED … killed=36`, seven survivors), so the row is currently backed only by a claim
   the closure did not verify; that is the row's status until C1 lands.
4. The plan (`b237e3f0`) is frozen by its own commit message and the round-43 plan's "no
   amendment" rule; a correction that edited `plan.md:81` would itself violate the freeze, so the
   insertion points given are the lesson (a, b) and SCORECARD (c).
5. `corpus/SOURCES.md` holds exactly one S045 row; no duplicate-id defect exists here (checked
   after a misleading grep-plus-sed reprint).

## Artifact paths

- This report: `.ufo/waves/round-43/build/ScribeCorrections.md`.
- Evidence receipts cited: `.ufo/waves/round-43/open/c1-control-base.txt` (line 53),
  `.ufo/waves/round-42/final/c1-measured-c9a084bf.txt` (quoted through the closure, not re-read
  by me).
