D4 present=yes honest=no verdict=partial

Scope: round-36 spot-check D4 (`corpus/lessons/round-36-verifier-spotcheck.md:203-204`): add a QUALITY.md criterion that a gate admitting anchors is checked against symbol-on-line truth before landing. Checked at lane HEAD 86c0676. The repair is committed (5ceb8cd, then 86c0676); the falsify spec's "repair tree uncommitted" context is stale. Lane `git status --porcelain` unchanged by my runs. No lane file written. No installs (node v24.21.0 already present). Scratch: /fast/scratch/kumitate-r37/Verify4/.

## 1. Present: yes

$ grep -n '^## \|Q16' corpus/QUALITY.md
10:## Entry criteria
55:## Round criteria
86:## How to apply
116:## Post-review clarification (round 34)
126:- **Q16 — a gate that admits anchors is checked against symbol-on-line truth before landing.**
$ git --no-optional-locks diff --stat 91da27c6 HEAD -- corpus/QUALITY.md
 corpus/QUALITY.md | 7 +++++++
$ git --no-optional-locks merge-base --is-ancestor 5ceb8cd HEAD && echo yes
yes
Cited paths: `test -f` OK for corpus/lessons/round-36-verifier-spotcheck.md and corpus/lessons/round-37.md. The note's D1 (l.193), D2 (l.197), D4 (l.203-204), and the 123 count (l.86-87; table 70-73 = 102+12+5+4) all exist.

## 2. Honest: no

H1. The criterion's trigger and scope disagree with each other, and the records pick different versions.
- Q16 title (QUALITY.md:126): "checked against symbol-on-line truth before landing".
- Q16 body (QUALITY.md:128-129): "Before a green line is cited as anchor truth, re-measure the moved anchors with an independent parser".
- Fleet report `../.ufo/reports/round-37/kumitate.md:30-31` paraphrases D4 as "re-measured against symbol-on-line truth with an independent parser before landing" (title trigger).
- Lesson `corpus/lessons/round-37.md:13` paraphrases it as "before a green line is cited", with no "moved" (body trigger).
- Neither record flags that D4's "before landing" became a citation trigger over moved anchors only.

H2. The lesson's pointer to the independent check resolves to a report that defers that check to closure.
- round-37.md:19-20: "Independent truth parser on the repaired tree: see report measurement."
- kumitate.md:57-58, the report's only measurement, is `node scripts/claims-check.mjs --fidelity --fidelity-ratchet ...`, the lane's own gate.
- kumitate.md:83-84: "the independent confirmation of this round belongs to the closure, not this report."
- $ ls .ufo/waves/round-37/final/ → checklists.txt claims.txt fidelity.txt proxy.txt sources.txt. All lane-gate outputs; no independent output.

H3. The round cites its own green line in support of an anchor-truth claim that Q16 gates.
- LOG.md:1724-1725 close gate: `FIDELITY: CLEAN (notes=20 anchors=1551 src-rev=31c465f15669)`.
- LOG.md:1727-1728: "Declared claim: ... the fidelity gate now measures anchor truth".
- The same LOG's round-36 correction (l.1709-1710) says a CLEAN line is "not admitted as anchor truth" without independent re-measurement. The round does not show that re-measurement.

H4. Provenance: Q16 is filed under `## Post-review clarification (round 34)` (QUALITY.md:116), but its own grounding is round 36/37.

## 3. Operability: weak (this is what drives partial)

O1. No runnable check. Q16 names no parser, command, pin path, or pass line. `grep -n -i 'symbol-on-line' corpus/QUALITY.md` → only l.126. "Symbol-on-line truth" is defined only in note prose (round-36 note l.59-64).

O2. The parser the note used is throwaway. Note l.17: "the closure's own throwaway parsers over committed bytes and the read-only pin". Note l.59: "re-measured by the closure with its own parser". Nothing committed reproduces it.

O3. The only committed independent implementation cannot serve as the Q16 check. `.ufo/waves/round-36/baseline/fidelity-reference.mjs.txt` (header: "L1 reference implementation of FIDELITY v1 — verification only"):
- l.16 pairs right-first (`sp.find` to the right, then left). That is the rule D2 removed.
- l.7 imports the gate's own `probeSections` from scripts/claims-check.mjs, so it is not independent of the gate's section walk.
- Stored as `.mjs.txt`. Referenced by no script, corpus file, or SKILL.md: `grep -rln 'fidelity-reference\|fidelity-prototype' scripts corpus SKILL.md` → exit 1.
- Run on the pin (`cd /fast/scratch/kumitate-r37/Verify4 && node fidelity-reference.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/kumitate-r36/src`, exit 0):
  FIDELITY_TOTAL anchors=1561 ok=605 elsewhere=268 absent=13 dead=178 noid=497 nonok=281
- Canonical gate on the same tree (`node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json`, exit 0):
  FIDELITY_TOTAL anchors=1551 ok=675 elsewhere=169 absent=17 dead=173 noid=517 nonok=186
  FIDELITY: CLEAN (notes=20 anchors=1551 src-rev=31c465f15669)
- Gate rerun is byte-identical to `.ufo/waves/round-37/final/fidelity.txt` (diff: IDENTICAL).
- Pin confirmed: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → 31c465f15669f744848bd9f5d56191c5085670f7.
- The independent artifact disagrees with the gate by 95 nonok and by 10 anchors on the repaired tree. [INFERENCE] The gap comes from right-first pairing (l.16) on this corpus's SYM-then-anchor style. No record reconciles the two numbers.

O4. Not wired. How-to-apply (QUALITY.md:86-115) has 0 Q16 references. `grep -rln QUALITY scripts` → no script reads the file. Enforcement is reviewer judgment only.

## 4. What holds

- Q16 exists in the working tree and at HEAD. It cites the right note and lesson, and its title is D4's wording.
- The four restored notes carry a pending notice ("Re-verification against the pin is pending", e.g. native-trial-launch.md:2), so no note claims pin-true anchors.
- Gate output reproduces exactly.

## 5. Failing-condition check

Not absent. Contradicted only inside the round record (H1, H2 and H3), not in Q16's own title. Hence partial, not refuted.

## 6. Smallest safe correction (not applied; lane owner's call)

1. Move Q16 under `## Round criteria` (or a gate heading) and fix its provenance.
2. Make the body match the title: "before landing and before any green line is cited"; scope "every anchor a gate term admits", not only moved ones.
3. Name the check: commit an independent parser (not a v1 fork, not importing the gate) with its command, pin path, and pass line. Wire it into How-to-apply.
4. round-37.md:19-20 → "independent measurement pending closure (kumitate.md:83-84)". LOG.md:1727-1728 → qualify "now measures anchor truth" as "ratchet-measured; independent confirmation pending closure".
