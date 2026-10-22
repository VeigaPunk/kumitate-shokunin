RESULT ReviewRedBefore rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=confirmed fail_on_open=AT31,AT32,AT33,AT34,AT39,AT40,AT41,AT42 pass_on_open=AT43,AT44,AT45
AT42 is listed because the literal open tool rejects `--open` (exit 64). With the flag accepted it passes, as a benign control should.

Scope: red-before of the 11 new selftest cases in scripts/anchor-truth.mjs at 1530a755, run against the open production logic at f69817ed. Judged on operability. Only this report was written in the lane. No installs; node v24.21.0 used as found. Scratch: /fast/scratch/hyaku/kumitate-r40/seats/ReviewRedBefore/ (transplant/, variants/, out/).

Method: the candidate selftest (candidate lines 751-1158, from "function selfTest() {" to the end) was spliced onto open production (open lines 1-555). The selftest spawns the file it lives in, so the spliced file is what runs. Run: `node scripts/anchor-truth.mjs --selftest` in transplant/.
Identity check (function text extracted from both revisions): identities, judge, overrideValid, buildEntries, compareBase, validPin and failClosed are identical. checkNote, parseArgs and run() differ. ReviewRecords and compareOpen exist only at the candidate.

Tallies (41 cases each; raw output in out/):
- Baseline, candidate selftest on candidate: ANCHOR_TRUTH_SELFTEST: 41/41 pass, exit=0.
- Baseline, open selftest on open (30 cases): ANCHOR_TRUTH_SELFTEST: 30/30 pass, exit=0.
- STRICT, candidate selftest on open production: 33/41. FAIL AT31 AT32 AT33 AT34 AT39 AT40 AT41 AT42. PASS AT01-AT30, AT17, AT43, AT44, AT45.
- FLAG-ONLY, open production with `--open` accepted and ignored: 34/41. FAIL AT31-AT34, AT39-AT41. PASS AT42.
- BASE-SUBSTITUTED, open production with `--base <round-open rev>` in place of `--open`: 35/41. FAIL AT31-AT34, AT39, AT40. PASS AT41, AT42, AT43-AT45.
- BINDING-OFF, candidate with record binding forced true: 37/41. FAIL AT31-AT34. PASS AT39-AT45.
- FLOOR-OFF, candidate with the `--open` floor (round-open check) disabled: 38/41. FAIL AT39-AT41. PASS AT31-AT34, AT42-AT45.

Why each red fires on open:
- AT31-AT34 are logic reds. Open reads an unbound review source as TRUTH: CLEAN (AT31, AT32, AT33), or writes it into the pin as TRUTH: PINNED with kept=review:NoSuchSeat (AT34). Binding-off reproduces exactly these four.
- AT39 is a logic red. Open reads the one-for-one debt swap as TRUTH: CLEAN in flag-only, and still CLEAN when the round-open base is handed to it.
- AT40 and AT41 are base-selection reds. Flag-only reads both as CLEAN, but open refuses both once given the round-open base (DEBT_GREW). AT41 then passes. AT40 fails only because its expectation is DEBT_NEW. Floor-off reproduces AT39-AT41 exactly.
- AT42 (benign control) fails on strict only through flag rejection.
- AT43-AT45 pass on open, as the item expects: they pin existing logic.

Findings:
1. No repair case passes on open. Verdict confirmed. No blocking finding.
2. AT40 is labelled "headroom", but its round-open base holds zero debts, so its fixture has no headroom. Count-neutral headroom is AT39's shape.
3. Coverage gap, not a red-before failure: no selftest case makes the base itself an attacker re-pin. Inline probe, same fixture style: after a mid-round re-pin with three false anchors, open `--base <mid>` reads CLEAN while candidate `--open <round-open>` reads DRIFT (DEBT_GREW DEBT_NEW). For a mid-round re-break, open `--base <mid>` reads CLEAN while candidate `--open` reads DRIFT (DEBT_GREW CHECKED_SHRANK BASE_TRUE_LOST DEBT_NEW). The lane probe fixes its base at e18ff1 (floor-probe-v2 runGate, line 144), so it does not test a mid-round base either [INFERENCE from reading the probe].
4. AT10 was edited (fixture commits a registry; detail string). It passes on open and on every variant. No new id.

Residual risk and verification gaps:
- Mutants of compareBase and checkNote were not run here, so the AT43-AT45 kill claims are unchecked in this item.
- The variants are my edits of the candidate file. Their predicted outcomes matched exactly, but they are my constructions.
- The re-pin probe ran as an inline eval cell; its steps are stated above and no file was saved.
- Lane docs on master were not reviewed (outside this item).
