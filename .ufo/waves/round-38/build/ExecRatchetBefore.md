EXEC ExecRatchetBefore baseline=CLEAN/0 a_shift=CLEAN/0 a_raised=CLEAN/0 b_swap=CLEAN/0 c_prose=CLEAN/0
{"type":"run","case":"baseline","verdict_line":"FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)","exit_code":0}
{"type":"anchor","case":"a_shift","note":"corpus/knowledge/sighting-wall.md","note_line":141,"symbol":"MANIFEST_SCHEMA","before":41,"after":49,"next_symbol":"MAX_MANIFEST_BYTES","true_at_before":true,"shift_verdict":"FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)","shift_exit_code":0,"ratchet_ceiling_before":20,"ratchet_ceiling_after":21,"raised_verdict":"FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)","raised_exit_code":0}
{"type":"anchor","case":"b_swap_1","note":"corpus/knowledge/sighting-wall.md","note_line":119,"symbol":"resumeMissionLocked","before":3682,"after":3762,"verdict_line":"FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)","exit_code":0,"true_at_before":false}
{"type":"anchor","case":"b_swap_2","note":"corpus/knowledge/sighting-wall.md","note_line":119,"symbol":"resumeMission","before":3762,"after":3682,"verdict_line":"FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)","exit_code":0,"true_at_before":false}
{"type":"anchor","case":"c_prose","note":"corpus/knowledge/native-trial-launch.md","note_line":64,"claim":"Wall handoff","before":3707,"after":1,"backticked_symbol_in_sentence":false,"verdict_line":"FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)","exit_code":0,"true_at_before":false}
EVIDENCE: scratch clone /fast/scratch/kumitate-r38/ExecRatchetBefore/lane; checkout 753446a829edda519c75777ce95888443f51fa94; pinned src /fast/scratch/kumitate-r36/src reported src-rev=31c465f15669.
EVIDENCE: each run used `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json --src /fast/scratch/kumitate-r36/src`; captured `rc=$?` and printed `EXIT_CODE`.
EVIDENCE: baseline `FIDELITY_TOTAL anchors=1574 ok=702 elsewhere=169 absent=31 dead=168 noid=504 nonok=200`; verdict `FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)`; `EXIT_CODE=0`.
EVIDENCE: a_shift `sighting-wall` stats changed from `ok=36 elsewhere=20 nonok=20` to `ok=37 elsewhere=19 nonok=19`; total nonok=199; same CLEAN verdict; `EXIT_CODE=0`.
EVIDENCE: a_raised reran that shifted note with `sighting-wall.md` ratchet ceiling 20→21 (total ceiling remained 200); same CLEAN verdict; `EXIT_CODE=0`.
EVIDENCE: b_swap retained `sighting-wall` `ok=36 elsewhere=20 nonok=20`; same CLEAN verdict; `EXIT_CODE=0`.
EVIDENCE: c_prose retained `native-trial-launch` `anchors=52 ok=15 elsewhere=31 noid=6 nonok=31`; same CLEAN verdict; `EXIT_CODE=0`.
EVIDENCE: sighting-wall note 140-142: `` `MANIFEST_SCHEMA = \"ufo-sighting-wall-v1\"` (`scripts/ufo-sighting-lib/base.mjs:41`); `MAX_MANIFEST_BYTES = 1_048_576` (`:49`) ``.
EVIDENCE: pinned base.mjs:41 `export const MANIFEST_SCHEMA = \"ufo-sighting-wall-v1\";`; :49 `export const MAX_MANIFEST_BYTES = 1_048_576;`.
EVIDENCE: sighting-wall note 118-120: `` `resumeMissionLocked` / `resumeMission` (`:3682`, `:3762`), `completeMission` (`:3339`), `reconcileLocked` (`:1976`) ``.
EVIDENCE: pinned ufo-sighting.mjs:3682 `if (runId !== undefined && row.runId !== runId) {`; :3762 `const nativeKey = nativeSessionKey(mission);`; actual function definitions are :3714 `function resumeMissionLocked(...)` and :3794 `async function resumeMission(...)`.
EVIDENCE: native-trial-launch note line 64: `13. **Wall handoff** :3707 — see below.`; no backticked symbol appears in that sentence.
EVIDENCE: pinned run-omp-native-trial.mjs:3707 `artifactPath: path.join(runDir, \"proposals\", ...),` (not wall handoff); :1 `#!/usr/bin/env node`. Thus this c anchor was already false before changing :3707→:1.
EVIDENCE: claims-check.mjs:280-286 iterates `const re = /`([^`\\n]+)`/g` and accepts anchor spans from those backticked matches; the bare prose `:1` is omitted.
