# RevLessonGate — round 61, w1 (reviewer; judged on calibration; milestone: gate format review)

**Result:** `GATE_FORMAT: AMEND`. Verdict:
`.ufo/waves/round-61/build/RevLessonGate/verdict.md`.

Reviewed bytes: `build/ScribeLessonPrep/lesson-draft.md`, sha256
`753ea1ea556bf37261cb533878ca8b4c24eaae6f2a0c642692900e73d02dddf4`, pinned at
`build/RevLessonGate/lesson-draft.reviewed.md`. The draft was revised 3× during review; the format
findings hold on all four revisions.

## Findings (by severity)

1. **Blocking — Q21 command fails as written.** `## Gate` decisions are unbulleted uppercase
   paragraphs (`ADMIT` l.64, `REJECT` l.99, `REJECT` l.113). `grep -cE '^- \*\*(Reject|Hold)'` → 0,
   `grep -c '^- no reject this round'` → 0 (`corpus/QUALITY.md:233-241`). Amend: bold bullets.
2. **Blocking — no `no reject this round` line**, though no new candidate was rejected (S195 was the
   only new candidate and was admitted; both rejects are round-60 standing ones).
3. **Blocking — criteria not named by id.** Proposed: admit Q1/Q2/Q46 (D61 E2–E4); exactly-once
   reject Q47; topology reject frozen one-theme scope (`plan.md:93-97`) + Q33 (spliced quote at
   `shokuknow/merge/kumitate/knowledge/corpus/knowledge/multi-agent-coordinator-topologies.md:41`).
   The topology entry claims band 4, and `PROVINCE.md:22` band 4 includes multi-agent failure
   research, so the reason must be theme, not band.
4. **Blocking — Q14:** `/tmp/kumitate-r61/...` is cited as evidence (l.134 and l.164; l.157 and l.187
   at `f6cefff2…`). The collision guard now has a lane copy at `build/ScoutCollisionGuard/`. The
   quarantine fetch captures still exist only under `/tmp`.
5. **Blocking for final — unfilled blanks:** `After: *re-derive…*` (l.40), the `[INFERENCE]`
   after-expectations, and the uncommitted markers (l.9, 74, 134, 159). `body.md` and
   `row-S195.txt` are untracked (`git ls-files --error-unmatch` fails).
6. **Medium:** the "re-opened" evidence for the rejects names only the package. It must also name
   the documents ScoutQuarantineRegister re-fetched (`build/ScoutQuarantineRegister/verdicts.md:96-112`).
   l.108 "rests on the id duplication alone" conflicts with l.103–105.
7. **Low:** Q52 hash half: `0b5c27ab…` (l.178) is elided and resolves to no lane commit or pin.
   Truncated measured quotes (`56% and 74% …`).

**Passes:** ≥1 admit (S195; quote at `ScoutSourceWorkerVersioning/body.md:39`, 1 occurrence,
13 words; body sha256 equals the row pin; row NF=13). ≥1 standing reject was re-opened with a
result (both "stay refused"). Each reject names a flip. 0 `__X__` template tokens. The package
re-numbering S141→S211 and S130/S132→S200/S202 is confirmed. Register lines 137–138 match.
During review the scribe fixed two calibration errors: the register's S118 `payload-absent` was
being used as a reject reason, and the S116/S202 splice was missing.

**Calibration note:** the literal Q21 command reads 0 on rounds 46–49, 51 and 54–60, including
round 60. So the lane's committed Gates have drifted from Q21's mechanical form, not just this
draft. Recorded for the L1; nothing was edited outside my build directory.

## Evidence / artifacts

- `build/RevLessonGate/verdict.md` — checklist, amendments A1–A8, proposed bullets. The proposed
  shape was checked against the Q21 commands: Reject|Hold=2, no-reject=1.
- `build/RevLessonGate/gate-check.sh` and `gate-check.out` — the checker and its output on the
  reviewed bytes. It was calibrated on round-42 (5 Reject bullets, each with a flip) and round-60
  (0/0).

## Residual risk / gaps

- The draft changed again to `447efa8a…` before filing. On those bytes Q21 still reads 0/0, `/tmp/`
  appears 2×, and the after-blank 1×, so the findings hold; line numbers after l.85 shift by ≥11.
  Re-run the Reproduce block in the verdict on the final bytes.
- Not re-fetched by this seat: the arXiv pages and the Temporal page. I relied on the
  ScoutQuarantineRegister and ScoutSourceWorkerVersioning captures, checking hashes and line
  content locally.
- `lsp`: not applicable (markdown review). Text grep was used.

Tool installs/updates: none.
