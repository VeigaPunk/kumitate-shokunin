# Audit22 — Quality Q52–Q57 review

Axes: **operability** (can an independent checker execute the stated test?) and **coverage** (does the failure condition catch the named defect?). Review-only; no production files changed.

## Findings

### Q54 — progress parser is tied to the R60 TSV column order (operability)

The command hard-codes `$4 != "exit=0"` and `$1` as seat name. On committed R60 evidence, `launcher-progress.tsv` has `exit=...` in field 4, and the stated command yields 27 dead seats. But R61's committed `w1/launcher-progress.tsv` has six tab fields with `session=...` in field 2, `exit=...` in field 3, and `pid=...` in field 4. Running the Q54 awk predicate on that evidence counts **32/32 as dead**, though its actual exit values are all `exit=0`. Reproduction (lane cwd):

```sh
awk -F'\t' '$4 != "exit=0" {n++} END{print n}' .ufo/waves/round-61/w1/launcher-progress.tsv
# 32
awk -F'\t' '{for(i=2;i<=NF;i++){split($i,a,"="); if(a[1]=="exit"&&a[2]!=0)d++}} END{print d}' .ufo/waves/round-61/w1/launcher-progress.tsv
# 0
```

Evidence: `corpus/QUALITY.md:922-925` (Q54 command/failure condition); R60 spot-check `corpus/lessons/round-60-verifier-spotcheck.md:70-75`; R61 TSV `.../round-61/w1/launcher-progress.tsv` (first records, six fields); R60 TSV gives 27 dead by the stated `$4` parser. Smallest correction: parse named `key=value` fields in every row, rather than fixed positional columns, and use the parsed seat/exit/session values in the report check. This is a concrete false-positive against a subsequent round, not a dispute about the R60 demonstration.

### Q57 — adversarial acceptance can escape the explicit failure predicate (coverage)

Q57 names two obligations: reject do-nothing and **distinguish honest-input from adversarial**. Its command asks to run only the honest and do-nothing fixtures. Its “Fails when” clause rejects do-nothing HELD or an honest fixture that cannot reach target, but never says to fail when a forged/adversarial fixture also reaches HELD. Thus a counter that accepts honest work and accepts an adversarial forged record, while rejecting do-nothing, passes the written failure rule despite not distinguishing the two controls. R61 C2 is a demonstrated instance of this precise adversarial gap: `w1/CritControlC2.md:3-5,31-35` reports honest-work/vacuity defects and a forged off-Registry build reaching `DOCTRINE61_HELD 6/6`; round-61 lesson `corpus/lessons/round-61.md:16,35` records the claim as failed. C1's do-nothing result is separately explicit at `w1/CritControlC1.md:13-15`.

Smallest correction: require a separately named adversarial control and state that the frozen counter must reject it (with the specified verdict/exit), in addition to requiring honest input reach target and do-nothing miss. Otherwise the criterion does not falsify the forged-HELD behavior it explicitly invokes.

## Checks that held up

- **Q52:** Grounding to R60 spot-check lines 171–174 and §1 line 26 is present. The filed report is at fleet commit `7b0581ed`; its six placeholder occurrences are at lines 4, 5, 73, 88, 96, 190. The cited lane `SCORECARD.md` placeholders remain in committed HEAD lines 2833 and 2847. The pin prefix `c7f7c401` is present twice in committed `.ufo/pins/source-captures.json`. No missing-line citation found.
- **Q53:** R60 spot-check lines 175–177 and §2 lines 76–78 support the example: report line 85 says 9/10 and only A10, while committed `close/dispatch60-work.txt` and scorecard line 2830 say 8/10, A7 and A10 missed. No missing-line citation found.
- **Q55:** R60 spot-check lines 178–180 and §2 lines 67–69 document the original nonexistent files. The files now exist at lane HEAD `be4a820c`; their lines demonstrate the remaining content failure: dispatch tip says `DISPATCH60_UNMET held=8/10`, not the report's `DISPATCH60_HELD held=10/10`; doctrine says `HELD 6/6`. The cited measured revision remains a placeholder in the report, as stated. No missing-line citation found.
- **Q56:** The cited R61 lesson §Mistakes is present at line 34; the following paragraph at line 35 describes the round-61 application. The identity mapping is independently evidenced in `build/ScoutQuarantineRegister/verdicts.md:170-197`, including register S109→lane-held document S125, S118→S134, and S178→S194. Its warning about identity rather than numeric IDs is therefore grounded; no missing-line defect found.

## Smallest safe changes

1. Q54: make progress parsing key-based rather than positional, and keep the report requirement tied to that parsed schema.
2. Q57: add explicit adversarial-control execution and a failure clause requiring the adversarial input to miss; retain the positive honest and negative do-nothing checks.

No tool installs/updates.