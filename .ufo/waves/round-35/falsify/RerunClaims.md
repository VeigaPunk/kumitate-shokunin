ATTACK CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6) verdict=holds defects=0

# RerunClaims — wave-2 falsify of the CLAIMS line (2026-10-20)

All commands run from /home/vgpnk/Projects/shokunin/kumitate-shokunin against the
read-only pin /fast/scratch/kumitate-r35/src (detached 31c465f1). No lane-tree or
host mutations; no scratch files written.

## 1. Reproduction

`node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src` → exit 0:

```
ROWS: 19  YES: 19  NOTES: 27  SECTIONS: 175
ROW S8   form=section   notes=1 sections=60 adv=0
ROW R11  form=section   notes=1 sections=41 adv=0
SUMMARY: errors=0 warnings=6
CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)
```

Exact match with the declared round-end line (rows/yes/notes/sections/adv and per-row
sections counts identical). `node scripts/claims-check.mjs --selftest` → `39/39 pass`,
exit 0.

`--strict` (`node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --strict`)
→ exit 1, `CLAIMS: DRIFT` listing the same 6 warnings. This is designed, self-tested
behavior ("promote warn-level findings to failure", scripts/claims-check.mjs:135,139;
selftest case at :689-690), not a defect: the claim quotes the default-mode verdict.

## 2. The 6 advisories explained — none introduced by round 35

Same 6 warns, verbatim, in the master-tree run
(`cd /fast/scratch/kumitate-r35/master-tree && node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src`).
All are warn-level (exit 0) boundary notes; every flagged file EXISTS in src, so none
is an unresolvability defect:

1. `SECTION_FILE_NOT_MEMBER row=S2 scripts/ufo-mission-result.mjs` — S2's registry
   members cell declares only `run-omp-native-trial.mjs` + `collect-omp-native-handoff.mjs`
   + `collect-omp-native-handoff-lib/`; the S2 note also sections ufo-mission-result.mjs
   (real file in src). Pre-existing.
2. `ROW_NO_SECTIONS row=R5` — R5 (seats & admission, "4 files") is topic-form: note with
   no `##` member sections, so member completeness is unchecked by design. Pre-existing.
3. `ROW_NO_SECTIONS row=R7` — same for R7 (local ship + fs layer, "5 files"). Pre-existing.
4-6. `SECTION_FILE_NOT_MEMBER row=R9` ×3 (loop_driver_tests.rs, local_ship_tests.rs,
   distill_tests.rs) — sectioned in R9's note but outside R9's declared members cell
   (`native_tests.rs` …); local_ship_tests.rs belongs to R7 (`local_ship*`), the other
   two to the R2/R6/R7 test-file split per R9's own cell. Pre-existing.

Master-tree additionally reports 6 ERRORS the candidate does not:
`SECTION_FILE_UNRESOLVED row=S8` ×5 (omp-wave-context.mjs, primeagent-recovery-assess.mjs,
primeagent-refinement-ledger.mjs, ufo-refinement-context.mjs, ufo-refinement-context.test.mjs)
and `SECTION_DEAD_ANCHOR row=R11 crates/ufo-core-runtime/src/round.rs — own-file anchors
17-20 are dead`. Both fixed by round-35 work (C2 re-census/re-anchor). Net: round 35
strictly improved the gate result and introduced zero advisories.

## 3. S8: 60 distinct, declared 60 — verified independently

- `--row S8 --json` → verdict MATCH, totals.sections=60, adv=0, findings=[].
  Post-processed the JSON: `sections: 60 distinct: 60 dups: [] nonFamily: [] notLive: []`
  — every section live, symbolHit, in-family; both new members sectioned
  (scripts/omp-route-grammar.mjs, scripts/ufo-swarm-registry.mjs).
- Declared count: SCORECARD registry row S8 members cell reads "60 members …" →
  gate's MEMBER_COUNT_DRIFT check (scripts/claims-check.mjs:401-405 counts DISTINCT via
  `new Set(out.sections.map((s) => s.file ?? s.heading)).size`) passes silently.
- Arithmetic at the pin: 63 (round-32 measurement at 964f443e) − 5 deleted + 2 added = 60.
  All 5 departed confirmed `absent` under /fast/scratch/kumitate-r35/src; both added
  confirmed `EXISTS`.
- Census note corpus/knowledge/remaining-scripts-census.md has 66 `## ` headings =
  60 fileish member headings + 6 structural (Membership and measurement, Composition
  and conventions, Member-completeness probe, Limits of this note, Citation ledger,
  Departed members). The 5 departed are kept as `- ` history bullets under
  "## Departed members" (lines 814-819), never as member sections — they cannot count.

## 4. `--row R11 --json`

verdict MATCH, 41 sections, all live/symbolHit/inFamily, adv=0, findings=[]. Master's
dead anchor on crates/ufo-core-runtime/src/round.rs is resolved (candidate round.rs
anchors=1, live=true). No defect.

## 5. Cross-foot vs the PROXY claim (C1 layerTerms consistency)

Claims-gate sections 175 = S 89 (1+8+2+5+2+5+6+60) + R 86 (8+12+5+6+0+4+0+4+4+2+41).
Proxy counts DISTINCT in-family identities: S 89−1 (S2 advisory) = 88, R 86−3 (R9
advisories) = 83 — exactly the declared `S=88/88, R=83/92`. adv 1+1+1+3 = 6. The two
tools' different denominators are internally consistent; no contradiction.

## Residual risk / verification gaps

- The claim is MATCH only in default mode; under `--strict` the 6 pre-existing boundary
  warns fail the gate (by design). If any future round's contract requires strict-green,
  S2/R9 membership cells or notes must be reconciled.
- R5/R7 member completeness is structurally unchecked (topic-form); the gate cannot
  catch a member silently dropped from those notes' families beyond family-pattern drift.
- [INFERENCE] Advisory semantics read from script source (:261-284, :330-410) and
  reproduced in both runs; no deeper root-causing of why ufo-mission-result.mjs sits in
  S2's note was done — out of scope (pre-existing, warn-level).
