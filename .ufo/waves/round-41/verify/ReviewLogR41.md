RESULT ReviewLogR41 rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=minor mismatches=3

Scope: the LOG.md round-41 entry (last bullet, LOG.md:1811-1830) checked against the 8-commit
list a58b7f72..fae386aa and corpus/lessons/round-41.md. Read-only review; the only lane write is
this report. No tools installed or upgraded (none needed).

Mismatch definition used for the count: a range commit named in neither the LOG entry nor the
lesson. Under a LOG-entry-only reading the count is 6; under a hash-validity reading (every hash
the entry names is real and correctly attributed) it is 0. All claim-figure checks and all
statement-vs-bytes checks returned 0 mismatches; the only failing clause is "every commit named".

## Findings

M1 (minor, commit naming) — 02fef27 is named nowhere in the LOG entry or the lesson. It is the
commit that wrote the round-41 LOG entry itself (`git log a58b7f72..fae386aa -- LOG.md` →
`02fef27 round-41: falsify repairs …, lesson, LOG, SCORECARD round-41 section and corrections,
wave evidence`), so it is structurally self-unnameable in that entry; but the lane's own
round-38 precedent (appended "round 38 CORRECTION" and "round 38 falsify integration receipt"
LOG entries) shows retroactive naming is the house convention, and no attempt-2 entry exists:
the round-41 entry is still the file's last bullet, byte-state of 02fef27.

M2 (minor, commit naming) — 5320e0d (cite-check self-observation guard + re-pin, claim-sizing
wording fixes, falsify reports) is named nowhere in LOG or lesson. Its content is partially
covered: the lesson's Open limits describe the guard repair ("After the falsify wave the child
marker is any value of the variable…"), but the commit itself is never named and the LOG entry
(older than it) says nothing about it.

M3 (minor, commit naming + record currency) — fae386a, the attempt-2 commit, is named nowhere
in LOG or lesson. Its content (WC21–WC23, the three inherited wave-census repairs, S018 re-open,
the ReviewCensusCode.md misroot move, Mistakes rows, 8 falsify reports) is documented only in
the lesson (Claims, Gate, Mistakes sections), which the LOG entry cites by path without any of
it. A reader of LOG.md alone sees no attempt 2 at all: no WC21–23, no 23/23, no S018, no
misroot recovery, no Mistakes table pointer.

Non-findings (checked, no mismatch): the LOG entry names 2 of the 8 range commits directly
(68db3419, 4e58bb0e) plus round open a58b7f72 and pin 31c465f1 — all four hashes real and
correctly attributed (a58b7f72 is 34fccc1's parent; 68db3419/4e58bb0e are in the range). The
lesson names 3 more (34fccc17 as the plan commit, cb2d8d09 "before its first run", 27592977
"before the instrument"), all hash-prefix-correct. 34fccc1, cb2d8d0, 2759297 predate the
entry's write yet are unnamed in the entry — covered only by the lesson.

## Claim figures vs receipts (all match; 0 mismatches)

- "pins the 16 verdict, render and exit conditions round 40's scout found unpinned" —
  .ufo/waves/round-40/build/ScoutCiteVerdict.md:1 `unpinned=16` with exactly the 16 names the
  probe runs.
- "11 new hermetic cases (64 → 75)" — cite-mutants-open-a58b7f72.txt `CONTROL … cases=64/64`;
  cite-mutants-measured/final receipts `cases=75/75`; 75−64=11.
- "survived=15/16 at open" — cite-mutants-open-a58b7f72.txt final line
  `CITE_MUTANTS survived=15/16 nomatch=0 crash=0 control=PASS rev=a58b7f72afc1…`; only
  `resolved>0` reads `killed` (the entry's implication matches).
- "0/16 at 68db3419 and 4e58bb0e" — both receipts end
  `survived=0/16 nomatch=0 crash=0 control=PASS rev=68db3419676b…` / `…rev=4e58bb0ee48a…`.
- "the jq recount over rounds 38–40 reads 0 mismatches" — wave-recount-measured-4e58bb0e.txt
  and wave-recount-final.txt: `RECOUNT_MISMATCHES=0`, 7 rows per listing (both sides shown).
- "`--expect build:mutation-tester=4` on round 40 exits 1 (the R40-6 slip)" — same receipts:
  `EXPECT_4_EXIT=1 EXPECT_3_EXIT=0`.
- "34-seat build payload" — `jq '.taskCall.tasks|length' build-dispatch.json` → 34; roles
  connector 1, critic 7, executor 4, mutation-tester 3, reviewer 9, scout 8, scribe 2 (matches
  the lesson's list exactly).
- "seat gate timed out at 3600 s / never spawned" — evidence-seat-gate.txt: "bash timeout
  requested 3700 s, clamped by the host to 3600 s … no grant … The wave was never dispatched:
  0 seats spawned."
- "the falsify wave ran 34 live-role seats" — falsify-dispatch.json `.taskCall.tasks|length` →
  34 (critic 16, reviewer 13, scout 4, connector 1 — all four live roles); seat-gate record:
  "Spawned 34 background agents using reviewer, critic, scout, connector."
- "R40-1/3/5/6/7 fixed, R40-2 recorded, R40-4 open" — matches the lesson's R40 table; R40-3
  figures in cite-receipt-r40-3.txt: `errors=545`, REV_UNKNOWN classified `1 external-url` +
  `32 not-in-url` (matches "1 … inside its own row's URL (S036) and 32 are not"); R40-5:
  kimi-skills-plugins.md `## ~/.kimi-code/skills/kimi-webbridge` names S035; R40-7:
  corpus/README.md:117 round-40-spotcheck row "row added in round 41 | commit a58b7f7";
  R40-1: SKILL.md:606 anchor-truth row names `--open REV`.
- "gate registry row" — SKILL.md:607 wave-census registry row; "checklist items 16–17" —
  SKILL.md:690-691 (wave census of round 40; wave-census hermetic suite); "capability row" —
  SCORECARD.md:1681 `wave-census` capability row, `CAPABILITY_ROWS=2` in receipts; "S038" —
  SOURCES.md:51 row exists (own-work, pin sha 1d33a03f… matches the lesson).
- "S035 re-opened (front matter unchanged)" — kimi-skills-plugins.md:228-230 "re-opened
  read-only on 2026-10-22 in round 41 … still reads `name: kimi-webbridge` and
  `version: "2.0.26"`".
- "live Kimi drift ~/.kimi-code/locks … (named, not changed)" — lesson Open limits +
  falsify/CritCalibration.md:24 `KIMI_CENSUS: DRIFT (UNLISTED locks)`, checklist 16/17.
- "the L1 built both claims" — evidence-seat-gate.txt: "The L1 built C1 and C2 itself (commits
  cb2d8d09, 68db3419, 27592977, 4e58bb0e)."
- "Lesson corpus/lessons/round-41.md" — file exists (1830-line LOG's cited companion).

## Statement-vs-bytes (0 overstatements found)

- "injected-failure child run so the suite observes its own verdict and exit code" — backed by
  falsify/CritClaimSizing.md (injection read at cite-check.mjs:2457 inside `selfTest`; the diff
  adds 11 `check(` calls) and by the suite self-observation mutants reading `killed` at
  68db3419/4e58bb0e/fae386aa (receipts above).
- "R40-2 … its re-measure seat died in the attempt-1 restart; not re-measured" —
  falsify/ has no ReviewHonestReMeasure.md, and evidence-seat-gate.txt lists it among the 7
  dead attempt-1 seats (absence consistent with the claim).
- No sentence in the entry states a number or event I could not reproduce from committed bytes.

## Residual risk and verification gaps

- Count sensitivity: mismatches=3 rests on crediting the lesson as a co-record. LOG-entry-only
  → 6; hash-validity-only → 0. The L1 should pick the definition it pre-registered; my count is
  stated with both alternates so the choice is visible.
- I did not re-run cite-check/wave-census myself; the C1/C2 counters are verified here against
  the committed receipts only (three other verify seats own the re-runs). One falsify receipt
  (CritCalibration row 15) notes the pre-attempt-2 file set lacked an after recount receipt —
  wave-recount-final.txt now supplies it at fae386aa, so that finding is stale, not mine to judge.
- S035's "front matter unchanged" rests on the knowledge note's re-open sentence and the falsify
  receipt, not on my own read of ~/.kimi-code (host state, out of my item's scope).
