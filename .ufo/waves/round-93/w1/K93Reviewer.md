# K93Reviewer — trailer (round 93, C1 seat-route v2)

Candidate reviewed: `.ufo/waves/round-93/K93ExecTool/seat-route.mjs` sha256 `98a5a3a3…72b6efe9` (= READY).
Receipts in `.ufo/waves/round-93/K93Reviewer/`: `hand-reads.md`, `review.md`, `hand-expected.jsonl`, `oracle-actual.jsonl`, `sha256.txt`, `pick.txt`, `fixdiff.txt`, `synth-diff.txt`, repros `s21-captured-break.jsonl`, `s13b-err-null.jsonl`, `utf8bad.jsonl`, `utf8bad2.jsonl`.

- Hand reads, written from the plan text: 8 real transcripts (2 supersededBy, 2 upstreamProvider, 2 with revert_hops ≥ 2, 1 dead, 1 aborted). They agree with the oracle 8/8 with 0 field diffs and with the candidate 8/8.
- Fixtures: the candidate matches the oracle on 16/16. A 24-file synthetic edge suite shows 0 plan-vs-oracle diffs.
- `--selftest` → `PASS held=54/54`. Kill-(d) byte grep → 0 hits. My own strace of a scratch copy → `RUNTIME: CLEAN findings=0`. Freeze time 20:53:14Z < `--after` 21:40Z.

Findings:
- **MEDIUM F2** (contradicts the plan): when the last error turn's `errorMessage` is JSON `null`, the candidate gives `last_error=null`; the plan and the oracle give `""`. Cause: `null` doubles as the "no error turn" sentinel. If this lands at M it is a kill-(c) reproduction. Sent to K93ExecTool.
- **MEDIUM F1** (plan and oracle disagree): if the first `subagent:<seat>` row has a non-string `model`, the candidate gives `captured=null`, which follows the literal "if none" reading. The oracle falls through to the default row (`"D/m"`). L1 must decide which reading binds before H and the wave are scored.
- **LOW F3** (definition gap): a line with invalid UTF-8 is a parse error in the oracle. The candidate replaces the bad bytes with U+FFFD and reads the row, so `parse_errors` and `captured` diverge.
- **COUNTER note**: `score1.txt` and `score2.txt` read VIOLATION only because the probe opened the candidate at its own path under `round-93/`. This is a false positive with no self-exemption, and it does not apply at M.

None of F1, F2 or F3 is discriminated by set A (0/61 scanned) or by F. Not run by me: the full probe and the held-out H/r93 wave (not yet scorable).

Erratum (appended): rebuilt candidate `f86bde98…d5829f1a`: selftest 62/62; 8 real + 16 fixtures agree with the oracle 24/24; kill-(d) grep 0. F2 fixed. F1 resolved to the oracle's reading (L1 to record which reading binds). F3 open (LOW).
