RESULT ScribeLogEntry verdict=drafted rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b

# ScribeLogEntry — round-43 LOG.md entry skeleton (report only, not applied)

Scope: draft only. No lane file was written except this report; no gate, selftest or checklist was
run; no commit; no tool install; no scratch clone (nothing to patch). Insertion point: end of
`LOG.md`, after the round-42 bullet at `LOG.md:1843-1859`. `scripts/round-gate.mjs:87,425-428`
requires a line matching `^- \d{4}-\d{2}-\d{2} — round 43\b` with em dash U+2014; the draft uses it.
Every observed number below is quoted from a committed file or a command output in this report;
every unmeasured value is the token `PENDING`.

## Draft entry

The fenced block is the deliverable text; the fence is not part of the entry.

```markdown
- 2026-10-22 — round 43 (round open `2a7f37d`, source pin `31c465f1`, plan `0f4108bf`, control
  receipt commit `e5ffcbe`). Round 42 was an honest stop: the closure
  (`corpus/lessons/round-42-verifier-spotcheck.md`) re-counted the committed receipt under the plan's
  pre-data kill rule and read 34/41 frozen ids killed against a declared `CLEAN (mutants=43 killed=43
  frozen=41/41)` exit 0, so it ruled C1 does not verify; the terms counter is blind (a zero-byte
  `.mjs` in `scripts/` still reads operability 9); eight defects routed (D1–D8). One claim, sized to
  the round. **C1 operability (capability `gate-mutants`, re-claimed under frozen K43):**
  `scripts/gate-mutants.mjs` at
  `0f4108bf` (sha256 `e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a`, contract
  `kumitate-gate-mutants-v2`) states K43: a mutant is KILLED iff its run is evaluable (no timeout, no
  overflow, clean process group, no spawn error, a parseable case summary whose total equals the
  control's) AND the selftest exits with a numeric non-zero status AND stdout carries a line exactly
  `VERDICT: FAIL` AND an immediate second run meets the same conditions with the same sorted `FAIL `
  case names; an evaluable run that is not killed is SURVIVED, a disagreeing second run is UNSTABLE,
  and every control is re-run after the mutants. No amendment of K43 or the counter this round.
  Do-nothing control on the round-open bytes (`--rev 2a7f37d`), receipt
  `.ufo/waves/round-43/open/c1-control-base.txt` (committed in `e5ffcbe`, before the wave registry):
  `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 drift=0 targets=2 …)`, exit 1 (the
  receipt line carries rev, manifest and `leftovers=0`); survivors
  `cite-check:{suite-group-verdict,suite-any-fail,suite-exit-text}` and
  `wave-census:{survivor/V382-pass-count,survivor/V385-verdict-const,survivor/V387-exit-const,exits/M19-selftest-exit-const}`;
  controls PASS before and after the mutants (cite-check 75/75, wave-census 31/31); the plan's
  pre-commit dry run on the same counter bytes is disclosed at `plan.md:71-74` and recorded in
  `c1-control-base-dryrun-precommit.txt`. Target at the measured commit: PENDING —
  `CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 …)` exit 0, by an independent second
  verdict path in both suites (a witness counting failing cases from the recorded results); every
  frozen literal still applies exactly once, case floors unchanged; cite-check selftest wall time
  median of 3 runs before and after PENDING. Junk controls J1–J3 (a stub printing `VERDICT: FAIL`
  and exiting 1, zero-byte targets, the seven survivor literals edited away) PENDING: each must read
  ERROR exit 2, never CLEAN. C1 misses if the after-run prints anything other than
  `CLEAN … frozen=41/41` exit 0, a junk control reads CLEAN, a frozen literal stops applying exactly
  once (gate exit 2 `nomatch`), or a case floor (cite-check 75, wave-census 31) is lowered; a miss is
  an honest stop. Not claimed: the operability integer (stays 9; the terms counter is blind, D3) and
  the two checklist items count no move; the `gate-mutants` capability row is re-evidenced by these
  receipts or corrected. Sourced: PENDING (one `corpus/SOURCES.md` row opened this round on kill
  definitions or flaky outcomes). Routed: D1 three late round-42 falsify reports committed at
  `0f4108bf`, the round-42 report's "cancelled … unperformed" line corrected in the round-43 report
  (PENDING); D2 appended corrections to "written before any counted run" (PENDING); D3 QUALITY
  criterion and pass-count receipts at open and close (PENDING); D4 temp parent fixed
  (`$KUMITATE_GATE_MUTANTS_TMP`, else `~/.cache/kumitate-gate-mutants`), the both-target `--rev` run
  is the control receipt, red-before isolation cases PENDING; D5 same-sha cite-check errors/warnings
  receipts at `dfabe92` and `c9a084bf`, or retract (PENDING); D6 operator ruling pending (L0
  `9a00d09`), not deepened; D7 `locks/` mode check and owner pin with red-before cases,
  `locks/sessions` ungated by design, unsourced-stub hole in QUALITY (PENDING); D8 wave-census
  canonical-path refusal red-before case and S045's `Q<n>` (PENDING). Base repair (not a claim,
  `0f4108bf`): README row for the round-42 closure, stanza `C2=C2_total=95`, `pin.gate-mutants`
  re-pinned to the counter bytes. Re-verification: PENDING (sources re-opened this round; ids and
  verbatim quotes). Host safety: seat selftests and gates under `systemd-run --user --scope`
  `-p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600`, the frozen counter alone at 6G/256;
  leftovers and temp dirs checked, no spill PENDING. Lesson `corpus/lessons/round-43.md` (PENDING).
```

## Evidence used (read-only commands run this session)

- `git log -3 --format='%h author=%ad committer=%cd %s' --date=iso-strict` →
  `e5ffcbe` author=committer=`2026-10-22T19:12:49-03:00`; `0f4108b` author=`19:02:50`, committer=`19:11:35`; `2a7f37d` `19:02:50`.
- `git show --stat 0f4108bf…` → 9 files: three round-42 falsify reports, `open/c1-control-base-dryrun-precommit.txt`,
  `open/receipts.txt`, `plan.md` (102 lines), `SCORECARD.md` (6 changed), `corpus/README.md`,
  `scripts/gate-mutants.mjs` (+74/−14).
- `git show --stat e5ffcbe…` → 1 file, `.ufo/waves/round-43/open/c1-control-base.txt`, 56 insertions.
- `git show 0f4108bf…:scripts/gate-mutants.mjs | sha256sum` → `e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a  -`;
  worktree `sha256sum scripts/gate-mutants.mjs` → same. `git diff --stat 0f4108bf e5ffcbe` → only the 56-line receipt.
- Receipt lines 1-7 (quoted verbatim): header `run 2026-10-22T22:11:46Z`; `$ sha256sum $G/gate-mutants.mjs` →
  `e24749e4…  /fast/scratch/hyaku/kumitate-r43/counter.UsgOUz/gate-mutants.mjs`;
  `$ KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/gm-tmp systemd-run --user --scope --quiet
  -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 1500 node $G/gate-mutants.mjs --repo
  /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev 2a7f37d2b0a413db8499b413783c27a0effdc989; echo exit=$?`;
  `CONTROL cite-check PASS … cases=75/75 floor=75`; `CONTROL wave-census PASS … cases=31/31 floor=31`.
- Receipt lines 54-56: `exit=1`; `$ ls /fast/scratch/hyaku/kumitate-r43/gm-tmp | wc -l` → `0`.
- Receipt counts: `grep -c '^MUTANT'` = 43; `grep -c ' survived '` = 7; cite-check mutant lines = 18;
  wave-census mutant lines = 25; `grep -c 'confirm=same'` = 36 (36 + 7 = 43).
- `swarm-registry.json` `createdAt` `2026-10-22T22:16:14.300Z` → after the control commit `22:12:49Z`.
- At plan commit: `SCORECARD.md` line 292 `C2=95`, line 316 `pin.gate-mutants=e24749e4…`; `corpus/README.md:125`
  carries the round-42 closure row (`34/41 … A1 widened it after build seats scored … routed D1 to D8`).
- `scripts/gate-mutants.mjs:2-10` header states contract `kumitate-gate-mutants-v2` and K43 in the same words as
  `plan.md:15-27`; `MIN_CONTROL_CASES` (line 38) = `{ 'cite-check': 75, 'wave-census': 31 }`; `SCRATCH_TMPDIR`
  (lines 36-37) = `process.env.KUMITATE_GATE_MUTANTS_TMP || join(homedir(), '.cache', 'kumitate-gate-mutants')`.
- `scripts/round-gate.mjs:87` → `LOG_ENTRY_MISSING   no '^- \d{4}-\d{2}-\d{2} — round <N>\b' line (em dash U+2014)`.
- Build dir when first listed (19:16): `CritDisclosure.md`, `ExecR11Recount.md`, `ScribeSkillRows.md`,
  `swarm-registry.json`; by the final check (19:25) it held 24 reports. None is an after-run `CLEAN`,
  junk-control, wall-time or new-`SOURCES`-row receipt; the wave-1 reports read are listed under Findings.
- Hygiene: `pgrep -af ScribeLogEntry` → `no-procs`; `/fast/scratch/hyaku/kumitate-r43/seats/` has no
  `ScribeLogEntry` directory (this seat created no scratch clone). One transient file `/tmp/sle_entry.txt`
  was used to extract the draft block for the regex/width check and removed (`rm -f`) in the same command.

## PENDING inventory (who/what fills each; no value invented)

1. After-run `CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2)` exit 0 at the measured commit
   and its `MUTANT`-per-id enumeration.
2. Junk-control results J1-J3 (each must read `ERROR` exit 2: control failure or `nomatch`).
3. Cite-check selftest wall time, median of 3 runs, before and after.
4. `--selftest` case count of `gate-mutants` at the measured commit (not 23/23 by assumption).
5. The new `corpus/SOURCES.md` row (id, quote ≤25 words) for the knowledge text that states K43.
6. D1's correction of the round-42 report's "cancelled … unperformed" line (round-43 report).
7. D2 / D3 / D4-red-before / D5 / D7 / D8 receipts and the D3 QUALITY criterion number.
8. Re-verification source ids and verbatim quotes.
9. Round-43 lesson path content and the close proxy state (`PROXY: MATCH` or the residual drifts).

## Findings and conflicts (reported, not resolved)

1. Timeout value conflict, quoted both ways: the seat context for the frozen counter reads
   `timeout -s KILL 900`, while `plan.md:37` and the committed receipt line 4 both read
   `timeout -s KILL 1500`. `build/ReviewCounterVsPlan.md` independently records the same conflict
   ("the plan's frozen counter uses `timeout -s KILL 1500` and the receipt's command line shows 1500
   (consistent); my seat brief quoted 900"). The draft carries 1500 only in the quoted receipt and says
   "6G/256" in the LOG text; the canonical judge should pick one.
2. The dry-run receipt `.ufo/waves/round-43/open/c1-control-base-dryrun-precommit.txt` is 49 lines and carries
   no timestamp, no command, no counter sha and no `exit=` line; the post-commit receipt is 56 lines with those
   7 wrapper lines. The "same counter bytes" property therefore cannot be read from the dry-run file alone.
   `build/CritDisclosure.md` (sibling seat, not my measurement) reports `verdict=clean differences=0` and names
   this as a provenance defect; the draft cites the post-commit receipt for the sha.
3. Plan commit `0f4108bf` has author date `19:02:50 -0300` (=`22:02:50Z`) and committer date `19:11:35 -0300`
   (=`22:11:35Z`). By author date the commit would precede its own disclosed `22:08Z` dry run, whose output is
   inside that commit; by committer date the dry run precedes the commit. Order checks must use the committer
   date or the jj op log, not the author date (jj-describe artifact, also named by CritDisclosure).
4. Open receipts record three proxy errors (`C2_TOTAL_DRIFT declared=94 computed=95`, `GATE_PIN_DRIFT`,
   `AXES_DRIFT coverage row=10 derived=9`). The base repair names the first two (stanza `C2=C2_total=95`,
   re-pin), but not `AXES_DRIFT`. The close proxy state is PENDING here; if it still reads `DRIFT` at the
   measured commit, the close receipt must say so rather than "MATCH".
5. Round-42's LOG entry records the declared `CLEAN (mutants=43 killed=43 frozen=41/41)` exit 0; the
   closure re-counted the same receipt to 34/41 under the pre-data rule and ruled it not verified. This
   draft therefore marks the target PENDING and states the miss conditions and the honest-stop rule.
6. `ExecR11Recount` (`build/ExecR11Recount.md`) reports `verdict=mismatch` on the R11 cell (41 members vs a
   stale `93 − 51 = 42` parenthetical). Not my item and not in the LOG entry; flagged only because it is a live
   wave-1 conflict the L1 may need to route.
7. `ReviewCounterVsPlan` (`build/ReviewCounterVsPlan.md`) `verdict=differs differences=2`, both conservative:
   the code folds a 16-process/512 MiB resource watchdog into the `overflow` flag (plan says only "no output
   overflow"), and `parseCaseCount` sums tally lines instead of reading one summary. It re-derived all 43
   receipt states from the printed fields (36 killed, 7 survived) with zero mismatches and found no
   contradiction; no receipt line is affected. The draft's K43 sentence quotes the plan/header wording; a
   "state it identically in plan, code and selftest" criterion must name these two divergences.
8. `MutK43Counter` (`build/MutK43Counter.md`) `verdict=survived mutants=13 killed=6 survived=7`: the frozen
   counter's own K43 code survives 7 of 13 single-literal mutants (`groupClean`, `controlTotal`, `failNames`
   sort order, the post-mutant control re-run check, the unstable exit class, the timeout and overflow flags),
   with the counter restored to `e24749e4…` and its selftest `28/28 pass`. This is instrument risk for any
   after-value and belongs in the lesson/QUALITY; K43 itself is frozen, so no amendment.
9. `ExecChecklistOpen` (`build/ExecChecklistOpen.md`) now supplies the D3 open pass-count receipt:
   `verdict=fail checklist=16/19 item18_ms=63389.5 red=6,7,18`. The draft keeps D3 PENDING because the seat
   report was uncommitted at drafting; at close, fill "open 16/19 (red 6, 7, 18)" plus the close count.
10. Other wave-1 reports read, uncommitted, hence not folded into the draft: `ExecCiteBefore` `verdict=differs`
    (`dfabe92=553/481`, `c9a084bf=554/481`, `e5ffcbe=558/486`), which bears on D5 (retract or re-state the
    before-side); `ExecKimiLocksFloor` `verdict=implemented red_before=2 selftest=54/54
    patch_sha256=47ea7eccae55edd819185331d8153f729e4f78386616b31daf65e18155c1f029` (D7 drafted in a clone,
    not landed); `ScoutSrcFlaky` `verdict=found sources=4` with best candidate
    `https://par.nsf.gov/servlets/purl/10104340` (no `SOURCES.md` row yet); `ScribeCorrections` 3,
    `ScribeQualityCriteria` 4, `ScribeLessonDraft` 4 mistakes (all drafts).

## Out of scope observed

No product code, judge, gauge, contract, axis or route was edited; nothing was committed, pushed or deployed;
no runtime, browser, network source or model call was used; no package manager ran, so no tool install needs
recording. The only file this seat wrote is this report.
