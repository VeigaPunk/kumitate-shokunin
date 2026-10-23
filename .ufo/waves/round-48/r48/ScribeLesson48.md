# ScribeLesson48 — scoped evidence report

## Behavior

Prepared a full draft for `corpus/lessons/round-48.md` as an unlanded fragment. It carries two mistake lessons from the inherited `ScribeMistake.md`: incomplete trace parsing (including the separately documented PID-prefix failure) and non-receipt-backed/cancelled-seat close claims. It includes a source Gate with S098 as a pending candidate, plus an explicit close-time record skeleton for C1, C2, R47 repairs, H1–H4, source disposition, and final verdict.

This is drafting evidence only. It does not claim C1/C2 verification, a round close, or that any R48 final gate passed.

## Gates and findings

- Read `.ufo/waves/round-48/plan.md` first, including attempt-2 addendum. It records the frozen base/tip, C1/C2 predicates, attempted R47 repairs, wave contract, and that S098 was still `queued` in the inherited source draft.
- Verified the return-column receipt directly. `rc-at802-parser.txt` gives A2 capped counts `106/106`, `105/106`, `103/106`; the round-48 parser reads `106/106` for all three logs. It also records padded resumed `execve` examples.
- Read and verified the additional PID-wrap receipt against plan lines 17–24: A2 n/capped values `104/99`, `103/99`, `104/96`; fixed parser `106/106` for all three. The plan itself limits the evidence: it does not establish that strace never drops an entire traced event.
- Verified `corpus/lessons/round-47.md:105-110,122-125`: three `3/5, 3/5, 4/5` readings support the close conclusion while their seats are listed as cancelled. The verifier spot-check says they were IRC readings without committed receipts.
- Verified `SCORECARD.md:2082-2084` against both cited receipts. The claim that all fourteen controls were `0/5` conflicts with `a2-ctl-retparse2.txt` (`held=3/5`, exit 1) and the calibration section in `a2-controls.txt` (`held=1/5`, exit 1). The non-author spot-check independently records the defects.
- The R47 lesson and SCORECARD bytes match their frozen-tip `git show` outputs (hashes below), so the cited wording is present at `fe3d45bf` as well as in the current files.
- Gate status remains conservative: S098 is in the inherited `ScribeStraceManual.md` draft, but the plan calls its status `queued`, no S098/S099 row was found in `corpus/SOURCES.md`, and `/tmp/kumitate-r48-strace72.in` was unavailable for this seat's independent source-byte check. The fragment does not present S098 as admitted or rejected.

## Commands and outcomes

Read-only evidence inspection:

- `read` `.ufo/waves/round-48/plan.md` and selected addendum/frontier lines; `read` `.ufo/waves/round-48/build/ScribeMistake.md`, including full lines 7 and 9; `read` the cited parser receipt, R47 lesson lines 105–125, SCORECARD lines 2082–2084, verifier spot-check lines 28–29, 59–60, 183–192, and both cited R47 control receipts.
- `functions.grep` for `capped=106|capped=105|capped=103|padded_resumed_execve|resumed>)` in `rc-at802-parser.txt` found the cited parser counts and resumed-record lines.
- `functions.grep` for `Re-runs disagree|Cancelled at the budget stop|3/5, 3/5 and 4/5` in `corpus/lessons/round-47.md` found the claim and cancellation list.
- `functions.grep` for `all fourteen controls read 0/5 under A2` in `SCORECARD.md` returned no exact match because the sentence wraps over physical lines; the subsequent `read` of lines 2082–2084 shows the wording and citations.
- `functions.grep` for `S098|S099` in `corpus/SOURCES.md` returned no matches.
- `read` `/tmp/kumitate-r48-strace72.in:148-158,832-835` returned `Path ... not found`; no upstream fetch was rerun.
- Hash check command and outputs:
  ```sh
  sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/receipts/rc-at802-parser.txt /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/receipts/a2-ctl-retparse2.txt /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/receipts/a2-controls.txt /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-47-verifier-spotcheck.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-47.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md
  ```
  produced, in that order:
  - `81648fa88c844552fb7999a4728a9e1b0c1af3ea412b1803b114465af760237d` — R48 parser receipt
  - `286e29740621216cf51d0e71bc41a521a31c8eaea128f2fed10b9b452de9fbd1` — R47 retparse control receipt
  - `39d1c3c4dcb3c82d37c897e9918457166b6cb65b07e12dfc22fba05e8046bba5` — R47 controls receipt
  - `656cf95ab47f1c4ed423f6af10017abe1a41e189caffee7499babd29636e5294` — R47 verifier spot-check
  - `060b9346ad244c9cbde440db39ccc269ec8bdbb51015ef829869b0c9cbf65493` — R47 lesson
  - `4c8fc0e68bc72872d637f194ebe38315f28e50d9c11528408b3c442ae289739b` — SCORECARD
- Frozen-tip comparison commands:
  ```sh
  git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show fe3d45bf929246915c8c0de5f7f8682b5015b22c:corpus/lessons/round-47.md | sha256sum
  git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show fe3d45bf929246915c8c0de5f7f8682b5015b22c:SCORECARD.md | sha256sum
  ```
  returned the same `060b9346ad244c9cbde440db39ccc269ec8bdbb51015ef829869b0c9cbf65493` and `4c8fc0e68bc72872d637f194ebe38315f28e50d9c11528408b3c442ae289739b` hashes as the current lesson and SCORECARD files.
- PID-wrap receipt hash command: `sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/receipts/rc-at802-pidwrap.txt`; output `df4c77c3afc93700310e0f6d6f9cc17d68124a0b2727ef3cefe662ddc428553a`.
- No build, test, selftest, counter, checklist, proxy check, census, or strace command was run. No tool was installed or updated.

## Touched surfaces

Created only these two seat-prefixed artifacts under the assigned R48 directory:

- `.ufo/waves/round-48/r48/ScribeLesson48-lesson.frag.md` — full lesson draft fragment.
- `.ufo/waves/round-48/r48/ScribeLesson48.md` — this report.

No edits were made to product/probe code, `SCORECARD.md`, `corpus/`, `LOG.md`, lane git/jj state, or other repositories.

## Out of scope and known limits

- The L1 must apply/review the fragment and complete the record skeleton at close; neither output file edits `corpus/lessons/round-48.md`.
- C1 score and same-commit reruns, C2 selftest and real AGREE receipt, H1–H4 close results, residual wave accounting, S098 final source decision, and final verdict remain for the L1 to fill from committed evidence.
- The cited parser receipts show loss/recovery on captured logs. They do not prove the tracing system itself cannot omit an entire event.
- No source-byte claim for S098 was independently re-fetched or checked here.
- No tools were installed or updated.

## Artifact paths

- `.ufo/waves/round-48/r48/ScribeLesson48-lesson.frag.md`
- `.ufo/waves/round-48/r48/ScribeLesson48.md`
