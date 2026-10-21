AUDIT RouteProbe7 anchors=3 false=3 overreverted=0 notice=bad verdict=refuted
State audited: corpus/knowledge/route-probe-cluster.md blob e529214 (commit a5d627b, round-37 repair), read at audit start. This is the state the 27-anchor base diff names. The lane has since moved: §4 covers the current reset (blob 512ed826, HEAD b90dcf0, 0614092 bytes plus a notice line). §4 is also refuted.

## 1. Method
- Changed anchors: anchor targets that differ from 0614092 (blob 1146985) in e529214. 27 = 26 line-number edits + 1 path-only edit (A4). Enumerated A1–A27 in note order. Eighths: floor((k-1)·27/8)+1 … floor(k·27/8): 1=A1–A3, 2=A4–A6, 3=A7–A10, 4=A11–A13, 5=A14–A16, 6=A17–A20, 7=A21–A23, 8=A24–A27. My slice is eighth 7.
- Truth: pinned tree /fast/scratch/kumitate-r36/src at 31c465f1. Asserted byte-equal to the committed blobs for all six members (route 1188 L, shared 159, kimi 147, models 244, redact 116, fake 392).
- Pass: the sentence's own identifier (word-bounded) appears on the cited pin line. Interior lines fail.
- Reproduce (read-only, no installs): `python3 /fast/scratch/kumitate-r37/AuditRouteProbe7/audit.py`

## 2. Slice: eighth 7 (A21–A23) at e529214
| ID | note line | sentence symbol | 0614092 / r36 / e529214 | pin at e529214 line | text on that pin line | finding |
|---|---|---|---|---|---|---|
| A21 | 198 | `emit` | 95 / 95 / 98 | n | `function emitRaw(line) {` | FALSE. `emit` is `function emit(obj) {` at 95. The base line was true at the pin; round 37 moved a true anchor onto the next symbol. Harm, not a reversion. |
| A22 | 230 | `interpretRouteHealth` | 1164 / 1164 / 1015 | n | `if (!row \|\| typeof row !== "object" …) {` | FALSE. Definition is at 1008; 1015 is an interior line. Base 1164 is also false, so no true improvement was reverted. |
| A23 | 311 | `spawnCollect` (table) | 678 / 678 / 813 | n | `"--no-title",` | FALSE. Call is at 804, definition at 669. Base 678 is `}`, also false. |

Slice totals: anchors=3 false=3 overreverted=0. No slice anchor is restored to its 0614092 line, so none can be an overreversion.

Command output (audit.py, excerpt):
```
slice eighth 7: items 21..23 of 27
-- A21 e529214 line 198 [fake] symbol='emit'
   pin 98: n :: function emitRaw(line) {
   pin base 95: Y :: function emit(obj) {
   pin r36  95: Y :: function emit(obj) {
   symbol 'emit' actually on pin lines: [88, 95, 214, 217]
-- A22 e529214 line 230 [route] symbol='interpretRouteHealth'
   pin 1015: n :: if (!row || typeof row !== "object" || Array.isArray(row)) {
   symbol 'interpretRouteHealth' actually on pin lines: [1008, 1053, 1056]
-- A23 e529214 line 311 [route] symbol='spawnCollect'
   pin 813: n :: "--no-title",
   symbol 'spawnCollect' actually on pin lines: [669, 804]
```

## 3. Notice (e529214, line 2): present, inaccurate. Verdict: bad
Quoted: "Anchors in this note were reverted to the lines their 0614092 sentences named, because the round-36 shift-repair moved them one symbol off (spot-check D1). Re-verification against the pin is pending; treat line anchors here as at their base revision until then."
- "reverted to the lines their 0614092 sentences named": none of the 27 changed anchors sits on its 0614092 line. `git diff -U0 3d5760a a5d627b -- corpus/knowledge/route-probe-cluster.md` changes 36 values: 16 return to a 0614092 line, 20 move to a third value (A1–A4 among them, path-less `66`). 7 base-diff anchors keep their round-36 values: A5 `:72`, A6 `:108`, A9 `:49`, A14 `:51`, A16 `:39`, A17 `:140`, A20 `:47`.
- "moved them one symbol off": not uniform. Of the 26 values round 36 changed, 8 are on their symbol at the pin: persistState `:1073`, PROBE_CONCURRENCY `:65`, mapPool `:775`, session_truncated `:897`, assertNoSecrets `:932`, interpretPersistedHealth `:1030`, `Authorization` `:72` (case-insensitive only), FAKE_OMP_DELAY_MS `:3`.
- "treat line anchors here as at their base revision": 0614092 lines are false at the pin for 16 of the 27 changed anchors, so the instruction sends readers to wrong lines.
- "spot-check D1" resolves to corpus/lessons/round-36-verifier-spotcheck.md:193–196, which says "keep the base line wherever its symbol is still on that line". 11 of the 27 base lines are on their symbol at the pin (A3, A4, A14–A19, A21, A24, A25). e529214 keeps none of them as a path-qualified base anchor: 9 move to other lines (A14–A19, A21, A24, A25), and A3 and A4 become path-less `66`. The notice's D1 claim is false.
- "Re-verification against the pin is pending": accurate disclosure.

## 4. Current state: blob 512ed826, HEAD b90dcf0
- `git diff --stat 0614092 -- corpus/knowledge/route-probe-cluster.md` → `1 insertion` (the notice line). The 27-anchor base diff is empty. The reset reverts the 26 round-36 value changes to base bytes.
- Pin results for the 26 (audit.py §4): restored-true 10; restored-but-false 16. Of the 16, seven were on their symbol in the round-36 state:
  - firm: B2 persistState 1073→1080; B6 PROBE_CONCURRENCY 65→61; B7 mapPool 775→784; B12 assertNoSecrets 932→939; B13 session_truncated 897→904; B15 interpretPersistedHealth 1030→1037.
  - case-insensitive only: B1 `Authorization` 72→2-3.
- Failing condition met literally: 16 restored anchors whose symbol is not on the line. Verdict: refuted.
- Notice (current, line 2): scope claims check out. The diff is only the notice line. `.ufo/pins/fidelity-ratchet.json:18` holds a per-note entry (23) for the "ratcheted fidelity debt" claim. "Re-verification owed" and "do not claim pin-true" are accurate. It omits that the reset discards six values that were on their symbol at the pin. Accurate on scope, incomplete on consequence.

## 5. Other observations
- Firm overreversions in both states: 6. Dispatch: A10 and A11 (inside the 27-set), plus restorations persistState, PROBE_CONCURRENCY, mapPool and session_truncated (outside it). Current: B2, B6, B7, B12, B13, B15. The four restorations sit outside the 0614092 diff, so no eighth reports them.
- Judgement calls: `authorization` (A5, B1) matches only case-insensitively on :72, a credential-shape regex. `MODE` (A20, B23): identifier absent on line 31, the default-to-healthy line. Excluding both does not change the slice result.
- The lane moved during the audit. The notice was rewritten at least twice (e529214 → aa45da50 "AuditSighting2/4" → b90dcf0 "AuditRouteProbe1/2/6"). Other eighths measured on e529214 and on 512ed826 are not comparable without re-dispatch.

## 6. Tooling and scope
- No installs or updates. Used git (read-only, --no-optional-locks) and python3 stdlib. Writes only this report and /fast/scratch/kumitate-r37/AuditRouteProbe7/. No subagents.
