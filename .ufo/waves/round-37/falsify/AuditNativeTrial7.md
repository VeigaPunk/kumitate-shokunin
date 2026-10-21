AUDIT NativeTrial7 anchors=2 false=1 overreverted=0 notice=ok verdict=partial

Scope. The assigned partition is void at HEAD: `git diff 0614092` on the note is one inserted notice line. Audited blob 7421f24a (HEAD c589b38). The note went 2de70ea (round-37 v1) -> 53af1ab5 (reset, 5bc40d0) -> 7421f24a (amended) during this audit. I kept the slice the assignment defined on v1: the 7th of the 9 base-diff anchors (A7 under a last-remainder split, A8 under a first-remainder split; both audited). overreverted=0 is slice-scoped; the note-wide count is in section 3.

| id | note line | pin file | symbol | 0614092 -> pin | now -> pin | base rev 964f443e | v1 -> pin | call |
|---|---|---|---|---|---|---|---|---|
| A7 | 385 | scripts/collect-omp-native-handoff-lib/base.mjs | EVIDENCE_KIND | :133 TRUE | :133 TRUE | TRUE | :62 FALSE (comment) | restored and true |
| A8 | 418 | scripts/collect-omp-native-handoff-lib/policy.mjs | resolveNativeProfile | :619 FALSE; symbol at :637 | :619 FALSE | TRUE | :722 FALSE (readRoundPlan) | false at pin; pre-existing, carried as debt |

## 1. Commands and output
1. `git -C <lane> diff --stat 0614092 -- corpus/knowledge/native-trial-launch.md` -> `1 file changed, 1 insertion(+)`. `git -C <lane> diff -U0 0614092 -- <note> | grep '^[-+][^-+]'` -> one `+` line (notice, line 2), no `-` line.
2. `read /fast/scratch/kumitate-r36/src/scripts/collect-omp-native-handoff-lib/policy.mjs:619,637,722` -> `619: herdWindowMs: input.backpressure.herdWindowMs,` / `637: export function resolveNativeProfile(config, name) {` / `722: export function readRoundPlan(runRoot, manifest) {`
3. `read .../collect-omp-native-handoff-lib/base.mjs:62,133` -> `62: // always the capacity prefix plus the classifyFailure class.` / `133: export const EVIDENCE_KIND = {`
4. `git -C /fast/scratch/kumitate-r36/src show 964f443e:<policy.mjs|base.mjs>` at the same lines -> `policy.mjs:619: export function resolveNativeProfile(config, name) {`; `base.mjs:133: export const EVIDENCE_KIND = {`.
5. Pin: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` -> `31c465f15669...`; `git status --short` -> empty.
6. Strict pass (python): for each of the note's 56 `` `sym` (`[path]:N`) `` anchors, test pin line N for `\b(function|const|let|var|class)\s+SYM\b`. Result: 19 defined on the cited line, 37 not, 0 out of range.
7. Ratchet (read only): `.ufo/pins/fidelity-ratchet.json` -> total 200, revision 31c465f1..., `notes["corpus/knowledge/native-trial-launch.md"]` = 31.
8. Gate source (read only, not run): `scripts/claims-check.mjs:264-311`.
9. D1 text: `corpus/lessons/round-36-verifier-spotcheck.md:193-195`.

## 2. Slice
- A7 `EVIDENCE_KIND`: restored and true at the pin. v1 had `:62`, a comment, so v1 was restored-but-false. The reset fixed it.
- A8 `resolveNativeProfile`: restored and false at the pin. `:619` is not the symbol's line at 31c465f1; the definition is at `:637`. The same line is TRUE at 964f443e, so this is pre-existing pin debt. Read literally, the failing condition ("restored anchor whose symbol is not on its line") refutes on A8 alone. I score partial because the notice does not claim pin truth for it. Overrule if the literal reading governs.
- overreverted in slice: 0. Neither A7 nor A8 had a pin-true round-36 value to lose.
- Outside the slice (pin status now): A1 `die` L329 FALSE (defined :838); A2 PROPOSAL L355 FALSE (:115); A3 snapshotDispatchInputs L357 FALSE (:176); A4 `die` L360 FALSE (:838); A5 parseArgs (collector) TRUE (:120); A6 writeEvidenceFile L372 FALSE (:955); A9 loadCanonicalDirective L420 FALSE (:897). All six false ones are TRUE at 964f443e.

## 3. Note-wide scan (invisible to a base-diff partition, which the reset empties)
- 35 anchors differ between round 36 (3d5760a) and base. The reset puts all of them back at base values.
- 19 of those were TRUE at the pin in round 36 and are FALSE on the base line at the pin (symbol absent at base line). Each round-36 line is the symbol's definition at 31c465f1:
  - L354 PROFILE :56 -> base :50
  - L355 PROPOSAL_WAVE_CEILING :115 -> :109
  - L356 parseArgs :851 -> :844; L356 planLaunchMode :965 -> :958
  - L358 resolveNativeDispatchPolicy :639 -> :646
  - L359 handOffToSightingWall :1289 -> :1282
  - L372 validateDispatches (collector) :873 -> :869
  - L373 persistEvidenceWrites (collector) :977 -> :973
  - L406 attemptLedgerEntry :71 -> :70; L406 seatStatus :476 -> :474
  - L407 verifyEffectiveLaunch :633 -> :631; L408 buildCostLedger :1005 -> :1003; L409 appendRoutingHealth :1071 -> :1067
  - L416 splitRoute :66 -> :39; L417 loadSeatRoutingMirror :173 -> :155; L418 verifyLaunchSeatRouting :301 -> :283
  - L419 readRoundPlan :722 -> :704; L420 waveTokenFromContext :798 -> :780; L421 parseRateCard :926 -> :908
- Weak, not counted: `die` L360 (round-36 :4315 is a comment mentioning die); taskDispatches L396 (round-36 :20, a comment).
- All 36 base values are TRUE at 964f443e. The reset is exact against the base revision and loses these 19 only against the pin.
- v1 (5ceb8cd) had the same 19.

## 4. Notice (7421f24a, line 2)
- Present: yes.
- "reset to its 0614092 bytes": TRUE (one inserted line).
- "round-36 shift-repair is removed": TRUE.
- "no anchor here is a round-36 artifact": TRUE as bytes. It implies round-36 values were wrong, but 19 were pin-true (section 3). The reset discards them and the notice does not say so. D1 (`corpus/lessons/round-36-verifier-spotcheck.md:193-195`: "keep the base line wherever its symbol is still on that line") would keep those 19 round-36 lines. The notice no longer cites D1.
- "pre-existing anchors already false at the pin remain as ratcheted fidelity debt": UNVERIFIED. The ratchet records 31 for this note. The gate's ok test is a substring match and it sweeps only sections with a resolvable head, so its count and my strict count (37 of 56) are not comparable. I did not run the gate.
- "re-verification against the pin is owed" and "do not claim this note as pin-true": TRUE (37 of 56 not on their line at the pin).
- Verdict: notice=ok on scope. Flags: undisclosed discard of 19; ratchet clause unverified.

## 5. Superseded state (v1, 5ceb8cd)
- The v1 notice said all anchors were reverted to 0614092 lines. Nine base-diff anchors were not (A1-A9). A7 `:62` and A8 `:722` were both off their symbol at the pin. The v1 notice misstated scope: refuted.
- v1 restored 4 anchors correctly (base.mjs PROPOSAL :96, DEADLINE :173, GODSPEED :120; events normalizeTranscriptEvent :16).

## 6. Gaps and actions
- Gate not run by me. Main should run `--fidelity --fidelity-ratchet` once at HEAD to settle the ratchet clause.
- Revision choice: the sections claim 964f443e, where the reset is exact. At 31c465f1, 19 pin-true anchors are lost. The lane must decide which revision the note claims, and disclose the 19 if it keeps the reset.
- Partition: the base-diff set is empty at HEAD. Groups 1-8 need reissuing, or use the 35-anchor round-36-to-base set.
- Blob churn: audited 7421f24a. A later blob needs re-checks of A7/A8 (two line reads) and the 19-set, which is unchanged while the note equals base bytes.
- No installs. Writes: this report only.
