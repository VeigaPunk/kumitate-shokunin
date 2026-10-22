RESULT MutCiteCounterSkip rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=fooled fooled=1/3

Q: can a mutant of scripts/cite-check.mjs that skips cases instead of failing them make the frozen counter report survived=0/16 (all 16 conditions look pinned) while a pin is destroyed? A: yes, 1 of 3. The C1 claim at fae386aa is NOT falsified (baseline below): this is a coverage limit of the counter's kill rule, not a live defect, and the counter was not edited.

DETECTOR (frozen, never edited): .ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt, sha256 7e58ee47261d6047dd28288d349ea93085e2c7ae1df6f5ead5ec4bb070762dc4, identical before and after this probe.
KILL RULE (line 54), a disjunction that never asks WHY the run failed; p/n are the numbers of the `X/Y cases passed (hermetic)` line:
  const killed = r.status !== 0 || failLines > 0 || /^VERDICT: FAIL$/m.test(s) || p < n;

BASELINE fae386aa (honest), `node --input-type=module - --lane <clone> --rev fae386aa... < probe`:
  CONTROL unmutated PASS exit=0 cases=75/75 fail_lines=0
  CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS
  Attribution (scratch harness, frozen M table verbatim): all 16 mutants killed with fail_lines>=1 (warn-total 3, strict-warn-arm 2, citeCheck-map 2, suite-group-verdict 2, suite-any-fail 2, other 11 one each) — every pin today rests on a real `FAIL ` line.

M1 skip the case pinning resolved>0 — scripts/cite-check.mjs:1851 original `group.push({ name, ok, detail });` → replacement `group.push({ name, ok, detail, skipped: name.startsWith('zero resolved citations with no drift') && !ok });` — rev 6ab4ff1438be1f31921e1ee4010bf7ba34b87efe (scratch tag m1-skip-designated).
  Expected: resolved>0 loses its killer. Output: `MUTANT resolved>0 survived exit=0 cases=74/74 fail_lines=0` and `CITE_MUTANTS survived=1/16 nomatch=0 crash=0 control=PASS`.
  Raw: FAIL lines 0, `VERDICT: PASS`, count line `74/74` (p==n, the p<n arm cannot fire); the case prints `SKIP  zero resolved citations with no drift → VERDICT FAIL ... verdict=PASS`. VERDICT: caught.

M2 skip every failed case — scripts/cite-check.mjs:1851 original `group.push({ name, ok, detail });` → replacement `group.push({ name, ok, detail, skipped: !ok });` — rev 915935e7750d4977be56affdd3cf6d50c915e47e (scratch tag m2-skip-every-failed).
  Output: all 16 `MUTANT ... survived exit=0 ... fail_lines=0` (e.g. warn-total 72/72) and `CITE_MUTANTS survived=16/16 nomatch=0 crash=0 control=PASS`. VERDICT: caught loudly.

M3 skip the pinning case AND count skipped cases in the denominator — scripts/cite-check.mjs:1851 original `group.push({ name, ok, detail });` → `group.push({ name, ok, detail, skipped: name.startsWith('zero resolved citations with no drift') && !ok });` AND scripts/cite-check.mjs:2631 original `lines.push(`${s.ran.length - s.failed}/${s.ran.length} cases passed (${s.group})`);` → `lines.push(`${s.ran.length - s.failed}/${s.cases.length} cases passed (${s.group})`);` — rev 7bb82e0998311fc44ceaca7b224a6aa0336f68ec (scratch tag m3-skip-designated-count).
  Output: `MUTANT resolved>0 killed exit=0 cases=74/75 fail_lines=0` and `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS`.
  diff of the two full counter runs (honest vs M3): only the resolved>0 line and rev= differ; the footer `survived=0/16 nomatch=0 crash=0 control=PASS` is IDENTICAL.
  Raw under the resolved>0 mutant: FAIL lines 0, SKIP lines 1, `VERDICT: PASS`, count line `74/75 cases passed (hermetic)`, and the pinning case printed as `SKIP  zero resolved citations with no drift → VERDICT FAIL ... verdict=PASS`.
  Classified killed with fail_lines=0, exit 0 and no VERDICT: FAIL — the kill comes only from p<n (74<75), an artefact of the widened denominator.
  VERDICT: FOOLED — the footer says all 16 conditions are pinned while the resolved>0 pin has become a skip. The counter's own per-mutant line does record fail_lines=0, but the frozen rule scores the disjunction and the C1 receipt cites the footer.

WHY TWO PARTS: M1 leaves the denominator at s.ran.length (skipped cases excluded), so the line reads 74/74 and p==n; M2 makes every failure a skip, so p==n for all 16 and the counter says 16/16. Only widening the denominator to s.cases.length turns p<n into a false kill.

RESTORATION: scripts/cite-check.mjs sha256 896f0720b7fe7492806b0a5b7458a995de1d666d6759297675b7d964872c6d0e in my scratch clone before the probe, in the scratch clone after `git reset --hard fae386aa...`, and in the lane — all three identical; the lane file was never written.
  Scratch clone `git status --porcelain` empty, HEAD=fae386aa9e0542710b7a893d84c8e92e86fc079b. The three mutant revisions live only in /fast/scratch/hyaku/kumitate-r41a2/seats/MutCiteCounterSkip/lane under tags m1-skip-designated, m2-skip-every-failed, m3-skip-designated-count; no lane ref, index or jj state touched, nothing pushed.

FINDING FOR THE L1 (no change made): nothing ties a kill to a `FAIL ` line. Closing the gap means requiring failLines>0 for a kill (the p<n disjunct is redundant wherever a case really fails), or comparing p/n against the same denominator the JSON branch reports.
  The round-41 lesson lists the "skip leaves the ran count" half as an open limit; this probe adds the opposite half — the same skip plus a widened denominator is reported as survived=0/16, a false green.
  Scope limit: the 16 frozen mutants are single-condition drops in the verdict/exit logic, so the counter can only be fooled by a mutant that also touches the suite's own reporting; hence C1 at fae386aa stands unchanged. No tools installed; no lane file written except this report.
