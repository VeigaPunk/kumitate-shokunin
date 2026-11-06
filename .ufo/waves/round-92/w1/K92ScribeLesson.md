# K92ScribeLesson — scoped findings (round-92 scribe, lesson draft)

## Behavior
- Drafted `corpus/lessons/round-92.md`'s replacement in the round-91/90 shape: `.ufo/waves/round-92/K92ScribeLesson/round-92-lesson-draft.md`. `## Gate` contains only `<L1 fills>` slots (candidate/tool, Q86, knowledge entry, constructions, clause-(c) rejects); the kill-rule verdict is a slot too. `### Sources opened this round` is present (S266–S268).
- Drafted QUALITY **Q86** (next free after Q85; Q78 is a bullet, so heading counts undercount): `.ufo/waves/round-92/K92ScribeLesson/quality-criterion-draft.md`, in QUALITY.md's Rule/Grounding/Who checks/Field/Command/Fails when/Shown able to fail/Limit shape, with a Limit line.
- `## Mistakes` carries two mined rows: M92-1 (five-round visible-probe keyability streak r87–r91; "the scorer, not the instrument") and M92-2 (r91 mutation tally 7/11 vs 6/11), plus the `considerthese/2026-11-05.md` idea-3 assimilation paragraph (dated; cites the plan's fresh-start section and records the two divergences: C is drawn by the counter from a visible index, and the N=3 flag fired at N=5).

## Gates
- **Recount (M92-2).** `awk` over `K91Mutation/mutants.txt` (sha256 `c164893b…b83f`): 11 mutant rows excluding `m00-pristine`; `UNMET_rows=6` (m01,m03,m04,m05,m06,m09), `HELD_rows=6` (m00 + m02,m07,m08,m10,m11), killed 6/11 = 55%; the file's own survivor list has five entries, so `KILL RATIO: 7/11 killed = 64%` contradicts its own rows. Matches verifier §5.1.
- **Streak.** r87 `cand-a-worktree` 12/12 (`round-87.md:24-27`); r88 nine constructions 20/20 (`round-88.md:24-25`); r89 two 30/30 incl. a computes-nothing tool (`round-89.md:25,30-31,40`); r90 three 47/47 (`round-90.md:42-45`); r91 three 56/56 (`round-91.md:70-72`). MANIFEST `rounds[1274|1285|1292|1332|1391]` are r87–r91; non-author §2 of the r89/r90/r91 spot-checks confirms each.
- **Q86 free-number check.** `QUALITY.md` sha256 `9d706544…6a21`; max Q = 85.
- **Sources.** Re-hashed the L1's `open/` captures: session.md `6a7a2375…`, session-entries.ts `4035dad3…`, types.ts `22ea739a…` — equal to `open/sources-fetch.txt`; quote lines located by `grep -n` (session.md:236, session-entries.ts:148, types.ts:1081,1360).
- **Controls table read** (not run): nine non-positive controls `UNMET` 0/133…132/133, positive oracle `HELD agree=133/133`; salt is the first 16 hex of `tool_sha256` in every row.

## Touched surfaces
Wrote only `.ufo/waves/round-92/K92ScribeLesson/` (3 drafts/receipts) and `.ufo/waves/round-92/w1/K92ScribeLesson.md` (this report). No lane file edited; no git/jj command run; no probe or candidate executed; no transcript copied.

## Out of scope / not done
- Did not score `scripts/seat-route.mjs` or any construction (L1's job). `K92ExecTool/seat-route.mjs` is present (32767 bytes) but `READY` was absent at 15:52, so the draft's Gate references it by path only.
- Did not decide admit/reject for anything; `## Gate` slots are empty by design.
- Did not append to `corpus/lessons/round-92.md` or `corpus/QUALITY.md`.

## Findings
1. `K91Mutation/mutants.txt` printed ratio is wrong by arithmetic (6/11, not 7/11); propagated to the r91 report/SCORECARD, so the correction must be appended in three places, not one.
2. Q82/Q84/Q85 each can fail and each caught only its own slice (Q82 r89, Q84 r90, Q85 r91); none forbids scoring on a pre-frozen input set — that is the five-round residual, now Q86's subject.
3. The held-out design's own weak point: `probe/index92.tsv` is visible at freeze, so the hold-out comes from the salt (`sha256(tool bytes)`, not final until the tool is) plus the post-freeze wave, not from the index being hidden. Recorded as a Limit, not smoothed.

## Artifacts
- `.ufo/waves/round-92/K92ScribeLesson/round-92-lesson-draft.md`
- `.ufo/waves/round-92/K92ScribeLesson/quality-criterion-draft.md`
- `.ufo/waves/round-92/K92ScribeLesson/recount-mutants.txt`
- `.ufo/waves/round-92/K92ScribeLesson/streak-evidence.txt`
- `.ufo/waves/round-92/K92ScribeLesson/sources-check.txt`
- `.ufo/waves/round-92/K92ScribeLesson/quality-number.txt`
