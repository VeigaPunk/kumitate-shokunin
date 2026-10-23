# ScribeReadme — scoped findings

## Behavior
- Produced one proposed `corpus/README.md` map row for `lessons/round-48.md` in `ScribeReadme-frag.md`.
- Emitted no `corpus/knowledge/` row. Main confirmed that the only new corpus file landing this round is `corpus/lessons/round-48.md`; S098 is a SOURCES entry, not a knowledge note.
- The row describes R47-1 reruns, R47-2/R47-3 corrections, R47-4 checklist follow-up, S098's parser topic, C1/C2 subject matter, and the two mined mistake classes. It claims no C1/C2 score or outcome.

## Gates and evidence
- Read `.ufo/waves/round-48/plan.md`, including the attempt-2 addendum, and checked the current README map-row style (`corpus/README.md:137-142`).
- The requested attempt-1 README artifact does not exist: reading `.ufo/waves/round-48/build/ScribeReadme.md` returned not found. Main independently confirmed that no attempt-1 README fragment existed. I read the available inherited `.ufo/waves/round-48/build/ScribeMistake.md` and verified its cited sources and receipts before using its two mistake topics.
- Read `.ufo/waves/round-48/probe/receipts/rc-at802-parser.txt:1-16`: the three logs show A2 capped counts 106/106, 105/106, 103/106, while F48 reads 106/106 in all three; padded resumed `execve` counts are 14, 7, 15. SHA-256: `81648fa88c844552fb7999a4728a9e1b0c1af3ea412b1803b114465af760237d`.
- Read `corpus/lessons/round-47.md:105-125`, `corpus/lessons/round-47-verifier-spotcheck.md:28-29,59-60,183-192`, `SCORECARD.md:2082-2084`, and `corpus/QUALITY.md:652-721`. The lesson and verifier spot-check support the cancellation/provenance topic. The scorecard states all fourteen controls were 0/5, while the cited receipts include a 3/5 and a 1/5.
- The specialized grep query `A2|held=0/5|held=3/5|held=1/5|all fourteen controls` over `.ufo/waves/round-47/probe/receipts/a2-controls.txt` and `a2-ctl-retparse2.txt` located the calibration `held=1/5` at `a2-controls.txt:23` and `held=3/5` at `a2-ctl-retparse2.txt:6` (both exit 1); this confirms the cited aggregate discrepancy.
- Read-only `git show fe3d45bf929246915c8c0de5f7f8682b5015b22c:<path> | sha256sum` matched `sha256sum <path>` for each tracked source below, confirming the inspected working-tree bytes equal the frozen tip:
  - `corpus/lessons/round-47.md` — `060b9346ad244c9cbde440db39ccc269ec8bdbb51015ef829869b0c9cbf65493`
  - `corpus/lessons/round-47-verifier-spotcheck.md` — `656cf95ab47f1c4ed423f6af10017abe1a41e189caffee7499babd29636e5294`
  - `SCORECARD.md` — `4c8fc0e68bc72872d637f194ebe38315f28e50d9c11528408b3c442ae289739b`
  - `corpus/QUALITY.md` — `c4d78a536d2f1ac5b4a42b67a1f568768dcadcb2d74a9b4d9ee3f678f7346b7e`
  - `.ufo/waves/round-47/probe/receipts/a2-controls.txt` — `39d1c3c4dcb3c82d37c897e9918457166b6cb65b07e12dfc22fba05e8046bba5`
  - `.ufo/waves/round-47/probe/receipts/a2-ctl-retparse2.txt` — `286e29740621216cf51d0e71bc41a521a31c8eaea128f2fed10b9b452de9fbd1`
  - `.ufo/waves/round-48/probe/receipts/rc-at802-parser.txt` — `81648fa88c844552fb7999a4728a9e1b0c1af3ea412b1803b114465af760237d`

## Touched surfaces and out of scope
- Wrote only `.ufo/waves/round-48/r48/ScribeReadme-frag.md` and this report. No tools were installed.
- Did not edit `corpus/README.md`, `corpus/`, `SCORECARD.md`, `LOG.md`, source code, or any judge; no commits or pushes; no builds, tests, counters, or source probes run.

## Findings and known limits
- At authoring time, `.ufo/waves/round-48/r48/ScribeLesson48-lesson.frag.md` was not yet present. The proposed row is grounded in the frozen plan and the inherited mistake draft; L1 should reconcile its wording against the lesson draft before applying it.
- `.ufo/waves/round-48/r48/ScribeSources98-map-row.frag.md` is a concurrent alternative row for the same lesson from another assigned seat. Main was notified; apply one map row only.
- Artifact paths: `.ufo/waves/round-48/r48/ScribeReadme-frag.md`, `.ufo/waves/round-48/r48/ScribeReadme.md`.
